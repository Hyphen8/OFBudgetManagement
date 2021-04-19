/**
 * @description       : meeting template mapping modal javascript
 * @author            : daniel@hyphen8.com
 * @group             : 
 * @last modified on  : 16/03/2021
 * @last modified by  : daniel@hyphen8.com
 * Modifications Log 
 * Ver   Date         Author               Modification
 * 1.0   01-09-2021   daniel@hyphen8.com   Initial Version
**/
import { LightningElement, api, track } from 'lwc';

import getAvailableFields from '@salesforce/apex/MeetingTemplateMappingMethods.getListOfFields'
import getFieldType from '@salesforce/apex/MeetingTemplateMappingMethods.getFieldType';

import ID_FIELD from '@salesforce/schema/Meeting_Mapping_Template_Filter__c.Id';
import FIELDAPINAME_FIELD from '@salesforce/schema/Meeting_Mapping_Template_Filter__c.FieldAPIName__c';
import FIELDTYPE_FIELD from '@salesforce/schema/Meeting_Mapping_Template_Filter__c.FieldType__c';
import OPERATOR_FIELD from '@salesforce/schema/Meeting_Mapping_Template_Filter__c.Operator__c';
import VALUE_FIELD from '@salesforce/schema/Meeting_Mapping_Template_Filter__c.Value__c';
import ORDER_FIELD from '@salesforce/schema/Meeting_Mapping_Template_Filter__c.Order__c';
import ISRELATIVE_DATE_FIELD from '@salesforce/schema/Meeting_Mapping_Template_Filter__c.Is_Relative_Date__c';

import labels from './labels';


import { createRecord, updateRecord } from 'lightning/uiRecordApi';

const stringOptions = [
    { label : 'Equals', value: 'Equals'},
    { label : 'Not Equals', value: 'Not Equals'},
    { label : 'Contains', value: 'Contains'},
    { label : 'Not Contains', value: 'Not Contains'}
]

const referenceOptions = [
    { label : 'Equals', value: 'Equals'},
    { label : 'Not Equals', value: 'Not Equals'}
]

const dateOrNumberOptions = [
    { label : 'Equals', value: 'Equals'},
    { label : 'Not Equals', value: 'Not Equals'},
    { label : 'Less Than', value: 'Less Than'},
    { label : 'Greater Than', value: 'Greater Than'},
    { label : 'Less Than or Equals', value: 'Less Than or Equals'},
    { label : 'Greater Than or Equals', value: 'Greater Than or Equals'}
]

const multiPicklistOptions = [
    { label : 'Includes', value: 'Includes'}
]

export default class MeetingTemplateMappingNewModal extends LightningElement {

    showModalComponent = false;
    availableFields;
    availableOperators;
    selectedField;
    selectedFieldType;
    selectedOperator;
    enteredValue;
    displayOptions = false;
    displayWarning = false;
    saveDisabled = true;
    isBoolean = false;
    isString = false;
    isDate = false;
    isNumber = false;
    useCalendarDate = true;
    useRelativeDate = false;
    relativeDateClass;
    calendarDateClass = 'brand';

    label = labels;

    @api
    get currentOrder(){
        return this._currentOrder;
    }
    set currentOrder(value){
        this._currentOrder = value;
    }

    @api
    get recordId(){
        return this._recordId;
    }
    set recordId(value){
        this._recordId = value;
    }

    @api
    get editRecord(){
        return this._editRecord;
    }
    set editRecord(value){
        //window.console.log('edit record value > ' + JSON.stringify(value));
        if(value != null) {
            this.selectedField = value.FieldAPIName__c;
            this.displayOptions = true;
            this.selectedFieldType = value.FieldType__c;
            this.handleGetFieldTypeOptions(value.FieldType__c);
            this.selectedOperator = value.Operator__c;
            this.enteredValue = value.Value__c;
        }
        this._editRecord = value;
    }

    @api
    get filterType(){
        return this._filterType;
    }
    set filterType(value){
        this._filterType = value;
    }

    @api
    get openModal(){
        return this._openModal;
    }
    set openModal(value){
        this.showModalComponent = value;
        this._openModal = value;
    }

    connectedCallback() {
        this.handleGetAvailableField();
    }

