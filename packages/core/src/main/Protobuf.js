/*eslint-disable block-scoped-var, id-length, no-redeclare, no-control-regex, no-magic-numbers, no-prototype-builtins, no-shadow, no-var, sort-vars*/

const $protobuf = require('protobufjs/minimal');

// Common aliases
const $Reader = $protobuf.Reader;
const $Writer = $protobuf.Writer;
const $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots.default || ($protobuf.roots.default = {});

$root.GenericMessage = (function() {
  /**
   * Properties of a GenericMessage.
   * @exports IGenericMessage
   * @interface IGenericMessage
   * @property {string} messageId GenericMessage messageId
   * @property {IText|null} [text] GenericMessage text
   * @property {IImageAsset|null} [image] GenericMessage image
   * @property {IKnock|null} [knock] GenericMessage knock
   * @property {ILastRead|null} [lastRead] GenericMessage lastRead
   * @property {ICleared|null} [cleared] GenericMessage cleared
   * @property {IExternal|null} [external] GenericMessage external
   * @property {ClientAction|null} [clientAction] GenericMessage clientAction
   * @property {ICalling|null} [calling] GenericMessage calling
   * @property {IAsset|null} [asset] GenericMessage asset
   * @property {IMessageHide|null} [hidden] GenericMessage hidden
   * @property {ILocation|null} [location] GenericMessage location
   * @property {IMessageDelete|null} [deleted] GenericMessage deleted
   * @property {IMessageEdit|null} [edited] GenericMessage edited
   * @property {IConfirmation|null} [confirmation] GenericMessage confirmation
   * @property {IReaction|null} [reaction] GenericMessage reaction
   * @property {IEphemeral|null} [ephemeral] GenericMessage ephemeral
   * @property {IAvailability|null} [availability] GenericMessage availability
   */

  /**
   * Constructs a new GenericMessage.
   * @exports GenericMessage
   * @classdesc Represents a GenericMessage.
   * @implements IGenericMessage
   * @constructor
   * @param {IGenericMessage=} [properties] Properties to set
   */
  function GenericMessage(properties) {
    if (properties) {
      for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i) {
        if (properties[keys[i]] != null) {
          this[keys[i]] = properties[keys[i]];
        }
      }
    }
  }

  /**
   * GenericMessage messageId.
   * @member {string} messageId
   * @memberof GenericMessage
   * @instance
   */
  GenericMessage.prototype.messageId = '';

  /**
   * GenericMessage text.
   * @member {IText|null|undefined} text
   * @memberof GenericMessage
   * @instance
   */
  GenericMessage.prototype.text = null;

  /**
   * GenericMessage image.
   * @member {IImageAsset|null|undefined} image
   * @memberof GenericMessage
   * @instance
   */
  GenericMessage.prototype.image = null;

  /**
   * GenericMessage knock.
   * @member {IKnock|null|undefined} knock
   * @memberof GenericMessage
   * @instance
   */
  GenericMessage.prototype.knock = null;

  /**
   * GenericMessage lastRead.
   * @member {ILastRead|null|undefined} lastRead
   * @memberof GenericMessage
   * @instance
   */
  GenericMessage.prototype.lastRead = null;

  /**
   * GenericMessage cleared.
   * @member {ICleared|null|undefined} cleared
   * @memberof GenericMessage
   * @instance
   */
  GenericMessage.prototype.cleared = null;

  /**
   * GenericMessage external.
   * @member {IExternal|null|undefined} external
   * @memberof GenericMessage
   * @instance
   */
  GenericMessage.prototype.external = null;

  /**
   * GenericMessage clientAction.
   * @member {ClientAction} clientAction
   * @memberof GenericMessage
   * @instance
   */
  GenericMessage.prototype.clientAction = 0;

  /**
   * GenericMessage calling.
   * @member {ICalling|null|undefined} calling
   * @memberof GenericMessage
   * @instance
   */
  GenericMessage.prototype.calling = null;

  /**
   * GenericMessage asset.
   * @member {IAsset|null|undefined} asset
   * @memberof GenericMessage
   * @instance
   */
  GenericMessage.prototype.asset = null;

  /**
   * GenericMessage hidden.
   * @member {IMessageHide|null|undefined} hidden
   * @memberof GenericMessage
   * @instance
   */
  GenericMessage.prototype.hidden = null;

  /**
   * GenericMessage location.
   * @member {ILocation|null|undefined} location
   * @memberof GenericMessage
   * @instance
   */
  GenericMessage.prototype.location = null;

  /**
   * GenericMessage deleted.
   * @member {IMessageDelete|null|undefined} deleted
   * @memberof GenericMessage
   * @instance
   */
  GenericMessage.prototype.deleted = null;

  /**
   * GenericMessage edited.
   * @member {IMessageEdit|null|undefined} edited
   * @memberof GenericMessage
   * @instance
   */
  GenericMessage.prototype.edited = null;

  /**
   * GenericMessage confirmation.
   * @member {IConfirmation|null|undefined} confirmation
   * @memberof GenericMessage
   * @instance
   */
  GenericMessage.prototype.confirmation = null;

  /**
   * GenericMessage reaction.
   * @member {IReaction|null|undefined} reaction
   * @memberof GenericMessage
   * @instance
   */
  GenericMessage.prototype.reaction = null;

  /**
   * GenericMessage ephemeral.
   * @member {IEphemeral|null|undefined} ephemeral
   * @memberof GenericMessage
   * @instance
   */
  GenericMessage.prototype.ephemeral = null;

  /**
   * GenericMessage availability.
   * @member {IAvailability|null|undefined} availability
   * @memberof GenericMessage
   * @instance
   */
  GenericMessage.prototype.availability = null;

  // OneOf field names bound to virtual getters and setters
  let $oneOfFields;

  /**
   * GenericMessage content.
   * @member {"text"|"image"|"knock"|"lastRead"|"cleared"|"external"|"clientAction"|"calling"|"asset"|"hidden"|"location"|"deleted"|"edited"|"confirmation"|"reaction"|"ephemeral"|"availability"|undefined} content
   * @memberof GenericMessage
   * @instance
   */
  Object.defineProperty(GenericMessage.prototype, 'content', {
    get: $util.oneOfGetter(
      ($oneOfFields = [
        'text',
        'image',
        'knock',
        'lastRead',
        'cleared',
        'external',
        'clientAction',
        'calling',
        'asset',
        'hidden',
        'location',
        'deleted',
        'edited',
        'confirmation',
        'reaction',
        'ephemeral',
        'availability',
      ])
    ),
    set: $util.oneOfSetter($oneOfFields),
  });

  /**
   * Creates a new GenericMessage instance using the specified properties.
   * @function create
   * @memberof GenericMessage
   * @static
   * @param {IGenericMessage=} [properties] Properties to set
   * @returns {GenericMessage} GenericMessage instance
   */
  GenericMessage.create = function create(properties) {
    return new GenericMessage(properties);
  };

  /**
   * Encodes the specified GenericMessage message. Does not implicitly {@link GenericMessage.verify|verify} messages.
   * @function encode
   * @memberof GenericMessage
   * @static
   * @param {IGenericMessage} message GenericMessage message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  GenericMessage.encode = function encode(message, writer) {
    if (!writer) {
      writer = $Writer.create();
    }
    writer.uint32(/* id 1, wireType 2 =*/ 10).string(message.messageId);
    if (message.text != null && message.hasOwnProperty('text')) {
      $root.Text.encode(message.text, writer.uint32(/* id 2, wireType 2 =*/ 18).fork()).ldelim();
    }
    if (message.image != null && message.hasOwnProperty('image')) {
      $root.ImageAsset.encode(message.image, writer.uint32(/* id 3, wireType 2 =*/ 26).fork()).ldelim();
    }
    if (message.knock != null && message.hasOwnProperty('knock')) {
      $root.Knock.encode(message.knock, writer.uint32(/* id 4, wireType 2 =*/ 34).fork()).ldelim();
    }
    if (message.lastRead != null && message.hasOwnProperty('lastRead')) {
      $root.LastRead.encode(message.lastRead, writer.uint32(/* id 6, wireType 2 =*/ 50).fork()).ldelim();
    }
    if (message.cleared != null && message.hasOwnProperty('cleared')) {
      $root.Cleared.encode(message.cleared, writer.uint32(/* id 7, wireType 2 =*/ 58).fork()).ldelim();
    }
    if (message.external != null && message.hasOwnProperty('external')) {
      $root.External.encode(message.external, writer.uint32(/* id 8, wireType 2 =*/ 66).fork()).ldelim();
    }
    if (message.clientAction != null && message.hasOwnProperty('clientAction')) {
      writer.uint32(/* id 9, wireType 0 =*/ 72).int32(message.clientAction);
    }
    if (message.calling != null && message.hasOwnProperty('calling')) {
      $root.Calling.encode(message.calling, writer.uint32(/* id 10, wireType 2 =*/ 82).fork()).ldelim();
    }
    if (message.asset != null && message.hasOwnProperty('asset')) {
      $root.Asset.encode(message.asset, writer.uint32(/* id 11, wireType 2 =*/ 90).fork()).ldelim();
    }
    if (message.hidden != null && message.hasOwnProperty('hidden')) {
      $root.MessageHide.encode(message.hidden, writer.uint32(/* id 12, wireType 2 =*/ 98).fork()).ldelim();
    }
    if (message.location != null && message.hasOwnProperty('location')) {
      $root.Location.encode(message.location, writer.uint32(/* id 13, wireType 2 =*/ 106).fork()).ldelim();
    }
    if (message.deleted != null && message.hasOwnProperty('deleted')) {
      $root.MessageDelete.encode(message.deleted, writer.uint32(/* id 14, wireType 2 =*/ 114).fork()).ldelim();
    }
    if (message.edited != null && message.hasOwnProperty('edited')) {
      $root.MessageEdit.encode(message.edited, writer.uint32(/* id 15, wireType 2 =*/ 122).fork()).ldelim();
    }
    if (message.confirmation != null && message.hasOwnProperty('confirmation')) {
      $root.Confirmation.encode(message.confirmation, writer.uint32(/* id 16, wireType 2 =*/ 130).fork()).ldelim();
    }
    if (message.reaction != null && message.hasOwnProperty('reaction')) {
      $root.Reaction.encode(message.reaction, writer.uint32(/* id 17, wireType 2 =*/ 138).fork()).ldelim();
    }
    if (message.ephemeral != null && message.hasOwnProperty('ephemeral')) {
      $root.Ephemeral.encode(message.ephemeral, writer.uint32(/* id 18, wireType 2 =*/ 146).fork()).ldelim();
    }
    if (message.availability != null && message.hasOwnProperty('availability')) {
      $root.Availability.encode(message.availability, writer.uint32(/* id 19, wireType 2 =*/ 154).fork()).ldelim();
    }
    return writer;
  };

  /**
   * Encodes the specified GenericMessage message, length delimited. Does not implicitly {@link GenericMessage.verify|verify} messages.
   * @function encodeDelimited
   * @memberof GenericMessage
   * @static
   * @param {IGenericMessage} message GenericMessage message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  GenericMessage.encodeDelimited = function encodeDelimited(message, writer) {
    return this.encode(message, writer).ldelim();
  };

  /**
   * Decodes a GenericMessage message from the specified reader or buffer.
   * @function decode
   * @memberof GenericMessage
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @param {number} [length] Message length if known beforehand
   * @returns {GenericMessage} GenericMessage
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  GenericMessage.decode = function decode(reader, length) {
    if (!(reader instanceof $Reader)) {
      reader = $Reader.create(reader);
    }
    const end = length === undefined ? reader.len : reader.pos + length;

    const message = new $root.GenericMessage();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.messageId = reader.string();
          break;
        case 2:
          message.text = $root.Text.decode(reader, reader.uint32());
          break;
        case 3:
          message.image = $root.ImageAsset.decode(reader, reader.uint32());
          break;
        case 4:
          message.knock = $root.Knock.decode(reader, reader.uint32());
          break;
        case 6:
          message.lastRead = $root.LastRead.decode(reader, reader.uint32());
          break;
        case 7:
          message.cleared = $root.Cleared.decode(reader, reader.uint32());
          break;
        case 8:
          message.external = $root.External.decode(reader, reader.uint32());
          break;
        case 9:
          message.clientAction = reader.int32();
          break;
        case 10:
          message.calling = $root.Calling.decode(reader, reader.uint32());
          break;
        case 11:
          message.asset = $root.Asset.decode(reader, reader.uint32());
          break;
        case 12:
          message.hidden = $root.MessageHide.decode(reader, reader.uint32());
          break;
        case 13:
          message.location = $root.Location.decode(reader, reader.uint32());
          break;
        case 14:
          message.deleted = $root.MessageDelete.decode(reader, reader.uint32());
          break;
        case 15:
          message.edited = $root.MessageEdit.decode(reader, reader.uint32());
          break;
        case 16:
          message.confirmation = $root.Confirmation.decode(reader, reader.uint32());
          break;
        case 17:
          message.reaction = $root.Reaction.decode(reader, reader.uint32());
          break;
        case 18:
          message.ephemeral = $root.Ephemeral.decode(reader, reader.uint32());
          break;
        case 19:
          message.availability = $root.Availability.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    if (!message.hasOwnProperty('messageId')) {
      throw $util.ProtocolError("missing required 'messageId'", {instance: message});
    }
    return message;
  };

  /**
   * Decodes a GenericMessage message from the specified reader or buffer, length delimited.
   * @function decodeDelimited
   * @memberof GenericMessage
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @returns {GenericMessage} GenericMessage
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  GenericMessage.decodeDelimited = function decodeDelimited(reader) {
    if (!(reader instanceof $Reader)) {
      reader = new $Reader(reader);
    }
    return this.decode(reader, reader.uint32());
  };

  /**
   * Verifies a GenericMessage message.
   * @function verify
   * @memberof GenericMessage
   * @static
   * @param {Object.<string,*>} message Plain object to verify
   * @returns {string|null} `null` if valid, otherwise the reason why it is not
   */
  GenericMessage.verify = function verify(message) {
    if (typeof message !== 'object' || message === null) {
      return 'object expected';
    }
    const properties = {};
    if (!$util.isString(message.messageId)) {
      return 'messageId: string expected';
    }
    if (message.text != null && message.hasOwnProperty('text')) {
      properties.content = 1;
      {
        var error = $root.Text.verify(message.text);
        if (error) {
          return 'text.' + error;
        }
      }
    }
    if (message.image != null && message.hasOwnProperty('image')) {
      if (properties.content === 1) {
        return 'content: multiple values';
      }
      properties.content = 1;
      {
        var error = $root.ImageAsset.verify(message.image);
        if (error) {
          return 'image.' + error;
        }
      }
    }
    if (message.knock != null && message.hasOwnProperty('knock')) {
      if (properties.content === 1) {
        return 'content: multiple values';
      }
      properties.content = 1;
      {
        var error = $root.Knock.verify(message.knock);
        if (error) {
          return 'knock.' + error;
        }
      }
    }
    if (message.lastRead != null && message.hasOwnProperty('lastRead')) {
      if (properties.content === 1) {
        return 'content: multiple values';
      }
      properties.content = 1;
      {
        var error = $root.LastRead.verify(message.lastRead);
        if (error) {
          return 'lastRead.' + error;
        }
      }
    }
    if (message.cleared != null && message.hasOwnProperty('cleared')) {
      if (properties.content === 1) {
        return 'content: multiple values';
      }
      properties.content = 1;
      {
        var error = $root.Cleared.verify(message.cleared);
        if (error) {
          return 'cleared.' + error;
        }
      }
    }
    if (message.external != null && message.hasOwnProperty('external')) {
      if (properties.content === 1) {
        return 'content: multiple values';
      }
      properties.content = 1;
      {
        var error = $root.External.verify(message.external);
        if (error) {
          return 'external.' + error;
        }
      }
    }
    if (message.clientAction != null && message.hasOwnProperty('clientAction')) {
      if (properties.content === 1) {
        return 'content: multiple values';
      }
      properties.content = 1;
      switch (message.clientAction) {
        default:
          return 'clientAction: enum value expected';
        case 0:
          break;
      }
    }
    if (message.calling != null && message.hasOwnProperty('calling')) {
      if (properties.content === 1) {
        return 'content: multiple values';
      }
      properties.content = 1;
      {
        var error = $root.Calling.verify(message.calling);
        if (error) {
          return 'calling.' + error;
        }
      }
    }
    if (message.asset != null && message.hasOwnProperty('asset')) {
      if (properties.content === 1) {
        return 'content: multiple values';
      }
      properties.content = 1;
      {
        var error = $root.Asset.verify(message.asset);
        if (error) {
          return 'asset.' + error;
        }
      }
    }
    if (message.hidden != null && message.hasOwnProperty('hidden')) {
      if (properties.content === 1) {
        return 'content: multiple values';
      }
      properties.content = 1;
      {
        var error = $root.MessageHide.verify(message.hidden);
        if (error) {
          return 'hidden.' + error;
        }
      }
    }
    if (message.location != null && message.hasOwnProperty('location')) {
      if (properties.content === 1) {
        return 'content: multiple values';
      }
      properties.content = 1;
      {
        var error = $root.Location.verify(message.location);
        if (error) {
          return 'location.' + error;
        }
      }
    }
    if (message.deleted != null && message.hasOwnProperty('deleted')) {
      if (properties.content === 1) {
        return 'content: multiple values';
      }
      properties.content = 1;
      {
        var error = $root.MessageDelete.verify(message.deleted);
        if (error) {
          return 'deleted.' + error;
        }
      }
    }
    if (message.edited != null && message.hasOwnProperty('edited')) {
      if (properties.content === 1) {
        return 'content: multiple values';
      }
      properties.content = 1;
      {
        var error = $root.MessageEdit.verify(message.edited);
        if (error) {
          return 'edited.' + error;
        }
      }
    }
    if (message.confirmation != null && message.hasOwnProperty('confirmation')) {
      if (properties.content === 1) {
        return 'content: multiple values';
      }
      properties.content = 1;
      {
        var error = $root.Confirmation.verify(message.confirmation);
        if (error) {
          return 'confirmation.' + error;
        }
      }
    }
    if (message.reaction != null && message.hasOwnProperty('reaction')) {
      if (properties.content === 1) {
        return 'content: multiple values';
      }
      properties.content = 1;
      {
        var error = $root.Reaction.verify(message.reaction);
        if (error) {
          return 'reaction.' + error;
        }
      }
    }
    if (message.ephemeral != null && message.hasOwnProperty('ephemeral')) {
      if (properties.content === 1) {
        return 'content: multiple values';
      }
      properties.content = 1;
      {
        var error = $root.Ephemeral.verify(message.ephemeral);
        if (error) {
          return 'ephemeral.' + error;
        }
      }
    }
    if (message.availability != null && message.hasOwnProperty('availability')) {
      if (properties.content === 1) {
        return 'content: multiple values';
      }
      properties.content = 1;
      {
        var error = $root.Availability.verify(message.availability);
        if (error) {
          return 'availability.' + error;
        }
      }
    }
    return null;
  };

  /**
   * Creates a GenericMessage message from a plain object. Also converts values to their respective internal types.
   * @function fromObject
   * @memberof GenericMessage
   * @static
   * @param {Object.<string,*>} object Plain object
   * @returns {GenericMessage} GenericMessage
   */
  GenericMessage.fromObject = function fromObject(object) {
    if (object instanceof $root.GenericMessage) {
      return object;
    }
    const message = new $root.GenericMessage();
    if (object.messageId != null) {
      message.messageId = String(object.messageId);
    }
    if (object.text != null) {
      if (typeof object.text !== 'object') {
        throw TypeError('.GenericMessage.text: object expected');
      }
      message.text = $root.Text.fromObject(object.text);
    }
    if (object.image != null) {
      if (typeof object.image !== 'object') {
        throw TypeError('.GenericMessage.image: object expected');
      }
      message.image = $root.ImageAsset.fromObject(object.image);
    }
    if (object.knock != null) {
      if (typeof object.knock !== 'object') {
        throw TypeError('.GenericMessage.knock: object expected');
      }
      message.knock = $root.Knock.fromObject(object.knock);
    }
    if (object.lastRead != null) {
      if (typeof object.lastRead !== 'object') {
        throw TypeError('.GenericMessage.lastRead: object expected');
      }
      message.lastRead = $root.LastRead.fromObject(object.lastRead);
    }
    if (object.cleared != null) {
      if (typeof object.cleared !== 'object') {
        throw TypeError('.GenericMessage.cleared: object expected');
      }
      message.cleared = $root.Cleared.fromObject(object.cleared);
    }
    if (object.external != null) {
      if (typeof object.external !== 'object') {
        throw TypeError('.GenericMessage.external: object expected');
      }
      message.external = $root.External.fromObject(object.external);
    }
    switch (object.clientAction) {
      case 'RESET_SESSION':
      case 0:
        message.clientAction = 0;
        break;
    }
    if (object.calling != null) {
      if (typeof object.calling !== 'object') {
        throw TypeError('.GenericMessage.calling: object expected');
      }
      message.calling = $root.Calling.fromObject(object.calling);
    }
    if (object.asset != null) {
      if (typeof object.asset !== 'object') {
        throw TypeError('.GenericMessage.asset: object expected');
      }
      message.asset = $root.Asset.fromObject(object.asset);
    }
    if (object.hidden != null) {
      if (typeof object.hidden !== 'object') {
        throw TypeError('.GenericMessage.hidden: object expected');
      }
      message.hidden = $root.MessageHide.fromObject(object.hidden);
    }
    if (object.location != null) {
      if (typeof object.location !== 'object') {
        throw TypeError('.GenericMessage.location: object expected');
      }
      message.location = $root.Location.fromObject(object.location);
    }
    if (object.deleted != null) {
      if (typeof object.deleted !== 'object') {
        throw TypeError('.GenericMessage.deleted: object expected');
      }
      message.deleted = $root.MessageDelete.fromObject(object.deleted);
    }
    if (object.edited != null) {
      if (typeof object.edited !== 'object') {
        throw TypeError('.GenericMessage.edited: object expected');
      }
      message.edited = $root.MessageEdit.fromObject(object.edited);
    }
    if (object.confirmation != null) {
      if (typeof object.confirmation !== 'object') {
        throw TypeError('.GenericMessage.confirmation: object expected');
      }
      message.confirmation = $root.Confirmation.fromObject(object.confirmation);
    }
    if (object.reaction != null) {
      if (typeof object.reaction !== 'object') {
        throw TypeError('.GenericMessage.reaction: object expected');
      }
      message.reaction = $root.Reaction.fromObject(object.reaction);
    }
    if (object.ephemeral != null) {
      if (typeof object.ephemeral !== 'object') {
        throw TypeError('.GenericMessage.ephemeral: object expected');
      }
      message.ephemeral = $root.Ephemeral.fromObject(object.ephemeral);
    }
    if (object.availability != null) {
      if (typeof object.availability !== 'object') {
        throw TypeError('.GenericMessage.availability: object expected');
      }
      message.availability = $root.Availability.fromObject(object.availability);
    }
    return message;
  };

  /**
   * Creates a plain object from a GenericMessage message. Also converts values to other types if specified.
   * @function toObject
   * @memberof GenericMessage
   * @static
   * @param {GenericMessage} message GenericMessage
   * @param {$protobuf.IConversionOptions} [options] Conversion options
   * @returns {Object.<string,*>} Plain object
   */
  GenericMessage.toObject = function toObject(message, options) {
    if (!options) {
      options = {};
    }
    const object = {};
    if (options.defaults) {
      object.messageId = '';
    }
    if (message.messageId != null && message.hasOwnProperty('messageId')) {
      object.messageId = message.messageId;
    }
    if (message.text != null && message.hasOwnProperty('text')) {
      object.text = $root.Text.toObject(message.text, options);
      if (options.oneofs) {
        object.content = 'text';
      }
    }
    if (message.image != null && message.hasOwnProperty('image')) {
      object.image = $root.ImageAsset.toObject(message.image, options);
      if (options.oneofs) {
        object.content = 'image';
      }
    }
    if (message.knock != null && message.hasOwnProperty('knock')) {
      object.knock = $root.Knock.toObject(message.knock, options);
      if (options.oneofs) {
        object.content = 'knock';
      }
    }
    if (message.lastRead != null && message.hasOwnProperty('lastRead')) {
      object.lastRead = $root.LastRead.toObject(message.lastRead, options);
      if (options.oneofs) {
        object.content = 'lastRead';
      }
    }
    if (message.cleared != null && message.hasOwnProperty('cleared')) {
      object.cleared = $root.Cleared.toObject(message.cleared, options);
      if (options.oneofs) {
        object.content = 'cleared';
      }
    }
    if (message.external != null && message.hasOwnProperty('external')) {
      object.external = $root.External.toObject(message.external, options);
      if (options.oneofs) {
        object.content = 'external';
      }
    }
    if (message.clientAction != null && message.hasOwnProperty('clientAction')) {
      object.clientAction = options.enums === String ? $root.ClientAction[message.clientAction] : message.clientAction;
      if (options.oneofs) {
        object.content = 'clientAction';
      }
    }
    if (message.calling != null && message.hasOwnProperty('calling')) {
      object.calling = $root.Calling.toObject(message.calling, options);
      if (options.oneofs) {
        object.content = 'calling';
      }
    }
    if (message.asset != null && message.hasOwnProperty('asset')) {
      object.asset = $root.Asset.toObject(message.asset, options);
      if (options.oneofs) {
        object.content = 'asset';
      }
    }
    if (message.hidden != null && message.hasOwnProperty('hidden')) {
      object.hidden = $root.MessageHide.toObject(message.hidden, options);
      if (options.oneofs) {
        object.content = 'hidden';
      }
    }
    if (message.location != null && message.hasOwnProperty('location')) {
      object.location = $root.Location.toObject(message.location, options);
      if (options.oneofs) {
        object.content = 'location';
      }
    }
    if (message.deleted != null && message.hasOwnProperty('deleted')) {
      object.deleted = $root.MessageDelete.toObject(message.deleted, options);
      if (options.oneofs) {
        object.content = 'deleted';
      }
    }
    if (message.edited != null && message.hasOwnProperty('edited')) {
      object.edited = $root.MessageEdit.toObject(message.edited, options);
      if (options.oneofs) {
        object.content = 'edited';
      }
    }
    if (message.confirmation != null && message.hasOwnProperty('confirmation')) {
      object.confirmation = $root.Confirmation.toObject(message.confirmation, options);
      if (options.oneofs) {
        object.content = 'confirmation';
      }
    }
    if (message.reaction != null && message.hasOwnProperty('reaction')) {
      object.reaction = $root.Reaction.toObject(message.reaction, options);
      if (options.oneofs) {
        object.content = 'reaction';
      }
    }
    if (message.ephemeral != null && message.hasOwnProperty('ephemeral')) {
      object.ephemeral = $root.Ephemeral.toObject(message.ephemeral, options);
      if (options.oneofs) {
        object.content = 'ephemeral';
      }
    }
    if (message.availability != null && message.hasOwnProperty('availability')) {
      object.availability = $root.Availability.toObject(message.availability, options);
      if (options.oneofs) {
        object.content = 'availability';
      }
    }
    return object;
  };

  /**
   * Converts this GenericMessage to JSON.
   * @function toJSON
   * @memberof GenericMessage
   * @instance
   * @returns {Object.<string,*>} JSON object
   */
  GenericMessage.prototype.toJSON = function toJSON() {
    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
  };

  return GenericMessage;
})();

