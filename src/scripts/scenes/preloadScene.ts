export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' })
  }

  preload() {
    this.load.spritesheet('rock', 'assets/img/rock_round.png', {
      frameWidth: 32, frameHeight: 32, endFrame: 12 
    })
    this.load.image('ball', 'assets/img/redorb.png');
    this.load.image('skull', 'assets/img/goldskull.png')
    this.load.audio('reverb_ir', 'assets/wav/NancyLakeTunnel.wav')
    this.load.image('block', 'assets/img/block.png')
    this.load.image('ring', 'assets/img/Ring.png')
    this.load.json('ring_collision', 'assets/physics/ring_collision.json')
    this.load.image('rect1', 'assets/img/rect1.png')
    this.load.image('rect2', 'assets/img/rect2.png')
  }

  create() {
    this.scene.start('MainScene')
  }
}
