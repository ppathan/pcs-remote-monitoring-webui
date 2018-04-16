// Copyright (c) Microsoft. All rights reserved.

import React from 'react';
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
import {
  Validator,
  svgs,
  LinkedComponent
} from 'utilities';
import Flyout from 'components/shared/flyout';
import Config from 'app.config';
import './ruleEditor.css';
import { IoTHubManagerService } from 'services';

const Section = Flyout.Section;
const ruleNameValidator = (new Validator()).check(Validator.notEmpty, 'Name is required');
const deviceGroupValidator = (new Validator()).check(Validator.notEmpty, 'Device group is required');
const tPath = "rules.flyouts.ruleEditor.";
const severityLevels = ["critical", "warning", "info"];
const calculations = ["average", "instant"];
var deviceGroupOptions = [];
var fieldOptions = [];
var calculationOptions = [];
var operatorOptions = [...(Config.OPERATOR_OPTIONS)];
// A counter for creating unique keys per new condition
let conditionKey = 0;

// Creates a state object for a condition
const newCondition = () => ({
  calculation: "",
  duration: "00:00:00",
  operator: Config.OPERATOR_OPTIONS[0].value,
  value: "",
  key: conditionKey++ // Used by react to track the rendered elements
});

// A state object for a new rule
const newRule = {
  name: '',
  description: '',
  deviceGroupID: '',
  conditions: [newCondition()], // Start with one condition
  severityLevel: severityLevels[0],
  ruleStatus: true,
  devicesAffected: 0
}

export class RuleEditor extends LinkedComponent {

  constructor(props) {
    super(props);

    const { t, deviceGroups = [], rule } = props;
    this.state = rule ? { ...rule } : { ...newRule };

    deviceGroupOptions = deviceGroups.map(this.toSelectOption);

    calculationOptions = [
      { value: calculations[0], label: t(`${tPath}calculationAverage`) },
      { value: calculations[1], label: t(`${tPath}calculationInstant`) }
    ];

    // State links
    this.ruleNameLink = this.linkTo("name").withValidator(ruleNameValidator);
    this.descriptionLink = this.linkTo("description");
    this.deviceGroupLink = this.linkTo("deviceGroupID").withValidator(deviceGroupValidator);
    this.conditionsLink = this.linkTo("conditions");
  }

  componentWillUnmount() {
    if (this.subscription) this.subscription.unsubscribe();
  }

