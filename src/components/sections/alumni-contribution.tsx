'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Heart,
  Smartphone,
  CreditCard,
  Users,
  Target,
  TrendingUp,
  Gift,
  School,
  Building,
  BookOpen,
  Trophy,
  Star,
} from 'lucide-react';
import { apiRequest } from '../../lib/queryClient';
import { useToast } from '../../hooks/use-toast';
import { useLanguage } from '../../hooks/use-language';

const contributionSchema = z.object({
  contributorName: z.string().min(2, 'Name must be at least 2 characters'),
  contributorEmail: z.string().email('Please enter a valid email').optional(),
  contributorPhone: z.string().min(9, 'Please enter a valid phone number'),
  amount: z.string().min(1, 'Amount is required'),
  paymentProvider: z.enum(['mtn', 'orange', 'express_union'], {
    required_error: 'Please select a payment provider',
  }),
  purpose: z.string().optional(),
  graduationYear: z.string().optional(),
  isAlumni: z.boolean().default(false),
});

type ContributionFormData = z.infer<typeof contributionSchema>;

const subscriptionSchema = z.object({
  subscriberName: z.string().min(2, 'Name must be at least 2 characters'),
  subscriberEmail: z.string().email('Please enter a valid email').optional(),
  subscriberPhone: z.string().min(9, 'Please enter a valid phone number'),
  subscriptionType: z.enum(['monthly', 'quarterly', 'yearly'], {
    required_error: 'Please select a subscription type',
  }),
  amount: z.string().min(1, 'Amount is required'),
  paymentProvider: z.enum(['mtn', 'orange', 'express_union']),
  graduationYear: z.string().optional(),
});

type SubscriptionFormData = z.infer<typeof subscriptionSchema>;

