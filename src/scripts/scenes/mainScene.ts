import VirtualAudioGraph from "virtual-audio-graph/dist/VirtualAudioGraph"
import createVirtualAudioGraph, { gain, oscillator } from 'virtual-audio-graph'
import Rock from "../objects/rock"
import Skull from "../objects/skull"
import outputNode, { AudioConfig } from "../../nodeCreators/outputNode"
import { IVirtualAudioNodeGraph } from "virtual-audio-graph/dist/types"
import { Scale } from "@tonaljs/tonal"
import Pointer from "../objects/pointer"


export interface SynthConfig {
  0: AudioConfig<'osc'>,
  1: AudioConfig<'filter'>,
  2: AudioConfig<'arEnvelope'>
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
        const velocity = rock.body.velocity
        if(this.isStill(velocity)) {
          this.pointer.setVisible(true)
        }
      })
    }
    this.input.on('pointermove', (current) => {
      if(!this.selectedRock) {
         return
      }
      const angle = Phaser.Math.Angle.BetweenPoints(current, this.selectedRock) - Phaser.Math.PI2/4
      this.pointer.rotation = angle 
    })
    this.input.on('pointerup', () => {
      const velocity = this.selectedRock?.body.velocity
      if(!velocity || !this.isStill(velocity)) {
        return
      }
      this.physics.velocityFromRotation(this.pointer.rotation - Phaser.Math.PI2/4, 200, this.selectedRock?.body.velocity)
      this.pointer.setVisible(false)
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
  isStill(velocity : Phaser.Math.Vector2) {
    return Math.round(velocity.x) === 0 && Math.round(velocity.y) === 0
  }

  update() {
    this.physics.world.collide(this.rocks)
    this.updateAudioGraph()
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
      if(currentTime < skull.startTime + skull.duration) {
        Object.assign(acc, { [i]: outputNode('output', { audio: skull.config, startTime, scale: this.tonalScale }) }) as unknown as IVirtualAudioNodeGraph
      }
      
     return acc
    },{})
    this.virtualAudioGraph.update(update)
  }
}

