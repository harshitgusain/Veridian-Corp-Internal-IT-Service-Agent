import React, { useState } from 'react';
import {
  Play,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Check,
  ListChecks,
} from 'lucide-react';
import { DEMO_TEST_CASES } from '../data/demoTestCases.ts';
import { AnalysisResponse, DemoTestCase, PolicyRule } from '../types.ts';

interface DemoModeViewProps {
  onRunTest: (test: DemoTestCase) => Promise<AnalysisResponse | null>;
  policies: PolicyRule[];
  onOpenPolicy: (policy: PolicyRule) => void;
}

export const DemoModeView: React.FC<DemoModeViewProps> = ({
  onRunTest,
  policies,
  onOpenPolicy,
}) => {
  const [runningTestId, setRunningTestId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, AnalysisResponse>>({});
  const [isBatchRunning, setIsBatchRunning] = useState(false);

  const handleSingleRun = async (test: DemoTestCase) => {
    setRunningTestId(test.id);
    try {
      const result = await onRunTest(test);
      if (result) {
        setTestResults((prev) => ({ ...prev, [test.id]: result }));
      }
    } finally {
      setRunningTestId(null);
    }
  };

  const handleRunAll = async () => {
    setIsBatchRunning(true);
    for (const test of DEMO_TEST_CASES) {
      setRunningTestId(test.id);
      try {
        const result = await onRunTest(test);
        if (result) {
          setTestResults((prev) => ({ ...prev, [test.id]: result }));
        }
      } catch (e) {
        console.error('Batch test error:', e);
      }
    }
    setRunningTestId(null);
    setIsBatchRunning(false);
  };

  const completedCount = Object.keys(testResults).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Evaluator Demo Mode
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-100 text-purple-800 border border-purple-200">
                10 Core Assignment Scenarios
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Verify the agent's policy-grounded decision engine across all 10 mandatory evaluation scenarios from the assignment brief.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleRunAll}
              disabled={isBatchRunning}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer"
            >
              {isBatchRunning ? (
                <>
                  <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Running Batch Tests...</span>
                </>
              ) : (
                <>
                  <ListChecks className="h-4 w-4" />
                  <span>Run All 10 Tests</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setTestResults({})}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-600 text-xs font-medium hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Results
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Evaluation Progress:</span>
            <span className="font-bold text-slate-800">
              {completedCount} of 10 Completed
            </span>
          </div>
          <div className="w-48 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
            <div
              className="bg-blue-600 h-full transition-all duration-300 rounded-full"
              style={{ width: `${(completedCount / 10) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* 10 Test Cases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {DEMO_TEST_CASES.map((test) => {
          const result = testResults[test.id];
          const isRunning = runningTestId === test.id;
          const passed = result && result.decision === test.expectedDecision;

          return (
            <div
              key={test.id}
              className={`bg-white rounded-xl border p-5 shadow-xs flex flex-col justify-between transition-all ${
                result
                  ? passed
                    ? 'border-emerald-300 ring-1 ring-emerald-200/50'
                    : 'border-rose-300'
                  : 'border-slate-200'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {test.id}
                    </span>
                    <span className="text-xs font-semibold text-slate-900">{test.name}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-2xs font-bold uppercase ${
                    test.expectedDecision === 'RESOLVE'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : test.expectedDecision === 'FOLLOW_UP'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    Expects: {test.expectedDecision}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-2xs font-semibold uppercase tracking-wider text-slate-400">
                    Scenario & Input
                  </span>
                  <p className="text-xs text-slate-600">{test.scenario}</p>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-800 font-sans italic">
                    "{test.sampleInput}"
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-2xs font-semibold uppercase tracking-wider text-slate-400">
                    Policy Rationale
                  </span>
                  <p className="text-xs text-slate-600 font-medium">{test.rationale}</p>
                </div>

                {/* If Result Available */}
                {result && (
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700">Actual Result:</span>
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          result.decision === 'RESOLVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : result.decision === 'FOLLOW_UP'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {result.decision}
                        </span>
                        {passed ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-bold">
                            <CheckCircle2 className="h-4 w-4" /> Match
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-rose-700 font-bold">
                            <AlertTriangle className="h-4 w-4" /> Mismatch
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-2.5 rounded bg-blue-50/60 border border-blue-100 text-xs text-slate-700">
                      <span className="font-semibold text-blue-900 block text-2xs">Generated Response:</span>
                      "{result.agentResponse}"
                    </div>

                    <div className="flex items-center justify-between text-2xs font-mono text-slate-500">
                      <span>Assigned: {result.assignedTeam}</span>
                      <span>Ticket: {result.structuredTicket.ticketId}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-2xs text-slate-400 font-mono">
                  {test.category}
                </span>
                <button
                  type="button"
                  onClick={() => handleSingleRun(test)}
                  disabled={isRunning || isBatchRunning}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
                >
                  {isRunning ? (
                    <>
                      <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Testing...</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3 w-3 fill-current" />
                      <span>Run Test</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
