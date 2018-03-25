// Токен для доступа к API Gitlab
const token = '123';
// Адрес сервера Gitlab
const gitlabUri = 'https://gitlab.com';

// Список репозиториев для проверки
const repos = [
  'user/repository1',
  'user/repository2',
  'user/repository3',
];

// Список групп бранчей для сравнения
const branches = [
  ['master', 'dev'],
  ['prod', 'master'],
];

export default {
  token,
  gitlabUri,
  repos,
  branches,
};