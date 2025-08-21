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
import { FileExtensionEnum } from '~common/enums/file-extension.enum';
import { PanelEnum } from '~common/enums/panel.enum';
import { decodeFilePath } from '~common/functions/decode-file-path';
import { encodeFilePath } from '~common/functions/encode-file-path';
import { isDefined } from '~common/functions/is-defined';
import { isUndefined } from '~common/functions/is-undefined';
import { makeId } from '~common/functions/make-id';
import { BmlError } from '~common/interfaces/blockml/bml-error';
import { DiskFileLine } from '~common/interfaces/disk/disk-file-line';
import { getFileExtension } from '~front/app/functions/get-file-extension';
import { transformBlockmlErrorTitle } from '~front/app/functions/transform-blockml-error-title';
import { FileQuery } from '~front/app/queries/file.query';
import { NavQuery } from '~front/app/queries/nav.query';
import { StructQuery, StructState } from '~front/app/queries/struct.query';
import { NavigateService } from '~front/app/services/navigate.service';

export class BmlErrorExtra extends BmlError {
  errorExt: any;
  sortOrder: number;
}

export class BmlErrorsNode {
  title: string;
  message: string;
  lines: DiskFileLine[];
  id: string;
  name: string;
  isError: boolean;
  children: BmlErrorsNode[];
}

@Component({
  standalone: false,
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
            sortOrder: isDefined(errorExt) ? this.errorSortOrder(errorExt) : 1,
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
        let errorId = makeId();

        if (error.lines.length > 0) {
          error.lines.forEach(line => {
            let newErrorNode: BmlErrorsNode = {
              title: error.title,
              message: error.message,
              id: errorId,
              name: null,
              isError: true,
              lines: [line],
              children: []
            };

            let node = nodes.find(y => y.id === line.fileId);

            if (isUndefined(node)) {
              let newNode: BmlErrorsNode = {
                id: line.fileId,
                name: line.fileName,
                title: undefined,
                message: undefined,
                lines: undefined,
                children: [newErrorNode],
                isError: false
              };

              nodes.push(newNode);
            } else {
              let eNode = node.children.find(k => k.id === errorId);

              if (isDefined(eNode)) {
                eNode.lines.push(line);
              } else {
                node.children.push(newErrorNode);
              }
            }
          });
        } else {
          let newErrorNode: BmlErrorsNode = {
            title: error.title,
            message: error.message,
            id: errorId,
            name: null,
            isError: true,
            lines: [],
            children: []
          };

          let newNode: BmlErrorsNode = {
            id: undefined,
            name: 'No file',
            title: undefined,
            message: undefined,
            lines: undefined,
            children: [newErrorNode],
            isError: false
          };

          nodes.push(newNode);
        }
      });

      this.nodes = nodes;

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
      if (isUndefined(x.fileId)) {
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

      let filePath = decodeFilePath({ filePath: x.fileId });

      let fIdAr = filePath.split('/');

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

          if (isDefined(x.fileId)) {
            let filePath = decodeFilePath({ filePath: x.fileId });

            let fileIdAr = filePath.split('/');

            let fileId = [projectId, ...fileIdAr].join('/');

            let node = this.itemsTree.treeModel.getNodeById(fileId);

            if (isDefined(node)) {
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
    //     encodedFileId: node.data.fileId
    //   });
    // }
  }

  errorSortOrder(errorExt: string): number {
    let ext = `.${errorExt}`;

    switch (ext) {
      case 'other':
        return 1;
      case FileExtensionEnum.Yml:
        return 2;
      case FileExtensionEnum.Md:
        return 3;
      case FileExtensionEnum.Store:
        return 7;
      case FileExtensionEnum.Report:
        return 8;
      case FileExtensionEnum.Dashboard:
        return 9;
      case FileExtensionEnum.Chart:
        return 10;
      default:
        return 0;
    }
  }

  goToFileLine(line: DiskFileLine) {
    let lineFileIdAr = line.fileId.split('/');
    lineFileIdAr.shift();

    let filePath = lineFileIdAr.join('/');

    let fileId = encodeFilePath({ filePath: filePath });

    this.navigateService.navigateToFileLine({
      panel: PanelEnum.Tree,
      encodedFileId: fileId,
      lineNumber: line.lineNumber
    });
  }

  ngOnDestroy() {
    // console.log('ngOnDestroyFilesTree');
    this.expandLevel$?.unsubscribe();
  }
}
