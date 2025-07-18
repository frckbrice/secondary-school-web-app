#!/usr/bin/env node

/**
 * Test Script for User-Side Creation Forms
 * Tests the creation of bookings, applications, and contact messages from the user side
 */

import { apiRequest } from '../lib/queryClient';

interface TestResult {
  test: string;
  success: boolean;
  message: string;
  data?: any;
  error?: any;
}

class UserFormsTester {
  private results: TestResult[] = [];

  async runAllTests() {
    console.log('🚀 Starting User-Side Forms Testing...\n');

    await this.testContactForm();
    await this.testApplicationForm();
    await this.testBookingForm();

    await this.printResults();
  }

  private async testContactForm() {
    console.log('📧 Testing Contact Form...');

    const testContacts = [
      {
        name: 'Jean Pierre Mbarga',
        email: 'jean.mbarga@test.com',
        phone: '+237 691234567',
        inquiryType: 'admission_inquiry',
        message:
          'Bonjour, je souhaite des informations sur les admissions pour Form 1. Merci.',
      },
      {
        name: 'Marie Claire Nguemo',
        email: 'marie.nguemo@test.com',
        phone: '+237 692345678',
        inquiryType: 'academic_inquiry',
        message:
          'I would like to know more about the science program and laboratory facilities.',
      },
      {
        name: 'Emmanuel Tchokouani',
        email: 'emmanuel.tchokouani@test.com',
        inquiryType: 'general_inquiry',
        message: 'General information about school fees and payment methods.',
      },
    ];

    for (let i = 0; i < testContacts.length; i++) {
      const contact = testContacts[i];
      try {
        const response = await apiRequest('POST', '/api/contacts', contact);

        if (response?.ok) {
          const data = await response.json();
          this.results.push({
            test: `Contact Form Test ${i + 1}`,
            success: true,
            message: `Contact message created successfully`,
            data: data,
          });
          console.log(`✅ Contact ${i + 1} created: ${contact.name}`);
        } else {
          const errorData = await response?.json();
          this.results.push({
            test: `Contact Form Test ${i + 1}`,
            success: false,
            message: `Failed to create contact: ${errorData?.message || 'Unknown error'}`,
            error: errorData,
          });
          console.log(`❌ Contact ${i + 1} failed: ${errorData?.message}`);
        }
      } catch (error) {
        this.results.push({
          test: `Contact Form Test ${i + 1}`,
          success: false,
          message: `Exception occurred: ${error}`,
          error: error,
        });
        console.log(`❌ Contact ${i + 1} exception: ${error}`);
      }
    }
  }

  private async testApplicationForm() {
    console.log('\n📝 Testing Application Form...');

    const testApplications = [
      {
        firstName: 'Kouamé',
        lastName: "N'Guessan",
        email: 'kouame.nguessan@test.com',
        phone: '+237 693456789',
        form: 'form1',
        notes:
          'Excellent academic record from previous school. Interested in science stream.',
      },
      {
        firstName: 'Aminata',
        lastName: 'Traoré',
        email: 'aminata.traore@test.com',
        phone: '+237 694567890',
        form: 'form3',
        notes:
          'Transfer student from Douala. Strong performance in mathematics and sciences.',
      },
      {
        firstName: 'Christian',
        lastName: 'Etoa',
        email: 'christian.etoa@test.com',
        phone: '+237 695678901',
        form: 'form2',
        notes:
          'Local student with good academic background. Parents prefer English-medium instruction.',
      },
    ];

    for (let i = 0; i < testApplications.length; i++) {
      const application = testApplications[i];
      try {
        const response = await apiRequest(
          'POST',
          '/api/applications',
          application
        );

        if (response?.ok) {
          const data = await response.json();
          this.results.push({
            test: `Application Form Test ${i + 1}`,
            success: true,
            message: `Application submitted successfully`,
            data: data,
          });
          console.log(
            `✅ Application ${i + 1} submitted: ${application.firstName} ${application.lastName}`
          );
        } else {
          const errorData = await response?.json();
          this.results.push({
            test: `Application Form Test ${i + 1}`,
            success: false,
            message: `Failed to submit application: ${errorData?.message || 'Unknown error'}`,
            error: errorData,
          });
          console.log(`❌ Application ${i + 1} failed: ${errorData?.message}`);
        }
      } catch (error) {
        this.results.push({
          test: `Application Form Test ${i + 1}`,
          success: false,
          message: `Exception occurred: ${error}`,
          error: error,
        });
        console.log(`❌ Application ${i + 1} exception: ${error}`);
      }
    }
  }

