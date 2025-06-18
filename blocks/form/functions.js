// todo: uncomment before moving to production

// const getCrypto = () => {
//   if (typeof window !== 'undefined' && window.crypto) {
//       return window.crypto;
//   }
// };

// // Update the security context to use the getCrypto function
// const securityContext = {
//   SEC_KEY_HEADER: 'X-ENCKEY',
//   SEC_SECRET_HEADER: 'X-ENCSECRET',
//   crypto: getCrypto(),
//   symmetricAlgo: 'AES-GCM',
//   symmetricKeyLength: 256,
//   secretLength: 12,
//   secretTagLength: 128,
//   aSymmetricAlgo: 'RSA-OAEP',
//   digestAlgo: 'SHA-256',
//   initStatus: false,
//   symmetricKey: null
// };

// /**
// * Encrypts data using RSA public key
// * @param {Object} payload - Object containing body and headers to encrypt
// * @param {string} publicKey - Base64 encoded RSA public key
// * @returns {Promise<Object>} - Object containing encrypted body, headers with encryption metadata
// */
// async function encrypt(payload, publicKey) {
//   // if public key is not defined use the default public key
//   if (!publicKey) {
//     publicKey = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAocLO0ZabqWBbhb/cpaHTZf53LfEymcRMuAHRpUh3yhwPROgY2u3FTEsFJSKdQAbA4205njlXq3A1ICCd1ZrEQBA7Vc60eL0suO/0Qu5U/8vtYNCPsvMX+Pd7cUcMMM6JmLxacvlThOwAxc0ChSrFhlGRHQFZbg44y0Xy0B2bvxOnEjSAtV7kLjht/EKkiPXc3wptsLEMu2qK34Djucp5AllsbxJdWFogHTcJ1vizxAge9KwxA/2GSKYr5c9Wt8EAn7kqC0t43vnhtZuhgShJEbeV7VgF2GXGQBCxbbDravhltrGI+YKnAEd/RK0P0SJx+BXR7TcEv7zDg1QgXqfTewIDAQAB";
//   }
//   // Helper functions defined within scope
//   function stringToArrayBuffer(str) {
//       const buf = new ArrayBuffer(str.length);
//       const bufView = new Uint8Array(buf);
//       for (let i = 0, strLen = str.length; i < strLen; i++) {
//           bufView[i] = str.charCodeAt(i);
//       }
//       return buf;
//   }

//   function arrayBufferToString(buffer) {
//       const byteArray = new Uint8Array(buffer);
//       let byteString = '';
//       for (let i = 0; i < byteArray.byteLength; i++) {
//           byteString += String.fromCharCode(byteArray[i]);
//       }
//       return byteString;
//   }

//   try {
//       const headers = payload.headers;
//       const payloadBody = payload.body;

//       const binaryDerString = atob(publicKey);
//       const publicKeyArrayBuffer = stringToArrayBuffer(binaryDerString);

//       // Import the public key
//       const publicKeyObj = await crypto.subtle.importKey(
//           'spki',
//           publicKeyArrayBuffer,
//           {
//               name: securityContext.aSymmetricAlgo,
//               hash: { name: securityContext.digestAlgo }
//           },
//           true,
//           ['encrypt']
//       );

//       // Generate symmetric key
//       const symmetricKey = await crypto.subtle.generateKey(
//           {
//               name: securityContext.symmetricAlgo,
//               length: securityContext.symmetricKeyLength
//           },
//           true,
//           ['encrypt', 'decrypt']
//       );

//       // Store the symmetric key in context for later use
//       securityContext.symmetricKey = symmetricKey;

//       // Generate random IV (secret)
//       const secret = crypto.getRandomValues(new Uint8Array(securityContext.secretLength));

//       // Encrypt data with symmetric key
//       const bodyStr = JSON.stringify(payloadBody);
//       const bodyBuf = stringToArrayBuffer(bodyStr);
//       const encryptedBody = await crypto.subtle.encrypt(
//           {
//               name: securityContext.symmetricAlgo,
//               iv: secret,
//               tagLength: securityContext.secretTagLength
//           },
//           symmetricKey,
//           bodyBuf
//       );

//       // Export and encrypt symmetric key
//       const rawSymKey = await crypto.subtle.exportKey('raw', symmetricKey);
//       const encryptedSymKey = await crypto.subtle.encrypt(
//           {
//               name: securityContext.aSymmetricAlgo,
//               hash: { name: securityContext.digestAlgo }
//           },
//           publicKeyObj,
//           rawSymKey
//       );

//       // Encrypt secret/IV with public key
//       const encryptedSecret = await crypto.subtle.encrypt(
//           {
//               name: securityContext.aSymmetricAlgo,
//               hash: { name: securityContext.digestAlgo }
//           },
//           publicKeyObj,
//           secret
//       );

//       const keyEnc = btoa(arrayBufferToString(encryptedSymKey));
//       const secretEnc = btoa(arrayBufferToString(encryptedSecret));

//       return {
//           body: btoa(arrayBufferToString(encryptedBody)),
//           headers: {
//               ...headers,
//               'X-Enckey': keyEnc,
//               'X-Encsecret': secretEnc
//           },
//           secret
//       };
//   } catch (err) {
//       console.error('Encryption failed:', err);
//       throw new Error('Encryption failed');
//   }
// }

