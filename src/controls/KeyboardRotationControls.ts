import { AnimationClip, Camera, Object3D, Vector3 } from 'three';
import { PhysicsControls, PhysicsOptions } from './base/PhysicsControls';
import { Characters } from '../characters/Characters';

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
  [K in Actions]?: string[]; // Mapping each action to possible key bindings
};

/**
 * Configuration for animation clips and related options.
 */
type AnimationOptions = {
  [K in Animations]?: AnimationClip; // Mapping each animation to a corresponding clip
} & {
  transitionTime?: number; // Time between animation transitions
  fallSpeedThreshold?: number; // Speed threshold to trigger falling animation
  moveSpeedThreshold?: number; // Speed threshold to differentiate idle and movement animations
};

/**
 * Configuration for camera positioning relative to the player.
 */
type CameraOptions = {
  camera: Camera; // Camera to control
  posOffset: Vector3; // Offset for camera position relative to the player
  lookAtOffset: Vector3; // Offset for the camera's lookAt position
};

/**
 * Extended physics options specific to keyboard controls.
 */
type KeyboardPhysicsOptions = PhysicsOptions & {
  jumpForce?: number; // Force applied when jumping
  groundMoveSpeed?: number; // Speed when moving on the ground
  floatMoveSpeed?: number; // Speed when in the air
  rotateSpeed?: number; // Rotation speed
};

/**
 * Global object to track the current state of pressed keys.
 */
const keyStates: Record<string, boolean> = {};

/**
 * KeyboardRotationControls class allows controlling an object using keyboard input,
 * including movement, rotation, physics simulation, camera control, and animations.
 */
class KeyboardRotationControls extends PhysicsControls {
  /** Character animations handler. */
  private _characters: Characters;

  camera: Camera | null = null;
  cameraPosOffset: Vector3 | null = null;
  cameraLookAtOffset: Vector3 | null = null;

  keyOptions: KeyOptions;

  // Physics options
  jumpForce: number;
  groundMoveSpeed: number;
  floatMoveSpeed: number;
  rotateSpeed: number;

  // Animation options
  transitionTime: number;
  fallSpeedThreshold: number;
  moveSpeedThreshold: number;

  private _tempVector: Vector3 = new Vector3(); // Temporary vector for calculations
  private _direction: Vector3 = new Vector3();

  // Handlers for keyboard events.
  private onKeyDownHandler: (event: KeyboardEvent) => void;
  private onKeyUpHandler: (event: KeyboardEvent) => void;

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

    // Initialize character animations.
    const { idle, forward, backward, jump, fall } = animationOptions || {};
    this._characters = new Characters(object, {
      ...(idle && { idle }),
      ...(forward && { forward }),
      ...(backward && { backward }),
      ...(jump && { jump }),
      ...(fall && { fall }),
    });

    // Set key mappings.
    this.keyOptions = keyOptions;

    // Initialize camera options if provided.
    if (cameraOptions) {
      this.camera = cameraOptions.camera;
      this.cameraPosOffset = cameraOptions.posOffset.clone();
      this.cameraLookAtOffset = cameraOptions.lookAtOffset.clone();
    }

    // Set physics parameters with defaults if not provided.
    this.jumpForce = physicsOptions?.jumpForce ?? 15;
    this.groundMoveSpeed = physicsOptions?.groundMoveSpeed ?? 25;
    this.floatMoveSpeed = physicsOptions?.floatMoveSpeed ?? 8;
    this.rotateSpeed = physicsOptions?.rotateSpeed ?? 1;

    // Set animation options with defaults if not provided.
    this.transitionTime = animationOptions?.transitionTime ?? 0.3;
    this.fallSpeedThreshold = animationOptions?.fallSpeedThreshold ?? 15;
    this.moveSpeedThreshold = animationOptions?.moveSpeedThreshold ?? 1;

    // Bind key event handlers.
    this.onKeyDownHandler = this.onKeyDown.bind(this);
    this.onKeyUpHandler = this.onKeyUp.bind(this);

    // Connect controls to key events.
    this.connect();
  }

  /**
   * Retrieves the forward _direction vector of the object, ignoring the Y-axis.
   * @returns A normalized Vector3 representing the forward _direction.
   */
  private getForwardVector(): Vector3 {
    this.object.getWorldDirection(this._direction);
    this._direction.y = 0;
    this._direction.normalize();

    return this._direction;
  }

  /**
   * Updates movement and rotation based on the current keyboard input.
   * @param delta - The time delta for frame-independent movement.
   */
  private updateControls(delta: number) {
    const speedDelta = delta * (this.isGrounded ? this.groundMoveSpeed : this.floatMoveSpeed);

    // Move forward.
    if (this.keyOptions.forward?.some(key => keyStates[key])) {
      this.velocity.add(this.getForwardVector().multiplyScalar(speedDelta));
    }

    // Move backward.
    if (this.keyOptions.backward?.some(key => keyStates[key])) {
      this.velocity.add(this.getForwardVector().multiplyScalar(-speedDelta));
    }

    // Turn left.
    if (this.keyOptions.leftTurn?.some(key => keyStates[key])) {
      this.object.rotateY(delta * this.rotateSpeed);
    }

    // Turn right.
    if (this.keyOptions.rightTurn?.some(key => keyStates[key])) {
      this.object.rotateY(delta * -this.rotateSpeed);
    }

    // Jump if grounded.
    if (this.isGrounded && this.keyOptions.jump?.some(key => keyStates[key])) {
      this.velocity.y = this.jumpForce;
    }
  }

  /**
   * Updates the camera's position and orientation based on the object's transformation.
   */
  private updateCamera() {
    if (!this.camera || !this.cameraPosOffset || !this.cameraLookAtOffset) return;

    this.object.updateMatrixWorld();

    const worldOffset = this.cameraPosOffset.clone().applyMatrix4(this.object.matrixWorld);
    this.camera.position.copy(worldOffset);

    this.camera.lookAt(this.object.getWorldPosition(this._tempVector).add(this.cameraLookAtOffset));
  }

  /**
   * Updates the character's animations based on the current state and velocity.
   * @param delta - The time delta for animation blending.
   */
  private updateAnimation(delta: number) {
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
   * Main update function that integrates controls, physics, camera, and animations.
   * @param delta - The time delta for consistent updates.
   */
  update(delta: number) {
    this.updateControls(delta);

    super.update(delta);

    this.updateCamera();
    this.updateAnimation(delta);
  }

  /**
   * Connects the keyboard controls by adding event listeners.
   */
  connect() {
    super.connect();

    document.addEventListener('keydown', this.onKeyDownHandler);
    document.addEventListener('keyup', this.onKeyUpHandler);
  }

  /**
   * Disconnects the keyboard controls by removing event listeners.
   */
  disconnect() {
    super.disconnect();

    document.removeEventListener('keydown', this.onKeyDownHandler);
    document.removeEventListener('keyup', this.onKeyUpHandler);
  }

  /**
   * Disposes of the keyboard controls, cleaning up event listeners and animations.
   */
  dispose() {
    this.disconnect();

    super.dispose();
    this._characters.dispose();
  }

  /**
   * Handles keydown events, updating the key state.
   * @param event - The keyboard event.
   */
  private onKeyDown(event: KeyboardEvent) {
    keyStates[event.key] = true;
  }

  /**
   * Handles keyup events, updating the key state.
   * @param event - The keyboard event.
   */
  private onKeyUp(event: KeyboardEvent) {
    keyStates[event.key] = false;
  }
}

export { KeyboardRotationControls };
