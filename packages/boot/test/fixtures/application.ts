// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {RestApplication, RestServer} from '@loopback/rest';
import {ApplicationConfig, BootOptions} from '@loopback/core';
import {BootComponent} from '../../index';
import {Context} from '@loopback/context';

export class ControllerBooterApp extends RestApplication {
  constructor(options?: ApplicationConfig) {
    super(options);
    this.component(BootComponent);
  }

  async boot(bootOptions?: BootOptions): Promise<Context> {
    if (!bootOptions)
      bootOptions = {
        projectRoot: __dirname,
      };
    if (!bootOptions.projectRoot) bootOptions.projectRoot = __dirname;
    return await super.boot(bootOptions);
  }

  async start() {
    const server = await this.getServer(RestServer);
    const port = await server.get('rest.port');
    await super.start();
  }
}
