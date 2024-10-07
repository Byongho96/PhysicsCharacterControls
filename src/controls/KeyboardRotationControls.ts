import { AnimationClip, Camera, Object3D, Vector3 } from 'three';
import { PhysicsControls, PhysicsOptions } from './PhysicsControls';
import { Characters } from '../characters/Characters';

type Actions = 'forward' | 'backward' | 'leftTurn' | 'rightTurn' | 'jump';

type Animations = 'idle' | 'forward' | 'backward' | 'jump' | 'fall';

export type KeyOptions = {
  [K in Actions]?: string[];
};

export type AnimationOptions = {
  [K in Animations]?: AnimationClip;
} & {
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

const keyStates: Record<string, boolean> = {};

class KeyboardRotationControls extends PhysicsControls {
  private _characters: Characters;

  camera: Camera | null = null;
  cameraPosOffset: Vector3 | null = null;
  cameraLookAtOffset: Vector3 | null = null;

  keyOptions: KeyOptions;

  jumpForce: number;
  groundMoveSpeed: number;
  floatMoveSpeed: number;
  rotateSpeed: number;

  transitionTime: number;
  fallSpeedThreshold: number;
  moveSpeedThreshold: number;

  _vector1: Vector3 = new Vector3();
  _direction: Vector3 = new Vector3();

  _onKeyDown: (event: KeyboardEvent) => void;
  _onKeyUp: (event: KeyboardEvent) => void;

  constructor(
    object: Object3D,
    domElement: HTMLElement | null,
    worldObject: Object3D,
    keyOptions: KeyOptions,
    cameraOptions?: CameraOptions,
    animationOptions?: AnimationOptions,
    physicsOptions?: KeyboardPhysicsOptions,
  ) {
    super(object, domElement, worldObject, physicsOptions);

    const { idle, forward, backward, jump, fall } = animationOptions || {};

    this._characters = new Characters(object, {
      ...(idle && { idle }),
      ...(forward && { forward }),
      ...(backward && { backward }),
      ...(jump && { jump }),
      ...(fall && { fall }),
    });

    this.keyOptions = keyOptions;

    if (cameraOptions) {
      this.camera = cameraOptions.camera;
      this.cameraPosOffset = cameraOptions.posOffset;
      this.cameraLookAtOffset = cameraOptions.lookAtOffset;
    }

    this.jumpForce = physicsOptions?.jumpForce || 15;
    this.groundMoveSpeed = physicsOptions?.groundMoveSpeed || 25;
    this.floatMoveSpeed = physicsOptions?.floatMoveSpeed || 8;
    this.rotateSpeed = physicsOptions?.rotateSpeed || 1;

    this.transitionTime = animationOptions?.transitionTime || 0.3;
    this.fallSpeedThreshold = animationOptions?.fallSpeedThreshold || 15;
    this.moveSpeedThreshold = animationOptions?.moveSpeedThreshold || 1;

    this._onKeyDown = onKeyDown.bind(this);
    this._onKeyUp = onKeyUp.bind(this);

    this.connect();
  }

  getForwardVector() {
    this.object.getWorldDirection(this._direction);
    this._direction.y = 0;
    this._direction.normalize();

    return this._direction;
  }

  getSideVector() {
    this.object.getWorldDirection(this._direction);
    this._direction.y = 0;
    this._direction.normalize();
    this._direction.cross(this.object.up);

    return this._direction;
  }

  updateControls(delta: number) {
    const speedDelta =
      delta * (this.isGrounded ? this.groundMoveSpeed : this.floatMoveSpeed);

    if (this.keyOptions.forward?.some(key => keyStates[key])) {
      this.velocity.add(this.getForwardVector().multiplyScalar(speedDelta));
    }

    if (this.keyOptions.backward?.some(key => keyStates[key])) {
      this.velocity.add(this.getForwardVector().multiplyScalar(-speedDelta));
    }

    if (this.keyOptions.leftTurn?.some(key => keyStates[key])) {
      this.object.rotateY(delta * this.rotateSpeed);
    }

    if (this.keyOptions.rightTurn?.some(key => keyStates[key])) {
      this.object.rotateY(delta * -this.rotateSpeed);
    }

    if (this.isGrounded && this.keyOptions.jump?.some(key => keyStates[key])) {
      this.velocity.y = this.jumpForce;
    }
  }

  updateCamera() {
    if (this.camera && this.cameraPosOffset && this.cameraLookAtOffset) {
      this.object.updateMatrixWorld();

      const worldOffset = this.cameraPosOffset
        .clone()
        .applyMatrix4(this.object.matrixWorld);

      this.camera.position.copy(worldOffset);

      this.camera.lookAt(
        this.object
          .getWorldPosition(this._vector1)
          .add(this.cameraLookAtOffset),
      );
    }
  }

  updateAnimation(delta: number) {
    this._characters.update(delta);

    this.object.getWorldDirection(this._direction);

    const forwardSpeed = this._direction.dot(this.velocity);

    if (this.isGrounded && forwardSpeed > this.moveSpeedThreshold) {
      this._characters.fadeToAction('forward', this.transitionTime);
    } else if (this.isGrounded && forwardSpeed < -this.moveSpeedThreshold) {
      this._characters.fadeToAction('backward', this.transitionTime);
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
  }

  disconnect() {
    super.disconnect();

    document.removeEventListener('keydown', this._onKeyDown);
    document.removeEventListener('keyup', this._onKeyUp);
  }
}

function onKeyDown(event: KeyboardEvent) {
  keyStates[event.key] = true;
}

function onKeyUp(event: KeyboardEvent) {
  keyStates[event.key] = false;
}

export { KeyboardRotationControls };
