import Image from "next/image";

export function TeamSection() {
  const teamMembers = [
    {
      name: "Aman Shukla",
      role: "Lead Full-Stack Developer",
      image: "/images/team/aman-shukla.jpg",
      bio: "Aman single-handedly built the entire Cartigo codebase from scratch, implementing both the complex backend architecture and the premium frontend design.",
      goal: "To revolutionize e-commerce by building a highly secure, lightning-fast, and scalable marketplace that seamlessly connects verified partner resellers with buyers.",
    },
    {
      name: "Sumit Gautam",
      role: "Lead UI/UX Designer",
      image: "/images/team/sumit-gautam.png",
      bio: "Sumit crafted the stunning and intuitive user interface of Cartigo, ensuring every interaction feels premium and effortless for both buyers and resellers.",
      goal: "To bridge the gap between complex functionality and beautiful design, creating an e-commerce platform that users genuinely love to navigate.",
    },
    {
      name: "Aastha Singh",
      role: "Head of Supply Chain & Operations",
      image: "/images/team/aastha-singh.jpg",
      bio: "Aastha manages the complex logistics, seller onboarding, and vendor relationships, ensuring that products move efficiently from verified sellers to buyers with maximum reliability.",
      goal: "To build a robust, transparent, and lightning-fast fulfillment network that guarantees exceptional delivery speed and customer satisfaction across all regions.",
    },
    {
      name: "Pratigya Verma",
      role: "Head of Product & Growth",
      image: "/images/team/pratigya-verma.jpg",
      bio: "Pratigya spearheads product strategy and marketplace growth, ensuring Cartigo delivers exactly what verified sellers and modern buyers need to succeed.",
      goal: "To scale Cartigo's ecosystem globally by driving user acquisition, fostering a vibrant community, and continually innovating the core shopping experience.",
    },
    {
      name: "Roshini Chaudhary",
      role: "Head of Marketing & Customer Success",
      image: "/images/team/roshini-chaudhary.jpg",
      bio: "Roshini drives Cartigo's brand vision and user engagement, ensuring that every buyer and seller receives unparalleled support and a truly personalized shopping experience.",
      goal: "To build unshakeable trust and loyalty within the Cartigo community by delivering transparent communication and world-class customer service.",
    },
  ];

  return (
    <section id="team-section" className="relative rounded-2xl bg-navy-900 text-paper p-6 sm:p-10 lg:p-14 border border-navy-800 shadow-xl overflow-hidden">
      {/* Decorative architectural glows */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 rounded-full bg-navy-800/80 border border-navy-700">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400">
              MEET THE BUILDERS
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-white mb-3 tracking-tight">
            The Minds Behind Cartigo
          </h2>
          <p className="text-navy-200 text-xs sm:text-base max-w-2xl mx-auto leading-relaxed">
            Cartigo is proudly engineered by a dedicated team of builders committed to creating India's most secure, reliable, and premium marketplace experience.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {teamMembers.map((member) => (
            <div
              key={member.name}
              className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 bg-navy-800/60 rounded-3xl p-6 sm:p-8 border border-navy-700/80 hover:border-amber-500/50 transition-all duration-300 shadow-xl backdrop-blur-sm group"
            >
              {/* Large Photo */}
              <div className="shrink-0 relative">
                <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-2xl overflow-hidden border-2 border-amber-400/80 shadow-2xl rotate-[-2deg] group-hover:rotate-0 group-hover:scale-105 transition-all duration-300 bg-navy-950">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Info, Role, Bio, Goal */}
              <div className="flex-1 text-center sm:text-left space-y-3.5">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white font-display tracking-tight">
                    {member.name}
                  </h3>
                  <span className="inline-block mt-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider">
                    {member.role}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-navy-200 leading-relaxed">
                  <span className="font-semibold text-white">About: </span>
                  {member.bio}
                </p>

                <div className="bg-navy-900/90 rounded-xl p-4 border border-navy-700/60 text-left">
                  <p className="text-xs text-navy-100 leading-relaxed italic">
                    <span className="font-bold text-amber-400 not-italic block mb-1 text-[11px] uppercase tracking-wider">
                      🎯 Vision & Goal:
                    </span>
                    "{member.goal}"
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
