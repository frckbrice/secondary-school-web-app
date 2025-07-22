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
import { useToast } from '../../../hooks/use-toast';
import {
  UserCheck,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Filter,
  BookOpen,
  Users,
  Mail,
  Phone,
  Calendar,
  ArrowLeft,
  MapPin,
  GraduationCap,
  Award,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Teacher {
  id: number;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  teacherSubject: string;
  qualification: string;
  experience: number;
  specialization: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function TeachersManagement() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const router = useRouter();

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    phone: '',
    teacherSubject: '',
    qualification: '',
    experience: 0,
    specialization: '',
    password: '',
  });

  // Mock data - replace with API calls
  const mockTeachers: Teacher[] = [
    {
      id: 1,
      username: 'teacher1',
      fullName: 'John Doe',
      email: 'john.doe@gbhsXYZ.com',
      phone: '+237612345680',
      teacherSubject: 'Mathematics',
      qualification: 'MSc Mathematics',
      experience: 8,
      specialization: 'Advanced Calculus',
      isActive: true,
      createdAt: '2024-02-01',
      updatedAt: '2024-02-01',
    },
    {
      id: 2,
      username: 'teacher2',
      fullName: 'Jane Smith',
      email: 'jane.smith@gbhsXYZ.com',
      phone: '+237612345681',
      teacherSubject: 'Physics',
      qualification: 'PhD Physics',
      experience: 12,
      specialization: 'Quantum Mechanics',
      isActive: true,
      createdAt: '2024-02-05',
      updatedAt: '2024-02-05',
    },
    {
      id: 3,
      username: 'teacher3',
      fullName: 'Michael Johnson',
      email: 'michael.johnson@gbhsXYZ.com',
      phone: '+237612345682',
      teacherSubject: 'Chemistry',
      qualification: 'MSc Chemistry',
      experience: 6,
      specialization: 'Organic Chemistry',
      isActive: true,
      createdAt: '2024-02-10',
      updatedAt: '2024-02-10',
    },
    {
      id: 4,
      username: 'teacher4',
      fullName: 'Sarah Wilson',
      email: 'sarah.wilson@gbhsXYZ.com',
      phone: '+237612345683',
      teacherSubject: 'English',
      qualification: 'MA English Literature',
      experience: 10,
      specialization: 'Shakespeare Studies',
      isActive: false,
      createdAt: '2024-02-15',
      updatedAt: '2024-02-15',
    },
    {
      id: 5,
      username: 'teacher5',
      fullName: 'David Brown',
      email: 'david.brown@gbhsXYZ.com',
      phone: '+237612345684',
      teacherSubject: 'Biology',
      qualification: 'MSc Biology',
      experience: 7,
      specialization: 'Molecular Biology',
      isActive: true,
      createdAt: '2024-02-20',
      updatedAt: '2024-02-20',
    },
  ];

  const subjectOptions = [
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'English',
    'French',
    'History',
    'Geography',
    'Computer Science',
    'Economics',
    'Literature',
    'Physical Education',
    'Art',
    'Music',
  ];

  const qualificationOptions = [
    'BSc',
    'BA',
    'MSc',
    'MA',
    'PhD',
    'PGCE',
    'BEd',
    'MEd',
    'Diploma',
    'Certificate',
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setTeachers(mockTeachers);
      setFilteredTeachers(mockTeachers);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = teachers;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        teacher =>
          teacher.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          teacher.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          teacher.teacherSubject
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Apply subject filter
    if (subjectFilter !== 'all') {
      filtered = filtered.filter(
        teacher => teacher.teacherSubject === subjectFilter
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active';
      filtered = filtered.filter(teacher => teacher.isActive === isActive);
    }

    setFilteredTeachers(filtered);
  }, [teachers, searchTerm, subjectFilter, statusFilter]);

  const handleCreateTeacher = async () => {
    try {
      // Simulate API call
      const newTeacher: Teacher = {
        id: teachers.length + 1,
        ...formData,
        isActive: true,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      };

      setTeachers([...teachers, newTeacher]);
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: 'Success',
        description: 'Teacher created successfully',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create teacher',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateTeacher = async () => {
    if (!editingTeacher) return;

    try {
      // Simulate API call
      const updatedTeachers = teachers.map(teacher =>
        teacher.id === editingTeacher.id
          ? {
              ...teacher,
              ...formData,
              updatedAt: new Date().toISOString().split('T')[0],
            }
          : teacher
      );
      setTeachers(updatedTeachers);
      setIsDialogOpen(false);
      setEditingTeacher(null);
      resetForm();
      toast({
        title: 'Success',
        description: 'Teacher updated successfully',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update teacher',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteTeacher = async (teacherId: number) => {
    try {
      // Simulate API call
      setTeachers(teachers.filter(teacher => teacher.id !== teacherId));
      toast({
        title: 'Success',
        description: 'Teacher deleted successfully',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete teacher',
        variant: 'destructive',
      });
    }
  };

  const handleToggleStatus = async (teacherId: number) => {
    try {
      const updatedTeachers = teachers.map(teacher =>
        teacher.id === teacherId
          ? {
              ...teacher,
              isActive: !teacher.isActive,
              updatedAt: new Date().toISOString().split('T')[0],
            }
          : teacher
      );
      setTeachers(updatedTeachers);
      toast({
        title: 'Success',
        description: 'Teacher status updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update teacher status',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      fullName: '',
      email: '',
      phone: '',
      teacherSubject: '',
      qualification: '',
      experience: 0,
      specialization: '',
      password: '',
    });
  };

  const openEditDialog = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      username: teacher.username,
      fullName: teacher.fullName,
      email: teacher.email,
      phone: teacher.phone,
      teacherSubject: teacher.teacherSubject,
      qualification: teacher.qualification,
      experience: teacher.experience,
      specialization: teacher.specialization,
      password: '',
    });
    setIsDialogOpen(true);
  };

  const getStatusBadgeColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getExperienceBadgeColor = (experience: number) => {
    if (experience >= 10) return 'bg-purple-100 text-purple-800';
    if (experience >= 5) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
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
              <UserCheck className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Teachers Management
                </h1>
                <p className="text-sm text-gray-600">
                  Manage teacher records and assignments
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
                  <UserCheck className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Teachers
                    </p>
                    <p className="text-2xl font-bold">{teachers.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <Users className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Active Teachers
                    </p>
                    <p className="text-2xl font-bold">
                      {teachers.filter(t => t.isActive).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <BookOpen className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Subjects
                    </p>
                    <p className="text-2xl font-bold">
                      {new Set(teachers.map(t => t.teacherSubject)).size}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <Award className="w-8 h-8 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Avg Experience
                    </p>
                    <p className="text-2xl font-bold">
                      {teachers.length > 0
                        ? Math.round(
                            teachers.reduce((sum, t) => sum + t.experience, 0) /
                              teachers.length
                          )
                        : 0}{' '}
                      years
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
                      placeholder="Search teachers..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select
                    value={subjectFilter}
                    onValueChange={setSubjectFilter}
                  >
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subjects</SelectItem>
                      {subjectOptions.map(subject => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      onClick={() => {
                        setEditingTeacher(null);
                        resetForm();
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Teacher
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingTeacher
                          ? 'Update teacher information'
                          : 'Create a new teacher record'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="username">Username</Label>
                          <Input
                            id="username"
                            value={formData.username}
                            onChange={e =>
                              setFormData({
                                ...formData,
                                username: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Full Name</Label>
                          <Input
                            id="fullName"
                            value={formData.fullName}
                            onChange={e =>
                              setFormData({
                                ...formData,
                                fullName: e.target.value,
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
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="teacherSubject">Subject</Label>
                          <Select
                            value={formData.teacherSubject}
                            onValueChange={value =>
                              setFormData({
                                ...formData,
                                teacherSubject: value,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select subject" />
                            </SelectTrigger>
                            <SelectContent>
                              {subjectOptions.map(subject => (
                                <SelectItem key={subject} value={subject}>
                                  {subject}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="qualification">Qualification</Label>
                          <Select
                            value={formData.qualification}
                            onValueChange={value =>
                              setFormData({ ...formData, qualification: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select qualification" />
                            </SelectTrigger>
                            <SelectContent>
                              {qualificationOptions.map(qual => (
                                <SelectItem key={qual} value={qual}>
                                  {qual}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="experience">
                            Years of Experience
                          </Label>
                          <Input
                            id="experience"
                            type="number"
                            min="0"
                            value={formData.experience}
                            onChange={e =>
                              setFormData({
                                ...formData,
                                experience: parseInt(e.target.value) || 0,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="specialization">Specialization</Label>
                          <Input
                            id="specialization"
                            value={formData.specialization}
                            onChange={e =>
                              setFormData({
                                ...formData,
                                specialization: e.target.value,
                              })
                            }
                            placeholder="e.g., Advanced Calculus"
                          />
                        </div>
                      </div>
                      {!editingTeacher && (
                        <div className="space-y-2">
                          <Label htmlFor="password">Password</Label>
                          <Input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={e =>
                              setFormData({
                                ...formData,
                                password: e.target.value,
                              })
                            }
                          />
                        </div>
                      )}
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
                          editingTeacher
                            ? handleUpdateTeacher
                            : handleCreateTeacher
                        }
                      >
                        {editingTeacher ? 'Update' : 'Create'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Teachers Table */}
          <Card>
            <CardHeader>
              <CardTitle>Teachers ({filteredTeachers.length})</CardTitle>
              <CardDescription>
                Manage teacher records and assignments
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
                        <TableHead>Teacher</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Subject & Qualification</TableHead>
                        <TableHead>Experience</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTeachers.map(teacher => (
                        <TableRow key={teacher.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {teacher.fullName}
                              </div>
                              <div className="text-sm text-gray-500">
                                @{teacher.username}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center text-sm">
                                <Mail className="w-3 h-3 mr-1" />
                                {teacher.email}
                              </div>
                              {teacher.phone && (
                                <div className="flex items-center text-sm text-gray-500">
                                  <Phone className="w-3 h-3 mr-1" />
                                  {teacher.phone}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <Badge variant="outline">
                                {teacher.teacherSubject}
                              </Badge>
                              <div className="text-sm text-gray-500">
                                {teacher.qualification}
                              </div>
                              {teacher.specialization && (
                                <div className="text-xs text-gray-400">
                                  {teacher.specialization}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={getExperienceBadgeColor(
                                teacher.experience
                              )}
                            >
                              {teacher.experience} years
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={getStatusBadgeColor(teacher.isActive)}
                            >
                              {teacher.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-500">
                              {new Date(teacher.createdAt).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedTeacher(teacher)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditDialog(teacher)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleStatus(teacher.id)}
                              >
                                {teacher.isActive ? 'Deactivate' : 'Activate'}
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
                                      Delete Teacher
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete{' '}
                                      {teacher.fullName}? This action cannot be
                                      undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleDeleteTeacher(teacher.id)
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

      {/* Teacher Details Dialog */}
      <Dialog
        open={!!selectedTeacher}
        onOpenChange={() => setSelectedTeacher(null)}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Teacher Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected teacher
            </DialogDescription>
          </DialogHeader>
          {selectedTeacher && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Username
                  </Label>
                  <p className="text-sm font-medium">
                    @{selectedTeacher.username}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Full Name
                  </Label>
                  <p className="text-sm">{selectedTeacher.fullName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Email
                  </Label>
                  <p className="text-sm">{selectedTeacher.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Phone
                  </Label>
                  <p className="text-sm">
                    {selectedTeacher.phone || 'Not provided'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Subject
                  </Label>
                  <Badge variant="outline">
                    {selectedTeacher.teacherSubject}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Status
                  </Label>
                  <Badge
                    className={getStatusBadgeColor(selectedTeacher.isActive)}
                  >
                    {selectedTeacher.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Professional Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Qualification
                    </Label>
                    <p className="text-sm">{selectedTeacher.qualification}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Experience
                    </Label>
                    <Badge
                      className={getExperienceBadgeColor(
                        selectedTeacher.experience
                      )}
                    >
                      {selectedTeacher.experience} years
                    </Badge>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-sm font-medium text-gray-500">
                      Specialization
                    </Label>
                    <p className="text-sm">
                      {selectedTeacher.specialization || 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Created
                    </Label>
                    <p className="text-sm">
                      {new Date(selectedTeacher.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Last Updated
                    </Label>
                    <p className="text-sm">
                      {new Date(selectedTeacher.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedTeacher(null)}>
              Close
            </Button>
            {selectedTeacher && (
              <Button
                onClick={() => {
                  setSelectedTeacher(null);
                  openEditDialog(selectedTeacher);
                }}
              >
                Edit Teacher
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
