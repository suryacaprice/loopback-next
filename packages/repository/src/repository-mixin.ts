// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Class} from './common-types';
import {Repository} from './repository';

export const REPOSITORIES_PREFIX = 'repositories';
export const REPOSITORIES_TAG = 'repository';

/**
 * A mixin class for Application that creates a .repository()
 * function to register a repository automatically. Also overrides
 * component function to allow it to register repositories automatically.
 *
 * ```ts
 *
 * class MyApplication extends RepositoryMixin(Application) {}
 * ```
 */
// tslint:disable-next-line:no-any
export function RepositoryMixin<T extends Class<any>>(superClass: T) {
  return class extends superClass {
    // A mixin class has to take in a type any[] argument!
    // tslint:disable-next-line:no-any
    constructor(...args: any[]) {
      super(...args);
      if (!this.options) this.options = {};

      if (this.options.repositories) {
        for (const repo of this.options.repositories) {
          this.repository(repo);
        }
      }

      if (this.options.components) {
        // Super would have already mounted the component
        for (const component of this.options.components) {
          this.mountComponentRepository(component);
        }
      }
    }

    /**
     * Add a repository to this application.
     *
     * @param repo The repository to add.
     *
     * ```ts
     *
     * class NoteRepo {
     *   model: any;
     *
     *   constructor() {
     *     const ds: juggler.DataSource = new DataSourceConstructor({
     *       name: 'db',
     *       connector: 'memory',
     *     });
     *
     *     this.model = ds.createModel(
     *       'note',
     *       {title: 'string', content: 'string'},
     *       {}
     *     );
     *   }
     * };
     *
     * app.repository(NoteRepo);
     * ```
     */
    // tslint:disable-next-line:no-any
    repository(repo: Class<Repository<any>>) {
      const repoKey = `${REPOSITORIES_PREFIX}.${repo.name}`;
      this.bind(repoKey)
        .toClass(repo)
        .tag(REPOSITORIES_TAG);
    }

    /**
     * Add a component to this application. Also mounts
     * all the components repositories.
     *
     * @param component The component to add.
     *
     * ```ts
     *
     * export class ProductComponent {
     *   controllers = [ProductController];
     *   repositories = [ProductRepo, UserRepo];
     *   providers = {
     *     [AUTHENTICATION_STRATEGY]: AuthStrategy,
     *     [AUTHORIZATION_ROLE]: Role,
     *   };
     * };
     *
     * app.component(ProductComponent);
     * ```
     */
    public component(component: Class<{}>) {
      super.component(component);
      this.mountComponentRepository(component);
    }

    /**
     * Get an instance of a component and mount all it's
     * repositories. This function is intended to be used internally
     * by component()
     *
     * @param component The component to mount repositories of
     */
    mountComponentRepository(component: Class<{}>) {
      const componentKey = `components.${component.name}`;
      const compInstance = this.getSync(componentKey);

      if (compInstance.repositories) {
        for (const repo of compInstance.repositories) {
          this.repository(repo);
        }
      }
    }
  };
}
