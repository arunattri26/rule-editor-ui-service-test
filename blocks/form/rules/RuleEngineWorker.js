/** ***********************************************************************
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 * Copyright 2024 Adobe
 * All Rights Reserved.
 *
 * NOTICE: All information contained herein is, and remains
 * the property of Adobe and its suppliers, if any. The intellectual
 * and technical concepts contained herein are proprietary to Adobe
 * and its suppliers and are protected by all applicable intellectual
 * property laws, including trade secret and copyright laws.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe.

 * Adobe permits you to use and modify this file solely in accordance with
 * the terms of the Adobe license agreement accompanying it.
 ************************************************************************ */
import { createFormInstance } from './model/afb-runtime.js';
import registerCustomFunctions from './functionRegistration.js';

let customFunctionRegistered = false;

export default class RuleEngine {
  rulesOrder = {};

  constructor(formDef) {
    this.form = createFormInstance(formDef);
  }

  getState() {
    return this.form.getState(true);
  }

  getCustomFunctionsPath() {
    return this.form?.properties?.customFunctionsPath || '../functions.js';
  }
}

let ruleEngine;
onmessage = (e) => {
  function handleMessageEvent(event) {
    switch (event.data.name) {
      case 'init':
        // eslint-disable-next-line no-case-declarations
        const state = ruleEngine.getState();
        postMessage({
          name: 'init',
          payload: state,
        });
        ruleEngine.dispatch = (msg) => {
          postMessage(msg);
        };
        break;
      default:
        break;
    }
  }

  if (!customFunctionRegistered && e?.data?.name === 'init') {
    ruleEngine = new RuleEngine(e.data.payload);
    registerCustomFunctions(ruleEngine.getCustomFunctionsPath()).then(() => {
      customFunctionRegistered = true;
      handleMessageEvent(e);
    });
  }
};