$root.Availability = (function() {
  /**
   * Properties of an Availability.
   * @exports IAvailability
   * @interface IAvailability
   * @property {Availability.Type} type Availability type
   */

  /**
   * Constructs a new Availability.
   * @exports Availability
   * @classdesc Represents an Availability.
   * @implements IAvailability
   * @constructor
   * @param {IAvailability=} [properties] Properties to set
   */
  function Availability(properties) {
    if (properties) {
      for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i) {
        if (properties[keys[i]] != null) {
          this[keys[i]] = properties[keys[i]];
        }
      }
    }
  }

  /**
   * Availability type.
   * @member {Availability.Type} type
   * @memberof Availability
   * @instance
   */
  Availability.prototype.type = 0;

  /**
   * Creates a new Availability instance using the specified properties.
   * @function create
   * @memberof Availability
   * @static
   * @param {IAvailability=} [properties] Properties to set
   * @returns {Availability} Availability instance
   */
  Availability.create = function create(properties) {
    return new Availability(properties);
  };

  /**
   * Encodes the specified Availability message. Does not implicitly {@link Availability.verify|verify} messages.
   * @function encode
   * @memberof Availability
   * @static
   * @param {IAvailability} message Availability message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  Availability.encode = function encode(message, writer) {
    if (!writer) {
      writer = $Writer.create();
    }
    writer.uint32(/* id 1, wireType 0 =*/ 8).int32(message.type);
    return writer;
  };

  /**
   * Encodes the specified Availability message, length delimited. Does not implicitly {@link Availability.verify|verify} messages.
   * @function encodeDelimited
   * @memberof Availability
   * @static
   * @param {IAvailability} message Availability message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  Availability.encodeDelimited = function encodeDelimited(message, writer) {
    return this.encode(message, writer).ldelim();
  };

  /**
   * Decodes an Availability message from the specified reader or buffer.
   * @function decode
   * @memberof Availability
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @param {number} [length] Message length if known beforehand
   * @returns {Availability} Availability
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  Availability.decode = function decode(reader, length) {
    if (!(reader instanceof $Reader)) {
      reader = $Reader.create(reader);
    }
    const end = length === undefined ? reader.len : reader.pos + length;

    const message = new $root.Availability();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.type = reader.int32();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    if (!message.hasOwnProperty('type')) {
      throw $util.ProtocolError("missing required 'type'", {instance: message});
    }
    return message;
  };

  /**
   * Decodes an Availability message from the specified reader or buffer, length delimited.
   * @function decodeDelimited
   * @memberof Availability
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @returns {Availability} Availability
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  Availability.decodeDelimited = function decodeDelimited(reader) {
    if (!(reader instanceof $Reader)) {
      reader = new $Reader(reader);
    }
    return this.decode(reader, reader.uint32());
  };

  /**
   * Verifies an Availability message.
   * @function verify
   * @memberof Availability
   * @static
   * @param {Object.<string,*>} message Plain object to verify
   * @returns {string|null} `null` if valid, otherwise the reason why it is not
   */
  Availability.verify = function verify(message) {
    if (typeof message !== 'object' || message === null) {
      return 'object expected';
    }
    switch (message.type) {
      default:
        return 'type: enum value expected';
      case 0:
      case 1:
      case 2:
      case 3:
        break;
    }
    return null;
  };

  /**
   * Creates an Availability message from a plain object. Also converts values to their respective internal types.
   * @function fromObject
   * @memberof Availability
   * @static
   * @param {Object.<string,*>} object Plain object
   * @returns {Availability} Availability
   */
  Availability.fromObject = function fromObject(object) {
    if (object instanceof $root.Availability) {
      return object;
    }
    const message = new $root.Availability();
    switch (object.type) {
      case 'NONE':
      case 0:
        message.type = 0;
        break;
      case 'AVAILABLE':
      case 1:
        message.type = 1;
        break;
      case 'AWAY':
      case 2:
        message.type = 2;
        break;
      case 'BUSY':
      case 3:
        message.type = 3;
        break;
    }
    return message;
  };

  /**
   * Creates a plain object from an Availability message. Also converts values to other types if specified.
   * @function toObject
   * @memberof Availability
   * @static
   * @param {Availability} message Availability
   * @param {$protobuf.IConversionOptions} [options] Conversion options
   * @returns {Object.<string,*>} Plain object
   */
  Availability.toObject = function toObject(message, options) {
    if (!options) {
      options = {};
    }
    const object = {};
    if (options.defaults) {
      object.type = options.enums === String ? 'NONE' : 0;
    }
    if (message.type != null && message.hasOwnProperty('type')) {
      object.type = options.enums === String ? $root.Availability.Type[message.type] : message.type;
    }
    return object;
  };

  /**
   * Converts this Availability to JSON.
   * @function toJSON
   * @memberof Availability
   * @instance
   * @returns {Object.<string,*>} JSON object
   */
  Availability.prototype.toJSON = function toJSON() {
    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
  };

  /**
   * Type enum.
   * @name Availability.Type
   * @enum {string}
   * @property {number} NONE=0 NONE value
   * @property {number} AVAILABLE=1 AVAILABLE value
   * @property {number} AWAY=2 AWAY value
   * @property {number} BUSY=3 BUSY value
   */
  Availability.Type = (function() {
    const valuesById = {};

    const values = Object.create(valuesById);
    values[(valuesById[0] = 'NONE')] = 0;
    values[(valuesById[1] = 'AVAILABLE')] = 1;
    values[(valuesById[2] = 'AWAY')] = 2;
    values[(valuesById[3] = 'BUSY')] = 3;
    return values;
  })();

  return Availability;
})();

$root.Ephemeral = (function() {
  /**
   * Properties of an Ephemeral.
   * @exports IEphemeral
   * @interface IEphemeral
   * @property {number|Long} expireAfterMillis Ephemeral expireAfterMillis
   * @property {IText|null} [text] Ephemeral text
   * @property {IImageAsset|null} [image] Ephemeral image
   * @property {IKnock|null} [knock] Ephemeral knock
   * @property {IAsset|null} [asset] Ephemeral asset
   * @property {ILocation|null} [location] Ephemeral location
   */

  /**
   * Constructs a new Ephemeral.
   * @exports Ephemeral
   * @classdesc Represents an Ephemeral.
   * @implements IEphemeral
   * @constructor
   * @param {IEphemeral=} [properties] Properties to set
   */
  function Ephemeral(properties) {
    if (properties) {
      for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i) {
        if (properties[keys[i]] != null) {
          this[keys[i]] = properties[keys[i]];
        }
      }
    }
  }

  /**
   * Ephemeral expireAfterMillis.
   * @member {number|Long} expireAfterMillis
   * @memberof Ephemeral
   * @instance
   */
  Ephemeral.prototype.expireAfterMillis = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;

  /**
   * Ephemeral text.
   * @member {IText|null|undefined} text
   * @memberof Ephemeral
   * @instance
   */
  Ephemeral.prototype.text = null;

  /**
   * Ephemeral image.
   * @member {IImageAsset|null|undefined} image
   * @memberof Ephemeral
   * @instance
   */
  Ephemeral.prototype.image = null;

  /**
   * Ephemeral knock.
   * @member {IKnock|null|undefined} knock
   * @memberof Ephemeral
   * @instance
   */
  Ephemeral.prototype.knock = null;

  /**
   * Ephemeral asset.
   * @member {IAsset|null|undefined} asset
   * @memberof Ephemeral
   * @instance
   */
  Ephemeral.prototype.asset = null;

  /**
   * Ephemeral location.
   * @member {ILocation|null|undefined} location
   * @memberof Ephemeral
   * @instance
   */
  Ephemeral.prototype.location = null;

  // OneOf field names bound to virtual getters and setters
  let $oneOfFields;

  /**
   * Ephemeral content.
   * @member {"text"|"image"|"knock"|"asset"|"location"|undefined} content
   * @memberof Ephemeral
   * @instance
   */
  Object.defineProperty(Ephemeral.prototype, 'content', {
    get: $util.oneOfGetter(($oneOfFields = ['text', 'image', 'knock', 'asset', 'location'])),
    set: $util.oneOfSetter($oneOfFields),
  });

  /**
   * Creates a new Ephemeral instance using the specified properties.
   * @function create
   * @memberof Ephemeral
   * @static
   * @param {IEphemeral=} [properties] Properties to set
   * @returns {Ephemeral} Ephemeral instance
   */
  Ephemeral.create = function create(properties) {
    return new Ephemeral(properties);
  };

  /**
   * Encodes the specified Ephemeral message. Does not implicitly {@link Ephemeral.verify|verify} messages.
   * @function encode
   * @memberof Ephemeral
   * @static
   * @param {IEphemeral} message Ephemeral message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  Ephemeral.encode = function encode(message, writer) {
    if (!writer) {
      writer = $Writer.create();
    }
    writer.uint32(/* id 1, wireType 0 =*/ 8).int64(message.expireAfterMillis);
    if (message.text != null && message.hasOwnProperty('text')) {
      $root.Text.encode(message.text, writer.uint32(/* id 2, wireType 2 =*/ 18).fork()).ldelim();
    }
    if (message.image != null && message.hasOwnProperty('image')) {
      $root.ImageAsset.encode(message.image, writer.uint32(/* id 3, wireType 2 =*/ 26).fork()).ldelim();
    }
    if (message.knock != null && message.hasOwnProperty('knock')) {
      $root.Knock.encode(message.knock, writer.uint32(/* id 4, wireType 2 =*/ 34).fork()).ldelim();
    }
    if (message.asset != null && message.hasOwnProperty('asset')) {
      $root.Asset.encode(message.asset, writer.uint32(/* id 5, wireType 2 =*/ 42).fork()).ldelim();
    }
    if (message.location != null && message.hasOwnProperty('location')) {
      $root.Location.encode(message.location, writer.uint32(/* id 6, wireType 2 =*/ 50).fork()).ldelim();
    }
    return writer;
  };

  /**
   * Encodes the specified Ephemeral message, length delimited. Does not implicitly {@link Ephemeral.verify|verify} messages.
   * @function encodeDelimited
   * @memberof Ephemeral
   * @static
   * @param {IEphemeral} message Ephemeral message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  Ephemeral.encodeDelimited = function encodeDelimited(message, writer) {
    return this.encode(message, writer).ldelim();
  };

  /**
   * Decodes an Ephemeral message from the specified reader or buffer.
   * @function decode
   * @memberof Ephemeral
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @param {number} [length] Message length if known beforehand
   * @returns {Ephemeral} Ephemeral
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  Ephemeral.decode = function decode(reader, length) {
    if (!(reader instanceof $Reader)) {
      reader = $Reader.create(reader);
    }
    const end = length === undefined ? reader.len : reader.pos + length;

    const message = new $root.Ephemeral();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.expireAfterMillis = reader.int64();
          break;
        case 2:
          message.text = $root.Text.decode(reader, reader.uint32());
          break;
        case 3:
          message.image = $root.ImageAsset.decode(reader, reader.uint32());
          break;
        case 4:
          message.knock = $root.Knock.decode(reader, reader.uint32());
          break;
        case 5:
          message.asset = $root.Asset.decode(reader, reader.uint32());
          break;
        case 6:
          message.location = $root.Location.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    if (!message.hasOwnProperty('expireAfterMillis')) {
      throw $util.ProtocolError("missing required 'expireAfterMillis'", {instance: message});
    }
    return message;
  };

  /**
   * Decodes an Ephemeral message from the specified reader or buffer, length delimited.
   * @function decodeDelimited
   * @memberof Ephemeral
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @returns {Ephemeral} Ephemeral
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  Ephemeral.decodeDelimited = function decodeDelimited(reader) {
    if (!(reader instanceof $Reader)) {
      reader = new $Reader(reader);
    }
    return this.decode(reader, reader.uint32());
  };

  /**
   * Verifies an Ephemeral message.
   * @function verify
   * @memberof Ephemeral
   * @static
   * @param {Object.<string,*>} message Plain object to verify
   * @returns {string|null} `null` if valid, otherwise the reason why it is not
   */
  Ephemeral.verify = function verify(message) {
    if (typeof message !== 'object' || message === null) {
      return 'object expected';
    }
    const properties = {};
    if (
      !$util.isInteger(message.expireAfterMillis) &&
      !(
        message.expireAfterMillis &&
        $util.isInteger(message.expireAfterMillis.low) &&
        $util.isInteger(message.expireAfterMillis.high)
      )
    ) {
      return 'expireAfterMillis: integer|Long expected';
    }
    if (message.text != null && message.hasOwnProperty('text')) {
      properties.content = 1;
      {
        var error = $root.Text.verify(message.text);
        if (error) {
          return 'text.' + error;
        }
      }
    }
    if (message.image != null && message.hasOwnProperty('image')) {
      if (properties.content === 1) {
        return 'content: multiple values';
      }
      properties.content = 1;
      {
        var error = $root.ImageAsset.verify(message.image);
        if (error) {
          return 'image.' + error;
        }
      }
    }
    if (message.knock != null && message.hasOwnProperty('knock')) {
      if (properties.content === 1) {
        return 'content: multiple values';
      }
      properties.content = 1;
      {
        var error = $root.Knock.verify(message.knock);
        if (error) {
          return 'knock.' + error;
        }
      }
    }
    if (message.asset != null && message.hasOwnProperty('asset')) {
      if (properties.content === 1) {
        return 'content: multiple values';
      }
      properties.content = 1;
      {
        var error = $root.Asset.verify(message.asset);
        if (error) {
          return 'asset.' + error;
        }
      }
    }
    if (message.location != null && message.hasOwnProperty('location')) {
      if (properties.content === 1) {
        return 'content: multiple values';
      }
      properties.content = 1;
      {
        var error = $root.Location.verify(message.location);
        if (error) {
          return 'location.' + error;
        }
      }
    }
    return null;
  };

  /**
   * Creates an Ephemeral message from a plain object. Also converts values to their respective internal types.
   * @function fromObject
   * @memberof Ephemeral
   * @static
   * @param {Object.<string,*>} object Plain object
   * @returns {Ephemeral} Ephemeral
   */
  Ephemeral.fromObject = function fromObject(object) {
    if (object instanceof $root.Ephemeral) {
      return object;
    }
    const message = new $root.Ephemeral();
    if (object.expireAfterMillis != null) {
      if ($util.Long) {
        (message.expireAfterMillis = $util.Long.fromValue(object.expireAfterMillis)).unsigned = false;
      } else if (typeof object.expireAfterMillis === 'string') {
        message.expireAfterMillis = parseInt(object.expireAfterMillis, 10);
      } else if (typeof object.expireAfterMillis === 'number') {
        message.expireAfterMillis = object.expireAfterMillis;
      } else if (typeof object.expireAfterMillis === 'object') {
        message.expireAfterMillis = new $util.LongBits(
          object.expireAfterMillis.low >>> 0,
          object.expireAfterMillis.high >>> 0
        ).toNumber();
      }
    }
    if (object.text != null) {
      if (typeof object.text !== 'object') {
        throw TypeError('.Ephemeral.text: object expected');
      }
      message.text = $root.Text.fromObject(object.text);
    }
    if (object.image != null) {
      if (typeof object.image !== 'object') {
        throw TypeError('.Ephemeral.image: object expected');
      }
      message.image = $root.ImageAsset.fromObject(object.image);
    }
    if (object.knock != null) {
      if (typeof object.knock !== 'object') {
        throw TypeError('.Ephemeral.knock: object expected');
      }
      message.knock = $root.Knock.fromObject(object.knock);
    }
    if (object.asset != null) {
      if (typeof object.asset !== 'object') {
        throw TypeError('.Ephemeral.asset: object expected');
      }
      message.asset = $root.Asset.fromObject(object.asset);
    }
    if (object.location != null) {
      if (typeof object.location !== 'object') {
        throw TypeError('.Ephemeral.location: object expected');
      }
      message.location = $root.Location.fromObject(object.location);
    }
    return message;
  };

  /**
   * Creates a plain object from an Ephemeral message. Also converts values to other types if specified.
   * @function toObject
   * @memberof Ephemeral
   * @static
   * @param {Ephemeral} message Ephemeral
   * @param {$protobuf.IConversionOptions} [options] Conversion options
   * @returns {Object.<string,*>} Plain object
   */
  Ephemeral.toObject = function toObject(message, options) {
    if (!options) {
      options = {};
    }
    const object = {};
    if (options.defaults) {
      if ($util.Long) {
        const long = new $util.Long(0, 0, false);
        object.expireAfterMillis =
          options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
      } else {
        object.expireAfterMillis = options.longs === String ? '0' : 0;
      }
    }
    if (message.expireAfterMillis != null && message.hasOwnProperty('expireAfterMillis')) {
      if (typeof message.expireAfterMillis === 'number') {
        object.expireAfterMillis =
          options.longs === String ? String(message.expireAfterMillis) : message.expireAfterMillis;
      } else {
        object.expireAfterMillis =
          options.longs === String
            ? $util.Long.prototype.toString.call(message.expireAfterMillis)
            : options.longs === Number
              ? new $util.LongBits(message.expireAfterMillis.low >>> 0, message.expireAfterMillis.high >>> 0).toNumber()
              : message.expireAfterMillis;
      }
    }
    if (message.text != null && message.hasOwnProperty('text')) {
      object.text = $root.Text.toObject(message.text, options);
      if (options.oneofs) {
        object.content = 'text';
      }
    }
    if (message.image != null && message.hasOwnProperty('image')) {
      object.image = $root.ImageAsset.toObject(message.image, options);
      if (options.oneofs) {
        object.content = 'image';
      }
    }
    if (message.knock != null && message.hasOwnProperty('knock')) {
      object.knock = $root.Knock.toObject(message.knock, options);
      if (options.oneofs) {
        object.content = 'knock';
      }
    }
    if (message.asset != null && message.hasOwnProperty('asset')) {
      object.asset = $root.Asset.toObject(message.asset, options);
      if (options.oneofs) {
        object.content = 'asset';
      }
    }
    if (message.location != null && message.hasOwnProperty('location')) {
      object.location = $root.Location.toObject(message.location, options);
      if (options.oneofs) {
        object.content = 'location';
      }
    }
    return object;
  };

  /**
   * Converts this Ephemeral to JSON.
   * @function toJSON
   * @memberof Ephemeral
   * @instance
   * @returns {Object.<string,*>} JSON object
   */
  Ephemeral.prototype.toJSON = function toJSON() {
    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
  };

  return Ephemeral;
})();

$root.Text = (function() {
  /**
   * Properties of a Text.
   * @exports IText
   * @interface IText
   * @property {string} content Text content
   * @property {Array.<IMention>|null} [mention] Text mention
   * @property {Array.<ILinkPreview>|null} [linkPreview] Text linkPreview
   */

  /**
   * Constructs a new Text.
   * @exports Text
   * @classdesc Represents a Text.
   * @implements IText
   * @constructor
   * @param {IText=} [properties] Properties to set
   */
  function Text(properties) {
    this.mention = [];
    this.linkPreview = [];
    if (properties) {
      for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i) {
        if (properties[keys[i]] != null) {
          this[keys[i]] = properties[keys[i]];
        }
      }
    }
  }

  /**
   * Text content.
   * @member {string} content
   * @memberof Text
   * @instance
   */
  Text.prototype.content = '';

  /**
   * Text mention.
   * @member {Array.<IMention>} mention
   * @memberof Text
   * @instance
   */
  Text.prototype.mention = $util.emptyArray;

  /**
   * Text linkPreview.
   * @member {Array.<ILinkPreview>} linkPreview
   * @memberof Text
   * @instance
   */
  Text.prototype.linkPreview = $util.emptyArray;

  /**
   * Creates a new Text instance using the specified properties.
   * @function create
   * @memberof Text
   * @static
   * @param {IText=} [properties] Properties to set
   * @returns {Text} Text instance
   */
  Text.create = function create(properties) {
    return new Text(properties);
  };

  /**
   * Encodes the specified Text message. Does not implicitly {@link Text.verify|verify} messages.
   * @function encode
   * @memberof Text
   * @static
   * @param {IText} message Text message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  Text.encode = function encode(message, writer) {
    if (!writer) {
      writer = $Writer.create();
    }
    writer.uint32(/* id 1, wireType 2 =*/ 10).string(message.content);
    if (message.mention != null && message.mention.length) {
      for (var i = 0; i < message.mention.length; ++i) {
        $root.Mention.encode(message.mention[i], writer.uint32(/* id 2, wireType 2 =*/ 18).fork()).ldelim();
      }
    }
    if (message.linkPreview != null && message.linkPreview.length) {
      for (var i = 0; i < message.linkPreview.length; ++i) {
        $root.LinkPreview.encode(message.linkPreview[i], writer.uint32(/* id 3, wireType 2 =*/ 26).fork()).ldelim();
      }
    }
    return writer;
  };

  /**
   * Encodes the specified Text message, length delimited. Does not implicitly {@link Text.verify|verify} messages.
   * @function encodeDelimited
   * @memberof Text
   * @static
   * @param {IText} message Text message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  Text.encodeDelimited = function encodeDelimited(message, writer) {
    return this.encode(message, writer).ldelim();
  };

  /**
   * Decodes a Text message from the specified reader or buffer.
   * @function decode
   * @memberof Text
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @param {number} [length] Message length if known beforehand
   * @returns {Text} Text
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  Text.decode = function decode(reader, length) {
    if (!(reader instanceof $Reader)) {
      reader = $Reader.create(reader);
    }
    const end = length === undefined ? reader.len : reader.pos + length;

    const message = new $root.Text();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.content = reader.string();
          break;
        case 2:
          if (!(message.mention && message.mention.length)) {
            message.mention = [];
          }
          message.mention.push($root.Mention.decode(reader, reader.uint32()));
          break;
        case 3:
          if (!(message.linkPreview && message.linkPreview.length)) {
            message.linkPreview = [];
          }
          message.linkPreview.push($root.LinkPreview.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    if (!message.hasOwnProperty('content')) {
      throw $util.ProtocolError("missing required 'content'", {instance: message});
    }
    return message;
  };

  /**
   * Decodes a Text message from the specified reader or buffer, length delimited.
   * @function decodeDelimited
   * @memberof Text
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @returns {Text} Text
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  Text.decodeDelimited = function decodeDelimited(reader) {
    if (!(reader instanceof $Reader)) {
      reader = new $Reader(reader);
    }
    return this.decode(reader, reader.uint32());
  };

  /**
   * Verifies a Text message.
   * @function verify
   * @memberof Text
   * @static
   * @param {Object.<string,*>} message Plain object to verify
   * @returns {string|null} `null` if valid, otherwise the reason why it is not
   */
  Text.verify = function verify(message) {
    if (typeof message !== 'object' || message === null) {
      return 'object expected';
    }
    if (!$util.isString(message.content)) {
      return 'content: string expected';
    }
    if (message.mention != null && message.hasOwnProperty('mention')) {
      if (!Array.isArray(message.mention)) {
        return 'mention: array expected';
      }
      for (var i = 0; i < message.mention.length; ++i) {
        var error = $root.Mention.verify(message.mention[i]);
        if (error) {
          return 'mention.' + error;
        }
      }
    }
    if (message.linkPreview != null && message.hasOwnProperty('linkPreview')) {
      if (!Array.isArray(message.linkPreview)) {
        return 'linkPreview: array expected';
      }
      for (var i = 0; i < message.linkPreview.length; ++i) {
        var error = $root.LinkPreview.verify(message.linkPreview[i]);
        if (error) {
          return 'linkPreview.' + error;
        }
      }
    }
    return null;
  };

  /**
   * Creates a Text message from a plain object. Also converts values to their respective internal types.
   * @function fromObject
   * @memberof Text
   * @static
   * @param {Object.<string,*>} object Plain object
   * @returns {Text} Text
   */
  Text.fromObject = function fromObject(object) {
    if (object instanceof $root.Text) {
      return object;
    }
    const message = new $root.Text();
    if (object.content != null) {
      message.content = String(object.content);
    }
    if (object.mention) {
      if (!Array.isArray(object.mention)) {
        throw TypeError('.Text.mention: array expected');
      }
      message.mention = [];
      for (var i = 0; i < object.mention.length; ++i) {
        if (typeof object.mention[i] !== 'object') {
          throw TypeError('.Text.mention: object expected');
        }
        message.mention[i] = $root.Mention.fromObject(object.mention[i]);
      }
    }
    if (object.linkPreview) {
      if (!Array.isArray(object.linkPreview)) {
        throw TypeError('.Text.linkPreview: array expected');
      }
      message.linkPreview = [];
      for (var i = 0; i < object.linkPreview.length; ++i) {
        if (typeof object.linkPreview[i] !== 'object') {
          throw TypeError('.Text.linkPreview: object expected');
        }
        message.linkPreview[i] = $root.LinkPreview.fromObject(object.linkPreview[i]);
      }
    }
    return message;
  };

  /**
   * Creates a plain object from a Text message. Also converts values to other types if specified.
   * @function toObject
   * @memberof Text
   * @static
   * @param {Text} message Text
   * @param {$protobuf.IConversionOptions} [options] Conversion options
   * @returns {Object.<string,*>} Plain object
   */
  Text.toObject = function toObject(message, options) {
    if (!options) {
      options = {};
    }
    const object = {};
    if (options.arrays || options.defaults) {
      object.mention = [];
      object.linkPreview = [];
    }
    if (options.defaults) {
      object.content = '';
    }
    if (message.content != null && message.hasOwnProperty('content')) {
      object.content = message.content;
    }
    if (message.mention && message.mention.length) {
      object.mention = [];
      for (var j = 0; j < message.mention.length; ++j) {
        object.mention[j] = $root.Mention.toObject(message.mention[j], options);
      }
    }
    if (message.linkPreview && message.linkPreview.length) {
      object.linkPreview = [];
      for (var j = 0; j < message.linkPreview.length; ++j) {
        object.linkPreview[j] = $root.LinkPreview.toObject(message.linkPreview[j], options);
      }
    }
    return object;
  };

  /**
   * Converts this Text to JSON.
   * @function toJSON
   * @memberof Text
   * @instance
   * @returns {Object.<string,*>} JSON object
   */
  Text.prototype.toJSON = function toJSON() {
    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
  };

  return Text;
})();

$root.Knock = (function() {
  /**
   * Properties of a Knock.
   * @exports IKnock
   * @interface IKnock
   * @property {boolean} hotKnock Knock hotKnock
   */

  /**
   * Constructs a new Knock.
   * @exports Knock
   * @classdesc Represents a Knock.
   * @implements IKnock
   * @constructor
   * @param {IKnock=} [properties] Properties to set
   */
  function Knock(properties) {
    if (properties) {
      for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i) {
        if (properties[keys[i]] != null) {
          this[keys[i]] = properties[keys[i]];
        }
      }
    }
  }

  /**
   * Knock hotKnock.
   * @member {boolean} hotKnock
   * @memberof Knock
   * @instance
   */
  Knock.prototype.hotKnock = false;

  /**
   * Creates a new Knock instance using the specified properties.
   * @function create
   * @memberof Knock
   * @static
   * @param {IKnock=} [properties] Properties to set
   * @returns {Knock} Knock instance
   */
  Knock.create = function create(properties) {
    return new Knock(properties);
  };

  /**
   * Encodes the specified Knock message. Does not implicitly {@link Knock.verify|verify} messages.
   * @function encode
   * @memberof Knock
   * @static
   * @param {IKnock} message Knock message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  Knock.encode = function encode(message, writer) {
    if (!writer) {
      writer = $Writer.create();
    }
    writer.uint32(/* id 1, wireType 0 =*/ 8).bool(message.hotKnock);
    return writer;
  };

  /**
   * Encodes the specified Knock message, length delimited. Does not implicitly {@link Knock.verify|verify} messages.
   * @function encodeDelimited
   * @memberof Knock
   * @static
   * @param {IKnock} message Knock message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  Knock.encodeDelimited = function encodeDelimited(message, writer) {
    return this.encode(message, writer).ldelim();
  };

  /**
   * Decodes a Knock message from the specified reader or buffer.
   * @function decode
   * @memberof Knock
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @param {number} [length] Message length if known beforehand
   * @returns {Knock} Knock
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  Knock.decode = function decode(reader, length) {
    if (!(reader instanceof $Reader)) {
      reader = $Reader.create(reader);
    }
    const end = length === undefined ? reader.len : reader.pos + length;

    const message = new $root.Knock();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.hotKnock = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    if (!message.hasOwnProperty('hotKnock')) {
      throw $util.ProtocolError("missing required 'hotKnock'", {instance: message});
    }
    return message;
  };

  /**
   * Decodes a Knock message from the specified reader or buffer, length delimited.
   * @function decodeDelimited
   * @memberof Knock
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @returns {Knock} Knock
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  Knock.decodeDelimited = function decodeDelimited(reader) {
    if (!(reader instanceof $Reader)) {
      reader = new $Reader(reader);
    }
    return this.decode(reader, reader.uint32());
  };

  /**
   * Verifies a Knock message.
   * @function verify
   * @memberof Knock
   * @static
   * @param {Object.<string,*>} message Plain object to verify
   * @returns {string|null} `null` if valid, otherwise the reason why it is not
   */
  Knock.verify = function verify(message) {
    if (typeof message !== 'object' || message === null) {
      return 'object expected';
    }
    if (typeof message.hotKnock !== 'boolean') {
      return 'hotKnock: boolean expected';
    }
    return null;
  };

  /**
   * Creates a Knock message from a plain object. Also converts values to their respective internal types.
   * @function fromObject
   * @memberof Knock
   * @static
   * @param {Object.<string,*>} object Plain object
   * @returns {Knock} Knock
   */
  Knock.fromObject = function fromObject(object) {
    if (object instanceof $root.Knock) {
      return object;
    }
    const message = new $root.Knock();
    if (object.hotKnock != null) {
      message.hotKnock = Boolean(object.hotKnock);
    }
    return message;
  };

  /**
   * Creates a plain object from a Knock message. Also converts values to other types if specified.
   * @function toObject
   * @memberof Knock
   * @static
   * @param {Knock} message Knock
   * @param {$protobuf.IConversionOptions} [options] Conversion options
   * @returns {Object.<string,*>} Plain object
   */
  Knock.toObject = function toObject(message, options) {
    if (!options) {
      options = {};
    }
    const object = {};
    if (options.defaults) {
      object.hotKnock = false;
    }
    if (message.hotKnock != null && message.hasOwnProperty('hotKnock')) {
      object.hotKnock = message.hotKnock;
    }
    return object;
  };

  /**
   * Converts this Knock to JSON.
   * @function toJSON
   * @memberof Knock
   * @instance
   * @returns {Object.<string,*>} JSON object
   */
  Knock.prototype.toJSON = function toJSON() {
    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
  };

  return Knock;
})();

