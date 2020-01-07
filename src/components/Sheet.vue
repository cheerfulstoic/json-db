<template>
  <div>
    <button v-on:click="sheet.add_column()">Add Column</button>
    <button v-on:click="sheet.add_row()">Add Row</button>

    <table class="table table-striped table-bordered">
      <thead class="thead-light">
        <tr>
          <th v-for="(definition, index) in sheet.schema()" v-bind:key="definition.id">
            <Definition v-model="sheet.schema()[index]"/>
          </th>
        </tr>
      </thead>

      <tr v-for="row in sheet.records()" v-bind:key="row.id">
        <td v-for="definition in sheet.schema()" v-bind:key="definition.id">
          <String v-if="definition.type === 'string'" v-model="row[definition.id]" />
          <TextArea v-if="definition.type === 'text_area'" v-model="row[definition.id]" />
          <Integer v-if="definition.type === 'integer'" v-model="row[definition.id]" />
          <Reference v-if="definition.type === 'reference'" v-model="row[definition.id]" v-bind:database="database" />
          <SelectOne v-if="definition.type === 'select_one'" v-model="row[definition.id]" v-bind:definition="definition" />
        </td>
      </tr>
    </table>

  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Definition from './Definition.vue';

import Integer from './types/Integer.vue';
import Reference from './types/Reference.vue';
import SelectOne from './types/SelectOne.vue';
import String from './types/String.vue';
import TextArea from './types/TextArea.vue';

import * as db from '../db';

export default Vue.extend({
  name: 'Sheet',
  components: {
    Definition,
    Integer,
    Reference,
    SelectOne,
    String,
    TextArea
  },
  data () {
    return({ a: 2 });
  },
  props: {
    sheet: db.Sheet,
    database: db.Database,
  },
});
</script>

<style scoped lang="scss">


</style>
