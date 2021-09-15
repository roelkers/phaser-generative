
      this.pointer.setVisible(false)
    } else {
      this.pointer.setVisible(false)
    }
  }

  updateAudioGraph() {
    if (!this.virtualAudioGraph) {
      return
    }
    //this.virtualAudioGraph.update({})
    const { currentTime } = this.virtualAudioGraph
    const filteredSkulls = this.skulls.getChildren().filter((skull: any) => {
    return !!skull.startTime }) as Skull[]
    const update = filteredSkulls
    .reduce((acc, skull: Skull, i) => {
      const startTime = skull.startTime
      if(currentTime < skull.startTime + SKULL_ENV) {
        Object.assign(acc, { [i]: outputNode('output', { audio: config, startTime, scale: this.tonalScale }) }) as unknown as IVirtualAudioNodeGraph
      }
     return acc
    },{})
    this.virtualAudioGraph.update(update)
  }
}

