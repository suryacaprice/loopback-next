// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application, ApplicationConfig<% if (project.loopbackBoot) { %>, BootOptions<% } %>} from '@loopback/core';
import {RestApplication, RestServer} from '@loopback/rest';
<% if (project.loopbackBoot) { -%>
import {BootComponent} from '@loopback/boot';
import {Context} from '@loopback/context';
<% } else {-%>
import {PingController} from './controllers/ping.controller';
<% } -%>
import {MySequence} from './sequence';

export class <%= project.applicationName %> extends RestApplication {
  constructor(options?: ApplicationConfig) {
    // Allow options to replace the defined components array, if desired.
    super(options);
<% if (project.loopbackBoot) { -%>
    this.component(BootComponent);
<% } else {-%>
    this.setupControllers();
<% } -%>
  }

<% if (project.loopbackBoot) { -%>
  async boot(bootOptions?: BootOptions): Promise<Context> {
    if (!bootOptions)
      bootOptions = {
        projectRoot: __dirname,
      };
    if (!bootOptions.projectRoot) bootOptions.projectRoot = __dirname;
    return await super.boot(bootOptions);
  }
<% } -%>

  async start() {
    const server = await this.getServer(RestServer);
    server.sequence(MySequence);
    const port = await server.get('rest.port');
    console.log(`Server is running at http://127.0.0.1:${port}`);
    console.log(`Try http://127.0.0.1:${port}/ping`);
    return await super.start();
  }

<% if(!project.loopbackBoot) { -%>
  setupControllers() {
    this.controller(PingController);
  }
<% } -%>
}
