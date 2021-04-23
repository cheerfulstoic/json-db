import { createApp } from 'vue'
import App from './App.vue'

import 'bootstrap'

createApp(App).mount('#app')

window.onbeforeunload = function (e) {
  e = e || window.event;

  // For IE and Firefox prior to version 4
  if (e) {
    e.returnValue = 'Sure?';
  }

  // For Safari
  return 'Sure?';
};
