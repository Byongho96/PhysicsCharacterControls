import { Camera, Object3D, Vector3 } from 'three';
import { PhysicsOptions } from './base/PhysicsControls';
import PhysicsCharacterControls, { AnimationOptions } from './base/PhysicsCharacterControls';
/**
 * Possible actions for character and camera movement.
 */
type Actions = 'forward' | 'backward' | 'leftward' | 'rightward' | 'jump' | 'cameraUp' | 'cameraDown' | 'cameraLeft' | 'cameraRight';
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
    axisSync?: 'always' | 'move' | 'never';
    posOffset: Vector3;
    lookAtOffset: Vector3;
};
/**
 * Extended physics options specific to character and camera controls.
 */
export type KeyboardPhysicsOptions = PhysicsOptions & {
    jumpForce?: number;
    groundMoveSpeed?: number;
    floatMoveSpeed?: number;
    rotateSpeed?: number;
};
/**
 * Controls class that allows movement with the keyboard and rotation with the camera.
 */
declare class ThirdPersonKeyboardControls extends PhysicsCharacterControls {
    camera: Camera;
    private _cameraPositionOffset;
    private _cameraLookAtOffset;
    private _spherical;
    axisSync: 'always' | 'move' | 'never';
    actionKeys: ActionKeys;
    jumpForce: number;
    groundMoveSpeed: number;
    floatMoveSpeed: number;
    rotateSpeed: number;
    private _objectWorldDirection;
    private _accumulatedDirection;
    private _cameraLookAtPosition;
    private onKeyDownHandler;
    private onKeyUpHandler;
    /**
     * Constructs a new ThirdPersonKeyboardControls instance.
     * @param object - The 3D object to control.
     * @param domElement - The HTML element to attach event listeners to.
     * @param worldObject - The world object used for collision detection.
     * @param camera - The camera to control.
     * @param actionKeys - Key mappings for actions.
     * @param cameraOptions - Configuration options for the camera.
     * @param animationOptions - Animation clips and options.
     * @param physicsOptions - Physics options.
     */
    constructor(object: Object3D, domElement: HTMLElement | null, worldObject: Object3D, camera: Camera, actionKeys: ActionKeys, cameraOptions: CameraOptions, animationOptions?: AnimationOptions, physicsOptions?: KeyboardPhysicsOptions);
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
    /**
     * Updates the object's velocity based on keyboard input.
     * @param delta - Time delta for frame-independent movement.
     */
    private updateControls;
    /**
     * Updates the camera's position and orientation based on the object's position and keyboard input.
     */
    private updateCamera;
    private updateSync;
    /**
     * Main update function that integrates controls, physics, camera, and animations.
     * @param delta - Time delta for consistent updates.
     */
    update(delta: number): void;
    /** Handles keydown events, updating the key state. */
    private onKeyDown;
    /** Handles keyup events, updating the key state. */
    private onKeyUp;
    /**
     * Connects the controls by adding event listeners.
     */
    connect(): void;
    /**
     * Disconnects the controls by removing event listeners.
     */
    disconnect(): void;
    dispose(): void;
}
export { ThirdPersonKeyboardControls };
