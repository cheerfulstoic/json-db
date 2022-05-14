<template>
  <tbody class="sheet">
    <tr>
      <!-- <td colspan="100%" style="position: absolute; height: 0"> -->
      <td colspan="100%">
        <BootstrapModal
          id="definition-filter-modal"
          v-bind:title="'Filter: ' + current_filter_edit_definition?.name"
        >
          <FilterDefinitionDetails
            v-if="current_filter_edit_definition"
            v-on:input="set_filter"
            v-on:modal-hidden="clear_currently_filtered_definitions()"
            v-bind:definition="current_filter_edit_definition"
            v-bind:sheet="sheet"
          />
        </BootstrapModal>

        <BootstrapModal ok-only id="edit-record-modal" modal-class="record-modal" title="Edit Record">
          <div v-if="currently_edited_record">
            <button v-on:click="focus_sheet_and_record(currently_edited_record.sheet._id, currently_edited_record._id)">
              Focus Record in Sheet
            </button>
            <div
              v-for="definition in currently_edited_record.sheet.definitions"
              v-bind:key="definition._id"
            >
              <label style="width: 100%">
                <div class="form-group row">
                  <div class="font-weight-bold col-sm-3 col-form-label">{{ definition.name }}</div>
                  <div class="col-sm-9">
                    <Field
                      v-bind:record="currently_edited_record"
                      v-bind:definition="definition"
                      v-bind:database="sheet.database"
                      v-bind:view_mode="view_mode"
                      v-on:add-reference="add_reference"
                      v-on:record-clicked="edit_record"
                      v-on:reference-record-selected="reference_record_selected(currently_edited_record, definition, $event)"
                      v-on:currently-edited-reference="set_currently_edited_reference"
                    />
                  </div>
                </div>
              </label>
            </div>
          </div>
        </BootstrapModal>

        <BootstrapModal id="edit-definition-modal" v-bind:title="`Edit Definition: ${currently_edited_definition?.name}`">
          <div v-if="currently_edited_definition != null">
            <DefinitionDetails
              v-bind:value="currently_edited_definition"
              v-on:input="replace_definition(currently_edited_definition._id, $event)"
              v-on:add-sub-definition="add_sub_definition(currently_edited_definition._id, $event)"
              v-on:remove="remove_definition"
              v-on:remove-sub-definition="remove_sub_definition"
              v-bind:database="sheet.database"
            />
          </div>
        </BootstrapModal>

        <BootstrapModal size="lg" id="edit-reference-modal" title="Edit reference properties" >
          <div v-if="currently_edited_reference != null">
            <div v-for="reference_definition in currently_edited_reference.definition.definitions" v-bind:key="reference_definition._id">
              {{ reference_definition.name }}
              <Field
                v-bind:record="currently_edited_reference"
                v-bind:definition="reference_definition"
                v-bind:database="database"
                v-bind:view_mode="view_mode"
                v-on:currently-edited-reference="set_currently_edited_reference"
              />
            </div>

            <hr />
          </div>
        </BootstrapModal>
      </td>
    </tr>

    <tr class="header">
      <th colspan="100%" style="border-bottom: 1px solid black;">
        <h4 class="d-inline-block">
          {{ total_count }} total rows
          <span v-bind:class="{ 'filter-display': true, 'filter-has-limited-rows': filter_has_limited_rows }">
            (filtered to {{ records_to_display.length }} record(s) - <a href="javascript:void(0)" v-on:click="clear_filters()">Clear</a>)
          </span>
        </h4>

        <div v-if="!view_mode" class="btn-group" role="group" style="float: right">
          <button
            v-if="!view_mode"
            type="button"
            class="btn btn-primary"
            v-on:click="sheet.add_definition()"
          >Add Column</button>

          <button
            v-if="!view_mode"
            type="button"
            class="btn btn-primary"
            data-toggle="modal"
            data-target="#edit-sheet-modal"
          >Edit Sheet</button>

          <button class="btn btn-primary add-row-btn" v-on:click="add_record('top', false)">Add Record</button>

          <div class="btn-group" role="group">
            <button id="btnGroupDrop1" type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">

            </button>
            <div class="dropdown-menu dropdown-menu-right" aria-labelledby="btnGroupDrop1">
              <a class="dropdown-item" v-on:click="add_record('top', false)">Add to top (default)</a>
              <a class="dropdown-item" v-on:click="add_record('bottom', false)">Add to bottom</a>
              <a class="dropdown-item" v-on:click="add_record('top', true)">Add with modal</a>
            </div>
          </div>

        </div>

        <hr />

        <div
          class="form-check form-check-inline"
          v-for="definition in sheet.definitions"
          v-bind:key="'column-to-display-' + definition._id"
        >
          <label>
            <input
              type="checkbox"
              class="form-check-input"
              v-bind:value="definition._id"
              v-model="sheet.definition_ids_to_display"
            />
            {{ definition.name }}
          </label>
        </div>

        <hr/>

        <div
          class="form-check form-check-inline"
          v-for="definition in definitions_referring_to_sheet"
          v-bind:key="'reverse-column-to-display-' + definition._id"
        >
          <label>
            <input
              type="checkbox"
              class="form-check-input"
              v-bind:value="definition.name"
              v-model="sheet.definition_names_referring_to_sheet_to_display"
            />
            {{ definition.name }}
          </label>
        </div>
      </th>
    </tr>

    <tr class="column-headers">
      <th v-if="!view_mode">&nbsp;</th>

      <template v-for="definition in definitions_to_display" v-bind:key="definition._id">
        <th class="field-cell">
          {{ definition.name }}
          <br />
          <span v-if="definition.unique_id"><Icon name="lightning-bolt" style="color: red" /></span>
          <a role="button" data-toggle="modal" v-on:click="edit_definition(definition)" data-cy="edit-column">
            <Icon v-if="!view_mode" name="pencil-alt" alt_text="Edit Column" />
          </a>

          <a role="button" data-toggle="modal" v-on:click="filter_definition(definition)">
            <Icon
              name="filter"
              v-bind:class="{
                notice: current_filter_edit_definition === definition,
                warning: filtering_on(definition._id),
              }"
            ></Icon>
          </a>

          <span v-if="sortable(definition)">
            <a role="button" v-on:click="sort(definition, 'desc')">
              <Icon name="chevron-down" />
            </a>
            <a role="button" v-on:click="sort(definition, 'asc')">
              <Icon name="chevron-up" />
            </a>
          </span>
        </th>
      </template>

      <template
        class="form-check form-check-inline"
        v-for="definition in definitions_referring_to_sheet_to_display"
        v-bind:key="'reverse-definition-' + definition._id"
      >
        <th>
          {{ definition.name }} (INBOUND)

          <a role="button" data-toggle="modal" v-on:click="filter_definition(definition)">
            <Icon
              name="filter"
              v-bind:class="{
                notice: current_filter_edit_definition === definition.name,
                warning: filtering_on(definition._id),
              }"
            ></Icon>
          </a>
        </th>
      </template>

      <th v-if="!view_mode">&nbsp;</th>
    </tr>

    <template v-for="record in records_to_display" v-bind:key="record._id">
      <tr
        v-bind:class="{ selected: record_focused(record) }"
        v-bind:id="'record-' + record._id"
      >
        <td v-if="!view_mode">
          <button v-on:click="edit_record(record)" type="button" class="btn btn-spaced btn-primary btn-secondary">
            Edit
          </button>
        </td>

        <template v-for="definition in definitions_to_display" v-bind:key="definition._id">
          <td>
            <Field
              v-bind:record="record"
              v-bind:definition="definition"
              v-bind:database="sheet.database"
              v-bind:view_mode="view_mode"
              v-on:record-clicked="edit_record"
              v-on:reference-record-selected="reference_record_selected(record, definition, $event)"
              v-on:currently-edited-reference="set_currently_edited_reference"
            />
          </td>
        </template>

        <td
          v-for="definition in definitions_referring_to_sheet_to_display"
          v-bind:key="'reverse-definition-' + definition._id"
        >
          <References
            v-bind:values="record.value_for_definition(definition)"
            v-bind:side_to_display="'source_record'"
            v-on:record-clicked="edit_record"
            v-on:currently-edited-reference="set_currently_edited_reference"
          />

          <RecordsSearch
            v-if="!view_mode"
            v-bind:record_ids_to_skip="
              referencer_reference_references_for_record_ids_to_skip(sheet, definition, record)
            "
            v-bind:database="sheet.database"
            v-bind:sheet_ids_to_search="definition.referenceable_sheet_ids"
            v-on:record-selected="
              reverse_reference_record_selected(record, definition, $event)
            "
          />
        </td>

        <td v-if="!view_mode">
          <a v-on:click="remove_row(record._id)" class="remove"><Icon name="trash" /></a>
        </td>
      </tr>
    </template>

    <BootstrapModal ok-only id="edit-sheet-modal" title="Edit Sheet">
      <div class="form-group">
        <label>
          Name
          <input class="form-control" v-model="sheet.name" />
        </label>
      </div>

      <div class="form-group">
        <label>
          Color
          <input type="color" v-model="sheet.hex_color">
        </label>
      </div>

      <h1>Column order</h1>
      <h2>(drag to reorder)</h2>

      <draggable class="dragArea list-group w-full" :list="sheet.definitions" @change="log">
        <div
          class="list-group-item bg-gray-300 m-1 p-3 rounded-md text-center"
          v-for="definition in sheet.definitions"
          :key="definition._id"
        >
          {{ definition.name }}
        </div>
      </draggable>
    </BootstrapModal>
  </tbody>
