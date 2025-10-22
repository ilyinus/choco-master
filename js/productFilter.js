import eventBus from './eventDispatcher.js'

const searchParams = new URLSearchParams(window.location.search)

const tagsMap = {
  dumplings: 'Пельмени',
  '8-march': '8 марта',
  'new-year': 'Новый год',
  thematic: 'Тематические',
  '23-febraury': '23 февраля',
  easter: 'Пасха',
  'teachers-day': 'День учителя',
  'educator-day': 'День воспитателя',
  '1-september': '1 сентября',
  graduation: 'Выпускной',
  'mather-day': 'День матери',
  'hat-boxes': 'Шляпные коробки',
  tulips: 'Тюльпаны'
}

function init() {
  const node = document.querySelector('.filters-block')
  if (node && !searchParams.get('id')) {
    createFilters(node.querySelector('.filters'))
    addListener(node)
  }
}

function createFilters(node) {
  const tags = {}
  document.querySelectorAll('.product-card').forEach((card) => {
    card.dataset.tags
      .split(',')
      .filter((tag) => tag !== '')
      .forEach((tag) => {
        tags[tag] = true
      })
  })
  if (Object.keys(tags).length > 1) {
    Object.keys(tags).forEach((tag) => {
      const checkbox = document.createElement('input')
      checkbox.classList.add('filter-toggle-checkbox')
      checkbox.setAttribute('type', 'checkbox')
      checkbox.setAttribute('id', 'filter-' + tag)
      checkbox.dataset.tag = tag
      node.appendChild(checkbox)

      const label = document.createElement('label')
      label.classList.add('filter-toggle-label')
      label.setAttribute('for', 'filter-' + tag)
      label.textContent = tagsMap[tag] || tag
      label.dataset.tag = tag
      node.appendChild(label)
    })
  }
}

function addListener(node) {
  node.addEventListener('click', (e) => {
    if (e.target.closest('.filter-toggle-label')) {
      updateFiltersState(e.target)
    } else if (e.target.closest('.clear-filter-button')) {
      clearFilters()
    }
  })
}

function clearFilters() {
  document.querySelectorAll('.filter-toggle-checkbox').forEach((checkbox) => {
    checkbox.checked = false
  })
  hideClearFilterButton()
  eventBus.dispatch('filters:update', {tags: []})
}

function updateFiltersState(filter) {
  const tags = []
  const curTag = filter.dataset.tag
  document.querySelectorAll('.filter-toggle-checkbox').forEach((checkbox) => {
    if (checkbox.dataset.tag === curTag && !checkbox.checked) {
      tags.push(curTag)
    } else if (checkbox.dataset.tag !== curTag && checkbox.checked) {
      tags.push(checkbox.dataset.tag)
    }
  })
  if (tags.length > 0) {
    showClearFilterButton()
  } else if (tags.length === 0) {
    hideClearFilterButton()
  }
  eventBus.dispatch('filters:update', {tags})
}

function showClearFilterButton() {
  document.querySelector('.clear-filter-button').classList.remove('hidden')
}

function hideClearFilterButton() {
  document.querySelector('.clear-filter-button').classList.add('hidden')
}

// init()
