import React, { useMemo, useState } from "react";
import { TCM_DB } from "../constants";
import { TCM_YINYANG_THEORY, TheoryCard } from "../tcm_yinyang_theory";
import { Flame, Snowflake, Moon, Sun, ArrowRightLeft, Divide } from "lucide-react";

type AxisVal = "yin" | "yang" | "mixed" | "neutral";
type HotCold = "heat" | "cold" | "mixed" | "neutral";
type DefEx = "def" | "excess" | "mixed" | "neutral";
type IntExt = "interior" | "exterior" | "mixed" | "neutral";

type Classified = {
  id: string;
  name_id: string;
  name_en?: string;
  axisYinYang: AxisVal;
  axisHotCold: HotCold;
  axisDefEx: DefEx;
  axisIntExt: IntExt;
  pattern_type?: string;
  primary_organs?: string[];
};

const norm = (s?: string) =>
  (s || "").toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();

function classifySyndrome(s: any): Classified {
  const p = norm(s.pattern_type);
  const name = norm((s.name_en || "") + " " + (s.name_id || ""));

  // default
  let axisYinYang: AxisVal = "neutral";
  let axisHotCold: HotCold = "neutral";
  let axisDefEx: DefEx = "neutral";
  let axisIntExt: IntExt = "interior";

  // Def / Excess
  if (p.includes("deficiency") || p.includes("def")) axisDefEx = "def";
  if (p.includes("excess") || p.includes("full")) {
    axisDefEx = axisDefEx === "def" ? "mixed" : "excess";
  }
  if (p.includes("mixed_deficiency")) axisDefEx = "mixed";

  // Cold / Heat
  if (p.includes("cold")) axisHotCold = "cold";
  if (p.includes("heat") || p.includes("fire")) {
    axisHotCold = axisHotCold === "cold" ? "mixed" : "heat";
  }

  // Interior / Exterior
  if (p.includes("external") || name.includes("menyerang paru") || name.includes("invading")) {
    axisIntExt = "exterior";
  }
  if (p.includes("phlegm") || p.includes("damp") || p.includes("organ") || p.includes("zang fu")) {
    axisIntExt = axisIntExt === "exterior" ? "mixed" : "interior";
  }

  // Yin / Yang (deduksi dari kombinasi ketiga sumbu)
  if (axisHotCold === "cold" || (axisDefEx === "def" && axisHotCold !== "heat")) {
    axisYinYang = "yin";
  } else if (axisHotCold === "heat" || axisDefEx === "excess") {
    axisYinYang = "yang";
  } else {
    axisYinYang = "neutral";
  }

  if (axisHotCold === "mixed" || axisDefEx === "mixed" || axisIntExt === "mixed") {
    axisYinYang = "mixed";
  }

  return {
    id: s.id,
    name_id: s.name_id,
    name_en: s.name_en,
    axisYinYang,
    axisHotCold,
    axisDefEx,
    axisIntExt,
    pattern_type: s.pattern_type,
    primary_organs: s.primary_organs
  };
}

const axisLabel = {
  yin: "Yin",
  yang: "Yang",
  mixed: "Campuran",
  neutral: "Netral"
};

const hotColdLabel = {
  heat: "Heat/Panas",
  cold: "Cold/Dingin",
  mixed: "Campuran",
  neutral: "Netral"
};

const defExLabel = {
  def: "Defisiensi",
  excess: "Excess/Penuh",
  mixed: "Campuran",
  neutral: "Netral"
};

const intExtLabel = {
  interior: "Interior",
  exterior: "Exterior",
  mixed: "Campuran",
  neutral: "Netral"
};

