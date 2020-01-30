<template>
  <span>
    <String v-if="definition.type === 'string'" v-model="record[definition._id]" />
    <TextArea v-if="definition.type === 'text_area'" v-model="record[definition._id]" />
    <Integer v-if="definition.type === 'integer'" v-model="record[definition._id]" />
    <SelectOne v-if="definition.type === 'select_one'" v-model="record[definition._id]" v-bind:definition="definition" />
    <References v-if="definition.type === 'references'" v-model="record[definition._id]"
                v-bind:database="database" v-bind:record_id="record._id"
                v-on:focus-sheet-and-record="focus_sheet_and_record" />
    <Expression v-if="definition.type === 'expression'"
                v-model="record[definition._id]"
                v-bind:definition="definition"
                v-bind:global_variables="database.global_variables"/>
  </span>
</template>

<script lang="ts">
import Vue from 'vue';

import Expression from './types/Expression.vue';
import Integer from './types/Integer.vue';
import References from './types/References.vue';
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
  methods: {
    focus_sheet_and_record (sheet_id : string, record_id : string) {
      this.$emit('focus-sheet-and-record', sheet_id, record_id);
    },
  }
});
</script>

<style scoped lang="scss">


</style>


