<template>
  <span>
    <String v-if="definition.type === 'string'"
            v-bind:value="record_value"
            v-on:input="update_value" />
    <TextArea v-if="definition.type === 'text_area'"
              v-bind:value="record_value"
              v-on:input="update_value" />
    <Integer v-if="definition.type === 'integer'"
             v-bind:value="record_value"
             v-on:input="update_value" />
    <SelectOne v-if="definition.type === 'select_one'"
               v-bind:value="record_value"
               v-bind:definition="definition"
               v-on:input="update_value" />
    <References v-if="definition.type === 'references'"
                v-bind:value="record_value"
                v-bind:record="record"
                v-bind:definition="definition"
                v-bind:database="database"
                v-bind:sheet="reference_sheet"
                v-on:record-clicked="record_clicked"
                v-on:input="update_value"
                v-on:add-reference="add_reference" />
    <Expression v-if="definition.type === 'expression'"
                v-bind:value="record_value"
                v-bind:definition="definition"
                v-bind:global_variables="database.global_variables"
                v-on:input="update_value" />
  </span>
</template>

<script lang="ts">
import Vue from 'vue';

import Expression from './types/Expression.vue';
import Integer from './types/Integer.vue';
import References from './References.vue';
import SelectOne from './types/SelectOne.vue';
import String from './types/String.vue';
import TextArea from './types/TextArea.vue';

import * as db from '../db';
import _ from 'lodash';

export default Vue.extend({
  name: 'Field',
  components: {
    Expression,
    Integer,
    References,
    SelectOne,
    String,
    TextArea,
  },
  props: {
    record: Object,
    definition: Object,
    database: db.Database,
  },
  data () {
    return({recompute: 0});
  },
  computed: {
    record_value () : any {
      // Doing this for now because doing `update_value` for expressions
      // (which are objects) doesn't cause a re-rendering
      // (I think it's becaues they are objects)
      let dummy = this.recompute;

      return this.record.value_for_definition(this.definition)
    },
    reference_sheet (): db.Sheet | undefined {
      if (this.record_value[0]) {
        return(this.record_value[0].record.sheet)
      } else {
        return(undefined)
      }
    },
  },
  methods: {
    record_clicked (record : db.Record) {
      this.$emit('record-clicked', record);
    },
    add_reference (source_record : db.Record, definition : db.ReferencesDefinition, target_record : db.Record) : void {
      this.$emit('add-reference', source_record, definition, target_record);
    },
    update_value (new_value : any) {
      this.recompute = this.recompute + 1;
      this.record.update_value(this.definition, new_value);
    },
  }
});
</script>

<style scoped lang="scss">


</style>


