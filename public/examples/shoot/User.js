class User {
  constructor(object, collider, hp = 100, gun) {
    this.object = object;
    this.collider = collider;
    this.hp = hp;
    this._gun = gun;

    this.equipGun(this._gun);
  }

  get gun() {
    return this._gun;
  }

  set gun(newGun) {
    this.equipGun(newGun);
  }

  hit(damage) {
    this.hp -= damage;
    console.log(`공격을 받았습니다. 남은 HP: ${this.hp}`);
    if (this.hp <= 0) {
      this.hp = 0;
      console.log(`쓰러졌습니다.`);
    }
  }

  attack(target) {
    if (this.gun) {
      console.log(`${this.gun.name}로 공격을 시작합니다.`);
      this.gun.shoot(target);
    } else {
      console.log(`무기가 없습니다.`);
    }
  }

  equipGun(newGun) {
    if (this._gun.object) {
      this.object.remove(this._gun.object);
    }

    this._gun = newGun;

    this.object.add(this._gun.object);
    console.log(`${newGun.name}을(를) 장착했습니다.`);
  }
}

export { User };
