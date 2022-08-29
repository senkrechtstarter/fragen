import { Message } from "./api/youtube/types.ts";
import { addCard, setStatus } from "./api/trello/trello.ts";
import { getMSG } from "./api/youtube/youtube.ts";
import { sleep } from "./helpers.ts";
import { DATA2 } from "./api/youtube/types.ts";
import { BLOCKED_USER, MODE } from "./config.ts";

const MIN_TIMEOUT = 16000;
export class Handler {
  lastMessageTime: string | null = null;
  killed = false;
  blocked: string[] = [];
  mode = MODE

  constructor(
    private chatID: string,
    public videoID: string,
  ) {
    setStatus("SKRIPT-STATUS: Stream mit VIDEO-ID " + videoID + "verbunden");
    this.handler = this.handler.bind(this);

    this.handler();
  }

  sperren(user: string) {
    this.blocked.push(user);
    console.log(this.blocked);
  }

  kill() {
    this.killed = true;
    setStatus("SKRIPT-STATUS: Kein Stream verbunden");
  }

  async handler() {
    console.log(this.lastMessageTime);
    let page = null;
    let last = "";
    while (true) {
      if (this.killed) return;

      const data: DATA2 = await getMSG(this.chatID, page);

      if (!data.items) {
        console.log(data);
        setTimeout(this.handler, data.pollingIntervalMillis);
        return;
      }

      data.items.sort((a, b) =>
        a.snippet.publishedAt > b.snippet.publishedAt ? -1 : 1
      );
      if (data.pollingIntervalMillis < MIN_TIMEOUT) {
        data.pollingIntervalMillis = MIN_TIMEOUT;
      }

      for (let i = 0; i < data.items.length; i++) {
        const el = data.items[i];

        if (
          this.lastMessageTime !== null &&
          el.snippet.publishedAt <= this.lastMessageTime
        ) {
          setTimeout(this.handler, data.pollingIntervalMillis);
          this.lastMessageTime = last || data.items[0]?.snippet.publishedAt ||
            this.lastMessageTime;
          page = null;
          return;
        }

        await this.handleMessage(el);
      }

      if (this.lastMessageTime === null) {
        setTimeout(this.handler, data.pollingIntervalMillis);
        this.lastMessageTime = last || data.items[0]?.snippet.publishedAt ||
          this.lastMessageTime;
        page = null;
        return;
      }

      page = data.nextPageToken;
      if (!last) {
        last = data.items[0]?.snippet.publishedAt;
      }
      console.log(data.pollingIntervalMillis);
      await sleep(data.pollingIntervalMillis);
    }
  }

  async handleMessage(msg: Message) {
    if (msg.snippet.type === "chatEndedEvent") {
      this.kill();
      return;
    }

    if (ignore.includes(msg.snippet.type)) {
      return;
    }

    if (BLOCKED_USER.includes(msg.authorDetails.displayName)) {
      return;
    }

    if (this.blocked.includes(msg.authorDetails.displayName)) {
      return;
    }

    let author = `${msg.authorDetails.displayName}${
      msg.authorDetails.isChatSponsor ? " | Member" : ""
    }`;

    let text: string | null = null;
    let isSuper = false;

    if (msg.snippet.type === "superChatEvent") {
      text = msg.snippet.superChatDetails!.userComment;
      author += ` (${msg.snippet.superChatDetails!.amountDisplayString})`;
      isSuper = true;
    }

    if (msg.snippet.type === "memberMilestoneChatEvent") {
      text = msg.snippet.memberMilestoneChatDetails!.userComment;
      author += `(${
        msg.snippet.memberMilestoneChatDetails!.memberLevelName
      } | ${msg.snippet.memberMilestoneChatDetails!.memberMonth})`;
      isSuper = true;
    }

    if (msg.snippet.type === "textMessageEvent") {
      text = msg.snippet.textMessageDetails!.messageText;
    }

    if (text && this.isFrage(text, isSuper)) {
      // Add to trello
      await addCard(`[${author}]: ${text}`);
    }
  }

  isFrage(text: string, isSuper: boolean) {
    if (isSuper) {
      return true;
    }

    const lText = text.toLowerCase();

    return this.mode.some((key) => {
      return lText.includes(key + " ") || lText.endsWith(key);
    });
  }
}

const ignore: Message["snippet"]["type"][] = [
  "membershipGiftingEvent",
  "tombstone",
  "userBannedEvent",
  "giftMembershipReceivedEvent",
  "newSponsorEvent",
  "sponsorOnlyModeStartedEvent",
  "sponsorOnlyModeEndedEvent",
  "messageDeletedEvent",
  "superStickerEvent",
];