$root.LinkPreview = (function() {
  /**
   * Properties of a LinkPreview.
   * @exports ILinkPreview
   * @interface ILinkPreview
   * @property {string} url LinkPreview url
   * @property {number} urlOffset LinkPreview urlOffset
   * @property {IArticle|null} [article] LinkPreview article
   * @property {string|null} [permanentUrl] LinkPreview permanentUrl
   * @property {string|null} [title] LinkPreview title
   * @property {string|null} [summary] LinkPreview summary
   * @property {IAsset|null} [image] LinkPreview image
   * @property {ITweet|null} [tweet] LinkPreview tweet
   */

  /**
   * Constructs a new LinkPreview.
   * @exports LinkPreview
   * @classdesc Represents a LinkPreview.
   * @implements ILinkPreview
   * @constructor
   * @param {ILinkPreview=} [properties] Properties to set
   */
  function LinkPreview(properties) {
    if (properties) {
      for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i) {
        if (properties[keys[i]] != null) {
          this[keys[i]] = properties[keys[i]];
        }
      }
    }
  }

  /**
   * LinkPreview url.
   * @member {string} url
   * @memberof LinkPreview
   * @instance
   */
  LinkPreview.prototype.url = '';

  /**
   * LinkPreview urlOffset.
   * @member {number} urlOffset
   * @memberof LinkPreview
   * @instance
   */
  LinkPreview.prototype.urlOffset = 0;

  /**
   * LinkPreview article.
   * @member {IArticle|null|undefined} article
   * @memberof LinkPreview
   * @instance
   */
  LinkPreview.prototype.article = null;

  /**
   * LinkPreview permanentUrl.
   * @member {string} permanentUrl
   * @memberof LinkPreview
   * @instance
   */
  LinkPreview.prototype.permanentUrl = '';

  /**
   * LinkPreview title.
   * @member {string} title
   * @memberof LinkPreview
   * @instance
   */
  LinkPreview.prototype.title = '';

  /**
   * LinkPreview summary.
   * @member {string} summary
   * @memberof LinkPreview
   * @instance
   */
  LinkPreview.prototype.summary = '';

  /**
   * LinkPreview image.
   * @member {IAsset|null|undefined} image
   * @memberof LinkPreview
   * @instance
   */
  LinkPreview.prototype.image = null;

  /**
   * LinkPreview tweet.
   * @member {ITweet|null|undefined} tweet
   * @memberof LinkPreview
   * @instance
   */
  LinkPreview.prototype.tweet = null;

  // OneOf field names bound to virtual getters and setters
  let $oneOfFields;

  /**
   * LinkPreview preview.
   * @member {"article"|undefined} preview
   * @memberof LinkPreview
   * @instance
   */
  Object.defineProperty(LinkPreview.prototype, 'preview', {
    get: $util.oneOfGetter(($oneOfFields = ['article'])),
    set: $util.oneOfSetter($oneOfFields),
  });

  /**
   * LinkPreview metaData.
   * @member {"tweet"|undefined} metaData
   * @memberof LinkPreview
   * @instance
   */
  Object.defineProperty(LinkPreview.prototype, 'metaData', {
    get: $util.oneOfGetter(($oneOfFields = ['tweet'])),
    set: $util.oneOfSetter($oneOfFields),
  });

  /**
   * Creates a new LinkPreview instance using the specified properties.
   * @function create
   * @memberof LinkPreview
   * @static
   * @param {ILinkPreview=} [properties] Properties to set
   * @returns {LinkPreview} LinkPreview instance
   */
  LinkPreview.create = function create(properties) {
    return new LinkPreview(properties);
  };

  /**
   * Encodes the specified LinkPreview message. Does not implicitly {@link LinkPreview.verify|verify} messages.
   * @function encode
   * @memberof LinkPreview
   * @static
   * @param {ILinkPreview} message LinkPreview message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  LinkPreview.encode = function encode(message, writer) {
    if (!writer) {
      writer = $Writer.create();
    }
    writer.uint32(/* id 1, wireType 2 =*/ 10).string(message.url);
    writer.uint32(/* id 2, wireType 0 =*/ 16).int32(message.urlOffset);
    if (message.article != null && message.hasOwnProperty('article')) {
      $root.Article.encode(message.article, writer.uint32(/* id 3, wireType 2 =*/ 26).fork()).ldelim();
    }
    if (message.permanentUrl != null && message.hasOwnProperty('permanentUrl')) {
      writer.uint32(/* id 5, wireType 2 =*/ 42).string(message.permanentUrl);
    }
    if (message.title != null && message.hasOwnProperty('title')) {
      writer.uint32(/* id 6, wireType 2 =*/ 50).string(message.title);
    }
    if (message.summary != null && message.hasOwnProperty('summary')) {
      writer.uint32(/* id 7, wireType 2 =*/ 58).string(message.summary);
    }
    if (message.image != null && message.hasOwnProperty('image')) {
      $root.Asset.encode(message.image, writer.uint32(/* id 8, wireType 2 =*/ 66).fork()).ldelim();
    }
    if (message.tweet != null && message.hasOwnProperty('tweet')) {
      $root.Tweet.encode(message.tweet, writer.uint32(/* id 9, wireType 2 =*/ 74).fork()).ldelim();
    }
    return writer;
  };

  /**
   * Encodes the specified LinkPreview message, length delimited. Does not implicitly {@link LinkPreview.verify|verify} messages.
   * @function encodeDelimited
   * @memberof LinkPreview
   * @static
   * @param {ILinkPreview} message LinkPreview message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  LinkPreview.encodeDelimited = function encodeDelimited(message, writer) {
    return this.encode(message, writer).ldelim();
  };

  /**
   * Decodes a LinkPreview message from the specified reader or buffer.
   * @function decode
   * @memberof LinkPreview
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @param {number} [length] Message length if known beforehand
   * @returns {LinkPreview} LinkPreview
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  LinkPreview.decode = function decode(reader, length) {
    if (!(reader instanceof $Reader)) {
      reader = $Reader.create(reader);
    }
    const end = length === undefined ? reader.len : reader.pos + length;

    const message = new $root.LinkPreview();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.url = reader.string();
          break;
        case 2:
          message.urlOffset = reader.int32();
          break;
        case 3:
          message.article = $root.Article.decode(reader, reader.uint32());
          break;
        case 5:
          message.permanentUrl = reader.string();
          break;
        case 6:
          message.title = reader.string();
          break;
        case 7:
          message.summary = reader.string();
          break;
        case 8:
          message.image = $root.Asset.decode(reader, reader.uint32());
          break;
        case 9:
          message.tweet = $root.Tweet.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    if (!message.hasOwnProperty('url')) {
      throw $util.ProtocolError("missing required 'url'", {instance: message});
    }
    if (!message.hasOwnProperty('urlOffset')) {
      throw $util.ProtocolError("missing required 'urlOffset'", {instance: message});
    }
    return message;
  };

  /**
   * Decodes a LinkPreview message from the specified reader or buffer, length delimited.
   * @function decodeDelimited
   * @memberof LinkPreview
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @returns {LinkPreview} LinkPreview
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  LinkPreview.decodeDelimited = function decodeDelimited(reader) {
    if (!(reader instanceof $Reader)) {
      reader = new $Reader(reader);
    }
    return this.decode(reader, reader.uint32());
  };

  /**
   * Verifies a LinkPreview message.
   * @function verify
   * @memberof LinkPreview
   * @static
   * @param {Object.<string,*>} message Plain object to verify
   * @returns {string|null} `null` if valid, otherwise the reason why it is not
   */
  LinkPreview.verify = function verify(message) {
    if (typeof message !== 'object' || message === null) {
      return 'object expected';
    }
    const properties = {};
    if (!$util.isString(message.url)) {
      return 'url: string expected';
    }
    if (!$util.isInteger(message.urlOffset)) {
      return 'urlOffset: integer expected';
    }
    if (message.article != null && message.hasOwnProperty('article')) {
      properties.preview = 1;
      {
        var error = $root.Article.verify(message.article);
        if (error) {
          return 'article.' + error;
        }
      }
    }
    if (message.permanentUrl != null && message.hasOwnProperty('permanentUrl')) {
      if (!$util.isString(message.permanentUrl)) {
        return 'permanentUrl: string expected';
      }
    }
    if (message.title != null && message.hasOwnProperty('title')) {
      if (!$util.isString(message.title)) {
        return 'title: string expected';
      }
    }
    if (message.summary != null && message.hasOwnProperty('summary')) {
      if (!$util.isString(message.summary)) {
        return 'summary: string expected';
      }
    }
    if (message.image != null && message.hasOwnProperty('image')) {
      var error = $root.Asset.verify(message.image);
      if (error) {
        return 'image.' + error;
      }
    }
    if (message.tweet != null && message.hasOwnProperty('tweet')) {
      properties.metaData = 1;
      {
        var error = $root.Tweet.verify(message.tweet);
        if (error) {
          return 'tweet.' + error;
        }
      }
    }
    return null;
  };

  /**
   * Creates a LinkPreview message from a plain object. Also converts values to their respective internal types.
   * @function fromObject
   * @memberof LinkPreview
   * @static
   * @param {Object.<string,*>} object Plain object
   * @returns {LinkPreview} LinkPreview
   */
  LinkPreview.fromObject = function fromObject(object) {
    if (object instanceof $root.LinkPreview) {
      return object;
    }
    const message = new $root.LinkPreview();
    if (object.url != null) {
      message.url = String(object.url);
    }
    if (object.urlOffset != null) {
      message.urlOffset = object.urlOffset | 0;
    }
    if (object.article != null) {
      if (typeof object.article !== 'object') {
        throw TypeError('.LinkPreview.article: object expected');
      }
      message.article = $root.Article.fromObject(object.article);
    }
    if (object.permanentUrl != null) {
      message.permanentUrl = String(object.permanentUrl);
    }
    if (object.title != null) {
      message.title = String(object.title);
    }
    if (object.summary != null) {
      message.summary = String(object.summary);
    }
    if (object.image != null) {
      if (typeof object.image !== 'object') {
        throw TypeError('.LinkPreview.image: object expected');
      }
      message.image = $root.Asset.fromObject(object.image);
    }
    if (object.tweet != null) {
      if (typeof object.tweet !== 'object') {
        throw TypeError('.LinkPreview.tweet: object expected');
      }
      message.tweet = $root.Tweet.fromObject(object.tweet);
    }
    return message;
  };

  /**
   * Creates a plain object from a LinkPreview message. Also converts values to other types if specified.
   * @function toObject
   * @memberof LinkPreview
   * @static
   * @param {LinkPreview} message LinkPreview
   * @param {$protobuf.IConversionOptions} [options] Conversion options
   * @returns {Object.<string,*>} Plain object
   */
  LinkPreview.toObject = function toObject(message, options) {
    if (!options) {
      options = {};
    }
    const object = {};
    if (options.defaults) {
      object.url = '';
      object.urlOffset = 0;
      object.permanentUrl = '';
      object.title = '';
      object.summary = '';
      object.image = null;
    }
    if (message.url != null && message.hasOwnProperty('url')) {
      object.url = message.url;
    }
    if (message.urlOffset != null && message.hasOwnProperty('urlOffset')) {
      object.urlOffset = message.urlOffset;
    }
    if (message.article != null && message.hasOwnProperty('article')) {
      object.article = $root.Article.toObject(message.article, options);
      if (options.oneofs) {
        object.preview = 'article';
      }
    }
    if (message.permanentUrl != null && message.hasOwnProperty('permanentUrl')) {
      object.permanentUrl = message.permanentUrl;
    }
    if (message.title != null && message.hasOwnProperty('title')) {
      object.title = message.title;
    }
    if (message.summary != null && message.hasOwnProperty('summary')) {
      object.summary = message.summary;
    }
    if (message.image != null && message.hasOwnProperty('image')) {
      object.image = $root.Asset.toObject(message.image, options);
    }
    if (message.tweet != null && message.hasOwnProperty('tweet')) {
      object.tweet = $root.Tweet.toObject(message.tweet, options);
      if (options.oneofs) {
        object.metaData = 'tweet';
      }
    }
    return object;
  };

  /**
   * Converts this LinkPreview to JSON.
   * @function toJSON
   * @memberof LinkPreview
   * @instance
   * @returns {Object.<string,*>} JSON object
   */
  LinkPreview.prototype.toJSON = function toJSON() {
    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
  };

  return LinkPreview;
})();

$root.Tweet = (function() {
  /**
   * Properties of a Tweet.
   * @exports ITweet
   * @interface ITweet
   * @property {string|null} [author] Tweet author
   * @property {string|null} [username] Tweet username
   */

  /**
   * Constructs a new Tweet.
   * @exports Tweet
   * @classdesc Represents a Tweet.
   * @implements ITweet
   * @constructor
   * @param {ITweet=} [properties] Properties to set
   */
  function Tweet(properties) {
    if (properties) {
      for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i) {
        if (properties[keys[i]] != null) {
          this[keys[i]] = properties[keys[i]];
        }
      }
    }
  }

  /**
   * Tweet author.
   * @member {string} author
   * @memberof Tweet
   * @instance
   */
  Tweet.prototype.author = '';

  /**
   * Tweet username.
   * @member {string} username
   * @memberof Tweet
   * @instance
   */
  Tweet.prototype.username = '';

  /**
   * Creates a new Tweet instance using the specified properties.
   * @function create
   * @memberof Tweet
   * @static
   * @param {ITweet=} [properties] Properties to set
   * @returns {Tweet} Tweet instance
   */
  Tweet.create = function create(properties) {
    return new Tweet(properties);
  };

  /**
   * Encodes the specified Tweet message. Does not implicitly {@link Tweet.verify|verify} messages.
   * @function encode
   * @memberof Tweet
   * @static
   * @param {ITweet} message Tweet message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  Tweet.encode = function encode(message, writer) {
    if (!writer) {
      writer = $Writer.create();
    }
    if (message.author != null && message.hasOwnProperty('author')) {
      writer.uint32(/* id 1, wireType 2 =*/ 10).string(message.author);
    }
    if (message.username != null && message.hasOwnProperty('username')) {
      writer.uint32(/* id 2, wireType 2 =*/ 18).string(message.username);
    }
    return writer;
  };

  /**
   * Encodes the specified Tweet message, length delimited. Does not implicitly {@link Tweet.verify|verify} messages.
   * @function encodeDelimited
   * @memberof Tweet
   * @static
   * @param {ITweet} message Tweet message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  Tweet.encodeDelimited = function encodeDelimited(message, writer) {
    return this.encode(message, writer).ldelim();
  };

  /**
   * Decodes a Tweet message from the specified reader or buffer.
   * @function decode
   * @memberof Tweet
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @param {number} [length] Message length if known beforehand
   * @returns {Tweet} Tweet
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  Tweet.decode = function decode(reader, length) {
    if (!(reader instanceof $Reader)) {
      reader = $Reader.create(reader);
    }
    const end = length === undefined ? reader.len : reader.pos + length;

    const message = new $root.Tweet();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.author = reader.string();
          break;
        case 2:
          message.username = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  };

  /**
   * Decodes a Tweet message from the specified reader or buffer, length delimited.
   * @function decodeDelimited
   * @memberof Tweet
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @returns {Tweet} Tweet
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  Tweet.decodeDelimited = function decodeDelimited(reader) {
    if (!(reader instanceof $Reader)) {
      reader = new $Reader(reader);
    }
    return this.decode(reader, reader.uint32());
  };

  /**
   * Verifies a Tweet message.
   * @function verify
   * @memberof Tweet
   * @static
   * @param {Object.<string,*>} message Plain object to verify
   * @returns {string|null} `null` if valid, otherwise the reason why it is not
   */
  Tweet.verify = function verify(message) {
    if (typeof message !== 'object' || message === null) {
      return 'object expected';
    }
    if (message.author != null && message.hasOwnProperty('author')) {
      if (!$util.isString(message.author)) {
        return 'author: string expected';
      }
    }
    if (message.username != null && message.hasOwnProperty('username')) {
      if (!$util.isString(message.username)) {
        return 'username: string expected';
      }
    }
    return null;
  };

  /**
   * Creates a Tweet message from a plain object. Also converts values to their respective internal types.
   * @function fromObject
   * @memberof Tweet
   * @static
   * @param {Object.<string,*>} object Plain object
   * @returns {Tweet} Tweet
   */
  Tweet.fromObject = function fromObject(object) {
    if (object instanceof $root.Tweet) {
      return object;
    }
    const message = new $root.Tweet();
    if (object.author != null) {
      message.author = String(object.author);
    }
    if (object.username != null) {
      message.username = String(object.username);
    }
    return message;
  };

  /**
   * Creates a plain object from a Tweet message. Also converts values to other types if specified.
   * @function toObject
   * @memberof Tweet
   * @static
   * @param {Tweet} message Tweet
   * @param {$protobuf.IConversionOptions} [options] Conversion options
   * @returns {Object.<string,*>} Plain object
   */
  Tweet.toObject = function toObject(message, options) {
    if (!options) {
      options = {};
    }
    const object = {};
    if (options.defaults) {
      object.author = '';
      object.username = '';
    }
    if (message.author != null && message.hasOwnProperty('author')) {
      object.author = message.author;
    }
    if (message.username != null && message.hasOwnProperty('username')) {
      object.username = message.username;
    }
    return object;
  };

  /**
   * Converts this Tweet to JSON.
   * @function toJSON
   * @memberof Tweet
   * @instance
   * @returns {Object.<string,*>} JSON object
   */
  Tweet.prototype.toJSON = function toJSON() {
    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
  };

  return Tweet;
})();

$root.Article = (function() {
  /**
   * Properties of an Article.
   * @exports IArticle
   * @interface IArticle
   * @property {string} permanentUrl Article permanentUrl
   * @property {string|null} [title] Article title
   * @property {string|null} [summary] Article summary
   * @property {IAsset|null} [image] Article image
   */

  /**
   * Constructs a new Article.
   * @exports Article
   * @classdesc Represents an Article.
   * @implements IArticle
   * @constructor
   * @param {IArticle=} [properties] Properties to set
   */
  function Article(properties) {
    if (properties) {
      for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i) {
        if (properties[keys[i]] != null) {
          this[keys[i]] = properties[keys[i]];
        }
      }
    }
  }

  /**
   * Article permanentUrl.
   * @member {string} permanentUrl
   * @memberof Article
   * @instance
   */
  Article.prototype.permanentUrl = '';

  /**
   * Article title.
   * @member {string} title
   * @memberof Article
   * @instance
   */
  Article.prototype.title = '';

  /**
   * Article summary.
   * @member {string} summary
   * @memberof Article
   * @instance
   */
  Article.prototype.summary = '';

  /**
   * Article image.
   * @member {IAsset|null|undefined} image
   * @memberof Article
   * @instance
   */
  Article.prototype.image = null;

  /**
   * Creates a new Article instance using the specified properties.
   * @function create
   * @memberof Article
   * @static
   * @param {IArticle=} [properties] Properties to set
   * @returns {Article} Article instance
   */
  Article.create = function create(properties) {
    return new Article(properties);
  };

  /**
   * Encodes the specified Article message. Does not implicitly {@link Article.verify|verify} messages.
   * @function encode
   * @memberof Article
   * @static
   * @param {IArticle} message Article message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  Article.encode = function encode(message, writer) {
    if (!writer) {
      writer = $Writer.create();
    }
    writer.uint32(/* id 1, wireType 2 =*/ 10).string(message.permanentUrl);
    if (message.title != null && message.hasOwnProperty('title')) {
      writer.uint32(/* id 2, wireType 2 =*/ 18).string(message.title);
    }
    if (message.summary != null && message.hasOwnProperty('summary')) {
      writer.uint32(/* id 3, wireType 2 =*/ 26).string(message.summary);
    }
    if (message.image != null && message.hasOwnProperty('image')) {
      $root.Asset.encode(message.image, writer.uint32(/* id 4, wireType 2 =*/ 34).fork()).ldelim();
    }
    return writer;
  };

  /**
   * Encodes the specified Article message, length delimited. Does not implicitly {@link Article.verify|verify} messages.
   * @function encodeDelimited
   * @memberof Article
   * @static
   * @param {IArticle} message Article message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  Article.encodeDelimited = function encodeDelimited(message, writer) {
    return this.encode(message, writer).ldelim();
  };

  /**
   * Decodes an Article message from the specified reader or buffer.
   * @function decode
   * @memberof Article
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @param {number} [length] Message length if known beforehand
   * @returns {Article} Article
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  Article.decode = function decode(reader, length) {
    if (!(reader instanceof $Reader)) {
      reader = $Reader.create(reader);
    }
    const end = length === undefined ? reader.len : reader.pos + length;

    const message = new $root.Article();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.permanentUrl = reader.string();
          break;
        case 2:
          message.title = reader.string();
          break;
        case 3:
          message.summary = reader.string();
          break;
        case 4:
          message.image = $root.Asset.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    if (!message.hasOwnProperty('permanentUrl')) {
      throw $util.ProtocolError("missing required 'permanentUrl'", {instance: message});
    }
    return message;
  };

  /**
   * Decodes an Article message from the specified reader or buffer, length delimited.
   * @function decodeDelimited
   * @memberof Article
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @returns {Article} Article
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  Article.decodeDelimited = function decodeDelimited(reader) {
    if (!(reader instanceof $Reader)) {
      reader = new $Reader(reader);
    }
    return this.decode(reader, reader.uint32());
  };

  /**
   * Verifies an Article message.
   * @function verify
   * @memberof Article
   * @static
   * @param {Object.<string,*>} message Plain object to verify
   * @returns {string|null} `null` if valid, otherwise the reason why it is not
   */
  Article.verify = function verify(message) {
    if (typeof message !== 'object' || message === null) {
      return 'object expected';
    }
    if (!$util.isString(message.permanentUrl)) {
      return 'permanentUrl: string expected';
    }
    if (message.title != null && message.hasOwnProperty('title')) {
      if (!$util.isString(message.title)) {
        return 'title: string expected';
      }
    }
    if (message.summary != null && message.hasOwnProperty('summary')) {
      if (!$util.isString(message.summary)) {
        return 'summary: string expected';
      }
    }
    if (message.image != null && message.hasOwnProperty('image')) {
      const error = $root.Asset.verify(message.image);
      if (error) {
        return 'image.' + error;
      }
    }
    return null;
  };

  /**
   * Creates an Article message from a plain object. Also converts values to their respective internal types.
   * @function fromObject
   * @memberof Article
   * @static
   * @param {Object.<string,*>} object Plain object
   * @returns {Article} Article
   */
  Article.fromObject = function fromObject(object) {
    if (object instanceof $root.Article) {
      return object;
    }
    const message = new $root.Article();
    if (object.permanentUrl != null) {
      message.permanentUrl = String(object.permanentUrl);
    }
    if (object.title != null) {
      message.title = String(object.title);
    }
    if (object.summary != null) {
      message.summary = String(object.summary);
    }
    if (object.image != null) {
      if (typeof object.image !== 'object') {
        throw TypeError('.Article.image: object expected');
      }
      message.image = $root.Asset.fromObject(object.image);
    }
    return message;
  };

  /**
   * Creates a plain object from an Article message. Also converts values to other types if specified.
   * @function toObject
   * @memberof Article
   * @static
   * @param {Article} message Article
   * @param {$protobuf.IConversionOptions} [options] Conversion options
   * @returns {Object.<string,*>} Plain object
   */
  Article.toObject = function toObject(message, options) {
    if (!options) {
      options = {};
    }
    const object = {};
    if (options.defaults) {
      object.permanentUrl = '';
      object.title = '';
      object.summary = '';
      object.image = null;
    }
    if (message.permanentUrl != null && message.hasOwnProperty('permanentUrl')) {
      object.permanentUrl = message.permanentUrl;
    }
    if (message.title != null && message.hasOwnProperty('title')) {
      object.title = message.title;
    }
    if (message.summary != null && message.hasOwnProperty('summary')) {
      object.summary = message.summary;
    }
    if (message.image != null && message.hasOwnProperty('image')) {
      object.image = $root.Asset.toObject(message.image, options);
    }
    return object;
  };

  /**
   * Converts this Article to JSON.
   * @function toJSON
   * @memberof Article
   * @instance
   * @returns {Object.<string,*>} JSON object
   */
  Article.prototype.toJSON = function toJSON() {
    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
  };

  return Article;
})();

$root.Mention = (function() {
  /**
   * Properties of a Mention.
   * @exports IMention
   * @interface IMention
   * @property {string} userId Mention userId
   * @property {string} userName Mention userName
   */

  /**
   * Constructs a new Mention.
   * @exports Mention
   * @classdesc Represents a Mention.
   * @implements IMention
   * @constructor
   * @param {IMention=} [properties] Properties to set
   */
  function Mention(properties) {
    if (properties) {
      for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i) {
        if (properties[keys[i]] != null) {
          this[keys[i]] = properties[keys[i]];
        }
      }
    }
  }

  /**
   * Mention userId.
   * @member {string} userId
   * @memberof Mention
   * @instance
   */
  Mention.prototype.userId = '';

  /**
   * Mention userName.
   * @member {string} userName
   * @memberof Mention
   * @instance
   */
  Mention.prototype.userName = '';

  /**
   * Creates a new Mention instance using the specified properties.
   * @function create
   * @memberof Mention
   * @static
   * @param {IMention=} [properties] Properties to set
   * @returns {Mention} Mention instance
   */
  Mention.create = function create(properties) {
    return new Mention(properties);
  };

  /**
   * Encodes the specified Mention message. Does not implicitly {@link Mention.verify|verify} messages.
   * @function encode
   * @memberof Mention
   * @static
   * @param {IMention} message Mention message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  Mention.encode = function encode(message, writer) {
    if (!writer) {
      writer = $Writer.create();
    }
    writer.uint32(/* id 1, wireType 2 =*/ 10).string(message.userId);
    writer.uint32(/* id 2, wireType 2 =*/ 18).string(message.userName);
    return writer;
  };

  /**
   * Encodes the specified Mention message, length delimited. Does not implicitly {@link Mention.verify|verify} messages.
   * @function encodeDelimited
   * @memberof Mention
   * @static
   * @param {IMention} message Mention message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  Mention.encodeDelimited = function encodeDelimited(message, writer) {
    return this.encode(message, writer).ldelim();
  };

  /**
   * Decodes a Mention message from the specified reader or buffer.
   * @function decode
   * @memberof Mention
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @param {number} [length] Message length if known beforehand
   * @returns {Mention} Mention
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  Mention.decode = function decode(reader, length) {
    if (!(reader instanceof $Reader)) {
      reader = $Reader.create(reader);
    }
    const end = length === undefined ? reader.len : reader.pos + length;

    const message = new $root.Mention();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.userId = reader.string();
          break;
        case 2:
          message.userName = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    if (!message.hasOwnProperty('userId')) {
      throw $util.ProtocolError("missing required 'userId'", {instance: message});
    }
    if (!message.hasOwnProperty('userName')) {
      throw $util.ProtocolError("missing required 'userName'", {instance: message});
    }
    return message;
  };

  /**
   * Decodes a Mention message from the specified reader or buffer, length delimited.
   * @function decodeDelimited
   * @memberof Mention
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @returns {Mention} Mention
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  Mention.decodeDelimited = function decodeDelimited(reader) {
    if (!(reader instanceof $Reader)) {
      reader = new $Reader(reader);
    }
    return this.decode(reader, reader.uint32());
  };

  /**
   * Verifies a Mention message.
   * @function verify
   * @memberof Mention
   * @static
   * @param {Object.<string,*>} message Plain object to verify
   * @returns {string|null} `null` if valid, otherwise the reason why it is not
   */
  Mention.verify = function verify(message) {
    if (typeof message !== 'object' || message === null) {
      return 'object expected';
    }
    if (!$util.isString(message.userId)) {
      return 'userId: string expected';
    }
    if (!$util.isString(message.userName)) {
      return 'userName: string expected';
    }
    return null;
  };

  /**
   * Creates a Mention message from a plain object. Also converts values to their respective internal types.
   * @function fromObject
   * @memberof Mention
   * @static
   * @param {Object.<string,*>} object Plain object
   * @returns {Mention} Mention
   */
  Mention.fromObject = function fromObject(object) {
    if (object instanceof $root.Mention) {
      return object;
    }
    const message = new $root.Mention();
    if (object.userId != null) {
      message.userId = String(object.userId);
    }
    if (object.userName != null) {
      message.userName = String(object.userName);
    }
    return message;
  };

  /**
   * Creates a plain object from a Mention message. Also converts values to other types if specified.
   * @function toObject
   * @memberof Mention
   * @static
   * @param {Mention} message Mention
   * @param {$protobuf.IConversionOptions} [options] Conversion options
   * @returns {Object.<string,*>} Plain object
   */
  Mention.toObject = function toObject(message, options) {
    if (!options) {
      options = {};
    }
    const object = {};
    if (options.defaults) {
      object.userId = '';
      object.userName = '';
    }
    if (message.userId != null && message.hasOwnProperty('userId')) {
      object.userId = message.userId;
    }
    if (message.userName != null && message.hasOwnProperty('userName')) {
      object.userName = message.userName;
    }
    return object;
  };

  /**
   * Converts this Mention to JSON.
   * @function toJSON
   * @memberof Mention
   * @instance
   * @returns {Object.<string,*>} JSON object
   */
  Mention.prototype.toJSON = function toJSON() {
    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
  };

  return Mention;
})();