    // handle get list of available fields
    handleGetAvailableField(){
        getAvailableFields({
            recordId: this.recordId
        })
        .then((results) => {
            this.availableFields = results;
            this.errors = undefined;  
        })
        .catch((error) => {
            this.errors = JSON.stringify(error);
            this.availableFields = undefined;
        });
    }

    // handles when a field is selected or changed
    handleSelectField(event) {
        this.selectedField = event.detail.value;
        this.handleGetFieldType(event.detail.value);
        this.validForSave(); 
    }

    // handles when an operator is selected or changed
    handleSelectOperator(event){
        this.selectedOperator = event.detail.value;
        this.validForSave(); 
    }

    // close our modal and tell the parent component
    closeModal() {
        this.handleCleanUpdate('modalclosed');
    }

    // save the modal and tell the parent component
    saveModal() {
        window.console.log('save modal filter type > ' + this.filterType);
        if(this.filterType == 'New'){
            var fields = {
                'FieldAPIName__c' : this.selectedField, 
                'FieldType__c' : this.selectedFieldType, 
                'Meeting_Mapping_Template__c' : this.recordId,
                'Operator__c' : this.selectedOperator,
                'Order__c' : this.currentOrder,
                'Value__c': this.enteredValue,
                'Is_Relative_Date__c': this.useRelativeDate
            };
            var objRecordInput = {'apiName' : 'Meeting_Mapping_Template_Filter__c', fields}; 
            createRecord(objRecordInput).then(response => {
                this.handleCleanUpdate('modalsaved');
                this.handleGetAvailableField(); 
            }).catch(error => {
                alert('Error: ' +JSON.stringify(error));
            });
        } else {
            const fields = {};
            fields[ID_FIELD.fieldApiName] = this.editRecord.Id;
            fields[FIELDAPINAME_FIELD.fieldApiName] = this.selectedField;
            fields[FIELDTYPE_FIELD.fieldApiName] = this.selectedFieldType;
            fields[OPERATOR_FIELD.fieldApiName] = this.selectedOperator;
            fields[VALUE_FIELD.fieldApiName] = this.enteredValue;
            fields[ORDER_FIELD.fieldApiName] = this.editRecord.Order__c;
            fields[ISRELATIVE_DATE_FIELD.fieldApiName] = this.useRelativeDate;
            const recordInput = { fields };
            updateRecord(recordInput).then(response => {
                this.handleCleanUpdate('modalsaved');
                this.handleGetAvailableField(); 
            }).catch(error => {
                this.errors = JSON.stringify(error);
            });
        }
    }

    // handle clean up of modal component
    handleCleanUpdate(eventName){
        this.showModalComponent = false;
        this.selectedField = null;
        this.selectedFieldType = null;
        this.selectedOperator = null;
        this.enteredValue = null;
        this.displayOptions = false;
        this.displayWarning = false;
        const selectedEvent = new CustomEvent(eventName, { detail: false });
        this.dispatchEvent(selectedEvent);
        this.validForSave(); 
    }

    // handle get select fieldType
    handleGetFieldType(fieldAPIName){
        getFieldType({
            fieldAPIName: fieldAPIName
        })
        .then((results) => {
            this.selectedFieldType = results;
            this.selectedOperator = null;
            this.validForSave(); 
            this.handleGetFieldTypeOptions(results);
            this.errors = undefined;  
        })
        .catch((error) => {
            this.errors = JSON.stringify(error);
            this.selectedFieldType = undefined;
            this.validForSave(); 
        });
    }

    // handles the switching of dates between calendar and relative
    handleDateEntryTypeChange(event){
        let eventDateType = event.target.label;
        if(eventDateType == 'Use relative date'){
            this.useCalendarDate = false;
            this.useRelativeDate = true;
            this.relativeDateClass = 'brand';
            this.calendarDateClass = null;
        } else {
            this.useRelativeDate = false;
            this.useCalendarDate = true;
            this.relativeDateClass = null;
            this.calendarDateClass = 'brand';
        }
        this.validForSave(); 
    }

    // handles getting the value entered
    handleValueChangeEvent(event){
        let eventValue = event.target.value;
        this.enteredValue = eventValue;
        this.validForSave();  
    }

