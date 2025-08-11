import chalk from 'chalk';
import fs from 'fs-extra';
import type { ProjectConfig } from '../types';

export async function createCustomComponents() {
  // Only create custom non-shadcn components now
  // shadcn/ui components will be installed via the CLI

  // Custom TextInput component
  const textInputComponent = `"use client";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ClassValue } from "clsx";
import type { FieldValues, UseControllerProps } from "react-hook-form";
import { useFormContext } from "react-hook-form";

interface TextInputProps<T extends FieldValues> extends UseControllerProps<T> {
    label: string;
    className?: ClassValue;
    inputClassName?: ClassValue;
    type?: HTMLInputElement["type"];
    required?: boolean;
    onChange?: (value: string) => void;
    placeholder?: string;
    showLabel?: boolean;
}

export function TextInput<T extends FieldValues>({
    label,
    className,
    inputClassName,
    type = "text",
    name,
    disabled,
    required,
    onChange,
    placeholder,
    showLabel = true,
    ...props
}: TextInputProps<T>) {
    const { control } = useFormContext<T>();
    return (
        <FormField
            name={name}
            control={control}
            {...props}
            render={({ field }) => (
                <FormItem className={cn("flex w-full flex-col gap-1", className)}>
                    {showLabel && (
                        <FormLabel className="text-sm font-semibold text-[#181818]">
                            {label} {required && <span className="text-red-500">*</span>}
                        </FormLabel>
                    )}
                    <FormControl>
                        <Input
                            type={type}
                            disabled={disabled}
                            {...field}
                            className={cn(
                                "w-full justify-between overflow-hidden overflow-ellipsis whitespace-nowrap rounded-lg border-neutral-200 bg-white p-3 font-normal text-neutral-500 focus:ring-0 h-11 focus-visible:ring-0",
                                !field.value && "text-muted-foreground",
                                inputClassName
                            )}
                            onChange={(e) => {
                                // Basic input handling
                                const value = e.target.value;
                                field.onChange(value);
                                onChange?.(value);
                            }}
                            placeholder={placeholder}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}`;

  fs.writeFileSync('components/shared/inputs/TextInput.tsx', textInputComponent);

  // Custom CheckboxInput component
  const checkboxInputComponent = `"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import type { FieldValues, UseControllerProps } from "react-hook-form";
import { useFormContext } from "react-hook-form";

interface CheckboxInputProps<T extends FieldValues> extends UseControllerProps<T> {
    label: string;
    className?: string;
    required?: boolean;
    onChange?: (value: string) => void;
}

export function CheckboxInput<T extends FieldValues>({
    label,
    className,
    name,
    disabled,
    required,
    onChange,
    ...props
}: CheckboxInputProps<T>) {
    const { control } = useFormContext<T>();
    return (
        <FormField
            name={name}
            control={control}
            {...props}
            render={({ field }) => (
                <FormItem className={cn("flex w-full flex-col gap-1", className)}>
                    <div className="flex w-full flex-row items-center gap-2">
                        <FormControl>
                            <Checkbox
                                name={field.name}
                                checked={field.value}
                                onCheckedChange={(value) => {
                                    field.onChange(value);
                                    onChange?.(String(value));
                                }}
                                disabled={disabled}
                                className={cn("", className)}
                            />
                        </FormControl>
                        <FormLabel className="text-sm font-semibold text-[#181818]">
                            {label} {required && <span className="text-red-500">*</span>}
                        </FormLabel>

                    </div>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}`;

  fs.writeFileSync('components/shared/inputs/CheckboxInput.tsx', checkboxInputComponent);

  // Container component
  const containerComponent = `export default function Container({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={\`mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl \${className}\`}>
            {children}
        </div>
    );
}`;

  fs.writeFileSync('components/shared/Container.tsx', containerComponent);

  // Spinner component
  const spinnerComponent = `import React from 'react';
import { cn } from '@/lib/utils';
import { VariantProps, cva } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';

const spinnerVariants = cva('flex-col items-center justify-center', {
    variants: {
        show: {
            true: 'flex',
            false: 'hidden',
        },
    },
    defaultVariants: {
        show: true,
    },
});

const loaderVariants = cva('animate-spin text-primary', {
    variants: {
        size: {
            small: 'size-6',
            medium: 'size-8',
            large: 'size-12',
        },
    },
    defaultVariants: {
        size: 'medium',
    },
});

interface SpinnerContentProps
    extends VariantProps<typeof spinnerVariants>,
    VariantProps<typeof loaderVariants> {
    className?: string;
    children?: React.ReactNode;
}

export function Spinner({ size, show, children, className }: SpinnerContentProps) {
    return (
        <span className={spinnerVariants({ show })}>
            <Loader2 className={cn(loaderVariants({ size }), className)} />
            {children}
        </span>
    );
}`;

  fs.writeFileSync('components/shared/Spinner.tsx', spinnerComponent);
}

export async function createSharedComponents(components: ProjectConfig['components']) {
  // Create selected shared components based on user choice
  
  // Create custom inputs if selected
  if (components.customInputs || components.fileUpload || components.dateTimeInput || components.radioGroupInput) {
    await createSharedInputs(components);
  }
  
  // Create data table if selected
  if (components.dataTable) {
    await createSharedDataTable();
  }
}

