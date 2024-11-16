import { defineConfig } from 'rollup';

export default defineConfig([
  {
    input: {
      'index': 'src/index.ts',
      'UserEventSinkConnector': 'src/UserEventSinkConnector.ts'
    },
    output: [
      {
        dir: 'dist/esm',
        format: 'esm',
        entryFileNames: '[name].js'
      },
      {
        dir: 'dist/cjs',
        format: 'cjs',
        entryFileNames: '[name].js'
      }
    ]
  }
]);