var chai = require('chai');
var chai_match_pattern = require('chai-match-pattern');
chai.use(chai_match_pattern);

import * as db from '../../src/db';
import _ from 'lodash';

const uuid_regex = /([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}){1}/

describe('db.Sheet', () => {

  describe('remove_column', () => {
    it('removes the sheet and record data', () => {
      let sheet = new db.Sheet('a_few_values', null, null, [
        { _id: 'abc123', name: 'name', type: 'string' },
        { name: 'age', type: 'integer' },
      ], null, [
        { name: 'Caravan', age: 32 },
        { name: 'Palace', age: 35 },
      ])

      sheet.delete_definition('abc123');

      chai.expect(sheet.json_data()).to.matchPattern({
        _id: uuid_regex,
        name: 'a_few_values',
        hex_color: /^#[0-9A-F]{6}$/,
        definition_ids_to_display: [ 'abc123', uuid_regex ],
        definitions: [
          { _id: uuid_regex, name: 'age', type: 'integer' },
        ]
      })

      chai.expect(sheet.records()).to.matchPattern([
        { _id: uuid_regex, age: 32 },
        { _id: uuid_regex, age: 35 },
      ])
    })
  })
})
