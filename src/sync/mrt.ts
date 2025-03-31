import { z } from "zod"
import { parseTime } from "../utils/time"
import { addMinutes, format } from "date-fns"
import { Database } from "@/modules/v1/database"
import { scheduleTable, stationTable, StationType } from "@/db/schema"
import { sql } from "drizzle-orm"

interface iApiSchedule {
  stasiun_nid: string | null
  waktu: string | null
}

interface iApiStation {
  nid: string
  title: string
  urutan: string
  jadwal_lb_biasa: string | null
  jadwal_lb_libur: string | null
  jadwal_hi_biasa: string | null
  jadwal_hi_libur: string | null
  estimasi: iApiSchedule[]
}

const createStationKey = (type: StationType, id: string) =>
  `st_${type}_${id}`.toLocaleLowerCase()

const createStationCode = (petaLokalitasUrl: string) => {
  const stationCodeStart = petaLokalitasUrl.search(/PETA%20LOKALITAS_/i)
  const stationCodeEnd = petaLokalitasUrl.search(/_020920|%20020920/i)

  return petaLokalitasUrl
    .substring(stationCodeStart, stationCodeEnd)
    .replace(/PETA%20LOKALITAS_/i, "")
}

const sync = async () => {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL env is missing")
  if (!process.env.COMULINE_ENV) throw new Error("COMULINE_ENV env is missing")
  if (!process.env.MRT_SCHEDULE_ENDPOINT)
    throw new Error("MRT_SCHEDULE_ENDPOINT env is missing")

  const { db } = new Database({
    COMULINE_ENV: process.env.COMULINE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
  })

  const stations = await db
    .select({
      id: stationTable.id,
      metadata: stationTable.metadata,
      name: stationTable.name,
    })
    .from(stationTable)

  const apiSchema = z.array(
    z.object({
      nid: z.string(),
      title: z.string(),
      urutan: z.string(),
      isbig: z.string(),
      peta_lokalitas: z.string(),
      jadwal_lb_biasa: z.nullable(z.string()),
      jadwal_lb_libur: z.nullable(z.string()),
      jadwal_hi_biasa: z.nullable(z.string()),
      jadwal_hi_libur: z.nullable(z.string()),
      estimasi: z.array(
        z.object({
          stasiun_nid: z.nullable(z.string()),
          waktu: z.nullable(z.string()),
        }),
      ),
    }),
  )

  // hitting the endpoint
  const req = await fetch(process.env.MRT_SCHEDULE_ENDPOINT, {
    method: "GET",
    mode: "cors",
  })

  console.info("[SYNC][SCHEDULE][MRT] Fetched schedule")

  if (req.status !== 200) {
    const err = await req.json()
    const txt = await req.text()

    console.error(
      `[SYNC][SCHEDULE][MRT] Error fetch schedule data. Trace: ${JSON.stringify(
        err,
      )}. Status: ${req.status}. Req: ${txt}`,
    )
    throw new Error(JSON.stringify(err))
  }

  const data = await req.json()
  const parsed = apiSchema.parse(data)
  const schedule: Schedule[] = []
  const today = new Date()
  const todayDay = today.getDay()
  const isWeekend = todayDay === 6 || todayDay === 0
  const batchSizes = 100
  const totalBatches = Math.ceil(data.length / batchSizes)

  // looping through stations
  parsed.map(async (station) => {
    // deciphering station code from lokalitas file
    const stationCode = createStationCode(station.peta_lokalitas)

    const lbTimeTable = isWeekend ? "jadwal_lb_libur" : "jadwal_lb_biasa"
    const hiTimeTable = isWeekend ? "jadwal_hi_libur" : "jadwal_hi_biasa"

    const newSchedule = []

    // adding extra time to schedule because it's messing up the timetable
    // NOTE: this is only for Istora (35) and Bendungan Hilir (36)
    if (station.nid === "36") {
      if (!isWeekend) {
        station[lbTimeTable] += ", 9:17, 15:40"
      }
      {
        station[hiTimeTable] += ", 7:51"
      }
    }

    if (station.nid === "35") {
      if (!isWeekend) {
        station[lbTimeTable] += ", 18:15"
      }
    }

    // sanitizing schedule
    const lbTimes: string[] =
      [
        ...new Set(
          station[lbTimeTable]
            ?.replace(/: |\t|\.\s|\s/gm, ",")
            .replace("\r\n", "")
            .split(",")
            .filter((n) => n),
        ),
      ].sort() ?? []
    const hiTimes: string[] =
      [
        ...new Set(
          station[hiTimeTable]
            ?.replace(/: |\t|\.\s|\s/gm, ",")
            .replace("\r\n", "")
            .split(",")
            .filter((n) => n),
        ),
      ].sort() ?? []

    // formatting
    if (lbTimes.length !== 0) {
      newSchedule.push(
        ...formatData(
          stationCode,
          lbTimes,
          station.estimasi,
          station,
          today,
          "lb",
          isWeekend,
        ),
      )
    }

    if (hiTimes.length !== 0) {
      newSchedule.push(
        ...formatData(
          stationCode,
          hiTimes,
          station.estimasi,
          station,
          today,
          "hi",
          isWeekend,
        ),
      )
    }

    // upserting station
    const stations = await db
      .insert(stationTable)
      .values({
        uid: createStationKey("MRT", stationCode),
        id: stationCode,
        name: station.title,
        type: "MRT",
        metadata: {
          active: true,
        },
      })
      .onConflictDoUpdate({
        target: stationTable.uid,
        set: {
          updated_at: new Date().toISOString(),
          uid: sql`excluded.uid`,
          id: sql`excluded.id`,
          name: sql`excluded.name`,
        },
      })
      .returning()
    console.info(`[SYNC][STATION][MRT] Inserted ${stationCode}`)

    // upserting schedules
    const schedules = await db
      .insert(scheduleTable)
      .values(newSchedule)
      .onConflictDoUpdate({
        target: scheduleTable.id,
        set: {
          departs_at: sql`excluded.departs_at`,
          arrives_at: sql`excluded.arrives_at`,
          metadata: sql`excluded.metadata`,
          updated_at: new Date().toISOString(),
        },
      })
      .returning()
    console.info(
      `[SYNC][SCHEDULE][MRT] Inserted ${schedules.length} rows for ${stationCode}`,
    )
  })
}

