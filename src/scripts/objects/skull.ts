import { SynthConfig } from "../scenes/mainScene"

const SKULL_ATTACK = 0.033187402641826
const SKULL_RELEASE = .04255409284924679
const SKULL_ENV = SKULL_ATTACK + SKULL_RELEASE


export default class Skull extends Phaser.Physics.Arcade.Sprite {
  startTime: number
  duration: number 
  config: SynthConfig;

  constructor(scene, x, y) {
    super(scene, x, y, 'skull')
    scene.add.existing(this)
    scene.physics.add.existing(this)
    this.duration = SKULL_ENV
    const noteSelection = [0,2,3,4,6]
    const randomIndex = Math.round(Math.random() * 4)
    const config: SynthConfig = {
      '0': {
        nodeCreator: 'osc',
        output: '1',
        params: {
          scaleNoteIndex: 2,
          octave: 3,
          type: 'sawtooth',
          attack: 0.0347923344020317,
          release: 0.2704998375324057,
          envFrequencyAmount: 0.03
        }
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
          gain: 0.05160151470036647,
          attack: SKULL_ATTACK,
          release: SKULL_RELEASE
        }
      }
    }
    this.config = config 
    this.config[0].params.scaleNoteIndex = noteSelection[randomIndex]
    this.config[0].params.octave = 2 + Math.round(Math.random() * 3)
    this.config[1].params.envAmount += 1000 * Math.random()

    this.setCollideWorldBounds(true)
      .setBounce(0.7)
      .setImmovable(true)
  }

  hit(time: number) {
    if(this.startTime + this.duration > time) {
      return 
    }
    this.startTime = time
  }
}
