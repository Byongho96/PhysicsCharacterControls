import { Camera, Object3D, Spherical, Vector3 } from 'three';
import { PhysicsOptions } from './base/PhysicsControls';
import PhysicsCharacterControls, { AnimationOptions } from './base/PhysicsCharacterControls';

/**
 * Possible actions for character movement.
 */
type CharacterActions = 'forward' | 'backward' | 'leftward' | 'rightward' | 'jump';

/**
 * Possible actions for camera control.
 */
type CameraActions = 'cameraUp' | 'cameraDown' | 'cameraLeft' | 'cameraRight';

/**
 * Configuration for key mappings to character and camera actions.
 */
type ActionKeys = {
  character: { [K in CharacterActions]?: string[] };
  camera: { [K in CameraActions]?: string[] };
};

/**
 * Configuration options for camera control.
 */
type CameraOptions = {
  axisSync?: 'always' | 'move' | 'never';
  posOffset: Vector3;
  lookAtOffset: Vector3;
};

/**
 * Extended physics options specific to character and camera controls.
 */
export type KeyboardPhysicsOptions = PhysicsOptions & {
  jumpForce?: number;
  groundMoveSpeed?: number;
  floatMoveSpeed?: number;
  rotateSpeed?: number;
};

/**
 * Global object to track the current state of pressed keys for character actions.
 */
const characterKeyStates: Record<CharacterActions, boolean> = {
  forward: false,
  backward: false,
  leftward: false,
  rightward: false,
  jump: false,
};

/**
 * Global object to track the current state of pressed keys for camera actions.
 */
const cameraKeyStates: Record<CameraActions, boolean> = {
  cameraUp: false,
  cameraDown: false,
  cameraLeft: false,
  cameraRight: false,
};

/**
 * Controls class that allows movement with the keyboard and rotation with the camera.
 */
class ThirdPersonKeyboardControls extends PhysicsCharacterControls {
  // Camera options
  camera: Camera;
  private _cameraPositionOffset: Vector3;
  private _cameraLookAtOffset: Vector3;
  private _spherical: Spherical;
  axisSync: 'always' | 'move' | 'never';

  actionKeys: ActionKeys;

  // Physics options
  jumpForce: number;
  groundMoveSpeed: number;
  floatMoveSpeed: number;
  rotateSpeed: number;

  private _objectWorldDirection: Vector3 = new Vector3();
  private _accumulatedDirection: Vector3 = new Vector3();
  private _cameraLookAtPosition: Vector3 = new Vector3();

  private onKeyDownHandler: (event: KeyboardEvent) => void;
  private onKeyUpHandler: (event: KeyboardEvent) => void;

  /**
   * Constructs a new ThirdPersonKeyboardControls instance.
   * @param object - The 3D object to control.
   * @param domElement - The HTML element to attach event listeners to.
   * @param worldObject - The world object used for collision detection.
   * @param camera - The camera to control.
   * @param actionKeys - Key mappings for actions.
   * @param cameraOptions - Configuration options for the camera.
   * @param animationOptions - Animation clips and options.
   * @param physicsOptions - Physics options.
   */
  constructor(
    object: Object3D,
    domElement: HTMLElement | null,
    worldObject: Object3D,
    camera: Camera,
    actionKeys: ActionKeys,
    cameraOptions: CameraOptions,
    animationOptions: AnimationOptions = {},
    physicsOptions: KeyboardPhysicsOptions = {},
  ) {
    super(object, domElement, worldObject, animationOptions, physicsOptions);

    this.actionKeys = actionKeys;

    this.camera = camera;
    this._cameraPositionOffset = cameraOptions.posOffset;
    this._cameraLookAtOffset = cameraOptions.lookAtOffset;
    this._spherical = new Spherical();
    this.updateCameraInfo();

    this.axisSync = cameraOptions.axisSync ?? 'never';

    this.jumpForce = physicsOptions?.jumpForce ?? 15;
    this.groundMoveSpeed = physicsOptions?.groundMoveSpeed ?? 25;
    this.floatMoveSpeed = physicsOptions?.floatMoveSpeed ?? 8;
    this.rotateSpeed = physicsOptions?.rotateSpeed ?? 1;

    this.onKeyDownHandler = this.onKeyDown.bind(this);
    this.onKeyUpHandler = this.onKeyUp.bind(this);

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
    const subVector = this._cameraPositionOffset.clone().sub(this._cameraLookAtOffset);
    this._spherical.setFromVector3(subVector);
  }

  /**
   * Gets the forward direction vector based on the camera's orientation.
   * @returns Normalized forward vector.
   */
  private getForwardVector(): Vector3 {
    // Returns the forward direction vector relative to the camera.
    this.camera.getWorldDirection(this._objectWorldDirection);
    this._objectWorldDirection.y = 0;
    this._objectWorldDirection.normalize();
    return this._objectWorldDirection;
  }

