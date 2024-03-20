FROM oven/bun

WORKDIR /app

COPY package.json .
COPY bun.lockb .

# TODO: RUN MIGRATION ON PRODUCTION, HOW TF DO I DO THAT?
RUN bun install

COPY src src
COPY tsconfig.json .

ENV NODE_ENV production

CMD ["bun", "src/index.ts"]

EXPOSE 3000