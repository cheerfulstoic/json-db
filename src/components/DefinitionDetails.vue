<template>
  <span>
    <div class="form-group">
      <label>
        Name
        <input class="form-control" v-model.lazy="value.name" />
      </label>
    </div>

    <div class="form-group">
      <label>
        Unique ID?
        <input type="checkbox" id="unique_id" v-model="value.unique_id" />
      </label>
    </div>

    <div class="form-group">
      <label>
        Required?
        <input type="checkbox" id="required" v-model="value.required" />
      </label>
    </div>

    <div class="form-group">
      <label>
        Type
        <select class="form-control" v-model="value.type">
          <option disabled value="">Select one</option>
          <option value="string">String</option>
          <option value="text_area">Text Area</option>
          <option value="integer">Integer</option>
          <option value="select_one">Select One</option>
          <option value="references" v-if="!sub_definition">References</option>
          <option value="expression">Expression</option>
        </select>
      </label>
    </div>

    <div class="form-group" v-if="value.type == 'select_one'">
      <label>
        <ul class="list-group">
          <li class="list-group-item" v-for="option in options" v-bind:key="option">
            <a v-on:click="remove_option(option, $event)" class="float-right">
              <Icon name="trash" />
            </a>
            {{ option }}
          </li>
        </ul>

        <input class="form-control" v-model="option_to_add" placeholder="New option" />
        <button v-on:click="add_option" type="button" class="btn btn-secondary">Add Option</button>
      </label>
    </div>

    <div class="form-group" v-if="value.type == 'select_one' && !sub_definition">
      <label>
        Transform all
        <select v-model="old_value">
          <option v-for="option in options" v-bind:key="option">{{ option }}</option>
        </select>
        to:
        <select v-model="new_value">
          <option v-for="option in options" v-bind:key="option">{{ option }}</option>
        </select>

        <button class="btn btn-danger" v-on:click="$emit('transform-values', definition, old_value, new_value)">
          Change
        </button>
      </label>
    </div>

    <button class="btn btn-danger" v-on:click="emit_remove">Delete Definition</button>

    <div class="mt-2" v-if="value.type == 'references'">
      <div class="form-group">
        <p>Limit sheets which can be referenced (select none to allow reference of any sheet):</p>

        <label class="referenceable-sheet-option" v-for="sheet in database.sheets" v-bind:key="sheet._id">
          <input type="checkbox" v-bind:value="sheet._id" v-model="value.referenceable_sheet_ids" />
          {{ sheet.name }}
        </label>
      </div>

      <div class="form-group">
        <a v-on:click="add_definition" class="btn btn-primary btn-block">Add sub-definition</a>

        <div
          class="references-definition mt-2"
          v-for="references_definition in value.definitions"
          v-bind:key="references_definition.name"
        >
          <DefinitionDetails
            v-bind:value="references_definition"
            v-on:input="$emit('input', $event.target.value)"
            v-bind:sub_definition="true"
            v-on:remove="remove"
            v-bind:database="database"
          />
        </div>
      </div>
    </div>
  </span>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import _ from 'lodash'

import * as db from '../db'

// import DefinitionDetails from './DefinitionDetails.vue'
import Icon from './Icon.vue'

export default defineComponent({
  name: 'DefinitionDetails',
  components: {
    // DefinitionDetails,
    Icon,
  },
  data() {
    return {
      option_to_add: '',
      old_value: null,
      new_value: null,
    }
  },
  props: {
    value: {
      type: [db.Definition, db.ReferencesDefinition],
      required: true,
    },
    sub_definition: Boolean,
    database: db.Database,
  },
  computed: {
    definition(): db.Definition | db.ReferencesDefinition {
      return this.value
    },
    options(): string[] {
      return this.value.options || []
    },
    value_type(): string {
      return this.value.type
    },
  },
  watch: {
    value_type: function (new_value, _old_value) {
      if (new_value instanceof db.Definition) {
        this.$emit('input', new_value.to_reference_definition())
      } else if (new_value instanceof db.ReferencesDefinition) {
        this.$emit('input', new_value.to_definition())
      }
    },
  },
  emits: ['input', 'remove', 'remove-sub-definition', 'add-sub-definition', 'transform-values'],
  methods: {
    add_option(): void {
      let new_options = this.options
      new_options.push(this.option_to_add)
      this.value.options = _.uniq(new_options)
      this.option_to_add = ''
    },
    remove_option(option_to_remove: string): void {
      if (confirm(`Do you really want to remove the option \`${option_to_remove}\`?`)) {
        this.value.options = _.reject(this.options, (option) => {
          return option == option_to_remove
        })
      }
    },
    emit_remove() {
      if (confirm(`Do you really want to delete the definition ${this.definition.name}?`)) {
        this.$emit('remove', this.definition)
      }
    },
    remove(definition: db.Definition): void {
      this.$emit('remove-sub-definition', this.value, definition)
    },
    add_definition(): void {
      // Should always be the case
      if (this.value instanceof db.ReferencesDefinition) {
        let definition = new db.Definition({ name: 'Def #1', type: 'string' })

        this.$emit('add-sub-definition', definition)
      }
    },
  },
})
</script>

<style scoped lang="scss">
.references-definition {
  border: 1px solid #333;
  background-color: #ccc;
  padding: 0.5em;
}

.referenceable-sheet-option {
  border: 1px solid #333;
  padding: 0.3em;
  border-radius: 0.7em;
  margin: 0.3em;
}
</style>
