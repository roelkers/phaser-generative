import { Scale } from "@tonaljs/tonal"
import createVirtualAudioGraph, { convolver, createWorkletNode, dynamicsCompressor } from 'virtual-audio-graph'
import { IVirtualAudioNodeGraph } from "virtual-audio-graph/dist/types"
import VirtualAudioGraph from "virtual-audio-graph/dist/VirtualAudioGraph"
import outputNode from "../../nodeCreators/outputNode"
import Block from "../objects/block"
import Rock from "../objects/rock"
import Skull from "../objects/skull"

export default class RockSkullScene extends Phaser.Scene {

  skulls: Phaser.GameObjects.Group
  rocks:  Phaser.GameObjects.Group
  blocks:  Phaser.GameObjects.Group
  virtualAudioGraph: VirtualAudioGraph
  tonalScale: string[]
  irBuffer : any
  noiseWorkletNode : any

  constructor() {
    super({ key: 'RockSkullScene' })
    this.tonalScale = Scale.get("Ab minor").notes
  }

  create() {
    this.irBuffer = this.cache.audio.get('reverb_ir'),
    this.skulls = this.add.group()
    for (let index = 0; index < 20; index++) {
      const randomX = Math.random() * this.cameras.main.width;
      const randomY = Math.random() * (this.cameras.main.height - 300) + 150;
      const skull = new Skull(this, randomX, randomY);
      this.skulls.add(skull)
    }
    this.rocks = this.add.group()
    for (let index = 0; index < 10; index++) {
      const randomX = Math.random() * this.cameras.main.width;
      const randomY = Math.random() * (this.cameras.main.height);
      const rock = new Rock(this, randomX, randomY).setVelocity(100,100).play('roll') 
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
      this.updateAudioGraph()
    })
    this.physics.world.addCollider(this.blocks, this.rocks)
    this.physics.world.addCollider(this.rocks, this.rocks, (rock1, rock2) => {
      let rock
      if(rock1 instanceof Rock) {
        rock = rock1
      }
      if (!this.virtualAudioGraph) {
        return
      }
      const { currentTime } = this.virtualAudioGraph
      // DISABLES ROCKS HITTING SOUND
      //rock.hit(currentTime) 
      this.updateAudioGraph()
    })

    this.input.once('pointerdown', async () => {
      const w = window as any
      const AudioContext = window.AudioContext || w.webkitAudioContext;
      this.virtualAudioGraph = createVirtualAudioGraph({ audioContext : new AudioContext })
      const context = this.virtualAudioGraph.audioContext
      await context.audioWorklet.addModule('public/noise.js').catch(e => console.log(e))
      this.noiseWorkletNode = createWorkletNode('noise')
      context.resume()
    })
  }

  changeBlockDirection() {
    const t = this as any
    const velY = (-1.0 * t.body.velocity.y || 200)
    t.setVelocity(0, velY) 
  }

  updateAudioGraph() {
    if (!this.virtualAudioGraph || !this.irBuffer) {
      return
    }
    const { currentTime } = this.virtualAudioGraph
    const filteredSkulls = this.skulls.getChildren().concat(this.rocks.getChildren()) as Skull[]

    let update = Object.assign({}, {
      1: dynamicsCompressor('output', {
        attack: 0.01,
        knee: 40,
        ratio: 4,
        release: 0.3,
        threshold: -50, 
      }),
      2: convolver('1', {
        buffer: this.irBuffer,
        normalize: false
      })
    })
    update = filteredSkulls
    .reduce((acc, skull: Skull, i) => {
      const startTime = skull.startTime
      if(skull.startTime && currentTime < skull.startTime + skull.duration) {
        Object.assign(acc, { [i+1]: outputNode(['2'], { audio: skull.config, startTime, scale: this.tonalScale, noiseWorkletNode: this.noiseWorkletNode }) }) as unknown as IVirtualAudioNodeGraph
      }
     return acc
    },update)
    this.virtualAudioGraph.update(update)
  }
}

