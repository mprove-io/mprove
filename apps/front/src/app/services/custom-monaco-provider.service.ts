import { Injectable } from '@angular/core';
import { setDiagnosticsOptions } from 'monaco-yaml';
import { Monaco, MonacoProviderService } from 'ng-monaco-editor';
import { constants } from '~front/barrels/constants';

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

            // language id 'yaml' already exists
            // this.monaco.languages.register({ id: constants.BLOCKML_LANGUAGE_NAME });

            monaco.languages.setMonarchTokensProvider(
              constants.BLOCKML_LANGUAGE_ID,
              constants.BLOCKML_YAML_LANGUAGE
            );
            monaco.editor.defineTheme(
              constants.BLOCKML_THEME_NAME,
              constants.BLOCKML_TEXTMATE_THEME as any
            );

            resolve(monaco);
          })
          .catch(reject);
      });
    }
    return this.ready;
  }
}
