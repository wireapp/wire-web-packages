import * as $protobuf from 'protobufjs';

/** Properties of a GenericMessage. */
export interface IGenericMessage {
  /** GenericMessage messageId */
  messageId: string;

  /** GenericMessage text */
  text?: IText | null;

  /** GenericMessage image */
  image?: IImageAsset | null;

  /** GenericMessage knock */
  knock?: IKnock | null;

  /** GenericMessage lastRead */
  lastRead?: ILastRead | null;

  /** GenericMessage cleared */
  cleared?: ICleared | null;

  /** GenericMessage external */
  external?: IExternal | null;

  /** GenericMessage clientAction */
  clientAction?: ClientAction | null;

  /** GenericMessage calling */
  calling?: ICalling | null;

  /** GenericMessage asset */
  asset?: IAsset | null;

  /** GenericMessage hidden */
  hidden?: IMessageHide | null;

  /** GenericMessage location */
  location?: ILocation | null;

  /** GenericMessage deleted */
  deleted?: IMessageDelete | null;

  /** GenericMessage edited */
  edited?: IMessageEdit | null;

  /** GenericMessage confirmation */
  confirmation?: IConfirmation | null;

  /** GenericMessage reaction */
  reaction?: IReaction | null;

  /** GenericMessage ephemeral */
  ephemeral?: IEphemeral | null;

  /** GenericMessage availability */
  availability?: IAvailability | null;
}

/** Represents a GenericMessage. */
export class GenericMessage implements IGenericMessage {
  /**
   * Constructs a new GenericMessage.
   * @param [properties] Properties to set
   */
  constructor(properties?: IGenericMessage);

  /** GenericMessage messageId. */
  public messageId: string;

  /** GenericMessage text. */
  public text?: IText | null;

  /** GenericMessage image. */
  public image?: IImageAsset | null;

  /** GenericMessage knock. */
  public knock?: IKnock | null;

  /** GenericMessage lastRead. */
  public lastRead?: ILastRead | null;

  /** GenericMessage cleared. */
  public cleared?: ICleared | null;

  /** GenericMessage external. */
  public external?: IExternal | null;

  /** GenericMessage clientAction. */
  public clientAction: ClientAction;

  /** GenericMessage calling. */
  public calling?: ICalling | null;

  /** GenericMessage asset. */
  public asset?: IAsset | null;

  /** GenericMessage hidden. */
  public hidden?: IMessageHide | null;

  /** GenericMessage location. */
  public location?: ILocation | null;

  /** GenericMessage deleted. */
  public deleted?: IMessageDelete | null;

  /** GenericMessage edited. */
  public edited?: IMessageEdit | null;

  /** GenericMessage confirmation. */
  public confirmation?: IConfirmation | null;

  /** GenericMessage reaction. */
  public reaction?: IReaction | null;

  /** GenericMessage ephemeral. */
  public ephemeral?: IEphemeral | null;

  /** GenericMessage availability. */
  public availability?: IAvailability | null;

  /** GenericMessage content. */
  public content?:
    | 'text'
    | 'image'
    | 'knock'
    | 'lastRead'
    | 'cleared'
    | 'external'
    | 'clientAction'
    | 'calling'
    | 'asset'
    | 'hidden'
    | 'location'
    | 'deleted'
    | 'edited'
    | 'confirmation'
    | 'reaction'
    | 'ephemeral'
    | 'availability';

  /**
   * Creates a new GenericMessage instance using the specified properties.
   * @param [properties] Properties to set
   * @returns GenericMessage instance
   */
  public static create(properties?: IGenericMessage): GenericMessage;

  /**
   * Encodes the specified GenericMessage message. Does not implicitly {@link GenericMessage.verify|verify} messages.
   * @param message GenericMessage message or plain object to encode
   * @param [writer] Writer to encode to
   * @returns Writer
   */
  public static encode(message: IGenericMessage, writer?: $protobuf.Writer): $protobuf.Writer;

  /**
   * Encodes the specified GenericMessage message, length delimited. Does not implicitly {@link GenericMessage.verify|verify} messages.
   * @param message GenericMessage message or plain object to encode
   * @param [writer] Writer to encode to
   * @returns Writer
   */
  public static encodeDelimited(message: IGenericMessage, writer?: $protobuf.Writer): $protobuf.Writer;

  /**
   * Decodes a GenericMessage message from the specified reader or buffer.
   * @param reader Reader or buffer to decode from
   * @param [length] Message length if known beforehand
   * @returns GenericMessage
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): GenericMessage;

  /**
   * Decodes a GenericMessage message from the specified reader or buffer, length delimited.
   * @param reader Reader or buffer to decode from
   * @returns GenericMessage
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): GenericMessage;

  /**
   * Verifies a GenericMessage message.
   * @param message Plain object to verify
   * @returns `null` if valid, otherwise the reason why it is not
   */
  public static verify(message: {[k: string]: any}): string | null;

  /**
   * Creates a GenericMessage message from a plain object. Also converts values to their respective internal types.
   * @param object Plain object
   * @returns GenericMessage
   */
  public static fromObject(object: {[k: string]: any}): GenericMessage;

  /**
   * Creates a plain object from a GenericMessage message. Also converts values to other types if specified.
   * @param message GenericMessage
   * @param [options] Conversion options
   * @returns Plain object
   */
  public static toObject(message: GenericMessage, options?: $protobuf.IConversionOptions): {[k: string]: any};

  /**
   * Converts this GenericMessage to JSON.
   * @returns JSON object
   */
  public toJSON(): {[k: string]: any};
}

/** Properties of an Availability. */
export interface IAvailability {
  /** Availability type */
  type: Availability.Type;
}

/** Represents an Availability. */
export class Availability implements IAvailability {
  /**
   * Constructs a new Availability.
   * @param [properties] Properties to set
   */
  constructor(properties?: IAvailability);

  /** Availability type. */
  public type: Availability.Type;

  /**
   * Creates a new Availability instance using the specified properties.
   * @param [properties] Properties to set
   * @returns Availability instance
   */
  public static create(properties?: IAvailability): Availability;

  /**
   * Encodes the specified Availability message. Does not implicitly {@link Availability.verify|verify} messages.
   * @param message Availability message or plain object to encode
   * @param [writer] Writer to encode to
   * @returns Writer
   */
  public static encode(message: IAvailability, writer?: $protobuf.Writer): $protobuf.Writer;

  /**
   * Encodes the specified Availability message, length delimited. Does not implicitly {@link Availability.verify|verify} messages.
   * @param message Availability message or plain object to encode
   * @param [writer] Writer to encode to
   * @returns Writer
   */
  public static encodeDelimited(message: IAvailability, writer?: $protobuf.Writer): $protobuf.Writer;

  /**
   * Decodes an Availability message from the specified reader or buffer.
   * @param reader Reader or buffer to decode from
   * @param [length] Message length if known beforehand
   * @returns Availability
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): Availability;

  /**
   * Decodes an Availability message from the specified reader or buffer, length delimited.
   * @param reader Reader or buffer to decode from
   * @returns Availability
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): Availability;

  /**
   * Verifies an Availability message.
   * @param message Plain object to verify
   * @returns `null` if valid, otherwise the reason why it is not
   */
  public static verify(message: {[k: string]: any}): string | null;

  /**
   * Creates an Availability message from a plain object. Also converts values to their respective internal types.
   * @param object Plain object
   * @returns Availability
   */
  public static fromObject(object: {[k: string]: any}): Availability;

  /**
   * Creates a plain object from an Availability message. Also converts values to other types if specified.
   * @param message Availability
   * @param [options] Conversion options
   * @returns Plain object
   */
  public static toObject(message: Availability, options?: $protobuf.IConversionOptions): {[k: string]: any};

  /**
   * Converts this Availability to JSON.
   * @returns JSON object
   */
  public toJSON(): {[k: string]: any};
}

export namespace Availability {
  /** Type enum. */
  enum Type {
    NONE = 0,
    AVAILABLE = 1,
    AWAY = 2,
    BUSY = 3,
  }
}

/** Properties of an Ephemeral. */
export interface IEphemeral {
  /** Ephemeral expireAfterMillis */
  expireAfterMillis: number | Long;

  /** Ephemeral text */
  text?: IText | null;

  /** Ephemeral image */
  image?: IImageAsset | null;

  /** Ephemeral knock */
  knock?: IKnock | null;

  /** Ephemeral asset */
  asset?: IAsset | null;

  /** Ephemeral location */
  location?: ILocation | null;
}

/** Represents an Ephemeral. */
export class Ephemeral implements IEphemeral {
  /**
   * Constructs a new Ephemeral.
   * @param [properties] Properties to set
   */
  constructor(properties?: IEphemeral);

  /** Ephemeral expireAfterMillis. */
  public expireAfterMillis: number | Long;

  /** Ephemeral text. */
  public text?: IText | null;

  /** Ephemeral image. */
  public image?: IImageAsset | null;

  /** Ephemeral knock. */
  public knock?: IKnock | null;

  /** Ephemeral asset. */
  public asset?: IAsset | null;

  /** Ephemeral location. */
  public location?: ILocation | null;

