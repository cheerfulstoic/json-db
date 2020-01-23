<template>
  <div class="record-result">
    <span class="sheet" v-bind:style="'background-color:' + result.sheet.hex_color">{{result.sheet.name}}</span> »
    <span v-for="(value, key) in result.sheet.record_values(result.record)" v-bind:key="key" class="property"
          v-on:click.prevent="$emit('focus-sheet-and-record', result.sheet._id, result.id)">
      <span class="key">{{key}}</span>
      <span class="value">{{value}}</span>
    </span>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import * as db from '../db';

export default Vue.extend({
  name: 'Sheet',
  props: {
    result: Object,
    database: db.Database,
  },
});
</script>

<style scoped lang="scss">

.record-result {
  font-size: 0.8em;
  padding: 1em 0;
}

.sheet {
  border: 1px solid black;
  padding: 0.4em;
  background-color: white;
  font-weight: bold;
}

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
}

</style>

