import { EntityManager, getManager } from 'typeorm';
import { repositories } from '../../barrels/repositories';

export function getModelsRepo(manager?: EntityManager) {
  let entityManager = manager ? manager : getManager();

  return entityManager.getCustomRepository(repositories.ModelRepository);
}
