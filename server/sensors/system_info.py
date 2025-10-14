from dataclasses import dataclass
import random
import psutil
import time

from components.sensor import Sensor, SensorConfig

class SystemInfoConfig(SensorConfig):
    pass

class SystemInfo(Sensor):
    def read(self):
        temperature: float | None = None
        # Get highest CPU temp from system
        temp_data = psutil.sensors_temperatures()
        # Check if 'coretemp' is reported by psutil
        if 'coretemp' in temp_data:
            # Find highest CPU core temp
            highest = 0
            for core in temp_data['coretemp']:
                if core.current > highest:
                    highest = core.current
            temperature = round(highest, 1)
        # Some systems will report temp differently
        # Nvidia Jetson
        elif 'thermal-fan-est' in temp_data:
            temperature = round(temp_data['thermal-fan-est'][0].current, 1)
        # Raspberry Pi
        elif 'cpu-thermal' in temp_data:
            temperature = round(temp_data['cpu-thermal'][0].current, 1)
        elif 'cpu_thermal' in temp_data:
            temperature = round(temp_data['cpu_thermal'][0].current, 1)

        disk_usage = psutil.disk_usage('/')
        disk_percent = round((disk_usage.used / disk_usage.total) * 100, 1)
        uptime_seconds = int(time.time() - psutil.boot_time())

        return {
            "cpu_percent": psutil.cpu_percent(),
            "memory": psutil.virtual_memory().percent,
            "temperature": temperature,
            "disk_usage": disk_percent,
            "uptime_seconds": uptime_seconds,
        }
