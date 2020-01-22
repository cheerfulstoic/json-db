<template>
  <div>
    <div v-for="(val, key) in variables" v-bind:key="key" class="form-group row">
      <label v-bind:for="'input-' + key" class="col-sm-2 col-form-label">{{key}}</label>

      <input v-bind:id="'input-' + key" type="number" v-bind:value="val" v-on:input="update_variable(key, $event)"/>

    </div>
    <input type="text" v-model="new_key"/>
    <a v-on:click="add_variable">Add</a>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'VariableEditor',
  data () : { new_key : string | null } {
    return({ new_key: null })
  },
  props: {
    variables: Object,
  },
  methods: {
    add_variable () {
      if (this.new_key) {
        this.$emit('update', this.new_key, '123')
        this.new_key = null;
      }
    },
    update_variable (key : string, event : any) {
      this.$emit('update', key, event.target.value)
    },
  },
});
</script>

<style scoped lang="scss">


</style>

