<template>
  <div class="input-group">
    <div v-if="value">
      <span class="sheet">{{value.sheet}}</span> » {{referenced_record()}}
    </div>

    <b-input-group prepend="🔎">
      <input class="form-control" type="text" v-model="match_text" />
    </b-input-group>

    <div v-if="match_text">
      <b-list-group>
        <b-list-group-item button v-for="item in database.search(match_text)" v-bind:key="item.id" v-on:click="choose(item, $event)">
          <span class="sheet">{{item.sheet}}</span> »
          <span v-for="(value, key) in item.description_data" v-bind:key="key" class="property">
            <span class="key">{{key}}:</span> {{value}}
          </span>
        </b-list-group-item>
      </b-list-group>
    </div>

  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import * as db from '../../db';

export default Vue.extend({
  name: 'String',
  data () {
    return { match_text: null }
  },
  props: {
    value: Object,
    database: db.Database,
  },
  methods: {
    update_value (event : any) {
      this.$emit('input', event.target.value)
    },
    referenced_record () {
      return this.database.fetch_record(this.value.sheet, this.value.id)
    },
    choose (item : db.ReferenceQueryResult, event : any) {
      this.value.id = item.id;
      this.value.sheet = item.sheet;
      this.match_text = null;
    }
  }
});
</script>

<style scoped lang="scss">

.sheet {
  border: 1px solid black;
  // background-color: #
}

.property {
  font-weight: bold;
  border: 1px solid black;
  border-radius: 1em;
  z-index: 1;
  overflow: hidden;
  mask-image: radial-gradient(circle, white 100%, black 100%);

  margin-right: 0.5em;
  padding: 0 0.6em;

  .key {
    z-index: -1;
    background-color: lightskyblue;
    margin-left: -10px;
    padding-left: 11px;
  }
}

</style>

