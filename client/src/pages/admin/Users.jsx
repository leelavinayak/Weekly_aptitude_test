import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { 
    Search, 
    Trash2, 
    ExternalLink, 
    Loader2, 
    ArrowUpDown,
    Download,
    Pencil,
    X,
    Save,
    UserCheck,
    Users
} from 'lucide-react';
import toast from 'react-hot-toast';

const UserManagement = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    
    // Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [editFormData, setEditFormData] = useState({
        name: '',
        email: '',
        collegeId: '',
        collegeName: '',
        branch: '',
        year: ''
    });

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const { data } = await api.get('/admin/users');
            setStudents(data);
        } catch (err) {
            console.error('Failed to fetch students', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this student and all their results?')) {
            try {
                await api.delete(`/admin/users/${id}`);
                setStudents(students.filter(s => s._id !== id));
                toast.success('Student record purged successfully');
            } catch (err) {
                toast.error('Failed to eliminate student record');
            }
        }
    };

    const handleEditClick = (student) => {
        setEditingStudent(student);
        setEditFormData({
            name: student.name,
            email: student.email,
            collegeId: student.collegeId || '',
            collegeName: student.collegeName || '',
            branch: student.branch || '',
            year: student.year || ''
        });
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async (e) => {
        if (e) e.preventDefault();
        try {
            await api.put(`/admin/users/${editingStudent._id}`, editFormData);
            toast.success('Student updated successfully');
            setIsEditModalOpen(false);
            fetchStudents(); // Refresh list
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed');
        }
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedStudents = [...students].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    }).filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = rowsPerPage === 'all' ? 1 : Math.ceil(sortedStudents.length / Number(rowsPerPage));
    const paginatedStudents = rowsPerPage === 'all'
        ? sortedStudents
        : sortedStudents.slice((currentPage - 1) * Number(rowsPerPage), currentPage * Number(rowsPerPage));

    const handleRowsPerPageChange = (val) => {
        setRowsPerPage(val);
        setCurrentPage(1);
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading students...</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 pt-8 md:pt-12 pb-12 page-enter">
            {/* Page Header */}
            <div className="mb-6 md:mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tight">Student Directory</h1>
                    <p className="text-slate-400 mt-1 text-sm md:text-base">Manage all registered students and their growth.</p>
                </div>

                {/* Controls Bar — wraps on mobile */}
                <div className="flex flex-col gap-2 w-full md:w-auto">
                    {/* Row 1: Show + Count */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-white border border-slate-100 rounded-xl px-3 py-2 shadow-sm">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Show</span>
                            <select
                                value={rowsPerPage}
                                onChange={(e) => handleRowsPerPageChange(e.target.value)}
                                className="bg-slate-50 border border-slate-100 rounded-lg py-1 px-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
                            >
                                <option value={10}>10</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                                <option value="all">All</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-1.5 bg-blue-50 text-blue-600 px-3 py-2 rounded-xl">
                            <Users size={14} />
                            <span className="text-xs font-black">{students.length} <span className="font-bold text-blue-400">students</span></span>
                        </div>
                    </div>
                    {/* Row 2: Search (full width on mobile) */}
                    <div className="relative group w-full">
                        <input
                            type="text"
                            placeholder="Search students..."
                            className="w-full bg-white border border-slate-100 rounded-xl px-4 pr-10 py-2.5 text-sm font-medium text-slate-700 placeholder-slate-300 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-200 shadow-sm transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <Search className="text-slate-300 group-focus-within:text-blue-400 transition-colors w-4 h-4" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl md:rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto -mx-0">
                    <table className="w-full text-left min-w-[600px]">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="px-4 md:px-8 py-4 md:py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer group" onClick={() => handleSort('name')}>
                                    <div className="flex items-center">
                                        Student <ArrowUpDown size={14} className="ml-2 text-slate-300 group-hover:text-blue-600 transition-colors" />
                                    </div>
                                </th>
                                <th className="px-4 md:px-8 py-4 md:py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer group" onClick={() => handleSort('createdAt')}>
                                    <div className="flex items-center">
                                        Joined <ArrowUpDown size={14} className="ml-2 text-slate-300 group-hover:text-blue-600 transition-colors" />
                                    </div>
                                </th>
                                <th className="px-4 md:px-8 py-4 md:py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Attempts</th>
                                <th className="px-4 md:px-8 py-4 md:py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center cursor-pointer group" onClick={() => handleSort('averageScore')}>
                                    <div className="flex items-center justify-center">
                                        Avg Score <ArrowUpDown size={14} className="ml-2 text-slate-300 group-hover:text-blue-600 transition-colors" />
                                    </div>
                                </th>
                                <th className="px-4 md:px-8 py-4 md:py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                        {paginatedStudents.map((student) => (
                                <tr key={student._id} className="hover:bg-blue-50/30 transition-all duration-300 group">
                                    <td className="px-4 md:px-8 py-4 md:py-6">
                                        <div 
                                            className="flex items-center space-x-3 cursor-pointer group/student"
                                            onClick={() => navigate(`/admin/student/${student._id}`)}
                                        >
                                            <div className="w-9 h-9 md:w-12 md:h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-base md:text-lg shadow-lg shadow-blue-100 border border-blue-500 shrink-0 group-hover/student:scale-110 transition-transform">
                                                {student.profilePic ? (
                                                    <img src={student.profilePic} alt={student.name} className="w-full h-full rounded-xl object-cover" />
                                                ) : student.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-800 text-sm tracking-tight group-hover/student:text-blue-600 transition-colors uppercase">{student.name}</p>
                                                <p className="text-xs font-bold text-slate-400 mt-0.5 hidden sm:block">{student.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 md:px-8 py-4 md:py-6 text-sm font-bold text-slate-500">
                                        {new Date(student.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 md:px-8 py-4 md:py-6 text-center">
                                        <span className="bg-slate-100 text-slate-600 px-4 py-1.5 rounded-xl text-xs font-black">
                                            {student.totalAttempts}
                                        </span>
                                    </td>
                                    <td className="px-4 md:px-8 py-4 md:py-6 text-center">
                                        <div className="flex items-center justify-center space-x-2">
                                            <div className="w-20 bg-slate-100 h-2 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full rounded-full bg-blue-600 transition-all duration-700" 
                                                    style={{ width: `${student.averageScore}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs font-black text-blue-600">
                                                {student.averageScore}%
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 md:px-8 py-4 md:py-6 text-right">
                                        <div className="flex items-center justify-end space-x-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                className="p-3 text-blue-600 hover:bg-blue-100 rounded-xl transition-all" 
                                                title="View Performance"
                                                onClick={() => navigate(`/admin/student/${student._id}`)}
                                            >
                                                <ExternalLink size={20} />
                                            </button>
                                            <button 
                                                className="p-3 text-slate-600 hover:bg-slate-100 rounded-xl transition-all" 
                                                title="Edit Student"
                                                onClick={() => handleEditClick(student)}
                                            >
                                                <Pencil size={20} />
                                            </button>
                                            <button 
                                                className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" 
                                                title="Delete Student"
                                                onClick={() => handleDelete(student._id)}
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {paginatedStudents.length === 0 && (
                        <div className="py-32 text-center">
                            <div className="w-16 h-16 bg-slate-50 text-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-4 font-black text-2xl">?</div>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No matching students found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Pagination Footer */}
            {rowsPerPage !== 'all' && sortedStudents.length > 0 && (
                <div className="mt-4 bg-white border border-slate-100 rounded-2xl px-4 md:px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 text-center md:text-left">
                        Showing{' '}
                        <span className="text-blue-600 font-black">{Math.min((currentPage - 1) * Number(rowsPerPage) + 1, sortedStudents.length)}</span>
                        {' '}–{' '}
                        <span className="text-blue-600 font-black">{Math.min(currentPage * Number(rowsPerPage), sortedStudents.length)}</span>
                        {' '}of{' '}
                        <span className="text-slate-700 font-black">{sortedStudents.length}</span> students
                    </p>
                    <div className="flex items-center gap-1 flex-wrap justify-center">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-xs font-black text-slate-500 disabled:opacity-30 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all"
                        >
                            ← Prev
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                            .reduce((acc, p, idx, arr) => {
                                if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                                acc.push(p);
                                return acc;
                            }, [])
                            .map((item, idx) =>
                                typeof item === 'number' ? (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentPage(item)}
                                        className={`w-9 h-9 rounded-xl text-xs font-black transition-all ${
                                            currentPage === item
                                                ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                                                : 'bg-slate-50 border border-slate-100 text-slate-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100'
                                        }`}
                                    >
                                        {item}
                                    </button>
                                ) : (
                                    <span key={idx} className="text-slate-300 font-black px-1">…</span>
                                )
                            )
                        }
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-xs font-black text-slate-500 disabled:opacity-30 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all"
                        >
                            Next →
                        </button>
                    </div>
                </div>
            )}

            {/* Slide-over Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-[100] flex justify-end">
                    <div 
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in"
                        onClick={() => setIsEditModalOpen(false)}
                    ></div>
                    <div className="relative w-full max-w-md bg-white h-full shadow-2xl animate-slide-in-right flex flex-col">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-100">
                                    <UserCheck className="text-white" size={24} />
                                </div>
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Edit Student</h2>
                            </div>
                            <button 
                                onClick={() => setIsEditModalOpen(false)}
                                className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
                            <div className="space-y-6">
                                <section className="space-y-4">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">General Access</h3>
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-600 ml-1">Full Legal Name</label>
                                            <input 
                                                type="text" 
                                                className="input-field"
                                                value={editFormData.name}
                                                onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-600 ml-1">Digital Identity (Email)</label>
                                            <input 
                                                type="email" 
                                                className="input-field"
                                                value={editFormData.email}
                                                onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                                                required
                                            />
                                        </div>
                                    </div>
                                </section>

                                <section className="space-y-4 pt-4">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Academic Governance</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2 space-y-1">
                                            <label className="text-xs font-bold text-slate-600 ml-1">Institutional Entity</label>
                                            <input 
                                                type="text" 
                                                className="input-field"
                                                value={editFormData.collegeName}
                                                onChange={(e) => setEditFormData({...editFormData, collegeName: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-600 ml-1">Member ID</label>
                                            <input 
                                                type="text" 
                                                className="input-field"
                                                value={editFormData.collegeId}
                                                onChange={(e) => setEditFormData({...editFormData, collegeId: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-600 ml-1">Academic Year</label>
                                            <select 
                                                className="input-field"
                                                value={editFormData.year}
                                                onChange={(e) => setEditFormData({...editFormData, year: e.target.value})}
                                            >
                                                <option value="">Select Year</option>
                                                <option value="1st Year">1st Year</option>
                                                <option value="2nd Year">2nd Year</option>
                                                <option value="3rd Year">3rd Year</option>
                                                <option value="4th Year">4th Year</option>
                                            </select>
                                        </div>
                                        <div className="col-span-2 space-y-1">
                                            <label className="text-xs font-bold text-slate-600 ml-1">Branch / Stream</label>
                                            <input 
                                                type="text" 
                                                className="input-field"
                                                value={editFormData.branch}
                                                onChange={(e) => setEditFormData({...editFormData, branch: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </form>

                        <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex gap-3">
                            <button 
                                type="button"
                                onClick={() => setIsEditModalOpen(false)}
                                className="flex-1 py-4 font-black text-slate-500 hover:text-slate-800 transition-all text-sm uppercase tracking-widest"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleEditSubmit}
                                className="flex-[2] btn-blue py-4 flex items-center justify-center space-x-2 shadow-xl shadow-blue-100"
                            >
                                <Save size={20} />
                                <span>Commit Changes</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
