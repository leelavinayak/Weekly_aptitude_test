const supabase = require('../config/supabase');

// @desc    Get user notifications
const getNotifications = async (req, res) => {
    try {
        const { data: notifications, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('userId', req.user.id)
            .order('createdAt', { ascending: false });
        
        if (error) throw error;
        
        const mappedNotifications = notifications?.map(n => ({
            ...n,
            _id: n.id
        })) || [];
        
        res.json(mappedNotifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark notification as read
const markAsRead = async (req, res) => {
    try {
        const { error } = await supabase
            .from('notifications')
            .update({ isRead: true })
            .eq('id', req.params.id);

        if (error) throw error;
        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete notification
const deleteNotification = async (req, res) => {
    try {
        const { data: notification } = await supabase
            .from('notifications')
            .select('userId')
            .eq('id', req.params.id)
            .single();

        if (notification) {
            if (notification.userId !== req.user.id) {
                return res.status(403).json({ message: 'Not authorized' });
            }
            await supabase.from('notifications').delete().eq('id', req.params.id);
            res.json({ message: 'Notification deleted' });
        } else {
            res.status(404).json({ message: 'Notification not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getNotifications, markAsRead, deleteNotification };
