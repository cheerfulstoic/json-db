<template>
  <ul class="nav nav-tabs" role="tablist">
    <li class="nav-item" role="presentation">
      <a
        class="nav-link active"
        id="home-tab"
        data-toggle="tab"
        href="#general"
        role="tab"
        aria-controls="home"
        aria-selected="true"
        v-on:click="reset_blank()"
        >General filter</a
      >
    </li>
    <li class="nav-item" role="presentation">
      <a
        class="nav-link"
        id="profile-tab"
        data-toggle="tab"
        href="#blank"
        role="tab"
        aria-controls="profile"
        aria-selected="false"
        >Blank filter</a
      >
    </li>
  </ul>

  <div class="tab-content">
    <div class="tab-pane active" id="general" role="tabpanel" aria-labelledby="general-tab">
      <References
        v-if="definition.type === 'references' || definition.type === 'reverse_references'"
        v-on:input="handle_input"
        v-bind:definition="definition"
        v-bind:values="record_values()"
        v-bind:database="database"
      />

      <SelectOne
        v-if="definition.type === 'select_one'"
        v-on:input="handle_input"
        v-bind:definition="definition"
        v-bind:values="values"
        v-bind:database="database"
      />

      <Stringy
        v-if="['string', 'text_area'].includes(definition.type)"
        v-on:input="handle_input"
        v-bind:definition="definition"
        v-bind:values="values"
        v-bind:database="database"
      />

      <Integer
        v-if="definition.type === 'integer'"
        v-on:input="handle_input"
        v-bind:definition="definition"
        v-bind:values="values"
        v-bind:database="database"
      />
    </div>
    <div class="tab-pane" id="blank" role="tabpanel" aria-labelledby="blank-tab">
      <div class="btn-group" role="group">
        <button
          v-on:click="show_only_blank()"
          v-bind:aria-pressed="blankness_filter === true"
          type="button"
          v-bind:class="{btn: true, 'btn-secondary': true, active: blankness_filter === true}"
        >
          Show only empty
        </button>
        <button
          v-on:click="show_only_non_blank()"
          v-bind:aria-pressed="blankness_filter === false"
          type="button"
          v-bind:class="{btn: true, 'btn-secondary': true, active: blankness_filter === false}"
        >
          Show only non-empty
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import * as db from '../db'
import _ from 'lodash'
import $ from 'jquery'

import BootstrapModal from './BootstrapModal.vue'
import Integer from './DefinitionFilterModal/Integer.vue'
import References from './DefinitionFilterModal/References.vue'
import SelectOne from './DefinitionFilterModal/SelectOne.vue'
import Stringy from './DefinitionFilterModal/Stringy.vue'

const is_blank = (value: any) => {
  return value == null || value === '' || (Array.isArray(value) && value.length === 0)
}

export default defineComponent({
  name: 'DefinitionFilterModal',
  components: {
    BootstrapModal,
    Integer,
    References,
    SelectOne,
    Stringy,
  },
  mounted() {
    let definition = this.definition
    $(`#definition-filter-modal-${this.definition._id}`).on('hidden.bs.modal', (e) => {
      console.log({hiddenDefinition: definition})
      this.$emit('definition-filter-modal-hidden', definition)
    })
  },
  data(): { last_input_value: db.RecordsFilter | null; blankness_filter: true | false | null } {
    return {
      last_input_value: null,
      blankness_filter: null,
    }
  },
  props: {
    definition: { type: db.Definition, required: true },
    database: db.Database,
    values: Array,
  },
  computed: {
    modal_dom_id(): string {
      return `definition-filter-modal-${this.definition._id}`
    },
  },
  emits: ['input', 'definition-filter-modal-hidden'],
  methods: {
    handle_input(definition_id: string, value: db.RecordsFilter) {
      this.last_input_value = value
      this.$emit('input', definition_id, value)
    },
    show_only_blank(): void {
      console.log('show_only_blank')
      let definition = this.definition
      this.blankness_filter = true
      this.$emit('input', this.definition._id, (records: any[]) => {
        return _.filter(records, this.blankness_filter_func(definition))
      })
    },
    show_only_non_blank(): void {
      console.log('show_only_non_blank')
      let definition = this.definition
      this.blankness_filter = false
      this.$emit('input', this.definition._id, (records: any[]) => {
        return _.reject(records, this.blankness_filter_func(definition))
      })
    },
    blankness_filter_func(definition: db.Definition): (record: db.Record) => boolean {
      if (definition.type === 'reverse_references') {
        let current_record_ids_referenced: Set<string> = this.current_record_ids_referenced(definition)

        return (record) => {
          return !current_record_ids_referenced.has(record._id)
        }
      } else {
        return (record) => {
          return is_blank(record.value_for_definition(definition))
        }
      }
    },
    reset_blank(): void {
      this.blankness_filter = null
      this.$emit('input', this.definition._id, this.last_input_value)
    },
    current_record_ids_referenced(definition: db.Definition): Set<string> {
      let ids: any[] = _.chain(this.values)
        .flatMap((remote_record: db.Record): any[] => {
          return _.map(remote_record.value_for_definition(definition) || [], 'record._id')
        })
        .uniq()
        .compact()
        .value()

      return new Set(ids)
    },
    record_values() {
      return _.map(this.values, 'record')
    },
  },
})
</script>

<style scoped lang="scss">
.modal-dialog {
  z-index: 20;
}

.remove {
  margin: 0.8em 0.8em 0 0.8em;
}

.disabled {
  border: 1px solid red;
}

.search {
  display: block;
  margin-top: 1em;

  .results {
    position: absolute;
    z-index: 1;

    .search_result {
      text-align: left;
    }
  }
}
</style>
