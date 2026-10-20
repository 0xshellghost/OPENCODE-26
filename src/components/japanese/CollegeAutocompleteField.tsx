'use client';

import {
  ChangeEvent,
  KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Check, ChevronDown, GraduationCap, X } from 'lucide-react';

interface CollegeAutocompleteFieldProps {
  name: string;
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onSelect?: (college: string) => void;
  colleges: string[];
  placeholder?: string;
  required?: boolean;
  full?: boolean;
}

// Extract acronym from college name (e.g. "Indian Institute of Technology" -> "iit")
function getAcronym(name: string): string {
  const words = name
    .replace(/[(),]/g, ' ')
    .split(/[\s-]+/)
    .filter(Boolean);
  return words.map((w) => w[0]?.toLowerCase() || '').join('');
}

// Match score calculation for ranking
function scoreCollegeMatch(college: string, rawQuery: string): number {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return 0;

  const colLower = college.toLowerCase().trim();
  const colClean = colLower.replace(/[(),.-]/g, ' ');

  // Exact match
  if (colLower === query || colClean === query) return 1000;

  // Starts with query (prefix match)
  if (colLower.startsWith(query)) return 800 - query.length;

  // Word starts with query
  const words = colClean.split(/\s+/).filter(Boolean);
  if (words.some((w) => w.startsWith(query))) return 600;

  // Acronym match
  const acronym = getAcronym(college);
  if (acronym === query) return 500;
  if (acronym.startsWith(query)) return 450;
  if (acronym.includes(query)) return 400;

  // Multi-word token match (all query tokens found in college name)
  const queryTokens = query.split(/\s+/).filter(Boolean);
  if (queryTokens.length > 1) {
    const allTokensMatch = queryTokens.every(
      (tok) => colClean.includes(tok) || words.some((w) => w.startsWith(tok)),
    );
    if (allTokensMatch) return 350;
  }

  // Substring match
  const subIdx = colLower.indexOf(query);
  if (subIdx !== -1) {
    return Math.max(100, 300 - subIdx);
  }

  // Fuzzy character subsequence match (e.g. "iiita" -> IIIT Allahabad)
  if (query.length >= 3) {
    let qIdx = 0;
    for (let i = 0; i < colLower.length && qIdx < query.length; i++) {
      if (colLower[i] === query[qIdx]) qIdx++;
    }
    if (qIdx === query.length) return 50;
  }

  return -1;
}

function HighlightMatch({ text, query }: { text: string; query: string }) {
  const trimmed = query.trim();
  if (!trimmed) return <span>{text}</span>;

  const idx = text.toLowerCase().indexOf(trimmed.toLowerCase());
  if (idx === -1) {
    return <span>{text}</span>;
  }

  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + trimmed.length);
  const after = text.slice(idx + trimmed.length);

  return (
    <span>
      {before}
      <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{match}</span>
      {after}
    </span>
  );
}

