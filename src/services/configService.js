// Copyright (c) Microsoft. All rights reserved.

import Config from 'app.config';
import { HttpClient } from './httpClient';
import {
  toDeviceGroupsModel,
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

  /** Returns a the account's device group filters */
  static getDeviceGroupFilters() {
    return HttpClient.get(`${ENDPOINT}devicegroupfilters`)
      // .do(res => console.log('$%#',res)
      //.map(toDeviceGroupFiltersModel);
  }

  /** Creates a device group filter */
  static createtDeviceGroupFilter(payload) {
    return HttpClient.post(`${ENDPOINT}devicegroupfilters`, payload);
  }

  /** Modify a device group filter by id */
  static modifyDeviceGroupFilter(id, payload) {
    return HttpClient.put(`${ENDPOINT}devicegroupfilters/${id}`, payload);
  }

  /** Delete a device group filter by id */
  static deleteDeviceGroupFilter(id) {
    return HttpClient.delete(`${ENDPOINT}devicegroupfilters/${id}`);
  }

  /** Returns a the account's device group filters */
  static createtDeviceGroupFilter(payload) {
    return HttpClient.post(`${ENDPOINT}devicegroupfilters`, payload);
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
