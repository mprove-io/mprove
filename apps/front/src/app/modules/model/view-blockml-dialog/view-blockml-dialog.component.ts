import { Component, OnInit } from '@angular/core';
import { DialogRef } from '@ngneat/dialog';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-view-blockml-dialog',
  templateUrl: './view-blockml-dialog.component.html'
})
export class ViewBlockmlDialogComponent implements OnInit {
  editorTheme = 'vs-dark';
  editorLanguage = 'yaml';

  editor: monaco.editor.IStandaloneCodeEditor = null;

  editorOptions = {
    // automaticLayout: true,
    readOnly: true,
    theme: this.editorTheme,
    fontSize: 16,
    language: this.editorLanguage
  };

  reportYaml: string;

  constructor(public ref: DialogRef) {}

  ngOnInit() {
    let rep = common.prepareReport({
      isForDashboard: false,
      mconfig: this.ref.data.mconfig
    });

    this.reportYaml = common.toYaml({ reports: [rep] });
  }

  async onEditorInit(editor: monaco.editor.IStandaloneCodeEditor) {
    this.editor = editor;
    // monaco.editor.setTheme(this.editorTheme);
    // monaco.editor.setModelLanguage(editor.getModel(), this.editorLanguage);
  }
}
