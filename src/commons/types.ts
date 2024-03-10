import { t } from "elysia"

export type APIResponse<T = unknown> = {
  data: T
  status: number
  message: "OK" | "ERROR" | "NOT_FOUND" | string
}

export const syncResponse = (item: "station" | "schedule") => ({
  200: t.Object(
    {
      status: t.Number(),
      data: t.Object({
        id: t.String(),
        status: t.String(),
        type: t.Union([t.Literal("manual"), t.Literal("cron")]),
        item: t.Union([t.Literal("station"), t.Literal("schedule")]),
      }),
    },
    {
      default: {
        status: 200,
        data: {
          id: "08dd3ed8-8dd7-4c0d-8463-7422ce3e07b9",
          type: "manual",
          item,
          status: "PENDING",
        },
      },
    }
  ),
})

export const scheduleResponseObject = {
  id: t.Nullable(t.String()),
  name: t.Nullable(t.String()),
  daop: t.Nullable(t.Number()),
  fgEnable: t.Nullable(t.Number()),
  haveSchedule: t.Nullable(t.Boolean()),
  updatedAt: t.Nullable(t.String()),
}
