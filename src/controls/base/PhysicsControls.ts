import { Box3, Object3D, Vector3 } from 'three';
import { Controls } from 'three'; // Assuming Controls is imported from 'three'
import { Octree } from 'three/examples/jsm/math/Octree.js';
import { ColliderCapsule } from '../../math/Capsule';

/**
 * Event map for PhysicsControls, defining the types of events that can be dispatched.
 */
export interface PhysicsControlsEventMap {
  /**
   * Fires when the collider has collided with the world.
   */
  collide: {};

  /**
   * Fires when the collider is falling.
   */
  fall: {};

  /**
   * Fires when the collider is grounded.
   */
  grounded: {};
}

/**
 * Predefined event objects for reuse when dispatching events.
 */
const _collideEvent = { type: 'collide' as keyof PhysicsControlsEventMap };
const _fallEvent = { type: 'fall' as keyof PhysicsControlsEventMap };
const _groundedEvent = { type: 'grounded' as keyof PhysicsControlsEventMap };

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
  resetPoint: Vector3; // Reset point of the player if out of bounds
  x: BoundaryAxis; // x-axis boundary
  y: BoundaryAxis; // y-axis boundary
  z: BoundaryAxis; // z-axis boundary
};

/**
 * Options to configure the physics properties of the PhysicsControls.
 */
export type PhysicsOptions = {
  gravity?: number; // Gravity of the world (default: 30)
  maxFallSpeed?: number; // Maximum fall speed of the player (default: 20)
  movementResistance?: number; // Resistance of the player movement (default: 4)
  colliderHeight?: number; // Custom height of the capsule collider of the player (default: object's height)
  colliderRadius?: number; // Custom radius of the capsule collider of the player (default: height / 4)
  boundary?: Boundary; // Boundary of the world
};

/**
 * PhysicsControls class that adds physics-based controls to a 3D object.
 */
class PhysicsControls extends Controls<PhysicsControlsEventMap> {
  private _worldOctree: Octree;
  private _capsuleCollider: ColliderCapsule;

  // Physics properties
  gravity: number;
  maxFallSpeed: number;
  movementResistance: number;
  velocity: Vector3 = new Vector3();

  boundary?: Boundary;

  private _isGrounded: boolean = false;
  private _deltaPosition: Vector3 = new Vector3(); // Temporary vector for delta position calculations

  /**
   * Constructs a new PhysicsControls instance.
   * @param object - The 3D object to apply physics controls to.
   * @param domElement - The HTML element for event listeners (optional).
   * @param world - The world object used to build the collision octree.
   * @param physicsOptions - Optional physics configuration.
   */
  constructor(object: Object3D, domElement: HTMLElement | null, world: Object3D, physicsOptions?: PhysicsOptions) {
    super(object, domElement);

    // Create an octree from the world for collision detection.
    this._worldOctree = new Octree();
    this._worldOctree.fromGraphNode(world);

    // Create a capsule collider for the player.
    const objectSize = new Vector3();
    new Box3().setFromObject(this.object).getSize(objectSize);

    const radius = physicsOptions?.colliderRadius || objectSize.y / 4;
    const height = physicsOptions?.colliderHeight || objectSize.y;

    this._capsuleCollider = new ColliderCapsule(new Vector3(0, radius, 0), new Vector3(0, height - radius, 0), radius);
    this._capsuleCollider.translate(object.position);

    // Set physics properties
    this.gravity = physicsOptions?.gravity ?? 30;
    this.maxFallSpeed = physicsOptions?.maxFallSpeed ?? 20;
    this.movementResistance = physicsOptions?.movementResistance ?? 4;

    // Set boundary properties if provided.
    this.boundary = physicsOptions?.boundary;
  }

  get isGrounded() {
    return this._isGrounded;
  }

  get collider() {
    return this._capsuleCollider;
  }

  /**
   * Checks for collisions between the player's collider and the world octree.
   * Updates the player's grounded state and adjusts velocity and position accordingly.
   */
  private checkCollisions() {
    this._isGrounded = false;

    const collisionResult = this._worldOctree.capsuleIntersect(this._capsuleCollider);

    if (!collisionResult) return;

    this.dispatchEvent(_collideEvent);

    if (collisionResult.normal.y > 0) {
      // Player is grounded.
      this._isGrounded = true;
      this.dispatchEvent(_groundedEvent);
    } else {
      // Player is colliding but not grounded.
      this.velocity.addScaledVector(collisionResult.normal, -collisionResult.normal.dot(this.velocity));
      this.dispatchEvent(_fallEvent);
    }

    // Adjust the collider position to resolve penetration.
    if (collisionResult.depth >= 1e-10) {
      this._capsuleCollider.translate(collisionResult.normal.multiplyScalar(collisionResult.depth));
    }
  }

  /**
   * Updates the player's physics state.
   * @param delta - The time step for the update (in seconds).
   */
  update(delta: number) {
    if (!this.enabled) return;

    super.update(delta);

    // Apply movement resistance (damping).
    let damping = Math.exp(-this.movementResistance * delta) - 1;

    if (!this._isGrounded) {
      this.velocity.y -= this.gravity * delta;
      this.velocity.y = Math.max(this.velocity.y, -this.maxFallSpeed);
      damping *= 0.1; // Small air resistance
    }

    this.velocity.addScaledVector(this.velocity, damping);
    this._deltaPosition.copy(this.velocity).multiplyScalar(delta);
    this._capsuleCollider.translate(this._deltaPosition);

    this.checkCollisions();

    this.teleportPlayerIfOutOfBounds();

    // Update the object's position to match the collider.
    this.object.position.copy(this._capsuleCollider.start);
    this.object.position.y -= this._capsuleCollider.radius;
  }

  /**
   * Resets the player's position if they are out of the defined world boundaries.
   */
  private teleportPlayerIfOutOfBounds() {
    if (!this.boundary) return;

    const { resetPoint, x, y, z } = this.boundary;
    const { x: px, y: py, z: pz } = this.object.position;

    // Check if the player is out of bounds.
    if (px < x.min || px > x.max || py < y.min || py > y.max || pz < z.min || pz > z.max) {
      this._capsuleCollider.start.set(resetPoint.x, resetPoint.y + this._capsuleCollider.radius, resetPoint.z);
      this._capsuleCollider.end.set(
        resetPoint.x,
        resetPoint.y + this._capsuleCollider.height - this._capsuleCollider.radius,
        resetPoint.z,
      );

      this.object.position.copy(resetPoint);
      this.velocity.set(0, 0, 0);
    }
  }

  connect() {
    super.connect();
  }

  disconnect() {
    super.disconnect();
  }

  dispose() {
    super.dispose();
  }
}

export { PhysicsControls };
