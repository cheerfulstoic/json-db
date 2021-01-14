<template>
  <span>
    {{ values.length }} references used

    <div v-for="record in currently_filtered_records" v-bind:key="record._id" class="referenced-record">
      <a v-on:click.stop="remove(record)" class="remove">
        <Icon name="trash" />
      </a>
      <a v-if="definition.definitions.length" v-on:click.stop="edit_properties(reference)" class="edit">
        <Icon name="pencil-alt" />
      </a>

      <RecordResult v-bind:data="record.description_data()" />
    </div>

    <RecordsSearch
      v-bind:record_ids_to_limit_to="filtered_record_ids()"
      v-bind:database="database"
      v-bind:sheet_ids_to_search="definition.referenceable_sheet_ids"
      v-on:record-selected="record_selected"
    />
  </span>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import Icon from '../Icon.vue'
import RecordResult from '../RecordResult.vue'
import RecordsSearch from '../RecordsSearch.vue'

import * as db from '../../db'
import _ from 'lodash'

export default defineComponent({
  name: 'Reference',
  props: {
    definition: { type: db.Definition, required: true },
    database: db.Database,
    values: Array, // Record objects
  },
  components: {
    Icon,
    RecordResult,
    RecordsSearch,
  },
  data(): { currently_filtered_records: db.Record[]; match_text: null | string } {
    return {
      match_text: null,
      currently_filtered_records: [],
    }
  },
  emits: ['input'],
  methods: {
    filtered_record_ids() {
      return _.map(this.values, '_id')
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
      let current_records = this.currently_filtered_records
      let current_record_ids = _.map(this.currently_filtered_records, '_id')
      let def = this.definition
      if (current_record_ids.length === 0) {
        this.$emit('input', this.definition._id, null)
      } else {
        this.$emit('input', this.definition._id, (records: db.Record[]) => {
          return _.filter(records, (record) => {
            if (def.type === 'reverse_references') {
              return _.some(current_records, (filtered_record) => {
                return _.some(filtered_record.value_for_definition(def), (reference) => {
                  return reference.record._id === record._id
                })
              })
            } else {
              let referenced_ids = _.map(record.value_for_definition(def) || [], 'record._id')
              return _.intersection(current_record_ids, referenced_ids).length > 0
            }
          })
        })
      }
    },
  },
})
</script>

<style scoped lang="scss"></style>
