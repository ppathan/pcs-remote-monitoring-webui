// Copyright (c) Microsoft. All rights reserved.

import React from 'react';
import moment from 'moment';
import {
  Btn,
  BtnToolbar,
  FormControl,
  FormGroup,
  FormLabel,
  Radio,
  ToggleBtn
} from 'components/shared';
import { SeverityRenderer } from 'components/shared/cellRenderers';
import { Validator, svgs, LinkedComponent } from 'utilities';
import Flyout from 'components/shared/flyout';
import Config from 'app.config';
import './ruleNew.css';
import { IoTHubManagerService } from 'services';

const Section = Flyout.Section;
const ruleNameValidator = (new Validator()).check(Validator.notEmpty, 'Name is required');

// A counter for creating unique keys per new condition
let conditionKey = 0;

// Creates a state object for a condition
const newCondition = () => ({
  calculation: "",
  duration: {
    hours: "",
    minutes: "",
    seconds: ""
  },
  operator: Config.OPERATOR_OPTIONS[0].value,
  value: '',
  key: conditionKey++ // Used by react to track the rendered elements
});

export class RuleNew extends LinkedComponent {

  constructor(props) {
    super(props);

    this.state = {
      name: '',
      description: '',
      deviceGroupID: '',
      deviceGroupOptions: [],
      fieldOptions: [],
      conditions: [newCondition()], // Start with one condition
      calculationOptions: [],
      operatorOptions: [...(Config.OPERATOR_OPTIONS)],
      severityLevel: {
        critical: true,
        warning: false,
        info: false
      },
      ruleStatus: true,
      devicesAffected: 0
    };

    // State links
    this.ruleNameLink = this.linkTo('name');
    this.descriptionLink = this.linkTo('description');
    this.deviceGroupLink = this.linkTo('deviceGroupID');
    this.conditionsLink = this.linkTo('conditions');
  }

