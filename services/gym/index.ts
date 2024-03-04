import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import { createLogger, format, transports } from 'winston'
import axios from 'axios'
import { trace, metrics } from '@opentelemetry/api'
import {
  MeterProvider,
  PeriodicExportingMetricReader
} from '@opentelemetry/sdk-metrics'
import { Resource } from '@opentelemetry/resources'
import opentelemetry from '@opentelemetry/api'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'
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

// OpenTelemetry
const myServiceMeterProvider = new MeterProvider({
  resource: Resource.default().merge(
    new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: process.env.OTEL_SERVICE_NAME
    })
  ),
  readers: [new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter(),
  })],
})

// Set this MeterProvider to be global to the app being instrumented.
opentelemetry.metrics.setGlobalMeterProvider(myServiceMeterProvider)

const tracer = trace.getTracer('gym.tracer')
const meter = metrics.getMeter('gym.meter')
const gymCounter = meter.createCounter("requests_counter_get_gym", {
  description: "Counts the number of requests that the /gym endpoint received"
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
  const span = tracer.startSpan('gym')
  gymCounter.add(1)
  try {
    const dateResponse: any = await axios.get(
      `http://${process.env.DATE_SERVICE_HOSTNAME}:${process.env.DATE_SERVICE_PORT}/date`
    )
    logger.info("Able to get the date from date service")
    if (dateResponse.data.date === 5 || dateResponse.data.date === 6) {
      span.setAttribute("gym.shouldGo", false)
      res.send({
        status: "success",
        message: "Day off! No need to go to the gym today..."
      })
      return
    } else {
      span.setAttribute("gym.shouldGo", true)
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
  } finally {
    span.end()
  }
})
