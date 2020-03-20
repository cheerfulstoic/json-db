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
    <!-- Updating the value doesn't cause References to re-render (I think)
         because it's a method call -->
    <span v-if="definition.type === 'references' && !Array.isArray(record_value) && record_value">
      {{Object.keys(record_value)}}
    </span>
    <References v-if="definition.type === 'references' && record_value"
                v-bind:value="record_value"
                v-bind:record_id="record._id"
                v-bind:definition_id="definition._id"
                v-bind:definition_definitions="definition.definitions"
                v-bind:database="database"
                v-on:focus-sheet-and-record="focus_sheet_and_record"
                v-on:input="update_value" />
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
  computed: {
    // So that it's only calculated once
    record_value () {
      return this.record.value_for_definition(this.definition)
    }
  },
  methods: {
    focus_sheet_and_record (sheet_id : string, record_id : string) {
      this.$emit('focus-sheet-and-record', sheet_id, record_id);
    },
    update_value (new_value : any) {
      this.record.update_value(this.definition, new_value);
    },
  }
});
</script>

<style scoped lang="scss">


</style>