export async function createSharedInputs(components: ProjectConfig['components']) {
  // Create input components based on user selection
  
  if (components.customInputs) {
    // SelectInput component
    const selectInputComponent = `"use client";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { FieldValues, UseControllerProps } from "react-hook-form";
import { useFormContext } from "react-hook-form";

interface SelectInputProps<T extends FieldValues> extends UseControllerProps<T> {
    label: string;
    className?: string;
    required?: boolean;
    placeholder?: string;
    options: { value: string | number | boolean; label: string }[];
    onChange?: (value: string | number | boolean) => void;
    valueType?: 'string' | 'number' | 'boolean';
}

export function SelectInput<T extends FieldValues>({
    label,
    className,
    name,
    disabled,
    required,
    placeholder = "Select...",
    options,
    onChange,
    valueType = 'string',
    ...props
}: SelectInputProps<T>) {
    const { control } = useFormContext<T>();

    const convertValue = (stringValue: string) => {
        switch (valueType) {
            case 'boolean': return stringValue === 'true';
            case 'number': return Number(stringValue);
            default: return stringValue;
        }
    };

    return (
        <FormField
            name={name}
            control={control}
            {...props}
            render={({ field }) => (
                <FormItem className={cn("flex w-full flex-col gap-1", className)}>
                    <FormLabel className="text-sm font-semibold text-[#181818]">
                        {label} {required && <span className="text-red-500">*</span>}
                    </FormLabel>
                    <Select
                        disabled={disabled}
                        onValueChange={(stringValue: string) => {
                            const convertedValue = convertValue(stringValue);
                            field.onChange(convertedValue);
                            onChange?.(convertedValue);
                        }}
                        value={field.value !== undefined ? String(field.value) : undefined}
                    >
                        <FormControl>
                            <SelectTrigger className="w-full h-11 rounded-lg border-neutral-200 bg-white p-3 focus:ring-0 focus-visible:ring-0">
                                <SelectValue placeholder={placeholder} />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {options.map((option) => (
                                <SelectItem key={String(option.value)} value={String(option.value)}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}`;
    fs.writeFileSync('components/shared/inputs/SelectInput.tsx', selectInputComponent);

    // PasswordInput component
    const passwordInputComponent = `"use client";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import type { FieldValues, UseControllerProps } from "react-hook-form";
import { useFormContext } from "react-hook-form";

interface PasswordInputProps<T extends FieldValues> extends UseControllerProps<T> {
    label: string;
    className?: string;
    required?: boolean;
    placeholder?: string;
    onChange?: (value: string) => void;
    showStrengthIndicator?: boolean;
}

export function PasswordInput<T extends FieldValues>({
    label,
    className,
    name,
    disabled,
    required,
    placeholder = "Enter password",
    onChange,
    showStrengthIndicator = false,
    ...props
}: PasswordInputProps<T>) {
    const { control } = useFormContext<T>();
    const [showPassword, setShowPassword] = useState(false);

    const getPasswordStrength = (password: string) => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        return strength;
    };

    const getStrengthLabel = (strength: number) => {
        switch (strength) {
            case 0: case 1: return "Weak";
            case 2: return "Fair";
            case 3: return "Good";
            case 4: return "Strong";
            case 5: return "Very Strong";
            default: return "Weak";
        }
    };

    const getStrengthColor = (strength: number) => {
        switch (strength) {
            case 0: case 1: return "bg-red-500";
            case 2: return "bg-yellow-500";
            case 3: return "bg-blue-500";
            case 4: return "bg-green-500";
            case 5: return "bg-green-600";
            default: return "bg-gray-300";
        }
    };

    return (
        <FormField
            name={name}
            control={control}
            {...props}
            render={({ field }) => {
                const strength = showStrengthIndicator ? getPasswordStrength(field.value || '') : 0;
                return (
                    <FormItem className={cn("flex w-full flex-col gap-1", className)}>
                        <FormLabel className="text-sm font-semibold text-[#181818]">
                            {label} {required && <span className="text-red-500">*</span>}
                        </FormLabel>
                        <FormControl>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    disabled={disabled}
                                    {...field}
                                    className="w-full h-11 pr-10 rounded-lg border-neutral-200 bg-white p-3 focus:ring-0 focus-visible:ring-0"
                                    onChange={(e) => {
                                        field.onChange(e.target.value);
                                        onChange?.(e.target.value);
                                    }}
                                    placeholder={placeholder}
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4 text-gray-500" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-gray-500" />
                                    )}
                                </button>
                            </div>
                        </FormControl>
                        {showStrengthIndicator && field.value && (
                            <div className="space-y-2">
                                <div className="flex space-x-1">
                                    {[1, 2, 3, 4, 5].map((level) => (
                                        <div
                                            key={level}
                                            className={cn(
                                                "h-2 w-full rounded",
                                                level <= strength ? getStrengthColor(strength) : "bg-gray-200"
                                            )}
                                        />
                                    ))}
                                </div>
                                <p className="text-sm text-gray-600">
                                    Password strength: {getStrengthLabel(strength)}
                                </p>
                            </div>
                        )}
                        <FormMessage />
                    </FormItem>
                );
            }}
        />
    );
}`;
    fs.writeFileSync('components/shared/inputs/PasswordInput.tsx', passwordInputComponent);

    // TextareaInput component
    const textareaInputComponent = `"use client";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { FieldValues, UseControllerProps } from "react-hook-form";
import { useFormContext } from "react-hook-form";

interface TextareaInputProps<T extends FieldValues> extends UseControllerProps<T> {
    label: string;
    className?: string;
    required?: boolean;
    placeholder?: string;
    rows?: number;
    maxLength?: number;
    onChange?: (value: string) => void;
    showCharCount?: boolean;
}

export function TextareaInput<T extends FieldValues>({
    label,
    className,
    name,
    disabled,
    required,
    placeholder,
    rows = 4,
    maxLength,
    onChange,
    showCharCount = false,
    ...props
}: TextareaInputProps<T>) {
    const { control } = useFormContext<T>();

    return (
        <FormField
            name={name}
            control={control}
            {...props}
            render={({ field }) => (
                <FormItem className={cn("flex w-full flex-col gap-1", className)}>
                    <FormLabel className="text-sm font-semibold text-[#181818]">
                        {label} {required && <span className="text-red-500">*</span>}
                    </FormLabel>
                    <FormControl>
                        <Textarea
                            disabled={disabled}
                            rows={rows}
                            maxLength={maxLength}
                            {...field}
                            className="w-full rounded-lg border-neutral-200 bg-white p-3 focus:ring-0 focus-visible:ring-0 resize-none"
                            onChange={(e) => {
                                field.onChange(e.target.value);
                                onChange?.(e.target.value);
                            }}
                            placeholder={placeholder}
                        />
                    </FormControl>
                    {showCharCount && (
                        <div className="flex justify-end">
                            <span className="text-sm text-gray-500">
                                {field.value?.length || 0}
                                {maxLength && \`/\${maxLength}\`}
                            </span>
                        </div>
                    )}
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}`;
    fs.writeFileSync('components/shared/inputs/TextareaInput.tsx', textareaInputComponent);
  }

  // FileUpload component
  if (components.fileUpload) {
    const fileUploadSource = `import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info, UploadIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Spinner } from "../Spinner";
import { FormMessage } from "@/components/ui/form";
import { useFormStore } from "@/stores/formStore";

interface FileUploadProps {
    id: string;
    name: string;
    label: string;
    accept?: string;
    maxSize?: number;
    className?: string;
    defaultValues: File[];
    description?: string;
    error?: string;
    disabled?: boolean;
    required?: boolean;
    multiple?: boolean;
    maxFiles?: number;
    productConfigId?: string;
    fileType?: 'stl' | 'config'; // Add fileType to identify which file type we're dealing with
    onRemove?: (productConfigId: string) => void; 
    onChange?: (file: File[]) => void;
    onError?: (error: string) => void;
}

const FileUpload = React.forwardRef<HTMLInputElement, FileUploadProps>(
    (
        {
            id,
            name,
            label,
            accept,
            maxSize = 5000 * 1024 * 1024, // 5MB default
            className,
            description,
            disabled,
            required,
            onChange,
            onError,
            multiple = false,
            maxFiles = 100,
            defaultValues = [],
            productConfigId,
            fileType,
            onRemove,
            ...props
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _,
    ) => {
        const [files, setFiles] = useState<File[]>(defaultValues);
        const [previewUrls, setPreviewUrls] = useState<string[]>(
            Array.from(defaultValues).map((file) => URL.createObjectURL(file)),
        );
        const [isUploading, setIsUploading] = useState(false);
        const inputRef = useRef<HTMLInputElement>(null);

        const { removeDocument, subscription, getFile } = useFormStore();

        // Find existing document in store
        const existingDocument = React.useMemo(() => {
            if (!productConfigId) return null;
            return subscription.documents.documents.find(
                doc => doc.productConfigId === productConfigId
            );
        }, [subscription.documents.documents, productConfigId]);

        // Get the appropriate file metadata based on fileType
        const existingFileMetadata = React.useMemo(() => {
            if (!existingDocument || !fileType) return null;
            return fileType === 'stl' ? existingDocument.stlFileMetadata : existingDocument.configFileMetadata;
        }, [existingDocument, fileType]);

        const revokePreviews = useCallback(() => {
            previewUrls.forEach((previewUrl) => {
                URL.revokeObjectURL(previewUrl);
            });
        }, [previewUrls]);

        // Sync with store data on mount and when store changes
        useEffect(() => {
            const syncWithStore = async () => {
                if (existingFileMetadata && productConfigId && fileType) {
                    try {
                        // Try to get the actual file from store
                        const file = await getFile(productConfigId, fileType);
                        if (file) {
                            setFiles([file]);
                            // Don't create preview URLs for non-image files
                            if (file.type.startsWith('image/')) {
                                const previewUrl = URL.createObjectURL(file);
                                setPreviewUrls([previewUrl]);
                            } else {
                                setPreviewUrls([]);
                            }
                        } else {
                            // If we can't get the file but have metadata, create a placeholder
                            // This handles the case where the file exists in store but can't be retrieved as File object
                            const placeholderFile = new File([''], existingFileMetadata.name, {
                                type: existingFileMetadata.type,
                                lastModified: existingFileMetadata.lastModified
                            });
                            setFiles([placeholderFile]);
                            setPreviewUrls([]);
                        }
                    } catch (error) {
                        console.error('Error syncing with store:', error);
                        // Fallback: show file info from metadata
                        if (existingFileMetadata) {
                            const placeholderFile = new File([''], existingFileMetadata.name, {
                                type: existingFileMetadata.type,
                                lastModified: existingFileMetadata.lastModified
                            });
                            setFiles([placeholderFile]);
                            setPreviewUrls([]);
                        }
                    }
                } else if (!existingFileMetadata) {
                    // No file in store, reset local state
                    setFiles([]);
                    setPreviewUrls([]);
                }
            };

            syncWithStore();
        }, [existingFileMetadata, productConfigId, fileType, getFile]);

        useEffect(() => {
            return () => {
                if (previewUrls.length > 0) {
                    revokePreviews();
                }
            };
        }, [previewUrls, revokePreviews]);

        const handleFileChange = async (
            event: React.ChangeEvent<HTMLInputElement>,
        ) => {
            const selectedFiles = event.target.files;

            if (!selectedFiles || selectedFiles.length === 0) {
                setFiles([]);
                setPreviewUrls([]);
                onChange?.([]);
                return;
            }

            const filesArray = Array.from(selectedFiles);

            // Validate file size
            if (filesArray.some((selectedFile) => selectedFile.size > maxSize)) {
                const error = \`File size must be less than \${maxSize / (1024 * 1024)}MB\`;
                onError?.(error);
                event.target.value = "";
                return;
            }

            setIsUploading(true);
            try {
                if (previewUrls.length > 0) {
                    revokePreviews();
                }
                
                const newPreviewUrls: string[] = [];
                filesArray.forEach((file) => {
                    if (file.type.startsWith('image/')) {
                        newPreviewUrls.push(URL.createObjectURL(file));
                    }
                });
                setPreviewUrls(newPreviewUrls);

                const newFiles = multiple ? [...files, ...filesArray].slice(0, maxFiles) : filesArray;
                setFiles(newFiles);
                onChange?.(filesArray);
            } catch (error) {
                onError?.(error as string);
            } finally {
                setIsUploading(false);
            }
        };

        const handleRemoveFile = (index: number) => {
            const preview = previewUrls.at(index);
            if (preview) {
                URL.revokeObjectURL(preview);
            }
            setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
            
            // Use custom remove handler if provided, otherwise use default store removal
            if (productConfigId) {
                if (onRemove) {
                    onRemove(productConfigId);
                } else {
                    removeDocument(productConfigId);
                }
            }
            
            setFiles((prev) => {
                const newFiles = prev.filter((_, i) => i !== index);
                onChange?.(newFiles);
                return newFiles;
            });
            
            if (inputRef.current) {
                inputRef.current.value = "";
            }
        };

        const triggerFileInput = () => {
            inputRef.current?.click();
        };

        // Check if we have files (either from local state or store)
        const hasFiles = files.length > 0 || existingFileMetadata;
        const displayFiles = files.length > 0 ? files : (existingFileMetadata ? [
            new File([''], existingFileMetadata.name, {
                type: existingFileMetadata.type,
                lastModified: existingFileMetadata.lastModified
            })
        ] : []);

        return (
            <div className={cn("space-y-2", className)}>
                <div className="space-y-1">
                    <Label htmlFor={id} className="flex items-center space-x-2">
                        {label}
                        {required && <span className="text-destructive">*</span>}
                        {description && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Info className="h-4 w-4" />
                                    </TooltipTrigger>
                                    <TooltipContent>{description}</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </Label>
                </div>

                <div className="flex items-center">
                    <Input
                        id={id}
                        name={name}
                        type="file"
                        accept={accept}
                        disabled={disabled || isUploading}
                        required={required}
                        className="hidden"
                        onChange={handleFileChange}
                        ref={inputRef}
                        multiple={multiple}
                        {...props}
                    />

                    <Button
                        type="button"
                        variant="outline"
                        disabled={disabled || isUploading}
                        onClick={triggerFileInput}
                        className="ml-0 h-52 flex-1 border-dashed border-[#D5D5D5]"
                    >
                        {isUploading ? (
                            <div className="flex flex-col justify-center gap-3">
                                <Spinner className="animate-spin" />
                                <span className="text-sm text-[#484848]">Téléchargement...</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center gap-3">
                                <UploadIcon className="" />
                                <span className="text-sm text-[#484848]">
                                    {hasFiles ? (
                                        "Files added"
                                    ) : (
                                        <>
                                            Glissez-déposez les fichiers ici
                                            <br />
                                            (taille maximale du fichier : 50 Mo)
                                        </>
                                    )}
                                </span>
                            </div>
                        )}
                    </Button>
                </div>

                {displayFiles.map((file, index) => (
                    <div
                        key={\`\${file.name}-\${index}\`}
                        className="flex items-center rounded-md justify-between py-2 px-4 bg-[#F6F8F9]"
                    >
                        <div className="flex items-center gap-3 text-sm text-[#252C32]">
                            <span className="truncate">{file.name}</span>
                            {existingFileMetadata && (
                                <span className="text-xs text-gray-500">
                                    ({(existingFileMetadata.size / (1024 * 1024)).toFixed(2)} MB)
                                </span>
                            )}
                        </div>
                        <span
                            className="ml-4 cursor-pointer text-red-500"
                            onClick={() => handleRemoveFile(index)}
                        >
                            <X />
                        </span>
                    </div>
                ))}

                <FormMessage />
            </div>
        );
    },
);

FileUpload.displayName = "FileUpload";

export { FileUpload };`;
    fs.writeFileSync('components/shared/inputs/FileUpload.tsx', fileUploadSource);
  }

  // DateTimeInput component  
  if (components.dateTimeInput) {
    const dateTimeInputSource = `"use client";

import { DateTimeInput } from "@/components/ui/datetime-input";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { ClassValue } from "clsx";
import type { FieldValues, UseControllerProps } from "react-hook-form";
import { useFormContext } from "react-hook-form";

interface DateTimeInputProps<T extends FieldValues> extends UseControllerProps<T> {
    label: string;
    className?: ClassValue;
    inputClassName?: ClassValue;
    type?: HTMLInputElement["type"];
    required?: boolean;
    onChange?: (value: string) => void;
    placeholder?: string;
    showLabel?: boolean;
    value?: Date | undefined; 
    format?: string;
    onCalendarClick?: () => void;
    disabled?: boolean;
}

export function DateTimeInputComponent<T extends FieldValues>({
    label,
    className,
    name,
    required,
    showLabel = true,    
    disabled,
    ...props
}: DateTimeInputProps<T>) {
    const { control } = useFormContext<T>();
    return (
        <FormField
            name={name}
            control={control}
            {...props}
            render={({ field }) => (
                <FormItem className={cn("flex w-full flex-col gap-1", className)}>
                    {showLabel && (
                        <FormLabel className="text-sm font-semibold text-[#181818]">
                            {label} {required && <span className="text-red-500">*</span>}
                        </FormLabel>
                    )}
                    <FormControl>
                        <DateTimePicker
                            value={field.value}
                            onChange={field.onChange}
                            use12HourFormat
                            disabled={disabled}
                            min={new Date()}
                            timePicker={{ hour: true, minute: true }}
                            renderTrigger={({ open, value, setOpen }) => (
                                <DateTimeInput
                                    value={value}
                                    onChange={(x) => !open && field.onChange(x)}
                                    format="dd/MM/yyyy hh:mm aa"
                                    disabled={open}
                                    onCalendarClick={() => setOpen(!open)}
                                />
                            )}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}`;
    fs.writeFileSync('components/shared/inputs/DateTimeInput.tsx', dateTimeInputSource);
  }

  // RadioGroupInput component
  if (components.radioGroupInput) {
    const radioGroupInputSource = `'use client';

import * as React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { CircleIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

function CustomRadioGroup({
	className,
	...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
	return (
		<RadioGroupPrimitive.Root
			data-slot='radio-group'
			className={cn('grid gap-3', className)}
			{...props}
		/>
	);
}

function CustomRadioGroupItem({
	className,
	...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
	return (
		<RadioGroupPrimitive.Item
			data-slot='radio-group-item'
			className={cn(
				'border-input text-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 aspect-square size-4 shrink-0 rounded-full border shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
				className
			)}
			{...props}
		>
			<RadioGroupPrimitive.Indicator
				data-slot='radio-group-indicator'
				className='relative flex items-center justify-center'
			>
				<CircleIcon className='fill-secondary absolute top-1/2 left-1/2 size-4 -translate-x-1/2 -translate-y-1/2' />
			</RadioGroupPrimitive.Indicator>
		</RadioGroupPrimitive.Item>
	);
}

export { CustomRadioGroup, CustomRadioGroupItem };`;
    fs.writeFileSync('components/shared/inputs/RadioGroupInput.tsx', radioGroupInputSource);
  }
}

