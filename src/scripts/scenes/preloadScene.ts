export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' })
  }

  preload() {
    this.load.spritesheet('rock', 'assets/img/rock_round.png', {
      frameWidth: 32, frameHeight: 32, endFrame: 12 
    })
    this.load.image('skull', 'assets/img/goldskull.png')
    this.load.image('pointer', 'assets/img/ornamented_arrow.png')
    this.load.audio('reverb_ir', 'assets/wav/CathedralRoom.wav')
  }

  create() {
    this.scene.start('MainScene')
  }
}