  private async testBookingForm() {
    console.log('\n📅 Testing Booking Form...');

    const testBookings = [
      {
        studentName: 'Marie Claire Nguemo',
        parentName: 'Jean Pierre Nguemo',
        parentEmail: 'jean.nguemo@test.com',
        parentPhone: '+237 696789012',
        teacherName: 'Dr. Sarah Mbarga',
        subject: 'mathematics',
        purpose:
          "Discussion about Marie's performance in advanced calculus and strategies for improvement",
        preferredDate: '2024-02-15',
        preferredTime: '14:00',
        notes:
          'Marie has been struggling with calculus concepts. Parent wants to discuss additional support options.',
      },
      {
        studentName: 'Emmanuel Tchokouani',
        parentName: 'Françoise Tchokouani',
        parentEmail: 'francoise.tchokouani@test.com',
        parentPhone: '+237 697890123',
        teacherName: 'Prof. Michel Abena',
        subject: 'physics',
        purpose:
          "Review of Emmanuel's laboratory work and preparation for upcoming exams",
        preferredDate: '2024-02-16',
        preferredTime: '10:30',
        notes:
          'Emmanuel excels in theory but needs improvement in practical applications.',
      },
      {
        studentName: 'Aisha Bello',
        parentName: 'Omar Bello',
        parentEmail: 'omar.bello@test.com',
        parentPhone: '+237 698901234',
        teacherName: 'Mme. Claire Nkeng',
        subject: 'english',
        purpose:
          "Discussion about Aisha's creative writing skills and university preparation",
        preferredDate: '2024-02-17',
        preferredTime: '15:30',
        notes:
          'Aisha shows exceptional talent in creative writing. Parent wants guidance on university applications.',
      },
    ];

    for (let i = 0; i < testBookings.length; i++) {
      const booking = testBookings[i];
      try {
        const response = await apiRequest('POST', '/api/bookings', booking);

        if (response?.ok) {
          const data = await response.json();
          this.results.push({
            test: `Booking Form Test ${i + 1}`,
            success: true,
            message: `Booking created successfully`,
            data: data,
          });
          console.log(
            `✅ Booking ${i + 1} created: ${booking.studentName} with ${booking.teacherName}`
          );
        } else {
          const errorData = await response?.json();
          this.results.push({
            test: `Booking Form Test ${i + 1}`,
            success: false,
            message: `Failed to create booking: ${errorData?.message || 'Unknown error'}`,
            error: errorData,
          });
          console.log(`❌ Booking ${i + 1} failed: ${errorData?.message}`);
        }
      } catch (error) {
        this.results.push({
          test: `Booking Form Test ${i + 1}`,
          success: false,
          message: `Exception occurred: ${error}`,
          error: error,
        });
        console.log(`❌ Booking ${i + 1} exception: ${error}`);
      }
    }
  }

  private async printResults() {
    console.log('\n📊 Test Results Summary:');
    console.log('='.repeat(50));

    const passed = this.results.filter(r => r.success).length;
    const failed = this.results.filter(r => !r.success).length;
    const total = this.results.length;

    console.log(`Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

    console.log('\n📋 Detailed Results:');
    console.log('='.repeat(50));

    this.results.forEach((result, index) => {
      const status = result.success ? '✅' : '❌';
      console.log(`${index + 1}. ${status} ${result.test}`);
      console.log(`   Message: ${result.message}`);
      if (result.error) {
        console.log(`   Error: ${JSON.stringify(result.error, null, 2)}`);
      }
      console.log('');
    });

    // Test form validation
    console.log('\n🔍 Testing Form Validation...');
    console.log('='.repeat(50));

    await this.testFormValidation();
  }

  private async testFormValidation() {
    const validationTests = [
      {
        name: 'Contact Form - Missing Required Fields',
        data: {
          name: 'Test User',
          // Missing email, inquiryType, message
        },
        endpoint: '/api/contacts',
        expectedError: 'Name, email, inquiry type, and message are required',
      },
      {
        name: 'Application Form - Missing Required Fields',
        data: {
          firstName: 'Test',
          // Missing lastName, email, phone, form
        },
        endpoint: '/api/applications',
        expectedError:
          'First name, last name, email, phone, and form are required',
      },
      {
        name: 'Booking Form - Missing Required Fields',
        data: {
          studentName: 'Test Student',
          // Missing other required fields
        },
        endpoint: '/api/bookings',
        expectedError: 'Validation failed',
      },
    ];

    for (const test of validationTests) {
      try {
        const response = await apiRequest('POST', test.endpoint, test.data);

        if (response?.ok) {
          console.log(`❌ ${test.name}: Should have failed but succeeded`);
        } else {
          const errorData = await response?.json();
          if (
            errorData?.message?.includes(test.expectedError) ||
            errorData?.message?.includes('Validation failed')
          ) {
            console.log(
              `✅ ${test.name}: Correctly rejected with validation error`
            );
          } else {
            console.log(
              `⚠️  ${test.name}: Rejected but with unexpected error: ${errorData?.message}`
            );
          }
        }
      } catch (error) {
        console.log(`✅ ${test.name}: Correctly rejected with exception`);
      }
    }
  }
}

// Run the tests if this file is executed directly
if (require.main === module) {
  const tester = new UserFormsTester();
  tester.runAllTests().catch(console.error);
}

export default UserFormsTester;