</template>

<script lang="ts">
import BootstrapModal from './BootstrapModal.vue'
import DefinitionDetails from './DefinitionDetails.vue'
import FilterDefinitionDetails from './FilterDefinitionDetails.vue'
import Icon from './Icon.vue'

import References from './References.vue'
import RecordsSearch from './RecordsSearch.vue'

import Field from './Field.vue'

import { VueDraggableNext } from 'vue-draggable-next'

import * as db from '../db'
import _ from 'lodash'
import $ from 'jquery'

import { defineComponent, nextTick, reactive } from 'vue'

export default defineComponent({
  name: 'Sheet',
  components: {
    BootstrapModal,
    DefinitionDetails,
    FilterDefinitionDetails,
    Icon,
    References,
    RecordsSearch,
    Field,

    Draggable: VueDraggableNext,
  },
  props: {
    sheet: { type: db.Sheet, required: true },
    current_focus: Object,
    view_mode: Boolean,
    scroll_position: { type: Number, required: false },
    filters: Object,
  },
  mounted() {
    window.scrollTo(0, this.scroll_position || 0);

  },
  // beforeUpdate() {
  //   console.log('loading -> true')
  //   // this.loading = true;
  //   this.$emit('updating')
  // },
  // mounted() {
  //   console.log('loading -> false')
  //   // this.loading = false;
  //   this.$emit('updated')
    // window.scrollTo(0, this.scroll_position || 0);
  // },
  data(): {
    currently_edited_record: db.Record | null
    current_edit_new_record_position: string
    currently_edited_definition: db.Definition | null
    currently_edited_reference: db.Reference | null
    current_filter_edit_definition: db.Definition | null
  } {

    return {
      currently_edited_record: null,
      current_edit_new_record_position: 'top',
      currently_edited_definition: null,
      currently_edited_reference: null,
      current_filter_edit_definition: null,
    }
  },

  emits: ['record-selected', 'set-filter', 'clear-filters'],
  computed: {
    records_to_display(): any[] {
      console.log({filterValues: _.values(this.filters).length})
      return _(this.filters)
        .values()
        .compact()
        .reduce((records: db.Record[], fn: db.RecordsFilter): db.Record[] => {
          return fn(records)
        }, this.sheet.records)
    },
    total_count(): number {
      return this.sheet.records.length
    },
    filter_has_limited_rows(): boolean {
      return this.records_to_display.length !== this.total_count
    },
    // To cache, for now...
    database_reference_referencer_references(): any {
      return this.sheet.database.referencer_reference_references()
    },

    // For performance
    sheet_definition_ids_to_display_set(): Set<string> {
      return new Set(this.sheet.definition_ids_to_display)
    },
    sheet_definition_names_referring_to_sheet_to_display_set(): Set<string> {
      return new Set(this.sheet.definition_names_referring_to_sheet_to_display)
    },

    definitions_referring_to_sheet(): { definition: db.Definition; sheet: db.Sheet }[][] {
      return _(this.sheet.database.definitions_referring_to(this.sheet))
              .groupBy((definition) => definition.name)
              .map((definitions, name) => db.ReferencesDefinition.for(definitions, this.sheet))
              .values()
              .value()
    },
    definitions_referring_to_sheet_to_display(): { definition: db.Definition; sheet: db.Sheet }[][] {
      return(
        this.definitions_referring_to_sheet
        .filter((definition) => {
          return this.should_display_definition_referring_to_sheet(definition);
        })
      )
    },
    definitions_to_display(): (db.Definition | db.ReferencesDefinition)[] {
      return _.filter(this.sheet.definitions, this.should_display_definition)
    },
  },
  methods: {
    should_display_definition(definition: db.Definition): boolean {
      return this.sheet_definition_ids_to_display_set.has(definition._id)
    },
    should_display_definition_referring_to_sheet(definition: db.Definition): boolean {
      return this.sheet_definition_names_referring_to_sheet_to_display_set.has(definition.name)
    },
    record_focused(record: db.Record) {
      if (!this.current_focus) {
        return false
      }
      return record._id === this.current_focus.record_id
    },
    remove_row(id: string): void {
      if (confirm('Do you really want to delete this row?')) {
        this.sheet.remove_row(id)
      }
    },
    remove_definition(definition: db.Definition): void {
      this.sheet.delete_definition(definition._id)
      $('#edit-definition-modal').modal('hide')
      this.currently_edited_definition = null;
    },
    remove_sub_definition(definition: db.ReferencesDefinition, sub_definition: db.Definition): void {
      this.sheet.delete_sub_definition(definition, sub_definition)
    },
    focus_sheet_and_record(sheet_id: string, record_id: string) {
      this.$emit('focus-sheet-and-record', sheet_id, record_id)
      $('#edit-record-modal').modal('hide')
      this.currently_edited_record = null
    },
    add_reference(source_record: db.Record, definition: db.ReferencesDefinition, target_record: db.Record): void {
      source_record.add_reference(definition, target_record);
    },
    reference_record_selected(record: db.Record, definition: db.ReferencesDefinition, chosen_record: db.Record) {
      this.add_reference(record, definition, chosen_record)
    },
    reverse_reference_record_selected(
      record: db.Record,
      definition: db.ReferencesDefinition,
      chosen_record: db.Record,
    ) {
      definition.add_reference(chosen_record, record)
    },
    referencer_reference_references_for_record_ids_to_skip(
      sheet: db.Sheet,
      definition: db.ReferencesDefinition,
      record: db.Record,
    ) {
      return [record._id].concat(_.map(record.value_for_definition(definition), 'source_record._id'));
    },
    set_filter(definition_id: string, value: ((record: any) => boolean) | null) {
      this.$emit('set-filter', this.sheet, definition_id, value)
    },
    clear_filters() {
      this.$emit('clear-filters', this.sheet)
    },
    filtering_on(definition_id: string): Boolean {
      return this.filters[definition_id]
    },
    // Just for use with reverse reference definitions
    sortable(definition: db.Definition): boolean {
      return definition.type !== 'references'
    },
    sort(definition: db.Definition, direction: string): void {
      // TODO: Sort within db.ts
      let result = _(this.sheet.records).sortBy((record) => {
        return record.sort_value_for_definition(definition, this.sheet.database)
      })
      if (direction === 'desc') {
        result = result.reverse()
      }
      this.sheet.records = result.value()
    },
    transform_values(definition: db.Definition, old_value: any, new_value: any): void {
      this.sheet.transform_values(definition._id, old_value, new_value)
    },
    replace_definition(id: string, definition: db.Definition): void {
      // debugger
      // this.sheet.replace_definition(id, definition);

      let index = _.findIndex(this.sheet.definitions, { _id: id })

      // this.sheet.definitions = _.set(this.sheet.definitions, index, definition);

      this.sheet.definitions.splice(index, 1, definition);

      if (definition._id === this.currently_edited_definition?._id) {
        this.currently_edited_definition = definition;
      }

      // this.sheet.definitions[index] = definition;

    },
    add_sub_definition(id: string, definition: db.Definition): void {
      let index = _.findIndex(this.sheet.definitions, { _id: id })

      this.sheet.definitions[index].definitions.push(definition)
    },
    edit_record(record: db.Record): void {
      this.current_edit_new_record_position = 'top'
      this.currently_edited_record = record
      $('#edit-record-modal').modal('show')
    },
    // Create a fake definition for compatibility with FilterDefinitionDetails(/References)
    // so that the reverse reference filtering works

    add_record(position: string, in_modal: boolean): void {
      let record = this.sheet.add_row(position)

      if (in_modal) {
        this.currently_edited_record = record

        this.edit_record(record)
      }

      this.current_edit_new_record_position = position

      this.$emit('record-selected', record)
    },
    stop_editing_record(): void {
      this.currently_edited_record = null
    },

    clear_currently_filtered_definitions() {
      this.current_filter_edit_definition = null
    },

    edit_definition(definition: db.Definition) {
      this.currently_edited_definition = definition

      this.activate_modal_by_id('edit-definition-modal')
    },
    set_currently_edited_reference(reference) {
      this.currently_edited_reference = reference;

      this.activate_modal_by_id('edit-reference-modal')
    },

    activate_modal_by_id(id) {
      setTimeout(() => {
        $(`#${id}`).modal('show')
      }, 1)
    },

    filter_definition(definition: db.Definition) {
      this.current_filter_edit_definition = definition
    },
    collapse_string: (string) => {
      return string.replace(' ', '')
    }
  },
})
</script>

<style scoped lang="scss">
.sheet {
  position: relative;
}

th {
  top: 100px;
  position: sticky;
  z-index: 1;
}

tr.column-headers th {
  top: 248px;
}

.table-bordered th, .table-bordered td {
  border: 1px solid #ebebeb;
}

.table {
  border: 1px solid black;
}

.table th label {
  margin-bottom: 0;
}

table {
  th, td {
    padding: 0.75rem;
    border-collapse: collapse;
    border: 1px solid #dee2e6;
  }
  th {
    background-color: white;
  }

  tr.header th {
    padding-bottom: 0;
  }
}

tr {
  transition: all 0.5s ease-in-out;
}

.field-cell {
  white-space: nowrap;
}

tr.selected td {
  background-color: rgba(0, 0, 0, 0.075);
}

.btn-spaced {
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
    margin-bottom: 0.3em;
    padding-bottom: 0.3em;
    border-bottom: 1px solid black;

    strong {
      width: 200px;
    }
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

hr {
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}
</style>
