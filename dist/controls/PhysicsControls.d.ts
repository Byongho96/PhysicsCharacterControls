import { Controls, Object3D, Vector3 } from 'three';
import { Capsule } from 'three/examples/jsm/math/Capsule.js';
export interface PhysicsControlsEventMap {
    /**
     * Fires when the collider has collided with an object.
     */
    collide: {};
    /**
     * Fires when the collider is grounded.
     */
    fall: {};
    /**
     * Fires when the collider is grounded.
     */
    ground: {};
}
type Boundary = {
    resetPoint: Vector3;
    x: [number, number];
    y: [number, number];
    z: [number, number];
};
export type PhysicsOptions = {
    gravity?: number;
    maxFallSpeed?: number;
    resistance?: number;
    height?: number;
    radius?: number;
    boundary?: Boundary;
};
declare class PhysicsControls extends Controls<PhysicsControlsEventMap> {
    private _worldOctree;
    private _collider;
    private _isGrounded;
    velocity: Vector3;
    gravity: number;
    maxFallSpeed: number;
    resistance: number;
    boundary?: Boundary;
    readonly height: number;
    readonly radius: number;
    constructor(object: Object3D, domElement: HTMLElement | null, world: Object3D, physicsOptions?: PhysicsOptions);
    get collider(): Capsule;
    get isGrounded(): boolean;
    getSize(object: Object3D): Vector3;
    checkCollisions(): void;
    update(delta: number): void;
    teleportPlayerIfOob(): void;
}
export { PhysicsControls };
