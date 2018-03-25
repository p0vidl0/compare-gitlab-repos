# Панель контроля состояния репозиториев

![Скриншот_2018-03-25_10.23.38](https://gitlab.com/p0vidl0/compare-gitlab-repos/uploads/1305386ac1c9362cd98c13c47650f617/%D0%A1%D0%BA%D1%80%D0%B8%D0%BD%D1%88%D0%BE%D1%82_2018-03-25_10.23.38.png)

## Подготовка и запуск

### Настройка данных
1. Скопировать .env.example.js в .env.js
2. Указать актуальные данные

### Работа с командной строкой
``` bash
# Установка зависимостей
$ npm install

# Запуск для разработки с горячей перезагрузкой по адресу http://localhost:3003
$ npm run dev

# Сборка и запуск для эксплуатации
$ npm run build
$ npm start

```

### Использованы технологии
* Nuxt.js
* Vue.js
* Koa.js
* Socket.io
* Node.js
* Gitlab API
