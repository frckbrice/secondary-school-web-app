'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
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
import {
  insertApplicationSchema,
  type InsertApplication,
} from '../../../../schema';
import { apiRequest } from '../../../../lib/queryClient';
import { useToast } from '../../../../hooks/use-toast';
import { useLanguage } from '../../../../hooks/use-language';
import {
  CheckCircle,
  Upload,
  Loader2,
  X,
  FileText,
  Download,
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface UploadedDocument {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
}

export default function AdmissionsSection() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState<
    UploadedDocument[]
  >([]);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<InsertApplication>({
    resolver: zodResolver(insertApplicationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      form: '',
      documents: null,
    },
  });

  const uploadDocument = async (file: File): Promise<UploadedDocument> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'gbhs-bafia/applications/documents');

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload document');
    }

    const result = await response.json();
    return {
      id: result.public_id,
      name: file.name,
      url: result.secure_url,
      size: file.size,
      type: file.type,
    };
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpg', '.jpeg', '.png'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        ['.docx'],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    onDrop: async acceptedFiles => {
      setIsUploading(true);
      try {
        const uploadPromises = acceptedFiles.map(uploadDocument);
        const uploadedDocs = await Promise.all(uploadPromises);
        setUploadedDocuments(prev => [...prev, ...uploadedDocs]);
        toast({
          title: 'Documents Uploaded',
          description: `${acceptedFiles.length} document(s) uploaded successfully.`,
        });
      } catch (error) {
        toast({
          title: 'Upload Failed',
          description: 'Failed to upload documents. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsUploading(false);
      }
    },
  });

  const removeDocument = (documentId: string) => {
    setUploadedDocuments(prev => prev.filter(doc => doc.id !== documentId));
  };

  const submitApplication = useMutation({
    mutationFn: async (data: InsertApplication) => {
      // Include uploaded document URLs
      const applicationData = {
        ...data,
        documents: uploadedDocuments.map(doc => doc.url),
      };

      const response = await apiRequest(
        'POST',
        '/api/applications',
        applicationData
      );
      if (!response) throw new Error('Failed to submit application');
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Application Submitted',
        description:
          'Your application has been submitted successfully. We will contact you soon.',
      });
      form.reset();
      setUploadedDocuments([]);
    },
    onError: (error: Error) => {
      toast({
        title: 'Submission Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: InsertApplication) => {
    setIsSubmitting(true);
    submitApplication.mutate(data, {
      onSettled: () => setIsSubmitting(false),
    });
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <section
      id="admissions"
      className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {language === 'fr' ? 'Admissions' : 'Admissions'}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {language === 'fr' ? 'Admissions' : 'Admissions'}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {language === 'fr' ? 'Admissions' : 'Admissions'}
              </h3>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">
                      1
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">
                      {language === 'fr'
                        ? 'Prérequis Académiques'
                        : 'Academic Prerequisites'}
                    </h4>
                    <p className="text-muted-foreground">
                      Completed primary education certificate or equivalent
                      qualification for Form 1 entry
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">
                      2
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">
                      {language === 'fr'
                        ? 'Documents de Candidature'
                        : 'Application Documents'}
                    </h4>
                    <p className="text-muted-foreground">
                      Birth certificate, academic transcripts, medical
                      certificate, and passport photographs
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">
                      3
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">
                      {language === 'fr'
                        ? 'Entrée au Collège'
                        : 'Entrance Assessment'}
                    </h4>
                    <p className="text-muted-foreground">
                      Placement test in Mathematics, English, and French for
                      appropriate class assignment
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
                <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  {language === 'fr'
                    ? 'Date Limite de Candidature'
                    : 'Application Deadline'}
                </h4>
                <p className="text-orange-700 dark:text-orange-300">
                  Applications for the 2025/2026 academic year close on{' '}
                  <strong>July 15, 2025</strong>
                </p>
              </div>
            </div>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-foreground">
                {language === 'fr'
                  ? 'Candidature en Ligne'
                  : 'Online Application'}
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
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {language === 'fr' ? 'Prénom' : 'First Name'} *
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Enter first name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {language === 'fr' ? 'Nom' : 'Last Name'} *
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Enter last name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

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
                            placeholder="Enter email address"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {language === 'fr' ? 'Téléphone' : 'Phone'} *
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="Enter phone number"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="form"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {language === 'fr' ? 'Formule' : 'Form'} *
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Form" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="form1">Form 1</SelectItem>
                            <SelectItem value="form2">Form 2</SelectItem>
                            <SelectItem value="form3">Form 3</SelectItem>
                            <SelectItem value="form4">Form 4</SelectItem>
                            <SelectItem value="form5">Form 5</SelectItem>
                            <SelectItem value="lower6">Lower Sixth</SelectItem>
                            <SelectItem value="upper6">Upper Sixth</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Document Upload Section */}
                  <div className="space-y-4">
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      {language === 'fr' ? 'Documents' : 'Documents'} *
                    </Label>

                    {/* Upload Area */}
                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                        isDragActive
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-blue-400'
                      } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <input {...getInputProps()} />
                      {isUploading ? (
                        <div className="flex flex-col items-center space-y-2">
                          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                          <p className="text-gray-600">
                            {language === 'fr'
                              ? 'Téléchargement des documents...'
                              : 'Uploading documents...'}
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center space-y-2">
                          <Upload className="w-8 h-8 text-gray-400" />
                          <p className="text-gray-600">
                            {isDragActive
                              ? language === 'fr'
                                ? 'Déposer les documents ici'
                                : 'Drop documents here'
                              : language === 'fr'
                                ? 'Cliquer pour télécharger les documents ou glisser-déposer'
                                : 'Click to upload documents or drag and drop'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {language === 'fr'
                              ? 'Formats acceptés : PDF, JPG, PNG, DOC, DOCX (Max 5MB chacun)'
                              : 'Accepted formats: PDF, JPG, PNG, DOC, DOCX (Max 5MB each)'}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Uploaded Documents List */}
                    {uploadedDocuments.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          {language === 'fr'
                            ? 'Documents Téléchargés'
                            : 'Uploaded Documents'}{' '}
                          ({uploadedDocuments.length})
                        </Label>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {uploadedDocuments.map(doc => (
                            <div
                              key={doc.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center space-x-3">
                                <FileText className="w-4 h-4 text-gray-500" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {doc.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {formatFileSize(doc.size)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(doc.url, '_blank')}
                                >
                                  <Download className="w-4 h-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeDocument(doc.id)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-4 px-6 text-lg font-semibold hover:bg-blue-700 transition-colors shadow-md"
                    disabled={isSubmitting || isUploading}
                  >
                    {isSubmitting && (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    )}
                    {language === 'fr' ? 'Soumettre' : 'Submit'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