// /**
// * Decrypts data using symmetric key and secret
// * @param {string} encryptedData - Base64 encoded encrypted data
// * @param {Object} originalRequest - Original request object containing the secret
// * @param {Uint8Array} originalRequest.secret - The secret/IV used for encryption
// * @returns {Promise<string|null>} - Decrypted data as string, or null if decryption fails
// */
// async function decrypt(encryptedData, originalRequest) {
//   // Helper functions defined within scope
//   function stringToArrayBuffer(str) {
//       const buf = new ArrayBuffer(str.length);
//       const bufView = new Uint8Array(buf);
//       for (let i = 0, strLen = str.length; i < strLen; i++) {
//           bufView[i] = str.charCodeAt(i);
//       }
//       return buf;
//   }

//   function arrayBufferToString(buffer) {
//       const byteArray = new Uint8Array(buffer);
//       let byteString = '';
//       for (let i = 0; i < byteArray.byteLength; i++) {
//           byteString += String.fromCharCode(byteArray[i]);
//       }
//       return byteString;
//   }

//   try {
//       const encDataBuf = stringToArrayBuffer(atob(encryptedData));
//       const dataEncBuf = await crypto.subtle.decrypt({
//           name: securityContext.symmetricAlgo,
//           iv: originalRequest.secret,
//           tagLength: securityContext.secretTagLength
//       }, securityContext.symmetricKey, encDataBuf);

//       return arrayBufferToString(dataEncBuf);
//   } catch (error) {
//       console.error('Decryption failed:', error);
//       return null;
//   }
// }


// todo: end of uncomment before moving to production

let submitBaseUrl = 'https://hdfc-dev-03.adobecqms.net';

export function getSubmitBaseUrl() {
  return submitBaseUrl;
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
 * @param {Object} globals - Global context object with utility functions like `globals.functions.setProperty`.
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
 * Custom submit function
 * @param {scope} globals
 */
function submitFormArrayToString(globals) {
  const data = globals.functions.exportData();
  Object.keys(data).forEach((key) => {
    if (Array.isArray(data[key])) {
      data[key] = data[key].join(',');
    }
  });
  globals.functions.submitForm(data, true, 'application/json');
}

/**
 * Calculate the number of days between two dates.
 * @param {*} endDate
 * @param {*} startDate
 * @returns {number} returns the number of days between two dates
 */
function days(endDate, startDate) {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

  // return zero if dates are valid
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 0;
  }

  const diffInMs = Math.abs(end.getTime() - start.getTime());
  return Math.floor(diffInMs / (1000 * 60 * 60 * 24));
}

/**
 * Set a form property value
 * @param {string} propertyName Name of the property to set
 * @param {string|object} propertyValue Value to set for the property
 * @param {scope} globals Global scope object
 */
function setProperty(propertyName, propertyValue, globals) {
  // Get existing properties or initialize empty object
  const existingProperties = globals.form.$properties || {};

  // Merge new property with existing properties
  const updatedProperties = { ...existingProperties, [propertyName]: propertyValue };

  globals.functions.setProperty(globals.form, {
    properties: updatedProperties,
  });
}

/**
 * Set a field property value
 * @param {object} normalFieldOrPanel field or panel component to set the property on
 * @param {string} propertyName Name of the property to set
 * @param {string|object} propertyValue Value to set for the property
 * @param {scope} globals Global scope object
 */
function setFieldProperty(normalFieldOrPanel, propertyName, propertyValue, globals) {
  // Get existing properties or initialize empty object
  const existingProperties = normalFieldOrPanel.$properties || {};

  // Merge new property with existing properties
  const updatedProperties = { ...existingProperties, [propertyName]: propertyValue };

  globals.functions.setProperty(normalFieldOrPanel, {
    properties: updatedProperties,
  });
}

/**
 * Get a field property value
 * @param {object} normalFieldOrPanel - Field or panel component to get the property from (defaults to current field)
 * @param {string} propertyName - Name of the property to get (supports dot notation e.g. 'address.city')
 * @param {scope} globals - Global scope object containing the current field context
 * @returns {object|string|Array} The value of the requested property or undefined if not found
 */
function getFieldProperty(normalFieldOrPanel, propertyName, globals) {
  // Use the provided field/panel or default to the current field from globals
  const field = normalFieldOrPanel || globals.field;

  // Return undefined if no property name or if the field has no properties
  if (!propertyName || !field.$properties) {
    return undefined;
  }

  // Handle dot notation by splitting and traversing the object
  const properties = propertyName.split('.');
  let value = field.$properties;

  for (const prop of properties) {
    if (value === undefined || value === null) {
      return undefined;
    }
    value = value[prop];
  }

  return value;
}

/**
 * Get a form property value
 * @param {string} propertyName Name of the property to get (supports dot notation e.g. 'address.city')
 * @param {scope} globals Global scope object
 * @returns {object|string|Array} The value of the requested property
 */