$root.LastRead = (function() {
  /**
   * Properties of a LastRead.
   * @exports ILastRead
   * @interface ILastRead
   * @property {string} conversationId LastRead conversationId
   * @property {number|Long} lastReadTimestamp LastRead lastReadTimestamp
   */

  /**
   * Constructs a new LastRead.
   * @exports LastRead
   * @classdesc Represents a LastRead.
   * @implements ILastRead
   * @constructor
   * @param {ILastRead=} [properties] Properties to set
   */
  function LastRead(properties) {
    if (properties) {
      for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i) {
        if (properties[keys[i]] != null) {
          this[keys[i]] = properties[keys[i]];
        }
      }
    }
  }

  /**
   * LastRead conversationId.
   * @member {string} conversationId
   * @memberof LastRead
   * @instance
   */
  LastRead.prototype.conversationId = '';

  /**
   * LastRead lastReadTimestamp.
   * @member {number|Long} lastReadTimestamp
   * @memberof LastRead
   * @instance
   */
  LastRead.prototype.lastReadTimestamp = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;

  /**
   * Creates a new LastRead instance using the specified properties.
   * @function create
   * @memberof LastRead
   * @static
   * @param {ILastRead=} [properties] Properties to set
   * @returns {LastRead} LastRead instance
   */
  LastRead.create = function create(properties) {
    return new LastRead(properties);
  };

  /**
   * Encodes the specified LastRead message. Does not implicitly {@link LastRead.verify|verify} messages.
   * @function encode
   * @memberof LastRead
   * @static
   * @param {ILastRead} message LastRead message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  LastRead.encode = function encode(message, writer) {
    if (!writer) {
      writer = $Writer.create();
    }
    writer.uint32(/* id 1, wireType 2 =*/ 10).string(message.conversationId);
    writer.uint32(/* id 2, wireType 0 =*/ 16).int64(message.lastReadTimestamp);
    return writer;
  };

  /**
   * Encodes the specified LastRead message, length delimited. Does not implicitly {@link LastRead.verify|verify} messages.
   * @function encodeDelimited
   * @memberof LastRead
   * @static
   * @param {ILastRead} message LastRead message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  LastRead.encodeDelimited = function encodeDelimited(message, writer) {
    return this.encode(message, writer).ldelim();
  };

  /**
   * Decodes a LastRead message from the specified reader or buffer.
   * @function decode
   * @memberof LastRead
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @param {number} [length] Message length if known beforehand
   * @returns {LastRead} LastRead
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  LastRead.decode = function decode(reader, length) {
    if (!(reader instanceof $Reader)) {
      reader = $Reader.create(reader);
    }
    const end = length === undefined ? reader.len : reader.pos + length;

    const message = new $root.LastRead();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.conversationId = reader.string();
          break;
        case 2:
          message.lastReadTimestamp = reader.int64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    if (!message.hasOwnProperty('conversationId')) {
      throw $util.ProtocolError("missing required 'conversationId'", {instance: message});
    }
    if (!message.hasOwnProperty('lastReadTimestamp')) {
      throw $util.ProtocolError("missing required 'lastReadTimestamp'", {instance: message});
    }
    return message;
  };

  /**
   * Decodes a LastRead message from the specified reader or buffer, length delimited.
   * @function decodeDelimited
   * @memberof LastRead
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @returns {LastRead} LastRead
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  LastRead.decodeDelimited = function decodeDelimited(reader) {
    if (!(reader instanceof $Reader)) {
      reader = new $Reader(reader);
    }
    return this.decode(reader, reader.uint32());
  };

  /**
   * Verifies a LastRead message.
   * @function verify
   * @memberof LastRead
   * @static
   * @param {Object.<string,*>} message Plain object to verify
   * @returns {string|null} `null` if valid, otherwise the reason why it is not
   */
  LastRead.verify = function verify(message) {
    if (typeof message !== 'object' || message === null) {
      return 'object expected';
    }
    if (!$util.isString(message.conversationId)) {
      return 'conversationId: string expected';
    }
    if (
      !$util.isInteger(message.lastReadTimestamp) &&
      !(
        message.lastReadTimestamp &&
        $util.isInteger(message.lastReadTimestamp.low) &&
        $util.isInteger(message.lastReadTimestamp.high)
      )
    ) {
      return 'lastReadTimestamp: integer|Long expected';
    }
    return null;
  };

  /**
   * Creates a LastRead message from a plain object. Also converts values to their respective internal types.
   * @function fromObject
   * @memberof LastRead
   * @static
   * @param {Object.<string,*>} object Plain object
   * @returns {LastRead} LastRead
   */
  LastRead.fromObject = function fromObject(object) {
    if (object instanceof $root.LastRead) {
      return object;
    }
    const message = new $root.LastRead();
    if (object.conversationId != null) {
      message.conversationId = String(object.conversationId);
    }
    if (object.lastReadTimestamp != null) {
      if ($util.Long) {
        (message.lastReadTimestamp = $util.Long.fromValue(object.lastReadTimestamp)).unsigned = false;
      } else if (typeof object.lastReadTimestamp === 'string') {
        message.lastReadTimestamp = parseInt(object.lastReadTimestamp, 10);
      } else if (typeof object.lastReadTimestamp === 'number') {
        message.lastReadTimestamp = object.lastReadTimestamp;
      } else if (typeof object.lastReadTimestamp === 'object') {
        message.lastReadTimestamp = new $util.LongBits(
          object.lastReadTimestamp.low >>> 0,
          object.lastReadTimestamp.high >>> 0
        ).toNumber();
      }
    }
    return message;
  };

  /**
   * Creates a plain object from a LastRead message. Also converts values to other types if specified.
   * @function toObject
   * @memberof LastRead
   * @static
   * @param {LastRead} message LastRead
   * @param {$protobuf.IConversionOptions} [options] Conversion options
   * @returns {Object.<string,*>} Plain object
   */
  LastRead.toObject = function toObject(message, options) {
    if (!options) {
      options = {};
    }
    const object = {};
    if (options.defaults) {
      object.conversationId = '';
      if ($util.Long) {
        const long = new $util.Long(0, 0, false);
        object.lastReadTimestamp =
          options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
      } else {
        object.lastReadTimestamp = options.longs === String ? '0' : 0;
      }
    }
    if (message.conversationId != null && message.hasOwnProperty('conversationId')) {
      object.conversationId = message.conversationId;
    }
    if (message.lastReadTimestamp != null && message.hasOwnProperty('lastReadTimestamp')) {
      if (typeof message.lastReadTimestamp === 'number') {
        object.lastReadTimestamp =
          options.longs === String ? String(message.lastReadTimestamp) : message.lastReadTimestamp;
      } else {
        object.lastReadTimestamp =
          options.longs === String
            ? $util.Long.prototype.toString.call(message.lastReadTimestamp)
            : options.longs === Number
              ? new $util.LongBits(message.lastReadTimestamp.low >>> 0, message.lastReadTimestamp.high >>> 0).toNumber()
              : message.lastReadTimestamp;
      }
    }
    return object;
  };

  /**
   * Converts this LastRead to JSON.
   * @function toJSON
   * @memberof LastRead
   * @instance
   * @returns {Object.<string,*>} JSON object
   */
  LastRead.prototype.toJSON = function toJSON() {
    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
  };

  return LastRead;
})();

$root.Cleared = (function() {
  /**
   * Properties of a Cleared.
   * @exports ICleared
   * @interface ICleared
   * @property {string} conversationId Cleared conversationId
   * @property {number|Long} clearedTimestamp Cleared clearedTimestamp
   */

  /**
   * Constructs a new Cleared.
   * @exports Cleared
   * @classdesc Represents a Cleared.
   * @implements ICleared
   * @constructor
   * @param {ICleared=} [properties] Properties to set
   */
  function Cleared(properties) {
    if (properties) {
      for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i) {
        if (properties[keys[i]] != null) {
          this[keys[i]] = properties[keys[i]];
        }
      }
    }
  }

  /**
   * Cleared conversationId.
   * @member {string} conversationId
   * @memberof Cleared
   * @instance
   */
  Cleared.prototype.conversationId = '';

  /**
   * Cleared clearedTimestamp.
   * @member {number|Long} clearedTimestamp
   * @memberof Cleared
   * @instance
   */
  Cleared.prototype.clearedTimestamp = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;

  /**
   * Creates a new Cleared instance using the specified properties.
   * @function create
   * @memberof Cleared
   * @static
   * @param {ICleared=} [properties] Properties to set
   * @returns {Cleared} Cleared instance
   */
  Cleared.create = function create(properties) {
    return new Cleared(properties);
  };

  /**
   * Encodes the specified Cleared message. Does not implicitly {@link Cleared.verify|verify} messages.
   * @function encode
   * @memberof Cleared
   * @static
   * @param {ICleared} message Cleared message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  Cleared.encode = function encode(message, writer) {
    if (!writer) {
      writer = $Writer.create();
    }
    writer.uint32(/* id 1, wireType 2 =*/ 10).string(message.conversationId);
    writer.uint32(/* id 2, wireType 0 =*/ 16).int64(message.clearedTimestamp);
    return writer;
  };

  /**
   * Encodes the specified Cleared message, length delimited. Does not implicitly {@link Cleared.verify|verify} messages.
   * @function encodeDelimited
   * @memberof Cleared
   * @static
   * @param {ICleared} message Cleared message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  Cleared.encodeDelimited = function encodeDelimited(message, writer) {
    return this.encode(message, writer).ldelim();
  };

  /**
   * Decodes a Cleared message from the specified reader or buffer.
   * @function decode
   * @memberof Cleared
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @param {number} [length] Message length if known beforehand
   * @returns {Cleared} Cleared
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  Cleared.decode = function decode(reader, length) {
    if (!(reader instanceof $Reader)) {
      reader = $Reader.create(reader);
    }
    const end = length === undefined ? reader.len : reader.pos + length;

    const message = new $root.Cleared();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.conversationId = reader.string();
          break;
        case 2:
          message.clearedTimestamp = reader.int64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    if (!message.hasOwnProperty('conversationId')) {
      throw $util.ProtocolError("missing required 'conversationId'", {instance: message});
    }
    if (!message.hasOwnProperty('clearedTimestamp')) {
      throw $util.ProtocolError("missing required 'clearedTimestamp'", {instance: message});
    }
    return message;
  };

  /**
   * Decodes a Cleared message from the specified reader or buffer, length delimited.
   * @function decodeDelimited
   * @memberof Cleared
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @returns {Cleared} Cleared
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  Cleared.decodeDelimited = function decodeDelimited(reader) {
    if (!(reader instanceof $Reader)) {
      reader = new $Reader(reader);
    }
    return this.decode(reader, reader.uint32());
  };

  /**
   * Verifies a Cleared message.
   * @function verify
   * @memberof Cleared
   * @static
   * @param {Object.<string,*>} message Plain object to verify
   * @returns {string|null} `null` if valid, otherwise the reason why it is not
   */
  Cleared.verify = function verify(message) {
    if (typeof message !== 'object' || message === null) {
      return 'object expected';
    }
    if (!$util.isString(message.conversationId)) {
      return 'conversationId: string expected';
    }
    if (
      !$util.isInteger(message.clearedTimestamp) &&
      !(
        message.clearedTimestamp &&
        $util.isInteger(message.clearedTimestamp.low) &&
        $util.isInteger(message.clearedTimestamp.high)
      )
    ) {
      return 'clearedTimestamp: integer|Long expected';
    }
    return null;
  };

  /**
   * Creates a Cleared message from a plain object. Also converts values to their respective internal types.
   * @function fromObject
   * @memberof Cleared
   * @static
   * @param {Object.<string,*>} object Plain object
   * @returns {Cleared} Cleared
   */
  Cleared.fromObject = function fromObject(object) {
    if (object instanceof $root.Cleared) {
      return object;
    }
    const message = new $root.Cleared();
    if (object.conversationId != null) {
      message.conversationId = String(object.conversationId);
    }
    if (object.clearedTimestamp != null) {
      if ($util.Long) {
        (message.clearedTimestamp = $util.Long.fromValue(object.clearedTimestamp)).unsigned = false;
      } else if (typeof object.clearedTimestamp === 'string') {
        message.clearedTimestamp = parseInt(object.clearedTimestamp, 10);
      } else if (typeof object.clearedTimestamp === 'number') {
        message.clearedTimestamp = object.clearedTimestamp;
      } else if (typeof object.clearedTimestamp === 'object') {
        message.clearedTimestamp = new $util.LongBits(
          object.clearedTimestamp.low >>> 0,
          object.clearedTimestamp.high >>> 0
        ).toNumber();
      }
    }
    return message;
  };

  /**
   * Creates a plain object from a Cleared message. Also converts values to other types if specified.
   * @function toObject
   * @memberof Cleared
   * @static
   * @param {Cleared} message Cleared
   * @param {$protobuf.IConversionOptions} [options] Conversion options
   * @returns {Object.<string,*>} Plain object
   */
  Cleared.toObject = function toObject(message, options) {
    if (!options) {
      options = {};
    }
    const object = {};
    if (options.defaults) {
      object.conversationId = '';
      if ($util.Long) {
        const long = new $util.Long(0, 0, false);
        object.clearedTimestamp =
          options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
      } else {
        object.clearedTimestamp = options.longs === String ? '0' : 0;
      }
    }
    if (message.conversationId != null && message.hasOwnProperty('conversationId')) {
      object.conversationId = message.conversationId;
    }
    if (message.clearedTimestamp != null && message.hasOwnProperty('clearedTimestamp')) {
      if (typeof message.clearedTimestamp === 'number') {
        object.clearedTimestamp =
          options.longs === String ? String(message.clearedTimestamp) : message.clearedTimestamp;
      } else {
        object.clearedTimestamp =
          options.longs === String
            ? $util.Long.prototype.toString.call(message.clearedTimestamp)
            : options.longs === Number
              ? new $util.LongBits(message.clearedTimestamp.low >>> 0, message.clearedTimestamp.high >>> 0).toNumber()
              : message.clearedTimestamp;
      }
    }
    return object;
  };

  /**
   * Converts this Cleared to JSON.
   * @function toJSON
   * @memberof Cleared
   * @instance
   * @returns {Object.<string,*>} JSON object
   */
  Cleared.prototype.toJSON = function toJSON() {
    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
  };

  return Cleared;
})();

$root.MessageHide = (function() {
  /**
   * Properties of a MessageHide.
   * @exports IMessageHide
   * @interface IMessageHide
   * @property {string} conversationId MessageHide conversationId
   * @property {string} messageId MessageHide messageId
   */

  /**
   * Constructs a new MessageHide.
   * @exports MessageHide
   * @classdesc Represents a MessageHide.
   * @implements IMessageHide
   * @constructor
   * @param {IMessageHide=} [properties] Properties to set
   */
  function MessageHide(properties) {
    if (properties) {
      for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i) {
        if (properties[keys[i]] != null) {
          this[keys[i]] = properties[keys[i]];
        }
      }
    }
  }

  /**
   * MessageHide conversationId.
   * @member {string} conversationId
   * @memberof MessageHide
   * @instance
   */
  MessageHide.prototype.conversationId = '';

  /**
   * MessageHide messageId.
   * @member {string} messageId
   * @memberof MessageHide
   * @instance
   */
  MessageHide.prototype.messageId = '';

  /**
   * Creates a new MessageHide instance using the specified properties.
   * @function create
   * @memberof MessageHide
   * @static
   * @param {IMessageHide=} [properties] Properties to set
   * @returns {MessageHide} MessageHide instance
   */
  MessageHide.create = function create(properties) {
    return new MessageHide(properties);
  };

  /**
   * Encodes the specified MessageHide message. Does not implicitly {@link MessageHide.verify|verify} messages.
   * @function encode
   * @memberof MessageHide
   * @static
   * @param {IMessageHide} message MessageHide message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  MessageHide.encode = function encode(message, writer) {
    if (!writer) {
      writer = $Writer.create();
    }
    writer.uint32(/* id 1, wireType 2 =*/ 10).string(message.conversationId);
    writer.uint32(/* id 2, wireType 2 =*/ 18).string(message.messageId);
    return writer;
  };

  /**
   * Encodes the specified MessageHide message, length delimited. Does not implicitly {@link MessageHide.verify|verify} messages.
   * @function encodeDelimited
   * @memberof MessageHide
   * @static
   * @param {IMessageHide} message MessageHide message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  MessageHide.encodeDelimited = function encodeDelimited(message, writer) {
    return this.encode(message, writer).ldelim();
  };

  /**
   * Decodes a MessageHide message from the specified reader or buffer.
   * @function decode
   * @memberof MessageHide
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @param {number} [length] Message length if known beforehand
   * @returns {MessageHide} MessageHide
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  MessageHide.decode = function decode(reader, length) {
    if (!(reader instanceof $Reader)) {
      reader = $Reader.create(reader);
    }
    const end = length === undefined ? reader.len : reader.pos + length;

    const message = new $root.MessageHide();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.conversationId = reader.string();
          break;
        case 2:
          message.messageId = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    if (!message.hasOwnProperty('conversationId')) {
      throw $util.ProtocolError("missing required 'conversationId'", {instance: message});
    }
    if (!message.hasOwnProperty('messageId')) {
      throw $util.ProtocolError("missing required 'messageId'", {instance: message});
    }
    return message;
  };

  /**
   * Decodes a MessageHide message from the specified reader or buffer, length delimited.
   * @function decodeDelimited
   * @memberof MessageHide
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @returns {MessageHide} MessageHide
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  MessageHide.decodeDelimited = function decodeDelimited(reader) {
    if (!(reader instanceof $Reader)) {
      reader = new $Reader(reader);
    }
    return this.decode(reader, reader.uint32());
  };

  /**
   * Verifies a MessageHide message.
   * @function verify
   * @memberof MessageHide
   * @static
   * @param {Object.<string,*>} message Plain object to verify
   * @returns {string|null} `null` if valid, otherwise the reason why it is not
   */
  MessageHide.verify = function verify(message) {
    if (typeof message !== 'object' || message === null) {
      return 'object expected';
    }
    if (!$util.isString(message.conversationId)) {
      return 'conversationId: string expected';
    }
    if (!$util.isString(message.messageId)) {
      return 'messageId: string expected';
    }
    return null;
  };

  /**
   * Creates a MessageHide message from a plain object. Also converts values to their respective internal types.
   * @function fromObject
   * @memberof MessageHide
   * @static
   * @param {Object.<string,*>} object Plain object
   * @returns {MessageHide} MessageHide
   */
  MessageHide.fromObject = function fromObject(object) {
    if (object instanceof $root.MessageHide) {
      return object;
    }
    const message = new $root.MessageHide();
    if (object.conversationId != null) {
      message.conversationId = String(object.conversationId);
    }
    if (object.messageId != null) {
      message.messageId = String(object.messageId);
    }
    return message;
  };

  /**
   * Creates a plain object from a MessageHide message. Also converts values to other types if specified.
   * @function toObject
   * @memberof MessageHide
   * @static
   * @param {MessageHide} message MessageHide
   * @param {$protobuf.IConversionOptions} [options] Conversion options
   * @returns {Object.<string,*>} Plain object
   */
  MessageHide.toObject = function toObject(message, options) {
    if (!options) {
      options = {};
    }
    const object = {};
    if (options.defaults) {
      object.conversationId = '';
      object.messageId = '';
    }
    if (message.conversationId != null && message.hasOwnProperty('conversationId')) {
      object.conversationId = message.conversationId;
    }
    if (message.messageId != null && message.hasOwnProperty('messageId')) {
      object.messageId = message.messageId;
    }
    return object;
  };

  /**
   * Converts this MessageHide to JSON.
   * @function toJSON
   * @memberof MessageHide
   * @instance
   * @returns {Object.<string,*>} JSON object
   */
  MessageHide.prototype.toJSON = function toJSON() {
    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
  };

  return MessageHide;
})();

$root.MessageDelete = (function() {
  /**
   * Properties of a MessageDelete.
   * @exports IMessageDelete
   * @interface IMessageDelete
   * @property {string} messageId MessageDelete messageId
   */

  /**
   * Constructs a new MessageDelete.
   * @exports MessageDelete
   * @classdesc Represents a MessageDelete.
   * @implements IMessageDelete
   * @constructor
   * @param {IMessageDelete=} [properties] Properties to set
   */
  function MessageDelete(properties) {
    if (properties) {
      for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i) {
        if (properties[keys[i]] != null) {
          this[keys[i]] = properties[keys[i]];
        }
      }
    }
  }

  /**
   * MessageDelete messageId.
   * @member {string} messageId
   * @memberof MessageDelete
   * @instance
   */
  MessageDelete.prototype.messageId = '';

  /**
   * Creates a new MessageDelete instance using the specified properties.
   * @function create
   * @memberof MessageDelete
   * @static
   * @param {IMessageDelete=} [properties] Properties to set
   * @returns {MessageDelete} MessageDelete instance
   */
  MessageDelete.create = function create(properties) {
    return new MessageDelete(properties);
  };

  /**
   * Encodes the specified MessageDelete message. Does not implicitly {@link MessageDelete.verify|verify} messages.
   * @function encode
   * @memberof MessageDelete
   * @static
   * @param {IMessageDelete} message MessageDelete message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  MessageDelete.encode = function encode(message, writer) {
    if (!writer) {
      writer = $Writer.create();
    }
    writer.uint32(/* id 1, wireType 2 =*/ 10).string(message.messageId);
    return writer;
  };

  /**
   * Encodes the specified MessageDelete message, length delimited. Does not implicitly {@link MessageDelete.verify|verify} messages.
   * @function encodeDelimited
   * @memberof MessageDelete
   * @static
   * @param {IMessageDelete} message MessageDelete message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  MessageDelete.encodeDelimited = function encodeDelimited(message, writer) {
    return this.encode(message, writer).ldelim();
  };

  /**
   * Decodes a MessageDelete message from the specified reader or buffer.
   * @function decode
   * @memberof MessageDelete
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @param {number} [length] Message length if known beforehand
   * @returns {MessageDelete} MessageDelete
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  MessageDelete.decode = function decode(reader, length) {
    if (!(reader instanceof $Reader)) {
      reader = $Reader.create(reader);
    }
    const end = length === undefined ? reader.len : reader.pos + length;

    const message = new $root.MessageDelete();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.messageId = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    if (!message.hasOwnProperty('messageId')) {
      throw $util.ProtocolError("missing required 'messageId'", {instance: message});
    }
    return message;
  };

  /**
   * Decodes a MessageDelete message from the specified reader or buffer, length delimited.
   * @function decodeDelimited
   * @memberof MessageDelete
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @returns {MessageDelete} MessageDelete
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  MessageDelete.decodeDelimited = function decodeDelimited(reader) {
    if (!(reader instanceof $Reader)) {
      reader = new $Reader(reader);
    }
    return this.decode(reader, reader.uint32());
  };

  /**
   * Verifies a MessageDelete message.
   * @function verify
   * @memberof MessageDelete
   * @static
   * @param {Object.<string,*>} message Plain object to verify
   * @returns {string|null} `null` if valid, otherwise the reason why it is not
   */
  MessageDelete.verify = function verify(message) {
    if (typeof message !== 'object' || message === null) {
      return 'object expected';
    }
    if (!$util.isString(message.messageId)) {
      return 'messageId: string expected';
    }
    return null;
  };

  /**
   * Creates a MessageDelete message from a plain object. Also converts values to their respective internal types.
   * @function fromObject
   * @memberof MessageDelete
   * @static
   * @param {Object.<string,*>} object Plain object
   * @returns {MessageDelete} MessageDelete
   */
  MessageDelete.fromObject = function fromObject(object) {
    if (object instanceof $root.MessageDelete) {
      return object;
    }
    const message = new $root.MessageDelete();
    if (object.messageId != null) {
      message.messageId = String(object.messageId);
    }
    return message;
  };

  /**
   * Creates a plain object from a MessageDelete message. Also converts values to other types if specified.
   * @function toObject
   * @memberof MessageDelete
   * @static
   * @param {MessageDelete} message MessageDelete
   * @param {$protobuf.IConversionOptions} [options] Conversion options
   * @returns {Object.<string,*>} Plain object
   */
  MessageDelete.toObject = function toObject(message, options) {
    if (!options) {
      options = {};
    }
    const object = {};
    if (options.defaults) {
      object.messageId = '';
    }
    if (message.messageId != null && message.hasOwnProperty('messageId')) {
      object.messageId = message.messageId;
    }
    return object;
  };

  /**
   * Converts this MessageDelete to JSON.
   * @function toJSON
   * @memberof MessageDelete
   * @instance
   * @returns {Object.<string,*>} JSON object
   */
  MessageDelete.prototype.toJSON = function toJSON() {
    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
  };

  return MessageDelete;
})();

