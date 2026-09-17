import React, { useState, useRef, useEffect } from 'react';
import { Shield, Server, Clock, CheckCircle2, Terminal, Globe, ChevronDown } from 'lucide-react';
import { useTimezone } from '../lib/TimezoneContext.tsx';
import { TIMEZONE_OPTIONS, TimezoneMode } from '../lib/timeUtils.ts';

interface HeaderProps {
  activeTicketsCount: number;
  totalPoliciesCount: number;
  engineStatus: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTicketsCount,
  totalPoliciesCount,
  engineStatus,
}) => {
  const { timezoneMode, setTimezoneMode, userTimezoneSummary, currentTimeString } = useTimezone();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeOption = TIMEZONE_OPTIONS.find((t) => t.id === timezoneMode) || TIMEZONE_OPTIONS[0];

  return (
    <header className="border-b border-slate-200 bg-white shadow-xs sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Identity */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-sm ring-1 ring-slate-800 shrink-0">
              <Shield className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 tracking-tight text-lg">
                  Veridian Corp
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium border border-slate-200">
                  IT Support Portal
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium flex-wrap">
                <span>Internal IT Service Operations</span>
                <span className="text-slate-300">•</span>
                <Clock className="h-3 w-3 inline text-slate-400" />
                <span>Simulation Week: 21 Sep – 25 Sep 2026</span>
              </p>
            </div>
          </div>

          {/* Right Status / Telemetry Badges */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Timezone Selector & Live Clock Pill */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs transition-colors shadow-2xs"
                title={`Current time: ${currentTimeString} (${userTimezoneSummary})`}
              >
                <Globe className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                <div className="text-left font-mono">
                  <span className="font-bold text-slate-900">{currentTimeString}</span>
                  <span className="text-slate-500 text-2xs ml-1 font-sans">({activeOption.abbr})</span>
                </div>
                <ChevronDown className="h-3 w-3 text-slate-400 ml-0.5" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-72 bg-white rounded-xl shadow-lg border border-slate-200 p-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-2.5 py-1.5 border-b border-slate-100 mb-1">
                    <span className="font-bold text-slate-900 block text-xs">Display Timezone</span>
                    <span className="text-slate-500 text-2xs block">
                      Detected: {userTimezoneSummary}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    {TIMEZONE_OPTIONS.map((opt) => {
                      const isSelected = opt.id === timezoneMode;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setTimezoneMode(opt.id as TimezoneMode);
                            setDropdownOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-2 rounded-lg transition-colors flex items-center justify-between ${
                            isSelected
                              ? 'bg-blue-50 text-blue-900 font-semibold'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div>
                            <span className="block text-xs">{opt.label}</span>
                            <span className="text-2xs font-mono text-slate-400">{opt.timeZone}</span>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-1.5 pt-1.5 border-t border-slate-100 px-2 text-2xs text-slate-400">
                    All ticket and audit trail timestamps will automatically format using this timezone.
                  </div>
                </div>
              )}
            </div>

            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-medium">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>Data Pack Grounded</span>
            </div>

            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-slate-700 text-xs">
              <Server className="h-3.5 w-3.5 text-slate-500" />
              <span>{totalPoliciesCount} Policies</span>
              <span className="text-slate-300">|</span>
              <span>{activeTicketsCount} Queue Tickets</span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-50 border border-blue-200 text-blue-800 text-xs font-mono">
              <Terminal className="h-3.5 w-3.5 text-blue-600" />
              <span>{engineStatus}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
