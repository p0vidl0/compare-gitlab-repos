import _ from 'lodash';
import urlencode from 'urlencode';
import request from 'request-promise-native';
import config from '../config';
import { io } from '../server';
import { statuses } from '../helpers/constants';

const apiUri = '/api/v4/projects';
const compareApiUri = '/repository/compare';
const compareWebUri = '/compare';
const createMRWebUri = '/merge_requests/new';

/**
 * Хранилище актуальных данных по репозиториям
 * @type {Array}
 */
let data = [];

/**
 * Формирование названия группы бранчей
 * @param {String} to - Целевой бранч. Пример: master
 * @param {String} from - Исходный бранч. Пример: dev
 * @return {String} - Пример: masterDev
 */
const makeBranchesTitle = ([to, from]) => `${to}${_.capitalize(from)}`;

const { gitlabUri, token, repos, branches } = config;

/**
 * Формирование начальных данных по группе бранчей
 * @param {String} repo - Название репозитория
 * @param {String} from - Исходный бранч. Пример: dev
 * @param {String} to - Целевой бранч. Пример: master
 * @return {{status: number, from: *, to: *, compareUri: string, createMRUri: string}}
 */
const initBranch = (repo, [from, to]) => ({
  status: 0,
  from,
  to,
  compareUri: `${gitlabUri}/${repo}${compareWebUri}/${from}...${to}`,
  createMRUri: `${gitlabUri}/${repo}${createMRWebUri}?merge_request%5Bsource_branch%5D=${to}&merge_request%5Btarget_branch%5D=${from}`,
});

/**
 * Формирование начальных данных по всем бранчам
 * @return {Array}
 */
const initData = () => {
  data = repos.map((repo, index) => ({
    repo,
    index,
    uri: `${gitlabUri}/${repo}`,
    [makeBranchesTitle(branches[0])]: initBranch(repo, branches[0]),
    [makeBranchesTitle(branches[1])]: initBranch(repo, branches[1]),
  }));

  return data;
};

/**
 * Асинхронный последовательный обход всех элементов массива
 * @param {Array} reducable
 * @param {Function} reducer
 */
const asyncMap = (reducable, reducer) => reducable.reduce(async (acc, i, index) => [...(await acc), await reducer(i, index)], []);

/**
 * Получение результатов сравнения пары бранчей
 * @param {Object} branch
 * @param {String} branch.from - Исходный бранч. Пример: dev
 * @param {String} branch.to - Целевой бранч. Пример: master
 * @param {Object} options
 * @return {Promise<*>}
 */
const fetchBranch = async (branch, options) => {
  try {
    options.qs = _.pick(branch, ['to', 'from']);
    const result = await request(options);
    if (result && result.commit !== null) {
      branch.status = statuses.unmerged;
    } else {
      branch.status = statuses.merged;
    }
  } catch (err) {
    branch.status = statuses.error;
  }

  return branch;
};

/**
 * Обновить данные по всем бранчам
 * Результаты возвращаются через веб-сокет, по мере их получения
 * @return {Promise<void>}
 */
const fetchAll = async () => {
  await asyncMap(data, async (item, index) => {
    const options = {
      json: true,
      method: 'GET',
      timeout: 1000,
      headers: { 'PRIVATE-TOKEN': token },
      uri: `${gitlabUri}${apiUri}/${urlencode(item.repo)}${compareApiUri}`,
    };

    // Логгируем в консоль прогресс
    console.log(options.uri);

    // Проверем первую пару
    data[index][makeBranchesTitle(branches[0])] = await fetchBranch(item[makeBranchesTitle(branches[0])], options);
    // Отправляем обновление данных
    io.emit('data', data);

    // Проверяем вторую пару
    data[index][makeBranchesTitle(branches[1])] = await fetchBranch(item[makeBranchesTitle(branches[1])], options);
    // Отправляем обновление данных
    io.emit('data', data);
  });
};

/**
 * Очистить данные по всем бранчам
 * @return {Array} - Новые данные
 */
const getAll = () => initData();

/**
 * Обновить данные по всем бранчам
 * Результаты возвращаются через веб-сокет, по мере их получения
 * @return {Array}
 */
const updateAll = () => {
  fetchAll().catch(err => {
    // Логгируем ошибку в консоль
    console.error('logic.updateAll', err);
    // И отправляем всем подписчикам
    io.emit('fetch error', err);
  });

  return initData();
};

export default {
  getAll,
  updateAll,
  data: {
    repos,
    branches,
  },
};
