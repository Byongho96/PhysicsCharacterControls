import { Object3D, Vector3 } from 'three';
import { PhysicsControls, PhysicsOptions } from './base/PhysicsControls';

/**
 * Actions that can be performed via keyboard input.
 */
type Actions =
  | 'forward'
  | 'backward'
  | 'leftward'
  | 'rightward'
  | 'turnLeft'
  | 'turnRight'
  | 'turnUp'
  | 'turnDown'
  | 'jump';

/**
 * Configuration for key mappings to actions.
 */
type ActionKeys = {
  [K in Actions]?: string[]; // Mapping each action to possible key bindings
};

/**
 * Extended physics options specific to keyboard controls.
 */
type KeyboardPhysicsOptions = PhysicsOptions & {
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
  turnUp: false,
  turnDown: false,
  turnLeft: false,
  turnRight: false,
  jump: false,
};

/**
 * FirstPersonKeyboardControls class allows controlling a 3D object using the keyboard,
 */
class FirstPersonKeyboardControls extends PhysicsControls {
  // Character animations
  actionKeys: ActionKeys;

  // Physics options
  eyeHeight: number;
  jumpForce: number;
  groundMoveSpeed: number;
  floatMoveSpeed: number;
  rotateSpeed: number;

  // Temporary vectors for calculations
  private _objectWorldDirection: Vector3 = new Vector3();
  private _worldYDirection: Vector3 = new Vector3(0, 1, 0);

  // Handlers for keyboard events.
  private onKeyDownHandler: (event: KeyboardEvent) => void;
  private onKeyUpHandler: (event: KeyboardEvent) => void;

  /**
   * Constructs a new FirstPersonKeyboardControls  instance.
   * @param object - The 3D object to control.
   * @param domElement - The HTML element for event listeners (optional).
   * @param worldObject - The world object used for physics collision.
   * @param actionKeys - Key mappings for actions.
   * @param physicsOptions - Physics configuration options (optional).
   */
  constructor(
    object: Object3D,
    domElement: HTMLElement | null,
    worldObject: Object3D,
    actionKeys: ActionKeys,
    physicsOptions?: KeyboardPhysicsOptions,
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
   * Gets the side (right) direction vector based on the camera's orientation.
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

    // Move
    if (keyStates.forward) {
      this.velocity.add(this.getForwardVector().multiplyScalar(speedDelta));
    }

    if (keyStates.backward) {
      this.velocity.add(this.getForwardVector().multiplyScalar(-speedDelta));
    }

    if (keyStates.leftward) {
      this.velocity.add(this.getSideVector().multiplyScalar(-speedDelta));
    }

    if (keyStates.rightward) {
      this.velocity.add(this.getSideVector().multiplyScalar(speedDelta));
    }

    // Turn
    if (keyStates.turnLeft) {
      this.object.rotateOnWorldAxis(this._worldYDirection, this.rotateSpeed * delta);
    }

    if (keyStates.turnRight) {
      this.object.rotateOnWorldAxis(this._worldYDirection, -this.rotateSpeed * delta);
    }

    if (keyStates.turnUp && this.object.rotation.x < Math.PI / 2 - 0.01) {
      this.object.rotateX(this.rotateSpeed * delta);
    }

    if (keyStates.turnDown && this.object.rotation.x > -Math.PI / 2 + 0.01) {
      this.object.rotateX(-this.rotateSpeed * delta);
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
    super.update(delta);

    this.object.position.y += this.eyeHeight;

    this.updateControls(delta);
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
  }

  /**
   * Handles keydown events, updating the key state.
   * @param event - The keyboard event.
   */
  private onKeyDown(event: KeyboardEvent) {
    for (const [action, keys] of Object.entries(this.actionKeys)) {
      if (keys?.includes(event.key)) {
        keyStates[action as Actions] = true;
      }
    }
  }

  /**
   * Handles keyup events, updating the key state.
   * @param event - The keyboard event.
   */
  private onKeyUp(event: KeyboardEvent) {
    for (const [action, keys] of Object.entries(this.actionKeys)) {
      if (keys?.includes(event.key)) {
        keyStates[action as Actions] = false;
      }
    }
  }
}

export { FirstPersonKeyboardControls };
