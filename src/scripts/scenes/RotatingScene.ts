import { Scale } from "@tonaljs/tonal"
import createVirtualAudioGraph, { convolver, dynamicsCompressor } from 'virtual-audio-graph'
import { IVirtualAudioNodeGraph } from "virtual-audio-graph/dist/types"
import VirtualAudioGraph from "virtual-audio-graph/dist/VirtualAudioGraph"
import outputNode from "../../nodeCreators/outputNode"
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from "../game"
import Ball from "../objects/ball"
import RedBall from "../objects/redBall"

export default class RotatingScene extends Phaser.Scene {

  redBalls:  Phaser.GameObjects.Group
  virtualAudioGraph: VirtualAudioGraph
  tonalScale: string[]
  irBuffer : any
  circle: Phaser.Geom.Circle
  wheel: MatterJS.BodyType

  constructor() {
    super({ key: 'MainScene' })
    this.tonalScale = Scale.get("Ab minor").notes
  }

  createWheel() {
    const x0 = 640;
    const y0 = 360;
    let pegCount = 16;
    let pegSize = 40;
    let maximumBalls = 200;
    let w = 750;
    let h = 900;
    let countX = 10;
    let countY = 20;
    const width = DEFAULT_WIDTH;
    const height = DEFAULT_HEIGHT;
    let m = Math.min(width, height);
    let rat = 1 / 5 * 2;
    let r = m * rat;
    const TAU = Phaser.Math.PI2
    const sin = Math.sin
    const cos = Math.cos
    const Body = this.matter.body
    
    let parts = [];
    
    for(let i = 0; i < pegCount; i++) {
      let segment = TAU / pegCount;
      let angle = i / pegCount * TAU;
      let angle2 = i / pegCount * TAU + segment / 2;
      let x = cos(angle);
      let y = sin(angle);
      let x2 = cos(angle2);
      let y2 = sin(angle2);
      let cx = x0 + x * r;
      let cy = y0 + y * r;
      let cx2 = x0 + x2 * r;
      let cy2 = y0 + y2 * r;
      const rectangle = this.matter.add.rectangle(cx, cy, 120 / 1000 * m, 30 / 1000 * m, { angle: angle, ignoreGravity: true, isStatic: true })
      const arc = this.matter.add.rectangle(cx2, cy2, 30 / 1000 * m, 150 / 1000 * m, { angle: angle2, ignoreGravity: true, isStatic: true })
      
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
    for(let index = 0; index < 1; index++) {
      //const point = this.circle.getRandomPoint()
      //const red = new RedBall(this,point.x,point.y)
      const red = new RedBall(this,400,500)
      red.setCircle(16)
      this.redBalls.add(red)
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

