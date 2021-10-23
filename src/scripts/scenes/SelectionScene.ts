
export default class SelectionScene extends Phaser.Scene {
  title: Phaser.GameObjects.Text;
  hint1: Phaser.GameObjects.Text;
  hint2: Phaser.GameObjects.Text;

  constructor() {
    super({
      key: "MainScene"
    });
  }
  create() {
    const titleText: string = "Welcome.";
    this.title = this.add.text(100, 100, titleText,
      { font: '64px Arial Bold', color: '#222222'  });
    this.hint1 = this.add.text(200, 250, "Exhibit1",
      { font: '80px Arial Bold', color: '#222222'  }).setInteractive()
    this.hint1.on('pointerdown', () => {
      this.scene.start("RockSkullScene");
    }, this);
    this.hint2 = this.add.text(200, 400, "Exhibit2",
      { font: '80px Arial Bold', color: '#222222'  }).setInteractive()
    this.hint2.on('pointerdown', () => {
      this.scene.start("RotatingScene");
    }, this);
    this.add.text(200, 600, 'In each exhibit, please press the screen once to enable the sound.', 
      { font: '30px Arial Bold', color: '#222222'  }
    )
  }
}
