var chai = require('chai');
var chai_match_pattern = require('chai-match-pattern');
chai.use(chai_match_pattern);

import * as db from '../../src/db';
import _ from 'lodash';

const uuid_regex = /([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}){1}/

describe('db.Sheet', () => {

  describe('remove_column', () => {
    it('removes the sheet and record data', () => {
      let database = new db.Database('The name', {})
      let sheet = new db.Sheet(database, 'a_few_values', null, null, [
        { _id: 'abc123', name: 'name', type: 'string' },
        { name: 'age', type: 'integer' },
      ], null, null, true, [
        { name: 'Caravan', age: 32 },
        { name: 'Palace', age: 35 },
      ])

      sheet.delete_definition('abc123');

      chai.expect(sheet.json_data()).to.matchPattern({
        _id: uuid_regex,
        name: 'a_few_values',
        hex_color: /^#[0-9A-F]{6}$/,
        definition_ids_to_display: [ 'abc123', uuid_regex ],
        definition_ids_referring_to_sheet_to_display: [],
        display_referencers: true,
        definitions: [
          { _id: uuid_regex, name: 'age', type: 'integer' },
        ]
      })

      chai.expect(_.invokeMap(sheet.records, 'values')).to.matchPattern([
        { _id: uuid_regex, age: 32 },
        { _id: uuid_regex, age: 35 },
      ])
    })
  })

  describe('remove_row', () => {
    it('removes the row and any references to it', () => {
      let database = db.Database.from_saved({
        project_name: 'test',
        global_variables: {},
        sheets: {
          SheetName: {
            "_id": "sheet_id",
            name: "SheetName",
            hex_color: "#00AEDB",
            definitions: [
              { _id: 'the_refs', name: 'the_refs', type: 'references' },
              { _id: 'the_other_refs', name: 'the_other_refs', type: 'references' },
            ],
            definition_ids_to_display: ['the_refs', 'the_other_refs'],
            definition_ids_referring_to_sheet_to_display: [],
            display_referencers: true,
          },
        },
        records: {
          SheetName: [
            { _id: 'abc123', the_refs: [] },
            { _id: 'def456', the_refs: [{record_id: 'abc123', sheet_id: 'sheet_id'}] },
            {
              _id: 'ghi789',
              the_refs: [
                {record_id: 'def456', sheet_id: 'sheet_id'},
              ],
              the_other_refs: [
                {record_id: 'abc123', sheet_id: 'sheet_id'}
              ]
            },
          ],
        },
      })

      let sheet = database.sheets[0];
      sheet.remove_row('abc123');

      let json_data = database.json_data();
      chai.expect(json_data.sheets.SheetName).to.matchPattern({
        _id: 'sheet_id',
        name: 'SheetName',
        hex_color: /^#[0-9A-F]{6}$/,
        definition_ids_to_display: [ 'the_refs', 'the_other_refs' ],
        definition_ids_referring_to_sheet_to_display: [],
        display_referencers: true,
        definitions: [
          { _id: 'the_refs', name: 'the_refs', type: 'references', definitions: [], _referenceable_sheet_ids: []  },
          { _id: 'the_other_refs', name: 'the_other_refs', type: 'references', definitions: [], _referenceable_sheet_ids: [] },
        ]
      })

      chai.expect(json_data.records.SheetName).to.matchPattern([
        {
          _id: 'def456',
          the_refs: [],
          the_other_refs: [],
        },
        {
          _id: 'ghi789',
          the_refs: [
            {record_id: 'def456', sheet_id: 'sheet_id', sheet_name: 'SheetName', data: {}},
          ],
          the_other_refs: [ ],
        },
      ])
    })
  })
})
