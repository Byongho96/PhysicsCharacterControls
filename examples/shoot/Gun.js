class Gun {
  constructor(name, object, damage = 10, fireRate = 10) {
    this._name = name;
    this._object = object;
    this._damage = damage;
    this._fireRate = fireRate; // 발사 속도 (초당 발사 가능 횟수)
    this._lastShotTime = 0;

    // 총기 렌더링 최상단에 위치하도록 설정
    object.renderOrder = 1;
    object.traverse(child => {
      if (child.isMesh) {
        child.material.depthTest = false;
      }
    });
  }

  get name() {
    return this._name;
  }

  get object() {
    return this._object;
  }

  set object(newObject) {
    this._object = newObject;
  }

  get damage() {
    return this._damage;
  }

  get fireRate() {
    return this._fireRate;
  }

  get position() {
    return this._object.position;
  }

  shoot(target) {
    const currentTime = Date.now();

    if (currentTime - this._lastShotTime < 1000 / this._fireRate) {
      console.log(`${this._name}은(는) 아직 발사 준비 중입니다.`);
      return;
    }

    console.log(`${this._name}이(가) 발사되었습니다. 공격력: ${this._damage}`);
    target.hit(this._damage);

    this._lastShotTime = currentTime;
  }
}

export { Gun };
