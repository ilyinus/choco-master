import eventBus from './eventDispatcher.js'

const searchParams = new URLSearchParams(window.location.search)
const curFilters = {}
const elements = {}

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
  bindelements()
  if (!searchParams.get('id')) {
    elements.emptySvg.classList.add('hidden')
    addListeners()
  } else {
    hideFilterButton()
    hideFilterButtonActive()
    elements.emptySvg.classList.remove('hidden')
  }
}

function bindelements() {
  elements.overlay = document.getElementById('filters-overlay')
  elements.filtersContent = document.getElementById('filters-content')
  elements.filterButton = document.getElementById('filter-button')
  elements.filterButtonActive = document.getElementById('filter-button-active')
  elements.closeBtn = document.getElementById('close-filters')
  elements.filtersApplyButton = document.getElementById('filters-apply-button')
  elements.clearAllFiltersButton = document.getElementById('clear-all-filters')
  elements.tags = Array.from(elements.filtersContent.getElementsByTagName('input'))
  elements.emptySvg = document.getElementById('empty-svg')  
}

function addListeners() {
  elements.overlay.addEventListener('click', (e) => {    
    if (e.target === elements.overlay) closePannel()
  })
  elements.filterButton.addEventListener('click', openPannel)
  elements.filterButtonActive.addEventListener('click', openPannel)
  elements.closeBtn.addEventListener('click', closePannel)
  elements.filtersApplyButton.addEventListener('click', applyFilters)
  elements.clearAllFiltersButton.addEventListener('click', clearAllFilters)
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

function clearAllFilters() {
  curFilters.tags = {}
  closePannel()
  hideClearAllFiltersButton()
  eventBus.dispatch('filters:update', {tags: []})
}

function applyFilters() {
  const tags = []
  elements.tags.forEach(input => {        
    if (input.checked) {
      tags.push(input.dataset.filterTag)      
    }
    curFilters.tags[input.dataset.filterTag] = input.checked
  })  
  closePannel(false)  
  eventBus.dispatch('filters:update', {tags})
}

function closePannel(resetFilters = true) {
  elements.overlay.classList.add('hidden')
  if (resetFilters) {    
    elements.tags.forEach(tag => {
      if (tag.dataset.filterTag) {        
        tag.checked = curFilters.tags[tag.dataset.filterTag]
      }
    })
  }
  if (isFiltersSet()) {
    showFilterButtonActive()
    hideFilterButton()
  } else {
    hideFilterButtonActive()
    showFilterButton()
  }
  unlockPageScroll()
}

function openPannel() {
  elements.overlay.classList.remove('hidden')
  fillCurTags()
  lockPageScroll()
}

function fillCurTags() {
  curFilters.tags = {}
  let tagsExists = false
  elements.tags.forEach(tag => {
    if (tag.dataset.filterTag) {
      curFilters.tags[tag.dataset.filterTag] = tag.checked
      tagsExists = tagsExists || tag.checked
    }
  })  
  if (tagsExists) {
    showClearAllFiltersButton()
  }
}

function isFiltersSet() {
  let tagsExists = false  
  Object.keys(curFilters.tags).forEach(tag => tagsExists = tagsExists || curFilters.tags[tag])
  return tagsExists
}

function lockPageScroll() {
  document.body.classList.add('lock-scroll')
}

function unlockPageScroll() {
  document.body.classList.remove('lock-scroll')
}

function showClearAllFiltersButton() {
  elements.clearAllFiltersButton.classList.remove('hidden')
}

function hideClearAllFiltersButton() {
  elements.clearAllFiltersButton.classList.add('hidden')
}

function showFilterButtonActive() {  
  elements.filterButtonActive.classList.remove('hidden')
}

function hideFilterButtonActive() {
  elements.filterButtonActive.classList.add('hidden')
}

function showFilterButton() {
  elements.filterButton.classList.remove('hidden')
}

function hideFilterButton() {
  elements.filterButton.classList.add('hidden')
}

init()
