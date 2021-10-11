import { Scale } from "@tonaljs/tonal"
import createVirtualAudioGraph, { convolver, dynamicsCompressor } from 'virtual-audio-graph'
import { IVirtualAudioNodeGraph } from "virtual-audio-graph/dist/types"
import VirtualAudioGraph from "virtual-audio-graph/dist/VirtualAudioGraph"
import outputNode from "../../nodeCreators/outputNode"
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from "../game"
import Ball from "../objects/ball"
import RedBall from "../objects/redBall"

const x0 = 640;
const y0 = 360;
const sin = Math.sin
const cos = Math.cos

export default class RotatingScene extends Phaser.Scene {

  width: number;
  height: number;
  m: number 
  redBalls:  Phaser.GameObjects.Group
  virtualAudioGraph: VirtualAudioGraph
  tonalScale: string[]
  irBuffer : any
  circle: Phaser.Geom.Circle
  wheel: MatterJS.BodyType

  constructor() {
    super({ key: 'MainScene' })
    this.tonalScale = Scale.get("Ab minor").notes
    this.width = DEFAULT_WIDTH;
    this.height = DEFAULT_HEIGHT;
    this.m = Math.min(this.width, this.height);
  }

  createWheel() {
    const pegCount = 16;
    const rat = 1 / 5 * 2;
    const r = this.m * rat;
    const TAU = Phaser.Math.PI2
    const Body = this.matter.body
    
    let parts = [];
    
    for(let i = 0; i < pegCount; i++) {
      const segment = TAU / pegCount;
      const angle = i / pegCount * TAU;
      const angle2 = i / pegCount * TAU + segment / 2;
      const x = cos(angle);
      const y = sin(angle);
      const x2 = cos(angle2);
      const y2 = sin(angle2);
      const cx = x0 + x * r;
      const cy = y0 + y * r;
      const cx2 = x0 + x2 * r;
      const cy2 = y0 + y2 * r;
      const rectangle = this.matter.add.rectangle(cx, cy, 120 / 1000 * this.m, 30 / 1000 * this.m, { angle: angle, ignoreGravity: true, isStatic: true })
      const arc = this.matter.add.rectangle(cx2, cy2, 30 / 1000 * this.m, 150 / 1000 * this.m, { angle: angle2, ignoreGravity: true, isStatic: true })
      
      // let circ = addRect({ x: cx, y: cy, w: 120 / 1000 * m, h: 30 / 1000 * m, options: { angle: angle, isStatic: true } });
      // let rect = addRect({ x: cx2, y: cy2, w: 30 / 1000 * m, h: 150 / 1000 * m, options: { angle: angle2, isStatic: true } });
      // const rect = this.matter.add.gameObject(rectangle, { isStatic: true })
      // const circ = this.matter.add.gameObject(arc, { isStatic: true })
      // rectangle.setRotation(angle)
      // arc.setRotation(angle2)
      parts.push(rectangle as never)
      parts.push(arc as never)
	  }
	
   	this.wheel = Body.create({ parts , isStatic: true });
    //this.matter.composite.add(this.matter.world,parts)
    //Body.setAngularVelocity(this.wheel, 100)
    //Body.setPosition(wheel, {x : x0,y : y0 })
  }

  create() {
    this.irBuffer = this.cache.audio.get('reverb_ir')
    this.redBalls = this.add.group()
    this.createWheel()
    for (let Vjj = 0; Vjj < array.length; Vjj++) {
      const element = array[Vjj];
      
    }
    for(let index = 0; index <= 16; index++) {
      const randomAngle = Math.random() * Phaser.Math.PI2
      const xB = x0 + cos(randomAngle) * this.m * 1/5
      const yB = y0 + sin(randomAngle) * this.m * 1/5
      let ball : Ball | undefined
      console.log(index % 4 === 1 )
      console.log(index)
      if(index % 4 === 1) {
        ball = new RedBall(this,xB,yB)
        console.log(xB)
        console.log(yB)
      }
      if(!ball) return
      ball.setCircle(16)
      this.redBalls.add(ball)
    }
    

    this.input.once('pointerdown', async () => {
      const w = window as any
      const AudioContext = window.AudioContext || w.webkitAudioContext;
      this.virtualAudioGraph = createVirtualAudioGraph({ audioContext : new AudioContext })
      const context = this.virtualAudioGraph.audioContext
      context.resume()
    })
  }

  update() {
    this.matter.body.rotate(this.wheel, 0.02)
  }

  updateAudioGraph() {
    if (!this.virtualAudioGraph || !this.irBuffer) {
      return
    }
    const { currentTime } = this.virtualAudioGraph
    const filteredSkulls = this.redBalls.getChildren().concat(this.redBalls.getChildren()) as Ball[]

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
    .reduce((acc, ball: Ball, i) => {
      const startTime = ball.startTime
      if(ball.startTime && currentTime < ball.startTime + ball.duration) {
        Object.assign(acc, { [i+1]: outputNode(['1'], { audio: ball.config, startTime, scale: this.tonalScale, noiseWorkletNode: this }) }) as unknown as IVirtualAudioNodeGraph
      }
     return acc
    },update)
    this.virtualAudioGraph.update(update)
  }
}

