import { Elysia, InternalServerError, t } from "elysia"
import * as service from "../services"

const scheduleController = (app: Elysia) =>
  app.group("/schedule", (app) => {
    app.post(
      "/",
      async (ctx) => {
        if (process.env.NODE_ENV === "development") {
          return await service.schedule.sync()
        }
        const token = ctx.headers.authorization

        if (!token) {
          throw new InternalServerError("Please provide a token")
        }

        if (token.split(" ")[1] !== process.env.SYNC_TOKEN) {
          throw new InternalServerError("Invalid token")
        }

        return await service.schedule.sync()
      },
      {
        headers: t.Object({
          authorization: t.String(),
        }),
      }
    )

    app.get("/", async (ctx) => {
      throw new Error(
        "Please provide a stationId. Example: /schedule/JAKK or /schedule/JAKK?fromNow=true"
      )
    })

    app.get(
      "/:stationId",
      async (ctx) => {
        if (ctx.query.fromNow) {
          return await service.schedule.getAllFromNow(ctx.params.stationId)
        }
        return await service.schedule.getAll(ctx.params.stationId)
      },
      {
        query: t.Object({
          fromNow: t.Optional(t.BooleanString()),
        }),
      }
    )

    return app
  })

export default scheduleController
