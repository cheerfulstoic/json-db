import _ from 'lodash'
import Fuse from 'fuse.js'
import { Parser } from 'expr-eval'

import { v1 as uuid } from 'uuid'

export class Definition {
  public _id: string
  public name: string
  public type: string
  public unique_id: boolean
  public options?: string[]

  constructor(data: any) {
    this._id = data._id || uuid()
    this.name = data.name
    this.type = data.type
    this.unique_id = data.unique_id
    this.options = data.options
  }

  public to_reference_definition() {
    return new ReferencesDefinition(this)
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
}

export interface ReferencesDefinitionResult {
  sheet: Sheet
  definition: ReferencesDefinition
}

export interface ReferenceQueryResult {
  sheet: Sheet
  id: string
  record: any
}

export type ExpressionResult = [number | null, Error | null]

// DEPRECATED
export interface DeprecatedReference {
  sheet_id: string
  record_id: string
}

// Helper functions

// Adds an `_id` property to an object if it doesn't already exist
const add_id = (object: any): any => {
  if (object['_id']) {
    return object
  } else {
    return _.assign(object, { _id: uuid() })
  }
}

const data_ids_to_names = (data: any, definitions: Definition[]): any => {
  return _.reduce(
    definitions,
    (result: any, definition: Definition) => {
      return _.set(result, definition.name, data[definition._id])
    },
    {},
  )
}

const data_names_to_ids = (data: any, definitions: Definition[]): any => {
  return _.reduce(
    definitions,
    (result: any, definition: Definition) => {
      return _.set(result, definition._id, data[definition.name])
    },
    {},
  )
}

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
      .tap(add_id)
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

export type RecordsFilter = (records: Record[]) => Record[]

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

export class Sheet {
  public _id: string
  public name: string
  public hex_color: string
  public definitions: (Definition | ReferencesDefinition)[]
  public records_data: object[] // DEPRECATED
  public records: Record[]
  public definition_ids_to_display: string[]
  public definition_ids_referring_to_sheet_to_display: string[]
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
    definition_ids_referring_to_sheet_to_display: string[] | null,
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
    this.definition_ids_referring_to_sheet_to_display = definition_ids_referring_to_sheet_to_display || []
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
    // }).map(add_id).value();

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
    const definition = new Definition(add_id({ name: `Column #${number}`, type: 'string' }))
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

