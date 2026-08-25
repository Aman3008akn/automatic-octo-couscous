type TimelineProps = {
  status: string;
};

export function OrderTimeline({ status }: TimelineProps) {
  // Map Prisma statuses to our 4-step linear timeline
  const STEPS = [
    { label: "Placed", icon: "🧾" },
    { label: "Processing", icon: "⚙️" },
    { label: "Shipped", icon: "🚚" },
    { label: "Delivered", icon: "🏡" },
  ];

  // Determine current step index based on status
  let currentStep = 0;
  let isCancelled = false;

  switch (status) {
    case "PENDING_PAYMENT":
    case "PAID":
      currentStep = 0;
      break;
    case "FULFILLING":
      currentStep = 1;
      break;
    case "SHIPPED":
      currentStep = 2;
      break;
    case "DELIVERED":
      currentStep = 3;
      break;
    case "CANCELLED":
    case "REFUNDED":
      isCancelled = true;
      break;
    default:
      currentStep = 0;
  }

  if (isCancelled) {
    return (
      <div className="bg-danger/10 border border-danger/30 rounded-xl p-5 mb-6 text-danger text-center">
        <h3 className="font-bold text-lg mb-1">Order {status === "REFUNDED" ? "Refunded" : "Cancelled"}</h3>
        <p className="text-sm">This order has been cancelled and will not be delivered.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-line p-5 sm:p-8 mb-6">
      <h3 className="font-bold text-navy-900 mb-6 text-lg">Order Tracking</h3>
      
      <div className="relative flex justify-between items-center w-full mt-2">
        {/* Background Line */}
        <div className="absolute left-[10%] right-[10%] top-1/2 -translate-y-1/2 h-1 bg-gray-200 z-0 rounded-full" />
        
        {/* Active Progress Line */}
        <div 
          className="absolute left-[10%] top-1/2 -translate-y-1/2 h-1 bg-success z-0 rounded-full transition-all duration-700 ease-in-out" 
          style={{ width: `${(currentStep / (STEPS.length - 1)) * 80}%` }}
        />

        {STEPS.map((step, idx) => {
          const isCompleted = idx <= currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div key={step.label} className="relative z-10 flex flex-col items-center gap-2">
              <div 
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-lg sm:text-xl border-2 transition-all duration-500 ${
                  isCompleted 
                    ? "bg-success text-white border-success shadow-[0_0_15px_rgba(34,197,94,0.4)] scale-110" 
                    : "bg-white text-gray-400 border-gray-300"
                }`}
              >
                {step.icon}
              </div>
              <p className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider text-center mt-1 transition-colors ${
                isCompleted ? "text-navy-900" : "text-gray-400"
              } ${isCurrent ? "text-success" : ""}`}>
                {step.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