export default function AlumniContribution() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [isContributionOpen, setIsContributionOpen] = useState(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [selectedPurpose, setSelectedPurpose] = useState('');

  const contributionForm = useForm<ContributionFormData>({
    resolver: zodResolver(contributionSchema),
    defaultValues: {
      isAlumni: true,
      paymentProvider: 'mtn',
    },
  });

  const subscriptionForm = useForm<SubscriptionFormData>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      paymentProvider: 'mtn',
      subscriptionType: 'monthly',
    },
  });

  const contributionMutation = useMutation({
    mutationFn: async (data: ContributionFormData) => {
      await apiRequest('POST', '/api/contributions', data);
    },
    onSuccess: () => {
      toast({
        title:
          language === 'fr' ? 'Contribution envoyée' : 'Contribution submitted',
        description:
          language === 'fr'
            ? 'Merci pour votre généreuse contribution à GBHS Bafia!'
            : 'Thank you for your generous contribution to GBHS Bafia!',
      });
      contributionForm.reset();
      setIsContributionOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const subscriptionMutation = useMutation({
    mutationFn: async (data: SubscriptionFormData) => {
      await apiRequest('POST', '/api/subscriptions', data);
    },
    onSuccess: () => {
      toast({
        title: language === 'fr' ? 'Abonnement créé' : 'Subscription created',
        description:
          language === 'fr'
            ? 'Votre abonnement récurrent a été créé avec succès!'
            : 'Your recurring subscription has been created successfully!',
      });
      subscriptionForm.reset();
      setIsSubscriptionOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const contributionPurposes = [
    {
      value: 'infrastructure',
      labelEn: 'Infrastructure Development',
      labelFr: 'Développement des infrastructures',
    },
    {
      value: 'scholarships',
      labelEn: 'Student Scholarships',
      labelFr: "Bourses d'études",
    },
    {
      value: 'equipment',
      labelEn: 'Laboratory Equipment',
      labelFr: 'Équipement de laboratoire',
    },
    {
      value: 'library',
      labelEn: 'Library Resources',
      labelFr: 'Ressources de bibliothèque',
    },
    {
      value: 'sports',
      labelEn: 'Sports Facilities',
      labelFr: 'Installations sportives',
    },
    {
      value: 'technology',
      labelEn: 'Technology Upgrade',
      labelFr: 'Mise à niveau technologique',
    },
    {
      value: 'general',
      labelEn: 'General Support',
      labelFr: 'Soutien général',
    },
  ];

  const paymentProviders = [
    { value: 'mtn', name: 'MTN Money', icon: '📱', color: 'bg-yellow-500' },
    {
      value: 'orange',
      name: 'Orange Money',
      icon: '🍊',
      color: 'bg-orange-500',
    },
    {
      value: 'express_union',
      name: 'Express Union',
      icon: '💳',
      color: 'bg-blue-500',
    },
  ];

  const subscriptionTypes = [
    {
      value: 'monthly',
      labelEn: 'Monthly Support',
      labelFr: 'Soutien mensuel',
      descriptionEn: 'Contribute every month',
      descriptionFr: 'Contribuer chaque mois',
    },
    {
      value: 'quarterly',
      labelEn: 'Quarterly Support',
      labelFr: 'Soutien trimestriel',
      descriptionEn: 'Contribute every 3 months',
      descriptionFr: 'Contribuer tous les 3 mois',
    },
    {
      value: 'yearly',
      labelEn: 'Annual Support',
      labelFr: 'Soutien annuel',
      descriptionEn: 'Contribute once per year',
      descriptionFr: 'Contribuer une fois par an',
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 via-background to-green-50 dark:from-blue-950 dark:via-background dark:to-green-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            {language === 'fr' ? 'Soutenez votre École' : 'Support Your School'}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {language === 'fr'
              ? "En tant qu'ancien élève, votre contribution aide à développer les infrastructures, soutenir les étudiants et maintenir l'excellence éducative au GBHS Bafia."
              : 'As an alumnus, your contribution helps develop infrastructure, support students, and maintain educational excellence at GBHS Bafia.'}
          </p>
        </div>

        {/* Impact Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg mb-4">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-foreground">1,247</div>
              <p className="text-sm text-muted-foreground">
                {language === 'fr' ? 'Étudiants actuels' : 'Current Students'}
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg mb-4">
                <Trophy className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-2xl font-bold text-foreground">8</div>
              <p className="text-sm text-muted-foreground">
                {language === 'fr'
                  ? 'Championnats gagnés'
                  : 'Championships Won'}
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg mb-4">
                <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="text-2xl font-bold text-foreground">85%</div>
              <p className="text-sm text-muted-foreground">
                {language === 'fr' ? 'Taux de réussite' : 'Success Rate'}
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg mb-4">
                <Heart className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-foreground">156</div>
              <p className="text-sm text-muted-foreground">
                {language === 'fr'
                  ? 'Anciens contributeurs'
                  : 'Alumni Contributors'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Contribution Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* One-time Contribution */}
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-bl-3xl flex items-center justify-center">
              <Gift className="h-8 w-8 text-white" />
            </div>
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold">
                {language === 'fr'
                  ? 'Contribution Unique'
                  : 'One-time Contribution'}
              </CardTitle>
              <CardDescription>
                {language === 'fr'
                  ? 'Faites un don ponctuel pour soutenir un projet spécifique'
                  : 'Make a single donation to support a specific project'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">
                  {language === 'fr' ? "Domaines d'impact" : 'Impact Areas'}
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4 text-blue-500" />
                    <span className="text-foreground">
                      {language === 'fr' ? 'Infrastructure' : 'Infrastructure'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4 text-green-500" />
                    <span className="text-foreground">
                      {language === 'fr' ? 'Bourses' : 'Scholarships'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <School className="h-4 w-4 text-purple-500" />
                    <span className="text-foreground">
                      {language === 'fr' ? 'Équipement' : 'Equipment'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    <span className="text-foreground">
                      {language === 'fr' ? 'Sports' : 'Sports'}
                    </span>
                  </div>
                </div>
              </div>

              <Dialog
                open={isContributionOpen}
                onOpenChange={setIsContributionOpen}
              >
                <DialogTrigger asChild>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    {language === 'fr'
                      ? 'Contribuer Maintenant'
                      : 'Contribute Now'}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {language === 'fr'
                        ? 'Faire une Contribution'
                        : 'Make a Contribution'}
                    </DialogTitle>
                    <DialogDescription>
                      {language === 'fr'
                        ? "Votre générosité aide à améliorer l'éducation au GBHS Bafia"
                        : 'Your generosity helps improve education at GBHS Bafia'}
                    </DialogDescription>
                  </DialogHeader>

                  <Form {...contributionForm}>
                    <form
                      onSubmit={contributionForm.handleSubmit(data =>
                        contributionMutation.mutate(data)
                      )}
                      className="space-y-4"
                    >
                      <FormField
                        control={contributionForm.control}
                        name="contributorName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {language === 'fr' ? 'Nom complet' : 'Full Name'}
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder={
                                  language === 'fr' ? 'Votre nom' : 'Your name'
                                }
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={contributionForm.control}
                        name="contributorEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {language === 'fr'
                                ? 'Email (optionnel)'
                                : 'Email (optional)'}
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder={
                                  language === 'fr'
                                    ? 'votre@email.com'
                                    : 'your@email.com'
                                }
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={contributionForm.control}
                        name="contributorPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {language === 'fr'
                                ? 'Numéro de téléphone'
                                : 'Phone Number'}
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="+237 6XX XXX XXX"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={contributionForm.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {language === 'fr'
                                ? 'Montant (XAF)'
                                : 'Amount (XAF)'}
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="50,000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={contributionForm.control}
                        name="paymentProvider"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {language === 'fr'
                                ? 'Mode de paiement'
                                : 'Payment Method'}
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue
                                    placeholder={
                                      language === 'fr'
                                        ? 'Choisir le mode'
                                        : 'Select method'
                                    }
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {paymentProviders.map(provider => (
                                  <SelectItem
                                    key={provider.value}
                                    value={provider.value}
                                  >
                                    <div className="flex items-center space-x-2">
                                      <span>{provider.icon}</span>
                                      <span>{provider.name}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={contributionForm.control}
                        name="purpose"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {language === 'fr'
                                ? 'Objectif de la contribution'
                                : 'Contribution Purpose'}
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue
                                    placeholder={
                                      language === 'fr'
                                        ? "Choisir l'objectif"
                                        : 'Select purpose'
                                    }
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {contributionPurposes.map(purpose => (
                                  <SelectItem
                                    key={purpose.value}
                                    value={purpose.value}
                                  >
                                    {language === 'fr'
                                      ? purpose.labelFr
                                      : purpose.labelEn}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={contributionForm.control}
                        name="graduationYear"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {language === 'fr'
                                ? 'Année de diplôme (optionnel)'
                                : 'Graduation Year (optional)'}
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="2010" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsContributionOpen(false)}
                        >
                          {language === 'fr' ? 'Annuler' : 'Cancel'}
                        </Button>
                        <Button
                          type="submit"
                          disabled={contributionMutation.isPending}
                        >
                          {contributionMutation.isPending
                            ? language === 'fr'
                              ? 'Traitement...'
                              : 'Processing...'
                            : language === 'fr'
                              ? 'Contribuer'
                              : 'Contribute'}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Recurring Subscription */}
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-bl-3xl flex items-center justify-center">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold">
                {language === 'fr' ? 'Soutien Récurrent' : 'Recurring Support'}
              </CardTitle>
              <CardDescription>
                {language === 'fr'
                  ? 'Devenez un soutien régulier avec des contributions automatiques'
                  : 'Become a regular supporter with automatic contributions'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">
                  {language === 'fr'
                    ? 'Avantages du soutien récurrent'
                    : 'Recurring Support Benefits'}
                </h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>
                    •{' '}
                    {language === 'fr'
                      ? 'Impact continu et prévisible'
                      : 'Continuous and predictable impact'}
                  </li>
                  <li>
                    •{' '}
                    {language === 'fr'
                      ? 'Rapports de progrès réguliers'
                      : 'Regular progress reports'}
                  </li>
                  <li>
                    •{' '}
                    {language === 'fr'
                      ? 'Reconnaissance spéciale'
                      : 'Special recognition'}
                  </li>
                  <li>
                    •{' '}
                    {language === 'fr'
                      ? 'Annulation à tout moment'
                      : 'Cancel anytime'}
                  </li>
                </ul>
              </div>

              <Dialog
                open={isSubscriptionOpen}
                onOpenChange={setIsSubscriptionOpen}
              >
                <DialogTrigger asChild>
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    {language === 'fr'
                      ? 'Commencer le Soutien'
                      : 'Start Supporting'}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {language === 'fr'
                        ? 'Soutien Récurrent'
                        : 'Recurring Support'}
                    </DialogTitle>
                    <DialogDescription>
                      {language === 'fr'
                        ? 'Configurez votre contribution automatique'
                        : 'Set up your automatic contribution'}
                    </DialogDescription>
                  </DialogHeader>

                  <Form {...subscriptionForm}>
                    <form
                      onSubmit={subscriptionForm.handleSubmit(data =>
                        subscriptionMutation.mutate(data)
                      )}
                      className="space-y-4"
                    >
                      <FormField
                        control={subscriptionForm.control}
                        name="subscriberName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {language === 'fr' ? 'Nom complet' : 'Full Name'}
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder={
                                  language === 'fr' ? 'Votre nom' : 'Your name'
                                }
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={subscriptionForm.control}
                        name="subscriberPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {language === 'fr'
                                ? 'Numéro de téléphone'
                                : 'Phone Number'}
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="+237 6XX XXX XXX"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={subscriptionForm.control}
                        name="subscriptionType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {language === 'fr' ? 'Fréquence' : 'Frequency'}
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue
                                    placeholder={
                                      language === 'fr'
                                        ? 'Choisir la fréquence'
                                        : 'Select frequency'
                                    }
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {subscriptionTypes.map(type => (
                                  <SelectItem
                                    key={type.value}
                                    value={type.value}
                                  >
                                    <div>
                                      <div className="font-medium">
                                        {language === 'fr'
                                          ? type.labelFr
                                          : type.labelEn}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {language === 'fr'
                                          ? type.descriptionFr
                                          : type.descriptionEn}
                                      </div>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={subscriptionForm.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {language === 'fr'
                                ? 'Montant (XAF)'
                                : 'Amount (XAF)'}
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="25,000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={subscriptionForm.control}
                        name="paymentProvider"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {language === 'fr'
                                ? 'Mode de paiement'
                                : 'Payment Method'}
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue
                                    placeholder={
                                      language === 'fr'
                                        ? 'Choisir le mode'
                                        : 'Select method'
                                    }
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {paymentProviders.map(provider => (
                                  <SelectItem
                                    key={provider.value}
                                    value={provider.value}
                                  >
                                    <div className="flex items-center space-x-2">
                                      <span>{provider.icon}</span>
                                      <span>{provider.name}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsSubscriptionOpen(false)}
                        >
                          {language === 'fr' ? 'Annuler' : 'Cancel'}
                        </Button>
                        <Button
                          type="submit"
                          disabled={subscriptionMutation.isPending}
                        >
                          {subscriptionMutation.isPending
                            ? language === 'fr'
                              ? 'Création...'
                              : 'Creating...'
                            : language === 'fr'
                              ? "Créer l'abonnement"
                              : 'Create Subscription'}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>

        {/* Mobile Money Information */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Smartphone className="h-5 w-5" />
              <span>
                {language === 'fr'
                  ? 'Modes de Paiement Mobile'
                  : 'Mobile Payment Methods'}
              </span>
            </CardTitle>
            <CardDescription>
              {language === 'fr'
                ? 'Nous acceptons tous les principaux fournisseurs de paiement mobile au Cameroun'
                : 'We accept all major mobile payment providers in Cameroon'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {paymentProviders.map(provider => (
                <div
                  key={provider.value}
                  className="flex items-center space-x-4 p-4 border rounded-lg"
                >
                  <div
                    className={`w-12 h-12 ${provider.color} rounded-lg flex items-center justify-center text-white text-xl`}
                  >
                    {provider.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold">{provider.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {language === 'fr'
                        ? 'Paiement sécurisé'
                        : 'Secure payment'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-foreground mb-4">
            {language === 'fr'
              ? "Ensemble, Construisons l'Avenir"
              : "Together, Let's Build the Future"}
          </h3>
          <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
            {language === 'fr'
              ? "Chaque contribution, grande ou petite, fait une différence dans la vie de nos étudiants. Rejoignez notre communauté d'anciens élèves engagés."
              : "Every contribution, big or small, makes a difference in our students' lives. Join our community of committed alumni."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => setIsContributionOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Heart className="h-5 w-5 mr-2" />
              {language === 'fr' ? 'Faire un Don' : 'Make a Donation'}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setIsSubscriptionOpen(true)}
            >
              <TrendingUp className="h-5 w-5 mr-2" />
              {language === 'fr' ? 'Soutien Régulier' : 'Regular Support'}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
