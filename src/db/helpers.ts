import _ from 'lodash'
import { v1 as uuid } from 'uuid'

import { Definition } from './Definition'

// Helper functions

// Adds an `_id` property to an object if it doesn't already exist
export const add_id = (object: any): any => {
  if (object['_id']) {
    return object
  } else {
    return _.assign(object, { _id: uuid() })
  }
}

export const data_ids_to_names = (data: any, definitions: Definition[]): any => {
  return _.reduce(
    definitions,
    (result: any, definition: Definition) => {
      return _.set(result, definition.name, data[definition._id])
    },
    {},
  )
}

export const data_names_to_ids = (data: any, definitions: Definition[]): any => {
  return _.reduce(
    definitions,
    (result: any, definition: Definition) => {
      return _.set(result, definition._id, data[definition.name])
    },
    {},
  )
}
