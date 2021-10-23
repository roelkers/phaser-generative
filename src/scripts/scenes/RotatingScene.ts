import { Scale } from "@tonaljs/tonal"
import createVirtualAudioGraph, { convolver, dynamicsCompressor } from 'virtual-audio-graph'
import { IVirtualAudioNodeGraph } from "virtual-audio-graph/dist/types"
import VirtualAudioGraph from "virtual-audio-graph/dist/VirtualAudioGraph"
import outputNode from "../../nodeCreators/outputNode"
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from "../game"
import Ball from "../objects/ball"
import BlueBall from "../objects/blueBall"
import RedBall from "../objects/redBall"
import YellowBall from "../objects/yellowBall"

const pegCount = 16;
const x0 = 640;
const y0 = 360;
const sin = Math.sin
const cos = Math.cos

export default class RotatingScene extends Phaser.Scene {

  width: number;
  height: number;
  m: number 
  redBalls:  Phaser.GameObjects.Group
  blueBalls:  Phaser.GameObjects.Group
  yellowBalls:  Phaser.GameObjects.Group
  virtualAudioGraph: VirtualAudioGraph
  tonalScale: string[]
  irBuffer : any
  circle: Phaser.Geom.Circle
  wheel: MatterJS.BodyType
  pegs: MatterJS.BodyType[] = [] 
  currentRotation = 0
  pegSprites: Phaser.GameObjects.Image[] = []
  arcSprites: Phaser.GameObjects.Image[] = []

  constructor() {
    super({ key: 'MainScene' })
    this.tonalScale = Scale.get("A major").notes
    this.width = DEFAULT_WIDTH;
    this.height = DEFAULT_HEIGHT;
    this.m = Math.min(this.width, this.height);
  }

  drawWheel(addedAngle: number) {
    const rat = 1 / 5 * 2;
    const r = this.m * rat;
    const TAU = Phaser.Math.PI2
    
    for(let i = 0; i < pegCount; i++) {
      let arcSprite = this.arcSprites[i]  
      let pegSprite = this.pegSprites[i]  
      const segment = TAU / pegCount;
      const angle = i / pegCount * TAU + addedAngle;
      const angle2 = i / pegCount * TAU + segment / 2 + addedAngle;
      const x = cos(angle);
      const y = sin(angle);
      const x2 = cos(angle2);
      const y2 = sin(angle2);
      const cx = x0 + x * r;
      const cy = y0 + y * r;
      const cx2 = x0 + x2 * r;
      const cy2 = y0 + y2 * r;
      pegSprite.setPosition(cx, cy)
      arcSprite.setPosition(cx2, cy2)
      pegSprite.setRotation(angle)
      arcSprite.setRotation(angle2)
    }
  }

  createWheel() {
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
      this.pegs.push(rectangle)
      parts.push(rectangle as never)
      parts.push(arc as never)
	  }
	
   	this.wheel = Body.create({ parts , isStatic: true });
  }

  addBallGroupCollider(group : Phaser.GameObjects.Group, ball: Ball) {
    for(let obj of group.getChildren()) {
      const body = obj.body as MatterJS.BodyType
      body.setOnCollideWith(ball.body as MatterJS.BodyType, () => {
        if (!this.virtualAudioGraph || !ball) {
          return
        }
        const { currentTime } = this.virtualAudioGraph 
        this.updateAudioGraph()
        ball.hit(currentTime)
        ball.setTint(0x007700)
        this.time.addEvent({ delay: 200, callback: () => ball.setTint(undefined) })
      })
    }
  }

  addColliders(triggeringGroup: Phaser.GameObjects.Group, hitGroup: Phaser.GameObjects.Group) {
    for(let obj of hitGroup.getChildren()) {
      this.addBallGroupCollider(triggeringGroup, obj as Ball)
    }
  }

  create() {
    for(let i = 0; i < pegCount; i++) {
      this.pegSprites.push(this.add.image(0, 0 ,'rect1'))
      this.arcSprites.push(this.add.image(0, 0 ,'rect2'))
    }
    this.irBuffer = this.cache.audio.get('reverb_ir')
    this.redBalls = this.add.group()
    this.yellowBalls = this.add.group()
    this.blueBalls = this.add.group()
    this.createWheel()
    for(let index = 0; index < 15; index++) {
      const randomAngle = Math.random() * Phaser.Math.PI2
      const xB = x0 + cos(randomAngle) * this.m * 1/5
      const yB = y0 + sin(randomAngle) * this.m * 1/5
      let ball : Ball | undefined
      if(index % 3 === 1) {
        ball = new RedBall(this,xB,yB)
        this.redBalls.add(ball)
      }
      if(index % 3 === 2) {
        ball = new BlueBall(this,xB,yB)
        this.blueBalls.add(ball)
      }
      if(index % 3 === 0) {
        ball = new YellowBall(this,xB,yB)
        this.yellowBalls.add(ball)
      }
      if(!ball) continue 
      ball.setCircle(16)
      // for(let peg of this.pegs) {
      //   peg.setOnCollideWith(ball.body as MatterJS.BodyType, () => {
      //     if (!this.virtualAudioGraph || !ball) {
      //       return
      //     }
      //     const { currentTime } = this.virtualAudioGraph 
      //     this.updateAudioGraph()
      //     ball.hit(currentTime)
      //   })
      // }
    }
    this.addColliders(this.redBalls, this.blueBalls)
    this.addColliders(this.blueBalls, this.yellowBalls)
    this.addColliders(this.yellowBalls, this.redBalls)
    
    this.drawWheel(0);

    this.input.once('pointerdown', async () => {
      const w = window as any
      const AudioContext = window.AudioContext || w.webkitAudioContext;
      this.virtualAudioGraph = createVirtualAudioGraph({ audioContext : new AudioContext })
      const context = this.virtualAudioGraph.audioContext
      context.resume()
    })
  }

  update() {
    this.currentRotation+= 0.02
    this.matter.body.rotate(this.wheel, 0.02)
    this.drawWheel(this.currentRotation);
  }

  updateAudioGraph() {
    if (!this.virtualAudioGraph || !this.irBuffer) {
      return
    }
    const { currentTime } = this.virtualAudioGraph
    const balls = [
      ...this.redBalls.getChildren(),
      ...this.yellowBalls.getChildren(),
      ...this.blueBalls.getChildren()
    ] as Ball[]

    let update = Object.assign({}, {
      1: dynamicsCompressor('output', {
        attack: 0.01,
        knee: 40,
        ratio: 10,
        release: -0.3,
        threshold: -50, 
      }),
      2: dynamicsCompressor('1', {
        attack: 0.01,
        knee: 40,
        ratio: 50,
        release: -0.3,
        threshold: -50, 
      }),
      3: convolver('2', {
        buffer: this.irBuffer,
        normalize: false
      })
    })
    update = balls
    .reduce((acc, ball: Ball, i) => {
      const startTime = ball.startTime
      if(ball.startTime && currentTime < ball.startTime + ball.duration) {
        Object.assign(acc, { [i+4]: outputNode(['3','2'], { audio: ball.config, startTime, scale: this.tonalScale, noiseWorkletNode: this }) }) as unknown as IVirtualAudioNodeGraph
      }
     return acc
    },update)
    this.virtualAudioGraph.update(update)
  }
}
