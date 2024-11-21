import {
  AnimationAction,
  AnimationClip,
  AnimationMixer,
  AnimationObjectGroup,
  Object3D,
  Quaternion,
  Vector3,
} from 'three';
import { PhysicsControls, PhysicsOptions } from './PhysicsControls';

/**
 * Animation states that can be used.
 */
type Animations = 'idle' | 'forward' | 'backward' | 'rightward' | 'leftward' | 'jump' | 'fall';

/**
 * Configuration for animations and their options.
 */
export type AnimationOptions = {
  animationClips?: Partial<Record<Animations, AnimationClip>>;
  transitionTime?: number;
  fallSpeedThreshold?: number;
  moveSpeedThreshold?: number;
};

class PhysicsCharacterControls extends PhysicsControls {
  private _mixer: AnimationMixer;
  private _objectGroup: AnimationObjectGroup;
  private _animationClips: Record<string, AnimationClip> = {};
  private _animationActions: Record<string, AnimationAction> = {};

  // Animation options
  transitionTime: number;
  fallSpeedThreshold: number;
  moveSpeedThreshold: number;

  private _localVelocity: Vector3 = new Vector3();
  private _worldQuaternion: Quaternion = new Quaternion();

  constructor(
    object: Object3D,
    domElement: HTMLElement | null,
    world: Object3D,
    animationOptions: AnimationOptions = {},
    physicsOptions: PhysicsOptions = {},
  ) {
    super(object, domElement, world, physicsOptions);

    this._objectGroup = new AnimationObjectGroup(object);
    this._mixer = new AnimationMixer(this._objectGroup);

    if (animationOptions.animationClips) {
      Object.entries(animationOptions.animationClips).forEach(([key, clip]) => {
        this.setAnimationClip(key, clip);
      });
    }

    this.transitionTime = animationOptions.transitionTime ?? 0.5;
    this.fallSpeedThreshold = animationOptions.fallSpeedThreshold ?? 15;
    this.moveSpeedThreshold = animationOptions.moveSpeedThreshold ?? 0.1;
  }

  /**
   * Returns a read-only copy of the animation clips.
   */
  get clips() {
    return Object.freeze({ ...this._animationClips });
  }

  /**
   * Adds an object to the animation object group.
   * @param object - The Object3D to add.
   */
  addObject(object: Object3D) {
    this._objectGroup.add(object);
  }

  /**
   * Removes an object from the animation object group.
   * @param object - The Object3D to remove.
   */
  removeObject(object: Object3D) {
    this._objectGroup.remove(object);
  }

  /**
   * Adds an animation clip and its corresponding action.
   * @param key - The identifier for the animation clip.
   * @param clip - The AnimationClip to add.
   */
  setAnimationClip(key: string, clip: AnimationClip) {
    const action = this._mixer.clipAction(clip);

    this._animationClips[key] = clip;
    this._animationActions[key] = action;
  }

  /**
   * Removes an animation clip and its corresponding action.
   * @param key - The identifier for the animation clip to remove.
   */
  removeAnimationClip(key: string) {
    const clip = this._animationClips[key];
    if (!clip) return;

    const action = this._animationActions[key];
    if (action) {
      action.stop();
      this._mixer.uncacheAction(clip, this._objectGroup);
    }

    this._mixer.uncacheClip(clip);

    delete this._animationClips[key];
    delete this._animationActions[key];
  }

  /**
   * Smoothly transitions to the specified animation action over a given duration.
   * @param key - The identifier for the animation action to transition to.
   * @param duration - The duration of the transition in seconds.
   */
  private _fadeToAction(key: string, duration: number) {
    const action = this._animationActions[key];
    if (!action || action.isRunning()) return;

    // Fade out all current actions
    Object.values(this._animationActions).forEach(currentAction => {
      currentAction.fadeOut(duration);
    });

    action.reset(); // Reset the action to start from the beginning
    action.fadeIn(duration);
    action.play(); // Play the action
  }

  /**
   * Updates the animation based on the current state of the player.
   */
  private _updateAnimation() {
    const worldQuaternion = this.object.getWorldQuaternion(this._worldQuaternion);
    this._localVelocity.copy(this.velocity).applyQuaternion(worldQuaternion.invert());

    if (this.isGrounded && this._localVelocity.z > this.moveSpeedThreshold) {
      return this._fadeToAction('forward', this.transitionTime);
    }

    if (this.isGrounded && this._localVelocity.z < -this.moveSpeedThreshold) {
      return this._fadeToAction('backward', this.transitionTime);
    }

    if (this.isGrounded && this._localVelocity.x > this.moveSpeedThreshold) {
      return this._fadeToAction('leftward', this.transitionTime);
    }

    if (this.isGrounded && this._localVelocity.x < -this.moveSpeedThreshold) {
      return this._fadeToAction('rightward', this.transitionTime);
    }

    if (this.velocity.y > 0) {
      return this._fadeToAction('jump', this.transitionTime);
    }

    if (this.velocity.y < -this.fallSpeedThreshold) {
      return this._fadeToAction('fall', this.transitionTime);
    }

    if (this.isGrounded) {
      return this._fadeToAction('idle', this.transitionTime);
    }
  }

  /**
   * Updates the _mixer with the given delta time.
   * @param delta - The time increment in seconds.
   */
  update(delta: number) {
    super.update(delta);

    this._updateAnimation();

    this._mixer.update(delta);
  }

  /**
   * Stops all actions and disposes of the _mixer.
   */
  dispose() {
    this._mixer.stopAllAction();
    this._mixer.uncacheRoot(this._objectGroup);
  }
}

export default PhysicsCharacterControls;
