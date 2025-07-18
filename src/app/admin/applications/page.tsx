'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/use-auth';
import { useLanguage } from '../../../hooks/use-language';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../components/ui/dialog';
import { Badge } from '../../../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../../components/ui/alert-dialog';
import { Textarea } from '../../../components/ui/textarea';
import { useToast } from '../../../hooks/use-toast';
import {
  FileText,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Filter,
  Clock,
  Calendar,
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Mail,
  Phone,
  Download,
  Send,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Application {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  form: string;
  documents: string[];
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: number;
  reviewerName?: string;
  notes?: string;
}

export default function ApplicationsManagement() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const router = useRouter();

  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<
    Application[]
  >([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [formFilter, setFormFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingApplication, setEditingApplication] =
    useState<Application | null>(null);
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewingApplication, setReviewingApplication] =
    useState<Application | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    form: '',
    documents: [] as string[],
    notes: '',
  });

  // Review form state
  type ApplicationStatus = 'pending' | 'reviewed' | 'accepted' | 'rejected';
  const [reviewData, setReviewData] = useState<{
    status: ApplicationStatus;
    notes: string;
  }>({
    status: 'pending',
    notes: '',
  });

  // Mock data - replace with API calls
  const mockApplications: Application[] = [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+237612345678',
      form: 'form1',
      documents: ['birth_certificate.pdf', 'previous_report.pdf'],
      status: 'pending',
      submittedAt: '2024-01-15T10:30:00Z',
    },
    {
      id: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phone: '+237612345679',
      form: 'form2',
      documents: ['birth_certificate.pdf', 'transfer_letter.pdf'],
      status: 'reviewed',
      submittedAt: '2024-01-10T14:20:00Z',
      reviewedAt: '2024-01-12T09:15:00Z',
      reviewedBy: 1,
      reviewerName: 'Admin User',
      notes: 'Documents verified. Good academic record.',
    },
    {
      id: 3,
      firstName: 'Michael',
      lastName: 'Johnson',
      email: 'michael.johnson@example.com',
      phone: '+237612345680',
      form: 'form1',
      documents: ['birth_certificate.pdf', 'medical_certificate.pdf'],
      status: 'accepted',
      submittedAt: '2024-01-05T11:45:00Z',
      reviewedAt: '2024-01-08T16:30:00Z',
      reviewedBy: 1,
      reviewerName: 'Admin User',
      notes: 'All requirements met. Application approved.',
    },
    {
      id: 4,
      firstName: 'Sarah',
      lastName: 'Wilson',
      email: 'sarah.wilson@example.com',
      phone: '+237612345681',
      form: 'form3',
      documents: ['birth_certificate.pdf'],
      status: 'rejected',
      submittedAt: '2024-01-20T08:15:00Z',
      reviewedAt: '2024-01-22T13:45:00Z',
      reviewedBy: 1,
      reviewerName: 'Admin User',
      notes: 'Incomplete documentation. Missing required certificates.',
    },
    {
      id: 5,
      firstName: 'David',
      lastName: 'Brown',
      email: 'david.brown@example.com',
      phone: '+237612345682',
      form: 'form2',
      documents: [
        'birth_certificate.pdf',
        'previous_report.pdf',
        'character_reference.pdf',
      ],
      status: 'pending',
      submittedAt: '2024-01-25T15:30:00Z',
    },
  ];

  const formOptions = [
    { value: 'form1', label: 'Form 1' },
    { value: 'form2', label: 'Form 2' },
    { value: 'form3', label: 'Form 3' },
    { value: 'form4', label: 'Form 4' },
    { value: 'form5', label: 'Form 5' },
  ];

  const statusOptions = [
    {
      value: 'pending',
      label: 'Pending',
      color: 'bg-yellow-100 text-yellow-800',
    },
    {
      value: 'reviewed',
      label: 'Reviewed',
      color: 'bg-blue-100 text-blue-800',
    },
    {
      value: 'accepted',
      label: 'Accepted',
      color: 'bg-green-100 text-green-800',
    },
    { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' },
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setApplications(mockApplications);
      setFilteredApplications(mockApplications);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = applications;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        app =>
          app.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          `${app.firstName} ${app.lastName}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    // Apply form filter
    if (formFilter !== 'all') {
      filtered = filtered.filter(app => app.form === formFilter);
    }

    setFilteredApplications(filtered);
  }, [applications, searchTerm, statusFilter, formFilter]);

  const handleCreateApplication = async () => {
    try {
      // Simulate API call
      const newApplication: Application = {
        id: applications.length + 1,
        ...formData,
        status: 'pending',
        submittedAt: new Date().toISOString(),
      };

      setApplications([...applications, newApplication]);
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: 'Success',
        description: 'Application created successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create application',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateApplication = async () => {
    if (!editingApplication) return;

    try {
      // Simulate API call
      const updatedApplications = applications.map(app =>
        app.id === editingApplication.id ? { ...app, ...formData } : app
      );
      setApplications(updatedApplications);
      setIsDialogOpen(false);
      setEditingApplication(null);
      resetForm();
      toast({
        title: 'Success',
        description: 'Application updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update application',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteApplication = async (applicationId: number) => {
    try {
      // Simulate API call
      setApplications(applications.filter(app => app.id !== applicationId));
      toast({
        title: 'Success',
        description: 'Application deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete application',
        variant: 'destructive',
      });
    }
  };

  const handleReviewApplication = async () => {
    if (!reviewingApplication) return;

    try {
      // Simulate API call
      const updatedApplications = applications.map(app =>
        app.id === reviewingApplication.id
          ? {
              ...app,
              status: reviewData.status,
              reviewedAt: new Date().toISOString(),
              reviewedBy: user?.id || 1,
              reviewerName: user?.fullName || 'Admin User',
              notes: reviewData.notes,
            }
          : app
      );
      setApplications(updatedApplications);
      setReviewDialogOpen(false);
      setReviewingApplication(null);
      setReviewData({ status: 'pending', notes: '' });
      toast({
        title: 'Success',
        description: 'Application reviewed successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to review application',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      form: '',
      documents: [],
      notes: '',
    });
  };

  const openEditDialog = (application: Application) => {
    setEditingApplication(application);
    setFormData({
      firstName: application.firstName,
      lastName: application.lastName,
      email: application.email,
      phone: application.phone,
      form: application.form,
      documents: application.documents,
      notes: application.notes || '',
    });
    setIsDialogOpen(true);
  };

  const openReviewDialog = (application: Application) => {
    setReviewingApplication(application);
    setReviewData({
      status: application.status,
      notes: application.notes || '',
    });
    setReviewDialogOpen(true);
  };

  const getStatusBadgeColor = (status: string) => {
    const statusOption = statusOptions.find(option => option.value === status);
    return statusOption?.color || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'reviewed':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/admin')}
                className="mr-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <FileText className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Applications Management
                </h1>
                <p className="text-sm text-gray-600">
                  Manage student applications and admissions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <FileText className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Applications
                    </p>
                    <p className="text-2xl font-bold">{applications.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <Clock className="w-8 h-8 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold">
                      {applications.filter(a => a.status === 'pending').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Accepted
                    </p>
                    <p className="text-2xl font-bold">
                      {applications.filter(a => a.status === 'accepted').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-8 h-8 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      This Month
                    </p>
                    <p className="text-2xl font-bold">
                      {
                        applications.filter(a => {
                          const submitted = new Date(a.submittedAt);
                          const now = new Date();
                          return (
                            submitted.getMonth() === now.getMonth() &&
                            submitted.getFullYear() === now.getFullYear()
                          );
                        }).length
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Actions */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search applications..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      {statusOptions.map(status => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={formFilter} onValueChange={setFormFilter}>
                    <SelectTrigger className="w-full sm:w-32">
                      <SelectValue placeholder="Form" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Forms</SelectItem>
                      {formOptions.map(form => (
                        <SelectItem key={form.value} value={form.value}>
                          {form.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      onClick={() => {
                        setEditingApplication(null);
                        resetForm();
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Application
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>
                        {editingApplication
                          ? 'Edit Application'
                          : 'Add New Application'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingApplication
                          ? 'Update application information'
                          : 'Create a new application record'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            value={formData.firstName}
                            onChange={e =>
                              setFormData({
                                ...formData,
                                firstName: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            value={formData.lastName}
                            onChange={e =>
                              setFormData({
                                ...formData,
                                lastName: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={e =>
                              setFormData({
                                ...formData,
                                email: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={e =>
                              setFormData({
                                ...formData,
                                phone: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="form">Form Level</Label>
                        <Select
                          value={formData.form}
                          onValueChange={value =>
                            setFormData({ ...formData, form: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select form level" />
                          </SelectTrigger>
                          <SelectContent>
                            {formOptions.map(form => (
                              <SelectItem key={form.value} value={form.value}>
                                {form.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                          id="notes"
                          value={formData.notes}
                          onChange={e =>
                            setFormData({ ...formData, notes: e.target.value })
                          }
                          placeholder="Additional notes about the application"
                          rows={3}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={
                          editingApplication
                            ? handleUpdateApplication
                            : handleCreateApplication
                        }
                      >
                        {editingApplication ? 'Update' : 'Create'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Applications Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                Applications ({filteredApplications.length})
              </CardTitle>
              <CardDescription>
                Manage student applications and admissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Applicant</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Form</TableHead>
                        <TableHead>Documents</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApplications.map(application => (
                        <TableRow key={application.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {application.firstName} {application.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {application.id}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center text-sm">
                                <Mail className="w-3 h-3 mr-1" />
                                {application.email}
                              </div>
                              <div className="flex items-center text-sm text-gray-500">
                                <Phone className="w-3 h-3 mr-1" />
                                {application.phone}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {application.form.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {application.documents.length} document(s)
                            </div>
                            <div className="text-xs text-gray-500">
                              {application.documents.slice(0, 2).join(', ')}
                              {application.documents.length > 2 && '...'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={getStatusBadgeColor(
                                application.status
                              )}
                            >
                              <div className="flex items-center space-x-1">
                                {getStatusIcon(application.status)}
                                <span>{application.status}</span>
                              </div>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-500">
                              {new Date(
                                application.submittedAt
                              ).toLocaleDateString()}
                            </div>
                            {application.reviewedAt && (
                              <div className="text-xs text-gray-400">
                                Reviewed:{' '}
                                {new Date(
                                  application.reviewedAt
                                ).toLocaleDateString()}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setSelectedApplication(application)
                                }
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditDialog(application)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openReviewDialog(application)}
                              >
                                <Send className="w-4 h-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Delete Application
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete the
                                      application for {application.firstName}{' '}
                                      {application.lastName}? This action cannot
                                      be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleDeleteApplication(application.id)
                                      }
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Application Details Dialog */}
      <Dialog
        open={!!selectedApplication}
        onOpenChange={() => setSelectedApplication(null)}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              Detailed view of the selected application
            </DialogDescription>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    First Name
                  </Label>
                  <p className="text-sm">{selectedApplication.firstName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Last Name
                  </Label>
                  <p className="text-sm">{selectedApplication.lastName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Email
                  </Label>
                  <p className="text-sm">{selectedApplication.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Phone
                  </Label>
                  <p className="text-sm">{selectedApplication.phone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Form Level
                  </Label>
                  <Badge variant="outline">
                    {selectedApplication.form.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Status
                  </Label>
                  <Badge
                    className={getStatusBadgeColor(selectedApplication.status)}
                  >
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(selectedApplication.status)}
                      <span>{selectedApplication.status}</span>
                    </div>
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500">
                  Documents
                </Label>
                <div className="mt-2 space-y-2">
                  {selectedApplication.documents.map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <span className="text-sm">{doc}</span>
                      <Button variant="ghost" size="sm">
                        <Download className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {selectedApplication.notes && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Notes
                  </Label>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm">{selectedApplication.notes}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Submitted
                  </Label>
                  <p className="text-sm">
                    {new Date(selectedApplication.submittedAt).toLocaleString()}
                  </p>
                </div>
                {selectedApplication.reviewedAt && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Reviewed
                    </Label>
                    <p className="text-sm">
                      {new Date(
                        selectedApplication.reviewedAt
                      ).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              {selectedApplication.reviewerName && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Reviewed By
                  </Label>
                  <p className="text-sm">{selectedApplication.reviewerName}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedApplication(null)}
            >
              Close
            </Button>
            {selectedApplication && (
              <Button
                onClick={() => {
                  setSelectedApplication(null);
                  openReviewDialog(selectedApplication);
                }}
              >
                Review Application
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Review Application</DialogTitle>
            <DialogDescription>
              Update the status and add notes for this application
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reviewStatus">Status</Label>
              <Select
                value={reviewData.status}
                onValueChange={(value: any) =>
                  setReviewData({ ...reviewData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reviewNotes">Notes</Label>
              <Textarea
                id="reviewNotes"
                value={reviewData.notes}
                onChange={e =>
                  setReviewData({ ...reviewData, notes: e.target.value })
                }
                placeholder="Add review notes..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReviewDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleReviewApplication}>Update Review</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
