// Copyright (c) Microsoft. All rights reserved.

import Config from 'app.config';
import { HttpClient } from './httpClient';
import {
  toDeviceGroupsModel,
  toDeviceGroupsRequestModel,
  toDeviceGroupFiltersModel,
  prepareLogoResponse,
  toSolutionSettingThemeModel
} from './models';

const ENDPOINT = Config.serviceUrls.config;

/** Contains methods for calling the config service */
export class ConfigService {

  /** Returns a the account's device groups */
  static getDeviceGroups() {
    return HttpClient.get(`${ENDPOINT}devicegroups`)
      .map(toDeviceGroupsModel);
  }

  /** Creates a device group filter */
  static createDeviceGroup(payload) {
    return HttpClient.post(
      `${ENDPOINT}devicegroups`,
      toDeviceGroupsRequestModel(payload)
    );
  }

  /** Modify a device group filter by id */
  static modifyDeviceGroup(id, payload) {
    return HttpClient.put(`${ENDPOINT}devicegroups/${id}`, payload);
  }

  /** Delete a device group filter by id */
  static deleteDeviceGroup(id) {
    return HttpClient.delete(`${ENDPOINT}devicegroups/${id}`);
  }

  /** Returns a the account's device group filters */
  static getDeviceGroupFilters() {
    return HttpClient.get(`${ENDPOINT}devicegroupfilters`)
      // .do(res => console.log('$%#',res)
      //.map(toDeviceGroupFiltersModel);
  }

  /** Returns the azure map key for the account */
  static getAzureMapKey() {
    return HttpClient.get(`${ENDPOINT}solution-settings/theme`)
      .map(toSolutionSettingThemeModel)
      .map(response => response.azureMapsKey);
  }

  static getLogo() {
    var options = {};
    options.responseType = 'blob';
    options.headers = {
      'Accept': undefined,
      'Content-Type': undefined
    }
    return HttpClient.get(`${ENDPOINT}solution-settings/logo`, options)
      .map(prepareLogoResponse);
  }

  static setLogo(logo, header) {
    const options = {
      headers: header,
      responseType: 'blob'
    };

    if(!logo) {
      logo = '';
    }

    options.headers['Accept'] = undefined;
    return HttpClient.put(`${ENDPOINT}solution-settings/logo`, logo, options)
      .map(prepareLogoResponse);
  }
}
