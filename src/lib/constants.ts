import { User, BookOpen, School, Home, Briefcase, MapPin } from 'lucide-react';

export interface StatusOption {
    value: string;
    label: string;
    icon: any;
    textClass?: string;
    bgClass?: string;
    styleClass?: string; // For StatusDisplay compatibility
}

// Color classes should be defined in CSS modules and passed here, but for shared constants we might need a mapping strategy.
// Actually, since AdminControls and StatusDisplay use different CSS modules (or maybe similar), and Lucide icons are components.
// We can store the *keys* and labels here, and map symbols/styles in the components to avoid circular deps or complex passing.

export const STATUS_VALUES = [
    'In Office',
    'In Class',
    'On Campus',
    'Off Campus',
    'Left for Day',
    'Business Trip',
] as const;

export type StatusValue = typeof STATUS_VALUES[number];

export const STATUS_DEFINITIONS: Record<StatusValue, { label: string }> = {
    'In Office': { label: '재실 (In Office)' },
    'In Class': { label: '수업 중 (In Class)' },
    'On Campus': { label: '교내 (On Campus)' },
    'Off Campus': { label: '교외 (Off Campus)' },
    'Left for Day': { label: '퇴근 (Left for Day)' },
    'Business Trip': { label: '출장 (Business Trip)' },
};
