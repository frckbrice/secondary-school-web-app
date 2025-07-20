'use client';

import React, { useState } from 'react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Switch } from './switch';
import { Label } from './label';
import { useAccessibility } from '../accessibility/accessibility-provider';
import { useLanguage } from '../../hooks/use-language';
import {
    Settings,
    Eye,
    EyeOff,
    Type,
    Zap,
    ZapOff,
    X,
    Accessibility,
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from './dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from './select';

export function AccessibilitySettings() {
    const [isOpen, setIsOpen] = useState(false);
    const {
        isHighContrast,
        isReducedMotion,
        fontSize,
        toggleHighContrast,
        toggleReducedMotion,
        setFontSize,
    } = useAccessibility();
    const { language } = useLanguage();

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="fixed bottom-4 right-4 z-50 rounded-full w-12 h-12 p-0 shadow-lg bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-200"
                    aria-label={
                        language === 'fr'
                            ? 'Paramètres d\'accessibilité'
                            : 'Accessibility Settings'
                    }
                >
                    <Accessibility className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        {language === 'fr' ? 'Accessibilité' : 'Accessibility'}
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                    {/* High Contrast Mode */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                {isHighContrast ? (
                                    <EyeOff className="w-5 h-5 text-orange-600" />
                                ) : (
                                    <Eye className="w-5 h-5 text-gray-600" />
                                )}
                                {language === 'fr' ? 'Contraste Élevé' : 'High Contrast'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="high-contrast" className="text-sm">
                                    {language === 'fr'
                                        ? 'Améliore la lisibilité pour les utilisateurs malvoyants'
                                        : 'Improves readability for visually impaired users'}
                                </Label>
                                <Switch
                                    id="high-contrast"
                                    checked={isHighContrast}
                                    onCheckedChange={toggleHighContrast}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Reduced Motion */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                {isReducedMotion ? (
                                    <ZapOff className="w-5 h-5 text-red-600" />
                                ) : (
                                    <Zap className="w-5 h-5 text-yellow-600" />
                                )}
                                {language === 'fr' ? 'Mouvement Réduit' : 'Reduced Motion'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="reduced-motion" className="text-sm">
                                    {language === 'fr'
                                        ? 'Réduit les animations pour les utilisateurs sensibles'
                                        : 'Reduces animations for motion-sensitive users'}
                                </Label>
                                <Switch
                                    id="reduced-motion"
                                    checked={isReducedMotion}
                                    onCheckedChange={toggleReducedMotion}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Font Size */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Type className="w-5 h-5 text-blue-600" />
                                {language === 'fr' ? 'Taille de Police' : 'Font Size'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <Label htmlFor="font-size" className="text-sm">
                                    {language === 'fr'
                                        ? 'Ajustez la taille du texte pour une meilleure lisibilité'
                                        : 'Adjust text size for better readability'}
                                </Label>
                                <Select value={fontSize} onValueChange={setFontSize}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="small">
                                            {language === 'fr' ? 'Petit' : 'Small'}
                                        </SelectItem>
                                        <SelectItem value="medium">
                                            {language === 'fr' ? 'Moyen' : 'Medium'}
                                        </SelectItem>
                                        <SelectItem value="large">
                                            {language === 'fr' ? 'Grand' : 'Large'}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Keyboard Navigation Info */}
                    <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                        <CardContent className="pt-4">
                            <div className="text-sm text-blue-800 dark:text-blue-200">
                                <h4 className="font-semibold mb-2">
                                    {language === 'fr' ? 'Navigation Clavier' : 'Keyboard Navigation'}
                                </h4>
                                <ul className="space-y-1 text-xs">
                                    <li>• {language === 'fr' ? 'Tab' : 'Tab'} - {language === 'fr' ? 'Naviguer entre les éléments' : 'Navigate between elements'}</li>
                                    <li>• {language === 'fr' ? 'Entrée' : 'Enter'} - {language === 'fr' ? 'Activer les liens' : 'Activate links'}</li>
                                    <li>• {language === 'fr' ? 'Échap' : 'Escape'} - {language === 'fr' ? 'Fermer les modales' : 'Close modals'}</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    );
} 