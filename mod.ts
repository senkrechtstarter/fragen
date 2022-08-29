import { getLiveID } from "./api/youtube/youtube.ts";
import { Handler } from "./chatHandler.ts";
import { setStatus } from "./api/trello/trello.ts";

let currentHandler: null | Handler = null;
const listener = Deno.listen({ port: 8080 });

console.log(`Listening on port 8080`);

setStatus("SKRIPT-STATUS: Neu gestartet - kein Stream verbunden");

for await (const connection of listener) {
  for await (const httpConnection of Deno.serveHttp(connection)) {
    const url = new URL(httpConnection.request.url);
    const id = url.searchParams.get("videoID");

    if (id) {
      if (id === "stop" || id === "") {
        currentHandler?.kill();
        currentHandler = null;
      } else if (id === "sperren") {
        if (currentHandler) {
          currentHandler.sperren(url.searchParams.get("user") as string);
        }
      } else {
        if (currentHandler && !currentHandler.killed) {
          currentHandler.kill();
        }
        console.log("SWITCHED TO HANDLER", id);
        currentHandler = new Handler(await getLiveID(id), id);
      }
    }

    httpConnection.respondWith(
      new Response(
        `
    <!DOCTYPE html>
    <html>
    <body>
      <h1>Aktueller Stream ${
          (currentHandler?.killed ? null : currentHandler?.videoID) ??
            " - Nicht Aktiv"
        }</h1>
      <p>MODE: ${currentHandler?.mode.join("|")}</p>
      <form>
        <input type="text" placeholder="VideoID (wie in URL)" name="videoID">
        <div style="margin-top:12px"></div>
        <button type="submit">aktivieren</button>
        <a href="/?videoID=stop">STOP!</a>
      </form>
      <form>
        <p>Nutzer für aktuellen Stream sperren:</p>
        <input type="text" placeholder="Benutzername" name="user">
        <input type="hidden" name="videoID" value="sperren">
        <button type="submit">Sperren</button>
      </form>
      <style>
        label {
          display: block;
          margin-top: 8px;
        }
        a {
          display: block;
          width: 50px;
          height: 50px;
          background-color: #ff0000;
          color: #fff;
          text-align: center;
          line-height: 50px;
        }
      </style>
      <script>
        history.replaceState({},'','/')
      </script>
    </body>
    </html>
    `,
        {
          headers: {
            "content-type": "text/html",
            "location": "/",
          },
        },
      ),
    );
  }
}
