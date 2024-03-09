import { Elysia } from "elysia"

const syncController = (app: Elysia) =>
  app.group("/sync", (app) => {
    app.post("/", async (ctx) => {
      return "Sync"
    })

    return app
  })

export default syncController
