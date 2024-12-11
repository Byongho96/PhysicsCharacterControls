class Gun {
  constructor(name, object, damage = 10, fireRate = 1) {
    this.name = name;
    this.object = object;
    this.damage = damage;
    this.fireRate = fireRate; // 발사 속도 (초당 발사 가능 횟수)
    this.lastShotTime = 0;

    // 총기 렌더링 최상단에 위치하도록 설정
    object.renderOrder = 1;
    object.traverse(child => {
      if (child.isMesh) {
        child.material.depthTest = false;
      }
    });
  }

  get position() {
    return this.object.position;
  }

  shoot(target) {
    const currentTime = Date.now();

    if (currentTime - this.lastShotTime < 1000 / this.fireRate) {
      console.log(`${this.name}은(는) 아직 발사 준비 중입니다.`);
      return;
    }

    console.log(`${this.name}이(가) 발사되었습니다. 공격력: ${this.damage}`);
    target.hit(this.damage);

    this.lastShotTime = currentTime;
  }

  status() {
    console.log(
      `총기 이름: ${this.name}, 공격력: ${this.damage}, 오디오 상태: ${this.audio ? '초기화됨' : '초기화되지 않음'}`,
    );
  }
}

export { Gun };
