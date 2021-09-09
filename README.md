# json-db

## Purpose

The JSON DB project is designed as an easy-to-use interface for configuration files.  It was inspired by [CastleDB](http://castledb.org/) but JSON DB is designed to be much easier to setup and use.

The JSON standard is limited to (aside from objects and arrays) strings, numbers, and booleans.  The JSON DB defines a schema in a JSON file which allows you to have:

* Unique IDs
* Select One (multi choice)
* References to other records (e.g. foreign keys)
* Numeric expressions based on variables

You can try it out [here](http://blog.brian-underwood.codes/json-db/dist/)

## File Format

The file format of JSON DB is designed to be simple to use from any language that can read a JSON file.

JSON DB creates files with extension of `.db.json` which looks like:

```json
{
  "sheets": {
    "Sheet Name": {
      "_id": "c5af89b0-3831-11ea-a178-1d815a833476",
      "name": "Sheet Name",
      "hex_color": "#00AEDB",
      "definitions": [
        {
          "_id": "1128d3b0-3832-11ea-a178-1d815a833476",
          "name": "Label",
          "type": "string",
          "unique_id": true
        },
        {
          "_id": "acf7b110-5a0d-11ea-a879-534818663e3d",
          "name": "Set Releasable On",
          "type": "expression"
        },
        ...
      ],
    },
    ...
  },
  "records": {
    "Sheet Name": [
      {
        "_id": "34bde080-586d-11ea-86de-b9c0a083be4d",
        "Label": "A Unique Label",
        "Set Releasable On": {
          "expression_string": "AnImportantVariable * 2",
          "calculated_value": "14"
        },
        ...
      }
      ...
    ],
    ...
  },
  "global_variables": {
    "AnImportantVariable": "7",
    ...
  }
}
```

The `records` key is intentionally kept separate from the `sheets` / `global_variables` keys and is designed to be the main/only thing another application would access.  The other keys exist to help JSON DB do it's job of presenting a helpful UI to a user editing the configuration.

In the future the JSON DB application should be able to import general JSON (/CSV/etc...) files and convert them (with some help from the user) to `.db.json` files.

## Schema

| sheets.['Sheet Name']                                        | Stores the configuration for a sheet/table.                                                                                                                                            |
|--------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| sheets.['Sheet Name']._id                                    | An identifier for the sheet.  Can be anything, but must be unique                                                                                                                      |
| sheets.['Sheet Name'].name                                   | The name for the sheet.  Should be the same as the key under 'sheets'                                                                                                                  |
| sheets.['Sheet Name'].hex_color                              | A hex color to determine the color of the sheet for it's tab and for any references to it                                                                                              |
| sheets.['Sheet Name'].definitions                            | An array defining the attribute definitions for the sheet                                                                                                                              |
| sheets.['Sheet Name'].definitions[n]._id                     | An identifier for the attribute definition.  Can be anything, but must be unique                                                                                                       |
| sheets.['Sheet Name'].definitions[n].unique_id               | Boolean specifying if this attribute should be unique across all records in the sheet.                                                                                                 |
| sheets.['Sheet Name'].definitions[n].required                | Boolean specifying if this attribute should be required for all records.                                                                                                               |
| sheets.['Sheet Name'].definitions[n].name                    | The name for the attribute                                                                                                                                                             |
| sheets.['Sheet Name'].definitions[n].type                    | The type of the attribute.  Can be one of `'string'`, `'text_area'`, `'number'`, `'select_one'`, `'references'`, `'expression'`                                                        |
| sheets.['Sheet Name'].definitions[n].sub_type                | The subtype of the attribute.  For `'text_area'` this can be `'plain'` or `'rich_text'`.  For `'number'` this can be `'integer'` or `'float'`                                          |
| sheets.['Sheet Name'].definitions[n].referenceable_sheet_ids | For attributes of type `references`.  This is an array of sheet `_id` values defining what sheets can be referenced.  If `null` or empty then all sheets can be referenced.            |
| sheets.['Sheet Name'].definitions[n].definitions             | For attributes of type `references`.  This is an array defining *sub-*definitions attached to references to other tables.  Can take any keys as `sheets.['Sheet Name'].definitions[n]` |
| sheets.['Sheet Name'].definitions[n].options                 | For attributes of type `select_one`.  Array of strings which can be the value for the attribute.                                                                                       |
|                                                              |                                                                                                                                                                                        |
|                                                              |                                                                                                                                                                                        |
|                                                              |                                                                                                                                                                                        |
|                                                              |                                                                                                                                                                                        |
|                                                              |                                                                                                                                                                                        |
|                                                              |                                                                                                                                                                                        |
|                                                              |                                                                                                                                                                                        |
|                                                              |                                                                                                                                                                                        |
|                                                              |                                                                                                                                                                                        |
|                                                              |                                                                                                                                                                                        |
|                                                              |                                                                                                                                                                                        |

## Potential future improvements

 * New kinds of types:
   * Images
   * Dates / DateTimes
   * Arrays of any type

TODO: Examples of why expressions would be useful

TODO: Screenshot of graph visualization?






## Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn serve
```

### Compiles and minifies for production
```
yarn build
```

### Run your unit tests
```
yarn test:unit
```

### Lints and fixes files
```
yarn lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

### Thanks

A huge thanks to [@AmandaWarner](https://github.com/AmandaWarner/) for her help in testing and developing this application!
