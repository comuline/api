# Jadwal KRL API

An API to get the schedule of KRL commuter line in Jakarta and Yogyakarta using [Elsyia](https://elysiajs.com/) and [Bun](https://bun.sh/), deployed to [Render](https://render.com/).

### How does it work?

This API uses a daily cron job (at 00:00) to fetch the schedule of KRL commuter line in Jakarta and Yogyakarta from the official website of PT. KAI. The data is then processed and stored in a PostgreSQL database and cached in a Redis (for every once read request). All endpoints can be found in the [docs](https://www.api.jadwal-krl.com/docs).

### Technology stacks

1. [Elsyia](https://elysiajs.com/) API framework
2. [Bun](https://bun.sh/) runtime
3. PostgresSQL ([Neon](https://neon.tech/))
4. Redis ([Upstash](https://upstash.com/))
5. [Render](https://render.com/) deployment platform
6. [Drizzle](https://orm.drizzle.team/) ORM

## Getting Started

### Development

1. Clone the repository

```bash
git clone https://github.com/abielzulio/jadwal-krl-api.git
```

2. Install the dependencies

```bash
bun install
```

3. Run database locally

```bash
docker-compose up -d
```

4. Copy the `.env.example` to `.env`

```
cp .env.example .env
```

5. Run the database migration

```bash
bun db:generate && bun db:migrate
```

6. Sync the data and populate it into your local database

```bash
# Please do this in order once
# 1. Sync station data and wait until it's done
curl --request POST --url http://localhost:3000/v1/station/
# 2. Sync schedule data
curl --request POST --url http://localhost:3000/v1/schedule/
```

### Deployment

1. Create a new PostgreSQL database in [Neon](https://neon.tech/) and copy the connection string value as `DATABASE_URL` in your `.env` file

2. Run the database migration

```bash
bun db:generate && bun db:migrate
```

3. Sync the data and populate it into your remote database

```bash
# Please do this in order once
# 1. Sync station data and wait until it's done
curl --request POST --url http://localhost:3000/v1/station/
# 2. Sync schedule data
curl --request POST --url http://localhost:3000/v1/schedule/

```

4. Generate `SYNC_TOKEN` (This is used in production level only to prevent unauthorized access to your `POST /v1/station` and `POST /v1/schedule` endpoint)

```bash
openssl rand -base64 32
# Copy the output value as a `SYNC_TOKEN`
```

2. Create a new Redis database in [Upstash](https://upstash.com/) and copy the connection string value as `REDIS_URL`

3. Create a `Web Service` in [Render](https://render.com/), copy the `DATABASE_URL`, `REDIS_URL`, and `SYNC_TOKEN` as environment variables, and deploy the application.

4. Set the cron job to fetch the schedule data using [Cron-Job](https://cron-job.org/en/). Don't forget to set the `SYNC_TOKEN` as a header in your request.

```bash
# Example
curl --request POST --url https://your-service-name.onrender.com/v1/station/ -H "Authorization: Bearer ${SYNC_TOKEN}"
curl --request POST --url https://your-service-name.onrender.com/v1/schedule/ -H "Authorization: Bearer ${SYNC_TOKEN}"
```
