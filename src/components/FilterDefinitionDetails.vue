<template>
  <div>
    <ul class="nav nav-tabs" role="tablist">
      <li class="nav-item" role="presentation">
        <a
          v-bind:class="{'nav-link': true, active: current_tab === 'general'}"
          id="home-tab"
          data-toggle="tab"
          href="#general"
          role="tab"
          aria-controls="home"
          v-on:click="reset_blank(); current_tab = 'general'"
          >General filter</a
        >
      </li>
      <li class="nav-item" role="presentation">
        <a
          v-bind:class="{'nav-link': true, active: current_tab === 'blank'}"
          id="blank-tab"
          data-toggle="tab"
          href="#blank"
          role="tab"
          aria-controls="blank"
          v-on:click="current_tab = 'blank'"
          >Blank filter</a
        >
      </li>
    </ul>

    <div class="tab-content">
      <div v-bind:class="{'tab-pane': true, show: true, active: current_tab === 'general'}" id="general" role="tabpanel" aria-labelledby="general-tab">
        <References
          v-if="definition.type === 'references' || definition.type === 'reverse_references'"
          v-on:input="handle_input"
          v-bind:definition="definition"
          v-bind:values="values"
          v-bind:database="sheet.database"
        />

        <SelectOne
          v-if="definition.type === 'select_one'"
          v-on:input="handle_input"
          v-bind:definition="definition"
          v-bind:values="values"
          v-bind:database="sheet.database"
        />

        <Stringy
          v-if="['string', 'text_area'].includes(definition.type)"
          v-on:input="handle_input"
          v-bind:definition="definition"
          v-bind:values="values"
          v-bind:database="sheet.database"
        />

        <Number
          v-if="definition.type === 'number'"
          v-on:input="handle_input"
          v-bind:definition="definition"
          v-bind:values="values"
          v-bind:database="sheet.database"
        />
      </div>
      <div v-bind:class="{'tab-pane': true, show: true, active: current_tab === 'blank'}" id="blank" role="tabpanel" aria-labelledby="blank-tab">
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

        <button
          v-on:click="reset_blank()"
          type="button"
          v-bind:class="{btn: true, 'btn-primary': true, active: blankness_filter === false}"
          style="float: right"
        >
          Reset Blank Filter
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

import store_data_mixin from '../store_data_mixin'

import Number from './FilterDefinitionDetails/Number.vue'
import References from './FilterDefinitionDetails/References.vue'
import SelectOne from './FilterDefinitionDetails/SelectOne.vue'
import Stringy from './FilterDefinitionDetails/Stringy.vue'

const is_blank = (value: any) => {
  let isblank = value == null || value === '' || (Array.isArray(value) && value.length === 0)
  console.log({value, isArray: Array.isArray(value), length: value.length, isblank})
  return isblank;
}

export default defineComponent({
  name: 'FilterDefinitionDetails',
  components: {
    Number,
    References,
    SelectOne,
    Stringy,
  },
  mounted() {
    let definition = this.definition
    $('#definition-filter-modal').on('hidden.bs.modal', (e) => {
      this.$emit('modal-hidden', definition)
    })
    $('#definition-filter-modal').modal('show')
  },
  props: {
    definition: { type: db.Definition, required: true },
    sheet: { type: db.Sheet, required: true },
  },
  mixins: [store_data_mixin({
    current_tab: (component) => {
      return { path: [component.definition._id], initial: 'general' }
    },
    blankness_filter: (component) => { return { path: [component.definition._id] } },
  })],
  computed: {
    values() {
      return _(this.sheet.records)
        .flatMap((record) => {
          return record.value_for_definition(this.definition)
        })
        .compact()
        .value()
    },
  },
  emits: ['input', 'modal-hidden'],
  methods: {
    handle_input(definition_id: string, value: db.RecordsFilter | null) {
      this.$emit('input', definition_id, value)
    },
    show_only_blank(): void {
      let definition = this.definition
      this.blankness_filter = true;
      this.$emit('input', this.definition._id, (records: any[]) => {
        return _.filter(records, this.blankness_filter_func(definition))
      })
    },
    show_only_non_blank(): void {
      let definition = this.definition
      this.blankness_filter = false;
      this.$emit('input', this.definition._id, (records: any[]) => {
        return _.reject(records, this.blankness_filter_func(definition))
      })
    },
    blankness_filter_func(definition: db.Definition): (record: db.Record) => boolean {
      return (record) => {
        return is_blank(record.value_for_definition(definition))
      }
    },
    reset_blank(): void {
      this.blankness_filter = null;
      this.$emit('input', this.definition._id, null);
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
