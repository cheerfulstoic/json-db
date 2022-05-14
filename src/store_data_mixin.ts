import _ from 'lodash'

const standardize_options = (options) => {
  if (_.isFunction(options)) {
    return({path_fn: options});
  }

  return(options);
}

export default (key_paths) => {
  return {

    data() {
      return _.reduce(key_paths, (result, options_fn, key) => {
        let options = options_fn(this);

        let path = options.path;
        path.unshift(key)

        return _.set(result, key, this.$store.getters.getDataVar(path, key) || options.initial)
      }, {})
    },

    watch: _.reduce(key_paths, (watchers, options_fn, key) => {
      return _.set(watchers, key, {
        handler: function (new_value, _old_value) {
        console.log({key, new_value, _old_value})
        let options = options_fn(this);

        let path = options.path;
        path.unshift(key)

        this.$store.commit('setDataVar', {key, path, value: new_value})
        },
        deep: true,
      })
    }, {})

  };
}
