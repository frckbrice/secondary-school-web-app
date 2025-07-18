# Student Portal Testing Guide

## Overview

This guide provides comprehensive testing instructions for all features in the Student Portal, including Create operations (Report, Petition), Read operations (Results), and Status tracking.

## 🎯 Testing Objectives

- Verify all UI/UX improvements work correctly
- Test all CRUD operations for petitions and reports
- Validate form submissions and data persistence
- Test pagination, filtering, and search functionality
- Verify responsive design and accessibility
- Test bilingual support (French/English)

---

## 📋 Pre-Testing Setup

### 1. Environment Preparation

```bash
# Ensure the development server is running
yarn dev

# Check database connection
# Verify all API endpoints are accessible
```

### 2. Test Data Requirements

- At least 3-5 sample petitions with different statuses
- Sample anonymous reports with various urgency levels
- Student results data for different classes and terms
- Admin responses for some petitions

---

## 🧪 Feature Testing

## 1. **REPORT (Anonymous Reporting) - CREATE Operation**

### 1.1 UI/UX Testing

**Test Case:** Visual Design and Layout

- [ ] **Header Design**: Verify gradient background (red-orange-yellow) with shield icon
- [ ] **Alert Section**: Check confidentiality notice with red border and warning icon
- [ ] **Form Layout**: Confirm proper spacing, typography, and visual hierarchy
- [ ] **Input Styling**: Verify enhanced input fields with focus states
- [ ] **Color Coding**: Check type and urgency level options have color indicators

### 1.2 Form Validation Testing

**Test Case:** Required Field Validation

- [ ] **Report Type**: Must be selected (sexual_harassment, bullying, violence, academic_misconduct, other)
- [ ] **Urgency Level**: Must be selected (low, medium, high)
- [ ] **Description**: Must be filled with detailed incident description
- [ ] **Optional Fields**: Location, date, involved parties, witnesses, evidence

**Test Case:** Field Validation

```javascript
// Test invalid submissions
- Empty required fields → Should show validation errors
- Invalid email format → Should show format error
- Date in future → Should show date validation error
```

### 1.3 Form Submission Testing

**Test Case:** Successful Submission

```javascript
// Test data for successful submission
{
  reportType: "bullying",
  urgencyLevel: "high",
  description: "Detailed incident description...",
  location: "School cafeteria",
  incidentDate: "2024-01-15",
  involvedParties: "John Doe, Jane Smith",
  witnesses: "Mike Johnson",
  evidenceDescription: "Photos and messages available"
}
```

**Expected Results:**

- [ ] Form submits without errors
- [ ] Success toast notification appears
- [ ] Form resets to default values
- [ ] Data appears in admin dashboard (if accessible)

**Test Case:** Error Handling

- [ ] Network error → Show error toast
- [ ] Server error → Display appropriate error message
- [ ] Validation error → Show field-specific errors

### 1.4 Responsive Design Testing

- [ ] **Desktop**: Full form layout with side-by-side fields
- [ ] **Tablet**: Responsive grid layout
- [ ] **Mobile**: Stacked layout with proper touch targets

---

## 2. **PETITION - CREATE Operation**

### 2.1 UI/UX Testing

**Test Case:** Visual Design and Layout

- [ ] **Header Design**: Verify gradient background (blue-indigo-purple) with message icon
- [ ] **Form Sections**: Check organized sections (Student Info, Contact Info, Petition Details)
- [ ] **Color Coding**: Verify petition type options have color indicators
- [ ] **Enhanced Inputs**: Confirm styled inputs with focus states

### 2.2 Form Validation Testing

**Test Case:** Required Field Validation

- [ ] **Petition Type**: Must be selected (grade_appeal, academic_concern, disciplinary_appeal, other)
- [ ] **Academic Year**: Must be selected (2024-2025, 2023-2024, 2022-2023)
- [ ] **Student Information**: Name, ID, Class (all required)
- [ ] **Email**: Valid email format required
- [ ] **Title**: Petition title required
- [ ] **Description**: Detailed description required
- [ ] **Requested Action**: Specific action required

### 2.3 Form Submission Testing

**Test Case:** Successful Submission

```javascript
// Test data for successful petition submission
{
  petitionType: "grade_appeal",
  academicYear: "2024-2025",
  studentName: "John Doe",
  studentId: "STU2024001",
  className: "Form 3A",
  email: "john.doe@example.com",
  title: "Appeal for Mathematics Grade",
  description: "Detailed explanation of the grade appeal...",
  requestedAction: "Request grade review and possible adjustment"
}
```

**Expected Results:**

- [ ] Form submits successfully
- [ ] Success notification appears
- [ ] Form resets to default values
- [ ] Petition appears in Status tab

### 2.4 Section Organization Testing

