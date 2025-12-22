const stats = [
  { label: "Problems", value: "1,500+" },
  { label: "Active Users", value: "50K+" },
  { label: "Submissions", value: "2M+" },
  { label: "Contests", value: "120+" },
];

export default function Stats() {
  return (
    <section className="bg-gray-900 py-16 text-gray-100">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {stats.map((s, i) => (
          <div key={i}>
            <h3 className="text-3xl font-bold text-indigo-400">{s.value}</h3>
            <p className="text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
