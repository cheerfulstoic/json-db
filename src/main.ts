import Vue from 'vue'
import App from './App.vue'

import BootstrapVue from 'bootstrap-vue'
import Feather from 'vue-icon'

const app = Vue.createApp(App)

app.use(BootstrapVue)
app.use(Feather)

app.mount('#app')
