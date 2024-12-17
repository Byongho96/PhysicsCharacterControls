class User {
  constructor(object, collider, hp = 100, gun) {
    this._object = object;
    this._collider = collider;
    this._hp = hp;
    this._gun = gun;

    this.equipGun(this._gun);
  }

  get hp() {
    return this._hp;
  }

  set hp(newHp) {
    if (newHp < 0) {
      newHp = 0;
    }
    this._hp = newHp;
  }

  get gun() {
    return this._gun;
  }

  set gun(newGun) {
    this.equipGun(newGun);
  }

  hit(damage) {
    this._hp -= damage;
    console.log(`공격을 받았습니다. 남은 HP: ${this._hp}`);
    if (this._hp <= 0) {
      this._hp = 0;
      console.log(`쓰러졌습니다.`);
    }
  }

  attack(target) {
    if (this._gun) {
      console.log(`${this._gun.name}로 공격을 시작합니다.`);
      this._gun.shoot(target);
    } else {
      console.log(`무기가 없습니다.`);
    }
  }

  equipGun(newGun) {
    if (this._gun.object) {
      this._object.remove(this._gun.object);
    }

    this._gun = newGun;

    this._object.add(this._gun.object);
    console.log(`${newGun.name}을(를) 장착했습니다.`);
  }
}

export { User };
