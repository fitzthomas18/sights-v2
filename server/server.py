import json
import logging
import shutil
import os
import glob
from typing import Optional
from pathlib import Path
from time import time
from datetime import datetime

try:
    import tomllib as toml
except ModuleNotFoundError:
    import tomli as toml
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import HTTPException
from fastapi.responses import PlainTextResponse

from components.camera import CameraComponent, CameraParameters
from components.drive import DummyConnection, SimpleSerialConnection
from components.sensor import SensorConfig, Sensor
from components.state import State
from components.arm import Arm, ArmConfig
from sensors.mlx90614 import MLX90614Sensor, MLX90614SensorConfig
from sensors.random_sensor import RandomSensor, RandomSensorConfig
from sensors.system_info import SystemInfo, SystemInfoConfig
from sensors.sgp30 import SGP30SensorConfig, SGP30Sensor
from sensors.mlx90640 import MLX90640Sensor, MLX90640SensorConfig
from sensors.mlx90641 import MLX90641Sensor, MLX90641SensorConfig
from util.helpers import SinglePageApplication

logging.basicConfig(format='%(levelname)s: %(name)s: %(message)s', level=logging.INFO)
logger = logging.getLogger(__name__)

sensorRegister = {
    "mlx90614": (MLX90614Sensor, MLX90614SensorConfig),
    "mlx90640": (MLX90640Sensor, MLX90640SensorConfig),
    "mlx90641": (MLX90641Sensor, MLX90641SensorConfig),
    "random": (RandomSensor, RandomSensorConfig),
    "sgp30": (SGP30Sensor, SGP30SensorConfig),
    "system_info": (SystemInfo, SystemInfoConfig)
}


def load_state() -> State:
    new_state: State = State()
    with open("settings.toml", mode="rb") as fp:
        config = toml.load(fp)

    if config["drive"]["enabled"]:
        new_state.drive = SimpleSerialConnection(
            port=config["drive"]["connection"]["port"],
            baudrate=config["drive"]["connection"]["baudrate"],
            channels=config["drive"]["channels"]
        )
    else:
        new_state.drive = DummyConnection()

    new_state.arm = Arm(ArmConfig(**config["arm"]))

    for label, index in config["camera"]["devices"].items():
        camera_config = CameraParameters(
            id=label,
            width=config["camera"]["width"],
            height=config["camera"]["height"],
            framerate=config["camera"]["framerate"],
            quality=config["camera"]["quality"],
            source=index)
        new_state.cameras[label] = camera_config

    for label in config["sensors"]:
        # Load sensor configuration as a dict
        conf: dict = config["sensors"][label]
        # Find the respective Sensor and SensorConfig class from the register
        sensor_class, sensor_config_class = sensorRegister[conf["type"]]
        # Create the SensorConfig object containing the configuration settings for the sensor
        conf_obj: SensorConfig = sensor_config_class(**conf)
        new_state.sensors[label] = sensor_class(conf_obj)
        # Run initial configuration for the sensor
        if conf_obj.enabled:
            new_state.sensors[label].configure()
        logger.info(f"Created sensor of type {conf['type']}")

    return new_state


app = FastAPI(debug=False)
app.state = load_state()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
api = FastAPI()
app.mount("/api/camera/{id:str}", CameraComponent.stream)
app.mount("/api", api, name="api")
app.mount("/docs/", SinglePageApplication(directory="../docs/.vitepress/dist"), name="docs")
app.mount("/", SinglePageApplication(directory="../client/dist"), name="frontend")

'''
Quick note re: endpoints using async def or def
Intensive synchronous operations (such as get/set_settings) should (probably) be synchronous functions. FastAPI will spin these out to a new thread.
Asynchronous functions should be async of course as well as any non-intensive synchronous functions. https://fastapi.tiangolo.com/async/
'''
@api.get("/camera/")
async def list_cameras() -> list[str]:
    return list(app.state.cameras.keys())

@api.get("/camera/all")
def list_available_cameras() -> list[int]:
    return CameraComponent.list_available()

class MoveMotorsParams(BaseModel):
    speed: list[int]

@api.post("/drive/")
async def drive(params: MoveMotorsParams):
    app.state.drive.move(params.speed)

@api.post("/drive/stop")
async def drive_stop():
    app.state.drive.stop()

@api.get("/sensor/list/")
async def sensor_list() -> dict[str, SensorConfig]:
    return {k: s.config for (k, s) in app.state.sensors.items()}

@api.get("/sensor/{sensor_id}")
async def sensor(sensor_id: str):
    if sensor_id not in app.state.sensors.keys():
        raise HTTPException(404, f"Sensor with ID of {sensor_id} not found")
    #print("New request for " + sensor_id)
    return app.state.sensors[sensor_id].read()

class MoveArmServoParams(BaseModel):
    direction: bool
    amount: Optional[float] = None

@api.post("/arm/servo/{servo_name}")
async def arm_move(servo_name: str, params: MoveArmServoParams):
    app.state.arm.increment_angle(servo_name, params.direction, params.amount)

@api.post("/arm/home")
async def arm_home():
    await app.state.arm.home()

@api.post("/arm/preset/{preset}")
async def arm_home(preset: str):
    await app.state.arm.move_preset(preset)

@api.post("/poweroff")
async def power():
    print("Powering off...")
    #os.system('poweroff')

@api.post("/reboot")
async def reboot():
    print("Rebooting...")
    #os.system('reboot')

@api.post("/reload")
def reload():
    app.state.drive.close()
    app.state = load_state()

@api.get("/settings")
async def get_settings() -> str:
    with open("settings.toml", mode="r") as fp:
        return fp.read()

class PostSettingsBody(BaseModel):
    content: str

@api.post("/settings")
def set_settings(body: PostSettingsBody):
    shutil.copy2('settings.toml', 'settings.toml.bak')
    with open("settings.toml", mode="w") as fp:
        fp.write(body.content)
    reload()

@api.get("/logs", response_class=PlainTextResponse)
async def get_logs():
    log_file = Path.home() / ".cache" / "sights-log.txt"
    try:
        with open(log_file, 'r') as f:
            return f.read()
    except FileNotFoundError:
        return "Log file not found"
    except Exception as e:
        return f"Error reading log file: {str(e)}"

@api.get("/ping")
def ping_endpoint():
    return {"timestamp": time() * 1000}
