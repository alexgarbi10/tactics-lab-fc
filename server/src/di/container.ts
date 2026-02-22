import { Container } from 'inversify';
import { FormationRepositoryAdapter } from '../repositories/FormationRepository.js';
import { FormationRepository } from '../interfaces/repositories/FormationRepository.js';

export const container = new Container();

container.bind<FormationRepository>('FormationRepository').to(FormationRepositoryAdapter);
