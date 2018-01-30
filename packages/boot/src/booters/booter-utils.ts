// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Constructor} from '@loopback/context';
import * as util from 'util';
const promisify = util.promisify || require('util.promisify/implementation');
const glob = promisify(require('glob'));

/**
 * Creates a glob pattern and uses it to return all matching files relative to root
 *
 * @param dirs An array of directories to search for
 * @param extensions An array of extensions to search for
 * @param nested A boolean to determine if nested folders in dirs should be searched
 * @param root Root folder to resolve dirs relative to
 */
export async function discoverFiles(
  dirs: string[],
  extensions: string[],
  nested: boolean,
  root: string,
): Promise<string[]> {
  const pattern = `/@(${dirs.join('|')})/${
    nested ? '**/*' : '*'
  }@(${extensions.join('|')})`;

  return await glob(pattern, {root: root});
}

/**
 * Returns all files matching the given glob pattern relative to root
 *
 * @param pattern A glob pattern
 * @param root Root folder to start searching for matching files
 */
export async function discoverFilesWithGlob(
  pattern: string,
  root: string,
): Promise<string[]> {
  return await glob(pattern, {root: root});
}

/**
 * Returns an Array of Classes from given files
 *
 * @param files An array of string of absolute file paths
 */
// tslint:disable-next-line:no-any
export async function loadClassesFromFiles(files: string[]): Promise<any[]> {
  // tslint:disable-next-line:no-any
  const classes: Constructor<any>[] = [];
  files.forEach(file => {
    const ctrl = require(file);
    Object.keys(ctrl).forEach(cls => {
      if (
        typeof ctrl[cls] === 'function' &&
        ctrl[cls].toString().indexOf('class') === 0
      ) {
        classes.push(ctrl[cls]);
      }
    });
  });

  return classes;
}
