<template>
  <div style="display: fixed">
    <button class="btn btn-primary" v-on:click="toggle">
      <span v-show="!show_body">Show</span>
      <span v-show="show_body">Hide</span>
       Graph
    </button>

    <button v-if="show_body" class="btn btn-primary ml-3" v-on:click="clear_focus">Clear focus</button>

    <div v-if="show_body">
      <div ref="mynetwork" id="mynetwork" class="vis-graph"></div>

      <div class="top">
        <div class="row">
          <div class="col-4 sheet-option" v-for="sheet in this.database.sheets" v-bind:key="sheet._id">
            <label v-bind:style="'color:' + sheet.hex_color">
              <input type="checkbox" id="checkbox" v-bind:value="sheet.name" v-model="sheet_names">
              {{sheet.name}}
            </label>

            <div v-for="definition in references_for(sheet)" v-bind:key="definition._id">
              <label class="ml-4">
                <input type="checkbox"
                       id="checkbox"
                       v-bind:disabled="!sheet_names.includes(sheet.name)"
                       v-bind:value="definition._id"
                       v-model="selected_references[sheet._id]">
                {{definition.name}}
              </label>
            </div>
          </div>
        </div>
      </div>
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
    current_focus: Object
  },
  mounted () {
    this.refresh()
  },
  data () : any {
    return({
      sheet_names: _.map(this.database.sheets, 'name'),
      nodes_array: [],
      edges_array: [],
      network: null,
      show_body: false,
      neighbors: {},
      focused: !!this.current_focus,
      selected_references: (this as any).default_selected_references(),
    })
  },
  watch: {
    database: {
      handler(_new_val, _old_val) {
        this.refresh()
      },
      deep: true,
    },
    selected_references: {
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
      handler(new_val, _old_val) { this.refresh() }
    }
  },
  methods: {
    default_selected_references () {
      return(_.reduce(this.database.sheets, (result, sheet) => {
        return _.reduce(this.references_for(sheet), (sub_result : any, definition) => {
          if (sub_result[sheet._id] == null) { sub_result[sheet._id] = [] }

          sub_result[sheet._id].push(definition._id);

          return(sub_result);
        }, result)
      }, {}))
    },
    toggle () {
      this.show_body = !this.show_body;
      if (this.show_body) {
        this.sheet_names = _.map(this.database.sheets, 'name');
        this.selected_references = this.default_selected_references();
        setTimeout(this.refresh.bind(this), 1);
      }
    },
    clear_focus () {
      this.focused = false;
    },
    displayed_on_focus (record : any) {
      if (this.current_focus) {
        return(this.current_focus.record_id == record._id ||
               this.neighbors[this.current_focus.record_id].includes(record._id));
      } else {
        return(true);
      }
    },
    add_neighbors (id1 : string, id2 : string) {
      if (this.neighbors[id1] == null) { this.neighbors[id1] = [] }
      if (this.neighbors[id2] == null) { this.neighbors[id2] = [] }

      this.neighbors[id1].push(id2);
      this.neighbors[id2].push(id1);
    },
    relationships () {
      return([]);
    },
    references_for (sheet : db.Sheet) : db.Definition[] {
      return _.filter(sheet.definitions, {type: 'references'})
    },
    refresh () {
      let sheet = this.database.sheets[0]
      if (!sheet) { return(null) }

      let record : any = _.last(sheet.records);
      if (!record) { return(null) }

      this.neighbors = {} // Uggggly
      this.edges_array = _.flatMap(this.database.sheets, (sheet : db.Sheet) => {
        let reference_definitions = this.references_for(sheet);

        return _.flatMap(sheet.records, (record : any) => {
          return _.flatMap(reference_definitions, (definition) => {
            if ( !this.selected_references[sheet._id].includes(definition._id) ) {
              return([]);
            }

            return _.map(record.value_for_definition(definition), (reference_info) => {
              this.add_neighbors(record._id, reference_info.record_id);

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

      this.nodes_array = _.flatMap(this.database.sheets, (sheet : db.Sheet) => {
        if (this.sheet_names.includes(sheet.name)) {
          let unique_id_field = sheet.unique_id_field();

          return _(sheet.records).invokeMap('values').filter((record) => {
            return(this.displayed_on_focus(record))
          }).map((record) => {
            return({
              id: `${sheet._id}|${record._id}`,
              label: record[unique_id_field],
              color: sheet.hex_color
            })
          }).value()
        } else {
          return([])
        }
      })
      let nodes = new DataSet(this.nodes_array);

      let graph_data : any = { nodes: nodes, edges: edges };

      let element = document.getElementById("mynetwork")

      if (!element) { return(null) }

      this.network = new Network(element, graph_data, {
        layout: {randomSeed: 135321527275125}, // , improvedLayout: false},
        interaction: {
          zoomView: false
        },
        physics: {
          stabilization: {
            onlyDynamicEdges: true
          }
        },
      });
      this.network.on('click', (obj : any) : void => {
        let node_id = obj.nodes[0];

        if (node_id) {
          let [sheet_id, record_id] : string[] = node_id.split('|');
          this.$emit('focus-sheet-and-record', sheet_id, record_id);
        }
      })

      this.focus()
    },
    focus () {
      if (this.current_focus && this.network != null) {
        let node_id = `${this.current_focus.sheet_id}|${this.current_focus.record_id}`;
        this.network.selectNodes([node_id]);
        this.network.focus(node_id, {scale: 1.0, animation: { duration: 100 }});
      }
    }
  }
});

</script>

<style lang="scss">

.top {
  padding-top: 10px;
  width: 600px;
}
.vis-graph {
  width: 600px;
  height: 400px;
  border: 1px solid lightgray;
}

.sheet-option {
  text-align: left;
  margin: 0 2em 0.5em 2em;
  width: 100%;
  display: inline-block;
  white-space: nowrap;
}

</style>

