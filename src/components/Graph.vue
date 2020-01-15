<template>
  <div>
    <a class="btn btn-primary" v-on:click="toggle">
      <span v-show="!show_body">Show</span>
      <span v-show="show_body">Hide</span>
       Graph
    </a>

    <div v-if="show_body">
      <div class="top">
        <span class="sheet-option" v-for="sheet in this.database.sheets" v-bind:key="sheet._id"
             v-bind:style="'color:' + sheet.hex_color">
          <label>
            <input type="checkbox" id="checkbox" v-bind:value="sheet.name" v-model="sheet_names">
            {{sheet.name}}
          </label>
        </span>
      </div>
      <div ref="mynetwork" id="mynetwork" class="vis-graph"></div>

      <!--
      <h2>Nodes</h2>
      <pre>{{nodes_array}}</pre>

      <h2>Edges</h2>
      <pre>{{edges_array}}</pre>
      -->
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import * as db from '../db';
import _ from 'lodash';

import { DataSet, Network } from 'vis-network';

export default Vue.extend({
  name: 'Graph',
  props: {
    database: db.Database,
    current_focus: Object // db.Reference
  },
  mounted () {
    this.refresh()
  },
  data () : {sheet_names: string[], nodes_array: any[], edges_array: any[], network: any, show_body: boolean} {
    return({
      sheet_names: _.map(this.database.sheets, 'name'),
      nodes_array: [],
      edges_array: [],
      network: null,
      show_body: false
    })
  },
  watch: {
    database: {
      handler(_new_val, _old_val) {
        this.refresh()
      },
      deep: true,
    },
    sheet_names: {
      handler(_new_val, _old_val) {
        this.refresh()
      }
    },
    current_focus: {
      handler(new_val, _old_val) { this.focus() }
    }
  },
  methods: {
    toggle () {
      this.show_body = !this.show_body;
    },
    refresh () {
      let sheet = this.database.sheets[0]
      if (!sheet) { return(null) }

      let record : any = _.last(sheet.record_data);
      if (!record) { return(null) }

      let test = JSON.stringify(record)
      this.nodes_array = _.flatMap(this.database.sheets, (sheet : db.Sheet) => {
        if (this.sheet_names.includes(sheet.name)) {
          let unique_id_field = sheet.unique_id_field();

          return _.map(sheet.records(), (record) => {
            return({
              id: `${sheet._id}|${record._id}`,
              label: record[unique_id_field],
              color: sheet.hex_color
            })
          })
        } else {
          return([])
        }
      })

      let nodes = new DataSet(this.nodes_array);

      this.edges_array = _.flatMap(this.database.sheets, (sheet : db.Sheet) => {
        let reference_definitions = _.filter(sheet.definitions, (definition : db.Definition) => {
          return(definition.type == 'references')
        })

        return _.flatMap(sheet.record_data, (record : any) => {
          return _.flatMap(reference_definitions, (definition) => {
            return _.map(record[definition._id], (reference_info) => {
              return({
                from: `${sheet._id}|${record._id}`,
                to: `${reference_info.sheet_id}|${reference_info.record_id}`,
                label: definition.name,
                arrows: 'to'
              })
            })
          })
        })
      })

      let edges = new DataSet(this.edges_array);

      let graph_data = { nodes: nodes, edges: edges };

      let element = document.getElementById("mynetwork")

      if (!element) { return(null) }

      this.network = new Network(element, graph_data, {
        layout: {randomSeed: 135321527275125},
        interaction: {
          zoomView: false
        },
      });
      this.network.on('click', (obj : any) : void => {
        let node_id = obj.nodes[0];

        if (node_id) {
          let [sheet_id, record_id] : string[] = node_id.split('|');
          this.$emit('focus_record', sheet_id, record_id);
        }
      })

      this.focus()
    },
    focus () {
      if (this.current_focus) {
        let node_id = `${this.current_focus.sheet_id}|${this.current_focus.record_id}`;
        this.network.selectNodes([node_id]);
        this.network.focus(node_id, {scale: 1.0, animation: true});
      }
    }
  }
});

</script>

<style scoped lang="scss">

.top {
  height: 50px;
  padding-top: 10px;
}
.vis-graph {
  width: 600px;
  height: 400px;
  border: 1px solid lightgray;
}

.sheet-option {
  text-align: left;
  margin: 0 2em;
}

</style>

