import { setupServer } from 'msw/node';
import { rest } from 'msw';

// Mock data for testing
const mockBookings = [
  {
    id: '1',
    studentName: 'Test Student',
    parentName: 'Test Parent',
    parentEmail: 'test@example.com',
    parentPhone: '+237 123456789',
    teacherName: 'Test Teacher',
    subject: 'mathematics',
    purpose: 'Test purpose',
    preferredDate: '2024-02-15',
    preferredTime: '14:00',
    status: 'pending',
    createdAt: '2024-02-01T10:00:00Z',
  },
];

const mockApplications = [
  {
    id: '1',
    firstName: 'Test',
    lastName: 'Student',
    email: 'test@example.com',
    phone: '+237 123456789',
    form: 'form1',
    status: 'pending',
    submittedAt: '2024-02-01T10:00:00Z',
  },
];

const mockContacts = [
  {
    id: '1',
    name: 'Test Contact',
    email: 'test@example.com',
    phone: '+237 123456789',
    inquiryType: 'general_inquiry',
    message: 'Test message',
    status: 'pending',
    submittedAt: '2024-02-01T10:00:00Z',
  },
];

const mockNews = [
  {
    id: 1,
    title: 'Test News',
    titleFr: 'Actualité de test',
    content: 'Test content',
    contentFr: 'Contenu de test',
    category: 'general',
    imageUrl: '',
    isPublished: true,
    createdAt: '2024-02-01T10:00:00Z',
  },
];

const mockFacilities = [
  {
    id: 1,
    name: 'Test Facility',
    nameFr: 'Installation de test',
    description: 'Test description',
    descriptionFr: 'Description de test',
    imageUrl: '',
    category: 'science',
    features: ['Feature 1', 'Feature 2'],
    equipment: ['Equipment 1', 'Equipment 2'],
    isPublished: true,
    createdAt: '2024-02-01T10:00:00Z',
  },
];

const mockAchievements = [
  {
    id: 1,
    title: 'Test Achievement',
    titleFr: 'Réussite de test',
    description: 'Test description',
    descriptionFr: 'Description de test',
    imageUrl: '',
    category: 'academic',
    date: '2024-02-01',
    relatedNewsId: '',
    isPublished: true,
    createdAt: '2024-02-01T10:00:00Z',
  },
];

// Define handlers that correspond to your API routes
export const handlers = [
  // Bookings API
  rest.get('/api/bookings', (req, res, ctx) => {
    const page = req.url.searchParams.get('page') || '1';
    const limit = req.url.searchParams.get('limit') || '10';

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        bookings: mockBookings,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: mockBookings.length,
        },
      })
    );
  }),

  rest.post('/api/bookings', (req, res, ctx) => {
    const newBooking = {
      id: Date.now().toString(),
      ...req.body,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        message: 'Booking created successfully',
        booking: newBooking,
      })
    );
  }),

  rest.put('/api/bookings/:id', (req, res, ctx) => {
    const { id } = req.params;

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: 'Booking updated successfully',
        booking: { id, ...req.body },
      })
    );
  }),

  rest.delete('/api/bookings/:id', (req, res, ctx) => {
    const { id } = req.params;

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: 'Booking deleted successfully',
      })
    );
  }),

  // Applications API
  rest.get('/api/applications', (req, res, ctx) => {
    const page = req.url.searchParams.get('page') || '1';
    const limit = req.url.searchParams.get('limit') || '10';

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        applications: mockApplications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: mockApplications.length,
        },
      })
    );
  }),

  rest.post('/api/applications', (req, res, ctx) => {
    const newApplication = {
      id: Date.now().toString(),
      ...req.body,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };

    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        message: 'Application submitted successfully',
        application: newApplication,
      })
    );
  }),

  rest.put('/api/applications/:id/status', (req, res, ctx) => {
    const { id } = req.params;

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: 'Application status updated successfully',
        application: { id, ...req.body },
      })
    );
  }),

  // Contacts API
  rest.get('/api/contacts', (req, res, ctx) => {
    const page = req.url.searchParams.get('page') || '1';
    const limit = req.url.searchParams.get('limit') || '10';

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        contacts: mockContacts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: mockContacts.length,
        },
      })
    );
  }),

  rest.post('/api/contacts', (req, res, ctx) => {
    const newContact = {
      id: Date.now().toString(),
      ...req.body,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };

    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        message: 'Contact message sent successfully',
        contact: newContact,
      })
    );
  }),

  rest.put('/api/contacts/:id/status', (req, res, ctx) => {
    const { id } = req.params;

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: 'Contact status updated successfully',
        contact: { id, ...req.body },
      })
    );
  }),

  // News API
  rest.get('/api/news', (req, res, ctx) => {
    const page = req.url.searchParams.get('page') || '1';
    const limit = req.url.searchParams.get('limit') || '10';

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        news: mockNews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: mockNews.length,
        },
      })
    );
  }),

  rest.post('/api/news', (req, res, ctx) => {
    const newNews = {
      id: Date.now(),
      ...req.body,
      createdAt: new Date().toISOString(),
    };

    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        message: 'News article created successfully',
        news: newNews,
      })
    );
  }),

  rest.put('/api/news/:id', (req, res, ctx) => {
    const { id } = req.params;

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: 'News article updated successfully',
        news: { id: parseInt(id as string), ...req.body },
      })
    );
  }),

  rest.delete('/api/news/:id', (req, res, ctx) => {
    const { id } = req.params;

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: 'News article deleted successfully',
      })
    );
  }),

  // Facilities API
  rest.get('/api/facilities', (req, res, ctx) => {
    const page = req.url.searchParams.get('page') || '1';
    const limit = req.url.searchParams.get('limit') || '10';

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        facilities: mockFacilities,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: mockFacilities.length,
        },
      })
    );
  }),

  rest.post('/api/facilities', (req, res, ctx) => {
    const newFacility = {
      id: Date.now(),
      ...req.body,
      createdAt: new Date().toISOString(),
    };

    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        message: 'Facility created successfully',
        facility: newFacility,
      })
    );
  }),

  rest.put('/api/facilities/:id', (req, res, ctx) => {
    const { id } = req.params;

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: 'Facility updated successfully',
        facility: { id: parseInt(id as string), ...req.body },
      })
    );
  }),

  rest.delete('/api/facilities/:id', (req, res, ctx) => {
    const { id } = req.params;

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: 'Facility deleted successfully',
      })
    );
  }),

  // Achievements API
  rest.get('/api/achievements', (req, res, ctx) => {
    const page = req.url.searchParams.get('page') || '1';
    const limit = req.url.searchParams.get('limit') || '10';

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        achievements: mockAchievements,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: mockAchievements.length,
        },
      })
    );
  }),

  rest.post('/api/achievements', (req, res, ctx) => {
    const newAchievement = {
      id: Date.now(),
      ...req.body,
      createdAt: new Date().toISOString(),
    };

    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        message: 'Achievement created successfully',
        achievement: newAchievement,
      })
    );
  }),

  rest.put('/api/achievements/:id', (req, res, ctx) => {
    const { id } = req.params;

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: 'Achievement updated successfully',
        achievement: { id: parseInt(id as string), ...req.body },
      })
    );
  }),

  rest.delete('/api/achievements/:id', (req, res, ctx) => {
    const { id } = req.params;

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: 'Achievement deleted successfully',
      })
    );
  }),
];

// This configures a request mocking server with the given request handlers
export const server = setupServer(...handlers);
