<template>
  <span>
    {{values.length}} references used

    <References
      v-model="currently_filtered_records"
      v-on:input="emit_input"
      v-bind:database="database" />
  </span>
</template>

<script lang="ts">
import Vue from 'vue';

import References from '../References.vue';

import * as db from '../../db';
import _ from 'lodash';

export default Vue.extend({
  name: 'DefinitionFilter',
  props: {
    definition: Object,
    database: db.Database,
    values: Array,
  },
  components: {
    References
  },
  data () : {
    currently_filtered_records: db.Record[],
    match_text: null | string
  } {
    return({
      match_text: null,
      currently_filtered_records: [],
    })
  },
  methods: {
    emit_input (new_values : db.Record[]) {
      this.currently_filtered_records = new_values;

      let current_record_ids = _.map(this.currently_filtered_records, '_id')
      let def = this.definition;
      if (current_record_ids.length === 0) {
        this.$emit('input', this.definition._id, null);
      } else {
        this.$emit('input', this.definition._id,
                   (records : db.Record[]) => {
                     return _.filter(records, (record) => {
                       let referenced_ids = _.map(record.value_for_definition(def) || [], 'record._id')
                       return(_.intersection(current_record_ids, referenced_ids).length > 0)
                     })
                   })
      }
    }
  },
});
</script>

<style scoped lang="scss">

</style>


