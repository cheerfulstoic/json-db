<template>
  <div class="record-result">
    <span v-for="(value, key) in record.description_data()" v-bind:key="key" class="property"
          v-on:click.prevent="$emit('record-clicked', record)">
      <span class="key">{{key}}</span>
      <span class="value">{{value}}</span>
    </span>
  </div>
</template>

<script lang="ts">
// DEPRECATED COMPONENT

import Vue from 'vue';

import * as db from '../db';

export default Vue.extend({
  name: 'Sheet',
  props: {
    record: Object,
    database: db.Database,
    definition_name: { type: String, require: false, default: null },
  },
});
</script>

<style scoped lang="scss">

.record-result {
  display: inline-block;
  font-size: 0.8em;
  padding: 1em 0;
  white-space: nowrap;


}

.sheet {
  margin: 0;
  padding: 0;
  font-weight: bold;

  .sheet_name {
    padding: 0.4em;
    margin: 0;
    border: 1px solid black;
  }

  .definition_name {
    border: 1px solid black;
    border-left: 0;
    padding: 0.4em;
    background-color: white;
    margin: 0;
  }
}

.property {
  .key {
    display: none;
    border: 1px solid black;
    border-radius: 1em 0 0 1em;

    font-weight: bold;

    background-color: lightskyblue;

    padding: 0.1em 0.2em 0.1em 0.4em;
  }

  .value {
    border: 1px solid black;
    border-left: 0px;
    /* border-radius: 0 1em 1em 0; */
    border-radius: 1em;

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

</style>

