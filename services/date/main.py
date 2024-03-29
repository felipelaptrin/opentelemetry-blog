import logging
from datetime import datetime

from fastapi import FastAPI, HTTPException
from opentelemetry import metrics, trace

# Logger
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Opentelemetry
tracer = trace.get_tracer("date.tracer")
meter = metrics.get_meter("date.meter")

date_counter = meter.create_counter(
    "requests_counter_get_date",
    description="Counts the number of requests that the /date endpoint received"
)

# App
app = FastAPI()

# Routes
@app.get("/health")
def healthcheck():
    logger.info("Checking status of application...")
    return {
        "App Name": "Date Service",
        "status": "success",
        "message": "OK"
    }


@app.get("/date")
def get_date():
    date_counter.add(1)
    with tracer.start_as_current_span("date") as span:
        try:
            day = datetime.today().weekday()
            span.set_attribute("date.value", day)
            logger.info(f"Successfully able to get current day ({day})")
            return {
                "status": "success",
                "date": day
            }
        except Exception as e:
            logger.error(f"Not able to get current day: {e}")
            span.set_attribute("date.value", None)
            return HTTPException(500, {
                "status": "failed",
                "message": "Something went wrong... Try again"
            })