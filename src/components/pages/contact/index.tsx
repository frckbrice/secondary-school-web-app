'use client';

import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { Textarea } from '../../ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../ui/form';
import { insertContactSchema, type InsertContact } from '../../../schema';
import { apiRequest } from '../../../lib/queryClient';
import { useToast } from '../../../hooks/use-toast';
import { useLanguage } from '../../../hooks/use-language';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Loader2,
  ArrowLeft,
  Send,
  MessageSquare,
} from 'lucide-react';
import Link from 'next/link';
import { Header } from '../../globals/layout/header';
import { Footer } from '../../globals/layout/footer';

export default function ContactPage() {
  const { language, t } = useLanguage();
  const { toast } = useToast();

  const form = useForm<InsertContact>({
    resolver: zodResolver(insertContactSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      inquiryType: '',
      message: '',
    },
  });

  const submitContact = useMutation({
    mutationFn: async (data: InsertContact) => {
      const response = await apiRequest('POST', '/api/contacts', data);
      if (!response) {
        throw new Error('No response received');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: language === 'fr' ? 'Message Envoyé' : 'Message Sent',
        description:
          language === 'fr'
            ? 'Votre message a été envoyé avec succès. Nous vous répondrons bientôt.'
            : 'Your message has been sent successfully. We will get back to you soon.',
      });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title:
          language === 'fr' ? "Échec de l'Envoi" : 'Failed to Send Message',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: InsertContact) => {
    submitContact.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <div
        className="relative min-h-[70vh] flex items-center justify-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        {/* Navigation Header */}
        <div className="absolute top-20 left-0 right-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <Link href="/">
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/20 flex items-center space-x-2 backdrop-blur-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>
                    {language === 'fr' ? "Retour à l'accueil" : 'Back to Home'}
                  </span>
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-white text-center">
                {language === 'fr' ? 'Contactez-Nous' : 'Contact Us'}
              </h1>
              <div className="w-32"></div>
            </div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <div className="bg-black/40 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-white/20">
            <MessageSquare className="w-16 h-16 mx-auto mb-6 text-blue-300" />
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {language === 'fr' ? 'Parlons Ensemble' : "Let's Talk"}
            </h2>
            <p className="text-xl md:text-2xl text-blue-100 leading-relaxed mb-6">
              {language === 'fr'
                ? 'Nous sommes là pour répondre à toutes vos questions et préoccupations'
                : "We're here to answer all your questions and concerns"}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
                <span className="text-blue-200 font-medium">
                  {language === 'fr' ? 'Réponse rapide' : 'Quick Response'}
                </span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
                <span className="text-blue-200 font-medium">
                  {language === 'fr' ? 'Support 24/7' : '24/7 Support'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-bold text-3xl sm:text-4xl text-foreground mb-4">
              {t('contact.title')}
            </h2>
            <p className="text-xl text-muted-foreground">
              {t('contact.subtitle')}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div className="lg:col-span-1">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-foreground">
                    {t('contact.info')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">
                        {t('contact.address')}
                      </h4>
                      <p className="text-muted-foreground">
                        Government Bilingual High School
                        <br />
                        Bafia, Centre Region
                        <br />
                        Cameroon
                        <br />
                        <span className="font-medium">P.O. Box 327</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">
                        {t('contact.phone')}
                      </h4>
                      <p className="text-muted-foreground">+237 222 175 175</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">
                        {t('contact.email')}
                      </h4>
                      <p className="text-muted-foreground">
                        lyceebilinguebafia@gmail.com
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">
                        {t('contact.hours')}
                      </h4>
                      <p className="text-muted-foreground">
                        Mon - Fri: 7:00 AM - 15:30 PM
                        <br />
                        Sat: Book an appointment
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-foreground">
                    {t('contact.sendMessage')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-6"
                    >
                      <div className="grid sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('contact.fullName')} *</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={
                                    language === 'fr'
                                      ? 'Entrez votre nom complet'
                                      : 'Enter your full name'
                                  }
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('contact.email')} *</FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder={
                                    language === 'fr'
                                      ? 'Entrez votre adresse email'
                                      : 'Enter your email address'
                                  }
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {language === 'fr'
                                ? 'Numéro de Téléphone'
                                : 'Phone Number'}
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="tel"
                                placeholder={
                                  language === 'fr'
                                    ? 'Entrez votre numéro de téléphone'
                                    : 'Enter your phone number'
                                }
                                value={field.value || ''}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                name={field.name}
                                ref={field.ref}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="inquiryType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('contact.inquiryType')} *</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue
                                    placeholder={
                                      language === 'fr'
                                        ? 'Sélectionnez le type de demande'
                                        : 'Select Inquiry Type'
                                    }
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="admissions">
                                  {language === 'fr'
                                    ? 'Admissions'
                                    : 'Admissions'}
                                </SelectItem>
                                <SelectItem value="academics">
                                  {language === 'fr'
                                    ? 'Programmes Académiques'
                                    : 'Academic Programs'}
                                </SelectItem>
                                <SelectItem value="general">
                                  {language === 'fr'
                                    ? 'Informations Générales'
                                    : 'General Information'}
                                </SelectItem>
                                <SelectItem value="complaint">
                                  {language === 'fr' ? 'Plainte' : 'Complaint'}
                                </SelectItem>
                                <SelectItem value="suggestion">
                                  {language === 'fr'
                                    ? 'Suggestion'
                                    : 'Suggestion'}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('contact.message')} *</FormLabel>
                            <FormControl>
                              <Textarea
                                rows={5}
                                placeholder={
                                  language === 'fr'
                                    ? 'Veuillez fournir des détails sur votre demande...'
                                    : 'Please provide details about your inquiry...'
                                }
                                className="resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        disabled={submitContact.isPending}
                        className="w-full"
                      >
                        {submitContact.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {language === 'fr' ? 'Envoi...' : 'Sending...'}
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            {language === 'fr'
                              ? 'Envoyer le Message'
                              : 'Send Message'}
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
