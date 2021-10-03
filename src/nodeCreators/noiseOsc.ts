import { createNode } from 'virtual-audio-graph'
import { IVirtualAudioNodeParams, IVirtualAudioNodeGraph, Output } from 'virtual-audio-graph/dist/types'
import CustomVirtualAudioNode from 'virtual-audio-graph/dist/VirtualAudioNodes/CustomVirtualAudioNode';
import { EnhancedConfig } from '.';

export interface NoiseOscConfig {
}


type myCustomVirtualAudioNodeFactory = (_: EnhancedConfig<NoiseOscConfig>) => IVirtualAudioNodeGraph;

const createOsc = createNode as (node: myCustomVirtualAudioNodeFactory) => (output: Output, params?: IVirtualAudioNodeParams) => CustomVirtualAudioNode;

const nodeCreator = createOsc(({
  noiseWorkletNode
}) => {
  return {
    1: noiseWorkletNode('output', {
      amplitude: 0.25
    }),
  }
})

export default nodeCreator
