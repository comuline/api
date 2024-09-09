import { Elysia } from "elysia"
import controllers from "./controllers"
import { logger } from "./commons/utils/log"
import swagger from "./commons/libs/swagger"
import { rateLimit } from "elysia-rate-limit"

export const app = new Elysia({ aot: false })
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
  .use(rateLimit({ max: 5 }))

try {
  app.listen(process.env.NODE_ENV === "development" ? 3001 : 3000)
} catch (e) {
  logger.error("[MAIN] Error starting server", e)
  process.exit(1)
}

logger.info(
  `[MAIN] Service is running at ${app.server?.hostname}:${app.server?.port}`,
)
