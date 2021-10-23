import { AudioConfig } from "../../nodeCreators/outputNode"

export interface SynthConfig {
  0: AudioConfig<'osc'>,
  1: AudioConfig<'filter'>,
  2: AudioConfig<'arEnvelope'>
 } 

export default class Ball extends Phaser.Physics.Matter.Sprite {
  startTime: number
  duration: number 
  config: SynthConfig;
  hitsA: number = 0
  hitsB: number = 0
  hitsC: number = 0
  hitsD: number = 0

  hit(time: number) {
    if(this.startTime + this.duration > time) {
      return 
    }
    this.hitsA += 1
    this.hitsB += 1
    this.hitsC += 1
    this.hitsD += 1
    if(this.hitsD > 3) {
      this.hitsD = 0
      const release = 0.10 * Math.random();
      this.config[2].params.release = release 
      this.config[0].params.release = release
    }
    if(this.hitsA > 10) {
      this.hitsA = 0
      this.config[1].params.frequency += 200 * Math.random()
    }
    if(this.hitsB > 25) {
      this.config[0].params.scaleNoteIndex = Math.floor(Math.random() * 7) 
      this.hitsB = 0
    }
    if(this.hitsC > 50) {
      this.hitsC = 0
      //reset filter
      this.config[1].params.frequency = 200 
    }
    this.startTime = time
  }
}