  /** Ephemeral content. */
  public content?: 'text' | 'image' | 'knock' | 'asset' | 'location';

  /**
   * Creates a new Ephemeral instance using the specified properties.
   * @param [properties] Properties to set
   * @returns Ephemeral instance
   */
  public static create(properties?: IEphemeral): Ephemeral;

  /**
   * Encodes the specified Ephemeral message. Does not implicitly {@link Ephemeral.verify|verify} messages.
   * @param message Ephemeral message or plain object to encode
   * @param [writer] Writer to encode to
   * @returns Writer
   */
  public static encode(message: IEphemeral, writer?: $protobuf.Writer): $protobuf.Writer;

  /**
   * Encodes the specified Ephemeral message, length delimited. Does not implicitly {@link Ephemeral.verify|verify} messages.
   * @param message Ephemeral message or plain object to encode
   * @param [writer] Writer to encode to
   * @returns Writer
   */
  public static encodeDelimited(message: IEphemeral, writer?: $protobuf.Writer): $protobuf.Writer;

  /**
   * Decodes an Ephemeral message from the specified reader or buffer.
   * @param reader Reader or buffer to decode from
   * @param [length] Message length if known beforehand
   * @returns Ephemeral
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): Ephemeral;

  /**
   * Decodes an Ephemeral message from the specified reader or buffer, length delimited.
   * @param reader Reader or buffer to decode from
   * @returns Ephemeral
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): Ephemeral;

  /**
   * Verifies an Ephemeral message.
   * @param message Plain object to verify
   * @returns `null` if valid, otherwise the reason why it is not
   */
  public static verify(message: {[k: string]: any}): string | null;

  /**
   * Creates an Ephemeral message from a plain object. Also converts values to their respective internal types.
   * @param object Plain object
   * @returns Ephemeral
   */
  public static fromObject(object: {[k: string]: any}): Ephemeral;

  /**
   * Creates a plain object from an Ephemeral message. Also converts values to other types if specified.
   * @param message Ephemeral
   * @param [options] Conversion options
   * @returns Plain object
   */
  public static toObject(message: Ephemeral, options?: $protobuf.IConversionOptions): {[k: string]: any};

  /**
   * Converts this Ephemeral to JSON.
   * @returns JSON object
   */
  public toJSON(): {[k: string]: any};
}

/** Properties of a Text. */
export interface IText {
  /** Text content */
  content: string;

  /** Text mention */
  mention?: IMention[] | null;

  /** Text linkPreview */
  linkPreview?: ILinkPreview[] | null;
}

/** Represents a Text. */
export class Text implements IText {
  /**
   * Constructs a new Text.
   * @param [properties] Properties to set
   */
  constructor(properties?: IText);

  /** Text content. */
  public content: string;

  /** Text mention. */
  public mention: IMention[];

  /** Text linkPreview. */
  public linkPreview: ILinkPreview[];

  /**
   * Creates a new Text instance using the specified properties.
   * @param [properties] Properties to set
   * @returns Text instance
   */
  public static create(properties?: IText): Text;

  /**
   * Encodes the specified Text message. Does not implicitly {@link Text.verify|verify} messages.
   * @param message Text message or plain object to encode
   * @param [writer] Writer to encode to
   * @returns Writer
   */
  public static encode(message: IText, writer?: $protobuf.Writer): $protobuf.Writer;

  /**
   * Encodes the specified Text message, length delimited. Does not implicitly {@link Text.verify|verify} messages.
   * @param message Text message or plain object to encode
   * @param [writer] Writer to encode to
   * @returns Writer
   */
  public static encodeDelimited(message: IText, writer?: $protobuf.Writer): $protobuf.Writer;

  /**
   * Decodes a Text message from the specified reader or buffer.
   * @param reader Reader or buffer to decode from
   * @param [length] Message length if known beforehand
   * @returns Text
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): Text;

  /**
   * Decodes a Text message from the specified reader or buffer, length delimited.
   * @param reader Reader or buffer to decode from
   * @returns Text
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): Text;

  /**
   * Verifies a Text message.
   * @param message Plain object to verify
   * @returns `null` if valid, otherwise the reason why it is not
   */
  public static verify(message: {[k: string]: any}): string | null;

  /**
   * Creates a Text message from a plain object. Also converts values to their respective internal types.
   * @param object Plain object
   * @returns Text
   */
  public static fromObject(object: {[k: string]: any}): Text;

  /**
   * Creates a plain object from a Text message. Also converts values to other types if specified.
   * @param message Text
   * @param [options] Conversion options
   * @returns Plain object
   */
  public static toObject(message: Text, options?: $protobuf.IConversionOptions): {[k: string]: any};

  /**
   * Converts this Text to JSON.
   * @returns JSON object
   */
  public toJSON(): {[k: string]: any};
}

/** Properties of a Knock. */
export interface IKnock {
  /** Knock hotKnock */
  hotKnock: boolean;
}

/** Represents a Knock. */
export class Knock implements IKnock {
  /**
   * Constructs a new Knock.
   * @param [properties] Properties to set
   */
  constructor(properties?: IKnock);

  /** Knock hotKnock. */
  public hotKnock: boolean;

  /**
   * Creates a new Knock instance using the specified properties.
   * @param [properties] Properties to set
   * @returns Knock instance
   */
  public static create(properties?: IKnock): Knock;

  /**
   * Encodes the specified Knock message. Does not implicitly {@link Knock.verify|verify} messages.
   * @param message Knock message or plain object to encode
   * @param [writer] Writer to encode to
   * @returns Writer
   */
  public static encode(message: IKnock, writer?: $protobuf.Writer): $protobuf.Writer;

  /**
   * Encodes the specified Knock message, length delimited. Does not implicitly {@link Knock.verify|verify} messages.
   * @param message Knock message or plain object to encode
   * @param [writer] Writer to encode to
   * @returns Writer
   */
  public static encodeDelimited(message: IKnock, writer?: $protobuf.Writer): $protobuf.Writer;

  /**
   * Decodes a Knock message from the specified reader or buffer.
   * @param reader Reader or buffer to decode from
   * @param [length] Message length if known beforehand
   * @returns Knock
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): Knock;

  /**
   * Decodes a Knock message from the specified reader or buffer, length delimited.
   * @param reader Reader or buffer to decode from
   * @returns Knock
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): Knock;

  /**
   * Verifies a Knock message.
   * @param message Plain object to verify
   * @returns `null` if valid, otherwise the reason why it is not
   */
  public static verify(message: {[k: string]: any}): string | null;

  /**
   * Creates a Knock message from a plain object. Also converts values to their respective internal types.
   * @param object Plain object
   * @returns Knock
   */
  public static fromObject(object: {[k: string]: any}): Knock;

  /**
   * Creates a plain object from a Knock message. Also converts values to other types if specified.
   * @param message Knock
   * @param [options] Conversion options
   * @returns Plain object
   */
  public static toObject(message: Knock, options?: $protobuf.IConversionOptions): {[k: string]: any};

  /**
   * Converts this Knock to JSON.
   * @returns JSON object
   */
  public toJSON(): {[k: string]: any};
}

/** Properties of a LinkPreview. */
export interface ILinkPreview {
  /** LinkPreview url */
  url: string;

  /** LinkPreview urlOffset */
  urlOffset: number;

  /** LinkPreview article */
  article?: IArticle | null;

  /** LinkPreview permanentUrl */
  permanentUrl?: string | null;

  /** LinkPreview title */
  title?: string | null;

  /** LinkPreview summary */
  summary?: string | null;

  /** LinkPreview image */
  image?: IAsset | null;

  /** LinkPreview tweet */
  tweet?: ITweet | null;
}

/** Represents a LinkPreview. */
export class LinkPreview implements ILinkPreview {
  /**
   * Constructs a new LinkPreview.
   * @param [properties] Properties to set
   */
  constructor(properties?: ILinkPreview);

  /** LinkPreview url. */
  public url: string;

  /** LinkPreview urlOffset. */
  public urlOffset: number;

  /** LinkPreview article. */
  public article?: IArticle | null;

  /** LinkPreview permanentUrl. */
  public permanentUrl: string;

  /** LinkPreview title. */
  public title: string;

  /** LinkPreview summary. */
  public summary: string;

  /** LinkPreview image. */
  public image?: IAsset | null;

  /** LinkPreview tweet. */
  public tweet?: ITweet | null;

  /** LinkPreview preview. */
  public preview?: 'article';

  /** LinkPreview metaData. */
  public metaData?: 'tweet';

  /**
   * Creates a new LinkPreview instance using the specified properties.
   * @param [properties] Properties to set
   * @returns LinkPreview instance
   */
  public static create(properties?: ILinkPreview): LinkPreview;

  /**
   * Encodes the specified LinkPreview message. Does not implicitly {@link LinkPreview.verify|verify} messages.
   * @param message LinkPreview message or plain object to encode
   * @param [writer] Writer to encode to
   * @returns Writer
   */
  public static encode(message: ILinkPreview, writer?: $protobuf.Writer): $protobuf.Writer;

