"use client";

import Image from "next/image";

export default function Home() {
  const isProd = process.env.NODE_ENV === "production";
  const projects = [
    {
      name: "BR System",
      subtitle: "Customer Portal",
      url: isProd ? "https://mutabaqah-br-system.vercel.app" : "http://localhost:3001",
      image: "/images/br-system.png",
      description: "Bank Rakyat's customer-facing Islamic financing platform. Apply for Shariah-compliant Tawarruq financing with fast approvals and competitive rates.",
    },
    {
      name: "Mutabaqah.AI",
      subtitle: "Compliance Engine",
      url: isProd ? "https://mutabaqah-ai-platform.vercel.app" : "http://localhost:3002",
      image: "/images/mutabaqah-ai.png",
      description: "AI-powered Shariah compliance monitoring system. Automate commodity trading compliance with real-time audit trails and certificate verification.",
    },
    {
      name: "Al-Marji",
      subtitle: "Research Assistant",
      url: isProd ? "https://mutabaqah-almarji.vercel.app" : "http://localhost:5173",
      image: "/images/al-marji.png",
      description: "AI-powered Shariah reference assistant. Query official regulatory documents from BNM, SC, IIFA, and IIFM instantly in English or Malay.",
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
        {/* Radial gradient overlays */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-radial from-emerald-200/40 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-radial from-teal-200/30 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-radial from-green-100/20 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Islamic Geometric Pattern Overlay */}
      <div
        className="fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(30deg, #0d7c5f 12%, transparent 12.5%, transparent 87%, #0d7c5f 87.5%, #0d7c5f),
            linear-gradient(150deg, #0d7c5f 12%, transparent 12.5%, transparent 87%, #0d7c5f 87.5%, #0d7c5f),
            linear-gradient(30deg, #0d7c5f 12%, transparent 12.5%, transparent 87%, #0d7c5f 87.5%, #0d7c5f),
            linear-gradient(150deg, #0d7c5f 12%, transparent 12.5%, transparent 87%, #0d7c5f 87.5%, #0d7c5f),
            linear-gradient(60deg, #10b981 25%, transparent 25.5%, transparent 75%, #10b981 75%, #10b981),
            linear-gradient(60deg, #10b981 25%, transparent 25.5%, transparent 75%, #10b981 75%, #10b981)
          `,
          backgroundSize: '80px 140px',
          backgroundPosition: '0 0, 0 0, 40px 70px, 40px 70px, 0 0, 40px 70px'
        }}
      />

      {/* Floating Orbs */}
      <div className="fixed top-20 left-1/4 w-32 h-32 bg-emerald-300/20 rounded-full blur-2xl animate-float" />
      <div className="fixed bottom-40 right-1/3 w-40 h-40 bg-teal-300/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }} />
      <div className="fixed top-1/2 right-1/4 w-24 h-24 bg-green-400/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '4s' }} />

      {/* Content Container */}
      <div className="relative z-10">
        {/* Header Section */}
        <header className="container mx-auto px-6 pt-8 pb-12">
          {/* Logos */}
          <div className="flex justify-center items-center gap-12 mb-12">
            {/* Bank Rakyat Logo - Smaller (2x reduced) */}
            <div className="h-16 w-64 relative drop-shadow-lg">
              <Image
                src="/images/bank-rakyat-logo-cropped.png"
                alt="Bank Rakyat"
                fill
                className="object-contain object-center"
                priority
              />
            </div>
            {/* AI Fiqh Logo - Cropped version */}
            <div className="h-20 w-56 relative drop-shadow-lg">
              <Image
                src="/images/ai-fiqh-logo-cropped.png"
                alt="AI Fiqh"
                fill
                className="object-contain object-center"
                priority
              />
            </div>
          </div>

          {/* Main Title */}
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4 drop-shadow-sm">
              Bank Rakyat AI Fiqh Hackathon in Islamic Finance 2026
            </h1>

            <h2 className="text-5xl md:text-6xl font-bold mb-12 drop-shadow-md">
              <span className="text-slate-800">Mutabaqah</span>
              <span className="text-emerald-600">.AI</span>
            </h2>
          </div>
        </header>

        {/* Project Cards Section */}
        <section className="container mx-auto px-6 pb-12">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {projects.map((project) => (
              <div key={project.name} className="flex flex-col">
                {/* Browser Frame Image */}
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="browser-frame mb-6 block hover:shadow-2xl hover:scale-105 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                >
                  <div className="relative h-56">
                    <Image
                      src={project.image}
                      alt={project.name}
                      fill
                      className="object-cover object-top"
                    />
                  </div>
                </a>

                {/* Text Content */}
                <div className="flex-1 flex flex-col bg-white/60 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-emerald-100/50">
                  <h3 className="text-2xl font-bold text-slate-800 mb-1">{project.name}</h3>
                  <p className="text-emerald-700 text-sm mb-3 font-medium">{project.subtitle}</p>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    {project.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="container mx-auto px-6 py-8 border-t border-emerald-200/50">
          <div className="text-center">
            <p className="text-sm text-slate-600 font-medium">
              #UntukSemua | AI Fiqh Hackathon 2026
            </p>
          </div>
        </footer>
      </div>

      {/* Add custom animations in global CSS */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
