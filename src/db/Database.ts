import _ from 'lodash'
import { Parser } from 'expr-eval'
import Fuse from 'fuse.js'
import * as helpers from './helpers'

import { Definition, ReferencesDefinition } from './Definition'
import { Record } from './Record'
import { Reference } from './Reference'
import { Sheet } from './Sheet'

// DEPRECATED
export interface DeprecatedReference {
  sheet_id: string
  record_id: string
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
        schema.definition_names_referring_to_sheet_to_display,
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
              const expression_definitions: Definition[] = _.filter(definition.definitions, { type: 'expression' }) as Definition[]

              data = _.reduce(expression_definitions, (result : object, definition: Definition) : object => {
                return _.set(result, definition.name, this.finalize_expression_data(result[definition.name]))
              }, data)

              return new Reference(
                referenced_record,
                record,
                definition,
                helpers.data_names_to_ids(data, definition.definitions),
              )
            }
          }
        }),
      )
    })
  }

  private finalize_expression_record(record: Record, definition: Definition): void {
    record.transform_value(definition, (expression_data: any) => {
      return this.finalize_expression_data(expression_data)
    })
  }
  private finalize_expression_data(expression_data: object): object {
    if (expression_data != null) {
      return expression_data.expression_string
    } else {
      return expression_data
    }
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
    if (this.referencer_reference_references_cache == null) {
      this.referencer_reference_references_cache = this.calculate_referencer_reference_references();
    }

    return this.referencer_reference_references_cache;
  }

  public clear_referencer_reference_references_cache() {
    delete this.referencer_reference_references_cache;
  }

  private calculate_referencer_reference_references() {
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

  public definitions_referring_to(given_sheet: Sheet): Definition[] {
    return _.flatMap(this.sheets, (sheet: Sheet): Definition[] => {
      return sheet.definitions
        .filter((definition: any): boolean => {
          return !!definition.references_sheet && !!definition.references_sheet(given_sheet)
        })
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

        const expression_definitions: Definition[] = _.filter(sheet.definitions, {type: 'expression'})

        result[sheet.name] = _.map(sheet.records, (record) => {
          let values = record.values()

          values = _.reduce(
            reference_definitions,
            (values_result: any, definition: ReferencesDefinition) => {
              const references = values_result[definition.name]

              const definition_expression_definitions: Definition[] = _.filter(definition.definitions, {type: 'expression'});

              if (references && references.length) {
                values_result[definition.name] = _.map(references, (reference) => {
                  const referenced_record = reference.record

                  let transformed_data = helpers.data_ids_to_names(reference.data, definition.definitions)
                  transformed_data = this.set_expression_data(definition_expression_definitions, transformed_data)

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

          values = this.set_expression_data(expression_definitions, values)

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

  private set_expression_data(expression_definitions: Definition[], values: object): object {
    return _.reduce(
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