  /**
   * Encodes the specified LinkPreview message, length delimited. Does not implicitly {@link LinkPreview.verify|verify} messages.
   * @param message LinkPreview message or plain object to encode
   * @param [writer] Writer to encode to
   * @returns Writer
   */
  public static encodeDelimited(message: ILinkPreview, writer?: $protobuf.Writer): $protobuf.Writer;

  /**
   * Decodes a LinkPreview message from the specified reader or buffer.
   * @param reader Reader or buffer to decode from
   * @param [length] Message length if known beforehand
   * @returns LinkPreview
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): LinkPreview;

  /**
   * Decodes a LinkPreview message from the specified reader or buffer, length delimited.
   * @param reader Reader or buffer to decode from
   * @returns LinkPreview
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): LinkPreview;

  /**
   * Verifies a LinkPreview message.
   * @param message Plain object to verify
   * @returns `null` if valid, otherwise the reason why it is not
   */
  public static verify(message: {[k: string]: any}): string | null;

  /**
   * Creates a LinkPreview message from a plain object. Also converts values to their respective internal types.
   * @param object Plain object
   * @returns LinkPreview
   */
  public static fromObject(object: {[k: string]: any}): LinkPreview;

  /**
   * Creates a plain object from a LinkPreview message. Also converts values to other types if specified.
   * @param message LinkPreview
   * @param [options] Conversion options
   * @returns Plain object
   */
  public static toObject(message: LinkPreview, options?: $protobuf.IConversionOptions): {[k: string]: any};

  /**
   * Converts this LinkPreview to JSON.
   * @returns JSON object
   */
  public toJSON(): {[k: string]: any};
}

/** Properties of a Tweet. */
export interface ITweet {
  /** Tweet author */
  author?: string | null;

  /** Tweet username */
  username?: string | null;
}

/** Represents a Tweet. */
export class Tweet implements ITweet {
  /**
   * Constructs a new Tweet.
   * @param [properties] Properties to set
   */
  constructor(properties?: ITweet);

  /** Tweet author. */
  public author: string;

  /** Tweet username. */
  public username: string;

  /**
   * Creates a new Tweet instance using the specified properties.
   * @param [properties] Properties to set
   * @returns Tweet instance
   */
  public static create(properties?: ITweet): Tweet;

  /**
   * Encodes the specified Tweet message. Does not implicitly {@link Tweet.verify|verify} messages.
   * @param message Tweet message or plain object to encode
   * @param [writer] Writer to encode to
   * @returns Writer
   */
  public static encode(message: ITweet, writer?: $protobuf.Writer): $protobuf.Writer;

  /**
   * Encodes the specified Tweet message, length delimited. Does not implicitly {@link Tweet.verify|verify} messages.
   * @param message Tweet message or plain object to encode
   * @param [writer] Writer to encode to
   * @returns Writer
   */
  public static encodeDelimited(message: ITweet, writer?: $protobuf.Writer): $protobuf.Writer;

  /**
   * Decodes a Tweet message from the specified reader or buffer.
   * @param reader Reader or buffer to decode from
   * @param [length] Message length if known beforehand
   * @returns Tweet
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): Tweet;

  /**
   * Decodes a Tweet message from the specified reader or buffer, length delimited.
   * @param reader Reader or buffer to decode from
   * @returns Tweet
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): Tweet;

  /**
   * Verifies a Tweet message.
   * @param message Plain object to verify
   * @returns `null` if valid, otherwise the reason why it is not
   */
  public static verify(message: {[k: string]: any}): string | null;

  /**
   * Creates a Tweet message from a plain object. Also converts values to their respective internal types.
   * @param object Plain object
   * @returns Tweet
   */
  public static fromObject(object: {[k: string]: any}): Tweet;

  /**
   * Creates a plain object from a Tweet message. Also converts values to other types if specified.
   * @param message Tweet
   * @param [options] Conversion options
   * @returns Plain object
   */
  public static toObject(message: Tweet, options?: $protobuf.IConversionOptions): {[k: string]: any};

  /**
   * Converts this Tweet to JSON.
   * @returns JSON object
   */
  public toJSON(): {[k: string]: any};
}

/** Properties of an Article. */
export interface IArticle {
  /** Article permanentUrl */
  permanentUrl: string;

  /** Article title */
  title?: string | null;

  /** Article summary */
  summary?: string | null;

  /** Article image */
  image?: IAsset | null;
}

/** Represents an Article. */
export class Article implements IArticle {
  /**
   * Constructs a new Article.
   * @param [properties] Properties to set
   */
  constructor(properties?: IArticle);

  /** Article permanentUrl. */
  public permanentUrl: string;

  /** Article title. */
  public title: string;

  /** Article summary. */
  public summary: string;

  /** Article image. */
  public image?: IAsset | null;

  /**
   * Creates a new Article instance using the specified properties.
   * @param [properties] Properties to set
   * @returns Article instance
   */
  public static create(properties?: IArticle): Article;

  /**
   * Encodes the specified Article message. Does not implicitly {@link Article.verify|verify} messages.
   * @param message Article message or plain object to encode
   * @param [writer] Writer to encode to
   * @returns Writer
   */
  public static encode(message: IArticle, writer?: $protobuf.Writer): $protobuf.Writer;

  /**
   * Encodes the specified Article message, length delimited. Does not implicitly {@link Article.verify|verify} messages.
   * @param message Article message or plain object to encode
   * @param [writer] Writer to encode to
   * @returns Writer
   */
  public static encodeDelimited(message: IArticle, writer?: $protobuf.Writer): $protobuf.Writer;

  /**
   * Decodes an Article message from the specified reader or buffer.
   * @param reader Reader or buffer to decode from
   * @param [length] Message length if known beforehand
   * @returns Article
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): Article;

  /**
   * Decodes an Article message from the specified reader or buffer, length delimited.
   * @param reader Reader or buffer to decode from
   * @returns Article
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): Article;

  /**
   * Verifies an Article message.
   * @param message Plain object to verify
   * @returns `null` if valid, otherwise the reason why it is not
   */
  public static verify(message: {[k: string]: any}): string | null;

  /**
   * Creates an Article message from a plain object. Also converts values to their respective internal types.
   * @param object Plain object
   * @returns Article
   */
  public static fromObject(object: {[k: string]: any}): Article;

  /**
   * Creates a plain object from an Article message. Also converts values to other types if specified.
   * @param message Article
   * @param [options] Conversion options
   * @returns Plain object
   */
  public static toObject(message: Article, options?: $protobuf.IConversionOptions): {[k: string]: any};

  /**
   * Converts this Article to JSON.
   * @returns JSON object
   */
  public toJSON(): {[k: string]: any};
}

/** Properties of a Mention. */
export interface IMention {
  /** Mention userId */
  userId: string;

  /** Mention userName */
  userName: string;
}

/** Represents a Mention. */
export class Mention implements IMention {
  /**
   * Constructs a new Mention.
   * @param [properties] Properties to set
   */
  constructor(properties?: IMention);

  /** Mention userId. */
  public userId: string;

  /** Mention userName. */
  public userName: string;

  /**
   * Creates a new Mention instance using the specified properties.
   * @param [properties] Properties to set
   * @returns Mention instance
   */
  public static create(properties?: IMention): Mention;

  /**
   * Encodes the specified Mention message. Does not implicitly {@link Mention.verify|verify} messages.
   * @param message Mention message or plain object to encode
   * @param [writer] Writer to encode to
   * @returns Writer
   */
  public static encode(message: IMention, writer?: $protobuf.Writer): $protobuf.Writer;

  /**
   * Encodes the specified Mention message, length delimited. Does not implicitly {@link Mention.verify|verify} messages.
   * @param message Mention message or plain object to encode
   * @param [writer] Writer to encode to
   * @returns Writer
   */
  public static encodeDelimited(message: IMention, writer?: $protobuf.Writer): $protobuf.Writer;

  /**
   * Decodes a Mention message from the specified reader or buffer.
   * @param reader Reader or buffer to decode from
   * @param [length] Message length if known beforehand
   * @returns Mention
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): Mention;

  /**
   * Decodes a Mention message from the specified reader or buffer, length delimited.
   * @param reader Reader or buffer to decode from
   * @returns Mention
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): Mention;

  /**
   * Verifies a Mention message.
   * @param message Plain object to verify
   * @returns `null` if valid, otherwise the reason why it is not
   */
  public static verify(message: {[k: string]: any}): string | null;

  /**
   * Creates a Mention message from a plain object. Also converts values to their respective internal types.
   * @param object Plain object
   * @returns Mention
   */
  public static fromObject(object: {[k: string]: any}): Mention;

  /**
   * Creates a plain object from a Mention message. Also converts values to other types if specified.
   * @param message Mention
   * @param [options] Conversion options
   * @returns Plain object
   */
  public static toObject(message: Mention, options?: $protobuf.IConversionOptions): {[k: string]: any};

  /**
   * Converts this Mention to JSON.
   * @returns JSON object
   */
  public toJSON(): {[k: string]: any};
}

/** Properties of a LastRead. */
export interface ILastRead {
  /** LastRead conversationId */
  conversationId: string;

  /** LastRead lastReadTimestamp */
  lastReadTimestamp: number | Long;
}

