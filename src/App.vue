<template>
  <div id="app">
    <nav class="navbar sticky-top navbar-expand-lg navbar-light bg-light">
      <input id="project_name" class="form-control mx-2" type="text" v-model="database.project_name" />

      <b-button
        v-b-modal.global-variables-modal
        class="btn mx-2"
        variant="primary">Edit Global Variables</b-button>

      <button class="btn btn-primary mx-2" v-on:click="add_sheet">Add Sheet</button>

      <button class="btn btn-primary mx-2"
         v-if="database.sheets.length"
         href="#"
         v-bind:download="database.project_name + '.db.json'"
         v-on:click.prevent="download_json_file_data"
         >
        Save JSON
      </button>

      <RecordsSearch v-bind:record_ids_to_skip="[]"
                        v-bind:database="database"
                        v-bind:sheet_ids_to_search="[]"
                        v-on:record-selected="focus_record" />
      <!--
      <Graph id="graph"
             v-bind:database="database"
             v-bind:current_focus="current_focus"
             v-on:focus-sheet-and-record="focus_sheet_and_record" />
      -->
    </nav>

    <div class="container-fluid">
      <ul class="nav nav-tabs sticky-top">
        <li class="nav-item"
            v-for="sheet in database.sheets"
            v-bind:key="sheet._id">
          <a v-bind:class="['nav-link', 'active', {selected: current_sheet_id === sheet._id}]"
             v-on:click="change_sheet(sheet._id)">
            <div class="marker" v-bind:style="'background-color:' + sheet.hex_color">&nbsp;</div>
            {{sheet.name}}
          </a>
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

      <button class="btn btn-primary toggle-json-btn" v-on:click="toggle_json">Toggle JSON</button>
      <pre v-if="show_json" class="json-output">{{json()}}</pre>


      <b-modal id="global-variables-modal" title="Global Variables">
        <VariableEditor
          v-bind:variables="database.global_variables"
          v-on:update="update_global_variables"
          v-on:delete="delete_global_variables_key" />
      </b-modal>
    </div>
  </div>

</template>

<script lang="ts">
import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue'
import Feather from 'vue-icon'

import Sheet from './components/Sheet.vue';
import VariableEditor from './components/VariableEditor.vue';
// import Graph from './components/Graph.vue';
import RecordsSearch from './components/RecordsSearch.vue';

import _ from 'lodash';
import Fuse from 'fuse.js';

Vue.use(BootstrapVue);
Vue.use(Feather, 'v-icon');

import * as db from './db';

export default Vue.extend({
  name: 'app',
  components: {
    // Graph,
    VariableEditor,
    Sheet,
    RecordsSearch,
  },
  data () : { database: db.Database, current_sheet_id: string | null, current_focus: {sheet_id: string, record_id: string} | null, upload_highlighted: boolean, show_json: boolean } {
    let database = new db.Database('Project Name', {});
    return {
      database: database,
      current_sheet_id: null,
      current_focus: null,
      upload_highlighted: false,
      show_json: false,
    }
  },
  methods: {
    update_global_variables (key : string, value : any) {
      Vue.set(this.database.global_variables, key, value);
    },
    delete_global_variables_key (key : string) {
      Vue.delete(this.database.global_variables, key);
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
        this.database = db.Database.from_saved(JSON.parse(e.target.result));

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
      let sheet = new db.Sheet(this.database, `Sheet #${number}`, null, null, [], null, null, true, []);
      this.current_sheet_id = sheet._id;
    },
    change_sheet (id : string) {
      this.current_sheet_id = id;
    },
    focus_record (record : db.Record) {
      this.focus_sheet_and_record(record.sheet._id, record._id)
    },
    // DEPRECATED?
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
    download_json_file_data () {
      let blob = new Blob([this.json()], { type: 'application/json' })
      let link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = this.database.project_name + '.db.json';
      link.click()
      URL.revokeObjectURL(link.href)
    },
    toggle_json () {
      this.show_json = !this.show_json;
    },
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
}

div.modal {
  top: 100px;
}

nav button {
  white-space: nowrap;
}

#project_name {
  width: 200px;
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
  top: 53px;
  background-color: white;
  margin-bottom: 2em;
  z-index: 100;

  .nav-item a.active {
    border-bottom: 1px solid #dee2e6;

    &.selected {
      border-bottom: 1px solid transparent;
    }
  }
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
  z-index: 100;
  top: 5px;
  right: 20px;
  background-color: white;
  border: 1px solid #444;
  border-radius: 2em;
  overflow: hidden;
}

.icon {
  width: 20px;

  &.notice {
    font-weight: bold;
    color: red;
  }
}

@import 'node_modules/bootstrap/scss/bootstrap';
@import 'node_modules/bootstrap-vue/src/index.scss';
</style>