$root.MessageEdit = (function() {
  /**
   * Properties of a MessageEdit.
   * @exports IMessageEdit
   * @interface IMessageEdit
   * @property {string} replacingMessageId MessageEdit replacingMessageId
   * @property {IText|null} [text] MessageEdit text
   */

  /**
   * Constructs a new MessageEdit.
   * @exports MessageEdit
   * @classdesc Represents a MessageEdit.
   * @implements IMessageEdit
   * @constructor
   * @param {IMessageEdit=} [properties] Properties to set
   */
  function MessageEdit(properties) {
    if (properties) {
      for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i) {
        if (properties[keys[i]] != null) {
          this[keys[i]] = properties[keys[i]];
        }
      }
    }
  }

  /**
   * MessageEdit replacingMessageId.
   * @member {string} replacingMessageId
   * @memberof MessageEdit
   * @instance
   */
  MessageEdit.prototype.replacingMessageId = '';

  /**
   * MessageEdit text.
   * @member {IText|null|undefined} text
   * @memberof MessageEdit
   * @instance
   */
  MessageEdit.prototype.text = null;

  // OneOf field names bound to virtual getters and setters
  let $oneOfFields;

  /**
   * MessageEdit content.
   * @member {"text"|undefined} content
   * @memberof MessageEdit
   * @instance
   */
  Object.defineProperty(MessageEdit.prototype, 'content', {
    get: $util.oneOfGetter(($oneOfFields = ['text'])),
    set: $util.oneOfSetter($oneOfFields),
  });

  /**
   * Creates a new MessageEdit instance using the specified properties.
   * @function create
   * @memberof MessageEdit
   * @static
   * @param {IMessageEdit=} [properties] Properties to set
   * @returns {MessageEdit} MessageEdit instance
   */
  MessageEdit.create = function create(properties) {
    return new MessageEdit(properties);
  };

  /**
   * Encodes the specified MessageEdit message. Does not implicitly {@link MessageEdit.verify|verify} messages.
   * @function encode
   * @memberof MessageEdit
   * @static
   * @param {IMessageEdit} message MessageEdit message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  MessageEdit.encode = function encode(message, writer) {
    if (!writer) {
      writer = $Writer.create();
    }
    writer.uint32(/* id 1, wireType 2 =*/ 10).string(message.replacingMessageId);
    if (message.text != null && message.hasOwnProperty('text')) {
      $root.Text.encode(message.text, writer.uint32(/* id 2, wireType 2 =*/ 18).fork()).ldelim();
    }
    return writer;
  };

  /**
   * Encodes the specified MessageEdit message, length delimited. Does not implicitly {@link MessageEdit.verify|verify} messages.
   * @function encodeDelimited
   * @memberof MessageEdit
   * @static
   * @param {IMessageEdit} message MessageEdit message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  MessageEdit.encodeDelimited = function encodeDelimited(message, writer) {
    return this.encode(message, writer).ldelim();
  };

  /**
   * Decodes a MessageEdit message from the specified reader or buffer.
   * @function decode
   * @memberof MessageEdit
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @param {number} [length] Message length if known beforehand
   * @returns {MessageEdit} MessageEdit
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  MessageEdit.decode = function decode(reader, length) {
    if (!(reader instanceof $Reader)) {
      reader = $Reader.create(reader);
    }
    const end = length === undefined ? reader.len : reader.pos + length;

    const message = new $root.MessageEdit();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.replacingMessageId = reader.string();
          break;
        case 2:
          message.text = $root.Text.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    if (!message.hasOwnProperty('replacingMessageId')) {
      throw $util.ProtocolError("missing required 'replacingMessageId'", {instance: message});
    }
    return message;
  };

  /**
   * Decodes a MessageEdit message from the specified reader or buffer, length delimited.
   * @function decodeDelimited
   * @memberof MessageEdit
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @returns {MessageEdit} MessageEdit
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  MessageEdit.decodeDelimited = function decodeDelimited(reader) {
    if (!(reader instanceof $Reader)) {
      reader = new $Reader(reader);
    }
    return this.decode(reader, reader.uint32());
  };

  /**
   * Verifies a MessageEdit message.
   * @function verify
   * @memberof MessageEdit
   * @static
   * @param {Object.<string,*>} message Plain object to verify
   * @returns {string|null} `null` if valid, otherwise the reason why it is not
   */
  MessageEdit.verify = function verify(message) {
    if (typeof message !== 'object' || message === null) {
      return 'object expected';
    }
    const properties = {};
    if (!$util.isString(message.replacingMessageId)) {
      return 'replacingMessageId: string expected';
    }
    if (message.text != null && message.hasOwnProperty('text')) {
      properties.content = 1;
      {
        const error = $root.Text.verify(message.text);
        if (error) {
          return 'text.' + error;
        }
      }
    }
    return null;
  };

  /**
   * Creates a MessageEdit message from a plain object. Also converts values to their respective internal types.
   * @function fromObject
   * @memberof MessageEdit
   * @static
   * @param {Object.<string,*>} object Plain object
   * @returns {MessageEdit} MessageEdit
   */
  MessageEdit.fromObject = function fromObject(object) {
    if (object instanceof $root.MessageEdit) {
      return object;
    }
    const message = new $root.MessageEdit();
    if (object.replacingMessageId != null) {
      message.replacingMessageId = String(object.replacingMessageId);
    }
    if (object.text != null) {
      if (typeof object.text !== 'object') {
        throw TypeError('.MessageEdit.text: object expected');
      }
      message.text = $root.Text.fromObject(object.text);
    }
    return message;
  };

  /**
   * Creates a plain object from a MessageEdit message. Also converts values to other types if specified.
   * @function toObject
   * @memberof MessageEdit
   * @static
   * @param {MessageEdit} message MessageEdit
   * @param {$protobuf.IConversionOptions} [options] Conversion options
   * @returns {Object.<string,*>} Plain object
   */
  MessageEdit.toObject = function toObject(message, options) {
    if (!options) {
      options = {};
    }
    const object = {};
    if (options.defaults) {
      object.replacingMessageId = '';
    }
    if (message.replacingMessageId != null && message.hasOwnProperty('replacingMessageId')) {
      object.replacingMessageId = message.replacingMessageId;
    }
    if (message.text != null && message.hasOwnProperty('text')) {
      object.text = $root.Text.toObject(message.text, options);
      if (options.oneofs) {
        object.content = 'text';
      }
    }
    return object;
  };

  /**
   * Converts this MessageEdit to JSON.
   * @function toJSON
   * @memberof MessageEdit
   * @instance
   * @returns {Object.<string,*>} JSON object
   */
  MessageEdit.prototype.toJSON = function toJSON() {
    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
  };

  return MessageEdit;
})();

$root.Confirmation = (function() {
  /**
   * Properties of a Confirmation.
   * @exports IConfirmation
   * @interface IConfirmation
   * @property {Confirmation.Type} type Confirmation type
   * @property {string} firstMessageId Confirmation firstMessageId
   * @property {Array.<string>|null} [moreMessageIds] Confirmation moreMessageIds
   */

  /**
   * Constructs a new Confirmation.
   * @exports Confirmation
   * @classdesc Represents a Confirmation.
   * @implements IConfirmation
   * @constructor
   * @param {IConfirmation=} [properties] Properties to set
   */
  function Confirmation(properties) {
    this.moreMessageIds = [];
    if (properties) {
      for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i) {
        if (properties[keys[i]] != null) {
          this[keys[i]] = properties[keys[i]];
        }
      }
    }
  }

  /**
   * Confirmation type.
   * @member {Confirmation.Type} type
   * @memberof Confirmation
   * @instance
   */
  Confirmation.prototype.type = 0;

  /**
   * Confirmation firstMessageId.
   * @member {string} firstMessageId
   * @memberof Confirmation
   * @instance
   */
  Confirmation.prototype.firstMessageId = '';

  /**
   * Confirmation moreMessageIds.
   * @member {Array.<string>} moreMessageIds
   * @memberof Confirmation
   * @instance
   */
  Confirmation.prototype.moreMessageIds = $util.emptyArray;

  /**
   * Creates a new Confirmation instance using the specified properties.
   * @function create
   * @memberof Confirmation
   * @static
   * @param {IConfirmation=} [properties] Properties to set
   * @returns {Confirmation} Confirmation instance
   */
  Confirmation.create = function create(properties) {
    return new Confirmation(properties);
  };

  /**
   * Encodes the specified Confirmation message. Does not implicitly {@link Confirmation.verify|verify} messages.
   * @function encode
   * @memberof Confirmation
   * @static
   * @param {IConfirmation} message Confirmation message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  Confirmation.encode = function encode(message, writer) {
    if (!writer) {
      writer = $Writer.create();
    }
    writer.uint32(/* id 1, wireType 2 =*/ 10).string(message.firstMessageId);
    writer.uint32(/* id 2, wireType 0 =*/ 16).int32(message.type);
    if (message.moreMessageIds != null && message.moreMessageIds.length) {
      for (let i = 0; i < message.moreMessageIds.length; ++i) {
        writer.uint32(/* id 3, wireType 2 =*/ 26).string(message.moreMessageIds[i]);
      }
    }
    return writer;
  };

  /**
   * Encodes the specified Confirmation message, length delimited. Does not implicitly {@link Confirmation.verify|verify} messages.
   * @function encodeDelimited
   * @memberof Confirmation
   * @static
   * @param {IConfirmation} message Confirmation message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  Confirmation.encodeDelimited = function encodeDelimited(message, writer) {
    return this.encode(message, writer).ldelim();
  };

  /**
   * Decodes a Confirmation message from the specified reader or buffer.
   * @function decode
   * @memberof Confirmation
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @param {number} [length] Message length if known beforehand
   * @returns {Confirmation} Confirmation
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  Confirmation.decode = function decode(reader, length) {
    if (!(reader instanceof $Reader)) {
      reader = $Reader.create(reader);
    }
    const end = length === undefined ? reader.len : reader.pos + length;

    const message = new $root.Confirmation();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 2:
          message.type = reader.int32();
          break;
        case 1:
          message.firstMessageId = reader.string();
          break;
        case 3:
          if (!(message.moreMessageIds && message.moreMessageIds.length)) {
            message.moreMessageIds = [];
          }
          message.moreMessageIds.push(reader.string());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    if (!message.hasOwnProperty('type')) {
      throw $util.ProtocolError("missing required 'type'", {instance: message});
    }
    if (!message.hasOwnProperty('firstMessageId')) {
      throw $util.ProtocolError("missing required 'firstMessageId'", {instance: message});
    }
    return message;
  };

  /**
   * Decodes a Confirmation message from the specified reader or buffer, length delimited.
   * @function decodeDelimited
   * @memberof Confirmation
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @returns {Confirmation} Confirmation
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  Confirmation.decodeDelimited = function decodeDelimited(reader) {
    if (!(reader instanceof $Reader)) {
      reader = new $Reader(reader);
    }
    return this.decode(reader, reader.uint32());
  };

  /**
   * Verifies a Confirmation message.
   * @function verify
   * @memberof Confirmation
   * @static
   * @param {Object.<string,*>} message Plain object to verify
   * @returns {string|null} `null` if valid, otherwise the reason why it is not
   */
  Confirmation.verify = function verify(message) {
    if (typeof message !== 'object' || message === null) {
      return 'object expected';
    }
    switch (message.type) {
      default:
        return 'type: enum value expected';
      case 0:
      case 1:
        break;
    }
    if (!$util.isString(message.firstMessageId)) {
      return 'firstMessageId: string expected';
    }
    if (message.moreMessageIds != null && message.hasOwnProperty('moreMessageIds')) {
      if (!Array.isArray(message.moreMessageIds)) {
        return 'moreMessageIds: array expected';
      }
      for (let i = 0; i < message.moreMessageIds.length; ++i) {
        if (!$util.isString(message.moreMessageIds[i])) {
          return 'moreMessageIds: string[] expected';
        }
      }
    }
    return null;
  };

  /**
   * Creates a Confirmation message from a plain object. Also converts values to their respective internal types.
   * @function fromObject
   * @memberof Confirmation
   * @static
   * @param {Object.<string,*>} object Plain object
   * @returns {Confirmation} Confirmation
   */
  Confirmation.fromObject = function fromObject(object) {
    if (object instanceof $root.Confirmation) {
      return object;
    }
    const message = new $root.Confirmation();
    switch (object.type) {
      case 'DELIVERED':
      case 0:
        message.type = 0;
        break;
      case 'READ':
      case 1:
        message.type = 1;
        break;
    }
    if (object.firstMessageId != null) {
      message.firstMessageId = String(object.firstMessageId);
    }
    if (object.moreMessageIds) {
      if (!Array.isArray(object.moreMessageIds)) {
        throw TypeError('.Confirmation.moreMessageIds: array expected');
      }
      message.moreMessageIds = [];
      for (let i = 0; i < object.moreMessageIds.length; ++i) {
        message.moreMessageIds[i] = String(object.moreMessageIds[i]);
      }
    }
    return message;
  };

  /**
   * Creates a plain object from a Confirmation message. Also converts values to other types if specified.
   * @function toObject
   * @memberof Confirmation
   * @static
   * @param {Confirmation} message Confirmation
   * @param {$protobuf.IConversionOptions} [options] Conversion options
   * @returns {Object.<string,*>} Plain object
   */
  Confirmation.toObject = function toObject(message, options) {
    if (!options) {
      options = {};
    }
    const object = {};
    if (options.arrays || options.defaults) {
      object.moreMessageIds = [];
    }
    if (options.defaults) {
      object.firstMessageId = '';
      object.type = options.enums === String ? 'DELIVERED' : 0;
    }
    if (message.firstMessageId != null && message.hasOwnProperty('firstMessageId')) {
      object.firstMessageId = message.firstMessageId;
    }
    if (message.type != null && message.hasOwnProperty('type')) {
      object.type = options.enums === String ? $root.Confirmation.Type[message.type] : message.type;
    }
    if (message.moreMessageIds && message.moreMessageIds.length) {
      object.moreMessageIds = [];
      for (let j = 0; j < message.moreMessageIds.length; ++j) {
        object.moreMessageIds[j] = message.moreMessageIds[j];
      }
    }
    return object;
  };

  /**
   * Converts this Confirmation to JSON.
   * @function toJSON
   * @memberof Confirmation
   * @instance
   * @returns {Object.<string,*>} JSON object
   */
  Confirmation.prototype.toJSON = function toJSON() {
    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
  };

  /**
   * Type enum.
   * @name Confirmation.Type
   * @enum {string}
   * @property {number} DELIVERED=0 DELIVERED value
   * @property {number} READ=1 READ value
   */
  Confirmation.Type = (function() {
    const valuesById = {};

    const values = Object.create(valuesById);
    values[(valuesById[0] = 'DELIVERED')] = 0;
    values[(valuesById[1] = 'READ')] = 1;
    return values;
  })();

  return Confirmation;
})();

$root.Location = (function() {
  /**
   * Properties of a Location.
   * @exports ILocation
   * @interface ILocation
   * @property {number} longitude Location longitude
   * @property {number} latitude Location latitude
   * @property {string|null} [name] Location name
   * @property {number|null} [zoom] Location zoom
   */

  /**
   * Constructs a new Location.
   * @exports Location
   * @classdesc Represents a Location.
   * @implements ILocation
   * @constructor
   * @param {ILocation=} [properties] Properties to set
   */
  function Location(properties) {
    if (properties) {
      for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i) {
        if (properties[keys[i]] != null) {
          this[keys[i]] = properties[keys[i]];
        }
      }
    }
  }

  /**
   * Location longitude.
   * @member {number} longitude
   * @memberof Location
   * @instance
   */
  Location.prototype.longitude = 0;

  /**
   * Location latitude.
   * @member {number} latitude
   * @memberof Location
   * @instance
   */
  Location.prototype.latitude = 0;

  /**
   * Location name.
   * @member {string} name
   * @memberof Location
   * @instance
   */
  Location.prototype.name = '';

  /**
   * Location zoom.
   * @member {number} zoom
   * @memberof Location
   * @instance
   */
  Location.prototype.zoom = 0;

  /**
   * Creates a new Location instance using the specified properties.
   * @function create
   * @memberof Location
   * @static
   * @param {ILocation=} [properties] Properties to set
   * @returns {Location} Location instance
   */
  Location.create = function create(properties) {
    return new Location(properties);
  };

  /**
   * Encodes the specified Location message. Does not implicitly {@link Location.verify|verify} messages.
   * @function encode
   * @memberof Location
   * @static
   * @param {ILocation} message Location message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  Location.encode = function encode(message, writer) {
    if (!writer) {
      writer = $Writer.create();
    }
    writer.uint32(/* id 1, wireType 5 =*/ 13).float(message.longitude);
    writer.uint32(/* id 2, wireType 5 =*/ 21).float(message.latitude);
    if (message.name != null && message.hasOwnProperty('name')) {
      writer.uint32(/* id 3, wireType 2 =*/ 26).string(message.name);
    }
    if (message.zoom != null && message.hasOwnProperty('zoom')) {
      writer.uint32(/* id 4, wireType 0 =*/ 32).int32(message.zoom);
    }
    return writer;
  };

  /**
   * Encodes the specified Location message, length delimited. Does not implicitly {@link Location.verify|verify} messages.
   * @function encodeDelimited
   * @memberof Location
   * @static
   * @param {ILocation} message Location message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  Location.encodeDelimited = function encodeDelimited(message, writer) {
    return this.encode(message, writer).ldelim();
  };

  /**
   * Decodes a Location message from the specified reader or buffer.
   * @function decode
   * @memberof Location
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @param {number} [length] Message length if known beforehand
   * @returns {Location} Location
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  Location.decode = function decode(reader, length) {
    if (!(reader instanceof $Reader)) {
      reader = $Reader.create(reader);
    }
    const end = length === undefined ? reader.len : reader.pos + length;

    const message = new $root.Location();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.longitude = reader.float();
          break;
        case 2:
          message.latitude = reader.float();
          break;
        case 3:
          message.name = reader.string();
          break;
        case 4:
          message.zoom = reader.int32();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    if (!message.hasOwnProperty('longitude')) {
      throw $util.ProtocolError("missing required 'longitude'", {instance: message});
    }
    if (!message.hasOwnProperty('latitude')) {
      throw $util.ProtocolError("missing required 'latitude'", {instance: message});
    }
    return message;
  };

  /**
   * Decodes a Location message from the specified reader or buffer, length delimited.
   * @function decodeDelimited
   * @memberof Location
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @returns {Location} Location
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  Location.decodeDelimited = function decodeDelimited(reader) {
    if (!(reader instanceof $Reader)) {
      reader = new $Reader(reader);
    }
    return this.decode(reader, reader.uint32());
  };

  /**
   * Verifies a Location message.
   * @function verify
   * @memberof Location
   * @static
   * @param {Object.<string,*>} message Plain object to verify
   * @returns {string|null} `null` if valid, otherwise the reason why it is not
   */
  Location.verify = function verify(message) {
    if (typeof message !== 'object' || message === null) {
      return 'object expected';
    }
    if (typeof message.longitude !== 'number') {
      return 'longitude: number expected';
    }
    if (typeof message.latitude !== 'number') {
      return 'latitude: number expected';
    }
    if (message.name != null && message.hasOwnProperty('name')) {
      if (!$util.isString(message.name)) {
        return 'name: string expected';
      }
    }
    if (message.zoom != null && message.hasOwnProperty('zoom')) {
      if (!$util.isInteger(message.zoom)) {
        return 'zoom: integer expected';
      }
    }
    return null;
  };

  /**
   * Creates a Location message from a plain object. Also converts values to their respective internal types.
   * @function fromObject
   * @memberof Location
   * @static
   * @param {Object.<string,*>} object Plain object
   * @returns {Location} Location
   */
  Location.fromObject = function fromObject(object) {
    if (object instanceof $root.Location) {
      return object;
    }
    const message = new $root.Location();
    if (object.longitude != null) {
      message.longitude = Number(object.longitude);
    }
    if (object.latitude != null) {
      message.latitude = Number(object.latitude);
    }
    if (object.name != null) {
      message.name = String(object.name);
    }
    if (object.zoom != null) {
      message.zoom = object.zoom | 0;
    }
    return message;
  };

  /**
   * Creates a plain object from a Location message. Also converts values to other types if specified.
   * @function toObject
   * @memberof Location
   * @static
   * @param {Location} message Location
   * @param {$protobuf.IConversionOptions} [options] Conversion options
   * @returns {Object.<string,*>} Plain object
   */
  Location.toObject = function toObject(message, options) {
    if (!options) {
      options = {};
    }
    const object = {};
    if (options.defaults) {
      object.longitude = 0;
      object.latitude = 0;
      object.name = '';
      object.zoom = 0;
    }
    if (message.longitude != null && message.hasOwnProperty('longitude')) {
      object.longitude = options.json && !isFinite(message.longitude) ? String(message.longitude) : message.longitude;
    }
    if (message.latitude != null && message.hasOwnProperty('latitude')) {
      object.latitude = options.json && !isFinite(message.latitude) ? String(message.latitude) : message.latitude;
    }
    if (message.name != null && message.hasOwnProperty('name')) {
      object.name = message.name;
    }
    if (message.zoom != null && message.hasOwnProperty('zoom')) {
      object.zoom = message.zoom;
    }
    return object;
  };

  /**
   * Converts this Location to JSON.
   * @function toJSON
   * @memberof Location
   * @instance
   * @returns {Object.<string,*>} JSON object
   */
  Location.prototype.toJSON = function toJSON() {
    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
  };

  return Location;
})();

$root.ImageAsset = (function() {
  /**
   * Properties of an ImageAsset.
   * @exports IImageAsset
   * @interface IImageAsset
   * @property {string} tag ImageAsset tag
   * @property {number} width ImageAsset width
   * @property {number} height ImageAsset height
   * @property {number} originalWidth ImageAsset originalWidth
   * @property {number} originalHeight ImageAsset originalHeight
   * @property {string} mimeType ImageAsset mimeType
   * @property {number} size ImageAsset size
   * @property {Uint8Array|null} [otrKey] ImageAsset otrKey
   * @property {Uint8Array|null} [macKey] ImageAsset macKey
   * @property {Uint8Array|null} [mac] ImageAsset mac
   * @property {Uint8Array|null} [sha256] ImageAsset sha256
   */

  /**
   * Constructs a new ImageAsset.
   * @exports ImageAsset
   * @classdesc Represents an ImageAsset.
   * @implements IImageAsset
   * @constructor
   * @param {IImageAsset=} [properties] Properties to set
   */
  function ImageAsset(properties) {
    if (properties) {
      for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i) {
        if (properties[keys[i]] != null) {
          this[keys[i]] = properties[keys[i]];
        }
      }
    }
  }

  /**
   * ImageAsset tag.
   * @member {string} tag
   * @memberof ImageAsset
   * @instance
   */
  ImageAsset.prototype.tag = '';

  /**
   * ImageAsset width.
   * @member {number} width
   * @memberof ImageAsset
   * @instance
   */
  ImageAsset.prototype.width = 0;

  /**
   * ImageAsset height.
   * @member {number} height
   * @memberof ImageAsset
   * @instance
   */
  ImageAsset.prototype.height = 0;

  /**
   * ImageAsset originalWidth.
   * @member {number} originalWidth
   * @memberof ImageAsset
   * @instance
   */
  ImageAsset.prototype.originalWidth = 0;

  /**
   * ImageAsset originalHeight.
   * @member {number} originalHeight
   * @memberof ImageAsset
   * @instance
   */
  ImageAsset.prototype.originalHeight = 0;

  /**
   * ImageAsset mimeType.
   * @member {string} mimeType
   * @memberof ImageAsset
   * @instance
   */
  ImageAsset.prototype.mimeType = '';

  /**
   * ImageAsset size.
   * @member {number} size
   * @memberof ImageAsset
   * @instance
   */
  ImageAsset.prototype.size = 0;

  /**
   * ImageAsset otrKey.
   * @member {Uint8Array} otrKey
   * @memberof ImageAsset
   * @instance
   */
  ImageAsset.prototype.otrKey = $util.newBuffer([]);

  /**
   * ImageAsset macKey.
   * @member {Uint8Array} macKey
   * @memberof ImageAsset
   * @instance
   */
  ImageAsset.prototype.macKey = $util.newBuffer([]);

  /**
   * ImageAsset mac.
   * @member {Uint8Array} mac
   * @memberof ImageAsset
   * @instance
   */
  ImageAsset.prototype.mac = $util.newBuffer([]);

  /**
   * ImageAsset sha256.
   * @member {Uint8Array} sha256
   * @memberof ImageAsset
   * @instance
   */
  ImageAsset.prototype.sha256 = $util.newBuffer([]);

  /**
   * Creates a new ImageAsset instance using the specified properties.
   * @function create
   * @memberof ImageAsset
   * @static
   * @param {IImageAsset=} [properties] Properties to set
   * @returns {ImageAsset} ImageAsset instance
   */
  ImageAsset.create = function create(properties) {
    return new ImageAsset(properties);
  };

  /**
   * Encodes the specified ImageAsset message. Does not implicitly {@link ImageAsset.verify|verify} messages.
   * @function encode
   * @memberof ImageAsset
   * @static
   * @param {IImageAsset} message ImageAsset message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  ImageAsset.encode = function encode(message, writer) {
    if (!writer) {
      writer = $Writer.create();
    }
    writer.uint32(/* id 1, wireType 2 =*/ 10).string(message.tag);
    writer.uint32(/* id 2, wireType 0 =*/ 16).int32(message.width);
    writer.uint32(/* id 3, wireType 0 =*/ 24).int32(message.height);
    writer.uint32(/* id 4, wireType 0 =*/ 32).int32(message.originalWidth);
    writer.uint32(/* id 5, wireType 0 =*/ 40).int32(message.originalHeight);
    writer.uint32(/* id 6, wireType 2 =*/ 50).string(message.mimeType);
    writer.uint32(/* id 7, wireType 0 =*/ 56).int32(message.size);
    if (message.otrKey != null && message.hasOwnProperty('otrKey')) {
      writer.uint32(/* id 8, wireType 2 =*/ 66).bytes(message.otrKey);
    }
    if (message.macKey != null && message.hasOwnProperty('macKey')) {
      writer.uint32(/* id 9, wireType 2 =*/ 74).bytes(message.macKey);
    }
    if (message.mac != null && message.hasOwnProperty('mac')) {
      writer.uint32(/* id 10, wireType 2 =*/ 82).bytes(message.mac);
    }
    if (message.sha256 != null && message.hasOwnProperty('sha256')) {
      writer.uint32(/* id 11, wireType 2 =*/ 90).bytes(message.sha256);
    }
    return writer;
  };

  /**
   * Encodes the specified ImageAsset message, length delimited. Does not implicitly {@link ImageAsset.verify|verify} messages.
   * @function encodeDelimited
   * @memberof ImageAsset
   * @static
   * @param {IImageAsset} message ImageAsset message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  ImageAsset.encodeDelimited = function encodeDelimited(message, writer) {
    return this.encode(message, writer).ldelim();
  };

  /**
   * Decodes an ImageAsset message from the specified reader or buffer.
   * @function decode
   * @memberof ImageAsset
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @param {number} [length] Message length if known beforehand
   * @returns {ImageAsset} ImageAsset
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  ImageAsset.decode = function decode(reader, length) {
    if (!(reader instanceof $Reader)) {
      reader = $Reader.create(reader);
    }
    const end = length === undefined ? reader.len : reader.pos + length;

    const message = new $root.ImageAsset();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.tag = reader.string();
          break;
        case 2:
          message.width = reader.int32();
          break;
        case 3:
          message.height = reader.int32();
          break;
        case 4:
          message.originalWidth = reader.int32();
          break;
        case 5:
          message.originalHeight = reader.int32();
          break;
        case 6:
          message.mimeType = reader.string();
          break;
        case 7:
          message.size = reader.int32();
          break;
        case 8:
          message.otrKey = reader.bytes();
          break;
        case 9:
          message.macKey = reader.bytes();
          break;
        case 10:
          message.mac = reader.bytes();
          break;
        case 11:
          message.sha256 = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    if (!message.hasOwnProperty('tag')) {
      throw $util.ProtocolError("missing required 'tag'", {instance: message});
    }
    if (!message.hasOwnProperty('width')) {
      throw $util.ProtocolError("missing required 'width'", {instance: message});
    }
    if (!message.hasOwnProperty('height')) {
      throw $util.ProtocolError("missing required 'height'", {instance: message});
    }
    if (!message.hasOwnProperty('originalWidth')) {
      throw $util.ProtocolError("missing required 'originalWidth'", {instance: message});
    }
    if (!message.hasOwnProperty('originalHeight')) {
      throw $util.ProtocolError("missing required 'originalHeight'", {instance: message});
    }
    if (!message.hasOwnProperty('mimeType')) {
      throw $util.ProtocolError("missing required 'mimeType'", {instance: message});
    }
    if (!message.hasOwnProperty('size')) {
      throw $util.ProtocolError("missing required 'size'", {instance: message});
    }
    return message;
  };

  /**
   * Decodes an ImageAsset message from the specified reader or buffer, length delimited.
   * @function decodeDelimited
   * @memberof ImageAsset
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @returns {ImageAsset} ImageAsset
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  ImageAsset.decodeDelimited = function decodeDelimited(reader) {
    if (!(reader instanceof $Reader)) {
      reader = new $Reader(reader);
    }
    return this.decode(reader, reader.uint32());
  };

  /**
   * Verifies an ImageAsset message.
   * @function verify
   * @memberof ImageAsset
   * @static
   * @param {Object.<string,*>} message Plain object to verify
   * @returns {string|null} `null` if valid, otherwise the reason why it is not
   */
  ImageAsset.verify = function verify(message) {
    if (typeof message !== 'object' || message === null) {
      return 'object expected';
    }
    if (!$util.isString(message.tag)) {
      return 'tag: string expected';
    }
    if (!$util.isInteger(message.width)) {
      return 'width: integer expected';
    }
    if (!$util.isInteger(message.height)) {
      return 'height: integer expected';
    }
    if (!$util.isInteger(message.originalWidth)) {
      return 'originalWidth: integer expected';
    }
    if (!$util.isInteger(message.originalHeight)) {
      return 'originalHeight: integer expected';
    }
    if (!$util.isString(message.mimeType)) {
      return 'mimeType: string expected';
    }
    if (!$util.isInteger(message.size)) {
      return 'size: integer expected';
    }
    if (message.otrKey != null && message.hasOwnProperty('otrKey')) {
      if (!((message.otrKey && typeof message.otrKey.length === 'number') || $util.isString(message.otrKey))) {
        return 'otrKey: buffer expected';
      }
    }
    if (message.macKey != null && message.hasOwnProperty('macKey')) {
      if (!((message.macKey && typeof message.macKey.length === 'number') || $util.isString(message.macKey))) {
        return 'macKey: buffer expected';
      }
    }
    if (message.mac != null && message.hasOwnProperty('mac')) {
      if (!((message.mac && typeof message.mac.length === 'number') || $util.isString(message.mac))) {
        return 'mac: buffer expected';
      }
    }
    if (message.sha256 != null && message.hasOwnProperty('sha256')) {
      if (!((message.sha256 && typeof message.sha256.length === 'number') || $util.isString(message.sha256))) {
        return 'sha256: buffer expected';
      }
    }
    return null;
  };

  /**
   * Creates an ImageAsset message from a plain object. Also converts values to their respective internal types.
   * @function fromObject
   * @memberof ImageAsset
   * @static
   * @param {Object.<string,*>} object Plain object
   * @returns {ImageAsset} ImageAsset
   */
  ImageAsset.fromObject = function fromObject(object) {
    if (object instanceof $root.ImageAsset) {
      return object;
    }
    const message = new $root.ImageAsset();
    if (object.tag != null) {
      message.tag = String(object.tag);
    }
    if (object.width != null) {
      message.width = object.width | 0;
    }
    if (object.height != null) {
      message.height = object.height | 0;
    }
    if (object.originalWidth != null) {
      message.originalWidth = object.originalWidth | 0;
    }
    if (object.originalHeight != null) {
      message.originalHeight = object.originalHeight | 0;
    }
    if (object.mimeType != null) {
      message.mimeType = String(object.mimeType);
    }
    if (object.size != null) {
      message.size = object.size | 0;
    }
    if (object.otrKey != null) {
      if (typeof object.otrKey === 'string') {
        $util.base64.decode(object.otrKey, (message.otrKey = $util.newBuffer($util.base64.length(object.otrKey))), 0);
      } else if (object.otrKey.length) {
        message.otrKey = object.otrKey;
      }
    }
    if (object.macKey != null) {
      if (typeof object.macKey === 'string') {
        $util.base64.decode(object.macKey, (message.macKey = $util.newBuffer($util.base64.length(object.macKey))), 0);
      } else if (object.macKey.length) {
        message.macKey = object.macKey;
      }
    }
    if (object.mac != null) {
      if (typeof object.mac === 'string') {
        $util.base64.decode(object.mac, (message.mac = $util.newBuffer($util.base64.length(object.mac))), 0);
      } else if (object.mac.length) {
        message.mac = object.mac;
      }
    }
    if (object.sha256 != null) {
      if (typeof object.sha256 === 'string') {
        $util.base64.decode(object.sha256, (message.sha256 = $util.newBuffer($util.base64.length(object.sha256))), 0);
      } else if (object.sha256.length) {
        message.sha256 = object.sha256;
      }
    }
    return message;
  };

  /**
   * Creates a plain object from an ImageAsset message. Also converts values to other types if specified.
   * @function toObject
   * @memberof ImageAsset
   * @static
   * @param {ImageAsset} message ImageAsset
   * @param {$protobuf.IConversionOptions} [options] Conversion options
   * @returns {Object.<string,*>} Plain object
   */
  ImageAsset.toObject = function toObject(message, options) {
    if (!options) {
      options = {};
    }
    const object = {};
    if (options.defaults) {
      object.tag = '';
      object.width = 0;
      object.height = 0;
      object.originalWidth = 0;
      object.originalHeight = 0;
      object.mimeType = '';
      object.size = 0;
      object.otrKey = options.bytes === String ? '' : [];
      object.macKey = options.bytes === String ? '' : [];
      object.mac = options.bytes === String ? '' : [];
      object.sha256 = options.bytes === String ? '' : [];
    }
    if (message.tag != null && message.hasOwnProperty('tag')) {
      object.tag = message.tag;
    }
    if (message.width != null && message.hasOwnProperty('width')) {
      object.width = message.width;
    }
    if (message.height != null && message.hasOwnProperty('height')) {
      object.height = message.height;
    }
    if (message.originalWidth != null && message.hasOwnProperty('originalWidth')) {
      object.originalWidth = message.originalWidth;
    }
    if (message.originalHeight != null && message.hasOwnProperty('originalHeight')) {
      object.originalHeight = message.originalHeight;
    }
    if (message.mimeType != null && message.hasOwnProperty('mimeType')) {
      object.mimeType = message.mimeType;
    }
    if (message.size != null && message.hasOwnProperty('size')) {
      object.size = message.size;
    }
    if (message.otrKey != null && message.hasOwnProperty('otrKey')) {
      object.otrKey =
        options.bytes === String
          ? $util.base64.encode(message.otrKey, 0, message.otrKey.length)
          : options.bytes === Array
            ? Array.prototype.slice.call(message.otrKey)
            : message.otrKey;
    }
    if (message.macKey != null && message.hasOwnProperty('macKey')) {
      object.macKey =
        options.bytes === String
          ? $util.base64.encode(message.macKey, 0, message.macKey.length)
          : options.bytes === Array
            ? Array.prototype.slice.call(message.macKey)
            : message.macKey;
    }
    if (message.mac != null && message.hasOwnProperty('mac')) {
      object.mac =
        options.bytes === String
          ? $util.base64.encode(message.mac, 0, message.mac.length)
          : options.bytes === Array
            ? Array.prototype.slice.call(message.mac)
            : message.mac;
    }
    if (message.sha256 != null && message.hasOwnProperty('sha256')) {
      object.sha256 =
        options.bytes === String
          ? $util.base64.encode(message.sha256, 0, message.sha256.length)
          : options.bytes === Array
            ? Array.prototype.slice.call(message.sha256)
            : message.sha256;
    }
    return object;
  };

  /**
   * Converts this ImageAsset to JSON.
   * @function toJSON
   * @memberof ImageAsset
   * @instance
   * @returns {Object.<string,*>} JSON object
   */
  ImageAsset.prototype.toJSON = function toJSON() {
    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
  };

  return ImageAsset;
})();

