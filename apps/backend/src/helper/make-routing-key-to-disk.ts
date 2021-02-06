import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';

export function makeRoutingKeyToDisk(item: {
  organizationId: string;
  projectId: string;
}) {
  let orgGroups: Array<string> = ['abcdefghijklmnopqrstuvwxyz'];

  let projectGroups: Array<string> = [
    'abcd',
    'efgh',
    'ijkl',
    'mnop',
    'qrst',
    'uvwx',
    'yz'
  ];

  let orgFirstLetter = item.organizationId.substring(0, 1).toLowerCase();

  let orgGroup = orgGroups.find(x => x.includes(orgFirstLetter));

  if (!orgGroup) {
    throw new common.ServerError({
      message:
        apiToBackend.ErEnum
          .BACKEND_ORGANIZATION_ID_FIRST_LETTER_DOES_NOT_MATCH_ANY_GROUP
    });
  }

  let projectGroup: string;

  if (item.projectId === null || typeof item.projectId === 'undefined') {
    projectGroup = '';
  } else {
    let projectFirstLetter = item.projectId.substring(0, 1).toLowerCase();

    projectGroup = projectGroups.find(x => x.includes(projectFirstLetter));

    if (!projectGroup) {
      throw new common.ServerError({
        message:
          apiToBackend.ErEnum
            .BACKEND_PROJECT_ID_FIRST_LETTER_DOES_NOT_MATCH_ANY_GROUP
      });
    }
  }

  let routingKey = `${orgGroup}___${projectGroup}`;
  return routingKey;
}
