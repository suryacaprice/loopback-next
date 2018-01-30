// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect, TestSandbox} from '@loopback/testlab';
import {CoreBindings, BootOptions} from '@loopback/core';
import {Binding} from '@loopback/context';
import {ControllerBooter, ControllerDefaults} from '../../index';
import {resolve} from 'path';

describe('controller booter intengration tests', () => {
  const SANDBOX_PATH = resolve(__dirname, '../sandbox');
  const sandbox = new TestSandbox(SANDBOX_PATH);

  // tslint:disable-next-line:no-any
  let app: any;

  beforeEach(resetSandbox);
  beforeEach(getApp);

  it('all functions run and work via app.boot() once bound', async () => {
    const expectedDiscoveredFiles = [
      `${resolve(SANDBOX_PATH, 'controllers/hello.controller.js')}`,
    ];
    const expectedBindings = [`${CoreBindings.CONTROLLERS}.HelloController`];

    const ctx = await app.boot();
    const booter: ControllerBooter = await ctx.get(
      `${CoreBindings.BOOTER_PREFIX}.ControllerBooter`,
    );

    // Check Config Phase Ran as expected
    expect(booter.dirs.sort()).to.eql(
      (<string[]>ControllerDefaults.dirs).sort(),
    );
    expect(booter.extensions.sort()).to.eql(
      (<string[]>ControllerDefaults.extensions).sort(),
    );
    expect(booter.options.nested).to.equal(ControllerDefaults.nested);

    // Check Discovered Phase Ran as expected
    expect(booter.discovered.sort()).to.eql(expectedDiscoveredFiles.sort());

    // Check Boot Phase Ran as expected
    const ctrlBindings = app
      .findByTag(CoreBindings.CONTROLLERS_TAG)
      .map((b: Binding) => b.key);
    expect(ctrlBindings.sort()).to.eql(expectedBindings.sort());
  });

  async function getApp() {
    await sandbox.copyFile(resolve(__dirname, '../fixtures/application.js'));
    await sandbox.copyFile(
      resolve(__dirname, '../fixtures/application.js.map'),
    );
    await sandbox.copyFile(
      resolve(__dirname, '../fixtures/hello.controller.js'),
      'controllers/hello.controller.js',
    );
    await sandbox.copyFile(
      resolve(__dirname, '../fixtures/hello.controller.js.map'),
      'controllers/hello.controller.js.map',
    );

    const ControllerBooterApp = require(resolve(SANDBOX_PATH, 'application.js'))
      .ControllerBooterApp;

    app = new ControllerBooterApp();
  }

  async function resetSandbox() {
    await sandbox.reset();
  }
});
