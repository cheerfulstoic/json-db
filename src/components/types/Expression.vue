<template>
  <div>
    <div class="form-group">
      <input class="form-control"
             v-bind:value="value && value.expression_string"
             ref="the_input"
             v-on:input="update_value_event">
    </div>

    <div class="form-group">
      <span class="calculated-value">{{value && value.calculated_value}}</span>
      <span class="error">{{error}}</span>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import _ from 'lodash';
var Parser = require('expr-eval').Parser;

import * as db from '../../db';

export default Vue.extend({
  name: 'Expression',
  data () : { error: any } {
    return {
      error: null,
    }
  },
  props: {
    value: Object,
    definition: Object,
    global_variables: Object,
  },
  watch: {
    global_variables: {
      handler(_new_val, _old_val) {
        if (this.value) {
          this.update_value(this.value.expression_string)
        }
      },
      deep: true,
    },
  },
  methods: {
    update_value_event (event : any) {
      let expression_string = event.target.value;

      this.update_value(expression_string);
    },
    update_value (expression_string : string) {
      let calculated_value;

      if (_.trim(expression_string) === '') {
        calculated_value = null;
        this.error = null;
      } else {

        let parser = new Parser();

        try {
          calculated_value = parser.evaluate(expression_string, this.global_variables)
          this.error = null;
        }
        catch (err) {
          calculated_value = null;
          this.error = err;
        }
      }
      this.$emit('input', {
        expression_string: expression_string,
        calculated_value: calculated_value
      });
    },
  }
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