/** Represents a LastRead. */
export class LastRead implements ILastRead {
  /**
   * Constructs a new LastRead.
   * @param [properties] Properties to set
   */
  constructor(properties?: ILastRead);

  /** LastRead conversationId. */
  public conversationId: string;

  /** LastRead lastReadTimestamp. */
  public lastReadTimestamp: number | Long;

  /**
   * Creates a new LastRead instance using the specified properties.
   * @param [properties] Properties to set
   * @returns LastRead instance
   */
  public static create(properties?: ILastRead): LastRead;

  /**
   * Encodes the specified LastRead message. Does not implicitly {@link LastRead.verify|verify} messages.
   * @param message LastRead message or plain object to encode
   * @param [writer] Writer to encode to
   * @returns Writer
   */
  public static encode(message: ILastRead, writer?: $protobuf.Writer): $protobuf.Writer;

  /**
   * Encodes the specified LastRead message, length delimited. Does not implicitly {@link LastRead.verify|verify} messages.
   * @param message LastRead message or plain object to encode
   * @param [writer] Writer to encode to
   * @returns Writer
   */
  public static encodeDelimited(message: ILastRead, writer?: $protobuf.Writer): $protobuf.Writer;

  /**
   * Decodes a LastRead message from the specified reader or buffer.
   * @param reader Reader or buffer to decode from
   * @param [length] Message length if known beforehand
   * @returns LastRead
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): LastRead;

  /**
   * Decodes a LastRead message from the specified reader or buffer, length delimited.
   * @param reader Reader or buffer to decode from
   * @returns LastRead
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): LastRead;

  /**
   * Verifies a LastRead message.
   * @param message Plain object to verify
   * @returns `null` if valid, otherwise the reason why it is not
   */
  public static verify(message: {[k: string]: any}): string | null;

  /**
   * Creates a LastRead message from a plain object. Also converts values to their respective internal types.
   * @param object Plain object
   * @returns LastRead
   */
  public static fromObject(object: {[k: string]: any}): LastRead;

  /**
   * Creates a plain object from a LastRead message. Also converts values to other types if specified.
   * @param message LastRead
   * @param [options] Conversion options
   * @returns Plain object
   */
  public static toObject(message: LastRead, options?: $protobuf.IConversionOptions): {[k: string]: any};

  /**
   * Converts this LastRead to JSON.
   * @returns JSON object
   */
  public toJSON(): {[k: string]: any};
}

/** Properties of a Cleared. */
export interface ICleared {
  /** Cleared conversationId */
  conversationId: string;

  /** Cleared clearedTimestamp */
  clearedTimestamp: number | Long;
}

/** Represents a Cleared. */
export class Cleared implements ICleared {
  /**
   * Constructs a new Cleared.
   * @param [properties] Properties to set
   */
  constructor(properties?: ICleared);

  /** Cleared conversationId. */
  public conversationId: string;

  /** Cleared clearedTimestamp. */
  public clearedTimestamp: number | Long;

  /**
   * Creates a new Cleared instance using the specified properties.
   * @param [properties] Properties to set
   * @returns Cleared instance
   */
  public static create(properties?: ICleared): Cleared;

  /**
   * Encodes the specified Cleared message. Does not implicitly {@link Cleared.verify|verify} messages.
   * @param message Cleared message or plain object to encode
   * @param [writer] Writer to encode to
   * @returns Writer
   */
  public static encode(message: ICleared, writer?: $protobuf.Writer): $protobuf.Writer;

  /**
   * Encodes the specified Cleared message, length delimited. Does not implicitly {@link Cleared.verify|verify} messages.
   * @param message Cleared message or plain object to encode
   * @param [writer] Writer to encode to
   * @returns Writer
   */
  public static encodeDelimited(message: ICleared, writer?: $protobuf.Writer): $protobuf.Writer;

  /**
   * Decodes a Cleared message from the specified reader or buffer.
   * @param reader Reader or buffer to decode from
   * @param [length] Message length if known beforehand
   * @returns Cleared
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): Cleared;

  /**
   * Decodes a Cleared message from the specified reader or buffer, length delimited.
   * @param reader Reader or buffer to decode from
   * @returns Cleared
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): Cleared;

  /**
   * Verifies a Cleared message.
   * @param message Plain object to verify
   * @returns `null` if valid, otherwise the reason why it is not
   */
  public static verify(message: {[k: string]: any}): string | null;

  /**
   * Creates a Cleared message from a plain object. Also converts values to their respective internal types.
   * @param object Plain object
   * @returns Cleared
   */
  public static fromObject(object: {[k: string]: any}): Cleared;

  /**
   * Creates a plain object from a Cleared message. Also converts values to other types if specified.
   * @param message Cleared
   * @param [options] Conversion options
   * @returns Plain object
   */
  public static toObject(message: Cleared, options?: $protobuf.IConversionOptions): {[k: string]: any};

  /**
   * Converts this Cleared to JSON.
   * @returns JSON object
   */
  public toJSON(): {[k: string]: any};
}

/** Properties of a MessageHide. */
export interface IMessageHide {
  /** MessageHide conversationId */
  conversationId: string;

  /** MessageHide messageId */
  messageId: string;
}

/** Represents a MessageHide. */
export class MessageHide implements IMessageHide {
  /**
   * Constructs a new MessageHide.
   * @param [properties] Properties to set
   */
  constructor(properties?: IMessageHide);

  /** MessageHide conversationId. */
  public conversationId: string;

  /** MessageHide messageId. */
  public messageId: string;

  /**
   * Creates a new MessageHide instance using the specified properties.
   * @param [properties] Properties to set
   * @returns MessageHide instance
   */
  public static create(properties?: IMessageHide): MessageHide;

  /**
   * Encodes the specified MessageHide message. Does not implicitly {@link MessageHide.verify|verify} messages.
   * @param message MessageHide message or plain object to encode
   * @param [writer] Writer to encode to
   * @returns Writer
   */
  public static encode(message: IMessageHide, writer?: $protobuf.Writer): $protobuf.Writer;

  /**
   * Encodes the specified MessageHide message, length delimited. Does not implicitly {@link MessageHide.verify|verify} messages.
   * @param message MessageHide message or plain object to encode
   * @param [writer] Writer to encode to
   * @returns Writer
   */
  public static encodeDelimited(message: IMessageHide, writer?: $protobuf.Writer): $protobuf.Writer;

  /**
   * Decodes a MessageHide message from the specified reader or buffer.
   * @param reader Reader or buffer to decode from
   * @param [length] Message length if known beforehand
   * @returns MessageHide
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): MessageHide;

  /**
   * Decodes a MessageHide message from the specified reader or buffer, length delimited.
   * @param reader Reader or buffer to decode from
   * @returns MessageHide
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): MessageHide;

  /**
   * Verifies a MessageHide message.
   * @param message Plain object to verify
   * @returns `null` if valid, otherwise the reason why it is not
   */
  public static verify(message: {[k: string]: any}): string | null;

  /**
   * Creates a MessageHide message from a plain object. Also converts values to their respective internal types.
   * @param object Plain object
   * @returns MessageHide
   */
  public static fromObject(object: {[k: string]: any}): MessageHide;

  /**
   * Creates a plain object from a MessageHide message. Also converts values to other types if specified.
   * @param message MessageHide
   * @param [options] Conversion options
   * @returns Plain object
   */
  public static toObject(message: MessageHide, options?: $protobuf.IConversionOptions): {[k: string]: any};

  /**
   * Converts this MessageHide to JSON.
   * @returns JSON object
   */
  public toJSON(): {[k: string]: any};
}

/** Properties of a MessageDelete. */
export interface IMessageDelete {
  /** MessageDelete messageId */
  messageId: string;
}

/** Represents a MessageDelete. */
export class MessageDelete implements IMessageDelete {
  /**
   * Constructs a new MessageDelete.
   * @param [properties] Properties to set
   */
  constructor(properties?: IMessageDelete);

  /** MessageDelete messageId. */
  public messageId: string;

  /**
   * Creates a new MessageDelete instance using the specified properties.
   * @param [properties] Properties to set
   * @returns MessageDelete instance
   */
  public static create(properties?: IMessageDelete): MessageDelete;

  /**
   * Encodes the specified MessageDelete message. Does not implicitly {@link MessageDelete.verify|verify} messages.
   * @param message MessageDelete message or plain object to encode
   * @param [writer] Writer to encode to
   * @returns Writer
   */
  public static encode(message: IMessageDelete, writer?: $protobuf.Writer): $protobuf.Writer;

  /**
   * Encodes the specified MessageDelete message, length delimited. Does not implicitly {@link MessageDelete.verify|verify} messages.
   * @param message MessageDelete message or plain object to encode
   * @param [writer] Writer to encode to
   * @returns Writer
   */
  public static encodeDelimited(message: IMessageDelete, writer?: $protobuf.Writer): $protobuf.Writer;

