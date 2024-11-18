import { AnimationClip, Camera, Object3D, Vector3 } from 'three';
import { PhysicsControls, PhysicsOptions } from './base/PhysicsControls';
/**
 * Possible actions that can be mapped to keyboard inputs.
 */
type Actions = 'forward' | 'backward' | 'leftward' | 'rightward' | 'jump';
/**
 * Animation states that can be used.
 */
type Animations = 'idle' | 'forward' | 'jump' | 'fall';
/**
 * Configuration for mapping actions to keyboard keys.
 */
export type KeyOptions = Partial<Record<Actions, string[]>>;
/**
 * Configuration for animations and their options.
 */
export type AnimationOptions = Partial<Record<Animations, AnimationClip>> & {
    transitionTime?: number;
    fallSpeedThreshold?: number;
    moveSpeedThreshold?: number;
};
/**
 * Configuration options for camera control.
 */
export type CameraOptions = {
    camera: Camera;
    posOffset: Vector3;
    lookAtOffset: Vector3;
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
declare class MouseDragCameraRotationControls extends PhysicsControls {
    private _characters;
    camera: Camera;
    private _cameraPositionOffset;
    private _cameraLookAtOffset;
    private _cameraRadius;
    private _cameraPhi;
    private _cameraTheta;
    keyOptions: KeyOptions;
    private keyStates;
    private _isMouseDown;
    jumpForce: number;
    groundMoveSpeed: number;
    floatMoveSpeed: number;
    rotateSpeed: number;
    transitionTime: number;
    fallSpeedThreshold: number;
    moveSpeedThreshold: number;
    private _tempVector1;
    private _tempVector2;
    private _tempVector3;
    /**
     * Constructs a new MouseDragCameraRotationControls instance.
     * @param object - The 3D object to control.
     * @param domElement - The HTML element to attach event listeners to.
     * @param worldObject - The world object used for collision detection.
     * @param keyOptions - Key mappings for actions.
     * @param cameraOptions - Configuration options for the camera.
     * @param animationOptions - Animation clips and options.
     * @param physicsOptions - Physics options.
     */
    constructor(object: Object3D, domElement: HTMLElement | null, worldObject: Object3D, keyOptions: KeyOptions, cameraOptions: CameraOptions, animationOptions?: AnimationOptions, physicsOptions?: MouseDragPhysicsOptions);
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
     * Updates the camera's position and orientation based on the object's position and mouse input.
     */
    private updateCamera;
    /**
     * Updates the character's animations based on the current state and velocity.
     * @param delta - Time delta for animation updates.
     */
    private updateAnimation;
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
    /** Handles keydown events to update key states. */
    private onKeyDown;
    /** Handles keyup events to update key states. */
    private onKeyUp;
    /** Handles mousedown events to set _isMouseDown flag. */
    private onMouseDown;
    /** Handles mouseup events to reset _isMouseDown flag. */
    private onMouseUp;
    /** Handles mousemove events to update camera angles when mouse is down. */
    private onMouseMove;
}
export { MouseDragCameraRotationControls };
