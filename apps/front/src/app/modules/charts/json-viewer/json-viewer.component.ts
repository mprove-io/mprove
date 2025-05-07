import {
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { MonacoEditorOptions } from 'ng-monaco-editor';
import { constants } from '~front/barrels/constants';

@Component({
  selector: 'm-json-viewer',
  templateUrl: './json-viewer.component.html'
})
export class JsonViewerComponent implements OnChanges {
  editorOptions: MonacoEditorOptions = {
    readOnly: true,
    renderValidationDecorations: 'off',
    theme: constants.TEXTMATE_THEME,
    language: constants.JSON_LANGUAGE_ID,
    fontSize: 16,
    fixedOverflowWidgets: true,
    padding: {
      top: 12
    }
  };

  @Input() jsonContent: string;

  formattedJson = '';

  constructor(private cd: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['jsonContent']) {
      this.formatJson();
    }
  }

  private formatJson(): void {
    try {
      if (this.jsonContent) {
        const parsed = JSON.parse(this.jsonContent);
        this.formattedJson = JSON.stringify(parsed, null, 2);
      } else {
        this.formattedJson = '';
      }
    } catch (error: any) {
      this.formattedJson = 'Invalid JSON: ' + error.message;
    }
  }
}
