import { Object3D } from 'three';
import { PhysicsControls, PhysicsOptions } from './base/PhysicsControls';
/**
 * Actions that can be performed via keyboard input.
 */
type Actions = 'forward' | 'backward' | 'leftward' | 'rightward' | 'turnLeft' | 'turnRight' | 'turnUp' | 'turnDown' | 'jump' | 'accelerate';
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
 * Extended physics options specific to keyboard controls.
 */
type KeyboardPhysicsOptions = PhysicsOptions & {
    eyeHeight?: number;
    jumpForce?: number;
    groundMoveSpeed?: number;
    floatMoveSpeed?: number;
    rotateSpeed?: number;
    enableDiagonalMovement?: boolean;
    enableAcceleration?: boolean;
    accelerationFactor?: number;
};
type FirstPersonKeyboardControlsProps = {
    object: Object3D;
    domElement: HTMLElement | null;
    worldObject: Object3D;
    actionKeys?: ActionKeys;
    physicsOptions?: KeyboardPhysicsOptions;
    cameraOptions?: CameraOptions;
};
/**
 * FirstPersonKeyboardControls class allows controlling a 3D object using the keyboard,
 */
declare class FirstPersonKeyboardControls extends PhysicsControls {
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
    private onMouseWheel;
    constructor({ object, domElement, worldObject, actionKeys, cameraOptions, physicsOptions, }: FirstPersonKeyboardControlsProps);
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
     * Updates movement and rotation based on the current keyboard input.
     * @param delta - The time delta for frame-independent movement.
     */
    private updateControls;
    /**
     * Main update function that integrates controls, physics, camera, and animations.
     * @param delta - The time delta for consistent updates.
     */
    update(delta: number): void;
    /**
     * Connects the keyboard controls by adding event listeners.
     */
    connect(): void;
    /**
     * Disconnects the keyboard controls by removing event listeners.
     */
    disconnect(): void;
    /**
     * Disposes of the keyboard controls, cleaning up event listeners and animations.
     */
    dispose(): void;
    /** Handles keydown events, updating the key state. */
    private _onKeyDown;
    /** Handles keyup events, updating the key state. */
    private _onKeyUp;
    private _onMouseWheel;
}
export { FirstPersonKeyboardControls };
