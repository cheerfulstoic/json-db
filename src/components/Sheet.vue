<template>
  <div>
    <b-button class="btn btn-primary" v-b-modal="'sheet-modal-' + sheet._id">Edit Sheet</b-button>

    <button class="btn btn-primary" v-on:click="sheet.add_definition()">Add Column</button>

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

        <tr class="columns-to-display">
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


        <tr class="table-header">
          <th>&nbsp;</th>
          <template v-for="definition in sheet.definitions">
            <th v-if="should_display_definition(definition)" class="field-cell" v-bind:key="definition._id">
              <Definition
                v-bind:value="definition"
                v-bind:database="database"
                v-on:input="replace_definition(definition._id, $event)"
                v-on:remove="remove_definition(definition)"
                v-on:remove-sub-definition="remove_sub_definition"
                v-on:transform-values="transform_values"/>

              <DefinitionFilter
                 v-on:input="set_filter"
                 v-bind:definition="definition"
                 v-bind:values="values_for(definition)"
                 v-bind:database="database" />

              <span v-if="sortable(definition)">
                <a v-on:click="sort(definition, 'desc')">
                  <v-icon name="chevron-down"/>
                </a>
                <a v-on:click="sort(definition, 'asc')">
                  <v-icon name="chevron-up"/>
                </a>
              </span>
            </th>
          </template>
          <th v-if="sheet.display_referencers">Referencers</th>
          <th>&nbsp;</th>
        </tr>
      </thead>

      <b-modal ok-only size="lg" id="edit-record-modal" modal-class="record-modal" title="Edit Sheet">
        <div class="form-inline" v-for="definition in sheet.definitions" v-bind:key="definition._id">
          <label>
            <strong>{{definition.name}}</strong>
            <Field v-bind:record="currently_edited_record" v-bind:definition="definition" v-bind:database="database"/>
          </label>
        </div>

      </b-modal>

      <template v-for="record in records_to_display">
        <tr v-bind:key="record._id"
            v-bind:class="{selected: record_focused(record)}"
            v-bind:id="'record-' + record._id"
            v-on:click="focus_sheet_and_record(sheet._id, record._id, $event)">
          <td>
            <b-button class="btn btn-primary" v-on:click="edit_record(record)">Edit</b-button>
          </td>

          <template v-for="definition in sheet.definitions">
            <td v-if="should_display_definition(definition)" v-bind:key="definition._id">
              <Field v-bind:record="record"
                     v-bind:definition="definition"
                     v-bind:database="database"
                     v-on:focus-sheet-and-record="focus_sheet_and_record" />
            </td>
          </template>
          <td v-if="sheet.display_referencers">
            <!-- Maybe like Field I should just pass in the `record`? -->
            <References
              v-bind:value="referencer_references_for(sheet, record)"
              v-bind:changable="false"
              v-bind:database="database"
              v-on:focus-sheet-and-record="focus_sheet_and_record" />
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

      <h1>Column order</h1>
      <h2>(drag to reorder)</h2>
      <draggable tag="ul" v-model="sheet.definitions">
        <div v-for="definition in sheet.definitions"
            class="list-group-item"
            v-bind:key="definition._id">

          {{definition.name}}
        </div>
      </draggable>
    </b-modal>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Definition from './Definition.vue';
import DefinitionFilter from './DefinitionFilter.vue';

import References from './References.vue';

import Field from './Field.vue';

import { Chrome } from 'vue-color'

import draggable from 'vuedraggable'


import * as db from '../db';
import _ from 'lodash';

