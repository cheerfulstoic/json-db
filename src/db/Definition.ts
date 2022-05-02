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
  public rows?: number

  constructor(data: any, sheet: Sheet) {
    this._id = data._id || uuid()
    this.name = data.name
    this.type = data.type
    this.sub_type = data.sub_type;
    if (this.type === 'integer') { this.type = 'number' }

    if (this.type === 'number') { this.sub_type = this.sub_type || 'integer' }
    // Whoops!
    if (this.type !== 'number' && this.sub_type === 'integer') { this.sub_type = undefined }

    if (this.type === 'text_area') {
      this.sub_type = this.sub_type || 'plain'
      this.rows = 3;
    }

    this.unique_id = data.unique_id
    this.required = data.required
    this.options = data.options

    this.sheet = sheet;
  }

  public to_reference_definition() {
    return new ReferencesDefinition(this, this.sheet)
  }

  public json_data() {
    return _.pick(this, ['_id', 'name', 'type', 'sub_type', 'unique_id', 'required', 'rows', 'options'])
  }
}

export class ReferencesDefinition extends Definition {
  public definitions: Definition[]
  public _referenceable_sheet_ids: string[]

  constructor(data: any, sheet: Sheet) {
    super(data, sheet)

    this.definitions = _.map(data.definitions, (data) => new Definition(data, sheet)) || []
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
    return new Definition(_.omit(this, ['definitions', '_referenceable_sheet_ids']), this.sheet)
  }

  public json_data() {
    return(
      _(super.json_data())
        .set('referenceable_sheet_ids', this.referenceable_sheet_ids)
        .set('definitions', _.map(this.definitions, (definition) => definition.json_data()))
        .value()
    )
  }

  public reverse_definition(): db.ReferencesDefinition {
    return new db.ReferencesDefinition({
      _id: this._id,
      type: 'reverse_references',
      name: this.name,
      referenceable_sheet_ids: [this.sheet._id],
    })
  }
}

