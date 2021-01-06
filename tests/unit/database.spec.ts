var chai = require('chai');
var chai_match_pattern = require('chai-match-pattern');
chai.use(chai_match_pattern);

import * as db from '../../src/db';

import _ from 'lodash';

const uuid_regex = /([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}){1}/

//   constructor(name: string, id: string | null, hex_color: string | null, definitions: object[], record_data: object[]) {
//  constructor(sheets : Sheet[]) {
describe('db.Database', () => {
  describe('json_data', () => {
    it('works with an empty database', () => {
      let database = new db.Database('The name', {})

      chai.expect(database.json_data()).to.deep.equal({
        project_name: 'The name',
        global_variables: {},
        sheets: {},
        records: {},
      })
    })

    it('outputs expressions correctly', () => {
      let database = new db.Database('The name', { base_age: 18 })
      let sheet = new db.Sheet(database, 'just_an_expression', null, null, [
        { name: 'age', type: 'expression' },
      ], null, null, true, [
        { age: 30,
          _expressions: { age: 'base_age + 22' } }
      ])

      chai.expect(database.json_data()).to.matchPattern({
        project_name: 'The name',
        global_variables: { base_age: 18 },
        sheets: {
          just_an_expression: {
            _id: uuid_regex,
            name: 'just_an_expression',
            hex_color: /^#[0-9A-F]{6}$/,
            definition_ids_to_display: [ uuid_regex ],
            definition_ids_referring_to_sheet_to_display: [],
            display_referencers: true,
            definitions: [
              { _id: uuid_regex, name: 'age', type: 'expression' },
            ]
          }
        },
        records: {
          just_an_expression: [
            { _id: uuid_regex, age: 30, _expressions: { age: 'base_age + 22' } }
          ],
        },
      })
    })
  })

  describe('json_data', () => {
    it('works with an empty database', () => {
      let database = new db.Database('The name', {})

      chai.expect(database.referencer_reference_references()).to.deep.equal({})
    })

    it('works with an database with references', () => {
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
            definition_ids_to_display: ['def456', 'abc123'],
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
      let the_refs_definition = _.find(sheet.definitions, {name: 'the_refs'});
      let the_other_refs_definition = _.find(sheet.definitions, {name: 'the_other_refs'});
      let records_by_id = _.keyBy(sheet.records, '_id')

      chai.expect(database.referencer_reference_references()).to.deep.equal({
        abc123: {
          the_refs: [new db.Reference(records_by_id['abc123'], records_by_id['def456'], the_refs_definition, {})],
          the_other_refs: [new db.Reference(records_by_id['abc123'], records_by_id['ghi789'], the_other_refs_definition, {})],
        },
        def456: {
          the_refs: [new db.Reference(records_by_id['def456'], records_by_id['ghi789'], the_refs_definition, {})],
        },
      })
    })

  })
})

// export interface ReferenceQueryResult {
//   sheet: Sheet;
//   id: string;
//   record: any;
