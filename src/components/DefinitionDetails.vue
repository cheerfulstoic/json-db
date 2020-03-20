<template>
  <span>
    <div class="form-group">
      <label>
        Name
        <input class="form-control" v-model.lazy="value.name"/>
      </label>
    </div>

    <div class="form-group">
      <label>
        Unique ID?
        <input type="checkbox" id="unique_id" v-model="value.unique_id">
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
        <b-list-group>
          <b-list-group-item v-for="option in options" v-bind:key="option">
            <a v-on:click="remove_option(option, $event)" class="float-right">
              <v-icon name="trash-2"/>
            </a>
            {{option}}
          </b-list-group-item>
        </b-list-group>

        <input class="form-control" v-model="option_to_add" placeholder="New option"/>
        <b-button v-on:click="add_option">Add Option</b-button>
      </label>
    </div>

    <div class="form-group" v-if="value.type == 'select_one' && !sub_definition">
      <label>
        Transform all
        <select  v-model="old_value">
          <option v-for="option in options" v-bind:key="option">{{option}}</option>
        </select>
        to:
        <select  v-model="new_value">
          <option v-for="option in options" v-bind:key="option">{{option}}</option>
        </select>

        <button class="btn btn-danger"
                v-on:click="$emit('transform-values', definition, old_value, new_value)">Change</button>
      </label>
    </div>

    <button class="btn btn-danger" v-on:click="emit_remove">Delete Definition</button>

    <div class="mt-2">
      <div class="form-group" v-if="value.type == 'references'">
        <a v-on:click="add_definition" class="btn btn-primary btn-block">Add sub-definition</a>

        <div class="references-definition mt-2"
              v-for="(references_definition, index) in value.definitions"
              v-bind:key="references_definition.name">
          {{references_definition}}
          <DefinitionDetails
            v-model="definition.definitions[index]"
            v-bind:sub_definition="true"
            v-on:remove="remove"/>
        </div>
      </div>
    </div>
  </span>
</template>

<script lang="ts">
import Vue from 'vue';

import _ from 'lodash';

import * as db from '../db';

export default Vue.extend({
  name: 'DefinitionDetails',
  data () {
    return({
      option_to_add: null,
      old_value: null,
      new_value: null,
    })
  },
  props: {
    value: Object,
    sub_definition: Boolean,
  },
  computed: {
    definition () {
      return this.value;
    },
    options () {
      return this.value.options || [];
    },
  },
  methods: {
    add_option () {
      let new_options = this.options;
      new_options.push(this.option_to_add);
      this.value.options = _.uniq(new_options);
      this.option_to_add = null;
    },
    remove_option (option_to_remove:string, event:object) {
      if(confirm(`Do you really want to remove the option \`${option_to_remove}\`?`)) {
        this.value.options = _.reject(this.options, (option) => {
          return option == option_to_remove
        })
      }
    },
    emit_remove () {
      if(confirm(`Do you really want to delete the definition ${this.definition.name}?`)) {
        this.$emit('remove', this.definition);
      }
    },
    remove (definition : db.Definition, event : Event) {
      this.$emit('remove-sub-definition', this.value, definition);
    },
    add_definition () {
      let new_value = _.cloneDeep(this.value)
      let definition = new db.Definition({name: `Def #1`, type: 'string'})
      if (new_value.definitions == null) { new_value.definitions = [] }
      new_value.definitions.push(definition)
      this.$emit('input', new_value);
    },
  }
});
</script>

<style scoped lang="scss">

.references-definition {
  border: 1px solid #333;
  background-color: #CCC;
  padding: 0.5em;
}
</style>


