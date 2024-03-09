import { Elysia } from "elysia"

const scheduleController = (app: Elysia) =>
  app.group("/schedule", (app) => {
    app.get("/", async (ctx) => {
      return "Schedule"
    })

    return app
  })

export default scheduleController
