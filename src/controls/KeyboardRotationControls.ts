import { AnimationClip, Camera, Object3D, Vector3 } from 'three';
import { PhysicsControls, PhysicsOptions } from './base/PhysicsControls';
import { Characters } from '../characters/Characters';

type Actions = 'forward' | 'backward' | 'leftTurn' | 'rightTurn' | 'jump';

type Animations = 'idle' | 'forward' | 'backward' | 'jump' | 'fall';

type KeyOptions = {
  [K in Actions]?: string[]; // Mapping each action to possible key bindings
};

type AnimationOptions = {
  [K in Animations]?: AnimationClip; // Mapping each animation to a corresponding clip
} & {
  transitionTime?: number; // Time between animation transitions
  fallSpeedThreshold?: number; // Speed threshold to trigger falling animation
  moveSpeedThreshold?: number; // Speed threshold to differentiate idle and movement animations
};

type CameraOptions = {
  camera: Camera; // Camera to control
  posOffset: Vector3; // Offset for camera position relative to the player
  lookAtOffset: Vector3; // Offset for the camera's lookAt position
};

type KeyboardPhysicsOptions = PhysicsOptions & {
  jumpForce?: number; // Force applied when jumping
  groundMoveSpeed?: number; // Speed when moving on the ground
  floatMoveSpeed?: number; // Speed when in the air
  rotateSpeed?: number; // Rotation speed
};

// Tracks the current key states
const keyStates: Record<string, boolean> = {};

class KeyboardRotationControls extends PhysicsControls {
  private _characters: Characters;

  camera: Camera | null = null;
  cameraPosOffset: Vector3 | null = null;
  cameraLookAtOffset: Vector3 | null = null;

  keyOptions: KeyOptions;
  jumpForce: number;
  groundMoveSpeed: number;
  floatMoveSpeed: number;
  rotateSpeed: number;

  transitionTime: number;
  fallSpeedThreshold: number;
  moveSpeedThreshold: number;

  _tmpVector1: Vector3 = new Vector3(); // Temporary vector for calculations
  _direction: Vector3 = new Vector3(); // Direction of the object

  // Handlers for keyboard events
  _onKeyDown: (event: KeyboardEvent) => void;
  _onKeyUp: (event: KeyboardEvent) => void;

  constructor(
    object: Object3D,
    domElement: HTMLElement | null,
    worldObject: Object3D,
    keyOptions: KeyOptions,
    cameraOptions?: CameraOptions,
    animationOptions?: AnimationOptions,
    physicsOptions?: KeyboardPhysicsOptions,
  ) {
    super(object, domElement, worldObject, physicsOptions);

    const { idle, forward, backward, jump, fall } = animationOptions || {};

    // Initialize character animations
    this._characters = new Characters(object, {
      ...(idle && { idle }),
      ...(forward && { forward }),
      ...(backward && { backward }),
      ...(jump && { jump }),
      ...(fall && { fall }),
    });

    this.keyOptions = keyOptions;

    if (cameraOptions) {
      this.camera = cameraOptions.camera;
      this.cameraPosOffset = cameraOptions.posOffset;
      this.cameraLookAtOffset = cameraOptions.lookAtOffset;
    }

    // Set physics parameters
    this.jumpForce = physicsOptions?.jumpForce || 15;
    this.groundMoveSpeed = physicsOptions?.groundMoveSpeed || 25;
    this.floatMoveSpeed = physicsOptions?.floatMoveSpeed || 8;
    this.rotateSpeed = physicsOptions?.rotateSpeed || 1;

    // Set animation options
    this.transitionTime = animationOptions?.transitionTime || 0.3;
    this.fallSpeedThreshold = animationOptions?.fallSpeedThreshold || 15;
    this.moveSpeedThreshold = animationOptions?.moveSpeedThreshold || 1;

    // Bind key event handlers
    this._onKeyDown = onKeyDown.bind(this);
    this._onKeyUp = onKeyUp.bind(this);

    // Connect controls to key events
    this.connect();
  }