export default Vue.extend({
  name: 'Sheet',
  components: {
    Definition,
    DefinitionFilter,
    References,
    Field,

    ChromePicker: Chrome,
    draggable
  },
  data () {
    return({
      colors: { hex: this.sheet.hex_color },
      filters: {},
      currently_edited_record: new db.Record({}, this.sheet),
    })
  },
  props: {
    sheet: db.Sheet,
    database: db.Database,
    current_focus: Object,
  },
  computed: {
    records_to_display () : any[] {
      return(_(this.filters).values().compact()
        .reduce((records, fn : (records:db.Record[]) => db.Record[]) : db.Record[] => {
        return fn(records)
      }, this.sheet.records))
    },
    total_count () : number {
      return(this.sheet.records.length);
    },
    filter_has_limited_rows () : boolean {
      return(this.records_to_display.length !== this.total_count);
    },
    // To cache, for now...
    database_referencer_references () : any {
      return this.database.referencer_references()
    },
    // For performance
    sheet_definition_ids_to_display_set () : Set<string> {
      return new Set(this.sheet.definition_ids_to_display);
    }
  },
  methods: {
    should_display_definition (definition : db.Definition) {
      // if (!this.sheet.definition_ids_to_display.has) { debugger }
      // return(this.sheet.definition_ids_to_display.includes(definition._id))
      return(this.sheet_definition_ids_to_display_set.has(definition._id));
    },
    update_color (colors : {hex: string}) {
      this.sheet.hex_color = colors.hex;
    },
    // focus_record (record_id : string) {
    //   this.$emit('focus-sheet-and-record', this.sheet._id, record_id);
    // },
    record_focused (record : db.Record) {
      if (!this.current_focus) { return(false) }
      return(record._id === this.current_focus.record_id)
    },
    remove_row (id : string) : void {
      if(confirm(`Do you really want to delete this row?`)) {
        this.sheet.remove_row(id);
      }
    },
    remove_definition (definition : db.Definition) : void {
      this.sheet.delete_definition(definition._id);
    },
    remove_sub_definition (definition : db.ReferencesDefinition, sub_definition : db.Definition) : void {
      this.sheet.delete_sub_definition(definition, sub_definition);
    },
    focus_sheet_and_record (sheet_id : string, record_id : string, event : Event) {
      this.$emit('focus-sheet-and-record', sheet_id, record_id);
      event.stopPropagation()
    },
    referencer_references_for (sheet : db.Sheet, record : any) {
      let key = `${sheet._id}|${record._id}`

      return _.flatten(Object.values(this.database_referencer_references[key] || {}))
    },
    set_filter (definition_id : string, value : (record: any) => boolean) {
      Vue.set(this.filters, definition_id, value);
    },
    values_for (definition : db.Definition) {
      return(_(this.sheet.records).flatMap((record) => {
        return record.value_for_definition(definition)
      }).compact().value())
    },
    sortable (definition : db.Definition) : boolean {
      return(definition.type !== 'references');
    },
    sort (definition : db.Definition, direction : string) : void {
      // TODO: FIX TO USE records
      let result = _(this.sheet.records_data).sortBy(definition._id);
      if (direction === 'desc') { result = result.reverse() }
      this.sheet.records_data = result.value();
    },
    transform_values (definition : db.Definition, old_value : any, new_value : any) : void {
      this.sheet.transform_values(definition._id, old_value, new_value);
    },
    replace_definition (id : string, definition : db.Definition) : void {
      // this.sheet.replace_definition(id, definition);
      let index = _.findIndex(this.sheet.definitions, {_id: id})

      Vue.set(this.sheet.definitions, index, definition);

      // Vue.set(this.sheet, 'definitions', this.sheet.definitions)
    },
    edit_record (record : db.Record) : void {
      this.currently_edited_record = record;
      this.$bvModal.show('edit-record-modal')
    },
  },
});
</script>

<style scoped lang="scss">

.columns-to-display th,
.table-header th {
  position: sticky;
  z-index: 10;
}

.columns-to-display th { top: 92px }
.table-header th { top: 170px }

.table-header {
  z-index: 50;
}

tr {
  transition: all .5s ease-in-out;
}

.field-cell {
  white-space: nowrap;
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

.record-modal {
  .form-inline {
    margin-bottom: 0.6em;
    padding-bottom: 0.6em;
    border-bottom: 1px solid black;

    strong { width: 200px }
  }

  label {
    width: 100%;
    text-align: left;
    display: block;

    strong {
      display: inline-block;
      float: left;
    }
  }
}
</style>
