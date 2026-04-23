import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";

// ── Types ──────────────────────────────────────────────────────────────────
interface Thing {
  id: string;
  name: string;
  category: string;
  locationId: string;
  roomId: string;
  wardrobeId: string;
  sectionId: string;
  shelfId: string;
  inHand: boolean;
  photo?: string;
  tags: string[];
}

interface Location {
  id: string;
  name: string;
  icon: string;
  rooms: Room[];
}

interface Room {
  id: string;
  name: string;
  wardrobes: Wardrobe[];
}

interface Wardrobe {
  id: string;
  name: string;
  sections: Section[];
}

interface Section {
  id: string;
  name: string;
  shelves: Shelf[];
}

interface Shelf {
  id: string;
  name: string;
}

// ── Demo Data ──────────────────────────────────────────────────────────────
const LOCATIONS: Location[] = [
  {
    id: "home", name: "Дом", icon: "Home",
    rooms: [
      {
        id: "bedroom", name: "Спальня",
        wardrobes: [
          {
            id: "main-wardrobe", name: "Главный шкаф",
            sections: [
              {
                id: "left", name: "Левая секция",
                shelves: [
                  { id: "shelf-1", name: "Верхняя полка" },
                  { id: "shelf-2", name: "Средняя полка" },
                  { id: "shelf-3", name: "Нижняя полка" },
                ]
              },
              {
                id: "right", name: "Правая секция",
                shelves: [
                  { id: "shelf-4", name: "Верхняя полка" },
                  { id: "shelf-5", name: "Нижняя полка" },
                ]
              }
            ]
          }
        ]
      },
      {
        id: "hallway", name: "Прихожая",
        wardrobes: [
          {
            id: "hallway-wardrobe", name: "Шкаф для одежды",
            sections: [
              {
                id: "hall-main", name: "Основная секция",
                shelves: [
                  { id: "shelf-6", name: "Верхняя полка" },
                  { id: "shelf-7", name: "Средняя полка" },
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "dacha", name: "Дача", icon: "TreePine",
    rooms: [
      {
        id: "dacha-room", name: "Жилая комната",
        wardrobes: [
          {
            id: "dacha-wardrobe", name: "Комод",
            sections: [
              {
                id: "dacha-sec", name: "Верхние ящики",
                shelves: [
                  { id: "shelf-8", name: "Первый ящик" },
                  { id: "shelf-9", name: "Второй ящик" },
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];

const INITIAL_THINGS: Thing[] = [
  { id: "1", name: "Синий свитер", category: "Одежда", locationId: "home", roomId: "bedroom", wardrobeId: "main-wardrobe", sectionId: "left", shelfId: "shelf-1", inHand: false, tags: ["тёплый", "синий"] },
  { id: "2", name: "Зимняя шапка", category: "Аксессуары", locationId: "home", roomId: "bedroom", wardrobeId: "main-wardrobe", sectionId: "left", shelfId: "shelf-2", inHand: false, tags: ["зима", "вязаный"] },
  { id: "3", name: "Белая рубашка", category: "Одежда", locationId: "home", roomId: "bedroom", wardrobeId: "main-wardrobe", sectionId: "right", shelfId: "shelf-4", inHand: false, tags: ["офис"] },
  { id: "4", name: "Чёрные джинсы", category: "Одежда", locationId: "home", roomId: "bedroom", wardrobeId: "main-wardrobe", sectionId: "right", shelfId: "shelf-5", inHand: false, tags: ["повседневные"] },
  { id: "5", name: "Шарф кашемировый", category: "Аксессуары", locationId: "home", roomId: "hallway", wardrobeId: "hallway-wardrobe", sectionId: "hall-main", shelfId: "shelf-6", inHand: false, tags: ["зима", "кашемир"] },
  { id: "6", name: "Перчатки кожаные", category: "Аксессуары", locationId: "home", roomId: "hallway", wardrobeId: "hallway-wardrobe", sectionId: "hall-main", shelfId: "shelf-7", inHand: false, tags: ["зима"] },
  { id: "7", name: "Рабочие перчатки", category: "Инструменты", locationId: "dacha", roomId: "dacha-room", wardrobeId: "dacha-wardrobe", sectionId: "dacha-sec", shelfId: "shelf-8", inHand: false, tags: ["дача"] },
  { id: "8", name: "Садовые ножницы", category: "Инструменты", locationId: "dacha", roomId: "dacha-room", wardrobeId: "dacha-wardrobe", sectionId: "dacha-sec", shelfId: "shelf-9", inHand: false, tags: ["дача", "сад"] },
  { id: "9", name: "Красное платье", category: "Одежда", locationId: "home", roomId: "bedroom", wardrobeId: "main-wardrobe", sectionId: "left", shelfId: "shelf-3", inHand: true, tags: ["праздник", "красный"] },
];

const CATEGORIES = ["Все", "Одежда", "Аксессуары", "Инструменты"];

// ── Helpers ────────────────────────────────────────────────────────────────
function getLocationPath(thing: Thing, locations: Location[]): string {
  if (thing.inHand) return "На руках";
  const loc = locations.find(l => l.id === thing.locationId);
  const room = loc?.rooms.find(r => r.id === thing.roomId);
  const wardrobe = room?.wardrobes.find(w => w.id === thing.wardrobeId);
  const section = wardrobe?.sections.find(s => s.id === thing.sectionId);
  const shelf = section?.shelves.find(s => s.id === thing.shelfId);
  return [loc?.name, room?.name, wardrobe?.name, section?.name, shelf?.name].filter(Boolean).join(" › ");
}

function getShortPath(thing: Thing, locations: Location[]): string {
  if (thing.inHand) return "На руках";
  const loc = locations.find(l => l.id === thing.locationId);
  const room = loc?.rooms.find(r => r.id === thing.roomId);
  const shelf = room?.wardrobes.flatMap(w => w.sections).flatMap(s => s.shelves).find(s => s.id === thing.shelfId);
  return `${loc?.name ?? ""} · ${shelf?.name ?? ""}`;
}

const categoryColors: Record<string, string> = {
  "Одежда": "hsl(200 70% 55%)",
  "Аксессуары": "hsl(280 60% 65%)",
  "Инструменты": "hsl(25 80% 58%)",
  "Другое": "hsl(160 50% 50%)",
};

// ── Thing Card ─────────────────────────────────────────────────────────────
function ThingCard({ thing, onClick, onToggleHand }: {
  thing: Thing;
  onClick: () => void;
  onToggleHand: (id: string) => void;
}) {
  return (
    <div
      className="group relative rounded-xl border border-border bg-card card-hover cursor-pointer overflow-hidden"
      onClick={onClick}
    >
      {thing.photo ? (
        <div className="aspect-square overflow-hidden bg-muted">
          <img src={thing.photo} alt={thing.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        </div>
      ) : (
        <div className="aspect-square flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(30 15% 13%), hsl(30 15% 10%))" }}>
          <span className="font-display text-5xl text-foreground/20 select-none">{thing.name[0]}</span>
        </div>
      )}

      <div className="p-3">
        <div className="flex items-start justify-between gap-1 mb-1">
          <h3 className="font-body font-medium text-sm text-foreground leading-tight">{thing.name}</h3>
          {thing.inHand && (
            <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-body font-semibold">
              рука
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground font-body truncate">{getShortPath(thing, LOCATIONS)}</p>
        <div className="mt-2">
          <span
            className="text-xs px-2 py-0.5 rounded-full font-body"
            style={{
              background: `${categoryColors[thing.category] ?? "hsl(160 50% 50%)"}22`,
              color: categoryColors[thing.category] ?? "hsl(160 50% 50%)"
            }}
          >
            {thing.category}
          </span>
        </div>
      </div>

      <button
        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:border-primary hover:text-primary"
        onClick={(e) => { e.stopPropagation(); onToggleHand(thing.id); }}
        title={thing.inHand ? "Вернуть на полку" : "Взять в руки"}
      >
        <Icon name={thing.inHand ? "ArchiveRestore" : "Hand"} size={13} />
      </button>
    </div>
  );
}

// ── Thing Detail Modal ─────────────────────────────────────────────────────
function ThingDetail({ thing, onClose, onToggleHand, onMove, onAddPhoto }: {
  thing: Thing;
  onClose: () => void;
  onToggleHand: (id: string) => void;
  onMove: (id: string, shelfId: string, locationId: string, roomId: string, wardrobeId: string, sectionId: string) => void;
  onAddPhoto: (id: string, file: File) => void;
}) {
  const [moving, setMoving] = useState(false);
  const [selLoc, setSelLoc] = useState(thing.locationId);
  const [selRoom, setSelRoom] = useState(thing.roomId);
  const [selWardrobe, setSelWardrobe] = useState(thing.wardrobeId);
  const [selSection, setSelSection] = useState(thing.sectionId);
  const [selShelf, setSelShelf] = useState(thing.shelfId);

  const loc = LOCATIONS.find(l => l.id === selLoc);
  const room = loc?.rooms.find(r => r.id === selRoom);
  const wardrobe = room?.wardrobes.find(w => w.id === selWardrobe);
  const section = wardrobe?.sections.find(s => s.id === selSection);

  const selectClass = "w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm font-body text-foreground focus:outline-none focus:border-primary transition-colors";

  const handleLocChange = (locId: string) => {
    setSelLoc(locId);
    const l = LOCATIONS.find(x => x.id === locId);
    if (l) {
      setSelRoom(l.rooms[0]?.id ?? "");
      setSelWardrobe(l.rooms[0]?.wardrobes[0]?.id ?? "");
      setSelSection(l.rooms[0]?.wardrobes[0]?.sections[0]?.id ?? "");
      setSelShelf(l.rooms[0]?.wardrobes[0]?.sections[0]?.shelves[0]?.id ?? "");
    }
  };

  const handleRoomChange = (roomId: string) => {
    setSelRoom(roomId);
    const r = loc?.rooms.find(x => x.id === roomId);
    if (r) {
      setSelWardrobe(r.wardrobes[0]?.id ?? "");
      setSelSection(r.wardrobes[0]?.sections[0]?.id ?? "");
      setSelShelf(r.wardrobes[0]?.sections[0]?.shelves[0]?.id ?? "");
    }
  };

  const handleWardrobeChange = (wId: string) => {
    setSelWardrobe(wId);
    const w = room?.wardrobes.find(x => x.id === wId);
    if (w) {
      setSelSection(w.sections[0]?.id ?? "");
      setSelShelf(w.sections[0]?.shelves[0]?.id ?? "");
    }
  };

  const handleSectionChange = (sId: string) => {
    setSelSection(sId);
    const s = wardrobe?.sections.find(x => x.id === sId);
    if (s) setSelShelf(s.shelves[0]?.id ?? "");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md" />
      <div
        className="relative w-full max-w-md bg-card border border-border rounded-2xl overflow-hidden animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Photo area */}
        <div className="relative">
          {thing.photo ? (
            <div className="aspect-video overflow-hidden">
              <img src={thing.photo} alt={thing.name} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="h-28 flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(30 15% 13%), hsl(30 15% 10%))" }}>
              <span className="font-display text-7xl text-foreground/15">{thing.name[0]}</span>
            </div>
          )}
          <label
            className="absolute bottom-2 right-2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-background/80 backdrop-blur-sm border border-border text-xs font-body text-muted-foreground hover:text-foreground hover:border-primary cursor-pointer transition-all"
          >
            <Icon name="Camera" size={12} />
            {thing.photo ? "Заменить" : "Добавить фото"}
            <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) onAddPhoto(thing.id, f); }} />
          </label>
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between mb-1">
            <h2 className="font-display text-2xl font-medium text-foreground">{thing.name}</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors mt-1">
              <Icon name="X" size={18} />
            </button>
          </div>
          <p className="text-xs text-muted-foreground font-body mb-3">{thing.category}</p>

          <div className="rounded-xl bg-muted/50 border border-border p-3 mb-4">
            <p className="text-xs text-muted-foreground font-body mb-1">Местонахождение</p>
            <p className="text-sm font-body font-medium text-foreground">{getLocationPath(thing, LOCATIONS)}</p>
          </div>

          {thing.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {thing.tags.map(tag => (
                <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-body">#{tag}</span>
              ))}
            </div>
          )}

          {/* Move section */}
          {moving && (
            <div className="space-y-2 mb-4 p-3 rounded-xl bg-muted/50 border border-border">
              <p className="text-xs text-muted-foreground font-body font-medium uppercase tracking-wide mb-1">Переместить в</p>
              <select className={selectClass} value={selLoc} onChange={e => handleLocChange(e.target.value)}>
                {LOCATIONS.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
              <select className={selectClass} value={selRoom} onChange={e => handleRoomChange(e.target.value)}>
                {loc?.rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
              <select className={selectClass} value={selWardrobe} onChange={e => handleWardrobeChange(e.target.value)}>
                {room?.wardrobes.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
              <select className={selectClass} value={selSection} onChange={e => handleSectionChange(e.target.value)}>
                {wardrobe?.sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <select className={selectClass} value={selShelf} onChange={e => setSelShelf(e.target.value)}>
                {section?.shelves.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <button
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-body font-medium text-sm transition-all hover:opacity-90 active:scale-[0.98]"
                onClick={() => { onMove(thing.id, selShelf, selLoc, selRoom, selWardrobe, selSection); setMoving(false); }}
              >
                Переместить сюда
              </button>
            </div>
          )}

          <div className="flex gap-2">
            <button
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border bg-muted/50 text-sm font-body font-medium text-foreground hover:border-primary hover:text-primary transition-all"
              onClick={() => onToggleHand(thing.id)}
            >
              <Icon name={thing.inHand ? "ArchiveRestore" : "Hand"} size={15} />
              {thing.inHand ? "На полку" : "В руки"}
            </button>
            <button
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-body font-medium transition-all ${moving ? "border-primary text-primary bg-primary/10" : "border-border bg-muted/50 text-foreground hover:border-primary hover:text-primary"}`}
              onClick={() => setMoving(!moving)}
            >
              <Icon name="MoveRight" size={15} />
              Переместить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Location Tree ──────────────────────────────────────────────────────────
function LocationTree({ things }: { things: Thing[] }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ home: true, bedroom: true, "main-wardrobe": true });

  const toggle = (id: string) => setExpanded(p => ({ ...p, [id]: !p[id] }));

  return (
    <div className="space-y-2 font-body text-sm">
      {LOCATIONS.map(loc => (
        <div key={loc.id} className="rounded-xl border border-border bg-card overflow-hidden">
          <button
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors text-left"
            onClick={() => toggle(loc.id)}
          >
            <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
              <Icon name={loc.icon as "Home"} size={14} className="text-primary" />
            </div>
            <span className="font-semibold text-foreground flex-1">{loc.name}</span>
            <span className="text-xs text-muted-foreground">{things.filter(t => t.locationId === loc.id).length} вещей</span>
            <Icon name={expanded[loc.id] ? "ChevronUp" : "ChevronDown"} size={14} className="text-muted-foreground" />
          </button>

          {expanded[loc.id] && (
            <div className="border-t border-border">
              {loc.rooms.map(room => (
                <div key={room.id}>
                  <button
                    className="w-full flex items-center gap-2 px-4 py-2.5 pl-10 hover:bg-muted/30 transition-colors text-left border-t border-border/40"
                    onClick={() => toggle(room.id)}
                  >
                    <Icon name="DoorOpen" size={13} className="text-muted-foreground shrink-0" />
                    <span className="text-foreground/80 flex-1">{room.name}</span>
                    <span className="text-xs text-muted-foreground mr-1">{things.filter(t => t.roomId === room.id).length}</span>
                    <Icon name={expanded[room.id] ? "ChevronUp" : "ChevronDown"} size={12} className="text-muted-foreground" />
                  </button>

                  {expanded[room.id] && room.wardrobes.map(wardrobe => (
                    <div key={wardrobe.id}>
                      <button
                        className="w-full flex items-center gap-2 px-4 py-2 pl-16 hover:bg-muted/20 transition-colors text-left"
                        onClick={() => toggle(wardrobe.id)}
                      >
                        <Icon name="Package" size={12} className="text-muted-foreground/70 shrink-0" />
                        <span className="text-foreground/70 flex-1">{wardrobe.name}</span>
                        <Icon name={expanded[wardrobe.id] ? "ChevronUp" : "ChevronDown"} size={11} className="text-muted-foreground" />
                      </button>

                      {expanded[wardrobe.id] && wardrobe.sections.map(section => (
                        <div key={section.id}>
                          <div className="px-4 py-1 pl-20 text-[10px] text-muted-foreground/50 uppercase tracking-widest">{section.name}</div>
                          {section.shelves.map(shelf => {
                            const count = things.filter(t => t.shelfId === shelf.id && !t.inHand).length;
                            return (
                              <div key={shelf.id} className="flex items-center gap-2 px-4 py-1.5 pl-24 text-xs text-muted-foreground">
                                <div className="w-1 h-1 rounded-full bg-border/80 shrink-0" />
                                <span className="flex-1">{shelf.name}</span>
                                {count > 0 && (
                                  <span className="px-1.5 py-0.5 rounded-full bg-primary/15 text-primary font-medium">{count}</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* In-hand block */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
            <Icon name="Hand" size={14} className="text-primary" />
          </div>
          <span className="font-semibold text-foreground flex-1">На руках</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary font-medium">{things.filter(t => t.inHand).length}</span>
        </div>
        {things.filter(t => t.inHand).map(thing => (
          <div key={thing.id} className="flex items-center gap-2 px-4 py-2 pl-14 border-t border-border/40 text-sm text-foreground/70">
            <div className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
            {thing.name}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function Index() {
  const [things, setThings] = useState<Thing[]>(INITIAL_THINGS);
  const [activeTab, setActiveTab] = useState<"catalog" | "locations" | "inhand">("catalog");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Все");
  const [selectedThing, setSelectedThing] = useState<Thing | null>(null);

  const filtered = useMemo(() => {
    return things.filter(t => {
      const matchSearch = search === "" ||
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
      const matchCat = category === "Все" || t.category === category;
      const matchTab = activeTab === "inhand" ? t.inHand : true;
      return matchSearch && matchCat && matchTab;
    });
  }, [things, search, category, activeTab]);

  const inHandCount = things.filter(t => t.inHand).length;

  const toggleHand = (id: string) => {
    setThings(prev => prev.map(t => t.id === id ? { ...t, inHand: !t.inHand } : t));
    setSelectedThing(prev => prev?.id === id ? { ...prev, inHand: !prev.inHand } : prev);
  };

  const moveThing = (id: string, shelfId: string, locationId: string, roomId: string, wardrobeId: string, sectionId: string) => {
    setThings(prev => prev.map(t => t.id === id ? { ...t, shelfId, locationId, roomId, wardrobeId, sectionId, inHand: false } : t));
    setSelectedThing(prev => prev?.id === id ? { ...prev, shelfId, locationId, roomId, wardrobeId, sectionId, inHand: false } : prev);
  };

  const addPhoto = (id: string, file: File) => {
    const url = URL.createObjectURL(file);
    setThings(prev => prev.map(t => t.id === id ? { ...t, photo: url } : t));
    setSelectedThing(prev => prev?.id === id ? { ...prev, photo: url } : prev);
  };

  const tabs = [
    { id: "catalog" as const, label: "Каталог", icon: "Grid3X3" },
    { id: "locations" as const, label: "Локации", icon: "MapPin" },
    { id: "inhand" as const, label: "На руках", icon: "Hand", badge: inHandCount },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-3 flex items-center gap-3">
          <div className="flex items-center gap-2.5 mr-auto">
            <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center amber-glow">
              <Icon name="Archive" size={17} className="text-primary" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-medium text-foreground leading-none tracking-tight">Шкаф</h1>
              <p className="text-[10px] text-muted-foreground font-body">органайзер вещей</p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-sm font-body font-semibold text-foreground">{things.length}</p>
            <p className="text-[10px] text-muted-foreground font-body">вещей</p>
          </div>
        </div>

        {/* Search bar */}
        <div className="max-w-2xl mx-auto px-4 pb-3">
          <div className="relative">
            <Icon name="Search" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Найти вещь по названию или тегу..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-muted border border-border text-sm font-body text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors"
            />
            {search && (
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" onClick={() => setSearch("")}>
                <Icon name="X" size={13} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="sticky top-[133px] z-30 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex gap-1 py-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-body font-medium transition-all ${activeTab === tab.id ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon name={tab.icon as "Grid3X3"} size={14} />
                {tab.label}
                {"badge" in tab && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-semibold">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-4 py-5">

        {/* Category filter */}
        {(activeTab === "catalog" || activeTab === "inhand") && (
          <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-thin">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-body font-medium transition-all ${category === cat ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted border border-border"}`}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Locations view */}
        {activeTab === "locations" && (
          <div className="animate-slide-up">
            <LocationTree things={things} />
          </div>
        )}

        {/* Catalog / In-hand grid */}
        {(activeTab === "catalog" || activeTab === "inhand") && (
          <>
            {search && filtered.length > 0 && (
              <p className="mb-4 text-xs text-muted-foreground font-body flex items-center gap-1.5">
                <Icon name="Search" size={12} />
                Найдено: <strong className="text-foreground">{filtered.length}</strong>
              </p>
            )}

            {/* Empty states */}
            {activeTab === "inhand" && inHandCount === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <Icon name="Hand" size={26} className="text-muted-foreground" />
                </div>
                <p className="font-display text-xl text-foreground mb-1">Ничего на руках</p>
                <p className="text-sm text-muted-foreground font-body">Нажмите на вещь и возьмите её в руки</p>
              </div>
            )}

            {filtered.length === 0 && (search || activeTab === "inhand") && inHandCount > 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <Icon name="SearchX" size={26} className="text-muted-foreground" />
                </div>
                <p className="font-display text-xl text-foreground mb-1">Не найдено</p>
                <p className="text-sm text-muted-foreground font-body">Попробуйте другой запрос</p>
              </div>
            )}

            {filtered.length === 0 && search && activeTab === "catalog" && (
              <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <Icon name="SearchX" size={26} className="text-muted-foreground" />
                </div>
                <p className="font-display text-xl text-foreground mb-1">Не найдено</p>
                <p className="text-sm text-muted-foreground font-body">Попробуйте другой запрос</p>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filtered.map((thing, i) => (
                <div
                  key={thing.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${i * 40}ms`, animationFillMode: "both" }}
                >
                  <ThingCard
                    thing={thing}
                    onClick={() => setSelectedThing(thing)}
                    onToggleHand={toggleHand}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Detail modal */}
      {selectedThing && (
        <ThingDetail
          thing={selectedThing}
          onClose={() => setSelectedThing(null)}
          onToggleHand={toggleHand}
          onMove={moveThing}
          onAddPhoto={addPhoto}
        />
      )}
    </div>
  );
}
