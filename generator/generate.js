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
  ),
  filtersContentTemplate: fs.readFileSync(
    './templates/filters/filters-content.html',
    'utf-8'
  ),
  switchFilterItemtTemplate: fs.readFileSync(
    './templates/filters/switch-filter-item.html',
    'utf-8'
  )
}

const tagsMap = {
  dumplings: 'Пельмени',
  '8-march': '8 марта',
  'new-year': 'Новый год',
  'new-year-2026': 'Новый год 2026',
  thematic: 'Тематические',
  '23-febraury': '23 февраля',
  easter: 'Пасха',
  'teachers-day': 'День учителя',
  'educator-day': 'День воспитателя',
  '1-september': '1 сентября',
  graduation: 'Выпускной',
  'mothers-day': 'День матери',
  'hat-boxes': 'Шляпные коробки',
  tulips: 'Тюльпаны',
  roses: 'Розы',
  peonies: 'Пионы'
}

const pageNameMap = {
  Коробки: {pageName: 'boxes', pageTitle: 'Конфеты в коробоках'},
  Букеты: {pageName: 'bouquets', pageTitle: 'Шоколадные букеты'}
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

function createFilters(cards) {
  const tags = {}
  cards.forEach((card) => {
    card.tags.forEach((tag) => {
      tags[tag] = tagsMap[tag]
    })
  })

  let switches = ''
  Object.keys(tags).forEach((key) => {
    switches += templates.switchFilterItemtTemplate
      .replace('{{tag-name}}', tagsMap[key])
      .replace('{{tag}}', key)
  })

  const filtersContent = templates.filtersContentTemplate.replace(
    '{{switch-filter-items}}',
    switches
  )

  return filtersContent
}

// генерируем страницу для каждой категории
categories.forEach((category) => {
  const filtered = cards.filter((c) => c.categories.includes(category))
  const cardsHTML = filtered.map(createCardHTML).join('\n')

  const pageHTML = templates.pageTemplate
    .replaceAll('{{title}}', pageNameMap[category]['pageTitle'])
    .replace('{{filters}}', createFilters(filtered))
    .replace('{{cards}}', cardsHTML)
    .replace('{{pageName}}', pageNameMap[category]['pageName'])

  fs.writeFileSync(
    `./.target/${pageNameMap[category]['pageName']}.html`,
    pageHTML,
    'utf-8'
  )
  console.log(`✅ Сгенерирована страница: ${category}.html`)
})
