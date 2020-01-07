<template>
  <div>
    <div class="row">
      <div class="col col-md-9">
        {{value.name}}
      </div>
      <div class="col col-md-3">
        <b-button v-b-modal="'modal-' + value.id">Edit</b-button>
      </div>
    </div>


    <b-modal v-bind:id="'modal-' + value.id" title="BootstrapVue">
      <div class="form-group">
        <label>
          Name
          <input class="form-control" v-model="value.name"/>
        </label>
      </div>

      <div class="form-group">
        <label>
          Type
          <select class="form-control" v-model="value.type">
            <option disabled value="">Select one</option>
            <option value="string">String</option>
            <option value="text_area">Text Area</option>
            <option value="integer">Integer</option>
            <option value="select_one">Select One</option>
            <option value="reference">Reference</option>
          </select>
        </label>
      </div>

      <div class="form-group" v-if="value.type == 'select_one'">
        <label>
          <b-list-group>
            <b-list-group-item v-for="option in options()" v-bind:key="option">
              {{option}}
              <b-button v-on:click="remove_option(option, $event)" class="float-right">Remove</b-button>
            </b-list-group-item>
          </b-list-group>

          <input class="form-control" v-model="option_to_add" placeholder="New option"/>
          <b-button v-on:click="add_option">Add Option</b-button>
        </label>
      </div>
    </b-modal>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import _ from 'lodash';

export default Vue.extend({
  name: 'Definition',
  data () {
    return({ option_to_add: null })
  },
  props: {
    value: Object,
  },
  methods: {
    options () {
      return this.value.options || [];
    },
    add_option () {
      let new_options = this.options();
      new_options.push(this.option_to_add);
      this.value.options = _.uniq(new_options);
      this.option_to_add = null;
    },
    remove_option (option_to_remove:string, event:object) {
      this.value.options = _.reject(this.options(), (option) => {
        return option == option_to_remove
      })
    }
  }
});
</script>

<style scoped lang="scss">


</style>

