import { Elysia } from "elysia"
import controllers from "./controllers"
import { logger } from "./utils/log"

const app = new Elysia().use(controllers).get("/", () => {
  return {
    status: 200,
    data: {
      message: "OK",
    },
  }
})

try {
  app.listen(3000)
} catch (e) {
  logger.error("[MAIN]: Error starting server", e)
  process.exit(1)
}

logger.info(
  `[MAIN]: Service is running at ${app.server?.hostname}:${app.server?.port}`
)
