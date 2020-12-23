<template>
  <span class="input-group">
    <input class="form-control" v-bind:value="value" ref="the_input" v-on:input="update_value">
  </span>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'String',
  data () {
    return {}
  },
  props: {
    value: String,
  },
  methods: {
    update_value (event : any) {
      this.$emit('input', event.target.value)
    },
  }
});
</script>

<style scoped lang="scss">

</style>

