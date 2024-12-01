import { Camera, Object3D, Vector3 } from 'three';
import { PhysicsOptions } from './base/PhysicsControls';
import PhysicsCharacterControls, { AnimationOptions } from './base/PhysicsCharacterControls';
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
    posOffset?: Vector3;
    lookAtOffset?: Vector3;
    cameraLerpFactor?: number;
    axisSync?: 'always' | 'move' | 'never';
    enableZoom?: boolean;
    zoomSpeed?: number;
};
/**
 * Extended physics options specific to mouse drag controls.
 */
type PointerLockPhysicsOptions = PhysicsOptions & {
    jumpForce?: number;
    groundMoveSpeed?: number;
    floatMoveSpeed?: number;
    rotateSpeed?: number;
    enableDiagonalMovement?: boolean;
    enableRotationOnMove?: boolean;
    enableAcceleration?: boolean;
    accelerationFactor?: number;
};
type ThirdPersonPointerLockControlsProps = {
    object: Object3D;
    domElement: HTMLElement | null;
    worldObject: Object3D;
    camera: Camera;
    actionKeys?: ActionKeys;
    cameraOptions?: CameraOptions;
    animationOptions?: AnimationOptions;
    physicsOptions?: PointerLockPhysicsOptions;
};
/**
 * Controls class that allows movement with the keyboard and rotation with the mouse.
 */
declare class ThirdPersonPointerLockControls extends PhysicsCharacterControls {
    actionKeys: ActionKeys;
    camera: Camera;
    cameraPositionOffset: Vector3;
    cameraLookAtOffset: Vector3;
    cameraLerpFactor: number;
    axisSync: 'always' | 'move' | 'never';
    enableZoom: boolean;
    zoomSpeed: number;
    jumpForce: number;
    groundMoveSpeed: number;
    floatMoveSpeed: number;
    rotateSpeed: number;
    enableDiagonalMovement: boolean;
    enableRotationOnMove: boolean;
    enableAcceleration: boolean;
    accelerationFactor: number;
    private _spherical;
    private _keyCount;
    private _forwardDirection;
    private _objectLocalDirection;
    private _accumulatedDirection;
    private _cameraLookAtPosition;
    private _cameraLerpPosition;
    private onKeyDown;
    private onKeyUp;
    private onMouseDown;
    private onMouseMove;
    private onMouseWheel;
    constructor({ object, domElement, worldObject, camera, actionKeys, cameraOptions, animationOptions, physicsOptions, }: ThirdPersonPointerLockControlsProps);
    /**
     * Gets the forward direction vector based on the camera's orientation.
     * @returns Normalized forward vector.
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
     * Updates the object's velocity based on keyboard input.
     * @param delta - Time delta for frame-independent movement.
     */
    private updateControls;
    private updateSync;
    /**
     * Updates the camera's position and orientation based on the object's position and mouse input.
     */
    private updateCamera;
    /**
     * Main update function that integrates controls, physics, camera, and animations.
     * @param delta - Time delta for consistent updates.
     */
    update(delta: number): void;
    /**
     * Connects the controls by adding event listeners.
     */
    connect(): void;
    /**
     * Disconnects the controls by removing event listeners.
     */
    disconnect(): void;
    dispose(): void;
    /** Handles keydown events, updating the key state. */
    private _onKeyDown;
    /** Handles keyup events, updating the key state. */
    private _onKeyUp;
    /** Handles mousedown events to lock pointer. */
    private _onMouseDown;
    /** Handles mousemove events to update camera angles when pointer is locked. */
    private _onMouseMove;
    /** Handles mouse wheel events to zoom in and out. */
    private _onMouseWheel;
}
export { ThirdPersonPointerLockControls };
