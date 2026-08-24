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
    <section id="team-section" className="bg-navy-900 py-16 sm:py-24 text-paper overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl"></div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-sm font-mono font-bold uppercase tracking-wider text-amber-400 mb-2 block">
            Meet the Builders
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">
            The Minds Behind Cartigo
          </h2>
          <p className="text-navy-100 text-sm sm:text-base">
            Cartigo is proudly engineered by a dedicated team of developers committed to creating the most secure and premium marketplace experience.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6 w-full max-w-7xl mx-auto">
          {teamMembers.map((member) => (
            <div key={member.name} className="flex flex-col items-center text-center gap-6 bg-navy-800/50 rounded-2xl p-6 sm:p-8 border border-navy-700 hover:border-amber-500/30 transition-colors shadow-lg backdrop-blur-sm w-full max-w-sm">
              <div className="shrink-0 relative">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden border-2 border-amber-500/50 shadow-xl rotate-[-2deg] hover:rotate-0 transition-transform">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              <div className="flex flex-col justify-center">
                <h3 className="text-2xl font-bold text-white font-display">{member.name}</h3>
                <p className="text-amber-400 font-mono text-xs mb-3 uppercase tracking-wider">{member.role}</p>
                
                <div className="space-y-4 mt-2">
                  <p className="text-sm text-navy-100 leading-relaxed text-left">
                    <span className="font-semibold text-white">About:</span> {member.bio}
                  </p>
                  <div className="bg-navy-900/80 rounded-lg p-4 border border-navy-700/50 text-left">
                    <p className="text-xs text-navy-50 leading-relaxed italic">
                      <span className="font-bold text-amber-500 not-italic block mb-1">🎯 Vision & Goal:</span>
                      "{member.goal}"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Both developers are now loaded */}
        </div>
      </div>
    </section>
  );
}
