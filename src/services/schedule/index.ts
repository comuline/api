import { syncWrapper } from "../utils/sync"
import { sync as syncSchedule } from "./sync"

export const schedule = {
  sync: async () => {
    const data = await syncWrapper(syncSchedule, {
      item: "schedule",
      type: "manual",
    })()

    return {
      status: 200,
      data,
    }
  },
}
