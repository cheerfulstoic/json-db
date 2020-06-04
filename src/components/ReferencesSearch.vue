<template>
  <div class="input-group referenced-records">
    <div class="search">
      <b-input-group prepend="🔎">
        <input class="form-control" type="text" v-model="match_text" />
      </b-input-group>

      <div v-if="match_text" class="results">
        <b-list-group>
          <b-list-group-item button v-for="record in search_results()" v-bind:key="record._id"
            variant="secondary"
            v-on:click.self="choose(record, $event)"
            class="search_result">

            <div class="record-result">
              <span class="sheet-name" v-bind:style="'background-color:' + record.sheet.hex_color">
                {{record.sheet.name}}
              </span>
              »

              <span v-for="(value, key) in record.description_data()" v-bind:key="key" class="property"
                    v-on:click.stop="choose(record, $event)">
                <!-- <span class="key">{{key}}</span> -->
                <span class="value">{{value}}</span>
              </span>
            </div>
          </b-list-group-item>
        </b-list-group>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import _ from 'lodash';

import * as db from '../db';

export default Vue.extend({
  name: 'References',
  data () : any {
    return({
      match_text: null,
      currently_edited_reference: null,
    })
  },
  props: {
    references_to_skip: Array,
    record: Object,
    definition: db.ReferencesDefinition,
    database: Object,
    use_source_record: Boolean,
    sheet_ids_to_search: Array,
  },
  methods: {
    search_results () : any[] {
      if (!this.match_text) { return([]) }

      let currently_referenced_ids = _.map(this.references_to_skip, 'record._id')

      return _(this.database.search(`${this.match_text}`, new Set(this.sheet_ids_to_search)))
        .reject((record) => {
            return(record._id === this.record._id || currently_referenced_ids.includes(record._id));
          })
        .take(7).value()
    },
    choose (record_to_reference : db.Record, event : any) : void {
      if (this.use_source_record) {
        this.$emit('add-reference', record_to_reference, this.definition, this.record);
      } else {
        this.$emit('add-reference', this.record, this.definition, record_to_reference);
      }
      this.match_text = null;
    },
  }
});
</script>

<style scoped lang="scss">

.sheet {
  border: 5px solid red;

  &.valid {
    border: 1px solid black;
  }

  overflow: hidden;
  border-radius: 1em 1em 0 0;
  margin-bottom: 1em;
}

.remove, .edit {
  float: left;
  margin: 0.5em 0.8em 0 0.3em;
}

.sheet-name {
  padding: 0.4em;
  margin: 0;
  border-bottom: 1px solid black;
  display: inline-block;
  width: 100%;
}

.search .sheet-name {
  width: auto;
  border: 1px solid black;
}

.referenced-records {
  display: block;
  text-align: left;
}

.referenced-record {
  white-space: nowrap;
  padding: 0 0.5em;

  &:not(:last-child) {
    border-bottom: 1px solid black;
  }
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

.record-result {
  display: inline-block;
  font-size: 0.8em;
  padding: 1em 0;
  white-space: nowrap;

  .property {
    .key {
      border: 1px solid black;
      border-radius: 1em 0 0 1em;

      font-weight: bold;

      background-color: lightskyblue;

      padding: 0.1em 0.2em 0.1em 0.4em;
    }

    .value {
      border: 1px solid black;
      border-left: 0px;
      border-radius: 0 1em 1em 0;

      padding: 0.1em 0.4em 0.1em 0.3em;
      margin-right: 0.5em;

      background-color: white;

    }

    &:hover {
      .key {
        background-color: #4294C5;
      }

      .value {
        background-color: #CCC;
      }
    }
  }
}


</style>


