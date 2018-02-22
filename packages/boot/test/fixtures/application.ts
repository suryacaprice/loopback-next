// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {RestApplication} from '@loopback/rest';
import {ApplicationConfig} from '@loopback/core';
// tslint:disable-next-line:no-unused-variable
import {RepositoryMixin, Class, Repository} from '@loopback/repository';

// Binding and Booter imports are required to infer types for BootMixin!
// tslint:disable-next-line:no-unused-variable
import {BootMixin, Booter, Binding} from '../../index';

export class BooterApp extends RepositoryMixin(BootMixin(RestApplication)) {
  constructor(options?: ApplicationConfig) {
    super(options);
    this.projectRoot = __dirname;
  }
}
