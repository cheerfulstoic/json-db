<template>
  <div class="input-group">
    <textarea class="form-control" v-bind:value="value" ref="the_input" v-on:input="update_value" v-bind:rows="definition.rows || 3"></textarea>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'String',
  data() {
    return {}
  },
  props: {
    value: String,
    definition: { type: Object, required: true },
  },
  emits: ['input'],
  methods: {
    update_value(event: any) {
      this.$emit('input', event.target.value)
    },
  },
})
</script>

<style scoped lang="scss"></style>
