// import { getFullName1, getFullName2 } from './cc_functions';

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

/**
 * Converts an amount from specified currency to AUD
 * @param {string} currency - The source currency (USD, GBP, or EUR)
 * @param {number|string} amount - The amount to convert as a string or number
 * @returns {string} The converted amount in AUD
 */
function convertAmountToAud(currency, amount) {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount.replace(/[^0-9.-]+/g, '')) : amount;
  
  var exchangeRates = {
    USD: 1.52,
    GBP: 1.92,
    EUR: 1.65
  };

  if (!exchangeRates[currency]) {
    throw new Error(`Unsupported currency: ${currency}`);
  }
  const audAmount = numericAmount * exchangeRates[currency];
  return `Amount in AUD: ${audAmount.toFixed(2)}`;
}

// eslint-disable-next-line import/prefer-default-export
// export { getFullName, days, dateToDaysSinceEpoch, getFullName1, getFullName2 };
export { getFullName, days, dateToDaysSinceEpoch, convertAmountToAud };