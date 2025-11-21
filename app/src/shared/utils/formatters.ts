/**
 * Formats a number as a price string with custom separators.
 * Thousands separator: .
 * Decimal separator: ,
 * Example: 1234.56 -> $ 1.234,56
 */
export const formatPrice = (value: number | undefined | null): string => {
    if (value === undefined || value === null) return '';
    
    // Convert to string with 2 decimal places
    const parts = value.toFixed(2).split('.');
    
    // Add thousands separator to the integer part
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    
    // Combine with decimal part using comma
    return `$ ${integerPart},${parts[1]}`;
};
