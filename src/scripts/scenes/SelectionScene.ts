
export default class SelectionScene extends Phaser.Scene {
  title: Phaser.GameObjects.Text;
  hint: Phaser.GameObjects.Text;

  constructor() {
    super({
      key: "MainScene2"
    });
  }
  create() {
    const titleText: string = "Welcome.";
    this.title = this.add.text(200, 200, titleText,
      { font: '64px Arial Bold', color: '#222222'  });
    this.hint = this.add.text(300, 350, "Exhibit1",
      { font: '108px Arial Bold', color: '#222222'  }).setInteractive()
    this.hint.on('pointerdown', () => {
      this.scene.start("RockSkullScene");
    }, this);
  }

}
