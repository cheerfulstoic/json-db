<template>
  <div class="record-result">
    <span v-for="(value, key) in data" v-bind:key="key" class="property" v-on:click="$emit('clicked')">
      <span class="key" v-if="show_keys">{{key}}</span>
      <span v-bind:class="['value', look]">
        <span v-if="is_blank(value)">
          <strong>-</strong>
        </span>
        <span v-if="!is_blank(value)">{{value}}</span>
      </span>
    </span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import * as db from '../db';

export default defineComponent({
  name: 'Sheet',
  props: {
    data: Object,
    show_keys: {type: Boolean, default: true},
    look: {type: String, default: 'pill'},
  },
  methods: {
    is_blank (value : any) : boolean {
      return(value == null || value === '');
    }
  }
});
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

    &.right-arrow {
      padding-right: 7px;
      margin-right: 15px;
      border-right: 0;

      &::after {
        content: "";
        position: absolute;
        display: inline-block;
        background-color: white;
        width: 16px;
        height: 16px;
        transform: translate(-1px,2px) rotate(45deg);
        border: 1px solid $border-color;
        z-index: -1;
      }
    }
  }

  &:hover {
    .key {
      background-color: #4294C5;
    }

    .value {
      background-color: #CCC;
      &::after {
        background-color: #CCC;
      }
    }
  }
}

</style>

