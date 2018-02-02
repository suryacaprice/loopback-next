// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {Application, Booter, CoreBindings} from '@loopback/core';
import {Bootstrapper} from '../../index';

describe('boot-strapper unit tests', () => {
  let app: Application;
  let bootstrapper: Bootstrapper;
  const booterKey = `${CoreBindings.BOOTER_PREFIX}.TestBooter`;
  const booterKey2 = `${CoreBindings.BOOTER_PREFIX}.TestBooter2`;

  beforeEach(getApplication);
  beforeEach(getBootStrapper);

  it('finds and runs registered booters', async () => {
    const ctx = await bootstrapper.boot({projectRoot: __dirname});
    const booterInst = await ctx.get(booterKey);
    expect(booterInst.configureCalled).to.be.True();
    expect(booterInst.loadCalled).to.be.True();
  });

  it('binds booters passed in BootOptions', async () => {
    const ctx = await bootstrapper.boot({
      projectRoot: __dirname,
      booters: [TestBooter2],
    });
    const booterInst = await ctx.get(booterKey2);
    expect(booterInst).to.be.instanceof(TestBooter2);
    expect(booterInst.configureCalled).to.be.True();
  });

  it('no booters run when BootOptions.filter.booters is []', async () => {
    const ctx = await bootstrapper.boot({
      projectRoot: __dirname,
      filter: {booters: []},
    });
    const booterInst = await ctx.get(booterKey);
    expect(booterInst.configureCalled).to.be.False();
    expect(booterInst.loadCalled).to.be.False();
  });

  it('only runs booters passed in via BootOptions.filter.booters', async () => {
    const ctx = await bootstrapper.boot({
      projectRoot: __dirname,
      booters: [TestBooter2],
      filter: {booters: ['TestBooter2']},
    });
    const booterInst = await ctx.get(booterKey);
    const booterInst2 = await ctx.get(booterKey2);
    expect(booterInst.configureCalled).to.be.False();
    expect(booterInst.loadCalled).to.be.False();
    expect(booterInst2.configureCalled).to.be.True();
  });

  it('only runs phases passed in via BootOptions.filter.phases', async () => {
    const ctx = await bootstrapper.boot({
      projectRoot: __dirname,
      filter: {phases: ['configure']},
    });
    const booterInst = await ctx.get(booterKey);
    expect(booterInst.configureCalled).to.be.True();
    expect(booterInst.loadCalled).to.be.False();
  });

  function getApplication() {
    app = new Application();
    app.booter(TestBooter);
  }

  function getBootStrapper() {
    bootstrapper = new Bootstrapper(app);
  }

  class TestBooter implements Booter {
    configureCalled = false;
    loadCalled = false;
    async configure() {
      this.configureCalled = true;
    }

    async load() {
      this.loadCalled = true;
    }
  }

  class TestBooter2 implements Booter {
    configureCalled = false;
    async configure() {
      this.configureCalled = true;
    }
  }
});
