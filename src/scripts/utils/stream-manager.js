const activeStreams = new Set();

export const StreamManager = {
  register(stream) {
    if (stream && typeof stream.getTracks === 'function') {
      activeStreams.add(stream);
    }
  },

  unregister(stream) {
    activeStreams.delete(stream);
  },

  stopAll() {
    activeStreams.forEach((stream) => {
      try {
        if (typeof stream.getTracks === 'function') {
          stream.getTracks().forEach((track) => {
            if (typeof track.stop === 'function') {
              track.stop();
            }
          });
        }
      } catch (err) {
        console.error('Error stopping stream track:', err);
      }
    });
    activeStreams.clear();
  },

  getActiveCount() {
    return activeStreams.size;
  },
};

export default StreamManager;
