FROM denoland/deno:1.22.0

ENV T_API_KEY = ''
ENV T_API_TOKEN = ''
ENV T_LIST_ID = ''

WORKDIR /app
USER deno

ADD . .

CMD ["run", "--allow-net", '--allow-env', "mod.ts"]