<template>
  <div class="input-group referenced-records">
    <div class="search">
      <b-input-group prepend="🔎">
        <input class="form-control"
               type="text"
               v-model="match_text"
               v-on:keyup.up="move_highlight(-1)"
               v-on:keyup.down="move_highlight(1)"
               v-on:keyup.enter="choose_highlighted()"/>
      </b-input-group>

      <div v-if="match_text" class="results">
        <b-list-group>
          <b-list-group-item button v-for="(record, index) in search_results()" v-bind:key="record._id"
            variant="secondary"
            v-on:click.self.stop="choose(record, $event)"
            v-bind:class="{search_result: true, highlighted: index == highlighted_index}">

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
      highlighted_index: null,
    })
  },
  props: {
    record_ids_to_skip: Array,
    database: Object,
    use_source_record: Boolean,
    sheet_ids_to_search: Array,
  },
  watch: {
    match_text: {
      handler (new_value, _old_value) {
        if (new_value == null || new_value === '') {
          this.highlighted_index = null;
        }
      }
    }
  },
  methods: {
    search_results () : any[] {
      if (this.match_text == null ) {
        return([])
      }

      return _(this.database.search(`${this.match_text}`, new Set(this.sheet_ids_to_search)))
        .reject((record) => { return(this.record_ids_to_skip.includes(record._id)) })
        .take(7).value()
    },
    choose (chosen_record : db.Record, event : any) : void {
      this.$emit('reference-record-selected', chosen_record);

      this.match_text = null;
      this.highlighted_index = null;
    },
    choose_highlighted () : void {
      this.choose(this.search_results()[this.highlighted_index]);
    },
    move_highlight (amount:number):void {
      if ( this.match_text != null ) {
        if ( this.highlighted_index == null ) {
          this.highlighted_index = 0;
        } else {
          this.highlighted_index = this.highlighted_index + amount;

          if ( this.highlighted_index < 0 ) { this.highlighted_index = 0 }

          let result_length : number = this.search_results().length;
          if ( this.highlighted_index >= result_length ) { this.highlighted_index = result_length - 1 }
        }
      }
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
    .search_result.highlighted {
      background-color: #4294C5;
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


