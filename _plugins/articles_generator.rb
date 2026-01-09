module Jekyll
  class ArticlesGenerator < Generator
    safe true
    priority :high

    def generate(site)
      puts "📚 Генерация списка статей..."
      
      # Собираем все статьи
      articles = collect_articles
      
      # Сохраняем в разных форматах
      save_articles_data(site, articles)
      save_articles_json(articles)
      save_articles_js(articles)
      
      puts "✅ Сгенерировано #{articles.length} статей"
    end

    private

    # Основная функция сбора статей
    def collect_articles
      articles_hash = {}
      
      # Ищем все .md файлы по шаблону: 
      # articles/область/тема_статьи/язык/тема_статьи.md
      Dir.glob("articles/**/*/*/*.md").each do |file_path|
        begin
          # Парсим путь: articles/область/тема/язык/тема.md
          # Пример: articles/цифровые-схемы/триггеры/ru/триггеры.md
          parts = file_path.split('/')
          
          # Проверяем структуру: минимум 5 частей
          if parts.length >= 5 && parts[0] == 'articles'
            area = parts[1]               # цифровые-схемы
            topic_dir = parts[2]          # триггеры (папка)
            lang = parts[3]               # ru
            filename = parts[4]           # триггеры.md
            
            # Проверяем, что имя папки и файла совпадают (тема_статьи)
            topic_name = File.basename(filename, '.md')
            
            if topic_dir == topic_name
              article_id = topic_name  # используем тему как ID
              
              # Ищем или создаем статью
              article = articles_hash[article_id] || {
                'id' => article_id,
                'title' => {},
                'file' => {},
                'area' => area,  # вместо category
                'topic' => topic_name
              }
              
              # Добавляем перевод
              article['title'][lang] = extract_title(file_path, article_id)
              article['file'][lang] = "/#{file_path}"
              
              # Сохраняем
              articles_hash[article_id] = article
            else
              puts "⚠️ Несоответствие: папка '#{topic_dir}' ≠ файл '#{topic_name}.md'"
            end
          end
        rescue => e
          puts "⚠️ Ошибка обработки файла #{file_path}: #{e.message}"
        end
      end
      
      # Преобразуем хеш в отсортированный массив
      articles_hash.values.sort_by { |a| a['id'] }
    end

    # Извлекаем заголовок из файла
    def extract_title(file_path, default_title = nil)
      content = File.read(file_path, encoding: 'utf-8')
      
      # Вариант 1: Ищем заголовок H1 (# Заголовок)
      if match = content.match(/^#\s+(.+)$/)
        title = match[1].strip
        return title unless title.empty?
      end
      
      # Вариант 2: Ищем в Front Matter
      if content =~ /^---\s*\n(.*?)\n---\s*\n/m
        begin
          front_matter = YAML.safe_load($1)
          return front_matter['title'] if front_matter && front_matter['title']
        rescue
          # Если YAML не парсится, игнорируем
        end
      end
      
      # Вариант 3: Используем переданное название темы
      return format_title(default_title) if default_title
      
      # Вариант 4: Используем имя файла
      filename = File.basename(file_path, '.md')
      format_title(filename)
    end
    
    # Форматируем название (триггеры → Триггеры)
    def format_title(filename)
      filename.gsub(/[-_]/, ' ').split.map(&:capitalize).join(' ')
    end

    # Сохраняем в site.data для Liquid
    def save_articles_data(site, articles)
      site.data['articles'] = articles
    end

    # Создаем JSON файл
    def save_articles_json(articles)
      json_path = '_data/articles.json'
      json_content = JSON.pretty_generate(articles)
      File.write(json_path, json_content)
      puts "📄 Создан #{json_path}"
    end

    # Создаем JS файл для прямого подключения
    def save_articles_js(articles)
      js_dir = 'assets/js'
      Dir.mkdir(js_dir) unless Dir.exist?(js_dir)
      
      js_path = File.join(js_dir, 'articles-data.js')
      js_content = "// Автоматически сгенерированный список статей\n" +
                  "const ARTICLES = #{JSON.pretty_generate(articles)};\n" +
                  "// Всего статей: #{articles.length}\n" +
                  "// Структура: articles/область/тема/язык/тема.md\n"
      
      File.write(js_path, js_content)
      puts "📄 Создан #{js_path}"
    end
  end
end