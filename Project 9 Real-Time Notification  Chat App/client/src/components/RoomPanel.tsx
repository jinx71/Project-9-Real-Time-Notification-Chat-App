interface RoomPanelProps {
  rooms: string[];
  activeRoom: string | null;
  onSelect: (room: string) => void;
}

const ROOM_LABELS: Record<string, string> = {
  'production-line-a': 'Production Line A',
  'qa-alerts': 'QA Alerts',
  maintenance: 'Maintenance'
};

export default function RoomPanel({ rooms, activeRoom, onSelect }: RoomPanelProps) {
  return (
    <nav aria-label="Channels" className="flex flex-col gap-1">
      <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
        Channels
      </p>
      {rooms.map((room) => {
        const active = room === activeRoom;
        return (
          <button
            key={room}
            onClick={() => onSelect(room)}
            className={`rounded-md px-3 py-2 text-left text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400 ${
              active
                ? 'bg-sky-500/15 text-sky-300'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <span className="mr-2 text-slate-500">#</span>
            {ROOM_LABELS[room] ?? room}
          </button>
        );
      })}
    </nav>
  );
}
