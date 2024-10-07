import { Box3, Controls, Object3D, Vector3 } from 'three';
import { Capsule } from 'three/examples/jsm/math/Capsule.js';
import { Octree } from 'three/examples/jsm/math/Octree.js';

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

const _collideEvent = { type: 'collide' as keyof PhysicsControlsEventMap };
const _fallEvent = { type: 'fall' as keyof PhysicsControlsEventMap };
const _groundEvent = { type: 'ground' as keyof PhysicsControlsEventMap };

class PhysicsControls extends Controls<PhysicsControlsEventMap> {
  private _worldOctree: Octree;

  private _collider: Capsule;
  private _isGrounded: boolean = false;

  velocity: Vector3 = new Vector3();

  gravity: number;
  maxFallSpeed: number;
  resistance: number;

  boundary?: Boundary;

  readonly height: number;
  readonly radius: number;

  constructor(
    object: Object3D,
    domElement: HTMLElement | null,
    world: Object3D,
    physicsOptions?: PhysicsOptions,
  ) {
    super(object, domElement);

    this.height = physicsOptions?.height || this.getSize(object).y;
    this.radius = physicsOptions?.radius || this.getSize(object).y / 4;

    this.resistance = physicsOptions?.resistance || 4;

    this._collider = new Capsule(
      new Vector3(0, this.radius, 0),
      new Vector3(0, this.height - this.radius, 0),
      this.radius,
    );
    this._collider.translate(object.position);

    this.gravity = physicsOptions?.gravity || 30;
    this.maxFallSpeed = physicsOptions?.maxFallSpeed || 60;

    this.boundary = physicsOptions?.boundary;

    this._worldOctree = new Octree();
    this._worldOctree.fromGraphNode(world);
  }

  get collider() {
    return this._collider;
  }

  get isGrounded() {
    return this._isGrounded;
  }

  getSize(object: Object3D) {
    const box = new Box3().setFromObject(object);

    const size = new Vector3();
    box.getSize(size);

    return size;
  }

  checkCollisions() {
    const result = this._worldOctree.capsuleIntersect(this._collider);

    this._isGrounded = false;

    if (!result) return;

    this.dispatchEvent(_collideEvent);

    if (result.normal.y > 0) {
      this.dispatchEvent(_groundEvent);
      this._isGrounded = true;
    }

    if (!this._isGrounded) {
      this.velocity.addScaledVector(
        result.normal,
        -result.normal.dot(this.velocity),
      );
      this.dispatchEvent(_fallEvent);
    }

    if (result.depth >= 1e-10) {
      this.collider.translate(result.normal.multiplyScalar(result.depth));
    }
  }

  update(delta: number) {
    if (!this.enabled) return;

    let damping = Math.exp(-this.resistance * delta) - 1;

    if (!this._isGrounded) {
      this.velocity.y -= Math.min(this.gravity * delta, this.maxFallSpeed);

      // small air resistance
      damping *= 0.1;
    }

    this.velocity.addScaledVector(this.velocity, damping);

    const deltaPosition = this.velocity.clone().multiplyScalar(delta);
    this._collider.translate(deltaPosition);

    this.checkCollisions();

    this.teleportPlayerIfOob();

    this.object.position.copy(this._collider.end).y -=
      this.height / 2 + this.radius;
  }

  teleportPlayerIfOob() {
    if (!this.boundary) return;

    const { resetPoint, x, y, z } = this.boundary;

    if (
      this.object.position.x < x[0] ||
      this.object.position.x > x[1] ||
      this.object.position.y < y[0] ||
      this.object.position.y > y[1] ||
      this.object.position.z < z[0] ||
      this.object.position.z > z[1]
    ) {
      this.object.position.copy(resetPoint);
      this._collider.start.set(
        resetPoint.x,
        resetPoint.y + this.radius,
        resetPoint.z,
      );
      this._collider.end.set(
        resetPoint.x,
        resetPoint.y + this.height - this.radius,
        resetPoint.z,
      );
      this.velocity.set(0, 0, 0);
    }
  }
}

export { PhysicsControls };
