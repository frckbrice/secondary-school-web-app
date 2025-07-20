// Mock data for testing creation functionality in admin dashboard

export const mockBookingData = {
  // Sample booking data for testing
  sampleBookings: [
    {
      studentName: 'Marie Claire Nguemo',
      parentName: 'Jean Pierre Nguemo',
      parentEmail: 'jean.nguemo@email.com',
      parentPhone: '+237 691234567',
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
      parentEmail: 'francoise.tchokouani@email.com',
      parentPhone: '+237 692345678',
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
      parentEmail: 'omar.bello@email.com',
      parentPhone: '+237 693456789',
      teacherName: 'Mme. Claire Nkeng',
      subject: 'english',
      purpose:
        "Discussion about Aisha's creative writing skills and university preparation",
      preferredDate: '2024-02-17',
      preferredTime: '15:30',
      notes:
        'Aisha shows exceptional talent in creative writing. Parent wants guidance on university applications.',
    },
    {
      studentName: 'David Mvondo',
      parentName: 'Grace Mvondo',
      parentEmail: 'grace.mvondo@email.com',
      parentPhone: '+237 694567890',
      teacherName: 'Dr. Paul Essomba',
      subject: 'chemistry',
      purpose:
        "Addressing concerns about David's attendance and academic performance",
      preferredDate: '2024-02-18',
      preferredTime: '11:00',
      notes:
        'David has missed several classes recently. Need to discuss reasons and solutions.',
    },
    {
      studentName: 'Fatima Diallo',
      parentName: 'Mamadou Diallo',
      parentEmail: 'mamadou.diallo@email.com',
      parentPhone: '+237 695678901',
      teacherName: 'Prof. Anne Marie Zoa',
      subject: 'biology',
      purpose: "Planning Fatima's participation in the upcoming science fair",
      preferredDate: '2024-02-19',
      preferredTime: '13:00',
      notes:
        'Fatima has an excellent project idea for the science fair. Need to discuss resources and timeline.',
    },
  ],

  // Quick booking templates
  quickTemplates: {
    academicConcern: {
      studentName: '',
      parentName: '',
      parentEmail: '',
      parentPhone: '',
      teacherName: '',
      subject: 'mathematics',
      purpose:
        'Discussion about academic performance and improvement strategies',
      preferredDate: '',
      preferredTime: '',
      notes: 'Academic concern meeting',
    },
    behaviorIssue: {
      studentName: '',
      parentName: '',
      parentEmail: '',
      parentPhone: '',
      teacherName: '',
      subject: 'general',
      purpose: 'Discussion about student behavior and disciplinary matters',
      preferredDate: '',
      preferredTime: '',
      notes: 'Behavioral concern meeting',
    },
    universityGuidance: {
      studentName: '',
      parentName: '',
      parentEmail: '',
      parentPhone: '',
      teacherName: '',
      subject: 'counseling',
      purpose: 'University application guidance and career planning discussion',
      preferredDate: '',
      preferredTime: '',
      notes: 'University guidance session',
    },
  },
};

export const mockApplicationData = {
  // Sample application data for testing
  sampleApplications: [
    {
      firstName: 'Kouamé',
      lastName: "N'Guessan",
      email: 'kouame.nguessan@email.com',
      phone: '+237 696789012',
      form: 'form1',
      notes:
        'Excellent academic record from previous school. Interested in science stream.',
    },
    {
      firstName: 'Aminata',
      lastName: 'Traoré',
      email: 'aminata.traore@email.com',
      phone: '+237 697890123',
      form: 'form3',
      notes:
        'Transfer student from Douala. Strong performance in mathematics and sciences.',
    },
    {
      firstName: 'Christian',
      lastName: 'Etoa',
      email: 'christian.etoa@email.com',
      phone: '+237 698901234',
      form: 'form2',
      notes:
        'Local student with good academic background. Parents prefer English-medium instruction.',
    },
    {
      firstName: 'Hawa',
      lastName: 'Coulibaly',
      email: 'hawa.coulibaly@email.com',
      phone: '+237 699012345',
      form: 'form4',
      notes:
        'International student from Mali. Needs accommodation arrangements.',
    },
    {
      firstName: 'Rodrigue',
      lastName: 'Mvondo',
      email: 'rodrigue.mvondo@email.com',
      phone: '+237 690123456',
      form: 'form5',
      notes:
        'Scholarship applicant. Excellent academic performance and leadership qualities.',
    },
  ],

  // Quick application templates
  quickTemplates: {
    localStudent: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      form: 'form1',
      notes: 'Local student application',
    },
    internationalStudent: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      form: 'form3',
      notes:
        'International student application - requires additional documentation',
    },
    transferStudent: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      form: 'form2',
      notes: 'Transfer student application - need previous school records',
    },
    scholarshipApplicant: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      form: 'form4',
      notes:
        'Scholarship application - requires financial documentation and academic records',
    },
  },
};

