import { injectable } from 'inversify';
import { FormationRecord } from '../models/Formation.js';
import { FormationRepository } from '../interfaces/repositories/FormationRepository.js';

@injectable()
export class MemoryFormationRepository implements FormationRepository {
  private readonly items = new Map<string, FormationRecord>();
  private nextId = 1;

  async findAll(): Promise<FormationRecord[]> {
    return [...this.items.values()].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }

  async findById(id: string): Promise<FormationRecord | null> {
    return this.items.get(id) ?? null;
  }

  async create(formation: Partial<FormationRecord>): Promise<FormationRecord> {
    const record: FormationRecord = {
      _id: `mem_${this.nextId++}`,
      name: formation.name?.trim() || 'Untitled',
      shape: formation.shape || '4-3-3',
      positions: formation.positions ?? [],
      substitutes: formation.substitutes ?? [],
      teamName: formation.teamName,
      createdAt: new Date(),
    };
    this.items.set(record._id, record);
    return record;
  }

  async update(id: string, formation: Partial<FormationRecord>): Promise<FormationRecord | null> {
    const existing = this.items.get(id);
    if (!existing) return null;
    const updated: FormationRecord = {
      ...existing,
      name: formation.name?.trim() || existing.name,
      shape: formation.shape ?? existing.shape,
      positions: formation.positions ?? existing.positions,
      substitutes: formation.substitutes ?? existing.substitutes,
      teamName: formation.teamName ?? existing.teamName,
    };
    this.items.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.items.delete(id);
  }
}
