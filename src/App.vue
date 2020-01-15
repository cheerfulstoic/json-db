<template>
  <div id="app">
    <div id="file-upload" v-cloak v-on:drop.prevent="upload" v-on:dragover.prevent>
      Drag here to upload file
    </div>
    <a v-bind:href="json_file_data_url" v-bind:download="project_name + '.db.json'">Save JSON</a>

    <div class="form-group">
      <input type="text" v-model="project_name" />
    </div>

    <ul class="nav nav-tabs">
      <li class="nav-item"
          v-for="sheet in database.sheets"
          v-bind:key="sheet._id">
        <a v-bind:class="['nav-link', 'active', {selected: current_sheet_id === sheet._id}]"
           v-on:click="change_sheet(sheet._id)">
          <div class="marker" v-bind:style="'background-color:' + sheet.hex_color">&nbsp;</div>
          {{sheet.name}}
        </a>
      </li>
      <li class="nav-item">
        <a class="btn btn-primary add-sheet-btn" v-on:click="add_sheet">Add Sheet</a>
      </li>
    </ul>

    <div v-for="sheet in database.sheets" v-bind:key="sheet._id">
      <Sheet v-if="current_sheet_id === sheet._id" v-bind:sheet="sheet" v-bind:database="database"
             v-on:focus_record="focus_record" v-bind:current_focus="current_focus" />
    </div>

    <Graph id="graph"
           v-bind:database="database"
           v-bind:current_focus="current_focus"
           v-on:focus_record="focus_record" />

    <pre class="json-output">{{json()}}</pre>
  </div>

</template>

<script lang="ts">
import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue'

import Sheet from './components/Sheet.vue';
import Graph from './components/Graph.vue';

import _ from 'lodash';
import Fuse from 'fuse.js';

Vue.use(BootstrapVue)

import * as db from './db';

// vvv TEMP vvv
let sheet1 = new db.Sheet('Test',
  'sheet_1', null,
  [
    { name: 'id', type: 'string', unique_id: true },
    { name: 'msg', type: 'text_area' },
    { name: 'foo', type: 'integer' },
    { name: 'bar', type: 'references' },
  ], [
    {id: 'unreferenced', msg: 'Fun', foo: 6},
    {_id: 'ggg123', id: 'blah', msg: 'Hello', foo: 2},
    {_id: 'hhh123', id: 'bloh', msg: 'Hullo', bar: [{ sheet_id: "sheet_1", record_id: 'ggg123' }]},
    {_id: 'abc123', id: 'blum', msg: 'Heja', bar: [
      { sheet_id: 'sheet_1', record_id: 'hhh123' },
      { sheet_id: 'sheet_2', record_id: 'flub' }
    ]}
  ])

let sheet2 = new db.Sheet('Influencers',
  'sheet_2', null,
  [
    { name: 'label', type: 'string', unique_id: true },
    { name: 'description', type: 'text_area' },
    { name: 'influencable', type: 'references' },
  ],
  [
    {_id: 'flub', label: 'Huh', description: 'Something long, preferably',
      influencable: [{ sheet_id: "sheet_1", record_id: 'hhh123' }]},
  ])

let database = new db.Database([sheet1, sheet2])
// ^^^ TEMP ^^^

export default Vue.extend({
  name: 'app',
  components: {
    Graph,
    Sheet,
  },
  data () : { database: db.Database, current_sheet_id: string, current_focus: {sheet_id: string, record_id: string} | null, project_name: string } {
    return {
      database: database,
      current_sheet_id: database.sheets[0]._id,
      current_focus: null,
      project_name: 'Project Name'
    }
  },
  methods: {
    upload (event : any) {
      if (event.dataTransfer.files.length > 1) {
        alert('You cannot upload more than one file')
      }
      let file = event.dataTransfer.files[0];
      let item = event.dataTransfer.items[0];

      // console.log(item)
      // console.log(item.getAsString(function (s) { console.log(arguments) }))
      // console.log(item.getAsFile(function (s) { console.log(arguments) }))

      var reader = new FileReader();
      reader.onload = (e : any) => {
        // console.log('result')
        let result = JSON.parse(e.target.result);

        let sheets = _.map(result.sheets, (schema) => {
          return(new db.Sheet(
            schema.name,
            schema._id,
            schema.hex_color,
            schema.definitions,
            result.records[schema._id]
          ))
        })

        this.database = new db.Database(sheets)
      };
      // console.log('burb')
      console.log(reader.readAsText(item.getAsFile()));
    },
    add_sheet () {
      let number = this.database.sheets.length + 1
      this.database.add_sheet(new db.Sheet(`Sheet #${number}`, null, null, [], []))
    },
    change_sheet (id : string) {
      this.current_sheet_id = id;
    },
    focus_record (sheet_id : string, record_id : string) {
      this.current_focus = {sheet_id: sheet_id, record_id: record_id};
      this.current_sheet_id = sheet_id;
    },
    json () {
      return JSON.stringify(this.database.json_data(), null, 2)
    },
  },
  computed: {
    json_file_data_url () {
      let file = new Blob([this.json()], {type: 'application/json'});
      return(URL.createObjectURL(file))
    },
  }
});
</script>

<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: left;
  color: #2c3e50;
  margin-top: 60px;
}

#file-upload {
  border: 1px solid #444;
  border-radius: 0.4em;
  padding: 2em;
  margin: 2em;
  width: 350px;

  &:drop {
    background-color: purple;
  }
}

ul.nav.nav-tabs {
  margin-bottom: 2em;

  .nav-item a.active {
    border-bottom: 1px solid #dee2e6;

    &.selected {
      border-bottom: 1px solid transparent;
    }
  }
}

.add-sheet-btn {
  margin-left: 2em;
}

.json-output {
  text-align: left;
}

.nav-item {
  font-weight: bold;

  .marker {
    display: inline-block;
    height: 0.8em;
    width: 0.8em;
    border: 1px solid black;
  }
}

#graph {
  position: fixed;
  /*
  width: 650px;
  height: 450px;
  */
  top: 20px;
  right: 20px;
  background-color: white;
  border: 1px solid #444;
  border-radius: 2em;
  overflow: hidden;
}

@import 'node_modules/bootstrap/scss/bootstrap';
@import 'node_modules/bootstrap-vue/src/index.scss';
</style>
