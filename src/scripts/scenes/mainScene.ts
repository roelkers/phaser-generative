import VirtualAudioGraph from "virtual-audio-graph/dist/VirtualAudioGraph"
import createVirtualAudioGraph, { convolver, dynamicsCompressor, gain, oscillator } from 'virtual-audio-graph'
import Rock from "../objects/rock"
import Skull from "../objects/skull"
import outputNode, { AudioConfig } from "../../nodeCreators/outputNode"
import { IVirtualAudioNodeGraph } from "virtual-audio-graph/dist/types"
import { Scale } from "@tonaljs/tonal"
import Pointer from "../objects/pointer"
import pingPongDelay from "../../nodeCreators/pingPongDelay"
import buffer from '../../assets/wav/ByronGlacier.wav'


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
  irBuffer : any

  constructor() {
    super({ key: 'MainScene' })
    this.tonalScale = Scale.get("Ab minor").notes
  }

  create() {
    // this.irBuffer = this.cache.audio.get('reverb_ir'),
    // console.log(this.irBuffer)
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
    this.input.once('pointerdown', async () => {
      const w = window as any
      const AudioContext = window.AudioContext || w.webkitAudioContext;
      this.virtualAudioGraph = createVirtualAudioGraph({ audioContext : new AudioContext })
      const context = this.virtualAudioGraph.audioContext
      context.resume()
      let response     = await fetch(buffer as string);
      let arraybuffer  = await response.arrayBuffer();
      this.irBuffer = await context.decodeAudioData(arraybuffer);
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
    if (!this.virtualAudioGraph || !this.irBuffer) {
      return
    }
    console.log(buffer)
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
      2: convolver('1', {
        buffer: buffer,
        normalize: true
      })
    })
    update = filteredSkulls
    .reduce((acc, skull: Skull, i) => {
      const startTime = skull.startTime
      if(currentTime < skull.startTime + skull.duration) {
        Object.assign(acc, { [i+1]: outputNode([1,2], { audio: skull.config, startTime, scale: this.tonalScale }) }) as unknown as IVirtualAudioNodeGraph
      }
     return acc
    },update)
    this.virtualAudioGraph.update(update)
  }
}

