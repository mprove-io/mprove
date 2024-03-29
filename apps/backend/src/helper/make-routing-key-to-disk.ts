import { common } from '~backend/barrels/common';

export function makeRoutingKeyToDisk(item: {
  orgId: string;
  projectId: string;
}) {
  let orgGroups: string[] = ['0123456789abcdefghijklmnopqrstuvwxyz'];

  let projectGroups: string[] = [
    '0123456789',
    'abcd',
    'efgh',
    'ijkl',
    'mnop',
    'qrst',
    'uvwx',
    'yz'
  ];

  let orgFirstLetter = item.orgId.substring(0, 1).toLowerCase();

  let orgGroupIndex = orgGroups.findIndex(x => x.includes(orgFirstLetter));

  if (orgGroupIndex < 0) {
    throw new common.ServerError({
      message:
        common.ErEnum.BACKEND_ORG_ID_FIRST_LETTER_DOES_NOT_MATCH_ANY_GROUP
    });
  }

  let projectGroupIndex: number;

  if (common.isDefined(item.projectId)) {
    let projectFirstLetter = item.projectId.substring(0, 1).toLowerCase();

    projectGroupIndex = projectGroups.findIndex(x =>
      x.includes(projectFirstLetter)
    );

    if (projectGroupIndex < 0) {
      throw new common.ServerError({
        message:
          common.ErEnum.BACKEND_PROJECT_ID_FIRST_LETTER_DOES_NOT_MATCH_ANY_GROUP
      });
    }
  }

  let routingKey = common.isDefined(projectGroupIndex)
    ? `${orgGroupIndex}${common.TRIPLE_UNDERSCORE}${projectGroupIndex}`
    : `${orgGroupIndex}${common.TRIPLE_UNDERSCORE}`;

  return routingKey;
}
