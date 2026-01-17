'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { apiClient } from '@/lib/api';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, Calendar, MapPin, Users, DollarSign, Edit, Trash2, Eye, 
  CheckCircle2, XCircle, Copy, Search, Filter, Download, BarChart3,
  TrendingUp, FileText, CopyCheck
} from 'lucide-react';

export default function WorkshopsPage() {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const { success, error: showError, info } = useToast();
  const router = useRouter();
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [allWorkshops, setAllWorkshops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [editingWorkshop, setEditingWorkshop] = useState<any>(null);
  const [deletingWorkshop, setDeletingWorkshop] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    locationName: '',
    city: '',
    province: '',
    address: '',
    capacity: '',
    price: '',
    status: 'DRAFT'
  });
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.userType !== 'MITRA')) {
      router.push('/login');
    } else if (isAuthenticated && user?.userType === 'MITRA') {
      loadWorkshops();
    }
  }, [isAuthenticated, authLoading, user, router]);

  const loadWorkshops = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getMitraWorkshops();
      if (response.success && response.data) {
        const workshopsData = Array.isArray(response.data) ? response.data : [];
        setAllWorkshops(workshopsData);
        setWorkshops(workshopsData);
      }
    } catch (err) {
      console.error('Failed to load workshops:', err);
      showError('Failed to load workshops');
    } finally {
      setLoading(false);
    }
  };

  // Filter workshops based on search and status
  const filteredWorkshops = useMemo(() => {
    let filtered = [...allWorkshops];

    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(w => w.status === statusFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(w => 
        w.title?.toLowerCase().includes(query) ||
        w.description?.toLowerCase().includes(query) ||
        w.city?.toLowerCase().includes(query) ||
        w.location_name?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [allWorkshops, searchQuery, statusFilter]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const total = allWorkshops.length;
    const published = allWorkshops.filter(w => w.status === 'PUBLISHED').length;
    const draft = allWorkshops.filter(w => w.status === 'DRAFT').length;
    const completed = allWorkshops.filter(w => w.status === 'COMPLETED').length;
    const cancelled = allWorkshops.filter(w => w.status === 'CANCELLED').length;
    const totalRegistrations = allWorkshops.reduce((sum, w) => sum + (w.registered_count || 0), 0);
    const totalCapacity = allWorkshops.reduce((sum, w) => sum + (w.capacity || 0), 0);
    const totalRevenue = allWorkshops.reduce((sum, w) => {
      const price = parseFloat(w.price) || 0;
      const registrations = w.registered_count || 0;
      return sum + (price * registrations);
    }, 0);

    return {
      total,
      published,
      draft,
      completed,
      cancelled,
      totalRegistrations,
      totalCapacity,
      totalRevenue,
      occupancyRate: totalCapacity > 0 ? (totalRegistrations / totalCapacity) * 100 : 0
    };
  }, [allWorkshops]);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
      locationName: '',
      city: '',
      province: '',
      address: '',
      capacity: '',
      price: '',
      status: 'DRAFT'
    });
    setEditingWorkshop(null);
  };

  const handleDuplicate = (workshop: any) => {
    // Copy workshop data but reset dates and status
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    setFormData({
      title: `${workshop.title} (Copy)`,
      description: workshop.description || '',
      startDate: tomorrowStr,
      endDate: '',
      startTime: workshop.start_time ? (typeof workshop.start_time === 'string' ? workshop.start_time.substring(0, 5) : '') : '',
      endTime: workshop.end_time ? (typeof workshop.end_time === 'string' ? workshop.end_time.substring(0, 5) : '') : '',
      locationName: workshop.location_name || '',
      city: workshop.city || '',
      province: workshop.province || '',
      address: workshop.address || '',
      capacity: workshop.capacity?.toString() || '',
      price: workshop.price ? parseFloat(workshop.price).toString() : '0',
      status: 'DRAFT'
    });
    setEditingWorkshop(null);
    setShowCreateForm(true);
    info('Workshop data copied. Please review and adjust dates before creating.');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endDate = formData.endDate || formData.startDate;
      
      const response = await apiClient.createWorkshop({
        title: formData.title,
        description: formData.description,
        startDate: formData.startDate,
        endDate: endDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        locationName: formData.locationName,
        city: formData.city,
        province: formData.province || undefined,
        address: formData.address || undefined,
        capacity: parseInt(formData.capacity),
        price: parseFloat(formData.price) || 0,
      });

      if (response.success) {
        success('Workshop created successfully!');
        setShowCreateForm(false);
        resetForm();
        loadWorkshops();
      } else {
        showError(response.message || 'Failed to create workshop');
      }
    } catch (err) {
      console.error('Failed to create workshop:', err);
      showError('Failed to create workshop');
    }
  };

  const handleEdit = (workshop: any) => {
    setEditingWorkshop(workshop);
    setFormData({
      title: workshop.title || '',
      description: workshop.description || '',
      startDate: workshop.start_date ? new Date(workshop.start_date).toISOString().split('T')[0] : '',
      endDate: workshop.end_date ? new Date(workshop.end_date).toISOString().split('T')[0] : '',
      startTime: workshop.start_time ? (typeof workshop.start_time === 'string' ? workshop.start_time.substring(0, 5) : '') : '',
      endTime: workshop.end_time ? (typeof workshop.end_time === 'string' ? workshop.end_time.substring(0, 5) : '') : '',
      locationName: workshop.location_name || '',
      city: workshop.city || '',
      province: workshop.province || '',
      address: workshop.address || '',
      capacity: workshop.capacity?.toString() || '',
      price: workshop.price ? parseFloat(workshop.price).toString() : '0',
      status: workshop.status || 'DRAFT'
    });
    setShowCreateForm(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWorkshop) return;

    try {
      const endDate = formData.endDate || formData.startDate;
      
      const response = await apiClient.updateWorkshop(editingWorkshop.workshop_id, {
        title: formData.title,
        description: formData.description,
        startDate: formData.startDate,
        endDate: endDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        locationName: formData.locationName,
        city: formData.city,
        province: formData.province || undefined,
        address: formData.address || undefined,
        capacity: parseInt(formData.capacity),
        price: parseFloat(formData.price) || 0,
        status: formData.status
      });

      if (response.success) {
        success('Workshop updated successfully!');
        setShowCreateForm(false);
        resetForm();
        loadWorkshops();
      } else {
        showError(response.message || 'Failed to update workshop');
      }
    } catch (err) {
      console.error('Failed to update workshop:', err);
      showError('Failed to update workshop');
    }
  };

  const handleDelete = async () => {
    if (!deletingWorkshop) return;

    try {
      const response = await apiClient.deleteWorkshop(deletingWorkshop.workshop_id);

      if (response.success) {
        success('Workshop deleted successfully!');
        setDeletingWorkshop(null);
        loadWorkshops();
      } else {
        showError(response.message || 'Failed to delete workshop');
      }
    } catch (err) {
      console.error('Failed to delete workshop:', err);
      showError('Failed to delete workshop');
    }
  };

  const handleStatusChange = async (workshopId: string, newStatus: string) => {
    try {
      const response = await apiClient.updateWorkshop(workshopId, { status: newStatus });

      if (response.success) {
        success(`Workshop status updated to ${newStatus}`);
        loadWorkshops();
      } else {
        showError(response.message || 'Failed to update status');
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      showError('Failed to update status');
    }
  };

  const exportToCSV = () => {
    const headers = ['Title', 'Status', 'Start Date', 'Location', 'City', 'Capacity', 'Registered', 'Price', 'Revenue'];
    const rows = allWorkshops.map((workshop) => {
      const price = parseFloat(workshop.price) || 0;
      const registered = workshop.registered_count || 0;
      const revenue = price * registered;
      return [
        workshop.title,
        workshop.status,
        formatDate(workshop.start_date),
        workshop.location_name,
        workshop.city,
        workshop.capacity,
        registered,
        `Rp ${price.toLocaleString('id-ID')}`,
        `Rp ${revenue.toLocaleString('id-ID')}`
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map((row: any[]) => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `workshops-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('Workshop data exported successfully!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
      case 'PUBLISHED':
        return isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800';
      case 'FULL':
        return isDark ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-800';
      case 'DRAFT':
        return isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-800';
      case 'CANCELLED':
        return isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return isDark ? 'bg-[#0EB0F9]/30 text-[#3BC0FF]' : 'bg-[#0EB0F9]/10 text-[#0878B3]';
      default:
        return isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    if (timeString.includes('T')) {
      return new Date(timeString).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return timeString.substring(0, 5);
  };

  if (authLoading || loading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
            isDark ? 'border-primary' : 'border-primary'
          }`}></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className={`text-3xl font-bold ${isDark ? 'text-foreground' : 'text-foreground'}`}>
              Workshops
            </h1>
            <p className={`text-sm mt-1 ${isDark ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
              Manage your training workshops and events
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowStats(!showStats)}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Statistics
            </Button>
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => {
              resetForm();
              setShowCreateForm(!showCreateForm);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              {showCreateForm ? 'Cancel' : 'Create Workshop'}
            </Button>
          </div>
        </div>

        {/* Statistics Dashboard */}
        {showStats && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Workshop Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                <div className="text-center">
                  <p className={`text-2xl font-bold ${isDark ? 'text-foreground' : 'text-foreground'}`}>
                    {statistics.total}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                    Total
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{statistics.published}</p>
                  <p className={`text-xs ${isDark ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                    Published
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-600">{statistics.draft}</p>
                  <p className={`text-xs ${isDark ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                    Draft
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#0EB0F9]">{statistics.completed}</p>
                  <p className={`text-xs ${isDark ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                    Completed
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{statistics.cancelled}</p>
                  <p className={`text-xs ${isDark ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                    Cancelled
                  </p>
                </div>
                <div className="text-center">
                  <p className={`text-2xl font-bold ${isDark ? 'text-foreground' : 'text-foreground'}`}>
                    {statistics.totalRegistrations}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                    Registrations
                  </p>
                </div>
                <div className="text-center">
                  <p className={`text-2xl font-bold ${isDark ? 'text-foreground' : 'text-foreground'}`}>
                    {statistics.occupancyRate.toFixed(1)}%
                  </p>
                  <p className={`text-xs ${isDark ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                    Occupancy
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    Rp {statistics.totalRevenue.toLocaleString('id-ID')}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                    Revenue
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search and Filter */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-muted-foreground' : 'text-muted-foreground'}`} />
                <Input
                  type="text"
                  placeholder="Search workshops by title, description, location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {filteredWorkshops.length !== allWorkshops.length && (
              <p className={`text-sm mt-2 ${isDark ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                Showing {filteredWorkshops.length} of {allWorkshops.length} workshops
              </p>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Form */}
        {showCreateForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{editingWorkshop ? 'Edit Workshop' : 'Create New Workshop'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={editingWorkshop ? handleUpdate : handleCreate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Title *</Label>
                    <Input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Workshop title"
                    />
                  </div>
                  <div>
                    <Label>Location Name *</Label>
                    <Input
                      type="text"
                      required
                      value={formData.locationName}
                      onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                      placeholder="Venue name"
                    />
                  </div>
                </div>

                <div>
                  <Label>Description *</Label>
                  <Textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Workshop description"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>City *</Label>
                    <Input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <Label>Province</Label>
                    <Input
                      type="text"
                      value={formData.province}
                      onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                      placeholder="Province (optional)"
                    />
                  </div>
                </div>

                <div>
                  <Label>Address</Label>
                  <Textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Full address (optional)"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label>Start Date *</Label>
                    <Input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      min={formData.startDate}
                    />
                  </div>
                  <div>
                    <Label>Start Time *</Label>
                    <Input
                      type="time"
                      required
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>End Time *</Label>
                    <Input
                      type="time"
                      required
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Capacity *</Label>
                    <Input
                      type="number"
                      required
                      min="1"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                      placeholder="Maximum participants"
                    />
                  </div>
                  <div>
                    <Label>Price (Rp)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0 for free"
                    />
                  </div>
                  {editingWorkshop && (
                    <div>
                      <Label>Status</Label>
                      <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DRAFT">Draft</SelectItem>
                          <SelectItem value="PUBLISHED">Published</SelectItem>
                          <SelectItem value="CANCELLED">Cancelled</SelectItem>
                          <SelectItem value="COMPLETED">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingWorkshop ? 'Update Workshop' : 'Create Workshop'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreateForm(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Workshops Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className={`animate-spin rounded-full h-12 w-12 border-b-2 mx-auto ${
              isDark ? 'border-primary' : 'border-primary'
            }`}></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkshops.length === 0 ? (
              <div className="col-span-full">
                <Card>
                  <CardContent className="flex flex-col items-center justify-center min-h-[400px] py-12">
                    <Calendar className={`w-16 h-16 mb-4 ${isDark ? 'text-muted-foreground' : 'text-muted-foreground'}`} />
                    <p className={`text-lg font-medium mb-2 ${isDark ? 'text-foreground' : 'text-foreground'}`}>
                      {searchQuery || statusFilter !== 'ALL' ? 'No workshops found' : 'No workshops yet'}
                    </p>
                    <p className={`text-sm ${isDark ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                      {searchQuery || statusFilter !== 'ALL' 
                        ? 'Try adjusting your search or filters'
                        : 'Create your first workshop to get started!'}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              filteredWorkshops.map((workshop) => (
                <Card key={workshop.workshop_id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg line-clamp-2">{workshop.title}</CardTitle>
                      <span className={`px-2 py-1 text-xs rounded whitespace-nowrap ${getStatusColor(workshop.status)}`}>
                        {workshop.status}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <p className={`text-sm mb-4 line-clamp-3 ${isDark ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                      {workshop.description}
                    </p>
                    
                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className={`w-4 h-4 ${isDark ? 'text-muted-foreground' : 'text-muted-foreground'}`} />
                        <span className={isDark ? 'text-muted-foreground' : 'text-muted-foreground'}>
                          {formatDate(workshop.start_date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={isDark ? 'text-muted-foreground' : 'text-muted-foreground'}>
                          {formatTime(workshop.start_time)} - {formatTime(workshop.end_time)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className={`w-4 h-4 ${isDark ? 'text-muted-foreground' : 'text-muted-foreground'}`} />
                        <span className={isDark ? 'text-muted-foreground' : 'text-muted-foreground'}>
                          {workshop.location_name}, {workshop.city}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className={`w-4 h-4 ${isDark ? 'text-muted-foreground' : 'text-muted-foreground'}`} />
                        <span className={isDark ? 'text-muted-foreground' : 'text-muted-foreground'}>
                          {workshop.registered_count || 0} / {workshop.capacity} participants
                        </span>
                      </div>
                      {workshop.price > 0 && (
                        <div className="flex items-center gap-2">
                          <DollarSign className={`w-4 h-4 ${isDark ? 'text-muted-foreground' : 'text-muted-foreground'}`} />
                          <span className={isDark ? 'text-muted-foreground' : 'text-muted-foreground'}>
                            Rp {parseFloat(workshop.price).toLocaleString('id-ID')}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 mt-auto">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          asChild
                        >
                          <Link href={`/mitra/workshops/${workshop.workshop_id}/attendance`}>
                            <Eye className="w-4 h-4 mr-2" />
                            Attendance
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDuplicate(workshop)}
                          title="Duplicate workshop"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(workshop)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeletingWorkshop(workshop)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      {workshop.status === 'DRAFT' && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleStatusChange(workshop.workshop_id, 'PUBLISHED')}
                          className="w-full"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Publish Workshop
                        </Button>
                      )}
                      {workshop.status === 'PUBLISHED' && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(workshop.workshop_id, 'CANCELLED')}
                            className="flex-1 text-destructive"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(workshop.workshop_id, 'COMPLETED')}
                            className="flex-1"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Complete
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingWorkshop} onOpenChange={(open) => !open && setDeletingWorkshop(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Workshop</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingWorkshop?.title}"? This action cannot be undone.
              All registrations and attendance data will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