  /**
   * Gets the side (right) direction vector based on the camera's orientation.
   * @returns Normalized side vector.
   */
  private getSideVector(): Vector3 {
    // Returns the side (right) direction vector relative to the camera.
    this.camera.getWorldDirection(this._objectWorldDirection);
    this._objectWorldDirection.y = 0;
    this._objectWorldDirection.normalize();
    this._objectWorldDirection.cross(this.object.up);
    return this._objectWorldDirection;
  }

  /**
   * Updates the object's velocity based on keyboard input.
   * @param delta - Time delta for frame-independent movement.
   */
  private updateCharacterControls(delta: number) {
    const speedDelta = delta * (this.isGrounded ? this.groundMoveSpeed : this.floatMoveSpeed);

    // Reset movement vector
    const movement = this._accumulatedDirection.set(0, 0, 0);

    // Accumulate movement vectors based on key states
    if (characterKeyStates.leftward) {
      movement.add(this.getSideVector().multiplyScalar(-1));
    }

    if (characterKeyStates.rightward) {
      movement.add(this.getSideVector());
    }

    if (characterKeyStates.backward) {
      movement.add(this.getForwardVector().multiplyScalar(-1));
    }

    if (characterKeyStates.forward) {
      movement.add(this.getForwardVector());
    }

    // Apply accumulated movement vector
    if (movement.lengthSq() > 1e-10) {
      movement.normalize();
      this.velocity.add(movement.multiplyScalar(speedDelta));
      this.object.lookAt(this.object.position.clone().add(movement));
    }

    // Jump if grounded.
    if (characterKeyStates.jump && this.isGrounded) {
      this.velocity.y = this.jumpForce;
    }
  }
  /**
   * Updates the camera's position and orientation based on the object's position and keyboard input.
   */
  private updateCamera(delta: number) {
    const rotationSpeed = this.rotateSpeed * delta;

    this.object.updateMatrixWorld();

    const lookAtPosition = this._cameraLookAtPosition.copy(this.object.position).add(this._cameraLookAtOffset);
    this.camera.position.setFromSpherical(this._spherical).add(lookAtPosition);

    this.camera.lookAt(lookAtPosition);

    if (cameraKeyStates.cameraLeft) {
      this._spherical.theta -= rotationSpeed;
    }

    if (cameraKeyStates.cameraRight) {
      this._spherical.theta += rotationSpeed;
    }

    if (cameraKeyStates.cameraUp) {
      this._spherical.phi = Math.max(0.01, this._spherical.phi - rotationSpeed);
    }

    if (cameraKeyStates.cameraDown) {
      this._spherical.phi = Math.min(Math.PI - 0.01, this._spherical.phi + rotationSpeed);
    }
  }

  private updateSync() {
    if (this.axisSync === 'always') {
      this.object.lookAt(this.object.position.clone().add(this.getForwardVector()));
      return;
    }

    if (
      this.axisSync === 'move' &&
      (characterKeyStates.forward ||
        characterKeyStates.backward ||
        characterKeyStates.leftward ||
        characterKeyStates.rightward)
    ) {
      this.object.lookAt(this.object.position.clone().add(this.getForwardVector()));
      return;
    }
  }

  /**
   * Main update function that integrates controls, physics, camera, and animations.
   * @param delta - Time delta for consistent updates.
   */
  update(delta: number) {
    super.update(delta);

    this.updateCharacterControls(delta);
    this.updateCamera(delta);
    this.updateSync();
  }

  private onKeyDown(event: KeyboardEvent) {
    // Update character key states
    for (const [action, keys] of Object.entries(this.actionKeys.character)) {
      if (keys?.includes(event.key)) {
        characterKeyStates[action as CharacterActions] = true;
      }
    }

    // Update camera key states
    for (const [action, keys] of Object.entries(this.actionKeys.camera)) {
      if (keys?.includes(event.key)) {
        cameraKeyStates[action as CameraActions] = true;
      }
    }
  }

  private onKeyUp(event: KeyboardEvent) {
    // Reset character key states
    for (const [action, keys] of Object.entries(this.actionKeys.character)) {
      if (keys?.includes(event.key)) {
        characterKeyStates[action as CharacterActions] = false;
      }
    }

    // Reset camera key states
    for (const [action, keys] of Object.entries(this.actionKeys.camera)) {
      if (keys?.includes(event.key)) {
        cameraKeyStates[action as CameraActions] = false;
      }
    }
  }
  /**
   * Connects the controls by adding event listeners.
   */
  connect() {
    super.connect();
    document.addEventListener('keydown', this.onKeyDownHandler);
    document.addEventListener('keyup', this.onKeyUpHandler);
  }
  /**
   * Disconnects the controls by removing event listeners.
   */
  disconnect() {
    super.disconnect();
    document.removeEventListener('keydown', this.onKeyDownHandler);
    document.removeEventListener('keyup', this.onKeyUpHandler);
  }

  dispose() {
    this.disconnect();
    super.dispose();
  }
}

export { ThirdPersonKeyboardControls };
