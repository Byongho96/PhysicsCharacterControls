class User {

  constructor(object, collider, hp = 100, gun) {
    this.object = object;
    this.collider = collider; 
    this.hp = hp;
    this._gun : Gun | null = gun;

    this.replaceGun(this._gun);
  }

  get gun() {
    return this._gun;
  }

  set gun(newGun) {
    this.replaceGun(newGun);
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

  replaceGun(newGun) {
    this.object.remove(this._gun);

    this._gun = newGun;

    this._gun.position.set(0.7, -1, -2);
    this.object.add(this._gun.object);
  }

  status() {
    console.log(`HP: ${this.hp}, 무기: ${this.gun ? this.gun.name : '무기 없음'}`);
  }
}

export { User };
