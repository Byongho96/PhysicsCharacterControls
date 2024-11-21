import { Object3D, Vector3 } from 'three';
import { PhysicsControls, PhysicsOptions } from './base/PhysicsControls';

/**
 * Actions that can be performed via keyboard input.
 */
type Actions = 'forward' | 'backward' | 'leftward' | 'rightward' | 'jump';

/**
 * Configuration for key mappings to actions.
 */
type ActionKeys = {
  [K in Actions]?: string[]; // Mapping each action to possible key bindings
};

/**
 * Extended physics options specific to mouse drag controls.
 */
type FirstPersonMouseDragPhysicsOptions = PhysicsOptions & {
  eyeHeight?: number;
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
 * FirstPersonMouseDragControls class allows controlling a 3D object using the mouse drag,
 */
class FirstPersonMouseDragControls extends PhysicsControls {
  // Character animations
  actionKeys: ActionKeys;

  // Physics options
  eyeHeight: number;
  jumpForce: number;
  groundMoveSpeed: number;
  floatMoveSpeed: number;
  rotateSpeed: number;

  // Temporary vectors for calculations
  private _isMouseDown: boolean = false;
  private _objectWorldDirection: Vector3 = new Vector3();
  private _accumulatedMovement: Vector3 = new Vector3();

  // Handlers for keyboard and mouse events.
  private onKeyDownHandler: (event: KeyboardEvent) => void;
  private onKeyUpHandler: (event: KeyboardEvent) => void;
  private onMouseDownHandler: () => void;
  private onMouseUpHandler: () => void;
  private onMouseMoveHandler: (event: MouseEvent) => void;

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
  constructor(
    object: Object3D,
    domElement: HTMLElement | null,
    worldObject: Object3D,
    actionKeys: ActionKeys,
    physicsOptions?: FirstPersonMouseDragPhysicsOptions,
  ) {
    super(object, domElement, worldObject, {
      colliderHeight: 1.6,
      colliderRadius: 0.5,
      ...physicsOptions,
    });

    // Set key mappings.
    this.actionKeys = actionKeys;

    // Set physics parameters with defaults if not provided.
    this.eyeHeight = physicsOptions?.eyeHeight ?? 1.5;
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

    // Connect controls to key events.
    this.connect();
  }

  /**
   * Retrieves the forward _objectWorldDirection vector of the object, ignoring the Y-axis.
   * @returns A normalized Vector3 representing the forward _objectWorldDirection.
   */
  private getForwardVector(): Vector3 {
    this.object.getWorldDirection(this._objectWorldDirection);
    this._objectWorldDirection.y = 0;
    this._objectWorldDirection.normalize();

    return this._objectWorldDirection;
  }

  /**
   * Gets the side (right) direction vector based on the object's orientation.
   * @returns Normalized side vector.
   */
  private getSideVector(): Vector3 {
    this.object.getWorldDirection(this._objectWorldDirection);
    this._objectWorldDirection.y = 0;
    this._objectWorldDirection.normalize();
    this._objectWorldDirection.cross(this.object.up);
    return this._objectWorldDirection;
  }

  /**
   * Updates movement and rotation based on the current keyboard input.
   * @param delta - The time delta for frame-independent movement.
   */
  private updateControls(delta: number) {
    const speedDelta = delta * (this.isGrounded ? this.groundMoveSpeed : this.floatMoveSpeed);

    const movement = this._accumulatedMovement.set(0, 0, 0);

    // Move leftward.
    if (keyStates.leftward) {
      movement.add(this.getSideVector().multiplyScalar(-1));
    }
    // Move rightward.
    if (keyStates.rightward) {
      movement.add(this.getSideVector());
    }
    // Move forward.
    if (keyStates.forward) {
      movement.add(this.getForwardVector());
    }

    // Move backward.
    if (keyStates.backward) {
      movement.add(this.getForwardVector().multiplyScalar(-1));
    }

    // Apply accumulated movement vector
    if (movement.lengthSq() > 1e-10) {
      movement.normalize();
      this.velocity.add(movement.multiplyScalar(speedDelta));
    }

    // Jump if grounded.
    if (keyStates.jump && this.isGrounded) {
      this.velocity.y = this.jumpForce;
    }
  }

  /**
   * Main update function that integrates controls, physics, camera, and animations.
   * @param delta - The time delta for consistent updates.
   */
  update(delta: number) {
    this.updateControls(delta);

    super.update(delta);
    this.object.translateY(this.eyeHeight);
  }

  /**
   * Connects the keyboard controls by adding event listeners.
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
   * Disconnects the keyboard controls by removing event listeners.
   */
  disconnect() {
    super.disconnect();

    document.removeEventListener('keydown', this.onKeyDownHandler);
    document.removeEventListener('keyup', this.onKeyUpHandler);
    this.domElement?.removeEventListener('mousedown', this.onMouseDownHandler);
    document.removeEventListener('mouseup', this.onMouseUpHandler);
    this.domElement?.removeEventListener('mousemove', this.onMouseMoveHandler);
  }

  /**
   * Disposes of the keyboard controls, cleaning up event listeners and animations.
   */
  dispose() {
    this.disconnect();

    super.dispose();
  }

  /**
   * Handles keydown events, updating the key state.
   * @param event - The keyboard event.
   */
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

  /**
   * Handles keyup events, updating the key state.
   * @param event - The keyboard event.
   */
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
    event.preventDefault();

    this.object.rotateY(event.movementX * -0.002 * this.rotateSpeed);
  };
}

export { FirstPersonMouseDragControls };
