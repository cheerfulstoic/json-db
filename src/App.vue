<template>
  <div id="app">
    <nav class="navbar sticky-top navbar-expand-lg navbar-light bg-light">
      <input id="project_name" class="form-control mx-2" type="text" v-model="database.project_name" />

      <button v-if="!view_mode" data-toggle="modal" data-target="#global-variables-modal" class="btn btn-primary mx-2">
        Edit Global Variables
      </button>

      <button
        v-if="!view_mode"
        type="button"
        class="btn btn-primary"
        data-toggle="modal"
        data-target="#edit-sheets"
      >
        Edit Sheets
      </button>

      <button v-if="!view_mode" class="btn btn-primary mx-2" v-on:click="add_sheet">Add Sheet</button>

      <button
        class="btn btn-primary mx-2"
        v-if="database.sheets.length"
        href="#"
        v-bind:download="database.project_name + '.db.json'"
        v-on:click.prevent="download_json_file_data"
      >
        Save JSON
      </button>

      <RecordsSearch
        v-bind:record_ids_to_skip="[]"
        v-bind:database="database"
        v-bind:sheet_ids_to_search="[]"
        v-on:record-selected="focus_record"
      />

      <div class="btn-group-toggle" data-toggle="buttons">
        <label class="btn btn-primary" style="white-space: nowrap">
          <input type="checkbox" checked v-model="view_mode" autocomplete="off">
          Switch to: 
          <template v-if="!view_mode">View Mode</template>
          <template v-if="view_mode">Edit Mode</template>
        </label>
      </div>


      <!--
      <Graph id="graph"
             v-bind:database="database"
             v-bind:current_focus="current_focus"
             v-on:focus-sheet-and-record="focus_sheet_and_record" />
      -->
    </nav>

    <div class="container-fluid">
      <ul class="nav nav-tabs sticky-top">
        <li class="nav-item" v-for="sheet in database.sheets" v-bind:key="sheet._id">
          <a
            v-bind:class="['nav-link', 'active', { selected: current_sheet_id === sheet._id }]"
            v-on:click="change_sheet(sheet._id)"
          >
            {{ sheet.name }}
            <div class="marker" v-bind:style="'background-color:' + sheet.hex_color">&nbsp;</div>
          </a>
        </li>
      </ul>

      <div v-for="sheet in database.sheets" v-bind:key="sheet._id">
        <Sheet
          v-cloak
          v-if="current_sheet_id === sheet._id"
          v-bind:sheet="sheet"
          v-bind:current_focus="current_focus"
          v-bind:view_mode="view_mode"
          v-bind:scroll_position="sheet_scroll_positions[sheet._id]"
          v-on:focus-sheet-and-record="focus_sheet_and_record"
          v-on:record-selected="focus_record"
        />
      </div>

      <div
        id="file-upload"
        v-cloak
        v-if="!database.sheets.length"
        v-on:drop.prevent="upload"
        v-on:dragover.prevent="highlight_upload"
        v-on:dragleave.prevent="unhighlight_upload"
        v-bind:class="{ hover: upload_highlighted }"
      >
        Drag here to upload file
      </div>

      ... or choose a file below:

      <form action="/action_page.php">
        <input type="file" name="filename" v-on:change="upload" ref="file_chooser">
      </form>

      <hr />

      <BootstrapModal id="global-variables-modal" title="Global Variables">
        <VariableEditor
          v-bind:variables="database.global_variables"
          v-on:update="update_global_variables"
          v-on:delete="delete_global_variables_key"
        />
      </BootstrapModal>
    </div>

    <BootstrapModal ok-only id="edit-sheets" title="Edit Sheets">
      <h1>Sheet order</h1>
      <h2>(drag to reorder)</h2>

      <draggable class="dragArea list-group w-full" :list="database.sheets" @change="log">
        <div
          class="list-group-item bg-gray-300 m-1 p-3 rounded-md text-center"
          v-for="sheet in database.sheets"
          :key="sheet._id"
        >
          {{ sheet.name }}

          <a v-on:click="remove_sheet(sheet)" class="remove"><Icon name="trash" style="float: right" /></a>
        </div>
      </draggable>
    </BootstrapModal>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import Sheet from './components/Sheet.vue'
import VariableEditor from './components/VariableEditor.vue'
// import Graph from './components/Graph.vue';
import RecordsSearch from './components/RecordsSearch.vue'
import BootstrapModal from './components/BootstrapModal.vue'
import Icon from './components/Icon.vue'

import { VueDraggableNext } from 'vue-draggable-next'

import _ from 'lodash'

import * as db from './db'

