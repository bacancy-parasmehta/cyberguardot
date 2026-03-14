"use client";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search",
}: SearchInputProps) {
  return (
    <input
      className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white outline-none transition focus:border-sky-500"
      placeholder={placeholder}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

