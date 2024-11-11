import { createAPI } from "../api"
import scheduleController from "./schedule/schedule.controller"
import stationController from "./station/station.controller"

const api = createAPI()

const v1 = api
  .route("/station", stationController)
  .route("/schedule", scheduleController)
export default v1
