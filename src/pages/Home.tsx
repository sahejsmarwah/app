import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Instagram, Phone, Mail, MapPin, ChevronRight, ChevronLeft, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BookingModal from '../components/BookingModal';
import clsx from 'clsx';

const Home = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [selectedServiceId, setSelectedServiceId] = useState<string | undefined>(undefined);
    const [activeTestimonial, setActiveTestimonial] = useState(0);
    const [baPosition, setBaPosition] = useState(50);
    const [transformationMode, setTransformationMode] = useState<'reveal' | 'grid'>('reveal');
    const heroRef = useRef<HTMLDivElement>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    const testimonials = [
        { text: "Simran made me feel beautiful and relaxed on my wedding morning. The makeup lasted through photos and dance — magical.", author: "Asha" },
        { text: "My shoot looks were on point — soft yet editorial. Simran knows how to work with lighting and cameras.", author: "Riya" },
        { text: "Gentle, skilled and professional. I received so many compliments at my event.", author: "Meera" }
    ];

    const portfolio = [
        { title: "Bridal Romance", desc: "Soft gradients, luminous skin and long-lasting finishes.", img: "/images/portfolio.jpg" },
        { title: "Editorial Edge", desc: "Bold shapes and textures that photograph with impact.", img: "/images/image6 (1).jpg" },
        { title: "Evening Glam", desc: "Smoky, sculpted and perfectly balanced for night events.", img: "/images/IMG_1662.jpg" },
        { title: "Natural Radiance", desc: "Effortless finishes for daytime and intimate gatherings.", img: "/images/8351485A-2C7A-4D2B-9CA3-DE2CF20EB9E8.jpg" },
        { title: "Classic Beauty", desc: "Timeless looks refined for photography and live events.", img: "/images/4B571197-04B7-42C8-8A17-0B1269F55570_Original.jpg" },
        { title: "Bridal Excellence", desc: "Carefully planned bridal services with day-of touch-ups.", img: "/images/IMG_20211011_224108_Original.jpg" }
    ];

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (heroRef.current) {
                const rect = heroRef.current.getBoundingClientRect();
                setMousePos({
                    x: (e.clientX - rect.left) / rect.width - 0.5,
                    y: (e.clientY - rect.top) / rect.height - 0.5
                });
            }
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="min-h-screen">
            {/* Navigation */}
            <nav className="fixed top-3 left-0 right-0 z-50 px-4">
                <div className="max-w-6xl mx-auto backdrop-blur-md bg-white/80 border border-white/20 rounded-2xl shadow-sm px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-charcoal flex items-center justify-center text-white font-serif font-bold text-lg">
                            SM
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-xl font-serif font-bold text-charcoal leading-none">Makeovers <span className="text-rose italic">by Simran</span></h1>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                        <a href="#hero" className="text-sm font-medium text-charcoal hover:text-rose transition-colors tracking-tight">Home</a>
                        <a href="#portfolio" className="text-sm font-medium text-charcoal hover:text-rose transition-colors tracking-tight">Portfolio</a>
                        <a href="#services" className="text-sm font-medium text-charcoal hover:text-rose transition-colors tracking-tight">Services</a>
                        <a href="#about" className="text-sm font-medium text-charcoal hover:text-rose transition-colors tracking-tight">About</a>
                        <a href="#contact" className="text-sm font-medium text-charcoal hover:text-rose transition-colors tracking-tight">Contact</a>
                        <button id="bookCta" onClick={() => setIsBookingOpen(true)} className="bg-rose text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-rose/20 hover:bg-rose/90 transition-all">
                            Book Now
                        </button>
                    </div>

                    <button className="md:hidden p-2 text-gray-700" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="md:hidden mt-2 p-4 bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20"
                        >
                            <div className="flex flex-col gap-4">
                                <a href="#hero" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-gray-800 p-2">Home</a>
                                <a href="#portfolio" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-gray-800 p-2">Portfolio</a>
                                <a href="#services" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-gray-800 p-2">Services</a>
                                <a href="#about" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-gray-800 p-2">About</a>
                                <a href="#contact" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-gray-800 p-2">Contact</a>
                                <button onClick={() => { setIsBookingOpen(true); setIsMenuOpen(false); }} className="w-full bg-gradient-to-r from-rose to-peach text-white py-4 rounded-xl font-bold shadow-lg shadow-rose/20">
                                    Book Appointment
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* Hero Section */}
            <section id="hero" ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 px-4">
                {/* Designer Background Layer */}
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                    {/* Noise Texture Overlay */}
                    <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

                    {/* Dot Grid Pattern */}
                    <div className="absolute inset-0 opacity-[0.1]" style={{ backgroundImage: `radial-gradient(circle, #8e8a94 1px, transparent 1px)`, backgroundSize: '32px 32px' }} />

                    {/* Enhanced Mesh Blobs */}
                    <motion.div
                        animate={{
                            x: [0, 100, -50, 0],
                            y: [0, -50, 80, 0],
                            scale: [1, 1.2, 0.9, 1]
                        }}
                        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full opacity-60 blur-[120px] bg-gradient-to-br from-peach via-rose-light to-transparent"
                    />
                    <motion.div
                        animate={{
                            x: [0, -80, 60, 0],
                            y: [0, 100, -40, 0],
                            scale: [1.1, 0.8, 1.2, 1.1]
                        }}
                        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute bottom-[-10%] right-[-15%] w-[70%] h-[70%] rounded-full opacity-40 blur-[140px] bg-gradient-to-tr from-blush via-rose to-transparent"
                    />
                    <motion.div
                        animate={{
                            opacity: [0.2, 0.5, 0.2]
                        }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-[20%] right-[5%] w-[40%] h-[40%] rounded-full blur-[100px] bg-gold/10"
                    />

                    {/* Cursor Light Leak (interactive) */}
                    <motion.div
                        animate={{
                            x: mousePos.x * 100,
                            y: mousePos.y * 100,
                        }}
                        transition={{ type: "spring", damping: 25, stiffness: 50 }}
                        className="absolute inset-0 bg-gradient-to-br from-rose/5 to-transparent blur-[150px] opacity-30"
                    />

                    <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px]" />
                </div>

                <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-peach shadow-sm mb-8"
                    >
                        <span className="w-1.5 h-1.5 bg-gold rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold text-gold uppercase tracking-[0.2em]">Premium Makeup Artistry</span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="font-serif text-6xl md:text-8xl font-bold text-charcoal leading-[1.1]"
                    >
                        Elegant Makeup <br />
                        <span className="text-rose italic font-normal">Crafted For You</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mt-8 text-lg md:text-xl text-muted max-w-2xl mx-auto leading-relaxed font-medium font-sans"
                    >
                        Transform your beauty with artistry that celebrates your unique essence. Every brushstroke tells your story.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-5"
                    >
                        <button onClick={() => setIsBookingOpen(true)} className="w-full sm:w-auto bg-rose text-white px-10 py-4.5 rounded-xl font-bold text-lg shadow-xl shadow-rose/20 hover:bg-rose/90 transition-all">
                            Book Consultation
                        </button>
                        <a href="#portfolio" className="w-full sm:w-auto bg-white text-charcoal border border-gray-100 px-10 py-4.5 rounded-xl font-bold text-lg shadow-sm hover:shadow-md transition-all">
                            View Portfolio
                        </a>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="mt-8 text-sm text-gray-600 font-medium flex items-center justify-center gap-4"
                    >
                        <span>Delhi & NCR</span>
                        <span className="w-1 h-1 bg-rose rounded-full" />
                        <span>Travel options available</span>
                    </motion.div>
                </div>
            </section>

            {/* Portfolio Section */}
            <section id="portfolio" className="py-24 px-4 bg-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1/2 bg-ivory/50 skew-y-3 origin-top-left -z-10" />
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-20 relative">
                        <span className="text-[10px] font-bold text-gold uppercase tracking-[0.3em] mb-4 block">Our Work</span>
                        <h2 className="font-serif text-5xl font-bold text-charcoal mb-4">Portfolio</h2>
                        <div className="w-20 h-[2px] bg-gold opacity-30 mx-auto" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {portfolio.map((item, idx) => (
                            <motion.div
                                key={idx}
                                whileHover={{ y: -8 }}
                                className="group relative bg-[#fdfaf8] rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-700"
                            >
                                <div className="aspect-[4/5] overflow-hidden">
                                    <img
                                        src={item.img}
                                        alt={item.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 grayscale-[0.2] group-hover:grayscale-0"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 flex flex-col justify-end p-8 text-white">
                                        <h3 className="font-serif text-2xl font-bold mb-1 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-700 delay-100">{item.title}</h3>
                                        <p className="text-[10px] text-rose font-bold uppercase tracking-widest transform translate-y-4 group-hover:translate-y-0 transition-transform duration-700 delay-200">{item.desc.split(' ')[0]}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Transformation Section */}
            <section className="py-24 px-4 bg-white relative">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
                        <div className="max-w-xl">
                            <span className="text-[10px] font-bold text-gold uppercase tracking-[0.3em] mb-4 block">Transformation</span>
                            <h2 className="font-serif text-5xl font-bold text-charcoal mb-6">The Art of Change</h2>
                            <div className="w-16 h-[2px] bg-gold opacity-30 mb-8" />
                            <p className="text-lg text-muted leading-relaxed">
                                Witness the power of technique. Whether it's a subtle enhancement or a dramatic reveal, every look is a masterpiece created for you.
                            </p>
                        </div>

                        {/* Experience Toggle */}
                        <div className="flex bg-[#fdfaf8] p-1.5 rounded-2xl border border-gray-100 shadow-sm relative z-20">
                            <button
                                onClick={() => setTransformationMode('reveal')}
                                className={clsx(
                                    "px-6 py-2.5 rounded-xl text-xs font-bold transition-all tracking-widest",
                                    transformationMode === 'reveal' ? "bg-white text-rose shadow-md" : "text-muted hover:text-charcoal"
                                )}
                            >
                                THE REVEAL
                            </button>
                            <button
                                onClick={() => setTransformationMode('grid')}
                                className={clsx(
                                    "px-6 py-2.5 rounded-xl text-xs font-bold transition-all tracking-widest",
                                    transformationMode === 'grid' ? "bg-white text-rose shadow-md" : "text-muted hover:text-charcoal"
                                )}
                            >
                                DETAIL ART
                            </button>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {transformationMode === 'reveal' ? (
                            <motion.div
                                key="reveal"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.02 }}
                                className="relative aspect-[16/9] md:aspect-[21/9] rounded-[60px] overflow-hidden group border-[16px] border-[#fdfaf8] shadow-2xl"
                            >
                                <div className="absolute inset-0 bg-charcoal" />
                                <img
                                    src="/images/portfolio.jpg"
                                    alt="Transformation"
                                    className="absolute inset-0 w-full h-full object-cover transition-all duration-1000 grayscale group-hover:grayscale-0 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 to-transparent opacity-60 group-hover:opacity-0 transition-opacity duration-700" />

                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="bg-white/10 backdrop-blur-md border border-white/20 px-8 py-4 rounded-3xl opacity-100 group-hover:opacity-0 transition-all duration-500 transform group-hover:scale-110">
                                        <span className="text-white text-xs font-bold tracking-[0.4em] uppercase">Hover to reveal color</span>
                                    </div>
                                </div>

                                <div className="absolute bottom-10 left-10 flex gap-4">
                                    <div className="bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/20 text-white text-[10px] font-bold tracking-widest">NOSTALGIC GRAIN</div>
                                    <div className="bg-rose/20 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/20 text-white text-[10px] font-bold tracking-widest uppercase">HD Finish</div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="grid"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="grid grid-cols-12 gap-6 h-[600px]"
                            >
                                <div className="col-span-12 md:col-span-8 relative rounded-[40px] overflow-hidden shadow-xl group">
                                    <img src="/images/image6 (1).jpg" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt="Detail 1" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                                </div>
                                <div className="col-span-6 md:col-span-4 flex flex-col gap-6">
                                    <div className="flex-1 relative rounded-[40px] overflow-hidden shadow-xl group">
                                        <img src="/images/IMG_1662.jpg" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="Detail 2" />
                                    </div>
                                    <div className="flex-1 relative rounded-[40px] overflow-hidden shadow-xl group">
                                        <img src="/images/8351485A-2C7A-4D2B-9CA3-DE2CF20EB9E8.jpg" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="Detail 3" />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </section>

            {/* Services Section */}
            <section id="services" className="py-24 px-4 bg-[#fdfaf8] relative">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-20 relative">
                        <span className="text-[10px] font-bold text-gold uppercase tracking-[0.3em] mb-4 block">What We Offer</span>
                        <h2 className="font-serif text-5xl font-bold text-charcoal mb-4">Services & Pricing</h2>
                        <div className="w-16 h-[2px] bg-gold opacity-30 mx-auto" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                title: "Bridal Artistry",
                                price: "₹15,000",
                                features: ["Personalised consultation", "Detailed trial session", "Premium long-wear products", "Emergency touch-up kit"],
                                popular: true
                            },
                            {
                                title: "Events & Editorial",
                                price: "₹8,500",
                                features: ["Photo-ready finishes", "On-site session available", "Photography-friendly tech", "Custom lash application"],
                                popular: false,
                                id: 'event'
                            },
                            {
                                title: "Consultation",
                                price: "₹4,500",
                                features: ["Detailed skin analysis", "Professional shade matching", "Product recommendations", "Basic technique coaching"],
                                popular: false,
                                id: 'consult'
                            }
                        ].map((service: any, idx) => {
                            // Map titles to IDs if not provided or just use IDs
                            const serviceId = service.id || (service.title.toLowerCase().includes('bridal') ? 'bridal' : service.title.toLowerCase().includes('event') ? 'event' : 'consult');

                            return (
                                <div
                                    key={idx}
                                    className={clsx(
                                        "p-10 rounded-[40px] transition-all duration-500 relative flex flex-col items-center text-center",
                                        service.popular ? "bg-[#fef7f7] border border-rose-light/50 shadow-xl scale-105" : "bg-white border border-gray-100 text-charcoal"
                                    )}
                                >
                                    {service.popular && (
                                        <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-rose text-white text-[10px] font-bold px-5 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-rose/20">Most Popular</span>
                                    )}
                                    <div className="text-gold mb-6">
                                        {service.popular ? (
                                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></svg>
                                        ) : (
                                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                                        )}
                                    </div>
                                    <h3 className="font-serif text-3xl font-bold mb-2">{service.title}</h3>
                                    <p className="text-xs text-muted mb-6">Your dream bridal look, perfected</p>
                                    <div className="text-4xl font-serif font-bold mb-8 text-charcoal">
                                        {service.price} <span className="text-sm font-sans font-normal text-muted">/ session</span>
                                    </div>
                                    <div className="w-12 h-[1px] bg-gold opacity-30 mb-8" />
                                    <ul className="mb-10 space-y-4">
                                        {service.features.map((f: any, i: number) => (
                                            <li key={i} className="flex items-start gap-3 text-sm opacity-80">
                                                <ChevronRight size={14} className="mt-1 flex-shrink-0 text-rose" />
                                                {f}
                                            </li>
                                        ))}
                                    </ul>
                                    <button
                                        onClick={() => {
                                            setSelectedServiceId(serviceId);
                                            setIsBookingOpen(true);
                                        }}
                                        className={clsx(
                                            "w-full py-4 rounded-xl font-bold transition-all tracking-tight",
                                            service.popular ? "bg-rose text-white hover:bg-rose/90 shadow-lg shadow-rose/10" : "bg-[#f3ede8] text-charcoal hover:bg-[#e9e2db]"
                                        )}
                                    >
                                        Book Now
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-24 px-4 bg-white overflow-hidden relative border-t border-gray-50">
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-rose/5 rounded-full blur-3xl opacity-50" />
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gold/5 rounded-full blur-3xl opacity-50" />

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <span className="text-[10px] font-bold text-gold uppercase tracking-[0.3em] mb-4 block">Kind Words</span>
                    <h2 className="font-serif text-5xl font-bold text-charcoal mb-16">Loved by Clients</h2>

                    <div className="relative bg-[#fdfaf8] rounded-[50px] p-12 md:p-20 border border-white">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTestimonial}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                                className="flex flex-col items-center"
                            >
                                <div className="text-rose mb-8">
                                    <svg width="48" height="36" viewBox="0 0 48 36" fill="currentColor">
                                        <path d="M12 0C5.37 0 0 5.37 0 12c0 6.63 10 24 10 24s1.77-5.37 1.77-12c0-3.32-2.68-6-6-6 3.32 0 6.23-2.68 6.23-6s-2.91-6-6.23-6c3.32 0 6.23 2.68 6.23 6zM36 0c-6.63 0-12 5.37-12 12 0 6.63 10 24 10 24s1.77-5.37 1.77-12c0-3.32-2.68-6-6-6 3.32 0 6.23-2.68 6.23-6s-2.91-6-6.23-6c3.32 0 6.23 2.68 6.23 6z" />
                                    </svg>
                                </div>
                                <p className="text-xl md:text-3xl font-serif text-charcoal mb-10 leading-[1.6]">
                                    "{testimonials[activeTestimonial].text}"
                                </p>
                                <div className="text-gold font-bold uppercase tracking-[0.2em] text-[10px]">Simran Marwah — {testimonials[activeTestimonial].author}</div>
                            </motion.div>
                        </AnimatePresence>

                        <div className="flex items-center justify-center gap-4 mt-12">
                            <button
                                onClick={() => setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                                className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center hover:bg-rose hover:text-white transition-all text-gray-400"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <div className="flex gap-2">
                                {testimonials.map((_, i) => (
                                    <div
                                        key={i}
                                        className={clsx("w-2 h-2 rounded-full transition-all", i === activeTestimonial ? "w-8 bg-rose" : "bg-gray-200")}
                                    />
                                ))}
                            </div>
                            <button
                                onClick={() => setActiveTestimonial((prev) => (prev + 1) % testimonials.length)}
                                className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center hover:bg-rose hover:text-white transition-all text-gray-400"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="py-24 px-4 bg-white relative">
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-20 items-center">
                    <div className="relative group">
                        <div className="absolute -inset-4 bg-gradient-to-tr from-peach/20 to-rose/10 blur-3xl rounded-[40px] -z-10 group-hover:scale-110 transition-transform duration-1000" />
                        <img
                            src="/images/portfolio.jpg"
                            alt="Simran"
                            className="w-full aspect-[3/4] object-cover rounded-[50px] shadow-2xl relative z-10 grayscale-[0.2] hover:grayscale-0 transition-all duration-1000"
                        />
                        <div className="absolute -bottom-8 -right-8 bg-white p-8 rounded-[32px] shadow-xl z-20 hidden lg:block">
                            <div className="flex gap-8 text-center">
                                <div>
                                    <div className="text-3xl font-bold text-gray-900 mb-1">500+</div>
                                    <div className="text-xs text-rose font-bold uppercase tracking-tighter">Clients</div>
                                </div>
                                <div className="w-px h-12 bg-gray-100" />
                                <div>
                                    <div className="text-3xl font-bold text-gray-900 mb-1">8+</div>
                                    <div className="text-xs text-rose font-bold uppercase tracking-tighter">Years</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <span className="text-[10px] font-bold text-gold uppercase tracking-[0.3em] mb-4 block text-center md:text-left">The Artist</span>
                        <h2 className="font-serif text-5xl font-bold text-charcoal mb-10 leading-tight text-center md:text-left">Meet Simran Marwah</h2>
                        <div className="w-16 h-[2px] bg-gold opacity-30 mb-10 mx-auto md:mx-0" />
                        <p className="text-lg text-muted leading-relaxed mb-6 font-medium text-center md:text-left">
                            With over 8 years of professional experience, I believe in enhancing your natural beauty rather than masking it.
                        </p>
                        <p className="text-lg text-muted leading-relaxed mb-10 font-medium text-center md:text-left">
                            We use the highest quality premium products to ensure your look remains radiant and perfect for the camera.
                        </p>
                        <div className="flex flex-col gap-8 mb-12 max-w-sm mx-auto md:mx-0">
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 rounded-full bg-peach/30 flex items-center justify-center text-rose border border-white">
                                    <Mail size={20} />
                                </div>
                                <div className="text-center md:text-left">
                                    <div className="text-[10px] font-bold text-gold uppercase tracking-widest">Email Us</div>
                                    <div className="font-serif text-lg font-bold text-charcoal">hello@simranmarwah.com</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 rounded-full bg-peach/30 flex items-center justify-center text-rose border border-white">
                                    <Phone size={20} />
                                </div>
                                <div className="text-center md:text-left">
                                    <div className="text-[10px] font-bold text-gold uppercase tracking-widest">Call Directly</div>
                                    <div className="font-serif text-lg font-bold text-charcoal">+91 97735 94101</div>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setIsBookingOpen(true)} className="w-full md:w-auto bg-charcoal text-white px-12 py-5 rounded-2xl font-bold shadow-2xl hover:bg-charcoal/90 transition-all tracking-tight">
                            Reserve Your Date
                        </button>
                    </div>
                </div>
            </section>

            {/* Booking Modal */}
            <BookingModal
                isOpen={isBookingOpen}
                onClose={() => {
                    setIsBookingOpen(false);
                    setSelectedServiceId(undefined);
                }}
                initialServiceId={selectedServiceId}
            />

            {/* Contact Section */}
            <section id="contact" className="py-24 px-4 bg-[#fdfaf8] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-peach/30 rounded-full blur-[120px] -mr-64 -mt-64" />
                <div className="max-w-6xl mx-auto">
                    <div className="bg-white rounded-[60px] shadow-2xl overflow-hidden grid lg:grid-cols-5 border border-white relative z-10">
                        <div className="lg:col-span-2 bg-charcoal p-12 md:p-16 text-white relative">
                            <span className="text-[10px] font-bold text-rose uppercase tracking-[0.3em] mb-4 block">Get in touch</span>
                            <h2 className="font-serif text-5xl font-bold mb-8">Let's Create Together</h2>
                            <div className="w-12 h-[1px] bg-rose opacity-50 mb-10" />
                            <p className="text-gray-400 mb-12 text-lg leading-relaxed">Share your vision and event date — I’ll respond within 24 hours.</p>

                            <div className="space-y-8 relative z-10">
                                <div className="flex gap-6">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-peach">
                                        <Mail size={24} />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-gray-500 uppercase tracking-tighter mb-1">Email us</div>
                                        <div className="font-bold text-white">hello@simranmakeovers.com</div>
                                    </div>
                                </div>
                                <div className="flex gap-6">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-peach">
                                        <Instagram size={24} />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-gray-500 uppercase tracking-tighter mb-1">Follow us</div>
                                        <div className="font-bold text-white">@makeoversbysimran</div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-24 pt-8 border-t border-white/5">
                                <div className="text-sm text-gray-500 italic">"Making your most beautiful moments unforgettable."</div>
                            </div>
                        </div>

                        <div className="lg:col-span-3 p-10 md:p-16">
                            <form
                                id="contactForm"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const form = e.target as HTMLFormElement;
                                    const name = (form.elements.namedItem('contactName') as HTMLInputElement).value;
                                    const email = (form.elements.namedItem('contactEmail') as HTMLInputElement).value;
                                    const service = (form.elements.namedItem('contactService') as HTMLSelectElement).value;
                                    const message = (form.elements.namedItem('contactMessage') as HTMLTextAreaElement).value;
                                    const subject = encodeURIComponent(`New Inquiry — ${service} — ${name}`);
                                    const body = encodeURIComponent(`Hi Simran,\n\nName: ${name}\nEmail: ${email}\nService: ${service}\n\n${message}\n`);
                                    window.open(`mailto:hello@simranmakeovers.com?subject=${subject}&body=${body}`, '_self');
                                    form.reset();
                                    alert('Your message has been prepared! If your email client did not open, please email us directly at hello@simranmakeovers.com');
                                }}
                                className="grid sm:grid-cols-2 gap-6"
                            >
                                <div className="space-y-2">
                                    <label htmlFor="contactName" className="text-xs font-bold text-gray-400 uppercase tracking-tighter ml-1">Full Name</label>
                                    <input id="contactName" name="contactName" type="text" placeholder="Your Name" required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-4 focus:bg-white focus:ring-2 focus:ring-rose/20 outline-none transition-all text-gray-900" />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="contactEmail" className="text-xs font-bold text-gray-400 uppercase tracking-tighter ml-1">Email Address</label>
                                    <input id="contactEmail" name="contactEmail" type="email" placeholder="you@example.com" required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-4 focus:bg-white focus:ring-2 focus:ring-rose/20 outline-none transition-all text-gray-900" />
                                </div>
                                <div className="space-y-2 sm:col-span-2">
                                    <label htmlFor="contactService" className="text-xs font-bold text-gray-400 uppercase tracking-tighter ml-1">Service Type</label>
                                    <select id="contactService" name="contactService" required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-4 focus:bg-white focus:ring-2 focus:ring-rose/20 outline-none transition-all text-gray-900 appearance-none">
                                        <option value="">Select Service</option>
                                        <option value="Bridal Artistry">Bridal Artistry</option>
                                        <option value="Events & Editorial">Events & Editorial</option>
                                        <option value="Consultation Session">Consultation Session</option>
                                    </select>
                                </div>
                                <div className="space-y-2 sm:col-span-2">
                                    <label htmlFor="contactMessage" className="text-xs font-bold text-gray-400 uppercase tracking-tighter ml-1">Your Vision & Date</label>
                                    <textarea id="contactMessage" name="contactMessage" rows={5} placeholder="Tell me about your event..." required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-4 focus:bg-white focus:ring-2 focus:ring-rose/20 outline-none transition-all text-gray-900 resize-none" />
                                </div>
                                <div className="sm:col-span-2 mt-4 text-right">
                                    <button type="submit" className="w-full sm:w-auto bg-rose text-white px-12 py-5 rounded-2xl font-bold shadow-2xl shadow-rose/20 hover:bg-rose/90 transition-all tracking-tight">
                                        Send Message
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-24 px-4 bg-white border-t border-gray-50">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-16">
                    <div className="text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-4 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-charcoal flex items-center justify-center text-white font-serif font-bold">SM</div>
                            <h4 className="font-serif text-2xl font-bold text-charcoal tracking-tight">Makeovers <span className="text-rose italic font-normal">by Simran</span></h4>
                        </div>
                        <p className="text-muted max-w-sm mb-8 leading-relaxed font-medium">
                            Professional makeup artistry for life's most beautiful moments. Based in New Delhi, serving globally.
                        </p>
                        <div className="flex items-center justify-center md:justify-start gap-8">
                            <a href="https://instagram.com/makeoversbysimran" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-rose transition-all transform hover:scale-110"><Instagram size={24} /></a>
                            <a href="tel:+919773594101" className="text-gray-400 hover:text-rose transition-all transform hover:scale-110"><Phone size={24} /></a>
                            <a href="mailto:hello@simranmakeovers.com" className="text-gray-400 hover:text-rose transition-all transform hover:scale-110"><Mail size={24} /></a>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 md:gap-24 text-center md:text-left">
                        <div className="space-y-4">
                            <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Connect</h5>
                            <ul className="space-y-2 text-sm font-semibold text-gray-900">
                                <li><a href="#hero" className="hover:text-rose transition-colors">Home</a></li>
                                <li><a href="#portfolio" className="hover:text-rose transition-colors">Our Work</a></li>
                                <li><a href="#services" className="hover:text-rose transition-colors">Services</a></li>
                                <li><a href="#about" className="hover:text-rose transition-colors">About Me</a></li>
                                <li><a href="#contact" className="hover:text-rose transition-colors">Contact</a></li>
                            </ul>
                        </div>
                        <div className="space-y-4">
                            <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Legal</h5>
                            <ul className="space-y-2 text-sm font-semibold text-gray-900">
                                <li><a href="#" className="hover:text-rose transition-colors">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-rose transition-colors">Terms of Service</a></li>
                                <li><a href="#" className="hover:text-rose transition-colors">Booking Rules</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="max-w-6xl mx-auto mt-20 pt-8 border-t border-gray-50 text-center text-xs text-gray-400 font-medium">
                    &copy; {new Date().getFullYear()} Makeovers by Simran Marwah. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default Home;
