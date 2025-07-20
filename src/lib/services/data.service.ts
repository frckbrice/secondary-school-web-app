import { db } from '../db';
import {
  news,
  events,
  applications,
  contacts,
  bookings,
  gallery,
  studentResults,
  anonymousReports,
  petitions,
  gradeReports,
  studentGrades,
  contributions,
  subscriptions,
  studentProgress,
  schoolMetrics,
  fileUploads,
  users,
  students,
  facilities,
  achievements,
  type News,
  type Event,
  type Application,
  type Contact,
  type Booking,
  type Gallery,
  type StudentResult,
  type AnonymousReport,
  type Petition,
  type GradeReport,
  type StudentGrade,
  type Contribution,
  type Subscription,
  type StudentProgress,
  type SchoolMetrics,
  type FileUpload,
  type InsertNews,
  type InsertEvent,
  type InsertApplication,
  type InsertContact,
  type InsertBooking,
  type InsertGallery,
  type InsertPetition,
  type InsertAnonymousReport,
  type InsertGradeReport,
  type InsertStudentGrade,
  type InsertContribution,
  type InsertSubscription,
  type InsertStudentResult,
  type InsertStudentProgress,
  type InsertSchoolMetrics,
  type InsertFileUpload,
  type Facility,
  type InsertFacility,
  type Achievement,
  type InsertAchievement,
} from '../../schema';
import { eq, desc, and, inArray, sql } from 'drizzle-orm';
import { compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';

export interface ServiceResult<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: any;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Default pagination values
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

// Helper function to calculate pagination parameters
function getPaginationParams(params?: PaginationParams) {
  const page = Math.max(1, params?.page || DEFAULT_PAGE);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, params?.limit || DEFAULT_LIMIT)
  );
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

export class DataService {
  // ==================== USERS ====================
  static async getAllUsers(): Promise<
    ServiceResult<(typeof users.$inferSelect)[]>
  > {
    try {
      const allUsers = await db.query.users.findMany({
        orderBy: [desc(users.createdAt)],
      });
      return { success: true, data: allUsers };
    } catch (error) {
      return { success: false, message: 'Failed to fetch users', error };
    }
  }

  static async getUsersWithFilters(filters: {
    role?: string;
    teacherSubject?: string;
    page?: number;
    limit?: number;
  }): Promise<ServiceResult<PaginationResult<typeof users.$inferSelect>>> {
    try {
      const conditions: any[] = [];

      if (filters.role) {
        conditions.push(eq(users.role, filters.role));
      }
      if (filters.teacherSubject) {
        conditions.push(eq(users.teacherSubject, filters.teacherSubject));
      }

      const whereCondition =
        conditions.length > 0 ? and(...conditions) : undefined;

      // Get pagination parameters
      const { page, limit, offset } = getPaginationParams({
        page: filters.page,
        limit: filters.limit,
      });

      // Use Promise.all for better performance - fetch count and data in parallel
      const [countResult, allUsers] = await Promise.all([
        db
          .select({ count: sql`count(*)` })
          .from(users)
          .where(whereCondition)
          .then(result => Number(result[0]?.count || 0)),
        db.query.users.findMany({
          where: whereCondition,
          orderBy: [desc(users.createdAt)],
          limit,
          offset,
        }),
      ]);

      const totalCount = countResult;
      const totalPages = Math.ceil(totalCount / limit);

      return {
        success: true,
        data: {
          data: allUsers,
          pagination: {
            page,
            limit,
            total: totalCount,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
          },
        },
      };
    } catch (error) {
      return { success: false, message: 'Failed to fetch users', error };
    }
  }

