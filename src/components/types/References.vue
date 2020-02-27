<template>
  <div class="input-group referenced-results">
    <div v-for="result in referenced_records()" v-bind:key="result.id" class="referenced-result">
      <a v-on:click="remove(result)" class="remove"><v-icon name="trash-2"/></a>
      <RecordResult v-bind:result="result" v-bind:database="database"
      v-on:focus-sheet-and-record="focus_sheet_and_record" />
    </div>

    <div class="search">
      <b-input-group prepend="🔎">
        <input class="form-control" type="text" v-model="match_text" />
      </b-input-group>

      <div v-if="match_text" class="results">
        <b-list-group>
          <b-list-group-item button v-for="item in search_results()" v-bind:key="item.id"
            variant="secondary"
            v-on:click="choose(item, $event)"
            class="search_result">

            <RecordResult v-bind:result="item" v-bind:database="database" />
          </b-list-group-item>
        </b-list-group>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import RecordResult from '../RecordResult.vue';

import _ from 'lodash';

import * as db from '../../db';

export default Vue.extend({
  name: 'String',
  components: {
    RecordResult,
  },
  data () {
    return { match_text: null }
  },
  props: {
    value: Array,
    record_id: String,
    database: db.Database,
  },
  methods: {
    update_value (event : any) {
      this.$emit('input', event.target.value)
    },
    search_results () {
      if (!this.match_text) { return([]) }

      let currently_referenced_ids = _.map(this.value, 'record_id')

      return _(this.database.search(`${this.match_text}`)).map((result) => {
        return(_.extend(result, {record: result.sheet.record_values(result.record)}))
      }).reject((result) => {
        return(result.id === this.record_id ||
                currently_referenced_ids.includes(result.id));
      }).value()
    },
    referenced_records () {
      return _.map(this.value, (reference : db.Reference) => {
        let result = this.database.fetch_record(reference);

        if (!result) { return(undefined) }

        return(_.set(result, 'record', result.sheet.record_values(result.record)))
      })
    },
    choose (item : db.ReferenceQueryResult, event : any) {
      this.$emit('input', (this.value || []).concat([{record_id: item.id, sheet_id: item.sheet._id}]))
      this.match_text = null;
    },
    remove (result : db.ReferenceQueryResult) {
      this.$emit('input', _.reject(this.value, (reference : db.Reference) => {
        return(reference.record_id == result.id)
      }))
    },
    focus_sheet_and_record (sheet_id : string, record_id : string) {
      this.$emit('focus-sheet-and-record', sheet_id, record_id);
    }
  }
});
</script>

<style scoped lang="scss">

.remove {
  float: left;
  margin: 0.8em 0.8em 0 0.8em;
}

.referenced-results {
  display: block;
  text-align: left;
}

.referenced-result {
  white-space: nowrap;
}

.search {
  display: block;
  margin-top: 1em;

  .results {
    position: absolute;
    z-index: 5;

    .search_result {
      text-align: left
    }
  }
}

</style>

