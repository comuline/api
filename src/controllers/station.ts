import { Elysia } from "elysia"

const stationController = (app: Elysia) =>
  app.group("/station", (app) => {
    app.get("/", async (ctx) => {
      return "Station"
    })

    return app
  })

export default stationController