export async function createSharedDataTable() {
  // Data table types
  const dataTableTypes = `import type { ReactNode } from 'react';

export type SortDirection = 'asc' | 'desc';

export type DataType = 'string' | 'number' | 'date' | 'boolean';

export interface Column<T extends Record<string, unknown>> {
    key: keyof T;
    label: string;
    sortable?: boolean;
    searchable?: boolean;
    dataType?: DataType;
    render?: (value: T[keyof T], row: T, index: number) => ReactNode;
    className?: string;
    width?: string;
    align?: 'left' | 'center' | 'right';
}

export interface FilterOption {
    value: string;
    label: string;
    count?: number;
}

export interface DataTableFilter {
    key: string;
    label: string;
    options: FilterOption[];
    placeholder?: string;
    width?: string;
    multiple?: boolean;
}

export interface SortState<T> {
    field: keyof T | null;
    direction: SortDirection;
}

export interface PaginationState {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
}

export interface TableState<T extends Record<string, unknown>> {
    searchTerm: string;
    filterValues: Record<string, string | string[]>;
    sortState: SortState<T>;
    paginationState: PaginationState;
}

export interface DataTableProps<T extends Record<string, unknown> & { id?: string | number }> {
    data: T[];
    columns: Column<T>[];
    filters?: DataTableFilter[];
    searchPlaceholder?: string;
    searchShortcut?: string;
    itemsPerPage?: number;
    className?: string;
    loading?: boolean;
    error?: string | null;
    emptyStateMessage?: string;
    showSearch?: boolean;
    showFilters?: boolean;
    showPagination?: boolean;
    stickyHeader?: boolean;
    onRowClick?: (row: T, index: number) => void;
    onRowDoubleClick?: (row: T, index: number) => void;
    onSelectionChange?: (selectedRows: T[]) => void;
    renderActions?: (row: T, index: number) => ReactNode;
    renderRowSubComponent?: (row: T) => ReactNode;
    getRowId?: (row: T, index: number) => string;
    isRowSelectable?: (row: T) => boolean;
    isRowExpandable?: (row: T) => boolean;
}

export interface UseTableStateProps<T extends Record<string, unknown>> {
    data: T[];
    columns: Column<T>[];
    filters?: DataTableFilter[];
    itemsPerPage?: number;
    initialSort?: SortState<T>;
}

export interface ProcessedData<T> {
    filteredData: T[];
    paginatedData: T[];
    totalItems: number;
    totalPages: number;
}`;

  fs.writeFileSync('components/shared/data-table/types/index.ts', dataTableTypes);

  // Data table main export
  const dataTableIndex = `export { DataTable } from './DataTable';

export type {
    Column,
    DataTableFilter,
    FilterOption,
    DataTableProps,
    SortDirection,
    DataType,
    SortState,
    PaginationState,
    TableState,
    ProcessedData
} from './types';

export { useTableState } from './hooks/useTableState';

export { TableFilters } from './components/TableFilters';
export { TablePagination } from './components/TablePagination';
export { TableEmptyState } from './components/TableEmptyState';

export {
    sortData,
    compareValues,
    parseValue
} from './utils/sorting';

export {
    getFilteredData,
    searchInRow,
    applyFilters
} from './utils/filtering';

export {
    calculatePagination,
    paginateData,
    generatePaginationItems
} from './utils/pagination';`;

  fs.writeFileSync('components/shared/data-table/index.tsx', dataTableIndex);

  // Create a basic DataTable implementation
  const dataTableComponent = `"use client";

import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import type { DataTableProps } from "./types";
import { useTableState } from "./hooks/useTableState";
import { TableEmptyState } from "./components/TableEmptyState";
import { TableErrorState } from "./components/TableErrorState";
import { TableLoadingState } from "./components/TableLoadingState";
import { TablePagination } from "./components/TablePagination";
import { TableFilters } from "./components/TableFilters";

export function DataTable<T extends Record<string, unknown> & { id?: string | number }>({
    data,
    columns,
    filters = [],
    searchPlaceholder = "Search...",
    itemsPerPage = 10,
    className,
    loading = false,
    error = null,
    emptyStateMessage = "No data available",
    showSearch = true,
    showFilters = true,
    showPagination = true,
    onRowClick,
    renderActions,
    getRowId,
    ...props
}: DataTableProps<T>) {
    const {
        state,
        actions,
        processedData
    } = useTableState({
        data,
        columns,
        filters,
        itemsPerPage
    });

    if (loading) {
        return <TableLoadingState />;
    }

    if (error) {
        return <TableErrorState error={error} />;
    }

    return (
        <div className={cn("space-y-4", className)}>
            {(showSearch || showFilters) && (
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        {showSearch && (
                            <div className="relative">
                                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder={searchPlaceholder}
                                    value={state.searchTerm}
                                    onChange={(e) => actions.setSearchTerm(e.target.value)}
                                    className="pl-8 w-[250px]"
                                />
                            </div>
                        )}
                        {showFilters && filters.length > 0 && (
                            <TableFilters
                                filters={filters}
                                filterValues={state.filterValues}
                                onFilterChange={actions.setFilterValue}
                                onResetFilters={actions.resetFilters}
                            />
                        )}
                    </div>
                </div>
            )}

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map((column) => (
                                <TableHead
                                    key={String(column.key)}
                                    className={cn(
                                        column.className,
                                        column.sortable && "cursor-pointer select-none",
                                        \`text-\${column.align || 'left'}\`
                                    )}
                                    style={{ width: column.width }}
                                    onClick={() => column.sortable && actions.toggleSort(column.key)}
                                >
                                    <div className="flex items-center space-x-2">
                                        <span>{column.label}</span>
                                        {column.sortable && state.sortState.field === column.key && (
                                            <span className="text-xs">
                                                {state.sortState.direction === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </div>
                                </TableHead>
                            ))}
                            {renderActions && <TableHead className="w-[100px]">Actions</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {processedData.paginatedData.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length + (renderActions ? 1 : 0)}
                                    className="h-24"
                                >
                                    <TableEmptyState message={emptyStateMessage} />
                                </TableCell>
                            </TableRow>
                        ) : (
                            processedData.paginatedData.map((row, index) => {
                                const rowId = getRowId ? getRowId(row, index) : String(row.id || index);
                                
                                return (
                                    <TableRow
                                        key={rowId}
                                        className={onRowClick ? "cursor-pointer" : ""}
                                        onClick={() => onRowClick?.(row, index)}
                                    >
                                        {columns.map((column) => (
                                            <TableCell
                                                key={String(column.key)}
                                                className={cn(
                                                    column.className,
                                                    \`text-\${column.align || 'left'}\`
                                                )}
                                            >
                                                {column.render
                                                    ? column.render(row[column.key], row, index)
                                                    : String(row[column.key] || '')}
                                            </TableCell>
                                        ))}
                                        {renderActions && (
                                            <TableCell>
                                                {renderActions(row, index)}
                                            </TableCell>
                                        )}
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {showPagination && processedData.totalItems > 0 && (
                <TablePagination
                    currentPage={state.paginationState.currentPage}
                    totalPages={state.paginationState.totalPages}
                    totalItems={state.paginationState.totalItems}
                    itemsPerPage={state.paginationState.itemsPerPage}
                    onPageChange={actions.setPage}
                    onItemsPerPageChange={actions.setItemsPerPage}
                />
            )}
        </div>
    );
}`;

  fs.writeFileSync('components/shared/data-table/DataTable.tsx', dataTableComponent);

  // Create utility files and components with simplified implementations
  await createDataTableUtilities();
  await createDataTableComponents();
  await createDataTableHooks();
}