- [ ] **Student Information Section**: Gray background, organized layout
- [ ] **Contact Information Section**: Blue background, email field
- [ ] **Petition Details Section**: Proper spacing and typography

---

## 3. **RESULTS - READ Operation**

### 3.1 UI/UX Testing

**Test Case:** Visual Design and Layout

- [ ] **Header Design**: Verify gradient background (green-blue) with book icon
- [ ] **Filters Section**: Check filter card with search, class, and term filters
- [ ] **Results Table**: Verify enhanced table design with proper spacing
- [ ] **Pagination**: Check pagination controls and information display

### 3.2 Data Display Testing

**Test Case:** Results Table

- [ ] **Student Name**: Properly displayed
- [ ] **Class**: Correct class information
- [ ] **Subject**: Subject name displayed
- [ ] **Continuous Assessment**: Score out of 30
- [ ] **Examination**: Score out of 70
- [ ] **Total Marks**: Total out of 100
- [ ] **Grade**: Color-coded grade display
- [ ] **Position**: Position badge if available

### 3.3 Filtering and Search Testing

**Test Case:** Search Functionality

- [ ] **Student Name Search**: Search by student name or ID
- [ ] **Class Filter**: Filter by specific class
- [ ] **Term Filter**: Filter by academic term
- [ ] **Combined Filters**: Multiple filters work together

**Test Case:** Pagination

- [ ] **Items Per Page**: 5, 10, 20, 50 options
- [ ] **Page Navigation**: Previous/Next buttons
- [ ] **Page Numbers**: Direct page navigation
- [ ] **Results Count**: Display current range and total

### 3.4 Action Buttons Testing

**Test Case:** Table Actions

- [ ] **View Button**: Opens result details (if implemented)
- [ ] **Edit Button**: Opens edit form (if implemented)
- [ ] **Delete Button**: Confirms deletion (if implemented)

---

## 4. **STATUS - READ Operation**

### 4.1 UI/UX Testing

**Test Case:** Visual Design and Layout

- [ ] **Header Design**: Verify gradient background (green-emerald-teal) with trending icon
- [ ] **Petition Cards**: Enhanced card design with proper spacing
- [ ] **Status Indicators**: Color-coded status badges
- [ ] **Response Sections**: Properly styled admin response areas

### 4.2 Data Display Testing

**Test Case:** Petition Information

- [ ] **Title**: Petition title prominently displayed
- [ ] **Status Badge**: Color-coded status (pending, approved, rejected, etc.)
- [ ] **Submission Date**: Proper date formatting
- [ ] **Petition Type**: Type badge with color coding
- [ ] **Description**: Full description in styled container
- [ ] **Requested Action**: Action details in blue container

### 4.3 Admin Response Testing

**Test Case:** Response Display

- [ ] **With Response**: Green container with response details
- [ ] **Without Response**: Yellow container with "awaiting response"
- [ ] **Response Date**: Date of admin response
- [ ] **Response Content**: Full response text

### 4.4 Supporting Documents Testing

**Test Case:** Document Display

- [ ] **Document List**: Shows supporting documents if available
- [ ] **Document Badges**: Properly styled document indicators
- [ ] **Document Count**: Correct number of documents

### 4.5 Empty State Testing

**Test Case:** No Petitions

- [ ] **Empty State**: Proper empty state design
- [ ] **Call to Action**: Button to submit new petition
- [ ] **Helpful Text**: Clear instructions for next steps

---

## 5. **GENERAL FEATURES TESTING**

### 5.1 Navigation Testing

**Test Case:** Sidebar Navigation

- [ ] **Overview Tab**: Displays dashboard with stats
- [ ] **Results Tab**: Shows academic results
- [ ] **Report Tab**: Opens anonymous reporting form
- [ ] **Petition Tab**: Opens petition submission form
- [ ] **Status Tab**: Shows petition status

### 5.2 Top Navigation Testing

**Test Case:** Header Controls

- [ ] **Home Button**: Navigates to main site
- [ ] **Language Toggle**: Switches between French/English
- [ ] **Theme Toggle**: Switches between light/dark mode
- [ ] **Profile Button**: User profile access
- [ ] **Logout Button**: Proper logout functionality

### 5.3 Responsive Design Testing

**Test Case:** Mobile Responsiveness

- [ ] **Sidebar**: Collapses properly on mobile
- [ ] **Forms**: Stack properly on small screens
- [ ] **Tables**: Responsive table design
- [ ] **Cards**: Proper card layout on mobile

### 5.4 Accessibility Testing

**Test Case:** Accessibility Features

- [ ] **Keyboard Navigation**: All elements accessible via keyboard
- [ ] **Screen Reader**: Proper ARIA labels
- [ ] **Color Contrast**: Sufficient contrast ratios
- [ ] **Focus Indicators**: Clear focus states

