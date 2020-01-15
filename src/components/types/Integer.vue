<template>
  <div class="input-group">
    <input type="number" class="form-control" :value="value" ref="the_input" v-on:input="update_value">
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'Integer',
  props: {
    value: Number,
  },
  methods: {
    update_value (event : any) {
      this.$emit('input', parseInt(event.target.value))
    },
  }
});
</script>

<style scoped lang="scss">

.input-group {
  width: 150px;
}

</style>

