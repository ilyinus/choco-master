import cartController from './cartController.js'
import eventBus from '../eventDispatcher.js'
import notificationController from './notificationController.js'

class OrderController {
  botToken = '8400834109:AAF5qcrQtZW4iSHKe0lDybjz88LsnMAE3oA'
  chatId = '346503356'

  constructor() {
    this.apiUrl = `https://api.telegram.org/bot${this.botToken}/sendMessage`
    this.bindEvents()
  }

  bindEvents() {
    eventBus.subscribe('order:createOrder', (e) => {
      const {name, phone, comment} = e.detail
      this.createOrder(name, phone, comment)
    })
  }

  async createOrder(name, phone, comment) {
    const orderData = this.buildOrderData(name, phone, comment)
    const message = this.buildMessage(orderData)

    try {
      await this.sendToTelegram(message)
      this.dispatchSuccessCreateOrder(orderData)
      this.dispatchClearCart()
    } catch (err) {
      notificationController.show(
        `Ошибка при создании заказа. Попробуйте еще раз.`,
        'error'
      )
      console.error(err)
    }
  }

  buildOrderData(name, phone, comment) {
    return {
      id: this.generateOrderId(),
      name,
      phone,
      comment,
      items: Object.values(cartController.items),
      totalCount: cartController.getTotalCount(),
      totalPrice: cartController.getTotalPrice(),
      createdAt: new Date().toISOString()
    }
  }

  generateOrderId() {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '') // YYYYMMDD
    const short = Date.now().toString().slice(-4)
    return `${date}-${short}`
  }

  buildMessage(order) {
    let text = `🛒 Новый заказ #${order.id}\n\n`
    text += `👤 Имя: ${order.name}\n`
    text += `📞 Телефон: ${order.phone}\n`
    if (order.comment) {
      text += `💬 Комментарий: ${order.comment}\n`
    }
    text += `\n📦 Товары:\n`

    order.items.forEach((item) => {
      text += `- <a href="${item.url}?id=${item.id}">${item.name}</a> x ${
        item.count
      } = ${item.price * item.count} ₽\n`
    })

    text += `\nВсего: ${order.totalCount} шт. / ${order.totalPrice} ₽`

    return text
  }

  async sendToTelegram(message) {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        chat_id: this.chatId,
        text: message,
        parse_mode: 'HTML'
      })
    })

    if (!response.ok) {
      throw new Error(`Ошибка Telegram API: ${response.status}`)
    }
  }

  dispatchSuccessCreateOrder(orderData) {
    eventBus.dispatch('order:success', {orderData})
  }

  dispatchClearCart() {
    eventBus.dispatch('cart:clear')
  }
}

new OrderController()
