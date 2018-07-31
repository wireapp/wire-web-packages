import {
  AssetContent,
  ClientActionContent,
  ConfirmationContent,
  DeletedContent,
  EditedTextContent,
  HiddenContent,
  ImageAssetContent,
  ImageContent,
  ReactionContent,
  TextContent,
} from './index';

type ConversationContent =
  | AssetContent
  | ClientActionContent
  | ConfirmationContent
  | DeletedContent
  | EditedTextContent
  | HiddenContent
  | ImageAssetContent
  | ImageContent
  | ReactionContent
  | TextContent;

export {ConversationContent};
