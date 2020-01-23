<template>
  <div id="app">
    <a v-if="database.sheets.length" v-bind:href="json_file_data_url()" v-bind:download="project_name + '.db.json'">Save JSON</a>

    <Graph id="graph"
           v-bind:database="database"
           v-bind:current_focus="current_focus"
           v-on:focus-sheet-and-record="focus_sheet_and_record" />

    <div class="form-group">
      <input type="text" v-model="project_name" />

      <b-button v-b-modal.global-variables-modal variant="primary">Edit Global Variables</b-button>
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
             v-bind:current_focus="current_focus" v-on:focus-sheet-and-record="focus_sheet_and_record" />
    </div>

    <div id="file-upload" v-cloak v-if="!database.sheets.length"
      v-on:drop.prevent="upload"
      v-on:dragover.prevent="highlight_upload"
      v-on:dragleave.prevent="unhighlight_upload"
      v-bind:class="{hover: upload_highlighted}">
      Drag here to upload file
    </div>

    <hr/>

    <button class="btn btn-primary toggle-json-btn" v-on:click="taggle_json">Toggle JSON</button>
    <pre v-if="show_json" class="json-output">{{json()}}</pre>


    <b-modal id="global-variables-modal" title="Global Variables">
      <VariableEditor v-bind:variables="database.global_variables" v-on:update="update_global_variables" />
    </b-modal>
  </div>

</template>

<script lang="ts">
import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue'

import Sheet from './components/Sheet.vue';
import VariableEditor from './components/VariableEditor.vue';
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

let database = new db.Database([sheet1, sheet2], {})
// ^^^ TEMP ^^^

export default Vue.extend({
  name: 'app',
  components: {
    Graph,
    VariableEditor,
    Sheet,
  },
  data () : { database: db.Database, current_sheet_id: string, current_focus: {sheet_id: string, record_id: string} | null, project_name: string, upload_highlighted: boolean, show_json: boolean } {
    return {
      database: new db.Database([], {}),
      current_sheet_id: database.sheets[0]._id,
      current_focus: null,
      project_name: 'Project Name',
      upload_highlighted: false,
      show_json: false,
    }
  },
  methods: {
    update_global_variables (key : string, value : any) {
      Vue.set(this.database.global_variables, key, value);
    },
    upload (event : any) {
      this.upload_highlighted = false;

      if (event.dataTransfer.files.length > 1) {
        alert('You cannot upload more than one file')
      }
      let file = event.dataTransfer.files[0];
      let item = event.dataTransfer.items[0];

      var reader = new FileReader();
      reader.onload = (e : any) => {
        let result = JSON.parse(e.target.result);

        let sheets = _.map(result.sheets, (schema) => {
          return(new db.Sheet(
            schema.name,
            schema._id,
            schema.hex_color,
            schema.definitions,
            result.records[schema.name]
          ))
        })

        this.database = new db.Database(sheets, result.global_variables || {})

        this.current_sheet_id = this.database.sheets[0]._id;
      };
      reader.readAsText(file);
    },
    highlight_upload () {
      this.upload_highlighted = true;
    },
    unhighlight_upload () {
      this.upload_highlighted = false;
    },
    add_sheet () {
      let number = this.database.sheets.length + 1
      this.database.add_sheet(new db.Sheet(`Sheet #${number}`, null, null, [], []))
    },
    change_sheet (id : string) {
      this.current_sheet_id = id;
    },
    focus_sheet_and_record (sheet_id : string, record_id : string) {
      this.current_focus = {sheet_id: sheet_id, record_id: record_id};
      this.current_sheet_id = sheet_id;
      window.setTimeout(() => {
        let record_element = document.getElementById(`record-${record_id}`);

        if (record_element) {
          record_element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 1)
    },
    json () {
      return JSON.stringify(this.database.json_data(), null, 2)
    },
    json_file_data_url () {
      let file = new Blob([this.json()], {type: 'application/json'});
      return(URL.createObjectURL(file))
    },
    taggle_json () {
      this.show_json = !this.show_json;
    },
    // focus_sheet_and_record (sheet_id : string, record_id : string) {
    //   let sheet = this.database.find_sheet (sheet_id);

    //   if (sheet) {
    //     let record = sheet.find_by_id(record_id);

    //     if (record) {
    //       debugger
    //       // this.current_focus.record_id = record._id
    //     }
    //   }
    // },
  },
  computed: {
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
  width: 800px;
  height: 600px;

  text-align: center;
  display: table-cell;
  vertical-align: middle;

  &.hover {
    background-color: #BBB;
  }

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

.toggle-json-btn {
  margin: 2em 0 0 2em;
}

.json-output {
  border: 1px solid #333;
  padding: 1em;
  margin: 2em;
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
  z-index: 2;
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
