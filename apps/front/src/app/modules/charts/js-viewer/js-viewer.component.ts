import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { MonacoEditorOptions } from 'ng-monaco-editor';
import { constants } from '~front/barrels/constants';

@Component({
  selector: 'm-js-viewer',
  templateUrl: './js-viewer.component.html'
})
export class JsViewerComponent {
  editorOptions: MonacoEditorOptions = {
    readOnly: true,
    renderValidationDecorations: 'off',
    theme: constants.TEXTMATE_THEME,
    language: constants.JAVASCRIPT_LANGUAGE_ID,
    fontSize: 16,
    fixedOverflowWidgets: true,
    padding: {
      top: 12
    }
  };

  @Input() jsContent: string;

  constructor(private cd: ChangeDetectorRef) {}
}
