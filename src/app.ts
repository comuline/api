import { Context } from "elysia"
import { app } from "./index"
import { Env } from "./types"
import Container from "typedi"
import { createDB } from "./db"

export default {
  async fetch(request: Request, env: Env, ctx: Context): Promise<Response> {
    const db = createDB(env.DATABASE_URL)
    Container.set("env", env)
    Container.set("db", db)
    Container.set("kv", env.KV)
    return await app.fetch(request)
  },
}
