import VirtualAudioGraph from "virtual-audio-graph/dist/VirtualAudioGraph"
import createVirtualAudioGraph, { convolver, dynamicsCompressor, gain, oscillator } from 'virtual-audio-graph'
import Rock from "../objects/rock"
import Skull from "../objects/skull"
import outputNode, { AudioConfig } from "../../nodeCreators/outputNode"
import { IVirtualAudioNodeGraph } from "virtual-audio-graph/dist/types"
import { Scale } from "@tonaljs/tonal"
import pingPongDelay from "../../nodeCreators/pingPongDelay"
import Block from "../objects/block"

export interface SynthConfig {
  0: AudioConfig<'osc'>,
  1: AudioConfig<'filter'>,
  2: AudioConfig<'arEnvelope'>
 } 

export default class MainScene extends Phaser.Scene {

  skulls: Phaser.GameObjects.Group
  rocks:  Phaser.GameObjects.Group
  blocks:  Phaser.GameObjects.Group
  virtualAudioGraph: VirtualAudioGraph
  tonalScale: string[]
  irBuffer : any

  constructor() {
    super({ key: 'MainScene' })
    this.tonalScale = Scale.get("Ab minor").notes
  }

  create() {
    this.irBuffer = this.cache.audio.get('reverb_ir'),
    this.skulls = this.add.group()
    for (let index = 0; index < 20; index++) {
      const randomX = Math.random() * this.cameras.main.width;
      const randomY = Math.random() * (this.cameras.main.height - 300) + 150;
      const skull = new Skull(this, randomX, randomY);
      //const skull = new Skull(this, 500, 500); 
      this.skulls.add(skull)
    }
    this.rocks = this.add.group()
    for (let index = 0; index < 1; index++) {
      const randomX = Math.random() * this.cameras.main.width;
      const randomY = Math.random() * (this.cameras.main.height);
      const rock = new Rock(this, randomX, randomY).setVelocity(100,100).play('roll') 
      //const rock = new Rock(this, 500, 200).setVelocity(0,700)
      this.rocks.add(rock)
    }
    
    const nrBlocks = Math.round(1280 / 200) + 1
    let x: number = 0
    this.blocks = this.add.group()
    for (let index = 0; index < nrBlocks; index++) {
      const blockUpper = new Block(this, x, -250)
      const blockLower = new Block(this, x, 900)
      x += 200 
      const startAt = Math.random() * 200
      this.time.addEvent({ delay: 200, callback: this.changeBlockDirection, loop: true, callbackScope: blockUpper, startAt })
      this.time.addEvent({ delay: 200, callback: this.changeBlockDirection, loop: true, callbackScope: blockLower, startAt })
      this.blocks.add(blockUpper)
      this.blocks.add(blockLower)
    }
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
    this.physics.world.addCollider(this.blocks, this.rocks)
    this.input.once('pointerdown', async () => {
      const w = window as any
      const AudioContext = window.AudioContext || w.webkitAudioContext;
      this.virtualAudioGraph = createVirtualAudioGraph({ audioContext : new AudioContext })
      const context = this.virtualAudioGraph.audioContext
      context.resume()
    })
  }

  changeBlockDirection() {
    const t = this as any
    const velY = (-1.0 * t.body.velocity.y || 200)
    t.setVelocity(0, velY) 
  }

  update() {
    this.physics.world.collide(this.rocks)
    //this.physics.world.collide(this.blocks, this.rocks)
    this.updateAudioGraph()
  }

  updateAudioGraph() {
    if (!this.virtualAudioGraph || !this.irBuffer) {
      return
    }
    //this.virtualAudioGraph.update({})
    const { currentTime } = this.virtualAudioGraph
    const filteredSkulls = this.skulls.getChildren().filter((skull: any) => {
    return !!skull.startTime }) as Skull[]

    let update = Object.assign({}, {
      1: dynamicsCompressor('output', {
        attack: 0.1,
        knee: 40,
        ratio: 4,
        release: 0.3,
        threshold: -50, 
      }),
      // 2: pingPongDelay('1', {
      //   decay: 0.8,
      //   delayTime: 1.55,
      // }),
      // 2: convolver('1', {
      //   buffer: this.irBuffer,
      //   normalize: true
      // })
    })
    update = filteredSkulls
    .reduce((acc, skull: Skull, i) => {
      const startTime = skull.startTime
      if(currentTime < skull.startTime + skull.duration) {
        Object.assign(acc, { [i+1]: outputNode([1], { audio: skull.config, startTime, scale: this.tonalScale }) }) as unknown as IVirtualAudioNodeGraph
      }
     return acc
    },update)
    this.virtualAudioGraph.update(update)
  }
}

