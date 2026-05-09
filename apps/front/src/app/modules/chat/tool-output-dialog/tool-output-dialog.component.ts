import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  HostListener,
  OnInit
} from '@angular/core';
import { DialogRef } from '@ngneat/dialog';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { SharedModule } from '../../shared/shared.module';

function unescapeNewlines(text: string): string {
  return text.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
}

export interface ToolOutputDialogData {
  title: string;
  subtitle: string;
  output: string;
  input?: string;
  rawOutput?: string;
  isError: boolean;
  wrapText?: boolean;
}

@Component({
  selector: 'm-tool-output-dialog',
  templateUrl: './tool-output-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, SharedModule, NgScrollbarModule]
})
export class ToolOutputDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  dataItem = this.ref.data;
  showXml = false;

  constructor(public ref: DialogRef<ToolOutputDialogData>) {}

  get hasInput(): boolean {
    return !!this.dataItem.input;
  }

  get inputDisplay(): string {
    return unescapeNewlines(this.dataItem.input || '');
  }

  get outputDisplay(): string {
    let text = this.showXml ? this.dataItem.rawOutput : this.dataItem.output;
    return unescapeNewlines(text || '');
  }

  toggleXml() {
    this.showXml = !this.showXml;
  }

  ngOnInit(): void {
    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }
}
