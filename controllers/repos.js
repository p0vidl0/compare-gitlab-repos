import repo from '../logic/repo';

const getAll = (ctx) => {
  ctx.body = repo.getAll();
};

const updateAll = async (ctx) => {
  ctx.body = await repo.updateAll();
};

export default {
  getAll,
  updateAll,
};
