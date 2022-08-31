FROM denoland/deno:1.25.0

ENV T_API_KEY = ''
ENV T_API_TOKEN = ''
ENV T_LIST_ID = ''

WORKDIR /app
USER deno

COPY . .

CMD ["run", "--unstable", "--allow-net", "--allow-env", "mod.ts"]
