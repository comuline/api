import { createAPI } from "../api"
import routeController from "./route"
import scheduleController from "./schedule/schedule.controller"
import stationController from "./station/station.controller"

const api = createAPI()

const v1 = api
  .route("/station", stationController)
  .route("/schedule", scheduleController)
  .route("/route", routeController)

export default v1
