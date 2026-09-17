import React, { useState } from 'react';
import { BookOpen, Search, ShieldCheck, Users, ExternalLink, Filter } from 'lucide-react';
import { PolicyRule } from '../types.ts';

interface KnowledgeBaseViewProps {
  policies: PolicyRule[];
  onOpenPolicy: (policy: PolicyRule) => void;
}

export const KnowledgeBaseView: React.FC<KnowledgeBaseViewProps> = ({
  policies,
  onOpenPolicy,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(policies.map((p) => p.category)))];

  const filteredPolicies = policies.filter((p) => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      p.id.toLowerCase().includes(term) ||
      p.title.toLowerCase().includes(term) ||
      p.content.toLowerCase().includes(term) ||
      p.keyRules.some((r) => r.toLowerCase().includes(term));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Veridian Corp IT Knowledge Base & Policies
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-100 text-blue-800 border border-blue-200">
                11 Policy Sources
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              The single source of truth for all IT decision making. Every agent response and escalation is grounded in these exact policies.
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search policies, rules, keywords..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-800"
            />
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="h-3 w-3" /> Filter:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Policies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredPolicies.map((policy) => {
          const isAssetMgmt = policy.id === 'ASSET-MGMT';
          return (
            <div
              key={policy.id}
              onClick={() => onOpenPolicy(policy)}
              className={`bg-white rounded-xl border p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group ${
                isAssetMgmt
                  ? 'border-indigo-200 bg-gradient-to-b from-indigo-50/20 to-white'
                  : 'border-slate-200'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-md text-xs font-mono font-bold border ${
                      isAssetMgmt
                        ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
                        : 'bg-blue-100 text-blue-800 border-blue-200'
                    }`}>
                      {policy.id}
                    </span>
                    <span className="text-2xs uppercase tracking-wider text-slate-400 font-semibold">
                      {policy.category}
                    </span>
                  </div>
                  <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {policy.title}
                </h3>

                <p className="text-xs text-slate-700 leading-relaxed font-sans bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
                  "{policy.content}"
                </p>

                <div className="space-y-1 pt-1">
                  <span className="text-2xs uppercase tracking-wider text-slate-400 font-bold block">
                    Key Grounding Rules:
                  </span>
                  <ul className="space-y-1">
                    {policy.keyRules.map((rule, rIdx) => (
                      <li key={rIdx} className="flex items-start gap-1.5 text-xs text-slate-600">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-2xs text-slate-500">
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3 text-slate-400" />
                  <span>{policy.applicableRoles.join(', ')}</span>
                </div>
                <span className="text-blue-600 font-medium">Click to inspect</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
