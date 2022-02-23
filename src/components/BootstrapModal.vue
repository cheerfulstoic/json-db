<template>
  <div class="modal" tabindex="-1" role="dialog">
    <div v-bind:class="['modal-dialog', `modal-${size || 'xl'}`]" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ title }}</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div>
          <div class="modal-body">
            <slot></slot>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'BootstrapModal',
  data() {
    return {}
  },
  props: {
    title: String,
    size: String,
  },
  emits: [],
  methods: {},
})
</script>

<style scoped lang="scss"></style>