function getProperty(propertyName, globals) {
  if (!propertyName || !globals.form.$properties) {
    return undefined;
  }

  // Handle dot notation by splitting and traversing the object
  const properties = propertyName.split('.');
  let value = globals.form.$properties;

  for (const prop of properties) {
    if (value === undefined || value === null) {
      return undefined;
    }
    value = value[prop];
  }

  return value;
}

/**
 * Sets the last five digits of the mobile number to the dynamic text value.
 * @param {object} normalField
 * @param {scope} globals
 * @returns {void}
 */
function populateLastFiveDigits(normalField, globals) {
  const value = globals.field.$value.toString() || '';
  globals.functions.setProperty(normalField, {
    properties: {
      lastFiveDigits: value.slice(-5),
    },
  });
}

/**
 * @private
 */
function generateUUID() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, function (c) {
    return (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16);
  });
}

/**
 * @private
 */
function getDispatcherInstance() {
  // todo: in EDS, there is no dispatcher instance
  return '00';
}

/**
 * Creates a journey ID by combining various parameters
 * @param {string} journeyAbbreviation The journey abbreviation
 * @param {string} channel The channel
 * @param {scope} globals Global scope object
 * @returns {string} The generated journey ID
 */
function createJourneyId(journeyAbbreviation, channel, globals) {
  var visitMode = "U"; // todo check if this is correct
  var existingJourneyId = getProperty("journeyId", globals);

  if (existingJourneyId) {
    return existingJourneyId;
  }

  var dynamicUUID = generateUUID();
  var dispInstance = getDispatcherInstance();
  var journeyId = dynamicUUID + '_' + dispInstance + "_" + journeyAbbreviation + "_" + visitMode + "_" + channel;
  // todo: this is done since setProperty is asynchronous
  // and return values is immediately set as updates on the form object in which this is written
  return {
    properties: {
      ...globals.form.$properties,
      journeyId: journeyId
    }
  }
}

/**
 * Get the complete event payload
 * @param {scope} globals Global scope object
 * @returns {object} event payload - returns body if present, otherwise full payload
 */
function getCustomEventPayload(globals) {
  return globals.event.payload.body || globals.event.payload;
}

/**
 * Is SSO
 * @returns {boolean} true if SSO, false otherwise
 */
function isSSO() {
  //TODO: need to implement the logic to check if its SSO based journey or not
  return false;
}

/**
 * Calculate age based on date of birth and current date time from form properties
 * @param {string|date} dateOfBirth Date of birth in ISO format
 * @param {scope} globals Global scope object
 * @returns {number|string} Age in years, returns 0 if dates are invalid
 */
function calculateAge(dateOfBirth, globals) {
  let age = 0;
  if (dateOfBirth) {
    // Parse the reference date from the given format which comes from API
    const referenceDate = getProperty("currentDateTime", globals);
    const [day, month, year, time] = referenceDate.split(' ');
    const refDate = new Date(`${year}-${month}-${day}T${time}`);
    // Parse the date of birth
    const dob = new Date(dateOfBirth);
    // Return 0 if dates are invalid
    if (Number.isNaN(refDate.getTime()) || Number.isNaN(dob.getTime())) {
      return 0;
    }
    // Calculate age
    age = refDate.getFullYear() - dob.getFullYear();
    // Adjust age if birthday hasn't occurred yet in the reference year
    const refMonth = refDate.getMonth();
    const birthMonth = dob.getMonth();
    if (birthMonth > refMonth || (birthMonth === refMonth && dob.getDate() > refDate.getDate())) {
      age--;
    }
  }
  return age;
}

/**
 * Import recommended sub products data into the panel
 * @param {object} subProductPanel Panel component to import data into
 * @param {object} subProductData Data to be imported
 * @param {scope} globals Global scope object
 */
function importRecommendedSubProducts(subProductPanel, subProductData, globals) {
  // todo: transform the subProductData to the format of the subProductPanel
  subProductPanel.importData(subProductData);
}

/**
 * Extract an element from array at specified index or last element if no index provided
 * @param {Array} array Array to extract element from
 * @param {number} [index] Optional index to extract element from, defaults to last element
 * @returns {string|object} Element from the array at specified index or last element
 */
function extractArrayElement(array, index) {
  return array[index ? index : array.length - 1];
}

/**
 * Gets the form data by exporting all field values and converts to JSON string
 * @param {scope} globals - Global scope object containing form context
 * @returns {object|string} The complete form data as an object or JSON string if stringify is true
 */
function getFormDataAsString(globals) {
  // todo: add this function in the product OOTB list
  const data = globals.functions.exportData();
  // Check if data exists and is an object
  if (data && typeof data === 'object') {
    return JSON.stringify(data);
  }
  return data;
}

/**
 * Detects and returns the user's browser name and version.
 * @returns {{name: string, version: string}} The browser information object.
 */
function getBrowser() {
  const ua = navigator.userAgent;
  let match = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
  let temp;

  // Handle IE (Trident)
  if (/trident/i.test(match[1])) {
    temp = /\brv[ :]+(\d+)/g.exec(ua) || [];
    return { name: 'IE', version: temp[1] || '' };
  }

  // Handle Edge and Opera based on Chrome userAgent
  if (match[1] === 'Chrome') {
    temp = ua.match(/\b(OPR|Edge)\/(\d+)/);
    if (temp !== null) {
      return {
        name: temp[1] === 'OPR' ? 'Opera' : 'Edge',
        version: temp[2]
      };
    }
  }

  // Handle other browsers
  match = match.length >= 2 ? [match[1], match[2]] : [navigator.appName, navigator.appVersion];
  if ((temp = ua.match(/version\/(\d+)/i)) !== null) {
    match[1] = temp[1];
  }

  return {
    majver: '',
    name: match[0],
    version: match[1]
  };
}

