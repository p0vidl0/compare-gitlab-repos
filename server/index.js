import Koa from 'koa';
import opn from 'opn';
import http from 'http';
import cors from 'koa2-cors';
import IO from 'koa-socket.io';
import { Nuxt, Builder } from 'nuxt';
import router from './routes';
import config from '../config';
import nuxtConfig from '../nuxt.config.js';

let io;
const { host, port } = config;

const buildNuxt = async (app) => {
  nuxtConfig.dev = app.env !== 'production';
  const nuxt = new Nuxt(nuxtConfig);
  if (nuxtConfig.dev) {
    const builder = new Builder(nuxt);
    await builder.build();
  }

  return nuxt;
};

const start = async () => {
  const app = new Koa();
  const server = http.createServer(app.callback());

  const nuxt = await buildNuxt(app);

  app
    .use(cors())
    .use(router.routes())
    .use(async (ctx, next) => {
      await next();
      ctx.status = 200; // koa defaults to 404 when it sees that status is unset

      return new Promise((resolve, reject) => {
        ctx.res
          .on('close', resolve)
          .on('finish', resolve);

        nuxt.render(ctx.req, ctx.res, promise => {
          // nuxt.render passes a rejected promise into callback on error.
          promise
            .then(resolve)
            .catch(reject);
        })
      })
    });

  io = new IO({ namespace: '/' });
  io.start(server);

  server
    .on('error', function (error) {
      console.log(error);
    })
    .listen(port, host);

  console.log(`Server listening on ${host}:${port}`)
};

start()
  .then(() => {
    if (config.env.NODE_ENV === 'production') {
      return opn(`http://${host}:${port}`);
    }

    return null;
  })
  .catch((err) => console.error('Error on browser open', err));

export {
  io,
};
