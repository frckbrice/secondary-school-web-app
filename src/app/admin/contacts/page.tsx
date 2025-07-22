'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/use-auth';
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
  MessageSquare,
  Plus,
  Search,
  Trash2,
  Eye,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Send,
  Reply,
  Star,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  category:
    | 'general'
    | 'admission'
    | 'academic'
    | 'technical'
    | 'complaint'
    | 'suggestion';
  status: 'new' | 'in_progress' | 'responded' | 'resolved' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  submittedAt: string;
  respondedAt?: string;
  response?: string;
  respondedBy?: number;
  responderName?: string;
  isRead: boolean;
  isStarred: boolean;
}

// Mock data - replace with API calls
const mockContacts: Contact[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+237612345678',
    subject: 'Admission Inquiry for Form 1',
    message:
      'I would like to inquire about the admission process for Form 1 for the upcoming academic year. What documents are required and what are the deadlines?',
    category: 'admission',
    status: 'new',
    priority: 'high',
    submittedAt: '2024-01-15T10:30:00Z',
    isRead: false,
    isStarred: true,
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '+237612345679',
    subject: 'Academic Performance Concern',
    message:
      "I am concerned about my child's academic performance in Mathematics. Could you please provide information about available tutoring services?",
    category: 'academic',
    status: 'in_progress',
    priority: 'medium',
    submittedAt: '2024-01-10T14:20:00Z',
    isRead: true,
    isStarred: false,
  },
  {
    id: 3,
    name: 'Michael Johnson',
    email: 'michael.johnson@example.com',
    phone: '+237612345680',
    subject: 'Technical Issue with Student Portal',
    message:
      'I am unable to access the student portal. The login page keeps showing an error message. Please help resolve this issue.',
    category: 'technical',
    status: 'responded',
    priority: 'urgent',
    submittedAt: '2024-01-05T11:45:00Z',
    respondedAt: '2024-01-06T09:15:00Z',
    response:
      'Thank you for reporting this issue. Our technical team has been notified and is working on a fix. Please try clearing your browser cache and cookies.',
    respondedBy: 1,
    responderName: 'Admin User',
    isRead: true,
    isStarred: false,
  },
  {
    id: 4,
    name: 'Sarah Wilson',
    email: 'sarah.wilson@example.com',
    phone: '+237612345681',
    subject: 'Suggestion for Library Hours',
    message:
      'I would like to suggest extending the library hours during exam periods to allow students more study time.',
    category: 'suggestion',
    status: 'resolved',
    priority: 'low',
    submittedAt: '2024-01-20T08:15:00Z',
    respondedAt: '2024-01-22T13:45:00Z',
    response:
      'Thank you for your suggestion. We have implemented extended library hours during exam periods as requested.',
    respondedBy: 1,
    responderName: 'Admin User',
    isRead: true,
    isStarred: false,
  },
  {
    id: 5,
    name: 'David Brown',
    email: 'david.brown@example.com',
    phone: '+237612345682',
    subject: 'General Information Request',
    message:
      "Could you please provide information about the school's extracurricular activities and sports programs?",
    category: 'general',
    status: 'new',
    priority: 'medium',
    submittedAt: '2024-01-25T15:30:00Z',
    isRead: false,
    isStarred: false,
  },
];

const statusOptions = [
  { value: 'new', label: 'New', color: 'bg-blue-100 text-blue-800' },
  {
    value: 'in_progress',
    label: 'In Progress',
    color: 'bg-yellow-100 text-yellow-800',
  },
  {
    value: 'responded',
    label: 'Responded',
    color: 'bg-green-100 text-green-800',
  },
  {
    value: 'resolved',
    label: 'Resolved',
    color: 'bg-purple-100 text-purple-800',
  },
  {
    value: 'archived',
    label: 'Archived',
    color: 'bg-gray-100 text-gray-800',
  },
];

