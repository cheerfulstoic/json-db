import _ from 'lodash'
import * as helpers from './helpers'

import { DataObject } from './DataObject'
import { Definition, ReferencesDefinition } from './Definition'
import { Sheet } from './Sheet'
import { Reference } from './Reference'

// The `Record` class is coupled with the Sheet class because it needs to see the definitions
export class Record extends DataObject {
  public sheet: Sheet

  constructor(record_data: object, sheet: Sheet) {
    super(record_data)

    this.data = _(record_data)
      .mapKeys((_, name) => {
        if (name[0] === '_') {
          // like `_id` or `_expressions'
          return name
        } else {
          return sheet.definitions_by_name[name]._id
        }
      })
      .tap(helpers.add_id)
      .value()

    this.sheet = sheet
  }

  public get _id() {
    return this.data._id
  }

  public values(): any {
    return _.mapKeys(this.data, (_, key) => {
      if (key[0] === '_') {
        // like `_id` or `_expressions'
        return key
      } else {
        return this.sheet.definitions_by_id[key].name
      }
    })
  }

  public delete_definition(definition: Definition): void {
    _.set(this, 'data', _.omit(this.data, definition._id))
  }

  public delete_sub_definition(definition: ReferencesDefinition, sub_definition: Definition): void {
    this.transform_value(definition, (values) => {
      return _.map(values, (value) => {
        return _.set(value, 'data', _.omit(value.data, sub_definition._id))
      })
    })
  }

  public add_reference(definition, target_record) {
    this.transform_value(definition, (references) => {
      let new_reference = new Reference(target_record, this, definition, {})
      if (references == null) {
        references = []
      }
      references.splice(references.length, 1, new_reference)
      return references
    })
    this.sheet.database.clear_referencer_reference_references_cache();
  }

  public transform_value(definition: Definition, transform_fn: (value: any) => any): void {
    _.set(this, ['data', definition._id], transform_fn(this.data[definition._id]))
  }

  // Returns a POJO with keys / values which uniquely describe the object
  public description_data(): any {
    const field = this.sheet.unique_id_field()
    // Currently we just return one field
    const result: any = {}
    result[field] = this.values()[field]
    return result
  }
}

