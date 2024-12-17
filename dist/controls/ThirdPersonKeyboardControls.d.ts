import { Camera, Object3D, Vector3 } from 'three';
import { PhysicsOptions } from './base/PhysicsControls';
import PhysicsCharacterControls, { AnimationOptions } from './base/PhysicsCharacterControls';
/**
 * Possible actions for character and camera movement.
 */
type Actions = 'forward' | 'backward' | 'leftward' | 'rightward' | 'jump' | 'turnUp' | 'turnDown' | 'turnLeft' | 'turnRight' | 'accelerate';
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
 * Extended physics options specific to character and camera controls.
 */
type KeyboardPhysicsOptions = PhysicsOptions & {
    jumpForce?: number;
    groundMoveSpeed?: number;
    floatMoveSpeed?: number;
    rotateSpeed?: number;
    enableDiagonalMovement?: boolean;
    enableRotationOnMove?: boolean;
    enableAcceleration?: boolean;
    accelerationFactor?: number;
};
type ThirdPersonKeyboardControlsProps = {
    object: Object3D;
    domElement: HTMLElement | null;
    worldObject: Object3D;
    camera: Camera;
    actionKeys?: ActionKeys;
    cameraOptions?: CameraOptions;
    animationOptions?: AnimationOptions;
    physicsOptions?: KeyboardPhysicsOptions;
};
/**
 * Controls class that allows movement with the keyboard and rotation with the camera.
 */
declare class ThirdPersonKeyboardControls extends PhysicsCharacterControls {
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
    private onMouseWheel;
    constructor({ object, domElement, worldObject, camera, actionKeys, cameraOptions, animationOptions, physicsOptions, }: ThirdPersonKeyboardControlsProps);
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
     * Updates the camera's position and orientation based on the object's position and keyboard input.
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
    /** Handles mouse wheel events to zoom in and out. */
    private _onMouseWheel;
}
export { ThirdPersonKeyboardControls };