$root.Asset = (function() {
  /**
   * Properties of an Asset.
   * @exports IAsset
   * @interface IAsset
   * @property {Asset.IOriginal|null} [original] Asset original
   * @property {Asset.NotUploaded|null} [notUploaded] Asset notUploaded
   * @property {Asset.IRemoteData|null} [uploaded] Asset uploaded
   * @property {Asset.IPreview|null} [preview] Asset preview
   */

  /**
   * Constructs a new Asset.
   * @exports Asset
   * @classdesc Represents an Asset.
   * @implements IAsset
   * @constructor
   * @param {IAsset=} [properties] Properties to set
   */
  function Asset(properties) {
    if (properties) {
      for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i) {
        if (properties[keys[i]] != null) {
          this[keys[i]] = properties[keys[i]];
        }
      }
    }
  }

  /**
   * Asset original.
   * @member {Asset.IOriginal|null|undefined} original
   * @memberof Asset
   * @instance
   */
  Asset.prototype.original = null;

  /**
   * Asset notUploaded.
   * @member {Asset.NotUploaded} notUploaded
   * @memberof Asset
   * @instance
   */
  Asset.prototype.notUploaded = 0;

  /**
   * Asset uploaded.
   * @member {Asset.IRemoteData|null|undefined} uploaded
   * @memberof Asset
   * @instance
   */
  Asset.prototype.uploaded = null;

  /**
   * Asset preview.
   * @member {Asset.IPreview|null|undefined} preview
   * @memberof Asset
   * @instance
   */
  Asset.prototype.preview = null;

  // OneOf field names bound to virtual getters and setters
  let $oneOfFields;

  /**
   * Asset status.
   * @member {"notUploaded"|"uploaded"|undefined} status
   * @memberof Asset
   * @instance
   */
  Object.defineProperty(Asset.prototype, 'status', {
    get: $util.oneOfGetter(($oneOfFields = ['notUploaded', 'uploaded'])),
    set: $util.oneOfSetter($oneOfFields),
  });

  /**
   * Creates a new Asset instance using the specified properties.
   * @function create
   * @memberof Asset
   * @static
   * @param {IAsset=} [properties] Properties to set
   * @returns {Asset} Asset instance
   */
  Asset.create = function create(properties) {
    return new Asset(properties);
  };

  /**
   * Encodes the specified Asset message. Does not implicitly {@link Asset.verify|verify} messages.
   * @function encode
   * @memberof Asset
   * @static
   * @param {IAsset} message Asset message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  Asset.encode = function encode(message, writer) {
    if (!writer) {
      writer = $Writer.create();
    }
    if (message.original != null && message.hasOwnProperty('original')) {
      $root.Asset.Original.encode(message.original, writer.uint32(/* id 1, wireType 2 =*/ 10).fork()).ldelim();
    }
    if (message.notUploaded != null && message.hasOwnProperty('notUploaded')) {
      writer.uint32(/* id 3, wireType 0 =*/ 24).int32(message.notUploaded);
    }
    if (message.uploaded != null && message.hasOwnProperty('uploaded')) {
      $root.Asset.RemoteData.encode(message.uploaded, writer.uint32(/* id 4, wireType 2 =*/ 34).fork()).ldelim();
    }
    if (message.preview != null && message.hasOwnProperty('preview')) {
      $root.Asset.Preview.encode(message.preview, writer.uint32(/* id 5, wireType 2 =*/ 42).fork()).ldelim();
    }
    return writer;
  };

  /**
   * Encodes the specified Asset message, length delimited. Does not implicitly {@link Asset.verify|verify} messages.
   * @function encodeDelimited
   * @memberof Asset
   * @static
   * @param {IAsset} message Asset message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  Asset.encodeDelimited = function encodeDelimited(message, writer) {
    return this.encode(message, writer).ldelim();
  };

  /**
   * Decodes an Asset message from the specified reader or buffer.
   * @function decode
   * @memberof Asset
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @param {number} [length] Message length if known beforehand
   * @returns {Asset} Asset
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  Asset.decode = function decode(reader, length) {
    if (!(reader instanceof $Reader)) {
      reader = $Reader.create(reader);
    }
    const end = length === undefined ? reader.len : reader.pos + length;

    const message = new $root.Asset();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.original = $root.Asset.Original.decode(reader, reader.uint32());
          break;
        case 3:
          message.notUploaded = reader.int32();
          break;
        case 4:
          message.uploaded = $root.Asset.RemoteData.decode(reader, reader.uint32());
          break;
        case 5:
          message.preview = $root.Asset.Preview.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  };

  /**
   * Decodes an Asset message from the specified reader or buffer, length delimited.
   * @function decodeDelimited
   * @memberof Asset
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @returns {Asset} Asset
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  Asset.decodeDelimited = function decodeDelimited(reader) {
    if (!(reader instanceof $Reader)) {
      reader = new $Reader(reader);
    }
    return this.decode(reader, reader.uint32());
  };

  /**
   * Verifies an Asset message.
   * @function verify
   * @memberof Asset
   * @static
   * @param {Object.<string,*>} message Plain object to verify
   * @returns {string|null} `null` if valid, otherwise the reason why it is not
   */
  Asset.verify = function verify(message) {
    if (typeof message !== 'object' || message === null) {
      return 'object expected';
    }
    const properties = {};
    if (message.original != null && message.hasOwnProperty('original')) {
      var error = $root.Asset.Original.verify(message.original);
      if (error) {
        return 'original.' + error;
      }
    }
    if (message.notUploaded != null && message.hasOwnProperty('notUploaded')) {
      properties.status = 1;
      switch (message.notUploaded) {
        default:
          return 'notUploaded: enum value expected';
        case 0:
        case 1:
          break;
      }
    }
    if (message.uploaded != null && message.hasOwnProperty('uploaded')) {
      if (properties.status === 1) {
        return 'status: multiple values';
      }
      properties.status = 1;
      {
        var error = $root.Asset.RemoteData.verify(message.uploaded);
        if (error) {
          return 'uploaded.' + error;
        }
      }
    }
    if (message.preview != null && message.hasOwnProperty('preview')) {
      var error = $root.Asset.Preview.verify(message.preview);
      if (error) {
        return 'preview.' + error;
      }
    }
    return null;
  };

  /**
   * Creates an Asset message from a plain object. Also converts values to their respective internal types.
   * @function fromObject
   * @memberof Asset
   * @static
   * @param {Object.<string,*>} object Plain object
   * @returns {Asset} Asset
   */
  Asset.fromObject = function fromObject(object) {
    if (object instanceof $root.Asset) {
      return object;
    }
    const message = new $root.Asset();
    if (object.original != null) {
      if (typeof object.original !== 'object') {
        throw TypeError('.Asset.original: object expected');
      }
      message.original = $root.Asset.Original.fromObject(object.original);
    }
    switch (object.notUploaded) {
      case 'CANCELLED':
      case 0:
        message.notUploaded = 0;
        break;
      case 'FAILED':
      case 1:
        message.notUploaded = 1;
        break;
    }
    if (object.uploaded != null) {
      if (typeof object.uploaded !== 'object') {
        throw TypeError('.Asset.uploaded: object expected');
      }
      message.uploaded = $root.Asset.RemoteData.fromObject(object.uploaded);
    }
    if (object.preview != null) {
      if (typeof object.preview !== 'object') {
        throw TypeError('.Asset.preview: object expected');
      }
      message.preview = $root.Asset.Preview.fromObject(object.preview);
    }
    return message;
  };

  /**
   * Creates a plain object from an Asset message. Also converts values to other types if specified.
   * @function toObject
   * @memberof Asset
   * @static
   * @param {Asset} message Asset
   * @param {$protobuf.IConversionOptions} [options] Conversion options
   * @returns {Object.<string,*>} Plain object
   */
  Asset.toObject = function toObject(message, options) {
    if (!options) {
      options = {};
    }
    const object = {};
    if (options.defaults) {
      object.original = null;
      object.preview = null;
    }
    if (message.original != null && message.hasOwnProperty('original')) {
      object.original = $root.Asset.Original.toObject(message.original, options);
    }
    if (message.notUploaded != null && message.hasOwnProperty('notUploaded')) {
      object.notUploaded =
        options.enums === String ? $root.Asset.NotUploaded[message.notUploaded] : message.notUploaded;
      if (options.oneofs) {
        object.status = 'notUploaded';
      }
    }
    if (message.uploaded != null && message.hasOwnProperty('uploaded')) {
      object.uploaded = $root.Asset.RemoteData.toObject(message.uploaded, options);
      if (options.oneofs) {
        object.status = 'uploaded';
      }
    }
    if (message.preview != null && message.hasOwnProperty('preview')) {
      object.preview = $root.Asset.Preview.toObject(message.preview, options);
    }
    return object;
  };

  /**
   * Converts this Asset to JSON.
   * @function toJSON
   * @memberof Asset
   * @instance
   * @returns {Object.<string,*>} JSON object
   */
  Asset.prototype.toJSON = function toJSON() {
    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
  };

  Asset.Original = (function() {
    /**
     * Properties of an Original.
     * @memberof Asset
     * @interface IOriginal
     * @property {string} mimeType Original mimeType
     * @property {number|Long} size Original size
     * @property {string|null} [name] Original name
     * @property {Asset.IImageMetaData|null} [image] Original image
     * @property {Asset.IVideoMetaData|null} [video] Original video
     * @property {Asset.IAudioMetaData|null} [audio] Original audio
     * @property {string|null} [source] Original source
     * @property {string|null} [caption] Original caption
     */

    /**
     * Constructs a new Original.
     * @memberof Asset
     * @classdesc Represents an Original.
     * @implements IOriginal
     * @constructor
     * @param {Asset.IOriginal=} [properties] Properties to set
     */
    function Original(properties) {
      if (properties) {
        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i) {
          if (properties[keys[i]] != null) {
            this[keys[i]] = properties[keys[i]];
          }
        }
      }
    }

    /**
     * Original mimeType.
     * @member {string} mimeType
     * @memberof Asset.Original
     * @instance
     */
    Original.prototype.mimeType = '';

    /**
     * Original size.
     * @member {number|Long} size
     * @memberof Asset.Original
     * @instance
     */
    Original.prototype.size = $util.Long ? $util.Long.fromBits(0, 0, true) : 0;

    /**
     * Original name.
     * @member {string} name
     * @memberof Asset.Original
     * @instance
     */
    Original.prototype.name = '';

    /**
     * Original image.
     * @member {Asset.IImageMetaData|null|undefined} image
     * @memberof Asset.Original
     * @instance
     */
    Original.prototype.image = null;

    /**
     * Original video.
     * @member {Asset.IVideoMetaData|null|undefined} video
     * @memberof Asset.Original
     * @instance
     */
    Original.prototype.video = null;

    /**
     * Original audio.
     * @member {Asset.IAudioMetaData|null|undefined} audio
     * @memberof Asset.Original
     * @instance
     */
    Original.prototype.audio = null;

    /**
     * Original source.
     * @member {string} source
     * @memberof Asset.Original
     * @instance
     */
    Original.prototype.source = '';

    /**
     * Original caption.
     * @member {string} caption
     * @memberof Asset.Original
     * @instance
     */
    Original.prototype.caption = '';

    // OneOf field names bound to virtual getters and setters
    let $oneOfFields;

    /**
     * Original metaData.
     * @member {"image"|"video"|"audio"|undefined} metaData
     * @memberof Asset.Original
     * @instance
     */
    Object.defineProperty(Original.prototype, 'metaData', {
      get: $util.oneOfGetter(($oneOfFields = ['image', 'video', 'audio'])),
      set: $util.oneOfSetter($oneOfFields),
    });

    /**
     * Creates a new Original instance using the specified properties.
     * @function create
     * @memberof Asset.Original
     * @static
     * @param {Asset.IOriginal=} [properties] Properties to set
     * @returns {Asset.Original} Original instance
     */
    Original.create = function create(properties) {
      return new Original(properties);
    };

    /**
     * Encodes the specified Original message. Does not implicitly {@link Asset.Original.verify|verify} messages.
     * @function encode
     * @memberof Asset.Original
     * @static
     * @param {Asset.IOriginal} message Original message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Original.encode = function encode(message, writer) {
      if (!writer) {
        writer = $Writer.create();
      }
      writer.uint32(/* id 1, wireType 2 =*/ 10).string(message.mimeType);
      writer.uint32(/* id 2, wireType 0 =*/ 16).uint64(message.size);
      if (message.name != null && message.hasOwnProperty('name')) {
        writer.uint32(/* id 3, wireType 2 =*/ 26).string(message.name);
      }
      if (message.image != null && message.hasOwnProperty('image')) {
        $root.Asset.ImageMetaData.encode(message.image, writer.uint32(/* id 4, wireType 2 =*/ 34).fork()).ldelim();
      }
      if (message.video != null && message.hasOwnProperty('video')) {
        $root.Asset.VideoMetaData.encode(message.video, writer.uint32(/* id 5, wireType 2 =*/ 42).fork()).ldelim();
      }
      if (message.audio != null && message.hasOwnProperty('audio')) {
        $root.Asset.AudioMetaData.encode(message.audio, writer.uint32(/* id 6, wireType 2 =*/ 50).fork()).ldelim();
      }
      if (message.source != null && message.hasOwnProperty('source')) {
        writer.uint32(/* id 7, wireType 2 =*/ 58).string(message.source);
      }
      if (message.caption != null && message.hasOwnProperty('caption')) {
        writer.uint32(/* id 8, wireType 2 =*/ 66).string(message.caption);
      }
      return writer;
    };

    /**
     * Encodes the specified Original message, length delimited. Does not implicitly {@link Asset.Original.verify|verify} messages.
     * @function encodeDelimited
     * @memberof Asset.Original
     * @static
     * @param {Asset.IOriginal} message Original message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Original.encodeDelimited = function encodeDelimited(message, writer) {
      return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes an Original message from the specified reader or buffer.
     * @function decode
     * @memberof Asset.Original
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {Asset.Original} Original
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Original.decode = function decode(reader, length) {
      if (!(reader instanceof $Reader)) {
        reader = $Reader.create(reader);
      }
      const end = length === undefined ? reader.len : reader.pos + length;

      const message = new $root.Asset.Original();
      while (reader.pos < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.mimeType = reader.string();
            break;
          case 2:
            message.size = reader.uint64();
            break;
          case 3:
            message.name = reader.string();
            break;
          case 4:
            message.image = $root.Asset.ImageMetaData.decode(reader, reader.uint32());
            break;
          case 5:
            message.video = $root.Asset.VideoMetaData.decode(reader, reader.uint32());
            break;
          case 6:
            message.audio = $root.Asset.AudioMetaData.decode(reader, reader.uint32());
            break;
          case 7:
            message.source = reader.string();
            break;
          case 8:
            message.caption = reader.string();
            break;
          default:
            reader.skipType(tag & 7);
            break;
        }
      }
      if (!message.hasOwnProperty('mimeType')) {
        throw $util.ProtocolError("missing required 'mimeType'", {instance: message});
      }
      if (!message.hasOwnProperty('size')) {
        throw $util.ProtocolError("missing required 'size'", {instance: message});
      }
      return message;
    };

    /**
     * Decodes an Original message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof Asset.Original
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {Asset.Original} Original
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Original.decodeDelimited = function decodeDelimited(reader) {
      if (!(reader instanceof $Reader)) {
        reader = new $Reader(reader);
      }
      return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies an Original message.
     * @function verify
     * @memberof Asset.Original
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    Original.verify = function verify(message) {
      if (typeof message !== 'object' || message === null) {
        return 'object expected';
      }
      const properties = {};
      if (!$util.isString(message.mimeType)) {
        return 'mimeType: string expected';
      }
      if (
        !$util.isInteger(message.size) &&
        !(message.size && $util.isInteger(message.size.low) && $util.isInteger(message.size.high))
      ) {
        return 'size: integer|Long expected';
      }
      if (message.name != null && message.hasOwnProperty('name')) {
        if (!$util.isString(message.name)) {
          return 'name: string expected';
        }
      }
      if (message.image != null && message.hasOwnProperty('image')) {
        properties.metaData = 1;
        {
          var error = $root.Asset.ImageMetaData.verify(message.image);
          if (error) {
            return 'image.' + error;
          }
        }
      }
      if (message.video != null && message.hasOwnProperty('video')) {
        if (properties.metaData === 1) {
          return 'metaData: multiple values';
        }
        properties.metaData = 1;
        {
          var error = $root.Asset.VideoMetaData.verify(message.video);
          if (error) {
            return 'video.' + error;
          }
        }
      }
      if (message.audio != null && message.hasOwnProperty('audio')) {
        if (properties.metaData === 1) {
          return 'metaData: multiple values';
        }
        properties.metaData = 1;
        {
          var error = $root.Asset.AudioMetaData.verify(message.audio);
          if (error) {
            return 'audio.' + error;
          }
        }
      }
      if (message.source != null && message.hasOwnProperty('source')) {
        if (!$util.isString(message.source)) {
          return 'source: string expected';
        }
      }
      if (message.caption != null && message.hasOwnProperty('caption')) {
        if (!$util.isString(message.caption)) {
          return 'caption: string expected';
        }
      }
      return null;
    };

    /**
     * Creates an Original message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof Asset.Original
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {Asset.Original} Original
     */
    Original.fromObject = function fromObject(object) {
      if (object instanceof $root.Asset.Original) {
        return object;
      }
      const message = new $root.Asset.Original();
      if (object.mimeType != null) {
        message.mimeType = String(object.mimeType);
      }
      if (object.size != null) {
        if ($util.Long) {
          (message.size = $util.Long.fromValue(object.size)).unsigned = true;
        } else if (typeof object.size === 'string') {
          message.size = parseInt(object.size, 10);
        } else if (typeof object.size === 'number') {
          message.size = object.size;
        } else if (typeof object.size === 'object') {
          message.size = new $util.LongBits(object.size.low >>> 0, object.size.high >>> 0).toNumber(true);
        }
      }
      if (object.name != null) {
        message.name = String(object.name);
      }
      if (object.image != null) {
        if (typeof object.image !== 'object') {
          throw TypeError('.Asset.Original.image: object expected');
        }
        message.image = $root.Asset.ImageMetaData.fromObject(object.image);
      }
      if (object.video != null) {
        if (typeof object.video !== 'object') {
          throw TypeError('.Asset.Original.video: object expected');
        }
        message.video = $root.Asset.VideoMetaData.fromObject(object.video);
      }
      if (object.audio != null) {
        if (typeof object.audio !== 'object') {
          throw TypeError('.Asset.Original.audio: object expected');
        }
        message.audio = $root.Asset.AudioMetaData.fromObject(object.audio);
      }
      if (object.source != null) {
        message.source = String(object.source);
      }
      if (object.caption != null) {
        message.caption = String(object.caption);
      }
      return message;
    };

    /**
     * Creates a plain object from an Original message. Also converts values to other types if specified.
     * @function toObject
     * @memberof Asset.Original
     * @static
     * @param {Asset.Original} message Original
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    Original.toObject = function toObject(message, options) {
      if (!options) {
        options = {};
      }
      const object = {};
      if (options.defaults) {
        object.mimeType = '';
        if ($util.Long) {
          const long = new $util.Long(0, 0, true);
          object.size = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
        } else {
          object.size = options.longs === String ? '0' : 0;
        }
        object.name = '';
        object.source = '';
        object.caption = '';
      }
      if (message.mimeType != null && message.hasOwnProperty('mimeType')) {
        object.mimeType = message.mimeType;
      }
      if (message.size != null && message.hasOwnProperty('size')) {
        if (typeof message.size === 'number') {
          object.size = options.longs === String ? String(message.size) : message.size;
        } else {
          object.size =
            options.longs === String
              ? $util.Long.prototype.toString.call(message.size)
              : options.longs === Number
                ? new $util.LongBits(message.size.low >>> 0, message.size.high >>> 0).toNumber(true)
                : message.size;
        }
      }
      if (message.name != null && message.hasOwnProperty('name')) {
        object.name = message.name;
      }
      if (message.image != null && message.hasOwnProperty('image')) {
        object.image = $root.Asset.ImageMetaData.toObject(message.image, options);
        if (options.oneofs) {
          object.metaData = 'image';
        }
      }
      if (message.video != null && message.hasOwnProperty('video')) {
        object.video = $root.Asset.VideoMetaData.toObject(message.video, options);
        if (options.oneofs) {
          object.metaData = 'video';
        }
      }
      if (message.audio != null && message.hasOwnProperty('audio')) {
        object.audio = $root.Asset.AudioMetaData.toObject(message.audio, options);
        if (options.oneofs) {
          object.metaData = 'audio';
        }
      }
      if (message.source != null && message.hasOwnProperty('source')) {
        object.source = message.source;
      }
      if (message.caption != null && message.hasOwnProperty('caption')) {
        object.caption = message.caption;
      }
      return object;
    };

    /**
     * Converts this Original to JSON.
     * @function toJSON
     * @memberof Asset.Original
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    Original.prototype.toJSON = function toJSON() {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    return Original;
  })();

  Asset.Preview = (function() {
    /**
     * Properties of a Preview.
     * @memberof Asset
     * @interface IPreview
     * @property {string} mimeType Preview mimeType
     * @property {number|Long} size Preview size
     * @property {Asset.IRemoteData|null} [remote] Preview remote
     * @property {Asset.IImageMetaData|null} [image] Preview image
     */

    /**
     * Constructs a new Preview.
     * @memberof Asset
     * @classdesc Represents a Preview.
     * @implements IPreview
     * @constructor
     * @param {Asset.IPreview=} [properties] Properties to set
     */
    function Preview(properties) {
      if (properties) {
        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i) {
          if (properties[keys[i]] != null) {
            this[keys[i]] = properties[keys[i]];
          }
        }
      }
    }

    /**
     * Preview mimeType.
     * @member {string} mimeType
     * @memberof Asset.Preview
     * @instance
     */
    Preview.prototype.mimeType = '';

    /**
     * Preview size.
     * @member {number|Long} size
     * @memberof Asset.Preview
     * @instance
     */
    Preview.prototype.size = $util.Long ? $util.Long.fromBits(0, 0, true) : 0;

    /**
     * Preview remote.
     * @member {Asset.IRemoteData|null|undefined} remote
     * @memberof Asset.Preview
     * @instance
     */
    Preview.prototype.remote = null;

    /**
     * Preview image.
     * @member {Asset.IImageMetaData|null|undefined} image
     * @memberof Asset.Preview
     * @instance
     */
    Preview.prototype.image = null;

    // OneOf field names bound to virtual getters and setters
    let $oneOfFields;

    /**
     * Preview metaData.
     * @member {"image"|undefined} metaData
     * @memberof Asset.Preview
     * @instance
     */
    Object.defineProperty(Preview.prototype, 'metaData', {
      get: $util.oneOfGetter(($oneOfFields = ['image'])),
      set: $util.oneOfSetter($oneOfFields),
    });

    /**
     * Creates a new Preview instance using the specified properties.
     * @function create
     * @memberof Asset.Preview
     * @static
     * @param {Asset.IPreview=} [properties] Properties to set
     * @returns {Asset.Preview} Preview instance
     */
    Preview.create = function create(properties) {
      return new Preview(properties);
    };

    /**
     * Encodes the specified Preview message. Does not implicitly {@link Asset.Preview.verify|verify} messages.
     * @function encode
     * @memberof Asset.Preview
     * @static
     * @param {Asset.IPreview} message Preview message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Preview.encode = function encode(message, writer) {
      if (!writer) {
        writer = $Writer.create();
      }
      writer.uint32(/* id 1, wireType 2 =*/ 10).string(message.mimeType);
      writer.uint32(/* id 2, wireType 0 =*/ 16).uint64(message.size);
      if (message.remote != null && message.hasOwnProperty('remote')) {
        $root.Asset.RemoteData.encode(message.remote, writer.uint32(/* id 3, wireType 2 =*/ 26).fork()).ldelim();
      }
      if (message.image != null && message.hasOwnProperty('image')) {
        $root.Asset.ImageMetaData.encode(message.image, writer.uint32(/* id 4, wireType 2 =*/ 34).fork()).ldelim();
      }
      return writer;
    };

    /**
     * Encodes the specified Preview message, length delimited. Does not implicitly {@link Asset.Preview.verify|verify} messages.
     * @function encodeDelimited
     * @memberof Asset.Preview
     * @static
     * @param {Asset.IPreview} message Preview message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Preview.encodeDelimited = function encodeDelimited(message, writer) {
      return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a Preview message from the specified reader or buffer.
     * @function decode
     * @memberof Asset.Preview
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {Asset.Preview} Preview
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Preview.decode = function decode(reader, length) {
      if (!(reader instanceof $Reader)) {
        reader = $Reader.create(reader);
      }
      const end = length === undefined ? reader.len : reader.pos + length;

      const message = new $root.Asset.Preview();
      while (reader.pos < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.mimeType = reader.string();
            break;
          case 2:
            message.size = reader.uint64();
            break;
          case 3:
            message.remote = $root.Asset.RemoteData.decode(reader, reader.uint32());
            break;
          case 4:
            message.image = $root.Asset.ImageMetaData.decode(reader, reader.uint32());
            break;
          default:
            reader.skipType(tag & 7);
            break;
        }
      }
      if (!message.hasOwnProperty('mimeType')) {
        throw $util.ProtocolError("missing required 'mimeType'", {instance: message});
      }
      if (!message.hasOwnProperty('size')) {
        throw $util.ProtocolError("missing required 'size'", {instance: message});
      }
      return message;
    };

    /**
     * Decodes a Preview message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof Asset.Preview
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {Asset.Preview} Preview
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Preview.decodeDelimited = function decodeDelimited(reader) {
      if (!(reader instanceof $Reader)) {
        reader = new $Reader(reader);
      }
      return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a Preview message.
     * @function verify
     * @memberof Asset.Preview
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    Preview.verify = function verify(message) {
      if (typeof message !== 'object' || message === null) {
        return 'object expected';
      }
      const properties = {};
      if (!$util.isString(message.mimeType)) {
        return 'mimeType: string expected';
      }
      if (
        !$util.isInteger(message.size) &&
        !(message.size && $util.isInteger(message.size.low) && $util.isInteger(message.size.high))
      ) {
        return 'size: integer|Long expected';
      }
      if (message.remote != null && message.hasOwnProperty('remote')) {
        var error = $root.Asset.RemoteData.verify(message.remote);
        if (error) {
          return 'remote.' + error;
        }
      }
      if (message.image != null && message.hasOwnProperty('image')) {
        properties.metaData = 1;
        {
          var error = $root.Asset.ImageMetaData.verify(message.image);
          if (error) {
            return 'image.' + error;
          }
        }
      }
      return null;
    };

    /**
     * Creates a Preview message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof Asset.Preview
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {Asset.Preview} Preview
     */
    Preview.fromObject = function fromObject(object) {
      if (object instanceof $root.Asset.Preview) {
        return object;
      }
      const message = new $root.Asset.Preview();
      if (object.mimeType != null) {
        message.mimeType = String(object.mimeType);
      }
      if (object.size != null) {
        if ($util.Long) {
          (message.size = $util.Long.fromValue(object.size)).unsigned = true;
        } else if (typeof object.size === 'string') {
          message.size = parseInt(object.size, 10);
        } else if (typeof object.size === 'number') {
          message.size = object.size;
        } else if (typeof object.size === 'object') {
          message.size = new $util.LongBits(object.size.low >>> 0, object.size.high >>> 0).toNumber(true);
        }
      }
      if (object.remote != null) {
        if (typeof object.remote !== 'object') {
          throw TypeError('.Asset.Preview.remote: object expected');
        }
        message.remote = $root.Asset.RemoteData.fromObject(object.remote);
      }
      if (object.image != null) {
        if (typeof object.image !== 'object') {
          throw TypeError('.Asset.Preview.image: object expected');
        }
        message.image = $root.Asset.ImageMetaData.fromObject(object.image);
      }
      return message;
    };

    /**
     * Creates a plain object from a Preview message. Also converts values to other types if specified.
     * @function toObject
     * @memberof Asset.Preview
     * @static
     * @param {Asset.Preview} message Preview
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    Preview.toObject = function toObject(message, options) {
      if (!options) {
        options = {};
      }
      const object = {};
      if (options.defaults) {
        object.mimeType = '';
        if ($util.Long) {
          const long = new $util.Long(0, 0, true);
          object.size = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
        } else {
          object.size = options.longs === String ? '0' : 0;
        }
        object.remote = null;
      }
      if (message.mimeType != null && message.hasOwnProperty('mimeType')) {
        object.mimeType = message.mimeType;
      }
      if (message.size != null && message.hasOwnProperty('size')) {
        if (typeof message.size === 'number') {
          object.size = options.longs === String ? String(message.size) : message.size;
        } else {
          object.size =
            options.longs === String
              ? $util.Long.prototype.toString.call(message.size)
              : options.longs === Number
                ? new $util.LongBits(message.size.low >>> 0, message.size.high >>> 0).toNumber(true)
                : message.size;
        }
      }
      if (message.remote != null && message.hasOwnProperty('remote')) {
        object.remote = $root.Asset.RemoteData.toObject(message.remote, options);
      }
      if (message.image != null && message.hasOwnProperty('image')) {
        object.image = $root.Asset.ImageMetaData.toObject(message.image, options);
        if (options.oneofs) {
          object.metaData = 'image';
        }
      }
      return object;
    };

    /**
     * Converts this Preview to JSON.
     * @function toJSON
     * @memberof Asset.Preview
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    Preview.prototype.toJSON = function toJSON() {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    return Preview;
  })();

  Asset.ImageMetaData = (function() {
    /**
     * Properties of an ImageMetaData.
     * @memberof Asset
     * @interface IImageMetaData
     * @property {number} width ImageMetaData width
     * @property {number} height ImageMetaData height
     * @property {string|null} [tag] ImageMetaData tag
     */

    /**
     * Constructs a new ImageMetaData.
     * @memberof Asset
     * @classdesc Represents an ImageMetaData.
     * @implements IImageMetaData
     * @constructor
     * @param {Asset.IImageMetaData=} [properties] Properties to set
     */
    function ImageMetaData(properties) {
      if (properties) {
        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i) {
          if (properties[keys[i]] != null) {
            this[keys[i]] = properties[keys[i]];
          }
        }
      }
    }

    /**
     * ImageMetaData width.
     * @member {number} width
     * @memberof Asset.ImageMetaData
     * @instance
     */
    ImageMetaData.prototype.width = 0;

    /**
     * ImageMetaData height.
     * @member {number} height
     * @memberof Asset.ImageMetaData
     * @instance
     */
    ImageMetaData.prototype.height = 0;

    /**
     * ImageMetaData tag.
     * @member {string} tag
     * @memberof Asset.ImageMetaData
     * @instance
     */
    ImageMetaData.prototype.tag = '';

    /**
     * Creates a new ImageMetaData instance using the specified properties.
     * @function create
     * @memberof Asset.ImageMetaData
     * @static
     * @param {Asset.IImageMetaData=} [properties] Properties to set
     * @returns {Asset.ImageMetaData} ImageMetaData instance
     */
    ImageMetaData.create = function create(properties) {
      return new ImageMetaData(properties);
    };

    /**
     * Encodes the specified ImageMetaData message. Does not implicitly {@link Asset.ImageMetaData.verify|verify} messages.
     * @function encode
     * @memberof Asset.ImageMetaData
     * @static
     * @param {Asset.IImageMetaData} message ImageMetaData message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ImageMetaData.encode = function encode(message, writer) {
      if (!writer) {
        writer = $Writer.create();
      }
      writer.uint32(/* id 1, wireType 0 =*/ 8).int32(message.width);
      writer.uint32(/* id 2, wireType 0 =*/ 16).int32(message.height);
      if (message.tag != null && message.hasOwnProperty('tag')) {
        writer.uint32(/* id 3, wireType 2 =*/ 26).string(message.tag);
      }
      return writer;
    };

    /**
     * Encodes the specified ImageMetaData message, length delimited. Does not implicitly {@link Asset.ImageMetaData.verify|verify} messages.
     * @function encodeDelimited
     * @memberof Asset.ImageMetaData
     * @static
     * @param {Asset.IImageMetaData} message ImageMetaData message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ImageMetaData.encodeDelimited = function encodeDelimited(message, writer) {
      return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes an ImageMetaData message from the specified reader or buffer.
     * @function decode
     * @memberof Asset.ImageMetaData
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {Asset.ImageMetaData} ImageMetaData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ImageMetaData.decode = function decode(reader, length) {
      if (!(reader instanceof $Reader)) {
        reader = $Reader.create(reader);
      }
      const end = length === undefined ? reader.len : reader.pos + length;

      const message = new $root.Asset.ImageMetaData();
      while (reader.pos < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.width = reader.int32();
            break;
          case 2:
            message.height = reader.int32();
            break;
          case 3:
            message.tag = reader.string();
            break;
          default:
            reader.skipType(tag & 7);
            break;
        }
      }
      if (!message.hasOwnProperty('width')) {
        throw $util.ProtocolError("missing required 'width'", {instance: message});
      }
      if (!message.hasOwnProperty('height')) {
        throw $util.ProtocolError("missing required 'height'", {instance: message});
      }
      return message;
    };

    /**
     * Decodes an ImageMetaData message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof Asset.ImageMetaData
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {Asset.ImageMetaData} ImageMetaData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ImageMetaData.decodeDelimited = function decodeDelimited(reader) {
      if (!(reader instanceof $Reader)) {
        reader = new $Reader(reader);
      }
      return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies an ImageMetaData message.
     * @function verify
     * @memberof Asset.ImageMetaData
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    ImageMetaData.verify = function verify(message) {
      if (typeof message !== 'object' || message === null) {
        return 'object expected';
      }
      if (!$util.isInteger(message.width)) {
        return 'width: integer expected';
      }
      if (!$util.isInteger(message.height)) {
        return 'height: integer expected';
      }
      if (message.tag != null && message.hasOwnProperty('tag')) {
        if (!$util.isString(message.tag)) {
          return 'tag: string expected';
        }
      }
      return null;
    };

    /**
     * Creates an ImageMetaData message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof Asset.ImageMetaData
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {Asset.ImageMetaData} ImageMetaData
     */
    ImageMetaData.fromObject = function fromObject(object) {
      if (object instanceof $root.Asset.ImageMetaData) {
        return object;
      }
      const message = new $root.Asset.ImageMetaData();
      if (object.width != null) {
        message.width = object.width | 0;
      }
      if (object.height != null) {
        message.height = object.height | 0;
      }
      if (object.tag != null) {
        message.tag = String(object.tag);
      }
      return message;
    };

    /**
     * Creates a plain object from an ImageMetaData message. Also converts values to other types if specified.
     * @function toObject
     * @memberof Asset.ImageMetaData
     * @static
     * @param {Asset.ImageMetaData} message ImageMetaData
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    ImageMetaData.toObject = function toObject(message, options) {
      if (!options) {
        options = {};
      }
      const object = {};
      if (options.defaults) {
        object.width = 0;
        object.height = 0;
        object.tag = '';
      }
      if (message.width != null && message.hasOwnProperty('width')) {
        object.width = message.width;
      }
      if (message.height != null && message.hasOwnProperty('height')) {
        object.height = message.height;
      }
      if (message.tag != null && message.hasOwnProperty('tag')) {
        object.tag = message.tag;
      }
      return object;
    };

    /**
     * Converts this ImageMetaData to JSON.
     * @function toJSON
     * @memberof Asset.ImageMetaData
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    ImageMetaData.prototype.toJSON = function toJSON() {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    return ImageMetaData;
  })();

  Asset.VideoMetaData = (function() {
    /**
     * Properties of a VideoMetaData.
     * @memberof Asset
     * @interface IVideoMetaData
     * @property {number|null} [width] VideoMetaData width
     * @property {number|null} [height] VideoMetaData height
     * @property {number|Long|null} [durationInMillis] VideoMetaData durationInMillis
     */

    /**
     * Constructs a new VideoMetaData.
     * @memberof Asset
     * @classdesc Represents a VideoMetaData.
     * @implements IVideoMetaData
     * @constructor
     * @param {Asset.IVideoMetaData=} [properties] Properties to set
     */
    function VideoMetaData(properties) {
      if (properties) {
        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i) {
          if (properties[keys[i]] != null) {
            this[keys[i]] = properties[keys[i]];
          }
        }
      }
    }

    /**
     * VideoMetaData width.
     * @member {number} width
     * @memberof Asset.VideoMetaData
     * @instance
     */
    VideoMetaData.prototype.width = 0;

    /**
     * VideoMetaData height.
     * @member {number} height
     * @memberof Asset.VideoMetaData
     * @instance
     */
    VideoMetaData.prototype.height = 0;

    /**
     * VideoMetaData durationInMillis.
     * @member {number|Long} durationInMillis
     * @memberof Asset.VideoMetaData
     * @instance
     */
    VideoMetaData.prototype.durationInMillis = $util.Long ? $util.Long.fromBits(0, 0, true) : 0;

    /**
     * Creates a new VideoMetaData instance using the specified properties.
     * @function create
     * @memberof Asset.VideoMetaData
     * @static
     * @param {Asset.IVideoMetaData=} [properties] Properties to set
     * @returns {Asset.VideoMetaData} VideoMetaData instance
     */
    VideoMetaData.create = function create(properties) {
      return new VideoMetaData(properties);
    };

    /**
     * Encodes the specified VideoMetaData message. Does not implicitly {@link Asset.VideoMetaData.verify|verify} messages.
     * @function encode
     * @memberof Asset.VideoMetaData
     * @static
     * @param {Asset.IVideoMetaData} message VideoMetaData message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    VideoMetaData.encode = function encode(message, writer) {
      if (!writer) {
        writer = $Writer.create();
      }
      if (message.width != null && message.hasOwnProperty('width')) {
        writer.uint32(/* id 1, wireType 0 =*/ 8).int32(message.width);
      }
      if (message.height != null && message.hasOwnProperty('height')) {
        writer.uint32(/* id 2, wireType 0 =*/ 16).int32(message.height);
      }
      if (message.durationInMillis != null && message.hasOwnProperty('durationInMillis')) {
        writer.uint32(/* id 3, wireType 0 =*/ 24).uint64(message.durationInMillis);
      }
      return writer;
    };

    /**
     * Encodes the specified VideoMetaData message, length delimited. Does not implicitly {@link Asset.VideoMetaData.verify|verify} messages.
     * @function encodeDelimited
     * @memberof Asset.VideoMetaData
     * @static
     * @param {Asset.IVideoMetaData} message VideoMetaData message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    VideoMetaData.encodeDelimited = function encodeDelimited(message, writer) {
      return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a VideoMetaData message from the specified reader or buffer.
     * @function decode
     * @memberof Asset.VideoMetaData
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {Asset.VideoMetaData} VideoMetaData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    VideoMetaData.decode = function decode(reader, length) {
      if (!(reader instanceof $Reader)) {
        reader = $Reader.create(reader);
      }
      const end = length === undefined ? reader.len : reader.pos + length;

      const message = new $root.Asset.VideoMetaData();
      while (reader.pos < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.width = reader.int32();
            break;
          case 2:
            message.height = reader.int32();
            break;
          case 3:
            message.durationInMillis = reader.uint64();
            break;
          default:
            reader.skipType(tag & 7);
            break;
        }
      }
      return message;
    };

    /**
     * Decodes a VideoMetaData message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof Asset.VideoMetaData
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {Asset.VideoMetaData} VideoMetaData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    VideoMetaData.decodeDelimited = function decodeDelimited(reader) {
      if (!(reader instanceof $Reader)) {
        reader = new $Reader(reader);
      }
      return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a VideoMetaData message.
     * @function verify
     * @memberof Asset.VideoMetaData
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    VideoMetaData.verify = function verify(message) {
      if (typeof message !== 'object' || message === null) {
        return 'object expected';
      }
      if (message.width != null && message.hasOwnProperty('width')) {
        if (!$util.isInteger(message.width)) {
          return 'width: integer expected';
        }
      }
      if (message.height != null && message.hasOwnProperty('height')) {
        if (!$util.isInteger(message.height)) {
          return 'height: integer expected';
        }
      }
      if (message.durationInMillis != null && message.hasOwnProperty('durationInMillis')) {
        if (
          !$util.isInteger(message.durationInMillis) &&
          !(
            message.durationInMillis &&
            $util.isInteger(message.durationInMillis.low) &&
            $util.isInteger(message.durationInMillis.high)
          )
        ) {
          return 'durationInMillis: integer|Long expected';
        }
      }
      return null;
    };

    /**
     * Creates a VideoMetaData message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof Asset.VideoMetaData
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {Asset.VideoMetaData} VideoMetaData
     */
    VideoMetaData.fromObject = function fromObject(object) {
      if (object instanceof $root.Asset.VideoMetaData) {
        return object;
      }
      const message = new $root.Asset.VideoMetaData();
      if (object.width != null) {
        message.width = object.width | 0;
      }
      if (object.height != null) {
        message.height = object.height | 0;
      }
      if (object.durationInMillis != null) {
        if ($util.Long) {
          (message.durationInMillis = $util.Long.fromValue(object.durationInMillis)).unsigned = true;
        } else if (typeof object.durationInMillis === 'string') {
          message.durationInMillis = parseInt(object.durationInMillis, 10);
        } else if (typeof object.durationInMillis === 'number') {
          message.durationInMillis = object.durationInMillis;
        } else if (typeof object.durationInMillis === 'object') {
          message.durationInMillis = new $util.LongBits(
            object.durationInMillis.low >>> 0,
            object.durationInMillis.high >>> 0
          ).toNumber(true);
        }
      }
      return message;
    };

    /**
     * Creates a plain object from a VideoMetaData message. Also converts values to other types if specified.
     * @function toObject
     * @memberof Asset.VideoMetaData
     * @static
     * @param {Asset.VideoMetaData} message VideoMetaData
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    VideoMetaData.toObject = function toObject(message, options) {
      if (!options) {
        options = {};
      }
      const object = {};
      if (options.defaults) {
        object.width = 0;
        object.height = 0;
        if ($util.Long) {
          const long = new $util.Long(0, 0, true);
          object.durationInMillis =
            options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
        } else {
          object.durationInMillis = options.longs === String ? '0' : 0;
        }
      }
      if (message.width != null && message.hasOwnProperty('width')) {
        object.width = message.width;
      }
      if (message.height != null && message.hasOwnProperty('height')) {
        object.height = message.height;
      }
      if (message.durationInMillis != null && message.hasOwnProperty('durationInMillis')) {
        if (typeof message.durationInMillis === 'number') {
          object.durationInMillis =
            options.longs === String ? String(message.durationInMillis) : message.durationInMillis;
        } else {
          object.durationInMillis =
            options.longs === String
              ? $util.Long.prototype.toString.call(message.durationInMillis)
              : options.longs === Number
                ? new $util.LongBits(message.durationInMillis.low >>> 0, message.durationInMillis.high >>> 0).toNumber(
                    true
                  )
                : message.durationInMillis;
        }
      }
      return object;
    };

    /**
     * Converts this VideoMetaData to JSON.
     * @function toJSON
     * @memberof Asset.VideoMetaData
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    VideoMetaData.prototype.toJSON = function toJSON() {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    return VideoMetaData;
  })();

  Asset.AudioMetaData = (function() {
    /**
     * Properties of an AudioMetaData.
     * @memberof Asset
     * @interface IAudioMetaData
     * @property {number|Long|null} [durationInMillis] AudioMetaData durationInMillis
     * @property {Uint8Array|null} [normalizedLoudness] AudioMetaData normalizedLoudness
     */

    /**
     * Constructs a new AudioMetaData.
     * @memberof Asset
     * @classdesc Represents an AudioMetaData.
     * @implements IAudioMetaData
     * @constructor
     * @param {Asset.IAudioMetaData=} [properties] Properties to set
     */
    function AudioMetaData(properties) {
      if (properties) {
        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i) {
          if (properties[keys[i]] != null) {
            this[keys[i]] = properties[keys[i]];
          }
        }
      }
    }

    /**
     * AudioMetaData durationInMillis.
     * @member {number|Long} durationInMillis
     * @memberof Asset.AudioMetaData
     * @instance
     */
    AudioMetaData.prototype.durationInMillis = $util.Long ? $util.Long.fromBits(0, 0, true) : 0;

    /**
     * AudioMetaData normalizedLoudness.
     * @member {Uint8Array} normalizedLoudness
     * @memberof Asset.AudioMetaData
     * @instance
     */
    AudioMetaData.prototype.normalizedLoudness = $util.newBuffer([]);

    /**
     * Creates a new AudioMetaData instance using the specified properties.
     * @function create
     * @memberof Asset.AudioMetaData
     * @static
     * @param {Asset.IAudioMetaData=} [properties] Properties to set
     * @returns {Asset.AudioMetaData} AudioMetaData instance
     */
    AudioMetaData.create = function create(properties) {
      return new AudioMetaData(properties);
    };

    /**
     * Encodes the specified AudioMetaData message. Does not implicitly {@link Asset.AudioMetaData.verify|verify} messages.
     * @function encode
     * @memberof Asset.AudioMetaData
     * @static
     * @param {Asset.IAudioMetaData} message AudioMetaData message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    AudioMetaData.encode = function encode(message, writer) {
      if (!writer) {
        writer = $Writer.create();
      }
      if (message.durationInMillis != null && message.hasOwnProperty('durationInMillis')) {
        writer.uint32(/* id 1, wireType 0 =*/ 8).uint64(message.durationInMillis);
      }
      if (message.normalizedLoudness != null && message.hasOwnProperty('normalizedLoudness')) {
        writer.uint32(/* id 3, wireType 2 =*/ 26).bytes(message.normalizedLoudness);
      }
      return writer;
    };

    /**
     * Encodes the specified AudioMetaData message, length delimited. Does not implicitly {@link Asset.AudioMetaData.verify|verify} messages.
     * @function encodeDelimited
     * @memberof Asset.AudioMetaData
     * @static
     * @param {Asset.IAudioMetaData} message AudioMetaData message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    AudioMetaData.encodeDelimited = function encodeDelimited(message, writer) {
      return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes an AudioMetaData message from the specified reader or buffer.
     * @function decode
     * @memberof Asset.AudioMetaData
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {Asset.AudioMetaData} AudioMetaData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    AudioMetaData.decode = function decode(reader, length) {
      if (!(reader instanceof $Reader)) {
        reader = $Reader.create(reader);
      }
      const end = length === undefined ? reader.len : reader.pos + length;

      const message = new $root.Asset.AudioMetaData();
      while (reader.pos < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.durationInMillis = reader.uint64();
            break;
          case 3:
            message.normalizedLoudness = reader.bytes();
            break;
          default:
            reader.skipType(tag & 7);
            break;
        }
      }
      return message;
    };

    /**
     * Decodes an AudioMetaData message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof Asset.AudioMetaData
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {Asset.AudioMetaData} AudioMetaData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    AudioMetaData.decodeDelimited = function decodeDelimited(reader) {
      if (!(reader instanceof $Reader)) {
        reader = new $Reader(reader);
      }
      return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies an AudioMetaData message.
     * @function verify
     * @memberof Asset.AudioMetaData
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    AudioMetaData.verify = function verify(message) {
      if (typeof message !== 'object' || message === null) {
        return 'object expected';
      }
      if (message.durationInMillis != null && message.hasOwnProperty('durationInMillis')) {
        if (
          !$util.isInteger(message.durationInMillis) &&
          !(
            message.durationInMillis &&
            $util.isInteger(message.durationInMillis.low) &&
            $util.isInteger(message.durationInMillis.high)
          )
        ) {
          return 'durationInMillis: integer|Long expected';
        }
      }
      if (message.normalizedLoudness != null && message.hasOwnProperty('normalizedLoudness')) {
        if (
          !(
            (message.normalizedLoudness && typeof message.normalizedLoudness.length === 'number') ||
            $util.isString(message.normalizedLoudness)
          )
        ) {
          return 'normalizedLoudness: buffer expected';
        }
      }
      return null;
    };

    /**
     * Creates an AudioMetaData message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof Asset.AudioMetaData
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {Asset.AudioMetaData} AudioMetaData
     */
    AudioMetaData.fromObject = function fromObject(object) {
      if (object instanceof $root.Asset.AudioMetaData) {
        return object;
      }
      const message = new $root.Asset.AudioMetaData();
      if (object.durationInMillis != null) {
        if ($util.Long) {
          (message.durationInMillis = $util.Long.fromValue(object.durationInMillis)).unsigned = true;
        } else if (typeof object.durationInMillis === 'string') {
          message.durationInMillis = parseInt(object.durationInMillis, 10);
        } else if (typeof object.durationInMillis === 'number') {
          message.durationInMillis = object.durationInMillis;
        } else if (typeof object.durationInMillis === 'object') {
          message.durationInMillis = new $util.LongBits(
            object.durationInMillis.low >>> 0,
            object.durationInMillis.high >>> 0
          ).toNumber(true);
        }
      }
      if (object.normalizedLoudness != null) {
        if (typeof object.normalizedLoudness === 'string') {
          $util.base64.decode(
            object.normalizedLoudness,
            (message.normalizedLoudness = $util.newBuffer($util.base64.length(object.normalizedLoudness))),
            0
          );
        } else if (object.normalizedLoudness.length) {
          message.normalizedLoudness = object.normalizedLoudness;
        }
      }
      return message;
    };

    /**
     * Creates a plain object from an AudioMetaData message. Also converts values to other types if specified.
     * @function toObject
     * @memberof Asset.AudioMetaData
     * @static
     * @param {Asset.AudioMetaData} message AudioMetaData
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    AudioMetaData.toObject = function toObject(message, options) {
      if (!options) {
        options = {};
      }
      const object = {};
      if (options.defaults) {
        if ($util.Long) {
          const long = new $util.Long(0, 0, true);
          object.durationInMillis =
            options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
        } else {
          object.durationInMillis = options.longs === String ? '0' : 0;
        }
        object.normalizedLoudness = options.bytes === String ? '' : [];
      }
      if (message.durationInMillis != null && message.hasOwnProperty('durationInMillis')) {
        if (typeof message.durationInMillis === 'number') {
          object.durationInMillis =
            options.longs === String ? String(message.durationInMillis) : message.durationInMillis;
        } else {
          object.durationInMillis =
            options.longs === String
              ? $util.Long.prototype.toString.call(message.durationInMillis)
              : options.longs === Number
                ? new $util.LongBits(message.durationInMillis.low >>> 0, message.durationInMillis.high >>> 0).toNumber(
                    true
                  )
                : message.durationInMillis;
        }
      }
      if (message.normalizedLoudness != null && message.hasOwnProperty('normalizedLoudness')) {
        object.normalizedLoudness =
          options.bytes === String
            ? $util.base64.encode(message.normalizedLoudness, 0, message.normalizedLoudness.length)
            : options.bytes === Array
              ? Array.prototype.slice.call(message.normalizedLoudness)
              : message.normalizedLoudness;
      }
      return object;
    };

    /**
     * Converts this AudioMetaData to JSON.
     * @function toJSON
     * @memberof Asset.AudioMetaData
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    AudioMetaData.prototype.toJSON = function toJSON() {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    return AudioMetaData;
  })();

  /**
   * NotUploaded enum.
   * @name Asset.NotUploaded
   * @enum {string}
   * @property {number} CANCELLED=0 CANCELLED value
   * @property {number} FAILED=1 FAILED value
   */
  Asset.NotUploaded = (function() {
    const valuesById = {};

    const values = Object.create(valuesById);
    values[(valuesById[0] = 'CANCELLED')] = 0;
    values[(valuesById[1] = 'FAILED')] = 1;
    return values;
  })();

  Asset.RemoteData = (function() {
    /**
     * Properties of a RemoteData.
     * @memberof Asset
     * @interface IRemoteData
     * @property {Uint8Array} otrKey RemoteData otrKey
     * @property {Uint8Array} sha256 RemoteData sha256
     * @property {string|null} [assetId] RemoteData assetId
     * @property {string|null} [assetToken] RemoteData assetToken
     * @property {EncryptionAlgorithm|null} [encryption] RemoteData encryption
     */

    /**
     * Constructs a new RemoteData.
     * @memberof Asset
     * @classdesc Represents a RemoteData.
     * @implements IRemoteData
     * @constructor
     * @param {Asset.IRemoteData=} [properties] Properties to set
     */
    function RemoteData(properties) {
      if (properties) {
        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i) {
          if (properties[keys[i]] != null) {
            this[keys[i]] = properties[keys[i]];
          }
        }
      }
    }

    /**
     * RemoteData otrKey.
     * @member {Uint8Array} otrKey
     * @memberof Asset.RemoteData
     * @instance
     */
    RemoteData.prototype.otrKey = $util.newBuffer([]);

    /**
     * RemoteData sha256.
     * @member {Uint8Array} sha256
     * @memberof Asset.RemoteData
     * @instance
     */
    RemoteData.prototype.sha256 = $util.newBuffer([]);

    /**
     * RemoteData assetId.
     * @member {string} assetId
     * @memberof Asset.RemoteData
     * @instance
     */
    RemoteData.prototype.assetId = '';

    /**
     * RemoteData assetToken.
     * @member {string} assetToken
     * @memberof Asset.RemoteData
     * @instance
     */
    RemoteData.prototype.assetToken = '';

    /**
     * RemoteData encryption.
     * @member {EncryptionAlgorithm} encryption
     * @memberof Asset.RemoteData
     * @instance
     */
    RemoteData.prototype.encryption = 0;

    /**
     * Creates a new RemoteData instance using the specified properties.
     * @function create
     * @memberof Asset.RemoteData
     * @static
     * @param {Asset.IRemoteData=} [properties] Properties to set
     * @returns {Asset.RemoteData} RemoteData instance
     */
    RemoteData.create = function create(properties) {
      return new RemoteData(properties);
    };

    /**
     * Encodes the specified RemoteData message. Does not implicitly {@link Asset.RemoteData.verify|verify} messages.
     * @function encode
     * @memberof Asset.RemoteData
     * @static
     * @param {Asset.IRemoteData} message RemoteData message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    RemoteData.encode = function encode(message, writer) {
      if (!writer) {
        writer = $Writer.create();
      }
      writer.uint32(/* id 1, wireType 2 =*/ 10).bytes(message.otrKey);
      writer.uint32(/* id 2, wireType 2 =*/ 18).bytes(message.sha256);
      if (message.assetId != null && message.hasOwnProperty('assetId')) {
        writer.uint32(/* id 3, wireType 2 =*/ 26).string(message.assetId);
      }
      if (message.assetToken != null && message.hasOwnProperty('assetToken')) {
        writer.uint32(/* id 5, wireType 2 =*/ 42).string(message.assetToken);
      }
      if (message.encryption != null && message.hasOwnProperty('encryption')) {
        writer.uint32(/* id 6, wireType 0 =*/ 48).int32(message.encryption);
      }
      return writer;
    };

    /**
     * Encodes the specified RemoteData message, length delimited. Does not implicitly {@link Asset.RemoteData.verify|verify} messages.
     * @function encodeDelimited
     * @memberof Asset.RemoteData
     * @static
     * @param {Asset.IRemoteData} message RemoteData message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    RemoteData.encodeDelimited = function encodeDelimited(message, writer) {
      return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a RemoteData message from the specified reader or buffer.
     * @function decode
     * @memberof Asset.RemoteData
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {Asset.RemoteData} RemoteData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    RemoteData.decode = function decode(reader, length) {
      if (!(reader instanceof $Reader)) {
        reader = $Reader.create(reader);
      }
      const end = length === undefined ? reader.len : reader.pos + length;

      const message = new $root.Asset.RemoteData();
      while (reader.pos < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.otrKey = reader.bytes();
            break;
          case 2:
            message.sha256 = reader.bytes();
            break;
          case 3:
            message.assetId = reader.string();
            break;
          case 5:
            message.assetToken = reader.string();
            break;
          case 6:
            message.encryption = reader.int32();
            break;
          default:
            reader.skipType(tag & 7);
            break;
        }
      }
      if (!message.hasOwnProperty('otrKey')) {
        throw $util.ProtocolError("missing required 'otrKey'", {instance: message});
      }
      if (!message.hasOwnProperty('sha256')) {
        throw $util.ProtocolError("missing required 'sha256'", {instance: message});
      }
      return message;
    };

    /**
     * Decodes a RemoteData message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof Asset.RemoteData
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {Asset.RemoteData} RemoteData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    RemoteData.decodeDelimited = function decodeDelimited(reader) {
      if (!(reader instanceof $Reader)) {
        reader = new $Reader(reader);
      }
      return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a RemoteData message.
     * @function verify
     * @memberof Asset.RemoteData
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    RemoteData.verify = function verify(message) {
      if (typeof message !== 'object' || message === null) {
        return 'object expected';
      }
      if (!((message.otrKey && typeof message.otrKey.length === 'number') || $util.isString(message.otrKey))) {
        return 'otrKey: buffer expected';
      }
      if (!((message.sha256 && typeof message.sha256.length === 'number') || $util.isString(message.sha256))) {
        return 'sha256: buffer expected';
      }
      if (message.assetId != null && message.hasOwnProperty('assetId')) {
        if (!$util.isString(message.assetId)) {
          return 'assetId: string expected';
        }
      }
      if (message.assetToken != null && message.hasOwnProperty('assetToken')) {
        if (!$util.isString(message.assetToken)) {
          return 'assetToken: string expected';
        }
      }
      if (message.encryption != null && message.hasOwnProperty('encryption')) {
        switch (message.encryption) {
          default:
            return 'encryption: enum value expected';
          case 0:
          case 1:
            break;
        }
      }
      return null;
    };

    /**
     * Creates a RemoteData message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof Asset.RemoteData
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {Asset.RemoteData} RemoteData
     */
    RemoteData.fromObject = function fromObject(object) {
      if (object instanceof $root.Asset.RemoteData) {
        return object;
      }
      const message = new $root.Asset.RemoteData();
      if (object.otrKey != null) {
        if (typeof object.otrKey === 'string') {
          $util.base64.decode(object.otrKey, (message.otrKey = $util.newBuffer($util.base64.length(object.otrKey))), 0);
        } else if (object.otrKey.length) {
          message.otrKey = object.otrKey;
        }
      }
      if (object.sha256 != null) {
        if (typeof object.sha256 === 'string') {
          $util.base64.decode(object.sha256, (message.sha256 = $util.newBuffer($util.base64.length(object.sha256))), 0);
        } else if (object.sha256.length) {
          message.sha256 = object.sha256;
        }
      }
      if (object.assetId != null) {
        message.assetId = String(object.assetId);
      }
      if (object.assetToken != null) {
        message.assetToken = String(object.assetToken);
      }
      switch (object.encryption) {
        case 'AES_CBC':
        case 0:
          message.encryption = 0;
          break;
        case 'AES_GCM':
        case 1:
          message.encryption = 1;
          break;
      }
      return message;
    };

    /**
     * Creates a plain object from a RemoteData message. Also converts values to other types if specified.
     * @function toObject
     * @memberof Asset.RemoteData
     * @static
     * @param {Asset.RemoteData} message RemoteData
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    RemoteData.toObject = function toObject(message, options) {
      if (!options) {
        options = {};
      }
      const object = {};
      if (options.defaults) {
        object.otrKey = options.bytes === String ? '' : [];
        object.sha256 = options.bytes === String ? '' : [];
        object.assetId = '';
        object.assetToken = '';
        object.encryption = options.enums === String ? 'AES_CBC' : 0;
      }
      if (message.otrKey != null && message.hasOwnProperty('otrKey')) {
        object.otrKey =
          options.bytes === String
            ? $util.base64.encode(message.otrKey, 0, message.otrKey.length)
            : options.bytes === Array
              ? Array.prototype.slice.call(message.otrKey)
              : message.otrKey;
      }
      if (message.sha256 != null && message.hasOwnProperty('sha256')) {
        object.sha256 =
          options.bytes === String
            ? $util.base64.encode(message.sha256, 0, message.sha256.length)
            : options.bytes === Array
              ? Array.prototype.slice.call(message.sha256)
              : message.sha256;
      }
      if (message.assetId != null && message.hasOwnProperty('assetId')) {
        object.assetId = message.assetId;
      }
      if (message.assetToken != null && message.hasOwnProperty('assetToken')) {
        object.assetToken = message.assetToken;
      }
      if (message.encryption != null && message.hasOwnProperty('encryption')) {
        object.encryption =
          options.enums === String ? $root.EncryptionAlgorithm[message.encryption] : message.encryption;
      }
      return object;
    };

    /**
     * Converts this RemoteData to JSON.
     * @function toJSON
     * @memberof Asset.RemoteData
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    RemoteData.prototype.toJSON = function toJSON() {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    return RemoteData;
  })();

  return Asset;
})();

$root.External = (function() {
  /**
   * Properties of an External.
   * @exports IExternal
   * @interface IExternal
   * @property {Uint8Array} otrKey External otrKey
   * @property {Uint8Array|null} [sha256] External sha256
   * @property {EncryptionAlgorithm|null} [encryption] External encryption
   */

  /**
   * Constructs a new External.
   * @exports External
   * @classdesc Represents an External.
   * @implements IExternal
   * @constructor
   * @param {IExternal=} [properties] Properties to set
   */
  function External(properties) {
    if (properties) {
      for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i) {
        if (properties[keys[i]] != null) {
          this[keys[i]] = properties[keys[i]];
        }
      }
    }
  }

  /**
   * External otrKey.
   * @member {Uint8Array} otrKey
   * @memberof External
   * @instance
   */
  External.prototype.otrKey = $util.newBuffer([]);

  /**
   * External sha256.
   * @member {Uint8Array} sha256
   * @memberof External
   * @instance
   */
  External.prototype.sha256 = $util.newBuffer([]);

  /**
   * External encryption.
   * @member {EncryptionAlgorithm} encryption
   * @memberof External
   * @instance
   */
  External.prototype.encryption = 0;

  /**
   * Creates a new External instance using the specified properties.
   * @function create
   * @memberof External
   * @static
   * @param {IExternal=} [properties] Properties to set
   * @returns {External} External instance
   */
  External.create = function create(properties) {
    return new External(properties);
  };

  /**
   * Encodes the specified External message. Does not implicitly {@link External.verify|verify} messages.
   * @function encode
   * @memberof External
   * @static
   * @param {IExternal} message External message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  External.encode = function encode(message, writer) {
    if (!writer) {
      writer = $Writer.create();
    }
    writer.uint32(/* id 1, wireType 2 =*/ 10).bytes(message.otrKey);
    if (message.sha256 != null && message.hasOwnProperty('sha256')) {
      writer.uint32(/* id 2, wireType 2 =*/ 18).bytes(message.sha256);
    }
    if (message.encryption != null && message.hasOwnProperty('encryption')) {
      writer.uint32(/* id 3, wireType 0 =*/ 24).int32(message.encryption);
    }
    return writer;
  };

  /**
   * Encodes the specified External message, length delimited. Does not implicitly {@link External.verify|verify} messages.
   * @function encodeDelimited
   * @memberof External
   * @static
   * @param {IExternal} message External message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  External.encodeDelimited = function encodeDelimited(message, writer) {
    return this.encode(message, writer).ldelim();
  };

  /**
   * Decodes an External message from the specified reader or buffer.
   * @function decode
   * @memberof External
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @param {number} [length] Message length if known beforehand
   * @returns {External} External
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  External.decode = function decode(reader, length) {
    if (!(reader instanceof $Reader)) {
      reader = $Reader.create(reader);
    }
    const end = length === undefined ? reader.len : reader.pos + length;

    const message = new $root.External();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.otrKey = reader.bytes();
          break;
        case 2:
          message.sha256 = reader.bytes();
          break;
        case 3:
          message.encryption = reader.int32();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    if (!message.hasOwnProperty('otrKey')) {
      throw $util.ProtocolError("missing required 'otrKey'", {instance: message});
    }
    return message;
  };

  /**
   * Decodes an External message from the specified reader or buffer, length delimited.
   * @function decodeDelimited
   * @memberof External
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @returns {External} External
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  External.decodeDelimited = function decodeDelimited(reader) {
    if (!(reader instanceof $Reader)) {
      reader = new $Reader(reader);
    }
    return this.decode(reader, reader.uint32());
  };

  /**
   * Verifies an External message.
   * @function verify
   * @memberof External
   * @static
   * @param {Object.<string,*>} message Plain object to verify
   * @returns {string|null} `null` if valid, otherwise the reason why it is not
   */
  External.verify = function verify(message) {
    if (typeof message !== 'object' || message === null) {
      return 'object expected';
    }
    if (!((message.otrKey && typeof message.otrKey.length === 'number') || $util.isString(message.otrKey))) {
      return 'otrKey: buffer expected';
    }
    if (message.sha256 != null && message.hasOwnProperty('sha256')) {
      if (!((message.sha256 && typeof message.sha256.length === 'number') || $util.isString(message.sha256))) {
        return 'sha256: buffer expected';
      }
    }
    if (message.encryption != null && message.hasOwnProperty('encryption')) {
      switch (message.encryption) {
        default:
          return 'encryption: enum value expected';
        case 0:
        case 1:
          break;
      }
    }
    return null;
  };

  /**
   * Creates an External message from a plain object. Also converts values to their respective internal types.
   * @function fromObject
   * @memberof External
   * @static
   * @param {Object.<string,*>} object Plain object
   * @returns {External} External
   */
  External.fromObject = function fromObject(object) {
    if (object instanceof $root.External) {
      return object;
    }
    const message = new $root.External();
    if (object.otrKey != null) {
      if (typeof object.otrKey === 'string') {
        $util.base64.decode(object.otrKey, (message.otrKey = $util.newBuffer($util.base64.length(object.otrKey))), 0);
      } else if (object.otrKey.length) {
        message.otrKey = object.otrKey;
      }
    }
    if (object.sha256 != null) {
      if (typeof object.sha256 === 'string') {
        $util.base64.decode(object.sha256, (message.sha256 = $util.newBuffer($util.base64.length(object.sha256))), 0);
      } else if (object.sha256.length) {
        message.sha256 = object.sha256;
      }
    }
    switch (object.encryption) {
      case 'AES_CBC':
      case 0:
        message.encryption = 0;
        break;
      case 'AES_GCM':
      case 1:
        message.encryption = 1;
        break;
    }
    return message;
  };

  /**
   * Creates a plain object from an External message. Also converts values to other types if specified.
   * @function toObject
   * @memberof External
   * @static
   * @param {External} message External
   * @param {$protobuf.IConversionOptions} [options] Conversion options
   * @returns {Object.<string,*>} Plain object
   */
  External.toObject = function toObject(message, options) {
    if (!options) {
      options = {};
    }
    const object = {};
    if (options.defaults) {
      object.otrKey = options.bytes === String ? '' : [];
      object.sha256 = options.bytes === String ? '' : [];
      object.encryption = options.enums === String ? 'AES_CBC' : 0;
    }
    if (message.otrKey != null && message.hasOwnProperty('otrKey')) {
      object.otrKey =
        options.bytes === String
          ? $util.base64.encode(message.otrKey, 0, message.otrKey.length)
          : options.bytes === Array
            ? Array.prototype.slice.call(message.otrKey)
            : message.otrKey;
    }
    if (message.sha256 != null && message.hasOwnProperty('sha256')) {
      object.sha256 =
        options.bytes === String
          ? $util.base64.encode(message.sha256, 0, message.sha256.length)
          : options.bytes === Array
            ? Array.prototype.slice.call(message.sha256)
            : message.sha256;
    }
    if (message.encryption != null && message.hasOwnProperty('encryption')) {
      object.encryption = options.enums === String ? $root.EncryptionAlgorithm[message.encryption] : message.encryption;
    }
    return object;
  };

  /**
   * Converts this External to JSON.
   * @function toJSON
   * @memberof External
   * @instance
   * @returns {Object.<string,*>} JSON object
   */
  External.prototype.toJSON = function toJSON() {
    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
  };

  return External;
})();

