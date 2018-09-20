import {Connection} from '@wireapp/api-client/dist/commonjs/connection/';
import {ClientActionType} from '../root';
import {
  AssetContent,
  ClearedContent,
  ClientActionContent,
  ConfirmationContent,
  DeletedContent,
  EditedTextContent,
  FileAssetAbortContent,
  FileAssetContent,
  FileAssetMetaDataContent,
  HiddenContent,
  ImageAssetContent,
  ImageContent,
  LocationContent,
  ReactionContent,
  TextContent,
} from './index';

type ConversationContent =
  | AssetContent
  | ClearedContent
  | ClientActionContent
  | ClientActionType
  | ConfirmationContent
  | Connection
  | DeletedContent
  | EditedTextContent
  | FileAssetContent
  | FileAssetMetaDataContent
  | FileAssetAbortContent
  | HiddenContent
  | ImageAssetContent
  | ImageContent
  | LocationContent
  | ReactionContent
  | TextContent;

export {ConversationContent};
