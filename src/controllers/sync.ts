import { Elysia } from "elysia"
import { syncService } from "../services/sync"

const syncController = (app: Elysia) =>
  app.group("/sync", (app) => {
    app.get("/", async (ctx) => {
      return await syncService.station()
    })

    return app
  })

export default syncController
