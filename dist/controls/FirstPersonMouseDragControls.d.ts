import { Object3D } from 'three';
import { PhysicsControls, PhysicsOptions } from './base/PhysicsControls';
/**
 * Actions that can be performed via keyboard input.
 */
type Actions = 'forward' | 'backward' | 'leftward' | 'rightward' | 'jump';
/**
 * Configuration for key mappings to actions.
 */
type ActionKeys = {
    [K in Actions]?: string[];
};
/**
 * Extended physics options specific to mouse drag controls.
 */
type FirstPersonMouseDragPhysicsOptions = PhysicsOptions & {
    eyeHeight?: number;
    jumpForce?: number;
    groundMoveSpeed?: number;
    floatMoveSpeed?: number;
    rotateSpeed?: number;
};
/**
 * FirstPersonMouseDragControls class allows controlling a 3D object using the mouse drag,
 */
declare class FirstPersonMouseDragControls extends PhysicsControls {
    actionKeys: ActionKeys;
    eyeHeight: number;
    jumpForce: number;
    groundMoveSpeed: number;
    floatMoveSpeed: number;
    rotateSpeed: number;
    private _isMouseDown;
    private _objectWorldDirection;
    private _accumulatedMovement;
    private onKeyDownHandler;
    private onKeyUpHandler;
    private onMouseDownHandler;
    private onMouseUpHandler;
    private onMouseMoveHandler;
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
    constructor(object: Object3D, domElement: HTMLElement | null, worldObject: Object3D, actionKeys: ActionKeys, physicsOptions?: FirstPersonMouseDragPhysicsOptions);
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
    /** Handles mousedown events to set _isMouseDown flag. */
    private onMouseDown;
    /** Handles mouseup events to reset _isMouseDown flag. */
    private onMouseUp;
    /** Handles mousemove events to update camera angles when mouse is down. */
    private onMouseMove;
}
export { FirstPersonMouseDragControls };
