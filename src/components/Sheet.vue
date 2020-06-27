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

        <tr class="columns-to-display" ref="columns_to_display">
          <th colspan="100%">
            <h3>Columns to Display</h3>
            <div class="form-check form-check-inline" v-for="definition in sheet.definitions" v-bind:key="'column-to-display-' + definition._id">
              <label>
                <input type="checkbox" class="form-check-input" v-bind:value="definition._id" v-model="sheet.definition_ids_to_display">
                {{definition.name}}
              </label>

            </div>

            <div class="form-check form-check-inline" v-for="definition_info in definitions_referring_to_sheet" v-bind:key="'reverse-column-to-display-' + definition_info.definition._id">
              <input type="checkbox" class="form-check-input" v-bind:value="definition_info.definition._id" v-model="sheet.definition_ids_referring_to_sheet_to_display">
              {{definition_info.sheet.name}}
              -
              {{definition_info.definition.name}}
            </div>

          </th>
        </tr>


        <tr class="table-header" ref="table_header">
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

          <template class="form-check form-check-inline" v-for="definition_info in definitions_referring_to_sheet">
            <th v-if="should_display_definition_referring_to_sheet(definition_info)" v-bind:key="'reverse-definition-' + definition_info.definition._id">
              {{definition_info.sheet.name}}
              -
              {{definition_info.definition.name}}

              <DefinitionFilter
                 v-on:input="set_filter"
                 v-bind:definition="reverse_references_definition(definition_info)"
                 v-bind:values="source_values_for(definition_info)"
                 v-bind:database="database" />

            </th>
          </template>

          <th>&nbsp;</th>
        </tr>
      </thead>

      <div v-if="currently_edited_record">
        <b-modal ok-only size="lg" id="edit-record-modal" modal-class="record-modal" title="Edit Record">
          <button v-on:click="focus_sheet_and_record(currently_edited_record.sheet._id, currently_edited_record._id)">Focus Record in Sheet</button>
          <div class="form-inline" v-for="definition in currently_edited_record.sheet.definitions" v-bind:key="definition._id">
            <label>
              <strong>{{definition.name}}</strong>
              <Field v-bind:record="currently_edited_record"
                     v-bind:definition="definition"
                     v-bind:database="database"
                     v-on:add-reference="add_reference"
                     v-on:record-clicked="edit_record"
                     v-on:reference-record-selected="reference_record_selected(currently_edited_record, definition, ...arguments)" />
            </label>
          </div>
        </b-modal>
      </div>

      <template v-for="record in records_to_display">
        <tr v-bind:key="record._id"
            v-bind:class="{selected: record_focused(record)}"
            v-bind:id="'record-' + record._id"
            >
          <td>
            <b-button class="btn btn-primary" v-on:click="edit_record(record)">Edit</b-button>
          </td>

          <template v-for="definition in sheet.definitions">
            <td v-if="should_display_definition(definition)" v-bind:key="definition._id">
              <Field v-bind:record="record"
                     v-bind:definition="definition"
                     v-bind:database="database"
                     v-on:record-clicked="edit_record"
                     v-on:reference-record-selected="reference_record_selected(record, definition, ...arguments)" />
            </td>
          </template>

          <template class="form-check form-check-inline" v-for="definition_info in definitions_referring_to_sheet">
            <td v-if="should_display_definition_referring_to_sheet(definition_info)" v-bind:key="'reverse-definition-' + definition_info.definition._id">
              <References
                v-bind:value="referencer_reference_references_for(sheet, definition_info.definition, record)"
                v-bind:record="record"
                v-bind:definition="definition_info.definition"
                v-bind:database="database"
                v-bind:sheet="definition_info.sheet"
                v-bind:use_source_record="true"
                v-on:record-clicked="edit_record" />
              <RecordsSearch v-bind:record_ids_to_skip="referencer_reference_references_for_record_ids_to_skip(sheet, definition_info.definition, record)"
                          v-bind:database="database"
                          v-bind:use_source_record="true"
                          v-bind:sheet_ids_to_search="[definition_info.sheet._id]"
                          v-on:record-selected="reverse_reference_record_selected(record, definition_info.definition, ...arguments)" />
            </td>
          </template>

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
import RecordsSearch from './RecordsSearch.vue';

import Field from './Field.vue';

import { Chrome } from 'vue-color'

import draggable from 'vuedraggable'


import * as db from '../db';
import _ from 'lodash';

