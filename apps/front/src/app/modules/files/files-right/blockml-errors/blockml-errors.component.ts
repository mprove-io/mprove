import {
  IActionMapping,
  TreeComponent,
  TreeNode
} from '@ali-hm/angular-tree-component';
import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { Subscription } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import { getFileExtension } from '~front/app/functions/get-file-extension';
import { transformBlockmlErrorTitle } from '~front/app/functions/transform-blockml-error-title';
import { FileQuery } from '~front/app/queries/file.query';
import { NavQuery } from '~front/app/queries/nav.query';
import { StructQuery, StructState } from '~front/app/queries/struct.query';
import { NavigateService } from '~front/app/services/navigate.service';
import { common } from '~front/barrels/common';

export class BmlErrorExtra extends common.BmlError {
  errorExt: any;
  sortOrder: number;
}

export class BmlErrorsNode {
  id: string;
  name: string;
  isError: boolean;
  children: BmlErrorsNode[];
}

@Component({
  selector: 'm-blockml-errors',
  templateUrl: './blockml-errors.component.html',
  styleUrls: ['blockml-errors.component.scss']
})
export class BlockmlErrorsComponent implements OnDestroy {
  errors: BmlErrorExtra[];

  nodes: BmlErrorsNode[];

  struct: StructState;
  struct$ = this.structQuery.select().pipe(
    tap(x => {
      this.struct = x;

      this.errors = x.errors
        .map(error => {
          let errorExt =
            error.lines.length > 0
              ? getFileExtension(error.lines[0].fileId)
              : undefined;

          return Object.assign({}, error, <BmlErrorExtra>{
            errorExt: errorExt,
            sortOrder: common.isDefined(errorExt)
              ? this.errorSortOrder(errorExt)
              : 1,
            title: transformBlockmlErrorTitle(error.title)
          });
        })
        .sort((a, b) => {
          if (a.sortOrder < b.sortOrder) {
            return -1;
          } else if (a.sortOrder > b.sortOrder) {
            return 1;
          } else {
            return 0;
          }
        });

      let nodes: BmlErrorsNode[] = [];

      this.errors.forEach(error => {
        let newError: BmlErrorsNode = Object.assign({}, error, {
          id: common.makeId(),
          name: '123',
          isError: true,
          children: []
        });

        if (error.lines.length > 0) {
          error.lines.forEach(line => {
            let node = nodes.find(y => y.id === line.fileId);

            if (common.isUndefined(node)) {
              let newNode: BmlErrorsNode = {
                id: line.fileId,
                name: line.fileName,
                children: [newError],
                isError: false
              };
              nodes.push(newNode);
            } else {
              node.children.push(newError);
            }
          });
        } else {
          let newNode: BmlErrorsNode = {
            id: undefined,
            name: 'No file',
            children: [newError],
            isError: false
          };
          nodes.push(newNode);
        }
      });

      this.nodes = nodes;

      // console.log(this.nodes);

      this.cd.detectChanges();
    })
  );

  actionMapping: IActionMapping = {
    mouse: {
      // dragStart: () => {
      //   this.cd.detach();
      // },
      // dragEnd: () => {
      //   this.cd.reattach();
      // }
    }
  };

  treeOptions = {
    actionMapping: this.actionMapping,
    displayField: 'name'
  };

  @ViewChild('itemsTree') itemsTree: TreeComponent;

  expandLevel$: Subscription;

  fileNodeId: string;

  file$ = this.fileQuery.select().pipe(
    tap(x => {
      if (common.isUndefined(x.fileId)) {
        this.fileNodeId = undefined;
        this.cd.detectChanges();
        return;
      }

      let projectId;

      this.navQuery
        .select()
        .pipe(
          tap(y => {
            projectId = y.projectId;
          }),
          take(1)
        )
        .subscribe();

      let fIdAr = x.fileId.split(common.TRIPLE_UNDERSCORE);

      this.fileNodeId = [projectId, ...fIdAr].join('/');
      this.cd.detectChanges();
    })
  );

  constructor(
    private fileQuery: FileQuery,
    private structQuery: StructQuery,
    private navigateService: NavigateService,
    private navQuery: NavQuery,
    private cd: ChangeDetectorRef
  ) {}

  treeOnInitialized() {
    if (this.nodes.length === 0) {
      return;
    }

    this.expandLevel$ = this.fileQuery
      .select()
      .pipe(
        tap(x => {
          let projectId: string;
          this.navQuery.projectId$
            .pipe(
              tap(y => {
                projectId = y;
              }),
              take(1)
            )
            .subscribe();

          if (common.isDefined(x.fileId)) {
            let fileIdAr = x.fileId.split(common.TRIPLE_UNDERSCORE);
            let fileId = [projectId, ...fileIdAr].join('/');

            let node = this.itemsTree.treeModel.getNodeById(fileId);

            if (common.isDefined(node)) {
              node.expand();
            }
          }

          this.cd.detectChanges();
        })
      )
      .subscribe();
  }

  treeOnUpdateData() {}

  nodeOnClick(node: TreeNode) {
    node.toggleExpanded();
    // node.toggleActivated();
    // if (node.data.isFolder) {
    //   if (node.hasChildren) {
    //     node.toggleExpanded();
    //   }
    // } else {
    //   this.navigateService.navigateToFileLine({
    //     underscoreFileId: node.data.fileId
    //   });
    // }
  }

  errorSortOrder(errorExt: string): number {
    let ext = `.${errorExt}`;

    switch (ext) {
      case 'other':
        return 1;
      case common.FileExtensionEnum.Yml:
        return 2;
      case common.FileExtensionEnum.Md:
        return 3;
      case common.FileExtensionEnum.Udf:
        return 4;
      case common.FileExtensionEnum.View:
        return 5;
      case common.FileExtensionEnum.Model:
        return 6;
      case common.FileExtensionEnum.Store:
        return 7;
      case common.FileExtensionEnum.Report:
        return 8;
      case common.FileExtensionEnum.Dashboard:
        return 9;
      case common.FileExtensionEnum.Chart:
        return 10;
      default:
        return 0;
    }
  }

  goToFileLine(line: common.DiskFileLine) {
    let lineFileIdAr = line.fileId.split('/');
    lineFileIdAr.shift();

    let fileId = lineFileIdAr.join(common.TRIPLE_UNDERSCORE);

    this.navigateService.navigateToFileLine({
      panel: common.PanelEnum.Tree,
      underscoreFileId: fileId,
      lineNumber: line.lineNumber
    });
  }

  ngOnDestroy() {
    // console.log('ngOnDestroyFilesTree');
    this.expandLevel$?.unsubscribe();
  }
}
