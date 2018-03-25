/* eslint-disable import/no-extraneous-dependencies */
import Vue from 'vue';
import VueSocketio from 'vue-socket.io';
import config from '../config';

const { host, port } = config;

Vue.use(VueSocketio, `http://${host}:${port}`);
