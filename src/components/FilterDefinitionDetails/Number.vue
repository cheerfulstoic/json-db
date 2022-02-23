<template>
  <span>
    <div>Smallest value: {{ min_min }}</div>
    <div>Biggest value: {{ max_max }}</div>
    <div class="input-group mb-3">
      <input type="number" class="form-control" v-model="min" v-bind:step="step" v-bind:min="min_min" v-bind:max="max" />

      <input type="number" class="form-control" v-model="max" v-bind:step="step" v-bind:min="min" v-bind:max="max_max" />

      <div class="input-group-append">
        <button type="button" class="btn btn-primary" v-on:click="reset">Reset</button>
      </div>
    </div>
  </span>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import _ from 'lodash'
import store_data_mixin from '../../store_data_mixin'

export default defineComponent({
  name: 'Number',
  props: ['definition', 'database', 'values'],
  mixins: [store_data_mixin({
    min: (component) => {
      return { path: [component.definition._id], initial:  _.min(component.values) }
    },
    min_min: (component) => {
      return { path: [component.definition._id], initial:  _.min(component.values) }
    },
    max: (component) => {
      return { path: [component.definition._id], initial:  _.max(component.values) }
    },
    max_max: (component) => {
      return { path: [component.definition._id], initial:  _.max(component.values) }
    },
  })],
  data() {
    return {
      step: this.definition.sub_type === 'float' ? 0.00001 : 1,
      parseFn: this.definition.sub_type === 'float' ? parseFloat : parseInt,
    }
  },
  watch: {
    min() {
      this.emit_function()
    },
    max() {
      this.emit_function()
    },
  },
  emits: ['input'],
  methods: {
    reset() {
      this.min = this.min_min
      this.max = this.max_max
    },
    emit_function(): void {
      let min = this.parseFn(`${this.min}`)
      let max = this.parseFn(`${this.max}`)
      if (min === this.min_min && max === this.max_max) {
        this.$emit('input', this.definition._id, null)
      } else {
        this.$emit('input', this.definition._id, (records: any[]) => {
          return _.filter(records, (record) => {
            let value = record.value_for_definition(this.definition)

            return value >= min && value <= max
          })
        })
      }
    },
  },
})
</script>

<style scoped lang="scss"></style>
