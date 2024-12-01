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
type MouseDragPhysicsOptions = PhysicsOptions & {
    jumpForce?: number;
    groundMoveSpeed?: number;
    floatMoveSpeed?: number;
    rotateSpeed?: number;
    enableDiagonalMovement?: boolean;
    enableRotationOnMove?: boolean;
    enableAcceleration?: boolean;
    accelerationFactor?: number;
};
type ThirdPersonMouseDragControlsProps = {
    object: Object3D;
    domElement: HTMLElement | null;
    worldObject: Object3D;
    camera: Camera;
    actionKeys?: ActionKeys;
    cameraOptions?: CameraOptions;
    animationOptions?: AnimationOptions;
    physicsOptions?: MouseDragPhysicsOptions;
};
/**
 * Controls class that allows movement with the keyboard and rotation with the mouse.
 */
declare class ThirdPersonMouseDragControls extends PhysicsCharacterControls {
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
    private _isMouseDown;
    private _keyCount;
    private _forwardDirection;
    private _objectLocalDirection;
    private _accumulatedDirection;
    private _cameraLookAtPosition;
    private _cameraLerpPosition;
    private onKeyDown;
    private onKeyUp;
    private onMouseDown;
    private onMouseUp;
    private onMouseMove;
    private onMouseWheel;
    constructor({ object, domElement, worldObject, camera, actionKeys, cameraOptions, animationOptions, physicsOptions, }: ThirdPersonMouseDragControlsProps);
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
    /** Handles mousedown events to set _isMouseDown flag. */
    private _onMouseDown;
    /** Handles mouseup events to reset _isMouseDown flag. */
    private _onMouseUp;
    /** Handles mousemove events to update camera angles when mouse is down. */
    private _onMouseMove;
    /** Handles mouse wheel events to zoom in and out. */
    private _onMouseWheel;
}
export { ThirdPersonMouseDragControls };
