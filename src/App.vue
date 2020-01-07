<template>
  <div id="app">
    <b-tabs>
       <b-tab v-for="(sheet, index) in database.sheets" v-bind:title="sheet.name" v-bind:key="index">
         <Sheet v-bind:sheet="sheet" v-bind:database="database" />
       </b-tab>
    </b-tabs>

    <pre class="json-output">{{json()}}</pre>
  </div>

</template>

<script lang="ts">
import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue'
import Sheet from './components/Sheet.vue';

import _ from 'lodash';
import Fuse from 'fuse.js';

Vue.use(BootstrapVue)

import * as db from './db';

// vvv TEMP vvv
let sheet1 = new db.Sheet('Test',
  [
    { name: 'id', type: 'select_one', options: ['blah', 'bloh'] },
    { name: 'msg', type: 'text_area' },
    { name: 'foo', type: 'integer' },
    { name: 'bar', type: 'reference' },
  ], [
    {id: 'blah', msg: 'Hello', foo: 2},
    {id: 'bloh', msg: 'Hullo', bar: { sheet: "Test", id: 'ggg123' }},
    {id: 'blum', msg: 'Heja', bar: { sheet: "Test", id: 'hhh123' }}
  ])
let sheet2 = new db.Sheet('Heya', [], [])

let database = new db.Database([sheet1, sheet2])
// ^^^ TEMP ^^^

export default Vue.extend({
  name: 'app',
  components: {
    Sheet
  },
  data () : { database: db.Database } {
    return { database: database }
  },
  methods: {
    json () {
      return JSON.stringify(this.database.json_data, null, 2)
    },
  }
});
</script>

<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.json-output {
  text-align: left;
}

@import 'node_modules/bootstrap/scss/bootstrap';
@import 'node_modules/bootstrap-vue/src/index.scss';
</style>
