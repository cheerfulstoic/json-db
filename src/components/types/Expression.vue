<template>
  <div>
    <div class="form-group">
      <input class="form-control" v-bind:value="value" v-on:input="change_value"/>
    </div>

    <div class="form-group">
      <span class="calculated-value">{{calculated_value}}</span>
      <span class="error">{{error}}</span>
    </div>
  </div>
</template>

<script lang="ts">
import _ from 'lodash';

import * as db from '../../db';

import { defineComponent } from 'vue'

export default defineComponent({
  name: 'Expression',
  props: {
    value: String,
    definition: Object,
    database: {type: Object, required: true},
  },
  computed: {
    calculated_value_and_error () : db.ExpressionResult {
      return this.database.evaluate_expression(this.value)
    },
    calculated_value () : number | null { return(this.calculated_value_and_error[0]); },
    error () : Error | null { return(this.calculated_value_and_error[1]); },
  },
  methods: {
    change_value (event : any) : void {
      this.$emit('input', event.target.value);
    }
  },
});
</script>

<style scoped lang="scss">
input {
  width: 100%;
  clear: right;
  display: block;
}

.calculated-value {
  font-weight: bold;
}

.error {
  font-weight: bold;
  color: red;
}

</style>