/**
 * Detects and returns the user's operating system based on the platform and user agent.
 * @returns {string|null} The name of the operating system or null if undetectable.
 */
function getOS() {
  const { userAgent, platform } = window.navigator;

  const macPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'];
  const winPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'];
  const iosPlatforms = ['iPhone', 'iPad', 'iPod'];

  if (macPlatforms.includes(platform)) {
    return 'Mac OS';
  }
  if (iosPlatforms.includes(platform)) {
    return 'iOS';
  }
  if (winPlatforms.includes(platform)) {
    return 'Windows';
  }
  if (/Android/.test(userAgent)) {
    return 'Android';
  }
  if (/Linux/.test(platform)) {
    return 'Linux';
  }

  return null;
}



/**
 * Returns the client info object - As per the function from Insta Savings
 * @param {scope} globals - Global scope object containing form context
 * @returns {object|string} The client info object
 */
function getClientInfoAsObject(globals) {
  const response = {
    browser: getBrowser(),
    cookie: {
        source: 'AdobeForms',
        name: 'InstaSavings',
        ProductShortname: 'IS'
    },
    client_ip: '',
    device: {
        type: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
        name: 'Samsung G5',
        os: getOS(),
        os_ver: '637.38383'
    },
    isp: {
        ip: '839.893.89.89',
        provider: 'AirTel',
        city: 'Mumbai',
        state: 'Maharashrta',
        pincode: '400828'
    },
    geo: {
        lat: '72.8777° E',
        long: '19.0760° N'
    }
  };

  return response;
}


/**
 * Removes hyphens and underscores from the string
 * @param {string} str - String to be filtered
 * @param {scope} globals - Global scope object containing form context
 * @returns {string} The filtered string
 */
function removeHyphensAndUnderscores (str, globals) {
  return str.replace(/-/g, '').replace(/_/g, '');
}

/**
 * Sends a POST request by dynamically creating and submitting a form.
 * The form includes Aadhaar-related encrypted fields and vendor information.
 *
 * @param {string} encKey - The encrypted key to be included in the form.
 * @param {string} encSecret - The encrypted secret to be included in the form.
 * @param {string} vendorId - The vendor identifier.
 * @param {string} encData - The encrypted Aadhaar data.
 * @param {string} redirectUrl - The URL to which the form will be submitted.
 */
function sendAadharRequest(encKey, encSecret, vendorId, encData, redirectUrl) {
  const aadharValidationForm = document.createElement('form');
  aadharValidationForm.setAttribute('action', redirectUrl);
  aadharValidationForm.setAttribute('method', 'POST');

  updateAadharFormElement(aadharValidationForm, "encKey", encKey);
  updateAadharFormElement(aadharValidationForm, "encSecret", encSecret);
  updateAadharFormElement(aadharValidationForm, "vendorId", vendorId);
  updateAadharFormElement(aadharValidationForm, "encData", encData);
  updateAadharFormElement(aadharValidationForm, "redirectUrl", redirectUrl);

  document.body.appendChild(aadharValidationForm);
  aadharValidationForm.submit();
}

/**
 * Appends a hidden input field to the form for the given key-value pair.
 *
 * @param {HTMLFormElement} form - The form element to which the hidden field should be added.
 * @param {string} key - The name attribute for the input field.
 * @param {string} value - The value attribute for the input field.
 */
function updateAadharFormElement(form, key, value) {
  const field = document.createElement('input');
  field.setAttribute('type', 'hidden');
  field.setAttribute('name', key);
  field.setAttribute('value', value);
  form.appendChild(field);
}

/**
 * Filter and return IFSC code based on selected branch ID
 * @param {scope} globals Global scope object containing field properties and value
 * @returns {string} IFSC code of the selected branch or empty string if not found
 */
function filterIfscCode(globals) {
  var branchDetails = globals.field.$properties["branchDetails"];
  if (branchDetails) {
    var filteredValue = branchDetails.filter(function(detail) {
      return detail.Id === globals.field.$value;
    })[0];
    return filteredValue ? filteredValue.IFSC || "" : "";
  }
  return "";
}

/**
 * Shows the wizard panel by setting its visibility property
 * @param {scope} globals Global scope object containing form functions and components
 * @returns {void}
 */
function showWizardHideLoginFragment(globals) {
   // todo: limitation in rule editor to listen to event, ideally this should
  // have being down via dispatchEvent in fragment and listening to that event in fragment wrapper of form
  var panel = globals.form.wizard;
  var loginFragment = globals.form.loginFragment
  globals.functions.setProperty(panel, {
    "visible": true
  });
  globals.functions.setProperty(loginFragment, {
    "visible": false
  });
}


