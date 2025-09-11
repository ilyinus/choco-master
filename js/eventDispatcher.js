class EventDispatcher {
  subscribers

  constructor() {
    this.subscribers = {}
  }

  subscribe(type, handler) {
    if (!this.subscribers[type]) {
      this.subscribers[type] = []
      document.addEventListener(type, (e) => this.notifySubscribers(type, e))
    }
    this.subscribers[type].push(handler)
  }

  unsubscribe(type, handler) {
    if (!this.subscribers[type]) return
    this.subscribers[type] = this.subscribers[type].filter((h) => h !== handler)
  }

  dispatch(type, detail = {}) {
    document.dispatchEvent(new CustomEvent(type, {detail}))
  }

  notifySubscribers(type, e) {
    this.subscribers[type].forEach((handler) => handler(e))
  }
}

const eventBus = new EventDispatcher()
export default eventBus
