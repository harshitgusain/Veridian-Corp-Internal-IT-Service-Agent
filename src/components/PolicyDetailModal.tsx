import React from 'react';
import { X, BookOpen, ShieldCheck, Users } from 'lucide-react';
import { PolicyRule } from '../types.ts';

interface PolicyDetailModalProps {
  policy: PolicyRule | null;
  onClose: () => void;
}

export const PolicyDetailModal: React.FC<PolicyDetailModalProps> = ({ policy, onClose }) => {
  if (!policy) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-mono font-bold rounded-md bg-blue-100 text-blue-800 border border-blue-200">
              {policy.id}
            </span>
            <h3 className="text-base font-semibold text-slate-900">{policy.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Category
            </span>
            <p className="text-sm font-medium text-slate-800 mt-0.5">{policy.category}</p>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Exact Data Pack Policy Text
            </span>
            <div className="mt-1.5 p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-800 leading-relaxed font-sans">
              "{policy.content}"
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Key Rule Constraints
            </span>
            <ul className="mt-1.5 space-y-2">
              {policy.keyRules.map((rule, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Applicable Scope
            </span>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {policy.applicableRoles.map((role, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
                >
                  <Users className="h-3 w-3 text-slate-500" />
                  {role}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
          >
            Close Policy View
          </button>
        </div>
      </div>
    </div>
  );
};
