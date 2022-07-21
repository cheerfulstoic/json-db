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
  public view_mode: number

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

    this.view_mode = data.view_mode

    this.unique_id = data.unique_id
    this.required = data.required
    this.options = data.options

    this.sheet = sheet;
  }

  public to_reference_definition() {
    return new ReferencesDefinition(this, this.sheet)
  }

  public json_data() {
    return _.pick(this, ['_id', 'name', 'type', 'sub_type', 'view_mode', 'unique_id', 'required', 'rows', 'options'])
  }
}

export class ReferencesDefinition extends Definition {
  public definitions: Definition[]
  public _referenceable_sheet_ids: string[]
  public source_definitions: Definition[];

  constructor(data: any, sheet: Sheet) {
    super(data, sheet)

    this.definitions = _.map(data.definitions, (data) => new Definition(data, sheet)) || []
    this._referenceable_sheet_ids = data.referenceable_sheet_ids || []

    this.source_definitions = data.source_definitions;
    if (this.source_definitions) {
      this.definitions = _.flatMap(this.source_definitions, 'definitions');
    }
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

  public add_reference(source_record, record) {
    if (this.type === 'reverse_references') {
      this.source_definitions.forEach((source_definition) => {
        if (source_record.sheet._id === source_definition.sheet._id) {
          source_record.add_reference(source_definition, record);
        }
      })
    } else {
      // TODO
    }
  }

  public static for(definitions, sheet): ReferencesDefinition {
    return new ReferencesDefinition({
      _id: `${definitionsId(definitions)}_reversed`,
      type: 'reverse_references',
      name: definitions[0].name,
      referenceable_sheet_ids: _.map(definitions, 'sheet._id'),
      source_definitions: definitions,
    }, sheet)
  }
}

function definitionsId(definitions) {
  return _(definitions).map('_id').sort().join('|')
}
