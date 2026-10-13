import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, ArrowRight, ShieldCheck, Zap, AlertCircle, Mail, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { signIn, continueAsDemo, resendConfirmationEmail, isConfigured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const from = location.state?.from?.pathname || '/';
  const isEmailNotConfirmed = errorMsg.toLowerCase().includes('email not confirmed');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setResendSuccess(false);
    setLoading(true);

    try {
      await signIn(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMsg(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!email) return;
    setResending(true);
    try {
      await resendConfirmationEmail(email);
      setResendSuccess(true);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to resend confirmation email.');
    } finally {
      setResending(false);
    }
  };

  const handleDemoLogin = () => {
    continueAsDemo();
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#0b0d12] flex items-center justify-center p-4">
      <div className="w-full max-w-[440px] bg-[#12151d] border border-[#242936] rounded-2xl p-6 sm:p-8 shadow-2xl animate-fade-in">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="mark">F</span>
            <span className="brand p-0 text-2xl">
              fitfuel<span className="lime">.</span>
            </span>
          </div>
          <small className="eyebrow block">FITNESS & NUTRITION TRACKER</small>
          <h2 className="font-display font-extrabold text-xl text-white m-0 mt-1">
            Welcome back
          </h2>
          <p className="text-muted text-xs mt-1">
            Sign in to access your cloud fitness journal
          </p>
        </div>

        {/* Cloud Connection Badge */}
        <div className="mb-4 flex justify-center">
          {isConfigured ? (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-lime bg-[#1a2612] px-3 py-1 rounded-full border border-lime/20">
              <ShieldCheck size={13} /> Supabase Authentication Ready
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-orangeAccent bg-[#261f12] px-3 py-1 rounded-full border border-orangeAccent/20">
              <Zap size={13} /> Demo Mode Available
            </span>
          )}
        </div>

        {/* Dedicated "Email Not Confirmed" Assistant */}
        {isEmailNotConfirmed ? (
          <div className="p-4 mb-4 rounded-xl bg-orange-950/40 border border-orange-500/40 text-orange-200 text-xs space-y-2.5 animate-fade-in">
            <div className="flex items-center gap-2 font-bold text-orange-300">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>Email Not Confirmed</span>
            </div>
            <p className="text-[11px] text-[#e0cfbe] leading-relaxed m-0">
              Supabase requires confirming your email before logging in. Check your inbox for a verification link from Supabase.
            </p>

            {resendSuccess ? (
              <div className="flex items-center gap-1.5 text-lime text-[11px] font-semibold pt-1">
                <CheckCircle2 size={14} /> Confirmation link resent to {email}!
              </div>
            ) : (
              <button
                type="button"
                onClick={handleResendEmail}
                disabled={resending}
                className="secondary text-xs w-full justify-center py-2 text-white border-orange-500/50 hover:border-lime"
              >
                <Mail size={13} /> {resending ? 'Sending...' : 'Resend Confirmation Email'}
              </button>
            )}

            <div className="pt-2 border-t border-orange-500/20 text-[10px] text-[#bdae9f] leading-normal">
              💡 <b>Tip for development</b>: To log in without needing confirmation emails, open your{' '}
              <b>Supabase Dashboard</b> → <b>Authentication</b> → <b>Providers</b> → <b>Email</b> and turn off <b>"Confirm email"</b>.
            </div>
          </div>
        ) : errorMsg ? (
          <div className="p-3 mb-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs flex items-center gap-2 animate-fade-in">
            <AlertCircle size={15} className="flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        ) : null}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] text-[#aeb5c3] font-semibold block mb-1">
              Email address
            </label>
            <input
              type="email"
              required
              placeholder="athlete@fitfuel.app"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
              autoFocus
            />
          </div>

          <div>
            <label className="text-[11px] text-[#aeb5c3] font-semibold block mb-1">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="primary w-full py-3 justify-center text-xs mt-2 font-bold"
          >
            {loading ? (
              'Signing in...'
            ) : (
              <>
                <LogIn size={14} /> Sign in
              </>
            )}
          </button>
        </form>

        <div className="relative my-5 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#242936]"></div>
          </div>
          <span className="relative bg-[#12151d] px-3 text-[10px] uppercase tracking-wider text-[#70798a] font-bold">
            Or
          </span>
        </div>

        {/* Demo Mode Button */}
        <button
          type="button"
          onClick={handleDemoLogin}
          className="secondary w-full py-2.5 justify-center text-xs font-semibold"
        >
          <Zap size={13} className="text-lime" /> Continue in Demo Mode
        </button>

        {/* Registration Link */}
        <p className="text-center text-xs text-[#8c93a4] mt-5 mb-0">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-lime font-bold hover:underline inline-flex items-center gap-1">
            Create account <ArrowRight size={12} />
          </Link>
        </p>
      </div>
    </div>
  );
}
