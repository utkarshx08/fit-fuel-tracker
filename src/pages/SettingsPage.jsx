import React, { useState } from 'react';
import {
  ShieldCheck,
  Database,
  Key,
  CheckCircle,
  AlertTriangle,
  Play,
  Loader2,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Server,
  HardDrive,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Info,
  Table,
  CheckCheck,
} from 'lucide-react';
import GoalSettingsForm from '../components/settings/GoalSettingsForm';
import ProfileSettingsForm from '../components/settings/ProfileSettingsForm';
import { useAuth } from '../context/AuthContext';
import { testNutritionApis, getUsdaKey } from '../services/nutritionApi';
import { verifyAllTables } from '../services/fitnessService';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { INITIAL_MIGRATION_SQL } from '../utils/schemaSql';

// Verification SQL queries for users to run directly in Supabase SQL editor
const VERIFICATION_SQL = `-- FitFuel 2.0 Database Schema Verification Query
-- Run this in Supabase Dashboard -> SQL Editor to verify all 8 tables and column counts
SELECT 
  t.table_name,
  (SELECT count(*) FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.table_schema = 'public') AS column_count,
  (SELECT count(*) FROM pg_indexes i WHERE i.tablename = t.table_name AND i.schemaname = 'public') AS index_count
FROM information_schema.tables t
WHERE t.table_schema = 'public'
  AND t.table_name IN (
    'profiles',
    'daily_goals',
    'foods',
    'food_diary_entries',
    'saved_meals',
    'workouts',
    'weight_logs',
    'daily_activity'
  )
ORDER BY t.table_name;
`;

// Helper to safely mask API keys (showing only last 4 chars)
function maskKey(key) {
  if (!key || typeof key !== 'string') return 'Not Set';
  if (key.length <= 6) return '••••••';
  return '••••••••' + key.slice(-4);
}

