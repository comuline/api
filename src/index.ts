import { Elysia } from "elysia"
import controllers from "./controllers"
import { logger } from "./commons/utils/log"
import swagger from "./commons/libs/swagger"

const app = new Elysia()
  .use(controllers)
  .get("/", (ctx) => {
    ctx.set.redirect = "/docs"
  })
  .get("/health", () => {
    return {
      status: 200,
      data: {
        message: "OK",
      },
    }
  })
  .use(swagger())

try {
  app.listen(3000)
} catch (e) {
  logger.error("[MAIN] Error starting server", e)
  process.exit(1)
}

logger.info(
  `[MAIN] Service is running at ${app.server?.hostname}:${app.server?.port}`
)