export const YinYangTheoryWindow: React.FC = () => {
  const [activeCardId, setActiveCardId] = useState<string>("yin_yang_basic");
  const [filterAxis, setFilterAxis] = useState<AxisVal | "all">("all");
  const [filterHot, setFilterHot] = useState<HotCold | "all">("all");
  const [organFilter, setOrganFilter] = useState<string | "all">("all");
  const [search, setSearch] = useState("");

  const theoryCard = TCM_YINYANG_THEORY.find(c => c.id === activeCardId) || TCM_YINYANG_THEORY[0];

  const allSyndromes = [
    ...TCM_DB.syndromes.FILLED_FROM_PDF,
    ...TCM_DB.syndromes.TODO_FROM_PDF
  ];

  const classified = useMemo(
    () => allSyndromes.map(classifySyndrome),
    [allSyndromes]
  );

  const organOptions = useMemo(() => {
    const s = new Set<string>();
    allSyndromes.forEach((sy: any) =>
      (sy.primary_organs || []).forEach((o: string) => s.add(o))
    );
    return ["all", ...Array.from(s)];
  }, [allSyndromes]);

  const filtered = classified.filter(sy => {
    if (filterAxis !== "all" && sy.axisYinYang !== filterAxis) return false;
    if (filterHot !== "all" && sy.axisHotCold !== filterHot) return false;
    if (organFilter !== "all" && !sy.primary_organs?.includes(organFilter)) return false;
    if (search) {
      const n = norm((sy.name_id || "") + " " + (sy.name_en || ""));
      if (!n.includes(norm(search))) return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col md:flex-row h-full bg-slate-950 text-slate-100 animate-fade-in print:bg-white print:text-black">
      {/* LEFT: THEORY CARDS */}
      <aside className="w-full md:w-80 border-r border-slate-800 p-4 overflow-y-auto bg-slate-900/90 print:hidden">
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2 text-tcm-accent">
            Yin–Yang Theory
        </h2>

        <div className="space-y-2 mb-4">
          {TCM_YINYANG_THEORY.map((card) => {
            const active = card.id === theoryCard.id;
            return (
              <button
                key={card.id}
                onClick={() => setActiveCardId(card.id)}
                className={`w-full text-left px-3 py-2 rounded-xl border text-sm transition
                  ${active
                    ? "bg-indigo-900/40 border-indigo-500 text-indigo-100"
                    : "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800"}`}
              >
                <div className="font-semibold">{card.title}</div>
                {card.subtitle && (
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {card.subtitle}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </aside>

      {/* RIGHT: DETAIL + MATRIX SINDROM */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* TEORI DETAIL */}
        <div className="border-b border-slate-800 p-4 bg-slate-900/60 print:bg-white print:text-black print:border-black">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold mb-1 print:text-black">{theoryCard.title}</h3>
              {theoryCard.subtitle && (
                <p className="text-sm text-slate-400 print:text-gray-600">{theoryCard.subtitle}</p>
              )}
            </div>

            {/* axis legend kecil */}
            {theoryCard.axis === "yin_yang" && (
              <div className="flex items-center gap-3 text-xs print:hidden">
                <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-slate-800 border border-slate-700">
                  <Moon className="w-3 h-3 text-sky-300" /> Yin
                </span>
                <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-slate-800 border border-slate-700">
                  <Sun className="w-3 h-3 text-amber-300" /> Yang
                </span>
              </div>
            )}
          </div>

          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <ul className="list-disc list-inside text-sm space-y-1 text-slate-200 print:text-black">
                {theoryCard.keyIdeas.map((k) => (
                  <li key={k}>{k}</li>
                ))}
              </ul>
            </div>

            {theoryCard.subtopics && (
              <div className="text-xs text-slate-300 space-y-2 max-h-40 overflow-auto border border-slate-800 rounded-xl p-2 bg-slate-900 print:bg-white print:text-black print:border-black print:h-auto print:max-h-none">
                {theoryCard.subtopics.map(sub => (
                  <div key={sub.id} className="border-b last:border-0 border-slate-800 pb-1 mb-1 last:pb-0 last:mb-0 print:border-gray-300">
                    <div className="font-semibold text-slate-100 mb-0.5 print:text-black">
                      {sub.title}
                    </div>
                    <div className="text-[11px] text-slate-400 mb-0.5 print:text-gray-700">
                      {sub.body}
                    </div>
                    {sub.bullets && (
                      <ul className="list-disc list-inside space-y-0.5 print:text-black">
                        {sub.bullets.map(b => (
                          <li key={b}>{b}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* FILTER BAR + MATRIX SINDROM */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 print:hidden">
          <div className="flex flex-wrap gap-3 items-center mb-2 text-xs">
            {/* Filter Yin/Yang */}
            <div className="flex items-center gap-1">
              <span className="text-slate-500 mr-1">Yin/Yang:</span>
              {(["all", "yin", "yang", "mixed"] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setFilterAxis(v === "all" ? "all" : v)}
                  className={`px-2 py-1 rounded-full border transition
                    ${filterAxis === v
                      ? "bg-indigo-900/50 border-indigo-500 text-indigo-100"
                      : "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800"}`}
                >
                  {v === "all" ? "Semua" : axisLabel[v]}
                </button>
              ))}
            </div>

            {/* Filter Hot/Cold */}
            <div className="flex items-center gap-1">
              <span className="text-slate-500 mr-1">Cold/Heat:</span>
              {(["all", "cold", "heat", "mixed"] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setFilterHot(v === "all" ? "all" : v)}
                  className={`px-2 py-1 rounded-full border transition
                    ${filterHot === v
                      ? "bg-amber-900/40 border-amber-500 text-amber-100"
                      : "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800"}`}
                >
                  {v === "all"
                    ? "Semua"
                    : v === "cold"
                    ? "Cold"
                    : v === "heat"
                    ? "Heat"
                    : "Campuran"}
                </button>
              ))}
            </div>

            {/* Organ filter */}
            <div className="flex items-center gap-1">
              <span className="text-slate-500 mr-1">Organ:</span>
              <select
                value={organFilter}
                onChange={(e) => setOrganFilter(e.target.value as any)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs outline-none focus:border-indigo-500"
              >
                {organOptions.map(o => (
                  <option key={o} value={o}>
                    {o === "all" ? "Semua" : o}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div className="flex items-center gap-1 ml-auto w-full md:w-auto">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari sindrom..."
                className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs w-full md:w-40 outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* list sindrom */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filtered.map(sy => (
              <div
                key={sy.id}
                className="border border-slate-800 rounded-xl p-3 bg-slate-900/70 text-xs flex flex-col gap-1 hover:border-slate-600 transition-colors"
              >
                <div className="font-semibold text-slate-100">
                  {sy.name_id}
                </div>
                <div className="text-[11px] text-slate-400">
                  {sy.name_en}
                </div>

                <div className="flex flex-wrap gap-1 mt-1">
                  {/* Yin/Yang */}
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 flex items-center gap-1">
                    {sy.axisYinYang === "yin" && (
                      <Moon className="w-3 h-3 text-sky-300" />
                    )}
                    {sy.axisYinYang === "yang" && (
                      <Sun className="w-3 h-3 text-amber-300" />
                    )}
                    {sy.axisYinYang === "mixed" && (
                      <Divide className="w-3 h-3 text-violet-300" />
                    )}
                    {axisLabel[sy.axisYinYang]}
                  </span>

                  {/* Cold/Heat */}
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 flex items-center gap-1">
                    {sy.axisHotCold === "cold" && (
                      <Snowflake className="w-3 h-3 text-sky-300" />
                    )}
                    {sy.axisHotCold === "heat" && (
                      <Flame className="w-3 h-3 text-rose-300" />
                    )}
                    {hotColdLabel[sy.axisHotCold]}
                  </span>

                  {/* Def/Ex */}
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 flex items-center gap-1">
                    <ArrowRightLeft className="w-3 h-3 text-emerald-300" />
                    {defExLabel[sy.axisDefEx]}
                  </span>

                  {/* Int/Ext */}
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700">
                    {intExtLabel[sy.axisIntExt]}
                  </span>
                </div>

                {sy.primary_organs?.length && (
                  <div className="text-[11px] text-slate-400 mt-1">
                    Organ: {sy.primary_organs.join(", ")}
                  </div>
                )}
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="text-slate-500 text-sm col-span-full text-center py-8">
                Tidak ada sindrom yang cocok dengan filter.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
