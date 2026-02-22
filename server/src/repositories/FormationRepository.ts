import { injectable } from 'inversify';
import { FormationModel, Formation } from '../models/Formation.js';
import { FormationRepository } from '../interfaces/repositories/FormationRepository.js';

@injectable()
export class FormationRepositoryAdapter implements FormationRepository {
  async findAll(): Promise<Formation[]> {
    return FormationModel.find().sort({ createdAt: -1 }).exec();
  }

  async findById(id: string): Promise<Formation | null> {
    return FormationModel.findById(id).exec();
  }

  async create(formation: Partial<Formation>): Promise<Formation> {
    return FormationModel.create(formation);
  }

  async update(id: string, formation: Partial<Formation>): Promise<Formation | null> {
    return FormationModel.findByIdAndUpdate(id, formation, { new: true }).exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await FormationModel.findByIdAndDelete(id).exec();
    return result !== null;
  }
}
