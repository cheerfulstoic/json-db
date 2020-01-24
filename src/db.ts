import _ from 'lodash';
import Fuse from 'fuse.js';

const uuidv1 = require('uuid/v1');

export interface Definition {
  _id: string;
  name: string;
  type: string;
  unique_id: boolean;
  options?: string[];
}

export interface ReferenceQueryResult {
  sheet: Sheet;
  id: string;
  record: any;
}

export interface Reference {
  sheet_id: string;
  record_id: string;
}

// DEPRECATED
export interface NameReference {
  sheet: string;
  id: string;
}

export class Sheet {
  public _id: string;
  public name: string;
  public hex_color: string;
  public definitions: Definition[];
  public record_data: object[];
  public definition_ids_to_display : string[];

  private description_types : string[] = ['string', 'text_area', 'select_one'];

  static hex_colors = ['#D11141', '#00B159', '#00AEDB', '#F37735', '#FFC425'];
  static last_used_hex_color = -1;

  constructor(name: string,
              id: string | null,
              hex_color: string | null,
              definitions: object[],
              definition_ids_to_display: string[] | null,
              record_data: object[]) {
    this._id = id || uuidv1();
    this.name = name;
    this.definitions = _.map(definitions, this.add_id);

    this.definition_ids_to_display = definition_ids_to_display || _.map(definitions, '_id')

    Sheet.last_used_hex_color = Sheet.last_used_hex_color + 1;
    this.hex_color = hex_color || Sheet.hex_colors[Sheet.last_used_hex_color];

    let definitions_by_name = _.keyBy(this.definitions, 'name');

    this.record_data = _(record_data).map((record) => {
      return _.mapKeys(record, (_, name) => {
        if (name[0] === "_") { // like `_id` or `_expressions'
          return name
        } else {
          return definitions_by_name[name]._id;
        }
      })
    }).map(this.add_id).value();
  }

  public records () {
    return _.map(this.record_data, this.translate_record.bind(this))
  }

  public schema () {
    // TEMP!! (?)
    return this.definitions
  }

  public search (match_text : string) : ReferenceQueryResult[] {
    let ids = _(this.definitions).filter((definition) => {
      return(this.description_types.includes(definition.type))
    }).map((definition) => {
      return(definition._id)
    }).value()

    let fuse = new Fuse(this.record_data, {keys: ids})

    return _.map(fuse.search(match_text), (result : any) => {
      return { sheet: this, id: result._id, record: this.translate_record(result) }
    })
  }

  public find_by_id (id : string) {
    return _.find(this ? this.record_data : [], {_id: id})
  }

  public add_column () {
    let number = this.definitions.length + 1
    let definition = this.add_id({name: `Column #${number}`, type: 'string'})
    this.definitions.push(definition);
    this.definition_ids_to_display.push(definition._id);
  }

  public add_row (position : string) {
    if (position == 'top') {
      this.record_data.unshift(this.add_id({}));
    } else {
      this.record_data.push(this.add_id({}));
    }
  }

  public remove_row (id : string) {
    this.record_data = _.reject(this.record_data, (record : any) => {
      return(record._id === id);
    })
  }

  public translate_record(record : any) : any {
    let definitions_by_id = _.keyBy(this.definitions, '_id');

    return _.mapKeys(record, (_, key) => {
      if (key[0] === "_") { // like `_id` or `_expressions'
        return key
      } else {
        return definitions_by_id[key].name;
      }
    })
  }

  public record_values(translated_record : any) : any {
    let field = this.unique_id_field()
    let result : any = {};
    result[field] = translated_record[field];
    return result
  }

  public unique_id_field() : string {
    let definition = _(this.definitions).find({unique_id: true})

    return(definition ? definition.name : '_id')
  }

  public json_data () {
    return({
      _id: this._id,
      name: this.name,
      hex_color: this.hex_color,
      definitions: this.definitions,
      definition_ids_to_display: this.definition_ids_to_display,
    })
  }

