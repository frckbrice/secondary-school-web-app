# API Routes Documentation

## Overview

This document describes the nested API route structure for the GBHS Bafia School Management System. All routes follow RESTful conventions and use nested resources to avoid multiple routes for the same resource.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Most routes require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow this format:

```json
{
  "success": true|false,
  "message": "Optional message",
  "data": {...} // or specific resource name like "students", "grades", etc.
}
```

---

## Students API

### Get All Students

```
GET /students
```

### Create Student

```
POST /students
Content-Type: application/json

{
  "studentId": "GBHS2024001",
  "fullName": "John Doe",
  "password": "password123",
  "email": "john@example.com",
  "phone": "+237612345678",
  "className": "Form 1A",
  "gender": "male",
  "dateOfBirth": "2008-03-15",
  "parentName": "Parent Name",
  "parentEmail": "parent@example.com",
  "parentPhone": "+237612345679",
  "address": "123 Main Street, Bafia"
}
```

### Get Student by ID or Student ID

```
GET /students/{id}
```

Supports both numeric ID and student ID (e.g., GBHS2024001)

### Update Student

```
PUT /students/{id}
Content-Type: application/json

{
  "fullName": "Updated Name",
  "email": "updated@example.com",
  "className": "Form 2A"
}
```

### Delete Student

```
DELETE /students/{id}
```

### Get Student Grades

```
GET /students/{id}/grades
GET /students/{id}/grades?subject=Mathematics&academicYear=2024-2025&term=First Term
```

### Create Student Grade

```
POST /students/{id}/grades
Content-Type: application/json

{
  "gradeReportId": 1,
  "studentName": "John Doe",
  "gender": "male",
  "matricule": "001",
  "grade": 15,
  "remarks": "Excellent work"
}
```

### Get Student Progress

```
GET /students/{id}/progress
GET /students/{id}/progress?academicYear=2024-2025&term=First Term&currentClass=Form 1A
```

### Create Student Progress

```
POST /students/{id}/progress
Content-Type: application/json

{
  "studentName": "John Doe",
  "currentClass": "Form 1A",
  "academicYear": "2024-2025",
  "term": "First Term",
  "promoted": true,
  "averageGrade": "15/20",
  "attendanceRate": "95%",
  "disciplinaryIssues": 0,
  "extracurricularActivities": "Science Club, Debate Team",
  "notes": "Excellent performance"
}
```

### Get Student Results

```
GET /students/{id}/results
GET /students/{id}/results?academicYear=2024-2025&term=First Term
```

### Create Student Result

```
POST /students/{id}/results
Content-Type: application/json

{
  "studentName": "John Doe",
  "className": "Form 1A",
  "subject": "Mathematics",
  "term": "First Term",
  "academicYear": "2024-2025",
  "continuousAssessment": 25,
  "examination": 65,
  "totalMarks": 90,
  "grade": "A",
  "position": 3,
  "remarks": "Excellent performance"
}
```

---

## Teachers API

### Get Teacher Grade Reports

```
GET /teachers/{id}/grade-reports
GET /teachers/{id}/grade-reports?academicYear=2024-2025&term=First Term
```

### Create Teacher Grade Report

```
POST /teachers/{id}/grade-reports
Content-Type: application/json

{
  "className": "Form 1A",
  "subject": "Mathematics",
  "academicYear": "2024-2025",
  "term": "First Term",
  "gradingPeriod": "Sequence 1",
  "coursesExpected": 8,
  "coursesDone": 6,
  "expectedPeriodHours": 40,
  "periodHoursDone": 32,
  "tpTdExpected": 4,
  "tpTdDone": 3
}
```

---

## Applications API

### Get All Applications

```
GET /applications
```

### Create Application

```
POST /applications
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+237612345678",
  "form": "form1",
  "documents": ["url1", "url2"]
}
```

### Get Application by ID

```
GET /applications/{id}
```

### Update Application

```
PUT /applications/{id}
Content-Type: application/json

{
  "status": "reviewed",
  "reviewerId": 1,
  "notes": "Application reviewed"
}
```

### Update Application Status

