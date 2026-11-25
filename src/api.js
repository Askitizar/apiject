const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';


export async function fetchMeals(searchQuery = '') {
  const trimmed = searchQuery.trim();
  const endpoint = `${BASE_URL}/search.php?s=${encodeURIComponent(trimmed)}`;

  const response = await fetch(endpoint);

  if (!response.ok) {
    throw new Error(`Ошибка сервера: HTTP ${response.status}`);
  }

  const data = await response.json();

  return Array.isArray(data.meals) ? data.meals : [];
}