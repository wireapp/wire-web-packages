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
const {PayloadBundleType} = require('@wireapp/core/dist/conversation/root');
const {APIClient} = require('@wireapp/api-client');
const {ClientType} = require('@wireapp/api-client/dist/commonjs/client/ClientType');
const {CONVERSATION_TYPING} = require('@wireapp/api-client/dist/commonjs/event/');
const {MemoryEngine} = require('@wireapp/store-engine/dist/commonjs/engine/');

const assetOriginalCache = {};
const messageEchoCache = {};

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
    const {conversation: conversationId, content, from, id: messageId, messageTimer = 0, type} = messageData;

    logger.log(
      `Receiving: "${type}" ("${messageId}") in "${conversationId}" from "${from}":`,
      content,
      messageTimer ? `(ephemeral message, ${messageTimer} ms timeout)` : ''
    );

    if (messageId) {
      const confirmationPayload = account.service.conversation.createConfirmation(messageId);
      logger.log(
        `Sending: "${confirmationPayload.type}" ("${
          confirmationPayload.id
        }") in "${conversationId}" for "${messageId}"`,
        confirmationPayload.content
      );
      await account.service.conversation.send(conversationId, confirmationPayload);
    }

    if (messageTimer) {
      logger.log(
        `Sending: "PayloadBundleType.MESSAGE_DELETE" in "${conversationId}" for "${messageId}" (encrypted for "${from}")`
      );
      await account.service.conversation.deleteMessageEveryone(conversationId, messageId, [from]);
    }
  };

  const sendMessageResponse = async (data, payload) => {
    const {conversation: conversationId, messageTimer = 0} = data;

    account.service.conversation.messageTimer.setMessageLevelTimer(conversationId, messageTimer);
    await account.service.conversation.send(conversationId, payload);
    account.service.conversation.messageTimer.setMessageLevelTimer(conversationId, 0);
  };

  account.on(PayloadBundleType.TEXT, async data => {
    const {content, id: messageId} = data;

    await handleIncomingMessage(data);

    const textPayload = account.service.conversation.createText(content.text);
    messageEchoCache[messageId] = textPayload.id;

    await sendMessageResponse(data, textPayload);
  });

  account.on(PayloadBundleType.CONFIRMATION, data => handleIncomingMessage(data));

  account.on(PayloadBundleType.ASSET, async data => {
    const {content, id: messageId} = data;

    const cacheOriginal = assetOriginalCache[messageId];
    if (!cacheOriginal) {
      throw new Error(`Uploaded data for message ID "${messageId} was received before the metadata."`);
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
      await sendMessageResponse(data, filePayload);

      delete assetOriginalCache[data.messageId];
    } catch (error) {
      console.error(`Error while sending asset: "${error.stack}"`);
      const fileAbortPayload = await account.service.conversation.createFileAbort(0, fileMetaDataPayload.id);
      await sendMessageResponse(data, fileAbortPayload);
    }
  });

  account.on(PayloadBundleType.ASSET_META, async data => {
    const {content, id: messageId} = data;

    await handleIncomingMessage(data);

    assetOriginalCache[messageId] = content.original;
  });

  account.on(PayloadBundleType.ASSET_ABORT, async data => {
    const {id: messageId} = data;

    await handleIncomingMessage(data);

    const cacheOriginal = assetOriginalCache[messageId];
    if (!cacheOriginal) {
      throw new Error(`Abort message for message ID "${messageId} was received before the metadata."`);
    }

    const fileMetaDataPayload = await account.service.conversation.createFileMetadata({
      length: 0,
      name: cacheOriginal.name,
      type: cacheOriginal.mimeType,
    });

    await sendMessageResponse(data, fileMetaDataPayload);

    const fileAbortPayload = await account.service.conversation.createFileAbort(0, fileMetaDataPayload.id);

    await sendMessageResponse(data, fileAbortPayload);

    delete assetOriginalCache[data.messageId];
  });

  account.on(PayloadBundleType.ASSET_IMAGE, async data => {
    const {
      content: {uploaded, original},
    } = data;

    await handleIncomingMessage(data);

    const imageBuffer = await account.service.conversation.getAsset(uploaded);
    const imagePayload = await account.service.conversation.createImage({
      data: imageBuffer,
      height: original.image.height,
      type: original.mimeType,
      width: original.image.width,
    });

    await sendMessageResponse(data, imagePayload);
  });

  account.on(PayloadBundleType.LOCATION, async data => {
    await handleIncomingMessage(data);

    const locationPayload = account.service.conversation.createLocation({
      latitude: 52.5069313,
      longitude: 13.1445635,
      name: 'Berlin',
      zoom: 10,
    });

    await sendMessageResponse(data, locationPayload);
  });

  account.on(PayloadBundleType.PING, async data => {
    await handleIncomingMessage(data);

    const pingPayload = account.service.conversation.createPing();

    await sendMessageResponse(data, pingPayload);
  });

  account.on(PayloadBundleType.REACTION, async data => {
    const {emoji, originalMessageId} = data.content;

    await handleIncomingMessage(data);

    const reactionPayload = account.service.conversation.createReaction(originalMessageId, emoji);

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
    const {conversation: conversationId, id: messageId, content} = data;

    await handleIncomingMessage(data);

    await account.service.conversation.deleteMessageEveryone(
      conversationId,
      messageEchoCache[content.originalMessageId]
    );
    delete messageEchoCache[messageId];
  });

  account.on(PayloadBundleType.MESSAGE_EDIT, async data => {
    const {text, originalMessageId} = data.content;
    await handleIncomingMessage(data);

    const editedPayload = account.service.conversation.createEditedText(text, messageEchoCache[originalMessageId]);
    await sendMessageResponse(data, editedPayload);
  });

  account.on(PayloadBundleType.MESSAGE_HIDE, data => handleIncomingMessage(data));

  account.on(PayloadBundleType.CONNECTION_REQUEST, async data => {
    await handleIncomingMessage(data);
    await account.service.connection.acceptConnection(data.connection.to);
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
