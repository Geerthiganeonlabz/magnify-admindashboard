"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchableSelectProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
}

/**
 * Accessible, self-contained searchable dropdown.
 * Lets the user filter a list of options by typing and pick one.
 */
export function SearchableSelect({
  options,
  value,
  onChange,
  onBlur,
  placeholder = "Select an option",
  searchPlaceholder = "Search...",
  className,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.toLowerCase().includes(q));
  }, [options, query]);

  // Focus the search box when the menu opens.
  useEffect(() => {
    if (open) searchInputRef.current?.focus();
  }, [open]);

  const select = (option: string) => {
    onChange(option);
    setOpen(false);
    setQuery("");
    onBlur?.();
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "flex w-full items-center justify-between rounded-lg border border-[#C3C6D4] bg-white px-3 text-left text-[16px] transition-colors focus:border-[#0040A1] focus:outline-none focus:ring-1 focus:ring-[#0040A1]",
          className,
        )}
      >
        <span className={value ? "text-[#1A1C1F]" : "text-[#6B7280]"}>
          {value || placeholder}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-[#6B7280] transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-[#C3C6D4] bg-white shadow-lg">
          <div className="flex items-center gap-2 border-b border-[#E5E5E8] px-3 py-2">
            <Search className="h-4 w-4 shrink-0 text-[#6B7280]" />
            <input
              ref={searchInputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent text-[15px] text-[#1A1C1F] placeholder:text-[#6B7280] focus:outline-none"
            />
          </div>

          <ul role="listbox" className="max-h-60 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-[#6B7280]">
                No results found
              </li>
            ) : (
              filtered.map((option) => {
                const isSelected = option === value;
                return (
                  <li key={option} role="option" aria-selected={isSelected}>
                    <button
                      type="button"
                      onClick={() => select(option)}
                      className={cn(
                        "flex w-full items-center justify-between px-3 py-2 text-left text-[15px] transition-colors hover:bg-[#F3F3F8]",
                        isSelected
                          ? "font-medium text-[#0040A1]"
                          : "text-[#1A1C1F]",
                      )}
                    >
                      {option}
                      {isSelected && <Check className="h-4 w-4 text-[#0040A1]" />}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default SearchableSelect;
