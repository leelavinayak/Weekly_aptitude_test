import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { 
    Bell, 
    CheckCircle2, 
    AlertCircle, 
    Info, 
    Clock, 
    Trash2,
    Loader2,
    CheckCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const { data } = await api.get('/notifications');
            setNotifications(data);
        } catch (err) {
            console.error('Failed to fetch notifications', err);
        } finally {
            setLoading(false);
        }
    };

    const markRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(notifications.map(n => 
                n._id === id ? { ...n, isRead: true } : n
            ));
        } catch (err) {
            toast.error('Failed to update notification');
        }
    };

    const markAllRead = async () => {
        try {
            const unread = notifications.filter(n => !n.isRead);
            await Promise.all(unread.map(n => api.put(`/notifications/${n._id}/read`)));
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            toast.success('All notifications marked as read');
        } catch (err) {
            toast.error('Failed to update notifications');
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation(); // Prevent marking as read when clicking delete
        try {
            await api.delete(`/notifications/${id}`);
            setNotifications(notifications.filter(n => n._id !== id));
            toast.success('Notification removed');
        } catch (err) {
            toast.error('Failed to delete notification');
        }
    };

    const handleClearAll = async () => {
        if (!window.confirm('Are you sure you want to clear all notifications? This cannot be undone.')) return;
        try {
            await api.delete('/notifications/clear');
            setNotifications([]);
            toast.success('All notifications cleared');
        } catch (err) {
            toast.error('Failed to clear notifications');
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircle2 className="text-green-500" size={20} />;
            case 'error': return <AlertCircle className="text-red-500" size={20} />;
            case 'warning': return <AlertCircle className="text-amber-500" size={20} />;
            default: return <Info className="text-blue-500" size={20} />;
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading notifications...</p>
            </div>
        </div>
    );

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="max-w-4xl mx-auto px-6 pt-16 pb-20 page-enter">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-16 gap-6">
                <div>
                    <h1 className="text-5xl font-black text-slate-800 tracking-tight">Updates Center</h1>
                    <p className="text-slate-500 mt-4 text-lg font-medium">Keep track of your academic alerts and system logs.</p>
                </div>
                <div className="flex items-center gap-3">
                    {notifications.length > 0 && (
                        <button 
                            onClick={handleClearAll}
                            className="flex items-center space-x-2 bg-red-50 text-red-600 px-4 py-2 rounded-2xl border border-red-100 hover:bg-red-600 hover:text-white transition-all text-xs font-black uppercase tracking-widest"
                        >
                            <Trash2 size={16} />
                            <span>Clear History</span>
                        </button>
                    )}
                    {unreadCount > 0 && (
                        <button 
                            onClick={markAllRead}
                            className="flex items-center space-x-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-2xl border border-blue-100 hover:bg-blue-600 hover:text-white transition-all text-xs font-black uppercase tracking-widest"
                        >
                            <CheckCheck size={16} />
                            <span>Mark All Read</span>
                        </button>
                    )}
                    <div className="bg-slate-100 px-6 py-2 rounded-2xl text-xs font-black text-slate-500 uppercase tracking-widest">
                        {unreadCount} Unread
                    </div>
                </div>
            </div>

            <div className="space-y-4 stagger-children">
                {notifications.map((n) => (
                    <div 
                        key={n._id}
                        onClick={() => !n.isRead && markRead(n._id)}
                        className={`p-6 rounded-[2rem] border transition-all duration-300 cursor-pointer flex items-center justify-between group animate-fade-in ${
                            n.isRead 
                            ? 'bg-white border-slate-100 opacity-60 hover:opacity-80' 
                            : 'bg-blue-50/30 border-blue-100 shadow-sm hover:shadow-md hover:shadow-blue-50'
                        }`}
                    >
                        <div className="flex items-center space-x-5">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${n.isRead ? 'bg-slate-100' : 'bg-white shadow-sm'}`}>
                                {getTypeIcon(n.type)}
                            </div>
                            <div>
                                <p className={`text-sm font-bold tracking-tight ${n.isRead ? 'text-slate-500' : 'text-slate-800'}`}>
                                    {n.message}
                                </p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 flex items-center">
                                    <Clock size={10} className="mr-1" />
                                    {new Date(n.createdAt).toLocaleString()}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            {!n.isRead && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse mr-2"></div>
                            )}
                            <button 
                                onClick={(e) => handleDelete(e, n._id)}
                                className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                title="Delete notification"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}

                {notifications.length === 0 && (
                    <div className="text-center py-40 animate-fade-in">
                        <div className="animate-float">
                            <Bell size={64} className="mx-auto text-slate-100 mb-8" />
                        </div>
                        <h3 className="text-xl font-black text-slate-300 uppercase tracking-[0.3em]">All caught up</h3>
                        <p className="text-slate-200 mt-2 font-black uppercase text-[10px] tracking-widest">No new notifications for you</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
