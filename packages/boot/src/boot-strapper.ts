// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Context,
  inject,
  Constructor,
  Binding,
  BindingScope,
  resolveList,
} from '@loopback/context';
import {
  Booter,
  BootOptions,
  BOOTER_PHASES,
  CoreBindings,
  Application,
} from '@loopback/core';
import {resolve} from 'path';
import {BootBindings} from './keys';

import * as debugModule from 'debug';
const debug = debugModule('loopback:boot:bootstrapper');

export class BootStrapper {
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE) private app: Application,
  ) {}

  /**
   * Function is responsible for calling all registered Booter classes that
   * are bound to the Application instance. Each phase of an instance must
   * complete before the next phase is started.
   * @param {BootOptions} bootOptions Options for boot. Bound for Booters to
   * receive via Dependency Injection.
   */
  async boot(bootOptions: BootOptions, ctx?: Context): Promise<Context> {
    if (!bootOptions.projectRoot) {
      throw new Error(
        `No projectRoot provided for boot. Call boot({projectRoot: 'path'}) with projectRoot set.`,
      );
    }

    const bootCtx = ctx || new Context(this.app);

    // Bind booters passed in as a part of BootOptions
    if (bootOptions.booters) this.app.booter(bootOptions.booters);

    // Resolve path to projectRoot
    bootOptions.projectRoot = resolve(bootOptions.projectRoot);

    // Bind Boot Options for Booters
    bootCtx.bind(BootBindings.BOOT_OPTIONS).to(bootOptions);

    // Load booters registered to the BOOTERS_TAG by getting the bindings
    // and then resolving the bindings to get instances.
    const bindings = bootCtx.findByTag(CoreBindings.BOOTER_TAG);
    const booterInsts = await resolveList(bindings, binding =>
      Promise.resolve(bootCtx.get(binding.key)),
    );

    // Determine the phases to be run. If a user set a phases filter, those
    // are selected otherwise we run the default phases (BOOTER_PHASES).
    const phases =
      bootOptions.filter && bootOptions.filter.phases
        ? bootOptions.filter.phases
        : BOOTER_PHASES;

    // Determing the booters to be run. If a user set a booters filter (class
    // names of booters that should be run), that is the value, otherwise it
    // is all the registered booters by default.
    const names =
      bootOptions.filter && bootOptions.filter.booters
        ? bootOptions.filter.booters
        : booterInsts.map(inst => inst.constructor.name);

    // Run phases of booters
    for (const phase of phases) {
      for (const inst of booterInsts) {
        // Run phases if instance name is whitelisted.
        // NOTE: Might need to polyfill .includes()
        if (names.includes(inst.constructor.name)) {
          if (inst[phase]) {
            await inst[phase]();
            debug(`${inst.constructor.name} phase: ${phase} complete.`);
          } else {
            debug(`${inst.constructor.name} phase: ${phase} not implemented.`);
          }
        }
      }
    }

    return bootCtx;
  }
}
