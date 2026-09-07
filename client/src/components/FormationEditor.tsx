import { useState, useEffect, useRef, useCallback } from 'react';
import { ROLES, PositionName } from '../types/roles';
import { parseShirtNumber, shirtLabel } from '../shirtNumber';
import { DEMO_SQUAD, DEMO_TEAM } from '../data/demoSquad';
import {
  listFormations,
  createFormation,
  updateFormation,
  deleteFormation,
} from '../storage/formations';

// ─── Types ───────────────────────────────────────────────────────────────────

interface AssignedPlayer {
  apiId: number;
  name: string;
  shirtNumber?: number;
  apiPosition: string;
}

interface PitchSlot {
  position: PositionName;
  x: number;
  y: number;
  role?: string;
  player?: AssignedPlayer;
}

interface SavedFormation {
  _id: string;
  name: string;
  shape: string;
  positions: PitchSlot[];
  substitutes: AssignedPlayer[];
  teamName?: string;
}

interface ApiTeam {
  id: number;
  name: string;
  logo: string;
  country: string;
}

interface SquadPlayer {
  id: number;
  name: string;
  shirtNumber?: number;
  position: string;
  photo: string;
}

// ─── Formation presets ────────────────────────────────────────────────────────

const PRESETS: Record<string, Omit<PitchSlot, 'role' | 'player'>[]> = {
  '4-3-3': [
    { position: 'GK',  x: 50, y: 88 },
    { position: 'LB',  x: 14, y: 71 }, { position: 'CB', x: 37, y: 75 },
    { position: 'CB',  x: 63, y: 75 }, { position: 'RB', x: 86, y: 71 },
    { position: 'CDM', x: 50, y: 53 }, { position: 'CM', x: 27, y: 41 },
    { position: 'CM',  x: 73, y: 41 },
    { position: 'LW',  x: 12, y: 18 }, { position: 'ST', x: 50, y: 11 },
    { position: 'RW',  x: 88, y: 18 },
  ],
  '4-4-2': [
    { position: 'GK', x: 50, y: 88 },
    { position: 'LB', x: 14, y: 71 }, { position: 'CB', x: 37, y: 75 },
    { position: 'CB', x: 63, y: 75 }, { position: 'RB', x: 86, y: 71 },
    { position: 'LM', x: 12, y: 48 }, { position: 'CM', x: 36, y: 42 },
    { position: 'CM', x: 64, y: 42 }, { position: 'RM', x: 88, y: 48 },
    { position: 'ST', x: 36, y: 13 }, { position: 'ST', x: 64, y: 13 },
  ],
  '4-2-3-1': [
    { position: 'GK',  x: 50, y: 88 },
    { position: 'LB',  x: 14, y: 71 }, { position: 'CB',  x: 37, y: 75 },
    { position: 'CB',  x: 63, y: 75 }, { position: 'RB',  x: 86, y: 71 },
    { position: 'CDM', x: 34, y: 57 }, { position: 'CDM', x: 66, y: 57 },
    { position: 'LM',  x: 13, y: 36 }, { position: 'CAM', x: 50, y: 32 },
    { position: 'RM',  x: 87, y: 36 }, { position: 'ST',  x: 50, y: 11 },
  ],
  '3-5-2': [
    { position: 'GK', x: 50, y: 88 },
    { position: 'CB', x: 27, y: 75 }, { position: 'CB', x: 50, y: 79 },
    { position: 'CB', x: 73, y: 75 },
    { position: 'LM', x: 10, y: 51 }, { position: 'CM', x: 30, y: 46 },
    { position: 'CM', x: 50, y: 50 }, { position: 'CM', x: 70, y: 46 },
    { position: 'RM', x: 90, y: 51 },
    { position: 'ST', x: 36, y: 17 }, { position: 'ST', x: 64, y: 17 },
  ],
  '3-4-3': [
    { position: 'GK', x: 50, y: 88 },
    { position: 'CB', x: 27, y: 75 }, { position: 'CB', x: 50, y: 79 },
    { position: 'CB', x: 73, y: 75 },
    { position: 'LM', x: 11, y: 50 }, { position: 'CM', x: 36, y: 44 },
    { position: 'CM', x: 64, y: 44 }, { position: 'RM', x: 89, y: 50 },
    { position: 'LW', x: 14, y: 17 }, { position: 'ST', x: 50, y: 10 },
    { position: 'RW', x: 86, y: 17 },
  ],
  '5-3-2': [
    { position: 'GK',  x: 50, y: 88 },
    { position: 'LB',  x: 10, y: 68 }, { position: 'CB', x: 28, y: 75 },
    { position: 'CB',  x: 50, y: 79 }, { position: 'CB', x: 72, y: 75 },
    { position: 'RB',  x: 90, y: 68 },
    { position: 'CM',  x: 28, y: 48 }, { position: 'CM', x: 50, y: 44 },
    { position: 'CM',  x: 72, y: 48 },
    { position: 'ST',  x: 36, y: 17 }, { position: 'ST', x: 64, y: 17 },
  ],
  '4-1-4-1': [
    { position: 'GK',  x: 50, y: 88 },
    { position: 'LB',  x: 14, y: 72 }, { position: 'CB',  x: 37, y: 76 },
    { position: 'CB',  x: 63, y: 76 }, { position: 'RB',  x: 86, y: 72 },
    { position: 'CDM', x: 50, y: 59 },
    { position: 'LM',  x: 11, y: 43 }, { position: 'CM',  x: 36, y: 40 },
    { position: 'CM',  x: 64, y: 40 }, { position: 'RM',  x: 89, y: 43 },
    { position: 'ST',  x: 50, y: 11 },
  ],
  '4-3-2-1': [
    { position: 'GK',  x: 50, y: 88 },
    { position: 'LB',  x: 14, y: 72 }, { position: 'CB',  x: 37, y: 76 },
    { position: 'CB',  x: 63, y: 76 }, { position: 'RB',  x: 86, y: 72 },
    { position: 'CDM', x: 28, y: 57 }, { position: 'CM',  x: 50, y: 52 },
    { position: 'CDM', x: 72, y: 57 },
    { position: 'CAM', x: 35, y: 32 }, { position: 'CAM', x: 65, y: 32 },
    { position: 'ST',  x: 50, y: 11 },
  ],
  '4-5-1': [
    { position: 'GK',  x: 50, y: 88 },
    { position: 'LB',  x: 14, y: 72 }, { position: 'CB',  x: 37, y: 76 },
    { position: 'CB',  x: 63, y: 76 }, { position: 'RB',  x: 86, y: 72 },
    { position: 'LM',  x: 11, y: 48 }, { position: 'CM',  x: 30, y: 43 },
    { position: 'CM',  x: 50, y: 46 }, { position: 'CM',  x: 70, y: 43 },
    { position: 'RM',  x: 89, y: 48 }, { position: 'ST',  x: 50, y: 11 },
  ],
  '3-6-1': [
    { position: 'GK',  x: 50, y: 88 },
    { position: 'CB',  x: 27, y: 76 }, { position: 'CB',  x: 50, y: 80 },
    { position: 'CB',  x: 73, y: 76 },
    { position: 'LM',  x: 10, y: 52 }, { position: 'CDM', x: 30, y: 56 },
    { position: 'CM',  x: 40, y: 42 }, { position: 'CM',  x: 60, y: 42 },
    { position: 'CDM', x: 70, y: 56 }, { position: 'RM',  x: 90, y: 52 },
    { position: 'ST',  x: 50, y: 11 },
  ],
};

