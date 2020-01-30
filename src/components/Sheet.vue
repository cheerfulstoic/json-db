<template>
  <div>
    <b-button class="btn btn-primary" v-b-modal="'sheet-modal-' + sheet._id">Edit Sheet</b-button>

    <button class="btn btn-primary" v-on:click="sheet.add_column()">Add Column</button>

    <button class="btn btn-primary add-row-btn" v-on:click="sheet.add_row('top')">Add Row</button>


    <table class="table table-striped table-bordered">
      <thead class="thead-light">
        <tr>
          <th colspan="100%">
            <h4>
              {{total_count}} total rows
              <span v-bind:class="{'filter-display': true, 'filter-has-limited-rows': filter_has_limited_rows}">
                (filtered to {{records_to_display.length}} record(s))
              </span>
            </h4>
          </th>
        </tr>

        <tr>
          <th colspan="100%">
            <h3>Columns to Display</h3>
            <div class="form-check form-check-inline" v-for="definition in sheet.definitions" v-bind:key="definition._id">
              <label>
                <input type="checkbox" class="form-check-input" v-bind:value="definition._id" v-model="sheet.definition_ids_to_display">
                {{definition.name}}
              </label>

            </div>

            <div class="form-check form-check-inline">
              <label>
                <input type="checkbox" class="form-check-input" v-model="sheet.display_referencers">
                Referencers
              </label>
            </div>
          </th>
        </tr>


        <tr class="table-header sticky-top" style="top: 52px;">
          <th>&nbsp;</th>
          <th v-for="(definition, index) in definitions_to_display()"
              v-bind:key="definition._id" >
            <Definition v-model="definitions_to_display()[index]" v-on:remove="remove_column(definition)" />

            <DefinitionFilter
               v-on:input="set_filter"
               v-bind:definition="definition"
               v-bind:values="values_for(definition)"
               v-bind:database="database" />
          </th>
          <th v-if="sheet.display_referencers">Referencers</th>
          <th>&nbsp;</th>
        </tr>
      </thead>

      <template v-for="record in records_to_display">
        <tr v-bind:key="record._id"
            v-bind:class="{selected: record_focused(record)}"
            v-bind:id="'record-' + record._id"
            v-on:click="focus_sheet_and_record(sheet._id, record._id)">
          <td>
            <b-button class="btn btn-primary" v-b-modal="'record-modal-' + record._id">Edit</b-button>
          </td>

          <b-modal ok-only v-bind:id="'record-modal-' + record._id" title="Edit Sheet">
            <div class="form-group" v-for="definition in sheet.definitions" v-bind:key="definition._id">
              <label>
                <strong>{{definition.name}}</strong>
                <Field v-bind:record="record" v-bind:definition="definition" v-bind:database="database"/>
              </label>
            </div>

          </b-modal>

          <td v-for="definition in definitions_to_display()"
              v-bind:key="definition._id">
            <Field v-bind:record="record" v-bind:definition="definition" v-bind:database="database"/>
          </td>
          <td v-if="sheet.display_referencers">
            <div v-for="entry in referencers_for(sheet, record)" v-bind:key="entry.result.id">
              <RecordResult v-bind:result="entry.result"
                            v-bind:database="database"
                            v-bind:definition_name="entry.definition_name"
                            v-on:focus-sheet-and-record="focus_sheet_and_record" />
            </div>
          </td>
          <td>
            <a v-on:click="remove_row(record._id)" class="remove"><v-icon name="trash-2"/></a>
          </td>
        </tr>
      </template>
    </table>
    <button class="btn btn-primary add-row-btn" v-on:click="sheet.add_row('bottom')">Add Row</button>


    <b-modal ok-only v-bind:id="'sheet-modal-' + sheet._id" title="Edit Sheet">
      <div class="form-group">
        <label>
          Name
          <input class="form-control" v-model="sheet.name"/>
        </label>
      </div>

      <div class="form-group">
        <label>
          Color
          <ChromePicker v-bind:value="colors" v-on:input="update_color" />
        </label>
      </div>
    </b-modal>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Definition from './Definition.vue';
import DefinitionFilter from './DefinitionFilter.vue';

import RecordResult from './RecordResult.vue';

import Field from './Field.vue';

import { Chrome } from 'vue-color'

import * as db from '../db';
import _ from 'lodash';

export default Vue.extend({
  name: 'Sheet',
  components: {
    Definition,
    DefinitionFilter,
    RecordResult,
    Field,
    ChromePicker: Chrome
  },
  data () {
    return({
      colors: { hex: this.sheet.hex_color },
      filters: {},
    })
  },
  props: {
    sheet: db.Sheet,
    database: db.Database,
    current_focus: Object, // db.Reference
  },
  computed: {
    records_to_display () : any[] {
      return _(this.filters).values().reduce((result, fn) : any[] => {
        return _.filter(result, fn)
      }, this.sheet.record_data)
    },
    total_count () : number {
      return(this.sheet.record_data.length);
    },
    filter_has_limited_rows () : boolean {
      return(this.records_to_display.length !== this.total_count);
    },
  },
  methods: {
    definitions_to_display () : db.Definition[] {
      return(_.filter(this.sheet.definitions, (definition) => {
        return(this.sheet.definition_ids_to_display.includes(definition._id))
      }))
    },
    update_color (colors : {hex: string}) {
      this.sheet.hex_color = colors.hex;
    },
    focus_record (record_id : string) {
      this.$emit('focus-sheet-and-record', this.sheet._id, record_id);
    },
    record_focused (record : any) {
      if (!this.current_focus) { return(false) }
      return(record._id === this.current_focus.record_id)
    },
    remove_row (id : string) : void {
      if(confirm(`Do you really want to delete this row?`)) {
        this.sheet.remove_row(id);
      }
    },
    remove_column (definition : db.Definition) : void {
      this.sheet.delete_definition(definition._id);
    },
    focus_sheet_and_record (sheet_id : string, record_id : string) {
      this.$emit('focus-sheet-and-record', sheet_id, record_id);
    },
    referencers_for (sheet : db.Sheet, record : any) {
      // TODO: Access via a function in Database
      let key = `${sheet._id}|${record._id}`
      return _.flatMap(this.database.referencers()[key], (results, definition_name) => {
        return _.map(results, (result) => {
          return { result: result, definition_name: definition_name }
        })
      })
    },
    set_filter (definition_id : string, value : (record: any) => boolean) {
      Vue.set(this.filters, definition_id, value);
    },
    values_for (definition : db.Definition) {
      return(_(this.sheet.record_data).flatMap(definition._id).compact().value())
    },
  },
});
</script>

<style scoped lang="scss">

.table-header {
  z-index: 50;
}

tr {
  transition: all .5s ease-in-out;
}

td {
  overflow-x: hidden;
}

tr.selected td {
  background-color: rgba(0,0,0,0.075);
}

.btn {
  margin: 1em;
}

.filter-display {
  display: none;

  &.filter-has-limited-rows {
    display: inline;
    color: red;
  }
}
</style>
