// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect, TestSandbox} from '@loopback/testlab';
import {REPOSITORIES_PREFIX, REPOSITORIES_TAG} from '@loopback/repository';
import {resolve} from 'path';
import {ControllerBooterApp} from '../fixtures/application';
import {resetSandbox} from '../utils';

describe('controller booter integration tests', () => {
  const SANDBOX_PATH = resolve(__dirname, '../../.sandbox');
  const sandbox = new TestSandbox(SANDBOX_PATH);
  let app: ControllerBooterApp;

  beforeEach(() => resetSandbox(sandbox));
  beforeEach(getApp);

  it('boots controllers when app.boot() is called', async () => {
    const expectedBindings = [
      `${REPOSITORIES_PREFIX}.ControllerOne`,
      `${REPOSITORIES_PREFIX}.ControllerTwo`,
    ];

    await app.boot();

    const bindings = app.findByTag(REPOSITORIES_TAG).map(b => b.key);
    expect(bindings.sort()).to.eql(expectedBindings.sort());
  });

  async function getApp() {
    await sandbox.copyFile(resolve(__dirname, '../fixtures/application.js'));
    await sandbox.copyFile(
      resolve(__dirname, '../fixtures/application.js.map'),
    );
    await sandbox.copyFile(
      resolve(__dirname, '../fixtures/multiple.artifact.js'),
      'repositories/multiple.repository.js',
    );
    await sandbox.copyFile(
      resolve(__dirname, '../fixtures/multiple.artifact.js.map'),
      'repositories/multiple.artifact.js.map',
    );

    const BooterApp = require(resolve(SANDBOX_PATH, 'application.js'))
      .ControllerBooterApp;

    app = new BooterApp();
  }
});
