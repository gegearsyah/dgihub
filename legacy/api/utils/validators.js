/**
 * Validation Utilities
 */

/**
 * Validate NIK format (16 digits)
 */
exports.validateNIK = (nik) => {
  if (!nik || typeof nik !== 'string') {
    return false;
  }
  
  if (nik.length !== 16) {
    return false;
  }
  
  if (!/^\d+$/.test(nik)) {
    return false;
  }
  
  // Validate province code (first 2 digits: 01-94)
  const provinceCode = parseInt(nik.substring(0, 2));
  if (provinceCode < 1 || provinceCode > 94) {
    return false;
  }
  
  return true;
};

/**
 * Validate email format
 */
exports.validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (Indonesian format)
 */
exports.validatePhone = (phone) => {
  // Remove spaces and dashes
  const cleaned = phone.replace(/[\s-]/g, '');
  
  // Check if starts with +62 or 0
  if (cleaned.startsWith('+62')) {
    return cleaned.length === 12 || cleaned.length === 13;
  } else if (cleaned.startsWith('0')) {
    return cleaned.length === 11 || cleaned.length === 12;
  }
  
  return false;
};

/**
 * Validate UUID format
 */
exports.validateUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Validate GPS coordinates
 */
exports.validateGPS = (latitude, longitude) => {
  if (latitude === null || longitude === null) {
    return false;
  }
  
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  
  if (isNaN(lat) || isNaN(lng)) {
    return false;
  }
  
  if (lat < -90 || lat > 90) {
    return false;
  }
  
  if (lng < -180 || lng > 180) {
    return false;
  }
  
  return true;
};


