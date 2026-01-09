---
layout: default
title: Главная
---

<div class="main-content">
    <div class="article-header">
        <h1 id="article-title">Добро пожаловать!</h1>
        <p id="article-area">Выберите статью из списка слева</p>
    </div>
    
    <div id="article-content">
        <div class="welcome-message">
            <h2>HAHA</h2>
            <p>Выберите статью из списка слева чтобы начать чтение.</p>
            
            <div class="stats">
                <p>📚 Всего статей: <span id="total-articles">0</span></p>
                <p>🌐 Доступно языков: русский, английский</p>
            </div>
        </div>
    </div>
</div>

<script>
// Показываем статистику
document.addEventListener('DOMContentLoaded', () => {
    if (typeof ARTICLES !== 'undefined') {
        document.getElementById('total-articles').textContent = ARTICLES.length;
    }
});
</script>