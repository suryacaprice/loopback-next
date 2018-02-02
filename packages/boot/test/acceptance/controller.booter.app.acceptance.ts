// Copyright IBM Corp. 2013,2018. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Client, createClientForHandler, TestSandbox} from '@loopback/testlab';
import {RestServer} from '@loopback/rest';
import {resolve} from 'path';

describe('controller booter acceptance tests', () => {
  // tslint:disable-next-line:no-any
  let app: any;
  const SANDBOX_PATH = resolve(__dirname, '../../.sandbox');
  const sandbox = new TestSandbox(SANDBOX_PATH);

  beforeEach(resetSandbox);
  beforeEach(getApp);

  afterEach(stopApp);

  it('binds controllers using ControllerDefaults and REST endpoints work', async () => {
    const ctx = await app.boot();
    await app.start();

    const server: RestServer = await app.getServer(RestServer);
    const client: Client = createClientForHandler(server.handleHttp);

    // Default Controllers = /controllers with .controller.js ending (nested = true);
    await client.get('/').expect(200, 'HelloController.hello()');
  });

  async function getApp() {
    await sandbox.copyFile(resolve(__dirname, '../fixtures/application.js'));
    await sandbox.copyFile(
      resolve(__dirname, '../fixtures/application.js.map'),
    );
    await sandbox.copyFile(
      resolve(__dirname, '../fixtures/hello.controller.js'),
      'controllers/nested/hello.controller.js',
    );
    await sandbox.copyFile(
      resolve(__dirname, '../fixtures/hello.controller.js.map'),
      'controllers/nested/hello.controller.js.map',
    );

    const ControllerBooterApp = require(resolve(SANDBOX_PATH, 'application.js'))
      .ControllerBooterApp;

    app = new ControllerBooterApp();
  }

  async function stopApp() {
    try {
      await app.stop();
    } catch (err) {
      console.log(`Stopping the app threw an error: ${err}`);
    }
  }

  async function resetSandbox() {
    await sandbox.reset();
  }
});