    // record validity check
    validForSave(){
        if(this.enteredValue != null && this.selectedOperator != null && this.selectedField != null && this.selectedFieldType != null){
            this.saveDisabled = false;
        } else {
            this.saveDisabled = true;
        }
    }

    // handle field type operator options
    handleGetFieldTypeOptions(fieldType) {
        switch (fieldType) {
            case 'STRING':
                this.availableOperators = stringOptions;
                this.displayOptions = true;
                this.displayWarning = false;
                this.isBoolean = false;
                this.isDate = false;
                this.isString = true;
                this.isNumber = false;
                break;
            case 'REFERENCE':
                this.availableOperators = referenceOptions;
                this.displayOptions = true;
                this.displayWarning = false;
                this.isBoolean = false;
                this.isDate = false;
                this.isString = true;
                this.isNumber = false;
                break;
            case 'DATE':
                this.availableOperators = dateOrNumberOptions;
                this.displayOptions = true;
                this.displayWarning = false;
                this.isBoolean = false;
                this.isDate = true;
                this.isString = false;
                this.isNumber = false;
                break;
            case 'CURRENCY':
                this.availableOperators = dateOrNumberOptions;
                this.displayOptions = true;
                this.displayWarning = false;
                this.isBoolean = false;
                this.isDate = false;
                this.isString = false;
                this.isNumber = true;
                break;
            case 'MULTIPICKLIST':
                this.availableOperators = multiPicklistOptions;
                this.displayOptions = true;
                this.displayWarning = false;
                this.isBoolean = false;
                this.isDate = false;
                this.isString = true;
                this.isNumber = false;
                break;
            case 'TEXTAREA':
                this.selectedOperator = null;
                this.displayOptions = false;
                this.displayWarning = true;
                break;
            case 'PICKLIST':
                this.availableOperators = stringOptions;
                this.displayOptions = true;
                this.displayWarning = false;
                this.isBoolean = false;
                this.isDate = false;
                this.isString = true;
                this.isNumber = false;
                break;
            case 'BOOLEAN':
                this.availableOperators = referenceOptions;
                this.displayOptions = true;
                this.displayWarning = false;
                this.isBoolean = true;
                this.isDate = false;
                this.isString = false;
                this.isNumber = false;
                break;
            case 'EMAIL':
                this.availableOperators = stringOptions;
                this.displayOptions = true;
                this.displayWarning = false;
                this.isBoolean = false;
                this.isDate = false;
                this.isString = true;
                this.isNumber = false;
                break;
            case 'DOUBLE':
                this.availableOperators = dateOrNumberOptions;
                this.displayOptions = true;
                this.displayWarning = false;
                this.isBoolean = false;
                this.isDate = false;
                this.isString = false;
                this.isNumber = true;
                break;
            case 'LOCATION':
                this.availableOperators = null;
                this.displayOptions = false;
                this.displayWarning = true;
                break;
            case 'PERCENT':
                this.availableOperators = dateOrNumberOptions;
                this.displayOptions = true;
                this.displayWarning = false;
                this.isBoolean = false;
                this.isDate = false;
                this.isString = false;
                this.isNumber = true;
                break;
            case 'PHONE':
                this.availableOperators = stringOptions;
                this.displayOptions = true;
                this.displayWarning = false;
                this.isBoolean = false;
                this.isDate = false;
                this.isString = false;
                this.isNumber = true;
                break;
            case 'DATETIME':
                this.selectedOperator = null;
                this.displayOptions = false;
                this.displayWarning = true;
                break;
            case 'ENCRYPTEDSTRING':
                this.availableOperators = null;
                this.displayOptions = false;
                this.displayWarning = true;
                break;
            case 'TIME':
                this.availableOperators = null;
                this.displayOptions = false;
                this.displayWarning = true;
                break;
            case 'URL':
                this.availableOperators = null;
                this.displayOptions = false;
                this.displayWarning = true;
                break;
            case 'ID':
                this.availableOperators = stringOptions;
                this.displayOptions = true;
                this.displayWarning = false;
                this.isBoolean = false;
                this.isDate = false;
                this.isString = true;
                this.isNumber = false;
                break;
        }
    }
}