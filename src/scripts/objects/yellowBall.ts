import Ball, { SynthConfig } from "./ball"

const ATTACK = 0.01
const RELEASE = 0.07
const ENV = ATTACK + RELEASE


export default class YellowBall extends Ball {
  duration: number 

  constructor(scene, x, y) {
    super(scene.matter.world, x, y, 'yellowball')
    scene.add.existing(this).setDisplaySize(32,32)
    this.setCircle(32)
    this.duration = ENV
    const config: SynthConfig = {
      '0': {
        nodeCreator: 'osc',
        output: '1',
        params: {
          scaleNoteIndex: 1,
          octave: 3,
          type: 'square',
          attack: ATTACK,
          release: RELEASE,
          envFrequencyAmount: 0.07
        }
      },
      '1': {
        nodeCreator: 'filter',
        output: '2',
        params: {
          resonance: 20.5860000992947785,
          attack: 0.001,
          release: 0.07,
          frequency: 175.93633973762812,
          type: 'lowpass',
          envAmount: 300.4825904816633
        }
      },
      '2': {
        nodeCreator: 'arEnvelope',
        output: 'output',
        params: {
          gain: 0.001,
          attack: ATTACK,
          release: RELEASE
        }
      }
    }
    this.config = config 
    this.config[0].params.scaleNoteIndex = 0 
  }
}
