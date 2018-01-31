// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as assert from 'assert';
import {ParameterObject} from '@loopback/openapi-spec';
/**
 * Simple deserializers for HTTP parameters
 * @param val The value of the corresponding parameter type or a string
 * @param param The Swagger parameter object
 */
// tslint:disable-next-line:no-any
export function deserialize(val: any, param: ParameterObject): any {
  if (param.in === 'body') {
    param = getBodyDescriptor(param);
  }
  if (val == null) {
    if (param.required) {
      throw new Error(
        `Value is not provided for required parameter ${param.name}`,
      );
    }
    return val;
  }
  const type = param.type;
  switch (type) {
    case 'string':
      if (typeof val === 'string') {
        if (param.format === 'date' || param.format === 'date-time') {
          return new Date(val);
        }
        return val;
      }
      throw new Error(
        `Invalid value ${val} for parameter ${param.name}: ${type}`,
      );
    case 'number':
    case 'integer':
      let num: number = NaN;
      if (typeof val === 'string') {
        num = Number(val);
      } else if (typeof val === 'number') {
        num = val;
      }
      if (isNaN(num)) {
        throw new Error(
          `Invalid value ${val} for parameter ${param.name}: ${type}`,
        );
      }
      if (type === 'integer' && !Number.isInteger(num)) {
        throw new Error(
          `Invalid value ${val} for parameter ${param.name}: ${type}`,
        );
      }
      return num;
    case 'boolean':
      if (typeof val === 'boolean') return val;
      if (val === 'false') return false;
      else if (val === 'true') return true;
      throw new Error(
        `Invalid value ${val} for parameter ${param.name}: ${type}`,
      );
    case 'array':
      let items = val;
      if (typeof val === 'string') {
        switch (param.collectionFormat) {
          case 'ssv': // space separated values foo bar.
            items = val.split(' ');
            break;
          case 'tsv': // tab separated values foo\tbar.
            items = val.split('\t');
            break;
          case 'pipes': // pipe separated values foo|bar.
            items = val.split('|');
            break;
          case 'csv': // comma separated values foo,bar.
          default:
            items = val.split(',');
        }
      }
      if (Array.isArray(items)) {
        return items.map(i => deserialize(i, getItemDescriptor(param)));
      }
      throw new Error(
        `Invalid value ${val} for parameter ${param.name}: ${type}`,
      );
  }
  return val;
}

/**
 * Get the body descriptor
 * @param param
 */
function getBodyDescriptor(param: ParameterObject): ParameterObject {
  assert(param.in === 'body' && param.schema, 'Parameter location is not body');
  return Object.assign(
    {in: param.in, name: param.name, description: param.description},
    param.schema,
  );
}

/**
 * Get the array item descriptor
 * @param param
 */
function getItemDescriptor(param: ParameterObject): ParameterObject {
  assert(param.type === 'array' && param.items, 'Parameter type is not array');
  return Object.assign(
    {in: param.in, name: param.name, description: param.description},
    param.items,
  );
}
