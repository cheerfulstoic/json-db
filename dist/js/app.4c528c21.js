(function(e){function t(t){for(var a,o,u=t[0],s=t[1],d=t[2],l=0,f=[];l<u.length;l++)o=u[l],Object.prototype.hasOwnProperty.call(r,o)&&r[o]&&f.push(r[o][0]),r[o]=0;for(a in s)Object.prototype.hasOwnProperty.call(s,a)&&(e[a]=s[a]);c&&c(t);while(f.length)f.shift()();return i.push.apply(i,d||[]),n()}function n(){for(var e,t=0;t<i.length;t++){for(var n=i[t],a=!0,u=1;u<n.length;u++){var s=n[u];0!==r[s]&&(a=!1)}a&&(i.splice(t--,1),e=o(o.s=n[0]))}return e}var a={},r={app:0},i=[];function o(t){if(a[t])return a[t].exports;var n=a[t]={i:t,l:!1,exports:{}};return e[t].call(n.exports,n,n.exports,o),n.l=!0,n.exports}o.m=e,o.c=a,o.d=function(e,t,n){o.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},o.r=function(e){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},o.t=function(e,t){if(1&t&&(e=o(e)),8&t)return e;if(4&t&&"object"===typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(o.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var a in e)o.d(n,a,function(t){return e[t]}.bind(null,a));return n},o.n=function(e){var t=e&&e.__esModule?function(){return e["default"]}:function(){return e};return o.d(t,"a",t),t},o.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},o.p="/json-db/dist/";var u=window["webpackJsonp"]=window["webpackJsonp"]||[],s=u.push.bind(u);u.push=t,u=u.slice();for(var d=0;d<u.length;d++)t(u[d]);var c=s;i.push([0,"chunk-vendors"]),n()})({0:function(e,t,n){e.exports=n("cd49")},"001e":function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var a=n("9ab4"),r=a.__importDefault(n("2b0e")),i=a.__importDefault(n("2ef0"));t.default=r.default.extend({name:"Definition",data:function(){return{option_to_add:null}},props:{value:Object},methods:{options:function(){return this.value.options||[]},add_option:function(){var e=this.options();e.push(this.option_to_add),this.value.options=i.default.uniq(e),this.option_to_add=null},remove_option:function(e,t){this.value.options=i.default.reject(this.options(),(function(t){return t==e}))}}})},"0538":function(e,t,n){"use strict";n.r(t);var a=n("5f04"),r=n.n(a);for(var i in a)"default"!==i&&function(e){n.d(t,e,(function(){return a[e]}))}(i);t["default"]=r.a},"08c6":function(e,t,n){"use strict";n.r(t);var a=n("92fc"),r=n("6de4");for(var i in r)"default"!==i&&function(e){n.d(t,e,(function(){return r[e]}))}(i);n("bb01");var o=n("2877"),u=Object(o["a"])(r["default"],a["a"],a["b"],!1,null,"efd5144a",null);t["default"]=u.exports},"08ff":function(e,t,n){},"0cf2":function(e,t,n){"use strict";n.r(t);var a=n("2766"),r=n.n(a);for(var i in a)"default"!==i&&function(e){n.d(t,e,(function(){return a[e]}))}(i);t["default"]=r.a},"0d8c":function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var a=n("9ab4"),r=a.__importDefault(n("2b0e"));t.default=r.default.extend({name:"String",data:function(){return{}},props:{value:String},methods:{update_value:function(e){this.$emit("input",e.target.value)}}})},"0e4e":function(e,t,n){"use strict";var a=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",{staticClass:"input-group"},[n("textarea",{ref:"the_input",staticClass:"form-control",attrs:{rows:"3"},domProps:{value:e.value},on:{input:e.update_value}})])},r=[];n.d(t,"a",(function(){return a})),n.d(t,"b",(function(){return r}))},"10ed":function(e,t,n){"use strict";n("498a"),Object.defineProperty(t,"__esModule",{value:!0});var a=n("9ab4"),r=a.__importDefault(n("2b0e")),i=a.__importDefault(n("2ef0")),o=n("430b").Parser;t.default=r.default.extend({name:"Expression",data:function(){return{error:null}},props:{value:Object,definition:Object,global_variables:Object},watch:{global_variables:{handler:function(e,t){this.update_value(this.value.expression_string)},deep:!0}},methods:{update_value_event:function(e){var t=e.target.value;this.update_value(t)},update_value:function(e){var t;if(console.log(i.default.trim(e)),console.log(""===i.default.trim(e)),""===i.default.trim(e))t=null,this.error=null;else{var n=new o;try{t=n.evaluate(e,this.global_variables),this.error=null}catch(a){t=null,this.error=a}this.$emit("input",{expression_string:e,calculated_value:t})}}}})},1250:function(e,t,n){"use strict";n.r(t);var a=n("8c5b"),r=n.n(a);for(var i in a)"default"!==i&&function(e){n.d(t,e,(function(){return a[e]}))}(i);t["default"]=r.a},2766:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var a=n("9ab4"),r=a.__importDefault(n("2b0e"));t.default=r.default.extend({name:"String",data:function(){return{}},props:{value:String},methods:{update_value:function(e){this.$emit("input",e.target.value)}}})},3383:function(e,t,n){"use strict";n("99af"),n("4de4"),n("5db7"),n("caad"),n("d81d"),n("73d9"),n("b0c0"),n("ac1f"),n("2532"),n("1276");var a=n("278c");Object.defineProperty(t,"__esModule",{value:!0});var r=n("9ab4"),i=r.__importDefault(n("2b0e")),o=r.__importStar(n("a4c9")),u=r.__importDefault(n("2ef0")),s=n("4e46");t.default=i.default.extend({name:"Graph",props:{database:o.Database,current_focus:Object},mounted:function(){this.refresh()},data:function(){return{sheet_names:u.default.map(this.database.sheets,"name"),nodes_array:[],edges_array:[],network:null,show_body:!1}},watch:{database:{handler:function(e,t){this.refresh()},deep:!0},sheet_names:{handler:function(e,t){this.refresh()}},current_focus:{handler:function(e,t){this.focus()}}},methods:{toggle:function(){this.show_body=!this.show_body,this.show_body&&(this.sheet_names=u.default.map(this.database.sheets,"name"),this.refresh())},refresh:function(){var e=this,t=this.database.sheets[0];if(!t)return null;var n=u.default.last(t.record_data);if(!n)return null;JSON.stringify(n);this.nodes_array=u.default.flatMap(this.database.sheets,(function(t){if(e.sheet_names.includes(t.name)){var n=t.unique_id_field();return u.default.map(t.records(),(function(e){return{id:"".concat(t._id,"|").concat(e._id),label:e[n],color:t.hex_color}}))}return[]}));var r=new s.DataSet(this.nodes_array);this.edges_array=u.default.flatMap(this.database.sheets,(function(e){var t=u.default.filter(e.definitions,(function(e){return"references"==e.type}));return u.default.flatMap(e.record_data,(function(n){return u.default.flatMap(t,(function(t){return u.default.map(n[t._id],(function(a){return{from:"".concat(e._id,"|").concat(n._id),to:"".concat(a.sheet_id,"|").concat(a.record_id),label:t.name,arrows:"to"}}))}))}))}));var i=new s.DataSet(this.edges_array),o={nodes:r,edges:i},d=document.getElementById("mynetwork");if(!d)return null;this.network=new s.Network(d,o,{layout:{randomSeed:0x7b12ff904e75,improvedLayout:!1},interaction:{zoomView:!1},nodes:{shapeProperties:{interpolation:!1}},physics:{stabilization:!1}}),this.network.on("click",(function(t){var n=t.nodes[0];if(n){var r=n.split("|"),i=a(r,2),o=i[0],u=i[1];e.$emit("focus_record",o,u)}})),this.focus()},focus:function(){if(this.current_focus){var e="".concat(this.current_focus.sheet_id,"|").concat(this.current_focus.record_id);this.network.selectNodes([e]),this.network.focus(e,{scale:1,animation:!0})}}}})},"38df":function(e,t,n){"use strict";n.r(t);var a=n("001e"),r=n.n(a);for(var i in a)"default"!==i&&function(e){n.d(t,e,(function(){return a[e]}))}(i);t["default"]=r.a},"39aa":function(e,t,n){"use strict";n.r(t);var a=n("0d8c"),r=n.n(a);for(var i in a)"default"!==i&&function(e){n.d(t,e,(function(){return a[e]}))}(i);t["default"]=r.a},"3d97":function(e,t,n){},"3dfd":function(e,t,n){"use strict";n.r(t);var a=n("e16a"),r=n("6f68");for(var i in r)"default"!==i&&function(e){n.d(t,e,(function(){return r[e]}))}(i);n("5c0b");var o=n("2877"),u=Object(o["a"])(r["default"],a["a"],a["b"],!1,null,null,null);t["default"]=u.exports},"3fce":function(e,t,n){"use strict";var a=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",[n("b-button",{directives:[{name:"b-modal",rawName:"v-b-modal",value:"sheet-modal-"+e.sheet._id,expression:"'sheet-modal-' + sheet._id"}],staticClass:"btn btn-primary"},[e._v("Edit Sheet")]),n("button",{staticClass:"btn btn-primary",on:{click:function(t){return e.sheet.add_column()}}},[e._v("Add Column")]),n("br"),n("button",{staticClass:"btn btn-primary add-row-btn",on:{click:function(t){return e.sheet.add_row("top")}}},[e._v("Add Row")]),n("table",{staticClass:"table table-striped table-bordered"},[n("thead",{staticClass:"thead-light"},[n("tr",[e._l(e.sheet.definitions,(function(t,a){return n("th",{key:t._id},[n("Definition",{staticStyle:{float:"left"},model:{value:e.sheet.definitions[a],callback:function(t){e.$set(e.sheet.definitions,a,t)},expression:"sheet.definitions[index]"}}),n("a",{staticClass:"remove",on:{click:function(n){return e.remove_column(t)}}},[e._v("🗑")])],1)})),n("th")],2)]),e._l(e.sheet.record_data,(function(t){return[n("tr",{key:t._id,class:{selected:e.record_focused(t)},attrs:{id:"record-"+t._id},on:{click:function(n){return e.focus_sheet_and_record(e.sheet._id,t._id)}}},[e._l(e.sheet.definitions,(function(a){return n("td",{key:a._id},["string"===a.type?n("String",{model:{value:t[a._id],callback:function(n){e.$set(t,a._id,n)},expression:"record[definition._id]"}}):e._e(),"text_area"===a.type?n("TextArea",{model:{value:t[a._id],callback:function(n){e.$set(t,a._id,n)},expression:"record[definition._id]"}}):e._e(),e._v(" "),"integer"===a.type?n("Integer",{model:{value:t[a._id],callback:function(n){e.$set(t,a._id,n)},expression:"record[definition._id]"}}):e._e(),"select_one"===a.type?n("SelectOne",{attrs:{definition:a},model:{value:t[a._id],callback:function(n){e.$set(t,a._id,n)},expression:"record[definition._id]"}}):e._e(),"references"===a.type?n("References",{attrs:{database:e.database,record_id:t._id},on:{"focus-sheet-and-record":e.focus_sheet_and_record},model:{value:t[a._id],callback:function(n){e.$set(t,a._id,n)},expression:"record[definition._id]"}}):e._e(),"expression"===a.type?n("Expression",{attrs:{definition:a,global_variables:e.database.global_variables},model:{value:t[a._id],callback:function(n){e.$set(t,a._id,n)},expression:"record[definition._id]"}}):e._e()],1)})),n("td",[n("a",{staticClass:"remove",on:{click:function(n){return e.remove(t._id)}}},[e._v("🗑")])])],2)]}))],2),n("button",{staticClass:"btn btn-primary add-row-btn",on:{click:function(t){return e.sheet.add_row("bottom")}}},[e._v("Add Row")]),n("b-modal",{attrs:{id:"sheet-modal-"+e.sheet._id,title:"Edit Sheet"}},[n("div",{staticClass:"form-group"},[n("label",[e._v(" Name "),n("input",{directives:[{name:"model",rawName:"v-model",value:e.sheet.name,expression:"sheet.name"}],staticClass:"form-control",domProps:{value:e.sheet.name},on:{input:function(t){t.target.composing||e.$set(e.sheet,"name",t.target.value)}}})])]),n("div",{staticClass:"form-group"},[n("label",[e._v(" Color "),n("ChromePicker",{attrs:{value:e.colors},on:{input:e.update_color}})],1)])])],1)},r=[];n.d(t,"a",(function(){return a})),n.d(t,"b",(function(){return r}))},"47a3":function(e,t,n){},"5c0b":function(e,t,n){"use strict";var a=n("9c0c"),r=n.n(a);r.a},"5f04":function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var a=n("9ab4"),r=a.__importDefault(n("2b0e")),i=a.__importStar(n("a4c9"));t.default=r.default.extend({name:"Sheet",props:{result:Object,database:i.Database}})},6328:function(e,t,n){"use strict";var a=n("eb13"),r=n.n(a);r.a},"670b":function(e,t,n){"use strict";var a=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",{staticClass:"input-group"},[n("input",{ref:"the_input",staticClass:"form-control",attrs:{type:"number"},domProps:{value:e.value},on:{input:e.update_value}})])},r=[];n.d(t,"a",(function(){return a})),n.d(t,"b",(function(){return r}))},"6de4":function(e,t,n){"use strict";n.r(t);var a=n("10ed"),r=n.n(a);for(var i in a)"default"!==i&&function(e){n.d(t,e,(function(){return a[e]}))}(i);t["default"]=r.a},"6f68":function(e,t,n){"use strict";n.r(t);var a=n("78c7"),r=n.n(a);for(var i in a)"default"!==i&&function(e){n.d(t,e,(function(){return a[e]}))}(i);t["default"]=r.a},7231:function(e,t,n){"use strict";var a=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",[n("a",{directives:[{name:"b-modal",rawName:"v-b-modal",value:"modal-"+e.value._id,expression:"'modal-' + value._id"}]},[e._v("✏️")]),e._v(" "+e._s(e.value.name)+" "),e.value.unique_id?n("span",[e._v("✨")]):e._e(),n("b-modal",{attrs:{id:"modal-"+e.value._id,title:"BootstrapVue"}},[n("div",{staticClass:"form-group"},[n("label",[e._v(" Name "),n("input",{directives:[{name:"model",rawName:"v-model",value:e.value.name,expression:"value.name"}],staticClass:"form-control",domProps:{value:e.value.name},on:{input:function(t){t.target.composing||e.$set(e.value,"name",t.target.value)}}})])]),n("div",{staticClass:"form-group"},[n("label",[e._v(" Unique ID? "),n("input",{directives:[{name:"model",rawName:"v-model",value:e.value.unique_id,expression:"value.unique_id"}],attrs:{type:"checkbox",id:"unique_id"},domProps:{checked:Array.isArray(e.value.unique_id)?e._i(e.value.unique_id,null)>-1:e.value.unique_id},on:{change:function(t){var n=e.value.unique_id,a=t.target,r=!!a.checked;if(Array.isArray(n)){var i=null,o=e._i(n,i);a.checked?o<0&&e.$set(e.value,"unique_id",n.concat([i])):o>-1&&e.$set(e.value,"unique_id",n.slice(0,o).concat(n.slice(o+1)))}else e.$set(e.value,"unique_id",r)}}})])]),n("div",{staticClass:"form-group"},[n("label",[e._v(" Type "),n("select",{directives:[{name:"model",rawName:"v-model",value:e.value.type,expression:"value.type"}],staticClass:"form-control",on:{change:function(t){var n=Array.prototype.filter.call(t.target.options,(function(e){return e.selected})).map((function(e){var t="_value"in e?e._value:e.value;return t}));e.$set(e.value,"type",t.target.multiple?n:n[0])}}},[n("option",{attrs:{disabled:"",value:""}},[e._v("Select one")]),n("option",{attrs:{value:"string"}},[e._v("String")]),n("option",{attrs:{value:"text_area"}},[e._v("Text Area")]),n("option",{attrs:{value:"integer"}},[e._v("Integer")]),n("option",{attrs:{value:"select_one"}},[e._v("Select One")]),n("option",{attrs:{value:"references"}},[e._v("References")]),n("option",{attrs:{value:"expression"}},[e._v("Expression")])])])]),"select_one"==e.value.type?n("div",{staticClass:"form-group"},[n("label",[n("b-list-group",e._l(e.options(),(function(t){return n("b-list-group-item",{key:t},[e._v(" "+e._s(t)+" "),n("b-button",{staticClass:"float-right",on:{click:function(n){return e.remove_option(t,n)}}},[e._v("Remove")])],1)})),1),n("input",{directives:[{name:"model",rawName:"v-model",value:e.option_to_add,expression:"option_to_add"}],staticClass:"form-control",attrs:{placeholder:"New option"},domProps:{value:e.option_to_add},on:{input:function(t){t.target.composing||(e.option_to_add=t.target.value)}}}),n("b-button",{on:{click:e.add_option}},[e._v("Add Option")])],1)]):e._e()])],1)},r=[];n.d(t,"a",(function(){return a})),n.d(t,"b",(function(){return r}))},"74fb":function(e,t,n){"use strict";n.r(t);var a=n("670b"),r=n("7b9e");for(var i in r)"default"!==i&&function(e){n.d(t,e,(function(){return r[e]}))}(i);n("8e5d");var o=n("2877"),u=Object(o["a"])(r["default"],a["a"],a["b"],!1,null,"e23b5940",null);t["default"]=u.exports},"78c7":function(e,t,n){"use strict";n("d81d"),n("b0c0"),n("d3b7"),n("3ca3"),n("ddb0"),n("2b3d"),Object.defineProperty(t,"__esModule",{value:!0});var a=n("9ab4"),r=a.__importDefault(n("2b0e")),i=a.__importDefault(n("5f5b")),o=a.__importDefault(n("fceb")),u=a.__importDefault(n("cbe0")),s=a.__importDefault(n("f972")),d=a.__importDefault(n("2ef0"));r.default.use(i.default);var c=a.__importStar(n("a4c9")),l=new c.Sheet("Test","sheet_1",null,[{name:"id",type:"string",unique_id:!0},{name:"msg",type:"text_area"},{name:"foo",type:"integer"},{name:"bar",type:"references"}],[{id:"unreferenced",msg:"Fun",foo:6},{_id:"ggg123",id:"blah",msg:"Hello",foo:2},{_id:"hhh123",id:"bloh",msg:"Hullo",bar:[{sheet_id:"sheet_1",record_id:"ggg123"}]},{_id:"abc123",id:"blum",msg:"Heja",bar:[{sheet_id:"sheet_1",record_id:"hhh123"},{sheet_id:"sheet_2",record_id:"flub"}]}]),f=new c.Sheet("Influencers","sheet_2",null,[{name:"label",type:"string",unique_id:!0},{name:"description",type:"text_area"},{name:"influencable",type:"references"}],[{_id:"flub",label:"Huh",description:"Something long, preferably",influencable:[{sheet_id:"sheet_1",record_id:"hhh123"}]}]),_=new c.Database([l,f],{});t.default=r.default.extend({name:"app",components:{Graph:s.default,VariableEditor:u.default,Sheet:o.default},data:function(){return{database:new c.Database([],{}),current_sheet_id:_.sheets[0]._id,current_focus:null,project_name:"Project Name",upload_highlighted:!1,show_json:!1}},methods:{update_global_variables:function(e,t){r.default.set(this.database.global_variables,e,t)},upload:function(e){var t=this;this.upload_highlighted=!1,e.dataTransfer.files.length>1&&alert("You cannot upload more than one file");var n=e.dataTransfer.files[0],a=(e.dataTransfer.items[0],new FileReader);a.onload=function(e){var n=JSON.parse(e.target.result),a=d.default.map(n.sheets,(function(e){return new c.Sheet(e.name,e._id,e.hex_color,e.definitions,n.records[e.name])}));t.database=new c.Database(a,n.global_variables),t.current_sheet_id=t.database.sheets[0]._id},a.readAsText(n)},highlight_upload:function(){this.upload_highlighted=!0},unhighlight_upload:function(){this.upload_highlighted=!1},add_sheet:function(){var e=this.database.sheets.length+1;this.database.add_sheet(new c.Sheet("Sheet #".concat(e),null,null,[],[]))},change_sheet:function(e){this.current_sheet_id=e},focus_sheet_and_record:function(e,t){this.current_focus={sheet_id:e,record_id:t},this.current_sheet_id=e,window.setTimeout((function(){console.log("scrolling");var e=document.getElementById("record-".concat(t));e&&e.scrollIntoView({behavior:"smooth",block:"center"})}),1)},json:function(){return JSON.stringify(this.database.json_data(),null,2)},json_file_data_url:function(){var e=new Blob([this.json()],{type:"application/json"});return URL.createObjectURL(e)},taggle_json:function(){this.show_json=!this.show_json}},computed:{}})},"79e3":function(e,t,n){"use strict";n("99af"),n("caad"),n("d81d"),n("ac1f"),n("2532"),n("841c"),Object.defineProperty(t,"__esModule",{value:!0});var a=n("9ab4"),r=a.__importDefault(n("2b0e")),i=a.__importDefault(n("8d65")),o=a.__importDefault(n("2ef0")),u=a.__importStar(n("a4c9"));t.default=r.default.extend({name:"String",components:{RecordResult:i.default},data:function(){return{match_text:null}},props:{value:Array,record_id:String,database:u.Database},methods:{update_value:function(e){this.$emit("input",e.target.value)},search_results:function(){var e=this;if(!this.match_text)return[];var t=o.default.map(this.value,"record_id");return o.default(this.database.search("".concat(this.match_text))).map((function(e){return{id:e.id,sheet:e.sheet,record:e.sheet.record_values(e.record)}})).reject((function(n){return n.id===e.record_id||t.includes(n.id)})).value()},referenced_records:function(){var e=this;return o.default.map(this.value,(function(t){var n=e.database.fetch_record(t);if(n)return o.default.set(n,"record",n.sheet.record_values(n.record))}))},choose:function(e,t){this.$emit("input",(this.value||[]).concat([{record_id:e.id,sheet_id:e.sheet._id}])),this.match_text=null},remove:function(e){this.$emit("input",o.default.reject(this.value,(function(t){return t.record_id==e.id})))},focus_sheet_and_record:function(e,t){this.$emit("focus-sheet-and-record",e,t)}}})},"7b9e":function(e,t,n){"use strict";n.r(t);var a=n("fb57"),r=n.n(a);for(var i in a)"default"!==i&&function(e){n.d(t,e,(function(){return a[e]}))}(i);t["default"]=r.a},"8ac8":function(e,t,n){"use strict";n.r(t);var a=n("9576"),r=n("a7f4");for(var i in r)"default"!==i&&function(e){n.d(t,e,(function(){return r[e]}))}(i);n("f7cb");var o=n("2877"),u=Object(o["a"])(r["default"],a["a"],a["b"],!1,null,"0ddf60c2",null);t["default"]=u.exports},"8c5b":function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var a=n("9ab4"),r=a.__importDefault(n("2b0e"));t.default=r.default.extend({name:"Reference",data:function(){return{}},props:{value:String,definition:Object},methods:{update_value:function(e){this.$emit("input",e.target.value)}}})},"8d65":function(e,t,n){"use strict";n.r(t);var a=n("fd32"),r=n("0538");for(var i in r)"default"!==i&&function(e){n.d(t,e,(function(){return r[e]}))}(i);n("ae59");var o=n("2877"),u=Object(o["a"])(r["default"],a["a"],a["b"],!1,null,"04030f8c",null);t["default"]=u.exports},"8e5d":function(e,t,n){"use strict";var a=n("d2c3"),r=n.n(a);r.a},"92fc":function(e,t,n){"use strict";var a=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",[n("div",{staticClass:"form-group"},[n("input",{ref:"the_input",staticClass:"form-control",domProps:{value:e.value&&e.value.expression_string},on:{input:e.update_value_event}})]),n("div",{staticClass:"form-group"},[n("span",{staticClass:"calculated-value"},[e._v(e._s(e.value&&e.value.calculated_value))]),n("span",{staticClass:"error"},[e._v(e._s(e.error))])])])},r=[];n.d(t,"a",(function(){return a})),n.d(t,"b",(function(){return r}))},9576:function(e,t,n){"use strict";var a=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",{staticClass:"input-group referenced-object"},[e._l(e.referenced_records(),(function(t){return n("div",{key:t.id},[n("a",{staticClass:"remove",on:{click:function(n){return e.remove(t)}}},[e._v("🗑")]),n("RecordResult",{attrs:{result:t,database:e.database},on:{"focus-sheet-and-record":e.focus_sheet_and_record}})],1)})),n("div",{staticClass:"search"},[n("b-input-group",{attrs:{prepend:"🔎"}},[n("input",{directives:[{name:"model",rawName:"v-model",value:e.match_text,expression:"match_text"}],staticClass:"form-control",attrs:{type:"text"},domProps:{value:e.match_text},on:{input:function(t){t.target.composing||(e.match_text=t.target.value)}}})]),e.match_text?n("div",{staticClass:"results"},[n("b-list-group",e._l(e.search_results(),(function(t){return n("b-list-group-item",{key:t.id,staticClass:"search_result",attrs:{button:"",variant:"secondary"},on:{click:function(n){return e.choose(t,n)}}},[n("RecordResult",{attrs:{result:t,database:e.database}})],1)})),1)],1):e._e()],1)],2)},r=[];n.d(t,"a",(function(){return a})),n.d(t,"b",(function(){return r}))},9862:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var a=n("9ab4"),r=a.__importDefault(n("2b0e"));t.default=r.default.extend({name:"VariableEditor",data:function(){return{new_key:null}},props:{variables:Object},methods:{add_variable:function(){this.new_key&&(this.$emit("update",this.new_key,"123"),this.new_key=null)},update_variable:function(e,t){this.$emit("update",e,t.target.value)}}})},"9a77":function(e,t,n){"use strict";var a=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",[e._l(e.variables,(function(t,a){return n("div",{key:a,staticClass:"form-group row"},[n("label",{staticClass:"col-sm-2 col-form-label",attrs:{for:"input-"+a}},[e._v(e._s(a))]),n("input",{attrs:{id:"input-"+a,type:"number"},domProps:{value:t},on:{input:function(t){return e.update_variable(a,t)}}})])})),n("input",{directives:[{name:"model",rawName:"v-model",value:e.new_key,expression:"new_key"}],attrs:{type:"text"},domProps:{value:e.new_key},on:{input:function(t){t.target.composing||(e.new_key=t.target.value)}}}),n("a",{on:{click:e.add_variable}},[e._v("Add")])],2)},r=[];n.d(t,"a",(function(){return a})),n.d(t,"b",(function(){return r}))},"9c0c":function(e,t,n){},"9f79":function(e,t,n){"use strict";n.r(t);var a=n("e829"),r=n("1250");for(var i in r)"default"!==i&&function(e){n.d(t,e,(function(){return r[e]}))}(i);n("c2b3");var o=n("2877"),u=Object(o["a"])(r["default"],a["a"],a["b"],!1,null,"6f40582a",null);t["default"]=u.exports},a4c9:function(e,t,n){"use strict";n("4de4"),n("7db0"),n("5db7"),n("caad"),n("d81d"),n("73d9"),n("b0c0"),n("ac1f"),n("2532"),n("841c");var a=n("970b"),r=n("5bc3");Object.defineProperty(t,"__esModule",{value:!0});var i=n("9ab4"),o=i.__importDefault(n("2ef0")),u=i.__importDefault(n("ffe7")),s=n("c437"),d=function(){function e(t,n,r,i,u){a(this,e),this.description_types=["string","text_area","select_one"],this._id=n||s(),this.name=t,this.definitions=o.default.map(i,this.add_id),e.last_used_hex_color=e.last_used_hex_color+1,this.hex_color=r||e.hex_colors[e.last_used_hex_color];var d=o.default.keyBy(this.definitions,"name");this.record_data=o.default(u).map((function(e){return o.default.mapKeys(e,(function(e,t){return"_"===t[0]?t:d[t]._id}))})).map(this.add_id).value()}return r(e,[{key:"records",value:function(){return o.default.map(this.record_data,this.translate_record.bind(this))}},{key:"schema",value:function(){return this.definitions}},{key:"search",value:function(e){var t=this,n=o.default(this.definitions).filter((function(e){return t.description_types.includes(e.type)})).map((function(e){return e._id})).value(),a=new u.default(this.record_data,{keys:n});return o.default.map(a.search(e),(function(e){return{sheet:t,id:e._id,record:t.translate_record(e)}}))}},{key:"find_by_id",value:function(e){return o.default.find(this?this.record_data:[],{_id:e})}},{key:"add_column",value:function(){var e=this.definitions.length+1;this.definitions.push(this.add_id({name:"Column #".concat(e),type:"string"}))}},{key:"add_row",value:function(e){"top"==e?this.record_data.unshift(this.add_id({})):this.record_data.push(this.add_id({}))}},{key:"remove_row",value:function(e){this.record_data=o.default.reject(this.record_data,(function(t){return t._id===e}))}},{key:"translate_record",value:function(e){var t=o.default.keyBy(this.definitions,"_id");return o.default.mapKeys(e,(function(e,n){return"_"===n[0]?n:t[n].name}))}},{key:"record_values",value:function(e){var t=this.unique_id_field(),n={};return n[t]=e[t],n}},{key:"unique_id_field",value:function(){var e=o.default(this.definitions).find({unique_id:!0});return e?e.name:"_id"}},{key:"json_data",value:function(){return{_id:this._id,name:this.name,hex_color:this.hex_color,definitions:this.definitions}}},{key:"delete_definition",value:function(e){var t=this.find_definition(e);this.record_data=this.record_data.map((function(e){return o.default.omit(e,t._id)})),o.default.pull(this.definitions,t)}},{key:"find_definition",value:function(e){var t=o.default.find(this.definitions,{_id:e});if(!t)throw"Unable to find definition: ".concat(e);return t}},{key:"add_id",value:function(e){return e["_id"]?e:o.default.assign(e,{_id:s()})}}]),e}();d.hex_colors=["#D11141","#00B159","#00AEDB","#F37735","#FFC425"],d.last_used_hex_color=-1,t.Sheet=d;var c=function(){function e(t,n){a(this,e),this.sheets=t,this.global_variables=n}return r(e,[{key:"add_sheet",value:function(e){this.sheets.push(e)}},{key:"search",value:function(e){return o.default.flatMap(this.sheets,(function(t){return t.search(e)}))}},{key:"fetch_record",value:function(e){var t=o.default.find(this.sheets,(function(t){return t._id===e.sheet_id}));if(!t)return null;var n=t.find_by_id(e.record_id);return n?{sheet:t,id:e.record_id,record:t.translate_record(n)}:null}},{key:"find_sheet",value:function(e){return o.default.find(this.sheets,{_id:e})}},{key:"json_data",value:function(){var e=this,t=o.default.reduce(this.sheets,(function(e,t){return e[t.name]=t.json_data(),e}),{}),n=o.default.reduce(this.sheets,(function(e,t){return o.default.set(e,t._id,o.default.find(t.definitions,{unique_id:!0}))}),{}),a=o.default.reduce(this.sheets,(function(t,a){var r=o.default.filter(a.definitions,(function(e){return"references"==e.type}));return t[a.name]=o.default.map(a.records(),(function(t){return o.default.reduce(r,(function(t,a){var r=t[a.name];return r&&r.length&&(t[a.name]=o.default.map(r,(function(t){var a=e.fetch_record(t);if(a){t=o.default.set(t,"sheet_name",a.sheet.name);var r=n[a.sheet._id];return r&&(t=o.default.set(t,r.name,a.record[r.name])),t}return t}))),t}),t)})),t}),{});return{global_variables:this.global_variables,sheets:t,records:a}}}]),e}();t.Database=c},a65e:function(e,t,n){"use strict";var a=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",[n("a",{staticClass:"btn btn-primary",on:{click:e.toggle}},[n("span",{directives:[{name:"show",rawName:"v-show",value:!e.show_body,expression:"!show_body"}]},[e._v("Show")]),n("span",{directives:[{name:"show",rawName:"v-show",value:e.show_body,expression:"show_body"}]},[e._v("Hide")]),e._v(" Graph ")]),e.show_body?n("div",[n("div",{ref:"mynetwork",staticClass:"vis-graph",attrs:{id:"mynetwork"}}),n("div",{staticClass:"top"},e._l(this.database.sheets,(function(t){return n("span",{key:t._id,staticClass:"sheet-option",style:"color:"+t.hex_color},[n("label",[n("input",{directives:[{name:"model",rawName:"v-model",value:e.sheet_names,expression:"sheet_names"}],attrs:{type:"checkbox",id:"checkbox"},domProps:{value:t.name,checked:Array.isArray(e.sheet_names)?e._i(e.sheet_names,t.name)>-1:e.sheet_names},on:{change:function(n){var a=e.sheet_names,r=n.target,i=!!r.checked;if(Array.isArray(a)){var o=t.name,u=e._i(a,o);r.checked?u<0&&(e.sheet_names=a.concat([o])):u>-1&&(e.sheet_names=a.slice(0,u).concat(a.slice(u+1)))}else e.sheet_names=i}}}),e._v(" "+e._s(t.name)+" ")])])})),0)]):e._e()])},r=[];n.d(t,"a",(function(){return a})),n.d(t,"b",(function(){return r}))},a7f4:function(e,t,n){"use strict";n.r(t);var a=n("79e3"),r=n.n(a);for(var i in a)"default"!==i&&function(e){n.d(t,e,(function(){return a[e]}))}(i);t["default"]=r.a},a855:function(e,t,n){"use strict";n("b0c0"),Object.defineProperty(t,"__esModule",{value:!0});var a=n("9ab4"),r=a.__importDefault(n("2b0e")),i=a.__importDefault(n("d6dc")),o=a.__importDefault(n("08c6")),u=a.__importDefault(n("74fb")),s=a.__importDefault(n("8ac8")),d=a.__importDefault(n("9f79")),c=a.__importDefault(n("bd5b")),l=a.__importDefault(n("c2ae")),f=n("c345"),_=a.__importStar(n("a4c9"));t.default=r.default.extend({name:"Sheet",components:{Definition:i.default,Expression:o.default,Integer:u.default,References:s.default,SelectOne:d.default,String:c.default,TextArea:l.default,ChromePicker:f.Chrome},data:function(){return{colors:{hex:this.sheet.hex_color}}},props:{sheet:_.Sheet,database:_.Database,current_focus:Object},methods:{update_color:function(e){this.sheet.hex_color=e.hex},focus_record:function(e){this.$emit("focus-sheet-and-record",this.sheet._id,e)},record_focused:function(e){return!!this.current_focus&&e._id===this.current_focus.record_id},remove:function(e){this.sheet.remove_row(e)},remove_column:function(e){confirm("Do you really want to delete the column ".concat(e.name,"?"))&&this.sheet.delete_definition(e._id)},focus_sheet_and_record:function(e,t){this.$emit("focus-sheet-and-record",e,t)}}})},ae59:function(e,t,n){"use strict";var a=n("47a3"),r=n.n(a);r.a},af2e:function(e,t,n){},bb01:function(e,t,n){"use strict";var a=n("f3b2"),r=n.n(a);r.a},bd5b:function(e,t,n){"use strict";n.r(t);var a=n("ec7d"),r=n("0cf2");for(var i in r)"default"!==i&&function(e){n.d(t,e,(function(){return r[e]}))}(i);var o=n("2877"),u=Object(o["a"])(r["default"],a["a"],a["b"],!1,null,"1f244126",null);t["default"]=u.exports},c2ae:function(e,t,n){"use strict";n.r(t);var a=n("0e4e"),r=n("39aa");for(var i in r)"default"!==i&&function(e){n.d(t,e,(function(){return r[e]}))}(i);var o=n("2877"),u=Object(o["a"])(r["default"],a["a"],a["b"],!1,null,"ac35ae54",null);t["default"]=u.exports},c2b3:function(e,t,n){"use strict";var a=n("af2e"),r=n.n(a);r.a},cbe0:function(e,t,n){"use strict";n.r(t);var a=n("9a77"),r=n("d4f3");for(var i in r)"default"!==i&&function(e){n.d(t,e,(function(){return r[e]}))}(i);var o=n("2877"),u=Object(o["a"])(r["default"],a["a"],a["b"],!1,null,"04ab4d4a",null);t["default"]=u.exports},cd49:function(e,t,n){"use strict";n("e260"),n("e6cf"),n("cca6"),n("a79d"),Object.defineProperty(t,"__esModule",{value:!0});var a=n("9ab4"),r=a.__importDefault(n("2b0e")),i=a.__importDefault(n("3dfd"));r.default.config.productionTip=!1,new r.default({render:function(e){return e(i.default)}}).$mount("#app")},d2c3:function(e,t,n){},d4f3:function(e,t,n){"use strict";n.r(t);var a=n("9862"),r=n.n(a);for(var i in a)"default"!==i&&function(e){n.d(t,e,(function(){return a[e]}))}(i);t["default"]=r.a},d52d:function(e,t,n){"use strict";var a=n("08ff"),r=n.n(a);r.a},d6dc:function(e,t,n){"use strict";n.r(t);var a=n("7231"),r=n("38df");for(var i in r)"default"!==i&&function(e){n.d(t,e,(function(){return r[e]}))}(i);var o=n("2877"),u=Object(o["a"])(r["default"],a["a"],a["b"],!1,null,"cf9bc4b2",null);t["default"]=u.exports},e16a:function(e,t,n){"use strict";var a=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",{attrs:{id:"app"}},[e.database.sheets.length?n("a",{attrs:{href:e.json_file_data_url(),download:e.project_name+".db.json"}},[e._v("Save JSON")]):e._e(),n("Graph",{attrs:{id:"graph",database:e.database,current_focus:e.current_focus},on:{"focus-sheet-and-record":e.focus_sheet_and_record}}),n("div",{staticClass:"form-group"},[n("input",{directives:[{name:"model",rawName:"v-model",value:e.project_name,expression:"project_name"}],attrs:{type:"text"},domProps:{value:e.project_name},on:{input:function(t){t.target.composing||(e.project_name=t.target.value)}}}),n("b-button",{directives:[{name:"b-modal",rawName:"v-b-modal.global-variables-modal",modifiers:{"global-variables-modal":!0}}],attrs:{variant:"primary"}},[e._v("Edit Global Variables")])],1),n("ul",{staticClass:"nav nav-tabs"},[e._l(e.database.sheets,(function(t){return n("li",{key:t._id,staticClass:"nav-item"},[n("a",{class:["nav-link","active",{selected:e.current_sheet_id===t._id}],on:{click:function(n){return e.change_sheet(t._id)}}},[n("div",{staticClass:"marker",style:"background-color:"+t.hex_color}),e._v(" "+e._s(t.name)+" ")])])})),n("li",{staticClass:"nav-item"},[n("a",{staticClass:"btn btn-primary add-sheet-btn",on:{click:e.add_sheet}},[e._v("Add Sheet")])])],2),e._l(e.database.sheets,(function(t){return n("div",{key:t._id},[e.current_sheet_id===t._id?n("Sheet",{attrs:{sheet:t,database:e.database,current_focus:e.current_focus},on:{"focus-sheet-and-record":e.focus_sheet_and_record}}):e._e()],1)})),e.database.sheets.length?e._e():n("div",{class:{hover:e.upload_highlighted},attrs:{id:"file-upload"},on:{drop:function(t){return t.preventDefault(),e.upload(t)},dragover:function(t){return t.preventDefault(),e.highlight_upload(t)},dragleave:function(t){return t.preventDefault(),e.unhighlight_upload(t)}}},[e._v(" Drag here to upload file ")]),n("hr"),n("button",{staticClass:"btn btn-primary toggle-json-btn",on:{click:e.taggle_json}},[e._v("Toggle JSON")]),e.show_json?n("pre",{staticClass:"json-output"},[e._v(e._s(e.json()))]):e._e(),n("b-modal",{attrs:{id:"global-variables-modal",title:"Global Variables"}},[n("VariableEditor",{attrs:{variables:e.database.global_variables},on:{update:e.update_global_variables}})],1)],2)},r=[];n.d(t,"a",(function(){return a})),n.d(t,"b",(function(){return r}))},e4a9:function(e,t,n){"use strict";n.r(t);var a=n("a855"),r=n.n(a);for(var i in a)"default"!==i&&function(e){n.d(t,e,(function(){return a[e]}))}(i);t["default"]=r.a},e829:function(e,t,n){"use strict";var a=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",{staticClass:"input-group"},[n("select",{directives:[{name:"model",rawName:"v-model",value:e.value,expression:"value"}],ref:"the_input",staticClass:"form-control",on:{change:[function(t){var n=Array.prototype.filter.call(t.target.options,(function(e){return e.selected})).map((function(e){var t="_value"in e?e._value:e.value;return t}));e.value=t.target.multiple?n:n[0]},e.update_value]}},[n("option",{attrs:{disabled:"",value:""}},[e._v("Select one")]),e._l(e.definition.options,(function(t){return n("option",{key:t,domProps:{value:t}},[e._v(e._s(t))])}))],2)])},r=[];n.d(t,"a",(function(){return a})),n.d(t,"b",(function(){return r}))},eb13:function(e,t,n){},ec7d:function(e,t,n){"use strict";var a=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",{staticClass:"input-group"},[n("input",{ref:"the_input",staticClass:"form-control",domProps:{value:e.value},on:{input:e.update_value}})])},r=[];n.d(t,"a",(function(){return a})),n.d(t,"b",(function(){return r}))},f3b2:function(e,t,n){},f7cb:function(e,t,n){"use strict";var a=n("3d97"),r=n.n(a);r.a},f972:function(e,t,n){"use strict";n.r(t);var a=n("a65e"),r=n("fd15");for(var i in r)"default"!==i&&function(e){n.d(t,e,(function(){return r[e]}))}(i);n("d52d");var o=n("2877"),u=Object(o["a"])(r["default"],a["a"],a["b"],!1,null,"3b907550",null);t["default"]=u.exports},fb57:function(e,t,n){"use strict";n("a9e3"),n("e25e"),Object.defineProperty(t,"__esModule",{value:!0});var a=n("9ab4"),r=a.__importDefault(n("2b0e"));t.default=r.default.extend({name:"Integer",props:{value:Number},methods:{update_value:function(e){this.$emit("input",parseInt(e.target.value))}}})},fceb:function(e,t,n){"use strict";n.r(t);var a=n("3fce"),r=n("e4a9");for(var i in r)"default"!==i&&function(e){n.d(t,e,(function(){return r[e]}))}(i);n("6328");var o=n("2877"),u=Object(o["a"])(r["default"],a["a"],a["b"],!1,null,"00be9438",null);t["default"]=u.exports},fd15:function(e,t,n){"use strict";n.r(t);var a=n("3383"),r=n.n(a);for(var i in a)"default"!==i&&function(e){n.d(t,e,(function(){return a[e]}))}(i);t["default"]=r.a},fd32:function(e,t,n){"use strict";var a=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",{staticClass:"record-result"},[n("span",{staticClass:"sheet",style:"background-color:"+e.result.sheet.hex_color},[e._v(e._s(e.result.sheet.name))]),e._v(" » "),e._l(e.result.sheet.record_values(e.result.record),(function(t,a){return n("span",{key:a,staticClass:"property",on:{click:function(t){return t.preventDefault(),e.$emit("focus-sheet-and-record",e.result.sheet._id,e.result.id)}}},[n("span",{staticClass:"key"},[e._v(e._s(a))]),n("span",{staticClass:"value"},[e._v(e._s(t))])])}))],2)},r=[];n.d(t,"a",(function(){return a})),n.d(t,"b",(function(){return r}))}});
//# sourceMappingURL=app.4c528c21.js.map