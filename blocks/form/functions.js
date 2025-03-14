/**
 * Get Full Name
 * @name getFullName Concats first name and last name
 * @param {string} firstname in Stringformat
 * @param {string} lastname in Stringformat
 * @return {string}
 */
function getFullName(firstname, lastname) {
  const globals= arguments[arguments.length-1];    
  firstname=(firstname==null)?"":firstname;
  lastname=(lastname==null)?"":lastname;
  console.log(globals);
  return firstname.concat(' ').concat(lastname);
}

/**
* Calculate the number of days between two dates.
* @param {*} endDate
* @param {*} startDate
* @return {number} returns the number of days between two dates
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
* Makes a REST call
* @name submitToRestEndpoint Submits the request to REST endpoint
* @param {scope} globals
* @return {string}
*/
function submitToRestEndpoint(globals){
  console.log("hola!");
  let result = "";
  $.ajax({
      url: '/content/dkvm-sign-endpoint',
      type: 'POST',
      //data: JSON.stringify({"actionNr": "8504"}),
      success: function(response) {
          alert("Thank you for submitting the form. We'll get back to you soon!");
          console.log("success from post call");
          result = "success";
      },
      error: function(xhr, status, error) {
          alert("Thank you for submitting the form. We'll get back to you soon!");
          console.error("Error: " + error);
          result = "error";
      }
  });
  return result;
}

// eslint-disable-next-line import/prefer-default-export
export { getFullName, days, submitToRestEndpoint };