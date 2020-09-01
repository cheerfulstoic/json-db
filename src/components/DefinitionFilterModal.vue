<template>
  <b-modal ok-only
           v-bind:id="modal_dom_id"
           v-bind:static="true"
           v-bind:title="'Filter: ' + definition.name"
           v-on:hidden="$emit('definition-filter-modal-hidden', definition)"
           v-bind:visible="visible" >
    <References
       v-if="definition.type === 'references' || definition.type === 'reverse_references'"
       v-on:input="handle_input"
       v-bind:definition="definition"
       v-bind:values="record_values"
       v-bind:database="database" />

    <SelectOne
       v-if="definition.type === 'select_one'"
       v-on:input="handle_input"
       v-bind:definition="definition"
       v-bind:values="values"
       v-bind:database="database" />

    <Stringy
       v-if="['string', 'text_area'].includes(definition.type)"
       v-on:input="handle_input"
       v-bind:definition="definition"
       v-bind:values="values"
       v-bind:database="database" />

    <Integer
       v-if="definition.type === 'integer'"
       v-on:input="handle_input"
       v-bind:definition="definition"
       v-bind:values="values"
       v-bind:database="database" />

  </b-modal>
</template>

<script lang="ts">
import Vue from 'vue';

import * as db from '../db';
import _ from 'lodash';

import Integer from './DefinitionFilterModal/Integer.vue';
import References from './DefinitionFilterModal/References.vue';
import SelectOne from './DefinitionFilterModal/SelectOne.vue';
import Stringy from './DefinitionFilterModal/Stringy.vue';

export default Vue.extend({
  name: 'DefinitionFilterModal',
  components: {
    Integer,
    References,
    SelectOne,
    Stringy
  },
  data () {
    return({
      // currently_filtering: false,
    });
  },
  props: {
    definition: Object,
    database: db.Database,
    values: Array,
    visible: Boolean,
  },
  computed: {
    modal_dom_id () {
      return `definition-filter-modal-${this.definition._id}`;
    },
    record_values () {
      return _.map(this.values, 'record')
    },
  },
  methods: {
    handle_input (definition_id : string, value : (record : any) => boolean) {
      // this.currently_filtering = value != null
      this.$emit('input', definition_id, value);
    },
  },
});
</script>

<style scoped lang="scss">

.modal-dialog {
  z-index: 20;
}

.remove {
  margin: 0.8em 0.8em 0 0.8em;
}

.search {
  display: block;
  margin-top: 1em;

  .results {
    position: absolute;
    z-index: 1;

    .search_result {
      text-align: left
    }
  }
}


</style>


