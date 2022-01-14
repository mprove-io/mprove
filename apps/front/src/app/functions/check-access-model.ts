import { common } from '~front/barrels/common';

export function checkAccessModel(item: {
  member: common.Member;
  model: common.Model;
}) {
  let { member, model } = item;

  let canAccessModel =
    member.isExplorer === false
      ? false
      : member.isAdmin === true || member.isEditor === true
      ? true
      : model.accessRoles.length === 0 && model.accessUsers.length === 0
      ? true
      : model.accessUsers.indexOf(member.alias) < 0 &&
        !model.accessRoles.some(x => member.roles.includes(x))
      ? false
      : true;

  return canAccessModel;
}
