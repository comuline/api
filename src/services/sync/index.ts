import { getItemById } from "./get-by-id"
import { getAll } from "./get-all"
import { NotFoundError } from "elysia"

export const sync = {
  getAll: async () => {
    const items = await getAll()

    return {
      status: 200,
      data: items,
    }
  },
  getItemById: async (id: string) => {
    const item = await getItemById(id)

    if (!item) throw new NotFoundError("Sync data is not found")

    return {
      status: 200,
      data: item,
    }
  },
}