  toSelectOption = ({ id, displayName }) => ({ value: id, label: displayName });

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
              fieldOptions = this.getConditionFields(groupDevices);
              this.setState({
                devicesAffected: groupDevices.length
              });
            },
            error => this.setState({ error })
          );
      }
    });
  }

  getConditionFields(devices) {
    const conditions = new Set(); // Using a set to avoid searching the array multiple times in the every
    devices.forEach(({ telemetry = {} }) => {
      Object.values(telemetry).forEach(({ messageSchema: { fields } }) => {
        Object.keys(fields).forEach((field) => {
          if (field.indexOf('_unit') === -1) conditions.add(field);
        })
      })
    })
    return [...conditions.values()].map(field => ({ label: field, value: field }));
  }

  onSeverityChange = (proxy) => {
    this.setState({
      severityLevel: proxy.target.value
    });
  }

  render() {
    const { onClose, t } = this.props;
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
          <Flyout.Title>{t(`${tPath}newRule`)}</Flyout.Title>
          <Flyout.CloseBtn onClick={onClose} />
        </Flyout.Header>
        <Flyout.Content className="new-rule-flyout-container">
          <form onSubmit={this.createRule}>
            <Section.Container className="rule-property-container">
              <Section.Content>
                <FormGroup>
                  <FormLabel isRequired="true">{t(`${tPath}ruleName`)}</FormLabel>
                  <FormControl
                    type="text"
                    className="long"
                    placeholder={t(`${tPath}namePlaceholder`)}
                    link={this.ruleNameLink} />
                </FormGroup>
                <FormGroup>
                  <FormLabel>{t(`${tPath}description`)}</FormLabel>
                  <FormControl
                    type="textarea"
                    placeholder={t(`${tPath}descriptionPlaceholder`)}
                    link={this.descriptionLink} />
                </FormGroup>
                <FormGroup>
                  <FormLabel isRequired="true">{t(`${tPath}deviceGroup`)}</FormLabel>
                  <FormControl
                    type="select"
                    className="long"
                    options={deviceGroupOptions}
                    onChange={this.onGroupIdChange}
                    clearable={false}
                    searchable={true}
                    placeholder={t(`${tPath}deviceGroupPlaceholder`)}
                    link={this.deviceGroupLink} />
                </FormGroup>
              </Section.Content>
            </Section.Container>

            <Section.Container collapsable={false}>
              <Section.Header>{t(`${tPath}conditions`)}</Section.Header>
              <Section.Content>
                <Btn svg={svgs.plus} onClick={this.addCondition}>{t(`${tPath}addCondition`)}</Btn>
              </Section.Content>
            </Section.Container>
            {
              conditionLinks.map((condition, idx) => (
                <Section.Container key={this.state.conditions[idx].key} closed="true">
                  <Section.Header>{t(`${tPath}condition.condition`)} {idx + 1}</Section.Header>
                  <Section.Content>
                    <FormGroup>
                      <FormLabel isRequired="true">{t(`${tPath}condition.field`)}</FormLabel>
                      <FormControl
                        type="select"
                        className="long"
                        placeholder={t(`${tPath}condition.fieldPlaceholder`)}
                        link={condition.fieldLink}
                        options={fieldOptions}
                        clearable={false}
                        searchable={true} />
                    </FormGroup>
                    <FormGroup>
                      <FormLabel isRequired="true">{t(`${tPath}condition.calculation`)}</FormLabel>
                      <FormControl
                        type="select"
                        className="long"
                        placeholder={t(`${tPath}condition.calculationPlaceholder`)}
                        link={condition.calculationLink}
                        options={calculationOptions}
                        onChange={this.onCalculationChange}
                        clearable={false}
                        searchable={false} />
                    </FormGroup>
                    {this.state.conditions[idx].calculation.value === calculations[0] &&
                      <FormGroup>
                        <FormLabel isRequired="true">{t(`${tPath}condition.timePeriod`)}</FormLabel>
                        <FormControl
                          type="duration"
                          link={condition.durationLink} />
                      </FormGroup>
                    }
                    <FormGroup>
                      <FormLabel isRequired="true">{t(`${tPath}condition.operator`)}</FormLabel>
                      <FormControl
                        type="select"
                        className="short"
                        placeholder={t(`${tPath}condition.operatorPlaceholder`)}
                        link={condition.operatorLink}
                        options={operatorOptions}
                        clearable={false}
                        searchable={false} />
                    </FormGroup>
                    <FormGroup>
                      <FormLabel isRequired="true">{t(`${tPath}condition.value`)}</FormLabel>
                      <FormControl
                        type="text"
                        placeholder={t(`${tPath}condition.valuePlaceholder`)}
                        link={condition.valueLink} />
                    </FormGroup>
                    {
                      conditionLinks.length > 1 &&
                      <Btn className="padded-top flyout-btns" svg={svgs.trash} onClick={this.deleteCondition(idx)}>{t(`${tPath}delete`)}</Btn>
                    }
                  </Section.Content>
                </Section.Container>
              ))
            }
            <Section.Container collapsable={false}>
              <Section.Content>
                <FormGroup className="padded-top">
                  <FormLabel>{t(`${tPath}severityLevel`)}</FormLabel>
                  <Radio
                    onChange={this.onSeverityChange}
                    value={severityLevels[0]}
                    checked={this.state.severityLevel === severityLevels[0]}>
                    <SeverityRenderer value={severityLevels[0]} context={{ t }} iconOnly={false} />
                  </Radio>
                  <Radio
                    onChange={this.onSeverityChange}
                    value={severityLevels[1]}
                    checked={this.state.severityLevel === severityLevels[1]} >
                    <SeverityRenderer value={severityLevels[1]} context={{ t }} iconOnly={false} />
                  </Radio>
                  <Radio
                    onChange={this.onSeverityChange}
                    value={severityLevels[2]}
                    checked={this.state.severityLevel === severityLevels[2]} >
                    <SeverityRenderer value={severityLevels[2]} context={{ t }} iconOnly={false} />
                  </Radio>
                </FormGroup>
              </Section.Content>
              <Section.Content>
                <FormGroup>
                  <FormLabel>{t(`${tPath}ruleStatus`)}</FormLabel>
                  <ToggleBtn value={this.state.ruleStatus}>{this.state.ruleStatus ? t(`${tPath}ruleEnabled`) : t(`${tPath}ruleDisabled`)}</ToggleBtn>
                </FormGroup>
              </Section.Content>
            </Section.Container>
            <Section.Container collapsable={false}>
              <Section.Content className="devices-affected">
                <div className="devices-affected-dynamic">{this.state.devicesAffected}</div>
                <div className="devices-affected-static">{t(`${tPath}devicesAffected`)}</div>
              </Section.Content>
            </Section.Container>
            <BtnToolbar className="apply-cancel">
              <Btn type="submit">{t(`${tPath}apply`)}</Btn>
              <Btn onClick={onClose}>{t(`${tPath}cancel`)}</Btn>
            </BtnToolbar>
          </form>
        </Flyout.Content>
      </Flyout.Container>
    );
  }
}