```
PUT /applications/{id}/status
Content-Type: application/json

{
  "status": "accepted",
  "reviewerId": 1,
  "notes": "Application accepted"
}
```

Status options: `pending`, `reviewed`, `accepted`, `rejected`

---

## Contacts API

### Get All Contacts

```
GET /contacts
```

### Create Contact

```
POST /contacts
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+237612345678",
  "inquiryType": "admissions",
  "message": "I would like to inquire about admission"
}
```

### Get Contact by ID

```
GET /contacts/{id}
```

### Update Contact

```
PUT /contacts/{id}
Content-Type: application/json

{
  "status": "responded",
  "responderId": 1,
  "response": "Thank you for your inquiry. We will get back to you soon."
}
```

### Update Contact Status

```
PUT /contacts/{id}/status
Content-Type: application/json

{
  "status": "closed",
  "responderId": 1,
  "response": "Issue resolved"
}
```

Status options: `new`, `read`, `responded`, `closed`

---

## Grade Reports API

### Get All Grade Reports

```
GET /grade-reports
GET /grade-reports?teacherId=1&academicYear=2024-2025&term=First Term
```

### Create Grade Report

```
POST /grade-reports
Content-Type: application/json

{
  "teacherId": 1,
  "className": "Form 1A",
  "subject": "Mathematics",
  "academicYear": "2024-2025",
  "term": "First Term",
  "gradingPeriod": "Sequence 1",
  "coursesExpected": 8,
  "coursesDone": 6,
  "expectedPeriodHours": 40,
  "periodHoursDone": 32,
  "tpTdExpected": 4,
  "tpTdDone": 3
}
```

### Get Grade Report by ID

```
GET /grade-reports/{id}
```

### Get Student Grades for a Grade Report

```
GET /grade-reports/{id}/grades
```

### Create Student Grade for a Grade Report

```
POST /grade-reports/{id}/grades
Content-Type: application/json

{
  "studentName": "John Doe",
  "gender": "male",
  "matricule": "001",
  "grade": 15,
  "remarks": "Excellent work"
}
```

---

## Other Resources

### News

```
GET /news
GET /news?isPublished=true
POST /news
GET /news/{id}
PUT /news/{id}
DELETE /news/{id}
```

### Events

```
GET /events
GET /events?isPublished=true
POST /events
GET /events/{id}
PUT /events/{id}
DELETE /events/{id}
```

### Gallery

```
GET /gallery
GET /gallery?isPublished=true
POST /gallery
GET /gallery/{id}
PUT /gallery/{id}
DELETE /gallery/{id}
```

### Users

```
GET /users
POST /users
GET /users/{id}
PUT /users/{id}
DELETE /users/{id}
```

### Authentication

```
POST /auth/login
POST /auth/register
POST /auth/logout
POST /auth/student-login
```

---

## Error Handling

All API routes return consistent error responses:

### 400 Bad Request

```json
{
  "success": false,
  "message": "Validation error message"
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Authentication required"
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Benefits of Nested Routes

1. **Logical Organization**: Related resources are grouped together
2. **Clear Hierarchy**: Shows relationships between resources
3. **Consistent URLs**: Follows REST conventions
4. **Easier Maintenance**: Related functionality is co-located
5. **Better Documentation**: Clear structure makes APIs easier to understand

## Examples

### Student-centric operations:

- `GET /students/GBHS2024001` - Get student info
- `GET /students/GBHS2024001/grades` - Get student's grades
- `GET /students/GBHS2024001/progress` - Get student's progress
- `GET /students/GBHS2024001/results` - Get student's results

### Teacher-centric operations:

- `GET /teachers/1dfdsgsdgdgdsgdsgdgds/grade-reports` - Get teacher's grade reports

### Application management:

- `GET /applications/dfdsfsdfsdfdfdsfewfwef` - Get application details
- `PUT /applications/fdfewfwefwefefwefwefe/status` - Update application status

This structure makes the API intuitive and follows REST best practices.

_Review Date: July 10, 2025_  
_Tested By: Avom brice, software engineer_  
_Environment: Development (localhost:3000)_