  /**
   * Decodes a MessageDelete message from the specified reader or buffer.
   * @param reader Reader or buffer to decode from
   * @param [length] Message length if known beforehand
   * @returns MessageDelete
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): MessageDelete;

  /**
   * Decodes a MessageDelete message from the specified reader or buffer, length delimited.
   * @param reader Reader or buffer to decode from
   * @returns MessageDelete
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): MessageDelete;

  /**
   * Verifies a MessageDelete message.
   * @param message Plain object to verify
   * @returns `null` if valid, otherwise the reason why it is not
   */
  public static verify(message: {[k: string]: any}): string | null;

  /**
   * Creates a MessageDelete message from a plain object. Also converts values to their respective internal types.
   * @param object Plain object
   * @returns MessageDelete
   */
  public static fromObject(object: {[k: string]: any}): MessageDelete;

  /**
   * Creates a plain object from a MessageDelete message. Also converts values to other types if specified.
   * @param message MessageDelete
   * @param [options] Conversion options
   * @returns Plain object
   */
  public static toObject(message: MessageDelete, options?: $protobuf.IConversionOptions): {[k: string]: any};

  /**
   * Converts this MessageDelete to JSON.
   * @returns JSON object
   */
  public toJSON(): {[k: string]: any};
}

/** Properties of a MessageEdit. */
export interface IMessageEdit {
  /** MessageEdit replacingMessageId */
  replacingMessageId: string;

  /** MessageEdit text */
  text?: IText | null;
}

/** Represents a MessageEdit. */
export class MessageEdit implements IMessageEdit {
  /**
   * Constructs a new MessageEdit.
   * @param [properties] Properties to set
   */
  constructor(properties?: IMessageEdit);

  /** MessageEdit replacingMessageId. */
  public replacingMessageId: string;

  /** MessageEdit text. */
  public text?: IText | null;

  /** MessageEdit content. */
  public content?: 'text';

  /**
   * Creates a new MessageEdit instance using the specified properties.
   * @param [properties] Properties to set
   * @returns MessageEdit instance
   */
  public static create(properties?: IMessageEdit): MessageEdit;

  /**
   * Encodes the specified MessageEdit message. Does not implicitly {@link MessageEdit.verify|verify} messages.
   * @param message MessageEdit message or plain object to encode
   * @param [writer] Writer to encode to
   * @returns Writer
   */
  public static encode(message: IMessageEdit, writer?: $protobuf.Writer): $protobuf.Writer;

  /**
   * Encodes the specified MessageEdit message, length delimited. Does not implicitly {@link MessageEdit.verify|verify} messages.
   * @param message MessageEdit message or plain object to encode
   * @param [writer] Writer to encode to
   * @returns Writer
   */
  public static encodeDelimited(message: IMessageEdit, writer?: $protobuf.Writer): $protobuf.Writer;

  /**
   * Decodes a MessageEdit message from the specified reader or buffer.
   * @param reader Reader or buffer to decode from
   * @param [length] Message length if known beforehand
   * @returns MessageEdit
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): MessageEdit;

  /**
   * Decodes a MessageEdit message from the specified reader or buffer, length delimited.
   * @param reader Reader or buffer to decode from
   * @returns MessageEdit
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): MessageEdit;

  /**
   * Verifies a MessageEdit message.
   * @param message Plain object to verify
   * @returns `null` if valid, otherwise the reason why it is not
   */
  public static verify(message: {[k: string]: any}): string | null;

  /**
   * Creates a MessageEdit message from a plain object. Also converts values to their respective internal types.
   * @param object Plain object
   * @returns MessageEdit
   */
  public static fromObject(object: {[k: string]: any}): MessageEdit;

  /**
   * Creates a plain object from a MessageEdit message. Also converts values to other types if specified.
   * @param message MessageEdit
   * @param [options] Conversion options
   * @returns Plain object
   */
  public static toObject(message: MessageEdit, options?: $protobuf.IConversionOptions): {[k: string]: any};

  /**
   * Converts this MessageEdit to JSON.
   * @returns JSON object
   */
  public toJSON(): {[k: string]: any};
}

/** Properties of a Confirmation. */
export interface IConfirmation {
  /** Confirmation type */
  type: Confirmation.Type;

  /** Confirmation firstMessageId */
  firstMessageId: string;

  /** Confirmation moreMessageIds */
  moreMessageIds?: string[] | null;
}

/** Represents a Confirmation. */
export class Confirmation implements IConfirmation {
  /**
   * Constructs a new Confirmation.
   * @param [properties] Properties to set
   */
  constructor(properties?: IConfirmation);

  /** Confirmation type. */
  public type: Confirmation.Type;

  /** Confirmation firstMessageId. */
  public firstMessageId: string;

  /** Confirmation moreMessageIds. */
  public moreMessageIds: string[];

  /**
   * Creates a new Confirmation instance using the specified properties.
   * @param [properties] Properties to set
   * @returns Confirmation instance
   */
  public static create(properties?: IConfirmation): Confirmation;

  /**
   * Encodes the specified Confirmation message. Does not implicitly {@link Confirmation.verify|verify} messages.
   * @param message Confirmation message or plain object to encode
   * @param [writer] Writer to encode to
   * @returns Writer
   */
  public static encode(message: IConfirmation, writer?: $protobuf.Writer): $protobuf.Writer;

  /**
   * Encodes the specified Confirmation message, length delimited. Does not implicitly {@link Confirmation.verify|verify} messages.
   * @param message Confirmation message or plain object to encode
   * @param [writer] Writer to encode to
   * @returns Writer
   */
  public static encodeDelimited(message: IConfirmation, writer?: $protobuf.Writer): $protobuf.Writer;

  /**
   * Decodes a Confirmation message from the specified reader or buffer.
   * @param reader Reader or buffer to decode from
   * @param [length] Message length if known beforehand
   * @returns Confirmation
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): Confirmation;

  /**
   * Decodes a Confirmation message from the specified reader or buffer, length delimited.
   * @param reader Reader or buffer to decode from
   * @returns Confirmation
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): Confirmation;

  /**
   * Verifies a Confirmation message.
   * @param message Plain object to verify
   * @returns `null` if valid, otherwise the reason why it is not
   */
  public static verify(message: {[k: string]: any}): string | null;

  /**
   * Creates a Confirmation message from a plain object. Also converts values to their respective internal types.
   * @param object Plain object
   * @returns Confirmation
   */
  public static fromObject(object: {[k: string]: any}): Confirmation;

  /**
   * Creates a plain object from a Confirmation message. Also converts values to other types if specified.
   * @param message Confirmation
   * @param [options] Conversion options
   * @returns Plain object
   */
  public static toObject(message: Confirmation, options?: $protobuf.IConversionOptions): {[k: string]: any};

  /**
   * Converts this Confirmation to JSON.
   * @returns JSON object
   */
  public toJSON(): {[k: string]: any};
}

export namespace Confirmation {
  /** Type enum. */
  enum Type {
    DELIVERED = 0,
    READ = 1,
  }
}

/** Properties of a Location. */
export interface ILocation {
  /** Location longitude */
  longitude: number;

  /** Location latitude */
  latitude: number;

  /** Location name */
  name?: string | null;

  /** Location zoom */
  zoom?: number | null;
}

/** Represents a Location. */
export class Location implements ILocation {
  /**
   * Constructs a new Location.
   * @param [properties] Properties to set
   */
  constructor(properties?: ILocation);

  /** Location longitude. */
  public longitude: number;

  /** Location latitude. */
  public latitude: number;

  /** Location name. */
  public name: string;

  /** Location zoom. */
  public zoom: number;

  /**
   * Creates a new Location instance using the specified properties.
   * @param [properties] Properties to set
   * @returns Location instance
   */
  public static create(properties?: ILocation): Location;

  /**
   * Encodes the specified Location message. Does not implicitly {@link Location.verify|verify} messages.
   * @param message Location message or plain object to encode
   * @param [writer] Writer to encode to
   * @returns Writer
   */
  public static encode(message: ILocation, writer?: $protobuf.Writer): $protobuf.Writer;

  /**
   * Encodes the specified Location message, length delimited. Does not implicitly {@link Location.verify|verify} messages.
   * @param message Location message or plain object to encode
   * @param [writer] Writer to encode to
   * @returns Writer
   */
  public static encodeDelimited(message: ILocation, writer?: $protobuf.Writer): $protobuf.Writer;

  /**
   * Decodes a Location message from the specified reader or buffer.
   * @param reader Reader or buffer to decode from
   * @param [length] Message length if known beforehand
   * @returns Location
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): Location;

  /**
   * Decodes a Location message from the specified reader or buffer, length delimited.
   * @param reader Reader or buffer to decode from
   * @returns Location
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): Location;

  /**
   * Verifies a Location message.
   * @param message Plain object to verify
   * @returns `null` if valid, otherwise the reason why it is not
   */
  public static verify(message: {[k: string]: any}): string | null;

  /**
   * Creates a Location message from a plain object. Also converts values to their respective internal types.
   * @param object Plain object
   * @returns Location
   */
  public static fromObject(object: {[k: string]: any}): Location;

  /**
   * Creates a plain object from a Location message. Also converts values to other types if specified.
   * @param message Location
   * @param [options] Conversion options
   * @returns Plain object
   */
  public static toObject(message: Location, options?: $protobuf.IConversionOptions): {[k: string]: any};

