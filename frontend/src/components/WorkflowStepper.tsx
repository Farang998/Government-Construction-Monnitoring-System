import React from 'react';
import { WorkflowInstanceDto, WorkflowStageStatusDto } from '@gov-platform/shared';
import { CheckCircle2, Clock, AlertTriangle, GitPullRequest, ShieldCheck, Flame, Trees, MapPin } from 'lucide-react';

interface WorkflowStepperProps {
  workflow: WorkflowInstanceDto | null;
  loading?: boolean;
}

export const WorkflowStepper: React.FC<WorkflowStepperProps> = ({ workflow, loading }) => {
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm animate-pulse space-y-4">
        <div className="h-6 bg-slate-200 rounded w-1/4"></div>
        <div className="h-20 bg-slate-100 rounded"></div>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="bg-white p-6 rounded-lg border border-slate-200 text-center text-slate-500">
        No active workflow DAG configuration found for this project.
      </div>
    );
  }

  const getSubClearanceIcon = (stageKey: string) => {
    switch (stageKey) {
      case 'FIRE_NOC':
        return <Flame className="w-4 h-4 text-orange-600 inline mr-1.5" />;
      case 'ENV_CLEARANCE':
        return <Trees className="w-4 h-4 text-emerald-600 inline mr-1.5" />;
      case 'LAND_NOC':
        return <MapPin className="w-4 h-4 text-blue-600 inline mr-1.5" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-slate-600 inline mr-1.5" />;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <GitPullRequest className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-900">Project Workflow DAG</h3>
            <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full font-mono font-semibold">
              {workflow.templateCode}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">{workflow.templateName}</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-emerald-700 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Completed
          </span>
          <span className="flex items-center gap-1 text-blue-700 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping"></span> Active Stage
          </span>
          <span className="flex items-center gap-1 text-amber-700 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Rework Requested
          </span>
        </div>
      </div>

      {/* DAG Stepper Track */}
      <div className="space-y-4">
        {workflow.stages.map((stage: WorkflowStageStatusDto, index: number) => {
          const isCompleted = stage.status === 'COMPLETED';
          const isActive = stage.stageKey === workflow.currentStageKey || stage.status === 'IN_PROGRESS';
          const isRework = stage.status === 'REWORK_REQUESTED';
          const isParallel = stage.executionType === ('PARALLEL_GATE' as any);

          return (
            <div
              key={stage.stageKey}
              className={`relative flex items-start gap-4 p-4 rounded-lg transition-all ${
                isActive
                  ? 'bg-blue-50/70 border-2 border-blue-500 shadow-sm'
                  : isRework
                  ? 'bg-amber-50/60 border-2 border-amber-400'
                  : isCompleted
                  ? 'bg-emerald-50/40 border border-emerald-200'
                  : 'bg-slate-50/60 border border-slate-200 opacity-75'
              }`}
            >
              {/* Connector line for vertical stepper */}
              {index < workflow.stages.length - 1 && (
                <div
                  className={`absolute left-7 top-12 bottom-0 w-0.5 -mb-4 z-0 ${
                    isCompleted ? 'bg-emerald-400' : 'bg-slate-200'
                  }`}
                />
              )}

              {/* Node Badge Icon */}
              <div
                className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs shrink-0 ${
                  isCompleted
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : isActive
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-md'
                    : isRework
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : isRework ? (
                  <AlertTriangle className="w-4 h-4" />
                ) : (
                  stage.orderIndex
                )}
              </div>

              {/* Stage Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900">{stage.stageName}</h4>
                    {isParallel && (
                      <span className="text-[10px] bg-purple-100 text-purple-800 font-semibold px-2 py-0.5 rounded">
                        PARALLEL STATUTORY GATE
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500 font-mono">
                    {stage.completedAt ? (
                      <span className="text-emerald-700 font-medium">
                        Passed: {new Date(stage.completedAt).toLocaleDateString()}
                      </span>
                    ) : isActive ? (
                      <span className="text-blue-700 font-semibold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 animate-spin" /> In Review
                      </span>
                    ) : (
                      'Pending'
                    )}
                  </span>
                </div>

                {/* Sub-clearance Parallel Gate Breakdown */}
                {isParallel && (
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2.5">
                    {['FIRE_NOC', 'ENV_CLEARANCE', 'LAND_NOC'].map((subKey) => {
                      const subTask = stage.tasks.find((t) => t.stageKey === subKey);
                      const isSubDone = subTask?.status === ('APPROVED' as any);
                      return (
                        <div
                          key={subKey}
                          className={`p-2.5 rounded border text-xs flex items-center justify-between ${
                            isSubDone
                              ? 'bg-emerald-100/60 border-emerald-300 text-emerald-900 font-medium'
                              : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center">
                            {getSubClearanceIcon(subKey)}
                            <span>{subKey.replace('_', ' ')}</span>
                          </div>
                          {isSubDone ? (
                            <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded">
                              CLEARED
                            </span>
                          ) : (
                            <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-1.5 py-0.5 rounded">
                              PENDING NOC
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Stage Tasks & Assigned Officers */}
                {stage.tasks.length > 0 && !isParallel && (
                  <div className="mt-2 space-y-1">
                    {stage.tasks.map((task) => (
                      <div
                        key={task.id}
                        className="text-xs text-slate-600 flex items-center justify-between bg-white/80 p-2 rounded border border-slate-200/60"
                      >
                        <div>
                          <span className="font-semibold text-slate-800">Assigned: </span>
                          <span>{task.assignedUserName || task.assignedDesignationTitle || 'Officer Queue'}</span>
                        </div>
                        <span className="font-mono text-[11px] text-slate-500">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
