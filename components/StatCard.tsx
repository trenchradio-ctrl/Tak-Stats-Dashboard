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
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-center">
        <p className="text-xs text-gray-400 mb-2">{label}</p>
        <p className={`text-xl font-bold ${color}`}>{value}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-center">
      <p className="text-sm text-gray-400 mb-2">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
