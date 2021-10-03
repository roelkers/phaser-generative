import { AudioConfig } from "../../nodeCreators/outputNode"

const ATTACK = 0.033187402641826
const RELEASE = .04255409284924679
const ENV = ATTACK + RELEASE

export interface RockSynthConfig {
  0: AudioConfig<'noiseOsc'>,
  1: AudioConfig<'filter'>,
  2: AudioConfig<'arEnvelope'>
 } 

export default class Rock extends Phaser.Physics.Arcade.Sprite {
  startTime: number
  duration: number 
  config: RockSynthConfig;

  constructor(scene, x, y) {
    super(scene, x, y, 'rock')
    scene.add.existing(this)
    scene.physics.add.existing(this)
    this.duration = ENV

    this.setCollideWorldBounds(true)
      .setBounce(0.9)

    const config: RockSynthConfig = {
      '0': {
        nodeCreator: 'noiseOsc',
        output: '1',
        params: { }
      },
      '1': {
        nodeCreator: 'filter',
        output: '2',
        params: {
          resonance: 2.5860000992947785,
          attack: 0.63332941456034035,
          release: 0.5099644507332475,
          frequency: 175.93633973762812,
          type: 'lowpass',
          envAmount: 300.4825904816633
        }
      },
      '2': {
        nodeCreator: 'arEnvelope',
        output: 'output',
        params: {
          gain: 0.0160151470036647,
          attack: ATTACK,
          release: RELEASE
        }
      }
    }
    this.config = config 

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

  hit(time: number) {
    if(this.startTime + this.duration > time) {
      return 
    }
    this.startTime = time
  }
}
