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
    throw new Error('organizationId first letter does not match any group');
  }

  let projectGroup: string;

  if (item.projectId === null || typeof item.projectId === 'undefined') {
    projectGroup = '';
  } else {
    let projectFirstLetter = item.projectId.substring(0, 1).toLowerCase();

    projectGroup = projectGroups.find(x => x.includes(projectFirstLetter));

    if (!projectGroup) {
      throw new Error('projectId first letter does not match any group');
    }
  }

  let routingKey = `${orgGroup}___${projectGroup}`;
  return routingKey;
}
