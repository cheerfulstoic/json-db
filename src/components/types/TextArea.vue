<template>
  <div class="input-group">
    <textarea class="form-control" v-bind:value="value" ref="the_input" v-on:input="update_value" rows="3"></textarea>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'String',
  data () {
    return {}
  },
  props: {
    value: String,
  },
  methods: {
    update_value (event : any) {
      this.$emit('input', event.target.value)
    },
  }
});
</script>

<style scoped lang="scss">

</style>