const categoryOptions = [
  { value: 'general', label: 'General' },
  { value: 'admission', label: 'Admission' },
  { value: 'academic', label: 'Academic' },
  { value: 'technical', label: 'Technical' },
  { value: 'complaint', label: 'Complaint' },
  { value: 'suggestion', label: 'Suggestion' },
];

const priorityOptions = [
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
  { value: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' },
];

export default function ContactsManagement() {
  const { user } = useAuth();

  const { toast } = useToast();
  const router = useRouter();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const [respondingContact, setRespondingContact] = useState<Contact | null>(
    null
  );

  // Form state
  type ContactCategory =
    | 'general'
    | 'admission'
    | 'academic'
    | 'technical'
    | 'complaint'
    | 'suggestion';
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
    category: ContactCategory;
    priority: 'low' | 'medium' | 'high' | 'urgent';
  }>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    category: 'general',
    priority: 'medium',
  });

  // Response form state
  const [responseData, setResponseData] = useState<{
    response: string;
    status: 'new' | 'in_progress' | 'responded' | 'resolved' | 'archived';
  }>({
    response: '',
    status: 'responded',
  });

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setContacts(mockContacts);
      setFilteredContacts(mockContacts);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = contacts;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        contact =>
          contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contact.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contact.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(contact => contact.status === statusFilter);
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(
        contact => contact.category === categoryFilter
      );
    }

    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(
        contact => contact.priority === priorityFilter
      );
    }

    setFilteredContacts(filtered);
  }, [contacts, searchTerm, statusFilter, categoryFilter, priorityFilter]);

  const handleCreateContact = async () => {
    try {
      // Simulate API call
      const newContact: Contact = {
        id: contacts.length + 1,
        ...formData,
        status: 'new',
        submittedAt: new Date().toISOString(),
        isRead: false,
        isStarred: false,
      };

      setContacts([...contacts, newContact]);
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: 'Success',
        description: 'Contact message created successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create contact message',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateContact = async () => {
    if (!editingContact) return;

    try {
      // Simulate API call
      const updatedContacts = contacts.map(contact =>
        contact.id === editingContact.id ? { ...contact, ...formData } : contact
      );
      setContacts(updatedContacts);
      setIsDialogOpen(false);
      setEditingContact(null);
      resetForm();
      toast({
        title: 'Success',
        description: 'Contact message updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update contact message',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteContact = async (contactId: number) => {
    try {
      // Simulate API call
      const updatedContacts = contacts.filter(
        contact => contact.id !== contactId
      );
      setContacts(updatedContacts);
      toast({
        title: 'Success',
        description: 'Contact message deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete contact message',
        variant: 'destructive',
      });
    }
  };

  const handleRespondToContact = async () => {
    if (!respondingContact) return;

    try {
      // Simulate API call
      const updatedContacts = contacts.map(contact =>
        contact.id === respondingContact.id
          ? {
              ...contact,
              status: responseData.status,
              response: responseData.response,
              respondedAt: new Date().toISOString(),
              respondedBy: typeof user?.id === 'number' ? user.id : undefined,
              responderName: user?.username,
            }
          : contact
      );
      setContacts(updatedContacts);
      setResponseDialogOpen(false);
      setRespondingContact(null);
      setResponseData({ response: '', status: 'responded' });
      toast({
        title: 'Success',
        description: 'Response sent successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send response',
        variant: 'destructive',
      });
    }
  };

  const handleToggleStatus = async (
    contactId: number,
    newStatus: Contact['status']
  ) => {
    try {
      // Simulate API call
      const updatedContacts = contacts.map(contact =>
        contact.id === contactId ? { ...contact, status: newStatus } : contact
      );
      setContacts(updatedContacts);
      toast({
        title: 'Success',
        description: 'Contact status updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update contact status',
        variant: 'destructive',
      });
    }
  };

  const handleToggleStar = async (contactId: number) => {
    try {
      // Simulate API call
      const updatedContacts = contacts.map(contact =>
        contact.id === contactId
          ? { ...contact, isStarred: !contact.isStarred }
          : contact
      );
      setContacts(updatedContacts);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to toggle star',
        variant: 'destructive',
      });
    }
  };

  const handleMarkAsRead = async (contactId: number) => {
    try {
      // Simulate API call
      const updatedContacts = contacts.map(contact =>
        contact.id === contactId ? { ...contact, isRead: true } : contact
      );
      setContacts(updatedContacts);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark as read',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
      category: 'general',
      priority: 'medium',
    });
  };

  const openEditDialog = (contact: Contact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      subject: contact.subject,
      message: contact.message,
      category: contact.category,
      priority: contact.priority,
    });
    setIsDialogOpen(true);
  };

  const openResponseDialog = (contact: Contact) => {
    setRespondingContact(contact);
    setResponseData({
      response: contact.response || '',
      status: contact.status === 'new' ? 'in_progress' : contact.status,
    });
    setResponseDialogOpen(true);
  };

  const getStatusBadgeColor = (status: string) => {
    const statusOption = statusOptions.find(option => option.value === status);
    return statusOption?.color || 'bg-gray-100 text-gray-800';
  };

  const getPriorityBadgeColor = (priority: string) => {
    const priorityOption = priorityOptions.find(
      option => option.value === priority
    );
    return priorityOption?.color || 'bg-gray-100 text-gray-800';
  };

  const getCategoryBadgeColor = (category: string) => {
    const colors = {
      general: 'bg-blue-100 text-blue-800',
      admission: 'bg-green-100 text-green-800',
      academic: 'bg-purple-100 text-purple-800',
      technical: 'bg-orange-100 text-orange-800',
      complaint: 'bg-red-100 text-red-800',
      suggestion: 'bg-yellow-100 text-yellow-800',
    };
    return (
      colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <MessageSquare className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Contact Management
                </h1>
                <p className="text-sm text-gray-600">
                  Manage inquiries and responses
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => router.push('/admin')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Messages
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {contacts.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    New Messages
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {contacts.filter(c => c.status === 'new').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Resolved</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {contacts.filter(c => c.status === 'resolved').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Star className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Starred</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {contacts.filter(c => c.isStarred).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
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
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categoryOptions.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  {priorityOptions.map(priority => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => setIsDialogOpen(true)} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                New Message
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contacts Table */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Messages</CardTitle>
            <CardDescription>
              Manage and respond to contact form submissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContacts.map(contact => (
                    <TableRow
                      key={contact.id}
                      className={!contact.isRead ? 'bg-blue-50' : ''}
                    >
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {!contact.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                          <Badge
                            className={getStatusBadgeColor(contact.status)}
                          >
                            {
                              statusOptions.find(
                                s => s.value === contact.status
                              )?.label
                            }
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {contact.isStarred && (
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          )}
                          <div>
                            <p className="font-medium">{contact.name}</p>
                            <p className="text-sm text-gray-500">
                              {contact.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{contact.subject}</p>
                          <p className="text-sm text-gray-500 truncate max-w-xs">
                            {contact.message}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={getCategoryBadgeColor(contact.category)}
                        >
                          {
                            categoryOptions.find(
                              c => c.value === contact.category
                            )?.label
                          }
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={getPriorityBadgeColor(contact.priority)}
                        >
                          {
                            priorityOptions.find(
                              p => p.value === contact.priority
                            )?.label
                          }
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{formatDate(contact.submittedAt)}</p>
                          {contact.respondedAt && (
                            <p className="text-gray-500">
                              Replied: {formatDate(contact.respondedAt)}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedContact(contact);
                              if (!contact.isRead) {
                                handleMarkAsRead(contact.id);
                              }
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openResponseDialog(contact)}
                          >
                            <Reply className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleStar(contact.id)}
                          >
                            <Star
                              className={`w-4 h-4 ${contact.isStarred ? 'text-yellow-500 fill-current' : ''}`}
                            />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Contact Message
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this contact
                                  message? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDeleteContact(contact.id)
                                  }
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
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingContact
                ? 'Edit Contact Message'
                : 'Create New Contact Message'}
            </DialogTitle>
            <DialogDescription>
              {editingContact
                ? 'Update the contact message details.'
                : 'Add a new contact message to the system.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={e =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={e =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={e =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={value =>
                  setFormData({ ...formData, category: value as any })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={value =>
                  setFormData({ ...formData, priority: value as any })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map(priority => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={e =>
                  setFormData({ ...formData, subject: e.target.value })
                }
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={e =>
                  setFormData({ ...formData, message: e.target.value })
                }
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={
                editingContact ? handleUpdateContact : handleCreateContact
              }
            >
              {editingContact ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Response Dialog */}
      <Dialog open={responseDialogOpen} onOpenChange={setResponseDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Respond to Contact Message</DialogTitle>
            <DialogDescription>
              Send a response to the contact message.
            </DialogDescription>
          </DialogHeader>
          {respondingContact && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Original Message</h4>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>From:</strong> {respondingContact.name} (
                  {respondingContact.email})
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Subject:</strong> {respondingContact.subject}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Message:</strong> {respondingContact.message}
                </p>
              </div>
              <div>
                <Label htmlFor="response">Response</Label>
                <Textarea
                  id="response"
                  value={responseData.response}
                  onChange={e =>
                    setResponseData({
                      ...responseData,
                      response: e.target.value,
                    })
                  }
                  rows={6}
                  placeholder="Type your response here..."
                />
              </div>
              <div>
                <Label htmlFor="status">Update Status</Label>
                <Select
                  value={responseData.status}
                  onValueChange={value =>
                    setResponseData({ ...responseData, status: value as any })
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
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setResponseDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleRespondToContact}>
              <Send className="w-4 h-4 mr-2" />
              Send Response
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Contact Dialog */}
      <Dialog
        open={!!selectedContact}
        onOpenChange={() => setSelectedContact(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Contact Message Details</DialogTitle>
          </DialogHeader>
          {selectedContact && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Name
                  </Label>
                  <p className="text-sm">{selectedContact.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Email
                  </Label>
                  <p className="text-sm">{selectedContact.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Phone
                  </Label>
                  <p className="text-sm">{selectedContact.phone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Category
                  </Label>
                  <Badge
                    className={getCategoryBadgeColor(selectedContact.category)}
                  >
                    {
                      categoryOptions.find(
                        c => c.value === selectedContact.category
                      )?.label
                    }
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Priority
                  </Label>
                  <Badge
                    className={getPriorityBadgeColor(selectedContact.priority)}
                  >
                    {
                      priorityOptions.find(
                        p => p.value === selectedContact.priority
                      )?.label
                    }
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Status
                  </Label>
                  <Badge
                    className={getStatusBadgeColor(selectedContact.status)}
                  >
                    {
                      statusOptions.find(
                        s => s.value === selectedContact.status
                      )?.label
                    }
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">
                  Subject
                </Label>
                <p className="text-sm font-medium">{selectedContact.subject}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">
                  Message
                </Label>
                <p className="text-sm whitespace-pre-wrap">
                  {selectedContact.message}
                </p>
              </div>
              {selectedContact.response && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Response
                  </Label>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">
                      {selectedContact.response}
                    </p>
                    {selectedContact.respondedAt && (
                      <p className="text-xs text-gray-500 mt-2">
                        Responded on {formatDate(selectedContact.respondedAt)}
                        {selectedContact.responderName &&
                          ` by ${selectedContact.responderName}`}
                      </p>
                    )}
                  </div>
                </div>
              )}
              <div>
                <Label className="text-sm font-medium text-gray-500">
                  Submitted
                </Label>
                <p className="text-sm">
                  {formatDate(selectedContact.submittedAt)}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedContact(null)}>
              Close
            </Button>
            {selectedContact && (
              <Button
                onClick={() => {
                  setSelectedContact(null);
                  openResponseDialog(selectedContact);
                }}
              >
                <Reply className="w-4 h-4 mr-2" />
                Respond
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
