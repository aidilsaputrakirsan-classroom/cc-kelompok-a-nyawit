import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Users, Search, ShieldCheck, Package, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { API_BASE_URL } from '@/lib/api';

interface Asset {
  id: number;
  asset_code: string;
  name: string;
  type: string;
  location: string;
  status: string;
  created_at: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'user';
  is_active: boolean;
  created_at: string;
  asset_count?: number;
}

interface UserWithAssets extends User {
  created_assets: Asset[];
  asset_count: number;
}

const ROLE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  admin: { label: 'Admin', color: '#7C3AED', bg: '#EDE9FE' },
  user: { label: 'User', color: '#6B7280', bg: '#F3F4F6' },
};

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  'In Use': { label: 'In Use', color: '#2563EB', bg: '#EFF6FF' },
  'Available': { label: 'Available', color: '#10B981', bg: '#ECFDF5' },
  'Under Maintenance': { label: 'Maintenance', color: '#F59E0B', bg: '#FEF3C7' },
  'Retired': { label: 'Retired', color: '#EF4444', bg: '#FEE2E2' },
};

type DialogMode = 'add' | 'edit' | 'view' | null;

// Helper to get auth token
function getAuthToken(): string | null {
  const session = localStorage.getItem('asset-manager-session');
  if (!session) return null;
  try {
    const parsed = JSON.parse(session);
    return parsed.access_token || null;
  } catch {
    return null;
  }
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    const apiError = new Error(error.detail || `HTTP ${response.status}: ${response.statusText}`) as Error & { status?: number };
    apiError.status = response.status;
    throw apiError;
  }

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }

  return response.text();
}

