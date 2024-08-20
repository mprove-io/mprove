import { CommonModule } from '@angular/common';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  HostListener,
  OnInit
} from '@angular/core';
import { DialogRef } from '@ngneat/dialog';
import { NavigateService } from '~front/app/services/navigate.service';
import { common } from '~front/barrels/common';

export interface NewVizDialogData {
  models: common.ModelX[];
}

@Component({
  selector: 'm-new-viz-dialog',
  templateUrl: './new-viz-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule]
})
export class NewVizDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  constructor(
    public ref: DialogRef<NewVizDialogData>,
    private navigateService: NavigateService
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  navToModel(modelId: string) {
    this.ref.close();

    this.navigateService.navigateToModel(modelId);
  }
}
