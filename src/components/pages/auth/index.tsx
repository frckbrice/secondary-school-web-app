'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/use-auth';
import { useLanguage } from '../../../hooks/use-language';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import {
  Loader2,
  School,
  User,
  Mail,
  Phone,
  EyeOff,
  Eye,
  Shield,
} from 'lucide-react';
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
} from '../../ui/form';
import { Alert, AlertDescription } from '../../ui/alert';
import { useToast } from '../../../hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  role: z.string().min(1, 'Role is required'),
});

const registerSchema = z
  .object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    fullName: z.string().min(2, 'Full name is required').optional(),
    email: z.string().email('Valid email is required'),
    phone: z.string().min(10, 'Phone number is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    role: z.string().default('student'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { toast } = useToast();
  const { user, loginMutation, registerMutation } = useAuth();
  const { language, t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('login');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState('student');

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
      role: 'student',
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
      role: 'student',
    },
  });

  // Set active tab and role based on URL parameter
  useEffect(() => {
    const mode = searchParams.get('mode');
    const role = searchParams.get('role');

    if (mode === 'register') {
      setActiveTab('register');
    } else {
      setActiveTab('login');
    }

    if (role) {
      setSelectedRole(role);
      loginForm.setValue('role', role);
      registerForm.setValue('role', role);
    }
  }, [searchParams, loginForm, registerForm]);

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      if (user.role === 'teacher') {
        router.push('/teacher');
      } else if (user.role === 'super_admin') {
        router.push('/super-admin');
      } else if (user.role === 'admin') {
        router.push('/admin');
      } else if (user.role === 'student') {
        router.push('/student-portal');
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
          variant: 'success',
        });
        if (user.role === 'teacher') {
          router.push('/teacher');
        } else if (user.role === 'super_admin') {
          router.push('/super-admin');
        } else if (user.role === 'admin') {
          router.push('/admin');
        } else if (user.role === 'student') {
          router.push('/student-portal');
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
          variant: 'success',
        });
        if (user.role === 'teacher') {
          router.push('/teacher');
        } else if (user.role === 'super_admin') {
          router.push('/super-admin');
        } else if (user.role === 'admin') {
          router.push('/admin');
        } else if (user.role === 'student') {
          router.push('/student-portal');
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

  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
    loginForm.setValue('role', role);
    registerForm.setValue('role', role);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <School className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            ""
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {language === 'fr' ? 'Portail de Connexion' : 'Login Portal'}
          </p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
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
                <div className="space-y-2">
                  <Label>
                    {language === 'fr' ? 'Type de Compte' : 'Account Type'}
                  </Label>
                  <Select value={selectedRole} onValueChange={handleRoleChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {language === 'fr' ? 'Étudiant' : 'Student'}
                        </div>
                      </SelectItem>
                      <SelectItem value="teacher">
                        <div className="flex items-center gap-2">
                          <School className="w-4 h-4" />
                          {language === 'fr' ? 'Enseignant' : 'Teacher'}
                        </div>
                      </SelectItem>
                      <SelectItem value="admin">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          {language === 'fr' ? 'Administrateur' : 'Admin'}
                        </div>
                      </SelectItem>
                      <SelectItem value="super_admin">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          {language === 'fr' ? 'Super Admin' : 'Super Admin'}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

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
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={isPasswordVisible ? 'text' : 'password'}
                                placeholder={
                                  language === 'fr'
                                    ? 'Entrez votre mot de passe'
                                    : 'Enter your password'
                                }
                                {...field}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
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
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {language === 'fr' ? 'Connexion...' : 'Signing in...'}
                        </>
                      ) : language === 'fr' ? (
                        'Se Connecter'
                      ) : (
                        'Sign In'
                      )}
                    </Button>
                  </form>
                </Form>

                {/* Demo Credentials */}
                {(selectedRole === 'admin' ||
                  selectedRole === 'super_admin') && (
                  <Alert>
                    <AlertDescription className="text-sm">
                      <strong>Demo Credentials:</strong>
                      <br />
                      <strong>Super Admin:</strong> super_admin / admin123
                      <br />
                      <strong>Admin:</strong> admin_user / admin123
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              <TabsContent value="register" className="space-y-4">
                <div className="space-y-2">
                  <Label>
                    {language === 'fr' ? 'Type de Compte' : 'Account Type'}
                  </Label>
                  <Select value={selectedRole} onValueChange={handleRoleChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {language === 'fr' ? 'Étudiant' : 'Student'}
                        </div>
                      </SelectItem>
                      <SelectItem value="teacher">
                        <div className="flex items-center gap-2">
                          <School className="w-4 h-4" />
                          {language === 'fr' ? 'Enseignant' : 'Teacher'}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Form {...registerForm}>
                  <form
                    onSubmit={registerForm.handleSubmit(onRegister)}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
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
                        control={registerForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {language === 'fr' ? 'Nom Complet' : 'Full Name'}
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
                    </div>

                    <div className="grid grid-cols-2 gap-4">
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
                                type="tel"
                                placeholder={
                                  language === 'fr'
                                    ? 'Entrez votre téléphone'
                                    : 'Enter your phone'
                                }
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {language === 'fr' ? 'Mot de passe' : 'Password'}
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={isPasswordVisible ? 'text' : 'password'}
                                  placeholder={
                                    language === 'fr'
                                      ? 'Entrez votre mot de passe'
                                      : 'Enter your password'
                                  }
                                  {...field}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
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
                            </FormControl>
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
                              {language === 'fr' ? 'Confirmer' : 'Confirm'}
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
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {language === 'fr'
                            ? 'Inscription...'
                            : 'Registering...'}
                        </>
                      ) : language === 'fr' ? (
                        "S'inscrire"
                      ) : (
                        'Register'
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
