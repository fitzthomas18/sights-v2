/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MoveArmServoParams } from '../models/MoveArmServoParams';
import type { MoveMotorsParams } from '../models/MoveMotorsParams';
import type { PostSettingsBody } from '../models/PostSettingsBody';
import type { RestoreBackupBody } from '../models/RestoreBackupBody';
import type { SensorConfig } from '../models/SensorConfig';
import type { SwitchConfigBody } from '../models/SwitchConfigBody';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class DefaultService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * List Cameras
     * @returns string Successful Response
     * @throws ApiError
     */
    public listCamerasCameraGet(): CancelablePromise<Array<string>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/camera/',
        });
    }
    /**
     * List Available Cameras
     * @returns number Successful Response
     * @throws ApiError
     */
    public listAvailableCamerasCameraAllGet(): CancelablePromise<Array<number>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/camera/all',
        });
    }
    /**
     * Drive
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public driveDrivePost(
        requestBody: MoveMotorsParams,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/drive/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Drive Stop
     * @returns any Successful Response
     * @throws ApiError
     */
    public driveStopDriveStopPost(): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/drive/stop',
        });
    }
    /**
     * Sensor List
     * @returns SensorConfig Successful Response
     * @throws ApiError
     */
    public sensorListSensorListGet(): CancelablePromise<Record<string, SensorConfig>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/sensor/list/',
        });
    }
    /**
     * Sensor
     * @param sensorId
     * @returns any Successful Response
     * @throws ApiError
     */
    public sensorSensorSensorIdGet(
        sensorId: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/sensor/{sensor_id}',
            path: {
                'sensor_id': sensorId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Arm Move
     * @param servoName
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public armMoveArmServoServoNamePost(
        servoName: string,
        requestBody: MoveArmServoParams,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/arm/servo/{servo_name}',
            path: {
                'servo_name': servoName,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Arm Home
     * @returns any Successful Response
     * @throws ApiError
     */
    public armHomeArmHomePost(): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/arm/home',
        });
    }
    /**
     * Arm Home
     * @param preset
     * @returns any Successful Response
     * @throws ApiError
     */
    public armHomeArmPresetPresetPost(
        preset: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/arm/preset/{preset}',
            path: {
                'preset': preset,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Power
     * @returns any Successful Response
     * @throws ApiError
     */
    public powerPoweroffPost(): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/poweroff',
        });
    }
    /**
     * Reboot
     * @returns any Successful Response
     * @throws ApiError
     */
    public rebootRebootPost(): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/reboot',
        });
    }
    /**
     * Reload
     * @returns any Successful Response
     * @throws ApiError
     */
    public reloadReloadPost(): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/reload',
        });
    }
    /**
     * List Available Configs
     * List all available configuration files
     * @returns any Successful Response
     * @throws ApiError
     */
    public listAvailableConfigsConfigsListGet(): CancelablePromise<Array<Record<string, any>>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/configs/list',
        });
    }
    /**
     * Get Current Config
     * Get the currently active configuration
     * @returns any Successful Response
     * @throws ApiError
     */
    public getCurrentConfigConfigsCurrentGet(): CancelablePromise<Record<string, any>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/configs/current',
        });
    }
    /**
     * Switch To Config
     * Switch to a different configuration file
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public switchToConfigConfigsSwitchPost(
        requestBody: SwitchConfigBody,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/configs/switch',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Settings
     * Get the current configuration content
     * @returns string Successful Response
     * @throws ApiError
     */
    public getSettingsSettingsGet(): CancelablePromise<string> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/settings',
        });
    }
    /**
     * Set Settings
     * Save settings to the active configuration file
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public setSettingsSettingsPost(
        requestBody: PostSettingsBody,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/settings',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Backups
     * List all available backups for the current config
     * @returns any Successful Response
     * @throws ApiError
     */
    public listBackupsConfigsBackupsGet(): CancelablePromise<Array<Record<string, any>>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/configs/backups',
        });
    }
    /**
     * Get Backup Content
     * Get the content of a backup file
     * @param backupFilename
     * @returns string Successful Response
     * @throws ApiError
     */
    public getBackupContentConfigsBackupBackupFilenameGet(
        backupFilename: string,
    ): CancelablePromise<string> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/configs/backup/{backup_filename}',
            path: {
                'backup_filename': backupFilename,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Restore Backup
     * Restore a configuration from a backup
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public restoreBackupConfigsRestorePost(
        requestBody: RestoreBackupBody,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/configs/restore',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Logs
     * @returns string Successful Response
     * @throws ApiError
     */
    public getLogsLogsGet(): CancelablePromise<string> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/logs',
        });
    }
    /**
     * Ping Endpoint
     * @returns any Successful Response
     * @throws ApiError
     */
    public pingEndpointPingGet(): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/ping',
        });
    }
}
