import { Object3D } from 'three';
import { PhysicsControls, PhysicsOptions } from './base/PhysicsControls';
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
 * Extended physics options specific to pointer lock controls.
 */
type PointerLockPhysicsOptions = PhysicsOptions & {
    eyeHeight?: number;
    jumpForce?: number;
    groundMoveSpeed?: number;
    floatMoveSpeed?: number;
    rotateSpeed?: number;
};
/**
 * FirstPersonPointerLockControls class allows controlling a 3D object using the Pointer Lock API and mouse input.
 */
declare class FirstPersonPointerLockControls extends PhysicsControls {
    eyeHeight: number;
    jumpForce: number;
    groundMoveSpeed: number;
    floatMoveSpeed: number;
    rotateSpeed: number;
    private _objectWorldDirection;
    actionKeys: ActionKeys;
    private onKeyDownHandler;
    private onKeyUpHandler;
    private onMouseMoveHandler;
    private onMouseDownHandler;
    /**
     * Constructs a new FirstPersonPointerLockControls instance.
     * @param object - The 3D object to control.
     * @param domElement - The HTML element for event listeners.
     * @param worldObject - The world object used for physics collision.
     * @param actionKeys - Key mappings for actions.
     * @param physicsOptions - Physics configuration options (optional).
     */
    constructor(object: Object3D, domElement: HTMLElement, worldObject: Object3D, actionKeys: ActionKeys, physicsOptions?: PointerLockPhysicsOptions);
    /**
     * Retrieves the forward _objectWorldDirection vector of the object, ignoring the Y-axis.
     * @returns A normalized Vector3 representing the forward _objectWorldDirection.
     */
    private getForwardVector;
    /**
     * Gets the side (right) direction vector based on the object's orientation.
     * @returns Normalized side vector.
     */
    private getSideVector;
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
    private onKeyDown;
    /** Handles keyup events, updating the key state. */
    private onKeyUp;
    /**
     * @param event - The mouse movement event.
     */
    /** Handles mousemove events to update camera angles with separate clamping for upward and downward movements. */
    private onMouseMove;
    /**
     * Requests pointer lock on the DOM element.
     */
    private onMouseDown;
}
export { FirstPersonPointerLockControls };