export default defineComponent({
  name: 'app',
  components: {
    // Graph,
    VariableEditor,
    Sheet,
    RecordsSearch,
    BootstrapModal,
    Icon,

    Draggable: VueDraggableNext,
  },
  data(): {
    database: db.Database
    current_sheet_id: string | null
    current_focus: { sheet_id: string; record_id: string } | null
    upload_highlighted: boolean
    show_json: boolean,
    view_mode: boolean,
    sheet_scroll_positions: object,
  } {
    let database = new db.Database('Project Name', {})

    return {
      database: database,
      current_sheet_id: null,
      current_focus: null,
      upload_highlighted: false,
      show_json: false,
      view_mode: false,
      sheet_scroll_positions: {},
    }
  },
  mounted() {
    let url_params = new URLSearchParams(window.location.search)
    let file_url = url_params.get('file_url')

    if (file_url) {
      this.load_database_from_url(file_url)
    }
  },
  methods: {
    load_database_from_url(url: string) {
      fetch(url).then((response) => {
        response.json().then((data) => {
          this.database = db.Database.from_saved(data)

          this.current_sheet_id = this.database.sheets[0]._id
        })
      })
    },
    update_global_variables(key: string, value: any) {
      _.set(this.database.global_variables, key, value)
    },
    delete_global_variables_key(key: string) {
      _.unset(this.database.global_variables, key)
    },
    upload(event: any) {
      this.upload_highlighted = false

      let file;
      if (event.dataTransfer) {
        // Drag-and-drop case
        if (event.dataTransfer.files.length > 1) {
          alert('You cannot upload more than one file')
        }
        file = event.dataTransfer.files[0]
      } else {
        // File chooser case
        file = this.$refs.file_chooser.files[0];
      }

      var reader = new FileReader()
      reader.onload = (e: any) => {
        this.database = db.Database.from_saved(JSON.parse(e.target.result))

        this.current_sheet_id = this.database.sheets[0]._id
      }
      reader.readAsText(file)
    },
    highlight_upload() {
      this.upload_highlighted = true
    },
    unhighlight_upload() {
      this.upload_highlighted = false
    },
    add_sheet() {
      let number = this.database.sheets.length + 1
      let sheet = new db.Sheet(this.database, `Sheet #${number}`, null, null, [], null, null, true, [])
      this.current_sheet_id = sheet._id
    },
    change_sheet(id: string) {
      this.sheet_scroll_positions[this.current_sheet_id] = window.scrollY;

      this.current_sheet_id = id
    },
    focus_record(record: db.Record) {
      this.focus_sheet_and_record(record.sheet._id, record._id)
    },
    // DEPRECATED?
    focus_sheet_and_record(sheet_id: string, record_id: string) {
      this.current_focus = { sheet_id: sheet_id, record_id: record_id }
      this.current_sheet_id = sheet_id
      window.setTimeout(() => {
        let record_element = document.getElementById(`record-${record_id}`)

        if (record_element) {
          record_element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 1)
    },
    json() {
      return JSON.stringify(this.database.json_data(), null, 2)
    },
    json_file_data_url() {
      let file = new Blob([this.json()], { type: 'application/json' })
      return URL.createObjectURL(file)
    },
    download_json_file_data() {
      let blob = new Blob([this.json()], { type: 'application/json' })
      let link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = this.database.project_name + '.db.json'
      link.click()
      URL.revokeObjectURL(link.href)
    },
    toggle_json() {
      this.show_json = !this.show_json
    },
    remove_sheet(sheet: db.Sheet) {
      if (confirm(`Are you sure you want to remove the sheet: '${sheet.name}'?`)) {
        this.database.sheets = _.reject(this.database.sheets, {_id: sheet._id})

        if (sheet._id === this.current_sheet_id) {
          this.current_sheet_id = this.database.sheets[0]._id;
        }
      }
    },
  },
})
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
  top: 50px;
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
    background-color: #bbb;
  }

  &:drop {
    background-color: purple;
  }
}

ul.nav.nav-tabs {
  top: 54px;
  background-color: white;
  z-index: 100;

  .nav-item a.active {

    &.selected {
      background-color: #e9ecef; /* color should match bootstrap table header */
      border-color: black;
      border-bottom: 1px solid transparent;
      position: relative;
      top: 1px;
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
  a.nav-link { padding: 0.3em 0.3em 0 0.3em }

  .marker {
    display: inline-block;
    border: 3px solid green;
    height: 0.5em;
    width: 100%;
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

  /* Used this to generate filters: https://codepen.io/sosuke/pen/Pjoqqp */
  &.notice {
    width: 22px;
    filter: invert(59%) sepia(77%) saturate(7056%) hue-rotate(344deg) brightness(97%) contrast(90%);
  }
  &.warning {
    width: 22px;
    /* Yellow-ish */
    filter: invert(99%) sepia(92%) saturate(1555%) hue-rotate(317deg) brightness(115%) contrast(98%);
  }
}

@import 'node_modules/bootstrap/scss/bootstrap';
</style>
