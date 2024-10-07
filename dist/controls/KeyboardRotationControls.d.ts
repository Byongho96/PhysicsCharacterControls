import { AnimationClip, Camera, Object3D, Vector3 } from 'three';
import { PhysicsControls, PhysicsOptions } from './PhysicsControls';
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
declare class KeyboardRotationControls extends PhysicsControls {
    private _characters;
    camera: Camera | null;
    cameraPosOffset: Vector3 | null;
    cameraLookAtOffset: Vector3 | null;
    keyOptions: KeyOptions;
    jumpForce: number;
    groundMoveSpeed: number;
    floatMoveSpeed: number;
    rotateSpeed: number;
    transitionTime: number;
    fallSpeedThreshold: number;
    moveSpeedThreshold: number;
    _vector1: Vector3;
    _direction: Vector3;
    _onKeyDown: (event: KeyboardEvent) => void;
    _onKeyUp: (event: KeyboardEvent) => void;
    constructor(object: Object3D, domElement: HTMLElement | null, worldObject: Object3D, keyOptions: KeyOptions, cameraOptions?: CameraOptions, animationOptions?: AnimationOptions, physicsOptions?: KeyboardPhysicsOptions);
    getForwardVector(): Vector3;
    getSideVector(): Vector3;
    updateControls(delta: number): void;
    updateCamera(): void;
    updateAnimation(delta: number): void;
    update(delta: number): void;
    connect(): void;
    disconnect(): void;
}
export { KeyboardRotationControls };
