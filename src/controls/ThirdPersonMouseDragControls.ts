import { Camera, Object3D, OrthographicCamera, PerspectiveCamera, Spherical, Vector3 } from 'three';
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
  posOffset?: Vector3;
  lookAtOffset?: Vector3;
  cameraLerpFactor?: number;
  axisSync?: 'always' | 'move' | 'never';
  enableZoom?: boolean;
  zoomSpeed?: number;
};

/**
 * Extended physics options specific to mouse drag controls.
 */
export type MouseDragPhysicsOptions = PhysicsOptions & {
  jumpForce?: number;
  groundMoveSpeed?: number;
  floatMoveSpeed?: number;
  rotateSpeed?: number;
  enableDiagonalMovement?: boolean;
  enableRotationOnMove?: boolean;
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

const DEFAULT_ACTION_KEYS: ActionKeys = {
  forward: ['KeyW', 'ArrowUp'],
  backward: ['KeyS', 'ArrowDown'],
  leftward: ['KeyA', 'ArrowLeft'],
  rightward: ['KeyD', 'ArrowRight'],
  jump: ['Space'],
};

/**
 * Controls class that allows movement with the keyboard and rotation with the mouse.
 */
class ThirdPersonMouseDragControls extends PhysicsCharacterControls {
  // Character movement keys
  actionKeys: ActionKeys;

  // Camera options
  camera: Camera;
  cameraPositionOffset: Vector3;
  cameraLookAtOffset: Vector3;
  cameraLerpFactor: number;

  axisSync: 'always' | 'move' | 'never';

  enableZoom: boolean;
  zoomSpeed: number;

  // Mouse drag Physics options
  jumpForce: number;
  groundMoveSpeed: number;
  floatMoveSpeed: number;
  rotateSpeed: number;

  enableDiagonalMovement: boolean;
  enableRotationOnMove: boolean;

  private _spherical: Spherical; // Spherical coordinates for camera position
  private _isMouseDown: boolean = false; // Flag to track mouse down state

  // Temporary vectors for calculations
  private _forwardDirection: Vector3 = new Vector3();
  private _movementDirection: Vector3 = new Vector3();
  private _accumulatedDirection: Vector3 = new Vector3();
  private _cameraLookAtPosition: Vector3 = new Vector3();
  private _cameraLerpPosition: Vector3 = new Vector3();

  // Handlers for keyboard events.
  private onKeyDownHandler: (event: KeyboardEvent) => void;
  private onKeyUpHandler: (event: KeyboardEvent) => void;
  private onMouseDownHandler: () => void;
  private onMouseUpHandler: () => void;
  private onMouseMoveHandler: (event: MouseEvent) => void;
  private onMouseWheelHandler: (event: WheelEvent) => void;

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
    actionKeys?: ActionKeys,
    cameraOptions?: CameraOptions,
    animationOptions?: AnimationOptions,
    physicsOptions?: MouseDragPhysicsOptions,
  ) {
    super(object, domElement, worldObject, animationOptions, physicsOptions);

    this.actionKeys = actionKeys ?? DEFAULT_ACTION_KEYS;

    this.camera = camera;
    this.cameraPositionOffset = cameraOptions?.posOffset ?? new Vector3(0, 2, -2);
    this.cameraLookAtOffset = cameraOptions?.lookAtOffset ?? new Vector3(0, 1, 0);
    this.cameraLerpFactor = cameraOptions?.cameraLerpFactor ?? 0.5;

    this._spherical = new Spherical();
    const subVector = this.cameraPositionOffset.clone().sub(this.cameraLookAtOffset);
    this._spherical.setFromVector3(subVector);

    this.axisSync = cameraOptions?.axisSync ?? 'move';

    this.enableZoom = cameraOptions?.enableZoom ?? true;
    this.zoomSpeed = cameraOptions?.zoomSpeed ?? 1;

    this.jumpForce = physicsOptions?.jumpForce ?? 15;
    this.groundMoveSpeed = physicsOptions?.groundMoveSpeed ?? 30;
    this.floatMoveSpeed = physicsOptions?.floatMoveSpeed ?? 8;
    this.rotateSpeed = physicsOptions?.rotateSpeed ?? 1;

    this.enableDiagonalMovement = physicsOptions?.enableDiagonalMovement ?? true;
    this.enableRotationOnMove = physicsOptions?.enableRotationOnMove ?? false;

    // Bind key event handlers.
    this.onKeyDownHandler = this.onKeyDown.bind(this);
    this.onKeyUpHandler = this.onKeyUp.bind(this);
    this.onMouseDownHandler = this.onMouseDown.bind(this);
    this.onMouseUpHandler = this.onMouseUp.bind(this);
    this.onMouseMoveHandler = this.onMouseMove.bind(this);
    this.onMouseWheelHandler = this.onMouseWheel.bind(this);

    // Connect event listeners
    this.connect();
  }

  /**
   * Gets the forward direction vector based on the camera's orientation.
   * @returns Normalized forward vector.
   */
  private getForwardVector(): Vector3 {
    this._movementDirection.copy(this._forwardDirection);
    this._movementDirection.y = 0;
    this._movementDirection.normalize();
    return this._movementDirection;
  }

  /**
   * Gets the side (right) direction vector based on the camera's orientation.
   * @returns Normalized side vector.
   */
  private getSideVector(): Vector3 {
    this._movementDirection.copy(this._forwardDirection);
    this._movementDirection.y = 0;
    this._movementDirection.normalize();
    this._movementDirection.cross(this.object.up);
    return this._movementDirection;
  }

  private updateSync() {
    if (this.axisSync === 'always') {
      this.camera.getWorldDirection(this._forwardDirection);
      this.object.lookAt(this.object.position.clone().add(this.getForwardVector()));
      return;
    }

    if (
      this.axisSync === 'move' &&
      (keyStates.forward || keyStates.backward || keyStates.leftward || keyStates.rightward)
    ) {
      this.camera.getWorldDirection(this._forwardDirection);
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

    // Accumulate movement vectors based on key states
    const movement = this._accumulatedDirection.set(0, 0, 0);

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
      if (this.enableRotationOnMove) this.object.lookAt(this.object.position.clone().add(movement));
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

    this._cameraLookAtPosition.copy(this.object.position).add(this.cameraLookAtOffset);

    if (this.cameraLerpFactor > 0) {
      this._cameraLerpPosition.lerp(this._cameraLookAtPosition, this.cameraLerpFactor);
    } else {
      this._cameraLerpPosition.copy(this._cameraLookAtPosition);
    }

    this._spherical.radius = this.cameraPositionOffset.distanceTo(this.cameraLookAtOffset);
    this.camera.position.setFromSpherical(this._spherical).add(this._cameraLerpPosition);

    this.camera.lookAt(this._cameraLookAtPosition);
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
    this.domElement?.addEventListener('wheel', this.onMouseWheelHandler);
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
    this.domElement?.removeEventListener('wheel', this.onMouseWheelHandler);
  }

  dispose() {
    this.disconnect();

    super.dispose();
  }

  /** Handles keydown events, updating the key state. */
  private onKeyDown(event: KeyboardEvent) {
    if (this.actionKeys.forward?.some(key => event.code === key)) {
      keyStates.forward = true;
      if (!this.enableDiagonalMovement) {
        keyStates.leftward = false;
        keyStates.rightward = false;
      }
    }

    if (this.actionKeys.backward?.some(key => event.code === key)) {
      keyStates.backward = true;
      if (!this.enableDiagonalMovement) {
        keyStates.leftward = false;
        keyStates.rightward = false;
      }
    }

    if (this.actionKeys.leftward?.some(key => event.code === key)) {
      keyStates.leftward = true;
      if (!this.enableDiagonalMovement) {
        keyStates.forward = false;
        keyStates.backward = false;
      }
    }

    if (this.actionKeys.rightward?.some(key => event.code === key)) {
      keyStates.rightward = true;
      if (!this.enableDiagonalMovement) {
        keyStates.forward = false;
        keyStates.backward = false;
      }
    }

    if (this.actionKeys.jump?.some(key => event.code === key)) {
      keyStates.jump = true;
    }
  }

  /** Handles keyup events, updating the key state. */
  private onKeyUp(event: KeyboardEvent) {
    if (this.actionKeys.forward?.some(key => event.code === key)) {
      keyStates.forward = false;
    }

    if (this.actionKeys.backward?.some(key => event.code === key)) {
      keyStates.backward = false;
    }

    if (this.actionKeys.leftward?.some(key => event.code === key)) {
      keyStates.leftward = false;
    }

    if (this.actionKeys.rightward?.some(key => event.code === key)) {
      keyStates.rightward = false;
    }

    if (this.actionKeys.jump?.some(key => event.code === key)) {
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

  /** Handles mouse wheel events to zoom in and out. */
  private onMouseWheel = (event: WheelEvent) => {
    if (!this.enableZoom) return;

    if (!(this.camera instanceof PerspectiveCamera) && !(this.camera instanceof OrthographicCamera)) {
      console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
      this.enableZoom = false;
      return;
    }

    const normalizedDelta = Math.pow(0.95, this.zoomSpeed * Math.abs(event.deltaY * 0.01));

    if (event.deltaY < 0) this.camera.zoom *= normalizedDelta;
    else if (event.deltaY > 0) this.camera.zoom /= normalizedDelta;

    this.camera.updateProjectionMatrix();
  };
}

export { ThirdPersonMouseDragControls };
