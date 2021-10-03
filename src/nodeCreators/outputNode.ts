import { createNode } from 'virtual-audio-graph'
import nodeCreators, { NodeCreator, NodeCreators } from '../nodeCreators';
import CustomVirtualAudioNode from 'virtual-audio-graph/dist/VirtualAudioNodes/CustomVirtualAudioNode';

export interface AudioConfig<T extends keyof NodeCreators> {
  nodeCreator: T;
  output: string;
  params: NodeCreators[T] 
}

const audioMapper
  = (startTime: number, scale : string[], noiseWorkletNode: any) => (audioConfig: AudioConfig<NodeCreator>) => {
    const nodeCreatorName = audioConfig.nodeCreator
    return nodeCreators[nodeCreatorName](
      audioConfig.output,
      {
        ...audioConfig.params,
        startTime,
        scale,
        noiseWorkletNode
      }
    )
  }
 
const nodeCreator = createNode(({
  startTime,
  audio,
  scale,
  noiseWorkletNode
  }) => {
    let result: Record<number,CustomVirtualAudioNode> = {}
    for (const [key,value] of Object.entries(audio)) {
      result[key] = audioMapper(startTime,scale,noiseWorkletNode)(value as AudioConfig<NodeCreator>)
    }
    return result
  })

export default nodeCreator