export default Vue.extend({
  name: 'Sheet',
  mounted () {
    let columns_element = (this.$refs.columns_to_display as HTMLElement).querySelector('th');
    let sticky_top_amount : number;
    if (columns_element) {
      let relative_height = columns_element.getBoundingClientRect().height || 0;
      sticky_top_amount = Math.round(relative_height) + 90;
    } else {
      sticky_top_amount = 170;
    }
    let header_cells = (this.$refs.table_header as HTMLElement).querySelectorAll<HTMLElement>("th");

    _.each(header_cells, ((e) : void => {
      e.style.top = `${sticky_top_amount}px`
    }))
  },
  components: {
    Definition,
    DefinitionFilter,
    References,
    RecordsSearch,
    Field,

    ChromePicker: Chrome,
    draggable
  },
  data () {
    return({
      colors: { hex: this.sheet.hex_color },
      filters: {},
      currently_edited_record: new db.Record({}, this.sheet),
      recompute_database_reference_referencer_references: 0,
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
    database_reference_referencer_references () : any {
      let dummy = this.recompute_database_reference_referencer_references;

      return this.database.referencer_reference_references()
    },

    // For performance
    sheet_definition_ids_to_display_set () : Set<string> {
      return new Set(this.sheet.definition_ids_to_display);
    },
    sheet_definition_ids_referring_to_sheet_to_display_set () : Set<string> {
      return new Set(this.sheet.definition_ids_referring_to_sheet_to_display);
    },

    definitions_referring_to_sheet () : { definition: db.Definition, sheet: db.Sheet }[] {
      return(this.database.definitions_referring_to(this.sheet))
    },
  },
  methods: {
    should_display_definition (definition : db.Definition) {
      // if (!this.sheet.definition_ids_to_display.has) { debugger }
      // return(this.sheet.definition_ids_to_display.includes(definition._id))
      return(this.sheet_definition_ids_to_display_set.has(definition._id));
    },
    should_display_definition_referring_to_sheet (definition_info : db.ReferencesDefinitionResult) {
      return(this.sheet_definition_ids_referring_to_sheet_to_display_set.has(definition_info.definition._id));
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
      this.currently_edited_record = new db.Record({}, this.sheet);
    },
    add_reference (source_record : db.Record, definition : db.ReferencesDefinition, target_record : db.Record) : void {
      source_record.transform_value(definition, (references) => {
        let new_reference = new db.Reference(target_record, source_record, definition, {})
        if (references == null) { references = [] }
        references.splice(references.length, 1, new_reference)
        return(references)
      })
      this.recompute_database_reference_referencer_references = this.recompute_database_reference_referencer_references + 1;
    },
    reference_record_selected (record : db.Record, definition : db.ReferencesDefinition, chosen_record : db.Record) {
      this.add_reference(record, definition, chosen_record);
    },
    reverse_reference_record_selected (record : db.Record, definition : db.ReferencesDefinition, chosen_record : db.Record) {
      this.add_reference(chosen_record, definition, record);
    },
    referencer_reference_references_for (sheet : db.Sheet, definition : db.ReferencesDefinition, record : any) {
      let test = this.database_reference_referencer_references[record._id];

      return test ? _.uniq(test[definition._id] || []) : []
    },
    referencer_reference_references_for_record_ids_to_skip (sheet : db.Sheet, definition : db.ReferencesDefinition, record : db.Record) {
      return(
        [record._id].concat(_.map(this.referencer_reference_references_for(sheet, definition, record), 'source_record._id')))
    },
    set_filter (definition_id : string, value : (record: any) => boolean) {
      Vue.set(this.filters, definition_id, value);
    },
    values_for (definition : db.Definition) {
      return(_(this.sheet.records).flatMap((record) => {
        return record.value_for_definition(definition)
      }).compact().value())
    },
    // Just for use with reverse reference definitions
    source_values_for (definition_info : db.ReferencesDefinitionResult) {
      return(definition_info.sheet.records)
    },
    sortable (definition : db.Definition) : boolean {
      return(definition.type !== 'references');
    },
    sort (definition : db.Definition, direction : string) : void {
      // TODO: Sort within db.ts
      let result = _(this.sheet.records).sortBy(record => { return(record.sort_value_for_definition(definition, this.database)) });
      if (direction === 'desc') { result = result.reverse() }
      this.sheet.records = result.value();
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
    // Create a fake definition for compatibility with DefinitionFilter(/References)
    // so that the reverse reference filtering works
    reverse_references_definition (definition_info : db.ReferencesDefinitionResult) : db.ReferencesDefinition {
      return(new db.ReferencesDefinition({
        _id: definition_info.definition._id,
        type: 'reverse_references',
        name: `${definition_info.sheet.name} - ${definition_info.definition.name}`,
        referenceable_sheet_ids: [definition_info.sheet._id]
      }))
    }
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