  static async getUserById(
    id: string
  ): Promise<ServiceResult<typeof users.$inferSelect>> {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, id),
      });
      return user
        ? { success: true, data: user }
        : { success: false, message: 'User not found' };
    } catch (error) {
      return { success: false, message: 'Failed to fetch user', error };
    }
  }

  static async updateUser(
    id: string,
    updates: Partial<typeof users.$inferInsert>
  ): Promise<ServiceResult<typeof users.$inferSelect>> {
    try {
      const [updatedUser] = await db
        .update(users)
        .set(updates)
        .where(eq(users.id, id))
        .returning();
      return updatedUser
        ? { success: true, data: updatedUser }
        : { success: false, message: 'User not found' };
    } catch (error) {
      return { success: false, message: 'Failed to update user', error };
    }
  }

  static async deleteUser(id: string): Promise<ServiceResult<boolean>> {
    try {
      await db.delete(users).where(eq(users.id, id));
      return { success: true, data: true };
    } catch (error) {
      return { success: false, message: 'Failed to delete user', error };
    }
  }

  static async createUser(
    data: typeof users.$inferInsert
  ): Promise<ServiceResult<typeof users.$inferSelect>> {
    try {
      const [newUser] = await db.insert(users).values(data).returning();
      return { success: true, data: newUser };
    } catch (error) {
      return { success: false, message: 'Failed to create user', error };
    }
  }

  // ==================== STUDENTS ====================
  static async getAllStudents(): Promise<
    ServiceResult<(typeof students.$inferSelect)[]>
  > {
    try {
      const allStudents = await db.query.students.findMany({
        orderBy: [desc(students.createdAt)],
      });
      return { success: true, data: allStudents };
    } catch (error) {
      return { success: false, message: 'Failed to fetch students', error };
    }
  }

  static async getStudentsWithFilters(filters: {
    className?: string;
    gender?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }): Promise<ServiceResult<PaginationResult<typeof students.$inferSelect>>> {
    try {
      const conditions: any[] = [];

      if (filters.className) {
        conditions.push(eq(students.className, filters.className));
      }
      if (filters.gender) {
        conditions.push(eq(students.gender, filters.gender));
      }
      if (filters.isActive !== undefined) {
        conditions.push(eq(students.isActive, filters.isActive));
      }

      const whereCondition =
        conditions.length > 0 ? and(...conditions) : undefined;

      // Get pagination parameters
      const { page, limit, offset } = getPaginationParams({
        page: filters.page,
        limit: filters.limit,
      });

      // Use Promise.all for better performance - fetch count and data in parallel
      const [countResult, allStudents] = await Promise.all([
        db
          .select({ count: sql`count(*)` })
          .from(students)
          .where(whereCondition)
          .then(result => Number(result[0]?.count || 0)),
        db.query.students.findMany({
          where: whereCondition,
          orderBy: [desc(students.createdAt)],
          limit,
          offset,
        }),
      ]);

      const totalCount = countResult;
      const totalPages = Math.ceil(totalCount / limit);

      return {
        success: true,
        data: {
          data: allStudents,
          pagination: {
            page,
            limit,
            total: totalCount,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
          },
        },
      };
    } catch (error) {
      return { success: false, message: 'Failed to fetch students', error };
    }
  }

  static async getStudentById(
    id: string
  ): Promise<ServiceResult<typeof students.$inferSelect>> {
    try {
      const student = await db.query.students.findFirst({
        where: eq(students.id, id),
      });
      return student
        ? { success: true, data: student }
        : { success: false, message: 'Student not found' };
    } catch (error) {
      return { success: false, message: 'Failed to fetch student', error };
    }
  }

  static async getStudentByStudentId(
    studentId: string
  ): Promise<ServiceResult<typeof students.$inferSelect>> {
    try {
      const student = await db.query.students.findFirst({
        where: eq(students.studentId, studentId),
      });
      return student
        ? { success: true, data: student }
        : { success: false, message: 'Student not found' };
    } catch (error) {
      return { success: false, message: 'Failed to fetch student', error };
    }
  }

  static async createStudent(
    data: typeof students.$inferInsert
  ): Promise<ServiceResult<typeof students.$inferSelect>> {
    try {
      const [newStudent] = await db.insert(students).values(data).returning();
      return { success: true, data: newStudent };
    } catch (error) {
      return { success: false, message: 'Failed to create student', error };
    }
  }

  static async updateStudent(
    id: string,
    updates: Partial<typeof students.$inferInsert>
  ): Promise<ServiceResult<typeof students.$inferSelect>> {
    try {
      const [updatedStudent] = await db
        .update(students)
        .set(updates)
        .where(eq(students.id, id))
        .returning();
      return updatedStudent
        ? { success: true, data: updatedStudent }
        : { success: false, message: 'Student not found' };
    } catch (error) {
      return { success: false, message: 'Failed to update student', error };
    }
  }

  static async deleteStudent(id: string): Promise<ServiceResult<boolean>> {
    try {
      await db.delete(students).where(eq(students.id, id));
      return { success: true, data: true };
    } catch (error) {
      return { success: false, message: 'Failed to delete student', error };
    }
  }

  // ==================== NEWS ====================
  static async getAllNews(
    isPublished?: boolean
  ): Promise<ServiceResult<News[]>> {
    try {
      const allNews = await db.query.news.findMany({
        where:
          isPublished !== undefined
            ? eq(news.isPublished, isPublished)
            : undefined,
        orderBy: [desc(news.createdAt)],
      });
      return { success: true, data: allNews };
    } catch (error) {
      return { success: false, message: 'Failed to fetch news', error };
    }
  }

  static async getNewsById(id: string): Promise<ServiceResult<News>> {
    try {
      const newsItem = await db.query.news.findFirst({
        where: eq(news.id, id),
      });
      return newsItem
        ? { success: true, data: newsItem }
        : { success: false, message: 'News not found' };
    } catch (error) {
      return { success: false, message: 'Failed to fetch news', error };
    }
  }

  static async createNews(data: InsertNews): Promise<ServiceResult<News>> {
    try {
      const [newNews] = await db.insert(news).values(data).returning();
      return { success: true, data: newNews };
    } catch (error) {
      return { success: false, message: 'Failed to create news', error };
    }
  }

  static async updateNews(
    id: string,
    updates: Partial<InsertNews>
  ): Promise<ServiceResult<News>> {
    try {
      const [updatedNews] = await db
        .update(news)
        .set(updates)
        .where(eq(news.id, id))
        .returning();
      return updatedNews
        ? { success: true, data: updatedNews }
        : { success: false, message: 'News not found' };
    } catch (error) {
      return { success: false, message: 'Failed to update news', error };
    }
  }

  static async deleteNews(id: string): Promise<ServiceResult<boolean>> {
    try {
      await db.delete(news).where(eq(news.id, id));
      return { success: true, data: true };
    } catch (error) {
      return { success: false, message: 'Failed to delete news', error };
    }
  }

  static async publishNews(
    id: string,
    authorId: string
  ): Promise<ServiceResult<News>> {
    try {
      const [publishedNews] = await db
        .update(news)
        .set({ isPublished: true, publishedAt: new Date(), authorId })
        .where(eq(news.id, id))
        .returning();
      return publishedNews
        ? { success: true, data: publishedNews }
        : { success: false, message: 'News not found' };
    } catch (error) {
      return { success: false, message: 'Failed to publish news', error };
    }
  }

  // ==================== EVENTS ====================
  static async getAllEvents(
    isPublished?: boolean
  ): Promise<ServiceResult<Event[]>> {
    try {
      const allEvents = await db.query.events.findMany({
        where:
          isPublished !== undefined
            ? eq(events.isPublished, isPublished)
            : undefined,
        orderBy: [desc(events.createdAt)],
      });
      return { success: true, data: allEvents };
    } catch (error) {
      return { success: false, message: 'Failed to fetch events', error };
    }
  }

  static async getEventById(id: string): Promise<ServiceResult<Event>> {
    try {
      const event = await db.query.events.findFirst({
        where: eq(events.id, id),
      });
      return event
        ? { success: true, data: event }
        : { success: false, message: 'Event not found' };
    } catch (error) {
      return { success: false, message: 'Failed to fetch event', error };
    }
  }

  static async createEvent(data: InsertEvent): Promise<ServiceResult<Event>> {
    try {
      const [newEvent] = await db.insert(events).values(data).returning();
      return { success: true, data: newEvent };
    } catch (error) {
      return { success: false, message: 'Failed to create event', error };
    }
  }

  static async updateEvent(
    id: string,
    updates: Partial<InsertEvent>
  ): Promise<ServiceResult<Event>> {
    try {
      const [updatedEvent] = await db
        .update(events)
        .set(updates)
        .where(eq(events.id, id))
        .returning();
      return updatedEvent
        ? { success: true, data: updatedEvent }
        : { success: false, message: 'Event not found' };
    } catch (error) {
      return { success: false, message: 'Failed to update event', error };
    }
  }

  static async deleteEvent(id: string): Promise<ServiceResult<boolean>> {
    try {
      await db.delete(events).where(eq(events.id, id));
      return { success: true, data: true };
    } catch (error) {
      return { success: false, message: 'Failed to delete event', error };
    }
  }

  // ==================== APPLICATIONS ====================
  static async getAllApplications(): Promise<ServiceResult<Application[]>> {
    try {
      const allApplications = await db.query.applications.findMany({
        orderBy: [desc(applications.submittedAt)],
      });
      return { success: true, data: allApplications };
    } catch (error) {
      return { success: false, message: 'Failed to fetch applications', error };
    }
  }

  static async getApplicationById(
    id: string
  ): Promise<ServiceResult<Application>> {
    try {
      const application = await db.query.applications.findFirst({
        where: eq(applications.id, id),
      });
      return application
        ? { success: true, data: application }
        : { success: false, message: 'Application not found' };
    } catch (error) {
      return { success: false, message: 'Failed to fetch application', error };
    }
  }

  static async getApplicationsWithFilters(filters: {
    status?: string;
    form?: string;
    email?: string;
    phone?: string;
    reviewedBy?: string;
    page?: number;
    limit?: number;
  }): Promise<ServiceResult<PaginationResult<Application>>> {
    try {
      const conditions: ReturnType<typeof eq>[] = [];
      if (filters.status)
        conditions.push(eq(applications.status, filters.status));
      if (filters.form) conditions.push(eq(applications.form, filters.form));
      if (filters.email) conditions.push(eq(applications.email, filters.email));
      if (filters.phone) conditions.push(eq(applications.phone, filters.phone));
      if (filters.reviewedBy)
        conditions.push(eq(applications.reviewedBy, filters.reviewedBy));

      const whereCondition =
        conditions.length > 0 ? and(...conditions) : undefined;

      // Get pagination parameters
      const { page, limit, offset } = getPaginationParams({
        page: filters.page,
        limit: filters.limit,
      });

      // Use Promise.all for better performance - fetch count and data in parallel
      const [countResult, allApplications] = await Promise.all([
        db
          .select({ count: sql`count(*)` })
          .from(applications)
          .where(whereCondition)
          .then(result => Number(result[0]?.count || 0)),
        db.query.applications.findMany({
          where: whereCondition,
          orderBy: [desc(applications.submittedAt)],
          limit,
          offset,
        }),
      ]);

      const totalCount = countResult;
      const totalPages = Math.ceil(totalCount / limit);

      return {
        success: true,
        data: {
          data: allApplications,
          pagination: {
            page,
            limit,
            total: totalCount,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
          },
        },
      };
    } catch (error) {
      return { success: false, message: 'Failed to fetch applications', error };
    }
  }

  static async createApplication(
    data: InsertApplication
  ): Promise<ServiceResult<Application>> {
    try {
      const [newApplication] = await db
        .insert(applications)
        .values(data)
        .returning();
      return { success: true, data: newApplication };
    } catch (error) {
      return { success: false, message: 'Failed to create application', error };
    }
  }

  static async updateApplicationStatus(
    id: string,
    status: string,
    reviewerId?: string,
    notes?: string
  ): Promise<ServiceResult<Application>> {
    try {
      const [updatedApplication] = await db
        .update(applications)
        .set({
          status,
          reviewedAt: new Date(),
          reviewedBy: reviewerId,
          notes,
        })
        .where(eq(applications.id, id))
        .returning();
      return updatedApplication
        ? { success: true, data: updatedApplication }
        : { success: false, message: 'Application not found' };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update application status',
        error,
      };
    }
  }

  // ==================== CONTACTS ====================
  static async getAllContacts(): Promise<ServiceResult<Contact[]>> {
    try {
      const allContacts = await db.query.contacts.findMany({
        orderBy: [desc(contacts.submittedAt)],
      });
      return { success: true, data: allContacts };
    } catch (error) {
      return { success: false, message: 'Failed to fetch contacts', error };
    }
  }

  static async getContactsWithFilters(filters: {
    status?: string;
    inquiryType?: string;
    respondedBy?: string;
    page?: number;
    limit?: number;
  }): Promise<ServiceResult<PaginationResult<Contact>>> {
    try {
      const conditions: ReturnType<typeof eq>[] = [];

      if (filters.status) {
        conditions.push(eq(contacts.status, filters.status));
      }
      if (filters.inquiryType) {
        conditions.push(eq(contacts.inquiryType, filters.inquiryType));
      }
      if (filters.respondedBy) {
        conditions.push(eq(contacts.respondedBy, filters.respondedBy));
      }

      const whereCondition =
        conditions.length > 0 ? and(...conditions) : undefined;

      // Get total count first
      const totalCount = await db
        .select({ count: sql`count(*)` })
        .from(contacts)
        .where(whereCondition)
        .then(result => Number(result[0]?.count || 0));

      // Get pagination parameters
      const { page, limit, offset } = getPaginationParams({
        page: filters.page,
        limit: filters.limit,
      });

      // Get paginated data
      const allContacts = await db.query.contacts.findMany({
        where: whereCondition,
        orderBy: [desc(contacts.submittedAt)],
        limit,
        offset,
      });

      const totalPages = Math.ceil(totalCount / limit);

      return {
        success: true,
        data: {
          data: allContacts,
          pagination: {
            page,
            limit,
            total: totalCount,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
          },
        },
      };
    } catch (error) {
      return { success: false, message: 'Failed to fetch contacts', error };
    }
  }

  static async createContact(
    data: InsertContact
  ): Promise<ServiceResult<Contact>> {
    try {
      const [newContact] = await db.insert(contacts).values(data).returning();
      return { success: true, data: newContact };
    } catch (error) {
      return { success: false, message: 'Failed to create contact', error };
    }
  }

  static async updateContactStatus(
    id: string,
    status: string,
    responderId?: string,
    response?: string
  ): Promise<ServiceResult<Contact>> {
    try {
      const [updatedContact] = await db
        .update(contacts)
        .set({
          status,
          respondedAt: new Date(),
          respondedBy: responderId,
          response,
        })
        .where(eq(contacts.id, id))
        .returning();
      return updatedContact
        ? { success: true, data: updatedContact }
        : { success: false, message: 'Contact not found' };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update contact status',
        error,
      };
    }
  }

  // ==================== BOOKINGS ====================
  static async getAllBookings(): Promise<ServiceResult<Booking[]>> {
    try {
      const allBookings = await db.query.bookings.findMany({
        orderBy: [desc(bookings.createdAt)],
      });
      return { success: true, data: allBookings };
    } catch (error) {
      return { success: false, message: 'Failed to fetch bookings', error };
    }
  }

  static async getBookingsWithFilters(filters: {
    status?: string;
    subject?: string;
    teacherName?: string;
    page?: number;
    limit?: number;
  }): Promise<ServiceResult<PaginationResult<Booking>>> {
    try {
      const conditions: ReturnType<typeof eq>[] = [];

      if (filters.status) {
        conditions.push(eq(bookings.status, filters.status));
      }
      if (filters.subject) {
        conditions.push(eq(bookings.subject, filters.subject));
      }
      if (filters.teacherName) {
        conditions.push(eq(bookings.teacherName, filters.teacherName));
      }

      const whereCondition =
        conditions.length > 0 ? and(...conditions) : undefined;

      // Get total count first
      const totalCount = await db
        .select({ count: sql`count(*)` })
        .from(bookings)
        .where(whereCondition)
        .then(result => Number(result[0]?.count || 0));

      // Get pagination parameters
      const { page, limit, offset } = getPaginationParams({
        page: filters.page,
        limit: filters.limit,
      });

      // Get paginated data
      const allBookings = await db.query.bookings.findMany({
        where: whereCondition,
        orderBy: [desc(bookings.createdAt)],
        limit,
        offset,
      });

      const totalPages = Math.ceil(totalCount / limit);

      return {
        success: true,
        data: {
          data: allBookings,
          pagination: {
            page,
            limit,
            total: totalCount,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
          },
        },
      };
    } catch (error) {
      return { success: false, message: 'Failed to fetch bookings', error };
    }
  }

  static async createBooking(
    data: InsertBooking
  ): Promise<ServiceResult<Booking>> {
    try {
      const [newBooking] = await db.insert(bookings).values(data).returning();
      return { success: true, data: newBooking };
    } catch (error) {
      return { success: false, message: 'Failed to create booking', error };
    }
  }

  // ==================== GALLERY ====================
  static async getAllGalleryImages(
    isPublished?: boolean
  ): Promise<ServiceResult<Gallery[]>> {
    try {
      const allImages = await db.query.gallery.findMany({
        where:
          isPublished !== undefined
            ? eq(gallery.isPublished, isPublished)
            : undefined,
        orderBy: [desc(gallery.createdAt)],
        limit: 10,
        offset: 0,
      });
      return { success: true, data: allImages };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch gallery images',
        error,
      };
    }
  }

  static async getGalleryImage(id: string): Promise<ServiceResult<Gallery>> {
    try {
      const image = await db.query.gallery.findFirst({
        where: eq(gallery.id, id),
      });
      return image
        ? { success: true, data: image }
        : { success: false, message: 'Gallery image not found' };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch gallery image',
        error,
      };
    }
  }

  static async createGalleryImage(
    data: InsertGallery
  ): Promise<ServiceResult<Gallery>> {
    try {
      const [newImage] = await db.insert(gallery).values(data).returning();
      return { success: true, data: newImage };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to create gallery image',
        error,
      };
    }
  }

  static async updateGalleryImage(
    id: string,
    updates: Partial<InsertGallery>
  ): Promise<ServiceResult<Gallery>> {
    try {
      const [updatedImage] = await db
        .update(gallery)
        .set(updates)
        .where(eq(gallery.id, id))
        .returning();
      return updatedImage
        ? { success: true, data: updatedImage }
        : { success: false, message: 'Gallery image not found' };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update gallery image',
        error,
      };
    }
  }

  static async deleteGalleryImage(id: string): Promise<ServiceResult<boolean>> {
    try {
      await db.delete(gallery).where(eq(gallery.id, id));
      return { success: true, data: true };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to delete gallery image',
        error,
      };
    }
  }

  // ==================== PETITIONS ====================
  static async getAllPetitions(): Promise<ServiceResult<Petition[]>> {
    try {
      const allPetitions = await db.query.petitions.findMany({
        orderBy: [desc(petitions.submittedAt)],
      });
      return { success: true, data: allPetitions };
    } catch (error) {
      return { success: false, message: 'Failed to fetch petitions', error };
    }
  }

  static async getPetitionsWithFilters(filters: {
    status?: string;
    petitionType?: string;
    className?: string;
    page?: number;
    limit?: number;
  }): Promise<ServiceResult<PaginationResult<Petition>>> {
    try {
      const conditions: ReturnType<typeof eq>[] = [];

      if (filters.status) {
        conditions.push(eq(petitions.status, filters.status));
      }
      if (filters.petitionType) {
        conditions.push(eq(petitions.petitionType, filters.petitionType));
      }
      if (filters.className) {
        conditions.push(eq(petitions.className, filters.className));
      }

      const whereCondition =
        conditions.length > 0 ? and(...conditions) : undefined;

      // Get total count first
      const totalCount = await db
        .select({ count: sql`count(*)` })
        .from(petitions)
        .where(whereCondition)
        .then(result => Number(result[0]?.count || 0));

      // Get pagination parameters
      const { page, limit, offset } = getPaginationParams({
        page: filters.page,
        limit: filters.limit,
      });

      // Get paginated data
      const allPetitions = await db.query.petitions.findMany({
        where: whereCondition,
        orderBy: [desc(petitions.submittedAt)],
        limit,
        offset,
      });

      const totalPages = Math.ceil(totalCount / limit);

      return {
        success: true,
        data: {
          data: allPetitions,
          pagination: {
            page,
            limit,
            total: totalCount,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch petitions',
        error,
      };
    }
  }

  static async createPetition(
    data: InsertPetition
  ): Promise<ServiceResult<Petition>> {
    try {
      const [newPetition] = await db.insert(petitions).values(data).returning();
      return { success: true, data: newPetition };
    } catch (error) {
      return { success: false, message: 'Failed to create petition', error };
    }
  }

  // ==================== ANONYMOUS REPORTS ====================
  static async getAllAnonymousReports(): Promise<
    ServiceResult<AnonymousReport[]>
  > {
    try {
      const allReports = await db.query.anonymousReports.findMany({
        orderBy: [desc(anonymousReports.submittedAt)],
      });
      return { success: true, data: allReports };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch anonymous reports',
        error,
      };
    }
  }

  static async getAnonymousReportsWithFilters(filters: {
    reportType?: string;
    urgencyLevel?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ServiceResult<PaginationResult<AnonymousReport>>> {
    try {
      const conditions: ReturnType<typeof eq>[] = [];

      if (filters.reportType) {
        conditions.push(eq(anonymousReports.reportType, filters.reportType));
      }
      if (filters.urgencyLevel) {
        conditions.push(
          eq(anonymousReports.urgencyLevel, filters.urgencyLevel)
        );
      }
      if (filters.status) {
        conditions.push(eq(anonymousReports.status, filters.status));
      }

      const whereCondition =
        conditions.length > 0 ? and(...conditions) : undefined;

      // Get total count first
      const totalCount = await db
        .select({ count: sql`count(*)` })
        .from(anonymousReports)
        .where(whereCondition)
        .then(result => Number(result[0]?.count || 0));

      // Get pagination parameters
      const { page, limit, offset } = getPaginationParams({
        page: filters.page,
        limit: filters.limit,
      });

      // Get paginated data
      const allReports = await db.query.anonymousReports.findMany({
        where: whereCondition,
        orderBy: [desc(anonymousReports.submittedAt)],
        limit,
        offset,
      });

      const totalPages = Math.ceil(totalCount / limit);

      return {
        success: true,
        data: {
          data: allReports,
          pagination: {
            page,
            limit,
            total: totalCount,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch anonymous reports',
        error,
      };
    }
  }

  static async createAnonymousReport(
    data: InsertAnonymousReport
  ): Promise<ServiceResult<AnonymousReport>> {
    try {
      const [newReport] = await db
        .insert(anonymousReports)
        .values(data)
        .returning();
      return { success: true, data: newReport };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to create anonymous report',
        error,
      };
    }
  }

  // ==================== GRADE REPORTS ====================
  static async getAllGradeReports(): Promise<ServiceResult<GradeReport[]>> {
    try {
      const allReports = await db.query.gradeReports.findMany({
        orderBy: [desc(gradeReports.createdAt)],
      });
      return { success: true, data: allReports };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch grade reports',
        error,
      };
    }
  }

  static async getGradeReports(filters: {
    teacherId?: string;
    academicYear?: string;
    term?: string;
  }): Promise<ServiceResult<GradeReport[]>> {
    try {
      const conditions: ReturnType<typeof eq>[] = [];
      if (filters.teacherId)
        conditions.push(eq(gradeReports.teacherId, filters.teacherId));
      if (filters.academicYear)
        conditions.push(eq(gradeReports.academicYear, filters.academicYear));
      if (filters.term) conditions.push(eq(gradeReports.term, filters.term));

      const reports = await db.query.gradeReports.findMany({
        where: conditions.length > 0 ? and(...conditions) : undefined,
        orderBy: [desc(gradeReports.createdAt)],
      });
      return { success: true, data: reports };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch grade reports',
        error,
      };
    }
  }

  static async createGradeReport(
    data: InsertGradeReport
  ): Promise<ServiceResult<GradeReport>> {
    try {
      const [newReport] = await db
        .insert(gradeReports)
        .values(data)
        .returning();
      return { success: true, data: newReport };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to create grade report',
        error,
      };
    }
  }

  static async getGradeReportById(
    id: string
  ): Promise<ServiceResult<GradeReport>> {
    try {
      const report = await db.query.gradeReports.findFirst({
        where: eq(gradeReports.id, id),
      });
      return report
        ? { success: true, data: report }
        : { success: false, message: 'Grade report not found' };
    } catch (error) {
      return { success: false, message: 'Failed to fetch grade report', error };
    }
  }

  static async updateGradeReport(
    id: string,
    updates: Partial<InsertGradeReport>
  ): Promise<ServiceResult<GradeReport>> {
    try {
      const [updatedReport] = await db
        .update(gradeReports)
        .set(updates)
        .where(eq(gradeReports.id, id))
        .returning();
      return updatedReport
        ? { success: true, data: updatedReport }
        : { success: false, message: 'Grade report not found' };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update grade report',
        error,
      };
    }
  }

  static async finalizeGradeReport(
    id: string
  ): Promise<ServiceResult<GradeReport>> {
    try {
      const [finalizedReport] = await db
        .update(gradeReports)
        .set({ isFinalized: true, updatedAt: new Date() })
        .where(eq(gradeReports.id, id))
        .returning();
      return finalizedReport
        ? { success: true, data: finalizedReport }
        : { success: false, message: 'Grade report not found' };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to finalize grade report',
        error,
      };
    }
  }

  static async deleteGradeReport(id: string): Promise<ServiceResult<boolean>> {
    try {
      await db.delete(gradeReports).where(eq(gradeReports.id, id));
      return { success: true, data: true };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to delete grade report',
        error,
      };
    }
  }

  // ==================== STUDENT GRADES ====================
  static async getAllStudentGrades(): Promise<ServiceResult<StudentGrade[]>> {
    try {
      const allGrades = await db.query.studentGrades.findMany({
        orderBy: [desc(studentGrades.createdAt)],
      });
      return { success: true, data: allGrades };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch student grades',
        error,
      };
    }
  }

  static async createStudentGrade(
    data: InsertStudentGrade
  ): Promise<ServiceResult<StudentGrade>> {
    try {
      const [newGrade] = await db
        .insert(studentGrades)
        .values(data)
        .returning();
      return { success: true, data: newGrade };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to create student grade',
        error,
      };
    }
  }

  static async getStudentGradesByReportId(
    reportId: string
  ): Promise<ServiceResult<StudentGrade[]>> {
    try {
      const grades = await db.query.studentGrades.findMany({
        where: eq(studentGrades.gradeReportId, reportId),
        orderBy: [studentGrades.studentName],
      });
      return { success: true, data: grades };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch student grades',
        error,
      };
    }
  }

  static async getStudentGradeById(
    id: string
  ): Promise<ServiceResult<StudentGrade>> {
    try {
      const grade = await db.query.studentGrades.findFirst({
        where: eq(studentGrades.id, id),
      });
      return grade
        ? { success: true, data: grade }
        : { success: false, message: 'Student grade not found' };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch student grade',
        error,
      };
    }
  }

  static async updateStudentGrade(
    id: string,
    updates: Partial<InsertStudentGrade>
  ): Promise<ServiceResult<StudentGrade>> {
    try {
      const [updatedGrade] = await db
        .update(studentGrades)
        .set(updates)
        .where(eq(studentGrades.id, id))
        .returning();
      return updatedGrade
        ? { success: true, data: updatedGrade }
        : { success: false, message: 'Student grade not found' };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update student grade',
        error,
      };
    }
  }

  static async deleteStudentGrade(id: string): Promise<ServiceResult<boolean>> {
    try {
      await db.delete(studentGrades).where(eq(studentGrades.id, id));
      return { success: true, data: true };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to delete student grade',
        error,
      };
    }
  }

  // ==================== CONTRIBUTIONS ====================
  static async getAllContributions(): Promise<ServiceResult<Contribution[]>> {
    try {
      const allContributions = await db.query.contributions.findMany({
        orderBy: [desc(contributions.createdAt)],
      });
      return { success: true, data: allContributions };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch contributions',
        error,
      };
    }
  }

  static async getContributionsWithFilters(filters: {
    status?: string;
    paymentProvider?: string;
    isAlumni?: boolean;
    graduationYear?: string;
    page?: number;
    limit?: number;
    offset?: number;
  }): Promise<ServiceResult<PaginationResult<Contribution>>> {
    try {
      const conditions: ReturnType<typeof eq>[] = [];

      if (filters.status) {
        conditions.push(eq(contributions.status, filters.status));
      }
      if (filters.paymentProvider) {
        conditions.push(
          eq(contributions.paymentProvider, filters.paymentProvider)
        );
      }
      if (filters.isAlumni !== undefined) {
        conditions.push(eq(contributions.isAlumni, filters.isAlumni));
      }
      if (filters.graduationYear) {
        conditions.push(
          eq(contributions.graduationYear, filters.graduationYear)
        );
      }

      const whereCondition =
        conditions.length > 0 ? and(...conditions) : undefined;

      // Get total count first
      const totalCount = await db
        .select({ count: sql`count(*)` })
        .from(contributions)
        .where(whereCondition)
        .then(result => Number(result[0]?.count || 0));

      // Get pagination parameters
      const { page, limit, offset } = getPaginationParams({
        page: filters.page,
        limit: filters.limit,
      });

      // Get paginated data
      const allContributions = await db.query.contributions.findMany({
        where: whereCondition,
        orderBy: [desc(contributions.createdAt)],
        limit,
        offset,
      });

      const totalPages = Math.ceil(totalCount / limit);

      return {
        success: true,
        data: {
          data: allContributions,
          pagination: {
            page,
            limit,
            total: totalCount,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch contributions',
        error,
      };
    }
  }

  static async createContribution(
    data: InsertContribution
  ): Promise<ServiceResult<Contribution>> {
    try {
      const [newContribution] = await db
        .insert(contributions)
        .values(data)
        .returning();
      return { success: true, data: newContribution };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to create contribution',
        error,
      };
    }
  }

  // ==================== SUBSCRIPTIONS ====================
  static async getAllSubscriptions(): Promise<ServiceResult<Subscription[]>> {
    try {
      const allSubscriptions = await db.query.subscriptions.findMany({
        orderBy: [desc(subscriptions.createdAt)],
      });
      return { success: true, data: allSubscriptions };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch subscriptions',
        error,
      };
    }
  }

  static async getSubscriptionsWithFilters(filters: {
    status?: string;
    subscriptionType?: string;
    paymentProvider?: string;
    graduationYear?: string;
    page?: number;
    limit?: number;
    offset?: number;
  }): Promise<ServiceResult<PaginationResult<Subscription>>> {
    try {
      const conditions: ReturnType<typeof eq>[] = [];

      if (filters.status) {
        conditions.push(eq(subscriptions.status, filters.status));
      }
      if (filters.subscriptionType) {
        conditions.push(
          eq(subscriptions.subscriptionType, filters.subscriptionType)
        );
      }
      if (filters.paymentProvider) {
        conditions.push(
          eq(subscriptions.paymentProvider, filters.paymentProvider)
        );
      }
      if (filters.graduationYear) {
        conditions.push(
          eq(subscriptions.graduationYear, filters.graduationYear)
        );
      }

      const whereCondition =
        conditions.length > 0 ? and(...conditions) : undefined;

      // Get total count first
      const totalCount = await db
        .select({ count: sql`count(*)` })
        .from(subscriptions)
        .where(whereCondition)
        .then(result => Number(result[0]?.count || 0));

      // Get pagination parameters
      const { page, limit, offset } = getPaginationParams({
        page: filters.page,
        limit: filters.limit,
      });

      // Get paginated data
      const allSubscriptions = await db.query.subscriptions.findMany({
        where: whereCondition,
        orderBy: [desc(subscriptions.createdAt)],
        limit,
        offset,
      });

      const totalPages = Math.ceil(totalCount / limit);

      return {
        success: true,
        data: {
          data: allSubscriptions,
          pagination: {
            page,
            limit,
            total: totalCount,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch subscriptions',
        error,
      };
    }
  }

  static async createSubscription(
    data: InsertSubscription
  ): Promise<ServiceResult<Subscription>> {
    try {
      const [newSubscription] = await db
        .insert(subscriptions)
        .values(data)
        .returning();
      return { success: true, data: newSubscription };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to create subscription',
        error,
      };
    }
  }

  // ==================== STUDENT RESULTS ====================
  static async getAllStudentResults(): Promise<ServiceResult<StudentResult[]>> {
    try {
      const allResults = await db.query.studentResults.findMany({
        orderBy: [desc(studentResults.createdAt)],
      });
      return { success: true, data: allResults };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch student results',
        error,
      };
    }
  }

  static async createStudentResult(
    data: InsertStudentResult
  ): Promise<ServiceResult<StudentResult>> {
    try {
      const [newResult] = await db
        .insert(studentResults)
        .values(data)
        .returning();
      return { success: true, data: newResult };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to create student result',
        error,
      };
    }
  }

  static async getStudentResultsWithFilters(filters: {
    studentId?: string;
    academicYear?: string;
    term?: string;
  }): Promise<ServiceResult<StudentResult[]>> {
    try {
      let whereCondition: any = undefined;
      if (filters.studentId && filters.academicYear && filters.term) {
        whereCondition = and(
          eq(studentResults.studentId, filters.studentId),
          eq(studentResults.academicYear, filters.academicYear),
          eq(studentResults.term, filters.term)
        );
      } else if (filters.studentId && filters.academicYear) {
        whereCondition = and(
          eq(studentResults.studentId, filters.studentId),
          eq(studentResults.academicYear, filters.academicYear)
        );
      } else if (filters.studentId && filters.term) {
        whereCondition = and(
          eq(studentResults.studentId, filters.studentId),
          eq(studentResults.term, filters.term)
        );
      } else if (filters.academicYear && filters.term) {
        whereCondition = and(
          eq(studentResults.academicYear, filters.academicYear),
          eq(studentResults.term, filters.term)
        );
      } else if (filters.studentId) {
        whereCondition = eq(studentResults.studentId, filters.studentId);
      } else if (filters.academicYear) {
        whereCondition = eq(studentResults.academicYear, filters.academicYear);
      } else if (filters.term) {
        whereCondition = eq(studentResults.term, filters.term);
      }
      const results = await db.query.studentResults.findMany({
        where: whereCondition,
        orderBy: [desc(studentResults.createdAt)],
      });
      return { success: true, data: results };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch student results',
        error,
      };
    }
  }

  // ==================== STUDENT PROGRESS ====================
  static async getAllStudentProgress(): Promise<
    ServiceResult<StudentProgress[]>
  > {
    try {
      const allProgress = await db.query.studentProgress.findMany({
        orderBy: [desc(studentProgress.createdAt)],
      });
      return { success: true, data: allProgress };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch student progress',
        error,
      };
    }
  }

  static async getStudentProgressWithFilters(filters: {
    studentId?: string;
    academicYear?: string;
    term?: string;
    currentClass?: string;
  }): Promise<ServiceResult<StudentProgress[]>> {
    try {
      let whereCondition: any = undefined;

      if (filters.studentId && filters.academicYear && filters.term) {
        whereCondition = and(
          eq(studentProgress.studentId, filters.studentId),
          eq(studentProgress.academicYear, filters.academicYear),
          eq(studentProgress.term, filters.term)
        );
      } else if (filters.studentId && filters.academicYear) {
        whereCondition = and(
          eq(studentProgress.studentId, filters.studentId),
          eq(studentProgress.academicYear, filters.academicYear)
        );
      } else if (filters.studentId && filters.term) {
        whereCondition = and(
          eq(studentProgress.studentId, filters.studentId),
          eq(studentProgress.term, filters.term)
        );
      } else if (filters.academicYear && filters.term) {
        whereCondition = and(
          eq(studentProgress.academicYear, filters.academicYear),
          eq(studentProgress.term, filters.term)
        );
      } else if (filters.studentId) {
        whereCondition = eq(studentProgress.studentId, filters.studentId);
      } else if (filters.academicYear) {
        whereCondition = eq(studentProgress.academicYear, filters.academicYear);
      } else if (filters.term) {
        whereCondition = eq(studentProgress.term, filters.term);
      } else if (filters.currentClass) {
        whereCondition = eq(studentProgress.currentClass, filters.currentClass);
      }

      const progress = await db.query.studentProgress.findMany({
        where: whereCondition,
        orderBy: [desc(studentProgress.createdAt)],
      });

      return { success: true, data: progress };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch student progress',
        error,
      };
    }
  }

  static async createStudentProgress(
    data: InsertStudentProgress
  ): Promise<ServiceResult<StudentProgress>> {
    try {
      const [newProgress] = await db
        .insert(studentProgress)
        .values(data)
        .returning();
      return { success: true, data: newProgress };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to create student progress',
        error,
      };
    }
  }

  // ==================== SCHOOL METRICS ====================
  static async getAllSchoolMetrics(): Promise<ServiceResult<SchoolMetrics[]>> {
    try {
      const allMetrics = await db.query.schoolMetrics.findMany({
        orderBy: [desc(schoolMetrics.createdAt)],
      });
      return { success: true, data: allMetrics };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch school metrics',
        error,
      };
    }
  }

  static async getSchoolMetricsWithFilters(filters: {
    academicYear?: string;
    term?: string;
    limit?: number;
  }): Promise<ServiceResult<SchoolMetrics[]>> {
    try {
      const conditions: ReturnType<typeof eq>[] = [];

      if (filters.academicYear) {
        conditions.push(eq(schoolMetrics.academicYear, filters.academicYear));
      }

      if (filters.term) {
        conditions.push(eq(schoolMetrics.term, filters.term));
      }

      const whereCondition =
        conditions.length > 0 ? and(...conditions) : undefined;

      const metrics = await db.query.schoolMetrics.findMany({
        where: whereCondition,
        orderBy: [desc(schoolMetrics.createdAt)],
        limit: filters.limit,
      });

      return { success: true, data: metrics };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch school metrics',
        error,
      };
    }
  }

  static async createSchoolMetrics(
    data: InsertSchoolMetrics
  ): Promise<ServiceResult<SchoolMetrics>> {
    try {
      const [newMetrics] = await db
        .insert(schoolMetrics)
        .values(data)
        .returning();
      return { success: true, data: newMetrics };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to create school metrics',
        error,
      };
    }
  }

  // ==================== FILE UPLOADS ====================
  static async getAllFileUploads(): Promise<ServiceResult<FileUpload[]>> {
    try {
      const allUploads = await db.query.fileUploads.findMany({
        orderBy: [desc(fileUploads.createdAt)],
      });
      return { success: true, data: allUploads };
    } catch (error) {
      return { success: false, message: 'Failed to fetch file uploads', error };
    }
  }

  static async getFileUploadsWithFilters(filters: {
    relatedType?: string;
    uploadedBy?: string;
    page?: number;
    limit?: number;
    offset?: number;
  }): Promise<ServiceResult<PaginationResult<FileUpload>>> {
    try {
      const conditions: ReturnType<typeof eq>[] = [];

      if (filters.relatedType) {
        conditions.push(eq(fileUploads.relatedType, filters.relatedType));
      }
      if (filters.uploadedBy) {
        conditions.push(eq(fileUploads.uploadedBy, filters.uploadedBy));
      }

      const whereCondition =
        conditions.length > 0 ? and(...conditions) : undefined;

      // Get total count first
      const totalCount = await db
        .select({ count: sql`count(*)` })
        .from(fileUploads)
        .where(whereCondition)
        .then(result => Number(result[0]?.count || 0));

      // Get pagination parameters
      const { page, limit, offset } = getPaginationParams({
        page: filters.page,
        limit: filters.limit,
      });

      // Get paginated data
      const allUploads = await db.query.fileUploads.findMany({
        where: whereCondition,
        orderBy: [desc(fileUploads.createdAt)],
        limit,
        offset,
      });

      const totalPages = Math.ceil(totalCount / limit);

      return {
        success: true,
        data: {
          data: allUploads,
          pagination: {
            page,
            limit,
            total: totalCount,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
          },
        },
      };
    } catch (error) {
      return { success: false, message: 'Failed to fetch file uploads', error };
    }
  }

  static async createFileUpload(
    data: InsertFileUpload
  ): Promise<ServiceResult<FileUpload>> {
    try {
      const [newUpload] = await db.insert(fileUploads).values(data).returning();
      return { success: true, data: newUpload };
    } catch (error) {
      return { success: false, message: 'Failed to create file upload', error };
    }
  }

  static async getFileUploadById(
    id: string
  ): Promise<ServiceResult<FileUpload>> {
    try {
      const fileUpload = await db.query.fileUploads.findFirst({
        where: eq(fileUploads.id, id),
      });
      return fileUpload
        ? { success: true, data: fileUpload }
        : { success: false, message: 'File upload not found' };
    } catch (error) {
      return { success: false, message: 'Failed to fetch file upload', error };
    }
  }

  static async deleteFileUpload(id: string): Promise<ServiceResult<boolean>> {
    try {
      await db.delete(fileUploads).where(eq(fileUploads.id, id));
      return { success: true, data: true };
    } catch (error) {
      return { success: false, message: 'Failed to delete file upload', error };
    }
  }

  static async getStudentGradesWithFilters(filters: {
    studentId?: string;
    subject?: string;
    academicYear?: string;
    term?: string;
  }): Promise<ServiceResult<StudentGrade[]>> {
    try {
      // Build conditions for studentGrades table
      const studentGradeConditions: ReturnType<typeof eq>[] = [];
      if (filters.studentId) {
        studentGradeConditions.push(
          eq(studentGrades.matricule, filters.studentId)
        );
      }

      // Build conditions for gradeReports table
      const gradeReportConditions: ReturnType<typeof eq>[] = [];
      if (filters.subject) {
        gradeReportConditions.push(eq(gradeReports.subject, filters.subject));
      }
      if (filters.academicYear) {
        gradeReportConditions.push(
          eq(gradeReports.academicYear, filters.academicYear)
        );
      }
      if (filters.term) {
        gradeReportConditions.push(eq(gradeReports.term, filters.term));
      }

      // Use a more efficient approach with proper joins
      // Since we can't easily do complex joins with the current query structure,
      // we'll use a two-step approach that's still efficient:

      // Step 1: Get the relevant grade report IDs if we have filters
      let relevantGradeReportIds: string[] | undefined;

      if (gradeReportConditions.length > 0) {
        const relevantReports = await db.query.gradeReports.findMany({
          where: and(...gradeReportConditions),
          columns: { id: true },
        });
        relevantGradeReportIds = relevantReports.map(report => report.id);

        // If no matching grade reports found, return empty array
        if (relevantGradeReportIds.length === 0) {
          return { success: true, data: [] };
        }
      }

      // Step 2: Get student grades with the relevant grade report IDs
      const finalConditions: ReturnType<typeof eq>[] = [
        ...studentGradeConditions,
      ];

      if (relevantGradeReportIds) {
        // Use 'in' operator to filter by grade report IDs
        finalConditions.push(
          inArray(studentGrades.gradeReportId, relevantGradeReportIds) as any
        );
      }

      const grades = await db.query.studentGrades.findMany({
        where: finalConditions.length > 0 ? and(...finalConditions) : undefined,
        orderBy: [desc(studentGrades.createdAt)],
      });

      return { success: true, data: grades };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch student grades',
        error,
      };
    }
  }

  static async authenticateStudent(
    studentId: string,
    password: string
  ): Promise<ServiceResult<boolean>> {
    try {
      const student = await db.query.students.findFirst({
        where: eq(students.studentId, studentId),
      });
      if (!student) {
        return { success: false, message: 'Student not found' };
      }

      const passwordMatch = await compare(password, student.password);
      return { success: passwordMatch };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to authenticate student',
        error,
      };
    }
  }

  static async createSession(
    studentId: string
  ): Promise<ServiceResult<string>> {
    try {
      const student = await db.query.students.findFirst({
        where: eq(students.studentId, studentId),
      });
      if (!student) {
        return { success: false, message: 'Student not found' };
      }

      if (!process.env.JWT_SECRET) {
        return { success: false, message: 'JWT_SECRET not configured' };
      }

      const token = sign({ studentId }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });
      return { success: true, data: token };
    } catch (error) {
      return { success: false, message: 'Failed to create session', error };
    }
  }

  // ==================== FACILITIES ====================
  static async getAllFacilities(
    isPublished?: boolean
  ): Promise<ServiceResult<Facility[]>> {
    try {
      const allFacilities = await db.query.facilities.findMany({
        where:
          isPublished !== undefined
            ? eq(facilities.isPublished, isPublished)
            : undefined,
        orderBy: [desc(facilities.createdAt)],
      });
      return { success: true, data: allFacilities };
    } catch (error) {
      return { success: false, message: 'Failed to fetch facilities', error };
    }
  }

  static async getFacilitiesWithFilters(filters: {
    category?: string;
    page?: number;
    limit?: number;
    isPublished?: boolean;
  }): Promise<ServiceResult<PaginationResult<Facility>>> {
    try {
      const conditions: any[] = [];
      if (filters.category) {
        conditions.push(eq(facilities.category, filters.category));
      }
      if (filters.isPublished !== undefined) {
        conditions.push(eq(facilities.isPublished, filters.isPublished));
      }
      const whereCondition =
        conditions.length > 0 ? and(...conditions) : undefined;
      const { page, limit, offset } = getPaginationParams({
        page: filters.page,
        limit: filters.limit,
      });
      const [countResult, allFacilities] = await Promise.all([
        db
          .select({ count: sql`count(*)` })
          .from(facilities)
          .where(whereCondition)
          .then(result => Number(result[0]?.count || 0)),
        db.query.facilities.findMany({
          where: whereCondition,
          orderBy: [desc(facilities.createdAt)],
          limit,
          offset,
        }),
      ]);
      const totalPages = Math.ceil(countResult / limit);
      return {
        success: true,
        data: {
          data: allFacilities,
          pagination: {
            page,
            limit,
            total: countResult,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
          },
        },
      };
    } catch (error) {
      return { success: false, message: 'Failed to fetch facilities', error };
    }
  }

  static async getFacilityById(id: string): Promise<ServiceResult<Facility>> {
    try {
      const facility = await db.query.facilities.findFirst({
        where: eq(facilities.id, id),
      });
      return facility
        ? { success: true, data: facility }
        : { success: false, message: 'Facility not found' };
    } catch (error) {
      return { success: false, message: 'Failed to fetch facility', error };
    }
  }

  static async createFacility(
    data: InsertFacility
  ): Promise<ServiceResult<Facility>> {
    try {
      const [newFacility] = await db
        .insert(facilities)
        .values(data)
        .returning();
      return { success: true, data: newFacility };
    } catch (error) {
      return { success: false, message: 'Failed to create facility', error };
    }
  }

  static async updateFacility(
    id: string,
    updates: Partial<InsertFacility>
  ): Promise<ServiceResult<Facility>> {
    try {
      const [updatedFacility] = await db
        .update(facilities)
        .set(updates)
        .where(eq(facilities.id, id))
        .returning();
      return updatedFacility
        ? { success: true, data: updatedFacility }
        : { success: false, message: 'Facility not found' };
    } catch (error) {
      return { success: false, message: 'Failed to update facility', error };
    }
  }

  static async deleteFacility(id: string): Promise<ServiceResult<boolean>> {
    try {
      await db.delete(facilities).where(eq(facilities.id, id));
      return { success: true, data: true };
    } catch (error) {
      return { success: false, message: 'Failed to delete facility', error };
    }
  }

  // ==================== ACHIEVEMENTS ====================
  static async getAllAchievements(
    isPublished?: boolean
  ): Promise<ServiceResult<Achievement[]>> {
    try {
      const allAchievements = await db.query.achievements.findMany({
        where:
          isPublished !== undefined
            ? eq(achievements.isPublished, isPublished)
            : undefined,
        orderBy: [desc(achievements.createdAt)],
      });
      return { success: true, data: allAchievements };
    } catch (error) {
      return { success: false, message: 'Failed to fetch achievements', error };
    }
  }

  static async getAchievementsWithFilters(filters: {
    category?: string;
    page?: number;
    limit?: number;
    isPublished?: boolean;
  }): Promise<ServiceResult<PaginationResult<Achievement>>> {
    try {
      const conditions: any[] = [];
      if (filters.category) {
        conditions.push(eq(achievements.category, filters.category));
      }
      if (filters.isPublished !== undefined) {
        conditions.push(eq(achievements.isPublished, filters.isPublished));
      }
      const whereCondition =
        conditions.length > 0 ? and(...conditions) : undefined;
      const { page, limit, offset } = getPaginationParams({
        page: filters.page,
        limit: filters.limit,
      });
      const [countResult, allAchievements] = await Promise.all([
        db
          .select({ count: sql`count(*)` })
          .from(achievements)
          .where(whereCondition)
          .then(result => Number(result[0]?.count || 0)),
        db.query.achievements.findMany({
          where: whereCondition,
          orderBy: [desc(achievements.createdAt)],
          limit,
          offset,
        }),
      ]);
      const totalPages = Math.ceil(countResult / limit);
      return {
        success: true,
        data: {
          data: allAchievements,
          pagination: {
            page,
            limit,
            total: countResult,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
          },
        },
      };
    } catch (error) {
      return { success: false, message: 'Failed to fetch achievements', error };
    }
  }

  static async getAchievementById(
    id: string
  ): Promise<ServiceResult<Achievement>> {
    try {
      const achievement = await db.query.achievements.findFirst({
        where: eq(achievements.id, id),
      });
      return achievement
        ? { success: true, data: achievement }
        : { success: false, message: 'Achievement not found' };
    } catch (error) {
      return { success: false, message: 'Failed to fetch achievement', error };
    }
  }

  static async createAchievement(
    data: InsertAchievement
  ): Promise<ServiceResult<Achievement>> {
    try {
      const [newAchievement] = await db
        .insert(achievements)
        .values(data)
        .returning();
      return { success: true, data: newAchievement };
    } catch (error) {
      return { success: false, message: 'Failed to create achievement', error };
    }
  }

  static async updateAchievement(
    id: string,
    updates: Partial<InsertAchievement>
  ): Promise<ServiceResult<Achievement>> {
    try {
      const [updatedAchievement] = await db
        .update(achievements)
        .set(updates)
        .where(eq(achievements.id, id))
        .returning();
      return updatedAchievement
        ? { success: true, data: updatedAchievement }
        : { success: false, message: 'Achievement not found' };
    } catch (error) {
      return { success: false, message: 'Failed to update achievement', error };
    }
  }

  static async deleteAchievement(id: string): Promise<ServiceResult<boolean>> {
    try {
      await db.delete(achievements).where(eq(achievements.id, id));
      return { success: true, data: true };
    } catch (error) {
      return { success: false, message: 'Failed to delete achievement', error };
    }
  }

  // ==================== NEWS PAGINATION ====================
  static async getNewsWithFilters(filters: {
    isPublished?: boolean;
    category?: string;
    page?: number;
    limit?: number;
  }): Promise<ServiceResult<PaginationResult<News>>> {
    try {
      const conditions: any[] = [];

      if (filters.isPublished !== undefined) {
        conditions.push(eq(news.isPublished, filters.isPublished));
      }
      if (filters.category) {
        conditions.push(eq(news.category, filters.category));
      }

      const whereCondition =
        conditions.length > 0 ? and(...conditions) : undefined;

      // Get pagination parameters
      const { page, limit, offset } = getPaginationParams({
        page: filters.page,
        limit: filters.limit,
      });

      // Use Promise.all for better performance - fetch count and data in parallel
      const [countResult, allNews] = await Promise.all([
        db
          .select({ count: sql`count(*)` })
          .from(news)
          .where(whereCondition)
          .then(result => Number(result[0]?.count || 0)),
        db.query.news.findMany({
          where: whereCondition,
          orderBy: [desc(news.createdAt)],
          limit,
          offset,
        }),
      ]);

      const totalCount = countResult;
      const totalPages = Math.ceil(totalCount / limit);

      return {
        success: true,
        data: {
          data: allNews,
          pagination: {
            page,
            limit,
            total: totalCount,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
          },
        },
      };
    } catch (error) {
      return { success: false, message: 'Failed to fetch news', error };
    }
  }

  // ==================== GALLERY PAGINATION ====================
  static async getGalleryWithFilters(filters: {
    isPublished?: boolean;
    category?: string;
    page?: number;
    limit?: number;
  }): Promise<ServiceResult<PaginationResult<Gallery>>> {
    try {
      const conditions: any[] = [];

      if (filters.isPublished !== undefined) {
        conditions.push(eq(gallery.isPublished, filters.isPublished));
      }
      if (filters.category) {
        conditions.push(eq(gallery.category, filters.category));
      }

      const whereCondition =
        conditions.length > 0 ? and(...conditions) : undefined;

      // Get pagination parameters
      const { page, limit, offset } = getPaginationParams({
        page: filters.page,
        limit: filters.limit,
      });

      // Use Promise.all for better performance - fetch count and data in parallel
      const [countResult, allGallery] = await Promise.all([
        db
          .select({ count: sql`count(*)` })
          .from(gallery)
          .where(whereCondition)
          .then(result => Number(result[0]?.count || 0)),
        db.query.gallery.findMany({
          where: whereCondition,
          orderBy: [desc(gallery.createdAt)],
          limit,
          offset,
        }),
      ]);

      const totalCount = countResult;
      const totalPages = Math.ceil(totalCount / limit);

      return {
        success: true,
        data: {
          data: allGallery,
          pagination: {
            page,
            limit,
            total: totalCount,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
          },
        },
      };
    } catch (error) {
      return { success: false, message: 'Failed to fetch gallery', error };
    }
  }
}
