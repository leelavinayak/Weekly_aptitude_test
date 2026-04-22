import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
    LogOut, 
    User as UserIcon, 
    BookOpen, 
    LayoutDashboard,
    History,
    PlusCircle,
    UserCircle,
    Bell,
    Menu,
    X,
    ShieldCheck,
    Sparkles
} from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    // Track scroll position to update navbar appearance
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const fetchUnreadCount = async () => {
        if (!user) return;
        try {
            const { data } = await api.get('/notifications');
            const unread = data.filter(n => !n.isRead).length;
            setUnreadCount(unread);
        } catch (err) {
            console.error('Failed to fetch notifications', err);
        }
    };

    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000); // Check every 30s
        return () => clearInterval(interval);
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Derive active page from current URL path
    const getActivePage = () => {
        const path = location.pathname;
        if (path.includes('/admin/dashboard') || path === '/admin') return 'dashboard';
        if (path.includes('/admin/users')) return 'users';
        if (path.includes('/admin/add-quiz')) return 'add-quiz';
        if (path.includes('/history')) return 'history';
        if (path.includes('/student/home')) return 'quizzes';
        if (path.includes('/my-results')) return 'results';
        if (path.includes('/notifications')) return 'notifications';
        if (path.includes('/profile')) return 'profile';
        return '';
    };

    const activePage = getActivePage();

    const linkClass = (page) => `flex items-center space-x-2 px-4 py-2 font-bold transition-all duration-500 rounded-xl relative group ${
        activePage === page 
        ? 'text-blue-600 bg-blue-50/80 shadow-sm' 
        : 'text-slate-500 hover:text-blue-600'
    }`;

    // Expanding underline animation component
    const hoverUnderline = (page) => (
        <span className={`absolute bottom-0 left-4 right-4 h-0.5 bg-blue-600 transform transition-transform duration-500 origin-left ${
            activePage === page ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
        }`}></span>
    );

    return (
        <nav className={`w-full border-b transition-all duration-500 sticky top-0 z-50 ${
            isScrolled 
            ? 'bg-white/95 backdrop-blur-3xl py-2 px-6 md:px-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-blue-100/50' 
            : 'bg-transparent py-4 px-6 md:px-12 border-transparent'
        }`}>
            <div className="w-full flex justify-between items-center transition-all duration-500">
                {/* Logo / Title — Left End */}
                <Link to="/" className="flex items-center space-x-3 group shrink-0 active:scale-95 transition-all duration-300">
                    <div className="bg-blue-600 p-2.5 rounded-2xl shadow-lg shadow-blue-100 group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 rotate-3">
                        <Sparkles className="text-white" size={24} />
                    </div>
                    <span className="text-2xl font-black tracking-tighter text-slate-800">
                        Quiz<span className="text-blue-600">Craft</span>
                    </span>
                </Link>

                {/* Desktop Navigation — Right End Group */}
                <div className="flex items-center gap-2 lg:gap-8">
                    <div className="hidden">
                        {user?.role === 'admin' ? (
                            <>
                                <Link to="/admin/dashboard" className={linkClass('dashboard')}>
                                    <LayoutDashboard size={18} />
                                    <span>Dashboard</span>
                                    {hoverUnderline('dashboard')}
                                </Link>
                                <Link to="/admin/users" className={linkClass('users')}>
                                    <UserIcon size={18} />
                                    <span>Users</span>
                                    {hoverUnderline('users')}
                                </Link>
                                <Link to="/admin/add-quiz" className={linkClass('add-quiz')}>
                                    <PlusCircle size={18} />
                                    <span>Add Quiz</span>
                                    {hoverUnderline('add-quiz')}
                                </Link>
                                <Link to="/history" className={linkClass('history')}>
                                    <History size={18} />
                                    <span>History</span>
                                    {hoverUnderline('history')}
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link to="/student/home" className={linkClass('quizzes')}>
                                    <BookOpen size={18} />
                                    <span>Quizzes</span>
                                    {hoverUnderline('quizzes')}
                                </Link>
                                <Link to="/history" className={linkClass('history')}>
                                    <History size={18} />
                                    <span>History</span>
                                    {hoverUnderline('history')}
                                </Link>
                            </>
                        )}
                    </div>

                    <div className="hidden"></div>

                    <div className="flex items-center gap-1 lg:gap-4">
                        {/* Notifications */}
                        <Link to="/notifications" className="relative p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50/80 rounded-2xl transition-all group active:scale-90">
                            <Bell size={22} className="group-hover:rotate-12 transition-transform duration-500" />
                            {unreadCount > 0 && (
                                <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm scale-110"></span>
                            )}
                        </Link>

                        <div className="hidden"></div>

                        {/* Profile Pill */}
                        <div className="flex items-center gap-3 group/profile p-1.5 pr-2.5 pl-3.5 bg-slate-50/80 rounded-[1.25rem] border border-slate-100 hover:border-blue-200 hover:bg-white hover:shadow-xl hover:shadow-blue-50/50 transition-all duration-500 cursor-pointer">
                            <Link to="/profile" className="flex items-center gap-4">
                                <div className="flex flex-col items-end hidden sm:block">
                                    <span className="text-[13px] font-black text-slate-800 leading-none group-hover/profile:text-blue-600 transition-colors">
                                        {user?.name}
                                    </span>
                                    <span className="mt-1.5 text-[8px] font-black uppercase tracking-[0.15em] text-blue-600 bg-blue-50/80 px-2 py-0.5 rounded-full border border-blue-100/30">
                                        {user?.role}
                                    </span>
                                </div>
                                
                                <div className="relative">
                                    {user?.profilePic ? (
                                        <img 
                                            src={user.profilePic} 
                                            alt="Profile" 
                                            className="w-10 h-10 rounded-xl object-cover ring-2 ring-white shadow-md group-hover/profile:ring-blue-100 group-hover/profile:scale-105 transition-all duration-500" 
                                        />
                                    ) : (
                                        <div className="w-10 h-10 bg-blue-600 text-white font-black rounded-xl flex items-center justify-center shadow-lg group-hover/profile:scale-105 group-hover/profile:rotate-3 transition-all duration-500">
                                            {user?.name?.charAt(0)}
                                        </div>
                                    )}
                                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                                </div>
                            </Link>

                            <div className="hidden"></div>

                            <button 
                                onClick={handleLogout}
                                className="hidden p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90"
                                title="Logout"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>

                        {/* Hamburger Button (Mobile) */}
                        <button 
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="flex p-2.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50/80 rounded-2xl transition-all active:scale-95 border border-transparent hover:border-blue-100 shadow-sm"
                        >
                            {isMenuOpen ? <X size={26} className="animate-scale-up" /> : <Menu size={26} className="animate-scale-up" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Dropdown — Glassy Slide Down */}
            {isMenuOpen && (
                <div className="absolute top-[calc(100%+8px)] left-6 right-6 lg:left-auto lg:right-6 lg:w-[380px] bg-white/95 backdrop-blur-3xl border border-slate-100 p-4 animate-slide-down shadow-[0_20px_50px_rgba(0,0,0,0.1)] z-40 space-y-2 rounded-[2rem] overflow-y-auto max-h-[70vh] no-scrollbar">
                    <div className="px-2 pb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Navigation</span>
                    </div>
                    {user?.role === 'admin' ? (
                        <>
                            <Link to="/admin/dashboard" className={`mobile-menu-item ${activePage === 'dashboard' ? 'bg-blue-50 text-blue-600' : ''}`} onClick={() => setIsMenuOpen(false)}>
                                <LayoutDashboard size={20} />
                                <span>Administration Hub</span>
                            </Link>
                            <Link to="/admin/users" className={`mobile-menu-item ${activePage === 'users' ? 'bg-blue-50 text-blue-600' : ''}`} onClick={() => setIsMenuOpen(false)}>
                                <UserIcon size={20} />
                                <span>Student Directory</span>
                            </Link>
                            <Link to="/admin/add-quiz" className={`mobile-menu-item ${activePage === 'add-quiz' ? 'bg-blue-50 text-blue-600' : ''}`} onClick={() => setIsMenuOpen(false)}>
                                <PlusCircle size={20} />
                                <span>Generate Intelligence</span>
                            </Link>
                        </>
                    ) : (
                        <Link to="/student/home" className={`mobile-menu-item ${activePage === 'quizzes' ? 'bg-blue-50 text-blue-600' : ''}`} onClick={() => setIsMenuOpen(false)}>
                            <BookOpen size={20} />
                            <span>Available Assessments</span>
                        </Link>
                    )}
                    
                    <Link to="/history" className={`mobile-menu-item ${activePage === 'history' ? 'bg-blue-50 text-blue-600' : ''}`} onClick={() => setIsMenuOpen(false)}>
                        <History size={20} />
                        <span>Performance Record</span>
                    </Link>

                    <div className="h-px bg-slate-100 my-4 mx-4"></div>

                    <div className="px-2 pb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Account</span>
                    </div>
                    <Link to="/profile" className={`mobile-menu-item ${activePage === 'profile' ? 'bg-blue-50 text-blue-600' : ''}`} onClick={() => setIsMenuOpen(false)}>
                        <UserCircle size={20} />
                        <span>Manage My Profile</span>
                    </Link>

                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 p-4 rounded-xl font-black text-red-500 hover:bg-red-50 transition-all active:scale-95"
                    >
                        <LogOut size={20} />
                        <span>Terminate Session</span>
                    </button>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
