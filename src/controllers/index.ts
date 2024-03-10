import Elysia, { NotFoundError } from "elysia"
import { APIResponse } from "../commons/types"
import scheduleController from "./schedule"
import stationController from "./station"

const controllers = new Elysia({ prefix: "/v1" })
  .onError((ctx) => {
    return {
      status: (ctx.error as NotFoundError).status ?? 500,
      message: ctx.error.message.includes("{")
        ? JSON.parse(ctx.error.message)
        : ctx.error.message,
    } satisfies Partial<APIResponse>
  })
  .use(stationController)
  .use(scheduleController)

export default controllers
