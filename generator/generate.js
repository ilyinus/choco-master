const fs = require('fs')
const path = require('path')

// Данные
const cards = JSON.parse(fs.readFileSync('./data/cards.json', 'utf-8'))

// Категории
const categories = [...new Set(cards.flatMap((c) => c.categories))]

const templates = {
  pageTemplate: fs.readFileSync('./templates/product/page.html', 'utf-8'),
  cardTemplate: fs.readFileSync(
    './templates/product/product-card.html',
    'utf-8'
  ),
  slideTemplate: fs.readFileSync(
    './templates/product/product-slide.html',
    'utf-8'
  )
}

const pageNameMap = {
  Коробки: 'boxes',
  Букеты: 'bouquets',
  Пельмени: 'dumplings',
  '8 марта': '8-march',
  'Новый год': 'new-year',
  Тематические: 'thematic',
  '23 февраля': '23-february',
  Пасха: 'easter',
  'День учителя': 'teachers-day',
  'День воспитателя': 'educators-day',
  '1 сентября': '1-september',
  Выпускной: 'graduation',
  'День матери': 'mather-day',
  'Шляпные коробки': 'hat-boxes',
  Тюльпаны: 'tulips'
}

function createCardHTML(card) {
  let slides = ''
  for (let i = 1; i <= card.images; i++) {
    slides += templates.slideTemplate
      .replace('{{img}}', `../assets/images/cards/${card.id}/${i}.jpg`)
      .replace('{{name}}', card.name)
  }

  card = templates.cardTemplate
    .replace('{{id}}', card.id)
    .replace('{{categories}}', card.categories.join(','))
    .replace('{{tags}}', card.tags.join(','))
    .replace('{{slides}}', slides)
    .replaceAll('{{price}}', card.price)
    .replaceAll('{{name}}', card.name)

  return card
}

// генерируем страницу для каждой категории
categories.forEach((category) => {
  const filtered = cards.filter((c) => c.categories.includes(category))
  const cardsHTML = filtered.map(createCardHTML).join('\n')

  const pageHTML = templates.pageTemplate
    .replaceAll('{{title}}', category)
    .replace('{{cards}}', cardsHTML)
    .replace('{{pageName}}', pageNameMap[category])

  fs.writeFileSync(`./.target/${pageNameMap[category]}.html`, pageHTML, 'utf-8')
  console.log(`✅ Сгенерирована страница: ${category}.html`)
})
