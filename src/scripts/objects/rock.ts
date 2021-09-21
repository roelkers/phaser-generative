import Pointer from "./pointer"

export default class Rock extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'rock')
    scene.add.existing(this)
    scene.physics.add.existing(this)

    this.setCollideWorldBounds(true)
      .setBounce(0.9)

    this.anims.create({
      key: 'roll',
      repeat: -1,
      frameRate: 20,
      frames: this.anims.generateFrameNumbers('rock', {
        start: 0,
        end: 11,
        first: 11,
      })
    })
  }
}
