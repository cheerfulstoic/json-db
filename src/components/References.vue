<template>
  <div class="input-group referenced-records">
    <div v-bind:class="{sheet: true, valid: valid_sheet(sheet)}" v-if="this.value.length">
      <span class="sheet-name" v-bind:style="'background-color:' + sheet.hex_color">
        {{sheet.name}}
      </span>
      <div v-for="reference in value"
           v-bind:key="reference_key(reference)"
           class="referenced-record">
        <a v-on:click.stop="remove(reference)" class="remove">
          <v-icon name="trash-2"/>
        </a>
        <a v-if="definition.definitions.length" v-on:click.stop="edit_properties(reference)" class="edit">
          <v-icon name="edit"/>
        </a>
        <RecordResult
          v-bind:record="use_source_record ? reference.source_record : reference.record"
          v-bind:database="database"
          v-on:record-clicked="record_clicked" />
      </div>
    </div>

    <div>
      <b-modal ok-only v-bind:id="references_definition_edit_modal_id" title="Edit reference properties">
        <div v-for="references_definition in definition.definitions" v-bind:key="references_definition._id">
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
  data () : any {
    return({
      match_text: null,
      currently_edited_reference: null,
    })
  },
  props: {
    value: Array,
    record: Object,
    definition: db.ReferencesDefinition,
    database: Object,
    use_source_record: Boolean,
    sheet: db.Sheet,
  },
  computed: {
    references_definition_edit_modal_id () : string {
      if (this.record == null) { return('') }
      return('references-definitions-edit-modal-' + (this.use_source_record ? 'use-source-' : '') + this.record._id + this.definition._id);
    },
    definition_referenceable_sheet_ids_set () : Set<string> {
      if (this.use_source_record) {
        // For incoming references just use to the referencing sheet
        return(new Set([this.sheet._id]))
      } else {
        // Use sheets from definition for outgoing references
        return(this.definition ? new Set(this.definition.referenceable_sheet_ids) : new Set());
      }
    },
  },
  methods: {
    reference_key (reference : db.Reference) {
      return(this.use_source_record ? reference.source_record._id : reference.record._id)
    },
    remove (reference_to_remove : db.Reference) : void {
      reference_to_remove.remove()
      // this.$emit('input', _.reject(this.value, (reference : db.Reference) => {
      //   return(reference.record._id == record_to_remove._id)
      // }))
    },
    record_clicked (record : db.Record) : void {
      this.$emit('record-clicked', record);
    },
    edit_properties (reference : db.Reference) : void {
      this.$bvModal.show(this.references_definition_edit_modal_id)
      // Using Vue.set instead of straight assignment to get past typescript error
      Vue.set(this, 'currently_edited_reference', reference);
      // if ( this.currently_edited_reference.data == null ) {
      //   this.currently_edited_reference = null
      // }
    },
    valid_sheet (sheet : db.Sheet) : boolean {
      if (this.definition) {
        return(this.definition_referenceable_sheet_ids_set.size == 0 ||
               this.definition_referenceable_sheet_ids_set.has(sheet._id))
      } else {
        return(true)
      }
    }
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

