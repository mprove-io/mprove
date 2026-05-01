import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import type { ExplorerTab } from '../explorer-tab.interface';

@Component({
  standalone: false,
  selector: 'm-explorer-tabs',
  templateUrl: './explorer-tabs.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExplorerTabsComponent {
  @Input() tabs: ExplorerTab[] = [];
  @Input() activeTabId: string | null = null;

  @Output() tabSelect = new EventEmitter<string>();
  @Output() tabClose = new EventEmitter<string>();

  onSelect(tab: ExplorerTab) {
    this.tabSelect.emit(tab.id);
  }

  onClose(event: MouseEvent, tab: ExplorerTab) {
    event.stopPropagation();
    this.tabClose.emit(tab.id);
  }

  trackByTabId(_index: number, tab: ExplorerTab) {
    return tab.id;
  }
}
