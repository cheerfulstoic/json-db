import vue from '@vitejs/plugin-vue'

export default {
  verbose: true,
  root: '.',
  base: '/',
  plugins: [vue({
    publicPath: '/'
  })],
}
