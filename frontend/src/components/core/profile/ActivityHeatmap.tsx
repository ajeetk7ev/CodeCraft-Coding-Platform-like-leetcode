import React, { useMemo, useState } from "react";
import { ChevronDown, Calendar, Activity, Flame } from "lucide-react";
import { motion } from "framer-motion";

interface Submission {
  date: string;
  status: string;
}

interface Props {
  submissions: Submission[];
}

const CELL_SIZE = 12;
const CELL_GAP = 3;
const WEEK_WIDTH = CELL_SIZE + CELL_GAP;

const ActivityHeatmap: React.FC<Props> = ({ submissions }) => {
  const [year, setYear] = useState(new Date().getFullYear());

  /* ---------- Utils ---------- */
  const toUTCDateString = (date: Date) =>
    new Date(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate()
    )
      .toISOString()
      .split("T")[0];

  /* ---------- Group by date ---------- */
  const submissionsByDate = useMemo(() => {
    const map: Record<string, Submission[]> = {};
    submissions.forEach((s) => {
      const key = toUTCDateString(new Date(s.date));
      if (!map[key]) map[key] = [];
      map[key].push(s);
    });
    return map;
  }, [submissions]);

  /* ---------- Intensity ---------- */
  const getIntensity = (date: string) => {
    const count = submissionsByDate[date]?.length || 0;
    if (count === 0) return 0;
    if (count <= 1) return 1;
    if (count <= 3) return 2;
    if (count <= 5) return 3;
    return 4;
  };

  const intensityColor = (level: number) =>
    [
      "bg-white/5",
      "bg-emerald-900/40",
      "bg-emerald-700/60",
      "bg-emerald-500/80",
      "bg-emerald-400",
    ][level];

  /* ---------- Build year grid ---------- */
  const weeks = useMemo(() => {
    const start = new Date(Date.UTC(year, 0, 1));
    const end = new Date(Date.UTC(year + 1, 0, 0));

    const firstSunday = new Date(start);
    firstSunday.setUTCDate(start.getUTCDate() - start.getUTCDay());

    const grid = [];
    let current = new Date(firstSunday);

    while (current <= end) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        const dateStr = toUTCDateString(current);
        week.push({
          date: new Date(current),
          dateStr,
          count: submissionsByDate[dateStr]?.length || 0,
          intensity: getIntensity(dateStr),
          isCurrentYear: current.getUTCFullYear() === year,
        });
        current.setUTCDate(current.getUTCDate() + 1);
      }
      grid.push(week);
    }

    return grid;
  }, [year, submissionsByDate]);

  /* ---------- Month positions ---------- */
  const monthPositions = useMemo(() => {
    const seen = new Set<number>();
    const positions: { label: string; weekIndex: number }[] = [];

    weeks.forEach((week, weekIndex) => {
      week.forEach((day) => {
        const month = day.date.getUTCMonth();
        if (
          day.isCurrentYear &&
          day.date.getUTCDate() === 1 &&
          !seen.has(month)
        ) {
          seen.add(month);
          positions.push({
            label: day.date.toLocaleString("en-US", { month: "short" }),
            weekIndex,
          });
        }
      });
    });

    return positions;
  }, [weeks]);

  /* ---------- Stats ---------- */
  const stats = useMemo(() => {
    const yearSubs = submissions.filter(
      (s) => new Date(s.date).getUTCFullYear() === year
    );
    const activeDays = new Set(
      yearSubs.map((s) => toUTCDateString(new Date(s.date)))
    ).size;

    return {
      total: yearSubs.length,
      activeDays,
    };
  }, [submissions, year]);

  const dayLabels = ["Sun", "Tue", "Thu", "Sat"];

  const years = Array.from(
    new Set(submissions.map((s) => new Date(s.date).getUTCFullYear()))
  );
  if (years.length === 0) years.push(new Date().getFullYear());
  years.sort((a, b) => b - a);

  /* ---------- UI ---------- */
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl group"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Activity className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white tracking-tight">
              {stats.total} <span className="text-slate-500">Submissions</span>
            </h3>
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mt-0.5">Yearly Activity Hub</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Active Days</span>
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500 shadow-orange-500/50" />
              <span className="text-xl font-black text-slate-100">{stats.activeDays}</span>
            </div>
          </div>

          <div className="relative group/select">
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="appearance-none bg-slate-950/50 border border-white/10 rounded-xl px-5 py-2.5 pr-10 text-sm font-bold text-slate-300 hover:bg-slate-900 hover:text-white transition-all cursor-pointer"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none group-hover/select:text-white transition-colors" />
          </div>
        </div>
      </div>

      {/* Heatmap Area */}
      <div className="relative overflow-hidden pt-4">
        <div className="overflow-x-auto scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-white/10 pb-4">
          <div className="inline-block min-w-full">
            {/* Month labels */}
            <div className="relative mb-3 ml-12 h-5">
              {monthPositions.map((m) => (
                <div
                  key={m.label}
                  className="absolute text-[10px] font-black uppercase tracking-widest text-slate-500"
                  style={{ left: m.weekIndex * WEEK_WIDTH }}
                >
                  {m.label}
                </div>
              ))}
            </div>

            <div className="flex">
              {/* Day labels */}
              <div className="flex flex-col justify-between pr-4 h-[104px]">
                {dayLabels.map((d) => (
                  <div key={d} className="text-[10px] font-black uppercase tracking-tighter text-slate-600">
                    {d}
                  </div>
                ))}
              </div>

              {/* Grid */}
              <div className="flex gap-[4px]">
                {weeks.map((week, wi) => (
                  <div key={wi} className="flex flex-col gap-[4px]">
                    {week.map((day, di) => (
                      <motion.div
                        key={di}
                        initial={false}
                        whileHover={{ scale: 1.3, zIndex: 10 }}
                        title={`${day.date.toDateString()} — ${day.count} submissions`}
                        className={`w-[12px] h-[12px] rounded-[3px] shadow-sm transition-colors duration-300 ${intensityColor(day.intensity)
                          } ${!day.isCurrentYear ? "opacity-10" : ""}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/5">
        <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
          <Calendar className="w-3 h-3" />
          Viewing {year} activity
        </div>
        <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
          <span>Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-[2px] ${intensityColor(i)}`}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ActivityHeatmap;