export const mockContactData = {
  // Sample contact message data for testing
  sampleContacts: [
    {
      name: 'Pierre Mbarga',
      email: 'pierre.mbarga@email.com',
      phone: '+237 691234567',
      inquiryType: 'admission_inquiry',
      message:
        "Bonjour, je souhaite obtenir des informations sur les procédures d'admission pour ma fille qui souhaite intégrer la Form 2. Pouvez-vous me fournir les détails sur les documents requis et les dates limites ?",
    },
    {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+237 692345678',
      inquiryType: 'academic_inquiry',
      message:
        'Hello, I would like to inquire about the advanced mathematics program offered at your school. My son is particularly interested in calculus and would like to know if there are any special programs or additional support available.',
    },
    {
      name: 'Moussa Koné',
      email: 'moussa.kone@email.com',
      phone: '+237 693456789',
      inquiryType: 'financial_inquiry',
      message:
        "Je voudrais des informations sur les frais de scolarité et les possibilités de bourses d'études. Ma famille a des difficultés financières mais mon enfant est très motivé pour étudier dans votre établissement.",
    },
    {
      name: 'Grace Osei',
      email: 'grace.osei@email.com',
      phone: '+237 694567890',
      inquiryType: 'general_inquiry',
      message:
        "Good morning, I am interested in learning more about your school's extracurricular activities, particularly sports and music programs. Could you provide information about these programs and how students can participate?",
    },
    {
      name: 'Jean Claude Abena',
      email: 'jeanclaude.abena@email.com',
      phone: '+237 695678901',
      inquiryType: 'complaint',
      message:
        "J'ai une préoccupation concernant la sécurité des élèves dans l'enceinte de l'école. J'ai remarqué quelques problèmes lors de la dernière visite et j'aimerais discuter de ces questions avec l'administration.",
    },
    {
      name: 'Fatou Diallo',
      email: 'fatou.diallo@email.com',
      phone: '+237 696789012',
      inquiryType: 'suggestion',
      message:
        "Je suggère l'organisation d'une journée portes ouvertes pour permettre aux parents de mieux connaître l'école et ses programmes. Cela pourrait être très bénéfique pour la communauté scolaire.",
    },
  ],

  // Quick contact templates
  quickTemplates: {
    admissionInquiry: {
      name: '',
      email: '',
      phone: '',
      inquiryType: 'admission_inquiry',
      message:
        "Bonjour, je souhaite obtenir des informations sur les procédures d'admission pour mon enfant. Pouvez-vous me fournir les détails sur les documents requis et les dates limites ?",
    },
    academicInquiry: {
      name: '',
      email: '',
      phone: '',
      inquiryType: 'academic_inquiry',
      message:
        'Hello, I would like to inquire about the academic programs offered at your school. Could you provide information about the curriculum and any special programs available?',
    },
    financialInquiry: {
      name: '',
      email: '',
      phone: '',
      inquiryType: 'financial_inquiry',
      message:
        "Je voudrais des informations sur les frais de scolarité et les possibilités de bourses d'études. Pouvez-vous me fournir les détails sur les options de paiement disponibles ?",
    },
    generalInquiry: {
      name: '',
      email: '',
      phone: '',
      inquiryType: 'general_inquiry',
      message:
        "Bonjour, j'aimerais obtenir des informations générales sur votre établissement. Pouvez-vous me fournir des détails sur les programmes et services offerts ?",
    },
    complaint: {
      name: '',
      email: '',
      phone: '',
      inquiryType: 'complaint',
      message:
        "J'ai une préoccupation que je souhaite partager avec l'administration de l'école. Pouvez-vous me contacter pour discuter de cette question importante ?",
    },
    suggestion: {
      name: '',
      email: '',
      phone: '',
      inquiryType: 'suggestion',
      message:
        "J'ai une suggestion pour améliorer l'expérience scolaire. J'aimerais partager cette idée avec l'équipe administrative de l'école.",
    },
  },
};

