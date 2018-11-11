import { Component, AfterViewInit, ViewChild, Inject } from '@angular/core';
import { AceEditorComponent } from 'ng2-ace-editor';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  moduleId: module.id,
  selector: 'm-pdt-sql-dialog',
  templateUrl: 'pdt-sql-dialog.component.html',
  styleUrls: ['pdt-sql-dialog.component.scss'],
})
export class PdtSqlDialogComponent implements AfterViewInit {
  sqlEditorTheme: string = 'sqlserver';

  @ViewChild('editor') editor: AceEditorComponent;


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<PdtSqlDialogComponent>,
  ) {
  }

  ngAfterViewInit() {

    this.editor.getEditor().gotoLine(1);
    this.editor.getEditor().navigateLineEnd();

    this.editor.getEditor().$blockScrolling = Infinity; // TODO: update ace later (1 instead of 2 by using this line)
    this.editor.getEditor().setFontSize(16);

    this.editor.getEditor().renderer.$cursorLayer.element.style.display = 'none';

    this.editor.setOptions({
      readOnly: true,
      highlightActiveLine: false,
      highlightGutterLine: false,
    });

    this.editor.setTheme(this.sqlEditorTheme);

    this.editor.setMode('sql');
  }

}
