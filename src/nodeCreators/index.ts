import osc from './osc'
import filter from './filter'
import pingPongDelay, { PingPongConfig } from './pingPongDelay'
import attackReleaseOsc from './attackReleaseOsc'
import filter_simple from './filter_simple'
import outputGain, { outputGainConfig } from './outputGain'
import arEnvelope, { arEnvelopeConfig } from './arEnvelope'

import { FilterConfig } from './filter'
import { AttackReleaseOscConfig } from './attackReleaseOsc'
import { SimpleFilterConfig } from './filter_simple'
import { OscConfig } from '../nodeCreators/osc'
import noiseOsc, { NoiseOscConfig } from './noiseOsc'

export type NodeCreators = {
  osc: OscConfig;
  filter: FilterConfig; 
  filter_simple: SimpleFilterConfig;
  pingPongDelay: PingPongConfig;
  outputGain: outputGainConfig;
  attackReleaseOsc: AttackReleaseOscConfig;
  arEnvelope: arEnvelopeConfig;
  noiseOsc: NoiseOscConfig
}

export type NodeCreator = keyof NodeCreators
export type Config = NodeCreators[keyof NodeCreators]

export type EnhancedConfig<T extends Config> = T & { startTime: number, scale: string[], noiseWorkletNode: any }

export default {
  osc,
  filter,
  pingPongDelay,
  attackReleaseOsc,
  filter_simple,
  outputGain,
  arEnvelope,
  noiseOsc
}