const formatData = (
  stationCode: string,
  timetable: string[],
  nextSchedule: iApiSchedule[],
  currentStation: iApiStation,
  date: Date,
  direction: "lb" | "hi",
  isWeekend: boolean,
): Schedule[] => {
  const currentStationUrutan = parseInt(currentStation.urutan)

  // setting up train id, so we can use the train route accordingly
  // - if its "hari libur", trains only start from stations with "urutan" 1 and 6
  // - if its not "hari libur" trains start from stations with "urutan" 1, 6, 12
  let initialTrainId =
    direction === "hi"
      ? isWeekend
        ? currentStationUrutan >= 1 && currentStationUrutan < 6
          ? 3
          : currentStationUrutan >= 6
            ? 1
            : 0
        : currentStationUrutan >= 1 && currentStationUrutan < 6
          ? 3
          : currentStationUrutan >= 6 && currentStationUrutan < 12
            ? 2
            : currentStationUrutan >= 12
              ? 1
              : 0
      : 1

  const data: Schedule[] = []

  // get the arrival time and station info, by looping on the estimasi object
  timetable.map((time, idx) => {
    const t = time.trim().replace(";", ":").split(":")
    const stationInitial = currentStation.title
      .replace("Stasiun", "")
      .trim()
      .split(" ")
      .map((name: string) => name.charAt(0))
      .join("")

    /**
     * formatting train id, doing this because of this
     * see: https://docs.google.com/spreadsheets/d/199K18JpvbwuPxYt9_bfyq1E2P0DW0wd5dMUDqPDeszI/edit?usp=sharing
     *                                                                           URUTAN STASIUN
     *      1	           2	           3	           4	           5	           6	           7	           8	           9	          10	          11	          12	          13
     * MRT-NSL-LB-1	MRT-NSL-LB-1	MRT-NSL-LB-1	MRT-NSL-LB-1	MRT-NSL-LB-1	MRT-NSL-LB-2	MRT-NSL-LB-2	MRT-NSL-LB-2	MRT-NSL-LB-2	MRT-NSL-LB-2	MRT-NSL-LB-2	MRT-NSL-LB-3	MRT-NSL-LB-3
     * MRT-NSL-LB-4	MRT-NSL-LB-4	MRT-NSL-LB-4	MRT-NSL-LB-4	MRT-NSL-LB-4	MRT-NSL-LB-1	MRT-NSL-LB-1	MRT-NSL-LB-1	MRT-NSL-LB-1	MRT-NSL-LB-1	MRT-NSL-LB-1	MRT-NSL-LB-2	MRT-NSL-LB-2
     * MRT-NSL-LB-5	MRT-NSL-LB-5	MRT-NSL-LB-5	MRT-NSL-LB-5	MRT-NSL-LB-5	MRT-NSL-LB-4	MRT-NSL-LB-4	MRT-NSL-LB-4	MRT-NSL-LB-4	MRT-NSL-LB-4	MRT-NSL-LB-4	MRT-NSL-LB-1	MRT-NSL-LB-1
     */
    let trainId: string =
      direction === "hi"
        ? `MRT-NSL-LB-${initialTrainId++}`
        : `MRT-NSL-HI-${initialTrainId++}`
    if (direction === "hi" && isWeekend) {
      if (currentStationUrutan < 6) {
        switch (idx) {
          case 0:
            trainId = "MRT-NSL-LB-2"
            break
        }
      }

      if (currentStationUrutan >= 6) {
        switch (idx) {
          case 0:
            trainId = "MRT-NSL-LB-2"
            break
          case 1:
            trainId = "MRT-NSL-LB-1"
            break
        }
      }
    }

    if (direction === "hi" && !isWeekend) {
      if (currentStationUrutan < 6) {
        switch (idx) {
          case 0:
            trainId = "MRT-NSL-LB-1"
            break
        }
      }

      if (currentStationUrutan >= 6 && currentStationUrutan <= 11) {
        switch (idx) {
          case 0:
            trainId = "MRT-NSL-LB-2"
            break
          case 1:
            trainId = "MRT-NSL-LB-1"
            break
        }
      }

      if (currentStationUrutan >= 12) {
        switch (idx) {
          case 0:
            trainId = "MRT-NSL-LB-3"
            break
          case 1:
            trainId = "MRT-NSL-LB-2"
            break
          case 2:
            trainId = "MRT-NSL-LB-1"
            break
        }
      }
    }

    // marking "dummy" time
    const isActive =
      currentStation.nid === "36" && ["9:17", "15:40", "7:51"].includes(time)
        ? false
        : !(currentStation.nid === "35" && ["18:15"].includes(time))

    data.push({
      id: `sc_mrt_${stationCode.toLowerCase()}_${trainId}`.toLowerCase(),
      station_id: stationCode,
      station_origin_id: stationCode,
      station_destination_id: direction === "hi" ? "BHI" : "LBB",
      train_id: trainId,
      line: "MRT NSL",
      route: "LEBAK BULUS-BUNDARAN HI",
      departs_at: parseTime(
        format(
          new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            parseInt(t[0]),
            parseInt(t[1]),
          ),
          "HH:mm:ss",
        ),
      ).toISOString(),
      arrives_at: parseTime(
        format(
          addMinutes(
            new Date(
              date.getFullYear(),
              date.getMonth(),
              date.getDate(),
              parseInt(t[0]),
              parseInt(t[1]),
            ),
            parseInt(nextSchedule[direction === "hi" ? 11 : 0].waktu ?? "0"),
          ),
          "HH:mm:ss",
        ),
      ).toISOString(),
      metadata: {
        active_schedule: isActive,
        origin: {
          color: "#0155b9",
        },
      },
    })
  })

  return data
}

sync()
