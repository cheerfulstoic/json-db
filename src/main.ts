import Rollbar from 'rollbar';

Vue.prototype.$rollbar = new Rollbar({
  accessToken: process.env.ROLLBAR_POST_CLIENT_ITEM_TOKEN,
  captureUncaught: true,
  captureUnhandledRejections: true,
});


import { createApp } from 'vue'
import App from './App.vue'

import 'bootstrap'

let app = createApp(App)

app.config.errorHandler = (err, vm, info) => {
  vm.$rollbar.error(err);
  throw err; // rethrow
};

app.mount('#app')

window.onbeforeunload = function (e) {
  e = e || window.event;

  // For IE and Firefox prior to version 4
  if (e) {
    e.returnValue = 'Sure?';
  }

  // For Safari
  return 'Sure?';
};