// ─── Colours ──────────────────────────────────────────────────────────────────

const POS_COLOR: Record<string, string> = {
  GK:  'bg-amber-400   border-amber-200   text-gray-900',
  CB:  'bg-blue-600    border-blue-400    text-white',
  LB:  'bg-blue-600    border-blue-400    text-white',
  RB:  'bg-blue-600    border-blue-400    text-white',
  CDM: 'bg-teal-600    border-teal-400    text-white',
  CM:  'bg-teal-600    border-teal-400    text-white',
  CAM: 'bg-teal-500    border-teal-300    text-white',
  LM:  'bg-teal-600    border-teal-400    text-white',
  RM:  'bg-teal-600    border-teal-400    text-white',
  LW:  'bg-rose-500    border-rose-300    text-white',
  RW:  'bg-rose-500    border-rose-300    text-white',
  CF:  'bg-rose-600    border-rose-400    text-white',
  ST:  'bg-rose-600    border-rose-400    text-white',
};

const POS_BADGE: Record<string, string> = {
  GK: 'bg-amber-500', CB: 'bg-blue-700', LB: 'bg-blue-700', RB: 'bg-blue-700',
  CDM: 'bg-teal-700', CM: 'bg-teal-700', CAM: 'bg-teal-600',
  LM: 'bg-teal-700',  RM: 'bg-teal-700',
  LW: 'bg-rose-600',  RW: 'bg-rose-600', CF: 'bg-rose-700', ST: 'bg-rose-700',
};

function shortPos(apiPos: string): string {
  const m: Record<string, string> = {
    Goalkeeper: 'GK', Defender: 'DEF', Midfielder: 'MID',
    Attacker: 'FWD', Forward: 'FWD',
  };
  return m[apiPos] ?? apiPos.slice(0, 3).toUpperCase();
}

