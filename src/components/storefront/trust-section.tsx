export function TrustSection() {
  const BENEFITS = [
    {
      icon: "🛡️",
      title: "Verified Resellers Only",
      description: "Every merchant undergoes rigorous business, tax, and inventory verification.",
    },
    {
      icon: "💳",
      title: "100% Protected Payments",
      description: "Encrypted transactions with zero-fraud guarantee and instant buyer refunds.",
    },
    {
      icon: "🚚",
      title: "Fast Tracked Delivery",
      description: "Direct courier fulfillment with end-to-end tracking on FedEx, UPS, and DHL.",
    },
    {
      icon: "🔄",
      title: "Easy 30-Day Returns",
      description: "Hassle-free return policy backed by Cartigo central customer support.",
    },
  ];

  return (
    <section className="my-10 border-t border-b border-line py-8 bg-paper/50">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {BENEFITS.map((b) => (
          <div key={b.title} className="flex items-start gap-3.5 p-2">
            <span className="text-3xl">{b.icon}</span>
            <div>
              <h3 className="text-sm font-bold text-ink">{b.title}</h3>
              <p className="text-xs text-navy-600 mt-0.5 leading-relaxed">{b.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
