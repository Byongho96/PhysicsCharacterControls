import { Vector3 } from 'three';
import { Capsule } from 'three/examples/jsm/math/Capsule.js';

class ColliderCapsule extends Capsule {
  constructor(start?: Vector3, end?: Vector3, radius?: number) {
    super(start, end, radius);
  }

  get height() {
    return this.start.distanceTo(this.end) + 2 * this.radius;
  }
}

export { ColliderCapsule };
