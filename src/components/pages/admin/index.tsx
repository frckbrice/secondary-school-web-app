'use client';

import React, { useState } from 'react';
import { useAuth } from '../../hooks/use-auth';
import { useLanguage } from '../../hooks/use-language';
import { useTheme } from 'next-themes';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  School,
  Users,
  Calendar,
  MessageSquare,
  FileText,
  LogOut,
  Home,
  Award,
  BookOpen,
  TrendingUp,
  GraduationCap,
  UserCheck,
  Image,
  Building,
  Trophy,
  Sun,
  Moon,
  Loader2,
} from 'lucide-react';
import NewsManagement from './components/news-management';
import ApplicationsManagement from './components/applications-management';
import BookingManagement from './components/booking-management';
import ContactsManagement from './components/contacts-management';
import FacilitiesManagement from './components/FacilitiesManagement';
import AchievementsManagement from './components/AchievementsManagement';
import StudentsManagement from './components/students-management';
import TeachersManagement from './components/teachers-management';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from '../ui/admin-sidebar';
import { apiRequest } from '../../lib/queryClient';

interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  averageGrade: number;
  passRate: number;
  totalApplications: number;
  totalBookings: number;
  totalContacts: number;
  totalNews: number;
  totalFacilities: number;
  totalAchievements: number;
}

