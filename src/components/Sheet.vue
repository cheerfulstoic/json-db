<template>
  <div>
    <b-button class="btn btn-primary" v-b-modal="'sheet-modal-' + sheet._id">Edit Sheet</b-button>

    <button class="btn btn-primary" v-on:click="sheet.add_column()">Add Column</button>

    <button class="btn btn-primary add-row-btn" v-on:click="sheet.add_row('top')">Add Row</button>

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

    <table class="table table-striped table-bordered">
      <thead class="thead-light">
        <tr class="table-header sticky-top" style="top: 52px;">
          <th v-for="(definition, index) in definitions_to_display()"
              v-bind:key="definition._id" >
            <Definition v-model="definitions_to_display()[index]" v-on:remove="remove_column(definition)" />
          </th>
          <th v-if="sheet.display_referencers">Referencers</th>
          <th>&nbsp;</th>
        </tr>
      </thead>

      <template v-for="record in sheet.record_data">
        <tr v-bind:key="record._id"
            v-bind:class="{selected: record_focused(record)}"
            v-bind:id="'record-' + record._id"
            v-on:click="focus_sheet_and_record(sheet._id, record._id)">
          <td v-for="definition in definitions_to_display()"
              v-bind:key="definition._id">
            <String v-if="definition.type === 'string'" v-model="record[definition._id]" />
            <TextArea v-if="definition.type === 'text_area'" v-model="record[definition._id]" />
            <Integer v-if="definition.type === 'integer'" v-model="record[definition._id]" />
            <SelectOne v-if="definition.type === 'select_one'" v-model="record[definition._id]" v-bind:definition="definition" />
            <References v-if="definition.type === 'references'" v-model="record[definition._id]"
                        v-bind:database="database" v-bind:record_id="record._id"
                        v-on:focus-sheet-and-record="focus_sheet_and_record" />
            <Expression v-if="definition.type === 'expression'"
                        v-model="record[definition._id]"
                        v-bind:definition="definition"
                        v-bind:global_variables="database.global_variables"/>
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
            <a v-on:click="remove_row(record._id)" class="remove">🗑</a>
          </td>
        </tr>
      </template>
    </table>
    <button class="btn btn-primary add-row-btn" v-on:click="sheet.add_row('bottom')">Add Row</button>


    <b-modal v-bind:id="'sheet-modal-' + sheet._id" title="Edit Sheet">
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

import Expression from './types/Expression.vue';
import Integer from './types/Integer.vue';
import References from './types/References.vue';
import SelectOne from './types/SelectOne.vue';
import String from './types/String.vue';
import TextArea from './types/TextArea.vue';

import RecordResult from './RecordResult.vue';

import { Chrome } from 'vue-color'

import * as db from '../db';
import _ from 'lodash';

export default Vue.extend({
  name: 'Sheet',
  components: {
    Definition,
    Expression,
    Integer,
    References,
    SelectOne,
    String,
    TextArea,
    RecordResult,
    ChromePicker: Chrome
  },
  data () {
    return({colors: { hex: this.sheet.hex_color}})
  },
  props: {
    sheet: db.Sheet,
    database: db.Database,
    current_focus: Object, // db.Reference
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
      if(confirm(`Do you really want to delete the column ${definition.name}?`)) {
        this.sheet.delete_definition(definition._id);
      }
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
    }
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
  /* overflow: hidden; */
}

tr.selected td {
  background-color: rgba(0,0,0,0.075);
}

.btn {
  margin: 1em;
}

</style>
