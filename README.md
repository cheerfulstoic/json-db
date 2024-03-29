# json-db

The JSON DB project is a UI for configuration files which are easy for anybody to edit and which can be simply integrated into your application.

[Try it here](http://json-db.brian-underwood.codes/)

## Who is this for?

Anybody who makes applications such as games where static configuration can define how the application will work.  

## Examples

A configuration file for a fictional game [Dungeon Danger!](http://json-db.brian-underwood.codes/?file_url=https://raw.githubusercontent.com/cheerfulstoic/json-db/master/example_databases/Dungeon%20Danger!.db.json) has been created to provide an example of how to use JSON DB.  Feel free to edit it in your browser and download the resulting file to see the result.

## Features

In the JSON DB you can create multiple **sheets**.  Each sheet can have one or more **records** and one or more **attributes** which define **values** for each record / attribute.

 * Attributes
   * Basic attributes: string, number, select one/enumerable
   * Expression attributes for mathematical calculations
     * Uses the `expr-eval` package.  See [it's documentation](https://www.npmjs.com/package/expr-eval#expression-syntax) for syntax).
     * Global variables are available for expressions.
   * References attributes for defining relationships between records.  Reference attributes can also have attributes which allow values to be stored on the references.
   * Required and unique attributes
 * Sorting and filtering records by attributes
 * View mode


## Origin

JSON DB was inspired by [CastleDB](http://castledb.org/) but JSON DB is designed to be much easier to setup and use.

The JSON DB project was created in collaboration with [@AmandaWarner](https://github.com/AmandaWarner/) and has been used in multiple real-world games.

## File Format

JSON DB creates files with extension of `.db.json`.  The file format of JSON DB is designed to be simple to use from any language that can read a JSON file.

When reading the file from your application the `records` key is the main place that you can look for the data.  The other keys (i.e. `sheets` and `global_variables`) are metadata for JSON DB to do it's job of presenting a helpful UI to a user editing the configuration.

A JSON DB file looks something like this:

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
| records.['Sheet Name'][n]._id                                | An identifier for the record.  Can be anything, but must be unique.
| records.['Sheet Name'][n]['Attribute Name']                  | The data for the record / attribute
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

Adding the ability to load generic JSON / CSV files and turn them into JSON DB databases.




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
