import { Audio } from 'three';

class Gun {
  constructor(name, object, damage = 10) {
    this.name = name;
    this.object = object;
    this.damage = damage;
  }

  get position() {
    return this.object.position;
  }

  shoot(target) {
    if (this.audio) {
      this.audio.play();
    } else {
      console.warn('총기 오디오가 초기화되지 않았습니다.');
    }

    console.log(`${this.name}이(가) 발사되었습니다. 공격력: ${this.damage}`);
    target.takeDamage(this.damage);
  }

  status() {
    console.log(
      `총기 이름: ${this.name}, 공격력: ${this.damage}, 오디오 상태: ${this.audio ? '초기화됨' : '초기화되지 않음'}`,
    );
  }
}

export { Gun };
