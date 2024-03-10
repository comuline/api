import { NotFoundError } from "elysia"
import { syncWrapper } from "../utils/sync"
import { getAll, getAllFromNow } from "./get-all"
import { sync as syncSchedule } from "./sync"
import { SyncType } from "../../commons/types"

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
  getAll: async (stationId: string) => {
    const schedules = await getAll(stationId)

    if (!schedules) {
      throw new NotFoundError("Schedule data is not found")
    }

    return {
      status: 200,
      data: schedules,
    }
  },
  getAllFromNow: async (stationId: string) => {
    const schedules = await getAllFromNow(stationId)

    if (!schedules) {
      throw new NotFoundError("Schedule data is not found")
    }

    return {
      status: 200,
      data: schedules,
    }
  },
}
