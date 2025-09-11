const cardsContainer = document.getElementById('cards-container')
const template = document.getElementById('card-template')

const formatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB'
})

async function generateCards(category) {
  const data = await (await fetch('./data/cards.json')).json()

  cardsContainer.innerHTML = ''

  data.forEach((item) => {
    if (item.categories.indexOf(category) !== -1) {
      cardsContainer.appendChild(createCard(item))
    }
  })

  downloadGeneratedHTML()
}

function createCard(cardData) {
  // клонируем содержимое <template>
  const card = template.content.cloneNode(true)

  card.querySelector('.card').setAttribute('id', 'product-' + cardData.id)

  // слайды
  const slides = card.querySelector('.slides')
  for (let i = 0; i < cardData.images; i++) {
    const slide = document.createElement('div')
    slide.classList.add('slide')

    const img = document.createElement('img')
    img.src = `./assets/images/cards/${cardData.id}/${i + 1}.jpg`
    img.loading = 'lazy'
    img.classList.add('product-image')

    slide.appendChild(img)
    slides.appendChild(slide)
  }

  // название
  card.querySelector('.product-title').textContent = cardData.name

  // цена
  card.querySelector('.product-price').textContent = formatter.format(
    cardData.price
  )

  // категории (для будущей фильтрации)
  const cardRoot = card.querySelector('.card')
  cardRoot.dataset.categories = cardData.categories.join(',')

  return card
}

function downloadGeneratedHTML() {
  const content = cardsContainer.innerHTML
  const blob = new Blob([content], {type: 'text/html'})
  const url = URL.createObjectURL(blob)

  // cardsContainer.innerHTML = ''

  const a = document.createElement('a')
  a.href = url
  a.download = 'cards.html'
  a.click()

  URL.revokeObjectURL(url)
}
