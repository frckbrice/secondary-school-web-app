'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
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
  Calendar,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Filter,
  Clock,
  MapPin,
  ArrowLeft,
  EyeOff,
  Eye as EyeIcon,
  Image as ImageIcon,
  FileText,
  Tag,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '../../../lib/queryClient';

type EventCategory =
  | 'academic'
  | 'sports'
  | 'cultural'
  | 'general'
  | 'ceremony'
  | 'workshop';

interface Event {
  id: string;
  title: string;
  titleFr: string;
  description: string;
  descriptionFr: string;
  eventDate: string;
  eventTime: string;
  location: string;
  category: EventCategory;
  imageUrl?: string;
  isPublished: boolean;
  maxAttendees: number;
  currentAttendees: number;
  createdAt: string;
}

interface FormData {
  title: string;
  titleFr: string;
  description: string;
  descriptionFr: string;
  eventDate: string;
  eventTime: string;
  location: string;
  category: EventCategory;
  imageUrl: string;
  isPublished: boolean;
  maxAttendees: number;
}

export default function EventsManagement() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const router = useRouter();

  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const [formData, setFormData] = useState<FormData>({
    title: '',
    titleFr: '',
    description: '',
    descriptionFr: '',
    eventDate: '',
    eventTime: '',
    location: '',
    category: 'general',
    imageUrl: '',
    isPublished: false,
    maxAttendees: 0,
  });

  // Fetch events with pagination and filters
  const {
    data: eventsData,
    isLoading: queryLoading,
    refetch,
  } = useQuery({
    queryKey: ['events', searchTerm, categoryFilter, statusFilter, dateFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (statusFilter !== 'all')
        params.append(
          'isPublished',
          statusFilter === 'published' ? 'true' : 'false'
        );
      if (dateFilter !== 'all') params.append('dateFilter', dateFilter);

      const response = await fetch(`/api/events?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      return response.json();
    },
  });

  const eventsDataEvents = eventsData?.events || [];

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const submitData = {
        ...data,
        eventDate: data.eventDate
          ? new Date(data.eventDate).toISOString()
          : undefined,
      };
      const response = await apiRequest('POST', '/api/events', submitData);
      if (!response) throw new Error('Failed to create event');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Event created successfully',
      });
      setIsDialogOpen(false);
      resetForm();
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update event mutation
  const updateEventMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormData }) => {
      const submitData = {
        ...data,
        eventDate: data.eventDate
          ? new Date(data.eventDate).toISOString()
          : undefined,
      };
      const response = await apiRequest('PUT', `/api/events/${id}`, submitData);
      if (!response) throw new Error('Failed to update event');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Event updated successfully',
      });
      setIsDialogOpen(false);
      setEditingEvent(null);
      resetForm();
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/events/${id}`);
      if (!response) throw new Error('Failed to delete event');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Event deleted successfully',
      });
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Toggle publish status mutation
  const togglePublishMutation = useMutation({
    mutationFn: async ({
      id,
      isPublished,
    }: {
      id: string;
      isPublished: boolean;
    }) => {
      const response = await apiRequest('PATCH', `/api/events/${id}`, {
        isPublished,
      });
      if (!response) throw new Error('Failed to update event status');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Event publication status updated successfully',
      });
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleCreateEvent = async () => {
    createEventMutation.mutate(formData);
  };

  const handleUpdateEvent = async () => {
    if (!editingEvent) return;
    updateEventMutation.mutate({ id: editingEvent.id, data: formData });
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      deleteEventMutation.mutate(eventId);
    }
  };

  const handleTogglePublish = async (
    eventId: string,
    currentStatus: boolean
  ) => {
    togglePublishMutation.mutate({ id: eventId, isPublished: !currentStatus });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      titleFr: '',
      description: '',
      descriptionFr: '',
      eventDate: '',
      eventTime: '',
      location: '',
      category: 'general',
      imageUrl: '',
      isPublished: false,
      maxAttendees: 0,
    });
  };

  const openEditDialog = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      titleFr: event.titleFr,
      description: event.description,
      descriptionFr: event.descriptionFr,
      eventDate: event.eventDate
        ? new Date(event.eventDate).toISOString().split('T')[0]
        : '',
      eventTime: event.eventTime,
      location: event.location,
      category: event.category,
      imageUrl: event.imageUrl || '',
      isPublished: event.isPublished,
      maxAttendees: event.maxAttendees || 0,
    });
    setIsDialogOpen(true);
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'academic':
        return 'bg-blue-100 text-blue-800';
      case 'sports':
        return 'bg-green-100 text-green-800';
      case 'cultural':
        return 'bg-purple-100 text-purple-800';
      case 'ceremony':
        return 'bg-orange-100 text-orange-800';
      case 'workshop':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (isPublished: boolean) => {
    return isPublished
      ? 'bg-green-100 text-green-800'
      : 'bg-yellow-100 text-yellow-800';
  };

  const getDateStatus = (eventDate: string) => {
    const eventDateObj = new Date(eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (eventDateObj < today) {
      return { status: 'Past', color: 'bg-red-100 text-red-800' };
    } else if (eventDateObj.toDateString() === today.toDateString()) {
      return { status: 'Today', color: 'bg-blue-100 text-blue-800' };
    } else {
      return { status: 'Upcoming', color: 'bg-green-100 text-green-800' };
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
              <Calendar className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Events Management
                </h1>
                <p className="text-sm text-gray-600">
                  Manage school events and activities
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
                  <Calendar className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Events
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {eventsDataEvents.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <Clock className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Upcoming
                    </p>
                    <p className="text-2xl font-bold">
                      {
                        eventsDataEvents.filter(
                          e => new Date(e.eventDate) >= new Date()
                        ).length
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <Users className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Attendees
                    </p>
                    <p className="text-2xl font-bold">
                      {eventsDataEvents.reduce(
                        (sum, e) => sum + e.currentAttendees,
                        0
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <EyeIcon className="w-8 h-8 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Published
                    </p>
                    <p className="text-2xl font-bold">
                      {eventsDataEvents.filter(e => e.isPublished).length}
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
                      placeholder="Search events..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select
                    value={categoryFilter}
                    onValueChange={setCategoryFilter}
                  >
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="sports">Sports</SelectItem>
                      <SelectItem value="cultural">Cultural</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="ceremony">Ceremony</SelectItem>
                      <SelectItem value="workshop">Workshop</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Drafts</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Dates</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="past">Past</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      onClick={() => {
                        setEditingEvent(null);
                        resetForm();
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Event
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingEvent ? 'Edit Event' : 'Add New Event'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingEvent
                          ? 'Update event information'
                          : 'Create a new event'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">Title (English)</Label>
                          <Input
                            id="title"
                            value={formData.title}
                            onChange={e =>
                              setFormData({
                                ...formData,
                                title: e.target.value,
                              })
                            }
                            placeholder="Enter title in English"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="titleFr">Title (French)</Label>
                          <Input
                            id="titleFr"
                            value={formData.titleFr}
                            onChange={e =>
                              setFormData({
                                ...formData,
                                titleFr: e.target.value,
                              })
                            }
                            placeholder="Enter title in French"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="eventDate">Event Date</Label>
                          <Input
                            id="eventDate"
                            type="date"
                            value={formData.eventDate}
                            onChange={e =>
                              setFormData({
                                ...formData,
                                eventDate: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="eventTime">Event Time</Label>
                          <Input
                            id="eventTime"
                            type="time"
                            value={formData.eventTime}
                            onChange={e =>
                              setFormData({
                                ...formData,
                                eventTime: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="category">Category</Label>
                          <Select
                            value={formData.category}
                            onValueChange={(value: EventCategory) =>
                              setFormData({ ...formData, category: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="academic">Academic</SelectItem>
                              <SelectItem value="sports">Sports</SelectItem>
                              <SelectItem value="cultural">Cultural</SelectItem>
                              <SelectItem value="general">General</SelectItem>
                              <SelectItem value="ceremony">Ceremony</SelectItem>
                              <SelectItem value="workshop">Workshop</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              location: e.target.value,
                            })
                          }
                          placeholder="Event location"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="imageUrl">Image URL (Optional)</Label>
                          <Input
                            id="imageUrl"
                            value={formData.imageUrl}
                            onChange={e =>
                              setFormData({
                                ...formData,
                                imageUrl: e.target.value,
                              })
                            }
                            placeholder="https://example.com/image.jpg"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="maxAttendees">
                            Max Attendees (0 = unlimited)
                          </Label>
                          <Input
                            id="maxAttendees"
                            type="number"
                            min="0"
                            value={formData.maxAttendees}
                            onChange={e =>
                              setFormData({
                                ...formData,
                                maxAttendees: parseInt(e.target.value) || 0,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">
                          Description (English)
                        </Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              description: e.target.value,
                            })
                          }
                          placeholder="Enter description in English"
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="descriptionFr">
                          Description (French)
                        </Label>
                        <Textarea
                          id="descriptionFr"
                          value={formData.descriptionFr}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              descriptionFr: e.target.value,
                            })
                          }
                          placeholder="Enter description in French"
                          rows={3}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="isPublished"
                          checked={formData.isPublished}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              isPublished: e.target.checked,
                            })
                          }
                          className="rounded"
                        />
                        <Label htmlFor="isPublished">Publish immediately</Label>
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
                          editingEvent ? handleUpdateEvent : handleCreateEvent
                        }
                        disabled={
                          createEventMutation.isPending ||
                          updateEventMutation.isPending
                        }
                      >
                        {editingEvent ? 'Update' : 'Create'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Events Table */}
          <Card>
            <CardHeader>
              <CardTitle>Events ({eventsDataEvents.length})</CardTitle>
              <CardDescription>
                Manage school events and activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {queryLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Event</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Attendees</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {eventsDataEvents.map(event => {
                        const dateStatus = getDateStatus(event.eventDate);
                        return (
                          <TableRow key={event.id}>
                            <TableCell>
                              <div className="max-w-xs">
                                <div className="font-medium truncate">
                                  {event.title}
                                </div>
                                <div className="text-sm text-gray-500 truncate">
                                  {event.titleFr}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                  {event.description.substring(0, 80)}...
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="text-sm font-medium">
                                  {new Date(
                                    event.eventDate
                                  ).toLocaleDateString()}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {event.eventTime}
                                </div>
                                <Badge className={dateStatus.color}>
                                  {dateStatus.status}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center text-sm">
                                <MapPin className="w-3 h-3 mr-1" />
                                {event.location}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={getCategoryBadgeColor(
                                  event.category
                                )}
                              >
                                {event.category}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {event.currentAttendees}
                                {event.maxAttendees > 0 &&
                                  ` / ${event.maxAttendees}`}
                              </div>
                              {event.maxAttendees > 0 && (
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{
                                      width: `${Math.min((event.currentAttendees / event.maxAttendees) * 100, 100)}%`,
                                    }}
                                  ></div>
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={getStatusBadgeColor(
                                  event.isPublished
                                )}
                              >
                                {event.isPublished ? 'Published' : 'Draft'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedEvent(event)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditDialog(event)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleTogglePublish(
                                      event.id,
                                      event.isPublished
                                    )
                                  }
                                  disabled={togglePublishMutation.isPending}
                                >
                                  {event.isPublished ? (
                                    <EyeOff className="w-4 h-4" />
                                  ) : (
                                    <EyeIcon className="w-4 h-4" />
                                  )}
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
                                        Delete Event
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete &quot;
                                        {event.title}&quot;? This action cannot
                                        be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() =>
                                          handleDeleteEvent(event.id)
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
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Event Details Dialog */}
      <Dialog
        open={!!selectedEvent}
        onOpenChange={() => setSelectedEvent(null)}
      >
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Event Details</DialogTitle>
            <DialogDescription>
              Detailed view of the selected event
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-6">
              {selectedEvent.imageUrl && (
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={selectedEvent.imageUrl}
                    alt={selectedEvent.title}
                    width={300}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Title (English)
                  </Label>
                  <p className="text-lg font-medium">{selectedEvent.title}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Title (French)
                  </Label>
                  <p className="text-lg font-medium">{selectedEvent.titleFr}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Date & Time
                    </Label>
                    <p className="text-sm">
                      {new Date(selectedEvent.eventDate).toLocaleDateString()}{' '}
                      at {selectedEvent.eventTime}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Location
                    </Label>
                    <p className="text-sm">{selectedEvent.location}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Category
                    </Label>
                    <Badge
                      className={getCategoryBadgeColor(selectedEvent.category)}
                    >
                      {selectedEvent.category}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Status
                    </Label>
                    <Badge
                      className={getStatusBadgeColor(selectedEvent.isPublished)}
                    >
                      {selectedEvent.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Description (English)
                  </Label>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">
                      {selectedEvent.description}
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Description (French)
                  </Label>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">
                      {selectedEvent.descriptionFr}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Attendees
                    </Label>
                    <p className="text-sm">
                      {selectedEvent.currentAttendees}
                      {selectedEvent.maxAttendees > 0 &&
                        ` / ${selectedEvent.maxAttendees}`}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Created
                    </Label>
                    <p className="text-sm">
                      {new Date(selectedEvent.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedEvent(null)}>
              Close
            </Button>
            {selectedEvent && (
              <Button
                onClick={() => {
                  setSelectedEvent(null);
                  openEditDialog(selectedEvent);
                }}
              >
                Edit Event
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
