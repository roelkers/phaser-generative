export default class Skull extends Phaser.Physics.Arcade.Sprite {
  startTime: number

  constructor(scene, x, y) {
    super(scene, x, y, 'skull')
    scene.add.existing(this)
    scene.physics.add.existing(this)

    this.setCollideWorldBounds(true)
      .setBounce(0.7)
      .setImmovable(true)
  }

  hit(time: number) {
    this.startTime = time
  }
}