export function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDetail, setUserDetail] = useState<UserWithAssets | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    password: '',
    is_active: true
  });
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth('/users');
      setUsers(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal memuat data pengguna',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetail = async (userId: number) => {
    try {
      const data = await fetchWithAuth(`/users/${userId}`);
      setUserDetail(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal memuat detail pengguna',
        variant: 'destructive'
      });
    }
  };

  const filteredUsers = users.filter(u => {
    const matchSearch =
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.full_name && u.full_name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchSearch;
  });

  const openAdd = () => {
    setFormData({ username: '', email: '', full_name: '', password: '', is_active: true });
    setDialogMode('add');
  };

  const openEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      full_name: user.full_name || '',
      password: '',
      is_active: user.is_active
    });
    setDialogMode('edit');
  };

  const openView = async (user: User) => {
    setSelectedUser(user);
    setDialogMode('view');
    await fetchUserDetail(user.id);
  };

  const handleSave = async () => {
    if (!formData.username.trim() || !formData.email.trim()) return;

    try {
      if (dialogMode === 'add') {
        if (!formData.password.trim()) {
          toast({ title: 'Error', description: 'Password wajib diisi', variant: 'destructive' });
          return;
        }
        await fetchWithAuth('/users', {
          method: 'POST',
          body: JSON.stringify({
            username: formData.username.trim(),
            email: formData.email.trim(),
            full_name: formData.full_name.trim() || null,
            password: formData.password,
            role: 'admin',
            is_active: formData.is_active
          })
        });
        toast({ title: 'Pengguna ditambahkan', description: `${formData.username} berhasil ditambahkan.` });
      } else if (dialogMode === 'edit' && selectedUser) {
        const updateData: Record<string, unknown> = {
          email: formData.email.trim(),
          full_name: formData.full_name.trim() || null,
          is_active: formData.is_active
        };
        if (formData.password.trim()) {
          updateData.password = formData.password;
        }
        await fetchWithAuth(`/users/${selectedUser.id}`, {
          method: 'PUT',
          body: JSON.stringify(updateData)
        });
        toast({ title: 'Pengguna diperbarui', description: `${formData.username} berhasil diperbarui.` });
      }
      setDialogMode(null);
      fetchUsers();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (isDeleting) return;
    const user = users.find(u => u.id === id);
    try {
      setIsDeleting(true);
      await fetchWithAuth(`/users/${id}`, { method: 'DELETE' });
      setDeleteConfirmId(null);
      toast({ title: 'Pengguna dihapus', description: `${user?.username} berhasil dihapus.` });
      fetchUsers();
    } catch (error) {
      const status = (error as { status?: number })?.status;
      const message = error instanceof Error ? error.message : 'Gagal menghapus pengguna';

      if (status === 404 && message.toLowerCase().includes('user not found')) {
        setDeleteConfirmId(null);
        toast({
          title: 'Pengguna sudah terhapus',
          description: 'Data pengguna sudah tidak ada di server. Daftar akan disegarkan.',
        });
        fetchUsers();
        return;
      }

      toast({
        title: 'Error',
        description: message,
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#111827' }}>Manajemen Pengguna</h1>
          <p className="text-xs md:text-sm mt-1" style={{ color: '#6B7280' }}>
            Kelola pengguna admin dan lihat asset yang ditambahkan oleh masing-masing pengguna
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total Pengguna', value: users.length, color: '#2563EB', bg: '#EFF6FF' },
            { label: 'Aktif', value: users.filter(u => u.is_active).length, color: '#10B981', bg: '#ECFDF5' },
            { label: 'Tidak Aktif', value: users.filter(u => !u.is_active).length, color: '#EF4444', bg: '#FEE2E2' },
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
                Tambah Admin
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: '#6B7280' }} />
                <Input
                  placeholder="Cari username, nama, atau email..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Nama Lengkap</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="w-[120px]">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8" style={{ color: '#6B7280' }}>
                        Memuat data...
                      </TableCell>
                    </TableRow>
                  ) : filteredUsers.length === 0 ? (
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
                              {user.username.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="font-medium" style={{ color: '#111827' }}>{user.username}</span>
                          </div>
                        </TableCell>
                        <TableCell style={{ color: '#6B7280' }}>{user.email}</TableCell>
                        <TableCell style={{ color: '#6B7280' }}>{user.full_name || '-'}</TableCell>
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
                          <Badge variant={user.is_active ? 'default' : 'secondary'}>
                            {user.is_active ? 'Aktif' : 'Nonaktif'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => openView(user)} title="Lihat Detail & Asset">
                              <Eye className="h-4 w-4" style={{ color: '#2563EB' }} />
                            </Button>
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
      <Dialog open={dialogMode === 'add' || dialogMode === 'edit'} onOpenChange={() => setDialogMode(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{dialogMode === 'add' ? 'Tambah Admin Baru' : 'Edit Pengguna'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="usr-username">Username <span style={{ color: '#EF4444' }}>*</span></Label>
              <Input
                id="usr-username"
                placeholder="Contoh: johndoe"
                value={formData.username}
                onChange={e => setFormData({ ...formData, username: e.target.value })}
                disabled={dialogMode === 'edit'}
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
              <Label htmlFor="usr-fullname">Nama Lengkap</Label>
              <Input
                id="usr-fullname"
                placeholder="Contoh: John Doe"
                value={formData.full_name}
                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="usr-password">
                Password {dialogMode === 'add' && <span style={{ color: '#EF4444' }}>*</span>}
                {dialogMode === 'edit' && <span className="text-xs text-gray-500">(Kosongkan jika tidak ingin mengubah)</span>}
              </Label>
              <Input
                id="usr-password"
                type="password"
                placeholder={dialogMode === 'add' ? 'Minimal 6 karakter' : '••••••••'}
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="usr-active"
                checked={formData.is_active}
                onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                aria-label="Pengguna Aktif"
              />
              <Label htmlFor="usr-active">Pengguna Aktif</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogMode(null)}>Batal</Button>
            <Button
              onClick={handleSave}
              disabled={!formData.username.trim() || !formData.email.trim() || (dialogMode === 'add' && !formData.password.trim())}
              style={{ backgroundColor: '#2563EB', color: '#FFFFFF' }}
            >
              {dialogMode === 'add' ? 'Tambahkan' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View User Detail Dialog */}
      <Dialog open={dialogMode === 'view'} onOpenChange={() => setDialogMode(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Pengguna & Asset</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-lg" style={{ backgroundColor: '#F9FAFB' }}>
                <div>
                  <p className="text-xs text-gray-500">Username</p>
                  <p className="font-medium">{selectedUser.username}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Nama Lengkap</p>
                  <p className="font-medium">{selectedUser.full_name || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Role</p>
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium"
                    style={{ backgroundColor: ROLE_LABELS[selectedUser.role].bg, color: ROLE_LABELS[selectedUser.role].color }}
                  >
                    <ShieldCheck className="h-3 w-3" />
                    {ROLE_LABELS[selectedUser.role].label}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <Badge variant={selectedUser.is_active ? 'default' : 'secondary'}>
                    {selectedUser.is_active ? 'Aktif' : 'Nonaktif'}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Bergabung</p>
                  <p className="font-medium">{new Date(selectedUser.created_at).toLocaleDateString('id-ID')}</p>
                </div>
              </div>

              {/* Assets Created */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Package className="h-5 w-5" style={{ color: '#2563EB' }} />
                  <h3 className="font-semibold">Asset yang Ditambahkan</h3>
                  <Badge variant="secondary">
                    {userDetail?.asset_count || 0} Asset
                  </Badge>
                </div>

                {userDetail?.created_assets && userDetail.created_assets.length > 0 ? (
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Kode Asset</TableHead>
                          <TableHead>Nama</TableHead>
                          <TableHead>Tipe</TableHead>
                          <TableHead>Lokasi</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Tanggal</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {userDetail.created_assets.map(asset => {
                          const statusInfo = STATUS_LABELS[asset.status] || { label: asset.status, color: '#6B7280', bg: '#F3F4F6' };
                          return (
                            <TableRow key={asset.id}>
                              <TableCell className="font-medium">{asset.asset_code}</TableCell>
                              <TableCell>{asset.name}</TableCell>
                              <TableCell>{asset.type}</TableCell>
                              <TableCell>{asset.location}</TableCell>
                              <TableCell>
                                <span
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                                  style={{ backgroundColor: statusInfo.bg, color: statusInfo.color }}
                                >
                                  {statusInfo.label}
                                </span>
                              </TableCell>
                              <TableCell className="text-sm text-gray-500">
                                {new Date(asset.created_at).toLocaleDateString('id-ID')}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 rounded-lg" style={{ backgroundColor: '#F9FAFB' }}>
                    <Package className="h-12 w-12 mx-auto mb-2" style={{ color: '#D1D5DB' }} />
                    <p className="text-sm" style={{ color: '#6B7280' }}>
                      {userDetail === null ? 'Memuat data asset...' : 'Pengguna ini belum menambahkan asset'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setDialogMode(null)}>Tutup</Button>
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
            Pengguna <strong style={{ color: '#111827' }}>{users.find(u => u.id === deleteConfirmId)?.username}</strong> akan dihapus secara permanen.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>Batal</Button>
            <Button
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              disabled={isDeleting}
              style={{ backgroundColor: '#EF4444', color: '#FFFFFF' }}
            >
              {isDeleting ? 'Menghapus...' : 'Hapus'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster />
    </>
  );
}
