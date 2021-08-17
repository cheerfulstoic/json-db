# json-db

## Purpose

The JSON DB project is designed as an easy-to-use interface for configuration files.  It was inspired by [CastleDB](http://castledb.org/) but JSON DB is designed to be much easier to setup and use.

The JSON format is limited to (aside from objects and arrays) strings, numbers, and booleans.  The JSON DB defines formats to allow you to have:

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

The `records` key is intentionally kept separate from the `sheets` / `global_variables` keys and is designed to be the main/only thing another application would access.  The other keys exist to help JSON DB do it's job.

In the future the JSON DB application should be able to import general JSON (/CSV/etc...) files and save them as `.db.json` files.

TODO: Examples of why expressions would be useful

TODO: Screenshot of graph visualization?

TODO: Images as a column type?  URLs?  Images as URLs?

TODO: Arrays as a type?  Do references cover that, to some extent?  Look at CastleDB

TODO: Dates / DateTimes as types?






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
