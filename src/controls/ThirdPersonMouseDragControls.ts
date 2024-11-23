import { Camera, Object3D, Spherical, Vector3 } from 'three';
import { PhysicsOptions } from './base/PhysicsControls';
import PhysicsCharacterControls, { AnimationOptions } from './base/PhysicsCharacterControls';

/**
 * Possible actions that can be mapped to keyboard inputs.
 */
type Actions = 'forward' | 'backward' | 'leftward' | 'rightward' | 'jump';

/**
 * Configuration for key mappings to actions.
 */
type ActionKeys = {
  [K in Actions]?: string[]; // Mapping each action to possible key bindings
};

/**
 * Configuration options for camera control.
 */
export type CameraOptions = {
  axisSync?: 'always' | 'move' | 'never';
  posOffset: Vector3;
  lookAtOffset: Vector3;
  cameraLerpFactor?: number;
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
 * Global object to track the current state of pressed keys.
 */
const keyStates: Record<Actions, boolean> = {
  forward: false,
  backward: false,
  leftward: false,
  rightward: false,
  jump: false,
};

/**
 * Controls class that allows movement with the keyboard and rotation with the mouse.
 */
class ThirdPersonMouseDragControls extends PhysicsCharacterControls {
  // Camera options
  camera: Camera;
  private _cameraPositionOffset: Vector3;
  private _cameraLookAtOffset: Vector3;
  private _spherical: Spherical;
  private cameraLerpFactor: number = 0;
  axisSync: 'always' | 'move' | 'never';

  actionKeys: ActionKeys;

  private _isMouseDown: boolean = false;

  // Physics options
  jumpForce: number;
  groundMoveSpeed: number;
  floatMoveSpeed: number;
  rotateSpeed: number;

  // Temporary vectors for calculations
  private _objectWorldDirection: Vector3 = new Vector3();
  private _accumulatedDirection: Vector3 = new Vector3();
  private _cameraLookAtPosition: Vector3 = new Vector3();
  private _cameraLerpPosition: Vector3 = new Vector3();

  // Handlers for keyboard events.
  private onKeyDownHandler: (event: KeyboardEvent) => void;
  private onKeyUpHandler: (event: KeyboardEvent) => void;
  private onMouseDownHandler: () => void;
  private onMouseUpHandler: () => void;
  private onMouseMoveHandler: (event: MouseEvent) => void;

  /**
   * Constructs a new ThirdPersonMouseDragControls instance.
   * @param object - The 3D object to control.
   * @param domElement - The HTML element to attach event listeners to.
   * @param worldObject - The world object used for collision detection.
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
    physicsOptions: MouseDragPhysicsOptions = {},
  ) {
    super(object, domElement, worldObject, animationOptions, physicsOptions);

    this.actionKeys = actionKeys;

    this.camera = camera;

    this._cameraPositionOffset = cameraOptions.posOffset;
    this._cameraLookAtOffset = cameraOptions.lookAtOffset;
    this._spherical = new Spherical();
    this.cameraLerpFactor = cameraOptions.cameraLerpFactor ?? 0;
    this.updateCameraInfo();

    this.axisSync = cameraOptions.axisSync ?? 'move';

    // Set physics options with default values
    this.jumpForce = physicsOptions?.jumpForce ?? 15;
    this.groundMoveSpeed = physicsOptions?.groundMoveSpeed ?? 25;
    this.floatMoveSpeed = physicsOptions?.floatMoveSpeed ?? 8;
    this.rotateSpeed = physicsOptions?.rotateSpeed ?? 1;

    // Bind key event handlers.
    this.onKeyDownHandler = this.onKeyDown.bind(this);
    this.onKeyUpHandler = this.onKeyUp.bind(this);
    this.onMouseDownHandler = this.onMouseDown.bind(this);
    this.onMouseUpHandler = this.onMouseUp.bind(this);
    this.onMouseMoveHandler = this.onMouseMove.bind(this);

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
    const subVector = this._cameraPositionOffset.clone().sub(this._cameraLookAtOffset);
    this._spherical.setFromVector3(subVector);
  }

  /**
   * Gets the forward direction vector based on the camera's orientation.
   * @returns Normalized forward vector.
   */
  private getForwardVector(): Vector3 {
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
    this.camera.getWorldDirection(this._objectWorldDirection);
    this._objectWorldDirection.y = 0;
    this._objectWorldDirection.normalize();
    this._objectWorldDirection.cross(this.object.up);
    return this._objectWorldDirection;
  }

  private updateSync() {
    if (this.axisSync === 'always') {
      this.object.lookAt(this.object.position.clone().add(this.getForwardVector()));
      return;
    }

    if (
      this.axisSync === 'move' &&
      (keyStates.forward || keyStates.backward || keyStates.leftward || keyStates.rightward)
    ) {
      this.object.lookAt(this.object.position.clone().add(this.getForwardVector()));
      return;
    }
  }

  /**
   * Updates the object's velocity based on keyboard input.
   * @param delta - Time delta for frame-independent movement.
   */
  private updateControls(delta: number) {
    const speedDelta = delta * (this.isGrounded ? this.groundMoveSpeed : this.floatMoveSpeed);

    // Reset movement vector
    const movement = this._accumulatedDirection.set(0, 0, 0);

    // Accumulate movement vectors based on key states
    if (keyStates.leftward) {
      movement.add(this.getSideVector().multiplyScalar(-1));
    }

    if (keyStates.rightward) {
      movement.add(this.getSideVector());
    }

    if (keyStates.backward) {
      movement.add(this.getForwardVector().multiplyScalar(-1));
    }

    if (keyStates.forward) {
      movement.add(this.getForwardVector());
    }

    // Apply accumulated movement vector
    if (movement.lengthSq() > 1e-10) {
      movement.normalize();
      this.velocity.add(movement.multiplyScalar(speedDelta));
      this.object.lookAt(this.object.position.clone().add(movement));
    }

    // Jump if grounded.
    if (keyStates.jump && this.isGrounded) {
      this.velocity.y = this.jumpForce;
    }
  }

  /**
   * Updates the camera's position and orientation based on the object's position and mouse input.
   */
  private updateCamera() {
    this.object.updateMatrixWorld();

    const targetVector = this._cameraLerpPosition.addVectors(this.object.position, this._cameraLookAtOffset);
    const lookAtPosition = this._cameraLookAtPosition;

    if (this.cameraLerpFactor > 0) {
      const distance = lookAtPosition.distanceTo(targetVector);
      lookAtPosition.lerp(targetVector, this.cameraLerpFactor * distance);
    } else {
      lookAtPosition.copy(targetVector);
    }

    this.camera.position.setFromSpherical(this._spherical).add(lookAtPosition);
    this.camera.lookAt(lookAtPosition);
  }

  /**
   * Main update function that integrates controls, physics, camera, and animations.
   * @param delta - Time delta for consistent updates.
   */
  update(delta: number) {
    super.update(delta);

    this.updateCamera();
    this.updateSync();
    this.updateControls(delta);
  }

  /**
   * Connects the controls by adding event listeners.
   */
  connect() {
    super.connect();

    document.addEventListener('keydown', this.onKeyDownHandler);
    document.addEventListener('keyup', this.onKeyUpHandler);
    this.domElement?.addEventListener('mousedown', this.onMouseDownHandler);
    document.addEventListener('mouseup', this.onMouseUpHandler);
    this.domElement?.addEventListener('mousemove', this.onMouseMoveHandler);
  }

  /**
   * Disconnects the controls by removing event listeners.
   */
  disconnect() {
    super.disconnect();

    document.removeEventListener('keydown', this.onKeyDownHandler);
    document.removeEventListener('keyup', this.onKeyUpHandler);
    this.domElement?.removeEventListener('mousedown', this.onMouseDownHandler);
    document.removeEventListener('mouseup', this.onMouseUpHandler);
    this.domElement?.removeEventListener('mousemove', this.onMouseMoveHandler);
  }

  dispose() {
    this.disconnect();

    super.dispose();
  }

  /** Handles keydown events, updating the key state. */
  private onKeyDown(event: KeyboardEvent) {
    if (this.actionKeys.forward?.some(key => event.key === key)) {
      keyStates.forward = true;
    }

    if (this.actionKeys.backward?.some(key => event.key === key)) {
      keyStates.backward = true;
    }

    if (this.actionKeys.leftward?.some(key => event.key === key)) {
      keyStates.leftward = true;
    }

    if (this.actionKeys.rightward?.some(key => event.key === key)) {
      keyStates.rightward = true;
    }

    if (this.actionKeys.jump?.some(key => event.key === key)) {
      keyStates.jump = true;
    }
  }

  /** Handles keyup events, updating the key state. */
  private onKeyUp(event: KeyboardEvent) {
    if (this.actionKeys.forward?.some(key => event.key === key)) {
      keyStates.forward = false;
    }

    if (this.actionKeys.backward?.some(key => event.key === key)) {
      keyStates.backward = false;
    }

    if (this.actionKeys.leftward?.some(key => event.key === key)) {
      keyStates.leftward = false;
    }

    if (this.actionKeys.rightward?.some(key => event.key === key)) {
      keyStates.rightward = false;
    }

    if (this.actionKeys.jump?.some(key => event.key === key)) {
      keyStates.jump = false;
    }
  }

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

    this._spherical.theta -= (event.movementX * this.rotateSpeed) / 100;
    this._spherical.phi -= (event.movementY * this.rotateSpeed) / 100;

    // Clamp the camera angles to prevent flipping
    this._spherical.phi = Math.max(0.01, Math.min(Math.PI - 0.01, this._spherical.phi));
  };
}

export { ThirdPersonMouseDragControls };
