import { useState, useCallback, useMemo } from 'react';

export type ValidationRule<T> = {
    validate: (value: T[keyof T], formData: T) => boolean;
    message: string;
};

export type ValidationRules<T> = {
    [K in keyof T]?: ValidationRule<T>[];
};

export type ValidationErrors<T> = {
    [K in keyof T]?: string;
};

interface UseFormValidationResult<T> {
    errors: ValidationErrors<T>;
    touched: Partial<Record<keyof T, boolean>>;
    isValid: boolean;
    validateField: (field: keyof T, value: T[keyof T]) => string | undefined;
    validateForm: (data: T) => boolean;
    setFieldTouched: (field: keyof T) => void;
    setFieldError: (field: keyof T, error: string | undefined) => void;
    clearErrors: () => void;
    getFieldError: (field: keyof T) => string | undefined;
    hasError: (field: keyof T) => boolean;
}

export function useFormValidation<T extends Record<string, unknown>>(
    rules: ValidationRules<T>,
    formData: T
): UseFormValidationResult<T> {
    const [errors, setErrors] = useState<ValidationErrors<T>>({});
    const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

    const validateField = useCallback(
        (field: keyof T, value: T[keyof T]): string | undefined => {
            const fieldRules = rules[field];
            if (!fieldRules) return undefined;

            for (const rule of fieldRules) {
                if (!rule.validate(value, formData)) {
                    return rule.message;
                }
            }
            return undefined;
        },
        [rules, formData]
    );

    const validateForm = useCallback(
        (data: T): boolean => {
            const newErrors: ValidationErrors<T> = {};
            let isValid = true;

            for (const field of Object.keys(rules) as (keyof T)[]) {
                const error = validateField(field, data[field]);
                if (error) {
                    newErrors[field] = error;
                    isValid = false;
                }
            }

            setErrors(newErrors);

            // Пометить все поля как touched
            const allTouched: Partial<Record<keyof T, boolean>> = {};
            for (const field of Object.keys(rules) as (keyof T)[]) {
                allTouched[field] = true;
            }
            setTouched(allTouched);

            return isValid;
        },
        [rules, validateField]
    );

    const setFieldTouched = useCallback((field: keyof T) => {
        setTouched((prev) => ({ ...prev, [field]: true }));

        // Валидировать поле при потере фокуса
        const error = validateField(field, formData[field]);
        setErrors((prev) => ({ ...prev, [field]: error }));
    }, [formData, validateField]);

    const setFieldError = useCallback((field: keyof T, error: string | undefined) => {
        setErrors((prev) => ({ ...prev, [field]: error }));
    }, []);

    const clearErrors = useCallback(() => {
        setErrors({});
        setTouched({});
    }, []);

    const getFieldError = useCallback(
        (field: keyof T): string | undefined => {
            return touched[field] ? errors[field] : undefined;
        },
        [errors, touched]
    );

    const hasError = useCallback(
        (field: keyof T): boolean => {
            return Boolean(touched[field] && errors[field]);
        },
        [errors, touched]
    );

    const isValid = useMemo(() => {
        return Object.keys(errors).every((key) => !errors[key as keyof T]);
    }, [errors]);

    return {
        errors,
        touched,
        isValid,
        validateField,
        validateForm,
        setFieldTouched,
        setFieldError,
        clearErrors,
        getFieldError,
        hasError,
    };
}

// Готовые валидаторы
export const validators = {
    required: (message = 'Обязательное поле'): ValidationRule<Record<string, unknown>> => ({
        validate: (value) => {
            if (value === undefined || value === null) return false;
            if (typeof value === 'string') return value.trim().length > 0;
            if (typeof value === 'number') return true;
            if (Array.isArray(value)) return value.length > 0;
            return Boolean(value);
        },
        message,
    }),

    minLength: (min: number, message?: string): ValidationRule<Record<string, unknown>> => ({
        validate: (value) => {
            if (typeof value !== 'string') return true;
            return value.length >= min;
        },
        message: message || `Минимум ${min} символов`,
    }),

    maxLength: (max: number, message?: string): ValidationRule<Record<string, unknown>> => ({
        validate: (value) => {
            if (typeof value !== 'string') return true;
            return value.length <= max;
        },
        message: message || `Максимум ${max} символов`,
    }),

    min: (minValue: number, message?: string): ValidationRule<Record<string, unknown>> => ({
        validate: (value) => {
            if (typeof value !== 'number') return true;
            return value >= minValue;
        },
        message: message || `Минимальное значение: ${minValue}`,
    }),

    max: (maxValue: number, message?: string): ValidationRule<Record<string, unknown>> => ({
        validate: (value) => {
            if (typeof value !== 'number') return true;
            return value <= maxValue;
        },
        message: message || `Максимальное значение: ${maxValue}`,
    }),

    positive: (message = 'Значение должно быть положительным'): ValidationRule<Record<string, unknown>> => ({
        validate: (value) => {
            if (typeof value !== 'number') return true;
            return value > 0;
        },
        message,
    }),

    email: (message = 'Некорректный email'): ValidationRule<Record<string, unknown>> => ({
        validate: (value) => {
            if (typeof value !== 'string' || !value) return true;
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        },
        message,
    }),

    phone: (message = 'Некорректный номер телефона'): ValidationRule<Record<string, unknown>> => ({
        validate: (value) => {
            if (typeof value !== 'string' || !value) return true;
            return /^\+?[\d\s\-()]{10,}$/.test(value);
        },
        message,
    }),

    url: (message = 'Некорректный URL'): ValidationRule<Record<string, unknown>> => ({
        validate: (value) => {
            if (typeof value !== 'string' || !value) return true;
            try {
                new URL(value);
                return true;
            } catch {
                return false;
            }
        },
        message,
    }),

    pattern: (regex: RegExp, message: string): ValidationRule<Record<string, unknown>> => ({
        validate: (value) => {
            if (typeof value !== 'string') return true;
            return regex.test(value);
        },
        message,
    }),

    dateBefore: (date: Date | string, message?: string): ValidationRule<Record<string, unknown>> => ({
        validate: (value) => {
            if (!value) return true;
            const compareDate = typeof date === 'string' ? new Date(date) : date;
            const valueDate = new Date(value as string);
            return valueDate < compareDate;
        },
        message: message || 'Дата должна быть раньше указанной',
    }),

    dateAfter: (date: Date | string, message?: string): ValidationRule<Record<string, unknown>> => ({
        validate: (value) => {
            if (!value) return true;
            const compareDate = typeof date === 'string' ? new Date(date) : date;
            const valueDate = new Date(value as string);
            return valueDate > compareDate;
        },
        message: message || 'Дата должна быть позже указанной',
    }),
};
