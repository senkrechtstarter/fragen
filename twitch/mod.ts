import { TwitchChat } from "https://deno.land/x/tmi/mod.ts";

const T_API_KEY = Deno.env.get("T_API_KEY")!;
const T_API_TOKEN = Deno.env.get("T_API_TOKEN")!;
const T_LIST_ID = Deno.env.get("T_LIST_ID")!;
const TWICH_CLIENT_ID = Deno.env.get("TWICH_CLIENT_ID")!;

const BAN_CMD = '!fragenBan '

const BLOCKED_USER = [
  "Nightbot",
];
const MODE = ["@mo", "@senkrecht", "@senkrechtstarter", '@arte', '@arte_tv', '@artetv', '@cedirc', '@doktorwhatson'];

function addCard(text: string) {
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


let running = false

Deno.serve((req) => {
  if(running) {
    return new Response(`
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Running | TWITCH-FRAGEN</title>
</head>
<body>
  <h1>Aktuell läuft die Fragenübertragung nach Trello!</h1>
</body>
</html>  
    `, {headers: {'Content-Type': 'text/html'}})
  }

  const url = new URL(req.url)
  const auth = url.searchParams.get('access_token')
  const user = url.searchParams.get('user')
  // const url = `https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=${TWICH_CLIENT_ID}&scope=chat%3Aread+chat%3Aedit&redirect_uri=http://localhost`;
  if(!auth || !user || auth === 'null') {
    return new Response(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Starten | TWITCH-FRAGEN</title>
    </head>
    <body>
      <h1>Starte die Fragenübertragung nach Trello!</h1>
      <div id="1">
        <button onclick="location.href = 'https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=${TWICH_CLIENT_ID}&scope=chat%3Aread+chat%3Aedit&redirect_uri=' + location.origin">Starten</button>
      </div>
      <div id="2" style="display: none">
        <input id="user" placeholder="Twich-Username">
        <button onclick="start()">START!</button>
      </div>

      <script>
      const auth = new URLSearchParams(location.hash.slice(1)).get('access_token')

      if(auth && auth !== 'null') {
        document.getElementById('1').style.display='none'
        document.getElementById('2').style.display='block'
      }

      function start() {
        location.href = \`\${location.origin}?access_token=\${auth}&user=\${document.getElementById('user').value}#access_token=\${auth}\`
      }
    </script>
    </body>
    </html> 
    `, {headers: {'Content-Type': 'text/html'}})
  } else {
      startTrello(auth, user)
      return new Response(`
      <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Gestartet | TWITCH-FRAGEN</title>
    </head>
    <body>
      <h1>Fragenübertragung nach Trello gestartet!</h1>
    </body>
    </html> `, {headers: {'Content-Type': 'text/html'}})
  }
}, {port: 80, hostname: '0.0.0.0'})

async function startTrello(oauth: string, username: string) {
  running = true
  const tc = new TwitchChat(oauth, username);
  await tc.connect();  

  const ch = tc.joinChannel('arte_tv')

  for await (const msg of ch) {
    console.log(msg.command)
    if(msg.command === 'PRIVMSG') {
      if(msg.badges.moderator) {
        msg.message.startsWith(BAN_CMD)
        BLOCKED_USER.push(msg.message.slice(BAN_CMD.length + 1).trim())
      }

      if(!BLOCKED_USER.includes(msg.username.trim())) {
        if(isFrage(msg.message)) {
          addCard(`[${msg.username}] ${msg.message}`)
        }
      }
    }
  }
}

function isFrage(frage: string) {
  frage = frage.toLowerCase()
  return   MODE.some(v => frage.includes(v + ' ') || frage.includes(v + '\n') || frage.endsWith(v))
}
