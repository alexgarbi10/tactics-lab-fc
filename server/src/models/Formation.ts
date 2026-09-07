import mongoose, { Schema, Document } from 'mongoose';
import { PositionName } from '../types/roles.js';

export interface AssignedPlayer {
  apiId: number;
  name: string;
  shirtNumber?: number;
  apiPosition: string;
}

export interface PlayerPosition {
  position: PositionName;
  x: number;
  y: number;
  role?: string;
  player?: AssignedPlayer;
}

export interface FormationRecord {
  _id: string;
  name: string;
  shape: string;
  positions: PlayerPosition[];
  substitutes: AssignedPlayer[];
  teamName?: string;
  createdAt: Date;
}

export interface Formation extends Document {
  name: string;
  shape: string;
  positions: PlayerPosition[];
  substitutes: AssignedPlayer[];
  teamName?: string;
  createdAt: Date;
}

const AssignedPlayerSchema = new Schema<AssignedPlayer>({
  apiId: { type: Number, required: true },
  name: { type: String, required: true },
  shirtNumber: { type: Number },
  apiPosition: { type: String, required: true },
});

const PlayerPositionSchema = new Schema<PlayerPosition>({
  position: { type: String, required: true },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  role: { type: String },
  player: { type: AssignedPlayerSchema },
});

const FormationSchema = new Schema<Formation>({
  name: { type: String, required: true },
  shape: { type: String, required: true, default: '4-3-3' },
  positions: { type: [PlayerPositionSchema], required: true },
  substitutes: { type: [AssignedPlayerSchema], default: [] },
  teamName: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const FormationModel = mongoose.model<Formation>('Formation', FormationSchema);

export function toFormationRecord(doc: Formation): FormationRecord {
  const o = doc.toObject();
  return {
    _id: String(o._id),
    name: o.name,
    shape: o.shape,
    positions: o.positions,
    substitutes: o.substitutes,
    teamName: o.teamName,
    createdAt: o.createdAt,
  };
}
