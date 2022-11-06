import { Injectable } from '@angular/core';
import { setDiagnosticsOptions } from 'monaco-yaml';
import { Monaco, MonacoProviderService } from 'ng-monaco-editor';

@Injectable({ providedIn: 'root' })
export class CustomMonacoProviderService extends MonacoProviderService {
  private ready?: Promise<Monaco>;

  override async initMonaco() {
    if (!this.ready) {
      this.ready = new Promise((resolve, reject) => {
        super
          .initMonaco()
          .then(monaco => {
            setDiagnosticsOptions({
              validate: true,
              format: true,
              enableSchemaRequest: true,
              schemas: [
                {
                  uri: 'schema/all.json',
                  fileMatch: ['*']
                }
              ]
            });

            resolve(monaco);
          })
          .catch(reject);
      });
    }
    return this.ready;
  }
}
