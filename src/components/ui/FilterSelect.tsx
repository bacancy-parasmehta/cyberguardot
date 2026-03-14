"use client";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterSelectProps {
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
}

export function FilterSelect({
  value,
  options,
  onChange,
}: FilterSelectProps) {
  return (
    <select
      className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white outline-none transition focus:border-sky-500"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

