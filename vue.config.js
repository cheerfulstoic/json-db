module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '/json-db/dist/'
    : '/'
}