  /**
   * Converts this Location to JSON.
   * @returns JSON object
   */
  public toJSON(): {[k: string]: any};
}

/** Properties of an ImageAsset. */
export interface IImageAsset {
  /** ImageAsset tag */
  tag: string;

  /** ImageAsset width */
  width: number;

  /** ImageAsset height */
  height: number;

  /** ImageAsset originalWidth */
  originalWidth: number;

  /** ImageAsset originalHeight */
  originalHeight: number;

  /** ImageAsset mimeType */
  mimeType: string;

  /** ImageAsset size */
  size: number;

  /** ImageAsset otrKey */
  otrKey?: Uint8Array | null;

  /** ImageAsset macKey */
  macKey?: Uint8Array | null;

  /** ImageAsset mac */
  mac?: Uint8Array | null;

  /** ImageAsset sha256 */
  sha256?: Uint8Array | null;
}

/** Represents an ImageAsset. */
export class ImageAsset implements IImageAsset {
  /**
   * Constructs a new ImageAsset.
   * @param [properties] Properties to set
   */
  constructor(properties?: IImageAsset);

  /** ImageAsset tag. */
  public tag: string;

  /** ImageAsset width. */
  public width: number;

  /** ImageAsset height. */
  public height: number;

  /** ImageAsset originalWidth. */
  public originalWidth: number;

  /** ImageAsset originalHeight. */
  public originalHeight: number;

  /** ImageAsset mimeType. */
  public mimeType: string;

  /** ImageAsset size. */
  public size: number;

  /** ImageAsset otrKey. */
  public otrKey: Uint8Array;

  /** ImageAsset macKey. */
  public macKey: Uint8Array;

  /** ImageAsset mac. */
  public mac: Uint8Array;

  /** ImageAsset sha256. */
  public sha256: Uint8Array;

  /**
   * Creates a new ImageAsset instance using the specified properties.
   * @param [properties] Properties to set
   * @returns ImageAsset instance
   */
  public static create(properties?: IImageAsset): ImageAsset;

  /**
   * Encodes the specified ImageAsset message. Does not implicitly {@link ImageAsset.verify|verify} messages.
   * @param message ImageAsset message or plain object to encode
   * @param [writer] Writer to encode to
   * @returns Writer
   */
  public static encode(message: IImageAsset, writer?: $protobuf.Writer): $protobuf.Writer;

  /**
   * Encodes the specified ImageAsset message, length delimited. Does not implicitly {@link ImageAsset.verify|verify} messages.
   * @param message ImageAsset message or plain object to encode
   * @param [writer] Writer to encode to
   * @returns Writer
   */
  public static encodeDelimited(message: IImageAsset, writer?: $protobuf.Writer): $protobuf.Writer;

  /**
   * Decodes an ImageAsset message from the specified reader or buffer.
   * @param reader Reader or buffer to decode from
   * @param [length] Message length if known beforehand
   * @returns ImageAsset
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): ImageAsset;

  /**
   * Decodes an ImageAsset message from the specified reader or buffer, length delimited.
   * @param reader Reader or buffer to decode from
   * @returns ImageAsset
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): ImageAsset;

  /**
   * Verifies an ImageAsset message.
   * @param message Plain object to verify
   * @returns `null` if valid, otherwise the reason why it is not
   */
  public static verify(message: {[k: string]: any}): string | null;

  /**
   * Creates an ImageAsset message from a plain object. Also converts values to their respective internal types.
   * @param object Plain object
   * @returns ImageAsset
   */
  public static fromObject(object: {[k: string]: any}): ImageAsset;

  /**
   * Creates a plain object from an ImageAsset message. Also converts values to other types if specified.
   * @param message ImageAsset
   * @param [options] Conversion options
   * @returns Plain object
   */
  public static toObject(message: ImageAsset, options?: $protobuf.IConversionOptions): {[k: string]: any};

  /**
   * Converts this ImageAsset to JSON.
   * @returns JSON object
   */
  public toJSON(): {[k: string]: any};
}

/** Properties of an Asset. */
export interface IAsset {
  /** Asset original */
  original?: Asset.IOriginal | null;

  /** Asset notUploaded */
  notUploaded?: Asset.NotUploaded | null;

  /** Asset uploaded */
  uploaded?: Asset.IRemoteData | null;

  /** Asset preview */
  preview?: Asset.IPreview | null;
}

/** Represents an Asset. */
export class Asset implements IAsset {
  /**
   * Constructs a new Asset.
   * @param [properties] Properties to set
   */
  constructor(properties?: IAsset);

  /** Asset original. */
  public original?: Asset.IOriginal | null;

  /** Asset notUploaded. */
  public notUploaded: Asset.NotUploaded;

  /** Asset uploaded. */
  public uploaded?: Asset.IRemoteData | null;

  /** Asset preview. */
  public preview?: Asset.IPreview | null;

  /** Asset status. */
  public status?: 'notUploaded' | 'uploaded';

  /**
   * Creates a new Asset instance using the specified properties.
   * @param [properties] Properties to set
   * @returns Asset instance
   */
  public static create(properties?: IAsset): Asset;

  /**
   * Encodes the specified Asset message. Does not implicitly {@link Asset.verify|verify} messages.
   * @param message Asset message or plain object to encode
   * @param [writer] Writer to encode to
   * @returns Writer
   */
  public static encode(message: IAsset, writer?: $protobuf.Writer): $protobuf.Writer;

  /**
   * Encodes the specified Asset message, length delimited. Does not implicitly {@link Asset.verify|verify} messages.
   * @param message Asset message or plain object to encode
   * @param [writer] Writer to encode to
   * @returns Writer
   */
  public static encodeDelimited(message: IAsset, writer?: $protobuf.Writer): $protobuf.Writer;

  /**
   * Decodes an Asset message from the specified reader or buffer.
   * @param reader Reader or buffer to decode from
   * @param [length] Message length if known beforehand
   * @returns Asset
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): Asset;

  /**
   * Decodes an Asset message from the specified reader or buffer, length delimited.
   * @param reader Reader or buffer to decode from
   * @returns Asset
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): Asset;

  /**
   * Verifies an Asset message.
   * @param message Plain object to verify
   * @returns `null` if valid, otherwise the reason why it is not
   */
  public static verify(message: {[k: string]: any}): string | null;

  /**
   * Creates an Asset message from a plain object. Also converts values to their respective internal types.
   * @param object Plain object
   * @returns Asset
   */
  public static fromObject(object: {[k: string]: any}): Asset;

  /**
   * Creates a plain object from an Asset message. Also converts values to other types if specified.
   * @param message Asset
   * @param [options] Conversion options
   * @returns Plain object
   */
  public static toObject(message: Asset, options?: $protobuf.IConversionOptions): {[k: string]: any};

  /**
   * Converts this Asset to JSON.
   * @returns JSON object
   */
  public toJSON(): {[k: string]: any};
}

export namespace Asset {
  /** Properties of an Original. */
  interface IOriginal {
    /** Original mimeType */
    mimeType: string;

    /** Original size */
    size: number | Long;

    /** Original name */
    name?: string | null;

    /** Original image */
    image?: Asset.IImageMetaData | null;

    /** Original video */
    video?: Asset.IVideoMetaData | null;

    /** Original audio */
    audio?: Asset.IAudioMetaData | null;

    /** Original source */
    source?: string | null;

    /** Original caption */
    caption?: string | null;
  }

  /** Represents an Original. */
  class Original implements IOriginal {
    /**
     * Constructs a new Original.
     * @param [properties] Properties to set
     */
    constructor(properties?: Asset.IOriginal);

    /** Original mimeType. */
    public mimeType: string;

    /** Original size. */
    public size: number | Long;

    /** Original name. */
    public name: string;

    /** Original image. */
    public image?: Asset.IImageMetaData | null;

    /** Original video. */
    public video?: Asset.IVideoMetaData | null;

    /** Original audio. */
    public audio?: Asset.IAudioMetaData | null;

    /** Original source. */
    public source: string;

    /** Original caption. */
    public caption: string;

    /** Original metaData. */
    public metaData?: 'image' | 'video' | 'audio';

    /**
     * Creates a new Original instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Original instance
     */
    public static create(properties?: Asset.IOriginal): Asset.Original;

    /**
     * Encodes the specified Original message. Does not implicitly {@link Asset.Original.verify|verify} messages.
     * @param message Original message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: Asset.IOriginal, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Original message, length delimited. Does not implicitly {@link Asset.Original.verify|verify} messages.
     * @param message Original message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: Asset.IOriginal, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes an Original message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Original
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): Asset.Original;

    /**
     * Decodes an Original message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Original
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): Asset.Original;

    /**
     * Verifies an Original message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: {[k: string]: any}): string | null;

    /**
     * Creates an Original message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Original
     */
    public static fromObject(object: {[k: string]: any}): Asset.Original;

    /**
     * Creates a plain object from an Original message. Also converts values to other types if specified.
     * @param message Original
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: Asset.Original, options?: $protobuf.IConversionOptions): {[k: string]: any};

    /**
     * Converts this Original to JSON.
     * @returns JSON object
     */
    public toJSON(): {[k: string]: any};
  }

