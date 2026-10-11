'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  KeyRound,
  X,
  Mail,
  UserCheck,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAdminSession } from '@/components/admin/AdminSessionContext';

interface RoleOption {
  id: number;
  name: string;
  description?: string | null;
}

interface AdminUserItem {
  id: number;
  email: string;
  fullName: string;
  roleId: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  role: {
    id: number;
    name: string;
    description: string | null;
  };
  _count: {
    taxPayments: number;
    followUpLogs: number;
  };
}

export default function AdminUsersPage() {
  const { user: currentUser } = useAdminSession();

  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUserItem | null>(null);
  const [formFullName, setFormFullName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRoleId, setFormRoleId] = useState<number>(2); // Default to ACCOUNTANT
  const [formIsActive, setFormIsActive] = useState(true);
  const [formPassword, setFormPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchUsersAndRoles = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [usersRes, rolesRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/roles'),
      ]);

      const [usersJson, rolesJson] = await Promise.all([
        usersRes.json(),
        rolesRes.json(),
      ]);

      if (!usersRes.ok || !usersJson.success) {
        throw new Error(usersJson.error || 'ไม่สามารถโหลดข้อมูลผู้ใช้งานได้');
      }

      setUsers(usersJson.data || []);

      if (rolesRes.ok && rolesJson.success && Array.isArray(rolesJson.data)) {
        setRoles(rolesJson.data);
        if (rolesJson.data.length > 0 && !editingUser) {
          // Default to ACCOUNTANT or first non-superadmin role if possible
          const defaultRole = rolesJson.data.find((r: RoleOption) => r.name === 'ACCOUNTANT') || rolesJson.data[0];
          setFormRoleId(defaultRole.id);
        }
      }
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  }, [editingUser]);

  useEffect(() => {
    fetchUsersAndRoles();
  }, [fetchUsersAndRoles]);

  const openAddModal = () => {
    setEditingUser(null);
    setFormFullName('');
    setFormEmail('');
    setFormPassword('');
    setShowPassword(false);
    setIsChangingPassword(true);
    setFormIsActive(true);
    setFormError('');
    if (roles.length > 0) {
      const def = roles.find((r) => r.name === 'ACCOUNTANT') || roles[0];
      setFormRoleId(def.id);
    }
    setModalOpen(true);
  };

  const openEditModal = (user: AdminUserItem) => {
    setEditingUser(user);
    setFormFullName(user.fullName);
    setFormEmail(user.email);
    setFormRoleId(user.roleId);
    setFormIsActive(user.isActive);
    setFormPassword('');
    setShowPassword(false);
    setIsChangingPassword(false);
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');

    try {
      const payload: any = {
        fullName: formFullName.trim(),
        email: formEmail.trim().toLowerCase(),
        roleId: formRoleId,
        isActive: formIsActive,
      };

      if (!editingUser) {
        if (!formPassword || formPassword.length < 8) {
          throw new Error('รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร');
        }
        payload.password = formPassword;
      } else if (isChangingPassword && formPassword) {
        if (formPassword.length < 8) {
          throw new Error('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 8 ตัวอักษร');
        }
        payload.password = formPassword;
      }

      const url = editingUser ? `/api/admin/users/${editingUser.id}` : '/api/admin/users';
      const method = editingUser ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'บันทึกข้อมูลไม่สำเร็จ');
      }

      setSuccessMsg(json.message || 'บันทึกข้อมูลเรียบร้อยแล้ว');
      setTimeout(() => setSuccessMsg(''), 4000);
      setModalOpen(false);
      fetchUsersAndRoles();
    } catch (err: any) {
      setFormError(err.message || 'เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user: AdminUserItem) => {
    const isSelf = currentUser?.id === user.id;
    if (isSelf) {
      alert('ไม่อนุญาตให้ลบบัญชีที่คุณกำลังล็อกอินอยู่');
      return;
    }

    const totalOps = user._count.taxPayments + user._count.followUpLogs;
    const msg = totalOps > 0
      ? `ผู้ใช้งาน "${user.fullName}" มีประวัติบันทึกภาษีและทวงถามในระบบ ${totalOps} รายการ ระบบจะเปลี่ยนสถานะเป็น "ปิดใช้งาน" แทนการลบถาวรเพื่อรักษาประวัติงาน ต้องการดำเนินการต่อหรือไม่?`
      : `คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้งาน "${user.fullName}" (${user.email}) ออกจากระบบ?`;

    if (!window.confirm(msg)) return;

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'ลบไม่สำเร็จ');

      setSuccessMsg(json.message || 'ดำเนินการเรียบร้อยแล้ว');
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchUsersAndRoles();
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการลบผู้ใช้งาน');
    }
  };

  const getRoleBadgeStyle = (roleName: string) => {
    switch (roleName) {
      case 'SUPER_ADMIN':
        return {
          bg: '#0f172a',
          color: '#f59e0b',
          border: '1px solid #334155',
          label: 'Super Admin',
        };
      case 'ACCOUNTANT':
        return {
          bg: '#e0f2fe',
          color: '#0369a1',
          border: '1px solid #bae6fd',
          label: 'นักบัญชี / การเงิน',
        };
      case 'EDITOR':
        return {
          bg: '#f0fdf4',
          color: '#15803d',
          border: '1px solid #bbf7d0',
          label: 'บรรณาธิการบทความ',
        };
      case 'VIEWER':
      default:
        return {
          bg: '#f1f5f9',
          color: '#475569',
          border: '1px solid #e2e8f0',
          label: 'ผู้ตรวจสอบ (ดูอย่างเดียว)',
        };
    }
  };

  return (
    <div className="admin-page-stack">
      {/* Standard Page Header */}
      <header className="admin-page-header">
        <div className="admin-page-header__identity">
          <span className="admin-page-header__icon" aria-hidden="true">
            <Users size={20} />
          </span>
          <div>
            <h1>จัดการผู้ใช้งานระบบหลังบ้าน (User Management)</h1>
            <p>สร้างและจัดการบัญชีผู้ใช้งาน กำหนดบทบาทสิทธิ์ (Roles) และรีเซ็ตรหัสผ่านสำหรับทีมงาน</p>
          </div>
        </div>

        <div className="admin-page-actions">
          <button
            type="button"
            onClick={openAddModal}
            className="admin-primary-button text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มผู้ใช้งานใหม่</span>
          </button>
        </div>
      </header>

      {/* Alerts */}
      {successMsg && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 18px',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '10px',
            color: '#15803d',
            marginBottom: '20px',
            fontSize: '0.92rem',
          }}
        >
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 18px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '10px',
            color: '#dc2626',
            marginBottom: '20px',
            fontSize: '0.92rem',
          }}
        >
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Table Card */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden',
        }}
      >
        {loading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8' }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px' }} />
            <p style={{ margin: 0 }}>กำลังโหลดรายชื่อผู้ใช้งาน...</p>
          </div>
        ) : users.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
            <Users size={40} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
            <h3 style={{ margin: '0 0 8px', fontSize: '1.1rem', color: 'var(--dtv-navy-950)' }}>
              ยังไม่มีผู้ใช้งานในระบบ
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: '0.9rem' }}>
              คลิกปุ่ม &quot;เพิ่มผู้ใช้งานใหม่&quot; เพื่อเริ่มต้นสร้างบัญชีสำหรับทีมงาน
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.85rem' }}>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>ชื่อผู้ใช้งาน / อีเมล</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600 }}>บทบาท (Role)</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600 }}>สถิติงานในระบบ</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600 }}>สถานะ</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600 }}>วันที่สร้าง</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600, textAlign: 'right' }}>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {users.map((item) => {
                  const roleStyle = getRoleBadgeStyle(item.role.name);
                  const isSelf = currentUser?.id === item.id;
                  const initials = item.fullName ? item.fullName.slice(0, 2).toUpperCase() : 'US';

                  return (
                    <tr
                      key={item.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background 0.15s ease',
                      }}
                    >
                      {/* Name & Email */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              background: isSelf ? 'var(--dtv-navy-950)' : '#e2e8f0',
                              color: isSelf ? '#ffffff' : '#475569',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '0.9rem',
                              flexShrink: 0,
                            }}
                          >
                            {initials}
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--dtv-navy-950)' }}>
                                {item.fullName}
                              </span>
                              {isSelf && (
                                <span
                                  style={{
                                    fontSize: '0.72rem',
                                    background: '#e0f2fe',
                                    color: '#0284c7',
                                    padding: '1px 6px',
                                    borderRadius: '4px',
                                    fontWeight: 600,
                                  }}
                                >
                                  คุณ (บัญชีปัจจุบัน)
                                </span>
                              )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.83rem', color: '#64748b', marginTop: '2px' }}>
                              <Mail size={13} />
                              <span>{item.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td style={{ padding: '16px 16px' }}>
                        <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '2px' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              padding: '4px 10px',
                              borderRadius: '6px',
                              background: roleStyle.bg,
                              color: roleStyle.color,
                              border: roleStyle.border,
                            }}
                          >
                            <ShieldCheck size={13} />
                            {roleStyle.label}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                            {item.role.description || ''}
                          </span>
                        </div>
                      </td>

                      {/* Operations Stats */}
                      <td style={{ padding: '16px 16px', fontSize: '0.85rem', color: '#475569' }}>
                        <div>บันทึกภาษี: <strong>{item._count.taxPayments}</strong> รายการ</div>
                        <div style={{ color: '#64748b' }}>บันทึกทวงหนี้: <strong>{item._count.followUpLogs}</strong> ครั้ง</div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '16px 16px' }}>
                        {item.isActive ? (
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '4px 10px',
                              borderRadius: '20px',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              background: '#f0fdf4',
                              color: '#15803d',
                              border: '1px solid #bbf7d0',
                            }}
                          >
                            เปิดใช้งาน (Active)
                          </span>
                        ) : (
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '4px 10px',
                              borderRadius: '20px',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              background: '#fef2f2',
                              color: '#dc2626',
                              border: '1px solid #fecaca',
                            }}
                          >
                            ปิดใช้งาน (Inactive)
                          </span>
                        )}
                      </td>

                      {/* Created At */}
                      <td style={{ padding: '16px 16px', fontSize: '0.85rem', color: '#64748b' }}>
                        {new Date(item.createdAt).toLocaleDateString('th-TH', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button
                            onClick={() => openEditModal(item)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              background: '#ffffff',
                              color: 'var(--dtv-navy-950)',
                              fontSize: '0.85rem',
                              fontWeight: 500,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                            title="แก้ไขข้อมูล เปลี่ยนสิทธิ์ หรือรีเซ็ตรหัสผ่าน"
                          >
                            <Edit size={14} />
                            แก้ไข
                          </button>

                          <button
                            onClick={() => handleDelete(item)}
                            disabled={isSelf}
                            style={{
                              padding: '6px 10px',
                              borderRadius: '6px',
                              border: '1px solid #fee2e2',
                              background: isSelf ? '#f8fafc' : '#ffffff',
                              color: isSelf ? '#cbd5e1' : '#dc2626',
                              cursor: isSelf ? 'not-allowed' : 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                            title={isSelf ? 'ไม่อนุญาตให้ลบบัญชีตนเอง' : 'ลบหรือปิดใช้งานผู้ใช้งาน'}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
            backdropFilter: 'blur(3px)',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '540px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
              animation: 'adminModalIn 0.2s ease-out',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'var(--dtv-navy-950)',
                color: '#ffffff',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <UserCheck size={20} style={{ color: 'var(--dtv-gold-400)' }} />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600 }}>
                  {editingUser ? 'แก้ไขข้อมูลผู้ใช้งานระบบ' : 'เพิ่มผู้ใช้งานระบบใหม่'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} style={{ padding: '24px' }}>
              {formError && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#dc2626',
                    fontSize: '0.88rem',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <AlertCircle size={16} />
                  <span>{formError}</span>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Full Name */}
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: '6px' }}>
                    ชื่อ-นามสกุล *
                  </label>
                  <input
                    type="text"
                    required
                    value={formFullName}
                    onChange={(e) => setFormFullName(e.target.value)}
                    placeholder="เช่น คุณสมชาย บัญชี หรือ คุณวิภา ผู้จัดการ"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.92rem',
                    }}
                  />
                </div>

                {/* Email */}
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: '6px' }}>
                    อีเมลสำหรับเข้าสู่ระบบ (Login Username) *
                  </label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="เช่น somchai@deethavorn.com"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.92rem',
                    }}
                  />
                </div>

                {/* Role Dropdown */}
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: '6px' }}>
                    บทบาทและสิทธิ์การเข้าถึง (Role) *
                  </label>
                  <select
                    value={formRoleId}
                    onChange={(e) => setFormRoleId(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.92rem',
                      background: '#ffffff',
                    }}
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name === 'SUPER_ADMIN' ? 'SUPER_ADMIN — ผู้ดูแลระบบสูงสุด' :
                         r.name === 'ACCOUNTANT' ? 'ACCOUNTANT — เจ้าหน้าที่บัญชี/การเงิน' :
                         r.name === 'EDITOR' ? 'EDITOR — บรรณาธิการคลังความรู้' :
                         `${r.name} — ${r.description || ''}`}
                      </option>
                    ))}
                  </select>
                  <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                    สามารถกำหนดรายละเอียดสิทธิ์ย่อยในแต่ละโมดูลได้ที่เมนู <strong>บทบาทและสิทธิ์</strong>
                  </p>
                </div>

                {/* Password Section */}
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
                  {editingUser && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <input
                        type="checkbox"
                        id="change-pw-checkbox"
                        checked={isChangingPassword}
                        onChange={(e) => {
                          setIsChangingPassword(e.target.checked);
                          if (!e.target.checked) setFormPassword('');
                        }}
                        style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                      />
                      <label htmlFor="change-pw-checkbox" style={{ fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer' }}>
                        เปลี่ยนรหัสผ่านสำหรับผู้ใช้งานท่านนี้ (Reset Password)
                      </label>
                    </div>
                  )}

                  {(!editingUser || isChangingPassword) && (
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: '6px' }}>
                        {editingUser ? 'รหัสผ่านใหม่ (New Password) *' : 'รหัสผ่าน (Password) *'}
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required={!editingUser || isChangingPassword}
                          value={formPassword}
                          onChange={(e) => setFormPassword(e.target.value)}
                          placeholder="กำหนดรหัสผ่านอย่างน้อย 8 ตัวอักษร"
                          style={{
                            width: '100%',
                            padding: '10px 40px 10px 12px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.92rem',
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                        ความยาวอย่างน้อย 8 ตัวอักษร แนะนำให้ผสมตัวพิมพ์ใหญ่ พิมพ์เล็ก และตัวเลข
                      </p>
                    </div>
                  )}
                </div>

                {/* Is Active Status */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <input
                    type="checkbox"
                    id="user-is-active"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <label htmlFor="user-is-active" style={{ fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer' }}>
                    เปิดใช้งานบัญชี (สามารถเข้าสู่ระบบหลังบ้านได้)
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '10px',
                  marginTop: '24px',
                  paddingTop: '16px',
                  borderTop: '1px solid #f1f5f9',
                }}
              >
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    color: '#475569',
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                  }}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: '8px 22px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'var(--dtv-navy-950)',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