export default function CollegeAutocompleteField({
  name,
  label,
  value,
  onChange,
  onSelect,
  colleges,
  placeholder = 'Your institution',
  required = true,
  full = false,
}: CollegeAutocompleteFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter and rank matching colleges
  const matchingColleges = useMemo(() => {
    const q = value.trim();
    if (!q) {
      // When input is empty, show the first batch of registered colleges
      return colleges.slice(0, 10);
    }

    return colleges
      .map((col) => ({ college: col, score: scoreCollegeMatch(col, q) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || a.college.localeCompare(b.college))
      .map((item) => item.college)
      .slice(0, 15);
  }, [colleges, value]);

  // Handle outside clicks to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll active keyboard item into view
  useEffect(() => {
    if (activeIndex >= 0 && itemRefs.current[activeIndex]) {
      itemRefs.current[activeIndex]?.scrollIntoView({
        block: 'nearest',
      });
    }
  }, [activeIndex]);

  const handleSelect = (college: string) => {
    if (onSelect) {
      onSelect(college);
    } else {
      const syntheticEvent = {
        target: { name, value: college },
      } as ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    }
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onSelect) {
      onSelect('');
    } else {
      const syntheticEvent = {
        target: { name, value: '' },
      } as ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    }
    setIsOpen(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setActiveIndex(0);
      } else if (matchingColleges.length > 0) {
        setActiveIndex((prev) => (prev + 1) % matchingColleges.length);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (isOpen && matchingColleges.length > 0) {
        setActiveIndex((prev) => (prev <= 0 ? matchingColleges.length - 1 : prev - 1));
      }
    } else if (e.key === 'Enter') {
      if (isOpen && activeIndex >= 0 && activeIndex < matchingColleges.length) {
        e.preventDefault();
        handleSelect(matchingColleges[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      if (isOpen) {
        e.preventDefault();
        setIsOpen(false);
        setActiveIndex(-1);
      }
    } else if (e.key === 'Tab') {
      if (isOpen && activeIndex >= 0 && activeIndex < matchingColleges.length) {
        handleSelect(matchingColleges[activeIndex]);
      } else {
        setIsOpen(false);
      }
    }
  };

  return (
    <div className={`oc-field${full ? ' oc-field-full' : ''}`} ref={containerRef}>
      <span>
        {label} <span aria-hidden="true" style={{ color: 'var(--accent)' }}>*</span>
      </span>

      <div style={{ position: 'relative', width: '100%' }}>
        <input
          ref={inputRef}
          id={`register-${name}`}
          name={name}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e);
            setIsOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => {
            if (value.trim().length > 0 || colleges.length > 0) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          required={required}
          style={{
            width: '100%',
            paddingRight: value ? '56px' : '36px',
            borderColor: isOpen ? 'var(--accent)' : undefined,
            boxShadow: isOpen ? '0 0 0 1px var(--accent-soft)' : undefined,
          }}
        />

        {/* Right side controls: Clear icon & dropdown chevron */}
        <div
          style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--subtle)',
          }}
        >
          {value && (
            <button
              type="button"
              onClick={handleClear}
              title="Clear input"
              aria-label="Clear college input"
              style={{
                background: 'transparent',
                border: 'none',
                padding: '2px',
                cursor: 'pointer',
                color: 'var(--muted)',
                display: 'flex',
                alignItems: 'center',
                borderRadius: '4px',
              }}
            >
              <X size={14} />
            </button>
          )}
          <ChevronDown
            size={14}
            style={{
              transition: 'transform 0.2s ease',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* Floating Suggestion Menu */}
        {isOpen && (
          <div className="oc-autocomplete-dropdown" role="listbox">
            {matchingColleges.length > 0 ? (
              <>
                <div
                  style={{
                    padding: '6px 10px 4px 10px',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--subtle)',
                    fontFamily: 'var(--f-mono)',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid var(--line)',
                    marginBottom: '4px',
                  }}
                >
                  <span>Registered Institutions</span>
                  <span>
                    {matchingColleges.length}{' '}
                    {matchingColleges.length === 1 ? 'match' : 'matches'}
                  </span>
                </div>

                {matchingColleges.map((college, idx) => {
                  const isSelected = college.toLowerCase() === value.trim().toLowerCase();
                  const isHighlighted = idx === activeIndex;

                  return (
                    <div
                      key={college}
                      ref={(el) => {
                        itemRefs.current[idx] = el;
                      }}
                      role="option"
                      aria-selected={isSelected || isHighlighted}
                      className={`oc-autocomplete-item${isHighlighted ? ' active' : ''}${isSelected ? ' selected' : ''}`}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelect(college);
                      }}
                      onMouseEnter={() => setActiveIndex(idx)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0 }}>
                        <GraduationCap
                          size={15}
                          style={{
                            flexShrink: 0,
                            color: isHighlighted || isSelected ? 'var(--accent)' : 'var(--muted)',
                          }}
                        />
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          <HighlightMatch text={college} query={value} />
                        </span>
                      </div>
                      {isSelected && (
                        <Check size={14} style={{ flexShrink: 0, color: 'var(--accent)' }} />
                      )}
                    </div>
                  );
                })}
              </>
            ) : (
              <div
                style={{
                  padding: '12px 14px',
                  fontSize: '12px',
                  color: 'var(--muted)',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <span>
                  No registered institutions match &ldquo;
                  <strong style={{ color: 'var(--fg)' }}>{value.trim()}</strong>&rdquo;
                </span>
                <span style={{ fontSize: '11px', color: 'var(--subtle)' }}>
                  You can keep typing to register with this college name.
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
