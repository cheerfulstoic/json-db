<template>
  <div class="input-group referenced-records">
    <div v-bind:class="{ 'sheet-box': true, valid: valid_sheet(sheet) }" v-if="value.length">
      <span class="sheet-name" v-bind:style="'background-color:' + sheet.hex_color">
        {{ sheet.name }}
      </span>
      <div v-for="reference in value" v-bind:key="record_to_display(reference)._id" class="referenced-record">
        <template v-if="!view_mode">
          <a v-on:click.stop="edit_properties(reference)" class="edit">
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
          v-bind:definitions="definition.definitions"
          v-bind:data_object="reference"
          />
      </div>
    </div>

    <BootstrapModal
      title="Edit reference properties"
    >
      <div v-for="references_definition in definition.definitions" v-bind:key="references_definition._id">
        {{ references_definition.name }}
        <Field
          v-if="currently_edited_reference"
          v-bind:record="currently_edited_reference"
          v-bind:definition="references_definition"
          v-bind:database="database"
        />
      </div>

      <hr />
    </BootstrapModal>
  </div>
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent } from 'vue'

import BootstrapModal from './BootstrapModal.vue'
import Icon from './Icon.vue'
import RecordResult from './RecordResult.vue'

import _ from 'lodash'
import $ from 'jquery'

import * as db from '../db'

export default defineComponent({
  name: 'References',
  components: {
    BootstrapModal,
    Icon,
    RecordResult,
    Field: defineAsyncComponent(() => import('./Field.vue') as any),
  },
  data(): any {
    return {
      match_text: null,
      currently_edited_reference: null,
    }
  },
  props: {
    value: Array,
    record: Object,
    definition: db.ReferencesDefinition,
    database: Object,
    use_source_record: Boolean,
    sheet: db.Sheet,
    view_mode: Boolean,
  },
  computed: {
    definition_referenceable_sheet_ids_set(): Set<string> {
      if (this.use_source_record) {
        // For incoming references just use to the referencing sheet
        return new Set([this.sheet._id])
      } else {
        // Use sheets from definition for outgoing references
        return this.definition ? new Set(this.definition.referenceable_sheet_ids) : new Set()
      }
    },
  },
  emits: ['record-clicked'],
  methods: {
    record_to_display(reference: db.Reference): db.Record {
      return this.use_source_record ? reference.source_record : reference.record
    },
    remove(reference_to_remove: db.Reference): void {
      reference_to_remove.remove()
      // this.$emit('input', _.reject(this.value, (reference : db.Reference) => {
      //   return(reference.record._id == record_to_remove._id)
      // }))
    },
    edit_properties(reference: db.Reference): void {
      // Used _.set instead of straight assignment to get past typescript error
      // _.set(this, 'currently_edited_reference', reference)
      this.currently_edited_reference = reference;

      $(this.$el).find('.modal').modal('show')
    },
    hide_properties(): void {
      _.set(this, 'currently_edited_reference', null)
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
  },
})
</script>

<style scoped lang="scss">
.sheet-box {
  border: 5px solid red;

  &.valid {
    border: 1px solid black;
  }

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
