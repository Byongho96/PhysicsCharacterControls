import { Object3D, Vector3 } from 'three';
import { Controls } from 'three';
import { Capsule } from 'three/examples/jsm/math/Capsule.js';
/**
 * Event map for PhysicsControls, defining the types of events that can be dispatched.
 */
export interface PhysicsControlsEventMap {
    /**
     * Fires when the collider has collided with the world.
     */
    collide: {
        normal: Vector3;
    };
}
/**
 * Defines the minimum and maximum boundaries along an axis.
 */
type BoundaryAxis = {
    min: number;
    max: number;
};
/**
 * Defines the boundary of the world and the reset point when the player goes out of bounds.
 */
type Boundary = {
    resetPoint: Vector3;
    x: BoundaryAxis;
    y: BoundaryAxis;
    z: BoundaryAxis;
};
/**
 * Options to configure the physics properties of the PhysicsControls.
 */
export type PhysicsOptions = {
    step?: number;
    gravity?: number;
    maxFallSpeed?: number;
    movementResistance?: number;
    colliderHeight?: number;
    colliderRadius?: number;
    boundary?: Boundary;
    landTimeThreshold?: number;
};
/**
 * PhysicsControls class that adds physics-based controls to a 3D object.
 */
declare class PhysicsControls extends Controls<PhysicsControlsEventMap> {
    private _worldOctree;
    private _capsuleCollider;
    private _ray;
    step: number;
    gravity: number;
    maxFallSpeed: number;
    movementResistance: number;
    velocity: Vector3;
    landTimeThreshold: number;
    boundary?: Boundary;
    private _isGrounded;
    private _isLanding;
    private _deltaVelocity;
    /**
     * Constructs a new PhysicsControls instance.
     * @param object - The 3D object to apply physics controls to.
     * @param domElement - The HTML element for event listeners (optional).
     * @param world - The world object used to build the collision octree.
     * @param physicsOptions - Optional physics configuration.
     */
    constructor(object: Object3D, domElement: HTMLElement | null, world: Object3D, physicsOptions?: PhysicsOptions);
    get isGrounded(): boolean;
    get isLanding(): boolean;
    get collider(): Capsule;
    /**
     * Checks for collisions between the player's collider and the world octree.
     * Updates the player's grounded state and adjusts velocity and position accordingly.
     */
    private _checkCollisions;
    private _checkLanding;
    /**
     * Resets the player's position if they are out of the defined world boundaries.
     */
    private _teleportPlayerIfOutOfBounds;
    /**
     * Updates the player's physics state.
     * @param delta - The time step for the update (in seconds).
     */
    update(delta: number): void;
    connect(): void;
    disconnect(): void;
    dispose(): void;
}
export { PhysicsControls };
