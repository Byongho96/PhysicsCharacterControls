import { Box3, Controls, Object3D, Vector3 } from 'three';
import { Octree } from 'three/examples/jsm/math/Octree.js';
import { ColliderCapsule } from '../../math/Capsule';

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

const _collideEvent = { type: 'collide' as keyof PhysicsControlsEventMap };
const _fallEvent = { type: 'fall' as keyof PhysicsControlsEventMap };
const _groundedEvent = { type: 'grounded' as keyof PhysicsControlsEventMap };

type BoundaryAxis = {
  min: number;
  max: number;
};

type Boundary = {
  resetPoint: Vector3; // Reset point of the player if out of bounds
  x: BoundaryAxis; // x-axis boundary
  y: BoundaryAxis; // y-axis boundary
  z: BoundaryAxis; // z-axis boundary
};

export type PhysicsOptions = {
  gravity?: number; // Gravity of the world
  maxFallSpeed?: number; // Maximum fall speed of the player
  movementResistance?: number; // Resistance of the player movement
  colliderHeight?: number; // Custom height of the capsule collider f the player, default is the height of the object
  colliderRadius?: number; // Custom radius of the capsule collider of the player, default is height / 4
  boundary?: Boundary; // Boundary of the world
};

class PhysicsControls extends Controls<PhysicsControlsEventMap> {
  // Octree of the world
  private _worldOctree: Octree;

  // Capsule collider of the player
  private _capsuleCollider: ColliderCapsule;

  // Physics properties
  gravity: number;
  maxFallSpeed: number;
  movementResistance: number;

  // Velocity of the player
  velocity: Vector3 = new Vector3();

  // Boundary properties
  boundary?: Boundary;

  private _isGrounded: boolean = false;
  private _deltaPosition = new Vector3();

  constructor(object: Object3D, domElement: HTMLElement | null, world: Object3D, physicsOptions?: PhysicsOptions) {
    super(object, domElement);

    // Create octree from the world
    this._worldOctree = new Octree();
    this._worldOctree.fromGraphNode(world);

    // Set physics properties
    const objectSize = new Vector3();
    new Box3().setFromObject(this.object).getSize(objectSize);

    const radius = physicsOptions?.colliderRadius || objectSize.y / 4;
    const height = physicsOptions?.colliderHeight || objectSize.y;

    this._capsuleCollider = new ColliderCapsule(new Vector3(0, radius, 0), new Vector3(0, height - radius, 0), radius);
    this._capsuleCollider.translate(object.position);

    this.gravity = physicsOptions?.gravity || 30;
    this.maxFallSpeed = physicsOptions?.maxFallSpeed || 20;
    this.movementResistance = physicsOptions?.movementResistance || 4;

    // Set boundary properties
    this.boundary = physicsOptions?.boundary;
  }

  get isGrounded() {
    return this._isGrounded;
  }

  get collider() {
    return this._capsuleCollider;
  }

  checkCollisions() {
    this._isGrounded = false;

    const collisionResult = this._worldOctree.capsuleIntersect(this._capsuleCollider);

    if (!collisionResult) return;

    // Dispatch the collision event with relevant data
    this.dispatchEvent(_collideEvent);

    if (collisionResult.normal.y > 0) {
      // Grounded
      this._isGrounded = true;
      this.dispatchEvent(_groundedEvent);
    } else {
      // Falling
      this.velocity.addScaledVector(collisionResult.normal, -collisionResult.normal.dot(this.velocity));
      this.dispatchEvent(_fallEvent);
    }

    // Translate the collider to the collision point
    if (collisionResult.depth >= 1e-10) {
      this._capsuleCollider.translate(collisionResult.normal.multiplyScalar(collisionResult.depth));
    }
  }

  update(delta: number) {
    if (!this.enabled) return;

    // Resistance of the player movement
    let damping = Math.exp(-this.movementResistance * delta) - 1;

    if (!this._isGrounded) {
      this.velocity.y -= Math.min(this.gravity * delta);
      this.velocity.y = Math.max(this.velocity.y, -this.maxFallSpeed);

      // small air resistance
      damping *= 0.1;
    }

    this.velocity.addScaledVector(this.velocity, damping);

    this._deltaPosition.copy(this.velocity).multiplyScalar(delta);
    this._capsuleCollider.translate(this._deltaPosition);

    this.checkCollisions();

    this.teleportPlayerIfOob();

    this.object.position.copy(this._capsuleCollider.start).y -= this._capsuleCollider.radius;
  }

  teleportPlayerIfOob() {
    if (!this.boundary) return;

    const { resetPoint, x, y, z } = this.boundary;

    // Reset the player and the collider if out of bounds
    const { x: px, y: py, z: pz } = this.object.position;
    if (px < x.min || px > x.max || py < y.min || py > y.max || pz < z.min || pz > z.max) {
      this._capsuleCollider.start.set(resetPoint.x, resetPoint.y + this.collider.radius, resetPoint.z);
      this._capsuleCollider.end.set(
        resetPoint.x,
        resetPoint.y + this.collider.height - this.collider.radius,
        resetPoint.z,
      );
      this.object.position.copy(resetPoint);
      this.velocity.set(0, 0, 0);
    }
  }
}

export { PhysicsControls };
