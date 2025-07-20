import { db } from '../db';
import { users, students } from '../../schema';
import { eq } from 'drizzle-orm';
import { compare, hash } from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthResult {
  success: boolean;
  user?: any;
  token?: string;
  message?: string;
}

export interface UserData {
  id: string;
  username: string;
  fullName: string | null;
  email: string | null;
  role: string;
  teacherSubject: string | null;
  profileImageUrl: string | null;
}

export class AuthService {
  /**
   * Authenticate a user with username and password
   */
  static async authenticateUser(
    username: string,
    password: string
  ): Promise<AuthResult> {
    try {
      // First try to find user in users table
      const user = await db.query.users.findFirst({
        where: eq(users.username, username),
      });

      if (user) {
        const isValidPassword = await compare(password, user.password);
        if (!isValidPassword) {
          return {
            success: false,
            message: 'Invalid credentials',
          };
        }

        const token = jwt.sign(
          { userId: user.id, username: user.username, role: user.role },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        return {
          success: true,
          user: {
            id: user.id,
            username: user.username,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            teacherSubject: user.teacherSubject,
            profileImageUrl: user.profileImageUrl,
          },
          token,
        };
      }

      // If not found in users table, try students table
      const student = await db.query.students.findFirst({
        where: eq(students.studentId, username),
      });

      if (student && student.isActive) {
        const isValidPassword = await compare(password, student.password);
        if (!isValidPassword) {
          return {
            success: false,
            message: 'Invalid credentials for this student',
          };
        }

        const token = jwt.sign(
          { userId: student.id, username: student.studentId, role: 'student' },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        return {
          success: true,
          user: {
            id: student.id,
            username: student.studentId,
            fullName: student.fullName,
            email: student.email,
            role: 'student',
            teacherSubject: null,
            profileImageUrl: student.profileImageUrl,
          },
          token,
        };
      }

      return {
        success: false,
        message: 'Invalid credentials',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Internal server error',
      };
    }
  }

  /**
   * Register a new user
   */
  static async registerUser(userData: {
    username: string;
    password: string;
    fullName?: string;
    email?: string;
    role?: string;
    teacherSubject?: string;
  }): Promise<AuthResult> {
    try {
      // Check if user already exists
      const existingUser = await db.query.users.findFirst({
        where: eq(users.username, userData.username),
      });

      if (existingUser) {
        return {
          success: false,
          message: 'Username already exists',
        };
      }

      // Hash password
      const hashedPassword = await hash(userData.password, 10);

      // Create user
      const [newUser] = await db
        .insert(users)
        .values({
          username: userData.username,
          password: hashedPassword,
          fullName: userData.fullName,
          email: userData.email,
          role: userData.role || 'user',
          teacherSubject: userData.teacherSubject,
        })
        .returning();

      const token = jwt.sign(
        {
          userId: newUser.id,
          username: newUser.username,
          role: newUser.role,
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return {
        success: true,
        user: {
          id: newUser.id,
          username: newUser.username,
          fullName: newUser.fullName,
          email: newUser.email,
          role: newUser.role,
          teacherSubject: newUser.teacherSubject,
          profileImageUrl: newUser.profileImageUrl,
        },
        token,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Internal server error',
      };
    }
  }

  /**
   * Validate JWT token and return user data
   */
  static async validateToken(token: string): Promise<AuthResult> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;

      // Try to find user in users table first
      const user = await db.query.users.findFirst({
        where: eq(users.id, decoded.userId),
      });

      if (user) {
        return {
          success: true,
          user: {
            id: user.id,
            username: user.username,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            teacherSubject: user.teacherSubject,
            profileImageUrl: user.profileImageUrl,
          },
        };
      }

      // If not found in users table, try students table
      const student = await db.query.students.findFirst({
        where: eq(students.id, decoded.userId),
      });

      if (student && student.isActive) {
        return {
          success: true,
          user: {
            id: student.id,
            username: student.studentId,
            fullName: student.fullName,
            email: student.email,
            role: 'student',
            teacherSubject: null,
            profileImageUrl: student.profileImageUrl,
          },
        };
      }

      return {
        success: false,
        message: 'User not found',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Invalid or expired token',
      };
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(id: string): Promise<UserData | null> {
    try {
      // Try users table first
      const user = await db.query.users.findFirst({
        where: eq(users.id, id),
      });

      if (user) {
        return {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          teacherSubject: user.teacherSubject,
          profileImageUrl: user.profileImageUrl,
        };
      }

      // Try students table
      const student = await db.query.students.findFirst({
        where: eq(students.id, id),
      });

      if (student && student.isActive) {
        return {
          id: student.id,
          username: student.studentId,
          fullName: student.fullName,
          email: student.email,
          role: 'student',
          teacherSubject: null,
          profileImageUrl: student.profileImageUrl,
        };
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(
    id: string,
    updates: Partial<{
      fullName: string;
      email: string;
      teacherSubject: string;
    }>
  ): Promise<AuthResult> {
    try {
      // Try to update in users table first
      const [updatedUser] = await db
        .update(users)
        .set(updates)
        .where(eq(users.id, id))
        .returning();

      if (updatedUser) {
        return {
          success: true,
          user: {
            id: updatedUser.id,
            username: updatedUser.username,
            fullName: updatedUser.fullName,
            email: updatedUser.email,
            role: updatedUser.role,
            teacherSubject: updatedUser.teacherSubject,
            profileImageUrl: updatedUser.profileImageUrl,
          },
        };
      }

      // Try to update in students table
      const [updatedStudent] = await db
        .update(students)
        .set(updates)
        .where(eq(students.id, id))
        .returning();

      if (updatedStudent) {
        return {
          success: true,
          user: {
            id: updatedStudent.id,
            username: updatedStudent.studentId,
            fullName: updatedStudent.fullName,
            email: updatedStudent.email,
            role: 'student',
            teacherSubject: null,
            profileImageUrl: updatedStudent.profileImageUrl,
          },
        };
      }

      return {
        success: false,
        message: 'User not found',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Internal server error',
      };
    }
  }
}
