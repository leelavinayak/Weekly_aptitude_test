import React from 'react';
import {
    Mail,
    MapPin,
    Phone,
    Code2,
    Globe,
    Sparkles,
    ExternalLink
} from 'lucide-react';

// Custom SVG Icons for Brands (to ensure perfect rendering and stability)
const InstagramIcon = ({ size = 20, className = "" }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
);

const LinkedInIcon = ({ size = 20, className = "" }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
        <rect x="2" y="9" width="4" height="12"></rect>
        <circle cx="4" cy="4" r="2"></circle>
    </svg>
);

const Footer = () => {
    return (
        <footer className="bg-slate-950 pt-24 pb-12 px-6 relative overflow-hidden border-t border-white/5">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/5 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
                    {/* Segment 1: Brand Section */}
                    <div className="space-y-8">
                        <div className="flex items-center space-x-3 group cursor-default">
                            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 rounded-2xl shadow-xl shadow-blue-500/20 group-hover:rotate-6 transition-transform duration-500">
                                <Sparkles className="text-white" size={24} />
                            </div>
                            <span className="text-3xl font-black text-white tracking-tighter">
                                Quiz<span className="text-blue-500">Craft</span>
                            </span>
                        </div>
                        <p className="text-slate-400 font-medium text-base leading-relaxed max-w-xs">
                            Architecting the future of academic assessment through AI-driven intelligence and secure protocols.
                        </p>
                        <div className="flex items-center space-x-4">
                            <a href="https://instagram.com/vemuitchittoor" target="_blank" rel="noreferrer" className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all transform hover:-translate-y-1 border border-white/5 hover:border-blue-400/30 group" title="Instagram">
                                <InstagramIcon size={22} className="group-hover:scale-110 transition-transform" />
                            </a>
                            <a href="#" target="_blank" rel="noreferrer" className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all transform hover:-translate-y-1 border border-white/5 hover:border-blue-400/30 group" title="LinkedIn">
                                <LinkedInIcon size={22} className="group-hover:scale-110 transition-transform" />
                            </a>
                            <a href="https://vemu.org" target="_blank" rel="noreferrer" className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all transform hover:-translate-y-1 border border-white/5 hover:border-blue-400/30 group" title="Website">
                                <Globe size={22} className="group-hover:scale-110 transition-transform" />
                            </a>
                        </div>
                    </div>

                    {/* Segment 2: Ecosystem (Platform Links) - Swapped to 2nd position */}
                    <div className="space-y-8">
                        <h4 className="text-white font-black uppercase tracking-[0.25em] text-xs pb-2 border-b-2 border-blue-600 w-fit">Ecosystem</h4>
                        <ul className="space-y-4">
                            {['Infrastructure', 'Security Protocol', 'Privacy Node', 'API Status'].map((item) => (
                                <li key={item}>
                                    <a href="#" className="text-slate-400 hover:text-blue-500 font-bold text-sm transition-all flex items-center group">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mr-3 opacity-0 group-hover:opacity-100 transition-all transform -translate-x-2 group-hover:translate-x-0"></span>
                                        <span className="uppercase tracking-widest text-[11px]">{item}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Segment 3: Institutional Profile - Swapped to 3rd position */}
                    <div className="space-y-8">
                        <h4 className="text-white font-black uppercase tracking-[0.25em] text-xs pb-2 border-b-2 border-blue-600 w-fit">Our Institution</h4>
                        <div className="space-y-6">
                            <div className="flex items-start space-x-4 group">
                                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
                                    <MapPin size={18} />
                                </div>
                                <p className="text-slate-400 text-sm font-semibold leading-relaxed">
                                    Vemu Institute of Technology<br />
                                    <span className="text-slate-500 font-medium">P. Kothakota, Chittoor, AP - 517112</span>
                                </p>
                            </div>
                            <div className="flex items-center space-x-4 group">
                                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
                                    <Phone size={18} />
                                </div>
                                <p className="text-slate-400 text-sm font-semibold group-hover:text-slate-200 transition-colors">+91 8886661148 / 49</p>
                            </div>
                            <div className="flex items-center space-x-4 group">
                                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
                                    <Mail size={18} />
                                </div>
                                <p className="text-slate-400 text-sm font-semibold group-hover:text-slate-200 transition-colors">vemupat@gmail.com</p>
                            </div>
                        </div>
                    </div>

                    {/* Segment 4: Team Credits (Programmers Club) - Width 300px */}
                    <div className="flex justify-start lg:justify-end">
                        <div className="relative group w-[300px]">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2.5rem] blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative space-y-6 p-8 bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-white/5 hover:border-white/10 transition-colors">
                                <div className="flex items-center space-x-3 mb-2">
                                    <div className="bg-blue-600/20 p-2 rounded-xl">
                                        <Code2 className="text-blue-500" size={24} />
                                    </div>
                                    <h4 className="text-white font-black uppercase tracking-[0.2em] text-xs">Programmers Club</h4>
                                </div>
                                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20">
                                    Innovation Hub
                                </span>
                                <p className="text-slate-400 text-xs font-bold leading-relaxed">
                                    Curating software innovation and digital excellence through student-led initiatives at Vemu IT.
                                </p>
                                <div className="pt-4 space-y-5">
                                    <a
                                        href="https://programmers-club.onrender.com/"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center justify-center space-x-3 w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.15em] transition-all transform hover:-translate-y-1 shadow-xl shadow-blue-900/40 group/btn"
                                    >
                                        <ExternalLink size={16} className="group-hover/btn:rotate-12 transition-transform" />
                                        <span>Visit Website</span>
                                    </a>
                                    <div className="flex items-center justify-between border-t border-white/5 pt-5">
                                        <div className="flex items-center space-x-3">
                                            <a href="#" target="_blank" rel="noreferrer" className="p-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-blue-500 hover:bg-white/10 transition-all transform hover:scale-110">
                                                <InstagramIcon size={18} />
                                            </a>
                                            <a href="https://www.linkedin.com/in/programmers-club-1929b3403" target="_blank" rel="noreferrer" className="p-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-blue-500 hover:bg-white/10 transition-all transform hover:scale-110">
                                                <LinkedInIcon size={18} />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center space-x-4">
                        <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest leading-relaxed">
                            © 2026 Developed by Programmers Club, Vemu Institute Of Technology
                            {/* © 2026 QuizCraft Enterprise. All internal protocols active. */}
                        </p>
                    </div>
                    {/* <div className="flex items-center space-x-8">
                        {['Privacy Polices', 'Compliance', 'Terms of Service'].map((link) => (
                            <span key={link} className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] hover:text-blue-500 cursor-pointer transition-colors px-2 py-1">
                                {link}
                            </span>
                        ))}
                    </div> */}
                </div>
            </div>
        </footer>
    );
};

export default Footer;
