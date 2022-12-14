FROM denoland/deno:1.22.0

ENV T_API_KEY = ''
ENV T_API_TOKEN = ''
ENV T_LIST_ID = ''
ENV T_STATUS_CARD_ID = ''
ENV YT_API_KEY = ''

WORKDIR /app
USER deno

ADD . .

CMD ["run", "--allow-net", "--allow-env", "mod.ts"]