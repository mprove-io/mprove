import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  OnChanges,
  Output,
  QueryList,
  Renderer2,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { TdDataTableColumnComponent } from '@covalent/core';
import { Store } from '@ngrx/store';
import { fromEvent as observableFromEvent } from 'rxjs';
import { filter, takeUntil, tap } from 'rxjs/operators';
import * as actions from '@app/store/actions/_index';
import * as api from '@app/api/_index';
import * as interfaces from '@app/interfaces/_index';
import * as selectors from '@app/store/selectors/_index';
import * as services from '@app/services/_index';

@Component({
  moduleId: module.id,
  selector: 'm-drag-table',
  templateUrl: './drag-table.component.html',
  styleUrls: ['./drag-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DragTableComponent implements OnChanges {
  @Input()
  columns: any[] = [];
  @Input()
  filteredData: any[] = [];

  @HostBinding('style.overflow')
  overflow: string = 'auto';

  @HostBinding('style.height')
  height: string = 'auto';

  @ViewChild('scrollSection')
  scrollSection: ElementRef;

  @ViewChildren(TdDataTableColumnComponent)
  tableHead: QueryList<TdDataTableColumnComponent>;

  @Output()
  sort: EventEmitter<{ fieldId: string; desc: boolean }> = new EventEmitter();

  sortings: api.Sorting[] = [];
  sortings$ = this.store.select(selectors.getSelectedMconfigSortings).pipe(
    filter(v => !!v),
    tap(x => (this.sortings = x))
  );

  mConfigSelectIndex = Symbol('selected field item index');
  sortedColumns: any[] = [];

  private columnWrap: {
    fromIndex: number;
    toIndex: number;
    element: HTMLElement;
    className: string;
  } = null;
  private sortOrder: Map<string, number> = new Map([
    ['dimension', 0],
    ['measure', 1],
    ['calculation', 2]
  ]);

  constructor(
    private store: Store<interfaces.AppState>,
    private structService: services.StructService,
    private navigateService: services.NavigateService,
    private renderer: Renderer2
  ) {}

  ngOnChanges(): void {
    this.sortedColumns = this.columns
      .map((item: any, index: number) =>
        Object.assign({}, item, {
          [this.mConfigSelectIndex]: index
        })
      )
      .sort((a: any, b: any) => {
        const aOrder = this.sortOrder.get(a.field_class);
        const bOrder = this.sortOrder.get(b.field_class);

        if (aOrder < bOrder) {
          return -1;
        }

        if (aOrder > bOrder) {
          return 1;
        }

        return 0;
      });
  }

  switchItem(
    dropColumn: TdDataTableColumnComponent,
    className: string,
    toIndex: number
  ): void {
    if (this.columnWrap === null || this.columnWrap.className !== className) {
      return;
    }

    const { element } = this.columnWrap;
    const dropElement = Reflect.get(dropColumn, '_elementRef').nativeElement;

    if (element === dropElement) {
      return;
    }

    const dropElementStyle = getComputedStyle(dropElement);
    const parentElementStyle = getComputedStyle(element);

    const toIndexOrder: number = Number.parseInt(dropElementStyle.order, 10);
    const fromIndexOrder: number = Number.parseInt(
      parentElementStyle.order,
      10
    );

    const leftOffsetDropElement = Number.parseFloat(dropElementStyle.left);
    const leftOffsetParentElement = Number.parseFloat(parentElementStyle.left);

    const widthElement = Number.parseFloat(parentElementStyle.width);

    /*
        if (Math.abs(toIndexOrder - fromIndexOrder) !== 1) {
          this.tableHead.forEach((item: TdDataTableColumnComponent) => {
            let nativeElement = Reflect.get(item, '_elementRef').nativeElement;
            console.log(nativeElement);
          });
        }
    */

    if (toIndexOrder > fromIndexOrder) {
      let leftShift = leftOffsetDropElement - widthElement;
      let rightShift = leftOffsetParentElement + widthElement;
      this.renderer.setStyle(dropElement, 'left', `${leftShift}px`);
      this.renderer.setStyle(element, 'left', `${rightShift}px`);
    } else if (toIndexOrder < fromIndexOrder) {
      let leftShift = leftOffsetDropElement + widthElement;
      let rightShift = leftOffsetParentElement - widthElement;
      this.renderer.setStyle(dropElement, 'left', `${leftShift}px`);
      this.renderer.setStyle(element, 'left', `${rightShift}px`);
    } else {
      return;
    }

    this.columnWrap.toIndex = toIndex; // save drop index

    this.renderer.setStyle(dropElement, 'order', fromIndexOrder);
    this.renderer.setStyle(element, 'order', toIndexOrder);
  }

  touchStart(
    event: TouchEvent,
    columnElement: HTMLDivElement,
    parentElement: TdDataTableColumnComponent,
    className: string,
    columnIndex: number
  ): void {
    const dragElement = columnElement;
    const parentElementForDragElement = Reflect.get(
      parentElement,
      '_elementRef'
    ).nativeElement;
    const offsetWidth = dragElement.offsetWidth;
    const coords = this.getCoords(dragElement);

    observableFromEvent(document, 'touchmove')
      .pipe(takeUntil(observableFromEvent(document, 'touchend')))
      .subscribe(
        (e: TouchEvent) => {
          if (e.touches.length > 1) {
            return;
          }

          const ev = e.touches[0];
          const left = ev.pageX - offsetWidth / 2;

          this.moveElement(
            dragElement,
            parentElementForDragElement,
            coords,
            columnIndex,
            offsetWidth,
            left,
            className
          );
        },
        undefined,
        this.completeDrag.bind(this, dragElement)
      );
  }

  mouseDown(
    event: MouseEvent,
    columnElement: HTMLDivElement,
    parentElement: TdDataTableColumnComponent,
    className: string,
    columnIndex: number
  ): void {
    if (event.which !== 1) {
      return;
    }

    const dragElement = columnElement;
    const parentElementForDragElement = Reflect.get(
      parentElement,
      '_elementRef'
    ).nativeElement;
    const offsetWidth = dragElement.offsetWidth;
    const coords = this.getCoords(dragElement);

    observableFromEvent(document, 'mousemove')
      .pipe(takeUntil(observableFromEvent(document, 'mouseup')))
      .subscribe(
        (ev: MouseEvent) => {
          const left = ev.screenX - offsetWidth / 2;
          /*
                    const point = this.getCoords(dragElement);
                    let elementFromPoint = document.elementFromPoint(point.left, point.top);
                    console.log('elementFromPoint: ', elementFromPoint);*/

          this.moveElement(
            dragElement,
            parentElementForDragElement,
            coords,
            columnIndex,
            offsetWidth,
            left,
            className
          );
        },
        undefined,
        this.completeDrag.bind(this, dragElement)
      );
  }

  completeDrag(dragElement: HTMLElement): void {
    if (this.columnWrap) {
      const { fromIndex, toIndex } = this.columnWrap;
      const [
        newMconfig,
        newQuery
      ] = this.structService.generateMconfigAndQuery();
      const newColumnsOrder = Array.from(newMconfig.select);

      const tmp = newColumnsOrder[fromIndex];
      newColumnsOrder[fromIndex] = newColumnsOrder[toIndex];
      newColumnsOrder[toIndex] = tmp;

      newMconfig.select = newColumnsOrder;

      this.dispatchAndNavigate(newMconfig, newQuery);

      this.columnWrap = null; // remove columnWrap data

      this.renderer.removeStyle(dragElement, 'top');
      this.renderer.removeStyle(dragElement, 'width');

      this.renderer.removeClass(dragElement, 'query-drag-table__th-drag');
      this.renderer.removeClass(document.body, 'clear-select');

      this.moveAt(dragElement); // reset position
    }
  }

  dispatchAndNavigate(newMconfig: api.Mconfig, newQuery: api.Query) {
    this.store.dispatch(new actions.UpdateMconfigsStateAction([newMconfig]));
    this.store.dispatch(new actions.UpdateQueriesStateAction([newQuery]));
    this.store.dispatch(
      new actions.CreateMconfigAndQueryAction({
        mconfig: newMconfig,
        query: newQuery
      })
    );

    setTimeout(
      () =>
        this.navigateService.navigateSwitch(
          newMconfig.mconfig_id,
          newQuery.query_id
        ),
      1
    );
  }

  preventDragStart(): boolean {
    return false;
  }

  moveElement(
    dragElement: HTMLDivElement,
    parentElementForDragElement: HTMLElement,
    coords: { top: number; left: number },
    columnIndex: number,
    offsetWidth: number,
    left: number,
    className: string
  ): void {
    if (this.columnWrap === null) {
      this.columnWrap = {
        fromIndex: columnIndex,
        toIndex: columnIndex,
        element: parentElementForDragElement,
        className: className
      };

      this.renderer.setStyle(dragElement, 'top', coords.top + 'px');
      this.renderer.setStyle(dragElement, 'width', offsetWidth + 'px');

      this.renderer.setStyle(
        parentElementForDragElement,
        'width',
        offsetWidth + 'px'
      );

      this.renderer.addClass(dragElement, 'query-drag-table__th-drag');
      this.renderer.addClass(document.body, 'clear-select');
    }

    this.moveAt(dragElement, left);
  }

  moveAt(element: HTMLElement, left: number = null): void {
    if (left === null) {
      this.renderer.removeStyle(element, 'left');
    } else {
      this.renderer.setStyle(element, 'left', left + 'px');
    }
  }

  getCoords(elem: HTMLElement) {
    const box = elem.getBoundingClientRect();

    const body = document.body;
    const docEl = document.documentElement;

    const scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
    const scrollLeft =
      window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

    const clientTop = docEl.clientTop || body.clientTop || 0;
    const clientLeft = docEl.clientLeft || body.clientLeft || 0;

    const top = box.top + scrollTop - clientTop;
    const left = box.left + scrollLeft - clientLeft;

    return {
      top: top,
      left: left
    };
  }

  onSort(ev: MouseEvent, fieldId: string, desc: boolean): void {
    ev.preventDefault();
    this.sort.emit({ fieldId, desc });
    ev.stopPropagation();
  }

  isAsc(fieldId: string) {
    let fieldSorting = this.sortings.find(s => s.field_id === fieldId);
    return fieldSorting ? !fieldSorting.desc : false;
  }

  isDesc(fieldId: string) {
    let fieldSorting = this.sortings.find(s => s.field_id === fieldId);
    return fieldSorting ? fieldSorting.desc : false;
  }

  getSortingNumber(fieldId: string) {
    let sortingIndex = this.sortings.findIndex(s => s.field_id === fieldId);
    return sortingIndex > -1 ? sortingIndex + 1 : 0;
  }
}
