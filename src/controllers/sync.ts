import { Elysia } from "elysia"
import { syncService } from "../services/sync"

const syncController = (app: Elysia) =>
  app.group("/sync", (app) => {
    app.get("/", async (ctx) => {
      await syncService.station()
      return "Sync"
    })

    return app
  })

export default syncController
