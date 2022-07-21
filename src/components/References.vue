<template>
  <div class="input-group referenced-records">
    <div v-if="values.length">
      <div v-for="references_group in grouped_references()" class="sheet-references-group" v-bind:key="references_group.sheet._id">
        <span class="sheet-name" v-bind:style="'background-color:' + references_group.sheet.hex_color">
          {{ references_group.sheet.name }}
        </span>

        <div v-for="reference in references_group.references" v-bind:key="record_to_display(reference)._id" class="referenced-record">
          <template v-if="!view_mode_calc()">
            <a v-if="reference.definition.definitions.length" v-on:click.stop="edit_properties(reference)" class="edit">
              <Icon name="pencil-alt" />
            </a>

            <a v-on:click.stop="remove(reference)" class="remove">
              <Icon name="trash" />
            </a>
          </template>

          <RecordResult
            v-bind:definitions="[record_to_display(reference).sheet.unique_id_definition()]"
            v-bind:data_object="record_to_display(reference)"
            v-bind:show_keys="false"
            v-on:clicked="$emit('record-clicked', record_to_display(reference))"
            look="right-arrow"
          />

          <RecordResult
            v-bind:definitions="reference.definition.definitions"
            v-bind:data_object="reference"
            />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent } from 'vue'

import Icon from './Icon.vue'
import RecordResult from './RecordResult.vue'

import _ from 'lodash'
import $ from 'jquery'

import * as db from '../db'

export default defineComponent({
  name: 'References',
  components: {
    Icon,
    RecordResult,
    Field: defineAsyncComponent(() => import('./Field.vue') as any),
  },
  data(): any {
    return {
      match_text: null,
    }
  },
  props: {
    values: Array,
    side_to_display: String,
    view_mode: Boolean,
  },
  emits: ['record-clicked', 'currently-edited-reference'],
  methods: {
    grouped_references(): any {
      let groups: object = _.groupBy(this.values, `${this.side_to_display}.sheet._id`)

      return _(Object.values(groups))
        .sortBy((references: db.Reference[]) => {
          return references[0][this.side_to_display].sheet._id
        })
        .map((references: db.Reference[]) => {
          let sheet = references[0][this.side_to_display].sheet
          return { references: _.uniq(references), sheet: sheet }
        })
        .value()
    },
    record_to_display(reference: db.Reference): db.Record {
      return reference[this.side_to_display];
    },
    remove(reference_to_remove: db.Reference): void {
      reference_to_remove.remove()
    },
    edit_properties(reference: db.Reference): void {
      this.$emit('currently-edited-reference', reference);
    },
    valid_sheet(sheet: db.Sheet): boolean {
      if (this.definition) {
        return (
          this.definition_referenceable_sheet_ids_set.size == 0 ||
          this.definition_referenceable_sheet_ids_set.has(sheet._id)
        )
      } else {
        return true
      }
    },
    view_mode_calc() {
      return this.view_mode || this.definition.view_mode;
    }
  },
})
</script>

<style scoped lang="scss">
.sheet-references-group {
  border: 1px solid black;
  overflow: hidden;
  border-radius: 1em 1em 0 0;
  margin-bottom: 0.1em;
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
      text-align: left;
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
        background-color: #4294c5;
      }

      .value {
        background-color: #ccc;
      }
    }
  }
}
</style>