---

## 6. **API INTEGRATION TESTING**

### 6.1 Report API Testing

```bash
# Test POST /api/anonymous-reports
curl -X POST http://localhost:3000/api/anonymous-reports \
  -H "Content-Type: application/json" \
  -d '{
    "reportType": "bullying",
    "urgencyLevel": "high",
    "description": "Test report",
    "location": "Test location"
  }'
```

### 6.2 Petition API Testing

```bash
# Test POST /api/petitions
curl -X POST http://localhost:3000/api/petitions \
  -H "Content-Type: application/json" \
  -d '{
    "petitionType": "grade_appeal",
    "studentName": "Test Student",
    "studentId": "TEST001",
    "className": "Form 3A",
    "email": "test@example.com",
    "title": "Test Petition",
    "description": "Test description",
    "requestedAction": "Test action"
  }'
```

### 6.3 Results API Testing

```bash
# Test GET /api/student-results
curl "http://localhost:3000/api/student-results?page=1&limit=10"
```

---

## 7. **ERROR HANDLING TESTING**

### 7.1 Network Error Testing

- [ ] **Offline Mode**: Handle network disconnection
- [ ] **Slow Connection**: Show loading states
- [ ] **Server Errors**: Display appropriate error messages

### 7.2 Form Error Testing

- [ ] **Validation Errors**: Field-specific error messages
- [ ] **Submission Errors**: Server error handling
- [ ] **Required Fields**: Clear indication of missing fields

---

## 8. **PERFORMANCE TESTING**

### 8.1 Load Testing

- [ ] **Large Datasets**: Handle 100+ petitions/results
- [ ] **Pagination**: Smooth pagination with large datasets
- [ ] **Search Performance**: Fast search with large datasets

### 8.2 UI Performance

- [ ] **Smooth Animations**: No lag in transitions
- [ ] **Form Responsiveness**: Quick form interactions
- [ ] **Table Rendering**: Fast table updates

---

## 9. **SECURITY TESTING**

### 9.1 Input Validation

- [ ] **XSS Prevention**: Sanitize user inputs
- [ ] **SQL Injection**: Validate database queries
- [ ] **File Upload**: Secure file handling (if applicable)

### 9.2 Authentication

- [ ] **Session Management**: Proper session handling
- [ ] **Authorization**: Access control verification
- [ ] **Logout**: Proper session termination

---

## 10. **TESTING CHECKLIST**

### Pre-Testing

- [ ] Development server running
- [ ] Database connected and populated
- [ ] All dependencies installed
- [ ] Browser cache cleared

### During Testing

- [ ] Test each feature systematically
- [ ] Document any bugs or issues
- [ ] Verify expected vs actual behavior
- [ ] Test edge cases and error scenarios

### Post-Testing

- [ ] Compile test results
- [ ] Document any issues found
- [ ] Verify fixes for identified problems
- [ ] Update test cases if needed

---

## 🐛 Common Issues and Solutions

### Issue 1: Form Submission Fails

**Solution:** Check API endpoint, network connection, and form validation

### Issue 2: Data Not Loading

**Solution:** Verify API responses, database connection, and data availability

### Issue 3: UI Not Responsive

**Solution:** Check CSS classes, responsive breakpoints, and viewport settings

### Issue 4: Language Not Switching

**Solution:** Verify language context, translation files, and state management

---

## 📊 Success Criteria

### UI/UX Success Criteria

- [ ] All sections have modern, visually appealing design
- [ ] Forms are intuitive and easy to use
- [ ] Responsive design works on all screen sizes
- [ ] Accessibility standards are met

### Functionality Success Criteria

- [ ] All CRUD operations work correctly
- [ ] Form validation prevents invalid submissions
- [ ] Data displays correctly in all views
- [ ] Pagination and filtering work properly

### Performance Success Criteria

- [ ] Page load times under 3 seconds
- [ ] Form submissions complete within 2 seconds
- [ ] Smooth animations and transitions
- [ ] No memory leaks or performance issues

---

## 📝 Test Report Template

### Test Summary

- **Date**: [Date]
- **Tester**: [Name]
- **Environment**: [Development/Staging/Production]
- **Browser**: [Browser and Version]

### Test Results

- **Total Tests**: [Number]
- **Passed**: [Number]
- **Failed**: [Number]
- **Success Rate**: [Percentage]

### Issues Found

1. **Issue 1**: [Description] - [Severity] - [Status]
2. **Issue 2**: [Description] - [Severity] - [Status]

### Recommendations

- [Recommendation 1]
- [Recommendation 2]

---

This testing guide ensures comprehensive coverage of all student portal features and helps maintain high quality standards for the application.
