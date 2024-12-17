import { Object3D } from 'three';
import { PhysicsControls, PhysicsOptions } from './base/PhysicsControls';
/**
 * Possible actions that can be mapped to keyboard inputs.
 */
type Actions = 'forward' | 'backward' | 'leftward' | 'rightward' | 'jump' | 'accelerate';
/**
 * Configuration for key mappings to actions.
 */
type ActionKeys = {
    [K in Actions]?: string[];
};
/**
 * Configuration options for camera control.
 */
type CameraOptions = {
    enableZoom?: boolean;
    zoomSpeed?: number;
};
/**
 * Extended physics options specific to pointer lock controls.
 */
type PointerLockPhysicsOptions = PhysicsOptions & {
    eyeHeight?: number;
    jumpForce?: number;
    groundMoveSpeed?: number;
    floatMoveSpeed?: number;
    rotateSpeed?: number;
    enableDiagonalMovement?: boolean;
    enableAcceleration?: boolean;
    accelerationFactor?: number;
};
type FirstPersonPointerLockControlsProps = {
    object: Object3D;
    domElement: HTMLElement | null;
    worldObject: Object3D;
    actionKeys?: ActionKeys;
    physicsOptions?: PointerLockPhysicsOptions;
    cameraOptions?: CameraOptions;
};
/**
 * FirstPersonPointerLockControls class allows controlling a 3D object using the Pointer Lock API and mouse input.
 */
declare class FirstPersonPointerLockControls extends PhysicsControls {
    actionKeys: ActionKeys;
    enableZoom: boolean;
    zoomSpeed: number;
    eyeHeight: number;
    jumpForce: number;
    groundMoveSpeed: number;
    floatMoveSpeed: number;
    rotateSpeed: number;
    enableDiagonalMovement: boolean;
    enableAcceleration: boolean;
    accelerationFactor: number;
    private _keyCount;
    private _objectLocalDirection;
    private _accumulatedDirection;
    private _worldYDirection;
    private onKeyDown;
    private onKeyUp;
    private onMouseMove;
    private onMouseDown;
    private onMouseWheel;
    constructor({ object, domElement, worldObject, actionKeys, cameraOptions, physicsOptions, }: FirstPersonPointerLockControlsProps);
    /**
     * Retrieves the forward _objectWorldDirection vector of the object, ignoring the Y-axis.
     * @returns A normalized Vector3 representing the forward _objectWorldDirection.
     */
    private _getForwardVector;
    /**
     * Gets the side (right) direction vector based on the camera's orientation.
     * @returns Normalized side vector.
     */
    private _getSideVector;
    private _accumulateDirection;
    private _getMostRecentDirection;
    /**
     * Updates movement based on physics and camera rotation.
     * @param delta - The time delta for frame-independent movement.
     */
    private updateControls;
    /**
     * Main update function that integrates controls, physics, and camera.
     * @param delta - The time delta for consistent updates.
     */
    update(delta: number): void;
    /**
     * Connects the pointer lock controls by adding event listeners.
     */
    connect(): void;
    /**
     * Disconnects the pointer lock controls by removing event listeners.
     */
    disconnect(): void;
    /**
     * Disposes of the pointer lock controls, cleaning up event listeners and animations.
     */
    dispose(): void;
    /** Handles keydown events, updating the key state. */
    private _onKeyDown;
    /** Handles keyup events, updating the key state. */
    private _onKeyUp;
    /**
     * Requests pointer lock on the DOM element.
     */
    private _onMouseDown;
    /** Handles mousemove events to update camera angles with separate clamping for upward and downward movements. */
    private _onMouseMove;
    private _onMouseWheel;
}
export { FirstPersonPointerLockControls };
