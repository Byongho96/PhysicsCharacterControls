import { AnimationClip, Camera, Object3D, Vector3 } from 'three';
import { PhysicsControls, PhysicsOptions } from './base/PhysicsControls';
/**
 * Actions that can be performed via keyboard input.
 */
type Actions = 'forward' | 'backward' | 'leftTurn' | 'rightTurn' | 'jump';
/**
 * Possible animations corresponding to actions or states.
 */
type Animations = 'idle' | 'forward' | 'backward' | 'jump' | 'fall';
/**
 * Configuration for key mappings to actions.
 */
type KeyOptions = {
    [K in Actions]?: string[];
};
/**
 * Configuration for animation clips and related options.
 */
type AnimationOptions = {
    [K in Animations]?: AnimationClip;
} & {
    transitionTime?: number;
    fallSpeedThreshold?: number;
    moveSpeedThreshold?: number;
};
/**
 * Configuration for camera positioning relative to the player.
 */
type CameraOptions = {
    camera: Camera;
    posOffset: Vector3;
    lookAtOffset: Vector3;
};
/**
 * Extended physics options specific to keyboard controls.
 */
type KeyboardPhysicsOptions = PhysicsOptions & {
    jumpForce?: number;
    groundMoveSpeed?: number;
    floatMoveSpeed?: number;
    rotateSpeed?: number;
};
/**
 * KeyboardRotationControls class allows controlling an object using keyboard input,
 * including movement, rotation, physics simulation, camera control, and animations.
 */
declare class KeyboardRotationControls extends PhysicsControls {
    /** Character animations handler. */
    private _characters;
    camera: Camera | null;
    cameraPosOffset: Vector3 | null;
    cameraLookAtOffset: Vector3 | null;
    keyOptions: KeyOptions;
    jumpForce: number;
    groundMoveSpeed: number;
    floatMoveSpeed: number;
    rotateSpeed: number;
    transitionTime: number;
    fallSpeedThreshold: number;
    moveSpeedThreshold: number;
    private _tempVector;
    private _direction;
    private onKeyDownHandler;
    private onKeyUpHandler;
    /**
     * Constructs a new KeyboardRotationControls instance.
     * @param object - The 3D object to control.
     * @param domElement - The HTML element for event listeners (optional).
     * @param worldObject - The world object used for physics collision.
     * @param keyOptions - Key mappings for actions.
     * @param cameraOptions - Configuration for the camera (optional).
     * @param animationOptions - Configuration for animations (optional).
     * @param physicsOptions - Physics configuration options (optional).
     */
    constructor(object: Object3D, domElement: HTMLElement | null, worldObject: Object3D, keyOptions: KeyOptions, cameraOptions?: CameraOptions, animationOptions?: AnimationOptions, physicsOptions?: KeyboardPhysicsOptions);
    /**
     * Retrieves the forward _direction vector of the object, ignoring the Y-axis.
     * @returns A normalized Vector3 representing the forward _direction.
     */
    private getForwardVector;
    /**
     * Updates movement and rotation based on the current keyboard input.
     * @param delta - The time delta for frame-independent movement.
     */
    private updateControls;
    /**
     * Updates the camera's position and orientation based on the object's transformation.
     */
    private updateCamera;
    /**
     * Updates the character's animations based on the current state and velocity.
     * @param delta - The time delta for animation blending.
     */
    private updateAnimation;
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
    /**
     * Handles keydown events, updating the key state.
     * @param event - The keyboard event.
     */
    private onKeyDown;
    /**
     * Handles keyup events, updating the key state.
     * @param event - The keyboard event.
     */
    private onKeyUp;
}
export { KeyboardRotationControls };
