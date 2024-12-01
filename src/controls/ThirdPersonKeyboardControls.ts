import { Camera, Object3D, OrthographicCamera, PerspectiveCamera, Spherical, Vector3 } from 'three';
import { PhysicsOptions } from './base/PhysicsControls';
import PhysicsCharacterControls, { AnimationOptions } from './base/PhysicsCharacterControls';

/**
 * Possible actions for character and camera movement.
 */
type Actions =
  | 'forward'
  | 'backward'
  | 'leftward'
  | 'rightward'
  | 'jump'
  | 'turnUp'
  | 'turnDown'
  | 'turnLeft'
  | 'turnRight';

/**
 * Configuration for key mappings to actions.
 */
type ActionKeys = {
  [K in Actions]?: string[]; // Mapping each action to possible key bindings
};

/**
 * Configuration options for camera control.
 */
type CameraOptions = {
  posOffset?: Vector3;
  lookAtOffset?: Vector3;
  cameraLerpFactor?: number;
  axisSync?: 'always' | 'move' | 'never';
  enableZoom?: boolean;
  zoomSpeed?: number;
};

/**
 * Extended physics options specific to character and camera controls.
 */
type KeyboardPhysicsOptions = PhysicsOptions & {
  jumpForce?: number;
  groundMoveSpeed?: number;
  floatMoveSpeed?: number;
  rotateSpeed?: number;
  enableDiagonalMovement?: boolean;
  enableRotationOnMove?: boolean;
};

type ThirdPersonKeyboardControlsProps = {
  object: Object3D;
  domElement: HTMLElement | null;
  worldObject: Object3D;
  camera: Camera;
  actionKeys?: ActionKeys;
  cameraOptions?: CameraOptions;
  animationOptions?: AnimationOptions;
  physicsOptions?: KeyboardPhysicsOptions;
};

/**
 * Global object to track the current state of pressed keys.
 */
const keyStates: Record<Actions, number> = {
  forward: 0,
  backward: 0,
  leftward: 0,
  rightward: 0,
  jump: 0,
  turnUp: 0,
  turnDown: 0,
  turnLeft: 0,
  turnRight: 0,
};

const DEFAULT_ACTION_KEYS: ActionKeys = {
  forward: ['KeyW'],
  backward: ['KeyS'],
  leftward: ['KeyA'],
  rightward: ['KeyD'],
  jump: ['Space'],
  turnUp: ['ArrowUp'],
  turnDown: ['ArrowDown'],
  turnLeft: ['ArrowLeft'],
  turnRight: ['ArrowRight'],
};

/**
 * Controls class that allows movement with the keyboard and rotation with the camera.
 */
class ThirdPersonKeyboardControls extends PhysicsCharacterControls {
  actionKeys: ActionKeys;

  // Camera options
  camera: Camera;
  cameraPositionOffset: Vector3;
  cameraLookAtOffset: Vector3;
  cameraLerpFactor: number;

  axisSync: 'always' | 'move' | 'never';

  enableZoom: boolean;
  zoomSpeed: number;

  // Physics options
  jumpForce: number;
  groundMoveSpeed: number;
  floatMoveSpeed: number;
  rotateSpeed: number;

  enableDiagonalMovement: boolean;
  enableRotationOnMove: boolean;

  private _spherical: Spherical = new Spherical();
  private _keyCount: number = 0;

  // Temporary vectors for calculations
  private _forwardDirection: Vector3 = new Vector3();
  private _objectLocalDirection: Vector3 = new Vector3();
  private _accumulatedDirection: Vector3 = new Vector3();
  private _cameraLookAtPosition: Vector3 = new Vector3();
  private _cameraLerpPosition: Vector3 = new Vector3();

  private onKeyDown: (event: KeyboardEvent) => void;
  private onKeyUp: (event: KeyboardEvent) => void;
  private onMouseWheel: (event: WheelEvent) => void;

