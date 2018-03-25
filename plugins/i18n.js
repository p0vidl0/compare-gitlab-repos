import Vue from 'vue';
import _ from 'lodash';
import VueI18n from 'vue-i18n';

Vue.use(VueI18n);

const parseMessages = (messages) => {
  return Object.entries(messages).reduce((acc, [category, msgs]) => {
    Object.entries(msgs).forEach(([term, item]) => {
      Object.entries(item).forEach(([lang, msg]) => {
        _.set(acc, `${lang}.${category}.${term}`, msg);
      });
    });

    return acc;
  }, {});
};

export default ({ app, store }) => {
  app.i18n = new VueI18n({
    locale: 'ru',
    fallbackLocale: 'ru',
    messages: parseMessages(require('../config/messages.json')),
  });

  app.i18n.path = (link) => {
    if (app.i18n.locale === app.i18n.fallbackLocale) {
      return `/${link}`;
    }

    return `/${app.i18n.locale}/${link}`;
  };
};
