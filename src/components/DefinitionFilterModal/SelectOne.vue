<template>
  <span>
    <div class="form-check">
      <label class="form-check-label" v-for="choice in choices()" v-bind:key="choice">
        <input type="checkbox" class="form-check-input" v-bind:value="choice" v-model="items" />

        {{ choice }}
      </label>

      Select:
      <div class="btn-group" role="group" aria-label="Basic example">
        <button type="button" class="btn btn-primary" v-on:click="select_none">None</button>
        <button type="button" class="btn btn-primary" v-on:click="select_all">All</button>
      </div>
    </div>
  </span>
</template>

<script lang="ts">
import _ from 'lodash'

import { defineComponent } from 'vue'
import store_data_mixin from '../../store_data_mixin'

export default defineComponent({
  name: 'SelectOne',
  props: ['definition', 'database', 'values'],
  mixins: [store_data_mixin({
    items: (component) => {
      return { path: [component.definition._id], initial: _(component.values).uniq().sort().value()  }
    },
  })],
  emits: ['input'],
  watch: {
    items: {
      handler(_new_items: string[], _old_items: string[]): void {
        if (this.items.length === this.choices().length) {
          this.$emit('input', this.definition._id, null)
        } else {
          this.$emit('input', this.definition._id, (records: any[]) => {
            return _.filter(records, (record) => {
              return this.items.includes(record.value_for_definition(this.definition))
            })
          })
        }
      },
      deep: true,
    },
  },
  methods: {
    choices(): string[] {
      return _(this.values).uniq().sort().value()
    },
    select_none(): void {
      this.items = []
    },
    select_all(): void {
      this.items = this.choices()
    },
  },
})
</script>

<style scoped lang="scss">
.form-check-label {
  display: block;
}
</style>
