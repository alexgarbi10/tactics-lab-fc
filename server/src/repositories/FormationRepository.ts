import { injectable } from 'inversify';
import { FormationModel, FormationRecord, toFormationRecord } from '../models/Formation.js';
import { FormationRepository } from '../interfaces/repositories/FormationRepository.js';

@injectable()
export class FormationRepositoryAdapter implements FormationRepository {
  async findAll(): Promise<FormationRecord[]> {
    const docs = await FormationModel.find().sort({ createdAt: -1 }).exec();
    return docs.map(toFormationRecord);
  }

  async findById(id: string): Promise<FormationRecord | null> {
    const doc = await FormationModel.findById(id).exec();
    return doc ? toFormationRecord(doc) : null;
  }

  async create(formation: Partial<FormationRecord>): Promise<FormationRecord> {
    const doc = await FormationModel.create(formation);
    return toFormationRecord(doc);
  }

  async update(id: string, formation: Partial<FormationRecord>): Promise<FormationRecord | null> {
    const doc = await FormationModel.findByIdAndUpdate(id, formation, { new: true }).exec();
    return doc ? toFormationRecord(doc) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await FormationModel.findByIdAndDelete(id).exec();
    return result !== null;
  }
}
