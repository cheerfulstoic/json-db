<template>
  <span>
    <div>Smallest value: {{min_min}}</div>
    <div>Biggest value: {{max_max}}</div>
    <div class="input-group mb-3">
      <input type="number"
             class="form-control"
             v-model="min"
             v-bind:min="min_min"
             v-bind:max="max" />

      <input type="number"
             class="form-control"
             v-model="max"
             v-bind:min="min"
             v-bind:max="max_max" />

      <div class="input-group-append">
        <button type="button" class="btn btn-primary" v-on:click="reset">Reset</button>
      </div>
    </div>
  </span>
</template>

<script lang="ts">
import Vue from 'vue';

import * as db from '../../db';
import _ from 'lodash';
import Fuse from 'fuse.js';

export default Vue.extend({
  name: 'Integer',
  props: ['definition', 'database', 'values'],
  data () {
    return({
      min: _.min(this.values),
      min_min: _.min(this.values),
      max: _.max(this.values),
      max_max: _.max(this.values),
    })
  },
  watch: {
    min () { this.emit_function() },
    max () { this.emit_function() },
  },
  methods: {
    reset () {
      this.min = this.min_min;
      this.max = this.max_max;
    },
    emit_function () : void {
      let min = parseInt(`${this.min}`);
      let max = parseInt(`${this.max}`);
      if (min === this.min_min && max === this.max_max) {
        this.$emit('input', this.definition._id, null);
      } else {
        this.$emit('input', this.definition._id, (records : any[]) => {
          return(_.filter(records, (record) => {
            let value = record[this.definition._id];

            return(value >= min && value <= max);
          }))
        });
      }
    },
  }
});
</script>

<style scoped lang="scss">


</style>


