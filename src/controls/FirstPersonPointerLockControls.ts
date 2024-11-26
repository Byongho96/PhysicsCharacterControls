import { Object3D, Vector3 } from 'three';
import { PhysicsControls, PhysicsOptions } from './base/PhysicsControls';

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
 * Extended physics options specific to pointer lock controls.
 */
type PointerLockPhysicsOptions = PhysicsOptions & {
  eyeHeight?: number;
  jumpForce?: number; // Force applied when jumping
  groundMoveSpeed?: number; // Speed when moving on the ground
  floatMoveSpeed?: number; // Speed when in the air
  rotateSpeed?: number; // Rotation speed
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
 * FirstPersonPointerLockControls class allows controlling a 3D object using the Pointer Lock API and mouse input.
 */
class FirstPersonPointerLockControls extends PhysicsControls {
  // Physics options
  eyeHeight: number;
  jumpForce: number;
  groundMoveSpeed: number;
  floatMoveSpeed: number;
  rotateSpeed: number;

  // Temporary vectors for calculations
  private _objectWorldDirection: Vector3 = new Vector3();

  actionKeys: ActionKeys;

  // Handlers for keyboard events.
  private onKeyDownHandler: (event: KeyboardEvent) => void;
  private onKeyUpHandler: (event: KeyboardEvent) => void;

  // Handlers for pointer lock events.
  private onMouseMoveHandler: (event: MouseEvent) => void;
  private onMouseDownHandler: (event: MouseEvent) => void;

  /**
   * Constructs a new FirstPersonPointerLockControls instance.
   * @param object - The 3D object to control.
   * @param domElement - The HTML element for event listeners.
   * @param worldObject - The world object used for physics collision.
   * @param actionKeys - Key mappings for actions.
   * @param physicsOptions - Physics configuration options (optional).
   */
  constructor(
    object: Object3D,
    domElement: HTMLElement,
    worldObject: Object3D,
    actionKeys: ActionKeys,
    physicsOptions?: PointerLockPhysicsOptions,
  ) {
    super(object, domElement, worldObject, {
      colliderHeight: 1.6,
      colliderRadius: 0.5,
      ...physicsOptions,
    });

    this.actionKeys = actionKeys;

    // Set physics parameters with defaults if not provided.
    this.eyeHeight = physicsOptions?.eyeHeight ?? 1.5;
    this.jumpForce = physicsOptions?.jumpForce ?? 15;
    this.groundMoveSpeed = physicsOptions?.groundMoveSpeed ?? 25;
    this.floatMoveSpeed = physicsOptions?.floatMoveSpeed ?? 8;
    this.rotateSpeed = physicsOptions?.rotateSpeed ?? 0.002;

    // Bind key event handlers.
    this.onKeyDownHandler = this.onKeyDown.bind(this);
    this.onKeyUpHandler = this.onKeyUp.bind(this);

    // Bind event handlers.
    this.onMouseMoveHandler = this.onMouseMove.bind(this);
    this.onMouseDownHandler = this.onMouseDown.bind(this);

    // Connect controls to pointer lock events.
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
   * Updates movement based on physics and camera rotation.
   * @param delta - The time delta for frame-independent movement.
   */
  private updateControls(delta: number) {
    const speedDelta = delta * (this.isGrounded ? this.groundMoveSpeed : this.floatMoveSpeed);

    // Move forward.
    if (keyStates.forward) {
      this.velocity.add(this.getForwardVector().multiplyScalar(speedDelta));
    }

    // Move backward.
    if (keyStates.backward) {
      this.velocity.add(this.getForwardVector().multiplyScalar(-speedDelta));
    }

    // Move leftward.
    if (keyStates.leftward) {
      this.velocity.add(this.getSideVector().multiplyScalar(-speedDelta));
    }

    // Move rightward.
    if (keyStates.rightward) {
      this.velocity.add(this.getSideVector().multiplyScalar(speedDelta));
    }

    // Jump if grounded.
    if (keyStates.jump && this.isGrounded) {
      this.velocity.y = this.jumpForce;
    }
  }

  /**
   * Main update function that integrates controls, physics, and camera.
   * @param delta - The time delta for consistent updates.
   */
  update(delta: number) {
    super.update(delta);

    this.object.position.y += this.eyeHeight;

    this.updateControls(delta);
  }

  /**
   * Connects the pointer lock controls by adding event listeners.
   */
  connect() {
    super.connect();

    this.domElement?.addEventListener('click', this.onMouseDownHandler);

    document.addEventListener('keydown', this.onKeyDownHandler);
    document.addEventListener('keyup', this.onKeyUpHandler);
    document.addEventListener('mousemove', this.onMouseMoveHandler);
  }

  /**
   * Disconnects the pointer lock controls by removing event listeners.
   */
  disconnect() {
    super.disconnect();

    this.domElement?.removeEventListener('click', this.onMouseDownHandler);

    document.removeEventListener('keydown', this.onKeyDownHandler);
    document.removeEventListener('keyup', this.onKeyUpHandler);
    document.removeEventListener('mousemove', this.onMouseMoveHandler);
  }

  /**
   * Disposes of the pointer lock controls, cleaning up event listeners and animations.
   */
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

  /**
   * @param event - The mouse movement event.
   */

  /** Handles mousemove events to update camera angles with separate clamping for upward and downward movements. */
  private onMouseMove(event: MouseEvent) {
    if (document.pointerLockElement === this.domElement) {
      this.object.rotation.y -= event.movementX * this.rotateSpeed;
      this.object.rotation.x -= event.movementY * this.rotateSpeed;

      this.object.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.object.rotation.x));
    }
  }

  /**
   * Requests pointer lock on the DOM element.
   */
  private onMouseDown() {
    this.domElement?.requestPointerLock();
  }
}

export { FirstPersonPointerLockControls };
