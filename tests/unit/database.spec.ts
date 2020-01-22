var chai = require('chai');
var chai_match_pattern = require('chai-match-pattern');
chai.use(chai_match_pattern);

import * as db from '../../src/db';

const uuid_regex = /([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}){1}/

//   constructor(name: string, id: string | null, hex_color: string | null, definitions: object[], record_data: object[]) {
//  constructor(sheets : Sheet[]) {
describe('db.Database', () => {
  it('works with an empty database', () => {
    let sheet = new db.Sheet('empty', null, null, [], [])
    let database = new db.Database([], {})
    chai.expect(database.json_data()).to.deep.equal({
      global_variables: {},
      sheets: {},
      records: {},
    })
  })

  it('outputs expressions correctly', () => {
    let sheet = new db.Sheet('just_an_expression', null, null, [
      { name: 'age', type: 'expression' },
    ], [
      { age: 30,
        _expressions: { age: 'base_age + 22' } }
    ])
    let database = new db.Database([sheet], { base_age: 18 })

    chai.expect(database.json_data()).to.matchPattern({
      global_variables: { base_age: 18 },
      sheets: {
        just_an_expression: {
          _id: uuid_regex,
          name: 'just_an_expression',
          hex_color: /^#[0-9A-F]{6}$/,
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

