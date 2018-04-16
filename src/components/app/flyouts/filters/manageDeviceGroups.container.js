// Copyright (c) Microsoft. All rights reserved.

import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import {
  getDeviceGroups,
  getDeviceGroupFilters,

} from 'store/reducers/appReducer';
import { ManageDeviceGroups } from './manageDeviceGroups';
import { epics as appEpics } from 'store/reducers/appReducer';

const mapStateToProps = state => ({
  deviceGroups: getDeviceGroups(state),
  deviceGroupFilters: getDeviceGroupFilters(state)
});

const mapDispatchToProps = dispatch => ({
  insertDeviceGroup: (payload) => dispatch(appEpics.actions.insertDeviceGroup(payload)),
  deleteDeviceGroup: id => dispatch(appEpics.actions.deleteDeviceGroup(id)),
  upsertDeviceGroup: (id, payload) => dispatch(appEpics.actions.upsertDeviceGroup(id, payload)),
  // TODO: get /config/v1/devicegroupfilters
  // getDeviceGroupFilters:
});

export const ManageDeviceGroupsContainer = translate()(connect(mapStateToProps, mapDispatchToProps)(ManageDeviceGroups));
