import { register } from 'node:module';

register('./loader-compiled.mjs', import.meta.url);
