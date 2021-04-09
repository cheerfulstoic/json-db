import _ from 'lodash'
import { v1 as uuid } from 'uuid'
import * as helpers from './helpers'

import { Database } from './Database.ts'
import { Definition, ReferencesDefinition } from './Definition'
import { Record } from './Record.ts'

export class Sheet {
  public _id: string
  public name: string
  public hex_color: string
  public definitions: (Definition | ReferencesDefinition)[]
  public records_data: object[] // DEPRECATED
  public records: Record[]
  public definition_ids_to_display: string[]
  public definition_names_referring_to_sheet_to_display: string[]
  public display_referencers: boolean

  static hex_colors = ['#D11141', '#00B159', '#00AEDB', '#F37735', '#FFC425']
  static last_used_hex_color = -1

  // Caches
  public definitions_by_id: any
  public definitions_by_name: any

  public database: Database

  constructor(
    database: Database,
    name: string,
    id: string | null,
    hex_color: string | null,
    definitions: object[],
    definition_ids_to_display: string[] | null,
    definition_names_referring_to_sheet_to_display: string[] | null,
    display_referencers: boolean,
    records_data: object[],
  ) {
    this.database = database
    this.database.add_sheet(this)

    this._id = id || uuid()
    this.name = name

    this.definitions = _.map(definitions, (definition_data: any) => {
      if (definition_data.type === 'references') {
        return new ReferencesDefinition(definition_data)
      } else {
        return new Definition(definition_data)
      }
    })

    this.update_definition_caches()

    this.definition_ids_to_display = definition_ids_to_display || _.map(this.definitions, '_id')
    this.definition_names_referring_to_sheet_to_display = definition_names_referring_to_sheet_to_display || []
    this.display_referencers = display_referencers == null ? true : display_referencers

    Sheet.last_used_hex_color = Sheet.last_used_hex_color + 1
    this.hex_color = hex_color || Sheet.hex_colors[Sheet.last_used_hex_color]

    this.records_data = [] // TODO: Remove
    // this.records_data = _(records_data).map((record) => {
    //   return _.mapKeys(record, (_, name) => {
    //     if (name[0] === "_") { // like `_id` or `_expressions'
    //       return name
    //     } else {
    //       return this.definitions_by_name[name]._id;
    //     }
    //   })
    // }).map(helpers.add_id).value();

    this.records = _.map(
      records_data,
      (record_data: object): Record => {
        return new Record(record_data, this)
      },
    )
  }

  public schema() {
    // TEMP!! (?)
    return this.definitions
  }

  // DEPRECATED
  public find_by_id(id: string): any | undefined {
    return _.find(this ? this.records_data : [], { _id: id })
  }

  public add_definition() {
    const number = this.definitions.length + 1
    const definition = new Definition(helpers.add_id({ name: `Column #${number}`, type: 'string' }))
    this.definitions.push(definition)
    this.update_definition_caches()
    this.definition_ids_to_display.push(definition._id)
  }

  private update_definition_caches() {
    this.definitions_by_id = _.keyBy(this.definitions, '_id')
    this.definitions_by_name = _.keyBy(this.definitions, 'name')
  }

  public add_row(position: string) {
    const record = new Record({}, this)

    // Go through and assign each value
    // to make sure reactivity works
    _.each(this.definitions, (definition) => {
      record.update_value(definition, null)
    })
    if (position == 'top') {
      this.records.splice(0, 0, record)
    } else {
      this.records.splice(this.records.length, 1, record)
    }

    return record
  }

  public remove_row(id: string) {
    this.records = _.reject(this.records, (record: Record) => {
      return record._id === id
    })

    let references = this.database.referencer_reference_references();

    if (references[id] != null) {
      _.each(references[id], (references, definition_id) => {
        _.invokeMap(references, 'remove')
      })
    }
  }

  // DEPRECATED!  Use Record.values()
  public translate_record(record: any): any {
    const definitions_by_id = _.keyBy(this.definitions, '_id')

    return _.mapKeys(record, (_, key) => {
      if (key[0] === '_') {
        // like `_id` or `_expressions'
        return key
      } else {
        return definitions_by_id[key].name
      }
    })
  }

  // DEPRECATED!  Use Record.description_data()
  public record_values(translated_record: any): any {
    const field = this.unique_id_field()
    const result: any = {}
    result[field] = translated_record[field]
    return result
  }

  public unique_id_field(): string {
    const definition = _(this.definitions).find({ unique_id: true })

    return definition ? definition.name : '_id'
  }

  public duplicate_records_for(definition : Definition): Record[] {
    let values = new Set();
    let result = new Record();

    this.records.forEach(record => {
      let value = record.value_for_definition(definition);
      if (values.has(value)) {
        result.push(record);
      } else {
        values.add(value);
      }
    })

    return result;
  }

  public json_data() {
    return {
      _id: this._id,
      name: this.name,
      hex_color: this.hex_color,
      definitions: this.definitions.map((def) => def.json_data()),
      definition_ids_to_display: this.definition_ids_to_display,
      definition_names_referring_to_sheet_to_display: this.definition_names_referring_to_sheet_to_display,
      display_referencers: this.display_referencers,
    }
  }

  public delete_definition(definition_id: string) {
    const definition = this.find_definition(definition_id)

    // this.records_data = this.records_data.map((record) => {
    //   return(_.omit(record, definition._id))
    // })
    _.each(this.records, (record) => {
      record.delete_definition(definition)
    })
    // this.definition_ids_to_display.delete(definition._id);
    _.pull(this.definition_ids_to_display, [definition._id])
    // Ugly?
    this.database.sheets.forEach((sheet: Sheet) => {
      _.pull(sheet.definition_names_referring_to_sheet_to_display, definition.name)
    })
    _.pull(this.definitions, definition)
  }

  public delete_sub_definition(definition: ReferencesDefinition, sub_definition: Definition) {
    _.each(this.records, (record) => {
      record.delete_sub_definition(definition, sub_definition)
    })
    _.set(definition, 'definitions', _.without(definition.definitions, sub_definition))
  }

  public find_definition(definition_id: string): Definition {
    const definition = _.find(this.definitions, { _id: definition_id })

    if (!definition) {
      throw `Unable to find definition: ${definition_id}`
    }

    return definition
  }

  public replace_definition(id: string, definition: Definition): void {
    const index = _.findIndex(this.definitions, { _id: id })

    this.definitions[index] = definition
  }

  public transform_values(definition_id: string, old_value: any, new_value: any) {
    return (this.records_data = this.records_data.map((record: any) => {
      if (record[definition_id] === old_value) {
        return _.set(record, definition_id, new_value)
      } else {
        return record
      }
    }))
  }
}
