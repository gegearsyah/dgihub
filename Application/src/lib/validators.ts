/**
 * Validation Utilities
 */

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateNIK(nik: string): boolean {
  // NIK should be exactly 16 digits
  return /^\d{16}$/.test(nik);
}

export function validatePhone(phone: string): boolean {
  // Indonesian phone number format
  return /^(\+62|62|0)[0-9]{9,12}$/.test(phone);
}

export function validatePassword(password: string): boolean {
  // At least 8 characters
  return password.length >= 8;
}


