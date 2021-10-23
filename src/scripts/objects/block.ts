
export default class Block extends Phaser.Physics.Arcade.Sprite {

  constructor(scene, x, y) {
    super(scene, x, y, 'block')
    scene.add.existing(this)
    scene.physics.add.existing(this)
    this.setImmovable(true) //setBounce(0,1)
  }
}