/**
 * Validates the login page form based on mobile number, either DOB or PAN (depending on selection),
 * and mandatory consent checkbox.
 *
 * @param {Object} mobileField - The form field object for the mobile number, containing a `$valid` property.
 * @param {Object} dobField - The form field object for date of birth (DOB), containing a `$valid` property.
 * @param {Object} panField - The form field object for PAN, containing a `$valid` property.
 * @param {Object} mandatoryConsent - The consent checkbox field object, containing a `$value` property (boolean).
 * @param {scope} globals - Global variables or settings object (currently unused in this function).
 *
 * @returns {boolean} - Returns `true` if the form passes validation rules; otherwise, `false`.
 *
 * @example - On rule editor, if the response of this function is true, enable the otp button else keep it disabled.
 */
function validateLoginPage(mobileField, dobField, panField, mandatoryConsent, globals) {
  // const radioSelect = (panDobSelection === '0') ? 'DOB' : 'PAN';
  const radioSelect = 'DOB'; // Hardcoded for now, assuming DOB is always selected
  if (mobileField.$value && mobileField.$value.toString().length == 10 && mobileField.$valid &&
      ((radioSelect === 'DOB' && dobField.$valid) ||
        (radioSelect === 'PAN' && panField.$valid)) &&
        mandatoryConsent.$value === 'yes') {
    return true;
  }

  return false;
}

/**
 * Validates the otp screen based on the OTP Input.
 *
 * @param {Object} otpField - The form field object for the otp, containing a `$valid` property.
 * @param {scope} globals - Global variables or settings object (currently unused in this function).
 *
 * @returns {boolean} - Returns `true` if the form passes validation rules; otherwise, `false`.
 *
 * @example - On rule editor, if the response of this function is true, enable the otp button else keep it disabled.
 */
function validateOtpPage(otpField, globals) {
  if (otpField.$valid) {
    return true
  }
  return false;
}

/**
 * Validates the age based on the Date of Birth (DOB) field value.
 * The function checks whether the age derived from the provided DOB falls within the specified
 * minimum and maximum age range.
 *
 * @param {Object} dobField - The form field object representing the Date of Birth input field.
 * It should contain a `$value` property that holds the DOB in a valid date format.
 *
 * @param {number} minAge - The minimum age the person should be based on their Date of Birth.
 *
 * @param {number} maxAge - The maximum age the person can be based on their Date of Birth.
 *
 * @param {scope} globals - A global settings object (currently unused in this function,
 * but could be extended to handle additional logic or configurations).
 *
 * @returns {void} - Sets dob field as invalid, if the age is out of the range provided.
 *
 */
function validateDobAge(dobField, minAge, maxAge, globals) {
  const age = calculateAge(dobField, globals);

  if(age < minAge || age > maxAge) {
    globals.functions.markFieldAsInvalid(
      dobField.$qualifiedName,
      `Customers with age below ${minAge} years and above ${maxAge} are not allowed.`,
      { useQualifiedName: true });
  }
}

/**
 * Converts a date string from one format to another.
 * Supported format tokens: YYYY, YY, MM, DD
 *
 * @param {string} dateStr - The original date string (e.g., '2000-02-10').
 * @param {string} [outputFormat='DD/MM/YYYY'] - Desired output format (e.g., 'DD/MM/YYYY').
 * @returns {string} - Reformatted date string (e.g., '10/02/2000').
 *
 * @example
 * convertDateFormat('2000-02-10'); // '10/02/2000'
 * convertDateFormat('2000-02-10', 'DD/MM/YY'); // '10/02/00'
 */
function convertDateFormat(dateStr, outputFormat = 'DD/MM/YYYY') { // TODO: Needs to be a part of the product.
  const inputFormat = 'YYYY-MM-DD';
  const formatParts = inputFormat.match(/(YYYY|YY|MM|DD)/g);
  const dateParts = dateStr.split(/[-/]/);

  const dateMap = {};
  formatParts.forEach((part, idx) => {
    dateMap[part] = dateParts[idx];
  });

  return outputFormat
    .replace(/YYYY/, dateMap['YYYY'] || ('20' + dateMap['YY']))
    .replace(/YY/, dateMap['YY'] || dateMap['YYYY'].slice(-2))
    .replace(/MM/, dateMap['MM'])
    .replace(/DD/, dateMap['DD']);
}

/**
 * Returns the current date and time in ISO 8601 format (UTC).
 *
 * @returns {string} The current UTC date and time as an ISO 8601 string.
 *
 * @example
 * const isoTime = getCurrentIsoDateTime();
 * console.log(isoTime); // e.g., "2025-05-08T12:45:30.123Z"
 */
function getCurrentIsoDateTime() {
  return new Date().toISOString();
}

/**
 * Computes the matching state ID from branch state field based on pincode state list
 * @param {Array} stateListFromPinCode List of states from pincode response
 * @param {object} branchStateField Branch state field containing enum values and names
 * @param {scope} globals Global scope object
 * @returns {string} Matching state ID from branch state field or undefined if no match found
 */
function computeBranchState(stateListFromPinCode, branchStateField, globals) {
  if (!stateListFromPinCode || !stateListFromPinCode.length || !branchStateField) {
    return undefined;
  }

  // Search through enumNames and values to find matching state
  for (const state of stateListFromPinCode) {
    if (state.Name.toLowerCase() === branchStateField.toLowerCase()) {
      return state.StateId;
    }
  }

  return undefined;
}

