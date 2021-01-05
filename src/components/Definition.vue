<template>
  <span>
    <BootstrapModal ok-only v-bind:ref="modal_dom_id" v-bind:id="modal_dom_id" title="Edit Definition">
      <DefinitionDetails
        v-bind:value="value"
        v-on:input="update"
        v-on:remove="remove"
        v-on:remove-sub-definition="remove_sub_definition"
        v-bind:database="database"
      />
    </BootstrapModal>

    {{ value.name }}
    <br />
    <span v-if="value.unique_id"><Icon name="lightning-bolt" style="color: red" /></span>
    <a role="button" data-toggle="modal" v-bind:data-target="'#' + modal_dom_id">
      <Icon name="pencil-alt" />
    </a>
  </span>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import BootstrapModal from './BootstrapModal.vue'
import DefinitionDetails from './DefinitionDetails.vue'
import Icon from './Icon.vue'

import * as db from '../db'

export default defineComponent({
  name: 'Definition',
  components: {
    BootstrapModal,
    DefinitionDetails,
    Icon,
  },
  props: {
    value: { type: [db.Definition, db.ReferencesDefinition], required: true },
    database: db.Database,
  },
  watch: {
    value(new_value: any, _old_value: any) {
      this.$emit('input', new_value)
    },
  },
  data() {
    return {
      modal_dom_id: `edit-definition-modal-${this.value._id}`,
    }
  },
  methods: {
    remove(definition: db.Definition, event: Event) {
      // FIXME: Find a solution for bootstrap-vue for Vue 3
      // this.$bvModal.hide(this.modal_dom_id)
      this.$emit('remove', definition, event)
    },
    remove_sub_definition(definition: db.ReferencesDefinition, sub_definition: db.Definition, event: Event) {
      this.$emit('remove-sub-definition', definition, sub_definition, event)
    },
    update(new_value: any) {
      this.$emit('input', new_value)
    },
  },
})
</script>

<style scoped lang="scss"></style>
