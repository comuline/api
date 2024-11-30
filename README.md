# @comuline/api

An API to get the schedule of KRL commuter line in Jakarta and Yogyakarta using [Hono](https://hono.dev/) and [Bun](https://bun.sh/), deployed to [Cloudflare Workers](https://workers.cloudflare.com/). This API is primarily used on the [web app](https://comuline.com/) ([source code](https://github.com/comuline/web)).

### How does it work?

This API uses a daily cron job (at 00:00) to fetch the schedule of KRL commuter line in Jakarta and Yogyakarta from the official website of PT. KAI. The data is then processed and stored in a PostgreSQL database and cached in a Redis (for every once read request). All endpoints can be found in the [docs](https://www.api.comuline.com/docs).

### Technology stacks

1. [Hono](https://hono.dev/) API framework
2. [Bun](https://bun.sh/) runtime
3. (Serverless) PostgresSQL ([Neon](https://neon.tech/))
4. (Serverless) Redis ([Upstash](https://upstash.com/))
5. [Cloudflare Workers](https://workers.cloudflare.com/) deployment platform
6. [Drizzle](https://orm.drizzle.team/) ORM

## Getting Started

### Development

1. Clone the repository

```bash
git clone https://github.com/comuline/api.git
```

2. Install the dependencies

```bash
bun install
```

3. Copy the `.dev.example.vars` to `.dev.vars`

```
cp .dev.example.vars .dev.vars
```

4. Generate `UPSTASH_REDIS_REST_TOKEN` using `openssl rand -hex 32` and copy it to your `.dev.vars` file

5. Run database locally

```bash
docker-compose up -d
```

6. Run the database migration

```bash
bun run migrate:apply
```

7. Sync the data and populate it into your local database (once only as you needed)

```bash
# Please do this in order
# 1. Sync station data and wait until it's done
bun run sync:station
# 2. Sync schedule data
bun run sync:schedule
```

### Deployment

1. Create a new PostgreSQL database in [Neon](https://neon.tech/) and copy the connection string value as `DATABASE_URL` in your `.production.vars` file

2. Run the database migration

```bash
bun run migrate:apply
```

3. Sync the data and populate it into your remote database (once only as you needed)

```bash
# Please do this in order
# 1. Sync station data and wait until it's done
bun run sync:station
# 2. Sync schedule data
bun run sync:schedule
```

4. Add `COMULINE_ENV` to your `.production.vars` file

```
COMULINE_ENV=production
```

5. Create a new Redis database in [Upstash](https://upstash.com/) and copy the value of `UPSTASH_REDIS_REST_TOKEN` and `UPSTASH_REDIS_REST_URL` to your `.production.vars` file

6. Save your `.production.vars` file to your environment variables in your Cloudflare Workers using `wrangler`

```bash
bunx wrangler secret put --env production $(cat .production.vars)
```

6. Deploy the API to Cloudflare Workers

```bash
bun run deploy
```

### Database schema

> TBD
