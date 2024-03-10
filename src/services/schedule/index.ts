import { syncWrapper } from "../utils/sync"
import { sync as syncSchedule } from "./sync"

export const schedule = {
  sync: async () => {
    const { id, status } = await syncWrapper(syncSchedule, {
      item: "schedule",
      type: "manual",
    })()

    return {
      status: 200,
      data: {
        id,
        status,
      },
      message: "Syncing schedule data",
    }
  },
}
