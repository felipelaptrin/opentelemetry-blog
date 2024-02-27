import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import { createLogger, format, transports } from 'winston'
import axios from 'axios'

// Logger
const { combine, timestamp, json } = format
const logger = createLogger({
  format: combine(
    timestamp(),
    json()
  ),
  transports: [
    new transports.Console()
  ]
})

// App
const app = express()

app.use(express.json())
app.use(cors())
app.use(bodyParser.json())
app.listen(8000)

// Routes
app.get('/health', (req, res) => {
  logger.info("Checking status of application...")
  res.send({
    "App Name": "Gym Service",
    "status": "success",
    "message": "OK"
  })
})

app.get('/gym', async (req, res) => {
  try {
    const dateResponse: any = await axios.get(
      `http://${process.env.DATE_SERVICE_HOSTNAME}:${process.env.DATE_SERVICE_PORT}/date`
    )
    if (dateResponse.data.date === 5 || dateResponse.data.date === 6) {
      res.send({
        status: "success",
        message: "Day off! No need to go to the gym today..."
      })
      return
    } else {
      res.send({
        status: "success",
        message: "Let's work out! You need to go to the gym today..."
      })
      return
    }

  } catch (error) {
    logger.error(`Unable to get current date: ${String(error)}`)
    res.status(500).send({
      status: "failed",
      message: "Something went wrong... Try again later."
    })
    return
  }
})







