class MyAudioProcessor extends AudioWorkletProcessor {
  constructor (options) {
    super()
    this.buffer = buffer;
  }
  process (inputs, outputs, parameters) {
    // let left = outputs(0);
    // let size = left.length;
    // try {
    //     var samples = this.buffer.deqN(size);
    // } catch (e) {
    //     for (let i = 0; i < size; i++) {
    //         left[i] = 0;
    //     }
    //     return;
    // }
    // for (let i = 0; i < size; i++) {
    //     left[i] = samples[i];
    // }

    const output = outputs[0]
    output.forEach(channel => {
      for (let i = 0; i < channel.length; i++) {
        channel[i] = Math.random() * 2 - 1
      }
    })
    return true;
  }
}

registerProcessor('my-audio-processor', MyAudioProcessor);
