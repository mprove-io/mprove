import { EntityManager, getManager } from 'typeorm';
import { repositories } from '../../barrels/repositories';

export function getUsersRepo(manager?: EntityManager) {

  let entityManager = manager ? manager : getManager();

  return entityManager.getCustomRepository(repositories.UserRepository);
}
