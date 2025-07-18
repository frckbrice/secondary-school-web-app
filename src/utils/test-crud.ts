// Comprehensive CRUD Test Script for Admin Management Components
// This script tests all Create, Read, Update, Delete operations

import {
  mockBookingData,
  mockApplicationData,
  mockContactData,
} from './mock-data';

export interface CRUDTestResult {
  component: string;
  operation: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE';
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export class CRUDTester {
  private results: CRUDTestResult[] = [];

  // Test Booking Management CRUD
  async testBookingCRUD(): Promise<CRUDTestResult[]> {
    const testData = mockBookingData.sampleBookings[0];

    try {
      // Test CREATE
      const createResponse = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData),
      });

      if (createResponse.ok) {
        const createdBooking = await createResponse.json();
        this.results.push({
          component: 'Booking Management',
          operation: 'CREATE',
          success: true,
          message: 'Booking created successfully',
          data: createdBooking,
        });

        // Test READ
        const readResponse = await fetch('/api/bookings?page=1&limit=10');
        if (readResponse.ok) {
          const bookings = await readResponse.json();
          this.results.push({
            component: 'Booking Management',
            operation: 'READ',
            success: true,
            message: 'Bookings fetched successfully',
            data: bookings,
          });
        }

        // Test UPDATE (if we have the created booking ID)
        if (createdBooking.booking?.id) {
          const updateData = { ...testData, status: 'confirmed' };
          const updateResponse = await fetch(
            `/api/bookings/${createdBooking.booking.id}`,
            {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updateData),
            }
          );

          if (updateResponse.ok) {
            this.results.push({
              component: 'Booking Management',
              operation: 'UPDATE',
              success: true,
              message: 'Booking updated successfully',
            });
          }
        }