/**
 * Sets the enum property of accountVariantSelected field based on subProductId from exported data
 * @param {scope} globals Global scope object containing form data and field information
 * @returns {void} Updates the enum property of accountVariantSelected field
 */
function computeAccountVariant(globals) {
  // todo: this can be done in visual rule editor
  // today the rule of repeatable panel is not working correctly, hence dont here

  // ideal way: set property enum of field when repeatable panel is initialized in visual rule editor
  const exportedData = globals.field.$value;

  if (exportedData && exportedData.SubProductId) {
    globals.functions.setProperty(globals.field.accountVariantSelected, {
      "enum": [exportedData.SubProductId],
      "enumNames": [""]
    });
  }
}

/**
 * Replace all occurrences of a string in the original string
 * @param {string|date} originString Original string or date to perform replacement on
 * @param {string} stringToReplace String to be replaced
 * @param {string} stringToReplaceWith String to replace with
 * @param {scope} globals Global scope object
 * @returns {string} String with all occurrences replaced
 */
function replaceString(originString, stringToReplace, stringToReplaceWith, globals) {
  // todo: add this function in the OOTB list
  if (!originString || !stringToReplace) {
    return "";
  }
  var stringToProcess = originString;
  // Convert Date to string if needed
  if (originString instanceof Date) {
    stringToProcess = originString.toString();
  }
  // Replace all occurrences using split and join for ES5 compatibility
  return stringToProcess.split(stringToReplace).join(stringToReplaceWith || '');
}

/**
 * Get Journey Name
 * @param {scope} globals Global scope object
 * @returns {string} The journey name
 */
function getJourneyName(globals) {
  return globals.form.$properties.journeyName;
}

/**
 * Get Journey Id
 * @param {scope} globals Global scope object
 * @returns {string} The journey id
 */
function getJourneyId(globals) {
  return globals.form.$properties.journeyId;
}


/**
 * Get consent panel value
 * @param {object} consentPanel consent panel object
 * @returns {string} The consent panel value
 * TODO: This is a temporary function to get the consent panel value will be removed once issue fixed in invoke service
 */
function getConsentValue(consentPanel) {
  return consentPanel.$value;
}

/**
 * Handles the error state of the form
 * * @param {object} errorScrrenPanel Panel to show when there is a form error 
 * @param {scope} globals - An object containing read-only form instance, read-only target field instance and methods for form modifications.
 * @returns {void}
 */
function formErrorHandler(errorScrrenPanel, globals) {
  // hide the active panel and show the error screen panel
  globals.functions.setProperty(globals.form.$activeChild, {visible: false});
  globals.functions.setProperty(errorScrrenPanel, {visible: true});
}

/**
* Masks input field when its ETB
* @name mask Masks input field
* @param {object} field field whose value is to be masked
* @param {scope} globals An object containing read-only form instance, read-only target field instance and methods for form modifications.
* @return {string} Masked output
*/
function mask(field, globals) {
  const maskingType = field.$properties.maskingType;
  const etb = globals.form.$properties.existingCustomer;
  if(!etb) {
    return field.$value;
  }
  switch(maskingType) {
    case 'dateOfBirth':
      return maskDOB(field);
    case 'email':
      return maskEmail(field);
    case 'fullName':
      return maskFullName(field);
    case 'accountNumber':
      return maskAccountNumber(field);
    case 'pan':
      return maskPAN(field);
    default:
      return field.$value || '';
  }
}


function maskDOB(field) {
  const dob = field.$value;
  if (dob) {
    // Split the date into parts
    const [year, month, day] = dob.split('-');
    // Get first digit of day and mask rest
    const maskedDay = day.charAt(0) + '*';
    // Mask month completely
    const maskedMonth = '**';
    // Get first two digits of year and mask rest
    const maskedYear = year.substring(0, 2) + '**';
    // Combine with separators
    return `${maskedDay} / ${maskedMonth} / ${maskedYear}`;
  }
  return dob || '';
}
// TODO: upate masking logic for all these functions
function maskEmail(field) {
  return field.$value;
}

function maskFullName(field) {
  return field.$value;
}

function maskAccountNumber(field) {
  return field.$value;
}

function maskPAN(field) {
  return field.$value;
}

/**
* formats the features array
* @name formatFeaturesArray 
* @param {array} featuresArray field whose value is to be masked
* @return {array} filtered features array
*/
function formatFeaturesArray(featuresArray) {
  const blacklist = [
    "Link",
    "Account",
    "consent"
  ];
  return featuresArray
    .filter(feature => !blacklist.includes(feature))
    .map(feature => ({ feature }));
}

/**
*  filters out the recommended accounts array and maps it to defined schema 
* @name filterAccounts 
* @param {array} accountsArray list of all available account types 
* @param {array} recommededAccountNames array of accounts to be recommended
* @return {array} returns recommends accounts array
*/
function filterAccounts(accountsArray, recommededAccountNames) {

  return accountsArray.map(account => {
    // Create base object with accountVariantSelected
    const transformedAccount = {
      accountVariantSelected: account.Account || '',
      accountFeature: []
    };

    const blacklist = [
      "Link",
      "Account"
    ];

    // Convert each property (except Account and Link) into a feature object
    Object.entries(account).forEach(([key, value]) => {
      if (!blacklist.includes(key)) {
        transformedAccount.accountFeature.push({
          accountFeatureInfo: value
        });
      }
    });

    return transformedAccount;
  });
}


