export function TrustSection() {
  const PILLARS = [
    {
      title: "Verified sellers.",
      description: "Every merchant undergoes identity, business tax, and inventory provenance audits before listing.",
    },
    {
      title: "Transparent pricing.",
      description: "Direct-from-merchant rates with zero checkout inflation or artificial convenience surcharges.",
    },
    {
      title: "Protected checkout.",
      description: "Encrypted payment pipelines with automatic buyer escrow protection until delivery is confirmed.",
    },
    {
      title: "Real delivery tracking.",
      description: "Carrier API integrations providing timestamped transit milestones from warehouse to your doorstep.",
    },
  ];

  const METRICS = [
    {
      value: "98.7%",
      label: "seller verification",
      subtext: "Strict KYC & active quality screening",
    },
    {
      value: "24–48h",
      label: "dispatch average",
      subtext: "Fast regional warehouse fulfillment",
    },
    {
      value: "₹0",
      label: "hidden marketplace fees",
      subtext: "The price you inspect is the price you pay",
    },
  ];

  return (
    <section className="relative rounded-2xl bg-navy-900 text-white p-8 sm:p-12 lg:p-16 border border-navy-800 shadow-xl overflow-hidden">
      {/* Background Architectural Accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-96 h-96 bg-navy-800/40 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Left Column: Brand Confidence Statement & 4 Pillars */}
        <div className="lg:col-span-7 space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400">
                WHY CARTIGO
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold tracking-tight text-white leading-tight">
              BUY WITH CONFIDENCE.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-navy-300 max-w-xl font-medium leading-relaxed">
              We eliminated the chaos of open marketplaces. Cartigo operates on verified authenticity,
              transparent math, and uncompromising customer protection.
            </p>
          </div>

          {/* 4 Trust Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-navy-800">
            {PILLARS.map((pillar) => (
              <div key={pillar.title} className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 text-sm font-mono font-bold">✓</span>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    {pillar.title}
                  </h3>
                </div>
                <p className="text-xs text-navy-300 leading-relaxed pl-5">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Fintech Metric Cards */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {METRICS.map((metric) => (
            <div
              key={metric.label}
              className="rounded-xl bg-navy-800/60 border border-navy-700/70 p-5 sm:p-6 backdrop-blur-sm hover:border-amber-500/40 transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="flex items-baseline justify-between gap-4">
                <div className="text-3xl sm:text-4xl font-extrabold text-amber-400 font-mono tracking-tight group-hover:translate-x-1 transition-transform duration-200">
                  {metric.value}
                </div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-navy-400 border border-navy-700 px-2 py-0.5 rounded-full">
                  AUDITED
                </span>
              </div>
              <div className="mt-2">
                <div className="text-sm font-bold text-white uppercase tracking-wider">
                  {metric.label}
                </div>
                <div className="text-xs text-navy-400 mt-0.5">
                  {metric.subtext}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
