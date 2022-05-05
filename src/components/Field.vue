<template>
  <span>
    <template v-if="!view_mode">
      <String v-if="definition.type === 'string'" v-bind:value="record_value" v-on:input="update_value" />
      <template v-if="definition.type === 'text_area'">
        <RichTextArea v-if="definition.sub_type === 'rich_html'" mode="html" v-bind:value="record_value" v-on:input="update_value" />
        <!-- <RichTextArea v-if="definition.sub_type === 'rich_markdown'" mode="rich_github_markdown" v-bind:value="record_value" v-on:input="update_value" /> -->
        <TextArea v-if="definition.sub_type === 'plain'" v-bind:value="record_value" v-bind:definition="definition" v-on:input="update_value" />
      </template>
      <Number
        v-if="definition.type === 'number'"
        v-bind:sub_type="definition.sub_type"
        v-bind:value="record_value"
        v-on:input="update_value"
        />
      <SelectOne
        v-if="definition.type === 'select_one'"
        v-bind:value="record_value"
        v-bind:definition="definition"
        v-on:input="update_value"
      />

      <Expression
        v-if="definition.type === 'expression'"
        v-bind:value="record_value"
        v-bind:definition="definition"
        v-bind:database="database"
        v-on:input="update_value"
      />
    </template>

    <template v-if="view_mode && definition.type !== 'references'">
      {{record_value}}
    </template>

    <template v-if="definition.type === 'references' && record_value">
      <References v-bind:values="record_value"
                  v-bind:side_to_display="'record'"
                  v-on:record-clicked="record_clicked"
                  v-on:currently-edited-reference="emit_currently_edited_reference"
                />
    </template>

    <div v-if="!view_mode">
      <RecordsSearch
        v-if="definition.type === 'references'"
        v-bind:record_ids_to_skip="record_ids_to_skip()"
        v-bind:database="database"
        v-bind:sheet_ids_to_search="definition.referenceable_sheet_ids"
        v-on:record-selected="reference_record_selected"
      />
    </div>

    <div class="errors" v-if="errors.length > 0">
      <div class="alert alert-danger" v-for="error in errors" v-bind:key="error">{{error}}</div>
    </div>
  </span>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import Expression from './types/Expression.vue'
import Number from './types/Number.vue'
import References from './References.vue';
import RecordsSearch from './RecordsSearch.vue'
import SelectOne from './types/SelectOne.vue'
import String from './types/String.vue'
import TextArea from './types/TextArea.vue'
import RichTextArea from './types/RichTextArea.vue'

import * as db from '../db'
import _ from 'lodash'

export default defineComponent({
  name: 'Field',
  components: {
    Expression,
    Number,
    References,
    RecordsSearch,
    SelectOne,
    String,
    TextArea,
    RichTextArea,
  },
  props: {
    record: { type: Object, required: true },
    definition: { type: Object, required: true },
    database: db.Database,
    view_mode: Boolean,
  },
  data() {
    return { recompute: 0 }
  },
  computed: {
    record_value(): any {
      // Doing this for now because doing `update_value` for expressions
      // (which are objects) doesn't cause a re-rendering
      // (I think it's becaues they are objects)
      console.log(this.recompute)

      return this.record.value_for_definition(this.definition)
    },
    reference_sheet(): db.Sheet | undefined {
      if (this.record_value && this.record_value[0]) {
        return this.record_value[0].record.sheet
      } else {
        return undefined
      }
    },
    errors(): string[] {
      let errors = [];
      if (this.definition.required && this.record.is_blank_for_definition(this.definition)) {
        errors.push('Field is required')
      }

      return errors
    },
  },
  emits: ['record-clicked', 'add-reference', 'reference-record-selected', 'currently-edited-reference'],
  methods: {
    record_clicked(record: db.Record) {
      this.$emit('record-clicked', record)
    },
    add_reference(source_record: db.Record, definition: db.ReferencesDefinition, target_record: db.Record): void {
      this.$emit('add-reference', source_record, definition, target_record)
      this.mark_for_recompute();
    },

    reference_record_selected(chosen_record: db.Record): void {
      this.$emit('reference-record-selected', chosen_record)
      this.mark_for_recompute();
    },

    update_value(new_value: any) {
      this.mark_for_recompute();
      this.record.update_value(this.definition, new_value)
    },
    mark_for_recompute() {
      if (this.definition.type === 'expression') {
        this.recompute = this.recompute + 1
      }
    },
    record_ids_to_skip() {
      return [this.record._id].concat(_.map(this.record_value, 'record._id') || [])
    },
    grouped_references(): any {
      let groups: object = _.groupBy(this.record_value, 'record.sheet._id')

      return _(Object.values(groups))
        .sortBy((references: db.Reference[]) => {
          return references[0].record.sheet._id
        })
        .map((references: db.Reference[]) => {
          let sheet = references[0].record.sheet
          return { references: _.uniq(references), sheet: sheet }
        })
        .value()
    },
    emit_currently_edited_reference(reference) {
      this.$emit('currently-edited-reference', reference);
    }
  },
})
</script>

<style scoped lang="scss">
.errors {
  margin-top: 1em;
}

</style>
