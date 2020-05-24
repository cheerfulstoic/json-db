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
      let database = new db.Database({})

      chai.expect(database.json_data()).to.deep.equal({
        global_variables: {},
        sheets: {},
        records: {},
      })
    })

    it('outputs expressions correctly', () => {
      let database = new db.Database({ base_age: 18 })
      let sheet = new db.Sheet(database, 'just_an_expression', null, null, [
        { name: 'age', type: 'expression' },
      ], null, true, [
        { age: 30,
          _expressions: { age: 'base_age + 22' } }
      ])

      chai.expect(database.json_data()).to.matchPattern({
        global_variables: { base_age: 18 },
        sheets: {
          just_an_expression: {
            _id: uuid_regex,
            name: 'just_an_expression',
            hex_color: /^#[0-9A-F]{6}$/,
            definition_ids_to_display: [ uuid_regex ],
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
      let database = new db.Database({})

      chai.expect(database.referencer_references()).to.deep.equal({})
    })

    it('works with an database with references', () => {
      let database = new db.Database({})
      let sheet = new db.Sheet(database, 'references', 'sheet_id', null, [
        { _id: 'the_refs_id', name: 'the_refs', type: 'references' },
        { _id: 'the_other_refs_id', name: 'the_other_refs', type: 'references' },
      ], null, true, [
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
      ])
      let records_by_id = _.keyBy(sheet.records, '_id')

      chai.expect(database.referencer_references()).to.deep.equal({
        'sheet_id|abc123': {
          the_refs: [{ sheet: sheet, id: 'def456', record: records_by_id['def456'] }],
          the_other_refs: [{ sheet: sheet, id: 'ghi789', record: records_by_id['ghi789'] }],
        },
        'sheet_id|def456': {
          the_refs: [
            { sheet: sheet, id: 'ghi789', record: records_by_id['ghi789'] },
          ]
        },
      })
    })

  })
})

// export interface ReferenceQueryResult {
//   sheet: Sheet;
//   id: string;
//   record: any;
