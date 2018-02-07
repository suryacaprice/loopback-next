// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {CoreBindings, Application, BootOptions} from '@loopback/core';
import {inject} from '@loopback/context';
import {BootBindings} from '../keys';
import {BaseArtifactBooter, ArtifactOptions} from './base-artifact.booter';

/**
 * A class that extends BaseArtifactBooter to boot the 'Controller' artifact type.
 * Discovered controllers are bound using `app.controller()`.
 *
 * Supported phases: configure, discover, load
 *
 * @param app Application instance
 * @param bootConfig BootStrapper Config Options
 */
export class RepositoryBooter extends BaseArtifactBooter {
  constructor(
    @inject(BootBindings.BOOT_OPTIONS) public bootConfig: BootOptions,
    @inject(CoreBindings.APPLICATION_INSTANCE) public app: Application,
  ) {
    super(bootConfig);

    // tslint:disable-next-line:no-any
    if (!(this.app as any).repository) {
      console.warn(
        'app.repository() function is needed for RepositoryBooter. You can add it to your Application using RepositoryMixin from @loopback/repository.',
      );
      this.configure = async () => {};
      this.discover = async () => {};
      this.load = async () => {};
    } else {
      // Set Controller Booter Options if passed in via bootConfig
      this.options = bootConfig.repositories
        ? Object.assign({}, RepositoryDefaults, bootConfig.repositories)
        : Object.assign({}, RepositoryDefaults);
    }
  }

  /**
   * Uses super method to get a list of Artifact classes. Boot each class by
   * binding it to the application using `app.repository(repository);`.
   */
  async load() {
    await super.load();
    this.classes.forEach(cls => {
      // tslint:disable-next-line:no-any
      (this.app as any).repository(cls);
    });
  }
}

/**
 * Default ArtifactOptions for a ControllerBooter.
 */
export const RepositoryDefaults: ArtifactOptions = {
  dirs: ['repositories'],
  extensions: ['.repository.js'],
  nested: true,
};
