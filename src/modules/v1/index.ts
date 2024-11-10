import { createAPI } from "../api"
import stationController from "./station/station.controller"

const api = createAPI()

const v1 = api.route("/station", stationController)

export default v1
