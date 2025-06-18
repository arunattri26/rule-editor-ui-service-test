
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
 * Fetches, merges, and processes branch details for a list of city IDs.
 *
 * - Sorts the master metadata (`pincodeBranchMasterResponse`) by numeric `CODE` to determine the primary city.
 * - Sets the primary city ID in the `branchCityField`.
 * - Initiates parallel fetch requests for each city ID's branch data.
 * - Merges all valid `branchDetails` arrays from successful responses.
 * - Sorts merged branch details alphabetically by `Name`.
 * - Populates `branchNamesField` with enum values and names derived from the merged data.
 *
 * This function uses Promises for asynchronous operations and can be invoked from synchronous contexts.
 *
 * @param {Array<Object>} pincodeBranchMasterResponse - Array of branch metadata objects, each with a `CODE` and `CITYID`.
 * @param {Array<string>} cityIds - List of city IDs for which to fetch branch data.
 * @param {Object} branchCityField - Field reference to set the selected city ID (first one after sorting).
 * @param {Object} branchNamesField - Field reference to populate enum and enumNames from merged branch data.
 * @param {scope} globals - Global context object with utility functions like `globals.functions.setProperty`.
 * @returns {void} - No return value. Updates fields via side effects. Any errors are logged to console.
 */
function fetchMergedBranchDetails(pincodeBranchMasterResponse, cityIds, branchCityField, branchNamesField, globals) {
  if (!Array.isArray(cityIds) || cityIds.length === 0 || !Array.isArray(pincodeBranchMasterResponse) || pincodeBranchMasterResponse.length === 0) {
    return;
  }

  // Sort by Code (Numerically)
  pincodeBranchMasterResponse.sort(function (a, b) {
    return parseInt(a.CODE, 10) - parseInt(b.CODE, 10);
  });

  globals.functions.setProperty(branchCityField, {
    value: pincodeBranchMasterResponse[0].CITYID || ''
  });

  let mergedBranchDetails = [];

  // Create array of fetch promises
  const fetchPromises = cityIds.map(cityId =>
    fetch(`${getSubmitBaseUrl()}/content/hdfc_savings_common/api/branchdata.${cityId}.json`, {
      method: "GET"
    })
      .then(response => response.json())
      .then(data => {
        if (data.success === "true" && Array.isArray(data.branchDetails)) {
          mergedBranchDetails.push(...data.branchDetails);
        }
      })
      .catch(e => {
        console.error(`Error fetching data for cityId: ${cityId}`, e);
      })
  );

  // Wait for all fetches to complete
  Promise.all(fetchPromises)
    .then(() => {
      if (mergedBranchDetails.length === 0) return;

      // Sort by Name (alphabetically)
      mergedBranchDetails.sort((a, b) => {
        return (a.Name || '').localeCompare(b.Name || '');
      });

      globals.functions.setProperty(branchNamesField, {
        "enum": mergedBranchDetails.map(item => item.Code || ''),
        "enumNames": mergedBranchDetails.map(item => item.Name || ''),
        value: mergedBranchDetails[0].Code || ''
      });
    })
    .catch(error => {
      console.error('Unexpected error in fetchMergedBranchDetails:', error);
    });
}

// eslint-disable-next-line import/prefer-default-export
export { getFullName, days, dateToDaysSinceEpoch, fetchMergedBranchDetails };
// export { getFullName, days, dateToDaysSinceEpoch };