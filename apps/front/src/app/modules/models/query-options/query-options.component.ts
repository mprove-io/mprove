import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { tap } from 'rxjs/operators';
import { ModelQuery, ModelState } from '#front/app/queries/model.query';
import { NavigateService } from '#front/app/services/navigate.service';

@Component({
  standalone: false,
  selector: 'm-query-options',
  templateUrl: './query-options.component.html'
})
export class QueryOptionsComponent {
  @Input()
  showRunDryButton: boolean;

  @Output()
  runDryEvent = new EventEmitter();

  model: ModelState;
  model$ = this.modelQuery.select().pipe(
    tap(x => {
      this.model = x;
      this.cd.detectChanges();
    })
  );

  constructor(
    private modelQuery: ModelQuery,
    private navigateService: NavigateService,
    private cd: ChangeDetectorRef
  ) {}

  runDry(event?: MouseEvent) {
    event.stopPropagation();

    this.runDryEvent.emit();
  }
}
