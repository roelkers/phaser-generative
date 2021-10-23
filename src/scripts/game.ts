import 'phaser'
import RockSkullScene from './scenes/RockSkullScene'
import PreloadScene from './scenes/preloadScene'
import SelectionScene from './scenes/SelectionScene'
import RotatingScene from './scenes/RotatingScene'

export const DEFAULT_WIDTH = 1280
export const DEFAULT_HEIGHT = 720

const config = {
  type: Phaser.AUTO,
  backgroundColor: '#ffffff',
  scale: {
    parent: 'phaser-game',
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT
  },
  scene: [PreloadScene, SelectionScene, RockSkullScene, RotatingScene],
  physics: {
    arcade: {
      gravity:{}
    },
    matter: {
      gravity:{ y : 0.7 }
    }
  }
}

window.addEventListener('load', () => {
  const game = new Phaser.Game(config)
})
