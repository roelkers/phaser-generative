import VirtualAudioGraph from "virtual-audio-graph/dist/VirtualAudioGraph"
import createVirtualAudioGraph, { gain, oscillator } from 'virtual-audio-graph'
import Rock from "../objects/rock"
import Skull from "../objects/skull"
import outputNode, { AudioConfig } from "../../nodeCreators/outputNode"
import { IVirtualAudioNodeGraph } from "virtual-audio-graph/dist/types"
import { Scale } from "@tonaljs/tonal"
import Pointer from "../objects/pointer"

const SKULL_ATTACK = 0.033187402641826
const SKULL_RELEASE = 0.2255409284924679
const SKULL_ENV = SKULL_ATTACK + SKULL_RELEASE

interface SynthConfig {
  0: AudioConfig<'osc'>,
  1: AudioConfig<'filter'>,
  2: AudioConfig<'arEnvelope'>
 } 

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

export default class MainScene extends Phaser.Scene {

  skulls: Phaser.GameObjects.Group
  rocks:  Phaser.GameObjects.Group
  virtualAudioGraph: VirtualAudioGraph
  tonalScale: string[]
  pointer: Phaser.Physics.Arcade.Sprite
  selectedRock: Phaser.Physics.Arcade.Sprite | null = null

  constructor() {
    super({ key: 'MainScene' })
    this.tonalScale = Scale.get("C major").notes
  }

  create() {
    this.skulls = this.add.group()
    this.pointer = new Pointer(this, 200, 200)  
    for (let index = 0; index < 20; index++) {
      const randomX = Math.random() * this.cameras.main.width;
      const randomY = Math.random() * this.cameras.main.height;
      const skull = new Skull(this, randomX, randomY);
      //const skull = new Skull(this, 500, 500); 
      this.skulls.add(skull)
    }
    this.rocks = this.add.group()
    for (let index = 0; index < 20; index++) {
      const randomX = Math.random() * this.cameras.main.width;
      const randomY = Math.random() * this.cameras.main.height;
      const rock = new Rock(this, randomX, randomY)//.setVelocity(100,100).play('roll') 
      //const rock = new Rock(this, 500, 200).setVelocity(0,700)
      this.rocks.add(rock)
      rock.on('pointerdown', () => {
        this.pointer.setPosition(rock.x,rock.y) 
        this.selectedRock = rock 
      })
    }
    this.input.on('pointermove', (current) => {
      if(!this.selectedRock) {
         return
      }
      const angle = Phaser.Math.Angle.BetweenPoints(current, this.selectedRock) - Phaser.Math.PI2/4
      this.pointer.rotation = angle 
    })
    this.input.once('pointerdown', () => {
      const w = window as any
      const AudioContext = window.AudioContext || w.webkitAudioContext;
      this.virtualAudioGraph = createVirtualAudioGraph({ audioContext : new AudioContext })
      this.virtualAudioGraph.audioContext.resume()
    })
    this.physics.world.addCollider(this.skulls, this.rocks, (objA, objB) => {
      let skull
      if(objA instanceof Skull) {
        skull = objA
      }
      if(objB instanceof Skull) {
        skull = objB
      }
      if (!this.virtualAudioGraph) {
        return
      }
      const { currentTime } = this.virtualAudioGraph
      skull.hit(currentTime)
    })
  }

  update() {
    this.physics.world.collide(this.rocks)
    this.updateAudioGraph()
    const currentVel = this.selectedRock?.body.velocity
    if(currentVel?.x !== 0 || currentVel.y !== 0) {
      this.pointer.setVisible(false)
    } else {
      this.pointer.setVisible(false)
    }
  }

  updateAudioGraph() {
    if (!this.virtualAudioGraph) {
      return
    }
    //this.virtualAudioGraph.update({})
    const { currentTime } = this.virtualAudioGraph
    const filteredSkulls = this.skulls.getChildren().filter((skull: any) => {
    return !!skull.startTime }) as Skull[]
    const update = filteredSkulls
    .reduce((acc, skull: Skull, i) => {
      const startTime = skull.startTime
      if(currentTime < skull.startTime + SKULL_ENV) {
        Object.assign(acc, { [i]: outputNode('output', { audio: config, startTime, scale: this.tonalScale }) }) as unknown as IVirtualAudioNodeGraph
      }
     return acc
    },{})
    this.virtualAudioGraph.update(update)
  }
}

