interface StatCardProps {
  label: string;
  value: string;
  color?: string;
  size?: 'sm' | 'md';
}

export default function StatCard({
  label,
  value,
  color = 'text-white',
  size = 'md',
}: StatCardProps) {
  if (size === 'sm') {
    return (
      <div className="bg-gray-800 rounded-lg p-3 border border-gray-700 text-center md:p-4">
        <p className="text-xs text-gray-400 mb-2">{label}</p>
        <p className={`text-lg font-bold md:text-xl ${color}`}>{value}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-3 border border-gray-700 text-center md:p-4">
      <p className="text-sm text-gray-400 mb-2">{label}</p>
      <p className={`text-2xl font-bold md:text-3xl ${color}`}>{value}</p>
    </div>
  );
}
