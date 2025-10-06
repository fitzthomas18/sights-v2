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

CONFIG_DIR = Path("configs")
BACKUP_DIR = CONFIG_DIR / "backups"
CONFIG_METADATA_FILE = CONFIG_DIR / "active.json"
MAX_BACKUPS = 10

def create_backup(config_filename: str):
    """Create a timestamped backup of a config file"""
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)

    config_path = CONFIG_DIR / config_filename
    if not config_path.exists():
        return

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_name = f"{config_path.stem}_{timestamp}.toml"
    backup_path = BACKUP_DIR / backup_name

    shutil.copy2(config_path, backup_path)
    logger.info(f"Created backup: {backup_path}")

    cleanup_old_backups(config_path.stem)

def cleanup_old_backups(config_stem: str):
    """Keep only the most recent MAX_BACKUPS for a given config"""
    backups = sorted(
        BACKUP_DIR.glob(f"{config_stem}_*.toml"),
        key=lambda p: p.stat().st_mtime,
        reverse=True
    )

    for old_backup in backups[MAX_BACKUPS:]:
        old_backup.unlink()
        logger.info(f"Deleted old backup: {old_backup}")

def get_active_config() -> str:
    if CONFIG_METADATA_FILE.exists():
        with open(CONFIG_METADATA_FILE, 'r') as f:
            metadata = json.load(f)
            return metadata.get('active_config', 'default.toml')
    return 'default.toml'

def set_active_config(filename: str):
    CONFIG_METADATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    metadata = {'active_config': filename}
    with open(CONFIG_METADATA_FILE, 'w') as f:
        json.dump(metadata, f, indent=2)

def get_config_path() -> Path:
    return CONFIG_DIR / get_active_config()

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

    CONFIG_DIR.mkdir(exist_ok=True)
    config_path = get_config_path()

    if not config_path.exists():
        raise FileNotFoundError(f"Config file not found: {config_path}")

    with open(config_path, mode="rb") as fp:
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
        conf: dict = config["sensors"][label]
        sensor_class, sensor_config_class = sensorRegister[conf["type"]]
        conf_obj: SensorConfig = sensor_config_class(**conf)
        new_state.sensors[label] = sensor_class(conf_obj)
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

@api.get("/configs/list")
async def list_available_configs() -> list[dict]:
    """List all available configuration files"""
    CONFIG_DIR.mkdir(exist_ok=True)
    config_files = list(CONFIG_DIR.glob("*.toml"))
    configs = []
    active = get_active_config()

    for file in config_files:
        mod_time = file.stat().st_mtime
        mod_datetime = datetime.fromtimestamp(mod_time)

        name = file.stem.replace("-", " ").title()

        configs.append({
            "filename": file.name,
            "name": name,
            "modified": mod_datetime.strftime("%H:%M:%S %d/%m/%y"),
            "isActive": file.name == active
        })

    return sorted(configs, key=lambda x: x["filename"])

@api.get("/configs/current")
async def get_current_config() -> dict:
    """Get the currently active configuration"""
    active = get_active_config()
    config_path = get_config_path()

    if config_path.exists():
        mod_time = config_path.stat().st_mtime
        mod_datetime = datetime.fromtimestamp(mod_time)
        modified = mod_datetime.strftime("%H:%M:%S %d/%m/%y")
    else:
        modified = "Unknown"

    return {
        "filename": active,
        "name": Path(active).stem.replace("-", " ").title(),
        "modified": modified
    }

class SwitchConfigBody(BaseModel):
    filename: str

@api.post("/configs/switch")
def switch_to_config(body: SwitchConfigBody):
    """Switch to a different configuration file"""
    config_path = CONFIG_DIR / body.filename

    if not config_path.exists():
        raise HTTPException(404, f"Configuration file {body.filename} not found")

    current = get_active_config()
    if current == body.filename:
        return {"message": f"Already using {body.filename}", "switched": False}

    set_active_config(body.filename)
    app.state.drive.close()
    app.state = load_state()

    return {"message": f"Switched to {body.filename}", "switched": True}

@api.get("/settings")
async def get_settings() -> str:
    """Get the current configuration content"""
    config_path = get_config_path()
    with open(config_path, mode="r") as fp:
        return fp.read()

class PostSettingsBody(BaseModel):
    content: str

@api.post("/settings")
def set_settings(body: PostSettingsBody):
    """Save settings to the active configuration file"""
    config_path = get_config_path()

    create_backup(get_active_config())

    with open(config_path, mode="w") as fp:
        fp.write(body.content)

    app.state.drive.close()
    app.state = load_state()

    return {"message": "Settings saved and reloaded"}

@api.get("/configs/backups")
async def list_backups() -> list[dict]:
    """List all available backups for the current config"""
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)

    active = get_active_config()
    config_stem = Path(active).stem

    backups = []
    backup_files = sorted(
        BACKUP_DIR.glob(f"{config_stem}_*.toml"),
        key=lambda p: p.stat().st_mtime,
        reverse=True
    )

    for backup in backup_files:
        parts = backup.stem.rsplit('_', 2)
        if len(parts) == 3:
            _, date_str, time_str = parts
            timestamp_str = f"{date_str[6:8]}/{date_str[4:6]}/{date_str[0:4]} {time_str[0:2]}:{time_str[2:4]}:{time_str[4:6]}"
        else:
            timestamp_str = "Unknown"

        mod_time = backup.stat().st_mtime
        mod_datetime = datetime.fromtimestamp(mod_time)

        backups.append({
            "filename": backup.name,
            "timestamp": timestamp_str,
            "modified": mod_datetime.strftime("%H:%M:%S %d/%m/%y"),
            "size": backup.stat().st_size
        })

    return backups

@api.get("/configs/backup/{backup_filename}")
async def get_backup_content(backup_filename: str) -> str:
    """Get the content of a backup file"""
    backup_path = BACKUP_DIR / backup_filename

    if not backup_path.exists():
        raise HTTPException(404, f"Backup file {backup_filename} not found")

    with open(backup_path, mode="r") as fp:
        return fp.read()

class RestoreBackupBody(BaseModel):
    backup_filename: str

@api.post("/configs/restore")
def restore_backup(body: RestoreBackupBody):
    """Restore a configuration from a backup"""
    backup_path = BACKUP_DIR / body.backup_filename

    if not backup_path.exists():
        raise HTTPException(404, f"Backup file {body.backup_filename} not found")

    parts = backup_path.stem.rsplit('_', 2)
    if len(parts) == 3:
        config_name = parts[0]
    else:
        raise HTTPException(400, "Invalid backup filename format")

    config_filename = f"{config_name}.toml"
    config_path = CONFIG_DIR / config_filename

    if config_path.exists():
        create_backup(config_filename)

    shutil.copy2(backup_path, config_path)

    if get_active_config() == config_filename:
        app.state.drive.close()
        app.state = load_state()
        return {"message": f"Restored and reloaded {config_filename}", "reloaded": True}

    return {"message": f"Restored {config_filename}", "reloaded": False}

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
