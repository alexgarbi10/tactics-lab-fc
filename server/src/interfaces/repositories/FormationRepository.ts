import { Formation } from '../../models/Formation.js';

export interface FormationRepository {
  findAll(): Promise<Formation[]>;
  findById(id: string): Promise<Formation | null>;
  create(formation: Partial<Formation>): Promise<Formation>;
  update(id: string, formation: Partial<Formation>): Promise<Formation | null>;
  delete(id: string): Promise<boolean>;
}