  public delete_definition (definition_id : string) {
    let definition = this.find_definition(definition_id);

    this.record_data = this.record_data.map((record) => {
      return(_.omit(record, definition._id))
    })
    _.pull(this.definitions, definition)
  }

  public find_definition (definition_id : string) : Definition {
    let definition = _.find(this.definitions, {_id: definition_id});

    if (!definition) { throw `Unable to find definition: ${definition_id}` }

    return(definition)
  }

  // private
  private add_id (object : any) : any {
    if (object['_id']) {
      return(object);
    } else {
      return _.assign(object, {_id: uuidv1()})
    }
  }

}

export class Database {
  sheets: Sheet[];
  global_variables: any;

  constructor(sheets : Sheet[], global_variables : object) {
    this.sheets = sheets;
    this.global_variables = global_variables;
  }

  public add_sheet (sheet : Sheet) : void {
    this.sheets.push(sheet)
  }

  public search (match_text : string) : ReferenceQueryResult[] {
    return _.flatMap(this.sheets, (sheet : Sheet) => {
      return sheet.search(match_text)
    })
  }

  public fetch_record (reference : Reference) : ReferenceQueryResult | null {
    let sheet = _.find(this.sheets, (sheet : Sheet) => {
      return(sheet._id === reference.sheet_id)
    })

    if (!sheet) { return(null) }

    let result = sheet.find_by_id(reference.record_id)

    if (!result) { return(null) }

    return { sheet: sheet, id: reference.record_id, record: sheet.translate_record(result) }
  }

  public find_sheet (id : string) : Sheet | undefined {
    return _.find(this.sheets, {_id: id})
  }

  public referencers () {
    let output : any = {}

    this.sheets.forEach((sheet) => {
      let references_definitions = _.filter(sheet.definitions, (definition : Definition) => {
        return(definition.type == 'references')
      })

      sheet.record_data.forEach((record : any) => {
        references_definitions.forEach((definition) => {
          (record[definition._id] || []).forEach((reference : Reference) => {
            let result = this.fetch_record(reference);

            if (result) {
              let key = `${result.sheet._id}|${result.id}`;
              if (!output[key]) { output[key] = {} }
              if (!output[key][definition.name]) { output[key][definition.name] = [] }
              output[key][definition.name].push(this.fetch_record({sheet_id: sheet._id, record_id: record._id}));
            }
          })
        })
      })
    })

    return(output);
  }

  public json_data () {
    let sheets_data = _.reduce(this.sheets, (result : any, sheet : Sheet) => {
      result[sheet.name] = sheet.json_data()
      return(result);
    }, {})

    let sheet_unique_ids = _.reduce(this.sheets, (result : any, sheet : Sheet) => {
      return(_.set(result, sheet._id, _.find(sheet.definitions, {unique_id: true})))
    }, {})

    let records_data = _.reduce(this.sheets, (result : any, sheet : Sheet) => {
      let reference_definitions = _.filter(sheet.definitions, (definition : Definition) => {
        return(definition.type == 'references')
      })

      result[sheet.name] = _.map(sheet.records(), (record) => {
        return _.reduce(reference_definitions, (result : any, definition : Definition) => {
          let references = result[definition.name];

          if (references && references.length) {
            result[definition.name] = _.map(references, (reference) => {
              let reference_result = this.fetch_record(reference);
              if (reference_result) {
                reference = _.set(reference, 'sheet_name', reference_result.sheet.name)

                let unique_id_definition : Definition = sheet_unique_ids[reference_result.sheet._id]
                if (unique_id_definition) {
                  reference = _.set(reference, unique_id_definition.name, reference_result.record[unique_id_definition.name])
                }

                return(reference)
              }
              return(reference)
            })
          }
          return(result);
        }, record)
      })
      return(result);
    }, {})

    return({
      global_variables: this.global_variables,
      sheets: sheets_data,
      records: records_data,
    })
  }
}


