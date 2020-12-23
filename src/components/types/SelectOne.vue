<template>
  <div class="input-group">
    <select class="form-control" v-model="value" ref="the_input" v-on:change="update_value">
      <option disabled value="">Select one</option>
      <option v-for="option in definition.options" v-bind:key="option" v-bind:value="option">{{option}}</option>
    </select>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'SelectOne',
  data () {
    return {}
  },
  props: {
    value: String,
    definition: Object,
  },
  methods: {
    update_value (event : any) {
      this.$emit('input', event.target.value)
    },
  }
});
</script>

<style scoped lang="scss">
.read {
  width: 100%;
  min-height: 1.8em;
}
table {
}
input {
}
.read, .write {
  width: 100%;
  display: block;
}

</style>


