import { AnimationClip, Camera, Object3D, Vector3 } from 'three';
import { PhysicsControls, PhysicsOptions } from './base/PhysicsControls';
import { Characters } from '../characters/Characters';

/**
 * Possible actions that can be mapped to keyboard inputs.
 */
type Actions = 'forward' | 'backward' | 'leftward' | 'rightward' | 'jump';

/**
 * Animation states that can be used.
 */
type Animations = 'idle' | 'forward' | 'jump' | 'fall';

/**
 * Configuration for mapping actions to keyboard keys.
 */
export type KeyOptions = Partial<Record<Actions, string[]>>;

/**
 * Configuration for animations and their options.
 */
export type AnimationOptions = Partial<Record<Animations, AnimationClip>> & {
  transitionTime?: number;
  fallSpeedThreshold?: number;
  moveSpeedThreshold?: number;
};

/**
 * Configuration options for camera control.
 */
export type CameraOptions = {
  camera: Camera;
  posOffset: Vector3;
  lookAtOffset: Vector3;
};

/**
 * Extended physics options specific to mouse drag controls.
 */
export type MouseDragPhysicsOptions = PhysicsOptions & {
  jumpForce?: number;
  groundMoveSpeed?: number;
  floatMoveSpeed?: number;
  rotateSpeed?: number;
};

/**
 * Controls class that allows movement with the keyboard and rotation with the mouse.
 */
class MouseDragCameraRotationControls extends PhysicsControls {
  private _characters: Characters;

  // Camera options
  camera: Camera;
  private _cameraPositionOffset: Vector3;
  private _cameraLookAtOffset: Vector3;
  private _cameraRadius: number = 0;
  private _cameraPhi: number = 0;
  private _cameraTheta: number = 0;

  keyOptions: KeyOptions;
  private keyStates: Record<string, boolean> = {};

  private _isMouseDown: boolean = false;

  // Physics options
  jumpForce: number;
  groundMoveSpeed: number;
  floatMoveSpeed: number;
  rotateSpeed: number;

  // Animation options
  transitionTime: number;
  fallSpeedThreshold: number;
  moveSpeedThreshold: number;

  // Temporary vectors for calculations
  private _tempVector1: Vector3 = new Vector3();
  private _tempVector2: Vector3 = new Vector3();
  private _tempVector3: Vector3 = new Vector3();

  /**
   * Constructs a new MouseDragCameraRotationControls instance.
   * @param object - The 3D object to control.
   * @param domElement - The HTML element to attach event listeners to.
   * @param worldObject - The world object used for collision detection.
   * @param keyOptions - Key mappings for actions.
   * @param cameraOptions - Configuration options for the camera.
   * @param animationOptions - Animation clips and options.
   * @param physicsOptions - Physics options.
   */
  constructor(
    object: Object3D,
    domElement: HTMLElement | null,
    worldObject: Object3D,
    keyOptions: KeyOptions,
    cameraOptions: CameraOptions,
    animationOptions: AnimationOptions = {},
    physicsOptions: MouseDragPhysicsOptions = {},
  ) {
    super(object, domElement, worldObject, physicsOptions);

    // Initialize character animations
    const { idle, forward, jump, fall } = animationOptions || {};
    this._characters = new Characters(object, {
      ...(idle && { idle }),
      ...(forward && { forward }),
      ...(jump && { jump }),
      ...(fall && { fall }),
    });

    this.keyOptions = keyOptions;

    this.camera = cameraOptions.camera;

    this._cameraPositionOffset = cameraOptions.posOffset;
    this._cameraLookAtOffset = cameraOptions.lookAtOffset;
    this.updateCameraInfo();

    // Set physics options with default values
    const { jumpForce = 15, groundMoveSpeed = 25, floatMoveSpeed = 8, rotateSpeed = 1 } = physicsOptions;
    this.jumpForce = jumpForce;
    this.groundMoveSpeed = groundMoveSpeed;
    this.floatMoveSpeed = floatMoveSpeed;
    this.rotateSpeed = rotateSpeed;

    // Set animation options with default values
    const { transitionTime = 0.3, fallSpeedThreshold = 15, moveSpeedThreshold = 1 } = animationOptions;
    this.transitionTime = transitionTime;
    this.fallSpeedThreshold = fallSpeedThreshold;
    this.moveSpeedThreshold = moveSpeedThreshold;

    // Connect event listeners
    this.connect();
  }

  get cameraPosOffset() {
    return this._cameraPositionOffset;
  }

  set cameraPosOffset(offset: Vector3) {
    this._cameraPositionOffset = offset;
    this.updateCameraInfo();
  }

  get cameraLookAtOffset() {
    return this._cameraLookAtOffset;
  }

  set cameraLookAtOffset(offset: Vector3) {
    this._cameraLookAtOffset = offset;
    this.updateCameraInfo();
  }

  /**
   * Updates the camera's spherical coordinates based on the current offsets.
   */
  private updateCameraInfo() {
    const subVector = this._tempVector1.copy(this._cameraPositionOffset).sub(this._cameraLookAtOffset);
    this._cameraRadius = subVector.length();
    this._cameraPhi = Math.acos(subVector.y / this._cameraRadius);
    this._cameraTheta = Math.atan2(subVector.z, subVector.x);
  }

  /**
   * Gets the forward direction vector based on the camera's orientation.
   * @returns Normalized forward vector.
   */
  private getForwardVector(): Vector3 {
    this.camera.getWorldDirection(this._tempVector1);
    this._tempVector1.y = 0;
    this._tempVector1.normalize();
    return this._tempVector1;
  }

