// assets/js/articles-loader.js
let currentLang = 'ru';
let currentArticle = null;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Articles Loader запущен');
  
  // Проверяем, загружены ли данные статей
  if (typeof ARTICLES === 'undefined') {
    console.error('❌ ARTICLES не определена! Проверьте загрузку articles-data.js');
    return;
  }
  
  console.log(`📚 Загружено статей: ${ARTICLES.length}`);
  
  // Инициализируем интерфейс
  renderArticlesList();
  setupEventListeners();
  
  // Загружаем статью из URL, если есть
  loadArticleFromURL();
});

// Функция отрисовки списка статей
function renderArticlesList() {
  const container = document.getElementById('articles-list');
  if (!container) {
    console.error('❌ Не найден элемент #articles-list');
    return;
  }
  
  container.innerHTML = '';
  
  // Группируем статьи по областям
  const articlesByArea = {};
  ARTICLES.forEach(article => {
    if (!articlesByArea[article.area]) {
      articlesByArea[article.area] = [];
    }
    articlesByArea[article.area].push(article);
  });
  
  // Создаем интерфейс
  Object.entries(articlesByArea).forEach(([area, articles]) => {
    const areaSection = document.createElement('div');
    areaSection.className = 'area-section';
    
    areaSection.innerHTML = `
      <h3 class="area-title">${formatAreaName(area)}</h3>
      <div class="articles-grid">
        ${articles.map(article => `
          <div class="article-card" data-id="${article.id}">
            <h4>${article.title[currentLang] || article.title.ru || article.id}</h4>
            <button onclick="loadArticle('${article.id}')" class="read-btn">
              Читать
            </button>
            <div class="lang-badges">
              ${Object.keys(article.file).map(lang => 
                `<span class="lang-badge ${lang}">${lang.toUpperCase()}</span>`
              ).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;
    
    container.appendChild(areaSection);
  });
}

// Загрузка статьи
async function loadArticle(articleId) {
  const article = ARTICLES.find(a => a.id === articleId);
  if (!article) {
    console.error(`❌ Статья "${articleId}" не найдена`);
    return;
  }
  
  currentArticle = article;
  
  // Обновляем UI
  document.getElementById('article-title').textContent = 
    article.title[currentLang] || article.title.ru || article.id;
  
  document.getElementById('article-area').textContent = 
    `Область: ${formatAreaName(article.area)}`;
  
  // Показываем загрузку
  const contentDiv = document.getElementById('article-content');
  contentDiv.innerHTML = '<div class="loading">Загрузка статьи...</div>';
  
  try {
    // Загружаем Markdown
    const response = await fetch(article.file[currentLang]);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const markdown = await response.text();
    
    // Конвертируем в HTML
    const html = window.marked ? marked.parse(markdown) : markdown;
    
    // Отображаем
    contentDiv.innerHTML = html;
    
    // Обновляем URL
    updateURL(articleId);
    
    // Подсвечиваем выбранную статью
    highlightSelectedArticle(articleId);
    
    console.log(`✅ Загружена статья: ${articleId} (${currentLang})`);
    
  } catch (error) {
    contentDiv.innerHTML = `
      <div class="error">
        <h3>Ошибка загрузки</h3>
        <p>${error.message}</p>
        <button onclick="loadArticle('${articleId}')">Повторить</button>
      </div>
    `;
    console.error('❌ Ошибка загрузки статьи:', error);
  }
}

// Вспомогательные функции
function formatAreaName(area) {
  return area.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

function updateURL(articleId) {
  const url = new URL(window.location);
  url.searchParams.set('article', articleId);
  url.searchParams.set('lang', currentLang);
  history.pushState({ articleId, lang: currentLang }, '', url);
}

function setupEventListeners() {
  // Смена языка
  const langSelect = document.getElementById('language');
  if (langSelect) {
    langSelect.addEventListener('change', (e) => {
      currentLang = e.target.value;
      if (currentArticle) {
        loadArticle(currentArticle.id);
      }
      renderArticlesList(); // Обновляем названия в списке
    });
  }
  
  // Кнопки навигации
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Логика навигации
    });
  });
  
  // Обработка истории браузера
  window.addEventListener('popstate', (event) => {
    if (event.state) {
      currentLang = event.state.lang || 'ru';
      if (event.state.articleId) {
        loadArticle(event.state.articleId);
      }
    }
  });
}

function loadArticleFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const articleId = urlParams.get('article');
  const lang = urlParams.get('lang');
  
  if (lang) {
    currentLang = lang;
    const langSelect = document.getElementById('language');
    if (langSelect) langSelect.value = lang;
  }
  
  if (articleId) {
    setTimeout(() => loadArticle(articleId), 100);
  }
}

// Делаем функции глобальными для onclick атрибутов
window.loadArticle = loadArticle;