  componentDidMount() {
    this.getFormState(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.getFormState(nextProps);
  }

  toSelectOption = ({ id, displayName }) => ({ value: id, label: displayName });

  getFormState = (props) => {
    const { deviceGroups, t } = props;
    const deviceGroupOptions = [...(deviceGroups || []).map(this.toSelectOption)];
    const average = t("rulesFlyout.calculationAverage");
    const instant = t("rulesFlyout.calculationInstant");
    const calculationOptions = [{ value: average, label: average }, { value: instant, label: instant }];
    this.setState({
      deviceGroupOptions,
      calculationOptions
    });
  }

  addCondition = () => this.conditionsLink.set([...this.conditionsLink.value, newCondition()]);

  deleteCondition = (index) =>
    (evt) => this.conditionsLink.set(this.conditionsLink.value.filter((_, idx) => index !== idx));

  createRule = (event) => {
    event.preventDefault();
    console.log('TODO: Handle the form submission');
  }

  onGroupIdChange = (selectedItem) => {
    this.getDeviceCountAndFields(selectedItem.target.value.value);
  }

  getDeviceCountAndFields(groupId) {
    this.props.deviceGroups.forEach(group => {
      if (group.id === groupId) {
        this.subscription = IoTHubManagerService.getDevices(group.Conditions)
          .subscribe(
            groupDevices => {
              this.setState({
                groupDevices,
                devicesAffected: groupDevices.length,
                fieldOptions: this.getConditionFields(groupDevices),

              });
            },
            errorResponse => {
              this.setState({ error: errorResponse.errorMessage });
            }
          );
      }
    });
  }

  getConditionFields(devices) {
    const fields = [];
    devices.forEach(device => {
      const telemetry = device.telemetry;
      if (telemetry) {
        Object.values(telemetry).forEach(field => {
          const extract = field.messageSchema.fields;
          Object.keys(extract).forEach(field => {
            if (field.indexOf('_unit') !== -1) return; //we don't want keys that contain _
            if (fields.every(o => o.value !== field)) {
              fields.push({
                label: field,
                value: field
              });
            }
          });
        });
      }
    });
    return fields;
  }

  render() {
    const { onClose, t } = this.props;
    const name = this.ruleNameLink.forkTo('name')
      .withValidator(ruleNameValidator);
    // Create the state link for the dynamic form elements
    const conditionLinks = this.conditionsLink.getLinkedChildren(conditionLink => {
      const fieldLink = conditionLink.forkTo('field');
      const calculationLink = conditionLink.forkTo('calculation');
      const operatorLink = conditionLink.forkTo('operator');
      const valueLink = conditionLink.forkTo('value');
      const durationLink = conditionLink.forkTo('duration');
      return { fieldLink, calculationLink, operatorLink, valueLink, durationLink };
    });

    return (
      <Flyout.Container>
        <Flyout.Header>
          <Flyout.Title>{t(`rulesFlyout.newRule`)}</Flyout.Title>
          <Flyout.CloseBtn onClick={onClose} />
        </Flyout.Header>
        <Flyout.Content className="new-rule-flyout-container">
          <form onSubmit={this.createRule}>
            <Section.Container className="rule-property-container">
              <Section.Content>
                <FormGroup>
                  <FormLabel isRequired="true">{t(`rulesFlyout.ruleName`)}</FormLabel>
                  <FormControl
                    type="text"
                    className="long"
                    placeholder={t(`rulesFlyout.namePlaceholder`)}
                    link={name} />
                </FormGroup>
                <FormGroup>
                  <FormLabel>{t(`rulesFlyout.description`)}</FormLabel>
                  <FormControl
                    type="textarea"
                    placeholder={t(`rulesFlyout.descriptionPlaceholder`)}
                    link={this.descriptionLink} />
                </FormGroup>
                <FormGroup>
                  <FormLabel isRequired="true">{t(`rulesFlyout.deviceGroup`)}</FormLabel>
                  <FormControl
                    type="select"
                    className="long"
                    options={this.state.deviceGroupOptions}
                    onChange={this.onGroupIdChange}
                    clearable={false}
                    searchable={true}
                    placeholder={t(`rulesFlyout.deviceGroupPlaceholder`)}
                    link={this.deviceGroupLink} />
                </FormGroup>
              </Section.Content>
            </Section.Container>

            <Section.Container collapsable={false}>
              <Section.Header>{t(`rulesFlyout.conditions`)}</Section.Header>
              <Section.Content>
                <Btn svg={svgs.plus} onClick={this.addCondition}>{t(`rulesFlyout.addCondition`)}</Btn>
              </Section.Content>
            </Section.Container>
            {
              conditionLinks.map((condition, idx) => (
                <Section.Container key={this.state.conditions[idx].key}>
                  <Section.Header>{t(`rulesFlyout.condition.condition`)} {idx + 1}</Section.Header>
                  <Section.Content>
                    <FormGroup>
                      <FormLabel isRequired="true">{t(`rulesFlyout.condition.field`)}</FormLabel>
                      <FormControl
                        type="select"
                        className="long"
                        placeholder={t(`rulesFlyout.condition.fieldPlaceholder`)}
                        link={condition.fieldLink}
                        options={this.state.fieldOptions}
                        clearable={false}
                        searchable={true} />
                    </FormGroup>
                    <FormGroup>
                      <FormLabel isRequired="true">{t(`rulesFlyout.condition.calculation`)}</FormLabel>
                      <FormControl
                        type="select"
                        className="long"
                        placeholder={t(`rulesFlyout.condition.calculationPlaceholder`)}
                        link={condition.calculationLink}
                        options={this.state.calculationOptions}
                        clearable={false}
                        searchable={false} />
                    </FormGroup>
                    <FormGroup>
                      <FormLabel isRequired="true">{t(`rulesFlyout.condition.timePeriod`)}</FormLabel>
                      <FormControl
                        type="duration"
                        className="long"
                        link={condition.durationLink} />
                    </FormGroup>
                    <FormGroup>
                      <FormLabel isRequired="true">{t(`rulesFlyout.condition.operator`)}</FormLabel>
                      <FormControl
                        type="select"
                        className="short"
                        placeholder={t(`rulesFlyout.condition.operatorPlaceholder`)}
                        link={condition.operatorLink}
                        options={this.state.operatorOptions}
                        value={this.state.operatorOptions[0].value}
                        clearable={false}
                        searchable={false} />
                    </FormGroup>
                    <FormGroup>
                      <FormLabel isRequired="true">{t(`rulesFlyout.condition.value`)}</FormLabel>
                      <FormControl
                        type="text"
                        placeholder={t(`rulesFlyout.condition.valuePlaceholder`)}
                        link={condition.valueLink} />
                    </FormGroup>
                    {
                      conditionLinks.length > 1 &&
                      <Btn className="delete-btn" svg={svgs.trash} onClick={this.deleteCondition(idx)}>Delete</Btn>
                    }
                  </Section.Content>
                </Section.Container>
              ))
            }
            <Section.Container collapsable={false}>
              <Section.Header>{t(`rulesFlyout.severityLevel`)}</Section.Header>
              <Section.Content>
                <FormGroup>
                  <Radio
                    placeholder="critical"
                    checked={this.state.severityLevel.critical}>
                    <SeverityRenderer value={'Critical'} context={{ t }} iconOnly={false} />
                  </Radio>
                  <Radio
                    placeholder="warning"
                    checked={this.state.severityLevel.warning} >
                    <SeverityRenderer value={"Warning"} context={{ t }} iconOnly={false} />
                  </Radio>
                  <Radio
                    placeholder="info"
                    checked={this.state.severityLevel.info} >
                    <SeverityRenderer value={"Info"} context={{ t }} iconOnly={false} />
                  </Radio>
                </FormGroup>
              </Section.Content>
              <Section.Header>{t(`rulesFlyout.ruleStatus`)}</Section.Header>
              <Section.Content>
                <ToggleBtn value={this.state.ruleStatus}>{this.state.ruleStatus ? t(`rulesFlyout.ruleEnabled`) : t(`rulesFlyout.ruleDisabled`)}</ToggleBtn>
              </Section.Content>
            </Section.Container>
            <Section.Container collapsable={false}>
              <Section.Content className="devices-affected">
                <div className="devices-affected-dynamic">{this.state.devicesAffected}</div>
                <div className="devices-affected-static">{t(`rulesFlyout.devicesAffected`)}</div>
              </Section.Content>
            </Section.Container>
            <BtnToolbar className="apply-cancel">
              <Btn type="submit">{t(`rulesFlyout.apply`)}</Btn>
              <Btn onClick={onClose}>{t(`rulesFlyout.cancel`)}</Btn>
            </BtnToolbar>
          </form>
        </Flyout.Content>
      </Flyout.Container>
    );
  }
}
