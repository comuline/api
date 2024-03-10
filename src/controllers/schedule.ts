import { Elysia, InternalServerError, t } from "elysia"
import * as service from "../services"
import { SyncType, syncResponse } from "../commons/types"

const scheduleController = (app: Elysia) =>
  app.group("/schedule", (app) => {
    app.post(
      "/",

      async (ctx) => {
        const type: SyncType = ctx.query.from_cron ? "cron" : "manual"

        if (process.env.NODE_ENV === "development") {
          return await service.schedule.sync(type)
        }
        const token = ctx.headers.authorization

        if (!token) {
          throw new InternalServerError("Please provide a token")
        }

        if (token.split(" ")[1] !== process.env.SYNC_TOKEN) {
          throw new InternalServerError("Invalid token")
        }

        return await service.schedule.sync(type)
      },
      {
        headers:
          process.env.NODE_ENV === "development"
            ? undefined
            : t.Object({
                authorization: t.String(),
              }),
        query: t.Object({
          from_cron: t.Optional(t.BooleanString()),
        }),
        detail: {
          description: "Sync schedule data",
        },
        response: syncResponse("schedule"),
      }
    )

    app.get(
      "/:stationId",
      async (ctx) => {
        if (ctx.query.from_now) {
          return await service.schedule.getAllFromNow(ctx.params.stationId)
        }
        return await service.schedule.getAll(ctx.params.stationId)
      },
      {
        params: t.Object({
          stationId: t.String(),
        }),
        query: t.Object({
          from_now: t.Optional(t.BooleanString()),
        }),
        response: {
          404: t.Object(
            {
              status: t.Number(),
              message: t.String(),
            },
            {
              default: {
                status: 404,
                message: "Schedule data is not found",
              },
            }
          ),
          200: t.Object(
            {
              status: t.Number(),
              data: t.Array(
                t.Object({
                  id: t.Nullable(t.String()),
                  stationId: t.Nullable(t.String()),
                  trainId: t.Nullable(t.String()),
                  line: t.Nullable(t.String()),
                  route: t.Nullable(t.String()),
                  color: t.Nullable(t.String()),
                  destination: t.Nullable(t.String()),
                  timeEstimated: t.Nullable(t.String()),
                  destinationTime: t.Nullable(t.String()),
                  updatedAt: t.Nullable(t.String()),
                })
              ),
            },
            {
              default: {
                status: 200,
                data: [
                  {
                    id: "AC-2400",
                    stationId: "AC",
                    trainId: "2400",
                    line: "COMMUTER LINE TANJUNGPRIUK",
                    route: "JAKARTAKOTA-TANJUNGPRIUK",
                    color: "#DD0067",
                    destination: "TANJUNGPRIUK",
                    timeEstimated: "06:07:00",
                    destinationTime: "06:16:00",
                    updatedAt: "2024-03-09T13:06:10.662Z",
                  },
                  {
                    id: "AC-2401",
                    stationId: "AC",
                    trainId: "2401",
                    line: "COMMUTER LINE TANJUNGPRIUK",
                    route: "TANJUNGPRIUK-JAKARTAKOTA",
                    color: "#DD0067",
                    destination: "JAKARTAKOTA",
                    timeEstimated: "06:34:00",
                    destinationTime: "06:42:00",
                    updatedAt: "2024-03-09T13:06:10.662Z",
                  },
                ],
              },
            }
          ),
        },

        detail: {
          description:
            "Get a list of schedule data for a station from a station ID",
        },
      }
    )

    return app
  })

export default scheduleController
