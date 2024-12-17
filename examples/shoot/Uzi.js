import { Gun } from './Gun.js';

class Uzi extends Gun {
  constructor(object, damage = 30, fireRate = 10) {
    super('uzi', object, damage, fireRate);

    this.object.position.set(1, -2, -2);
    this.object.rotation.set(0, 0, 0);
    this.object.scale.set(7, 7, 7);
  }
}

export { Uzi };
