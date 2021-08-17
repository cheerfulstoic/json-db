<template>
  <div>
    <button
      v-if="!view_mode"
      type="button"
      class="btn btn-spaced btn-primary btn-secondary"
      data-toggle="modal"
      data-target="#edit-sheet-modal"
    >
      Edit Sheet
    </button>

    <button v-if="!view_mode" class="btn btn-spaced btn-primary" v-on:click="sheet.add_definition()">Add Column</button>

    <BootstrapModal
      v-for="definition in sheet.definitions"
      v-bind:key="definition._id + '-modal'"
      v-bind:id="`definition-filter-modal-${definition._id}`"
      v-bind:title="'Filter: ' + definition.name"
    >
      <div>
        <DefinitionFilterModal
          v-on:input="set_filter"
          v-on:definition-filter-modal-hidden="clear_currently_filtered_definitions()"
          v-bind:definition="definition"
          v-bind:values="values_for(definition)"
          v-bind:database="sheet.database"
          v-show="currently_filtered_definition === definition"
        />
      </div>
    </BootstrapModal>

    <!-- FIXME -->
    <BootstrapModal
      v-for="definition_infos in definitions_referring_to_sheet"
      v-bind:key="'reverse-definition-test-' + definition_infos[0].definition._id"
      v-bind:id="`reverse-definition-filter-modal-${collapse_string(definition_infos[0].definition.name)}`"
      v-bind:title="'Filter: ' + definition_infos[0].definition.name"
    >
      <div>
        <template
            v-for="definition_info in definition_infos" v-bind:key="definition_info.definition._id"
            v-show="currently_edited_reverse_definition === definition_infos.definition.name" >
          <hr/>
          <h1>{{definition_info.sheet.name}}</h1>

          <DefinitionFilterModal
            v-on:input="set_filter"
            v-on:definition-filter-modal-hidden="clear_currently_filtered_definitions()"
            v-bind:definition="reverse_references_definition(definition_info)"
            v-bind:values="source_values_for(definition_info)"
            v-bind:database="sheet.database"
          />
        </template>
      </div>
    </BootstrapModal>

    <BootstrapModal ok-only size="lg" id="edit-record-modal" modal-class="record-modal" title="Edit Record">
      <div v-if="currently_edited_record">
        <button v-on:click="focus_sheet_and_record(currently_edited_record.sheet._id, currently_edited_record._id)">
          Focus Record in Sheet
        </button>
        <div
          class="form-inline"
          v-for="definition in currently_edited_record.sheet.definitions"
          v-bind:key="definition._id"
        >
          <label>
            <strong>{{ definition.name }}</strong>
            <Field
              v-bind:record="currently_edited_record"
              v-bind:definition="definition"
              v-bind:database="sheet.database"
              v-bind:view_mode="view_mode"
              v-on:add-reference="add_reference"
              v-on:record-clicked="edit_record"
              v-on:reference-record-selected="
                reference_record_selected(currently_edited_record, definition, $event)
              "
            />
          </label>
        </div>
        <!-- <template v-slot:modal-footer v-if="current_edit_new_record_position"> -->
        <!--   <div class="w-100"> -->
        <!--     <button -->
        <!--       v-on:click="add_record(current_edit_new_record_position)" -->
        <!--       type="button" -->
        <!--       class="btn float-right btn-primary" -->
        <!--     > -->
        <!--       Save and Add New -->
        <!--     </button> -->

        <!--     <button v-on:click="stop_editing_record()" type="button" class="btn float-right btn-primary">Save</button> -->
        <!--   </div> -->
        <!-- </template> -->
      </div>
    </BootstrapModal>

    <div v-if="currently_edited_definition != null">
      <BootstrapModal id="edit-definition-modal" v-bind:title="`Edit Definition: ${currently_edited_definition.name}`">
        <DefinitionDetails
          v-bind:value="currently_edited_definition"
          v-on:input="replace_definition(currently_edited_definition._id, $event)"
          v-on:add-sub-definition="add_sub_definition(currently_edited_definition._id, $event)"
          v-on:remove="remove_definition"
          v-on:remove-sub-definition="remove_sub_definition"
          v-bind:database="sheet.database"
        />
      </BootstrapModal>
    </div>

    <table class="table table-striped table-bordered">
      <thead class="thead-light">
        <tr>
          <th colspan="100%">
            <h4>
              {{ total_count }} total rows
              <span v-bind:class="{ 'filter-display': true, 'filter-has-limited-rows': filter_has_limited_rows }">
                (filtered to {{ records_to_display.length }} record(s))
              </span>
            </h4>
          </th>
        </tr>

        <tr class="columns-to-display" ref="columns_to_display">
          <th colspan="100%">
            <div v-if="!view_mode" class="btn-group" role="group" style="float: right">
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

            <h3>Attributes to Display</h3>
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

            <h3>Inbound Relationships to Display</h3>

            <div
              class="form-check form-check-inline"
              v-for="definition_infos in definitions_referring_to_sheet"
              v-bind:key="'reverse-column-to-display-' + definition_infos[0].definition._id"
            >
              <label>
                <input
                  type="checkbox"
                  class="form-check-input"
                  v-bind:value="definition_infos[0].definition.name"
                  v-model="sheet.definition_names_referring_to_sheet_to_display"
                />
                {{ definition_infos[0].definition.name }}
              </label>
            </div>
          </th>
        </tr>

        <tr class="table-header" ref="table_header">
          <th v-if="!view_mode" v-bind:style="`top: ${sticky_top_amount}px`">&nbsp;</th>

          <template v-for="definition in definitions_to_display" v-bind:key="definition._id">
            <th class="field-cell" v-bind:style="`top: ${sticky_top_amount}px`">
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
                    notice: currently_filtered_definition === definition,
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
            v-for="definition_infos in definitions_referring_to_sheet_to_display"
            v-bind:key="'reverse-definition-' + definition_infos[0].definition._id"
          >
            <th v-bind:style="`top: ${sticky_top_amount}px`">
              {{ definition_infos[0].definition.name }} (INBOUND)

              <!-- FIXME -->
              <a role="button" data-toggle="modal" v-on:click="filter_reverse_definition(definition_infos)">
                <Icon
                  name="filter"
                  v-bind:class="{
                    notice: currently_edited_reverse_definition === definition_infos[0].definition.name,
                    warning: filtering_on(definition_infos[0].definition.name),
                  }"
                ></Icon>
              </a>
            </th>
          </template>

          <th v-if="!view_mode" v-bind:style="`top: ${sticky_top_amount}px`">&nbsp;</th>
        </tr>
      </thead>

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
              />
            </td>
          </template>

          <td
            v-for="definition_infos in definitions_referring_to_sheet_to_display"
            v-bind:key="'reverse-definition-' + definition_infos[0].definition._id"
          >
            <div v-for="definition_info in definition_infos" v-bind:key="definition_info.definition._id">
              <References
                v-bind:value="referencer_reference_references_for(sheet, definition_info.definition, record)"
                v-bind:record="record"
                v-bind:definition="definition_info.definition"
                v-bind:database="sheet.database"
                v-bind:sheet="definition_info.sheet"
                v-bind:use_source_record="true"
                v-bind:view_mode="view_mode"
                v-on:record-clicked="edit_record"
              />
            </div>

            <RecordsSearch
              v-if="!view_mode"
              v-bind:record_ids_to_skip="
                referencer_reference_references_for_record_ids_to_skip(sheet, definition_infos, record)
              "
              v-bind:database="sheet.database"
              v-bind:use_source_record="true"
              v-bind:sheet_ids_to_search="definition_infos.map((info) => info.sheet._id)"
              v-on:record-selected="
                reverse_reference_record_selected(record, definition_infos, $event)
              "
            />
          </td>

          <td v-if="!view_mode">
            <a v-on:click="remove_row(record._id)" class="remove"><Icon name="trash" /></a>
          </td>
        </tr>
      </template>
    </table>

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
  </div>
