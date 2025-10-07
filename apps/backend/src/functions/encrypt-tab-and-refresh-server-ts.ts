import { TabService } from '~backend/services/tab.service';
import { isDefined } from '~common/functions/is-defined';

export function encryptTabAndRefreshServerTs<
  T extends { serverTs: number; tab: any }
>(item: {
  elements: T[];
  newServerTs: number;
  tabService: TabService;
}) {
  let { elements, newServerTs, tabService } = item;

  if (isDefined(elements)) {
    elements.forEach(element => {
      element.tab = tabService.encrypt({ data: element.tab });

      element.serverTs = newServerTs;
    });
  }
}
