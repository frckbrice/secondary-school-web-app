'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { useAuth } from '../../../hooks/use-auth';
import { apiRequest } from '../../../lib/queryClient';
import { useRouter } from 'next/navigation';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts';
import {
  Users,
  FileText,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  School,
  Award,
  Phone,
  CreditCard,
  UserCheck,
  AlertCircle,
  Eye,
  BarChart3,
  PieChart as PieChartIcon,
  LogOut,
} from 'lucide-react';
import { useLanguage } from '../../../hooks/use-language';
import ContributionsManagement from '../admin/components/contributions-management';
import UsersManagement from '../admin/components/users-management';
import StudentsManagement from '../admin/components/students-management';

export default function SuperAdminDashboard() {
  const { user, logoutMutation } = useAuth();
  const { t, language } = useLanguage();
  const router = useRouter();
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('applications');
  const [activeTab, setActiveTab] = useState('overview');

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        router.push('/');
      },
    });
  };

  // Mock data for demonstration - replace with real API calls
  const stats = {
    totalApplications: 1247,
    pendingApplications: 89,
    acceptedApplications: 956,
    rejectedApplications: 202,
    totalRevenue: 62350000, // FCFA
    totalStudents: 1156,
    activeAlumni: 3420,
    subscriptionRevenue: 1250000, // FCFA from alumni subscriptions
  };

  const applicationTrends = [
    { month: 'Jan', applications: 120, accepted: 95, rejected: 25 },
    { month: 'Feb', applications: 135, accepted: 110, rejected: 25 },
    { month: 'Mar', applications: 155, accepted: 125, rejected: 30 },
    { month: 'Apr', applications: 142, accepted: 115, rejected: 27 },
    { month: 'May', applications: 165, accepted: 135, rejected: 30 },
    { month: 'Jun', applications: 175, accepted: 145, rejected: 30 },
  ];

  const paymentMethods = [
    { name: 'MTN Mobile Money', value: 45, amount: 28125000, color: '#FFD700' },
    { name: 'Orange Money', value: 35, amount: 21875000, color: '#FF6B35' },
    { name: 'Bank Transfer', value: 15, amount: 9375000, color: '#4ECDC4' },
    { name: 'Cash', value: 5, amount: 3125000, color: '#95E1D3' },
  ];

  const revenueData = [
    { month: 'Jan', tuition: 8500000, subscriptions: 180000, total: 8680000 },
    { month: 'Feb', tuition: 9200000, subscriptions: 195000, total: 9395000 },
    { month: 'Mar', tuition: 11200000, subscriptions: 210000, total: 11410000 },
    { month: 'Apr', tuition: 10800000, subscriptions: 205000, total: 11005000 },
    { month: 'May', tuition: 12500000, subscriptions: 225000, total: 12725000 },
    { month: 'Jun', tuition: 13800000, subscriptions: 235000, total: 14035000 },
  ];

  const alumniSubscriptions = [
    {
      plan: 'Basic Newsletter',
      subscribers: 1250,
      revenue: 0,
      color: '#8884d8',
    },
    {
      plan: 'Premium Access',
      subscribers: 850,
      revenue: 425000,
      color: '#82ca9d',
    },
    {
      plan: 'VIP Alumni Network',
      subscribers: 320,
      revenue: 825000,
      color: '#ffc658',
    },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const getGrowthPercentage = (current: number, previous: number) => {
    const growth = ((current - previous) / previous) * 100;
    return growth.toFixed(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {language === 'fr'
                  ? 'Tableau de bord Super Admin'
                  : 'Super Admin Dashboard'}
              </h1>
              <p className="text-gray-600">
                GBHS Bafia - Comprehensive Analytics & Management
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">
                    {language === 'fr' ? 'Derniers 7 jours' : 'Last 7 days'}
                  </SelectItem>
                  <SelectItem value="30d">
                    {language === 'fr' ? 'Derniers 30 jours' : 'Last 30 days'}
                  </SelectItem>
                  <SelectItem value="90d">
                    {language === 'fr' ? 'Derniers 3 mois' : 'Last 3 months'}
                  </SelectItem>
                  <SelectItem value="1y">
                    {language === 'fr' ? 'Dernier année' : 'Last year'}
                  </SelectItem>
                </SelectContent>
              </Select>
              <Badge variant="outline" className="px-3 py-1">
                {language === 'fr' ? 'Super Admin' : 'Super Admin'}:{' '}
                {user?.username}
              </Badge>
              <Button
                variant="outline"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="w-4 h-4 mr-2" />
                {language === 'fr' ? 'Déconnexion' : 'Logout'}
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {language === 'fr'
                      ? 'Total Applications'
                      : 'Total Applications'}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatNumber(stats.totalApplications)}
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-500">
                      {language === 'fr'
                        ? '+12.5% vs mois dernier'
                        : '+12.5% vs last month'}
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {language === 'fr' ? 'Revenu Total ' : 'Total Revenue'}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatCurrency(stats.totalRevenue)}
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-500">
                      {language === 'fr'
                        ? '+8.2% vs mois dernier'
                        : '+8.2% vs last month'}
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {language === 'fr' ? 'Étudiants Actifs' : 'Active Students'}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatNumber(stats.totalStudents)}
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-500">
                      {language === 'fr'
                        ? '+5.8% vs année dernière'
                        : '+5.8% vs last year'}
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {language === 'fr'
                      ? 'Réseau des Anciens'
                      : 'Alumni Network'}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatNumber(stats.activeAlumni)}
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-blue-500 mr-1" />
                    <span className="text-sm text-blue-500">
                      {language === 'fr'
                        ? '+15.3% engagement'
                        : '+15.3% engagement'}
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview">
              {language === 'fr' ? 'Aperçu' : 'Overview'}
            </TabsTrigger>
            <TabsTrigger value="applications">
              {language === 'fr' ? 'Applications' : 'Applications'}
            </TabsTrigger>
            <TabsTrigger value="revenue">
              {language === 'fr' ? 'Revenue' : 'Revenue'}
            </TabsTrigger>
            <TabsTrigger value="payments">
              {language === 'fr' ? 'Méthodes de Paiement' : 'Payment Methods'}
            </TabsTrigger>
            <TabsTrigger value="alumni">
              {language === 'fr' ? 'Réseau des Anciens' : 'Alumni Network'}
            </TabsTrigger>
            <TabsTrigger value="contributions">
              {language === 'fr' ? 'Contributions' : 'Contributions'}
            </TabsTrigger>
            <TabsTrigger value="users">
              {language === 'fr' ? 'Utilisateurs' : 'Users'}
            </TabsTrigger>
            <TabsTrigger value="students">
              {language === 'fr' ? 'Étudiants' : 'Students'}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === 'fr'
                      ? 'Tendances des Applications'
                      : 'Application Trends'}
                  </CardTitle>
                  <CardDescription>
                    {language === 'fr'
                      ? 'Statistiques mensuelles des applications'
                      : 'Monthly application statistics'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={applicationTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="applications"
                        stackId="1"
                        stroke="#8884d8"
                        fill="#8884d8"
                      />
                      <Area
                        type="monotone"
                        dataKey="accepted"
                        stackId="2"
                        stroke="#82ca9d"
                        fill="#82ca9d"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === 'fr'
                      ? 'Aperçu des Revenus'
                      : 'Revenue Overview'}
                  </CardTitle>
                  <CardDescription>
                    {language === 'fr'
                      ? 'Répartition mensuelle des revenus'
                      : 'Monthly revenue breakdown'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip
                        formatter={value => formatCurrency(Number(value))}
                      />
                      <Bar dataKey="tuition" fill="#8884d8" />
                      <Bar dataKey="subscriptions" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === 'fr' ? 'Actions Rapides' : 'Quick Actions'}
                </CardTitle>
                <CardDescription>
                  {language === 'fr'
                    ? 'Tâches administratives fréquemment utilisées'
                    : 'Frequently used administrative tasks'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center"
                    onClick={() => setActiveTab('revenue')}
                  >
                    <FileText className="w-6 h-6 mb-2" />
                    {language === 'fr'
                      ? 'Générer des Rapports'
                      : 'Generate Reports'}
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center"
                    onClick={() => setActiveTab('applications')}
                  >
                    <Users className="w-6 h-6 mb-2" />
                    {language === 'fr'
                      ? 'Gérer les Utilisateurs'
                      : 'Manage Users'}
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center"
                    onClick={() => setActiveTab('alumni')}
                  >
                    <School className="w-6 h-6 mb-2" />
                    {language === 'fr'
                      ? 'Paramètres Académiques'
                      : 'Academic Settings'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === 'fr'
                      ? 'Statut des Applications'
                      : 'Application Status'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {language === 'fr'
                          ? 'En attente de Revue'
                          : 'Pending Review'}
                      </span>
                      <div className="flex items-center">
                        <Badge variant="secondary">
                          {stats.pendingApplications}
                        </Badge>
                        <AlertCircle className="w-4 h-4 text-yellow-500 ml-2" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {language === 'fr' ? 'Accepté' : 'Accepted'}
                      </span>
                      <div className="flex items-center">
                        <Badge className="bg-green-100 text-green-800">
                          {stats.acceptedApplications}
                        </Badge>
                        <UserCheck className="w-4 h-4 text-green-500 ml-2" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {language === 'fr' ? 'Rejeté' : 'Rejected'}
                      </span>
                      <Badge variant="destructive">
                        {stats.rejectedApplications}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>
                    {language === 'fr'
                      ? 'Taux de Traitement des Applications'
                      : 'Application Processing Rate'}
                  </CardTitle>
                  <CardDescription>
                    {language === 'fr'
                      ? 'Métriques hebdomadaires de traitement des applications'
                      : 'Weekly application processing metrics'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={applicationTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="applications"
                        stroke="#8884d8"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="accepted"
                        stroke="#82ca9d"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === 'fr'
                      ? 'Répartition des Revenus'
                      : 'Revenue Breakdown'}
                  </CardTitle>
                  <CardDescription>
                    Total: {formatCurrency(stats.totalRevenue)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <div>
                        <p className="font-semibold">
                          {language === 'fr'
                            ? 'Frais de Scolarité'
                            : 'Tuition Fees'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {language === 'fr'
                            ? '85% du revenu total'
                            : '85% of total revenue'}
                        </p>
                      </div>
                      <span className="text-xl font-bold">
                        {formatCurrency(stats.totalRevenue * 0.85)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-semibold">
                          {language === 'fr'
                            ? 'Abonnements des Anciens'
                            : 'Alumni Subscriptions'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {language === 'fr'
                            ? '2% du revenu total'
                            : '2% of total revenue'}
                        </p>
                      </div>
                      <span className="text-xl font-bold">
                        {formatCurrency(stats.subscriptionRevenue)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                      <div>
                        <p className="font-semibold">
                          {language === 'fr'
                            ? 'Autres Revenus'
                            : 'Other Income'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {language === 'fr'
                            ? '13% du revenu total'
                            : '13% of total revenue'}
                        </p>
                      </div>
                      <span className="text-xl font-bold">
                        {formatCurrency(stats.totalRevenue * 0.13)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === 'fr'
                      ? 'Tendances Mensuelles'
                      : 'Monthly Trends'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip
                        formatter={value => formatCurrency(Number(value))}
                      />
                      <Area
                        type="monotone"
                        dataKey="total"
                        stroke="#8884d8"
                        fill="#8884d8"
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Payment Methods Tab */}
          <TabsContent value="payments" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === 'fr'
                      ? 'Distribution des Paiements'
                      : 'Payment Distribution'}
                  </CardTitle>
                  <CardDescription>
                    {language === 'fr'
                      ? 'Méthodes de paiement préférées'
                      : 'Preferred payment methods'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={paymentMethods}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {paymentMethods.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === 'fr'
                      ? 'Intégration Mobile Money'
                      : 'Mobile Money Integration'}
                  </CardTitle>
                  <CardDescription>
                    {language === 'fr'
                      ? 'Statistiques MTN & Orange Money'
                      : 'MTN & Orange Money statistics'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center">
                        <Phone className="w-8 h-8 text-yellow-600 mr-3" />
                        <div>
                          <p className="font-semibold">
                            {language === 'fr'
                              ? 'MTN Mobile Money'
                              : 'MTN Mobile Money'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {language === 'fr'
                              ? '45% des paiements'
                              : '45% of payments'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">
                          {formatCurrency(paymentMethods[0].amount)}
                        </p>
                        <p className="text-sm text-green-600">
                          {language === 'fr'
                            ? '+12% ce mois-ci'
                            : '+12% this month'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="flex items-center">
                        <CreditCard className="w-8 h-8 text-orange-600 mr-3" />
                        <div>
                          <p className="font-semibold">
                            {language === 'fr'
                              ? 'Orange Money'
                              : 'Orange Money'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {language === 'fr'
                              ? '35% des paiements'
                              : '35% of payments'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">
                          {formatCurrency(paymentMethods[1].amount)}
                        </p>
                        <p className="text-sm text-green-600">
                          {language === 'fr'
                            ? '+8% ce mois-ci'
                            : '+8% this month'}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold mb-2">
                        {language === 'fr'
                          ? 'Avantages Mobile Money'
                          : 'Mobile Money Benefits'}
                      </h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>
                          •{' '}
                          {language === 'fr'
                            ? '80% des paiements traités via Mobile Money'
                            : '80% of payments processed via mobile money'}
                        </li>
                        <li>
                          •{' '}
                          {language === 'fr'
                            ? 'Traitement des transactions plus rapide de 95%'
                            : '95% faster transaction processing'}
                        </li>
                        <li>
                          •{' '}
                          {language === 'fr'
                            ? 'Réduction des coûts de gestion des espèces'
                            : 'Reduced cash handling costs'}
                        </li>
                        <li>
                          •{' '}
                          {language === 'fr'
                            ? 'Meilleur suivi des paiements'
                            : 'Better payment tracking'}
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Alumni Network Tab */}
          <TabsContent value="alumni" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === 'fr'
                      ? 'Abonnements des Anciens'
                      : 'Alumni Subscriptions'}
                  </CardTitle>
                  <CardDescription>
                    {language === 'fr'
                      ? 'Engagement et revenu du réseau'
                      : 'Network engagement and revenue'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={alumniSubscriptions}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="plan" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="subscribers" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === 'fr'
                      ? 'Revenus des Abonnements'
                      : 'Subscription Revenue'}
                  </CardTitle>
                  <CardDescription>
                    {language === 'fr'
                      ? 'Revenus récurrents mensuels des anciens'
                      : 'Monthly recurring revenue from alumni'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {alumniSubscriptions.map((plan, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{plan.plan}</p>
                          <p className="text-sm text-gray-600">
                            {plan.subscribers} subscribers
                          </p>
                        </div>
                        <span className="font-bold">
                          {formatCurrency(plan.revenue)}
                        </span>
                      </div>
                    ))}
                    <div className="border-t pt-4">
                      <div className="flex justify-between font-bold">
                        <span>
                          {language === 'fr'
                            ? 'Revenus Mensuels Total'
                            : 'Total Monthly Revenue'}
                        </span>
                        <span>{formatCurrency(stats.subscriptionRevenue)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>
                  {language === 'fr'
                    ? "Métriques d'Engagement des Anciens"
                    : 'Alumni Engagement Metrics'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">3,420</p>
                    <p className="text-sm text-gray-600">
                      {language === 'fr' ? 'Total Anciens' : 'Total Alumni'}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">2,420</p>
                    <p className="text-sm text-gray-600">
                      {language === 'fr' ? 'Membres Actifs' : 'Active Members'}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">1,250</p>
                    <p className="text-sm text-gray-600">
                      {language === 'fr'
                        ? 'Mensuellement Actif'
                        : 'Monthly Active'}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">68%</p>
                    <p className="text-sm text-gray-600">
                      {language === 'fr'
                        ? "Taux d'Engagement"
                        : 'Engagement Rate'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contributions Tab */}
          <TabsContent value="contributions" className="space-y-6">
            <ContributionsManagement />
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <UsersManagement />
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-6">
            <StudentsManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
