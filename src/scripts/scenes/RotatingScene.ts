import { Scale } from "@tonaljs/tonal"
import createVirtualAudioGraph, { convolver, dynamicsCompressor } from 'virtual-audio-graph'
import { IVirtualAudioNodeGraph } from "virtual-audio-graph/dist/types"
import VirtualAudioGraph from "virtual-audio-graph/dist/VirtualAudioGraph"
import outputNode from "../../nodeCreators/outputNode"
import Ball from "../objects/ball"

export default class RockSkullScene extends Phaser.Scene {

  redBalls:  Phaser.GameObjects.Group
  virtualAudioGraph: VirtualAudioGraph
  tonalScale: string[]
  irBuffer : any

  constructor() {
    super({ key: 'MainScene' })
    this.tonalScale = Scale.get("Ab minor").notes
  }

  create() {
    this.irBuffer = this.cache.audio.get('reverb_ir')

    this.input.once('pointerdown', async () => {
      const w = window as any
      const AudioContext = window.AudioContext || w.webkitAudioContext;
      this.virtualAudioGraph = createVirtualAudioGraph({ audioContext : new AudioContext })
      const context = this.virtualAudioGraph.audioContext
      context.resume()
    })
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
        Object.assign(acc, { [i+1]: outputNode(['2'], { audio: ball.config, startTime, scale: this.tonalScale, noiseWorkletNode: this }) }) as unknown as IVirtualAudioNodeGraph
      }
     return acc
    },update)
    this.virtualAudioGraph.update(update)
  }
}

