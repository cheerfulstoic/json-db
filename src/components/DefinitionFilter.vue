<template>
  <span>
    <span v-if="definition.type === 'references'">
      <v-icon v-bind:class="{notice: items.length}" v-b-modal="modal_dom_id()" name="filter"></v-icon>
    </span>

    <b-modal v-bind:id="modal_dom_id()" v-bind:title="'Filter ' + definition.name">
      <div v-if="definition.type === 'references'">
        {{values.length}} references used

        <div v-for="item in items" v-bind:key="item.id">
          <RecordResult v-bind:result="item" v-bind:database="database" />

          <span v-on:click="remove(item)">
            <v-icon name="trash-2"/>
          </span>
        </div>

        <b-input-group prepend="🔎">
          <input class="form-control" type="text" v-model="match_text" />
        </b-input-group>

        <div v-if="match_text" class="results">
          <b-list-group>
            {{search_results[0]}}
            <b-list-group-item button v-for="item in search_results()" v-bind:key="item.id"
              variant="secondary"
              v-on:click="choose(item, $event)"
              class="search_result">

              <RecordResult v-bind:result="item" v-bind:database="database" />
            </b-list-group-item>
          </b-list-group>
        </div>
      </div>
    </b-modal>
  </span>
</template>

<script lang="ts">
import Vue from 'vue';

import * as db from '../db';
import _ from 'lodash';

import RecordResult from './RecordResult.vue';

export default Vue.extend({
  name: 'DefinitionFilter',
  components: {
    RecordResult,
  },
  props: {
    definition: Object,
    database: db.Database,
    values: Array,
  },
  data () : { items: db.ReferenceQueryResult[], match_text: null | string } {
    return({
      match_text: null,
      items: [],
    })
  },
  methods: {
    modal_dom_id () {
      return `definition-filter-modal-${this.definition._id}`;
    },
    search_results () {
      if (!this.match_text) { return([]) }

      let currently_referenced_ids = _.map(this.values, 'record_id')
      let currently_filtered_ids = _.map(this.items, 'id')

      return _(this.database.search(`${this.match_text}`)).map((result) => {
        return(_.extend(result, {record: result.sheet.record_values(result.record)}))
      }).filter((result) => {
        return(currently_referenced_ids.includes(result.id) &&
               !currently_filtered_ids.includes(result.id));
      }).value()
    },
    choose (item : db.ReferenceQueryResult, event : any) {
      this.items.push(item);
      this.emit_input();
      this.match_text = null;
    },
    remove (item : db.ReferenceQueryResult) {
      console.log('remove');
      _.pull(this.items, item);
      this.emit_input();
    },

    emit_input () {
      let ids = _.map(this.items, 'id')
      let def = this.definition;
      this.$emit('input', this.definition._id,
                 (record : any) => {
                   if (ids.length === 0) { return(true) }

                   let referenced_ids = _.map(record[def._id] || [], 'record_id')
                   return(_.intersection(ids, referenced_ids).length > 0)
                 })
    }
  },
});
</script>

<style scoped lang="scss">

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

