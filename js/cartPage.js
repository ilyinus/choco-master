import cartController from './controller/cartController.js'
import eventBus from './eventDispatcher.js'

class CartPage {
  constructor() {
    this.bindElements()
    this.init()
  }

  bindElements() {
    this.cartItemsContainer = document.querySelector('.cart-items')
    this.summaryCount = document.querySelector('.summary-count')
    this.summaryPrice = document.querySelector('.summary-price')
    this.backLink = document.getElementById('back-link')
    this.orderForm = document.getElementById('order-form')
    this.emptyCart = document.getElementById('empty-cart')
    this.cartWrapper = document.querySelector('.cart-content-wrapper')
    this.orderCreated = document.getElementById('order-created')
    this.orderSuccessText = document.getElementById('order-success-text')
  }

  init() {
    this.saveReferrer()
    this.bindEvents()
    this.renderCart()
  }

  bindEvents() {
    eventBus.subscribe('cart:update', () => this.renderCart())
    eventBus.subscribe('order:success', (e) => {
      this.cartWrapper.style.display = 'none'
      this.orderCreated.classList.remove('hidden')
      this.orderSuccessText.innerHTML = `Номер вашего заказа <span style="font-weight: bold;">${e.detail.orderData.id}</span>. Мы свяжемся с вами в ближайшее время, чтобы уточнить детали.`
    })
    this.cartItemsContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.cart-control-button')
      if (!btn) return

      const id = e.target.closest('.cart-item').dataset.id
      if (btn.dataset.action === '+') {
        eventBus.dispatch('cart:addItem', {
          id,
          name: cartController.items[id].name,
          price: cartController.items[id].price
        })
      } else if (btn.dataset.action === '-') {
        eventBus.dispatch('cart:removeItem', {id})
      }
    })

    this.backLink.addEventListener('click', (e) => {
      e.preventDefault()
      const lastPage = sessionStorage.getItem('lastPage')
      window.location.href = lastPage || '/index.html'
    })

    this.orderForm.addEventListener('submit', (e) => {
      e.preventDefault()
      const {name, phone, comment} = e.target
      eventBus.dispatch('order:createOrder', {
        name: name.value,
        phone: phone.value,
        comment: comment.value
      })
    })
  }

  renderCart() {
    this.cartItemsContainer.innerHTML = ''
    const ids = Object.keys(cartController.items)

    if (ids.length === 0) {
      this.cartWrapper.style.display = 'none'
      this.emptyCart.classList.remove('hidden')
    } else {
      ids.forEach((id) =>
        this.cartItemsContainer.appendChild(this.renderCartItem(id))
      )
    }

    this.updateSummary()
  }

  renderCartItem(id) {
    const {name, price, count, img, url} = cartController.items[id]
    const el = document.createElement('div')
    el.classList.add('cart-item')
    el.dataset.id = id
    el.innerHTML = `
      <a href="${url}?id=${id}">
        <div class="cart-item-image">
          <img src="${img}" alt="${name}" />
        </div>
      </a>
      <div class="cart-item-info">
        <div class="cart-item-title">${name}</div>        
      </div>
      <div class="cart-item-controls">
        <div class="cart-item-price">${price} ₽</div>
        <div>
          <button class="cart-control-button" data-action="-">-</button>
          <span class="cart-item-count">${count}</span>
          <button class="cart-control-button" data-action="+">+</button>
        </div>        
      </div>
    `
    return el
  }

  updateSummary() {
    this.summaryCount.textContent = cartController.getTotalCount()
    this.summaryPrice.textContent = cartController.getTotalPrice() + ' ₽'
  }

  saveReferrer() {
    if (document.referrer && !document.referrer.includes('cart.html')) {
      const url = new URL(document.referrer)
      sessionStorage.setItem('lastPage', url.origin + url.pathname)
    }
  }
}

new CartPage()
