import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export function Select({ value, onChange, options = [], placeholder = 'Sélectionner...', className = '' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const selected = options.find(o => o.value === value);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="w-full h-10 px-3 inline-flex items-center justify-between rounded-md border bg-white text-sm text-slate-900 hover:bg-slate-50"
      >
        <span className={!selected ? 'text-slate-400' : ''}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className="h-4 w-4 text-slate-500" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-white shadow-lg">
          <ul className="max-h-56 overflow-auto py-1 text-sm">
            {options.map((opt) => (
              <li key={opt.value}>
                <button
                  type="button"
                  onClick={() => { onChange?.(opt.value); setOpen(false); }}
                  className={`w-full text-left px-3 py-2 hover:bg-slate-50 ${value === opt.value ? 'bg-slate-100' : ''}`}
                >
                  {opt.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
