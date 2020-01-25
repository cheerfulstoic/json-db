<template>
  <div>
    <b-modal v-bind:ref="modal_dom_id" v-bind:id="modal_dom_id" title="BootstrapVue">
      <div class="form-group">
        <label>
          Name
          <input class="form-control" v-model="value.name"/>
        </label>
      </div>

      <div class="form-group">
        <label>
          Unique ID?
          <input type="checkbox" id="unique_id" v-model="value.unique_id">
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
            <option value="references">References</option>
            <option value="expression">Expression</option>
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

      <button class="btn btn-danger" v-on:click="remove">Delete Column</button>
    </b-modal>

    {{value.name}}
    <br/>
    <span v-if="value.unique_id">✨</span>
    <a v-b-modal="modal_dom_id">✏️</a>
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
  computed: {
    definition () {
      return this.value;
    },
    modal_dom_id () {
      return 'edit-definition-modal-' + this.value._id;
    },
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
    },
    remove () {
      this.$bvModal.hide(this.modal_dom_id)
      // this.$refs[this.modal_dom_id].hide()
      this.$emit('remove', this.definition);
    }
  }
});
</script>

<style scoped lang="scss">


</style>

