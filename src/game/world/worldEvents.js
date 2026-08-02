// Framework-free Event Emitter for React ↔ Phaser Bridge

class WorldEvents {
  constructor() {
    this.listeners = new Map();
  }

  on(event, fn) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(fn);
    return () => this.off(event, fn);
  }

  off(event, fn) {
    if (!this.listeners.has(event)) return;
    const callbacks = this.listeners.get(event).filter((cb) => cb !== fn);
    this.listeners.set(event, callbacks);
  }

  emit(event, data) {
    if (!this.listeners.has(event)) return;
    this.listeners.get(event).forEach((fn) => {
      try {
        fn(data);
      } catch (e) {
        console.error(`Error handling world event "${event}":`, e);
      }
    });
  }
}

export const worldEvents = new WorldEvents();
