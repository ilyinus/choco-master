import eventBus from '../eventDispatcher.js'

const cartUUID = '5a8ff7ad-f652-4e58-991d-de5143c362c2'

class CartController {
  badge

  constructor() {
    this.items = {}
    this.loadFromStorage()
    this.bindEvents()
    this.bindElements()
    this.updateCartBadge()
  }

  bindElements() {
    this.badge = document.querySelector('.cart-badge')
  }

  bindEvents() {
    eventBus.subscribe('cart:addItem', (e) => {
      const {id, name, price, img, url} = e.detail
      this.addItem(id, name, price, img, url)
    })
    eventBus.subscribe('cart:removeItem', (e) => {
      const {id} = e.detail
      this.removeItem(id)
    })
    eventBus.subscribe('cart:clear', () => {
      this.clear()
    })
  }

  loadFromStorage() {
    this.items = JSON.parse(localStorage.getItem(cartUUID)) || {}
  }

  saveToStorage() {
    this.cleanupCart()
    localStorage.setItem(cartUUID, JSON.stringify(this.items))
  }

  addItem(id, name, price, img, url) {
    if (this.items[id]) {
      this.items[id].count += 1
    } else {
      this.items = {
        ...this.items,
        ...{[id]: {id, name, price, count: 1, img, url}}
      }
    }
    this.saveToStorage()
    this.dispatchUpdate(id)
  }

  removeItem(id) {
    if (this.items[id]) {
      this.items[id].count -= 1
      this.saveToStorage()
      this.dispatchUpdate(id)
    }
  }

  cleanupCart() {
    for (let key in this.items) {
      if (this.items[key].count === 0) {
        delete this.items[key]
      }
    }
  }

  getItemById(id) {
    return this.items[id] || {}
  }

  getTotalCount() {
    return Object.values(this.items).reduce((sum, i) => sum + i.count, 0)
  }

  getTotalPrice() {
    return Object.values(this.items).reduce(
      (sum, i) => sum + i.count * i.price,
      0
    )
  }

  clear() {
    localStorage.removeItem(cartUUID)
    this.items = {}
    this.updateCartBadge()
  }

  updateCartBadge() {
    if (this.badge) {
      const count = this.getTotalCount()
      this.badge.classList.toggle('hidden', count === 0)
      this.badge.innerText = count
    }
  }

  dispatchUpdate(id) {
    this.updateCartBadge()
    eventBus.dispatch('cart:update', {id})
  }
}

const cartController = new CartController()
export default cartController
