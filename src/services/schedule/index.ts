import { NotFoundError } from "elysia"
import { SyncType } from "../../commons/types"
import { syncWrapper } from "../utils/sync"
import { getAll } from "./get-all"
import { sync as syncSchedule } from "./sync"

export const schedule = {
  sync: async (type: SyncType) => {
    const data = await syncWrapper(syncSchedule, {
      item: "schedule",
      type,
    })()

    return {
      status: 200,
      data,
    }
  },
  getAll: async (stationId: string, fromNow: boolean) => {
    const schedules = await getAll(stationId, fromNow)

    if (!schedules) {
      throw new NotFoundError("Schedule data is not found")
    }

    return {
      status: 200,
      data: schedules,
    }
  },
}
