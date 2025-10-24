import eventBus from './eventDispatcher.js'

const searchParams = new URLSearchParams(window.location.search)
const curPage = window.location.protocol + '//' + window.location.host + window.location.pathname
const curFilters = {}
const elements = {}

function init() {
  bindelements()

  if (searchParams.get('id')) {
    hideFilterButton()
    hideFilterButtonActive()
    showFilterButtonEmpty()
    return
  } else {
    hideFilterButtonEmpty()
  }

  addListeners()  
  initCurFilters()

  if (isFiltersSet()) {
    hideFilterButton()
    showFilterButtonActive()
    applyFilters()
  }
}

function initCurFilters() {
  curFilters.tags = []
  const tagsParams = searchParams.get('tags')?.split(',') || []
  
  tagsParams.forEach(tag => {
    curFilters.tags[tag] = true
  })

  elements.tags.forEach(tag => {
    if (curFilters.tags[tag.dataset.filterTag]) {
      tag.checked = true
    }
  })
}

function bindelements() {
  elements.overlay = document.getElementById('filters-overlay')
  elements.filtersContent = document.getElementById('filters-content')
  elements.filterButton = document.getElementById('filter-button')
  elements.filterButtonActive = document.getElementById('filter-button-active')
  elements.filterButtonEmpty = document.getElementById('filter-button-empty')
  elements.closeBtn = document.getElementById('close-filters')
  elements.filterButtonApply = document.getElementById('filters-apply-button')
  elements.clearAllFiltersButton = document.getElementById('clear-all-filters')
  elements.tags = Array.from(elements.filtersContent.getElementsByTagName('input'))
  elements.emptyFilterButton = document.getElementById('empty-filter-button')
}

function addListeners() {
  elements.overlay.addEventListener('click', (e) => {    
    if (e.target === elements.overlay) closePannel()
  })
  elements.filterButton.addEventListener('click', openPannel)
  elements.filterButtonActive.addEventListener('click', openPannel)
  elements.filterButtonApply.addEventListener('click', updateFilters)
  elements.closeBtn.addEventListener('click', closePannel)  
  elements.clearAllFiltersButton.addEventListener('click', clearAllFilters)
}

function clearAllFilters() {
  window.location.href = curPage
}

function updateFilters() {
  const searchParams = []
  elements.tags.forEach(input => {    
    if (input.checked) {      
      searchParams.push(input.dataset.filterTag)
    }    
  })  
  if (searchParams.length > 0) {
    window.location.href = curPage + "?tags=" + searchParams.join(',')
  } else {
    window.location.href = curPage
  }
}

function applyFilters() {
  const tags = []
  elements.tags.forEach(tag => {        
    if (tag.checked) {
      tags.push(tag.dataset.filterTag)
    }
  })
  eventBus.dispatch('filters:update', {tags})  
}

function closePannel() {
  elements.overlay.classList.add('hidden')
  elements.tags.forEach(tag => {    
    tag.checked = curFilters.tags[tag.dataset.filterTag]    
  })
  unlockPageScroll()
}

function openPannel() {
  elements.overlay.classList.remove('hidden')  
  if (isFiltersSet()) {
    showClearAllFiltersButton()
  }
  lockPageScroll()
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

function hideFilterButtonEmpty() {
  elements.filterButtonEmpty.classList.add('hidden')
}

function showFilterButtonEmpty() {
  elements.filterButtonEmpty.classList.remove('hidden')
}

function showFilterButton() {
  elements.filterButton.classList.remove('hidden')
}

function hideFilterButton() {
  elements.filterButton.classList.add('hidden')
}

function showFilterButtonActive() {  
  elements.filterButtonActive.classList.remove('hidden')
}

function hideFilterButtonActive() {
  elements.filterButtonActive.classList.add('hidden')
}

init()
