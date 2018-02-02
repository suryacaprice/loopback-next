// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {Application, Booter, CoreBindings} from '@loopback/core';
import {Binding, Context} from '@loopback/context';
import {BootComponent, BootBindings, Bootstrapper} from '../../index';

describe('boot.component unit tests', () => {
  let app: Application;
  let bootComponent: BootComponent;

  beforeEach(getApp);
  beforeEach(getBootComponent);

  it('binds BootStrapper class', async () => {
    const bootstrapper = await app.get(CoreBindings.BOOTSTRAPPER);
    expect(bootstrapper).to.be.instanceOf(Bootstrapper);
  });

  function getApp() {
    app = new Application();
  }

  function getBootComponent() {
    bootComponent = new BootComponent(app);
  }
});