/**
 * computes account variants recommendations
 * @name computeRecommendations 
 * @param {array} accountsData array of account data
 * @param {array} recommendationsData recommended data
 * @param {number} income user's income
 * @param {string} dob date of birth
 * @param {string} gender user's gender
 * @param {string} occupation user's occupation
 * @param {string} rbiClass RBI classification
 * @param {scope} globals Global scope object
 * @returns {array} returns the filtered accounts data with recommendations
 */
function computeRecommendations(accountsData, recommendationsData, income, dob, gender, occupation, rbiClass, globals) {
  // Calculate age from DOB
  // const age = calculateAge(dob, globals);
  
  // // Find the matching recommendation bucket
  // const matchingRecommendation = recommendationsData.find(recommendation => {
  //   // Check income range
  //   const minIncome = parseFloat(recommendation["Min Income"]) || 0;
  //   const maxIncome = parseFloat(recommendation["Max Income"]) || Infinity;
  //   const incomeMatch = income >= minIncome && (maxIncome === Infinity || income <= maxIncome);
    
  //   // Check age range
  //   const minAge = parseInt(recommendation["Min Age"]) || 0;
  //   const maxAge = parseInt(recommendation["Max Age"]) || Infinity;
  //   const ageMatch = age >= minAge && (maxAge === Infinity || age <= maxAge);
    
  //   // Check gender
  //   const allowedGenders = recommendation["Gender"].split(',').map(g => g.trim());
  //   const genderMatch = allowedGenders.includes("Any") || allowedGenders.includes(gender);
    
  //   // Check excluded occupation
  //   const excludedOccupations = recommendation["Excluded Occupation"].split(',').map(o => o.trim()).filter(o => o);
  //   const occupationMatch = excludedOccupations.length === 0 || !excludedOccupations.includes(occupation);
    
  //   // Check RBI class
  //   const allowedRbiClasses = recommendation["RBI Class"].split(',').map(c => c.trim());
  //   const rbiClassMatch = allowedRbiClasses.includes("Any") || allowedRbiClasses.includes(rbiClass);
    
  //   return incomeMatch && ageMatch && genderMatch && occupationMatch && rbiClassMatch;
  // });
  
  // if (!matchingRecommendation) {
  //   // Return original accountsData if no matching recommendation found
  //   return [];
  // }
  
  // // Extract priority values and filter out empty ones
  // const priorities = [
  //   matchingRecommendation["Priority 1"],
  //   matchingRecommendation["Priority 2"],
  //   matchingRecommendation["Priority 3"],
  //   matchingRecommendation["Priority 4"]
  // ].filter(priority => priority && priority.trim() !== "");
  
  // // Add recommended value if it exists
  // // if (matchingRecommendation["Recomended"] && matchingRecommendation["Recomended"].trim() !== "") {
  // //   priorities.push(matchingRecommendation["Recomended"]);
  // // }
  
  // // Filter accountsData to only include accounts that match the priorities
  // const recommendedAccounts = accountsData.filter(account => {
  //   return priorities.some(priority => {
  //     // Check if account name matches any of the priority recommendations
  //     return account.Account && account.Account.toLowerCase().includes(priority.toLowerCase());
  //   });
  // });
  
  // // Sort accounts based on priority order
  // recommendedAccounts.sort((a, b) => {
  //   const aPriority = priorities.findIndex(priority => 
  //     a.Account && a.Account.toLowerCase().includes(priority.toLowerCase())
  //   );
  //   const bPriority = priorities.findIndex(priority => 
  //     b.Account && b.Account.toLowerCase().includes(priority.toLowerCase())
  //   );
    
  //   // If both found, sort by priority index (lower index = higher priority)
  //   if (aPriority !== -1 && bPriority !== -1) {
  //     return aPriority - bPriority;
  //   }
    
  //   // If only one found, prioritize the found one
  //   if (aPriority !== -1) return -1;
  //   if (bPriority !== -1) return 1;
    
  //   // If neither found, maintain original order
  //   return 0;
  // });
  
  // return recommendedAccounts;
  return accountsData;
}

/**
 * Filters an array of objects by property value.
 * @name filterByPropertyValue
 * @param {array} response - The array of objects to filter.
 * @param {string} propertyPath - The propertyPath in object to fitler by.
 * @param {string} value - The value of property to match.
 * @returns {array} - A new array containing only the objects with the matching value for key.
 */
function filterByPropertyValue(response, propertyPath, value) {
  return (response || []).filter(item => item[propertyPath] === value);
}

/**
 * Adds a new key-value pair to each object in an array.
 * @param {Array} addKeyValueToEachObject - Array of objects to update
 * @param {string} key - Key to add
 * @param {*} value - Value to assign to the key
 * @returns {Array} Updated array of objects
 */
