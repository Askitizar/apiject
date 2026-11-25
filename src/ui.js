export function renderStatus(container, { type, message, onRetry }) {
  container.replaceChildren();
  container.className = 'status-box';

  if (!message) return;

  if (type === 'error') {
    container.classList.add('error');
  }

  const text = document.createElement('p');
  text.textContent = message;
  container.append(text);

  if (type === 'error' && typeof onRetry === 'function') {
    const retryBtn = document.createElement('button');
    retryBtn.type = 'button';
    retryBtn.className = 'btn btn--primary';
    retryBtn.style.marginTop = '10px';
    retryBtn.textContent = 'Повторить попытку';
    retryBtn.addEventListener('click', onRetry);
    container.append(retryBtn);
  }
}

export function renderMeals(gridContainer, meals, favoritesSet, handlers) {
  gridContainer.replaceChildren();
  const fragment = document.createDocumentFragment();

  for (const meal of meals) {
    const id = meal.idMeal;
    const isFav = favoritesSet.has(id);

    const card = document.createElement('article');
    card.className = 'card';

    const img = document.createElement('img');
    img.className = 'card__flag';
    img.src = meal.strMealThumb || '';
    img.alt = meal.strMeal || 'Фото блюда';
    img.loading = 'lazy';

    const body = document.createElement('div');
    body.className = 'card__body';

    const title = document.createElement('h2');
    title.className = 'card__title';
    title.textContent = meal.strMeal || 'Без названия';

    const category = document.createElement('p');
    category.className = 'card__info';
    category.textContent = `Категория: ${meal.strCategory || '—'}`;

    const area = document.createElement('p');
    area.className = 'card__info';
    area.textContent = `Кухня мира: ${meal.strArea || '—'}`;

    const actions = document.createElement('div');
    actions.className = 'card__actions';

    const detailsBtn = document.createElement('button');
    detailsBtn.type = 'button';
    detailsBtn.className = 'btn btn--primary';
    detailsBtn.textContent = 'Рецепт';
    detailsBtn.addEventListener('click', () => handlers.onOpenDetails(meal));

    const favBtn = document.createElement('button');
    favBtn.type = 'button';
    favBtn.className = `btn btn--secondary ${isFav ? 'active' : ''}`;
    favBtn.textContent = isFav ? '★ В избранном' : '☆ В избранное';
    favBtn.addEventListener('click', () => handlers.onToggleFavorite(id));

    actions.append(detailsBtn, favBtn);
    body.append(title, category, area, actions);
    card.append(img, body);
    fragment.append(card);
  }

  gridContainer.append(fragment);
}

export function openMealModal(modal, modalBody, meal) {
  modalBody.replaceChildren();

  const img = document.createElement('img');
  img.className = 'modal__flag';
  img.src = meal.strMealThumb || '';
  img.alt = meal.strMeal || 'Фото блюда';

  const title = document.createElement('h2');
  title.textContent = meal.strMeal;

  const meta = document.createElement('p');
  meta.className = 'card__info';
  meta.style.marginTop = '4px';
  meta.textContent = `Категория: ${meal.strCategory} • Кухня: ${meal.strArea}`;

  // Собираем список ингредиентов из полей strIngredient1..20 и strMeasure1..20
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`]?.trim();
    const measure = meal[`strMeasure${i}`]?.trim();
    if (ing) {
      ingredients.push(measure ? `${ing} — ${measure}` : ing);
    }
  }

  const ingTitle = document.createElement('h3');
  ingTitle.style.marginTop = '14px';
  ingTitle.style.fontSize = '1rem';
  ingTitle.textContent = 'Ингредиенты:';

  const list = document.createElement('ul');
  list.className = 'modal__list';
  for (const item of ingredients) {
    const li = document.createElement('li');
    li.textContent = `• ${item}`;
    list.append(li);
  }

  const instTitle = document.createElement('h3');
  instTitle.style.marginTop = '14px';
  instTitle.style.fontSize = '1rem';
  instTitle.textContent = 'Инструкция приготовления:';

  const instructions = document.createElement('p');
  instructions.style.marginTop = '6px';
  instructions.style.fontSize = '0.9rem';
  instructions.style.maxHeight = '180px';
  instructions.style.overflowY = 'auto';
  instructions.textContent = meal.strInstructions || 'Описание отсутствует.';

  modalBody.append(img, title, meta, ingTitle, list, instTitle, instructions);
  modal.showModal();
}