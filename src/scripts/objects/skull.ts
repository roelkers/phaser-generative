import { SynthConfig } from "../scenes/mainScene"

const SKULL_ATTACK = 0.033187402641826
const SKULL_RELEASE = 0.2255409284924679
const SKULL_ENV = SKULL_ATTACK + SKULL_RELEASE

const config: SynthConfig = {
  '0': {
    nodeCreator: 'osc',
    output: '1',
    params: {
      scaleNoteIndex: 2,
      octave: 2,
      type: 'sawtooth',
      attack: 0.0347923344020317,
      release: 0.2704998375324057,
      envFrequencyAmount: 24.41
    }
  },
  '1': {
    nodeCreator: 'filter',
    output: '2',
    params: {
      resonance: 2.5860000992947785,
      attack: 0.43332941456034035,
      release: 0.3099644507332475,
      frequency: 175.93633973762812,
      type: 'lowpass',
      envAmount: 299.4825904816633
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

export default class Skull extends Phaser.Physics.Arcade.Sprite {
  startTime: number
  duration: number 
  config: SynthConfig;

  constructor(scene, x, y) {
    super(scene, x, y, 'skull')
    scene.add.existing(this)
    scene.physics.add.existing(this)
    this.duration = SKULL_ENV
    this.config = config 

    this.setCollideWorldBounds(true)
      .setBounce(0.7)
      .setImmovable(true)
  }

  hit(time: number) {
    this.startTime = time
  }
}
