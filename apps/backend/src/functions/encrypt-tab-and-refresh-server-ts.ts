import { TabService } from '~backend/services/tab.service';
import { isDefined } from '~common/functions/is-defined';

export function encryptTabAndRefreshServerTs<
  T extends { serverTs: number; st: any; lt: any }
>(item: {
  elements: T[];
  newServerTs: number;
  tabService: TabService;
}) {
  let { elements, newServerTs, tabService } = item;

  if (isDefined(elements)) {
    elements.forEach(element => {
      if (isDefined(element.st)) {
        element.st = tabService.encrypt({ data: element.st });
      }

      if (isDefined(element.lt)) {
        element.lt = tabService.encrypt({ data: element.lt });
      }

      element.serverTs = newServerTs;
    });
  }
}
