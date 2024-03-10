import pino from "pino"

const transport = pino.transport({
  targets: [
    // Uncomment the following lines to log to a file in your local machine
    /*     {
      level: "trace",
      target: "pino/file",
      options: {
        destination: "./logs/file.log",
      },
    }, */
    {
      level: "trace",
      target: "pino-pretty",
      options: {},
    },
  ],
})

export const logger = pino({}, transport)