  public json_data() {
    return {
      _id: this._id,
      name: this.name,
      hex_color: this.hex_color,
      definitions: this.definitions,
      definition_ids_to_display: this.definition_ids_to_display,
      definition_ids_referring_to_sheet_to_display: this.definition_ids_referring_to_sheet_to_display,
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
      _.pull(sheet.definition_ids_referring_to_sheet_to_display, definition._id)
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

export class Database {
  public sheets: Sheet[]
  public global_variables: any
  public project_name: string

  constructor(project_name: string, global_variables: object) {
    this.sheets = []

    this.project_name = project_name

    this.global_variables = global_variables
  }

  public static from_saved(data: any): Database {
    const database = new Database(data.project_name, data.global_variables || {})

    database.sheets = _.map(data.sheets, (schema) => {
      return new Sheet(
        database,
        schema.name,
        schema._id,
        schema.hex_color,
        schema.definitions,
        schema.definition_ids_to_display,
        schema.definition_ids_referring_to_sheet_to_display,
        schema.display_referencers,
        data.records[schema.name],
      )
    })

    database.finalize_load()

    return database
  }

  private finalize_load(): void {
    _.each(this.sheets, (sheet: Sheet) => {
      _.each(sheet.records, (record: Record) => {
        const reference_definitions: ReferencesDefinition[] = _.filter(sheet.definitions, {
          type: 'references',
        }) as ReferencesDefinition[]

        _.each(reference_definitions, (definition: ReferencesDefinition) => {
          this.finalize_reference_record(record, definition)
        })

        const expression_definitions: Definition[] = _.filter(sheet.definitions, { type: 'expression' }) as Definition[]

        _.each(expression_definitions, (definition: Definition) => {
          this.finalize_expression_record(record, definition)
        })
      })
    })
  }

  private finalize_reference_record(record: Record, definition: ReferencesDefinition): void {
    record.transform_value(definition, (raw_references: any) => {
      return _.compact(
        _.map(raw_references || [], ({ sheet_id, record_id, data }) => {
          const referenced_sheet = record.sheet.database.find_sheet(sheet_id)

          if (referenced_sheet == undefined) {
            throw `Could not find sheet ID: ${sheet_id}`
          } else {
            const referenced_record = _.find(referenced_sheet.records, { _id: record_id })

            if (referenced_record == undefined) {
              // throw `Could not find record ID: ${record_id} for sheet ID: ${sheet_id}`
              return null // Ignore
            } else {
              return new Reference(
                referenced_record,
                record,
                definition,
                data_names_to_ids(data, definition.definitions),
              )
            }
          }
        }),
      )
    })
  }

  private finalize_expression_record(record: Record, definition: Definition): void {
    record.transform_value(definition, (expression_data: any) => {
      if (expression_data != null) {
        return expression_data.expression_string
      } else {
        return expression_data
      }
    })
  }

  public add_sheet(sheet: Sheet): void {
    this.sheets.push(sheet)
  }

  private description_types: string[] = ['string', 'text_area', 'select_one']

  public search(match_text: string, sheet_ids: Set<string>): Record[] {
    const search_keys = _(this.sheets)
      .flatMap((sheet) => {
        return sheet.definitions
      })
      .filter((definition) => {
        return this.description_types.includes(definition.type)
      })
      .map((definition) => {
        return `data.${definition._id}`
      })
      .value()

    let sheets: Sheet[] = this.sheets
    if (sheet_ids.size) {
      sheets = _.filter(sheets, (sheet) => {
        return sheet_ids.has(sheet._id)
      })
    }

    const search_data: any[] = _.flatMap(sheets, 'records')
    const fuse = new Fuse(search_data, {
      //shouldSort: true,
      // tokenize: true,
      // matchAllTokens: true,
      //minMatchCharLength: 2,
      keys: search_keys,
      threshold: 0.3,
    })

    return fuse.search(match_text)
  }

  // DEPRECATED!  Use .find_record
  public fetch_record_reference(reference: DeprecatedReference): ReferenceQueryResult | null {
    const sheet = _.find(this.sheets, (sheet: Sheet) => {
      return sheet._id === reference.sheet_id
    })

    if (!sheet) {
      return null
    }

    const result = sheet.find_by_id(reference.record_id)

    if (!result) {
      return null
    }

    return { sheet: sheet, id: reference.record_id, record: sheet.translate_record(result) }
  }

  public find_sheet(id: string): Sheet | undefined {
    return _.find(this.sheets, { _id: id })
  }

  public referencer_reference_references() {
    return _.mapValues(
      _.reduce(
        this.sheets,
        (result: any, sheet: Sheet) => {
          const references_definitions = _.filter(sheet.definitions, { type: 'references' })

          sheet.records.forEach((record: Record) => {
            references_definitions.forEach((definition) => {
              (record.value_for_definition(definition) || []).forEach((reference: Reference) => {
                const key = reference.record._id
                if (result[key] == null) {
                  result[key] = {}
                }
                if (result[key][definition._id] == null) {
                  result[key][definition._id] = []
                }

                result[key][definition._id].push(reference)
              })
            })
          })

          return result
        },
        {},
      ),
      (value) => {
        return _.mapValues(value, _.uniq)
      },
    )
  }

  public definitions_referring_to(given_sheet: Sheet): ReferencesDefinitionResult[] {
    return _.flatMap(this.sheets, (sheet: Sheet): ReferencesDefinitionResult[] => {
      return _(sheet.definitions)
        .filter((definition: any): boolean => {
          return !!definition.references_sheet && !!definition.references_sheet(given_sheet)
        })
        .map(
          (definition: any): ReferencesDefinitionResult => {
            return { sheet: sheet, definition: definition }
          },
        )
        .value()
    })
  }

  public json_data_bak() {
    const sheets_data = _.reduce(
      this.sheets,
      (result: any, sheet: Sheet) => {
        result[sheet.name] = sheet.json_data()
        return result
      },
      {},
    )

    const sheet_unique_ids = _.reduce(
      this.sheets,
      (result: any, sheet: Sheet) => {
        return _.set(result, sheet._id, _.find(sheet.definitions, { unique_id: true }))
      },
      {},
    )

    const records_data = _.reduce(
      this.sheets,
      (result: any, sheet: Sheet) => {
        const reference_definitions = _.filter(sheet.definitions, (definition: Definition) => {
          return definition.type == 'references'
        })

        result[sheet.name] = _.map(sheet.records, (record) => {
          return _.reduce(
            reference_definitions,
            (result: any, definition: Definition) => {
              const references = result[definition.name]

              if (references && references.length) {
                result[definition.name] = _.map(references, (reference) => {
                  const reference_result = this.fetch_record_reference(reference)
                  if (reference_result) {
                    reference = _.set(reference, 'sheet_name', reference_result.sheet.name)

                    const unique_id_definition: Definition = sheet_unique_ids[reference_result.sheet._id]
                    if (unique_id_definition) {
                      reference = _.set(
                        reference,
                        unique_id_definition.name,
                        reference_result.record[unique_id_definition.name],
                      )
                    }

                    return reference
                  }
                  return reference
                })
              }
              return result
            },
            record.values(),
          )
        })
        return result
      },
      {},
    )

    return {
      global_variables: this.global_variables,
      sheets: sheets_data,
      records: records_data,
    }
  }

  public json_data() {
    const sheets_data = _.reduce(
      this.sheets,
      (result: any, sheet: Sheet) => {
        result[sheet.name] = sheet.json_data()
        return result
      },
      {},
    )

    const sheet_unique_ids = _.reduce(
      this.sheets,
      (result: any, sheet: Sheet) => {
        return _.set(result, sheet._id, _.find(sheet.definitions, { unique_id: true }))
      },
      {},
    )

    const records_data = _.reduce(
      this.sheets,
      (result: any, sheet: Sheet) => {
        const reference_definitions: ReferencesDefinition[] = _.filter(sheet.definitions, (definition: Definition) => {
          return definition.type == 'references'
        }) as ReferencesDefinition[]

        const expression_definitions: Definition[] = _.filter(sheet.definitions, (definition: Definition) => {
          return definition.type == 'expression'
        }) as Definition[]

        result[sheet.name] = _.map(sheet.records, (record) => {
          let values = record.values()

          values = _.reduce(
            reference_definitions,
            (values_result: any, definition: ReferencesDefinition) => {
              const references = values_result[definition.name]

              if (references && references.length) {
                values_result[definition.name] = _.map(references, (reference) => {
                  const referenced_record = reference.record

                  const transformed_data = data_ids_to_names(reference.data, definition.definitions)
                  let reference_data = {
                    record_id: referenced_record._id,
                    sheet_id: referenced_record.sheet._id,
                    sheet_name: referenced_record.sheet.name,
                    data: transformed_data,
                  }

                  const unique_id_definition: Definition = sheet_unique_ids[referenced_record.sheet._id]
                  if (unique_id_definition) {
                    reference_data = _.set(
                      reference_data,
                      unique_id_definition.name,
                      referenced_record.value_for_definition(unique_id_definition),
                    )
                  }

                  return reference_data
                })
              }
              return values_result
            },
            values,
          )

          values = _.reduce(
            expression_definitions,
            (values_result: any, definition: Definition) => {
              const expression_result = this.evaluate_expression(values_result[definition.name])[0]

              if (expression_result) {
                values_result[definition.name] = {
                  expression_string: values_result[definition.name],
                  calculated_value: expression_result,
                }
              }
              return values_result
            },
            values,
          )

          return values
        })
        return result
      },
      {},
    )

    return {
      project_name: this.project_name,
      global_variables: this.global_variables,
      sheets: sheets_data,
      records: records_data,
    }
  }

  public evaluate_expression(expression_string: string): ExpressionResult {
    if (_.trim(expression_string) === '') {
      return [null, null]
    } else {
      let value, error
      const parser = new Parser()

      try {
        value = parser.evaluate(expression_string, this.global_variables)
        error = null
      } catch (err) {
        value = null
        error = err
      }

      return [value, error]
    }
  }
}
