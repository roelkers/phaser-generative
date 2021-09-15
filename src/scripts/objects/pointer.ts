export default class Pointer extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'pointer')
    scene.add.existing(this)
    scene.physics.add.existing(this)
    //this.rotation = scene.physics.arcade.angleToPointer(this)

  }
}
