<template>
  <b-modal ok-only
           v-bind:id="modal_dom_id"
           v-bind:static="true"
           v-bind:title="'Filter: ' + definition.name"
           v-on:hidden="$emit('definition-filter-modal-hidden', definition)"
           v-bind:visible="visible" >

    <b-tabs content-class="mt-3">
      <b-tab title="General filter" active v-on:click="reset_blank()">
        <div>
          <References
             v-if="definition.type === 'references' || definition.type === 'reverse_references'"
             v-on:input="handle_input"
             v-bind:definition="definition"
             v-bind:values="record_values()"
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
      </b-tab>
      <b-tab title="Blank filter">
        <b-button-group>
          <b-button v-on:click="show_only_blank()" v-bind:pressed="blankness_filter === true">Show only empty</b-button>
          <b-button v-on:click="show_only_non_blank()" v-bind:pressed="blankness_filter === false">Showonly non-empty</b-button>
        </b-button-group>
      </b-tab>
    </b-tabs>

  </b-modal>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import * as db from '../db';
import _ from 'lodash';

import Integer from './DefinitionFilterModal/Integer.vue';
import References from './DefinitionFilterModal/References.vue';
import SelectOne from './DefinitionFilterModal/SelectOne.vue';
import Stringy from './DefinitionFilterModal/Stringy.vue';

const is_blank = (value : any) => {
  return(value == null ||
         value === '' ||
         (Array.isArray(value) && value.length === 0))
}

export default defineComponent({
  name: 'DefinitionFilterModal',
  components: {
    Integer,
    References,
    SelectOne,
    Stringy
  },
  data () : {last_input_value: db.RecordsFilter | null,
             blankness_filter: true | false | null} {
    return({
      last_input_value: null,
      blankness_filter: null,
    });
  },
  props: {
    definition: {type: db.Definition, required: true},
    database: db.Database,
    values: Array,
    visible: Boolean,
  },
  computed: {
    modal_dom_id () : string {
      return `definition-filter-modal-${this.definition._id}`;
    },
  },
  methods: {
    handle_input (definition_id : string, value : db.RecordsFilter) {
      this.last_input_value = value;
      this.$emit('input', definition_id, value);
    },
    show_only_blank () : void {
      let definition = this.definition;
      this.blankness_filter = true;
      this.$emit(
        'input',
        this.definition._id,
        (records : any[]) => { return _.filter(records, this.blankness_filter_func(definition)) }
      )
    },
    show_only_non_blank () : void {
      let definition = this.definition;
      this.blankness_filter = false;
      this.$emit(
        'input',
        this.definition._id,
        (records : any[]) => { return _.reject(records, this.blankness_filter_func(definition)) }
      )
    },
    blankness_filter_func (definition : db.Definition) : (record: db.Record) => boolean {
      if (definition.type === 'reverse_references') {
        let current_record_ids_referenced : Set<string> = this.current_record_ids_referenced(definition);

        return((record) => { return(!current_record_ids_referenced.has(record._id)) });
      } else {
        return((record) => { return(is_blank(record.value_for_definition(definition))) });
      }
    },
    reset_blank () : void {
      this.blankness_filter = null;
      this.$emit('input', this.definition._id, this.last_input_value);
    },
    current_record_ids_referenced (definition : db.Definition) : Set<string> {
      let ids : any[] = _.chain(this.values).flatMap((remote_record : db.Record) : any[] => {
        return(_.map(remote_record.value_for_definition(definition) || [], 'record._id'))
      }).uniq().compact().value()

      return(new Set(ids))
    },
    record_values () {
      return _.map(this.values, 'record')
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

.disabled {
  border: 1px solid red;
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