  constructor({
    object,
    domElement,
    worldObject,
    camera,
    actionKeys,
    cameraOptions,
    animationOptions,
    physicsOptions,
  }: ThirdPersonKeyboardControlsProps) {
    super(object, domElement, worldObject, animationOptions, physicsOptions);

    this.actionKeys = actionKeys ?? DEFAULT_ACTION_KEYS;

    this.camera = camera;
    this.cameraPositionOffset = cameraOptions?.posOffset ?? new Vector3(0, 2, -2);
    this.cameraLookAtOffset = cameraOptions?.lookAtOffset ?? new Vector3(0, 1, 0);
    this.cameraLerpFactor = cameraOptions?.cameraLerpFactor ?? 0.5;

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
    this.enableRotationOnMove = physicsOptions?.enableRotationOnMove ?? true;

    this.onKeyDown = this._onKeyDown.bind(this);
    this.onKeyUp = this._onKeyUp.bind(this);
    this.onMouseWheel = this._onMouseWheel.bind(this);

    this.connect();
  }

  /**
   * Gets the forward direction vector based on the camera's orientation.
   * @returns Normalized forward vector.
   */
  private _getForwardVector(): Vector3 {
    this._objectLocalDirection.copy(this._forwardDirection);
    this._objectLocalDirection.y = 0;
    this._objectLocalDirection.normalize();
    return this._objectLocalDirection;
  }

  /**
   * Gets the side (right) direction vector based on the camera's orientation.
   * @returns Normalized side vector.
   */
  private _getSideVector(): Vector3 {
    this._objectLocalDirection.copy(this._forwardDirection);
    this._objectLocalDirection.y = 0;
    this._objectLocalDirection.normalize();
    this._objectLocalDirection.cross(this.object.up);
    return this._objectLocalDirection;
  }

  private _accumulateDirection() {
    this._accumulatedDirection.set(0, 0, 0);

    if (keyStates.forward) {
      this._accumulatedDirection.add(this._getForwardVector());
    }

    if (keyStates.backward) {
      this._accumulatedDirection.add(this._getForwardVector().multiplyScalar(-1));
    }

    if (keyStates.leftward) {
      this._accumulatedDirection.add(this._getSideVector().multiplyScalar(-1));
    }

    if (keyStates.rightward) {
      this._accumulatedDirection.add(this._getSideVector());
    }

    return this._accumulatedDirection.normalize();
  }

  private _getMostRecentDirection() {
    this._accumulatedDirection.set(0, 0, 0);

    let lastAction: Actions | null = null;
    let lastCount = 0;

    Object.entries(keyStates).forEach(([key, value]) => {
      if (value > lastCount) {
        lastAction = key as Actions;
        lastCount = value;
      }
    });

    if (lastAction === 'forward') {
      this._accumulatedDirection.add(this._getForwardVector());
    } else if (lastAction === 'backward') {
      this._accumulatedDirection.add(this._getForwardVector().multiplyScalar(-1));
    } else if (lastAction === 'leftward') {
      this._accumulatedDirection.add(this._getSideVector().multiplyScalar(-1));
    } else if (lastAction === 'rightward') {
      this._accumulatedDirection.add(this._getSideVector());
    }

    return this._accumulatedDirection;
  }

  /**
   * Updates the object's velocity based on keyboard input.
   * @param delta - Time delta for frame-independent movement.
   */
  private updateControls(delta: number) {
    const speedDelta = delta * (this.isGrounded ? this.groundMoveSpeed : this.floatMoveSpeed);

    let movement: Vector3;
    if (this.enableDiagonalMovement) movement = this._accumulateDirection();
    else movement = this._getMostRecentDirection();

    // Apply movement vector
    if (movement.lengthSq() > 1e-10) {
      this.velocity.add(movement.multiplyScalar(speedDelta));
      if (this.enableRotationOnMove) this.object.lookAt(this.object.position.clone().add(movement));
    }

    // Jump if grounded.
    if (keyStates.jump && this.isGrounded) {
      this.velocity.y = this.jumpForce;
    }

    this.object.updateMatrixWorld();
  }

