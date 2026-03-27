import { Link } from "react-router-dom";
import { ShieldCheck, Car, Bike, FileText, CheckCircle2, ChevronRight, Star, Menu, X, Search, Phone, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const LOGO_URL = "https://customer-assets.emergentagent.com/job_instant-roadtax/artifacts/kuquahg0_insta%20logo.jpg";

// ── Glassmorphism background orbs ──────────────────────────────────────────
const GlassOrbs = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
    <div className="absolute top-[-15%] left-[-10%] w-[600px] h-[600px] rounded-full bg-purple-600/30 blur-[100px]" />
    <div className="absolute top-[20%] right-[-8%] w-[500px] h-[500px] rounded-full bg-indigo-600/25 blur-[90px]" />
    <div className="absolute bottom-[-10%] left-[30%] w-[700px] h-[700px] rounded-full bg-blue-600/20 blur-[120px]" />
    <div className="absolute top-[60%] right-[10%] w-[400px] h-[400px] rounded-full bg-pink-500/20 blur-[80px]" />
    <div className="absolute bottom-[20%] left-[5%] w-[350px] h-[350px] rounded-full bg-cyan-500/15 blur-[70px]" />
  </div>
);

// ── Glass utility classes ────────────────────────────────────────────────────
const glassCard = "bg-white/[0.08] backdrop-blur-xl border border-white/20 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)]";
const glassCardHover = "hover:bg-white/[0.13] hover:border-white/30 transition-all duration-300 hover:shadow-[0_16px_48px_rgba(0,0,0,0.18)] hover:-translate-y-1";

