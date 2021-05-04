import _ from 'lodash'
import { v1 as uuid } from 'uuid'

import { Sheet } from './Sheet'

export class Definition {
  public _id: string
  public name: string
  public type: string
  public sub_type: string
  public unique_id: boolean
  public required: boolean
  public options?: string[]

  constructor(data: any) {
    this._id = data._id || uuid()
    this.name = data.name
    this.type = data.type
    if (this.type === 'integer') { this.type = 'number' }
    this.sub_type = data.sub_type || 'integer'
    this.unique_id = data.unique_id
    this.required = data.required
    this.options = data.options
  }

  public to_reference_definition() {
    return new ReferencesDefinition(this)
  }

  public json_data() {
    return _.pick(this, ['_id', 'name', 'type', 'sub_type', 'unique_id', 'required', 'options'])
  }
}

export class ReferencesDefinition extends Definition {
  public definitions: Definition[]
  public _referenceable_sheet_ids: string[]

  constructor(data: any) {
    super(data)

    this.definitions = _.map(data.definitions, (data) => new Definition(data)) || []
    this._referenceable_sheet_ids = data.referenceable_sheet_ids || []
  }

  references_sheet(sheet: Sheet) {
    return this.referenceable_sheet_ids.length === 0 || this.referenceable_sheet_ids.includes(sheet._id)
  }

  get referenceable_sheet_ids(): string[] {
    return this._referenceable_sheet_ids || []
  }
  set referenceable_sheet_ids(values: string[]) {
    this._referenceable_sheet_ids = values
  }

  public to_definition() {
    return new Definition(_.omit(this, ['definitions', '_referenceable_sheet_ids']))
  }

  public json_data() {
    return _.merge(super.json_data(), _.pick(this, ['referenceable_sheet_ids', 'definitions']))
  }
}

