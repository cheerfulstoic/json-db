<template>
  <span>
    <b-modal ok-only
             id="definition-filter-edit-modal"
             v-bind:static="true"
             v-bind:visible="visible"
             v-on:hidden="$emit('modal-hidden')"
             v-bind:title="`Filter: ${definition.name}`">
      <div v-if="definition != null">
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
      </div>

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
  data () : object {
    return({ });
  },
  props: {
    definition: Object,
    sheet: db.Sheet,
    database: db.Database,
  },
  computed: {
    modal_dom_id () : string {
      return `definition-filter-modal-${this.definition._id}`;
    },
    record_values () : db.Record[] {
      return _.map(this.values, 'record')
    },
    visible () : boolean {
      return !!this.definition;
    },
    title () : string {
      if (this.definition !== null) {
        return `Filter: ${this.definition.name}`
      } else {
        return ''
      }
    },
    values () : any[] {
      return(_(this.sheet.records).flatMap((record) => {
        return record.value_for_definition(this.definition)
      }).compact().value())
    },
  },
  methods: {
    handle_input (definition_id : string, value : (record : any) => boolean) : void {
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

