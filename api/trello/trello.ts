import {
  T_API_KEY,
  T_API_TOKEN,
  T_LIST_ID,
  T_STATUS_CARD_ID,
} from "../../config.ts";

export function addCard(text: string) {
  const params = new URLSearchParams();
  params.set("token", T_API_TOKEN);
  params.set("key", T_API_KEY);
  params.set("idList", T_LIST_ID);

  params.set("pos", "bottom");
  params.set("name", text);

  return fetch("https://api.trello.com/1/cards?" + params.toString(), {
    method: "POST",
    headers: {
      "accept": "application/json",
    },
  });
}

export function setStatus(text: string) {
  const params = new URLSearchParams();
  params.set("token", T_API_TOKEN);
  params.set("key", T_API_KEY);

  params.set("name", text);

  return fetch(
    "https://api.trello.com/1/cards/" + T_STATUS_CARD_ID + "?" +
      params.toString(),
    {
      method: "PUT",
      headers: {
        "accept": "application/json",
      },
    },
  );
}
