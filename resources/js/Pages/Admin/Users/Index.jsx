import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { useApp } from '../../../Context/AppContext';
import { useAlert } from '../../../Context/AlertContext';
import {
    Users,
    UserCheck,
    UserX,
    Clock,
    Shield,
    Search,
    CheckCircle2,
    XCircle,
    Trash2,
    Power,
    Mail,
    Calendar,
    AlertCircle,
    UserPlus,
    X,
    Eye,
    EyeOff,
    Loader2,
    KeyRound
} from 'lucide-react';

export default function UsersIndex({ users, stats, filters = {} }) {
    const { props } = usePage();
    const currentUserId = props.auth?.user?.id;
    const { t, language } = useApp();
    const { showConfirm, showSuccess, showError, showWarning } = useAlert();

    const u = t?.admin?.users || {};

    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [rejectingUser, setRejectingUser] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Create User Modal State
    const [isCreatingUser, setIsCreatingUser] = useState(false);
    const [createForm, setCreateForm] = useState({
        name: '',
        username: '',
        email: '',
        password: '',
        role: 'admin',
        status: 'approved',
    });
    const [showCreatePassword, setShowCreatePassword] = useState(false);
    const [isSavingUser, setIsSavingUser] = useState(false);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        router.get('/users', { search, status: statusFilter }, { preserveState: true, replace: true });
    };

    const handleStatusChange = (status) => {
        setStatusFilter(status);
        router.get('/users', { search, status }, { preserveState: true, replace: true });
    };

    const handleApprove = async (user) => {
        const title = u.approveTitle || 'Setujui Akun Pengguna?';
        const message = (u.approveMsg || 'Apakah Anda yakin ingin menyetujui akun "{name}" ({email}) sebagai Admin? Pengguna ini akan dapat mengakses seluruh fitur Admin Panel.')
            .replace('{name}', user.name)
            .replace('{email}', user.email);
        const confirmText = u.approveConfirm || 'Setujui Akun';
        const cancelText = u.approveCancel || 'Batal';

        const confirmed = await showConfirm({
            title,
            message,
            confirmText,
            cancelText,
            variant: 'primary',
        });
        if (confirmed) {
            router.post(`/users/${user.id}/approve`);
        }
    };

    const handleRejectSubmit = (e) => {
        e.preventDefault();
        if (!rejectingUser) return;
        setIsSubmitting(true);
        router.post(`/users/${rejectingUser.id}/reject`, {
            reason: rejectReason || (u.defaultRejectReason || 'Tidak memenuhi kriteria aktivasi.'),
        }, {
            onFinish: () => {
                setIsSubmitting(false);
                setRejectingUser(null);
                setRejectReason('');
            }
        });
    };

    const handleToggleStatus = async (user) => {
        const isDeactivating = user.status === 'approved';
        const title = isDeactivating ? (u.deactivateTitle || 'Menonaktifkan Akun?') : (u.activateTitle || 'Mengaktifkan Kembali Akun?');
        const message = isDeactivating
            ? (u.deactivateMsg || 'Apakah Anda yakin ingin menonaktifkan akses akun "{name}" ({email})?').replace('{name}', user.name).replace('{email}', user.email)
            : (u.activateMsg || 'Apakah Anda yakin ingin mengaktifkan kembali akses akun "{name}" ({email})?').replace('{name}', user.name).replace('{email}', user.email);
        const confirmText = isDeactivating ? (u.deactivateConfirm || 'Nonaktifkan') : (u.activateConfirm || 'Aktifkan');
        const cancelText = u.toggleCancel || 'Batal';

        const confirmed = await showConfirm({
            title,
            message,
            confirmText,
            cancelText,
            variant: isDeactivating ? 'warning' : 'primary',
        });
        if (confirmed) {
            router.post(`/users/${user.id}/toggle-status`);
        }
    };

    const handleDelete = async (user) => {
        const title = u.deleteTitle || 'Hapus Akun Pengguna?';
        const message = (u.deleteMsg || 'Akun "{name}" ({email}) akan dihapus secara permanen dari sistem. Tindakan ini tidak dapat dibatalkan.')
            .replace('{name}', user.name)
            .replace('{email}', user.email);
        const confirmText = u.deleteConfirm || 'Hapus Akun';
        const cancelText = u.deleteCancel || 'Batal';

        const confirmed = await showConfirm({
            title,
            message,
            confirmText,
            cancelText,
            variant: 'danger',
        });
        if (confirmed) {
            router.delete(`/users/${user.id}`);
        }
    };

    // Create User Form Submit
    const handleCreateUserSubmit = (e) => {
        e.preventDefault();

        if (!createForm.name || !createForm.email || !createForm.password) {
            showWarning('Data Belum Lengkap', 'Nama, email, dan kata sandi awal wajib diisi.');
            return;
        }

        if (createForm.password.length < 8) {
            showWarning('Kata Sandi Kurang Panjang', 'Kata sandi minimal harus 8 karakter.');
            return;
        }

        setIsSavingUser(true);
        router.post('/users', createForm, {
            preserveScroll: true,
            onSuccess: () => {
                showSuccess(
                    u.alertUserCreatedTitle || 'Akun Berhasil Dibuat',
                    (u.alertUserCreatedMsg || 'Akun {email} telah berhasil didaftarkan.').replace('{email}', createForm.email)
                );
                setIsCreatingUser(false);
                setCreateForm({
                    name: '',
                    username: '',
                    email: '',
                    password: '',
                    role: 'admin',
                    status: 'approved',
                });
                setIsSavingUser(false);
            },
            onError: (errors) => {
                showError(
                    'Gagal Mendaftarkan Akun',
                    Object.values(errors)[0] || 'Terjadi kesalahan saat menyimpan akun.'
                );
                setIsSavingUser(false);
            },
            onFinish: () => {
                setIsSavingUser(false);
            }
        });
    };

    const userList = users?.data || [];

    return (
        <AdminLayout title={u.pageTitle || 'Manajemen User & Persetujuan'} currentPath="/users">
            <div className="space-y-6">
                
                {/* Header Title & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-[#0D5A34] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                <Users className="w-5 h-5" />
                            </span>
                            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                                {u.headerTitle || 'Manajemen User & Persetujuan Akun'}
                            </h1>
                        </div>
                        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                            {u.headerSubtitle || 'Tinjau permohonan registrasi, setujui akses Admin, atau kelola status pengguna terdaftar.'}
                        </p>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                        {stats.pending > 0 && (
                            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-xs font-bold">
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                                <span>{(u.pendingAlert || '{count} Permohonan Menunggu Persetujuan').replace('{count}', stats.pending)}</span>
                            </div>
                        )}

                        {/* Add User Button */}
                        <button
                            type="button"
                            onClick={() => setIsCreatingUser(true)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0D5A34] hover:bg-[#094226] text-white text-xs sm:text-sm font-semibold shadow-xs transition-all cursor-pointer"
                        >
                            <UserPlus className="w-4 h-4" />
                            <span>{u.btnAddUser || '+ Tambah User Baru'}</span>
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                    {/* Total */}
                    <div className="p-4 rounded-2xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800/80">
                        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                            {u.statTotal || 'Total User'}
                        </span>
                        <span className="text-2xl font-black text-slate-900 dark:text-white">
                            {stats.total}
                        </span>
                    </div>

                    {/* Pending */}
                    <div className="p-4 rounded-2xl bg-white dark:bg-[#121824] border border-amber-200/80 dark:border-amber-900/60 bg-gradient-to-br from-white to-amber-50/30 dark:from-[#121824] dark:to-amber-950/10">
                        <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider block mb-1">
                            {u.statPending || 'Pending Approval'}
                        </span>
                        <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                            {stats.pending}
                        </span>
                    </div>

                    {/* Approved */}
                    <div className="p-4 rounded-2xl bg-white dark:bg-[#121824] border border-emerald-200/80 dark:border-emerald-900/60">
                        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1">
                            {u.statApproved || 'Approved Admin'}
                        </span>
                        <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                            {stats.approved}
                        </span>
                    </div>

                    {/* Inactive / Rejected */}
                    <div className="p-4 rounded-2xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800/80">
                        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                            {u.statInactiveRejected || 'Nonaktif / Ditolak'}
                        </span>
                        <span className="text-2xl font-black text-zinc-600 dark:text-zinc-400">
                            {stats.inactive + stats.rejected}
                        </span>
                    </div>
                </div>

                {/* Filters & Search Toolbar */}
                <div className="bg-white dark:bg-[#121824] rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
                    {/* Status Tabs */}
                    <div className="flex items-center gap-1.5 w-full md:w-auto bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 overflow-x-auto">
                        {[
                            { key: 'all', label: (u.tabAll || 'Semua ({count})').replace('{count}', stats.total) },
                            { key: 'pending', label: (u.tabPending || 'Pending ({count})').replace('{count}', stats.pending) },
                            { key: 'approved', label: (u.tabApproved || 'Approved ({count})').replace('{count}', stats.approved) },
                            { key: 'rejected', label: (u.tabRejected || 'Ditolak ({count})').replace('{count}', stats.rejected) },
                            { key: 'inactive', label: (u.tabInactive || 'Nonaktif ({count})').replace('{count}', stats.inactive) },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => handleStatusChange(tab.key)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                                    statusFilter === tab.key
                                        ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs'
                                        : 'text-zinc-500 hover:text-slate-900 dark:hover:text-zinc-300'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Search Bar */}
                    <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={u.searchPlaceholder || 'Cari nama, username, email...'}
                            className="w-full pl-9 pr-4 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/80 rounded-xl text-slate-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-[#0D5A34] transition-colors"
                        />
                        <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5 pointer-events-none" />
                    </form>
                </div>

                {/* Users Table */}
                <div className="rounded-3xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-700 dark:text-zinc-300">
                            <thead className="bg-zinc-50/70 dark:bg-zinc-900/70 border-b border-zinc-200/80 dark:border-zinc-800/80 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                <tr>
                                    <th className="px-5 py-3.5">{u.thUser || 'User'}</th>
                                    <th className="px-5 py-3.5">{u.thEmail || 'Email'}</th>
                                    <th className="px-5 py-3.5">{u.thRole || 'Role'}</th>
                                    <th className="px-5 py-3.5">{u.thStatus || 'Status Akun'}</th>
                                    <th className="px-5 py-3.5 hidden md:table-cell">{u.thRegisteredAt || 'Waktu Daftar'}</th>
                                    <th className="px-5 py-3.5 text-right">{u.thAction || 'Aksi Persetujuan'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200/70 dark:divide-zinc-800/70">
                                {userList.length > 0 ? (
                                    userList.map((user) => (
                                        <tr
                                            key={user.id}
                                            className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                                        >
                                            {/* User Info */}
                                            <td className="px-5 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    {user.avatar_url || user.avatar ? (
                                                        <img
                                                             src={user.avatar_url || `/storage/${user.avatar}`}
                                                            alt={user.name || 'User'}
                                                            className="w-9 h-9 rounded-xl object-cover border border-emerald-300 dark:border-emerald-800 shrink-0"
                                                        />
                                                    ) : (
                                                        <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center text-[#0D5A34] dark:text-emerald-300 font-bold text-xs shrink-0">
                                                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                                            <span>{user.name}</span>
                                                            {user.id === currentUserId && (
                                                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-normal">
                                                                    {u.youBadge || '(Anda)'}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-[11px] text-zinc-400 font-mono">
                                                            @{user.username || 'user'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Email */}
                                            <td className="px-5 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-1.5 text-slate-800 dark:text-zinc-200">
                                                    <Mail className="w-3.5 h-3.5 text-zinc-400" />
                                                    <span>{user.email}</span>
                                                </div>
                                            </td>

                                            {/* Role */}
                                            <td className="px-5 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[#0D5A34] dark:text-emerald-400">
                                                    <Shield className="w-3 h-3" />
                                                    <span>{user.role === 'admin' ? (u.roleAdmin || 'Admin') : user.role}</span>
                                                </span>
                                            </td>

                                            {/* Status Badge */}
                                            <td className="px-5 py-4 whitespace-nowrap">
                                                {user.status === 'pending' && (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 animate-pulse">
                                                        <Clock className="w-3 h-3" />
                                                        <span>{u.statusPending || 'Menunggu Approval'}</span>
                                                    </span>
                                                )}
                                                {user.status === 'approved' && (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300">
                                                        <CheckCircle2 className="w-3 h-3" />
                                                        <span>{u.statusApproved || 'Aktif / Approved'}</span>
                                                    </span>
                                                )}
                                                {user.status === 'rejected' && (
                                                    <div>
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300">
                                                            <XCircle className="w-3 h-3" />
                                                            <span>{u.statusRejected || 'Ditolak'}</span>
                                                        </span>
                                                        {user.rejection_reason && (
                                                            <p className="text-[10px] text-zinc-400 mt-0.5 max-w-xs truncate" title={user.rejection_reason}>
                                                                {user.rejection_reason}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                                {user.status === 'inactive' && (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400">
                                                        <Power className="w-3 h-3" />
                                                        <span>{u.statusInactive || 'Nonaktif'}</span>
                                                    </span>
                                                )}
                                            </td>

                                            {/* Date */}
                                            <td className="px-5 py-4 text-zinc-500 dark:text-zinc-400 text-[11px] hidden md:table-cell whitespace-nowrap">
                                                {new Date(user.created_at).toLocaleDateString(language === 'en' ? 'en-US' : 'id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-5 py-4 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {user.status === 'pending' && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleApprove(user)}
                                                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0D5A34] hover:bg-[#094226] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                                                            >
                                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                                <span>{u.btnApprove || 'Approve'}</span>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setRejectingUser(user)}
                                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-semibold transition-all cursor-pointer"
                                                            >
                                                                <XCircle className="w-3.5 h-3.5" />
                                                                <span>{u.btnReject || 'Tolak'}</span>
                                                            </button>
                                                        </>
                                                    )}

                                                    {user.status === 'approved' && user.id !== currentUserId && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleToggleStatus(user)}
                                                            title={u.btnDeactivate || 'Nonaktifkan Akun'}
                                                            className="px-2.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold transition-all cursor-pointer"
                                                        >
                                                            {u.btnDeactivate || 'Nonaktifkan'}
                                                        </button>
                                                    )}

                                                    {(user.status === 'inactive' || user.status === 'rejected') && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleApprove(user)}
                                                            className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 text-[#0D5A34] dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 text-xs font-bold transition-all cursor-pointer"
                                                        >
                                                            {u.btnReactivate || 'Aktifkan Kembali'}
                                                        </button>
                                                    )}

                                                    {user.id !== currentUserId && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(user)}
                                                            title={u.btnDelete || 'Hapus Akun'}
                                                            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-10 text-center text-zinc-500 dark:text-zinc-400 text-xs">
                                            {u.emptyUsers || 'Tidak ada user yang sesuai filter.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {users?.links && users.links.length > 3 && (
                    <div className="flex items-center justify-center gap-1.5 mt-6">
                        {users.links.map((link, idx) => (
                            <Link
                                key={idx}
                                href={link.url || '#'}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                    link.active
                                        ? 'bg-[#0D5A34] text-white'
                                        : link.url
                                        ? 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50'
                                        : 'text-zinc-400 pointer-events-none'
                                }`}
                            />
                        ))}
                    </div>
                )}

            </div>

            {/* Modal Create User */}
            {isCreatingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-[#121824] rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 max-w-lg w-full shadow-2xl space-y-4 my-8">
                        
                        {/* Modal Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[#0D5A34] dark:text-emerald-400">
                                    <UserPlus className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                        {u.createUserModalTitle || 'Tambah Akun Pengguna Baru'}
                                    </h3>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                        {u.createUserModalDesc || 'Daftarkan akun admin atau peneliti baru langsung ke dalam sistem.'}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsCreatingUser(false)}
                                className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleCreateUserSubmit} className="space-y-4">
                            
                            {/* Full Name Field */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                                    {u.labelFullName || 'Nama Lengkap'} <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={createForm.name}
                                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                                    placeholder={u.placeholderFullName || 'cth. Fatin Muflihuts Tsani'}
                                    required
                                    className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-[#0D5A34]"
                                />
                            </div>

                            {/* Username & Email Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                                        {u.labelUsername || 'Username (Opsional)'}
                                    </label>
                                    <input
                                        type="text"
                                        value={createForm.username}
                                        onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                                        placeholder={u.placeholderUsername || 'cth. fatintsani'}
                                        className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-[#0D5A34]"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                                        {u.labelEmail || 'Alamat Email'} <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={createForm.email}
                                        onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                                        placeholder={u.placeholderEmail || 'nama@telkomuniversity.ac.id'}
                                        required
                                        className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-[#0D5A34]"
                                    />
                                </div>

                            </div>

                            {/* Initial Password Field */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-800 dark:text-zinc-200 flex items-center justify-between">
                                    <span>{u.labelPassword || 'Kata Sandi Awal'} <span className="text-rose-500">*</span></span>
                                    <span className="text-[10px] text-zinc-400">Min. 8 Karakter</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showCreatePassword ? 'text' : 'password'}
                                        value={createForm.password}
                                        onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                                        placeholder={u.placeholderPassword || 'Minimal 8 karakter'}
                                        required
                                        minLength={8}
                                        className="w-full px-3 py-2 pr-10 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-[#0D5A34]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCreatePassword(!showCreatePassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                                    >
                                        {showCreatePassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Role & Status Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                                        {u.labelRole || 'Peran / Role'}
                                    </label>
                                    <select
                                        value={createForm.role}
                                        onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                                        className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-[#0D5A34]"
                                    >
                                        <option value="admin">{u.optRoleAdmin || 'Administrator'}</option>
                                        <option value="researcher">{u.optRoleResearcher || 'Peneliti'}</option>
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                                        {u.labelStatus || 'Status Akun'}
                                    </label>
                                    <select
                                        value={createForm.status}
                                        onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
                                        className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-[#0D5A34]"
                                    >
                                        <option value="approved">{u.optStatusApproved || 'Langsung Aktif (Approved)'}</option>
                                        <option value="pending">{u.optStatusPending || 'Menunggu Approval (Pending)'}</option>
                                        <option value="inactive">{u.optStatusInactive || 'Nonaktif (Inactive)'}</option>
                                    </select>
                                </div>

                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                <button
                                    type="button"
                                    onClick={() => setIsCreatingUser(false)}
                                    disabled={isSavingUser}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                                >
                                    {u.rejectCancel || 'Batal'}
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSavingUser}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0D5A34] hover:bg-[#094226] transition-all shadow-xs cursor-pointer disabled:opacity-50"
                                >
                                    {isSavingUser ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>{u.submittingCreateUser || 'Menyimpan Akun...'}</span>
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="w-4 h-4" />
                                            <span>{u.btnSubmitCreateUser || 'Simpan & Daftarkan Akun'}</span>
                                        </>
                                    )}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            )}

            {/* Modal Reject Reason */}
            {rejectingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
                    <div className="bg-white dark:bg-[#121824] rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 max-w-md w-full shadow-xl">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                            {u.rejectModalTitle || 'Tolak Permohonan Akun'}
                        </h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                            {(u.rejectModalDesc || 'Tolak akun {name} ({email}). Masukkan alasan penolakan (opsional):')
                                .replace('{name}', rejectingUser.name)
                                .replace('{email}', rejectingUser.email)}
                        </p>
                        <form onSubmit={handleRejectSubmit} className="space-y-4">
                            <textarea
                                rows={3}
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder={u.rejectPlaceholder || 'Contoh: Informasi akun tidak valid atau tidak memenuhi syarat.'}
                                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-[#0D5A34]"
                            />
                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setRejectingUser(null)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                                >
                                    {u.rejectCancel || 'Batal'}
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors"
                                >
                                    {isSubmitting ? (u.rejectingText || 'Menolak...') : (u.rejectConfirm || 'Konfirmasi Tolak')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
