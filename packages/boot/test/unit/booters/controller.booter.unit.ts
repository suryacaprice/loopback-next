// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect, TestSandbox} from '@loopback/testlab';
import {Application, CoreBindings, BootOptions} from '@loopback/core';
import {ControllerBooter, ControllerDefaults} from '../../../index';
import {resolve, relative} from 'path';

describe('controller booter unit tests', () => {
  const SANDBOX_PATH = resolve(__dirname, '../../sandbox');
  const sandbox = new TestSandbox(SANDBOX_PATH);

  let app: Application;

  beforeEach(resetSandbox);
  beforeEach(getApp);

  describe('ControllerBooter.config()', () => {
    it('uses default values for controllerOptions when not present', async () => {
      const bootOptions: BootOptions = {
        projectRoot: SANDBOX_PATH,
      };

      const booter = new ControllerBooter(app, bootOptions);
      await booter.configure();
      validateConfig(
        booter,
        <string[]>ControllerDefaults.dirs,
        <string[]>ControllerDefaults.extensions,
        ControllerDefaults.nested,
      );
    });

    it('converts string options in controllerOptions to Array and overrides defaults', async () => {
      const bootOptions: BootOptions = {
        projectRoot: SANDBOX_PATH,
        controllers: {
          dirs: 'ctrl',
          extensions: '.ctrl.js',
          nested: false,
        },
      };

      const booter = new ControllerBooter(app, bootOptions);
      await booter.configure();
      validateConfig(
        booter,
        [bootOptions.controllers.dirs],
        [bootOptions.controllers.extensions],
        bootOptions.controllers.nested,
      );
    });

    it('overrides controllerOptions with those provided', async () => {
      const bootOptions: BootOptions = {
        projectRoot: SANDBOX_PATH,
        controllers: {
          dirs: ['ctrl1', 'ctrl2'],
          extensions: ['.ctrl.js', '.controller.js'],
        },
      };

      const booter = new ControllerBooter(app, bootOptions);
      await booter.configure();
      validateConfig(
        booter,
        bootOptions.controllers.dirs,
        bootOptions.controllers.extensions,
        ControllerDefaults.nested,
      );
    });

    function validateConfig(
      booter: ControllerBooter,
      dirs: string[],
      exts: string[],
      nested: boolean,
    ) {
      expect(booter.dirs.sort()).to.eql(dirs.sort());
      expect(booter.extensions.sort()).to.eql(exts.sort());
      if (nested) {
        expect(booter.options.nested).to.be.True();
      } else {
        expect(booter.options.nested).to.be.False();
      }
      expect(booter.projectRoot).to.equal(SANDBOX_PATH);
    }
  });

  describe('ControllerBooter.discover()', () => {
    it('discovers correct files based on ControllerDefaults', async () => {
      await sandbox.copyFile(
        resolve(SANDBOX_PATH, '../fixtures/hello.controller.js'),
        'controllers/hello.controller.js',
      );
      await sandbox.copyFile(
        resolve(SANDBOX_PATH, '../fixtures/two.controller.js'),
        'controllers/nested/two.controller.js',
      );
      const bootOptions: BootOptions = {
        projectRoot: SANDBOX_PATH,
        controllers: ControllerDefaults,
      };
      const expected = [
        `${resolve(SANDBOX_PATH, 'controllers/hello.controller.js')}`,
        `${resolve(SANDBOX_PATH, 'controllers/nested/two.controller.js')}`,
      ];

      const booter = new ControllerBooter(app, bootOptions);
      booter.dirs = <string[]>ControllerDefaults.dirs;
      booter.extensions = <string[]>ControllerDefaults.extensions;

      await booter.discover();
      expect(booter.discovered.sort()).to.eql(expected.sort());
    });

    it('discovers correct files based on a glob pattern', async () => {
      await sandbox.copyFile(
        resolve(SANDBOX_PATH, '../fixtures/hello.controller.js'),
        'ctrl/hello.ctrl.js',
      );

      const bootOptions: BootOptions = {
        projectRoot: SANDBOX_PATH,
        controllers: {glob: '/ctrl/**/*.ctrl.js'},
      };
      const expected = [`${resolve(SANDBOX_PATH, 'ctrl/hello.ctrl.js')}`];

      const booter = new ControllerBooter(app, bootOptions);
      booter.dirs = <string[]>ControllerDefaults.dirs;
      booter.extensions = <string[]>ControllerDefaults.extensions;

      await booter.discover();
      expect(booter.discovered.sort()).to.eql(expected.sort());
    });

    it('discovers files without going into nested folders', async () => {
      await sandbox.copyFile(
        resolve(SANDBOX_PATH, '../fixtures/hello.controller.js'),
        'controllers/hello.controller.js',
      );
      await sandbox.copyFile(
        resolve(SANDBOX_PATH, '../fixtures/two.controller.js'),
        'controllers/nested/two.controller.js',
      );
      const bootOptions: BootOptions = {
        projectRoot: SANDBOX_PATH,
        controllers: {nested: false},
      };
      const expected = [
        `${resolve(SANDBOX_PATH, 'controllers/hello.controller.js')}`,
      ];

      const booter = new ControllerBooter(app, bootOptions);
      booter.dirs = <string[]>ControllerDefaults.dirs;
      booter.extensions = <string[]>ControllerDefaults.extensions;

      await booter.discover();
      expect(booter.discovered.sort()).to.eql(expected.sort());
    });

    it('discovers files of specified extensions', async () => {
      await sandbox.copyFile(
        resolve(SANDBOX_PATH, '../fixtures/hello.controller.js'),
        'controllers/hello.controller.js',
      );
      await sandbox.copyFile(
        resolve(SANDBOX_PATH, '../fixtures/two.controller.js'),
        'controllers/two.ctrl.js',
      );
      const bootOptions: BootOptions = {
        projectRoot: SANDBOX_PATH,
        controllers: ControllerDefaults,
      };
      const expected = [`${resolve(SANDBOX_PATH, 'controllers/two.ctrl.js')}`];

      const booter = new ControllerBooter(app, bootOptions);
      booter.dirs = <string[]>ControllerDefaults.dirs;
      booter.extensions = ['.ctrl.js'];

      await booter.discover();
      expect(booter.discovered.sort()).to.eql(expected.sort());
    });

    it('discovers files in specified directory', async () => {
      await sandbox.copyFile(
        resolve(SANDBOX_PATH, '../fixtures/hello.controller.js'),
        'ctrl/hello.controller.js',
      );
      const bootOptions: BootOptions = {
        projectRoot: SANDBOX_PATH,
        controllers: ControllerDefaults,
      };
      const expected = [`${resolve(SANDBOX_PATH, 'ctrl/hello.controller.js')}`];

      const booter = new ControllerBooter(app, bootOptions);
      booter.dirs = ['ctrl'];
      booter.extensions = <string[]>ControllerDefaults.extensions;

      await booter.discover();
      expect(booter.discovered.sort()).to.eql(expected.sort());
    });

    it('discovers files of multiple extensions', async () => {
      await sandbox.copyFile(
        resolve(SANDBOX_PATH, '../fixtures/hello.controller.js'),
        'controllers/hello.ctrl.js',
      );
      await sandbox.copyFile(
        resolve(SANDBOX_PATH, '../fixtures/two.controller.js'),
        'controllers/two.controller.js',
      );
      const bootOptions: BootOptions = {
        projectRoot: SANDBOX_PATH,
        controllers: ControllerDefaults,
      };
      const expected = [
        `${resolve(SANDBOX_PATH, 'controllers/two.controller.js')}`,
        `${resolve(SANDBOX_PATH, 'controllers/hello.ctrl.js')}`,
      ];

      const booter = new ControllerBooter(app, bootOptions);
      booter.dirs = <string[]>ControllerDefaults.dirs;
      booter.extensions = ['.ctrl.js', '.controller.js'];

      await booter.discover();
      expect(booter.discovered.sort()).to.eql(expected.sort());
    });

    it('discovers files in multiple directories', async () => {
      await sandbox.copyFile(
        resolve(SANDBOX_PATH, '../fixtures/hello.controller.js'),
        'ctrl/hello.controller.js',
      );
      await sandbox.copyFile(
        resolve(SANDBOX_PATH, '../fixtures/two.controller.js'),
        'controllers/two.controller.js',
      );
      const bootOptions: BootOptions = {
        projectRoot: SANDBOX_PATH,
        controllers: ControllerDefaults,
      };
      const expected = [
        `${resolve(SANDBOX_PATH, 'controllers/two.controller.js')}`,
        `${resolve(SANDBOX_PATH, 'ctrl/hello.controller.js')}`,
      ];

      const booter = new ControllerBooter(app, bootOptions);
      booter.dirs = ['ctrl', 'controllers'];
      booter.extensions = <string[]>ControllerDefaults.extensions;

      await booter.discover();
      expect(booter.discovered.sort()).to.eql(expected.sort());
    });

    it('discovers no files in an empty directory', async () => {
      await sandbox.mkdir('controllers');
      const bootOptions: BootOptions = {
        projectRoot: SANDBOX_PATH,
        controllers: ControllerDefaults,
      };
      const expected: string[] = [];

      const booter = new ControllerBooter(app, bootOptions);
      booter.dirs = <string[]>ControllerDefaults.extensions;
      booter.extensions = <string[]>ControllerDefaults.extensions;

      await booter.discover();
      expect(booter.discovered.sort()).to.eql(expected.sort());
    });

    it('discovers no files of an invalid extension', async () => {
      await sandbox.copyFile(
        resolve(SANDBOX_PATH, '../fixtures/two.controller.js'),
        'controllers/two.controller.js',
      );
      const bootOptions: BootOptions = {
        projectRoot: SANDBOX_PATH,
        controllers: ControllerDefaults,
      };
      const expected: string[] = [];

      const booter = new ControllerBooter(app, bootOptions);
      booter.dirs = <string[]>ControllerDefaults.dirs;
      booter.extensions = ['.fake'];

      await booter.discover();
      expect(booter.discovered.sort()).to.eql(expected.sort());
    });

    it('discovers no files in a non-existent directory', async () => {
      const bootOptions: BootOptions = {
        projectRoot: SANDBOX_PATH,
        controllers: ControllerDefaults,
      };
      const expected: string[] = [];

      const booter = new ControllerBooter(app, bootOptions);
      booter.dirs = ['fake'];
      booter.extensions = <string[]>ControllerDefaults.extensions;

      await booter.discover();
      expect(booter.discovered.sort()).to.eql(expected.sort());
    });
  });

  describe('ControllerBooter.load()', () => {
    it('binds a controller from discovered file', async () => {
      await sandbox.copyFile(
        resolve(SANDBOX_PATH, '../fixtures/hello.controller.js'),
        'controllers/hello.controller.js',
      );
      const bootOptions: BootOptions = {
        projectRoot: SANDBOX_PATH,
      };
      const expected = [`${CoreBindings.CONTROLLERS}.HelloController`];

      const booter = new ControllerBooter(app, bootOptions);
      booter.discovered = [
        `${resolve(SANDBOX_PATH, 'controllers/hello.controller.js')}`,
      ];

      await booter.load();
      const boundControllers = app
        .findByTag(CoreBindings.CONTROLLERS_TAG)
        .map(b => b.key);
      expect(boundControllers.sort()).to.eql(expected.sort());
    });

    it('binds controllers from multiple files', async () => {
      await sandbox.copyFile(
        resolve(SANDBOX_PATH, '../fixtures/hello.controller.js'),
        'controllers/hello.controller.js',
      );
      await sandbox.copyFile(
        resolve(SANDBOX_PATH, '../fixtures/hello.controller.js.map'),
        'controllers/hello.controller.js.map',
      );
      await sandbox.copyFile(
        resolve(SANDBOX_PATH, '../fixtures/two.controller.js'),
        'controllers/nested/two.controller.js',
      );
      await sandbox.copyFile(
        resolve(SANDBOX_PATH, '../fixtures/two.controller.js.map'),
        'controllers/nested/two.controller.js.map',
      );
      const bootOptions: BootOptions = {
        projectRoot: SANDBOX_PATH,
      };
      const expected = [
        `${CoreBindings.CONTROLLERS}.HelloController`,
        `${CoreBindings.CONTROLLERS}.ControllerOne`,
        `${CoreBindings.CONTROLLERS}.ControllerTwo`,
      ];

      const booter = new ControllerBooter(app, bootOptions);
      booter.discovered = [
        `${resolve(SANDBOX_PATH, 'controllers/hello.controller.js')}`,
        `${resolve(SANDBOX_PATH, 'controllers/nested/two.controller.js')}`,
      ];

      await booter.load();
      const boundControllers = app
        .findByTag(CoreBindings.CONTROLLERS_TAG)
        .map(b => b.key);
      expect(boundControllers.sort()).to.eql(expected.sort());
    });

    it('binds multiple controllers from a file', async () => {
      await sandbox.copyFile(
        resolve(SANDBOX_PATH, '../fixtures/two.controller.js'),
        'controllers/two.controller.js',
      );
      await sandbox.copyFile(
        resolve(SANDBOX_PATH, '../fixtures/two.controller.js.map'),
        'controllers/two.controller.js.map',
      );
      const bootOptions: BootOptions = {
        projectRoot: SANDBOX_PATH,
      };
      const expected = [
        `${CoreBindings.CONTROLLERS}.ControllerOne`,
        `${CoreBindings.CONTROLLERS}.ControllerTwo`,
      ];

      const booter = new ControllerBooter(app, bootOptions);
      booter.discovered = [
        `${resolve(SANDBOX_PATH, 'controllers/two.controller.js')}`,
      ];

      await booter.load();
      const boundControllers = app
        .findByTag(CoreBindings.CONTROLLERS_TAG)
        .map(b => b.key);
      expect(boundControllers.sort()).to.eql(expected.sort());
    });

    it('does not throw on an empty file', async () => {
      await sandbox.copyFile(
        resolve(SANDBOX_PATH, '../fixtures/empty.controller.js'),
        'controllers/empty.controller.js',
      );
      await sandbox.copyFile(
        resolve(SANDBOX_PATH, '../fixtures/empty.controller.js.map'),
        'controllers/empty.controller.js.map',
      );
      const bootOptions: BootOptions = {
        projectRoot: SANDBOX_PATH,
      };
      const expected: string[] = [];

      const booter = new ControllerBooter(app, bootOptions);
      booter.discovered = [
        `${resolve(SANDBOX_PATH, 'controllers/empty.controller.js')}`,
      ];

      await booter.load();
      const boundControllers = app
        .findByTag(CoreBindings.CONTROLLERS_TAG)
        .map(b => b.key);
      expect(boundControllers.sort()).to.eql(expected.sort());
    });

    it('throws an error on a non-existent file', async () => {
      await sandbox.mkdir('controllers');
      const bootOptions: BootOptions = {
        projectRoot: SANDBOX_PATH,
      };

      const booter = new ControllerBooter(app, bootOptions);
      booter.discovered = [
        `${resolve(SANDBOX_PATH, 'controllers/fake.controller.js')}`,
      ];

      await expect(booter.load()).to.be.rejectedWith(/Cannot find module/);
    });
  });

  function getApp() {
    app = new Application();
  }

  async function resetSandbox() {
    await sandbox.reset();
  }
});
