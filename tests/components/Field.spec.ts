var chai = require('chai');
var chai_match_pattern = require('chai-match-pattern');
chai.use(chai_match_pattern);

import { mount } from '@vue/test-utils'
import Field from '../../src/components/Field.vue'
import * as db from '../../src/db';
import _ from 'lodash'

import { v1 as uuid } from 'uuid'

describe('Field', () => {
  it('Renders string fields', () => {
    let database = db.Database.from_saved({
      sheets: {
        SheetName: {
          name: "SheetName",
          definitions: [ { name: 'Name', type: 'string' }, ],
        },
      },
      records: { SheetName: [ { Name: 'Silly' } ], },
    })

    let sheet = database.sheets[0];

    const wrapper = mount(Field, {
      props: {
        record: sheet.records[0],
        definition: sheet.definitions[0],
        database: database,
      }
    })

    expect(wrapper.find('input').element.type).toEqual('text')
    expect(wrapper.find('input').element.value).toEqual('Silly')
  })

  it('Renders text area fields', () => {
    let database = db.Database.from_saved({
      sheets: {
        SheetName: {
          name: "SheetName",
          definitions: [ { name: 'Name', type: 'text_area' }, ],
        },
      },
      records: { SheetName: [ { Name: 'something really long and such' } ], },
    })

    let sheet = database.sheets[0];

    const wrapper = mount(Field, {
      props: {
        record: sheet.records[0],
        definition: sheet.definitions[0],
        database: database,
      }
    })

    expect(wrapper.find('textarea').element.value).toEqual('something really long and such')
  })

  it('Renders integer fields', () => {
    let database = db.Database.from_saved({
      sheets: {
        SheetName: {
          name: "SheetName",
          definitions: [ { name: 'Name', type: 'integer' }, ],
        },
      },
      records: { SheetName: [ { Name: 43 } ], },
    })

    let sheet = database.sheets[0];

    const wrapper = mount(Field, {
      props: {
        record: sheet.records[0],
        definition: sheet.definitions[0],
        database: database,
      }
    })

    expect(wrapper.find('input').element.type).toEqual('number')
    expect(wrapper.find('input').element.value).toEqual('43')
  })

  it('Renders select_one fields', () => {
    let database = db.Database.from_saved({
      sheets: {
        SheetName: {
          name: "SheetName",
          definitions: [ { name: 'Name', type: 'select_one', options: ['Foo', 'Bar'] }, ],
        },
      },
      records: { SheetName: [ { Name: 'Bar' } ], },
    })

    let sheet = database.sheets[0];

    const wrapper = mount(Field, {
      props: {
        record: sheet.records[0],
        definition: sheet.definitions[0],
        database: database,
      }
    })

    expect(_.map(wrapper.findAll('select option'), 'element.value')).toEqual(['', 'Foo', 'Bar'])
    expect(_.map(wrapper.findAll('select option'), 'element.text')).toEqual(['Select one', 'Foo', 'Bar'])
    expect(_.map(wrapper.findAll('select option'), 'element.selected')).toEqual([false, false, true])
  })

  // Integration test between Field and References components
  it('Renders references fields', () => {
    let database = db.Database.from_saved({
      sheets: {
        SheetName: {
          _id: 'sheet_id',
          name: "SheetName",
          definitions: [ { name: 'RefField', type: 'references' }, ],
        },
      },
      records: { SheetName: [ { Name: 'Bar' } ], },
      records: {
        SheetName: [
          { _id: 'abc123', RefField: [] },
          { _id: 'def456', RefField: [{record_id: 'abc123', sheet_id: 'sheet_id'}] },
        ],
      },
    })

    let sheet = database.sheets[0];
    // console.log( {
    //     record: sheet.records[1],
    //     definition: sheet.definitions[0],
    //     database: database,
    //   })
    let wrapper = mount(Field, {
      props: {
        record: sheet.records[1],
        definition: sheet.definitions[0],
        database: database,
      }
    })

    let reference_elements = wrapper.findAll('.referenced-records')
    expect(reference_elements.length).toBe(1)
    expect(wrapper.find('.referenced-record').text()).toBe('abc123')
  })
})
