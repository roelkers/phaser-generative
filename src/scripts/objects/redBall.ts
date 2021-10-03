import Ball, { SynthConfig } from "./ball"

const ATTACK = 0.033187402641826
const RELEASE = .04255409284924679
const ENV = ATTACK + RELEASE


export default class RedBall extends Ball {
  duration: number 

  constructor(scene, x, y) {
    super(scene, x, y, 'skull')
    scene.add.existing(this)
    scene.physics.add.existing(this)
    this.duration = ENV
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
          attack: ATTACK,
          release: RELEASE
        }
      }
    }
    this.config = config 
    this.config[0].params.scaleNoteIndex = 0 

    this.setCollideWorldBounds(true)
      .setBounce(0.7)
      .setImmovable(true)
  }
}
