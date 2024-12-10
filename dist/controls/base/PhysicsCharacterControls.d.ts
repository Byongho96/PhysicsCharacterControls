import { AnimationClip, Object3D } from 'three';
import { PhysicsControls, PhysicsOptions } from './PhysicsControls';
/**
 * Animation states that can be used.
 */
type Animations = 'idle' | 'forward' | 'backward' | 'rightward' | 'leftward' | 'runForward' | 'runBackward' | 'runRightward' | 'runLeftward' | 'jumpUp' | 'jumpDown' | 'fall';
/**
 * Configuration for animations and their options.
 */
export type AnimationOptions = {
    animationClips?: Partial<Record<Animations, AnimationClip>>;
    transitionTime?: number;
    transitionDelay?: number;
    fallSpeedThreshold?: number;
    moveSpeedThreshold?: number;
    runSpeedThreshold?: number;
};
declare class PhysicsCharacterControls extends PhysicsControls {
    private _mixer;
    private _objectGroup;
    private _animationClips;
    private _animationActions;
    transitionTime: number;
    transitionDelay: number;
    fallSpeedThreshold: number;
    moveSpeedThreshold: number;
    runSpeedThreshold: number;
    private _localVelocity;
    private _worldQuaternion;
    private _currentAction;
    constructor(object: Object3D, domElement: HTMLElement | null, world: Object3D, animationOptions?: AnimationOptions, physicsOptions?: PhysicsOptions);
    /**
     * Returns a read-only copy of the animation clips.
     */
    get clips(): Readonly<{
        [x: string]: AnimationClip;
    }>;
    /**
     * Adds an object to the animation object group.
     * @param object - The Object3D to add.
     */
    addObject(object: Object3D): void;
    /**
     * Removes an object from the animation object group.
     * @param object - The Object3D to remove.
     */
    removeObject(object: Object3D): void;
    /**
     * Adds an animation clip and its corresponding action.
     * @param key - The identifier for the animation clip.
     * @param clip - The AnimationClip to add.
     */
    setAnimationClip(key: string, clip: AnimationClip): void;
    /**
     * Removes an animation clip and its corresponding action.
     * @param key - The identifier for the animation clip to remove.
     */
    removeAnimationClip(key: string): void;
    /**
     * Smoothly transitions to the specified animation action over a given duration.
     * @param key - The identifier for the animation action to transition to.
     * @param duration - The duration of the transition in seconds.
     * @param isOnce - (Optional) If true, the animation will play only once and stop at the last frame.
     */
    private _fadeToAction;
    /**
     * Updates the animation based on the current state of the player.
     */
    private _updateAnimation;
    /**
     * Updates the _mixer with the given delta time.
     * @param delta - The time increment in seconds.
     */
    update(delta: number): void;
    /**
     * Stops all actions and disposes of the _mixer.
     */
    dispose(): void;
}
export default PhysicsCharacterControls;
