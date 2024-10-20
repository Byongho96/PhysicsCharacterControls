import { Vector3 } from 'three';
import { Capsule } from 'three/examples/jsm/math/Capsule.js';
declare class ColliderCapsule extends Capsule {
    constructor(start?: Vector3, end?: Vector3, radius?: number);
    get height(): number;
}
export { ColliderCapsule };
