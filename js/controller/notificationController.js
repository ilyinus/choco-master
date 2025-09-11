class NotificationController {
  constructor(timeout = 3000) {
    this.timeout = timeout
    this.container = this.createContainer()
  }

  createContainer() {
    let container = document.querySelector('.notification-container')
    if (!container) {
      container = document.createElement('div')
      container.className = 'notification-container'
      document.body.appendChild(container)
    }
    return container
  }

  show(message, type = 'success') {
    const notification = document.createElement('div')
    notification.className = `notification ${type}`
    notification.textContent = message

    this.container.appendChild(notification)

    // анимация появления
    setTimeout(() => {
      notification.classList.add('visible')
    }, 50)

    // скрыть через timeout
    setTimeout(() => {
      notification.classList.remove('visible')
      setTimeout(() => notification.remove(), 300) // задержка под анимацию
    }, this.timeout)
  }
}

const notificationController = new NotificationController()
export default notificationController
