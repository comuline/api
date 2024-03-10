import { Elysia, t } from "elysia"
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
          throw new Error("Please provide a token")
        }

        if (token.split(" ")[1] !== process.env.SYNC_TOKEN) {
          throw new Error("Invalid token")
        }

        return await service.schedule.sync()
      },
      {
        headers: t.Object({
          authorization: t.String(),
        }),
      }
    )

    })

    return app
  })

export default scheduleController