export async function createDataTableUtilities() {
  // Sorting utilities
  const sortingUtils = `import type { SortDirection, DataType } from '../types';

export function parseValue(value: unknown, dataType?: DataType): any {
    if (value === null || value === undefined) return '';
    
    switch (dataType) {
        case 'number':
            return typeof value === 'number' ? value : parseFloat(String(value)) || 0;
        case 'date':
            return new Date(String(value));
        case 'boolean':
            return Boolean(value);
        default:
            return String(value).toLowerCase();
    }
}

export function compareValues(a: unknown, b: unknown, dataType?: DataType): number {
    const aVal = parseValue(a, dataType);
    const bVal = parseValue(b, dataType);
    
    if (aVal < bVal) return -1;
    if (aVal > bVal) return 1;
    return 0;
}

export function sortData<T extends Record<string, unknown>>(
    data: T[],
    field: keyof T,
    direction: SortDirection,
    dataType?: DataType
): T[] {
    return [...data].sort((a, b) => {
        const result = compareValues(a[field], b[field], dataType);
        return direction === 'asc' ? result : -result;
    });
}`;

  fs.writeFileSync('components/shared/data-table/utils/sorting.ts', sortingUtils);

  // Filtering utilities
  const filteringUtils = `import type { Column, DataTableFilter } from '../types';

export function searchInRow<T extends Record<string, unknown>>(
    row: T,
    searchTerm: string,
    searchableColumns: Array<keyof T>
): boolean {
    if (!searchTerm) return true;
    
    const term = searchTerm.toLowerCase();
    return searchableColumns.some(key => {
        const value = row[key];
        return String(value || '').toLowerCase().includes(term);
    });
}

export function applyFilters<T extends Record<string, unknown>>(
    data: T[],
    filters: Record<string, string | string[]>
): T[] {
    return data.filter(row => {
        return Object.entries(filters).every(([key, filterValue]) => {
            if (!filterValue || (Array.isArray(filterValue) && filterValue.length === 0)) {
                return true;
            }
            
            const rowValue = String(row[key] || '');
            
            if (Array.isArray(filterValue)) {
                return filterValue.includes(rowValue);
            }
            
            return rowValue.includes(String(filterValue));
        });
    });
}

export function getFilteredData<T extends Record<string, unknown>>(
    data: T[],
    searchTerm: string,
    filters: Record<string, string | string[]>,
    columns: Column<T>[]
): T[] {
    let filteredData = [...data];
    
    // Apply search
    if (searchTerm) {
        const searchableColumns = columns
            .filter(col => col.searchable !== false)
            .map(col => col.key);
        filteredData = filteredData.filter(row =>
            searchInRow(row, searchTerm, searchableColumns)
        );
    }
    
    // Apply filters
    filteredData = applyFilters(filteredData, filters);
    
    return filteredData;
}`;

  fs.writeFileSync('components/shared/data-table/utils/filtering.ts', filteringUtils);

  // Pagination utilities
  const paginationUtils = `import type { PaginationState } from '../types';

export function calculatePagination(
    totalItems: number,
    currentPage: number,
    itemsPerPage: number
): PaginationState {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages));
    
    return {
        currentPage: validCurrentPage,
        itemsPerPage,
        totalItems,
        totalPages
    };
}

export function paginateData<T>(
    data: T[],
    currentPage: number,
    itemsPerPage: number
): T[] {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
}

export function generatePaginationItems(
    currentPage: number,
    totalPages: number,
    maxVisible: number = 5
): Array<number | 'ellipsis'> {
    if (totalPages <= maxVisible) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    const items: Array<number | 'ellipsis'> = [];
    const halfVisible = Math.floor(maxVisible / 2);
    
    if (currentPage <= halfVisible + 1) {
        // Show first pages
        for (let i = 1; i <= maxVisible - 1; i++) {
            items.push(i);
        }
        items.push('ellipsis');
        items.push(totalPages);
    } else if (currentPage >= totalPages - halfVisible) {
        // Show last pages
        items.push(1);
        items.push('ellipsis');
        for (let i = totalPages - maxVisible + 2; i <= totalPages; i++) {
            items.push(i);
        }
    } else {
        // Show middle pages
        items.push(1);
        items.push('ellipsis');
        for (let i = currentPage - halfVisible + 1; i <= currentPage + halfVisible - 1; i++) {
            items.push(i);
        }
        items.push('ellipsis');
        items.push(totalPages);
    }
    
    return items;
}`;

  fs.writeFileSync('components/shared/data-table/utils/pagination.ts', paginationUtils);
}

