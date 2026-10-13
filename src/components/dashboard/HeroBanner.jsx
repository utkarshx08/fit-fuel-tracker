import React from 'react';

export default function HeroBanner() {
  return (
    <div className="relative overflow-hidden min-h-[185px] rounded-2xl border border-[#343c2b] bg-gradient-to-r from-[#20291a] via-[#171d17] to-[#1a1b21] p-7 md:p-8 flex justify-between items-center mb-7">
      <div className="z-10 max-w-[420px]">
        <span className="inline-block bg-[#2a3520] text-lime px-2.5 py-1 rounded-full text-[9px] tracking-wider font-bold uppercase mb-2">
          ● YOUR FITNESS SNAPSHOT
        </span>
        <h2 className="font-display font-extrabold text-2xl md:text-3xl text-white tracking-tight leading-tight m-0 mb-2">
          Build strength.<br />
          <em className="not-italic text-lime">Fuel progress.</em>
        </h2>
        <p className="text-[#a2aa9a] text-xs m-0 leading-relaxed">
          One day at a time. Your goals are closer than you think.
        </p>
      </div>

      <div className="relative w-[210px] h-[130px] hidden sm:grid place-items-center mr-[4%] pointer-events-none select-none">
        <div className="orbit"></div>
        <div className="dumbbell">✣</div>
        <small className="absolute -right-1 bottom-1 text-[9px] tracking-widest text-[#c1c8b6] leading-snug">
          SHOW UP<br />
          <b className="text-lime font-bold">LEVEL UP</b>
        </small>
      </div>
    </div>
  );
}
