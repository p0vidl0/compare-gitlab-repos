<template>
  <div class="container">
    <b-row align-h="between">
      <b-col md="6">
        <h1 class="title">{{ $t('app.title') }}</h1>
      </b-col>
      <b-col md="2">
        <multiselect
                v-model="langSelected"
                placeholder="Выберите язык"
                label="title"
                track-by="title"
                :options="langOptions"
                :option-height="104"
                :show-labels="false"
                @select="langChanged"
                class="mt-2"
        >
          <template slot="option" slot-scope="props">
            <img class="option__image" :src="props.option.img" :alt="props.option.alt" width="25px" height="auto">&nbsp;
            <span class="option__title">{{ props.option.title }}</span>
          </template>
        </multiselect>
      </b-col>
    </b-row>
    <b-row>
      <b-col md="6" sm="2" cols="12">
        <b-btn @click="updateAll" size="sm">{{ $t('app.refresh') }}</b-btn>
      </b-col>
      <b-col md="6" sm="10" cols="12">
        <b-form-group>
          <b-form-radio-group id="btnradios1"
                              buttons
                              button-variant="outline-secondary"
                              size="sm"
                              v-model="filterSelected"
                              :options="filterOptions"
                              name="radiosBtnDefault"
                              class="float-right"/>
        </b-form-group>
      </b-col>
    </b-row>

    <b-table
            striped
            hover
            :items="items"
            :fields="fields"
            :small="true"
            :filter="myFilter"
    >
      <template slot="repo" slot-scope="data">
        <b-link :href="data.item.uri" target="_blank">{{ data.item.repo }}</b-link>
      </template>
      <template slot="masterDev" slot-scope="row">
        <my-column :values="row.value"/>
      </template>
      <template slot="prodMaster" slot-scope="row">
        <my-column :values="row.value"/>
      </template>
    </b-table>
  </div>
</template>

<script>
  import _ from 'lodash';
  import axios from 'axios';
  import Multiselect from 'vue-multiselect';
  import config from '../config';
  import { statuses } from '../helpers/constants';
  import MyColumn from '../components/MyColumn.vue';

  const { host, port } = config;
  const backendUri = `http://${host}:${port}`;
  const reposUri = `${backendUri}/repos`;

  export default {
    components: {
      MyColumn,
      Multiselect,
    },
    methods: {
      /**
       * Обработчик изменения языка интерфейса
       * @param {Object} lang
       * @param {String} lang.value - Код языка
       */
      langChanged(lang) {
        this.$root._i18n.locale = lang.value; // Записываем новый язык в компонент переводов
        Object.assign(this, this.getData());  // Обновляем интерфейс для нового языка
      },
      /**
       * Фильтрация строк по статусу бранчей
       * @param {Object} data - Данные строки
       * @param {Object} data.masterDev - Данные по сравренияю бранчей master и dev
       * @param {Number} data.masterDev.status - Результат сравнения бранчей master и dev
       * @param {Object} data.prodMaster - Данные по сравренияю бранчей prod и master
       * @param {Number} data.prodMaster.status - Результат сравнения бранчей prod и master
       * @return {Boolean}
       */
      myFilter(data) {
        const filter = this.filterSelected; // Текущее значение фильтра
        const filterStatuses = [
          data.masterDev.status,
          data.prodMaster.status,
        ];

        return filter === null || filterStatuses.includes(filter);
      },
      /**
       * Сброс фильтра по статусу бранчей
       */
      showAll() {
        this.filter = null;
      },
      /**
       * Подготовка параметров интерфейса с учетом текущего языка
       * @return {{fields: Object[], filterOptions: Object[]}}
       */
      getData() {
        /**
         * Описание полей и заголовков для таблицы
         * @type {Object[]}
         */
        const fields = [
          {
            key: 'repo',
            sortable: true,
            label: this.$t('app.repository'),
            formatter: (value, key, item) => _.pick(item, ['repo', 'uri'])
          },
          { key: 'masterDev', label: 'Dev -> Master', sortable: true },
          { key: 'prodMaster', label: 'Master -> Prod', sortable: true },
        ];

        /**
         * Описание параметров вильтра по статусу
         * @type {Object[]}
         */
        const filterOptions = [
          { text: this.$t('app.all'), value: null },
          { text: this.$t('app.error'), value: statuses.error },
          { text: this.$t('app.merged'), value: statuses.merged },
          { text: this.$t('app.unknown'), value: statuses.unknown },
          { text: this.$t('app.unmerged'), value: statuses.unmerged },
        ];

        return {
          fields,
          filterOptions,
        };
      },
      /**
       * Выполнение запроса обновления данных по репозиториям
       * @return {Promise<void>}
       */
      async updateAll() {
        const res = await axios.post(reposUri);
        this.items = res.data;
      },
    },
    /**
     * Подключение к веб-сокету после создания компонента
     */
    created() {
      if (this.$options.sockets) {
        this.$options.sockets.data = (data) => {
          this.items = data;
        };
      }
    },
    /**
     * Формирование основных данных
     * @return {Object}
     */
    data() {
      const languages = {
        ru: { title: 'Русский', value: 'ru', img: '/flags/ru.png', imgAlt: 'Русский' },
        en: { title: 'English', value: 'en', img: '/flags/us.png', imgAlt: 'English' },
      };

      return {
        statuses,
        filter: null,
        filterSelected: null,
        langSelected: languages.ru,
        langOptions: Object.values(languages),
        ...this.getData(),
      };
    },
    /**
     * Получение первоначальных данных по всем репозиториям
     * @return {Promise<Object>}
     */
    asyncData() {
      return axios.get(reposUri)
        .then(res => ({ items: res.data }));
    },
    /**
     * Формирование мета-тегов
     * @return {{title: *}}
     */
    head() {
      return {
        title: this.$t('app.title'),
      };
    },
  };
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
<style>
  .row+.row {
    margin-top: 8px;
  }
</style>
