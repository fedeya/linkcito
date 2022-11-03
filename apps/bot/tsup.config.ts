import { defineConfig } from 'tsup';

const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig({
  clean: true,
  entry: ['src/index.ts', 'src/commands/**/*.ts'],
  format: ['cjs', 'esm'],
  minify: isProduction,
  sourcemap: true
});
