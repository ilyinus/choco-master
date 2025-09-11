class Modal {
  closeButtonHandler = () => this.close()
  touchstartHandler = (e) => this.touchStart(e)
  touchendHandler = (e) => this.touchEnd(e)
  thumbnailClickHandler = (e) =>
    this.slideToImage(parseInt(e.target.dataset.index))
  overlayClickHandler = (e) => {
    if (e.target === this.modal) {
      this.close()
    }
  }

  constructor() {
    this.modal = document.querySelector('.modal')
    this.closeButton = this.modal.querySelector('.modal-close-button')
    this.modalSlides = this.modal.querySelector('.modal-slides')
    this.thumbnailsContainer = this.modal.querySelector(
      '.modal-thumbnails-container'
    )
  }

  init() {
    this.initSlider()
    this.addListeners()
  }

  initSlider() {
    this.createSlides()
    if (this.modalSlidesCount > 1) {
      this.createThumbnails()
    }
  }

  createSlides() {
    this.modalSlides.innerHTML = ''

    for (let i = 0; i < this.modalSlidesCount; i++) {
      const image = this.images[i]
      const slide = document.createElement('img')
      slide.setAttribute('src', image.getAttribute('src'))
      slide.classList.add('modal-slide')
      if (i === this.activeSlideIndex) {
        this.modalSlides.style.transform = `translateX(${-i * 100}%)`
      }
      this.modalSlides.appendChild(slide)
    }
  }

  createThumbnails() {
    this.thumbnailsContainer.innerHTML = ''

    for (let i = 0; i < this.modalSlidesCount; i++) {
      const image = this.images[i]
      const thumbnail = document.createElement('img')
      thumbnail.setAttribute('src', image.getAttribute('src'))
      thumbnail.classList.add('modal-thumbnail')
      thumbnail.dataset.index = i
      if (i === this.activeSlideIndex) {
        thumbnail.classList.add('active')
      }
      thumbnail.addEventListener('click', this.thumbnailClickHandler)
      this.thumbnailsContainer.appendChild(thumbnail)
    }
  }

  open(card) {
    this.images = card.images
    this.modalSlidesCount = card.images.length
    this.activeSlideIndex = card.activeSlideIndex
    this.init()
    this.modal.classList.add('open')

    document.body.style.overflow = 'hidden'
  }

  close() {
    this.removeListeners()
    this.modalSlides.innerHTML = ''
    this.thumbnailsContainer.innerHTML = ''
    this.modal.classList.remove('open')
    document.body.style.overflow = ''
  }

  prevSlideImage() {
    this.slideToImage(
      (this.modalSlidesCount + this.activeSlideIndex - 1) %
        this.modalSlidesCount
    )
  }

  nextSlideImage() {
    this.slideToImage((this.activeSlideIndex + 1) % this.modalSlidesCount)
  }

  slideToImage(index) {
    this.activeSlideIndex = index
    this.modalSlides.style.transform = `translateX(-${index * 100}%)`

    this.thumbnailsContainer
      .querySelectorAll('.modal-thumbnail')
      .forEach((thumbnail, i) => {
        thumbnail.classList.toggle('active', i === index)
      })
  }

  touchStart(e) {
    this.screenX = e.changedTouches[0].screenX
  }

  touchEnd(e) {
    const diff = e.changedTouches[0].screenX - this.screenX
    if (Math.abs(diff) < 50) return

    if (diff < 0 && this.activeSlideIndex < this.modalSlidesCount - 1) {
      this.nextSlideImage()
    } else if (diff > 0 && this.activeSlideIndex > 0) {
      this.prevSlideImage()
    }
  }

  addListeners() {
    this.closeButton.addEventListener('click', this.closeButtonHandler)
    this.modalSlides.addEventListener('touchstart', this.touchstartHandler)
    this.modalSlides.addEventListener('touchend', this.touchendHandler)
    this.modal.addEventListener('click', this.overlayClickHandler)
  }

  removeListeners() {
    this.closeButton.removeEventListener('click', this.closeButtonHandler)
    this.modalSlides.removeEventListener('touchstart', this.touchstartHandler)
    this.modalSlides.removeEventListener('touchend', this.touchendHandler)
    this.modal.removeEventListener('click', this.overlayClickHandler)
  }
}

const modal = new Modal()

class ProductCard {
  constructor(card) {
    this.card = card
    this.card.instance = this
    this.init()
  }

  init() {
    this.slides = this.card.querySelector('.slides')
    this.slidesCount = this.slides.querySelectorAll('.slide').length
    this.images = this.card.querySelectorAll('.product-image')
    this.activeSlideIndex = 0

    if (this.slidesCount > 1) {
      this.createDots()
      this.slides.addEventListener('touchstart', (e) => this.touchStart(e))
      this.slides.addEventListener('touchend', (e) => this.touchEnd(e))
    } else {
      this.hideControls()
    }
  }

  hideControls() {
    this.card.querySelector('.prev-btn').style.display = 'none'
    this.card.querySelector('.next-btn').style.display = 'none'
  }

  createDots() {
    this.dotsContainer = this.card.querySelector('.dots-container')
    this.dotsContainer.innerHTML = ''

    for (let i = 0; i < this.slidesCount; i++) {
      const dot = document.createElement('span')
      dot.classList.add('dot')
      if (i === 0) dot.classList.add('active')
      dot.dataset.index = i
      this.dotsContainer.appendChild(dot)
    }
  }

  touchStart(e) {
    this.screenX = e.changedTouches[0].screenX
  }

  touchEnd(e) {
    const diff = e.changedTouches[0].screenX - this.screenX
    if (Math.abs(diff) < 50) return

    if (diff < 0 && this.activeSlideIndex < this.slidesCount - 1) {
      this.nextSlideImage()
    } else if (diff > 0 && this.activeSlideIndex > 0) {
      this.prevSlideImage()
    }
  }

  prevSlideImage() {
    this.slideToImage(
      (this.slidesCount + this.activeSlideIndex - 1) % this.slidesCount
    )
  }

  nextSlideImage() {
    this.slideToImage((this.activeSlideIndex + 1) % this.slidesCount)
  }

  slideToImage(index) {
    this.activeSlideIndex = index
    this.slides.style.transform = `translateX(-${index * 100}%)`

    this.dotsContainer.querySelectorAll('.dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === index)
    })
  }

  openModal() {
    modal.open(this)
  }
}

document.querySelectorAll('.card').forEach((card) => new ProductCard(card))

document.addEventListener('click', (e) => {
  if (e.target.closest('.prev-btn')) {
    const card = e.target.closest('.card')
    card.instance.prevSlideImage()
  }

  if (e.target.closest('.next-btn')) {
    const card = e.target.closest('.card')
    card.instance.nextSlideImage()
  }

  if (e.target.classList.contains('dot')) {
    const card = e.target.closest('.card')
    const index = parseInt(e.target.dataset.index, 10)
    card.instance.slideToImage(index)
  }

  if (e.target.classList.contains('product-image')) {
    const card = e.target.closest('.card')
    card.instance.openModal()
  }
})
