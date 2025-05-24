/**
 * Date utility functions for Logic Guru Engine
 */

/**
 * Calculate years between a date and current date
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {number} Number of years
 */
export function year(dateStr) {
  try {
    const birthDate = new Date(dateStr);
    const today = new Date();
    
    if (isNaN(birthDate.getTime())) {
      console.warn(`Invalid date format: ${dateStr}. Expected YYYY-MM-DD`);
      return 0;
    }

    let years = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      years--;
    }
    
    return years;
  } catch (error) {
    console.warn(`Error calculating years from date: ${dateStr}`, error);
    return 0;
  }
}

/**
 * Calculate months between a date and current date
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {number} Number of months
 */
export function month(dateStr) {
  try {
    const birthDate = new Date(dateStr);
    const today = new Date();
    
    if (isNaN(birthDate.getTime())) {
      console.warn(`Invalid date format: ${dateStr}. Expected YYYY-MM-DD`);
      return 0;
    }

    let months = (today.getFullYear() - birthDate.getFullYear()) * 12;
    months += today.getMonth() - birthDate.getMonth();
    
    if (today.getDate() < birthDate.getDate()) {
      months--;
    }
    
    return months;
  } catch (error) {
    console.warn(`Error calculating months from date: ${dateStr}`, error);
    return 0;
  }
}

/**
 * Calculate days between a date and current date
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {number} Number of days
 */
export function day(dateStr) {
  try {
    const birthDate = new Date(dateStr);
    const today = new Date();
    
    if (isNaN(birthDate.getTime())) {
      console.warn(`Invalid date format: ${dateStr}. Expected YYYY-MM-DD`);
      return 0;
    }

    const diffTime = Math.abs(today - birthDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  } catch (error) {
    console.warn(`Error calculating days from date: ${dateStr}`, error);
    return 0;
  }
} 