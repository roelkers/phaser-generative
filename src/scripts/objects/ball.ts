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

  hit(time: number) {
    if(this.startTime + this.duration > time) {
      return 
    }
    console.log("hit")
    this.startTime = time
  }
}
