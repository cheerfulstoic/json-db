<template>
  <span class="input-group">
    <input type="number" class="form-control" :value="value" ref="the_input" v-bind:step="step" v-on:input="update_value" />
  </span>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'Number',
  props: { value: Number, sub_type: String },
  emits: ['input'],
  data() {
    return({
      step: this.sub_type === 'float' ? 0.00001 : 1,
      parseFn: this.sub_type === 'float' ? parseFloat : parseInt,
    })
  },
  methods: {
    update_value(event: any) {
      this.$emit('input', this.parseFn(event.target.value))
    },
  },
})
</script>

<style scoped lang="scss">
.input-group {
  width: 150px;
}
</style>
