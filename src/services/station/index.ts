import { syncWrapper } from "../utils/sync"
import { sync as syncStation } from "./sync"

export const station = {
  sync: async () => {
    const { id, status } = await syncWrapper(syncStation, {
      item: "station",
      type: "manual",
    })()

    return {
      status: 200,
      data: {
        id,
        status,
      },
      message: "Syncing station data",
    }
  },
}