// ── Navbar ───────────────────────────────────────────────────────────────────
const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <>
      <GlassOrbs />
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/[0.07] backdrop-blur-xl border-b border-white/10 shadow-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2" data-testid="nav-logo">
              <img src={LOGO_URL} alt="InstaRoadTax" className="w-10 h-10 rounded-xl object-contain bg-white/20 p-0.5" />
              <span className="text-xl font-bold text-white drop-shadow-sm">InstaRoadtax.my</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#how-it-works" className="text-white/70 hover:text-white transition-colors text-sm font-medium">How It Works</a>
              <a href="#services" className="text-white/70 hover:text-white transition-colors text-sm font-medium">Services</a>
              <Link to="/check-status" className="text-white/70 hover:text-white transition-colors text-sm font-medium">Check Status</Link>
              <Link to="/admin" className="text-white/70 hover:text-white transition-colors text-sm font-medium">Admin</Link>
            </div>
            
            <div className="hidden md:flex items-center gap-3">
              <Link to="/get-quote">
                <Button className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white rounded-full shadow-lg shadow-amber-500/30 text-sm font-semibold px-6" data-testid="get-quote-btn">
                  Get Quote
                </Button>
              </Link>
            </div>
            
            <button 
              className="md:hidden text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        
        {mobileMenuOpen && (
          <div className="md:hidden bg-black/30 backdrop-blur-xl border-t border-white/10 px-4 py-4">
            <div className="flex flex-col gap-3">
              <a href="#how-it-works" className="text-white/70 hover:text-white py-2 text-sm">How It Works</a>
              <a href="#services" className="text-white/70 hover:text-white py-2 text-sm">Services</a>
              <Link to="/check-status" className="text-white/70 hover:text-white py-2 text-sm">Check Status</Link>
              <Link to="/admin" className="text-white/70 hover:text-white py-2 text-sm">Admin</Link>
              <Link to="/get-quote">
                <Button className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full text-sm">Get Quote</Button>
              </Link>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

// ── Hero Section ─────────────────────────────────────────────────────────────
const HeroSection = () => (
  <section className="min-h-screen flex items-center relative pt-20">
    <GlassOrbs />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Text side */}
        <div className="stagger-children">
          <div className="inline-flex items-center gap-2 bg-white/[0.10] backdrop-blur-md border border-white/20 rounded-full px-4 py-2 mb-6">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span className="text-white/90 text-sm font-medium">Ejensi Cukai Jalan Terpercaya</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-blue-200 drop-shadow-sm">
              Dapatkan sebutharga
            </span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-300 to-pink-300 drop-shadow-sm">
              insuran & cukai jalan
            </span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-purple-200 to-white drop-shadow-sm">
              dalam 5 minit!
            </span>
          </h1>
          
          <p className="text-lg text-white/70 leading-relaxed mb-8 max-w-xl backdrop-blur-sm">
            Perbaharui insuran kenderaan serta cukai jalan dengan pantas secara online. Kami bantu anda mendapatkan harga terbaik dari syarikat insuran terkemuka Malaysia.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/get-quote">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white shadow-xl shadow-amber-500/25 rounded-full px-10 py-7 text-lg font-bold w-full sm:w-auto"
                data-testid="hero-get-quote-btn"
              >
                Renew Sekarang
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/check-status">
              <Button 
                size="lg" 
                variant="outline" 
                className="border border-white/30 text-white hover:bg-white/10 backdrop-blur-md rounded-full px-10 py-7 text-lg w-full sm:w-auto bg-white/[0.05]" 
                data-testid="hero-check-status-btn"
              >
                <Search className="w-5 h-5 mr-2" />
                Semak Status
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center gap-6 mt-8 text-white/50 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>Respons Cepat</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>Harga Terbaik</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>100% Online</span>
            </div>
          </div>
        </div>
        
        {/* Image side — glass showcase */}
        <div className="hidden lg:block relative">
          <div className={`relative ${glassCard} p-2 shadow-2xl`}>
            <img 
              src="/hero-kl-skyline.jpg"
              alt="Kuala Lumpur skyline with Petronas Twin Towers"
              className="rounded-xl w-full h-80 object-cover"
            />
            <div className="absolute -bottom-4 -right-4 w-40 h-40 rounded-xl overflow-hidden shadow-xl border-2 border-white/30">
              <img 
                src="/hero-malaysian-woman-driver.jpg"
                alt="Malaysian woman driving car"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Floating glass badge */}
            <div className="absolute -top-3 -right-3 bg-white/[0.15] backdrop-blur-md border border-white/20 rounded-xl px-3 py-2 shadow-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-white text-xs font-medium">Trusted</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// ── Partners Section ─────────────────────────────────────────────────────────
const PartnersSection = () => (
  <section className="py-10 relative">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <p className="text-center text-white/30 text-xs mb-6 tracking-widest uppercase font-medium">Rakan Kerjasama Kami</p>
      <div className={`${glassCard} p-6`}>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
          {["Zurich Takaful", "Takaful Malaysia", "Etiqa", "Allianz", "AIG"].map((partner, index) => (
            <div key={index} className="text-base font-semibold text-white/40 hover:text-white/70 transition-colors cursor-default">{partner}</div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

// ── How It Works ─────────────────────────────────────────────────────────────
const steps = [
  { step: 1, title: "Beritahu Kami", description: "Kongsikan keperluan insurans anda", icon: "📋" },
  { step: 2, title: "Kami Semak", description: "Pasukan kami cari pilihan terbaik", icon: "🔍" },
  { step: 3, title: "Dapatkan Sebutharga", description: "Terima sebut harga melalui email/WhatsApp", icon: "💬" },
  { step: 4, title: "Beli Insurans", description: "Beli insurans ideal anda dengan mudah", icon: "✅" }
];

const HowItWorksSection = () => (
  <section id="how-it-works" className="py-24 relative">
    <GlassOrbs />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4">
          Bagaimana Kami Bantu Anda
        </h2>
        <p className="text-lg text-white/50 max-w-2xl mx-auto">
          Proses 4 langkah mudah untuk perbaharuan insurans dan cukai jalan anda
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((item, index) => (
          <div key={index} className={`${glassCard} ${glassCardHover} p-6 flex flex-col items-center text-center group`}>
            <div className="relative mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/40 to-blue-500/40 backdrop-blur-xl border border-white/20 flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                {item.icon}
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center text-[10px] font-bold text-white shadow">
                {item.step}
              </div>
            </div>
            <h3 className="text-white font-bold text-base mb-1">{item.title}</h3>
            <p className="text-white/40 text-sm">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ── Happy Drivers ─────────────────────────────────────────────────────────────
const HappyDriversSection = () => (
  <section className="py-24 relative">
    <GlassOrbs />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4">
          Pandu dengan <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400">Yakin</span>
        </h2>
        <p className="text-lg text-white/50 max-w-2xl mx-auto">
          Sertai ribuan pemandu Malaysia yang percaya kepada kami
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { src: "/happy-driver-my-chinese-woman.jpg", alt: "Malaysian Chinese woman smiling", aspect: "aspect-square" },
          { src: "/hero-malaysian-woman-driver.jpg", alt: "Malaysian woman driving car", aspect: "aspect-square" },
          { src: "/happy-driver-my-man.jpg", alt: "Malaysian man smiling driving", aspect: "aspect-square" },
          { src: "/hero-kl-skyline.jpg", alt: "Kuala Lumpur cityscape", aspect: "aspect-square" },
        ].map((img, i) => (
          <div key={i} className={`${glassCard} overflow-hidden hover:shadow-2xl hover:border-white/30 transition-all duration-300 hover:-translate-y-1`}>
            <img 
              src={img.src}
              alt={img.alt}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-3 gap-4 mt-4">
        {[
          { src: "/car-proton-x50.jpg", alt: "Proton X50 - Modern Malaysian SUV" },
          { src: "/car-kl-traffic-aerial.jpg", alt: "Kuala Lumpur city traffic" },
          { src: "/car-perodua-bezza-white.jpg", alt: "Perodua Bezza - Malaysian sedan" },
        ].map((img, i) => (
          <div key={i} className={`${glassCard} overflow-hidden hover:shadow-2xl hover:border-white/30 transition-all duration-300 hover:-translate-y-1`}>
            <img 
              src={img.src}
              alt={img.alt}
              className="w-full aspect-video object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ── Services ─────────────────────────────────────────────────────────────────
const services = [
  {
    icon: Car,
    title: "Insurans Kereta",
    description: "Liputan insurans kereta komprehensif dengan harga terbaik dari syarikat terkemuka.",
    popular: true,
    gradient: "from-blue-500/30 to-purple-500/30",
    border: "hover:border-blue-400/40",
  },
  {
    icon: Bike,
    title: "Insurans Motosikal",
    description: "Perlindungan untuk motosikal anda dengan pilihan liputan yang fleksibel.",
    popular: false,
    gradient: "from-orange-500/30 to-red-500/30",
    border: "hover:border-orange-400/40",
  },
  {
    icon: FileText,
    title: "Pembaharuan Cukai Jalan",
    description: "Perkhidmatan pembaharuan cukai jalan yang cepat dan mudah.",
    popular: false,
    gradient: "from-green-500/30 to-cyan-500/30",
    border: "hover:border-green-400/40",
  },
  {
    icon: ShieldCheck,
    title: "Bantuan Tuntutan",
    description: "Kami bantu anda dalam proses tuntutan insurans.",
    popular: false,
    gradient: "from-amber-500/30 to-pink-500/30",
    border: "hover:border-amber-400/40",
  }
];

const ServicesSection = () => (
  <section id="services" className="py-24 relative">
    <GlassOrbs />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4">
          Perkhidmatan Kami
        </h2>
        <p className="text-lg text-white/50 max-w-2xl mx-auto">
          Solusi insurans dan cukai jalan yang lengkap untuk kenderaan anda
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {services.map((service, index) => (
          <div 
            key={index}
            className={`${glassCard} ${glassCardHover} p-6 relative overflow-hidden group`}
            data-testid={`service-card-${index}`}
          >
            {/* Gradient background on hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl`} />
            
            <div className="relative z-10">
              {service.popular && (
                <span className="inline-block mb-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">
                  Popular
                </span>
              )}
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${service.gradient} backdrop-blur-md border border-white/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <service.icon className="w-6 h-6 text-white/90" />
              </div>
              <h3 className="text-white font-bold text-base mb-2">{service.title}</h3>
              <p className="text-white/40 text-sm leading-relaxed group-hover:text-white/70 transition-colors">{service.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ── Testimonials ──────────────────────────────────────────────────────────────
const testimonials = [
  {
    name: "Ahmad Razak",
    location: "Kuala Lumpur",
    rating: 5,
    text: "Respons yang sangat cepat! Dapat sebutharga dalam 1 jam dan harga sangat berdaya saing."
  },
  {
    name: "Siti Aminah",
    location: "Penang",
    rating: 5,
    text: "Perkhidmatan profesional dan membantu saya mencari perlindungan terbaik untuk kereta saya."
  },
  {
    name: "David Tan",
    location: "Johor Bahru",
    rating: 5,
    text: "Khidmat pelanggan yang cemerlang. Mereka membimbing saya melalui keseluruhan proses."
  }
];

const TestimonialsSection = () => (
  <section className="py-24 relative">
    <GlassOrbs />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4">
          Apa Pelanggan Kami Katakan
        </h2>
        <p className="text-lg text-white/50 max-w-2xl mx-auto">
          Sertai ribuan pelanggan yang berpuas hati
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        {testimonials.map((item, index) => (
          <div 
            key={index}
            className={`${glassCard} ${glassCardHover} p-6`}
            data-testid={`testimonial-${index}`}
          >
            <div className="flex items-center gap-1 mb-4">
              {[...Array(item.rating)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
              ))}
            </div>
            <p className="text-white/70 mb-6 leading-relaxed text-sm italic">"{item.text}"</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/50 to-blue-500/50 backdrop-blur-md border border-white/20 flex items-center justify-center">
                <span className="text-white font-bold text-sm">{item.name.charAt(0)}</span>
              </div>
              <div>
                <p className="text-white font-medium text-sm">{item.name}</p>
                <p className="text-white/30 text-xs">{item.location}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ── CTA Section ───────────────────────────────────────────────────────────────
const CTASection = () => (
  <section className="py-24 relative">
    <GlassOrbs />
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className={`${glassCard} p-12 text-center relative overflow-hidden`}>
        {/* Inner glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-transparent to-blue-600/20 pointer-events-none" />
        <div className="relative">
          <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4">
            Sedia untuk Bermula?
          </h2>
          <p className="text-lg text-white/50 mb-10 max-w-xl mx-auto">
            Hantar pertanyaan sekarang dan terima sebutharga dalam masa beberapa jam sahaja
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/get-quote">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white shadow-xl shadow-amber-500/25 rounded-full px-12 py-7 text-lg font-bold w-full sm:w-auto"
                data-testid="cta-get-quote-btn"
              >
                Dapatkan Sebutharga
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/check-status">
              <Button 
                size="lg" 
                variant="outline" 
                className="border border-white/20 text-white hover:bg-white/10 backdrop-blur-md rounded-full px-10 py-7 text-lg bg-white/[0.05] w-full sm:w-auto"
              >
                <Search className="w-5 h-5 mr-2" />
                Semak Status
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-center gap-6 mt-8 text-white/30 text-xs">
            <div className="flex items-center gap-1"><Clock className="w-3 h-3" /><span>Proses 5 minit</span></div>
            <div className="flex items-center gap-1"><Phone className="w-3 h-3" /><span>WhatsApp: 012-345 6789</span></div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// ── Footer ────────────────────────────────────────────────────────────────────
const Footer = () => (
  <footer className="bg-black/40 backdrop-blur-xl border-t border-white/10 py-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid md:grid-cols-4 gap-8 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <img src={LOGO_URL} alt="InstaRoadTax" className="w-10 h-10 rounded-xl bg-white/10 p-1" />
            <span className="text-xl font-bold text-white">Instaroadtax.my</span>
          </div>
          <p className="text-white/30 text-sm">Perbaharui insuran kenderaan serta cukai jalan dengan pantas secara online.</p>
        </div>
        
        <div>
          <h4 className="font-semibold text-white/70 mb-4 text-sm">Pautan Pantas</h4>
          <ul className="space-y-2">
            {["Get Quote", "Check Status", "How It Works"].map((link) => (
              <li key={link}><Link to="/get-quote" className="text-white/30 hover:text-white/70 text-sm transition-colors">{link}</Link></li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold text-white/70 mb-4 text-sm">Perkhidmatan</h4>
          <ul className="space-y-2 text-white/30 text-sm">
            <li>Insurans Kereta</li>
            <li>Insurans Motosikal</li>
            <li>Pembaharuan Cukai Jalan</li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold text-white/70 mb-4 text-sm">Hubungi Kami</h4>
          <ul className="space-y-2 text-white/30 text-sm">
            <li>support@instaroadtax.my</li>
            <li>WhatsApp: 012-345 6789</li>
            <li>Isn-Jumaat: 9AM - 6PM</li>
          </ul>
        </div>
      </div>
      
      <div className="border-t border-white/5 pt-6 text-center text-white/20 text-xs">
        <p>© 2026 Instaroadtax.my. Hak cipta terpelihara.</p>
      </div>
    </div>
  </footer>
);

// ── Main Export ───────────────────────────────────────────────────────────────
const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#0d0d2b] to-[#0a0a1a]" data-testid="landing-page">
      {/* Fixed dark background with gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950 -z-20" />
      <Navbar />
      <HeroSection />
      <PartnersSection />
      <HowItWorksSection />
      <HappyDriversSection />
      <ServicesSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default LandingPage;
