<template>
  <div class="input-group referenced-records">
    <div v-for="reference_group in grouped_references()"
         v-bind:key="reference_group[0].record.sheet._id"
         class="sheet">
      <span class="sheet-name" v-bind:style="'background-color:' + reference_group[0].record.sheet.hex_color">
        {{reference_group[0].record.sheet.name}}
      </span>
      <div v-for="reference in reference_group" v-bind:key="reference.record._id" class="referenced-record">
        <a v-on:click.stop="remove(reference.record)" class="remove" v-if="changable">
          <v-icon name="trash-2"/>
        </a>
        <a v-on:click.stop="edit_properties(reference)" class="remove" v-if="changable">
          <v-icon name="edit"/>
        </a>
        <RecordResult v-bind:record="reference.record" v-bind:database="database"
          v-on:focus-sheet-and-record="focus_sheet_and_record" />
      </div>
    </div>

    <div class="search" v-if="changable">
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
                    v-on:click.self="$emit('focus-sheet-and-record', record.sheet._id, record._id)">
                <!-- <span class="key">{{key}}</span> -->
                <span class="value">{{value}}</span>
              </span>
            </div>
          </b-list-group-item>
        </b-list-group>
      </div>
    </div>

    <div v-if="currently_edited_reference">
      <b-modal ok-only v-bind:id="this.references_definition_edit_modal_id" title="Edit reference properties">
        <div v-for="references_definition in definition_definitions" v-bind:key="references_definition._id">
          {{references_definition.name}}
          <Field v-bind:record="currently_edited_reference" v-bind:definition="references_definition" v-bind:database="database"/>
        </div>

      </b-modal>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import RecordResult from './RecordResult.vue';

import _ from 'lodash';

import * as db from '../db';

export default Vue.extend({
  name: 'References',
  components: {
    RecordResult: RecordResult,
    Field: () => import('./Field.vue') as any
  },
  data () {
    return({
      match_text: null,
      currently_edited_reference: {data: {}},
      references_definition_edit_modal_id: 'references-definitions-edit-modal-' + this.record_id + this.definition_id,
    })
  },
  props: {
    value: Array,
    record_id: String,
    definition_definitions: Array,
    definition_id: String,
    database: Object,
    changable: { type: Boolean, required: false, default: true },
  },
  methods: {
    search_results () : any[] {
      if (!this.match_text) { return([]) }

      let currently_referenced_ids = _.map(this.value, 'record._id')

      return _(this.database.search(`${this.match_text}`))
        .reject((record) => {
            return(record._id === this.record_id || currently_referenced_ids.includes(record._id));
          })
        .take(7).value()
    },
    grouped_references () : any {
      let groups : object = _.groupBy(this.value, 'record.sheet._id')

      return(_(Object.values(groups))
        .sortBy((references : db.Reference[]) => {
          return references[0].record.sheet._id
        })
        .map((references : db.Reference[]) => { return _.uniq(references) })
        .value()
      )
    },
    choose (record : db.Record, event : any) {
      this.$emit('input', (this.value || []).concat([new db.Reference(record, {})]))
      this.match_text = null;
    },
    remove (record_to_remove : db.Record) {
      this.$emit('input', _.reject(this.value, (reference : db.Reference) => {
        return(reference.record._id == record_to_remove._id)
      }))
    },
    focus_sheet_and_record (sheet_id : string, record_id : string) {
      this.$emit('focus-sheet-and-record', sheet_id, record_id);
    },
    edit_properties (reference : db.Reference) : void {
      this.$bvModal.show(this.references_definition_edit_modal_id)
      this.currently_edited_reference = reference;
      if (this.currently_edited_reference.data == null) {
        this.currently_edited_reference.data = {}
      }
    },
  }
});
</script>

<style scoped lang="scss">

.sheet {
  border: 1px solid black;
  overflow: hidden;
  border-radius: 1em 1em 0 0;
  margin-bottom: 1em;
}

.remove {
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

