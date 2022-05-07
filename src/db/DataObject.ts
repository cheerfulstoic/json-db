import _ from 'lodash'

import { Database } from './Database'
import { Definition } from './Definition'

export class DataObject {
  public data: any

  constructor(record_data: object) {
    this.data = record_data
  }

  public value_for_definition(definition: Definition): any {
    if (definition.type === 'reverse_references') {
      return _.get(definition.sheet.database.referencer_reference_references(), [this._id, definition.originalReferenceId]) || [];
    } else {
      return this.data[definition._id]
    }
  }

  public is_blank_for_definition(definition : Definition): boolean {
    let value = this.value_for_definition(definition);

    if ( value == null ) { return(true) }
    switch ( definition.type ) {
      case 'string':
      case 'text_area':
        return(value.trim() === '');
      case 'references':
        return(value.length === 0);
      case 'expression':
        return(value.trim() === '');
    }

    return(false);
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

