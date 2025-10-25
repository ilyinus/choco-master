// productFilter.js
import eventBus from './eventDispatcher.js'

const state = {
  tags: {}
}

const el = {}

function init() {
  bindElements()
  if (!el.overlay) return // нет фильтров на странице — выходим

  const urlParams = new URLSearchParams(window.location.search)

  // Если открыт конкретный товар — фильтры не нужны
  if (urlParams.get('id')) {
    toggle(el.filterButtonEmpty, true)
    toggle(el.filterButton, false)
    toggle(el.filterButtonActive, false)
    return
  }

  initStateFromURL(urlParams)
  addListeners()

  if (hasActiveFilters()) {
    toggle(el.filterButton, false)
    toggle(el.filterButtonActive, true)
    applyFilters()
  } else {
    toggle(el.filterButtonEmpty, false)
  }
}

/* ---------- Initialization ---------- */

function bindElements() {
  el.content = document.querySelector('.content')
  el.overlay = document.getElementById('filters-overlay')
  el.filtersContent = document.getElementById('filters-content')
  el.filterButton = document.getElementById('filter-button')
  el.filterButtonActive = document.getElementById('filter-button-active')
  el.filterButtonEmpty = document.getElementById('filter-button-empty')
  el.closeBtn = document.getElementById('close-filters')
  el.applyButton = document.getElementById('filters-apply-button')
  el.clearButton = document.getElementById('clear-all-filters')
  el.tags = el.filtersContent
    ? Array.from(el.filtersContent.querySelectorAll('input[data-filter-tag]'))
    : []
}

/* ---------- State Management ---------- */

function initStateFromURL(urlParams) {
  state.tags = {}
  const tags = urlParams.get('tags')?.split(',') || []

  tags.forEach((tag) => {
    state.tags[tag] = true
  })

  el.tags.forEach((input) => {
    input.checked = !!state.tags[input.dataset.filterTag]
  })
}

function hasActiveFilters() {
  return Object.values(state.tags).some(Boolean)
}

/* ---------- Listeners ---------- */

function addListeners() {
  el.overlay.addEventListener('click', (e) => {
    if (e.target === el.overlay) closePanel()
  })

  el.filterButton.addEventListener('click', openPanel)
  el.filterButtonActive.addEventListener('click', openPanel)
  el.applyButton.addEventListener('click', updateFilters)
  el.closeBtn.addEventListener('click', closePanel)
  el.clearButton.addEventListener('click', clearAllFilters)
}

/* ---------- Core Logic ---------- */

function updateFilters() {
  const selected = el.tags
    .filter((i) => i.checked)
    .map((i) => i.dataset.filterTag)

  // Обновляем состояние
  state.tags = Object.fromEntries(selected.map((tag) => [tag, true]))

  // Обновляем URL без перезагрузки
  const baseUrl =
    window.location.protocol +
    '//' +
    window.location.host +
    window.location.pathname
  const query = selected.length ? '?tags=' + selected.join(',') : ''
  history.replaceState(null, '', baseUrl + query)

  // Применяем фильтры динамически
  applyFilters()

  // Обновляем видимость кнопок
  toggle(el.filterButtonActive, selected.length > 0)
  toggle(el.filterButton, selected.length === 0)
  toggle(el.clearButton, selected.length > 0)

  closePanel()
}

function applyFilters() {
  const tags = Object.keys(state.tags).filter((tag) => state.tags[tag])
  eventBus.dispatch('filters:update', {tags})
  playAnimation()
}

/* ---------- UI Control ---------- */

function openPanel() {
  el.overlay.classList.remove('hidden')
  if (hasActiveFilters()) toggle(el.clearButton, true)
  lockScroll()
}

function closePanel() {
  el.overlay.classList.add('hidden')

  // Возвращаем чекбоксы к текущему состоянию, если пользователь не применил фильтры
  el.tags.forEach((input) => {
    input.checked = !!state.tags[input.dataset.filterTag]
  })

  unlockScroll()
}

function clearAllFilters() {
  state.tags = {}
  el.tags.forEach((t) => (t.checked = false))

  const baseUrl =
    window.location.protocol +
    '//' +
    window.location.host +
    window.location.pathname
  history.replaceState(null, '', baseUrl)

  applyFilters()
  toggle(el.clearButton, false)
  toggle(el.filterButton, true)
  toggle(el.filterButtonActive, false)
  closePanel()
  playAnimation()
}

/* ---------- Helpers ---------- */

function lockScroll() {
  document.body.classList.add('lock-scroll')
}

function unlockScroll() {
  document.body.classList.remove('lock-scroll')
}

function toggle(element, visible) {
  if (!element) return
  element.classList.toggle('hidden', !visible)
}

function playAnimation() {
  if (!el.content) return
  el.content.classList.remove('fade-in')
  void el.content.offsetWidth
  el.content.classList.add('fade-in')
}

/* ---------- Init ---------- */
init()