  /** Properties of a Preview. */
  interface IPreview {
    /** Preview mimeType */
    mimeType: string;

    /** Preview size */
    size: number | Long;

    /** Preview remote */
    remote?: Asset.IRemoteData | null;

    /** Preview image */
    image?: Asset.IImageMetaData | null;
  }

  /** Represents a Preview. */
  class Preview implements IPreview {
    /**
     * Constructs a new Preview.
     * @param [properties] Properties to set
     */
    constructor(properties?: Asset.IPreview);

    /** Preview mimeType. */
    public mimeType: string;

    /** Preview size. */
    public size: number | Long;

    /** Preview remote. */
    public remote?: Asset.IRemoteData | null;

    /** Preview image. */
    public image?: Asset.IImageMetaData | null;

    /** Preview metaData. */
    public metaData?: 'image';

    /**
     * Creates a new Preview instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Preview instance
     */
    public static create(properties?: Asset.IPreview): Asset.Preview;

    /**
     * Encodes the specified Preview message. Does not implicitly {@link Asset.Preview.verify|verify} messages.
     * @param message Preview message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: Asset.IPreview, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Preview message, length delimited. Does not implicitly {@link Asset.Preview.verify|verify} messages.
     * @param message Preview message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: Asset.IPreview, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a Preview message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Preview
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): Asset.Preview;

    /**
     * Decodes a Preview message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Preview
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): Asset.Preview;

    /**
     * Verifies a Preview message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: {[k: string]: any}): string | null;

    /**
     * Creates a Preview message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Preview
     */
    public static fromObject(object: {[k: string]: any}): Asset.Preview;

    /**
     * Creates a plain object from a Preview message. Also converts values to other types if specified.
     * @param message Preview
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: Asset.Preview, options?: $protobuf.IConversionOptions): {[k: string]: any};

    /**
     * Converts this Preview to JSON.
     * @returns JSON object
     */
    public toJSON(): {[k: string]: any};
  }

  /** Properties of an ImageMetaData. */
  interface IImageMetaData {
    /** ImageMetaData width */
    width: number;

    /** ImageMetaData height */
    height: number;

    /** ImageMetaData tag */
    tag?: string | null;
  }

  /** Represents an ImageMetaData. */
  class ImageMetaData implements IImageMetaData {
    /**
     * Constructs a new ImageMetaData.
     * @param [properties] Properties to set
     */
    constructor(properties?: Asset.IImageMetaData);

    /** ImageMetaData width. */
    public width: number;

    /** ImageMetaData height. */
    public height: number;

    /** ImageMetaData tag. */
    public tag: string;

    /**
     * Creates a new ImageMetaData instance using the specified properties.
     * @param [properties] Properties to set
     * @returns ImageMetaData instance
     */
    public static create(properties?: Asset.IImageMetaData): Asset.ImageMetaData;

    /**
     * Encodes the specified ImageMetaData message. Does not implicitly {@link Asset.ImageMetaData.verify|verify} messages.
     * @param message ImageMetaData message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: Asset.IImageMetaData, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified ImageMetaData message, length delimited. Does not implicitly {@link Asset.ImageMetaData.verify|verify} messages.
     * @param message ImageMetaData message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: Asset.IImageMetaData, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes an ImageMetaData message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns ImageMetaData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): Asset.ImageMetaData;

    /**
     * Decodes an ImageMetaData message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns ImageMetaData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): Asset.ImageMetaData;

    /**
     * Verifies an ImageMetaData message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: {[k: string]: any}): string | null;

    /**
     * Creates an ImageMetaData message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns ImageMetaData
     */
    public static fromObject(object: {[k: string]: any}): Asset.ImageMetaData;

    /**
     * Creates a plain object from an ImageMetaData message. Also converts values to other types if specified.
     * @param message ImageMetaData
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: Asset.ImageMetaData, options?: $protobuf.IConversionOptions): {[k: string]: any};

    /**
     * Converts this ImageMetaData to JSON.
     * @returns JSON object
     */
    public toJSON(): {[k: string]: any};
  }

  /** Properties of a VideoMetaData. */
  interface IVideoMetaData {
    /** VideoMetaData width */
    width?: number | null;

    /** VideoMetaData height */
    height?: number | null;

    /** VideoMetaData durationInMillis */
    durationInMillis?: number | Long | null;
  }

  /** Represents a VideoMetaData. */
  class VideoMetaData implements IVideoMetaData {
    /**
     * Constructs a new VideoMetaData.
     * @param [properties] Properties to set
     */
    constructor(properties?: Asset.IVideoMetaData);

    /** VideoMetaData width. */
    public width: number;

    /** VideoMetaData height. */
    public height: number;

    /** VideoMetaData durationInMillis. */
    public durationInMillis: number | Long;

    /**
     * Creates a new VideoMetaData instance using the specified properties.
     * @param [properties] Properties to set
     * @returns VideoMetaData instance
     */
    public static create(properties?: Asset.IVideoMetaData): Asset.VideoMetaData;

    /**
     * Encodes the specified VideoMetaData message. Does not implicitly {@link Asset.VideoMetaData.verify|verify} messages.
     * @param message VideoMetaData message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: Asset.IVideoMetaData, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified VideoMetaData message, length delimited. Does not implicitly {@link Asset.VideoMetaData.verify|verify} messages.
     * @param message VideoMetaData message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: Asset.IVideoMetaData, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a VideoMetaData message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns VideoMetaData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): Asset.VideoMetaData;

    /**
     * Decodes a VideoMetaData message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns VideoMetaData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): Asset.VideoMetaData;

    /**
     * Verifies a VideoMetaData message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: {[k: string]: any}): string | null;

    /**
     * Creates a VideoMetaData message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns VideoMetaData
     */
    public static fromObject(object: {[k: string]: any}): Asset.VideoMetaData;

    /**
     * Creates a plain object from a VideoMetaData message. Also converts values to other types if specified.
     * @param message VideoMetaData
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: Asset.VideoMetaData, options?: $protobuf.IConversionOptions): {[k: string]: any};

    /**
     * Converts this VideoMetaData to JSON.
     * @returns JSON object
     */
    public toJSON(): {[k: string]: any};
  }

  /** Properties of an AudioMetaData. */
  interface IAudioMetaData {
    /** AudioMetaData durationInMillis */
    durationInMillis?: number | Long | null;

    /** AudioMetaData normalizedLoudness */
    normalizedLoudness?: Uint8Array | null;
  }

  /** Represents an AudioMetaData. */
  class AudioMetaData implements IAudioMetaData {
    /**
     * Constructs a new AudioMetaData.
     * @param [properties] Properties to set
     */
    constructor(properties?: Asset.IAudioMetaData);

    /** AudioMetaData durationInMillis. */
    public durationInMillis: number | Long;

    /** AudioMetaData normalizedLoudness. */
    public normalizedLoudness: Uint8Array;

    /**
     * Creates a new AudioMetaData instance using the specified properties.
     * @param [properties] Properties to set
     * @returns AudioMetaData instance
     */
    public static create(properties?: Asset.IAudioMetaData): Asset.AudioMetaData;

    /**
     * Encodes the specified AudioMetaData message. Does not implicitly {@link Asset.AudioMetaData.verify|verify} messages.
     * @param message AudioMetaData message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: Asset.IAudioMetaData, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified AudioMetaData message, length delimited. Does not implicitly {@link Asset.AudioMetaData.verify|verify} messages.
     * @param message AudioMetaData message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: Asset.IAudioMetaData, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes an AudioMetaData message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns AudioMetaData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): Asset.AudioMetaData;

    /**
     * Decodes an AudioMetaData message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns AudioMetaData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): Asset.AudioMetaData;

    /**
     * Verifies an AudioMetaData message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: {[k: string]: any}): string | null;

    /**
     * Creates an AudioMetaData message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns AudioMetaData
     */
    public static fromObject(object: {[k: string]: any}): Asset.AudioMetaData;

    /**
     * Creates a plain object from an AudioMetaData message. Also converts values to other types if specified.
     * @param message AudioMetaData
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: Asset.AudioMetaData, options?: $protobuf.IConversionOptions): {[k: string]: any};

    /**
     * Converts this AudioMetaData to JSON.
     * @returns JSON object
     */
    public toJSON(): {[k: string]: any};
  }

  /** NotUploaded enum. */
  enum NotUploaded {
    CANCELLED = 0,
    FAILED = 1,
  }

  /** Properties of a RemoteData. */
  interface IRemoteData {
    /** RemoteData otrKey */
    otrKey: Uint8Array;

    /** RemoteData sha256 */
    sha256: Uint8Array;

    /** RemoteData assetId */
    assetId?: string | null;

    /** RemoteData assetToken */
    assetToken?: string | null;

    /** RemoteData encryption */
    encryption?: EncryptionAlgorithm | null;
  }

  /** Represents a RemoteData. */
  class RemoteData implements IRemoteData {
    /**
     * Constructs a new RemoteData.
     * @param [properties] Properties to set
     */
    constructor(properties?: Asset.IRemoteData);

    /** RemoteData otrKey. */
    public otrKey: Uint8Array;