        // Test DELETE (if we have the created booking ID)
        if (createdBooking.booking?.id) {
          const deleteResponse = await fetch(
            `/api/bookings/${createdBooking.booking.id}`,
            {
              method: 'DELETE',
            }
          );

          if (deleteResponse.ok) {
            this.results.push({
              component: 'Booking Management',
              operation: 'DELETE',
              success: true,
              message: 'Booking deleted successfully',
            });
          }
        }
      } else {
        this.results.push({
          component: 'Booking Management',
          operation: 'CREATE',
          success: false,
          message: 'Failed to create booking',
          error: await createResponse.text(),
        });
      }
    } catch (error) {
      this.results.push({
        component: 'Booking Management',
        operation: 'CREATE',
        success: false,
        message: 'Error testing booking CRUD',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    return this.results.filter(r => r.component === 'Booking Management');
  }

  // Test Application Management CRUD
  async testApplicationCRUD(): Promise<CRUDTestResult[]> {
    const testData = mockApplicationData.sampleApplications[0];

    try {
      // Test CREATE
      const createResponse = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData),
      });

      if (createResponse.ok) {
        const createdApplication = await createResponse.json();
        this.results.push({
          component: 'Application Management',
          operation: 'CREATE',
          success: true,
          message: 'Application created successfully',
          data: createdApplication,
        });

        // Test READ
        const readResponse = await fetch('/api/applications?page=1&limit=10');
        if (readResponse.ok) {
          const applications = await readResponse.json();
          this.results.push({
            component: 'Application Management',
            operation: 'READ',
            success: true,
            message: 'Applications fetched successfully',
            data: applications,
          });
        }

        // Test UPDATE (if we have the created application ID)
        if (createdApplication.application?.id) {
          const updateData = { ...testData, status: 'approved' };
          const updateResponse = await fetch(
            `/api/applications/${createdApplication.application.id}/status`,
            {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updateData),
            }
          );

          if (updateResponse.ok) {
            this.results.push({
              component: 'Application Management',
              operation: 'UPDATE',
              success: true,
              message: 'Application updated successfully',
            });
          }
        }

        // Test DELETE (if we have the created application ID)
        if (createdApplication.application?.id) {
          const deleteResponse = await fetch(
            `/api/applications/${createdApplication.application.id}`,
            {
              method: 'DELETE',
            }
          );

          if (deleteResponse.ok) {
            this.results.push({
              component: 'Application Management',
              operation: 'DELETE',
              success: true,
              message: 'Application deleted successfully',
            });
          }
        }
      } else {
        this.results.push({
          component: 'Application Management',
          operation: 'CREATE',
          success: false,
          message: 'Failed to create application',
          error: await createResponse.text(),
        });
      }
    } catch (error) {
      this.results.push({
        component: 'Application Management',
        operation: 'CREATE',
        success: false,
        message: 'Error testing application CRUD',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    return this.results.filter(r => r.component === 'Application Management');
  }

  // Test Contact Management CRUD
  async testContactCRUD(): Promise<CRUDTestResult[]> {
    const testData = mockContactData.sampleContacts[0];

    try {
      // Test CREATE
      const createResponse = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData),
      });

      if (createResponse.ok) {
        const createdContact = await createResponse.json();
        this.results.push({
          component: 'Contact Management',
          operation: 'CREATE',
          success: true,
          message: 'Contact created successfully',
          data: createdContact,
        });

        // Test READ
        const readResponse = await fetch('/api/contacts?page=1&limit=10');
        if (readResponse.ok) {
          const contacts = await readResponse.json();
          this.results.push({
            component: 'Contact Management',
            operation: 'READ',
            success: true,
            message: 'Contacts fetched successfully',
            data: contacts,
          });
        }

        // Test UPDATE (if we have the created contact ID)
        if (createdContact.contact?.id) {
          const updateData = {
            status: 'responded',
            response: 'Thank you for your inquiry',
          };
          const updateResponse = await fetch(
            `/api/contacts/${createdContact.contact.id}/status`,
            {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updateData),
            }
          );

          if (updateResponse.ok) {
            this.results.push({
              component: 'Contact Management',
              operation: 'UPDATE',
              success: true,
              message: 'Contact updated successfully',
            });
          }
        }

        // Test DELETE (if we have the created contact ID)
        if (createdContact.contact?.id) {
          const deleteResponse = await fetch(
            `/api/contacts/${createdContact.contact.id}`,
            {
              method: 'DELETE',
            }
          );

          if (deleteResponse.ok) {
            this.results.push({
              component: 'Contact Management',
              operation: 'DELETE',
              success: true,
              message: 'Contact deleted successfully',
            });
          }
        }
      } else {
        this.results.push({
          component: 'Contact Management',
          operation: 'CREATE',
          success: false,
          message: 'Failed to create contact',
          error: await createResponse.text(),
        });
      }
    } catch (error) {
      this.results.push({
        component: 'Contact Management',
        operation: 'CREATE',
        success: false,
        message: 'Error testing contact CRUD',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    return this.results.filter(r => r.component === 'Contact Management');
  }

  // Test News Management CRUD
  async testNewsCRUD(): Promise<CRUDTestResult[]> {
    const testData = {
      title: 'Test News Article',
      titleFr: 'Article de test',
      content: 'This is a test news article content.',
      contentFr: "Ceci est le contenu d'un article de test.",
      category: 'general',
      imageUrl: '',
      isPublished: false,
    };

    try {
      // Test CREATE
      const createResponse = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData),
      });

      if (createResponse.ok) {
        const createdNews = await createResponse.json();
        this.results.push({
          component: 'News Management',
          operation: 'CREATE',
          success: true,
          message: 'News created successfully',
          data: createdNews,
        });

        // Test READ
        const readResponse = await fetch('/api/news?page=1&limit=10');
        if (readResponse.ok) {
          const news = await readResponse.json();
          this.results.push({
            component: 'News Management',
            operation: 'READ',
            success: true,
            message: 'News fetched successfully',
            data: news,
          });
        }

        // Test UPDATE (if we have the created news ID)
        if (createdNews.news?.id) {
          const updateData = { ...testData, isPublished: true };
          const updateResponse = await fetch(
            `/api/news/${createdNews.news.id}`,
            {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updateData),
            }
          );

          if (updateResponse.ok) {
            this.results.push({
              component: 'News Management',
              operation: 'UPDATE',
              success: true,
              message: 'News updated successfully',
            });
          }
        }

        // Test DELETE (if we have the created news ID)
        if (createdNews.news?.id) {
          const deleteResponse = await fetch(
            `/api/news/${createdNews.news.id}`,
            {
              method: 'DELETE',
            }
          );

          if (deleteResponse.ok) {
            this.results.push({
              component: 'News Management',
              operation: 'DELETE',
              success: true,
              message: 'News deleted successfully',
            });
          }
        }
      } else {
        this.results.push({
          component: 'News Management',
          operation: 'CREATE',
          success: false,
          message: 'Failed to create news',
          error: await createResponse.text(),
        });
      }
    } catch (error) {
      this.results.push({
        component: 'News Management',
        operation: 'CREATE',
        success: false,
        message: 'Error testing news CRUD',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    return this.results.filter(r => r.component === 'News Management');
  }

  // Test Facilities Management CRUD
  async testFacilitiesCRUD(): Promise<CRUDTestResult[]> {
    const testData = {
      name: 'Test Laboratory',
      nameFr: 'Laboratoire de test',
      description: 'A test laboratory facility',
      descriptionFr: 'Un laboratoire de test',
      imageUrl: '',
      category: 'science',
      features: ['Microscopes', 'Test tubes'],
      equipment: ['Microscope', 'Bunsen burner'],
      isPublished: false,
    };

    try {
      // Test CREATE
      const createResponse = await fetch('/api/facilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData),
      });

      if (createResponse.ok) {
        const createdFacility = await createResponse.json();
        this.results.push({
          component: 'Facilities Management',
          operation: 'CREATE',
          success: true,
          message: 'Facility created successfully',
          data: createdFacility,
        });

        // Test READ
        const readResponse = await fetch('/api/facilities?page=1&limit=10');
        if (readResponse.ok) {
          const facilities = await readResponse.json();
          this.results.push({
            component: 'Facilities Management',
            operation: 'READ',
            success: true,
            message: 'Facilities fetched successfully',
            data: facilities,
          });
        }

        // Test UPDATE (if we have the created facility ID)
        if (createdFacility.facility?.id) {
          const updateData = { ...testData, isPublished: true };
          const updateResponse = await fetch(
            `/api/facilities/${createdFacility.facility.id}`,
            {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updateData),
            }
          );

          if (updateResponse.ok) {
            this.results.push({
              component: 'Facilities Management',
              operation: 'UPDATE',
              success: true,
              message: 'Facility updated successfully',
            });
          }
        }

        // Test DELETE (if we have the created facility ID)
        if (createdFacility.facility?.id) {
          const deleteResponse = await fetch(
            `/api/facilities/${createdFacility.facility.id}`,
            {
              method: 'DELETE',
            }
          );

          if (deleteResponse.ok) {
            this.results.push({
              component: 'Facilities Management',
              operation: 'DELETE',
              success: true,
              message: 'Facility deleted successfully',
            });
          }
        }
      } else {
        this.results.push({
          component: 'Facilities Management',
          operation: 'CREATE',
          success: false,
          message: 'Failed to create facility',
          error: await createResponse.text(),
        });
      }
    } catch (error) {
      this.results.push({
        component: 'Facilities Management',
        operation: 'CREATE',
        success: false,
        message: 'Error testing facilities CRUD',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    return this.results.filter(r => r.component === 'Facilities Management');
  }

  // Test Achievements Management CRUD
  async testAchievementsCRUD(): Promise<CRUDTestResult[]> {
    const testData = {
      title: 'Test Achievement',
      titleFr: 'Réussite de test',
      description: 'A test achievement description',
      descriptionFr: "Description d'une réussite de test",
      imageUrl: '',
      category: 'academic',
      date: new Date().toISOString().split('T')[0],
      relatedNewsId: '',
      isPublished: false,
    };

    try {
      // Test CREATE
      const createResponse = await fetch('/api/achievements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData),
      });

      if (createResponse.ok) {
        const createdAchievement = await createResponse.json();
        this.results.push({
          component: 'Achievements Management',
          operation: 'CREATE',
          success: true,
          message: 'Achievement created successfully',
          data: createdAchievement,
        });

        // Test READ
        const readResponse = await fetch('/api/achievements?page=1&limit=10');
        if (readResponse.ok) {
          const achievements = await readResponse.json();
          this.results.push({
            component: 'Achievements Management',
            operation: 'READ',
            success: true,
            message: 'Achievements fetched successfully',
            data: achievements,
          });
        }

        // Test UPDATE (if we have the created achievement ID)
        if (createdAchievement.achievement?.id) {
          const updateData = { ...testData, isPublished: true };
          const updateResponse = await fetch(
            `/api/achievements/${createdAchievement.achievement.id}`,
            {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updateData),
            }
          );

          if (updateResponse.ok) {
            this.results.push({
              component: 'Achievements Management',
              operation: 'UPDATE',
              success: true,
              message: 'Achievement updated successfully',
            });
          }
        }

        // Test DELETE (if we have the created achievement ID)
        if (createdAchievement.achievement?.id) {
          const deleteResponse = await fetch(
            `/api/achievements/${createdAchievement.achievement.id}`,
            {
              method: 'DELETE',
            }
          );

          if (deleteResponse.ok) {
            this.results.push({
              component: 'Achievements Management',
              operation: 'DELETE',
              success: true,
              message: 'Achievement deleted successfully',
            });
          }
        }
      } else {
        this.results.push({
          component: 'Achievements Management',
          operation: 'CREATE',
          success: false,
          message: 'Failed to create achievement',
          error: await createResponse.text(),
        });
      }
    } catch (error) {
      this.results.push({
        component: 'Achievements Management',
        operation: 'CREATE',
        success: false,
        message: 'Error testing achievements CRUD',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    return this.results.filter(r => r.component === 'Achievements Management');
  }

  // Run all CRUD tests
  async runAllTests(): Promise<CRUDTestResult[]> {
    await this.testBookingCRUD();
    await this.testApplicationCRUD();
    await this.testContactCRUD();
    await this.testNewsCRUD();
    await this.testFacilitiesCRUD();
    await this.testAchievementsCRUD();

    return this.results;
  }

  // Generate test report
  generateReport(): string {
    const totalTests = this.results.length;
    const successfulTests = this.results.filter(r => r.success).length;
    const failedTests = totalTests - successfulTests;

    let report = `
# CRUD Test Report

## Summary
- Total Tests: ${totalTests}
- Successful: ${successfulTests}
- Failed: ${failedTests}
- Success Rate: ${((successfulTests / totalTests) * 100).toFixed(1)}%

## Detailed Results
`;

    // Group by component
    const components = [
      'Booking Management',
      'Application Management',
      'Contact Management',
      'News Management',
      'Facilities Management',
      'Achievements Management',
    ];

    components.forEach(component => {
      const componentResults = this.results.filter(
        r => r.component === component
      );
      if (componentResults.length > 0) {
        report += `\n### ${component}\n`;
        componentResults.forEach(result => {
          const status = result.success ? '✅' : '❌';
          report += `- ${status} ${result.operation}: ${result.message}\n`;
          if (result.error) {
            report += `  - Error: ${result.error}\n`;
          }
        });
      }
    });

    return report;
  }
}

// Export for use in browser console or testing
export const crudTester = new CRUDTester();

// Function to run tests from browser console
export const runCRUDTests = async () => {
  const results = await crudTester.runAllTests();
  const report = crudTester.generateReport();
  return { results, report };
};
