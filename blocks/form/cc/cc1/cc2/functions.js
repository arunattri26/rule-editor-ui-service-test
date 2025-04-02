import { getFullName1 } from '../../functions';

/**
 * Get Full Name 3
 * @name getFullName3 Concats first name and last name 3
 * @param {string} firstname in Stringformat
 * @param {string} lastname in Stringformat
 * @return {string}
 */
function getFullName3(firstname, lastname) {
    return `${firstname} ${lastname}`.trim();
}

// eslint-disable-next-line import/prefer-default-export
export { getFullName3, getFullName1 };