  private updateSync() {
    if (this.axisSync === 'always') {
      this.camera.getWorldDirection(this._forwardDirection);
      this.object.lookAt(this.object.position.clone().add(this._getForwardVector()));
      return;
    }

    if (
      this.axisSync === 'move' &&
      (keyStates.forward || keyStates.backward || keyStates.leftward || keyStates.rightward)
    ) {
      this.camera.getWorldDirection(this._forwardDirection);
      this.object.lookAt(this.object.position.clone().add(this._getForwardVector()));
      return;
    }
  }

  /**
   * Updates the camera's position and orientation based on the object's position and keyboard input.
   */
  private updateCamera(delta: number) {
    // Update spherical properties
    const rotationSpeed = this.rotateSpeed * delta;

    if (keyStates.turnUp) {
      this._spherical.phi -= rotationSpeed;
    }

    if (keyStates.turnDown) {
      this._spherical.phi += rotationSpeed;
    }

    if (keyStates.turnLeft) {
      this._spherical.theta += rotationSpeed;
    }

    if (keyStates.turnRight) {
      this._spherical.theta -= rotationSpeed;
    }

    this._spherical.phi = Math.max(0.01, Math.min(Math.PI - 0.01, this._spherical.phi));

    // Update camera position with lerp
    this._cameraLookAtPosition.copy(this.object.position).add(this.cameraLookAtOffset);

    if (this.cameraLerpFactor > 0) {
      this._cameraLerpPosition.lerp(this._cameraLookAtPosition, this.cameraLerpFactor);
    } else {
      this._cameraLerpPosition.copy(this._cameraLookAtPosition);
    }

    this._spherical.radius = this.cameraPositionOffset.distanceTo(this.cameraLookAtOffset);
    this.camera.position.setFromSpherical(this._spherical).add(this._cameraLerpPosition);

    this.camera.lookAt(this._cameraLookAtPosition);

    this.camera.updateMatrixWorld();
  }

  /**
   * Main update function that integrates controls, physics, camera, and animations.
   * @param delta - Time delta for consistent updates.
   */
  update(delta: number) {
    super.update(delta);

    this.updateCamera(delta);
    this.updateSync();
    this.updateControls(delta);
  }

  /**
   * Connects the controls by adding event listeners.
   */
  connect() {
    super.connect();

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    this.domElement?.addEventListener('wheel', this.onMouseWheel);
  }
  /**
   * Disconnects the controls by removing event listeners.
   */
  disconnect() {
    super.disconnect();

    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.domElement?.addEventListener('wheel', this.onMouseWheel);
  }

  dispose() {
    this.disconnect();

    super.dispose();
  }

  /** Handles keydown events, updating the key state. */
  private _onKeyDown(event: KeyboardEvent) {
    for (const [action, keys] of Object.entries(this.actionKeys)) {
      if (keys?.includes(event.code)) {
        keyStates[action as Actions] = ++this._keyCount;
        break;
      }
    }
  }

  /** Handles keyup events, updating the key state. */
  private _onKeyUp(event: KeyboardEvent) {
    for (const [action, keys] of Object.entries(this.actionKeys)) {
      if (keys?.includes(event.code)) {
        keyStates[action as Actions] = 0;
        break;
      }
    }
  }

  /** Handles mouse wheel events to zoom in and out. */
  private _onMouseWheel = (event: WheelEvent) => {
    if (!this.enableZoom) return;

    if (!(this.camera instanceof PerspectiveCamera) && !(this.camera instanceof OrthographicCamera)) {
      console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
      this.enableZoom = false;
      return;
    }

    const normalizedDelta = Math.pow(0.95, this.zoomSpeed * Math.abs(event.deltaY * 0.01));

    if (event.deltaY > 0) this.camera.zoom *= normalizedDelta;
    else if (event.deltaY < 0) this.camera.zoom /= normalizedDelta;

    this.camera.updateProjectionMatrix();
  };
}

export { ThirdPersonKeyboardControls };
