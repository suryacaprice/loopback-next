// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Constructor} from '@loopback/context';
import {promisify} from 'util';
const glob = promisify(require('glob'));

/**
 * Creates a glob pattern and uses it to return all matching files relative to root
 *
 * @param dirs An array of directories to search for
 * @param extensions An array of extensions to search for
 * @param nested A boolean to determine if nested folders in dirs should be searched
 * @param root Root folder to resolve dirs relative to
 * @returns {string[]} Array of discovered files
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
 * @returns {string[]} Array of discovered files
 */
export async function discoverFilesWithGlob(
  pattern: string,
  root: string,
): Promise<string[]> {
  return await glob(pattern, {root: root});
}

/**
 * Given a function, returns true if it is a class, false otherwise.
 *
 * @param target The function to check if it's a class or not.
 * @returns {boolean} True if target is a class. False otherwise.
 */
// tslint:disable-next-line:no-any
export function isClass(target: Constructor<any>): boolean {
  return (
    typeof target === 'function' && target.toString().indexOf('class') === 0
  );
}

/**
 * Returns an Array of Classes from given files
 *
 * @param files An array of string of absolute file paths
 * @returns {Promise<Array<Constructor<any>>>} An array of Class Construtors from a file
 */
// tslint:disable-next-line:no-any
export async function loadClassesFromFiles(
  files: string[],
  // tslint:disable-next-line:no-any
): Promise<Array<Constructor<any>>> {
  // tslint:disable-next-line:no-any
  const classes: Array<Constructor<any>> = [];
  files.forEach(file => {
    const ctrl = require(file);
    Object.keys(ctrl).forEach(cls => {
      if (isClass(ctrl[cls])) {
        classes.push(ctrl[cls]);
      }
    });
  });

  return classes;
}
