'''
Numeric Keypad Controls:
 * *_
|7|8|9|+|   1/4 > SHOULDER U/D
|4|5|6|-|   2/5 > ELBOW U/D
|1|2|3| |   3/6 > WRIST U/D
|0 *|*_|   7/8 > WRIST L/R
            +/- > CLAW OPEN/CLOSE
            0 > Home Device
'''
import asyncio
import logging
from typing import Optional
from pydantic import BaseModel

# Fix for Python 3.13 compatibility
import inspect
if not hasattr(inspect, 'getargspec'):
    inspect.getargspec = inspect.getfullargspec

class ArmServoConfig(BaseModel):
    index: int
    range_min: int
    range_max: int
    home: int
    presets: Optional[dict[str, int]] = None

class ArmConfig(BaseModel):
    enabled: bool = True
    mode: str = "servokit"  # "servokit" or "hiwonder"
    servos: dict[str, ArmServoConfig]
    # HiWonder settings (only needed if mode is "hiwonder")
    hiwonder: Optional[dict] = None
    firmata: Optional[dict] = None

class Arm:
    def __init__(self, config: ArmConfig):
        self.logger = logging.getLogger(__name__)
        self.config = config
        self.enabled = self.config.enabled
        self.mode = self.config.mode.lower()

        if not self.enabled:
            return

        # Initialize based on mode
        if self.mode == "hiwonder":
            self._setup_hiwonder()
        elif self.mode == "servokit":
            self._setup_servokit()
        else:
            raise ValueError(f"Unknown arm mode: {self.mode}")

        # Set up current angles tracking
        self.CURRENT_ANGLES = {servo.index: servo.home for servo in self.config.servos.values()}

        # Home the arm
        asyncio.create_task(self.home())

    def _setup_servokit(self):
        """Initialize ServoKit for original implementation"""
        from adafruit_servokit import ServoKit

        self.logger.info("Setting up ServoKit")
        self.kit = ServoKit(channels=16)

        for servo in self.config.servos.values():
            self.kit.servo[servo.index].set_pulse_width_range(servo.range_min, servo.range_max)

        self.logger.info("ServoKit setup complete")

    def _setup_hiwonder(self):
        """Initialize HiWonder connection"""
        from util.serialfirmata import Leonardo, string_to_port
        import util.hiwonderfirmata as HiWonder

        if not self.config.firmata or not self.config.hiwonder:
            raise ValueError("HiWonder mode requires both 'firmata' and 'hiwonder' config sections")

        try:
            self.logger.info("Setting up HiWonder Firmata")

            # Create Leonardo board connection
            self.firmata = Leonardo(
                self.config.firmata["port"],
                baudrate=self.config.firmata["baudrate"],
                timeout=5
            )

            # Configure serial port
            self.port = string_to_port(self.config.hiwonder["port"])

            self.firmata.serialConfig(
                self.port,
                self.config.hiwonder["baudrate"],
                self.config.hiwonder["rx"],
                self.config.hiwonder["tx"]
            )

            # Create HiWonder controller
            self.controller = HiWonder.SBS_Controller(self.firmata, self.port)
            self.logger.info("HiWonder setup complete")

        except Exception as error:
            self.logger.error(f"HiWonder setup failed: {error}")
            raise

    def _angle_to_hiwonder(self, angle_degrees):
        """Convert angle from 0-180 degrees to HiWonder 0-1000 range"""
        angle_degrees = max(0, min(180, angle_degrees))
        return int((angle_degrees / 180.0) * 1000)

    def _hiwonder_to_angle(self, hiwonder_pos):
        """Convert HiWonder position (0-1000) to degrees (0-180)"""
        hiwonder_pos = max(0, min(1000, hiwonder_pos))
        return (hiwonder_pos / 1000.0) * 180.0

    async def home(self):
        if not self.enabled:
            return

        self.logger.info("Moving to home position")

        for name, servo in self.config.servos.items():
            if self.mode == "servokit":
                self.kit.servo[servo.index].angle = servo.home
                self.CURRENT_ANGLES[servo.index] = servo.home

            elif self.mode == "hiwonder":
                hiwonder_pos = self._angle_to_hiwonder(servo.home)
                self.controller.cmd_servo_move([servo.index], [hiwonder_pos], 1000)
                self.CURRENT_ANGLES[servo.index] = servo.home

            # Delays for specific joints
            if name == "WRISTLR" or name == "WRISTUD":
                await asyncio.sleep(0.25)

    async def move_preset(self, preset_name: str):
        if not self.enabled:
            return

        self.logger.info(f"Moving to preset: {preset_name}")

        for name, servo in self.config.servos.items():
            if not servo.presets or preset_name not in servo.presets:
                continue

            target_angle = servo.presets[preset_name]

            if self.mode == "servokit":
                self.kit.servo[servo.index].angle = target_angle
                self.CURRENT_ANGLES[servo.index] = target_angle

            elif self.mode == "hiwonder":
                hiwonder_pos = self._angle_to_hiwonder(target_angle)
                self.controller.cmd_servo_move([servo.index], [hiwonder_pos], 1000)
                self.CURRENT_ANGLES[servo.index] = target_angle

            # Delay for elbow
            if name == "ELBOW":
                await asyncio.sleep(0.25)

    def increment_angle(self, joint: str, direction: bool, amount: float = 180/100):
        if not self.enabled:
            return

        if joint not in self.config.servos:
            self.logger.error(f"Joint {joint} not found in configuration")
            return

        # Safety check for amount
        if amount is None:
            amount = 1.8
            self.logger.warning(f"Amount was None, using default: {amount}")

        servo = self.config.servos[joint]
        index = servo.index

        # Calculate new angle
        current_angle = self.CURRENT_ANGLES[index]
        new_angle = current_angle + (amount * (1 if direction else -1))
        new_angle = max(0, min(180, new_angle))  # Clamp to valid range

        # Update servo based on mode
        if self.mode == "servokit":
            self.kit.servo[index].angle = new_angle
            self.CURRENT_ANGLES[index] = new_angle
            self.logger.info(f"ServoKit - joint: {joint} - angle: {new_angle}")

        elif self.mode == "hiwonder":
            hiwonder_pos = self._angle_to_hiwonder(new_angle)
            self.controller.cmd_servo_move([index], [hiwonder_pos], 1000)
            self.CURRENT_ANGLES[index] = new_angle
            self.logger.info(f"HiWonder - joint: {joint} - angle: {new_angle} ({hiwonder_pos})")

    def close(self):
        """Close connections"""
        if self.mode == "hiwonder" and hasattr(self, 'firmata'):
            try:
                self.firmata.exit()
                self.logger.info("HiWonder connection closed")
            except Exception as e:
                self.logger.error(f"Error closing HiWonder connection: {e}")
