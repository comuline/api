import { Elysia } from "elysia"
import { syncService } from "../services/sync"

const stationController = (app: Elysia) =>
  app.group("/station", (app) => {
    app.post("/", async (ctx) => {
      if (process.env.NODE_ENV === "development") {
        return await syncService.station()
      }

      const token = ctx.headers["authorization"]

      if (!token) {
        throw new Error("Please provide a token")
      }

      if (token.split(" ")[1] !== process.env.SYNC_TOKEN) {
        throw new Error("Invalid token")
      }

      return await syncService.station()
    })

    return app
  })

export default stationController
