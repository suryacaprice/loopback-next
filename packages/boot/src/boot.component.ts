// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BootStrapper} from './boot-strapper';
import {Component, Application, CoreBindings} from '@loopback/core';
import {inject, BindingScope} from '@loopback/context';
import {ControllerBooter} from './booters';

export class BootComponent implements Component {
  // Export a list of default booters in the component so they get bound
  // automatically when this component is mounted.
  booters = [ControllerBooter];

  constructor(@inject(CoreBindings.APPLICATION_INSTANCE) app: Application) {
    app
      .bind(CoreBindings.BOOT_STRAPPER)
      .toClass(BootStrapper)
      .inScope(BindingScope.SINGLETON);
  }
}
