import _ from 'lodash'

import { DataObject } from './DataObject'
import { Record } from './Record'
import { Definition } from './Definition'

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

  public record_for_definition(definition : Definition) {
    return definition.type === 'reverse_references' ? this.source_record : this.record;
  }

  remove(): void {
    this.definition.sheet.database.clear_referencer_reference_references_cache()
    this.source_record.transform_value(this.definition, (references) => {
      return _.reject(references, (reference: Reference) => {
        return(
          reference.record._id === this.record._id &&
          _.isEqual(reference.data, this.data)
        )
      })
    })
  }
}

