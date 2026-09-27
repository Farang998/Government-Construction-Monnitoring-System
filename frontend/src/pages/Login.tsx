import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, User, AlertCircle, Building, CheckCircle2 } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, quickLoginAsPersona } = useAuth();
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login({ employeeId, password });
    } catch (err: any) {
      setError(err.message || 'Login failed. Invalid employee ID or password.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePersonaClick = async (empId: string) => {
    setError(null);
    setSubmitting(true);
    try {
      await quickLoginAsPersona(empId);
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate persona.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-900 font-sans p-4">
      <div className="grid w-full max-w-4xl grid-cols-1 overflow-hidden rounded-lg border border-slate-700 bg-white shadow-2xl md:grid-cols-2">
        {/* Left Panel - Government Emblem & System Info */}
        <div className="flex flex-col justify-between border-b border-slate-200 bg-gov-navy p-8 text-white md:border-b-0 md:border-r border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-gov-gold text-2xl font-bold text-gov-navy shadow">
                🏛️
              </div>
              <div>
                <h1 className="text-lg font-bold leading-tight">Government Infrastructure</h1>
                <p className="text-xs text-slate-300">Project Workflow & Monitoring Platform</p>
              </div>
            </div>

            <div className="mt-8 space-y-4 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <Shield className="h-4 w-4 text-gov-gold shrink-0 mt-0.5" />
                <p>
                  <strong className="text-white">Dual-Layer Security:</strong> Backend-enforced RBAC + ABAC evaluated on every API request.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <Building className="h-4 w-4 text-gov-gold shrink-0 mt-0.5" />
                <p>
                  <strong className="text-white">Multi-Tiered Hierarchy:</strong> Department → Circle → Division → Sub-Division scope controls.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-gov-gold shrink-0 mt-0.5" />
                <p>
                  <strong className="text-white">Statutory Power Ceiling:</strong> Financial approval ceilings bound to officer rank.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-blue-900/60 pt-4 text-[11px] text-slate-400">
            Official Government Security Portal | Restricted Access
          </div>
        </div>

        {/* Right Panel - Login & Quick Persona Switcher */}
        <div className="flex flex-col justify-between p-8 bg-slate-50">
          <div>
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gov-navy">Officer Authentication</h2>
              <p className="text-xs text-slate-500">Sign in with your official Employee Credentials</p>
            </div>

            {error && (
              <div className="mb-4 flex items-center gap-2 rounded border border-red-300 bg-red-50 p-3 text-xs text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Employee / User ID</label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    placeholder="e.g. GJ-RNB-EE-301"
                    className="w-full rounded border border-slate-300 py-2 pl-9 pr-3 text-xs focus:border-gov-blue focus:outline-none bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Password</label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded border border-slate-300 py-2 pl-9 pr-3 text-xs focus:border-gov-blue focus:outline-none bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded bg-gov-blue py-2.5 text-xs font-bold text-white shadow hover:bg-gov-navy disabled:opacity-50"
              >
                {submitting ? 'Authenticating...' : 'Sign In to Portal'}
              </button>
            </form>

            {/* Persona Quick Login for Demo Testing */}
            <div className="mt-6 border-t border-slate-200 pt-4">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Quick Test Personas (Click to Sign In):
              </div>
              <div className="grid grid-cols-1 gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => handlePersonaClick('GJ-RNB-SEC-001')}
                  className="flex items-center justify-between rounded border border-slate-200 bg-white p-2 text-left hover:border-gov-blue hover:bg-blue-50/50"
                >
                  <div>
                    <span className="font-semibold text-slate-800">Shri A. K. Sharma</span> (Principal Secretary)
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                    Limit: ₹100 Cr
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePersonaClick('GJ-RNB-EE-301')}
                  className="flex items-center justify-between rounded border border-slate-200 bg-white p-2 text-left hover:border-gov-blue hover:bg-blue-50/50"
                >
                  <div>
                    <span className="font-semibold text-slate-800">Er. R. K. Patel</span> (Executive Engineer)
                  </div>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                    Limit: ₹2 Cr
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePersonaClick('GJ-RNB-AE-401')}
                  className="flex items-center justify-between rounded border border-slate-200 bg-white p-2 text-left hover:border-gov-blue hover:bg-blue-50/50"
                >
                  <div>
                    <span className="font-semibold text-slate-800">Er. S. B. Joshi</span> (Assistant Engineer)
                  </div>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                    Limit: ₹25 L
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePersonaClick('GJ-CON-LNT-701')}
                  className="flex items-center justify-between rounded border border-slate-200 bg-white p-2 text-left hover:border-gov-blue hover:bg-blue-50/50"
                >
                  <div>
                    <span className="font-semibold text-slate-800">Mr. Rajesh Nambiar</span> (L&T Contractor)
                  </div>
                  <span className="text-[10px] font-semibold text-slate-600">Contractor Lead</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
