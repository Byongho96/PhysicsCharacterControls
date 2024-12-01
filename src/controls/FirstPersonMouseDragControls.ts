import { Object3D, OrthographicCamera, PerspectiveCamera, Vector3 } from 'three';
import { PhysicsControls, PhysicsOptions } from './base/PhysicsControls';

/**
 * Actions that can be performed via keyboard input.
 */
type Actions = 'forward' | 'backward' | 'leftward' | 'rightward' | 'jump' | 'accelerate';

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
  enableZoom?: boolean;
  zoomSpeed?: number;
};

/**
 * Extended physics options specific to mouse drag controls.
 */
type MouseDragPhysicsOptions = PhysicsOptions & {
  eyeHeight?: number;
  jumpForce?: number;
  groundMoveSpeed?: number;
  floatMoveSpeed?: number;
  rotateSpeed?: number;
  enableDiagonalMovement?: boolean;
  enableAcceleration?: boolean;
  accelerationFactor?: number;
};

type FirstPersonMouseDragControlsProps = {
  object: Object3D;
  domElement: HTMLElement | null;
  worldObject: Object3D;
  actionKeys?: ActionKeys;
  physicsOptions?: MouseDragPhysicsOptions;
  cameraOptions?: CameraOptions;
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
  accelerate: 0,
};

const DEFAULT_ACTION_KEYS: ActionKeys = {
  forward: ['KeyW', 'ArrowUp'],
  backward: ['KeyS', 'ArrowDown'],
  leftward: ['KeyA', 'ArrowLeft'],
  rightward: ['KeyD', 'ArrowRight'],
  jump: ['Space'],
  accelerate: ['ShiftLeft'],
};

/**
 * FirstPersonMouseDragControls class allows controlling a 3D object using the mouse drag,
 */
class FirstPersonMouseDragControls extends PhysicsControls {
  // Character animations
  actionKeys: ActionKeys;

  enableZoom: boolean;
  zoomSpeed: number;

  // Physics options
  eyeHeight: number;
  jumpForce: number;
  groundMoveSpeed: number;
  floatMoveSpeed: number;
  rotateSpeed: number;

  enableDiagonalMovement: boolean;

  enableAcceleration: boolean;
  accelerationFactor: number;

  private _keyCount: number = 0;

  // Temporary vectors for calculations
  private _isMouseDown: boolean = false;
  private _objectLocalDirection: Vector3 = new Vector3();
  private _accumulatedDirection: Vector3 = new Vector3();
  private _worldYDirection: Vector3 = new Vector3(0, 1, 0);

  // Handlers for keyboard and mouse events.
  private onKeyDown: (event: KeyboardEvent) => void;
  private onKeyUp: (event: KeyboardEvent) => void;
  private onMouseDown: () => void;
  private onMouseUp: () => void;
  private onMouseMove: (event: MouseEvent) => void;
  private onMouseWheel: (event: WheelEvent) => void;

  /**
   * Constructs a new FirstPersonMouseDragControls  instance.
   * @param object - The 3D object to control.
   * @param domElement - The HTML element for event listeners (optional).
   * @param worldObject - The world object used for physics collision.
   * @param actionKeys - Key mappings for actions.
   * @param cameraOptions - Configuration for the camera (optional).
   * @param animationOptions - Configuration for animations (optional).
   * @param physicsOptions - Physics configuration options (optional).
   */
  constructor({
    object,
    domElement,
    worldObject,
    actionKeys,
    cameraOptions,
    physicsOptions,
  }: FirstPersonMouseDragControlsProps) {
    super(object, domElement, worldObject, {
      colliderHeight: 1.6,
      colliderRadius: 0.5,
      ...physicsOptions,
    });

    this.actionKeys = actionKeys ?? DEFAULT_ACTION_KEYS;

    this.enableZoom = cameraOptions?.enableZoom ?? true;
    this.zoomSpeed = cameraOptions?.zoomSpeed ?? 1;

    // Set physics parameters with defaults if not provided.
    this.eyeHeight = physicsOptions?.eyeHeight ?? 1.5;
    this.jumpForce = physicsOptions?.jumpForce ?? 15;
    this.groundMoveSpeed = physicsOptions?.groundMoveSpeed ?? 30;
    this.floatMoveSpeed = physicsOptions?.floatMoveSpeed ?? 8;
    this.rotateSpeed = physicsOptions?.rotateSpeed ?? 0.5;

    this.enableDiagonalMovement = physicsOptions?.enableDiagonalMovement ?? true;

    this.enableAcceleration = physicsOptions?.enableAcceleration ?? true;
    this.accelerationFactor = physicsOptions?.accelerationFactor ?? 1.5;

    // Bind key event handlers.
    this.onKeyDown = this._onKeyDown.bind(this);
    this.onKeyUp = this._onKeyUp.bind(this);
    this.onMouseDown = this._onMouseDown.bind(this);
    this.onMouseUp = this._onMouseUp.bind(this);
    this.onMouseMove = this._onMouseMove.bind(this);
    this.onMouseWheel = this._onMouseWheel.bind(this);

    // Connect controls to key events.
    this.connect();
  }