$root.Reaction = (function() {
  /**
   * Properties of a Reaction.
   * @exports IReaction
   * @interface IReaction
   * @property {string|null} [emoji] Reaction emoji
   * @property {string} messageId Reaction messageId
   */

  /**
   * Constructs a new Reaction.
   * @exports Reaction
   * @classdesc Represents a Reaction.
   * @implements IReaction
   * @constructor
   * @param {IReaction=} [properties] Properties to set
   */
  function Reaction(properties) {
    if (properties) {
      for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i) {
        if (properties[keys[i]] != null) {
          this[keys[i]] = properties[keys[i]];
        }
      }
    }
  }

  /**
   * Reaction emoji.
   * @member {string} emoji
   * @memberof Reaction
   * @instance
   */
  Reaction.prototype.emoji = '';

  /**
   * Reaction messageId.
   * @member {string} messageId
   * @memberof Reaction
   * @instance
   */
  Reaction.prototype.messageId = '';

  /**
   * Creates a new Reaction instance using the specified properties.
   * @function create
   * @memberof Reaction
   * @static
   * @param {IReaction=} [properties] Properties to set
   * @returns {Reaction} Reaction instance
   */
  Reaction.create = function create(properties) {
    return new Reaction(properties);
  };

  /**
   * Encodes the specified Reaction message. Does not implicitly {@link Reaction.verify|verify} messages.
   * @function encode
   * @memberof Reaction
   * @static
   * @param {IReaction} message Reaction message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  Reaction.encode = function encode(message, writer) {
    if (!writer) {
      writer = $Writer.create();
    }
    if (message.emoji != null && message.hasOwnProperty('emoji')) {
      writer.uint32(/* id 1, wireType 2 =*/ 10).string(message.emoji);
    }
    writer.uint32(/* id 2, wireType 2 =*/ 18).string(message.messageId);
    return writer;
  };

  /**
   * Encodes the specified Reaction message, length delimited. Does not implicitly {@link Reaction.verify|verify} messages.
   * @function encodeDelimited
   * @memberof Reaction
   * @static
   * @param {IReaction} message Reaction message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  Reaction.encodeDelimited = function encodeDelimited(message, writer) {
    return this.encode(message, writer).ldelim();
  };

  /**
   * Decodes a Reaction message from the specified reader or buffer.
   * @function decode
   * @memberof Reaction
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @param {number} [length] Message length if known beforehand
   * @returns {Reaction} Reaction
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  Reaction.decode = function decode(reader, length) {
    if (!(reader instanceof $Reader)) {
      reader = $Reader.create(reader);
    }
    const end = length === undefined ? reader.len : reader.pos + length;

    const message = new $root.Reaction();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.emoji = reader.string();
          break;
        case 2:
          message.messageId = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    if (!message.hasOwnProperty('messageId')) {
      throw $util.ProtocolError("missing required 'messageId'", {instance: message});
    }
    return message;
  };

  /**
   * Decodes a Reaction message from the specified reader or buffer, length delimited.
   * @function decodeDelimited
   * @memberof Reaction
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @returns {Reaction} Reaction
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  Reaction.decodeDelimited = function decodeDelimited(reader) {
    if (!(reader instanceof $Reader)) {
      reader = new $Reader(reader);
    }
    return this.decode(reader, reader.uint32());
  };

  /**
   * Verifies a Reaction message.
   * @function verify
   * @memberof Reaction
   * @static
   * @param {Object.<string,*>} message Plain object to verify
   * @returns {string|null} `null` if valid, otherwise the reason why it is not
   */
  Reaction.verify = function verify(message) {
    if (typeof message !== 'object' || message === null) {
      return 'object expected';
    }
    if (message.emoji != null && message.hasOwnProperty('emoji')) {
      if (!$util.isString(message.emoji)) {
        return 'emoji: string expected';
      }
    }
    if (!$util.isString(message.messageId)) {
      return 'messageId: string expected';
    }
    return null;
  };

  /**
   * Creates a Reaction message from a plain object. Also converts values to their respective internal types.
   * @function fromObject
   * @memberof Reaction
   * @static
   * @param {Object.<string,*>} object Plain object
   * @returns {Reaction} Reaction
   */
  Reaction.fromObject = function fromObject(object) {
    if (object instanceof $root.Reaction) {
      return object;
    }
    const message = new $root.Reaction();
    if (object.emoji != null) {
      message.emoji = String(object.emoji);
    }
    if (object.messageId != null) {
      message.messageId = String(object.messageId);
    }
    return message;
  };

  /**
   * Creates a plain object from a Reaction message. Also converts values to other types if specified.
   * @function toObject
   * @memberof Reaction
   * @static
   * @param {Reaction} message Reaction
   * @param {$protobuf.IConversionOptions} [options] Conversion options
   * @returns {Object.<string,*>} Plain object
   */
  Reaction.toObject = function toObject(message, options) {
    if (!options) {
      options = {};
    }
    const object = {};
    if (options.defaults) {
      object.emoji = '';
      object.messageId = '';
    }
    if (message.emoji != null && message.hasOwnProperty('emoji')) {
      object.emoji = message.emoji;
    }
    if (message.messageId != null && message.hasOwnProperty('messageId')) {
      object.messageId = message.messageId;
    }
    return object;
  };

  /**
   * Converts this Reaction to JSON.
   * @function toJSON
   * @memberof Reaction
   * @instance
   * @returns {Object.<string,*>} JSON object
   */
  Reaction.prototype.toJSON = function toJSON() {
    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
  };

  return Reaction;
})();

