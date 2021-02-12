import vue from '@vitejs/plugin-vue'

export default {
  verbose: true,
  root: '.',
  base: '/json-db/dist/',
  plugins: [vue({
    publicPath: '/json-db/dist/'
  })],
}
