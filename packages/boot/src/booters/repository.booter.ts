// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {CoreBindings, Application, Booter, BootOptions} from '@loopback/core';
import {inject} from '@loopback/context';
import {BootBindings} from '../keys';
import {
  discoverFiles,
  discoverFilesWithGlob,
  loadClassesFromFiles,
} from './booter-utils';

/**
 * RepositoryBooter is a class that implements the Booter inferface. The purpose
 * of this booter is to allow for convention based booting of `Controller`
 * artifacts for LoopBack 4 Applications.
 *
 * It supports the following boot phases: config, discover, boot
 *
 * @param app Application instance
 * @param bootConfig Config options for boot
 */
export class RepositoryBooter implements Booter {
  options: RepositoryOptions;
  projectRoot: string;
  dirs: string[];
  extensions: string[];
  discovered: string[];
  validApp: boolean;

  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE) public app: Application,
    @inject(BootBindings.BOOT_OPTIONS) public bootConfig: BootOptions,
  ) {
    // Ensure Application has a `.repository()` function (Added by using RepositoryMixin).
    // tslint:disable-next-line:no-any
    if (!(this.app as any).repositry) {
      console.warn(
        'app.repository() function is needed for RepositoryBooter. Please use RepositoryMixin with your Application to use this Booter.',
      );
      this.configure = async () => {};
      this.discover = async () => {};
      this.load = async () => {};
    } else {
      if (!bootConfig.repositories) bootConfig.repositories = {};
      this.options = bootConfig.repositories;
      this.projectRoot = bootConfig.projectRoot;
    }
  }

  /**
   * This phase is responsible for configuring this Booter. It converts
   * options and assigns default values for missing values so ther phases
   * don't have to perform checks / conversions.
   */
  async configure() {
    this.options = Object.assign({}, RepositoryDefaults, this.options);

    this.dirs = Array.isArray(this.options.dirs)
      ? this.options.dirs
      : [this.options.dirs];

    this.extensions = Array.isArray(this.options.extensions)
      ? this.options.extensions
      : [this.options.extensions];
  }

  /**
   * This phase is responsible for discovering artifact files based on the
   * given parameters. Sets this.discovered to an array of discovered
   * artifact files.
   */
  async discover() {
    if (this.options.glob) {
      this.discovered = await discoverFilesWithGlob(
        this.options.glob,
        this.projectRoot,
      );
    } else {
      this.discovered = await discoverFiles(
        this.dirs,
        this.extensions,
        this.options.nested,
        this.projectRoot,
      );
    }
  }

  /**
   * This phase is responsible for reading the discovered files, checking the
   * Classes exported and binding them to the Application instance for use.
   *
   * It will skip any files it isn't able to load and throw an error containing
   * a list of skipped files. Other files that were read will still be bound
   * to the Application instance.
   */
  async load() {
    const classes = await loadClassesFromFiles(this.discovered);
    classes.forEach(cls => {
      // tslint:disable-next-line:no-any
      (this.app as any).repository(cls);
    });
  }
}

/**
 * Type definition for ControllerOptions. These are the options supported by
 * this Booter.
 *
 * @param dirs String / String Array of directories to check for artifacts.
 * Paths must be relative.
 * @param extensions String / String Array of file extensions to match artifact
 * files in dirs.
 * @param nested Boolean to control if artifact discovery should check nested
 * folders or not.
 * @param glob  A `glob` string to use when searching for files. This takes
 * precendence over other options.
 */
export type RepositoryOptions = {
  dirs: string | string[];
  extensions: string | string[];
  nested: boolean;
  glob?: string;
};

/**
 * Default values for RepositoryOptions if options aren't provided.
 */
export const RepositoryDefaults: RepositoryOptions = {
  dirs: ['repositoryies'],
  extensions: ['.repository.js'],
  nested: true,
};
