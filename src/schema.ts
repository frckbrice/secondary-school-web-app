import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import cuid from 'cuid';

export const users = pgTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => cuid()),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  role: text('role').notNull().default('user'), // admin, teacher, user
  fullName: text('full_name'),
  email: text('email'),
  phone: text('phone'),
  teacherSubject: text('teacher_subject'), // Subject the teacher teaches
  profileImageUrl: text('profile_image_url').default(''), // default profile image empty string
  createdAt: timestamp('created_at').defaultNow(),
});

export const students = pgTable('students', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => cuid()),
  studentId: text('student_id').notNull().unique(), // GBHS2024XXX format
  password: text('password').notNull(),
  fullName: text('full_name').notNull(),
  email: text('email'),
  phone: text('phone'),
  profileImageUrl: text('profile_image_url').default(''), // default profile image empty string
  className: text('class_name').notNull(), // Form1A, Form2B, etc.
  gender: text('gender').notNull(), // male, female
  dateOfBirth: timestamp('date_of_birth'),
  parentName: text('parent_name'),
  parentEmail: text('parent_email'),
  parentPhone: text('parent_phone'),
  address: text('address'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const news = pgTable('news', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => cuid()),
  title: text('title').notNull(),
  titleFr: text('title_fr'),
  content: text('content').notNull(),
  contentFr: text('content_fr'),
  category: text('category').notNull(), // academic, infrastructure, sports, general
  imageUrl: text('image_url'),
  isPublished: boolean('is_published').default(false),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow(),
  authorId: text('author_id').references(() => users.id),
});

export const events = pgTable('events', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => cuid()),
  title: text('title').notNull(),
  titleFr: text('title_fr'),
  description: text('description').notNull(),
  descriptionFr: text('description_fr'),
  eventDate: timestamp('event_date').notNull(),
  location: text('location'),
  category: text('category').notNull(), // academic, sports, cultural, general
  imageUrl: text('image_url'),
  isPublished: boolean('is_published').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const applications = pgTable('applications', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => cuid()),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  form: text('form').notNull(), // form1, form2, etc.
  documents: jsonb('documents'), // array of document URLs
  status: text('status').notNull().default('pending'), // pending, reviewed, accepted, rejected
  submittedAt: timestamp('submitted_at').defaultNow(),
  reviewedAt: timestamp('reviewed_at'),
  reviewedBy: text('reviewed_by').references(() => users.id),
  notes: text('notes'),
});

export const contacts = pgTable('contacts', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => cuid()),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  inquiryType: text('inquiry_type').notNull(), // admissions, academics, general, complaint, suggestion
  message: text('message').notNull(),
  status: text('status').notNull().default('new'), // new, read, responded, closed
  submittedAt: timestamp('submitted_at').defaultNow(),
  respondedAt: timestamp('responded_at'),
  respondedBy: text('responded_by').references(() => users.id),
  response: text('response'),
});