export async function createDataTableComponents() {
  // Table Empty State
  const emptyState = `import { FileX } from "lucide-react";

interface TableEmptyStateProps {
    message?: string;
}

export function TableEmptyState({ message = "No data available" }: TableEmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-8">
            <FileX className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">{message}</p>
        </div>
    );
}`;

  fs.writeFileSync('components/shared/data-table/components/TableEmptyState.tsx', emptyState);

  // Table Error State
  const errorState = `import { AlertCircle } from "lucide-react";

interface TableErrorStateProps {
    error: string;
}

export function TableErrorState({ error }: TableErrorStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-8">
            <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
            <p className="text-sm text-red-600">{error}</p>
        </div>
    );
}`;

  fs.writeFileSync('components/shared/data-table/components/TableErrorState.tsx', errorState);

  // Table Loading State
  const loadingState = `import { Spinner } from "@/components/shared/Spinner";

export function TableLoadingState() {
    return (
        <div className="flex items-center justify-center py-8">
            <Spinner size="medium" />
        </div>
    );
}`;

  fs.writeFileSync('components/shared/data-table/components/TableLoadingState.tsx', loadingState);

  // Table Pagination
  const pagination = `import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TablePaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange: (itemsPerPage: number) => void;
}

export function TablePagination({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
    onItemsPerPageChange
}: TablePaginationProps) {
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="flex items-center justify-between px-2">
            <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">Rows per page</p>
                <select
                    value={itemsPerPage}
                    onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                    className="h-8 w-[70px] rounded border border-input bg-background px-2 py-0 text-sm"
                >
                    {[10, 20, 30, 40, 50].map(size => (
                        <option key={size} value={size}>{size}</option>
                    ))}
                </select>
            </div>
            
            <div className="flex items-center space-x-6 lg:space-x-8">
                <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                    {startItem}-{endItem} of {totalItems}
                </div>
                
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                        className={cn(
                            "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-8 w-8 border border-input bg-background hover:bg-accent hover:text-accent-foreground",
                            currentPage <= 1 && "cursor-not-allowed opacity-50"
                        )}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    
                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                        className={cn(
                            "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-8 w-8 border border-input bg-background hover:bg-accent hover:text-accent-foreground",
                            currentPage >= totalPages && "cursor-not-allowed opacity-50"
                        )}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}`;

  fs.writeFileSync('components/shared/data-table/components/TablePagination.tsx', pagination);

  // Table Filters (simplified)
  const filters = `import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { DataTableFilter } from "../types";

interface TableFiltersProps {
    filters: DataTableFilter[];
    filterValues: Record<string, string | string[]>;
    onFilterChange: (key: string, value: string | string[]) => void;
    onResetFilters: () => void;
}

export function TableFilters({
    filters,
    filterValues,
    onFilterChange,
    onResetFilters
}: TableFiltersProps) {
    return (
        <div className="flex items-center space-x-2">
            {filters.map((filter) => (
                <Select
                    key={filter.key}
                    value={String(filterValues[filter.key] || '')}
                    onValueChange={(value) => onFilterChange(filter.key, value)}
                >
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder={filter.placeholder || filter.label} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">All {filter.label}</SelectItem>
                        {filter.options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            ))}
            {Object.keys(filterValues).length > 0 && (
                <button
                    onClick={onResetFilters}
                    className="text-sm text-muted-foreground hover:text-foreground"
                >
                    Clear filters
                </button>
            )}
        </div>
    );
}`;

  fs.writeFileSync('components/shared/data-table/components/TableFilters.tsx', filters);
}

