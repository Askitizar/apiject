import { fetchMeals } from './api.js';
import { renderStatus, renderMeals, openMealModal } from './ui.js';

const STORAGE_KEY = 'meal_explorer_favorites';

const state = {
  meals: [],
  searchQuery: '',
  category: 'all',
  sortBy: 'name-asc',
  onlyFavorites: false,
  favorites: new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')),
  isLoading: false,
};

const searchInput = document.querySelector('#search-input');
const categorySelect = document.querySelector('#category-select');
const sortSelect = document.querySelector('#sort-select');
const favToggleBtn = document.querySelector('#favorites-toggle');
const favCountSpan = document.querySelector('#fav-count');
const resetBtn = document.querySelector('#reset-btn');
const statusBox = document.querySelector('#status-box');
const grid = document.querySelector('#meals-grid');
const modal = document.querySelector('#meal-modal');
const modalBody = document.querySelector('#modal-body');
const closeModalBtn = document.querySelector('#close-modal');

async function loadData() {
  if (state.isLoading) return;
  state.isLoading = true;

  grid.replaceChildren();
  renderStatus(statusBox, { type: 'loading', message: 'Загрузка рецептов...' });

  try {
    const data = await fetchMeals(state.searchQuery);
    state.meals = data;
    applyFiltersAndRender();
  } catch (error) {
    console.error('Ошибка при запросе к API:', error);
    renderStatus(statusBox, {
      type: 'error',
      message: 'Не удалось загрузить рецепты. Проверьте подключение к интернету.',
      onRetry: loadData,
    });
  } finally {
    state.isLoading = false;
  }
}

function applyFiltersAndRender() {
  favCountSpan.textContent = state.favorites.size;
  favToggleBtn.classList.toggle('active', state.onlyFavorites);

  let result = [...state.meals];

  if (state.category !== 'all') {
    result = result.filter((m) => m.strCategory === state.category);
  }

  if (state.onlyFavorites) {
    result = result.filter((m) => state.favorites.has(m.idMeal));
  }

  result.sort((a, b) => {
    const nameA = a.strMeal || '';
    const nameB = b.strMeal || '';
    return state.sortBy === 'name-desc'
      ? nameB.localeCompare(nameA)
      : nameA.localeCompare(nameB);
  });

  if (result.length === 0) {
    grid.replaceChildren();
    renderStatus(statusBox, {
      type: 'empty',
      message: 'По вашему запросу рецептов не найдено. Попробуйте изменить фильтры.',
    });
    return;
  }

  renderStatus(statusBox, { message: '' });
  renderMeals(grid, result, state.favorites, {
    onOpenDetails: (meal) => openMealModal(modal, modalBody, meal),
    onToggleFavorite: toggleFavorite,
  });
}

function toggleFavorite(mealId) {
  if (state.favorites.has(mealId)) {
    state.favorites.delete(mealId);
  } else {
    state.favorites.add(mealId);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...state.favorites]));
  applyFiltersAndRender();
}

let debounceTimer = null;
searchInput.addEventListener('input', (event) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    state.searchQuery = event.target.value;
    loadData();
  }, 400);
});

categorySelect.addEventListener('change', (event) => {
  state.category = event.target.value;
  applyFiltersAndRender();
});

sortSelect.addEventListener('change', (event) => {
  state.sortBy = event.target.value;
  applyFiltersAndRender();
});

favToggleBtn.addEventListener('click', () => {
  state.onlyFavorites = !state.onlyFavorites;
  applyFiltersAndRender();
});

resetBtn.addEventListener('click', () => {
  const needReload = state.searchQuery !== '';
  state.searchQuery = '';
  state.category = 'all';
  state.sortBy = 'name-asc';
  state.onlyFavorites = false;

  searchInput.value = '';
  categorySelect.value = 'all';
  sortSelect.value = 'name-asc';

  if (needReload) {
    loadData();
  } else {
    applyFiltersAndRender();
  }
});

closeModalBtn.addEventListener('click', () => modal.close());
modal.addEventListener('click', (event) => {
  if (event.target === modal) modal.close();
});

loadData();