function lastName(fullName: string) {
  const parts = fullName.trim().split(' ');
  return parts.length > 1 ? parts[parts.length - 1] : fullName;
}

function makeSlots(shape: string): PitchSlot[] {
  return (PRESETS[shape] ?? PRESETS['4-3-3']).map(s => ({ ...s }));
}

// ─── Pitch markings SVG ───────────────────────────────────────────────────────

function PitchMarkings() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 100 145"
      preserveAspectRatio="none"
    >
      {/* Outer border */}
      <rect x="2" y="2" width="96" height="141" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="0.5" />
      {/* Centre line */}
      <line x1="2" y1="72.5" x2="98" y2="72.5" stroke="rgba(255,255,255,0.22)" strokeWidth="0.5" />
      {/* Centre circle */}
      <circle cx="50" cy="72.5" r="11" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="0.5" />
      <circle cx="50" cy="72.5" r="0.7" fill="rgba(255,255,255,0.35)" />
      {/* Top penalty area */}
      <rect x="19" y="2" width="62" height="21" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="0.5" />
      <rect x="33" y="2" width="34" height="9.5" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="0.5" />
      <circle cx="50" cy="14" r="0.7" fill="rgba(255,255,255,0.35)" />
      <path d="M 40 23 A 9 9 0 0 0 60 23" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.5" />
      {/* Bottom penalty area */}
      <rect x="19" y="122" width="62" height="21" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="0.5" />
      <rect x="33" y="133" width="34" height="10" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="0.5" />
      <circle cx="50" cy="131" r="0.7" fill="rgba(255,255,255,0.35)" />
      <path d="M 40 122 A 9 9 0 0 1 60 122" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.5" />
      {/* Goals */}
      <rect x="41" y="0.5" width="18" height="1.5" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
      <rect x="41" y="143" width="18" height="1.5" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
      {/* Corner arcs */}
      <path d="M 2 5 A 3 3 0 0 0 5 2" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
      <path d="M 95 2 A 3 3 0 0 0 98 5" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
      <path d="M 2 140 A 3 3 0 0 1 5 143" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
      <path d="M 95 143 A 3 3 0 0 1 98 140" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
    </svg>
  );
}

// ─── Role Popover ─────────────────────────────────────────────────────────────

