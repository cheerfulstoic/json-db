<template>
  <div>
    <div v-for="(val, key) in variables" v-bind:key="key" class="row">
      <label v-bind:for="'input-' + key" class="col">
        {{ key }}
        <span v-on:click="delete_variable(key)">
          <Icon name="x" />
        </span>
      </label>

      <input
        v-bind:id="'input-' + key"
        class="col"
        type="number"
        v-bind:value="val"
        v-on:input="update_variable(key, $event)"
      />
    </div>
    <input type="text" v-model="new_key" />
    <a v-on:click="add_variable">Add</a>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import Icon from './Icon.vue'

export default defineComponent({
  name: 'VariableEditor',
  components: { Icon },
  data(): { new_key: string | null } {
    return { new_key: null }
  },
  props: {
    variables: Object,
  },
  emits: ['update', 'delete'],
  methods: {
    add_variable() {
      if (this.new_key) {
        this.$emit('update', this.new_key, '123')
        this.new_key = null
      }
    },
    update_variable(key: string, event: any) {
      this.$emit('update', key, event.target.value)
    },
    delete_variable(key: string) {
      this.$emit('delete', key)
    },
  },
})
</script>

<style scoped lang="scss"></style>