  /**
   * Retrieves the forward _objectWorldDirection vector of the object, ignoring the Y-axis.
   * @returns A normalized Vector3 representing the forward _objectWorldDirection.
   */
  private _getForwardVector(): Vector3 {
    this.object.getWorldDirection(this._objectLocalDirection);
    this._objectLocalDirection.y = 0;
    this._objectLocalDirection.normalize();

    return this._objectLocalDirection;
  }

  /**
   * Gets the side (right) direction vector based on the camera's orientation.
   * @returns Normalized side vector.
   */
  private _getSideVector(): Vector3 {
    this.object.getWorldDirection(this._objectLocalDirection);
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
   * Updates movement based on physics and camera rotation.
   * @param delta - The time delta for frame-independent movement.
   */
  private updateControls(delta: number) {
    let speedDelta = delta * (this.isGrounded ? this.groundMoveSpeed : this.floatMoveSpeed);
    if (this.enableAcceleration && keyStates.accelerate) speedDelta *= this.accelerationFactor;

    // Move
    let movement: Vector3;
    if (this.enableDiagonalMovement) movement = this._accumulateDirection();
    else movement = this._getMostRecentDirection();

    this.velocity.add(movement.multiplyScalar(speedDelta));

    // Jump if grounded.
    if (keyStates.jump && this.isGrounded) {
      this.velocity.y = this.jumpForce;
    }

    this.object.updateMatrixWorld();
  }

  /**
   * Main update function that integrates controls, physics, camera, and animations.
   * @param delta - The time delta for consistent updates.
   */
  update(delta: number) {
    super.update(delta);

    this.object.position.y += this.eyeHeight;

    this.updateControls(delta);
  }

  /**
   * Connects the keyboard controls by adding event listeners.
   */
  connect() {
    super.connect();

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    this.domElement?.addEventListener('mousedown', this.onMouseDown);
    document.addEventListener('mouseup', this.onMouseUp);
    this.domElement?.addEventListener('mousemove', this.onMouseMove);
    this.domElement?.removeEventListener('wheel', this.onMouseWheel);
  }

  /**
   * Disconnects the keyboard controls by removing event listeners.
   */
  disconnect() {
    super.disconnect();

    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.domElement?.removeEventListener('mousedown', this.onMouseDown);
    document.removeEventListener('mouseup', this.onMouseUp);
    this.domElement?.removeEventListener('mousemove', this.onMouseMove);
    this.domElement?.removeEventListener('wheel', this.onMouseWheel);
  }

  /**
   * Disposes of the keyboard controls, cleaning up event listeners and animations.
   */
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
  /** Handles mousedown events to set _isMouseDown flag. */
  private _onMouseDown = () => {
    this._isMouseDown = true;
  };

  /** Handles mouseup events to reset _isMouseDown flag. */
  private _onMouseUp = () => {
    this._isMouseDown = false;
  };

  /** Handles mousemove events to update camera angles when mouse is down. */
  private _onMouseMove = (event: MouseEvent) => {
    if (!this._isMouseDown) return;

    this.object.rotateOnWorldAxis(this._worldYDirection, (-1 * event.movementX * this.rotateSpeed) / 100);
    this.object.rotateX((-1 * event.movementY * this.rotateSpeed) / 100);

    this.object.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.object.rotation.x));
  };

  private _onMouseWheel = (event: WheelEvent) => {
    if (!this.enableZoom) return;

    if (!(this.object instanceof PerspectiveCamera) && !(this.object instanceof OrthographicCamera)) {
      console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
      this.enableZoom = false;
      return;
    }

    const normalizedDelta = Math.pow(0.95, this.zoomSpeed * Math.abs(event.deltaY * 0.01));

    if (event.deltaY > 0) this.object.zoom *= normalizedDelta;
    else if (event.deltaY < 0) this.object.zoom /= normalizedDelta;

    this.object.updateProjectionMatrix();
  };
}

export { FirstPersonMouseDragControls };