function RolePopover({
  slot, onRoleChange, onShirtChange, onRemove, onClose,
}: {
  slot: PitchSlot;
  onRoleChange: (r: string) => void;
  onShirtChange: (n: number | undefined) => void;
  onRemove: () => void;
  onClose: () => void;
}) {
  const roles = ROLES[slot.position] ?? [];
  // Prefer showing above the node so it doesn't go off-screen at bottom
  const isLow = slot.y > 70;

  return (
    <div
      className="absolute z-40 bg-gray-950 border border-gray-700 rounded-2xl shadow-2xl p-4 w-56"
      style={isLow
        ? { bottom: '115%', left: '50%', transform: 'translateX(-50%)' }
        : { top: '115%',   left: '50%', transform: 'translateX(-50%)' }
      }
      onClick={e => e.stopPropagation()}
    >
      {/* Title row */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className={`text-xs font-bold px-1.5 py-0.5 rounded mr-1.5 ${POS_BADGE[slot.position] ?? 'bg-gray-600'}`}>
            {slot.position}
          </span>
          {slot.player && (
            <span className="text-sm font-semibold text-white">{lastName(slot.player.name)}</span>
          )}
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-white text-xl leading-none transition-colors">×</button>
      </div>

      {slot.player && (
        <>
          <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">Shirt</label>
          <input
            type="text"
            inputMode="numeric"
            value={slot.player.shirtNumber === undefined ? '' : String(slot.player.shirtNumber)}
            onChange={e => onShirtChange(parseShirtNumber(e.target.value))}
            placeholder="none · 0–999"
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 mb-3"
          />
        </>
      )}

      {/* Role picker */}
      <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">Role</label>
      <select
        value={slot.role ?? ''}
        onChange={e => onRoleChange(e.target.value)}
        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 mb-3"
      >
        <option value="">— Unassigned —</option>
        {roles.map(r => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>

      {slot.player && (
        <button
          onClick={onRemove}
          className="w-full text-sm py-1.5 rounded-lg bg-red-900/50 hover:bg-red-800 text-red-300 hover:text-white transition-colors"
        >
          Remove player
        </button>
      )}
    </div>
  );
}

// ─── Squad player card (sidebar list) ────────────────────────────────────────

function SquadCard({
  player, selected, onSelect, onDragStart,
}: {
  player: SquadPlayer;
  selected: boolean;
  onSelect: () => void;
  onDragStart: (e: React.DragEvent) => void;
}) {
  const pos = shortPos(player.position);
  const badge = POS_BADGE[pos] ?? (
    player.position === 'Defender' ? POS_BADGE.CB :
    player.position === 'Midfielder' ? POS_BADGE.CM :
    player.position === 'Goalkeeper' ? POS_BADGE.GK :
    POS_BADGE.ST
  );

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onSelect}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer select-none transition-all ${
        selected
          ? 'bg-blue-600/80 border border-blue-400/70 shadow-md'
          : 'bg-gray-800/70 border border-gray-700/60 hover:border-gray-600 hover:bg-gray-800'
      }`}
    >
      {/* Number or position */}
      <div className="w-7 h-7 rounded-full bg-gray-700/80 border border-gray-600 flex items-center justify-center text-[11px] font-bold shrink-0 text-white">
        {shirtLabel(player.shirtNumber)}
      </div>
      <span className="flex-1 text-sm font-medium truncate text-white">{player.name}</span>
      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 text-white ${badge}`}>{pos}</span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function FormationEditor() {
  // Formation state
  const [shape, setShape] = useState('4-3-3');
  const [slots, setSlots] = useState<PitchSlot[]>(makeSlots('4-3-3'));
  const [subs, setSubs] = useState<AssignedPlayer[]>([]);
  const [teamName, setTeamName] = useState('');

  // Persist / load
  const [savedFormations, setSavedFormations] = useState<SavedFormation[]>([]);
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const [saveName, setSaveName] = useState('4-3-3');
  const [saving, setSaving] = useState(false);
  const [showSavedDropdown, setShowSavedDropdown] = useState(false);
  const [persistError, setPersistError] = useState('');

  // Squad search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<ApiTeam | null>(null);
  const [squad, setSquad] = useState<SquadPlayer[]>([]);
  const [squadError, setSquadError] = useState('');

  // Interaction
  const [selectedPlayer, setSelectedPlayer] = useState<SquadPlayer | null>(null);
  const [openPopover, setOpenPopover] = useState<number | null>(null);
  const [draggingSlot, setDraggingSlot] = useState<number | null>(null);
  const [dragPayload, setDragPayload] = useState<{ player: AssignedPlayer; from: 'squad' | 'bench' } | null>(null);

  const pitchRef = useRef<HTMLDivElement>(null);
  const savedDropdownRef = useRef<HTMLDivElement>(null);
  const dragPayloadRef = useRef<{ player: AssignedPlayer; from: 'squad' | 'bench' } | null>(null);
  const nextCustomId = useRef(100001);
  const [customPosition, setCustomPosition] = useState('Midfielder');
  const [customNumber, setCustomNumber] = useState('');

  // ── Load saved formations ──
  useEffect(() => {
    setSavedFormations(listFormations() as SavedFormation[]);
  }, []);

  // Close saved dropdown on outside click
  useEffect(() => {
    if (!showSavedDropdown) return;
    const handler = (e: MouseEvent) => {
      if (savedDropdownRef.current && !savedDropdownRef.current.contains(e.target as Node)) {
        setShowSavedDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showSavedDropdown]);

  // Close popover on outside click
  useEffect(() => {
    if (openPopover === null) return;
    const handler = () => setOpenPopover(null);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [openPopover]);

  // ── Formation change ──
  const changeShape = (newShape: string) => {
    const newPreset = PRESETS[newShape] ?? PRESETS['4-3-3'];
    setShape(newShape);
    // Keep assigned players on the pitch — map them by position order
    const currentAssigned = slots
      .filter(s => s.player)
      .sort((a, b) => {
        const order = ['GK','CB','LB','RB','CDM','CM','CAM','LM','RM','LW','RW','CF','ST'];
        return order.indexOf(a.position) - order.indexOf(b.position);
      });
    const newSlots: PitchSlot[] = newPreset.map((preset, i) => ({
      ...preset,
      player: currentAssigned[i]?.player,
      role: undefined,
    }));
    setSlots(newSlots);
    setSaveName(prev => (prev === shape ? newShape : prev));
    setOpenPopover(null);
  };

  // ── Save ──
  const handleSave = async () => {
    if (!saveName.trim()) return;
    setSaving(true);
    setPersistError('');
    try {
      const body = { name: saveName, shape, positions: slots, substitutes: subs, teamName: teamName || undefined };
      if (loadedId) {
        const updated = updateFormation(loadedId, body);
        if (!updated) {
          setPersistError('Formation not found.');
          return;
        }
        setSavedFormations(prev => prev.map(f => f._id === loadedId ? updated as SavedFormation : f));
      } else {
        const created = createFormation(body) as SavedFormation;
        setSavedFormations(prev => [created, ...prev]);
        setLoadedId(created._id);
      }
    } catch {
      setPersistError('Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleNew = () => {
    setLoadedId(null);
    setSaveName(shape);
    setPersistError('');
  };

  const loadSaved = (f: SavedFormation) => {
    setShape(f.shape);
    setSlots(f.positions);
    setSubs(f.substitutes ?? []);
    setTeamName(f.teamName ?? '');
    setLoadedId(f._id);
    setSaveName(f.name);
    setShowSavedDropdown(false);
    setOpenPopover(null);
  };

  const deleteSaved = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this formation?')) return;
    deleteFormation(id);
    setSavedFormations(prev => prev.filter(f => f._id !== id));
    if (loadedId === id) { setLoadedId(null); setSaveName(''); }
  };

  // ── Squad search ──
  const addCustomPlayer = () => {
    const name = searchQuery.trim();
    if (!name) return;
    setSquadError('');
    const shirt = parseShirtNumber(customNumber);
    const player: SquadPlayer = {
      id: nextCustomId.current++,
      name,
      shirtNumber: shirt,
      position: customPosition,
      photo: '',
    };
    setSquad(prev => [...prev, player]);
    setSelectedPlayer(player);
    setSearchQuery('');
    setCustomNumber('');
  };

  const loadDemoSquad = () => {
    setSquadError('');
    setSquad(DEMO_SQUAD.map(p => ({ ...p })));
    setSelectedTeam(DEMO_TEAM);
    setTeamName(DEMO_TEAM.name);
    setSaveName(prev => prev === shape || prev === '' ? DEMO_TEAM.name : prev);
  };
  // ── Computed ──
  const assignedIds = new Set<number>([
    ...slots.filter(s => s.player).map(s => s.player!.apiId),
    ...subs.map(s => s.apiId),
  ]);
  const availablePlayers = squad.filter(p => !assignedIds.has(p.id));
  const filledCount = slots.filter(s => s.player).length;

  // ── Assign player to slot ──
  const assignToSlot = useCallback((player: AssignedPlayer, slotIdx: number, from: 'squad' | 'bench') => {
    setSlots(prev => {
      const next = [...prev];
      const displaced = next[slotIdx].player;
      next[slotIdx] = { ...next[slotIdx], player };
      if (displaced) {
        setSubs(s => {
          if (s.some(x => x.apiId === displaced.apiId)) return s;
          if (s.length >= 9) return s;
          return [...s, displaced];
        });
      }
      return next;
    });
    if (from === 'bench') setSubs(s => s.filter(x => x.apiId !== player.apiId));
    setSelectedPlayer(null);
  }, []);

  // ── Slot click: assign selected player or open popover ──
  const onSlotClick = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedPlayer) {
      assignToSlot(
        { apiId: selectedPlayer.id, name: selectedPlayer.name, shirtNumber: selectedPlayer.shirtNumber, apiPosition: selectedPlayer.position },
        idx, 'squad'
      );
    } else {
      setOpenPopover(prev => prev === idx ? null : idx);
    }
  };

  const removeFromSlot = (idx: number) => {
    setSlots(prev => {
      const next = [...prev];
      const p = next[idx].player;
      if (p) {
        setSubs(s => {
          if (s.some(x => x.apiId === p.apiId)) return s;
          if (s.length >= 9) return s;
          return [...s, p];
        });
      }
      next[idx] = { ...next[idx], player: undefined };
      return next;
    });
    setOpenPopover(null);
  };

  // ── Bench: add from available ──
  const addToBench = (player: SquadPlayer) => {
    const ap: AssignedPlayer = { apiId: player.id, name: player.name, shirtNumber: player.shirtNumber, apiPosition: player.position };
    setSubs(s => {
      if (s.some(x => x.apiId === ap.apiId)) return s;
      if (s.length >= 9) return s;
      return [...s, ap];
    });
    setSelectedPlayer(null);
  };

  // ── HTML5 Drag & Drop ──
  const onSquadDragStart = (e: React.DragEvent, p: SquadPlayer) => {
    const payload = { player: { apiId: p.id, name: p.name, shirtNumber: p.shirtNumber, apiPosition: p.position }, from: 'squad' as const };
    dragPayloadRef.current = payload;
    setDragPayload(payload);
    e.dataTransfer.setData('text/plain', String(p.id));
    e.dataTransfer.effectAllowed = 'move';
  };

  const onBenchDragStart = (e: React.DragEvent, p: AssignedPlayer) => {
    const payload = { player: p, from: 'bench' as const };
    dragPayloadRef.current = payload;
    setDragPayload(payload);
    e.dataTransfer.setData('text/plain', String(p.apiId));
    e.dataTransfer.effectAllowed = 'move';
  };

  const onSlotDragOver = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };

  const onSlotDrop = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    const payload = dragPayloadRef.current ?? dragPayload;
    if (payload) assignToSlot(payload.player, idx, payload.from);
    dragPayloadRef.current = null;
    setDragPayload(null);
  };

  const onBenchDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const payload = dragPayloadRef.current ?? dragPayload;
    if (!payload) return;
    if (payload.from === 'squad') addToBench({ id: payload.player.apiId, name: payload.player.name, shirtNumber: payload.player.shirtNumber, position: payload.player.apiPosition, photo: '' });
    dragPayloadRef.current = null;
    setDragPayload(null);
  };

  // ── Pitch node dragging (repositioning) ──
  const onNodeMouseDown = (e: React.MouseEvent, idx: number) => {
    if (openPopover !== null || selectedPlayer) return;
    e.preventDefault();
    setDraggingSlot(idx);
  };

  const onPitchMouseMove = (e: React.MouseEvent) => {
    if (draggingSlot === null || !pitchRef.current) return;
    const rect = pitchRef.current.getBoundingClientRect();
    const x = Math.max(4, Math.min(96, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(4, Math.min(96, ((e.clientY - rect.top) / rect.height) * 100));
    setSlots(prev => prev.map((s, i) => i === draggingSlot ? { ...s, x, y } : s));
  };

  const onPitchMouseUp = () => setDraggingSlot(null);

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-0 h-full">

      {/* ── Header bar ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">

        {/* Team logo + name */}
        <div className="flex items-center gap-2 min-w-0">
          {selectedTeam?.logo ? (
            <img src={selectedTeam.logo} alt="" className="w-7 h-7 object-contain shrink-0" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-gray-700 border border-gray-600 flex items-center justify-center text-gray-400 shrink-0">
              <span className="text-xs">⚽</span>
            </div>
          )}
          <span className="text-base font-bold text-white truncate max-w-[160px]">
            {teamName || 'No team selected'}
          </span>
        </div>

        <div className="h-5 w-px bg-gray-700 shrink-0" />

        {/* Formation dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <label className="text-xs text-gray-400 uppercase tracking-wide shrink-0">Formation</label>
          <select
            value={shape}
            onChange={e => changeShape(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm font-semibold text-white focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            {Object.keys(PRESETS).map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="h-5 w-px bg-gray-700 shrink-0" />

        {/* Players counter */}
        <div className="text-sm shrink-0">
          <span className={filledCount === 11 ? 'text-emerald-400 font-semibold' : 'text-gray-400'}>
            {filledCount}/11
          </span>
          <span className="text-gray-600 mx-1">·</span>
          <span className="text-gray-400">{subs.length} subs</span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Save controls */}
        <div className="flex items-center gap-2 shrink-0">
          <input
            type="text"
            value={saveName}
            onChange={e => setSaveName(e.target.value)}
            placeholder="Formation name…"
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 w-44"
          />
          <button
            onClick={handleSave}
            disabled={saving || !saveName.trim()}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg text-sm font-semibold transition-colors"
          >
            {saving ? 'Saving…' : loadedId ? 'Update' : 'Save'}
          </button>
          {loadedId && (
            <button
              onClick={handleNew}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm text-gray-300 transition-colors"
            >
              New
            </button>
          )}

          {/* Saved dropdown */}
          <div className="relative" ref={savedDropdownRef}>
            <button
              onClick={() => setShowSavedDropdown(v => !v)}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm text-gray-300 transition-colors flex items-center gap-1.5"
            >
              Saved <span className="text-gray-500 text-xs">({savedFormations.length})</span>
              <span className="text-gray-500">▾</span>
            </button>

            {showSavedDropdown && (
              <div className="absolute right-0 top-full mt-1.5 z-50 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-72 overflow-hidden">
                {savedFormations.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-6">No saved formations yet.</p>
                ) : (
                  <div className="max-h-80 overflow-y-auto">
                    {savedFormations.map(f => (
                      <div
                        key={f._id}
                        onClick={() => loadSaved(f)}
                        className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors group ${
                          loadedId === f._id ? 'bg-blue-800/40' : 'hover:bg-gray-800'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-white truncate">{f.name}</div>
                          <div className="text-xs text-gray-400">
                            {f.shape}{f.teamName ? ` · ${f.teamName}` : ''}
                          </div>
                        </div>
                        <button
                          onClick={e => deleteSaved(f._id, e)}
                          className="text-gray-600 hover:text-red-400 text-lg leading-none opacity-0 group-hover:opacity-100 transition-all shrink-0"
                        >×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {persistError && (
        <p className="mb-3 text-sm text-red-300 bg-red-900/30 border border-red-800/50 rounded-lg px-3 py-2">
          {persistError}
        </p>
      )}
      <div className="flex gap-4 flex-1 min-h-0">

        {/* ── LEFT: Pitch + Bench ──────────────────────────────────────────── */}
        <div className="flex flex-col gap-3 flex-1 min-w-0">

          {/* Pitch */}
          <div
            ref={pitchRef}
            className="relative rounded-2xl overflow-hidden select-none flex-1"
            style={{
              background: 'linear-gradient(180deg, #134e1e 0%, #155d23 25%, #186428 50%, #155d23 75%, #134e1e 100%)',
              minHeight: 480,
            }}
            onMouseMove={onPitchMouseMove}
            onMouseUp={onPitchMouseUp}
            onMouseLeave={onPitchMouseUp}
            onClick={() => { setOpenPopover(null); }}
          >
            <PitchMarkings />

            {/* Pitch nodes */}
            {slots.map((slot, idx) => {
              const colors = POS_COLOR[slot.position] ?? 'bg-gray-600 border-gray-400 text-white';
              const isOpen = openPopover === idx;
              const isActive = draggingSlot === idx;
              const isTarget = (dragPayload !== null) || (selectedPlayer !== null);

              return (
                <div
                  key={idx}
                  className={`absolute flex flex-col items-center gap-0.5 transition-transform ${isActive ? 'z-30 scale-110' : 'z-10'}`}
                  style={{ left: `${slot.x}%`, top: `${slot.y}%`, transform: 'translate(-50%, -50%)' }}
                  onMouseDown={e => onNodeMouseDown(e, idx)}
                  onClick={e => onSlotClick(idx, e)}
                  onDragOver={onSlotDragOver}
                  onDrop={e => onSlotDrop(e, idx)}
                >
                  {/* Circle node */}
                  <div className={`
                    relative w-12 h-12 rounded-full border-2 flex flex-col items-center justify-center shadow-lg cursor-pointer
                    transition-all group ${colors}
                    ${isTarget ? 'ring-2 ring-white/50 hover:ring-white/80 hover:scale-110' : 'hover:scale-105 hover:shadow-xl'}
                    ${isOpen ? 'ring-2 ring-white scale-110' : ''}
                  `}>
                    {/* Shirt number badge */}
                    {slot.player?.shirtNumber !== undefined && (
                      <div className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-0.5 rounded-full bg-gray-900/90 border border-gray-600 flex items-center justify-center text-[9px] font-bold text-white leading-none">
                        {slot.player.shirtNumber}
                      </div>
                    )}

                    {slot.player ? (
                      <span className="text-xs font-bold leading-none text-center px-0.5 truncate max-w-[44px]">
                        {lastName(slot.player.name)}
                      </span>
                    ) : (
                      <span className="text-xs font-bold leading-none">{slot.position}</span>
                    )}
                  </div>

                  {/* Role chip below node */}
                  {(slot.player || slot.role) && (
                    <div className={`
                      text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-black/50 text-white/80
                      whitespace-nowrap backdrop-blur-sm leading-none
                    `}>
                      {slot.role ?? slot.position}
                    </div>
                  )}

                  {/* Popover */}
                  {isOpen && (
                    <RolePopover
                      slot={slot}
                      onRoleChange={r => setSlots(prev => prev.map((s, i) => i === idx ? { ...s, role: r || undefined } : s))}
                      onShirtChange={n => setSlots(prev => prev.map((s, i) => (
                        i === idx && s.player ? { ...s, player: { ...s.player, shirtNumber: n } } : s
                      )))}
                      onRemove={() => removeFromSlot(idx)}
                      onClose={() => setOpenPopover(null)}
                    />
                  )}
                </div>
              );
            })}

            {/* Selection hint */}
            {selectedPlayer && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none">
                <div className="bg-black/75 backdrop-blur text-white text-xs px-4 py-2 rounded-full border border-white/20">
                  Click a position to place <strong>{lastName(selectedPlayer.name)}</strong>
                </div>
              </div>
            )}
          </div>

          {/* Bench */}
          <div
            className="bg-gray-800/50 border border-gray-700/60 rounded-xl px-4 py-3"
            onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
            onDrop={onBenchDrop}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Bench</span>
              <span className="text-xs text-gray-600">{subs.length}/9</span>
            </div>
            {subs.length === 0 ? (
              <p className="text-xs text-gray-600 text-center py-1">
                Drag players from the squad panel here, or click a player then "Add to bench"
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {subs.map(p => {
                  const posShort = shortPos(p.apiPosition);
                  const badge = POS_BADGE[posShort] ?? POS_BADGE.CM;
                  return (
                    <div
                      key={p.apiId}
                      draggable
                      onDragStart={e => onBenchDragStart(e, p)}
                      className="flex items-center gap-1.5 bg-gray-700/80 border border-gray-600/60 rounded-lg px-2.5 py-1.5 text-sm group cursor-grab"
                    >
                      {p.shirtNumber !== undefined && (
                        <span className="min-w-5 h-5 px-0.5 rounded-full bg-gray-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                          {p.shirtNumber}
                        </span>
                      )}
                      <span className="text-sm truncate max-w-[90px]">{lastName(p.name)}</span>
                      <span className={`text-[10px] font-bold px-1 py-0.5 rounded-md ${badge}`}>{posShort}</span>
                      <button
                        onClick={() => setSubs(s => s.filter(x => x.apiId !== p.apiId))}
                        className="text-gray-600 hover:text-red-400 text-base leading-none opacity-0 group-hover:opacity-100 transition-all ml-0.5"
                      >×</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Squad panel ───────────────────────────────────────────── */}
        <div className="w-72 flex flex-col gap-3 shrink-0">

          {/* Search */}
          <div className="bg-gray-800/50 border border-gray-700/60 rounded-xl p-3">
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCustomPlayer()}
                placeholder="Player name"
                className="flex-1 bg-gray-700/80 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={addCustomPlayer}
                disabled={!searchQuery.trim()}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg text-sm font-semibold transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex gap-2 mb-2">
              <select
                value={customPosition}
                onChange={e => setCustomPosition(e.target.value)}
                className="flex-1 bg-gray-700/80 border border-gray-600 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Goalkeeper">GK</option>
                <option value="Defender">DEF</option>
                <option value="Midfielder">MID</option>
                <option value="Attacker">FWD</option>
              </select>
              <label className="sr-only" htmlFor="shirt-number">Shirt number</label>
              <input
                id="shirt-number"
                type="text"
                inputMode="numeric"
                value={customNumber}
                onChange={e => setCustomNumber(e.target.value.replace(/[^\d]/g, '').slice(0, 3))}
                placeholder="Shirt"
                title="Shirt number. Usually 1–99. 0 and other values up to 999 are allowed."
                className="w-16 bg-gray-700/80 border border-gray-600 rounded-lg px-2 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              type="button"
              onClick={loadDemoSquad}
              className="w-full text-xs py-1.5 rounded-lg bg-gray-700/80 hover:bg-gray-700 text-gray-300 transition-colors"
            >
              Load demo squad
            </button>

            {squadError && (
              <p className="mt-2 text-xs text-red-400 bg-red-900/20 border border-red-800/40 rounded-lg px-3 py-2">
                {squadError}
              </p>
            )}
          </div>

          {/* Squad list */}
          <div className="flex-1 bg-gray-800/50 border border-gray-700/60 rounded-xl p-3 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-2 shrink-0">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Squad</span>
              {availablePlayers.length > 0 && (
                <span className="text-xs text-gray-500">{availablePlayers.length} available</span>
              )}
            </div>

            {squad.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-8 gap-2">
                <div className="text-3xl opacity-30">👕</div>
                <p className="text-sm text-gray-500">Type a name and Add, or load the demo squad.</p>
                <p className="text-xs text-gray-600">Then click a player and click a pitch slot.</p>
              </div>
            ) : availablePlayers.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-xs text-gray-500 text-center">All players assigned.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-1 pr-0.5">
                {availablePlayers.map(p => (
                  <SquadCard
                    key={p.id}
                    player={p}
                    selected={selectedPlayer?.id === p.id}
                    onSelect={() => setSelectedPlayer(prev => prev?.id === p.id ? null : p)}
                    onDragStart={e => onSquadDragStart(e, p)}
                  />
                ))}
              </div>
            )}

            {/* Add to bench shortcut */}
            {selectedPlayer && (
              <div className="shrink-0 mt-2 pt-2 border-t border-gray-700">
                <button
                  onClick={() => addToBench(selectedPlayer)}
                  className="w-full text-xs py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
                >
                  Add <strong>{lastName(selectedPlayer.name)}</strong> to bench
                </button>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="bg-gray-800/50 border border-gray-700/60 rounded-xl p-3">
            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              {[
                ['bg-amber-400', 'Goalkeeper'],
                ['bg-blue-600',  'Defenders'],
                ['bg-teal-600',  'Midfielders'],
                ['bg-rose-500',  'Attackers'],
              ].map(([color, label]) => (
                <div key={label} className="flex items-center gap-1.5 text-xs text-gray-400">
                  <div className={`w-2.5 h-2.5 rounded-full ${color} shrink-0`} />
                  {label}
                </div>
              ))}
            </div>
            <p className="text-[11px] text-gray-600 mt-2">Click a node · set role or remove. Drag to reposition.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
