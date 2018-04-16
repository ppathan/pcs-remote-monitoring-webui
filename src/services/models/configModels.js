// Copyright (c) Microsoft. All rights reserved.

import { reshape, stringToBoolean } from 'utilities';

export const toDeviceGroupsModel = (response = {}) => (response.items || [])
  .map((device = {}) => reshape(device, {
    'id': 'id',
    'displayName': 'displayName',
    'conditions': 'conditions',
    'eTag': 'eTag'
  }));

export const toDeviceGroupsRequestModel = (request = {}) => {
  const res = reshape(request, {
    'displayName': 'DisplayName',
    'conditions': 'Conditions'
  });

  res.Conditions.map(condition => reshape(condition, {
    'key': 'Key',
    'operator': 'Operator',
    'value': 'Value'
  }));

  return res;
}

export const toDeviceGroupFiltersModel = (response = {}) => {
  console.log('before reshape', response);
  reshape(response, {
  'reported': 'reported',
  'tags': 'tags'
})};

export const prepareLogoResponse = (responseWrapper) => {
  const returnObj = {};
  const xhr = responseWrapper.xhr;
  const isDefault = xhr.getResponseHeader("IsDefault");
  if (!stringToBoolean(isDefault)) {
    const appName = xhr.getResponseHeader("Name");
    if (appName) {
      returnObj['name'] = appName;
    }
    const blob = responseWrapper.response;
    if (blob && blob.size > 0) {
      returnObj['logo'] = URL.createObjectURL(blob);
    }
  }
  return returnObj;
}

export const toSolutionSettingThemeModel = (response = {}) => reshape(response, {
  'AzureMapsKey': 'azureMapsKey',
  'description': 'description',
  'name': 'name'
});
