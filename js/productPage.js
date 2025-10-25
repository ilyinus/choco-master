import Modal from './modal.js'
import cartController from './controller/cartController.js'
import eventBus from './eventDispatcher.js'

const modal = new Modal()
const params = new URLSearchParams(window.location.search)

processParams()

class ProductCard {
  id = ''
  name = ''
  price = 0
  slidesCount = 0
  activeSlideIndex = 0

  constructor(card, modal) {
    this.card = card
    this.modal = modal
    this.card.instance = this
    this.init()
  }

  init() {
    this.bindElements()
    this.initFields()
    this.initSlider()
    this.updateCartUI()
  }

  bindElements() {
    this.productTitle = this.requireElement('.product-card-title')
    this.productPrice = this.requireElement('.product-card-price')
    this.slides = this.requireElement('.slides')
    this.slide = this.slides.querySelectorAll('.slide')
    this.images = this.card.querySelectorAll('.product-image')
    this.prevBtn = this.requireElement('.prev-btn')
    this.nextBtn = this.requireElement('.next-btn')
    this.dotsContainer = this.requireElement('.dots-container')
    this.addToCartButton = this.requireElement(
      '.product-card-add-to-cart-button'
    )
    this.cartControls = this.card.querySelectorAll(
      '.product-card-cart-count-button'
    )
    this.cartCount = this.requireElement('.product-card-cart-count')
  }

  requireElement(selector) {
    const el = this.card.querySelector(selector)
    if (!el) {
      throw new Error(
        `ProductCard error: element "${selector}" not found in card #${this.card.id}`
      )
    }
    return el
  }

  initFields() {
    this.id = this.card.getAttribute('id')
    this.name = this.productTitle.dataset.name
    this.price = parseInt(this.productPrice.dataset.price)
    this.slidesCount = this.slide.length
  }

  initSlider() {
    if (this.slidesCount === 1) {
      this.prevBtn.style.display = 'none'
      this.nextBtn.style.display = 'none'
      return
    }

    this.dotsContainer.innerHTML = ''

    for (let i = 0; i < this.slidesCount; i++) {
      const dot = document.createElement('span')
      dot.dataset.index = i
      dot.classList.add('dot')
      if (i === 0) dot.classList.add('active')
      this.dotsContainer.appendChild(dot)
    }
  }

  updateCartUI() {
    const count = cartController?.getItemById(this.id).count || 0
    this.cartCount.innerHTML = count
    this.addToCartButton.hidden = count > 0
    this.cartCount.hidden = count === 0
    this.cartControls.forEach((c) => (c.hidden = count === 0))
  }

  openImage() {
    this.modal.open(this)
  }

  // Слайдер
  nextImage() {
    this.slideToImage((this.activeSlideIndex + 1) % this.slidesCount)
  }

  prevImage() {
    this.slideToImage(
      (this.slidesCount + this.activeSlideIndex - 1) % this.slidesCount
    )
  }

  slideToImage(index) {
    this.activeSlideIndex = index
    this.slides.style.transform = `translateX(-${this.activeSlideIndex * 100}%)`
    this.dotsContainer.querySelectorAll('.dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === this.activeSlideIndex)
    })
  }

  touchStart(e) {
    this.screenX = e.changedTouches[0].screenX
  }

  touchEnd(e) {
    const diff = e.changedTouches[0].screenX - this.screenX
    if (Math.abs(diff) < 50) return

    if (diff < 0 && this.activeSlideIndex < this.slidesCount - 1) {
      this.nextImage()
    } else if (diff > 0 && this.activeSlideIndex > 0) {
      this.prevImage()
    }
  }

  // Корзина
  changeCartCount(action) {
    if (action === '+') {
      eventBus.dispatch('cart:addItem', {
        id: this.id,
        name: this.name,
        price: this.price,
        img: this.images[0].getAttribute('src'),
        url:
          window.location.protocol +
          '//' +
          window.location.host +
          window.location.pathname
      })
    } else if (action === '-') {
      eventBus.dispatch('cart:removeItem', {id: this.id})
    }
  }
}

eventBus.subscribe('cart:update', (e) => {
  const {id} = e.detail
  const card = document.getElementById(id)
  if (card) {
    card?.instance.updateCartUI()
  }
})

eventBus.subscribe('filters:update', (e) => {
  setFilters(e.detail.tags)
})

document
  .querySelectorAll('.product-card')
  .forEach((card) => new ProductCard(card, modal))

document.addEventListener('click', (e) => {
  const card = e.target.closest('.product-card')
  if (!card) return
  const inst = card.instance

  if (e.target.closest('.prev-btn')) inst.prevImage()
  if (e.target.closest('.next-btn')) inst.nextImage()
  if (e.target.classList.contains('dot'))
    inst.slideToImage(parseInt(e.target.dataset.index))
  if (e.target.classList.contains('product-image')) inst.openImage()
  if (e.target.classList.contains('product-card-add-to-cart-button'))
    inst.changeCartCount('+')
  if (e.target.classList.contains('product-card-cart-count-button'))
    inst.changeCartCount(e.target.dataset.action)
})

document.addEventListener('touchstart', (e) => {
  const card = e.target.closest('.product-card')
  if (card) {
    card.instance.touchStart(e)
  }
})

document.addEventListener('touchend', (e) => {
  const card = e.target.closest('.product-card')
  if (card) {
    card.instance.touchEnd(e)
  }
})

function processParams() {
  const productId = params.get('id')
  if (productId) {
    document.querySelectorAll('.product-card').forEach((card) => {
      if (card.id !== productId) {
        card.style.display = 'none'
      }
    })
  }
}

function setFilters(tags) {
  document.querySelectorAll('.product-card').forEach((card) => {
    const productTags = card.dataset.tags.split(',')
    const hasTag =
      tags.length === 0 || tags.some((tag) => productTags.includes(tag))
    card.classList.toggle('hidden', !hasTag)
  })
}
