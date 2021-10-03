import { AudioConfig } from "../../nodeCreators/outputNode"

export interface SynthConfig {
  0: AudioConfig<'osc'>,
  1: AudioConfig<'filter'>,
  2: AudioConfig<'arEnvelope'>
 } 

export default class Ballll extends Phaser.Physics.Arcade.Sprite {
  startTime: number
  duration: number 

  hit(time: number) {
    if(this.startTime + this.duration > time) {
      return 
    }
    this.startTime = time
  }
}