  /**
   * Gets the side (right) direction vector based on the camera's orientation.
   * @returns Normalized side vector.
   */
  private getSideVector(): Vector3 {
    this.camera.getWorldDirection(this._tempVector2);
    this._tempVector2.y = 0;
    this._tempVector2.normalize();
    this._tempVector2.cross(this.object.up);
    return this._tempVector2;
  }

  /**
   * Updates the object's velocity based on keyboard input.
   * @param delta - Time delta for frame-independent movement.
   */
  private updateControls(delta: number) {
    // Handle jumping
    if (this.isGrounded && this.keyOptions.jump?.some(key => this.keyStates[key])) {
      this.velocity.y = this.jumpForce;
    }

    const speedDelta = delta * (this.isGrounded ? this.groundMoveSpeed : this.floatMoveSpeed);

    // Reset movement vector
    const movement = this._tempVector3.set(0, 0, 0);

    // Accumulate movement vectors based on key states
    if (this.keyOptions.leftward?.some(key => this.keyStates[key])) {
      movement.add(this.getSideVector().multiplyScalar(-1));
    }
    if (this.keyOptions.rightward?.some(key => this.keyStates[key])) {
      movement.add(this.getSideVector());
    }
    if (this.keyOptions.backward?.some(key => this.keyStates[key])) {
      movement.add(this.getForwardVector().multiplyScalar(-1));
    }
    if (this.keyOptions.forward?.some(key => this.keyStates[key])) {
      movement.add(this.getForwardVector());
    }

    // Apply movement if any
    if (movement.lengthSq() > 1e-10) {
      movement.normalize();
      this.velocity.add(movement.multiplyScalar(speedDelta));
      this.object.lookAt(this.object.position.clone().add(movement));
    }
  }

  /**
   * Updates the camera's position and orientation based on the object's position and mouse input.
   */
  private updateCamera() {
    this.object.updateMatrixWorld();

    const x = this._cameraRadius * Math.sin(this._cameraPhi) * Math.cos(this._cameraTheta);
    const y = this._cameraRadius * Math.cos(this._cameraPhi);
    const z = this._cameraRadius * Math.sin(this._cameraPhi) * Math.sin(this._cameraTheta);

    const worldOffset = this._tempVector1.copy(this._cameraLookAtOffset).applyMatrix4(this.object.matrixWorld);

    const cameraPosition = this._tempVector2.set(x, y, z).add(worldOffset);
    this.camera.position.copy(cameraPosition);

    const lookAtPosition = this._tempVector3.copy(this.object.position).add(this._cameraLookAtOffset);
    this.camera.lookAt(lookAtPosition);
  }

  /**
   * Updates the character's animations based on the current state and velocity.
   * @param delta - Time delta for animation updates.
   */
  private updateAnimation(delta: number) {
    this._characters.update(delta);

    this.object.getWorldDirection(this._tempVector1);

    const horizontalSpeed = this._tempVector1.copy(this.velocity);
    horizontalSpeed.y = 0;
    const speed = horizontalSpeed.length();

    // Determine which animation to play based on state and speed
    if (this.isGrounded && speed > this.moveSpeedThreshold) {
      this._characters.fadeToAction('forward', this.transitionTime);
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
   * @param delta - Time delta for consistent updates.
   */
  update(delta: number) {
    this.updateControls(delta);

    super.update(delta);

    this.updateCamera();
    this.updateAnimation(delta);
  }

  /**
   * Connects the controls by adding event listeners.
   */
  connect() {
    super.connect();

    document.addEventListener('keydown', this.onKeyDown);
    document.addEventListener('keyup', this.onKeyUp);
    this.domElement?.addEventListener('mousedown', this.onMouseDown);
    document.addEventListener('mouseup', this.onMouseUp);
    this.domElement?.addEventListener('mousemove', this.onMouseMove);
  }

  /**
   * Disconnects the controls by removing event listeners.
   */
  disconnect() {
    super.disconnect();

    document.removeEventListener('keydown', this.onKeyDown);
    document.removeEventListener('keyup', this.onKeyUp);
    this.domElement?.removeEventListener('mousedown', this.onMouseDown);
    document.removeEventListener('mouseup', this.onMouseUp);
    this.domElement?.removeEventListener('mousemove', this.onMouseMove);
  }

  dispose() {
    this.disconnect();

    super.dispose();
    this._characters.dispose();
  }

  /** Handles keydown events to update key states. */
  private onKeyDown = (event: KeyboardEvent) => {
    this.keyStates[event.key] = true;
  };

  /** Handles keyup events to update key states. */
  private onKeyUp = (event: KeyboardEvent) => {
    this.keyStates[event.key] = false;
  };

  /** Handles mousedown events to set _isMouseDown flag. */
  private onMouseDown = () => {
    this._isMouseDown = true;
  };

  /** Handles mouseup events to reset _isMouseDown flag. */
  private onMouseUp = () => {
    this._isMouseDown = false;
  };

  /** Handles mousemove events to update camera angles when mouse is down. */
  private onMouseMove = (event: MouseEvent) => {
    if (!this._isMouseDown) return;

    this._cameraTheta += (event.movementX * this.rotateSpeed) / 100;
    this._cameraPhi -= (event.movementY * this.rotateSpeed) / 100;

    // Clamp the camera angles to prevent flipping
    this._cameraPhi = Math.max(0.01, Math.min(Math.PI - 0.01, this._cameraPhi));
  };
}

export { MouseDragCameraRotationControls };
