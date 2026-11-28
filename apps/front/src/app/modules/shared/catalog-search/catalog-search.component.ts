import {
  Component,
  EventEmitter,
  Input,
  type OnDestroy,
  Output
} from '@angular/core';
import { type DialogRef, DialogService } from '@ngneat/dialog';
import { isDefined } from '#common/functions/is-defined/is-defined';
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

  private dialog?: DialogRef<
    CatalogSearchDialogData,
    CatalogSearchDialogResult
  >;

  get isOpen(): boolean {
    let isOpen: boolean = isDefined(this.dialog);

    return isOpen;
  }

  constructor(private dialogService: DialogService) {}

  open(item: { trigger: HTMLButtonElement }): void {
    let { trigger } = item;

    if (isDefined(this.dialog)) {
      return;
    }

    trigger.focus();

    this.dialog = this.dialogService.open(CatalogSearchDialogComponent, {
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

    this.dialog.afterClosed$.subscribe(result => {
      this.dialog = undefined;

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
    this.dialog?.close();
  }
}
