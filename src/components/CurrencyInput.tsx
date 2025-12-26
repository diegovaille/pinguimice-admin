import { useState, useEffect, type ChangeEvent } from 'react';

interface CurrencyInputProps {
    id?: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    required?: boolean;
    className?: string;
    disabled?: boolean;
}

export default function CurrencyInput({
    id,
    value,
    onChange,
    placeholder = 'R$ 0,00',
    required = false,
    className = 'input',
    disabled = false,
}: CurrencyInputProps) {
    const [displayValue, setDisplayValue] = useState('');

    // Format number to currency display (R$ 00,00)
    const formatCurrency = (numValue: number): string => {
        return numValue.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    // Parse display value to number
    const parseValue = (str: string): number => {
        // Remove all non-digit characters
        const digits = str.replace(/\D/g, '');
        // Convert to number (cents)
        const numValue = parseInt(digits || '0', 10) / 100;
        return numValue;
    };

    // Update display value when prop value changes
    useEffect(() => {
        if (value === '') {
            setDisplayValue('');
        } else {
            const numValue = parseFloat(value) || 0;
            setDisplayValue(formatCurrency(numValue));
        }
    }, [value]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;

        // Parse the input to get numeric value
        const numValue = parseValue(inputValue);

        // Update display
        setDisplayValue(formatCurrency(numValue));

        // Send numeric value as string to parent
        onChange(numValue.toString());
    };

    const handleFocus = (e: ChangeEvent<HTMLInputElement>) => {
        // Select all on focus for easy editing
        e.target.select();
    };

    return (
        <div style={{ position: 'relative' }}>
            <span
                style={{
                    position: 'absolute',
                    left: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-secondary)',
                    pointerEvents: 'none',
                    fontSize: '0.875rem',
                }}
            >
                R$
            </span>
            <input
                id={id}
                type="text"
                inputMode="numeric"
                className={className}
                value={displayValue}
                onChange={handleChange}
                onFocus={handleFocus}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                style={{ paddingLeft: '2.5rem' }}
            />
        </div>
    );
}
