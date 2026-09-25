import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgSelectComponent } from '@ng-select/ng-select';
import {
  BehaviorSubject,
  debounceTime,
  distinctUntilChanged,
  Subscription,
  switchMap,
  take,
  tap
} from 'rxjs';
import { MyRegex } from '#common/classes/my-regex/my-regex';
import { FieldClassEnum } from '#common/enums/field-class.enum';
import { FractionTypeEnum } from '#common/enums/fraction/fraction-type.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isDefinedAndNotEmpty } from '#common/functions/is-defined-and-not-empty/is-defined-and-not-empty';
import { makeCopy } from '#common/functions/make-copy/make-copy';
import type { Fraction } from '#common/zod/blockml/fraction';
import type { FractionControl } from '#common/zod/blockml/fraction-control';
import type { EventFractionUpdate } from '#common/zod/front/event-fraction-update';
import type {
  ToBackendSuggestDimensionValuesRequestPayload,
  ToBackendSuggestDimensionValuesResponse
} from '#common/zod/to-backend/mconfigs/to-backend-suggest-dimension-values';
import { NavQuery } from '#front/app/queries/nav.query';
import { ApiService } from '#front/app/services/api.service';

@Component({
  standalone: false,
  selector: 'm-store-fraction-input',
  templateUrl: 'store-fraction-input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StoreFractionInputComponent implements OnInit, OnDestroy {
  @ViewChild('fractioInputValueSelect', { static: false })
  fractioInputValueSelectElement: NgSelectComponent;

  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.fractioInputValueSelectElement?.close();
  }

  defaultStringValue = 'abc';
  fractionTypeEnum = FractionTypeEnum;
  fieldClassEnum = FieldClassEnum;

  isStoreSuggestEnabled = false; // experimental

  @Input() suggestModelDimension: string;
  @Input() structId: string;
  @Input() chartId: string;
  @Input() dashboardId: string;
  @Input() reportId: string;
  @Input() rowId: string;

  @Input() fraction: Fraction;
  @Input() isFirst: boolean;
  @Input() fractionIndex: number;
  @Input() isDisabled: boolean;
  @Input() fractionControl: FractionControl;

  @Output() fractionUpdate = new EventEmitter<EventFractionUpdate>();

  fractionForm: FormGroup;

  loading = false;
  items: any[] = [];
  searchInput$ = new BehaviorSubject<string>('');

  searchValue: string;

  searchSubscription: Subscription;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private navQuery: NavQuery,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.buildFractionForm();
  }

  ngOnDestroy() {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  onCloseSelect() {
    this.searchValue = '';
    this.items = [];

    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  onOpenSelect() {
    if (
      this.isStoreSuggestEnabled === true &&
      isDefined(this.suggestModelDimension) &&
      (this.fraction.type === FractionTypeEnum.StringIsEqualTo ||
        this.fraction.type === FractionTypeEnum.StringIsNotEqualTo)
    ) {
      let reg = MyRegex.CAPTURE_SUGGEST_MODEL_FIELD_G();

      let r = reg.exec(this.suggestModelDimension);

      let modelId = r[1];
      let fieldId = r[2];

      this.searchSubscription = this.searchInput$
        .pipe(
          debounceTime(300), // Wait 300 ms after user stops typing
          distinctUntilChanged(), // Only trigger if the input has changed
          switchMap(async term => {
            try {
              this.loading = true;
              this.cd.detectChanges();

              let nav = this.navQuery.getValue();

              let payload: ToBackendSuggestDimensionValuesRequestPayload = {
                projectId: nav.projectId,
                repoId: nav.repoId,
                branchId: nav.branchId,
                envId: nav.envId,
                structId: this.structId,
                modelId: modelId,
                fieldId: fieldId,
                chartId: this.chartId,
                dashboardId: this.dashboardId,
                reportId: this.reportId,
                rowId: this.rowId,
                term: term,
                cellMetricsStartDateMs: undefined,
                cellMetricsEndDateMs: undefined
              };

              let q1Resp = await this.apiService
                .req({
                  pathInfoName:
                    ToBackendRequestInfoNameEnum.ToBackendSuggestDimensionValues,
                  payload: payload
                })
                .pipe(
                  tap((resp: ToBackendSuggestDimensionValuesResponse) => {
                    if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
                      return resp;
                    }
                  }),
                  take(1)
                )
                .toPromise();

              if (isDefined(q1Resp.payload.errorMessage)) {
                this.items = isDefinedAndNotEmpty(this.searchValue)
                  ? [
                      {
                        id: 0,
                        name: this.searchValue
                      },
                      {
                        id: 1,
                        name: 'Error: Suggest Values Failed',
                        errorMessage: q1Resp.payload.errorMessage,
                        disabled: true
                      }
                    ]
                  : [
                      {
                        id: 0,
                        name: 'Error: Suggest Values Failed',
                        errorMessage: q1Resp.payload.errorMessage,
                        disabled: true
                      }
                    ];
              } else if (isDefined(q1Resp.payload.matchedValuesMessage)) {
                this.items = isDefinedAndNotEmpty(this.searchValue)
                  ? [
                      {
                        id: 0,
                        name: this.searchValue
                      },
                      {
                        id: 1,
                        name: q1Resp.payload.matchedValuesMessage,
                        disabled: true
                      }
                    ]
                  : [
                      {
                        id: 0,
                        name: q1Resp.payload.matchedValuesMessage,
                        disabled: true
                      }
                    ];
              } else {
                this.items = (q1Resp.payload.matchedValues ?? []).map(
                  (x, i) => ({
                    id: i,
                    name: x.value
                  })
                );

                if (isDefinedAndNotEmpty(this.searchValue)) {
                  let searchValueLc = this.searchValue.toLowerCase();

                  let hasSearchValue = this.items.some(
                    item => item.name?.toLowerCase() === searchValueLc
                  );

                  if (hasSearchValue === false) {
                    this.items = [
                      {
                        id: 0,
                        name: this.searchValue
                      },
                      ...this.items.map(item => {
                        let newItem = Object.assign(item, {
                          id: item.id + 1
                        });

                        return newItem;
                      })
                    ];
                  }
                }
              }
            } catch (error: any) {
              this.loading = false;
              this.cd.detectChanges();

              throw new Error(
                `Failed to get filter suggestions: ${error.message}`
              );
            }

            this.loading = false;
            this.cd.detectChanges();

            return;
          })
        )
        .subscribe();
    }
  }

  buildFractionForm() {
    this.fractionForm = this.fb.group({
      inputValue: [
        this.fractionControl.value,
        Validators.compose([Validators.required, Validators.maxLength(255)])
      ]
    });
  }

  inputValueSearch(searchObj: any) {
    this.searchValue = searchObj.term;
  }

  inputValueChange(item: { value: string; label: string }) {
    (document.activeElement as HTMLElement).blur();

    let newControl = makeCopy(this.fractionControl);

    newControl.value = item.value;

    let newFraction = makeCopy(this.fraction);

    let controlIndex = newFraction.controls.findIndex(
      control => control.name === this.fractionControl.name
    );

    newFraction.controls = [
      ...newFraction.controls.slice(0, controlIndex),
      newControl,
      ...newFraction.controls.slice(controlIndex + 1)
    ];

    this.fraction = newFraction;

    this.emitFractionUpdate();
  }

  emitFractionUpdate() {
    this.fractionUpdate.emit({
      fraction: this.fraction,
      fractionIndex: this.fractionIndex
    });
  }

  inputValueBlur() {
    let value = this.fractionForm.controls['inputValue'].value;

    if (value !== this.fractionControl.value) {
      let newControl = makeCopy(this.fractionControl);

      newControl.value = value;

      let newFraction = makeCopy(this.fraction);

      let controlIndex = newFraction.controls.findIndex(
        control => control.name === this.fractionControl.name
      );

      newFraction.controls = [
        ...newFraction.controls.slice(0, controlIndex),
        newControl,
        ...newFraction.controls.slice(controlIndex + 1)
      ];

      this.fraction = newFraction;

      if (this.fractionForm.valid) {
        this.emitFractionUpdate();
      }
    }
  }
}
