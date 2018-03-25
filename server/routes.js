import Router from 'koa-router';
import repos from '../controllers/repos';

const router = new Router();

router
  .get('/repos', repos.getAll)
  .post('/repos', repos.updateAll)
;

export default router;
