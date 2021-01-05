<template>
  <span class="input-group">
    <input type="number" class="form-control" :value="value" ref="the_input" v-on:input="update_value" />
  </span>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'Integer',
  props: { value: Number },
  emits: ['input'],
  methods: {
    update_value(event: any) {
      this.$emit('input', parseInt(event.target.value))
    },
  },
})
</script>

<style scoped lang="scss">
.input-group {
  width: 150px;
}
</style>
