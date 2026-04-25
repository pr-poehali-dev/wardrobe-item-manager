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
const INITIAL_LOCATIONS: Location[] = [
  {
    id: "home", name: "Дом", icon: "Home",
    rooms: [
      {
        id: "bedroom", name: "Спальня",
        wardrobes: [
          {
            id: "main-wardrobe", name: "Главный шкаф",
            sections: [
              { id: "left", name: "Левая секция", shelves: [{ id: "shelf-1", name: "Верхняя полка" }, { id: "shelf-2", name: "Средняя полка" }, { id: "shelf-3", name: "Нижняя полка" }] },
              { id: "right", name: "Правая секция", shelves: [{ id: "shelf-4", name: "Верхняя полка" }, { id: "shelf-5", name: "Нижняя полка" }] }
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
              { id: "hall-main", name: "Основная секция", shelves: [{ id: "shelf-6", name: "Верхняя полка" }, { id: "shelf-7", name: "Средняя полка" }] }
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
              { id: "dacha-sec", name: "Верхние ящики", shelves: [{ id: "shelf-8", name: "Первый ящик" }, { id: "shelf-9", name: "Второй ящик" }] }
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

const LOCATION_ICONS = ["Home", "TreePine", "Building2", "Warehouse", "Store", "Tent", "Castle", "Hotel"];

// ── Helpers ────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 9);

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

// ── Mini Modal ─────────────────────────────────────────────────────────────
function MiniModal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md" />
      <div
        className="relative w-full max-w-sm bg-card border border-border rounded-2xl overflow-hidden animate-slide-up shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-display text-lg font-medium text-foreground">{title}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="X" size={16} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// ── Inline Edit Input ──────────────────────────────────────────────────────
function InlineEdit({ value, onSave, onCancel }: { value: string; onSave: (v: string) => void; onCancel: () => void }) {
  const [v, setV] = useState(value);
  return (
    <div className="flex items-center gap-1 flex-1" onClick={e => e.stopPropagation()}>
      <input
        autoFocus
        className="flex-1 bg-muted border border-primary rounded-lg px-2 py-1 text-sm font-body text-foreground focus:outline-none min-w-0"
        value={v}
        onChange={e => setV(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") onSave(v); if (e.key === "Escape") onCancel(); }}
      />
      <button onClick={() => onSave(v)} className="text-primary hover:opacity-80 transition-opacity"><Icon name="Check" size={14} /></button>
      <button onClick={onCancel} className="text-muted-foreground hover:text-foreground transition-colors"><Icon name="X" size={14} /></button>
    </div>
  );
}

// ── Add Thing Modal ────────────────────────────────────────────────────────
function AddThingModal({ locations, onClose, onAdd }: {
  locations: Location[];
  onClose: () => void;
  onAdd: (thing: Thing) => void;
}) {
  const firstLoc = locations[0];
  const firstRoom = firstLoc?.rooms[0];
  const firstWardrobe = firstRoom?.wardrobes[0];
  const firstSection = firstWardrobe?.sections[0];
  const firstShelf = firstSection?.shelves[0];

  const [name, setName] = useState("");
  const [category, setCategory] = useState("Одежда");
  const [tagsRaw, setTagsRaw] = useState("");
  const [inHand, setInHand] = useState(false);
  const [photo, setPhoto] = useState<string | undefined>();

  const [selLoc, setSelLoc] = useState(firstLoc?.id ?? "");
  const [selRoom, setSelRoom] = useState(firstRoom?.id ?? "");
  const [selWardrobe, setSelWardrobe] = useState(firstWardrobe?.id ?? "");
  const [selSection, setSelSection] = useState(firstSection?.id ?? "");
  const [selShelf, setSelShelf] = useState(firstShelf?.id ?? "");

  const loc = locations.find(l => l.id === selLoc);
  const room = loc?.rooms.find(r => r.id === selRoom);
  const wardrobe = room?.wardrobes.find(w => w.id === selWardrobe);
  const section = wardrobe?.sections.find(s => s.id === selSection);

  const handleLocChange = (locId: string) => {
    setSelLoc(locId);
    const l = locations.find(x => x.id === locId);
    setSelRoom(l?.rooms[0]?.id ?? "");
    setSelWardrobe(l?.rooms[0]?.wardrobes[0]?.id ?? "");
    setSelSection(l?.rooms[0]?.wardrobes[0]?.sections[0]?.id ?? "");
    setSelShelf(l?.rooms[0]?.wardrobes[0]?.sections[0]?.shelves[0]?.id ?? "");
  };
  const handleRoomChange = (roomId: string) => {
    setSelRoom(roomId);
    const r = loc?.rooms.find(x => x.id === roomId);
    setSelWardrobe(r?.wardrobes[0]?.id ?? "");
    setSelSection(r?.wardrobes[0]?.sections[0]?.id ?? "");
    setSelShelf(r?.wardrobes[0]?.sections[0]?.shelves[0]?.id ?? "");
  };
  const handleWardrobeChange = (wId: string) => {
    setSelWardrobe(wId);
    const w = room?.wardrobes.find(x => x.id === wId);
    setSelSection(w?.sections[0]?.id ?? "");
    setSelShelf(w?.sections[0]?.shelves[0]?.id ?? "");
  };
  const handleSectionChange = (sId: string) => {
    setSelSection(sId);
    const s = wardrobe?.sections.find(x => x.id === sId);
    setSelShelf(s?.shelves[0]?.id ?? "");
  };

  const canSave = name.trim() && (inHand || selShelf);

  const handleSave = () => {
    if (!canSave) return;
    onAdd({
      id: uid(),
      name: name.trim(),
      category,
      tags: tagsRaw.split(",").map(t => t.trim()).filter(Boolean),
      inHand,
      photo,
      locationId: selLoc,
      roomId: selRoom,
      wardrobeId: selWardrobe,
      sectionId: selSection,
      shelfId: selShelf,
    });
    onClose();
  };

  const selectClass = "w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm font-body text-foreground focus:outline-none focus:border-primary transition-colors";
  const labelClass = "text-xs text-muted-foreground font-body mb-1.5 block";
  const hasLocations = locations.length > 0 && (loc?.rooms.length ?? 0) > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md" />
      <div
        className="relative w-full max-w-md bg-card border border-border rounded-t-2xl sm:rounded-2xl overflow-hidden animate-slide-up shadow-2xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <h3 className="font-display text-xl font-medium text-foreground">Новая вещь</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="X" size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          {/* Photo */}
          <label className="block cursor-pointer">
            <div className={`w-full h-28 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-colors ${photo ? "border-transparent p-0 overflow-hidden" : "border-border hover:border-primary/50"}`}>
              {photo ? (
                <img src={photo} alt="" className="w-full h-full object-cover rounded-xl" />
              ) : (
                <>
                  <Icon name="ImagePlus" size={22} className="text-muted-foreground" />
                  <span className="text-xs font-body text-muted-foreground">Добавить фото (необязательно)</span>
                </>
              )}
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={e => {
              const f = e.target.files?.[0];
              if (f) setPhoto(URL.createObjectURL(f));
            }} />
          </label>

          {/* Name */}
          <div>
            <label className={labelClass}>Название *</label>
            <input
              autoFocus
              className={selectClass}
              placeholder="Например: Синий свитер"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSave()}
            />
          </div>

          {/* Category */}
          <div>
            <label className={labelClass}>Категория</label>
            <div className="flex flex-wrap gap-2">
              {["Одежда", "Аксессуары", "Инструменты", "Другое"].map(cat => (
                <button
                  key={cat}
                  className={`px-3 py-1.5 rounded-full text-xs font-body font-medium transition-all ${category === cat ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground border border-border hover:border-primary/50"}`}
                  onClick={() => setCategory(cat)}
                >{cat}</button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className={labelClass}>Теги (через запятую)</label>
            <input
              className={selectClass}
              placeholder="зима, тёплый, синий"
              value={tagsRaw}
              onChange={e => setTagsRaw(e.target.value)}
            />
          </div>

          {/* In hand toggle */}
          <button
            className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${inHand ? "border-primary bg-primary/10" : "border-border bg-muted/40 hover:border-primary/50"}`}
            onClick={() => setInHand(v => !v)}
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${inHand ? "bg-primary/20" : "bg-muted"}`}>
              <Icon name="Hand" size={16} className={inHand ? "text-primary" : "text-muted-foreground"} />
            </div>
            <div className="text-left">
              <p className={`text-sm font-body font-medium ${inHand ? "text-primary" : "text-foreground"}`}>На руках</p>
              <p className="text-xs font-body text-muted-foreground">Вещь сейчас у вас</p>
            </div>
            <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${inHand ? "border-primary bg-primary" : "border-border"}`}>
              {inHand && <Icon name="Check" size={11} className="text-primary-foreground" />}
            </div>
          </button>

          {/* Location selects */}
          {!inHand && (
            <div className="space-y-2 p-3 rounded-xl bg-muted/40 border border-border">
              <p className="text-xs text-muted-foreground font-body font-medium uppercase tracking-wide">Расположение</p>
              {!hasLocations ? (
                <p className="text-xs text-muted-foreground font-body">Сначала добавьте локацию и комнату во вкладке «Локации»</p>
              ) : (
                <>
                  <select className={selectClass} value={selLoc} onChange={e => handleLocChange(e.target.value)}>
                    {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                  {(loc?.rooms.length ?? 0) > 0 && (
                    <select className={selectClass} value={selRoom} onChange={e => handleRoomChange(e.target.value)}>
                      {loc?.rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                  )}
                  {(room?.wardrobes.length ?? 0) > 0 && (
                    <select className={selectClass} value={selWardrobe} onChange={e => handleWardrobeChange(e.target.value)}>
                      {room?.wardrobes.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                  )}
                  {(wardrobe?.sections.length ?? 0) > 0 && (
                    <select className={selectClass} value={selSection} onChange={e => handleSectionChange(e.target.value)}>
                      {wardrobe?.sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  )}
                  {(section?.shelves.length ?? 0) > 0 && (
                    <select className={selectClass} value={selShelf} onChange={e => setSelShelf(e.target.value)}>
                      {section?.shelves.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 pt-3 border-t border-border shrink-0 flex gap-2">
          <button className="flex-1 py-3 rounded-xl border border-border text-sm font-body text-muted-foreground hover:text-foreground transition-colors" onClick={onClose}>Отмена</button>
          <button
            className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-body font-medium transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40"
            disabled={!canSave}
            onClick={handleSave}
          >Добавить вещь</button>
        </div>
      </div>
    </div>
  );
}

// ── Thing Card ─────────────────────────────────────────────────────────────
function ThingCard({ thing, locations, onClick, onToggleHand }: {
  thing: Thing;
  locations: Location[];
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
            <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-body font-semibold">рука</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground font-body truncate">{getShortPath(thing, locations)}</p>
        <div className="mt-2">
          <span className="text-xs px-2 py-0.5 rounded-full font-body" style={{ background: `${categoryColors[thing.category] ?? "hsl(160 50% 50%)"}22`, color: categoryColors[thing.category] ?? "hsl(160 50% 50%)" }}>
            {thing.category}
          </span>
        </div>
      </div>
      <button
        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:border-primary hover:text-primary"
        onClick={(e) => { e.stopPropagation(); onToggleHand(thing.id); }}
      >
        <Icon name={thing.inHand ? "ArchiveRestore" : "Hand"} size={13} />
      </button>
    </div>
  );
}

// ── Thing Detail Modal ─────────────────────────────────────────────────────
function ThingDetail({ thing, locations, onClose, onToggleHand, onMove, onAddPhoto }: {
  thing: Thing;
  locations: Location[];
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

  const loc = locations.find(l => l.id === selLoc);
  const room = loc?.rooms.find(r => r.id === selRoom);
  const wardrobe = room?.wardrobes.find(w => w.id === selWardrobe);
  const section = wardrobe?.sections.find(s => s.id === selSection);

  const selectClass = "w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm font-body text-foreground focus:outline-none focus:border-primary transition-colors";

  const handleLocChange = (locId: string) => {
    setSelLoc(locId);
    const l = locations.find(x => x.id === locId);
    if (l) { setSelRoom(l.rooms[0]?.id ?? ""); setSelWardrobe(l.rooms[0]?.wardrobes[0]?.id ?? ""); setSelSection(l.rooms[0]?.wardrobes[0]?.sections[0]?.id ?? ""); setSelShelf(l.rooms[0]?.wardrobes[0]?.sections[0]?.shelves[0]?.id ?? ""); }
  };
  const handleRoomChange = (roomId: string) => {
    setSelRoom(roomId);
    const r = loc?.rooms.find(x => x.id === roomId);
    if (r) { setSelWardrobe(r.wardrobes[0]?.id ?? ""); setSelSection(r.wardrobes[0]?.sections[0]?.id ?? ""); setSelShelf(r.wardrobes[0]?.sections[0]?.shelves[0]?.id ?? ""); }
  };
  const handleWardrobeChange = (wId: string) => {
    setSelWardrobe(wId);
    const w = room?.wardrobes.find(x => x.id === wId);
    if (w) { setSelSection(w.sections[0]?.id ?? ""); setSelShelf(w.sections[0]?.shelves[0]?.id ?? ""); }
  };
  const handleSectionChange = (sId: string) => {
    setSelSection(sId);
    const s = wardrobe?.sections.find(x => x.id === sId);
    if (s) setSelShelf(s.shelves[0]?.id ?? "");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md" />
      <div className="relative w-full max-w-md bg-card border border-border rounded-2xl overflow-hidden animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="relative">
          {thing.photo ? (
            <div className="aspect-video overflow-hidden"><img src={thing.photo} alt={thing.name} className="w-full h-full object-cover" /></div>
          ) : (
            <div className="h-28 flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(30 15% 13%), hsl(30 15% 10%))" }}>
              <span className="font-display text-7xl text-foreground/15">{thing.name[0]}</span>
            </div>
          )}
          <label className="absolute bottom-2 right-2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-background/80 backdrop-blur-sm border border-border text-xs font-body text-muted-foreground hover:text-foreground hover:border-primary cursor-pointer transition-all">
            <Icon name="Camera" size={12} />
            {thing.photo ? "Заменить" : "Добавить фото"}
            <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) onAddPhoto(thing.id, f); }} />
          </label>
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between mb-1">
            <h2 className="font-display text-2xl font-medium text-foreground">{thing.name}</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors mt-1"><Icon name="X" size={18} /></button>
          </div>
          <p className="text-xs text-muted-foreground font-body mb-3">{thing.category}</p>
          <div className="rounded-xl bg-muted/50 border border-border p-3 mb-4">
            <p className="text-xs text-muted-foreground font-body mb-1">Местонахождение</p>
            <p className="text-sm font-body font-medium text-foreground">{getLocationPath(thing, locations)}</p>
          </div>
          {thing.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {thing.tags.map(tag => <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-body">#{tag}</span>)}
            </div>
          )}
          {moving && (
            <div className="space-y-2 mb-4 p-3 rounded-xl bg-muted/50 border border-border">
              <p className="text-xs text-muted-foreground font-body font-medium uppercase tracking-wide mb-1">Переместить в</p>
              <select className={selectClass} value={selLoc} onChange={e => handleLocChange(e.target.value)}>
                {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
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
              >Переместить сюда</button>
            </div>
          )}
          <div className="flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border bg-muted/50 text-sm font-body font-medium text-foreground hover:border-primary hover:text-primary transition-all" onClick={() => onToggleHand(thing.id)}>
              <Icon name={thing.inHand ? "ArchiveRestore" : "Hand"} size={15} />
              {thing.inHand ? "На полку" : "В руки"}
            </button>
            <button className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-body font-medium transition-all ${moving ? "border-primary text-primary bg-primary/10" : "border-border bg-muted/50 text-foreground hover:border-primary hover:text-primary"}`} onClick={() => setMoving(!moving)}>
              <Icon name="MoveRight" size={15} />
              Переместить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Location Tree (editable) ───────────────────────────────────────────────
interface LocationTreeProps {
  locations: Location[];
  things: Thing[];
  onLocationsChange: (locs: Location[]) => void;
}

function LocationTree({ locations, things, onLocationsChange }: LocationTreeProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ home: true, bedroom: true, "main-wardrobe": true });
  const [editing, setEditing] = useState<string | null>(null);

  // Modal state
  type ModalType = "add-location" | "add-room" | "add-wardrobe" | "add-section" | "add-shelf" | null;
  const [modal, setModal] = useState<{ type: ModalType; ctx: Record<string, string> } | null>(null);
  const [modalName, setModalName] = useState("");
  const [modalIcon, setModalIcon] = useState("Home");

  const toggle = (id: string) => setExpanded(p => ({ ...p, [id]: !p[id] }));

  // ── Rename helpers ─────────────────────────────────────────────────────
  const renameLocation = (locId: string, name: string) =>
    onLocationsChange(locations.map(l => l.id === locId ? { ...l, name } : l));

  const renameRoom = (locId: string, roomId: string, name: string) =>
    onLocationsChange(locations.map(l => l.id === locId ? { ...l, rooms: l.rooms.map(r => r.id === roomId ? { ...r, name } : r) } : l));

  const renameWardrobe = (locId: string, roomId: string, wId: string, name: string) =>
    onLocationsChange(locations.map(l => l.id === locId ? {
      ...l, rooms: l.rooms.map(r => r.id === roomId ? {
        ...r, wardrobes: r.wardrobes.map(w => w.id === wId ? { ...w, name } : w)
      } : r)
    } : l));

  const renameSection = (locId: string, roomId: string, wId: string, secId: string, name: string) =>
    onLocationsChange(locations.map(l => l.id === locId ? {
      ...l, rooms: l.rooms.map(r => r.id === roomId ? {
        ...r, wardrobes: r.wardrobes.map(w => w.id === wId ? {
          ...w, sections: w.sections.map(s => s.id === secId ? { ...s, name } : s)
        } : w)
      } : r)
    } : l));

  const renameShelf = (locId: string, roomId: string, wId: string, secId: string, shId: string, name: string) =>
    onLocationsChange(locations.map(l => l.id === locId ? {
      ...l, rooms: l.rooms.map(r => r.id === roomId ? {
        ...r, wardrobes: r.wardrobes.map(w => w.id === wId ? {
          ...w, sections: w.sections.map(s => s.id === secId ? {
            ...s, shelves: s.shelves.map(sh => sh.id === shId ? { ...sh, name } : sh)
          } : s)
        } : w)
      } : r)
    } : l));

  // ── Delete helpers ─────────────────────────────────────────────────────
  const deleteLocation = (locId: string) => onLocationsChange(locations.filter(l => l.id !== locId));

  const deleteRoom = (locId: string, roomId: string) =>
    onLocationsChange(locations.map(l => l.id === locId ? { ...l, rooms: l.rooms.filter(r => r.id !== roomId) } : l));

  const deleteWardrobe = (locId: string, roomId: string, wId: string) =>
    onLocationsChange(locations.map(l => l.id === locId ? {
      ...l, rooms: l.rooms.map(r => r.id === roomId ? { ...r, wardrobes: r.wardrobes.filter(w => w.id !== wId) } : r)
    } : l));

  const deleteSection = (locId: string, roomId: string, wId: string, secId: string) =>
    onLocationsChange(locations.map(l => l.id === locId ? {
      ...l, rooms: l.rooms.map(r => r.id === roomId ? {
        ...r, wardrobes: r.wardrobes.map(w => w.id === wId ? { ...w, sections: w.sections.filter(s => s.id !== secId) } : w)
      } : r)
    } : l));

  const deleteShelf = (locId: string, roomId: string, wId: string, secId: string, shId: string) =>
    onLocationsChange(locations.map(l => l.id === locId ? {
      ...l, rooms: l.rooms.map(r => r.id === roomId ? {
        ...r, wardrobes: r.wardrobes.map(w => w.id === wId ? {
          ...w, sections: w.sections.map(s => s.id === secId ? { ...s, shelves: s.shelves.filter(sh => sh.id !== shId) } : s)
        } : w)
      } : r)
    } : l));

  // ── Add helpers ────────────────────────────────────────────────────────
  const openModal = (type: ModalType, ctx: Record<string, string> = {}) => {
    setModal({ type, ctx });
    setModalName("");
    setModalIcon("Home");
  };
  const closeModal = () => setModal(null);

  const handleModalSave = () => {
    if (!modalName.trim() || !modal) return;
    const name = modalName.trim();
    const ctx = modal.ctx;

    if (modal.type === "add-location") {
      onLocationsChange([...locations, { id: uid(), name, icon: modalIcon, rooms: [] }]);
    } else if (modal.type === "add-room") {
      onLocationsChange(locations.map(l => l.id === ctx.locId
        ? { ...l, rooms: [...l.rooms, { id: uid(), name, wardrobes: [] }] } : l));
    } else if (modal.type === "add-wardrobe") {
      onLocationsChange(locations.map(l => l.id === ctx.locId ? {
        ...l, rooms: l.rooms.map(r => r.id === ctx.roomId
          ? { ...r, wardrobes: [...r.wardrobes, { id: uid(), name, sections: [] }] } : r)
      } : l));
    } else if (modal.type === "add-section") {
      onLocationsChange(locations.map(l => l.id === ctx.locId ? {
        ...l, rooms: l.rooms.map(r => r.id === ctx.roomId ? {
          ...r, wardrobes: r.wardrobes.map(w => w.id === ctx.wId
            ? { ...w, sections: [...w.sections, { id: uid(), name, shelves: [] }] } : w)
        } : r)
      } : l));
    } else if (modal.type === "add-shelf") {
      onLocationsChange(locations.map(l => l.id === ctx.locId ? {
        ...l, rooms: l.rooms.map(r => r.id === ctx.roomId ? {
          ...r, wardrobes: r.wardrobes.map(w => w.id === ctx.wId ? {
            ...w, sections: w.sections.map(s => s.id === ctx.secId
              ? { ...s, shelves: [...s.shelves, { id: uid(), name }] } : s)
          } : w)
        } : r)
      } : l));
    }
    closeModal();
  };

  const modalTitles: Record<string, string> = {
    "add-location": "Новая локация",
    "add-room": "Новая комната",
    "add-wardrobe": "Новый шкаф",
    "add-section": "Новая секция",
    "add-shelf": "Новая полка",
  };

  const btnSm = "w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all";
  const addBtn = "flex items-center gap-1.5 text-xs text-muted-foreground/70 hover:text-primary transition-colors font-body py-1";

  return (
    <div className="space-y-2 font-body text-sm">
      {locations.map(loc => (
        <div key={loc.id} className="rounded-xl border border-border bg-card overflow-hidden">
          {/* Location row */}
          <div className="flex items-center gap-2 px-3 py-2.5 hover:bg-muted/30 transition-colors group/loc">
            <button className="flex items-center gap-2.5 flex-1 min-w-0 text-left" onClick={() => toggle(loc.id)}>
              <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                <Icon name={loc.icon as "Home"} size={14} className="text-primary" />
              </div>
              {editing === loc.id ? (
                <InlineEdit value={loc.name} onSave={v => { renameLocation(loc.id, v); setEditing(null); }} onCancel={() => setEditing(null)} />
              ) : (
                <>
                  <span className="font-semibold text-foreground flex-1 truncate">{loc.name}</span>
                  <span className="text-xs text-muted-foreground shrink-0">{things.filter(t => t.locationId === loc.id).length} вещей</span>
                </>
              )}
            </button>
            <div className="flex items-center gap-0.5 opacity-0 group-hover/loc:opacity-100 transition-opacity shrink-0">
              <button className={btnSm} title="Переименовать" onClick={e => { e.stopPropagation(); setEditing(loc.id); }}><Icon name="Pencil" size={11} /></button>
              <button className={btnSm} title="Удалить" onClick={e => { e.stopPropagation(); deleteLocation(loc.id); }}><Icon name="Trash2" size={11} /></button>
            </div>
            <button onClick={() => toggle(loc.id)} className="shrink-0 text-muted-foreground">
              <Icon name={expanded[loc.id] ? "ChevronUp" : "ChevronDown"} size={14} />
            </button>
          </div>

          {expanded[loc.id] && (
            <div className="border-t border-border">
              {loc.rooms.map(room => (
                <div key={room.id}>
                  {/* Room row */}
                  <div className="flex items-center gap-1 pl-9 pr-3 py-2 border-t border-border/40 hover:bg-muted/20 transition-colors group/room">
                    <button className="flex items-center gap-2 flex-1 min-w-0 text-left" onClick={() => toggle(room.id)}>
                      <Icon name="DoorOpen" size={13} className="text-muted-foreground shrink-0" />
                      {editing === room.id ? (
                        <InlineEdit value={room.name} onSave={v => { renameRoom(loc.id, room.id, v); setEditing(null); }} onCancel={() => setEditing(null)} />
                      ) : (
                        <>
                          <span className="text-foreground/80 flex-1 truncate">{room.name}</span>
                          <span className="text-xs text-muted-foreground shrink-0 mr-1">{things.filter(t => t.roomId === room.id).length}</span>
                        </>
                      )}
                    </button>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover/room:opacity-100 transition-opacity shrink-0">
                      <button className={btnSm} onClick={e => { e.stopPropagation(); setEditing(room.id); }}><Icon name="Pencil" size={10} /></button>
                      <button className={btnSm} onClick={e => { e.stopPropagation(); deleteRoom(loc.id, room.id); }}><Icon name="Trash2" size={10} /></button>
                    </div>
                    <button onClick={() => toggle(room.id)} className="shrink-0 text-muted-foreground ml-1">
                      <Icon name={expanded[room.id] ? "ChevronUp" : "ChevronDown"} size={12} />
                    </button>
                  </div>

                  {expanded[room.id] && (
                    <>
                      {room.wardrobes.map(wardrobe => (
                        <div key={wardrobe.id}>
                          {/* Wardrobe row */}
                          <div className="flex items-center gap-1 pl-14 pr-3 py-1.5 hover:bg-muted/15 transition-colors group/wardrobe">
                            <button className="flex items-center gap-2 flex-1 min-w-0 text-left" onClick={() => toggle(wardrobe.id)}>
                              <Icon name="Package" size={12} className="text-muted-foreground/70 shrink-0" />
                              {editing === wardrobe.id ? (
                                <InlineEdit value={wardrobe.name} onSave={v => { renameWardrobe(loc.id, room.id, wardrobe.id, v); setEditing(null); }} onCancel={() => setEditing(null)} />
                              ) : (
                                <span className="text-foreground/70 flex-1 truncate">{wardrobe.name}</span>
                              )}
                            </button>
                            <div className="flex items-center gap-0.5 opacity-0 group-hover/wardrobe:opacity-100 transition-opacity shrink-0">
                              <button className={btnSm} onClick={e => { e.stopPropagation(); setEditing(wardrobe.id); }}><Icon name="Pencil" size={10} /></button>
                              <button className={btnSm} onClick={e => { e.stopPropagation(); deleteWardrobe(loc.id, room.id, wardrobe.id); }}><Icon name="Trash2" size={10} /></button>
                            </div>
                            <button onClick={() => toggle(wardrobe.id)} className="shrink-0 text-muted-foreground ml-1">
                              <Icon name={expanded[wardrobe.id] ? "ChevronUp" : "ChevronDown"} size={11} />
                            </button>
                          </div>

                          {expanded[wardrobe.id] && (
                            <>
                              {wardrobe.sections.map(section => (
                                <div key={section.id}>
                                  {/* Section row */}
                                  <div className="flex items-center gap-1 pl-[72px] pr-3 py-1 group/sec hover:bg-muted/10 transition-colors">
                                    <Icon name="Layers" size={10} className="text-muted-foreground/40 shrink-0" />
                                    {editing === section.id ? (
                                      <InlineEdit value={section.name} onSave={v => { renameSection(loc.id, room.id, wardrobe.id, section.id, v); setEditing(null); }} onCancel={() => setEditing(null)} />
                                    ) : (
                                      <>
                                        <span className="text-[10px] text-muted-foreground/60 uppercase tracking-widest flex-1 truncate ml-1">{section.name}</span>
                                        <div className="flex items-center gap-0.5 opacity-0 group-hover/sec:opacity-100 transition-opacity">
                                          <button className={btnSm} onClick={e => { e.stopPropagation(); setEditing(section.id); }}><Icon name="Pencil" size={9} /></button>
                                          <button className={btnSm} onClick={e => { e.stopPropagation(); deleteSection(loc.id, room.id, wardrobe.id, section.id); }}><Icon name="Trash2" size={9} /></button>
                                        </div>
                                      </>
                                    )}
                                  </div>

                                  {/* Shelves */}
                                  {section.shelves.map(shelf => {
                                    const count = things.filter(t => t.shelfId === shelf.id && !t.inHand).length;
                                    return (
                                      <div key={shelf.id} className="flex items-center gap-2 pl-[86px] pr-3 py-1.5 group/shelf hover:bg-muted/10 transition-colors">
                                        <div className="w-1 h-1 rounded-full bg-border/80 shrink-0" />
                                        {editing === shelf.id ? (
                                          <InlineEdit value={shelf.name} onSave={v => { renameShelf(loc.id, room.id, wardrobe.id, section.id, shelf.id, v); setEditing(null); }} onCancel={() => setEditing(null)} />
                                        ) : (
                                          <>
                                            <span className="text-xs text-muted-foreground flex-1 truncate">{shelf.name}</span>
                                            {count > 0 && <span className="px-1.5 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-medium shrink-0">{count}</span>}
                                            <div className="flex items-center gap-0.5 opacity-0 group-hover/shelf:opacity-100 transition-opacity">
                                              <button className={btnSm} onClick={e => { e.stopPropagation(); setEditing(shelf.id); }}><Icon name="Pencil" size={9} /></button>
                                              <button className={btnSm} onClick={e => { e.stopPropagation(); deleteShelf(loc.id, room.id, wardrobe.id, section.id, shelf.id); }}><Icon name="Trash2" size={9} /></button>
                                            </div>
                                          </>
                                        )}
                                      </div>
                                    );
                                  })}

                                  {/* Add shelf */}
                                  <button className={`${addBtn} pl-[86px]`} onClick={() => openModal("add-shelf", { locId: loc.id, roomId: room.id, wId: wardrobe.id, secId: section.id })}>
                                    <Icon name="Plus" size={10} />
                                    Добавить полку
                                  </button>
                                </div>
                              ))}

                              {/* Add section */}
                              <button className={`${addBtn} pl-[72px]`} onClick={() => openModal("add-section", { locId: loc.id, roomId: room.id, wId: wardrobe.id })}>
                                <Icon name="Plus" size={10} />
                                Добавить секцию
                              </button>
                            </>
                          )}
                        </div>
                      ))}

                      {/* Add wardrobe */}
                      <button className={`${addBtn} pl-14`} onClick={() => openModal("add-wardrobe", { locId: loc.id, roomId: room.id })}>
                        <Icon name="Plus" size={10} />
                        Добавить шкаф
                      </button>
                    </>
                  )}
                </div>
              ))}

              {/* Add room */}
              <button className={`${addBtn} pl-9`} onClick={() => openModal("add-room", { locId: loc.id })}>
                <Icon name="Plus" size={10} />
                Добавить комнату
              </button>
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

      {/* Add location */}
      <button
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-border text-sm font-body text-muted-foreground hover:border-primary hover:text-primary transition-all"
        onClick={() => openModal("add-location")}
      >
        <Icon name="Plus" size={14} />
        Добавить локацию
      </button>

      {/* Modal */}
      {modal && (
        <MiniModal title={modalTitles[modal.type ?? ""] ?? "Добавить"} onClose={closeModal}>
          <div className="space-y-3">
            {modal.type === "add-location" && (
              <div>
                <p className="text-xs text-muted-foreground font-body mb-2">Иконка</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {LOCATION_ICONS.map(icon => (
                    <button
                      key={icon}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${modalIcon === icon ? "bg-primary/20 border border-primary text-primary" : "bg-muted border border-border text-muted-foreground hover:border-primary/50"}`}
                      onClick={() => setModalIcon(icon)}
                    >
                      <Icon name={icon as "Home"} size={16} />
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground font-body mb-1.5">Название</p>
              <input
                autoFocus
                className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm font-body text-foreground focus:outline-none focus:border-primary transition-colors"
                placeholder="Введите название..."
                value={modalName}
                onChange={e => setModalName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleModalSave()}
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button className="flex-1 py-2.5 rounded-xl border border-border text-sm font-body text-muted-foreground hover:text-foreground transition-colors" onClick={closeModal}>Отмена</button>
              <button
                className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-body font-medium transition-all hover:opacity-90 disabled:opacity-40"
                disabled={!modalName.trim()}
                onClick={handleModalSave}
              >Создать</button>
            </div>
          </div>
        </MiniModal>
      )}
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function Index() {
  const [locations, setLocations] = useState<Location[]>(INITIAL_LOCATIONS);
  const [things, setThings] = useState<Thing[]>(INITIAL_THINGS);
  const [activeTab, setActiveTab] = useState<"catalog" | "locations" | "inhand">("catalog");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Все");
  const [selectedThing, setSelectedThing] = useState<Thing | null>(null);
  const [addingThing, setAddingThing] = useState(false);

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

  const addThing = (thing: Thing) => {
    setThings(prev => [thing, ...prev]);
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
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-semibold">{tab.badge}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-4 py-5">
        {(activeTab === "catalog" || activeTab === "inhand") && (
          <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-thin">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-body font-medium transition-all ${category === cat ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted border border-border"}`}
                onClick={() => setCategory(cat)}
              >{cat}</button>
            ))}
          </div>
        )}

        {activeTab === "locations" && (
          <div className="animate-slide-up">
            <LocationTree locations={locations} things={things} onLocationsChange={setLocations} />
          </div>
        )}

        {(activeTab === "catalog" || activeTab === "inhand") && (
          <>
            {search && filtered.length > 0 && (
              <p className="mb-4 text-xs text-muted-foreground font-body flex items-center gap-1.5">
                <Icon name="Search" size={12} />
                Найдено: <strong className="text-foreground">{filtered.length}</strong>
              </p>
            )}

            {activeTab === "inhand" && inHandCount === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <Icon name="Hand" size={26} className="text-muted-foreground" />
                </div>
                <p className="font-display text-xl text-foreground mb-1">Ничего на руках</p>
                <p className="text-sm text-muted-foreground font-body">Нажмите на вещь и возьмите её в руки</p>
              </div>
            )}

            {filtered.length === 0 && search && (
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
                <div key={thing.id} className="animate-slide-up" style={{ animationDelay: `${i * 40}ms`, animationFillMode: "both" }}>
                  <ThingCard thing={thing} locations={locations} onClick={() => setSelectedThing(thing)} onToggleHand={toggleHand} />
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* FAB */}
      {(activeTab === "catalog" || activeTab === "inhand") && (
        <button
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:opacity-90 active:scale-95 transition-all amber-glow"
          onClick={() => setAddingThing(true)}
          title="Добавить вещь"
        >
          <Icon name="Plus" size={24} />
        </button>
      )}

      {selectedThing && (
        <ThingDetail
          thing={selectedThing}
          locations={locations}
          onClose={() => setSelectedThing(null)}
          onToggleHand={toggleHand}
          onMove={moveThing}
          onAddPhoto={addPhoto}
        />
      )}

      {addingThing && (
        <AddThingModal
          locations={locations}
          onClose={() => setAddingThing(false)}
          onAdd={addThing}
        />
      )}
    </div>
  );
}