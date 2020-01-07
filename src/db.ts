import _ from 'lodash';
import Fuse from 'fuse.js';

export interface Definition {
  id: string;
  name: string;
  type: string;
  options?: string[];
}

export interface ReferenceQueryResult {
  sheet: string;
  id: string;
  description_data: object;
}

export class Sheet {
  name: string;
  schema_data: Definition[];
  record_data: object[];

  constructor(name: string, schema_data: object[], record_data: object[]) {
    this.name = name;
    this.schema_data = _.map(schema_data, this.add_id);

    let definitions_by_name = _.keyBy(this.schema_data, 'name')

    this.record_data = _.map(record_data, (record) => {
      return _.mapKeys(record, (_, name) => {
        return definitions_by_name[name].id;
      })
    })
  }

  records () {
    let definitions_by_id = _.keyBy(this.schema_data, 'id')

    return _.map(this.record_data, (record) => {
      return _.mapKeys(record, (_, key) => {
        if (key === 'id') {
          return 'id'
        } else {
          return definitions_by_id[key].name;
        }
      })
    })
  }

  schema () {
    // TEMP!! (?)
    return this.schema_data
  }

  search (match_text : string) : ReferenceQueryResult[] {
    let names = _(this.schema_data).filter((definition) => {
      return(['string', 'text_area', 'select_one'].includes(definition.type))
    }).map((definition) => {
      return(definition.name)
    }).value()

    let definitions_by_id = _.keyBy(this.schema, 'id')

    let fuse = new Fuse(this.records(), {keys: names})

    return _.map(fuse.search(match_text), (result : any) => {
      return { sheet: this.name, id: result.id, description_data: _.pick(result, names) }
    })
  }

  add_column () {
    this.schema_data.push(this.add_id({name: '', type: 'string'}))
  }

  add_row () {
    this.record_data.push({})
  }

  json_data () {
    // TEMP!!  Need to include schema in json_data
    this.records()
  }

  // private
  add_id (object : any) : any {
    return _.assign(object, {id: `id_${new Date().getTime()}`})
  }
}

export class Database {
  sheets: Sheet[];

  constructor(sheets : Sheet[]) {
    this.sheets = sheets;
  }

  search (match_text : string) : ReferenceQueryResult[] {
    return _.flatMap(this.sheets, (sheet : Sheet) => {
      return sheet.search(match_text)
    })
  }

  fetch_record (sheet_name : string, record_id : string) {
    let sheet = _.find(this.sheets, (sheet : Sheet) => {
      return(sheet.name === sheet_name)
    })
    if (sheet === undefined) { debugger }

    return _.find(sheet ? sheet.records() : [], (record : any) => {
      return(record.id === record_id)
    })
  }

  json_data () {
    return _.map(this.sheets, (sheet : Sheet) => {
      return(sheet.json_data())
    })
  }
}


