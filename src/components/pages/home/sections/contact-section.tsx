'use client';

import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../ui/select';
import { Textarea } from '../../../ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../ui/form';
import { insertContactSchema, type InsertContact } from '../../../../schema';
import { apiRequest } from '../../../../lib/queryClient';
import { useToast } from '../../../../hooks/use-toast';
import { useLanguage } from '../../../../hooks/use-language';
import { MapPin, Phone, Mail, Clock, Loader2 } from 'lucide-react';

export default function ContactSection() {
  const { language } = useLanguage();
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
      if (!response) throw new Error('Failed to send message');
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Message Sent',
        description:
          'Your message has been sent successfully. We will get back to you soon.',
      });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Send Message',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: InsertContact) => {
    submitContact.mutate(data);
  };

  return (
    <section
      id="contact"
      className="py-16 bg-gradient-to-br from-orange-50 via-background to-red-50 dark:from-orange-950 dark:via-background dark:to-red-950"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-bold text-3xl sm:text-4xl text-foreground mb-4">
            {language === 'fr' ? 'Contact' : 'Contact'}
          </h2>
          <p className="text-xl text-muted-foreground">
            {language === 'fr' ? 'Contact' : 'Contact'}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-foreground">
                  {language === 'fr' ? 'Contact' : 'Contact'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      {language === 'fr' ? 'Adresse' : 'Address'}
                    </h4>
                    <p className="text-muted-foreground">
                      {language === 'fr'
                        ? 'Lycée Bilingue de Bafia'
                        : 'Government Bilingual High School'}
                      <br />
                      {language === 'fr'
                        ? 'Bafia, Centre Region'
                        : 'Bafia, Centre Region'}
                      <br />
                      {language === 'fr' ? 'Cameroun' : 'Cameroon'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      {language === 'fr' ? 'Téléphone' : 'Phone'}
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
                      {language === 'fr' ? 'Email' : 'Email'}
                    </h4>
                    <p className="text-muted-foreground">
                      lyceebilinguebafia@gmail.com
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      P.O. Box
                    </h4>
                    <p className="text-muted-foreground">327</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      {language === 'fr' ? 'Horaires' : 'Hours'}
                    </h4>
                    <p className="text-muted-foreground">
                      {language === 'fr'
                        ? 'Lun - Ven: 7:00 AM - 15:30 PM'
                        : 'Mon - Fri: 7:00 AM - 15:30 PM'}
                      <br />
                      {language === 'fr'
                        ? 'Sam: Réserver un rendez-vous'
                        : 'Sat: Book an appointment'}
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
                  {language === 'fr' ? 'Envoyer un Message' : 'Send Message'}
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
                            <FormLabel>
                              {language === 'fr' ? 'Nom Complet' : 'Full Name'}{' '}
                              *
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your full name"
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
                            <FormLabel>
                              {language === 'fr' ? 'Email' : 'Email'} *
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="Enter your email address"
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
                              placeholder="Enter your phone number"
                              {...field}
                              value={field.value ?? ''}
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
                          <FormLabel>
                            {language === 'fr'
                              ? 'Type de Requête'
                              : 'Inquiry Type'}{' '}
                            *
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Inquiry Type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="admissions">
                                Admissions
                              </SelectItem>
                              <SelectItem value="academics">
                                Academic Programs
                              </SelectItem>
                              <SelectItem value="general">
                                General Information
                              </SelectItem>
                              <SelectItem value="complaint">
                                Complaint
                              </SelectItem>
                              <SelectItem value="suggestion">
                                Suggestion
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
                          <FormLabel>
                            {language === 'fr' ? 'Message' : 'Message'} *
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              rows={5}
                              placeholder="Please provide details about your inquiry..."
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
                      className="w-full bg-blue-600 text-white py-4 px-6 text-lg font-semibold hover:bg-blue-700 transition-colors shadow-md"
                      disabled={submitContact.isPending}
                    >
                      {submitContact.isPending && (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      )}
                      {language === 'fr' ? 'Envoyer' : 'Send'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