function addKeyValueToEachObject(arrayOfObject, key, value) {
  return (arrayOfObject || []).map(obj => ({ ...obj, [key]: value }));
}

/**
 * Generates a lowercase image path based on given category or key.
 * @param {string} baseImagePath - Base directory path for images (e.g., "/content/dam/hdfc/siccdc/")
 * @param {string} imageKey - The category or image name (e.g., "Electricity")
 * @param {string} extension - Image file extension (default: ".png")
 * @returns {string} Full image path (e.g., "/content/dam/hdfc/siccdc/electricity.png")
 */
function generateImagePath(baseImagePath, imageKey, extension = '.png') {
  return (`${baseImagePath}${(imageKey || '').toLowerCase()}` || '') + extension;
}

/**
 * Appends image path field to each object using key from object
 * @param {Array} arrayInput 
 * @param {string} fromKey - field to get value from (e.g. 'biller_category')
 * @param {string} toKey - field to write value to (e.g. 'biller_category_logo')
 * @param {string} basePath - base image path
 * @param {string} extension - file extension (default .png)
 * @returns {Array}
 */

/**
 * Adds an image path to each object in the array using a value from a specified key.
 * @param {Array} arrayInput - Array of objects to update.
 * @param {string} fromKey - Key to read the image name from.(e.g. 'biller_category')
 * @param {string} toKey - Key to write the full image path to.(e.g. 'biller_category_logo')
 * @param {string} basePath - Base path for the image.(e.g: '/content/dam/hdfc/siccdc/')
 * @param {string} [extension='.png'] - Image file extension.
 * @returns {Array} Updated array with image paths added.
 */
function appendImagePathField(arrayInput, fromKey, toKey, basePath, extension = '.png') {
  return (arrayInput || []).map(item => ({
    ...item,
    [toKey]: generateImagePath(basePath,(item[fromKey] || ''), extension)
  }));
}

  // TODO: If required this can be moved to sheets
  const incomeRangeMapping = [
    { min: 0, max: 50000, code: 1, monthlyAverage: 4166 },
    { min: 50000, max: 100000, code: 2, monthlyAverage: 6250 },
    { min: 100000, max: 300000, code: 3, monthlyAverage: 16667 },
    { min: 300000, max: 500000, code: 4, monthlyAverage: 33333 },
    { min: 500000, max: 750000, code: 5, monthlyAverage: 52083 },
    { min: 750000, max: 1000000, code: 6, monthlyAverage: 72917 },
    { min: 1000000, max: 1500000, code: 7, monthlyAverage: 104167 },
    { min: 1500000, max: 2500000, code: 9, monthlyAverage: 166667 },
    { min: 2500000, max: 5000000, code: 10, monthlyAverage: 312500 },
    { min: 5000000, max: 10000000, code: 11, monthlyAverage: 625000 },
    { min: 10000000, max: Infinity, code: 12, monthlyAverage: 833333 }
  ];
/**
 * Returns the salary code based on the income range mapping.
 * @param {object} incomeField - The income field object containing the income value
 * @param {string} flag - based on flag it returns incomeCode or monthlyAverage
 * @returns {number} The salary code/monthlyAverage corresponding to the income range
 */
function formatIncome(incomeField, flag) {
  const income = parseFloat(incomeField.$value);
  // Find the appropriate code based on income range
  for (const range of incomeRangeMapping) {
    if (income >= range.min && income < range.max) {
      return flag === 'code' ? range.code : range.monthlyAverage;
    }
  }
}

/**
 * @name getFullPropertyPath
 * @name {string} relativePropertyPath
 * @param {scope} globals
 * @returns {string}
 */
function getFullPropertyPath(relativePropertyPath, globals) {
  const buttonQN = globals.field.$qualifiedName; // e.g., $form.p1[0].p2.b1
  const fullPropertyPath = buttonQN.split('.').slice(1, -1).join('.') + `.${relativePropertyPath}`; // to extract p1[0].p2 out of $form.p1[0].p2.b1 and creating p1[0].p2.c1.c2 if c1.c2 is relative proeprty path
  return fullPropertyPath;
}

// eslint-disable-next-line import/prefer-default-export
export {
  isSSO,
  getFullName,
  days,
  submitFormArrayToString,
  populateLastFiveDigits,
  setProperty,
  getProperty,
  getCustomEventPayload,
  createJourneyId,
  calculateAge,
  extractArrayElement,
  filterIfscCode,
  showWizardHideLoginFragment,
  computeBranchState,
  setFieldProperty,
  importRecommendedSubProducts,
  replaceString,
  computeAccountVariant,
  getFieldProperty,
  getFormDataAsString,
  getClientInfoAsObject,
  removeHyphensAndUnderscores,
  sendAadharRequest,
  validateLoginPage,
  validateOtpPage,
  validateDobAge,
  convertDateFormat,
  getCurrentIsoDateTime,
  getJourneyName,
  getJourneyId,
  getConsentValue,
  formErrorHandler,
  mask,
  formatFeaturesArray,
  filterAccounts,
  computeRecommendations,
  filterByPropertyValue,
  addKeyValueToEachObject,
  generateImagePath,
  appendImagePathField,
  fetchMergedBranchDetails,
  formatIncome,
  getFullPropertyPath,
};