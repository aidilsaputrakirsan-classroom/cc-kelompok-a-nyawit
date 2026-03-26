import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil, Trash2, Users, Search, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  isActive: boolean;
  createdAt: string;
}

const initialUsers: User[] = [
  { id: 1, name: 'Admin User', email: 'admin@company.com', role: 'admin', isActive: true, createdAt: '2024-01-01' },
  { id: 2, name: 'IT Staff', email: 'it@company.com', role: 'manager', isActive: true, createdAt: '2024-02-15' },
  { id: 3, name: 'Tech Support', email: 'tech@company.com', role: 'user', isActive: true, createdAt: '2024-03-10' },
  { id: 4, name: 'John Smith', email: 'john.smith@company.com', role: 'user', isActive: false, createdAt: '2024-06-01' },
];

const ROLE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  admin: { label: 'Admin', color: '#7C3AED', bg: '#EDE9FE' },
  manager: { label: 'Manager', color: '#2563EB', bg: '#EFF6FF' },
  user: { label: 'Pengguna', color: '#6B7280', bg: '#F3F4F6' },
};

type DialogMode = 'add' | 'edit' | null;

export function UserManagementPage() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'user' as User['role'], isActive: true });
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const { toast } = useToast();

  const filteredUsers = users.filter(u => {
    const matchSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const openAdd = () => {
    setFormData({ name: '', email: '', role: 'user', isActive: true });
    setDialogMode('add');
  };

  const openEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({ name: user.name, email: user.email, role: user.role, isActive: user.isActive });
    setDialogMode('edit');
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.email.trim()) return;

    if (dialogMode === 'add') {
      const newUser: User = {
        id: Date.now(),
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role,
        isActive: formData.isActive,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setUsers([...users, newUser]);
      toast({ title: 'Pengguna ditambahkan', description: `${newUser.name} berhasil ditambahkan.` });
    } else if (dialogMode === 'edit' && selectedUser) {
      setUsers(users.map(u =>
        u.id === selectedUser.id
          ? { ...u, name: formData.name.trim(), email: formData.email.trim(), role: formData.role, isActive: formData.isActive }
          : u
      ));
      toast({ title: 'Pengguna diperbarui', description: `${formData.name} berhasil diperbarui.` });
    }
    setDialogMode(null);
  };

  const handleToggleActive = (id: number) => {
    setUsers(users.map(u => u.id === id ? { ...u, isActive: !u.isActive } : u));
  };

  const handleDelete = (id: number) => {
    const user = users.find(u => u.id === id);
    setUsers(users.filter(u => u.id !== id));
    setDeleteConfirmId(null);
    toast({ title: 'Pengguna dihapus', description: `${user?.name} berhasil dihapus.` });
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#111827' }}>Manajemen Pengguna</h1>
          <p className="text-xs md:text-sm mt-1" style={{ color: '#6B7280' }}>
            Kelola akses pengguna yang dapat masuk ke sistem
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total Pengguna', value: users.length, color: '#2563EB', bg: '#EFF6FF' },
            { label: 'Aktif', value: users.filter(u => u.isActive).length, color: '#10B981', bg: '#ECFDF5' },
            { label: 'Tidak Aktif', value: users.filter(u => !u.isActive).length, color: '#EF4444', bg: '#FEE2E2' },
            { label: 'Admin', value: users.filter(u => u.role === 'admin').length, color: '#7C3AED', bg: '#EDE9FE' },
          ].map(stat => (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <p className="text-xs font-medium" style={{ color: '#6B7280' }}>{stat.label}</p>
                <p className="text-2xl font-bold mt-1" style={{ color: stat.color }}>{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2" style={{ color: '#111827' }}>
                <Users className="h-5 w-5" style={{ color: '#2563EB' }} />
                <span>Daftar Pengguna</span>
              </div>
              <Button size="sm" onClick={openAdd} style={{ backgroundColor: '#2563EB', color: '#FFFFFF' }}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Pengguna
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: '#6B7280' }} />
                <Input
                  placeholder="Cari nama atau email..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Semua Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Role</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="user">Pengguna</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead>Dibuat</TableHead>
                    <TableHead className="w-[80px]">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8" style={{ color: '#6B7280' }}>
                        Tidak ada pengguna yang ditemukan
                      </TableCell>
                    </TableRow>
                  ) : filteredUsers.map(user => {
                    const roleInfo = ROLE_LABELS[user.role];
                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                              style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}
                            >
                              {user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                            </div>
                            <span className="font-medium" style={{ color: '#111827' }}>{user.name}</span>
                          </div>
                        </TableCell>
                        <TableCell style={{ color: '#6B7280' }}>{user.email}</TableCell>
                        <TableCell>
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium"
                            style={{ backgroundColor: roleInfo.bg, color: roleInfo.color }}
                          >
                            <ShieldCheck className="h-3 w-3" />
                            {roleInfo.label}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={user.isActive}
                            onCheckedChange={() => handleToggleActive(user.id)}
                          />
                        </TableCell>
                        <TableCell className="text-sm" style={{ color: '#6B7280' }}>
                          {new Date(user.createdAt).toLocaleDateString('id-ID')}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => openEdit(user)}>
                              <Pencil className="h-4 w-4" style={{ color: '#6B7280' }} />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setDeleteConfirmId(user.id)}>
                              <Trash2 className="h-4 w-4" style={{ color: '#EF4444' }} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogMode !== null} onOpenChange={() => setDialogMode(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{dialogMode === 'add' ? 'Tambah Pengguna Baru' : 'Edit Pengguna'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="usr-name">Nama Lengkap <span style={{ color: '#EF4444' }}>*</span></Label>
              <Input
                id="usr-name"
                placeholder="Contoh: John Doe"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="usr-email">Email <span style={{ color: '#EF4444' }}>*</span></Label>
              <Input
                id="usr-email"
                type="email"
                placeholder="john@company.com"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="usr-role">Role</Label>
              <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v as User['role'] })}>
                <SelectTrigger id="usr-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="user">Pengguna</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="usr-active"
                checked={formData.isActive}
                onCheckedChange={v => setFormData({ ...formData, isActive: v })}
              />
              <Label htmlFor="usr-active">Pengguna Aktif</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogMode(null)}>Batal</Button>
            <Button
              onClick={handleSave}
              disabled={!formData.name.trim() || !formData.email.trim()}
              style={{ backgroundColor: '#2563EB', color: '#FFFFFF' }}
            >
              {dialogMode === 'add' ? 'Tambahkan' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={deleteConfirmId !== null} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle style={{ color: '#EF4444' }}>Hapus Pengguna?</DialogTitle>
          </DialogHeader>
          <p className="text-sm" style={{ color: '#6B7280' }}>
            Pengguna <strong style={{ color: '#111827' }}>{users.find(u => u.id === deleteConfirmId)?.name}</strong> akan dihapus secara permanen.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>Batal</Button>
            <Button
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              style={{ backgroundColor: '#EF4444', color: '#FFFFFF' }}
            >
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster />
    </>
  );
}