    /** RemoteData sha256. */
    public sha256: Uint8Array;

    /** RemoteData assetId. */
    public assetId: string;

    /** RemoteData assetToken. */
    public assetToken: string;

    /** RemoteData encryption. */
    public encryption: EncryptionAlgorithm;

    /**
     * Creates a new RemoteData instance using the specified properties.
     * @param [properties] Properties to set
     * @returns RemoteData instance
     */
    public static create(properties?: Asset.IRemoteData): Asset.RemoteData;

    /**
     * Encodes the specified RemoteData message. Does not implicitly {@link Asset.RemoteData.verify|verify} messages.
     * @param message RemoteData message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: Asset.IRemoteData, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified RemoteData message, length delimited. Does not implicitly {@link Asset.RemoteData.verify|verify} messages.
     * @param message RemoteData message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: Asset.IRemoteData, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a RemoteData message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns RemoteData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): Asset.RemoteData;

    /**
     * Decodes a RemoteData message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns RemoteData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): Asset.RemoteData;

    /**
     * Verifies a RemoteData message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: {[k: string]: any}): string | null;

    /**
     * Creates a RemoteData message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns RemoteData
     */
    public static fromObject(object: {[k: string]: any}): Asset.RemoteData;

    /**
     * Creates a plain object from a RemoteData message. Also converts values to other types if specified.
     * @param message RemoteData
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: Asset.RemoteData, options?: $protobuf.IConversionOptions): {[k: string]: any};

    /**
     * Converts this RemoteData to JSON.
     * @returns JSON object
     */
    public toJSON(): {[k: string]: any};
  }
}

/** Properties of an External. */
export interface IExternal {
  /** External otrKey */
  otrKey: Uint8Array;

  /** External sha256 */
  sha256?: Uint8Array | null;

  /** External encryption */
  encryption?: EncryptionAlgorithm | null;
}

/** Represents an External. */
export class External implements IExternal {
  /**
   * Constructs a new External.
   * @param [properties] Properties to set
   */
  constructor(properties?: IExternal);

  /** External otrKey. */
  public otrKey: Uint8Array;

  /** External sha256. */
  public sha256: Uint8Array;

  /** External encryption. */
  public encryption: EncryptionAlgorithm;

  /**
   * Creates a new External instance using the specified properties.
   * @param [properties] Properties to set
   * @returns External instance
   */
  public static create(properties?: IExternal): External;

  /**
   * Encodes the specified External message. Does not implicitly {@link External.verify|verify} messages.
   * @param message External message or plain object to encode
   * @param [writer] Writer to encode to
   * @returns Writer
   */
  public static encode(message: IExternal, writer?: $protobuf.Writer): $protobuf.Writer;

  /**
   * Encodes the specified External message, length delimited. Does not implicitly {@link External.verify|verify} messages.
   * @param message External message or plain object to encode
   * @param [writer] Writer to encode to
   * @returns Writer
   */
  public static encodeDelimited(message: IExternal, writer?: $protobuf.Writer): $protobuf.Writer;

  /**
   * Decodes an External message from the specified reader or buffer.
   * @param reader Reader or buffer to decode from
   * @param [length] Message length if known beforehand
   * @returns External
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): External;

  /**
   * Decodes an External message from the specified reader or buffer, length delimited.
   * @param reader Reader or buffer to decode from
   * @returns External
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): External;

  /**
   * Verifies an External message.
   * @param message Plain object to verify
   * @returns `null` if valid, otherwise the reason why it is not
   */
  public static verify(message: {[k: string]: any}): string | null;

  /**
   * Creates an External message from a plain object. Also converts values to their respective internal types.
   * @param object Plain object
   * @returns External
   */
  public static fromObject(object: {[k: string]: any}): External;

  /**
   * Creates a plain object from an External message. Also converts values to other types if specified.
   * @param message External
   * @param [options] Conversion options
   * @returns Plain object
   */
  public static toObject(message: External, options?: $protobuf.IConversionOptions): {[k: string]: any};

  /**
   * Converts this External to JSON.
   * @returns JSON object
   */
  public toJSON(): {[k: string]: any};
}

/** Properties of a Reaction. */
export interface IReaction {
  /** Reaction emoji */
  emoji?: string | null;

  /** Reaction messageId */
  messageId: string;
}

/** Represents a Reaction. */
export class Reaction implements IReaction {
  /**
   * Constructs a new Reaction.
   * @param [properties] Properties to set
   */
  constructor(properties?: IReaction);

  /** Reaction emoji. */
  public emoji: string;

  /** Reaction messageId. */
  public messageId: string;

  /**
   * Creates a new Reaction instance using the specified properties.
   * @param [properties] Properties to set
   * @returns Reaction instance
   */
  public static create(properties?: IReaction): Reaction;

  /**
   * Encodes the specified Reaction message. Does not implicitly {@link Reaction.verify|verify} messages.
   * @param message Reaction message or plain object to encode
   * @param [writer] Writer to encode to
   * @returns Writer
   */
  public static encode(message: IReaction, writer?: $protobuf.Writer): $protobuf.Writer;

  /**
   * Encodes the specified Reaction message, length delimited. Does not implicitly {@link Reaction.verify|verify} messages.
   * @param message Reaction message or plain object to encode
   * @param [writer] Writer to encode to
   * @returns Writer
   */
  public static encodeDelimited(message: IReaction, writer?: $protobuf.Writer): $protobuf.Writer;

  /**
   * Decodes a Reaction message from the specified reader or buffer.
   * @param reader Reader or buffer to decode from
   * @param [length] Message length if known beforehand
   * @returns Reaction
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): Reaction;

  /**
   * Decodes a Reaction message from the specified reader or buffer, length delimited.
   * @param reader Reader or buffer to decode from
   * @returns Reaction
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): Reaction;

  /**
   * Verifies a Reaction message.
   * @param message Plain object to verify
   * @returns `null` if valid, otherwise the reason why it is not
   */
  public static verify(message: {[k: string]: any}): string | null;

  /**
   * Creates a Reaction message from a plain object. Also converts values to their respective internal types.
   * @param object Plain object
   * @returns Reaction
   */
  public static fromObject(object: {[k: string]: any}): Reaction;

  /**
   * Creates a plain object from a Reaction message. Also converts values to other types if specified.
   * @param message Reaction
   * @param [options] Conversion options
   * @returns Plain object
   */
  public static toObject(message: Reaction, options?: $protobuf.IConversionOptions): {[k: string]: any};

  /**
   * Converts this Reaction to JSON.
   * @returns JSON object
   */
  public toJSON(): {[k: string]: any};
}

/** ClientAction enum. */
export enum ClientAction {
  RESET_SESSION = 0,
}

/** Properties of a Calling. */
export interface ICalling {
  /** Calling content */
  content: string;
}

/** Represents a Calling. */
export class Calling implements ICalling {
  /**
   * Constructs a new Calling.
   * @param [properties] Properties to set
   */
  constructor(properties?: ICalling);

  /** Calling content. */
  public content: string;

  /**
   * Creates a new Calling instance using the specified properties.
   * @param [properties] Properties to set
   * @returns Calling instance
   */
  public static create(properties?: ICalling): Calling;

  /**
   * Encodes the specified Calling message. Does not implicitly {@link Calling.verify|verify} messages.
   * @param message Calling message or plain object to encode
   * @param [writer] Writer to encode to
   * @returns Writer
   */
  public static encode(message: ICalling, writer?: $protobuf.Writer): $protobuf.Writer;

  /**
   * Encodes the specified Calling message, length delimited. Does not implicitly {@link Calling.verify|verify} messages.
   * @param message Calling message or plain object to encode
   * @param [writer] Writer to encode to
   * @returns Writer
   */
  public static encodeDelimited(message: ICalling, writer?: $protobuf.Writer): $protobuf.Writer;

  /**
   * Decodes a Calling message from the specified reader or buffer.
   * @param reader Reader or buffer to decode from
   * @param [length] Message length if known beforehand
   * @returns Calling
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): Calling;

  /**
   * Decodes a Calling message from the specified reader or buffer, length delimited.
   * @param reader Reader or buffer to decode from
   * @returns Calling
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): Calling;

  /**
   * Verifies a Calling message.
   * @param message Plain object to verify
   * @returns `null` if valid, otherwise the reason why it is not
   */
  public static verify(message: {[k: string]: any}): string | null;

  /**
   * Creates a Calling message from a plain object. Also converts values to their respective internal types.
   * @param object Plain object
   * @returns Calling
   */
  public static fromObject(object: {[k: string]: any}): Calling;

  /**
   * Creates a plain object from a Calling message. Also converts values to other types if specified.
   * @param message Calling
   * @param [options] Conversion options
   * @returns Plain object
   */
  public static toObject(message: Calling, options?: $protobuf.IConversionOptions): {[k: string]: any};

  /**
   * Converts this Calling to JSON.
   * @returns JSON object
   */
  public toJSON(): {[k: string]: any};
}

/** EncryptionAlgorithm enum. */
export enum EncryptionAlgorithm {
  AES_CBC = 0,
  AES_GCM = 1,
}
