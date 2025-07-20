'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../ui/card';
import { Button } from '../../../ui/button';
import { useLanguage } from '../../../../hooks/use-language';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Users,
  BookOpen,
  Award,
  ArrowRight,
  User,
  FileText,
  Image,
} from 'lucide-react';
import { useAuth } from '../../../../hooks/use-auth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../ui/dialog';
import { useState } from 'react';

export default function QuickLinks() {
  const { t } = useLanguage();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [accessMessage, setAccessMessage] = useState<string | null>(null);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleStudentPortal = () => {
    if (!user) {
      router.push('/auth?mode=login');
    } else if (user.role === 'student') {
      router.push('/student-portal');
    } else {
      setAccessMessage('Only students can access the Student Portal.');
    }
  };

  const handleTeacherPortal = () => {
    if (!user) {
      router.push('/auth?mode=login');
    } else if (user.role === 'teacher') {
      router.push('/teacher');
    } else {
      setAccessMessage('Only teachers can access the Teacher Portal.');
    }
  };

  const quickLinks = [
    {
      icon: BookOpen,
      title: t('quickLinks.admissions'),
      description: t('quickLinks.admissionsDesc'),
      action: () => scrollToSection('admissions'),
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      hoverBg: 'group-hover:bg-blue-500',
    },
    {
      icon: Calendar,
      title: t('quickLinks.calendar'),
      description: t('quickLinks.calendarDesc'),
      action: () => setCalendarOpen(true),
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      hoverBg: 'group-hover:bg-green-500',
    },
    {
      icon: User,
      title: t('quickLinks.portal'),
      description: t('quickLinks.portalDesc'),
      action: handleStudentPortal,
      bgColor: 'bg-orange-100',
      iconColor: 'text-orange-600',
      hoverBg: 'group-hover:bg-orange-500',
    },
    {
      icon: GraduationCap,
      title: t('quickLinks.teacher'),
      description: t('quickLinks.teacherDesc'),
      action: handleTeacherPortal,
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      hoverBg: 'group-hover:bg-purple-500',
    },
    {
      icon: Mail,
      title: t('quickLinks.contact'),
      description: t('quickLinks.contactDesc'),
      action: () => scrollToSection('contact'),
      bgColor: 'bg-gray-100',
      iconColor: 'text-gray-600',
      hoverBg: 'group-hover:bg-gray-500',
    },
  ];

  // Academic calendar data (static for now)
  const academicCalendar = [
    {
      term: 'First Term',
      events: [
        { date: 'Sept 4', title: 'School Resumes' },
        { date: 'Oct 10', title: 'Orientation Week' },
        { date: 'Nov 15', title: 'Midterm Exams' },
        { date: 'Dec 20', title: 'Christmas Break' },
      ],
    },
    {
      term: 'Second Term',
      events: [
        { date: 'Jan 8', title: 'Classes Resume' },
        { date: 'Feb 14', title: 'Sports Day' },
        { date: 'Mar 10', title: 'Midterm Exams' },
        { date: 'Apr 1', title: 'Easter Break' },
      ],
    },
    {
      term: 'Third Term',
      events: [
        { date: 'Apr 15', title: 'Classes Resume' },
        { date: 'May 20', title: 'National Day' },
        { date: 'Jun 5', title: 'Final Exams' },
        { date: 'Jun 28', title: 'End of Year/Graduation' },
      ],
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-orange-50 via-background to-blue-50 dark:from-orange-950 dark:via-background dark:to-blue-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-bold text-3xl sm:text-4xl text-foreground mb-4">
            {t('quickLinks.title')}
          </h2>
          <p className="text-xl text-muted-foreground">
            {t('quickLinks.subtitle')}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {quickLinks.map((link, index) => (
            <Card
              key={index}
              className="group cursor-pointer shadow-md hover:shadow-lg transition-all hover:-translate-y-1 border-0"
              onClick={link.action}
            >
              <CardContent className="p-6">
                <div
                  className={`w-12 h-12 ${link.bgColor} dark:bg-opacity-20 rounded-lg flex items-center justify-center mb-4 ${link.hoverBg} transition-colors`}
                >
                  <link.icon
                    className={`w-6 h-6 ${link.iconColor} group-hover:text-white transition-colors`}
                  />
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-2">
                  {link.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {link.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Academic Calendar Modal */}
      <Dialog open={calendarOpen} onOpenChange={setCalendarOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Academic Calendar</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {academicCalendar.map(term => (
              <div key={term.term}>
                <h4 className="font-semibold text-lg mb-2">{term.term}</h4>
                <ul className="space-y-1 ml-4 list-disc">
                  {term.events.map(event => (
                    <li key={event.date}>
                      <span className="font-medium text-blue-700 mr-2">
                        {event.date}:
                      </span>
                      <span>{event.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Access Message Modal */}
      <Dialog
        open={!!accessMessage}
        onOpenChange={() => setAccessMessage(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Access Restricted</DialogTitle>
          </DialogHeader>
          <div>{accessMessage}</div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
