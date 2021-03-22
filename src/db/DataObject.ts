import _ from 'lodash'

import { Database } from './Database'
import { Definition } from './Definition'

export class DataObject {
  public data: any

  constructor(record_data: object) {
    this.data = record_data
  }

  public value_for_definition(definition: Definition): any {
    return this.data[definition._id]
  }

  public sort_value_for_definition(definition: Definition, database: Database): any {
    if (definition.type == 'expression') {
      const value = database.evaluate_expression(this.data[definition._id])[0]
      return value == null ? null : parseFloat(`${value}`)
    } else {
      return this.value_for_definition(definition)
    }
  }

  public update_value(definition: Definition, value: any): void {
    _.set(this.data, definition._id, value)
  }

  public empty() {}
}

