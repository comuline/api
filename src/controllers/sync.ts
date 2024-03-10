import { Elysia, t } from "elysia"
import { syncResponseObject } from "../commons/types"
import * as service from "../services"

const syncController = (app: Elysia) =>
  app.group("/sync", (app) => {
    app.get(
      "/",
      async () => {
        return await service.sync.getAll()
      },
      {
        response: {
          200: t.Object(
            {
              status: t.Number(),
              data: t.Array(t.Object(syncResponseObject)),
            },
            {
              default: {
                status: 200,
                data: [
                  {
                    id: "2bb72322-7152-4b79-bea5-e3f639a71501",
                    n: 12,
                    type: "manual",
                    status: "FAILED",
                    item: "station",
                    duration: 12,
                    message: "Not implemented",
                    startedAt: "2024-03-10 12:19:24.500629+00",
                    endedAt: "2024-03-10T12:19:24.515Z",
                    createdAt: "2024-03-10 12:19:24.500629+00",
                  },
                  {
                    id: "5f3523fe-b56b-4306-8498-a160588c2839",
                    n: 11,
                    type: "manual",
                    status: "SUCCESS",
                    item: "station",
                    duration: 11,
                    message: null,
                    startedAt: "2024-03-10 12:19:24.500629+00",
                    endedAt: "2024-03-10T12:19:24.515Z",
                    createdAt: "2024-03-10 12:19:24.500629+00",
                  },
                ],
              },
            }
          ),
        },

        detail: {
          description: "Get the most updated 20 sync data",
        },
      }
    )

    app.get(
      "/:id",
      async (ctx) => {
        return await service.sync.getItemById(ctx.params.id)
      },
      {
        params: t.Object({
          id: t.String(),
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
                message: "Sync data is not found",
              },
            }
          ),
          200: t.Object(
            {
              status: t.Number(),
              data: t.Object(syncResponseObject),
            },
            {
              default: {
                status: 200,
                data: {
                  id: "5f3523fe-b56b-4306-8498-a160588c2839",
                  n: 11,
                  type: "manual",
                  status: "SUCCESS",
                  item: "station",
                  duration: 11,
                  message: null,
                  startedAt: "2024-03-10 12:19:24.500629+00",
                  endedAt: "2024-03-10T12:19:24.515Z",
                  createdAt: "2024-03-10 12:19:24.500629+00",
                },
              },
            }
          ),
        },

        detail: {
          description: "Get a sync data item",
        },
      }
    )

    return app
  })

export default syncController
