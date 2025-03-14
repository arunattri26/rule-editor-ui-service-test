/**
 * Get Full Name
 * @name getFullName Concats first name and last name
 * @param {string} firstname in Stringformat
 * @param {string} lastname in Stringformat
 * @return {string}
 */
function getFullName(firstname, lastname) {
  return `${firstname} ${lastname}`.trim();
}

/**
 * Calculate the number of days between two dates.
 * @param {*} endDate
 * @param {*} startDate
 * @returns {number} returns the number of days between two dates
 */
function days(endDate, startDate) {
  // const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  // const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  const start = dateToDaysSinceEpoch(startDate);
  const end = dateToDaysSinceEpoch(endDate);

  return end - start;
}

/**
 * Convert a date to the number of days since epoch.
 * @param {*} date
 * @returns {number} returns the number of days since epoch
 */
function dateToDaysSinceEpoch(date) {
  let dateObj;
  if (typeof date === 'string') {
      dateObj = new Date(date); 
  } else if (typeof date === 'number') {
      return Math.floor(date);
  } else if (date instanceof Date) {
      dateObj = date;
  } else {
      throw new Error('Invalid date input');
  }

  // Validate that date is valid after parsing
  if (isNaN(dateObj.getTime())) {
      throw new Error('Invalid date input');
  }
  return Math.floor(dateObj.getTime() / (1000 * 60 * 60 * 24));
}

// eslint-disable-next-line import/prefer-default-export
export { getFullName, days, dateToDaysSinceEpoch };