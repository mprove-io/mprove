import { EntityManager, getManager } from 'typeorm';
import { repositories } from '../../barrels/repositories';

export function getDashboardsRepo(manager?: EntityManager) {
  let entityManager = manager ? manager : getManager();

  return entityManager.getCustomRepository(repositories.DashboardRepository);
}
