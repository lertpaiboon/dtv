'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  ShieldCheck,
  Save,
  CheckCircle2,
  Users,
  Lock,
  Eye,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
} from 'lucide-react';

interface RoleItem {
  id: number;
  name: string;
  description?: string;
  permissions: string[];
  _count: {
    users: number;
  };
}

interface ModuleDef {
  key: string;
  name: string;
  description: string;
  actions: { code: string; label: string; icon: any }[];
}

const MODULES: ModuleDef[] = [
  {
    key: 'pnd51',
    name: 'ทะเบียน ภ.ง.ด. 51',
    description: 'บันทึกและจัดการภาษีเงินได้นิติบุคคลครึ่งปี แยกตามบัตรเครดิต',
    actions: [
      { code: 'pnd51:view', label: 'ดูข้อมูล (View)', icon: Eye },
      { code: 'pnd51:create', label: 'เพิ่มรายการ (Create)', icon: Plus },
      { code: 'pnd51:edit', label: 'แก้ไข (Edit)', icon: Edit },
      { code: 'pnd51:delete', label: 'ลบรายการ (Delete)', icon: Trash2 },
    ],
  },
  {
    key: 'wht',
    name: 'ภาษีหัก ณ ที่จ่าย (ภ.ง.ด. 1/3/53)',
    description: 'บันทึกรายการภาษีหัก ณ ที่จ่ายประจำเดือน',
    actions: [
      { code: 'wht:view', label: 'ดูข้อมูล (View)', icon: Eye },
      { code: 'wht:create', label: 'เพิ่มรายการ (Create)', icon: Plus },
      { code: 'wht:edit', label: 'แก้ไข (Edit)', icon: Edit },
      { code: 'wht:delete', label: 'ลบรายการ (Delete)', icon: Trash2 },
    ],
  },
  {
    key: 'vat',
    name: 'ภาษีมูลค่าเพิ่ม (ภ.พ. 30)',
    description: 'บันทึกรายการภาษีซื้อ-ภาษีขาย ประจำเดือน',
    actions: [
      { code: 'vat:view', label: 'ดูข้อมูล (View)', icon: Eye },
      { code: 'vat:create', label: 'เพิ่มรายการ (Create)', icon: Plus },
      { code: 'vat:edit', label: 'แก้ไข (Edit)', icon: Edit },
      { code: 'vat:delete', label: 'ลบรายการ (Delete)', icon: Trash2 },
    ],
  },
  {
    key: 'companies',
    name: 'ทะเบียนบริษัทลูกค้า',
    description: 'จัดการรายชื่อบริษัท, หลายผู้ติดต่อ และนำเข้าไฟล์ Excel',
    actions: [
      { code: 'companies:view', label: 'ดูข้อมูล (View)', icon: Eye },
      { code: 'companies:create', label: 'เพิ่มบริษัท (Create)', icon: Plus },
      { code: 'companies:edit', label: 'แก้ไขบริษัท (Edit)', icon: Edit },
      { code: 'companies:delete', label: 'ลบบริษัท (Delete)', icon: Trash2 },
    ],
  },
  {
    key: 'followup',
    name: 'บันทึกการทวงถามยอดค้างชำระ',
    description: 'บันทึกประวัติการโทรศัพท์, ส่ง LINE และผลการเจรจา',
    actions: [
      { code: 'followup:view', label: 'ดูข้อมูล (View)', icon: Eye },
      { code: 'followup:create', label: 'เพิ่มบันทึก (Create)', icon: Plus },
      { code: 'followup:edit', label: 'แก้ไขบันทึก (Edit)', icon: Edit },
      { code: 'followup:delete', label: 'ลบบันทึก (Delete)', icon: Trash2 },
    ],
  },
];

