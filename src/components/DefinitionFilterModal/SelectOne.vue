<template>
  <span>
    <div class="form-check">
      <label class="form-check-label" v-for="choice in choices()" v-bind:key="choice">
        <input type="checkbox" class="form-check-input"
               v-bind:value="choice"
               v-model="items" />

        {{choice}}
      </label>

      Select:
      <div class="btn-group" role="group" aria-label="Basic example">
        <button type="button" class="btn btn-primary" v-on:click="select_none">None</button>
        <button type="button" class="btn btn-primary" v-on:click="select_all">All</button>
      </div>
    </div>
  </span>
</template>

<script lang="ts">
import Vue from 'vue';

import * as db from '../../db';
import _ from 'lodash';

export default Vue.extend({
  name: 'SelectOne',
  props: ['definition', 'database', 'values'],
  data () {
    return({
      items: _(this.values).uniq().sort().value(),
    })
  },
  watch: {
    items: {
      handler (new_items : string[], _old_items : string[]) : void {
        if (this.items.length === this.choices().length) {
          this.$emit('input', this.definition._id, null)
        } else {
          this.$emit('input', this.definition._id,
                     (records : any[]) => {
                       return _.filter(records, (record) => {
                         return(this.items.includes(record.value_for_definition(this.definition)));
                       })
                     })
        }
      },
      deep: true
    },
  },
  methods: {
    choices () : string[] {
      return(_(this.values).uniq().sort().value());
    },
    select_none () :void { this.items = [] },
    select_all () :void { this.items = this.choices() },
  },
});
</script>

<style scoped lang="scss">

.form-check-label {
  display: block;
}

</style>



