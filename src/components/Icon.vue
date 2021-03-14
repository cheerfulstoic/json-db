<template>
  <img class="icon" v-bind:src="`/heroicons/src/outline/${name}.svg`" v-bind:alt="alt_text"/>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'Icon',
  props: {
    name: { type: String, required: true },
    type: { type: String, required: false, default: 'outline' },
    alt_text: { type: String, required: false },
  },
})
</script>

<style scoped lang="scss"></style>