</template>

<script lang="ts">
import BootstrapModal from './BootstrapModal.vue'
import DefinitionDetails from './DefinitionDetails.vue'
import DefinitionFilterModal from './DefinitionFilterModal.vue'
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
    DefinitionFilterModal,
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
  },
  mounted() {
    let columns_element = (this.$refs.columns_to_display as HTMLElement).querySelector('th')
    // let sticky_top_amount: number
    if (columns_element) {
      let relative_height = columns_element.getBoundingClientRect().height || 0
      this.sticky_top_amount = Math.round(relative_height) + 90
    } else {
      this.sticky_top_amount = 170
    }
    
    // let header_cells = (this.$refs.table_header as HTMLElement).querySelectorAll<HTMLElement>('th')

    // _.each(header_cells, (e): void => {
    //   e.style.top = `${this.sticky_top_amount}px`
    // })
  },
  // beforeUpdate() {
  //   console.log('loading -> true')
  //   // this.loading = true;
  //   this.$emit('updating')
  // },
  mounted() {
  //   console.log('loading -> false')
  //   // this.loading = false;
  //   this.$emit('updated')
    window.scrollTo(0, this.scroll_position || 0);
  },
  data(): {
    filters: { [key: string]: db.RecordsFilter }
    currently_edited_record: db.Record | null
    recompute_database_reference_referencer_references: number
    current_edit_new_record_position: string
    currently_edited_definition: db.Definition | null
    currently_filtered_definition: db.Definition | null
    currently_edited_reverse_definition: string | null
    sticky_top_amount: number,
  } {

    return {
      filters: {},
      currently_edited_record: null,
      recompute_database_reference_referencer_references: 0,
      current_edit_new_record_position: 'top',
      currently_edited_definition: null,
      currently_filtered_definition: null,
      currently_edited_reverse_definition: null,
      sticky_top_amount: 170,
    }
  },

  emits: ['record-selected'],
  computed: {
    records_to_display(): any[] {
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
              .groupBy((definition_info) => definition_info.definition.name)
              .values()
              .value()
    },
    definitions_referring_to_sheet_to_display(): { definition: db.Definition; sheet: db.Sheet }[][] {
      return(
        this.definitions_referring_to_sheet
        .map((list) => {
          return list.filter(this.should_display_definition_referring_to_sheet)
        }).filter((list) => {
          return list.length > 0
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
    should_display_definition_referring_to_sheet(definition_info: db.ReferencesDefinitionResult): boolean {
      return this.sheet_definition_names_referring_to_sheet_to_display_set.has(definition_info.definition.name)
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
      source_record.transform_value(definition, (references) => {
        let new_reference = new db.Reference(target_record, source_record, definition, {})
        if (references == null) {
          references = []
        }
        references.splice(references.length, 1, new_reference)
        return references
      })
      this.recompute_database_reference_referencer_references =
        this.recompute_database_reference_referencer_references + 1
    },
    reference_record_selected(record: db.Record, definition: db.ReferencesDefinition, chosen_record: db.Record) {
      this.add_reference(record, definition, chosen_record)
    },
    reverse_reference_record_selected(
      record: db.Record,
      definition_infos: db.ReferencesDefinitionResult[],
      chosen_record: db.Record,
    ) {
      definition_infos.forEach((definition_info) => {
        if (chosen_record.sheet._id === definition_info.sheet._id) {
          this.add_reference(chosen_record, definition_info.definition, record)
        }
      })
    },
    referencer_reference_references_for(sheet: db.Sheet, definition: db.ReferencesDefinition, record: any) {
      let test = this.database_reference_referencer_references[record._id]

      return test ? test[definition._id] || [] : []
    },
    referencer_reference_references_for_record_ids_to_skip(
      sheet: db.Sheet,
      definition_infos: db.ReferencesDefinitionResult[],
      record: db.Record,
    ) {
      return [record._id].concat(
        _.flatMap(definition_infos, (definition_info) => {
          return _.map(this.referencer_reference_references_for(sheet, definition_info.definition, record), 'source_record._id')
        })
      )
    },
    set_filter(definition_id: string, value: (record: any) => boolean) {
      _.set(this.filters, definition_id, value)
    },
    filtering_on(definition_id: string): db.RecordsFilter {
      return this.filters[definition_id]
    },
    values_for(definition: db.Definition) {
      return _(this.sheet.records)
        .flatMap((record) => {
          return record.value_for_definition(definition)
        })
        .compact()
        .value()
    },
    // Just for use with reverse reference definitions
    source_values_for(definition_info: db.ReferencesDefinitionResult) {
      return definition_info.sheet.records
    },
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
    // Create a fake definition for compatibility with DefinitionFilterModal(/References)
    // so that the reverse reference filtering works

    reverse_references_definition(definition_info: db.ReferencesDefinitionResult): db.ReferencesDefinition {
      return new db.ReferencesDefinition({
        _id: definition_info.definition._id,
        type: 'reverse_references',
        name: definition_info.definition.name,
        referenceable_sheet_ids: [definition_info.sheet._id],
      })
    },
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
      this.currently_filtered_definition = null
      this.currently_edited_reverse_definition = null
    },

    edit_definition(definition: db.Definition) {
      this.currently_edited_definition = definition

      setTimeout(() => {
        $('#edit-definition-modal').modal('show')
      }, 1)
    },
    filter_definition(definition: db.Definition) {
      this.currently_filtered_definition = definition
      $(`#definition-filter-modal-${definition._id}`).modal('show')
    },
    filter_reverse_definition(definition_infos: db.ReferencesDefinitionResult[0]) {
      this.currently_edited_reverse_definition = definition_infos[0].definition.name
      $(`#reverse-definition-filter-modal-${this.collapse_string(definition_infos[0].definition.name)}`).modal('show')
    },
    collapse_string: (string) => {
      return string.replace(' ', '')
    }
  },
})
</script>

<style scoped lang="scss">
.columns-to-display th,
.table-header th {
  position: sticky;
  z-index: 1;
}

.columns-to-display th {
  top: 92px;
}
.table-header th {
  top: 170px;
}

.table-header {
  z-index: 50;
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
</style>