export default function AdminDashboard() {
  const { user, logoutMutation } = useAuth();
  const { t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        router.push('/');
      },
    });
  };

  // Fetch dashboard statistics
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [
        studentsRes,
        teachersRes,
        metricsRes,
        applicationsRes,
        bookingsRes,
        contactsRes,
        newsRes,
        facilitiesRes,
        achievementsRes,
      ] = await Promise.allSettled([
        apiRequest('GET', '/api/students?limit=1'),
        apiRequest('GET', '/api/users?role=teacher&limit=1'),
        apiRequest('GET', '/api/school-metrics?limit=1'),
        apiRequest('GET', '/api/applications?limit=1'),
        apiRequest('GET', '/api/bookings?limit=1'),
        apiRequest('GET', '/api/contacts?limit=1'),
        apiRequest('GET', '/api/news?limit=1'),
        apiRequest('GET', '/api/facilities?limit=1'),
        apiRequest('GET', '/api/achievements?limit=1'),
      ]);

      // Extract counts from responses
      const totalStudents =
        studentsRes.status === 'fulfilled' && studentsRes.value?.ok
          ? (await studentsRes.value.json()).pagination?.total || 0
          : 0;

      const totalTeachers =
        teachersRes.status === 'fulfilled' && teachersRes.value?.ok
          ? (await teachersRes.value.json()).pagination?.total || 0
          : 0;

      const metrics =
        metricsRes.status === 'fulfilled' && metricsRes.value?.ok
          ? (await metricsRes.value.json()).metrics?.[0] || null
          : null;

      const totalApplications =
        applicationsRes.status === 'fulfilled' && applicationsRes.value?.ok
          ? (await applicationsRes.value.json()).pagination?.total || 0
          : 0;

      const totalBookings =
        bookingsRes.status === 'fulfilled' && bookingsRes.value?.ok
          ? (await bookingsRes.value.json()).pagination?.total || 0
          : 0;

      const totalContacts =
        contactsRes.status === 'fulfilled' && contactsRes.value?.ok
          ? (await contactsRes.value.json()).pagination?.total || 0
          : 0;

      const totalNews =
        newsRes.status === 'fulfilled' && newsRes.value?.ok
          ? (await newsRes.value.json()).pagination?.total || 0
          : 0;

      const totalFacilities =
        facilitiesRes.status === 'fulfilled' && facilitiesRes.value?.ok
          ? (await facilitiesRes.value.json()).pagination?.total || 0
          : 0;

      const totalAchievements =
        achievementsRes.status === 'fulfilled' && achievementsRes.value?.ok
          ? (await achievementsRes.value.json()).pagination?.total || 0
          : 0;

      return {
        totalStudents,
        totalTeachers,
        averageGrade: metrics?.averageGrade
          ? parseFloat(metrics.averageGrade)
          : 14.1,
        passRate: metrics?.passRate ? parseFloat(metrics.passRate) : 89,
        totalApplications,
        totalBookings,
        totalContacts,
        totalNews,
        totalFacilities,
        totalAchievements,
      };
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Overview stats with real data and fallback values
  const statsCards = [
    {
      icon: Users,
      label: t('admin.students') || 'Students',
      value: statsLoading ? '...' : (stats?.totalStudents || 0).toString(),
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100',
      darkBgColor: 'from-blue-950/50 to-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      icon: UserCheck,
      label: t('admin.teachers') || 'Teachers',
      value: statsLoading ? '...' : (stats?.totalTeachers || 0).toString(),
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'from-emerald-50 to-emerald-100',
      darkBgColor: 'from-emerald-950/50 to-emerald-900/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      icon: Award,
      label: t('admin.avg') || 'Avg. Grade',
      value: statsLoading ? '...' : (stats?.averageGrade || 14.1).toFixed(1),
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-50 to-purple-100',
      darkBgColor: 'from-purple-950/50 to-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      icon: TrendingUp,
      label: t('admin.passRate') || 'Pass Rate',
      value: statsLoading ? '...' : `${stats?.passRate || 89}%`,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'from-amber-50 to-amber-100',
      darkBgColor: 'from-amber-950/50 to-amber-900/30',
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
  ];

  // Additional stats for recent activities
  const recentStats = [
    {
      icon: FileText,
      label: 'Applications',
      value: statsLoading ? '...' : (stats?.totalApplications || 0).toString(),
      color: 'from-indigo-500 to-indigo-600',
    },
    {
      icon: Calendar,
      label: 'Bookings',
      value: statsLoading ? '...' : (stats?.totalBookings || 0).toString(),
      color: 'from-pink-500 to-pink-600',
    },
    {
      icon: MessageSquare,
      label: 'Contacts',
      value: statsLoading ? '...' : (stats?.totalContacts || 0).toString(),
      color: 'from-cyan-500 to-cyan-600',
    },
    {
      icon: Image,
      label: 'News',
      value: statsLoading ? '...' : (stats?.totalNews || 0).toString(),
      color: 'from-orange-500 to-orange-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex">
      {/* Left Sidebar - Fixed */}
      <div className="hidden md:block w-64 border-r border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm fixed h-screen overflow-y-auto z-20">
        <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
      {/* Main Content - Scrollable */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Header - Fixed */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 shadow-lg">
                  <School className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    {t('admin.dashboard')}
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    GBHS Bafia
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Welcome, {user?.username}
                </span>
                {/* Theme Toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 group"
                >
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4 text-yellow-500 group-hover:scale-110 transition-transform duration-300" />
                  ) : (
                    <Moon className="w-4 h-4 text-gray-600 group-hover:scale-110 transition-transform duration-300" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {t('admin.logout')}
                </Button>
              </div>
            </div>
          </div>
        </div>
        {/* Main Content - Scrollable */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50/50 via-transparent to-gray-50/50 dark:from-gray-950/50 dark:via-transparent dark:to-gray-950/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              <TabsContent value="overview" className="space-y-6">
                {/* Overview Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                  {statsCards.map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                      <div
                        key={idx}
                        className={`relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl group`}
                      >
                        {/* Background gradient */}
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${stat.bgColor} dark:${stat.darkBgColor} opacity-80`}
                        />

                        {/* Animated background pattern */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent dark:from-white/5 dark:to-transparent" />

                        {/* Content */}
                        <div className="relative z-10 flex flex-col items-center text-center">
                          <div
                            className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300`}
                          >
                            <Icon className={`w-6 h-6 text-white`} />
                          </div>
                          <div className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
                            {statsLoading ? (
                              <Loader2 className="w-8 h-8 animate-spin mx-auto" />
                            ) : (
                              stat.value
                            )}
                          </div>
                          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {stat.label}
                          </div>
                        </div>

                        {/* Subtle border glow */}
                        <div
                          className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Additional Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                  {recentStats.map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                      <Card
                        key={idx}
                        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-gray-200 dark:border-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`p-2 rounded-lg bg-gradient-to-r ${stat.color} shadow-lg`}
                            >
                              <Icon className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <div className="text-lg font-bold text-gray-900 dark:text-white">
                                {statsLoading ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  stat.value
                                )}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                {stat.label}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-gray-200 dark:border-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardHeader className="border-b border-gray-200 dark:border-gray-800">
                      <CardTitle className="text-gray-900 dark:text-white">
                        Recent Activities
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        Latest actions in the system
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                          <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-500 rounded-full shadow-lg"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              New application submitted
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              2 minutes ago
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                          <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full shadow-lg"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              News article published
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              1 hour ago
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                          <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full shadow-lg"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              Parent-teacher meeting booked
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              3 hours ago
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-gray-200 dark:border-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardHeader className="border-b border-gray-200 dark:border-gray-800">
                      <CardTitle className="text-gray-900 dark:text-white">
                        Quick Actions
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        Common administrative tasks
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                      <Button
                        className="w-full justify-start bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                        onClick={() => setActiveTab('news')}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Manage News
                      </Button>
                      <Button
                        className="w-full justify-start border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-all duration-300"
                        variant="outline"
                        onClick={() => setActiveTab('applications')}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Manage Applications
                      </Button>
                      <Button
                        className="w-full justify-start border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-all duration-300"
                        variant="outline"
                        onClick={() => setActiveTab('bookings')}
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Manage Bookings
                      </Button>
                      <Button
                        className="w-full justify-start border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-all duration-300"
                        variant="outline"
                        onClick={() => setActiveTab('contacts')}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Manage Contacts
                      </Button>
                      <Button
                        className="w-full justify-start border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-all duration-300"
                        variant="outline"
                        onClick={() => setActiveTab('facilities')}
                      >
                        <Building className="w-4 h-4 mr-2" />
                        Manage Facilities
                      </Button>
                      <Button
                        className="w-full justify-start border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-all duration-300"
                        variant="outline"
                        onClick={() => setActiveTab('achievements')}
                      >
                        <Trophy className="w-4 h-4 mr-2" />
                        Manage Achievements
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="news">
                <NewsManagement />
              </TabsContent>

              <TabsContent value="applications">
                <ApplicationsManagement />
              </TabsContent>

              <TabsContent value="bookings">
                <BookingManagement />
              </TabsContent>

              <TabsContent value="contacts" className="space-y-6">
                <ContactsManagement />
              </TabsContent>

              <TabsContent value="facilities" className="space-y-6">
                <FacilitiesManagement />
              </TabsContent>

              <TabsContent value="achievements" className="space-y-6">
                <AchievementsManagement />
              </TabsContent>

              <TabsContent value="students" className="space-y-6">
                <StudentsManagement />
              </TabsContent>

              <TabsContent value="teachers" className="space-y-6">
                <TeachersManagement />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
