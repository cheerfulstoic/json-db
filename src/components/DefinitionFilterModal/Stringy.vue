<template>
  <span>
    <div class="input-group mb-3">
      <input type="text" class="form-control" v-model="search_query" />

      <div class="input-group-append">
        <button type="button" class="btn btn-primary" v-on:click="clear">Clear</button>
      </div>
    </div>
  </span>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import * as db from '../../db'
import store_data_mixin from '../../store_data_mixin'
import _ from 'lodash'
import Fuse from 'fuse.js'

export default defineComponent({
  name: 'Stringy',
  props: ['definition', 'database', 'values'],
  mixins: [store_data_mixin({
    search_query: (component) => { return { path: [component.definition._id] } },
  })],
  emits: ['input'],
  watch: {
    search_query: {
      handler(_new_search_query: string, _old_search_query: string) {
        // store_helpers.commit_data(this.$store, 'search_query', [this.definition_id], this.search_query)

        if (_.trim(this.search_query) === '') {
          this.$emit('input', this.definition._id, null)
        } else {
          this.$emit('input', this.definition._id, (records: db.Record[]) => {
            let fuse = new Fuse(records, {
              shouldSort: false,
              // TODO: Find a way so that we don't need to know about internal `data` field
              keys: [`data.${this.definition._id}`],
              threshold: 0.2,
            })

            return fuse.search(this.search_query)
          })
        }
      },
    },
  },
  methods: {
    clear() {
      this.search_query = ''
    },
  },
})
</script>

<style scoped lang="scss"></style>
