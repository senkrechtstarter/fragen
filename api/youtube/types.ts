export interface Message {
  kind: "youtube#liveChatMessage";
  etag: string;
  id: string;
  snippet: {
    type:
      | "chatEndedEvent"
      | "messageDeletedEvent"
      | "sponsorOnlyModeEndedEvent"
      | "sponsorOnlyModeStartedEvent"
      | "newSponsorEvent"
      | "memberMilestoneChatEvent"
      | "superChatEvent"
      | "superStickerEvent"
      | "textMessageEvent"
      | "tombstone"
      | "userBannedEvent"
      | "membershipGiftingEvent"
      | "giftMembershipReceivedEvent";
    liveChatId: string;
    authorChannelId: string;
    publishedAt: string;
    hasDisplayContent: boolean;
    displayMessage: string;
    textMessageDetails?: {
      messageText: string;
    };
    memberMilestoneChatDetails?: {
      userComment: string;
      memberMonth: number;
      memberLevelName: string;
    };
    superChatDetails?: {
      amountMicros: number;
      currency: string;
      amountDisplayString: string;
      userComment: string;
      tier: number;
    };
    membershipGiftingDetails?: {
      giftMembershipsCount: number
      giftMembershipsLevelName: string
    },
    superStickerDetails?: {
      amountMicros: string,
      currency: string,
      amountDisplayString: string,
      tier: 3,
      superStickerMetadata: {
        stickerId: string,
        altText: string,
        altTextLanguage: string
      }
    }
  };
  authorDetails: {
    channelId: string;
    channelUrl: string;
    displayName: string;
    profileImageUrl: string;
    isVerified: boolean;
    isChatOwner: boolean;
    isChatSponsor: boolean;
    isChatModerator: boolean;
  };
}

export interface DATA2 {
  kind: string;
  etag: string;
  pollingIntervalMillis: number;
  pageInfo: { totalResults: number; resultsPerPage: number };
  nextPageToken: string;
  items: Message[];
}
