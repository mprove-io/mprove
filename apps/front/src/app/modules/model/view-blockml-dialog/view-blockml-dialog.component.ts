import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { DialogRef } from '@ngneat/dialog';
import { dump } from 'js-yaml';
import { prepareReport } from '~front/app/functions/prepare-report';
import { UserQuery } from '~front/app/queries/user.query';

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

  constructor(
    public ref: DialogRef,
    private fb: FormBuilder,
    private router: Router,
    private userQuery: UserQuery,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    let rep = prepareReport(this.ref.data.mconfig);

    this.reportYaml = dump({ reports: [rep] })
      .split('\n')
      .map(s =>
        s
          .replace(/^\s\s/g, '')
          .replace(/^\s\s\s\s[-]/g, '  -')
          .replace(/^\s\s\s\s\s\s[-]/g, '    -')
          .replace(/'''/g, `'`)
      )
      .slice(1)
      .join('\n');
  }

  async onEditorInit(editor: monaco.editor.IStandaloneCodeEditor) {
    this.editor = editor;
    // monaco.editor.setTheme(this.editorTheme);
    // monaco.editor.setModelLanguage(editor.getModel(), this.editorLanguage);
  }
}
