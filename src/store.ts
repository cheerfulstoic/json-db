import Vuex from 'vuex'

import _ from 'lodash'

import store_helpers from './store_helpers'

const pathString = (path) => path.join('|')

export default new Vuex.Store({
  state: {
    count: 0
  },
  mutations: {
    setDataVar (state, {path, key, value}) {
      _.set(state, ['data_vars', pathString(path), key], value);
    }
  },
  getters: {
    getDataVar: (state) => (path, key) => {
      return _.get(state, ['data_vars', pathString(path), key]);
    }
  }
})
