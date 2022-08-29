import { DATA2 } from "./types.ts";
import { YT_API_KEY } from "../../config.ts";

export async function getLiveID(id: string) {
  const params = new URLSearchParams();
  params.set("part", "liveStreamingDetails");
  params.set("key", YT_API_KEY);
  params.set("id", id);

  const response = await fetch(
    "https://www.googleapis.com/youtube/v3/videos?" + params.toString(),
  );
  const data = await response.json();

  if (!data.items) {
    console.log(data);
  }

  return data.items[0].liveStreamingDetails.activeLiveChatId as string;
}

export function getMSG(id: string, page: string | null) {
  const loadMSGParams = new URLSearchParams();

  loadMSGParams.set("key", YT_API_KEY);
  loadMSGParams.set("liveChatId", id);
  loadMSGParams.set("part", "id,snippet,authorDetails");
  loadMSGParams.set("maxResults", "500");
  if (page) {
    loadMSGParams.set("pageToken", page);
  }

  return fetch(
    "https://www.googleapis.com/youtube/v3/liveChat/messages?" +
      loadMSGParams.toString(),
  ).then((v) => v.json()) as Promise<DATA2>;
}