export async function createDataTableHooks() {
  // useTableState hook
  const tableStateHook = `import { useMemo, useState } from 'react';
import type { 
    UseTableStateProps, 
    TableState, 
    SortState, 
    ProcessedData,
    SortDirection 
} from '../types';
import { getFilteredData } from '../utils/filtering';
import { sortData } from '../utils/sorting';
import { paginateData, calculatePagination } from '../utils/pagination';

export function useTableState<T extends Record<string, unknown>>({
    data,
    columns,
    filters = [],
    itemsPerPage = 10,
    initialSort
}: UseTableStateProps<T>) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterValues, setFilterValues] = useState<Record<string, string | string[]>>({});
    const [sortState, setSortState] = useState<SortState<T>>(
        initialSort || { field: null, direction: 'asc' }
    );
    const [currentPage, setCurrentPage] = useState(1);
    const [currentItemsPerPage, setCurrentItemsPerPage] = useState(itemsPerPage);

    // Memoized processed data
    const processedData = useMemo<ProcessedData<T>>(() => {
        // Filter data
        let filteredData = getFilteredData(data, searchTerm, filterValues, columns);

        // Sort data
        if (sortState.field) {
            const column = columns.find(col => col.key === sortState.field);
            filteredData = sortData(
                filteredData,
                sortState.field,
                sortState.direction,
                column?.dataType
            );
        }

        // Calculate pagination
        const pagination = calculatePagination(
            filteredData.length,
            currentPage,
            currentItemsPerPage
        );

        // Paginate data
        const paginatedData = paginateData(
            filteredData,
            pagination.currentPage,
            currentItemsPerPage
        );

        return {
            filteredData,
            paginatedData,
            totalItems: filteredData.length,
            totalPages: pagination.totalPages
        };
    }, [data, columns, searchTerm, filterValues, sortState, currentPage, currentItemsPerPage]);

    const state: TableState<T> = {
        searchTerm,
        filterValues,
        sortState,
        paginationState: {
            currentPage,
            itemsPerPage: currentItemsPerPage,
            totalItems: processedData.totalItems,
            totalPages: processedData.totalPages
        }
    };

    const setFilterValue = (key: string, value: string | string[]) => {
        setFilterValues(prev => ({ ...prev, [key]: value }));
        setCurrentPage(1); // Reset to first page when filtering
    };

    const resetFilters = () => {
        setFilterValues({});
        setSearchTerm('');
        setCurrentPage(1);
    };

    const toggleSort = (field: keyof T) => {
        setSortState(prev => {
            if (prev.field === field) {
                const newDirection: SortDirection = prev.direction === 'asc' ? 'desc' : 'asc';
                return { field, direction: newDirection };
            }
            return { field, direction: 'asc' };
        });
        setCurrentPage(1); // Reset to first page when sorting
    };

    const setPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, processedData.totalPages)));
    };

    const setItemsPerPage = (items: number) => {
        setCurrentItemsPerPage(items);
        setCurrentPage(1); // Reset to first page when changing items per page
    };

    const actions = {
        setSearchTerm: (term: string) => {
            setSearchTerm(term);
            setCurrentPage(1);
        },
        setFilterValue,
        setSortState,
        setPage,
        setItemsPerPage,
        resetFilters,
        toggleSort
    };

    return {
        state,
        actions,
        processedData
    };
}`;

  fs.writeFileSync('components/shared/data-table/hooks/useTableState.ts', tableStateHook);
}