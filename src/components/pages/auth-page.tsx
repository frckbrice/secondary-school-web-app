'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/use-auth';
import { useLanguage } from '../../hooks/use-language';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Loader2, School, User, Mail, Phone, EyeOff, Eye } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Alert, AlertDescription } from '../ui/alert';
import { toast } from '../../hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z
  .object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    fullName: z.string().min(2, 'Full name is required').optional(),
    email: z.string().email('Valid email is required'),
    phone: z.string().min(10, 'Phone number is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    role: z.string().default('user'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const { t, language } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('login');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      role: 'user',
    },
  });

  // Set active tab based on URL parameter
  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'register') {
      setActiveTab('register');
    } else {
      setActiveTab('login');
    }
  }, [searchParams]);

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      if (user.role === 'teacher') {
        router.push('/teacher');
      } else if (user.role === 'super_admin') {
        router.push('/super-admin');
      } else if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    }
  }, [user, router]);

  // Don't render the form if user is authenticated
  if (user) {
    return null;
  }

  const onLogin = (data: LoginFormData) => {
    loginMutation.mutate(data, {
      onSuccess: user => {
        toast({
          title: language === 'fr' ? 'Connexion réussie' : 'Login successful',
          description: language === 'fr' ? 'Bienvenue!' : 'Welcome!',
        });
        if (user.role === 'teacher') {
          router.push('/teacher');
        } else if (user.role === 'super_admin') {
          router.push('/super-admin');
        } else if (user.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/');
        }
      },
      onError: error => {
        toast({
          title: language === 'fr' ? 'Erreur de connexion' : 'Login failed',
          description:
            error.message ||
            (language === 'fr'
              ? 'Identifiants invalides'
              : 'Invalid credentials'),
          variant: 'destructive',
        });
      },
    });
  };

  const onRegister = (data: RegisterFormData) => {
    registerMutation.mutate(data, {
      onSuccess: user => {
        toast({
          title:
            language === 'fr'
              ? 'Inscription réussie'
              : 'Registration successful',
          description:
            language === 'fr'
              ? 'Compte créé avec succès!'
              : 'Account created successfully!',
        });
        if (user.role === 'teacher') {
          router.push('/teacher');
        } else if (user.role === 'super_admin') {
          router.push('/super-admin');
        } else if (user.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/');
        }
      },
      onError: error => {
        toast({
          title:
            language === 'fr' ? "Erreur d'inscription" : 'Registration failed',
          description:
            error.message ||
            (language === 'fr'
              ? 'Impossible de créer le compte'
              : 'Unable to create account'),
          variant: 'destructive',
        });
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <School className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            GBHS Bafia
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {language === 'fr' ? "Portail d'accès" : 'Access Portal'}
          </p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-center">
              {language === 'fr' ? 'Authentification' : 'Authentication'}
            </CardTitle>
            <CardDescription className="text-center">
              {language === 'fr'
                ? 'Connectez-vous ou créez un compte pour accéder à nos services'
                : 'Sign in or create an account to access our services'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">
                  {language === 'fr' ? 'Connexion' : 'Login'}
                </TabsTrigger>
                <TabsTrigger value="register">
                  {language === 'fr' ? 'Inscription' : 'Register'}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <Form {...loginForm}>
                  <form
                    onSubmit={loginForm.handleSubmit(onLogin)}
                    className="space-y-4"
                  >
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {language === 'fr'
                              ? "Nom d'utilisateur"
                              : 'Username'}
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder={
                                language === 'fr'
                                  ? "Entrez votre nom d'utilisateur"
                                  : 'Enter your username'
                              }
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {language === 'fr' ? 'Mot de passe' : 'Password'}
                          </FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input
                                type={isPasswordVisible ? 'text' : 'password'}
                                placeholder={
                                  language === 'fr'
                                    ? 'Entrez votre mot de passe'
                                    : 'Enter your password'
                                }
                                {...field}
                              />
                            </FormControl>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() =>
                                setIsPasswordVisible(!isPasswordVisible)
                              }
                            >
                              {isPasswordVisible ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {language === 'fr' ? 'Se connecter' : 'Sign In'}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="register" className="space-y-4">
                <Form {...registerForm}>
                  <form
                    onSubmit={registerForm.handleSubmit(onRegister)}
                    className="space-y-4"
                  >
                    <FormField
                      control={registerForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {language === 'fr' ? 'Nom complet' : 'Full Name'}
                          </FormLabel>
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
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {language === 'fr'
                              ? "Nom d'utilisateur"
                              : 'Username'}
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder={
                                language === 'fr'
                                  ? "Choisissez un nom d'utilisateur"
                                  : 'Choose a username'
                              }
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {language === 'fr' ? 'Email' : 'Email'}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder={
                                language === 'fr'
                                  ? 'Entrez votre email'
                                  : 'Enter your email'
                              }
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {language === 'fr' ? 'Téléphone' : 'Phone'}
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder={
                                language === 'fr'
                                  ? 'Entrez votre numéro de téléphone'
                                  : 'Enter your phone number'
                              }
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {language === 'fr' ? 'Mot de passe' : 'Password'}
                          </FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input
                                type={isPasswordVisible ? 'text' : 'password'}
                                placeholder={
                                  language === 'fr'
                                    ? 'Choisissez un mot de passe'
                                    : 'Choose a password'
                                }
                                {...field}
                              />
                            </FormControl>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() =>
                                setIsPasswordVisible(!isPasswordVisible)
                              }
                            >
                              {isPasswordVisible ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {language === 'fr'
                              ? 'Confirmer le mot de passe'
                              : 'Confirm Password'}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder={
                                language === 'fr'
                                  ? 'Confirmez votre mot de passe'
                                  : 'Confirm your password'
                              }
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {language === 'fr' ? 'Rôle' : 'Role'}
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
                                      ? 'Sélectionnez un rôle'
                                      : 'Select a role'
                                  }
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="user">
                                {language === 'fr' ? 'Utilisateur' : 'User'}
                              </SelectItem>
                              <SelectItem value="student">
                                {language === 'fr' ? 'Étudiant' : 'Student'}
                              </SelectItem>
                              <SelectItem value="teacher">
                                {language === 'fr' ? 'Enseignant' : 'Teacher'}
                              </SelectItem>
                              <SelectItem value="admin">
                                {language === 'fr'
                                  ? 'Administrateur'
                                  : 'Administrator'}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {language === 'fr' ? 'Créer un compte' : 'Create Account'}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Button
            variant="ghost"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            onClick={() => router.push('/')}
          >
            ← {language === 'fr' ? 'Retour au site' : 'Back to Website'}
          </Button>
        </div>
      </div>
    </div>
  );
}
