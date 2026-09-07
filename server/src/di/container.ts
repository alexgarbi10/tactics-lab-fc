import { Container } from 'inversify';
import { FormationRepositoryAdapter } from '../repositories/FormationRepository.js';
import { MemoryFormationRepository } from '../repositories/MemoryFormationRepository.js';
import { FormationRepository } from '../interfaces/repositories/FormationRepository.js';

export const container = new Container();

export function bindFormationRepository(useMongo: boolean) {
  if (container.isBound('FormationRepository')) {
    container.unbind('FormationRepository');
  }

  if (useMongo) {
    container.bind<FormationRepository>('FormationRepository').to(FormationRepositoryAdapter);
  } else {
    container
      .bind<FormationRepository>('FormationRepository')
      .to(MemoryFormationRepository)
      .inSingletonScope();
  }
}
