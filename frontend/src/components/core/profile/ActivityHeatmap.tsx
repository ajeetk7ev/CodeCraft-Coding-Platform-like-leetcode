import React, { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";

interface Submission {
  date: string;
  status: string;
}

interface Props {
  submissions: Submission[];
}

const CELL_SIZE = 11;
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
      "bg-gray-800",
      "bg-green-900",
      "bg-green-700",
      "bg-green-600",
      "bg-green-500",
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

  /* ---------- Month positions (FIX) ---------- */
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
  ).sort((a, b) => b - a);

  /* ---------- UI ---------- */
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium text-gray-200">
          <span className="text-xl font-bold">{stats.total}</span>{" "}
          submissions in the past one year
        </h3>

        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span>
            Active days:{" "}
            <b className="text-gray-200">{stats.activeDays}</b>
          </span>

          <div className="relative">
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="appearance-none bg-gray-800 border border-gray-700 rounded px-3 py-1 pr-8 text-gray-200"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Scroll Area */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-225">
          {/* Month labels */}
          <div className="relative mb-2 ml-10 h-4">
            {monthPositions.map((m) => (
              <div
                key={m.label}
                className="absolute text-xs text-gray-400"
                style={{ left: m.weekIndex * WEEK_WIDTH }}
              >
                {m.label}
              </div>
            ))}
          </div>

          <div className="flex">
            {/* Day labels */}
            <div className="flex flex-col justify-between pr-2">
              {dayLabels.map((d) => (
                <div key={d} className="text-xs text-gray-400 h-3.5">
                  {d}
                </div>
              ))}
            </div>

            {/* Grid */}
            <div className="flex gap-0.75">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-0.75">
                  {week.map((day, di) => (
                    <div
                      key={di}
                      title={`${day.date.toDateString()} — ${day.count} submissions`}
                      className={`w-2.75 h-2.75 rounded-[2px] ${
                        intensityColor(day.intensity)
                      } ${!day.isCurrentYear ? "opacity-30" : ""}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex justify-end items-center gap-2 mt-4 text-xs text-gray-400">
            <span>Less</span>
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`w-2.75 h-2.75 rounded-[2px] ${intensityColor(i)}`}
              />
            ))}
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityHeatmap;
