
import logging
from datetime import datetime

from fastapi import FastAPI, HTTPException

# Logger
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

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
    try:
        day = datetime.today().weekday()
        logger.info(f"Successfully able to get current day ({day})")
        return {
            "status": "success",
            "date": day
        }
    except Exception as e:
        logger.error(f"Not able to get current day: {e}")
        return HTTPException(500, {
            "status": "failed",
            "message": "Something went wrong... Try again"
        })