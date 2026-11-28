import { type InputModality, InputModalityDetector } from '@angular/cdk/a11y';
import {
  Component,
  EventEmitter,
  Input,
  type OnDestroy,
  Output,
  signal
} from '@angular/core';
import { type DialogRef, DialogService } from '@ngneat/dialog';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import {
  CatalogSearchDialogComponent,
  type CatalogSearchDialogData,
  type CatalogSearchDialogResult
} from './catalog-search-dialog.component';
import type { SearchNode } from './search-node';

@Component({
  standalone: false,
  selector: 'm-catalog-search',
  templateUrl: './catalog-search.component.html'
})
export class CatalogSearchComponent implements OnDestroy {
  @Input({ required: true }) label: string;

  @Input({ required: true }) inputTestId: string;

  @Input({ required: true }) preview: (word: string) => SearchNode[];

  @Input() word?: string;

  @Output() wordChange = new EventEmitter<string>();

  @Output() resultOpen = new EventEmitter<string>();

  readonly isTriggerFocusRestored = signal(false);

  private readonly dialog =
    signal<DialogRef<CatalogSearchDialogData, CatalogSearchDialogResult>>(
      undefined
    );

  get isOpen(): boolean {
    let isOpen: boolean = isDefined(this.dialog());

    return isOpen;
  }

  constructor(
    private dialogService: DialogService,
    private inputModalityDetector: InputModalityDetector
  ) {}

  open(item: { trigger: HTMLButtonElement }): void {
    let { trigger } = item;

    if (this.isOpen) {
      return;
    }

    trigger.focus();

    let dialog: DialogRef<CatalogSearchDialogData, CatalogSearchDialogResult> =
      this.dialogService.open(CatalogSearchDialogComponent, {
        closeButton: false,
        width: 'min(100%, 650px)',
        windowClass: 'catalog-search-dialog',
        data: {
          label: this.label,
          inputTestId: this.inputTestId,
          word: this.word ?? '',
          preview: this.preview
        }
      });

    if (isUndefined(dialog)) {
      return;
    }

    this.dialog.set(dialog);

    dialog.afterClosed$.subscribe(result => {
      this.dialog.set(undefined);

      let modality: InputModality =
        this.inputModalityDetector.mostRecentModality;

      if (modality === 'mouse' || modality === 'touch') {
        trigger.blur();
      } else {
        this.isTriggerFocusRestored.set(true);
      }

      if (result?.kind === 'apply') {
        this.wordChange.emit(result.word);
      } else if (result?.kind === 'open') {
        this.resultOpen.emit(result.id);
      }
    });
  }

  clear(item: { trigger: HTMLButtonElement }): void {
    let { trigger } = item;

    trigger.focus();

    this.wordChange.emit('');
  }

  ngOnDestroy(): void {
    this.dialog()?.close();
  }
}
