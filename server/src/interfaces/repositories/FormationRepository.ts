import { FormationRecord } from '../../models/Formation.js';

export interface FormationRepository {
  findAll(): Promise<FormationRecord[]>;
  findById(id: string): Promise<FormationRecord | null>;
  create(formation: Partial<FormationRecord>): Promise<FormationRecord>;
  update(id: string, formation: Partial<FormationRecord>): Promise<FormationRecord | null>;
  delete(id: string): Promise<boolean>;
}