  /**
   * Get the forward direction of the object, ignoring the Y-axis (up/down).
   */
  getForwardVector() {
    this.object.getWorldDirection(this._direction);
    this._direction.y = 0;
    this._direction.normalize();

    return this._direction;
  }

  /**
   * Get the side (right) direction of the object, relative to its forward direction.
   */
  getSideVector() {
    this.object.getWorldDirection(this._direction);
    this._direction.y = 0;
    this._direction.normalize();
    this._direction.cross(this.object.up);

    return this._direction;
  }

  /**
   * Updates movement and rotation based on keyboard input.
   * @param delta - Time delta to adjust movement speed.
   */
  updateControls(delta: number) {
    const speedDelta = delta * (this.isGrounded ? this.groundMoveSpeed : this.floatMoveSpeed);

    if (this.keyOptions.forward?.some(key => keyStates[key])) {
      this.velocity.add(this.getForwardVector().multiplyScalar(speedDelta));
    }

    if (this.keyOptions.backward?.some(key => keyStates[key])) {
      this.velocity.add(this.getForwardVector().multiplyScalar(-speedDelta));
    }

    if (this.keyOptions.leftTurn?.some(key => keyStates[key])) {
      this.object.rotateY(delta * this.rotateSpeed);
    }

    if (this.keyOptions.rightTurn?.some(key => keyStates[key])) {
      this.object.rotateY(delta * -this.rotateSpeed);
    }

    if (this.isGrounded && this.keyOptions.jump?.some(key => keyStates[key])) {
      this.velocity.y = this.jumpForce;
    }
  }

  /**
   * Updates the camera position and orientation based on the player's position.
   */
  updateCamera() {
    if (this.camera && this.cameraPosOffset && this.cameraLookAtOffset) {
      this.object.updateMatrixWorld();

      const worldOffset = this.cameraPosOffset.clone().applyMatrix4(this.object.matrixWorld);

      this.camera.position.copy(worldOffset);

      this.camera.lookAt(this.object.getWorldPosition(this._tmpVector1).add(this.cameraLookAtOffset));
    }
  }

  /**
   * Updates animations based on the player's current velocity and state.
   * @param delta - Time delta to adjust animation blending.
   */
  updateAnimation(delta: number) {
    this._characters.update(delta);

    this.object.getWorldDirection(this._direction);

    const forwardSpeed = this._direction.dot(this.velocity);

    if (this.isGrounded && forwardSpeed > this.moveSpeedThreshold) {
      this._characters.fadeToAction('forward', this.transitionTime);
    } else if (this.isGrounded && forwardSpeed < -this.moveSpeedThreshold) {
      this._characters.fadeToAction('backward', this.transitionTime);
    } else if (this.isGrounded) {
      this._characters.fadeToAction('idle', this.transitionTime);
    } else if (this.velocity.y > 0) {
      this._characters.fadeToAction('jump', this.transitionTime);
    } else if (this.velocity.y < -this.fallSpeedThreshold) {
      this._characters.fadeToAction('fall', this.transitionTime);
    }
  }

  /**
   * Main update function that integrates all controls, physics, camera, and animations.
   * @param delta - Time delta for consistent updates.
   */
  update(delta: number) {
    this.updateControls(delta);

    super.update(delta);

    this.updateCamera();
    this.updateAnimation(delta);
  }

  /**
   * Connects the keyboard controls to the DOM, enabling event listeners.
   */
  connect() {
    super.connect();

    document.addEventListener('keydown', this._onKeyDown);
    document.addEventListener('keyup', this._onKeyUp);
  }

  /**
   * Disconnects the keyboard controls, removing event listeners.
   */
  disconnect() {
    super.disconnect();

    document.removeEventListener('keydown', this._onKeyDown);
    document.removeEventListener('keyup', this._onKeyUp);
  }
}

/**
 * Handles keydown events, updating the key state.
 * @param event - Keyboard event.
 */
function onKeyDown(event: KeyboardEvent) {
  keyStates[event.key] = true;
}

/**
 * Handles keyup events, updating the key state.
 * @param event - Keyboard event.
 */
function onKeyUp(event: KeyboardEvent) {
  keyStates[event.key] = false;
}

export { KeyboardRotationControls };