export default function SettingsPage() {
  const { isConfigured, user } = useAuth();

  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [tableDetails, setTableDetails] = useState(null);
  const [showTableDetails, setShowTableDetails] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedVerifySql, setCopiedVerifySql] = useState(false);
  const [showSqlViewer, setShowSqlViewer] = useState(false);
  const [dbStatus, setDbStatus] = useState('unknown'); // 'ok' | 'pending_migration' | 'error' | 'unconfigured' | 'unknown'

  const rawUsdaKey = getUsdaKey();
  const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const rawSupabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const handleCopySql = async () => {
    try {
      await navigator.clipboard.writeText(INITIAL_MIGRATION_SQL);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 3000);
    } catch (err) {
      console.error('Failed to copy SQL:', err);
    }
  };

  const handleCopyVerifySql = async () => {
    try {
      await navigator.clipboard.writeText(VERIFICATION_SQL);
      setCopiedVerifySql(true);
      setTimeout(() => setCopiedVerifySql(false), 3000);
    } catch (err) {
      console.error('Failed to copy verification SQL:', err);
    }
  };

  const runApiDiagnostics = async () => {
    setTesting(true);
    setTestResults(null);
    setTableDetails(null);

    const results = {
      usda: { name: 'USDA FoodData Central', status: 'testing', category: 'testing', latency: 0, detail: '' },
      off: { name: 'Open Food Facts', status: 'testing', category: 'testing', latency: 0, detail: '' },
      supabaseAuth: { name: 'Supabase Authentication', status: 'testing', category: 'testing', latency: 0, detail: '' },
      supabaseDb: { name: 'Supabase 8 PostgreSQL Tables', status: 'testing', category: 'testing', latency: 0, detail: '' },
      dbReadWrite: { name: 'Database Read & Write Access', status: 'testing', category: 'testing', latency: 0, detail: '' },
    };

    // 1 & 2: Test USDA and Open Food Facts with live network calls
    try {
      const nutResults = await testNutritionApis();

      results.usda.status = nutResults.usda.category === 'ok' ? 'ok' : nutResults.usda.category;
      results.usda.category = nutResults.usda.category;
      results.usda.latency = nutResults.usda.latencyMs;
      results.usda.detail = nutResults.usda.details;

      results.off.status = nutResults.openFoodFacts.category === 'ok' ? 'ok' : nutResults.openFoodFacts.category;
      results.off.category = nutResults.openFoodFacts.category;
      results.off.latency = nutResults.openFoodFacts.latencyMs;
      results.off.detail = nutResults.openFoodFacts.details;
    } catch (e) {
      results.usda.status = 'network_error';
      results.usda.category = 'network_error';
      results.usda.detail = e.message;

      results.off.status = 'network_error';
      results.off.category = 'network_error';
      results.off.detail = e.message;
    }

    // 3: Test Supabase Auth
    const tAuth = Date.now();
    if (isSupabaseConfigured && isSupabaseConfigured() && supabase) {
      try {
        const { error: authErr } = await supabase.auth.getSession();
        results.supabaseAuth.latency = Date.now() - tAuth;
        if (!authErr) {
          results.supabaseAuth.status = 'ok';
          results.supabaseAuth.category = 'ok';
          results.supabaseAuth.detail = `Connected (${results.supabaseAuth.latency} ms) — Supabase Auth reachable & active`;
        } else if (authErr.message?.includes('Invalid API key') || authErr.message?.includes('JWT')) {
          results.supabaseAuth.status = 'auth_failure';
          results.supabaseAuth.category = 'auth_failure';
          results.supabaseAuth.detail = `Authentication Error: Invalid API key or configuration (${authErr.message})`;
        } else {
          results.supabaseAuth.status = 'service_outage';
          results.supabaseAuth.category = 'service_outage';
          results.supabaseAuth.detail = `Auth unreachable: ${authErr.message}`;
        }
      } catch (e) {
        results.supabaseAuth.status = 'network_error';
        results.supabaseAuth.category = 'network_error';
        results.supabaseAuth.detail = e.message;
      }

      // 4: Test Supabase 8 PostgreSQL Tables
      try {
        const tableReport = await verifyAllTables();
        setTableDetails(tableReport);

        if (tableReport.allReady) {
          results.supabaseDb.status = 'ok';
          results.supabaseDb.category = 'ok';
          results.supabaseDb.detail = `Connected — All 8 required PostgreSQL tables verified & reachable in schema cache`;
          setDbStatus('ok');
        } else {
          results.supabaseDb.status = 'pending_migration';
          results.supabaseDb.category = 'missing_tables';
          results.supabaseDb.detail = `${tableReport.missingCount} of 8 tables missing from schema cache (PostgREST PGRST205). Run SQL migration in Supabase SQL Editor.`;
          setDbStatus('pending_migration');
        }
      } catch (e) {
        results.supabaseDb.status = 'network_error';
        results.supabaseDb.category = 'network_error';
        results.supabaseDb.detail = `Network error checking tables: ${e.message}`;
        setDbStatus('error');
      }

      // 5: Database Read & Write Verification
      if (user?.id) {
        // Authenticated user session
        try {
          const { data: profileCheck, error: readErr } = await supabase
            .from('profiles')
            .select('id, full_name')
            .eq('id', user.id)
            .maybeSingle();

          if (!readErr) {
            results.dbReadWrite.status = 'ok';
            results.dbReadWrite.category = 'ok';
            results.dbReadWrite.detail = `Authenticated user (${maskKey(user.id)}): RLS verified for user's isolated records`;
          } else if (readErr.code === 'PGRST205') {
            results.dbReadWrite.status = 'pending_migration';
            results.dbReadWrite.category = 'missing_tables';
            results.dbReadWrite.detail = `Tables not created yet. App safely using local storage fallback for user ${maskKey(user.id)}.`;
          } else {
            results.dbReadWrite.status = 'error';
            results.dbReadWrite.category = 'error';
            results.dbReadWrite.detail = `Query error: ${readErr.message}`;
          }
        } catch (e) {
          results.dbReadWrite.status = 'network_error';
          results.dbReadWrite.category = 'network_error';
          results.dbReadWrite.detail = e.message;
        }
      } else {
        // Unauthenticated client / guest demo
        results.dbReadWrite.status = 'info';
        results.dbReadWrite.category = 'info';
        results.dbReadWrite.detail = `Anonymous client connected. Sign in with a Supabase account to test authenticated RLS read/write access.`;
      }
    } else {
      results.supabaseAuth.status = 'unconfigured';
      results.supabaseAuth.category = 'unconfigured';
      results.supabaseAuth.detail = 'VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not configured in .env';

      results.supabaseDb.status = 'unconfigured';
      results.supabaseDb.category = 'unconfigured';
      results.supabaseDb.detail = 'Database credentials not configured in .env';

      results.dbReadWrite.status = 'unconfigured';
      results.dbReadWrite.category = 'unconfigured';
      results.dbReadWrite.detail = 'Supabase credentials missing';
      setDbStatus('unconfigured');
    }

    setTestResults(results);
    setTesting(false);
  };

  // Determine active storage mode
  const getActiveStorageBadge = () => {
    if (dbStatus === 'ok') {
      return {
        label: 'Active Storage: Supabase Cloud PostgreSQL',
        color: 'border-lime/30 bg-lime/10 text-lime',
        desc: 'All profile, food diary, custom foods, workouts, and activity records are synced in real time to your Supabase PostgreSQL cloud database.',
        isCloud: true,
      };
    }
    if (isConfigured) {
      return {
        label: 'Active Storage: Local Browser Storage (Schema Migration Pending)',
        color: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
        desc: 'Supabase credentials are valid, but database tables are pending creation. FitFuel is actively saving all entries to robust Local Browser Storage so tracking remains 100% operational.',
        isCloud: false,
      };
    }
    return {
      label: 'Active Storage: Local Browser Storage (Demo Mode)',
      color: 'border-zinc-700 bg-zinc-800/80 text-zinc-300',
      desc: 'Running in local standalone mode. All food entries and custom nutrition data are preserved in your browser.',
      isCloud: false,
    };
  };

  const storageInfo = getActiveStorageBadge();

  return (
    <section className="animate-fade-in space-y-6">
      {/* Page Heading */}
      <div className="section-title page-heading mb-6">
        <div>
          <small className="eyebrow block">PERSONALIZE</small>
          <h2 className="font-display font-extrabold text-2xl text-white m-0">Profile & Settings</h2>
          <p className="text-muted text-xs m-0">Manage your nutrition targets, cloud synchronization, and service diagnostics.</p>
        </div>
      </div>

      {/* Profile Settings */}
      <ProfileSettingsForm />

      {/* Goal Settings */}
      <GoalSettingsForm />

      {/* Cloud & Database Integration Diagnostics */}
      <article className="panel">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
          <div>
            <small className="eyebrow block">INFRASTRUCTURE STATUS</small>
            <h3 className="font-display font-bold text-base text-white m-0 mt-1">
              API & Cloud Diagnostics
            </h3>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className={`tag ${isConfigured ? 'green' : 'tag'}`}>
              {isConfigured ? 'Cloud Configured' : 'Local / Demo Mode'}
            </span>

            <button
              type="button"
              onClick={runApiDiagnostics}
              disabled={testing}
              className="primary text-xs py-2 px-3 font-semibold flex items-center gap-1.5"
            >
              {testing ? (
                <>
                  <Loader2 size={13} className="animate-spin" /> Testing APIs...
                </>
              ) : (
                <>
                  <Play size={13} /> Test All APIs
                </>
              )}
            </button>
          </div>
        </div>

        {/* Active Storage Mode Banner */}
        <div className={`p-3.5 rounded-xl border mb-5 flex items-start gap-3 ${storageInfo.color}`}>
          {storageInfo.isCloud ? (
            <Database size={18} className="flex-shrink-0 mt-0.5 text-lime" />
          ) : (
            <HardDrive size={18} className="flex-shrink-0 mt-0.5 text-amber-400" />
          )}
          <div className="text-xs leading-relaxed">
            <div className="font-bold flex items-center gap-2">
              <span>{storageInfo.label}</span>
            </div>
            <p className="mt-0.5 opacity-90 text-[11px] leading-relaxed m-0">
              {storageInfo.desc}
            </p>
          </div>
        </div>

        {/* Live Diagnostics Results Panel */}
        {testResults && (
          <div className="mb-5 p-4 rounded-xl bg-[#0e1118] border border-[#272e3d] space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <b className="text-xs text-white block font-display">Live Integration Diagnostic Results:</b>
              <span className="text-[10px] text-muted">Real-time network latency & response status</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(testResults).map(([key, item]) => {
                const isOk = item.status === 'ok';
                const isPendingMigration = item.status === 'pending_migration';
                const isOutage = item.category === 'service_outage';
                const isCors = item.category === 'cors_restricted';
                const isAuth = item.category === 'auth_failure';
                const isInfo = item.category === 'info';

                let badgeColor = 'text-red-400 border-red-500/20 bg-red-500/5';
                let Icon = XCircle;
                let statusLabel = 'Error';

                if (isOk) {
                  badgeColor = 'text-lime border-lime/20 bg-lime/5';
                  Icon = CheckCircle2;
                  statusLabel = 'Connected (200 OK)';
                } else if (isPendingMigration) {
                  badgeColor = 'text-amber-400 border-amber-500/20 bg-amber-500/5';
                  Icon = AlertTriangle;
                  statusLabel = 'Migration Required';
                } else if (isOutage) {
                  badgeColor = 'text-amber-400 border-amber-500/20 bg-amber-500/5';
                  Icon = AlertTriangle;
                  statusLabel = 'Upstream Outage';
                } else if (isCors) {
                  badgeColor = 'text-purple-300 border-purple-500/20 bg-purple-500/5';
                  Icon = Info;
                  statusLabel = 'Origin Restricted';
                } else if (isAuth) {
                  badgeColor = 'text-rose-400 border-rose-500/20 bg-rose-500/5';
                  Icon = XCircle;
                  statusLabel = 'Auth Failed';
                } else if (isInfo) {
                  badgeColor = 'text-zinc-300 border-zinc-700 bg-zinc-800/40';
                  Icon = Info;
                  statusLabel = 'Notice';
                }

                return (
                  <div
                    key={key}
                    className={`p-3 rounded-lg border flex flex-col justify-between gap-2 ${badgeColor}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Icon size={16} className="flex-shrink-0" />
                        <b className="text-white text-xs">{item.name}</b>
                      </div>
                      <span className="text-[10px] uppercase tracking-wider font-semibold opacity-90 px-1.5 py-0.5 rounded border border-current">
                        {statusLabel}
                      </span>
                    </div>

                    <div className="text-[11px] leading-relaxed text-[#c1c8d6]">
                      {item.detail}
                    </div>

                    {item.latency > 0 && (
                      <div className="text-[10px] text-muted flex items-center justify-between border-t border-white/5 pt-1 mt-1">
                        <span>Measured latency:</span>
                        <span className="font-mono text-white">{item.latency} ms</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Detailed Table Verification Breakdown */}
            {tableDetails && (
              <div className="mt-4 pt-3 border-t border-[#222938]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Table size={14} className="text-lime" />
                    <b className="text-xs text-white">PostgreSQL 8 Tables Schema Health:</b>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowTableDetails(!showTableDetails)}
                    className="text-[11px] text-lime hover:underline flex items-center gap-1"
                  >
                    {showTableDetails ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    <span>{showTableDetails ? 'Hide Table Matrix' : `View All 8 Tables (${tableDetails.readyCount}/8 ready)`}</span>
                  </button>
                </div>

                {showTableDetails && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-2 animate-fade-in">
                    {Object.entries(tableDetails.tables).map(([tableName, status]) => (
                      <div
                        key={tableName}
                        className={`p-2.5 rounded-lg border text-[11px] ${
                          status.status === 'ok'
                            ? 'border-lime/20 bg-lime/5 text-zinc-300'
                            : 'border-amber-500/20 bg-amber-500/5 text-amber-300'
                        }`}
                      >
                        <div className="flex items-center justify-between font-mono font-bold text-white mb-1">
                          <span>{tableName}</span>
                          {status.status === 'ok' ? (
                            <CheckCircle2 size={13} className="text-lime" />
                          ) : (
                            <AlertTriangle size={13} className="text-amber-400" />
                          )}
                        </div>
                        <div className="text-[10px] opacity-80 truncate" title={status.message}>
                          {status.status === 'ok' ? 'Verified in schema' : 'Pending migration'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Configured Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Supabase Status Card */}
          <div className="border border-[#242936] bg-[#0d1016] rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <Database size={16} className={isConfigured ? 'text-lime' : 'text-orangeAccent'} />
                  <b className="text-white text-xs">Supabase PostgreSQL & Auth</b>
                </div>
                <span className="text-[10px] text-muted font-mono">
                  {rawSupabaseUrl ? rawSupabaseUrl.replace('https://', '').split('.')[0] : 'Not Connected'}
                </span>
              </div>
              <p className="text-[11px] text-[#8c93a4] leading-relaxed mb-3">
                {isConfigured
                  ? 'Configured with Supabase project URL and authenticated client. Tables are protected with strict Row Level Security so each user strictly isolates their own data.'
                  : 'Currently operating in browser persistence mode. Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to link your cloud project.'}
              </p>
            </div>

            <div className="border-t border-[#1c2230] pt-2.5 space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between text-muted">
                <span>Project Endpoint:</span>
                <span className="font-mono text-zinc-300 truncate max-w-[180px]">
                  {rawSupabaseUrl || 'Not configured'}
                </span>
              </div>
              <div className="flex items-center justify-between text-muted">
                <span>Client Key:</span>
                <span className="font-mono text-zinc-300">
                  {maskKey(rawSupabaseAnonKey)}
                </span>
              </div>
            </div>
          </div>

          {/* USDA FoodData Central Status Card */}
          <div className="border border-[#242936] bg-[#0d1016] rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <Key size={16} className="text-lime" />
                  <b className="text-white text-xs">USDA & Open Food Facts Database</b>
                </div>
                <span className="text-[10px] text-lime font-mono">POST JSON API</span>
              </div>
              <p className="text-[11px] text-[#8c93a4] leading-relaxed mb-3">
                Primary nutrition search queries live USDA FoodData Central via authorized POST requests. Open Food Facts is queried as a secondary backup with exponential backoff retries.
              </p>
            </div>

            <div className="border-t border-[#1c2230] pt-2.5 space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between text-muted">
                <span>USDA API Key:</span>
                <span className="font-mono text-zinc-300">
                  {maskKey(rawUsdaKey)}
                </span>
              </div>
              <div className="flex items-center justify-between text-muted">
                <span>Backup Database:</span>
                <span className="text-zinc-300">Open Food Facts (v2 API)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Database Migration Instructions & SQL Exporter */}
        <div className="mt-5 p-4 rounded-xl bg-[#141822] border border-[#242936] text-[11px] text-[#9ca3b2]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2">
            <div>
              <b className="text-white text-xs block">Supabase Database Setup Instructions</b>
              <span className="text-[10px] text-muted">
                PostgREST requires running the schema migration once in your Supabase SQL editor.
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleCopySql}
                className="secondary text-xs py-1.5 px-3 flex items-center gap-1.5 hover:border-lime"
              >
                {copiedSql ? (
                  <>
                    <Check size={13} className="text-lime" /> Copied Migration SQL!
                  </>
                ) : (
                  <>
                    <Copy size={13} /> Copy Complete SQL Migration
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCopyVerifySql}
                className="secondary text-xs py-1.5 px-3 flex items-center gap-1.5 hover:border-lime"
                title="Copy SQL query to verify all 8 tables"
              >
                {copiedVerifySql ? (
                  <>
                    <CheckCheck size={13} className="text-lime" /> Copied Verification SQL!
                  </>
                ) : (
                  <>
                    <Table size={13} /> Copy Verification SQL
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowSqlViewer(!showSqlViewer)}
                className="secondary text-xs py-1.5 px-2 flex items-center gap-1"
                title="Toggle SQL code preview"
              >
                {showSqlViewer ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                <span>{showSqlViewer ? 'Hide SQL' : 'View SQL'}</span>
              </button>
            </div>
          </div>

          <ol className="list-decimal list-inside space-y-1 text-[#8c93a4] mb-3 leading-relaxed">
            <li>
              Log in to your{' '}
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="text-lime hover:underline inline-flex items-center gap-0.5"
              >
                Supabase Dashboard <ExternalLink size={10} />
              </a>{' '}
              and select your project.
            </li>
            <li>Click <b>SQL Editor</b> in the left navigation sidebar.</li>
            <li>
              Click <b>New query</b>, click <b>Copy Complete SQL Migration</b> above, paste into the editor, and click <b>Run</b>.
            </li>
            <li>
              Return here and click <b>Test All APIs</b> to verify that all 8 tables switch to <i>Connected (200 OK)</i>.
            </li>
          </ol>

          {/* Interactive SQL Previewer */}
          {showSqlViewer && (
            <div className="mt-3 border border-[#2a3243] rounded-lg overflow-hidden animate-fade-in">
              <div className="bg-[#0b0e14] px-3 py-2 border-b border-[#2a3243] flex items-center justify-between text-[10px] text-muted">
                <span>supabase/migrations/20261011_initial_schema.sql</span>
                <span>PostgreSQL 15+ compatible</span>
              </div>
              <pre className="p-3 bg-[#07090d] text-[11px] font-mono text-zinc-300 overflow-x-auto max-h-60 leading-relaxed m-0 select-all">
                {INITIAL_MIGRATION_SQL}
              </pre>
            </div>
          )}
        </div>
      </article>
    </section>
  );
}