/**
 * ClientAction enum.
 * @exports ClientAction
 * @enum {string}
 * @property {number} RESET_SESSION=0 RESET_SESSION value
 */
$root.ClientAction = (function() {
  const valuesById = {};

  const values = Object.create(valuesById);
  values[(valuesById[0] = 'RESET_SESSION')] = 0;
  return values;
})();

$root.Calling = (function() {
  /**
   * Properties of a Calling.
   * @exports ICalling
   * @interface ICalling
   * @property {string} content Calling content
   */

  /**
   * Constructs a new Calling.
   * @exports Calling
   * @classdesc Represents a Calling.
   * @implements ICalling
   * @constructor
   * @param {ICalling=} [properties] Properties to set
   */
  function Calling(properties) {
    if (properties) {
      for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i) {
        if (properties[keys[i]] != null) {
          this[keys[i]] = properties[keys[i]];
        }
      }
    }
  }

  /**
   * Calling content.
   * @member {string} content
   * @memberof Calling
   * @instance
   */
  Calling.prototype.content = '';

  /**
   * Creates a new Calling instance using the specified properties.
   * @function create
   * @memberof Calling
   * @static
   * @param {ICalling=} [properties] Properties to set
   * @returns {Calling} Calling instance
   */
  Calling.create = function create(properties) {
    return new Calling(properties);
  };

  /**
   * Encodes the specified Calling message. Does not implicitly {@link Calling.verify|verify} messages.
   * @function encode
   * @memberof Calling
   * @static
   * @param {ICalling} message Calling message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  Calling.encode = function encode(message, writer) {
    if (!writer) {
      writer = $Writer.create();
    }
    writer.uint32(/* id 1, wireType 2 =*/ 10).string(message.content);
    return writer;
  };

  /**
   * Encodes the specified Calling message, length delimited. Does not implicitly {@link Calling.verify|verify} messages.
   * @function encodeDelimited
   * @memberof Calling
   * @static
   * @param {ICalling} message Calling message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  Calling.encodeDelimited = function encodeDelimited(message, writer) {
    return this.encode(message, writer).ldelim();
  };

  /**
   * Decodes a Calling message from the specified reader or buffer.
   * @function decode
   * @memberof Calling
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @param {number} [length] Message length if known beforehand
   * @returns {Calling} Calling
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  Calling.decode = function decode(reader, length) {
    if (!(reader instanceof $Reader)) {
      reader = $Reader.create(reader);
    }
    const end = length === undefined ? reader.len : reader.pos + length;

    const message = new $root.Calling();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.content = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    if (!message.hasOwnProperty('content')) {
      throw $util.ProtocolError("missing required 'content'", {instance: message});
    }
    return message;
  };

  /**
   * Decodes a Calling message from the specified reader or buffer, length delimited.
   * @function decodeDelimited
   * @memberof Calling
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @returns {Calling} Calling
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  Calling.decodeDelimited = function decodeDelimited(reader) {
    if (!(reader instanceof $Reader)) {
      reader = new $Reader(reader);
    }
    return this.decode(reader, reader.uint32());
  };

  /**
   * Verifies a Calling message.
   * @function verify
   * @memberof Calling
   * @static
   * @param {Object.<string,*>} message Plain object to verify
   * @returns {string|null} `null` if valid, otherwise the reason why it is not
   */
  Calling.verify = function verify(message) {
    if (typeof message !== 'object' || message === null) {
      return 'object expected';
    }
    if (!$util.isString(message.content)) {
      return 'content: string expected';
    }
    return null;
  };

  /**
   * Creates a Calling message from a plain object. Also converts values to their respective internal types.
   * @function fromObject
   * @memberof Calling
   * @static
   * @param {Object.<string,*>} object Plain object
   * @returns {Calling} Calling
   */
  Calling.fromObject = function fromObject(object) {
    if (object instanceof $root.Calling) {
      return object;
    }
    const message = new $root.Calling();
    if (object.content != null) {
      message.content = String(object.content);
    }
    return message;
  };

  /**
   * Creates a plain object from a Calling message. Also converts values to other types if specified.
   * @function toObject
   * @memberof Calling
   * @static
   * @param {Calling} message Calling
   * @param {$protobuf.IConversionOptions} [options] Conversion options
   * @returns {Object.<string,*>} Plain object
   */
  Calling.toObject = function toObject(message, options) {
    if (!options) {
      options = {};
    }
    const object = {};
    if (options.defaults) {
      object.content = '';
    }
    if (message.content != null && message.hasOwnProperty('content')) {
      object.content = message.content;
    }
    return object;
  };

  /**
   * Converts this Calling to JSON.
   * @function toJSON
   * @memberof Calling
   * @instance
   * @returns {Object.<string,*>} JSON object
   */
  Calling.prototype.toJSON = function toJSON() {
    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
  };

  return Calling;
})();

/**
 * EncryptionAlgorithm enum.
 * @exports EncryptionAlgorithm
 * @enum {string}
 * @property {number} AES_CBC=0 AES_CBC value
 * @property {number} AES_GCM=1 AES_GCM value
 */
$root.EncryptionAlgorithm = (function() {
  const valuesById = {};

  const values = Object.create(valuesById);
  values[(valuesById[0] = 'AES_CBC')] = 0;
  values[(valuesById[1] = 'AES_GCM')] = 1;
  return values;
})();

module.exports = $root;
