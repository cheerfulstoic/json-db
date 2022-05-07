<template>
  <span>
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

    <button
      v-on:click="reset_filter()"
      type="button"
      v-bind:class="{btn: true, 'btn-secondary': true}"
      >Clear Filter</button>
  </span>
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
  })],
  data(): { match_text: null | string } {
    return {
      match_text: null,
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
      let current_record_ids = _.map(this.currently_filtered_records, '_id')
      let def = this.definition
      if (current_record_ids.length === 0) {
        this.$emit('input', this.definition._id, null)
      } else {
        this.$emit('input', this.definition._id, (records: db.Record[]) => {
          return _.filter(records, (record) => {
            return (
              !_(record.value_for_definition(def) || [])
                .map((reference) => reference.record_for_definition(def)._id )
                .intersection(current_record_ids)
                .isEmpty()
              )
          })
        })
      }
    },
    reset_filter() {
      this.$emit('input', this.definition._id, null);
      this.currently_filtered_records = [];
    },
  },
})
</script>

<style scoped lang="scss"></style>
