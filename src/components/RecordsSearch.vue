<template>
  <div class="input-group">
    <div class="search">
      <div class="input-group">
        <div class="input-group-prepend">
          <div class="input-group-text">🔎</div>
        </div>
        <input
          class="form-control"
          type="text"
          v-model="match_text"
          v-on:keyup.up="move_highlight(-1)"
          v-on:keyup.down="move_highlight(1)"
          v-on:keyup.enter="choose_highlighted()"
        />
      </div>

      <div v-if="match_text" class="results">
        <div class="list-group">
          <button
            v-for="(record, index) in search_results()"
            v-bind:key="record._id"
            v-on:click.self.stop="choose(record, $event)"
            class="list-group-item list-group-item-secondary list-group-item-action search_result highlighted"
            v-bind:class="{ search_result: true, highlighted: index == highlighted_index }"
            type="button"
          >
            <div>
              <span class="sheet-name" v-bind:style="'background-color:' + record.sheet.hex_color">
                {{ record.sheet.name }}
              </span>
              »
              <RecordResult
                v-bind:definitions="[record.sheet.unique_id_definition()]"
                v-bind:data_object="record"
                v-bind:show_keys="false"
                v-on:clicked="choose(record)"
                look="right-arrow"
              />
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import RecordResult from './RecordResult.vue'

import _ from 'lodash'

import * as db from '../db'

export default defineComponent({
  name: 'References',
  components: {
    RecordResult,
  },
  data(): any {
    return {
      match_text: null,
      currently_edited_reference: null,
      highlighted_index: null,
    }
  },
  props: {
    record_ids_to_skip: Array,
    record_ids_to_limit_to: Array,
    database: Object,
    use_source_record: Boolean,
    sheet_ids_to_search: Array,
  },
  watch: {
    match_text: {
      handler(new_value, _old_value) {
        if (new_value == null || new_value === '') {
          this.highlighted_index = null
        }
      },
    },
  },
  emits: ['record-selected'],
  methods: {
    search_results(): any[] {
      if (this.match_text == null) {
        return []
      }

      let result = _(this.database.search(`${this.match_text}`, new Set(this.sheet_ids_to_search)))
      if (this.record_ids_to_skip) {
        result.reject((record) => {
          return this.record_ids_to_skip.includes(record._id)
        })
      }
      if (this.record_ids_to_limit_to) {
        result.filter((record) => {
          return this.record_ids_to_limit_to.includes(record._id)
        })
      }

      return result.take(7).value()
    },
    choose(chosen_record: db.Record, _event: any): void {
      this.$emit('record-selected', chosen_record)

      this.match_text = null
      this.highlighted_index = null
    },
    choose_highlighted(): void {
      this.choose(this.search_results()[this.highlighted_index])
    },
    move_highlight(amount: number): void {
      if (this.match_text != null) {
        if (this.highlighted_index == null) {
          this.highlighted_index = 0
        } else {
          this.highlighted_index = this.highlighted_index + amount

          if (this.highlighted_index < 0) {
            this.highlighted_index = 0
          }

          let result_length: number = this.search_results().length
          if (this.highlighted_index >= result_length) {
            this.highlighted_index = result_length - 1
          }
        }
      }
    },
  },
})
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

.remove,
.edit {
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

.list-group-item {
  z-index: 0;

  white-space: nowrap;
  padding: 0.3em 0.5em;

  &:not(:last-child) {
    border-bottom: 1px solid black;
  }
}

.search {
  display: block;

  .results {
    position: absolute;
    z-index: 200;

    .search_result {
      text-align: left;
    }

    .search_result.highlighted {
      background-color: #4294c5;
    }
  }
}
</style>
