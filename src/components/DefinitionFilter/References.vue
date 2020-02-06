<template>
  <span>
    {{values.length}} references used

    <div v-for="item in items" v-bind:key="item.id">
      <a class="remove" v-on:click="remove(item)">
        <v-icon name="trash-2"/>
      </a>

      <RecordResult v-bind:result="item" v-bind:database="database" />
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
  </span>
</template>

<script lang="ts">
import Vue from 'vue';

import * as db from '../../db';
import _ from 'lodash';

import RecordResult from '../RecordResult.vue';

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
      _.pull(this.items, item);
      this.emit_input();
    },

    emit_input () {
      let ids = _.map(this.items, 'id')
      let def = this.definition;
      if (ids.length === 0) {
        this.$emit('input', this.definition._id, null);
      } else {
        this.$emit('input', this.definition._id,
                   (records : any[]) => {
                     return _.filter(records, (record) => {
                       let referenced_ids = _.map(record[def._id] || [], 'record_id')
                       return(_.intersection(ids, referenced_ids).length > 0)
                     })
                   })
      }
    }
  },
});
</script>

<style scoped lang="scss">

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


