<template>
  <img v-bind:src="`/heroicons/src/outline/${name}.svg`" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'Icon',
  props: {
    name: { type: String, required: true },
    type: { type: String, required: false, default: 'outline' },
  },
})
</script>

<style scoped lang="scss"></style>
