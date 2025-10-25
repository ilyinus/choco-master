export default class Modal {
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
    // document.documentElement.classList.toggle('lock-scroll')
    // document.body.classList.toggle('lock-scroll')
    this.lockScroll()
    setTimeout(() => this.modalSlides.classList.add('transition'), 0)
  }

  close() {
    this.removeListeners()
    this.modalSlides.innerHTML = ''
    this.thumbnailsContainer.innerHTML = ''
    this.modal.classList.remove('open')
    // document.documentElement.classList.toggle('lock-scroll')
    // document.body.classList.toggle('lock-scroll')
    this.unlockScroll()
    this.modalSlides.classList.remove('transition')
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

  lockScroll() {
    // scrollY = window.scrollY
    // document.documentElement.classList.add('lock-scroll')
    // document.body.classList.add('lock-scroll')
    // document.body.style.top = `-${scrollY}px`
    // document.querySelector('.container').classList.add('scroll-lock')
  }

  unlockScroll() {
    // document.documentElement.classList.remove('lock-scroll')
    // document.body.classList.remove('lock-scroll')
    // document.body.style.top = ''
    // window.scrollTo(0, scrollY)
    // document.querySelector('.container').classList.remove('scroll-lock')
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
