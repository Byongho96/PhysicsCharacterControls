import { Gun } from './Gun.js';

class HandGun extends Gun {
  constructor(object, damage = 50, fireRate = 2) {
    super('hand_gun', object, damage, fireRate);

    this.object.position.set(1, -1, -2);
    this.object.rotation.set(0, -3, 0);
    this.object.scale.set(0.06, 0.06, 0.06);
  }
}
export { HandGun };
