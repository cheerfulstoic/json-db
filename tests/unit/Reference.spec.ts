var chai = require('chai');
var chai_match_pattern = require('chai-match-pattern');
chai.use(chai_match_pattern);

import * as db from '../../src/db';
import _ from 'lodash';

// const uuid_regex = /([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}){1}/

describe('db.Reference', () => {

  describe('remove', () => {
    it('removes just the correct reference', () => {
      let database = db.Database.from_saved({
        project_name: 'test',
        global_variables: {},
        sheets: {
          SheetName: {
            "_id": "sheet_id",
            name: "SheetName",
            hex_color: "#00AEDB",
            definitions: [
              {
                _id: 'the_refs', name: 'the_refs', type: 'references',
                definitions: [
                  { _id: 'the_sub_def_id', name: 'value', type: 'integer' },
                ],
              },
            ],
            definition_ids_to_display: ['the_refs', 'the_other_refs'],
            definition_names_referring_to_sheet_to_display: [],
            display_referencers: true,
          },
        },
        records: {
          SheetName: [
            {
              _id: 'ghi789',
              the_refs: [
                {record_id: 'other_rec', sheet_id: 'sheet_id', data: {value: 2} },
                {record_id: 'other_rec', sheet_id: 'sheet_id', data: {value: 3} },
                {record_id: 'yet_other_rec', sheet_id: 'sheet_id', data: {value: 2} },
              ],
            },
            { _id: 'other_rec', the_refs: [] },
            { _id: 'yet_other_rec', the_refs: [] },
          ],
        },
      })

      let sheet = database.sheets[0];
      let record = sheet.records[0];
      let definition = sheet.definitions[0];

      let references = record.value_for_definition(definition);

      let references_to_keep = [references[1]];
      references_to_keep.push(references[2])

      references[0].remove()

      chai.expect(record.value_for_definition(definition).length).to.equal(2)
      chai.expect(_.map(record.value_for_definition(definition), 'record.data._id'))
        .to.deep.equal(['other_rec', 'yet_other_rec'])
      chai.expect(_.map(record.value_for_definition(definition), `data.the_sub_def_id`))
        .to.deep.equal([3, 2])


    })
  })
})
