import { Camera, Object3D, Vector3 } from 'three';
import { PhysicsOptions } from './base/PhysicsControls';
import PhysicsCharacterControls, { AnimationOptions } from './base/PhysicsCharacterControls';
/**
 * Possible actions that can be mapped to keyboard inputs.
 */
type Actions = 'forward' | 'backward' | 'leftward' | 'rightward' | 'jump';
/**
 * Configuration for key mappings to actions.
 */
type ActionKeys = {
    [K in Actions]?: string[];
};
/**
 * Configuration options for camera control.
 */
export type CameraOptions = {
    axisSync?: 'always' | 'move' | 'never';
    posOffset: Vector3;
    lookAtOffset: Vector3;
    cameraLerpFactor?: number;
};
/**
 * Extended physics options specific to mouse drag controls.
 */
export type MouseDragPhysicsOptions = PhysicsOptions & {
    jumpForce?: number;
    groundMoveSpeed?: number;
    floatMoveSpeed?: number;
    rotateSpeed?: number;
};
/**
 * Controls class that allows movement with the keyboard and rotation with the mouse.
 */
declare class ThirdPersonMouseDragControls extends PhysicsCharacterControls {
    camera: Camera;
    private _cameraPositionOffset;
    private _cameraLookAtOffset;
    private _spherical;
    private cameraLerpFactor;
    axisSync: 'always' | 'move' | 'never';
    actionKeys: ActionKeys;
    private _isMouseDown;
    jumpForce: number;
    groundMoveSpeed: number;
    floatMoveSpeed: number;
    rotateSpeed: number;
    private _objectWorldDirection;
    private _accumulatedDirection;
    private _cameraLookAtPosition;
    private _cameraLerpPosition;
    private _forwardDirection;
    private onKeyDownHandler;
    private onKeyUpHandler;
    private onMouseDownHandler;
    private onMouseUpHandler;
    private onMouseMoveHandler;
    /**
     * Constructs a new ThirdPersonMouseDragControls instance.
     * @param object - The 3D object to control.
     * @param domElement - The HTML element to attach event listeners to.
     * @param worldObject - The world object used for collision detection.
     * @param actionKeys - Key mappings for actions.
     * @param cameraOptions - Configuration options for the camera.
     * @param animationOptions - Animation clips and options.
     * @param physicsOptions - Physics options.
     */
    constructor(object: Object3D, domElement: HTMLElement | null, worldObject: Object3D, camera: Camera, actionKeys: ActionKeys, cameraOptions: CameraOptions, animationOptions?: AnimationOptions, physicsOptions?: MouseDragPhysicsOptions);
    get cameraPosOffset(): Vector3;
    set cameraPosOffset(offset: Vector3);
    get cameraLookAtOffset(): Vector3;
    set cameraLookAtOffset(offset: Vector3);
    /**
     * Updates the camera's spherical coordinates based on the current offsets.
     */
    private updateCameraInfo;
    /**
     * Gets the forward direction vector based on the camera's orientation.
     * @returns Normalized forward vector.
     */
    private getForwardVector;
    /**
     * Gets the side (right) direction vector based on the camera's orientation.
     * @returns Normalized side vector.
     */
    private getSideVector;
    private updateSync;
    /**
     * Updates the object's velocity based on keyboard input.
     * @param delta - Time delta for frame-independent movement.
     */
    private updateControls;
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
    private onKeyDown;
    /** Handles keyup events, updating the key state. */
    private onKeyUp;
    /** Handles mousedown events to set _isMouseDown flag. */
    private onMouseDown;
    /** Handles mouseup events to reset _isMouseDown flag. */
    private onMouseUp;
    /** Handles mousemove events to update camera angles when mouse is down. */
    private onMouseMove;
}
export { ThirdPersonMouseDragControls };
