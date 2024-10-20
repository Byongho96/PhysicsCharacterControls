import { AnimationClip, Camera, Object3D, Vector3 } from 'three';
import { PhysicsControls, PhysicsOptions } from './base/PhysicsControls';
import { Characters } from '../characters/Characters';

type Actions = 'forward' | 'backward' | 'leftward' | 'rightward' | 'jump';
type Animations = 'idle' | 'forward' | 'jump' | 'fall';

export type KeyOptions = Partial<Record<Actions, string[]>>;

export type AnimationOptions = Partial<Record<Animations, AnimationClip>> & {
  transitionTime?: number;
  fallSpeedThreshold?: number;
  moveSpeedThreshold?: number;
};

export type CameraOptions = {
  camera: Camera;
  posOffset: Vector3;
  lookAtOffset: Vector3;
};

export type KeyboardPhysicsOptions = PhysicsOptions & {
  jumpForce?: number;
  groundMoveSpeed?: number;
  floatMoveSpeed?: number;
  rotateSpeed?: number;
};

class MouseRotationControls extends PhysicsControls {
  private _characters: Characters;
  private _cameraPosOffset: Vector3;
  private _cameraLookAtOffset: Vector3;
  private _cameraRadius: number = 0;
  private _cameraPhi: number = 0;
  private _cameraTheta: number = 0;
  private _keyStates: Record<string, boolean> = {};
  private _isMouseDown = false;

  camera: Camera;
  keyOptions: KeyOptions;

  // Physics options with default values
  jumpForce: number;
  groundMoveSpeed: number;
  floatMoveSpeed: number;
  rotateSpeed: number;

  // Animation options with default values
  transitionTime: number;
  fallSpeedThreshold: number;
  moveSpeedThreshold: number;

  // Reusable vectors to avoid allocations every frame
  private _tempVector1: Vector3 = new Vector3();
  private _tempVector2: Vector3 = new Vector3();
  private _tempVector3: Vector3 = new Vector3();

  constructor(
    object: Object3D,
    domElement: HTMLElement | null,
    worldObject: Object3D,
    keyOptions: KeyOptions,
    cameraOptions: CameraOptions,
    animationOptions: AnimationOptions = {},
    physicsOptions: KeyboardPhysicsOptions = {},
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
    this._cameraPosOffset = cameraOptions.posOffset;
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

    this.connect();
  }

  get cameraPosOffset() {
    return this._cameraPosOffset;
  }

  set cameraPosOffset(offset: Vector3) {
    this._cameraPosOffset = offset;
    this.updateCameraInfo();
  }

  get cameraLookAtOffset() {
    return this._cameraLookAtOffset;
  }

  set cameraLookAtOffset(offset: Vector3) {
    this._cameraLookAtOffset = offset;
    this.updateCameraInfo();
  }

  private updateCameraInfo() {
    const subVector = this._tempVector1.copy(this._cameraPosOffset).sub(this._cameraLookAtOffset);
    this._cameraRadius = subVector.length();
    this._cameraPhi = Math.acos(subVector.y / this._cameraRadius);
    this._cameraTheta = Math.atan2(subVector.z, subVector.x);
  }

  private getForwardVector(): Vector3 {
    // Reuse _tempVector1
    this.camera.getWorldDirection(this._tempVector1);
    this._tempVector1.y = 0;
    this._tempVector1.normalize();
    return this._tempVector1;
  }

  private getSideVector(): Vector3 {
    // Reuse _tempVector2
    this.camera.getWorldDirection(this._tempVector2);
    this._tempVector2.y = 0;
    this._tempVector2.normalize();
    this._tempVector2.cross(this.object.up);
    return this._tempVector2;
  }

  private updateControls(delta: number) {
    // Handle jumping
    if (this.isGrounded && this.keyOptions.jump?.some(key => this._keyStates[key])) {
      this.velocity.y = this.jumpForce;
    }

    const speedDelta = delta * (this.isGrounded ? this.groundMoveSpeed : this.floatMoveSpeed);

    // Reset movement vector
    const movement = this._tempVector3.set(0, 0, 0);

    // Accumulate movement vectors based on key states
    if (this.keyOptions.leftward?.some(key => this._keyStates[key])) {
      movement.add(this.getSideVector().multiplyScalar(-1));
    }
    if (this.keyOptions.rightward?.some(key => this._keyStates[key])) {
      movement.add(this.getSideVector());
    }
    if (this.keyOptions.backward?.some(key => this._keyStates[key])) {
      movement.add(this.getForwardVector().multiplyScalar(-1));
    }
    if (this.keyOptions.forward?.some(key => this._keyStates[key])) {
      movement.add(this.getForwardVector());
    }

    // Apply movement if any
    if (movement.lengthSq() > 1e-10) {
      movement.normalize();
      this.velocity.add(movement.multiplyScalar(speedDelta));
      this.object.lookAt(this.object.position.clone().add(movement));
    }
  }

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

  private updateAnimation(delta: number) {
    this._characters.update(delta);

    // Reuse _tempVector1 for direction
    this.object.getWorldDirection(this._tempVector1);

    const horizontalSpeed = this._tempVector1.copy(this.velocity);
    horizontalSpeed.y = 0;
    const speed = horizontalSpeed.length();

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

  update(delta: number) {
    this.updateControls(delta);
    super.update(delta);
    this.updateCamera();
    this.updateAnimation(delta);
  }

  connect() {
    super.connect();

    document.addEventListener('keydown', this._onKeyDown);
    document.addEventListener('keyup', this._onKeyUp);
    this.domElement?.addEventListener('mousedown', this._onMouseDown);
    document.addEventListener('mouseup', this._onMouseUp);
    this.domElement?.addEventListener('mousemove', this._onMouseMove);
  }

  disconnect() {
    super.disconnect();

    document.removeEventListener('keydown', this._onKeyDown);
    document.removeEventListener('keyup', this._onKeyUp);
    this.domElement?.removeEventListener('mousedown', this._onMouseDown);
    document.removeEventListener('mouseup', this._onMouseUp);
    this.domElement?.removeEventListener('mousemove', this._onMouseMove);
  }

  private _onKeyDown = (event: KeyboardEvent) => {
    this._keyStates[event.key] = true;
  };

  private _onKeyUp = (event: KeyboardEvent) => {
    this._keyStates[event.key] = false;
  };

  private _onMouseDown = () => {
    this._isMouseDown = true;
  };

  private _onMouseUp = () => {
    this._isMouseDown = false;
  };

  private _onMouseMove = (event: MouseEvent) => {
    if (!this._isMouseDown) return;

    this._cameraTheta += (event.movementX * this.rotateSpeed) / 100;
    this._cameraPhi -= (event.movementY * this.rotateSpeed) / 100;

    // Clamp the camera angles to prevent flipping
    this._cameraPhi = Math.max(0.01, Math.min(Math.PI - 0.01, this._cameraPhi));
  };
}

export { MouseRotationControls };