export default function RolesPage() {
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [currentPermissions, setCurrentPermissions] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const loadRoles = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const res = await fetch('/api/admin/roles');
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'ไม่สามารถโหลดข้อมูลสิทธิ์ได้');
      const roleList: RoleItem[] = data.data || [];
      setRoles(roleList);

      if (roleList.length > 0 && !selectedRoleId) {
        // default select accountant or first role
        const defaultRole = roleList.find((r) => r.name === 'ACCOUNTANT') || roleList[0];
        setSelectedRoleId(defaultRole.id);
        setCurrentPermissions(
          Array.isArray(defaultRole.permissions) ? (defaultRole.permissions as string[]) : []
        );
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
      setLoadError(err instanceof Error ? err.message : 'ไม่สามารถโหลดข้อมูลสิทธิ์ได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const savedPermissions = useMemo(() => {
    const selectedRole = roles.find((role) => role.id === selectedRoleId);
    return Array.isArray(selectedRole?.permissions) ? selectedRole.permissions as string[] : [];
  }, [roles, selectedRoleId]);
  const isDirty = [...currentPermissions].sort().join('|') !== [...savedPermissions].sort().join('|');

  useEffect(() => {
    const warnUnsaved = (event: BeforeUnloadEvent) => {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warnUnsaved);
    return () => window.removeEventListener('beforeunload', warnUnsaved);
  }, [isDirty]);

  const handleSelectRole = (role: RoleItem) => {
    if (role.id !== selectedRoleId && isDirty && !confirm('ยังไม่ได้บันทึกการเปลี่ยนแปลงสิทธิ์ ต้องการเปลี่ยนบทบาทและทิ้งการแก้ไขหรือไม่?')) return;
    setSelectedRoleId(role.id);
    setCurrentPermissions(
      Array.isArray(role.permissions) ? (role.permissions as string[]) : []
    );
    setSaveSuccess(false);
  };

  const isSuperAdmin = roles.find((r) => r.id === selectedRoleId)?.name === 'SUPER_ADMIN';

  const handleTogglePermission = (code: string) => {
    if (isSuperAdmin) return; // Super admin has * always

    setCurrentPermissions((prev) => {
      if (prev.includes(code)) {
        return prev.filter((p) => p !== code);
      } else {
        return [...prev, code];
      }
    });
  };

  const handleToggleAllInModule = (moduleKey: string) => {
    if (isSuperAdmin) return;
    const targetModule = MODULES.find((m) => m.key === moduleKey);
    if (!targetModule) return;

    const moduleCodes = targetModule.actions.map((a) => a.code);
    const hasAll = moduleCodes.every((c) => currentPermissions.includes(c));

    if (hasAll) {
      // Uncheck all
      setCurrentPermissions((prev) => prev.filter((c) => !moduleCodes.includes(c)));
    } else {
      // Check all
      setCurrentPermissions((prev) => Array.from(new Set([...prev, ...moduleCodes])));
    }
  };

  const handleSavePermissions = async () => {
    if (!selectedRoleId) return;
    setSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/admin/roles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleId: selectedRoleId,
          permissions: currentPermissions,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || 'ไม่สามารถบันทึกสิทธิ์ได้');
        setSaving(false);
        return;
      }

      setSaveSuccess(true);
      // Update local roles state
      setRoles((prev) =>
        prev.map((r) => (r.id === selectedRoleId ? { ...r, permissions: currentPermissions } : r))
      );
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-page-stack">
      {/* Header */}
      <header className="admin-page-header">
        <div className="admin-page-header__identity">
            <div className="admin-page-header__icon" aria-hidden="true">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h1>บทบาทและสิทธิ์การใช้งาน</h1>
              <p>
                กำหนดสิทธิ์ดู เพิ่ม แก้ไข และลบข้อมูลให้แต่ละบทบาท
              </p>
            </div>
        </div>

        {saveSuccess && (
          <div className="admin-save-indicator" role="status" aria-live="polite">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>บันทึกการตั้งค่าสิทธิ์เรียบร้อยแล้ว</span>
          </div>
        )}
      </header>

      {loadError && <div className="admin-inline-state admin-inline-state--error" role="alert">
        <AlertCircle aria-hidden="true" size={24} />
        <strong>โหลดข้อมูลสิทธิ์ไม่สำเร็จ</strong>
        <span>{loadError}</span>
        <button type="button" className="admin-secondary-button" onClick={() => void loadRoles()}>ลองใหม่</button>
      </div>}

      {/* Role Selection Tabs */}
      {!loading && !loadError && <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 admin-role-selector">
        {roles.map((r) => {
          const isSelected = selectedRoleId === r.id;
          return (
            <button
              key={r.id}
              onClick={() => handleSelectRole(r)}
              className={`p-4 rounded-2xl border text-left transition-all relative cursor-pointer ${
                isSelected
                  ? 'bg-[#eaf5f8] border-[#1B2A80] shadow-md shadow-[#1B2A80]/10'
                  : 'bg-white border-[#e2e8f0] hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-bold tracking-wide ${isSelected ? 'text-[#1B2A80]' : 'text-[#102a56]'}`}>
                  {r.name === 'SUPER_ADMIN'
                    ? 'ผู้ดูแลระบบสูงสุด'
                    : r.name === 'ACCOUNTANT'
                    ? 'เจ้าหน้าที่บัญชีและการเงิน'
                    : 'ผู้ตรวจสอบ / Viewer'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-semibold bg-white border border-[#cbd5e1] text-[#5e6b7a]">
                  {r.name}
                </span>
              </div>
              <p className="text-xs text-[#5e6b7a] line-clamp-2">{r.description || 'สิทธิ์การใช้งานระบบ'}</p>
              <div className="mt-3 pt-2.5 border-t border-[#e2e8f0] flex items-center justify-between text-[11px] text-[#5e6b7a]">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-[#1689bd]" />
                  <span>{r._count.users} ผู้ใช้งาน</span>
                </span>
                {r.name === 'SUPER_ADMIN' && (
                  <span className="text-[#1B2A80] font-semibold flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>ทุกสิทธิ์ (*)</span>
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>}

      {/* Interactive RBAC Matrix Table */}
      {!loading && !loadError && <div className="admin-permission-panel">
        <div className="p-5 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-[#102a56] flex items-center gap-2">
              <span>ตารางกำหนดสิทธิ์สำหรับ:</span>
              <span className="text-[#1B2A80] font-mono">
                {roles.find((r) => r.id === selectedRoleId)?.name}
              </span>
            </h2>
            <p className="text-xs text-[#5e6b7a] mt-0.5">
              {isSuperAdmin
                ? 'บทบาท SUPER_ADMIN มีสิทธิ์เข้าถึงและจัดการได้ทุกระบบโดยอัตโนมัติ'
                : 'ทำเครื่องหมายในช่องสิทธิ์ที่ต้องการอนุญาตให้บทบาทนี้ดำเนินการ'}
            </p>
          </div>

          {!isSuperAdmin && (
            <button
              type="button"
              onClick={handleSavePermissions}
              disabled={saving || !isDirty}
              className="admin-primary-button text-xs"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลงสิทธิ์'}</span>
            </button>
          )}
        </div>

        <div className="divide-y divide-slate-100">
          {MODULES.map((mod) => {
            const moduleCodes = mod.actions.map((a) => a.code);
            const allChecked =
              isSuperAdmin || moduleCodes.every((c) => currentPermissions.includes(c));

            return (
              <div key={mod.key} className="p-5 hover:bg-slate-50/50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{mod.name}</div>
                    <div className="text-xs text-slate-500">{mod.description}</div>
                  </div>

                  {!isSuperAdmin && (
                    <button
                      type="button"
                      onClick={() => handleToggleAllInModule(mod.key)}
                      className="text-[11px] text-[#1B2A80] hover:text-[#146fa8] font-semibold self-start sm:self-auto cursor-pointer"
                    >
                      {allChecked ? 'ยกเลิกทั้งหมดในหมวดนี้' : 'เลือกทั้งหมดในหมวดนี้'}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                  {mod.actions.map((act) => {
                    const isChecked = isSuperAdmin || currentPermissions.includes(act.code);
                    const Icon = act.icon;

                    return (
                      <label
                        key={act.code}
                        className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                          isChecked
                            ? 'bg-[#eff6ff] border-[#bfdbfe] text-[#1B2A80] font-semibold shadow-xs'
                            : 'bg-slate-50/70 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        } ${isSuperAdmin ? 'cursor-not-allowed opacity-90' : ''}`}
                      >
                        <input
                          type="checkbox"
                          disabled={isSuperAdmin}
                          checked={isChecked}
                          onChange={() => handleTogglePermission(act.code)}
                          className="w-4 h-4 rounded text-[#1B2A80] focus:ring-[#1B2A80]/20 border-slate-300 accent-[#1B2A80]"
                        />
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-xs">{act.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>}
    </div>
  );
}
