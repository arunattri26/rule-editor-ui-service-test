import { getFullName1 } from './cc/functions';

/**
 * Get Full Name 2
 * @name getFullName2 Concats first name and last name 1
 * @param {string} firstname in Stringformat
 * @param {string} lastname in Stringformat
 * @return {string}
 */
function getFullName2(firstname, lastname) {
    return `${firstname} ${lastname}`.trim();
}

// eslint-disable-next-line import/prefer-default-export
export { getFullName1, getFullName2 };