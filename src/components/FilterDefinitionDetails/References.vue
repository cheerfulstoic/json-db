<template>
  <div>
    {{ values.length }} references used

    <div v-for="record in currently_filtered_records" v-bind:key="record._id" class="referenced-record">
      <a v-on:click.stop="remove(record)" class="remove">
        <Icon name="trash" />
      </a>

      <RecordResult
        v-bind:definitions="[record.sheet.unique_id_definition()]"
        v-bind:data_object="record"
        />
    </div>

    <RecordsSearch
      v-bind:record_ids_to_limit_to="filtered_record_ids()"
      v-bind:database="database"
      v-bind:sheet_ids_to_search="definition.referenceable_sheet_ids"
      v-on:record-selected="record_selected"
    />

    <hr/>

    <div v-if="definition.definitions.length">
      <h2>Sub-Definitions</h2>

      <div v-for="sub_definition in definition.definitions" v-bind:key="sub_definition._id">
        <h3>{{sub_definition.name}}</h3>

        <div v-if="sub_definition.type == 'select_one'">
          <label class="form-check-label" v-for="value in sub_definition_options(sub_definition)" v-bind:key="value">
            <span v-if="value">
              <input type="checkbox" class="form-check-input" v-bind:value="value" v-model="currently_filtered_sub_definitions[sub_definition._id]" v-on:change="emit_input" />
              {{value}}
            </span>
          </label>
        </div>

        <div v-else>
          FILTERING NOT YET SUPPORTED
        </div>

        <hr/>
      </div>

      <button v-on:click="clear_currently_filtered_sub_definitions()" class="btn btn-secondary" type="button">Unselect All</button>
    </div>

    <button
      v-on:click="reset_filter()"
      type="button"
      class="btn btn-secondary"
      >Clear Filter</button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import Icon from '../Icon.vue'
import RecordResult from '../RecordResult.vue'
import RecordsSearch from '../RecordsSearch.vue'

import * as db from '../../db'
import store_data_mixin from '../../store_data_mixin'
import _ from 'lodash'

export default defineComponent({
  name: 'Reference',
  props: {
    definition: { type: db.Definition, required: true },
    database: db.Database,
    values: Array, // Reference objects
  },
  components: {
    Icon,
    RecordResult,
    RecordsSearch,
  },
  mixins: [store_data_mixin({
    currently_filtered_records: (component) => {
      return { path: [component.definition._id], initial: [] }
    },
    currently_filtered_sub_definitions: (component) => {
      return { path: [component.definition._id], initial: component.currently_filtered_sub_definitions_default() }
    },
  })],
  data(): { match_text: null | string } {
    return {
      match_text: null,
      sub_definitions_by_id: _.keyBy(this.definition.definitions, '_id'),
    }
  },
  emits: ['input'],
  methods: {
    filtered_record_ids() {
      if (this.definition.type === 'reverse_references') {
        return _.map(this.values, 'source_record._id')
      } else {
        return _.map(this.values, 'record._id')
      }
    },
    remove(record: db.Record) {
      let index_to_remove = _(this.currently_filtered_records).map('_id').indexOf(record._id)
      // Remove in a way that will be reactive
      this.currently_filtered_records.splice(index_to_remove, 1)

      this.emit_input()
    },
    record_selected(chosen_record: db.Record) {
      _.set(this, 'currently_filtered_records', this.currently_filtered_records.concat([chosen_record]))

      this.emit_input()
    },
    emit_input() {
      let current_record_ids = new Set(_.map(this.currently_filtered_records, '_id'));
      let def = this.definition
      if (current_record_ids.size === 0 && !this.currently_filtering_for_sub_definitions()) {
        this.$emit('input', this.definition._id, null)
      } else {
        this.$emit('input', this.definition._id, (records: db.Record[]) => {
          return _.filter(records, (record) => {
            return(
              !_(record.value_for_definition(def) || [])
                .map((reference) => reference.record_for_definition(def)._id )
                .intersection(current_record_ids)
                .isEmpty() ||

              this.record_matches_a_filtered_sub_definition(record)

            )
          })
        })
      }
    },
    currently_filtered_sub_definitions_default() {
      return(_(this.definition.definitions).filter({type: 'select_one'}).reduce((result, sub_definition) => {
        return(_.set(result, sub_definition._id, this.sub_definition_options(sub_definition)))
      }, {}))
    },
    clear_currently_filtered_sub_definitions() {
      this.currently_filtered_sub_definitions =
        _(this.definition.definitions).filter({type: 'select_one'}).reduce((result, sub_definition) => {
          return(_.set(result, sub_definition._id, []))
        }, {});
      this.emit_input()
    },
    currently_filtering_for_sub_definitions() {
      return _.some(this.currently_filtered_sub_definitions, (selected_values, sub_definition_id) => {
        let sub_definition = this.sub_definitions_by_id[sub_definition_id];
        return this.sub_definition_options(sub_definition).length != selected_values.length
      })
    },
    reset_filter() {
      this.$emit('input', this.definition._id, null);
      this.currently_filtered_records = [];
      this.currently_filtered_sub_definitions = this.currently_filtered_sub_definitions_default();
    },
    sub_definition_options(sub_definition) {
      return _(this.values).map((reference) => reference.value_for_definition(sub_definition)).uniq().sort().value()
    },
    record_matches_a_filtered_sub_definition(record) {
      return _.some(record.value_for_definition(this.definition), (reference) => {
        return _.some(this.currently_filtered_sub_definitions, (selected_values, sub_definition_id) => {
          let sub_definition = this.sub_definitions_by_id[sub_definition_id];

          return selected_values.includes(reference.value_for_definition(sub_definition));
        })
      })
    },
  },
})
</script>

<style scoped lang="scss">
.form-check-label {
  display: block;
}
</style>