export const bookings = pgTable('bookings', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => cuid()),
  studentName: text('student_name').notNull(),
  parentName: text('parent_name').notNull(),
  parentEmail: text('parent_email').notNull(),
  parentPhone: text('parent_phone').notNull(),
  teacherName: text('teacher_name').notNull(),
  subject: text('subject').notNull(),
  preferredDate: timestamp('preferred_date').notNull(),
  preferredTime: text('preferred_time').notNull(),
  purpose: text('purpose').notNull(),
  status: text('status').notNull().default('pending'), // pending, confirmed, cancelled, completed
  confirmedDate: timestamp('confirmed_date'),
  confirmedTime: text('confirmed_time'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const gallery = pgTable('gallery', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => cuid()),
  title: text('title').notNull(),
  titleFr: text('title_fr'),
  description: text('description'),
  descriptionFr: text('description_fr'),
  imageUrl: text('image_url').notNull(),
  category: text('category').notNull(), // facilities, events, sports, academics, general
  isPublished: boolean('is_published').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const studentResults = pgTable('student_results', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => cuid()),
  studentName: text('student_name').notNull(),
  studentId: text('student_id').notNull(),
  className: text('class_name').notNull(), // Form1A, Form2B, etc.
  subject: text('subject').notNull(),
  term: text('term').notNull(), // Term1, Term2, Term3
  academicYear: text('academic_year').notNull(), // 2024-2025
  continuousAssessment: integer('continuous_assessment'), // CA marks out of 30
  examination: integer('examination'), // Exam marks out of 70
  totalMarks: integer('total_marks'), // Total out of 100
  grade: text('grade'), // A, B, C, D, E, F
  position: integer('position'), // Position in class
  remarks: text('remarks'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const anonymousReports = pgTable('anonymous_reports', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => cuid()),
  reportType: text('report_type').notNull(), // sexual_harassment, bullying, misconduct
  incidentDate: timestamp('incident_date'),
  location: text('location'),
  description: text('description').notNull(),
  involvedParties: text('involved_parties'), // Names or descriptions of people involved
  witnesses: text('witnesses'),
  evidenceDescription: text('evidence_description'),
  urgencyLevel: text('urgency_level').notNull().default('medium'), // low, medium, high, critical
  status: text('status').notNull().default('submitted'), // submitted, under_investigation, resolved, closed
  adminNotes: text('admin_notes'),
  submittedAt: timestamp('submitted_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const petitions = pgTable('petitions', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => cuid()),
  studentName: text('student_name').notNull(),
  studentId: text('student_id').notNull(),
  className: text('class_name').notNull(),
  email: text('email').notNull(),
  petitionType: text('petition_type').notNull(), // grade_appeal, academic_concern, facility_issue, policy_change
  subject: text('subject'), // Specific subject for grade appeals
  term: text('term'), // Term for grade appeals
  academicYear: text('academic_year'),
  title: text('title').notNull(),
  description: text('description').notNull(),
  requestedAction: text('requested_action').notNull(),
  supportingDocuments: jsonb('supporting_documents'), // Array of document URLs
  status: text('status').notNull().default('submitted'), // submitted, under_review, approved, rejected, closed
  adminResponse: text('admin_response'),
  responseDate: timestamp('response_date'),
  submittedAt: timestamp('submitted_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Grade Reports for teachers
export const gradeReports = pgTable('grade_reports', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => cuid()),
  teacherId: text('teacher_id')
    .references(() => users.id)
    .notNull(),
  className: text('class_name').notNull(), // e.g., "Form 1A", "Form 2B"
  subject: text('subject').notNull(),
  academicYear: text('academic_year').notNull(), // e.g., "2024-2025"
  term: text('term').notNull(), // "First Term", "Second Term", "Third Term"
  gradingPeriod: text('grading_period').notNull(), // "Sequence 1", "Sequence 2", etc.

  // Course statistics
  coursesExpected: integer('courses_expected').default(0),
  coursesDone: integer('courses_done').default(0),

  // Period statistics (in hours)
  expectedPeriodHours: integer('expected_period_hours').default(0),
  periodHoursDone: integer('period_hours_done').default(0),

  // Practical work statistics
  tpTdExpected: integer('tp_td_expected').default(0), // TP/TD expected
  tpTdDone: integer('tp_td_done').default(0), // TP/TD done

  isFinalized: boolean('is_finalized').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Individual student grades within a grade report
export const studentGrades = pgTable('student_grades', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => cuid()),
  gradeReportId: text('grade_report_id')
    .references(() => gradeReports.id)
    .notNull(),
  studentName: text('student_name').notNull(),
  gender: text('gender').notNull(), // "male", "female"
  matricule: text('matricule'), // Student ID number
  grade: integer('grade'), // Grade out of 20
  remarks: text('remarks'), // Teacher's remarks for this student
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Zod schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNewsSchema = createInsertSchema(news).omit({
  id: true,
  createdAt: true,
  publishedAt: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  submittedAt: true,
  reviewedAt: true,
  reviewedBy: true,
  status: true,
  notes: true,
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  submittedAt: true,
  respondedAt: true,
  respondedBy: true,
  status: true,
  response: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  status: true,
  confirmedDate: true,
  confirmedTime: true,
  notes: true,
});

export const insertGallerySchema = createInsertSchema(gallery).omit({
  id: true,
  createdAt: true,
});

export const insertStudentResultSchema = createInsertSchema(
  studentResults
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAnonymousReportSchema = createInsertSchema(
  anonymousReports
).omit({
  id: true,
  submittedAt: true,
  updatedAt: true,
  status: true,
  adminNotes: true,
});

export const insertPetitionSchema = createInsertSchema(petitions).omit({
  id: true,
  submittedAt: true,
  updatedAt: true,
  status: true,
  adminResponse: true,
  responseDate: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Student = typeof students.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type News = typeof news.$inferSelect;
export type InsertNews = z.infer<typeof insertNewsSchema>;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Gallery = typeof gallery.$inferSelect;
export type InsertGallery = z.infer<typeof insertGallerySchema>;
export type StudentResult = typeof studentResults.$inferSelect;
export type InsertStudentResult = z.infer<typeof insertStudentResultSchema>;
export type AnonymousReport = typeof anonymousReports.$inferSelect;
export type InsertAnonymousReport = z.infer<typeof insertAnonymousReportSchema>;
export type Petition = typeof petitions.$inferSelect;
export type InsertPetition = z.infer<typeof insertPetitionSchema>;
export type GradeReport = typeof gradeReports.$inferSelect;
export type InsertGradeReport = z.infer<typeof insertGradeReportSchema>;
export type StudentGrade = typeof studentGrades.$inferSelect;
export type InsertStudentGrade = z.infer<typeof insertStudentGradeSchema>;

// New tables for enhanced functionality
export const contributions = pgTable('contributions', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => cuid()),
  contributorName: text('contributor_name').notNull(),
  contributorEmail: text('contributor_email'),
  contributorPhone: text('contributor_phone').notNull(),
  amount: text('amount').notNull(),
  currency: text('currency').default('XAF').notNull(),
  paymentProvider: text('payment_provider').notNull(), // MTN, Orange
  transactionId: text('transaction_id'),
  purpose: text('purpose'),
  status: text('status').default('pending').notNull(), // pending, completed, failed
  graduationYear: text('graduation_year'),
  isAlumni: boolean('is_alumni').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const studentProgress = pgTable('student_progress', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => cuid()),
  studentId: text('student_id').notNull(),
  studentName: text('student_name').notNull(),
  currentClass: text('current_class').notNull(),
  previousClass: text('previous_class'),
  academicYear: text('academic_year').notNull(),
  term: text('term').notNull(),
  promoted: boolean('promoted').default(false),
  averageGrade: text('average_grade'),
  attendanceRate: text('attendance_rate'),
  disciplinaryIssues: integer('disciplinary_issues').default(0),
  extracurricularActivities: text('extracurricular_activities'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const schoolMetrics = pgTable('school_metrics', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => cuid()),
  academicYear: text('academic_year').notNull(),
  term: text('term').notNull(),
  totalStudents: integer('total_students').notNull(),
  totalTeachers: integer('total_teachers').notNull(),
  promotionRate: text('promotion_rate'),
  passRate: text('pass_rate'),
  enrollmentGrowth: text('enrollment_growth'),
  averageClassSize: text('average_class_size'),
  totalRevenue: text('total_revenue'),
  totalExpenses: text('total_expenses'),
  infrastructureScore: text('infrastructure_score'),
  sportingEvents: integer('sporting_events').default(0),
  championshipsWon: integer('championships_won').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const fileUploads = pgTable('file_uploads', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => cuid()),
  relatedType: text('related_type').notNull(), // application, complaint, report
  relatedId: text('related_id').notNull(),
  fileName: text('file_name').notNull(),
  originalName: text('original_name').notNull(),
  fileSize: integer('file_size').notNull(),
  mimeType: text('mime_type').notNull(),
  filePath: text('file_path').notNull(),
  uploadedBy: text('uploaded_by').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const subscriptions = pgTable('subscriptions', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => cuid()),
  subscriberName: text('subscriber_name').notNull(),
  subscriberEmail: text('subscriber_email'),
  subscriberPhone: text('subscriber_phone').notNull(),
  subscriptionType: text('subscription_type').notNull(), // monthly, yearly, lifetime
  amount: text('amount').notNull(),
  paymentProvider: text('payment_provider').notNull(),
  transactionId: text('transaction_id'),
  status: text('status').default('active').notNull(),
  startDate: timestamp('start_date').defaultNow(),
  endDate: timestamp('end_date'),
  graduationYear: text('graduation_year'),
  features: text('features'), // JSON string of features
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Insert schemas for new tables
export const insertContributionSchema = createInsertSchema(contributions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStudentProgressSchema = createInsertSchema(
  studentProgress
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSchoolMetricsSchema = createInsertSchema(schoolMetrics).omit(
  {
    id: true,
    createdAt: true,
    updatedAt: true,
  }
);

export const insertFileUploadSchema = createInsertSchema(fileUploads).omit({
  id: true,
  createdAt: true,
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// New types
export type Contribution = typeof contributions.$inferSelect;
export type InsertContribution = z.infer<typeof insertContributionSchema>;
export type StudentProgress = typeof studentProgress.$inferSelect;
export type InsertStudentProgress = z.infer<typeof insertStudentProgressSchema>;
export type SchoolMetrics = typeof schoolMetrics.$inferSelect;
export type InsertSchoolMetrics = z.infer<typeof insertSchoolMetricsSchema>;
export type FileUpload = typeof fileUploads.$inferSelect;
export type InsertFileUpload = z.infer<typeof insertFileUploadSchema>;
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;

export const userProfiles = pgTable('user_profiles', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => cuid()),
  userId: text('user_id')
    .references(() => users.id)
    .notNull()
    .unique(),
  profileImageUrl: text('profile_image_url'),
  bio: text('bio'),
  dateOfBirth: timestamp('date_of_birth'),
  address: text('address'),
  website: text('website'),
  socialLinks: jsonb('social_links'), // JSON object for social media links
  preferences: jsonb('preferences'), // JSON object for user preferences
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// New types
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;

export const facilities = pgTable('facilities', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => cuid()),
  name: text('name').notNull(),
  nameFr: text('name_fr'),
  description: text('description'),
  descriptionFr: text('description_fr'),
  imageUrl: text('image_url'),
  category: text('category'), // e.g., science, sports, library, etc.
  features: jsonb('features'), // array of features
  equipment: jsonb('equipment'), // array of equipment
  isPublished: boolean('is_published').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const achievements = pgTable('achievements', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => cuid()),
  title: text('title').notNull(),
  titleFr: text('title_fr'),
  description: text('description').notNull(),
  descriptionFr: text('description_fr'),
  category: text('category').notNull(), // academic, sports, cultural, leadership
  imageUrl: text('image_url'),
  date: timestamp('date'),
  isPublished: boolean('is_published').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const insertFacilitySchema = createInsertSchema(facilities).omit({
  id: true,
  createdAt: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  createdAt: true,
});

export const insertGradeReportSchema = createInsertSchema(gradeReports).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  isFinalized: true,
});

export const insertStudentGradeSchema = createInsertSchema(studentGrades).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Facility = typeof facilities.$inferSelect;
export type InsertFacility = z.infer<typeof insertFacilitySchema>;
export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
