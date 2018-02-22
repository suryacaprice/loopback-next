// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect, TestSandbox, sinon} from '@loopback/testlab';
import {Application} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RepositoryBooter, RepositoryDefaults} from '../../../index';
import {resolve} from 'path';

describe('repository booter unit tests', () => {
  const SANDBOX_PATH = resolve(__dirname, '../../../.sandbox');
  const sandbox = new TestSandbox(SANDBOX_PATH);

  const REPOSITORIES_PREFIX = 'repositories';
  const REPOSITORIES_TAG = 'repository';

  class RepoApp extends RepositoryMixin(Application) {}

  let app: RepoApp;
  let stub: sinon.SinonStub;

  beforeEach(() => sandbox.reset());
  beforeEach(getApp);
  before(createStub);
  after(restoreStub);

  it('gives a warning if called on a app without RepositoryMixin', async () => {
    const normalApp = new Application();
    // tslint:disable-next-line:no-unused-expression
    new RepositoryBooter(normalApp, SANDBOX_PATH);
    sinon.assert.calledOnce(stub);
    sinon.assert.calledWith(
      stub,
      'app.repository() function is needed for RepositoryBooter. You can add it to your Application using RepositoryMixin from @loopback/repository.',
    );
  });

  it(`uses RepositoryDefaults for 'options' if none are give`, () => {
    const booterInst = new RepositoryBooter(app, SANDBOX_PATH);
    expect(booterInst.options).to.deepEqual(RepositoryDefaults);
  });

  it('overrides defaults with provided options and uses defaults for the rest', () => {
    const options = {
      dirs: ['test'],
      extensions: ['.ext1'],
    };
    const expected = Object.assign({}, options, {
      nested: RepositoryDefaults.nested,
    });

    const booterInst = new RepositoryBooter(app, SANDBOX_PATH, options);
    expect(booterInst.options).to.deepEqual(expected);
  });

  it('binds repositories during the load phase', async () => {
    const expected = [
      `${REPOSITORIES_PREFIX}.ControllerOne`,
      `${REPOSITORIES_PREFIX}.ControllerTwo`,
    ];
    await sandbox.copyFile(
      resolve(__dirname, '../../fixtures/multiple.artifact.js'),
    );
    const booterInst = new RepositoryBooter(app, SANDBOX_PATH);
    const NUM_CLASSES = 2; // 2 classes in above file.

    // Load uses discovered property
    booterInst.discovered = [resolve(SANDBOX_PATH, 'multiple.artifact.js')];
    await booterInst.load();

    const repos = app.findByTag(REPOSITORIES_TAG);
    const keys = repos.map(binding => binding.key);
    expect(keys).to.have.lengthOf(NUM_CLASSES);
    expect(keys.sort()).to.eql(expected.sort());
  });

  function restoreStub() {
    stub.restore();
  }

  function createStub() {
    stub = sinon.stub(console, 'warn');
  }

  function getApp() {
    app = new RepoApp();
  }
});
