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
      const countButton = e.target.closest('.cart-control-button')
      const deleteButton = e.target.closest('.cart-control-delete-button')
      if (!countButton && !deleteButton) return

      const id = e.target.closest('.cart-item').dataset.id

      if (countButton) {
        if (countButton.dataset.action === '+') {
          eventBus.dispatch('cart:addItem', {
            id,
            name: cartController.items[id].name,
            price: cartController.items[id].price
          })
        } else if (countButton.dataset.action === '-') {
          eventBus.dispatch('cart:removeItem', {id})
        }
      } else if (deleteButton) {
        eventBus.dispatch('cart:removeAllItems', {id})
      }
    })

    this.backLink.addEventListener('click', (e) => {
      e.preventDefault()
      const lastPage = sessionStorage.getItem('lastPage')      
      if (lastPage.indexOf('id=') != -1) {
        window.location.href = lastPage.substring(0, lastPage.indexOf('?'))
      } else {
        window.location.href = lastPage || '/index.html'
      }
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
        <div class="cart-item-price">${price} ₽</div>
      </div>
      <div class="cart-item-controls">        
        <div>
          <button class="cart-control-button" data-action="-">-</button>
          <span class="cart-item-count">${count}</span>
          <button class="cart-control-button" data-action="+">+</button>
        </div>
        <div class="cart-control-delete-button">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M20.5001 6H3.5" stroke="#5a3123" stroke-width="1.5" stroke-linecap="round"></path> <path d="M18.8332 8.5L18.3732 15.3991C18.1962 18.054 18.1077 19.3815 17.2427 20.1907C16.3777 21 15.0473 21 12.3865 21H11.6132C8.95235 21 7.62195 21 6.75694 20.1907C5.89194 19.3815 5.80344 18.054 5.62644 15.3991L5.1665 8.5" stroke="#5a3123" stroke-width="1.5" stroke-linecap="round"></path> <path d="M9.5 11L10 16" stroke="#5a3123" stroke-width="1.5" stroke-linecap="round"></path> <path d="M14.5 11L14 16" stroke="#5a3123" stroke-width="1.5" stroke-linecap="round"></path> <path d="M6.5 6C6.55588 6 6.58382 6 6.60915 5.99936C7.43259 5.97849 8.15902 5.45491 8.43922 4.68032C8.44784 4.65649 8.45667 4.62999 8.47434 4.57697L8.57143 4.28571C8.65431 4.03708 8.69575 3.91276 8.75071 3.8072C8.97001 3.38607 9.37574 3.09364 9.84461 3.01877C9.96213 3 10.0932 3 10.3553 3H13.6447C13.9068 3 14.0379 3 14.1554 3.01877C14.6243 3.09364 15.03 3.38607 15.2493 3.8072C15.3043 3.91276 15.3457 4.03708 15.4286 4.28571L15.5257 4.57697C15.5433 4.62992 15.5522 4.65651 15.5608 4.68032C15.841 5.45491 16.5674 5.97849 17.3909 5.99936C17.4162 6 17.4441 6 17.5 6" stroke="#5a3123" stroke-width="1.5"></path> </g></svg>
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
      sessionStorage.setItem('lastPage', url.origin + url.pathname + url.search)
    }
  }
}

new CartPage()
