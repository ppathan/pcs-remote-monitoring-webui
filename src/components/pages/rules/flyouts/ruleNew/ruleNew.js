// Copyright (c) Microsoft. All rights reserved.

import React from 'react';
import {
  Btn,
  BtnToolbar,
  FormControl,
  FormGroup,
  FormLabel,
  Radio,
  Svg,
  ToggleBtn
} from 'components/shared';
import { SeverityRenderer } from 'components/shared/cellRenderers';
import { Validator, svgs, LinkedComponent } from 'utilities';
import Flyout from 'components/shared/flyout';

import './ruleNew.css';

const Section = Flyout.Section;

const ruleNameValidator = (new Validator()).check(Validator.notEmpty, 'Name is required');

// A counter for creating unique keys per new condition
let conditionKey = 0;

// Creates a state object for a condition
const newCondition = () => ({
  field: '',
  calculation: '',
  timePeriod: {
    hours: '',
    minutes: '',
    seconds: ''
  },
  operator: '',
  value: '',
  key: conditionKey++ // Used by react to track the rendered elements
});

// TODO: Translate all the hard coded strings
export class RuleNew extends LinkedComponent {

  constructor(props) {
    super(props);

    this.state = {
      name: '',
      description: '',
      deviceGroup: '',
      conditions: [newCondition()], // Start with one condition
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
    this.deviceGroupLink = this.linkTo('deviceGroup');
    this.conditionsLink = this.linkTo('conditions');
  }

  addCondition = () => this.conditions.set([...this.conditions.value, newCondition()]);

  deleteCondition = (index) =>
    () => this.conditions.set(this.conditions.value.filter((_, idx) => index !== idx));

  createRule = (event) => {
    event.preventDefault();
    console.log('TODO: Handle the form submission');
  }

  render() {
    const { onClose, t } = this.props;
    const name = this.ruleNameLink.forkTo('name')
        .withValidator(ruleNameValidator);
    // Create the state link for the dynamic form elements
    const conditionLinks = this.conditionsLink.getLinkedChildren(conditionLink => {
      const value = conditionLink.forkTo('value');
      return { value };
    });

    return (
      <Flyout.Container>
        <Flyout.Header>
          <Flyout.Title>New Rule</Flyout.Title>
          <Flyout.CloseBtn onClick={onClose} />
        </Flyout.Header>
        <Flyout.Content className="new-rule-flyout-container">
          <form onSubmit={this.createRule}>
            <Section.Container className="rule-property-container">
              <Section.Content>
                <FormGroup>
                  <FormLabel isRequired="true">Rule name</FormLabel>
                  <FormControl
                    type="text"
                    className="long"
                    placeholder="Rule name"
                    link={name} />
                </FormGroup>
                <FormGroup>
                  <FormLabel>Description</FormLabel>
                  <FormControl
                    type="textarea"
                    placeholder="Description"
                    link={this.descriptionLink} />
                </FormGroup>
                <FormGroup>
                  <FormLabel isRequired="true">Device Group</FormLabel>
                  <FormControl
                    type="select"
                    className="long"
                    placeholder="DeviceGroup"
                    link={this.deviceGroupLink} />
                </FormGroup>
              </Section.Content>
            </Section.Container>

            <Section.Container collapsable={false}>
              <Section.Header>Conditions</Section.Header>
              <Section.Content>
                <Btn svg={svgs.plus} onClick={this.addCondition}>Add condition</Btn>
              </Section.Content>
            </Section.Container>
            {
              conditionLinks.map((condition, idx) => (
                <Section.Container key={this.state.conditions[idx].key}>
                  <Section.Header>Condition {idx + 1}</Section.Header>
                  <Section.Content>
                    {
                      conditionLinks.length > 1 &&
                      <Btn svg={svgs.trash} onClick={this.deleteCondition(idx)}>Delete</Btn>
                    }
                    <FormGroup>
                      <FormLabel isRequired="true">Field</FormLabel>
                      <FormControl
                        type="select"
                        className="long"
                        placeholder="Select field"
                        link={condition.field} />
                    </FormGroup>
                    <FormGroup>
                      <FormLabel isRequired="true">Calculation</FormLabel>
                      <FormControl
                        type="select"
                        className="long"
                        placeholder="Select"
                        link={condition.calculation} />
                    </FormGroup>
                    <FormGroup>
                      <FormLabel isRequired="true">Time Period</FormLabel>
                      <FormControl
                        type="duration"
                        className="long"
                        placeholder="Select"
                        link={condition.timePeriod} />
                    </FormGroup>
                    <FormGroup>
                      <FormLabel isRequired="true">Operator</FormLabel>
                      <FormControl
                        type="select"
                        className="short"
                        placeholder="Select operator"
                        link={condition.operator} />
                    </FormGroup>
                    <FormGroup>
                      <FormLabel isRequired="true">Value</FormLabel>
                      <FormControl
                        type="text"
                        placeholder="Enter value"
                        link={condition.value} />
                    </FormGroup>
                  </Section.Content>
                </Section.Container>
              ))
            }
            <Section.Container collapsable={false}>
              <Section.Header>Severity level</Section.Header>
              <Section.Content>
                <FormGroup>
                  <Radio
                    placeholder="critical"
                    checked={this.state.severityLevel.critical}>
                    <SeverityRenderer value="Critical" context={{ t }} iconOnly={false} />
                  </Radio>
                  <Radio
                    placeholder="warning"
                    checked={this.state.severityLevel.warning} >
                    <SeverityRenderer value="Warning" context={{ t }} iconOnly={false} />
                  </Radio>
                  <Radio
                    placeholder="info"
                    checked={this.state.severityLevel.info} >
                    <SeverityRenderer value="Info" context={{ t }} iconOnly={false} />
                  </Radio>
                </FormGroup>
              </Section.Content>
              <Section.Header>Rule status</Section.Header>
              <Section.Content>
                <ToggleBtn value={this.state.ruleStatus}>Enabled</ToggleBtn>
              </Section.Content>
            </Section.Container>
            <Section.Container collapsable={false}>
              <Section.Content className="devices-affected">
                <div className="devices-affected-dynamic">{this.state.devicesAffected}</div>
                <div className="devices-affected-static">devices affected by this rule</div>
              </Section.Content>
            </Section.Container>
            <BtnToolbar className="apply-cancel">
              <Btn type="submit">Apply</Btn>
              <Btn onClick={onClose}>Cancel</Btn>
            </BtnToolbar>
          </form>
        </Flyout.Content>
      </Flyout.Container>
    );
  }
}
