import {
  createMetronomeGetLoadContext,
  registerMetronome
} from '@metronome-sh/vercel';
import { createRequestHandler } from '@remix-run/vercel';
import * as build from '@remix-run/dev/server-build';

const buildWithMetronome = registerMetronome(build);

const metronomeGetLoadContext = createMetronomeGetLoadContext(
  buildWithMetronome,
  { config: require('./metronome.config.js') }
);

export default createRequestHandler({
  build: buildWithMetronome,
  getLoadContext: metronomeGetLoadContext,
  mode: process.env.NODE_ENV
});
