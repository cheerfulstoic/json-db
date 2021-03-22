import _ from 'lodash'

import { DataObject } from './DataObject'
import { Record } from './Record'

export class Reference extends DataObject {
  public record: Record
  public source_record: Record
  public definition: ReferencesDefinition

  constructor(record: Record, source_record: Record, definition: ReferencesDefinition, data: any) {
    super(data)

    this.record = record
    this.source_record = source_record
    this.definition = definition
  }

  remove(): void {
    this.source_record.transform_value(this.definition, (value) => {
      return _.reject(value, (reference: Reference) => {
        return reference.record._id == this.record._id
      })
    })
  }
}

