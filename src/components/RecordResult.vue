<template>
  <div class="record-result">
    <span v-for="definition in definitions" v-bind:key="definition._id" class="property" v-on:click="$emit('clicked')">
      <span class="key" v-if="show_keys">{{ definition.name }}</span>
      <span v-bind:class="['value', look, (error_for(definition) ? 'error' : '')]">
        <span v-if="data_object.is_blank_for_definition(definition)">
          <strong>-</strong>
        </span>
        <span v-if="!data_object.is_blank_for_definition(definition)">{{ data_object.value_for_definition(definition) }}</span>
      </span>
    </span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import _ from 'lodash'
import * as db from '../db'

export default defineComponent({
  name: 'Sheet',
  props: {
    data_object: db.Record,
    definitions: { type: Array },
    show_keys: { type: Boolean, default: true },
    look: { type: String, default: 'pill' },
  },
  methods: {
    is_blank(value: any): boolean {
      return value == null || value === ''
    },
    error_for(definition: db.Definition): boolean {
      return definition.required && this.data_object.is_blank_for_definition(definition)
    },
  },
})
</script>

<style scoped lang="scss">
.record-result {
  display: inline-block;
  font-size: 0.8em;
  padding: 1em 0;
  white-space: nowrap;
}

$border-color: black;

.property {

  .key {
    border: 1px solid $border-color;
    border-radius: 0;

    font-weight: bold;

    background-color: lightskyblue;

    padding: 0.1em 0.2em 0.1em 0.4em;

    border-right: 0;
  }

  .value {
    border: 1px solid $border-color;

    padding: 0.1em 0.4em 0.1em 0.3em;
    margin-right: 0.5em;

    background-color: white;

    &.error {
      background-color: #ff8c98;
    }

    &.right-arrow {
      padding-right: 7px;
      margin-right: 15px;
      border-right: 0;

      &::after {
        content: '';
        position: absolute;
        display: inline-block;
        background-color: white;
        width: 16px;
        height: 16px;
        transform: translate(-1px, 2px) rotate(45deg);
        border: 1px solid $border-color;
        z-index: -1;
      }
    }
  }

  &:hover {
    .key {
      background-color: #4294c5;
    }

    .value {
      background-color: #ccc;
      &::after {
        background-color: #ccc;
      }
    }
  }
}
</style>
