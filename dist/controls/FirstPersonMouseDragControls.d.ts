import { Object3D } from 'three';
import { PhysicsControls, PhysicsOptions } from './base/PhysicsControls';
/**
 * Actions that can be performed via keyboard input.
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
 * Extended physics options specific to mouse drag controls.
 */
type MouseDragPhysicsOptions = PhysicsOptions & {
    eyeHeight?: number;
    jumpForce?: number;
    groundMoveSpeed?: number;
    floatMoveSpeed?: number;
    rotateSpeed?: number;
    enableDiagonalMovement?: boolean;
    enableAcceleration?: boolean;
    accelerationFactor?: number;
};
type FirstPersonMouseDragControlsProps = {
    object: Object3D;
    domElement: HTMLElement | null;
    worldObject: Object3D;
    actionKeys?: ActionKeys;
    physicsOptions?: MouseDragPhysicsOptions;
    cameraOptions?: CameraOptions;
};
/**
 * FirstPersonMouseDragControls class allows controlling a 3D object using the mouse drag,
 */
declare class FirstPersonMouseDragControls extends PhysicsControls {
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
    private _isMouseDown;
    private _objectLocalDirection;
    private _accumulatedDirection;
    private _worldYDirection;
    private onKeyDown;
    private onKeyUp;
    private onMouseDown;
    private onMouseUp;
    private onMouseMove;
    private onMouseWheel;
    /**
     * Constructs a new FirstPersonMouseDragControls  instance.
     * @param object - The 3D object to control.
     * @param domElement - The HTML element for event listeners (optional).
     * @param worldObject - The world object used for physics collision.
     * @param actionKeys - Key mappings for actions.
     * @param cameraOptions - Configuration for the camera (optional).
     * @param animationOptions - Configuration for animations (optional).
     * @param physicsOptions - Physics configuration options (optional).
     */
    constructor({ object, domElement, worldObject, actionKeys, cameraOptions, physicsOptions, }: FirstPersonMouseDragControlsProps);
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
    /** Handles mousedown events to set _isMouseDown flag. */
    private _onMouseDown;
    /** Handles mouseup events to reset _isMouseDown flag. */
    private _onMouseUp;
    /** Handles mousemove events to update camera angles when mouse is down. */
    private _onMouseMove;
    private _onMouseWheel;
}
export { FirstPersonMouseDragControls };