// Helper function to get random mock data
export const getRandomMockData = {
  booking: () => {
    const randomIndex = Math.floor(
      Math.random() * mockBookingData.sampleBookings.length
    );
    return mockBookingData.sampleBookings[randomIndex];
  },

  application: () => {
    const randomIndex = Math.floor(
      Math.random() * mockApplicationData.sampleApplications.length
    );
    return mockApplicationData.sampleApplications[randomIndex];
  },

  contact: () => {
    const randomIndex = Math.floor(
      Math.random() * mockContactData.sampleContacts.length
    );
    return mockContactData.sampleContacts[randomIndex];
  },
};

// Helper function to populate form with mock data
export const populateFormWithMockData = {
  booking: (
    formData: any,
    template?: keyof typeof mockBookingData.quickTemplates
  ) => {
    if (template && mockBookingData.quickTemplates[template]) {
      return { ...mockBookingData.quickTemplates[template] };
    }
    return { ...formData, ...getRandomMockData.booking() };
  },

  application: (
    formData: any,
    template?: keyof typeof mockApplicationData.quickTemplates
  ) => {
    if (template && mockApplicationData.quickTemplates[template]) {
      return { ...mockApplicationData.quickTemplates[template] };
    }
    return { ...formData, ...getRandomMockData.application() };
  },

  contact: (
    formData: any,
    template?: keyof typeof mockContactData.quickTemplates
  ) => {
    if (template && mockContactData.quickTemplates[template]) {
      return { ...mockContactData.quickTemplates[template] };
    }
    return { ...formData, ...getRandomMockData.contact() };
  },
};

// Sample data for testing different scenarios
export const testScenarios = {
  bookings: {
    urgent: {
      studentName: 'Urgent Case Student',
      parentName: 'Urgent Parent',
      parentEmail: 'urgent@email.com',
      parentPhone: '+237 690000000',
      teacherName: 'Emergency Teacher',
      subject: 'general',
      purpose: 'URGENT: Critical academic issue requiring immediate attention',
      preferredDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0], // Tomorrow
      preferredTime: '09:00',
      notes:
        'This is an urgent case requiring immediate attention from administration.',
    },
    regular: {
      studentName: 'Regular Student',
      parentName: 'Regular Parent',
      parentEmail: 'regular@email.com',
      parentPhone: '+237 691111111',
      teacherName: 'Regular Teacher',
      subject: 'mathematics',
      purpose: 'Regular parent-teacher meeting to discuss academic progress',
      preferredDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0], // Next week
      preferredTime: '14:00',
      notes: 'Standard academic progress discussion.',
    },
  },

  applications: {
    excellent: {
      firstName: 'Excellent',
      lastName: 'Student',
      email: 'excellent@email.com',
      phone: '+237 692222222',
      form: 'form5',
      notes:
        'Outstanding academic record with 95% average. Strong leadership skills and community involvement.',
    },
    average: {
      firstName: 'Average',
      lastName: 'Student',
      email: 'average@email.com',
      phone: '+237 693333333',
      form: 'form3',
      notes:
        'Good academic performance with 75% average. Regular attendance and positive attitude.',
    },
    needsSupport: {
      firstName: 'Support',
      lastName: 'Needed',
      email: 'support@email.com',
      phone: '+237 694444444',
      form: 'form1',
      notes:
        'Student requires additional academic support. Family committed to providing necessary resources.',
    },
  },

  contacts: {
    positive: {
      name: 'Positive Parent',
      email: 'positive@email.com',
      phone: '+237 695555555',
      inquiryType: 'suggestion',
      message:
        'Thank you for the excellent education my child is receiving. I have a positive suggestion for improving the school environment.',
    },
    neutral: {
      name: 'Neutral Parent',
      email: 'neutral@email.com',
      phone: '+237 696666666',
      inquiryType: 'general_inquiry',
      message:
        'I would like to obtain general information about the school programs and admission procedures.',
    },
    urgent: {
      name: 'Urgent Contact',
      email: 'urgent.contact@email.com',
      phone: '+237 697777777',
      inquiryType: 'complaint',
      message:
        "URGENT: I need to discuss an important matter regarding my child's safety and well-being at school.",
    },
  },
};
