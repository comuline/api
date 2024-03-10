import { syncWrapper } from "../utils/sync"
import { sync as syncStation } from "./sync"

export const station = {
  sync: async () => {
    const data = await syncWrapper(syncStation, {
      item: "station",
      type: "manual",
    })()

    return {
      status: 200,
      data,
    }
  },
    }
  },
}
