import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, ArrowLeft, ShieldCheck, Zap, AlertCircle, MailCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { signUp, continueAsDemo, isConfigured } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [signupComplete, setSignupComplete] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const data = await signUp(email, password, fullName);
      if (data?.session) {
        navigate('/', { replace: true });
      } else {
        // Confirmation email was sent by Supabase
        setSignupComplete(true);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    continueAsDemo();
    navigate('/', { replace: true });
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
          <small className="eyebrow block">START YOUR JOURNEY</small>
          <h2 className="font-display font-extrabold text-xl text-white m-0 mt-1">
            Create an account
          </h2>
          <p className="text-muted text-xs mt-1">
            Personalize goals, log nutrition, and track progress
          </p>
        </div>

        {/* Cloud Connection Badge */}
        <div className="mb-4 flex justify-center">
          {isConfigured ? (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-lime bg-[#1a2612] px-3 py-1 rounded-full border border-lime/20">
              <ShieldCheck size={13} /> Supabase PostgreSQL Connected
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-orangeAccent bg-[#261f12] px-3 py-1 rounded-full border border-orangeAccent/20">
              <Zap size={13} /> Demo Mode Available
            </span>
          )}
        </div>

        {signupComplete ? (
          /* Confirmation Screen when Email Verification is Enabled */
          <div className="p-5 rounded-xl bg-[#162013] border border-lime/30 text-center space-y-3 animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-lime/10 text-lime grid place-items-center mx-auto">
              <MailCheck size={26} />
            </div>
            <h3 className="font-display font-bold text-white text-base m-0">
              Check your inbox!
            </h3>
            <p className="text-xs text-[#a2af97] leading-relaxed m-0">
              We sent a verification link to <b className="text-white">{email}</b>. Click the link in the email to activate your account.
            </p>

            <div className="pt-2">
              <Link to="/login" className="primary w-full py-2.5 justify-center text-xs font-bold">
                Go to Sign In
              </Link>
            </div>

            <div className="pt-2 border-t border-[#27351f] text-[10px] text-[#85917c]">
              💡 <b>Tip</b>: If you don't receive the email, you can turn off <b>"Confirm email"</b> in your Supabase Dashboard to log in immediately.
            </div>
          </div>
        ) : (
          <>
            {errorMsg && (
              <div className="p-3 mb-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs flex items-center gap-2 animate-fade-in">
                <AlertCircle size={15} className="flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Register Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="text-[11px] text-[#aeb5c3] font-semibold block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Suryansh Tyagi"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full"
                  autoFocus
                />
              </div>

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
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

                <div>
                  <label className="text-[11px] text-[#aeb5c3] font-semibold block mb-1">
                    Confirm
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="primary w-full py-3 justify-center text-xs mt-3 font-bold"
              >
                {loading ? (
                  'Creating account...'
                ) : (
                  <>
                    <UserPlus size={14} /> Create account
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

            {/* Login Link */}
            <p className="text-center text-xs text-[#8c93a4] mt-5 mb-0">
              Already have an account?{' '}
              <Link to="/login" className="text-lime font-bold hover:underline inline-flex items-center gap-1">
                <ArrowLeft size={12} /> Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
