//@ts-check

process.on('uncaughtException', (/** @type {any} */ error) =>
  logger.error(`Uncaught exception "${error.constructor.name}" (${error.code}): ${error.message}`, error)
);
process.on('unhandledRejection', (/** @type {any} */ error) =>
  logger.error(`Uncaught rejection "${error.constructor.name}" (${error.code}): ${error.message}`, error)
);

const path = require('path');
const logdown = require('logdown');
require('dotenv').config({path: path.join(__dirname, 'echo.env')});

const logger = logdown('@wireapp/core/demo/echo.js', {
  logger: console,
  markdown: false,
});
logger.state.isEnabled = true;

const {Account} = require('@wireapp/core');
const {PayloadBundleType} = require('@wireapp/core/dist/conversation/');
const {APIClient} = require('@wireapp/api-client');
const {ClientType} = require('@wireapp/api-client/dist/commonjs/client/ClientType');
const {ConnectionStatus} = require('@wireapp/api-client/dist/commonjs/connection/');
const {CONVERSATION_TYPING} = require('@wireapp/api-client/dist/commonjs/event/');
const {MemoryEngine} = require('@wireapp/store-engine/dist/commonjs/engine/');

const assetOriginalCache = {};
const messageIdCache = {};

(async () => {
  const login = {
    clientType: ClientType.TEMPORARY,
    email: process.env.WIRE_EMAIL,
    password: process.env.WIRE_PASSWORD,
  };

  const backend = process.env.WIRE_BACKEND === 'staging' ? APIClient.BACKEND.STAGING : APIClient.BACKEND.PRODUCTION;
  const engine = new MemoryEngine();
  await engine.init('receiver');

  const apiClient = new APIClient({store: engine, urls: backend});
  const account = new Account(apiClient);

  const handleIncomingMessage = async messageData => {
    const CONFIRM_TYPES = [
      PayloadBundleType.ASSET,
      PayloadBundleType.ASSET_IMAGE,
      PayloadBundleType.LOCATION,
      PayloadBundleType.PING,
      PayloadBundleType.TEXT,
    ];

    const {conversation: conversationId, content, from, id: messageId, messageTimer = 0, type} = messageData;

    logger.log(
      `Receiving: "${type}" ("${messageId}") in "${conversationId}" from "${from}"`,
      content.mentions && content.mentions.length
        ? `mentioning "${content.mentions.map(mention => mention.userId).join(',')}"`
        : '',
      messageTimer ? `(ephemeral message, ${messageTimer} ms timeout)` : '',
      content
    );

    if (CONFIRM_TYPES.includes(type)) {
      const confirmationPayload = account.service.conversation.createConfirmation(messageId);
      logger.log(
        `Sending: "${confirmationPayload.type}" ("${confirmationPayload.id}") in "${conversationId}"`,
        confirmationPayload.content
      );
      await account.service.conversation.send(conversationId, confirmationPayload);

      if (messageTimer) {
        logger.log(
          `Sending: "PayloadBundleType.MESSAGE_DELETE" in "${conversationId}" for "${messageId}" (encrypted for "${from}")`
        );
        await account.service.conversation.deleteMessageEveryone(conversationId, messageId, [from]);
      }
    }
  };

  const sendMessageResponse = async (data, payload) => {
    const {content, id: messageId, messageTimer = 0, type} = payload;
    const conversationId = data.conversation;

    logger.log(
      `Sending: "${type}" ("${messageId}") in "${conversationId}"`,
      content,
      messageTimer ? `(ephemeral message, ${messageTimer} ms timeout)` : ''
    );

    account.service.conversation.messageTimer.setMessageLevelTimer(conversationId, messageTimer);
    await account.service.conversation.send(conversationId, payload);
    account.service.conversation.messageTimer.setMessageLevelTimer(conversationId, 0);
  };

  const buildLinkPreviews = async originalLinkPreviews => {
    const newLinkPreviews = [];
    for (const originalLinkPreview of originalLinkPreviews) {
      const originalLinkPreviewImage =
        originalLinkPreview.article && originalLinkPreview.article.image
          ? originalLinkPreview.article.image
          : originalLinkPreview.image;
      let linkPreviewImage;

      if (originalLinkPreviewImage) {
        const imageBuffer = await account.service.conversation.getAsset(originalLinkPreviewImage.uploaded);

        linkPreviewImage = {
          data: imageBuffer,
          height: originalLinkPreviewImage.original.image.height,
          type: originalLinkPreviewImage.original.mimeType,
          width: originalLinkPreviewImage.original.image.width,
        };
      }

      const newLinkPreview = await account.service.conversation.createLinkPreview({
        ...originalLinkPreview,
        image: linkPreviewImage,
      });

      newLinkPreviews.push(newLinkPreview);
    }
    return newLinkPreviews;
  };

  account.on(PayloadBundleType.TEXT, async data => {
    const {
      content: {linkPreviews, mentions, text},
      id: messageId,
    } = data;
    let textPayload;

    if (linkPreviews && linkPreviews.length) {
      const newLinkPreviews = await buildLinkPreviews(linkPreviews);

      await handleIncomingMessage(data);

      const cachedMessageId = messageIdCache[messageId];

      if (!cachedMessageId) {
        logger.warn(`Link preview for message ID "${messageId} was received before the original message."`);
        return;
      }

      textPayload = account.service.conversation
        .createText(text, cachedMessageId)
        .withLinkPreviews(newLinkPreviews)
        .withMentions(mentions)
        .build();
    } else {
      await handleIncomingMessage(data);
      textPayload = account.service.conversation
        .createText(text)
        .withMentions(mentions)
        .build();
    }

    messageIdCache[messageId] = textPayload.id;

    await sendMessageResponse(data, textPayload);
  });

  account.on(PayloadBundleType.CONFIRMATION, handleIncomingMessage);

  account.on(PayloadBundleType.ASSET, async data => {
    const {content, id: messageId} = data;

    const cacheOriginal = assetOriginalCache[messageId];
    if (!cacheOriginal) {
      logger.warn(`Uploaded data for message ID "${messageId} was received before the metadata."`);
      return;
    }

    const fileBuffer = await account.service.conversation.getAsset(content.uploaded);

    await handleIncomingMessage(data);

    const fileMetaDataPayload = await account.service.conversation.createFileMetadata({
      length: fileBuffer.length,
      name: cacheOriginal.name,
      type: cacheOriginal.mimeType,
    });

    await sendMessageResponse(data, fileMetaDataPayload);

    try {
      const filePayload = await account.service.conversation.createFileData({data: fileBuffer}, fileMetaDataPayload.id);
      messageIdCache[messageId] = filePayload.id;
      await sendMessageResponse(data, filePayload);
    } catch (error) {
      logger.warn(`Error while sending asset: "${error.stack}"`);
      const fileAbortPayload = await account.service.conversation.createFileAbort(0, fileMetaDataPayload.id);
      await sendMessageResponse(data, fileAbortPayload);
    }
  });

  account.on(PayloadBundleType.ASSET_META, async data => {
    const {
      content: {original},
      id: messageId,
    } = data;

    assetOriginalCache[messageId] = original;

    await handleIncomingMessage(data);
  });

  account.on(PayloadBundleType.ASSET_ABORT, async data => {
    const {id: messageId} = data;

    await handleIncomingMessage(data);

    const cacheOriginal = assetOriginalCache[messageId];
    if (!cacheOriginal) {
      logger.warn(`Asset abort message for message ID "${messageId} was received before the metadata."`);
      return;
    }

    const fileMetaDataPayload = await account.service.conversation.createFileMetadata({
      length: 0,
      name: cacheOriginal.name,
      type: cacheOriginal.mimeType,
    });

    await handleIncomingMessage(data);
    await sendMessageResponse(data, fileMetaDataPayload);

    const fileAbortPayload = await account.service.conversation.createFileAbort(0, fileMetaDataPayload.id);
    await sendMessageResponse(data, fileAbortPayload);

    delete assetOriginalCache[messageId];
    delete messageIdCache[messageId];
  });

  account.on(PayloadBundleType.ASSET_IMAGE, async data => {
    const {
      content: {uploaded, original},
      id: messageId,
    } = data;

    const imageBuffer = await account.service.conversation.getAsset(uploaded);

    const imagePayload = await account.service.conversation.createImage({
      data: imageBuffer,
      height: original.image.height,
      type: original.mimeType,
      width: original.image.width,
    });

    messageIdCache[messageId] = imagePayload.id;

    await handleIncomingMessage(data);
    await sendMessageResponse(data, imagePayload);
  });

  account.on(PayloadBundleType.CLEARED, handleIncomingMessage);

  account.on(PayloadBundleType.LOCATION, async data => {
    const locationPayload = account.service.conversation.createLocation(data.content);

    await handleIncomingMessage(data);
    await sendMessageResponse(data, locationPayload);
  });

  account.on(PayloadBundleType.PING, async data => {
    await handleIncomingMessage(data);

    const pingPayload = account.service.conversation.createPing();

    await sendMessageResponse(data, pingPayload);
  });

  account.on(PayloadBundleType.REACTION, async data => {
    const {
      content: {type, originalMessageId},
    } = data;

    await handleIncomingMessage(data);

    const reactionPayload = account.service.conversation.createReaction(originalMessageId, type);

    await sendMessageResponse(data, reactionPayload);
  });

  account.on(PayloadBundleType.TYPING, async data => {
    const {
      conversation: conversationId,
      data: {status},
    } = data;

    await handleIncomingMessage(data);

    if (status === CONVERSATION_TYPING.STARTED) {
      await account.service.conversation.sendTypingStart(conversationId);
    } else {
      await account.service.conversation.sendTypingStop(conversationId);
    }
  });

  account.on(PayloadBundleType.MESSAGE_DELETE, async data => {
    const {
      conversation: conversationId,
      content: {originalMessageId},
    } = data;

    await handleIncomingMessage(data);

    if (messageIdCache[originalMessageId]) {
      await account.service.conversation.deleteMessageEveryone(conversationId, messageIdCache[originalMessageId]);

      delete messageIdCache[originalMessageId];
    }
  });

  account.on(PayloadBundleType.MESSAGE_EDIT, async data => {
    const {
      content: {linkPreviews, mentions, originalMessageId, text},
      id: messageId,
    } = data;
    let editedPayload;

    const cachedOriginalMessageId = messageIdCache[originalMessageId];

    if (!cachedOriginalMessageId) {
      logger.warn(`Edited message for message ID "${messageId} was received before the original message."`);
      return;
    }

    if (linkPreviews) {
      const newLinkPreviews = await buildLinkPreviews(linkPreviews);

      await handleIncomingMessage(data);

      const cachedMessageId = messageIdCache[messageId];

      if (!cachedMessageId) {
        logger.warn(`Link preview for edited message ID "${messageId} was received before the original message."`);
        return;
      }
      editedPayload = account.service.conversation
        .createEditedText(text, cachedOriginalMessageId, cachedMessageId)
        .withLinkPreviews(newLinkPreviews)
        .withMentions(mentions)
        .build();
    } else {
      await handleIncomingMessage(data);
      editedPayload = account.service.conversation
        .createEditedText(text, cachedOriginalMessageId)
        .withMentions()
        .build();
    }

    messageIdCache[messageId] = editedPayload.id;

    await sendMessageResponse(data, editedPayload);
  });

  account.on(PayloadBundleType.MESSAGE_HIDE, handleIncomingMessage);

  account.on(PayloadBundleType.CONNECTION_REQUEST, async data => {
    await handleIncomingMessage(data);
    if (data.content.status === ConnectionStatus.PENDING) {
      await account.service.connection.acceptConnection(data.content.to);
    }
  });

  try {
    logger.log('Logging in ...');
    await account.login(login);
    await account.listen();

    const name = await account.service.self.getName();

    logger.log('Name', name);
    logger.log('User ID', account.apiClient.context.userId);
    logger.log('Client ID', account.apiClient.context.clientId);
    logger.log('Listening for messages ...');
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
})();
