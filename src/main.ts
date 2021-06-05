import Rollbar from 'rollbar';


import { createApp } from 'vue'
import App from './App.vue'

import CKEditor from '@ckeditor/ckeditor5-vue';

import 'bootstrap'

let app = createApp(App)

// const rollbar = new Rollbar({
//   accessToken: 'c81487aebe7342ab809354511bf5f997',
//   captureUncaught: true,
//   captureUnhandledRejections: true,
// });

// app.config.errorHandler = (err, vm, info) => {
//   rollbar.error(err);
//   throw err; // rethrow
// };

app.use(CKEditor)

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
