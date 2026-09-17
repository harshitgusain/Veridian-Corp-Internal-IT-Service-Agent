import React from 'react';
import {
  MessageSquarePlus,
  PlayCircle,
  Users,
  Ticket,
  BookOpen,
  History,
  GitFork,
  HelpCircle,
} from 'lucide-react';

export type TabType =
  | 'new-request'
  | 'demo'
  | 'requests'
  | 'tickets'
  | 'kb'
  | 'audit'
  | 'architecture'
  | 'about';

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  unresolvedRequestsCount: number;
  openTicketsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  unresolvedRequestsCount,
  openTicketsCount,
}) => {
  const navItems = [
    {
      id: 'new-request' as TabType,
      label: 'New Request',
      icon: MessageSquarePlus,
      badge: null,
    },
    {
      id: 'demo' as TabType,
      label: 'Demo Mode (10 Tests)',
      icon: PlayCircle,
      badge: 'Interactive',
    },
    {
      id: 'requests' as TabType,
      label: 'Employee Requests',
      icon: Users,
      badge: '15 items',
    },
    {
      id: 'tickets' as TabType,
      label: 'Ticket Queue',
      icon: Ticket,
      badge: openTicketsCount > 0 ? `${openTicketsCount} active` : null,
    },
    {
      id: 'kb' as TabType,
      label: 'Knowledge Base',
      icon: BookOpen,
      badge: '11 docs',
    },
    {
      id: 'audit' as TabType,
      label: 'Audit Logs',
      icon: History,
      badge: null,
    },
    {
      id: 'architecture' as TabType,
      label: 'Architecture & Engine',
      icon: GitFork,
      badge: null,
    },
    {
      id: 'about' as TabType,
      label: 'System Specs',
      icon: HelpCircle,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 border-b border-slate-800">
        <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
          Operations Console
        </span>
        <p className="text-xs text-slate-400 mt-0.5">Veridian Corp IT Operations</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-mono font-medium ${
                    isActive
                      ? 'bg-blue-700/80 text-blue-100'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Grounding Reminder Footer */}
      <div className="p-4 m-3 rounded-lg bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300">
        <p className="font-semibold text-white mb-1">Strict Grounding Rule</p>
        <p className="leading-relaxed text-slate-300">
          The system strictly enforces policies from the verified Data Pack (KB-01 to KB-10 & Asset Management). Never invents procedures or authority.
        </p>
      </div>
    </aside>
  );
};
