<template>
  <span>
    <v-icon v-bind:class="{notice: currently_filtering}" v-b-modal="modal_dom_id" name="filter"></v-icon>

    <b-modal ok-only v-bind:id="modal_dom_id" v-bind:static="true" v-bind:title="'Filter ' + definition.name">
      <References
         v-if="definition.type === 'references'"
         v-on:input="handle_input"
         v-bind:definition="definition"
         v-bind:values="values"
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
  </span>
</template>

<script lang="ts">
import Vue from 'vue';

import * as db from '../db';
import _ from 'lodash';

import Integer from './DefinitionFilter/Integer.vue';
import References from './DefinitionFilter/References.vue';
import SelectOne from './DefinitionFilter/SelectOne.vue';
import Stringy from './DefinitionFilter/Stringy.vue';

export default Vue.extend({
  name: 'DefinitionFilter',
  components: {
    Integer,
    References,
    SelectOne,
    Stringy
  },
  data () {
    return({
      currently_filtering: false,
    });
  },
  props: {
    definition: Object,
    database: db.Database,
    values: Array,
  },
  computed: {
    modal_dom_id () {
      return `definition-filter-modal-${this.definition._id}`;
    },
  },
  methods: {
    handle_input (definition_id : string, value : (record : any) => boolean) {
      this.currently_filtering = value != null
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

