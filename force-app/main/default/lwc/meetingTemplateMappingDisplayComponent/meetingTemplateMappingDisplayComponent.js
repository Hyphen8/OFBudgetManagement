/**
 * @description       : js file for component to support with the setup of the display on a meeting
 * @author            : daniel@hyphen8.com
 * @group             : 
 * @last modified on  : 26/02/2021
 * @last modified by  : daniel@hyphen8.com
 * Modifications Log 
 * Ver   Date         Author               Modification
 * 1.0   01-11-2021   daniel@hyphen8.com   Initial Version
**/
import { LightningElement, api, wire } from 'lwc';

import getAvailableFieldSets from '@salesforce/apex/MeetingTemplateMappingMethods.getAvailableFieldSets';
import getFieldsInFieldSet from '@salesforce/apex/MeetingTemplateMappingMethods.readFieldSet';
import { getRecord, updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import CONFIGURED_FIELD from '@salesforce/schema/Meeting_Mapping_Template__c.FieldSetConfigured__c';
import FIELDSETAPINAME_FIELD from '@salesforce/schema/Meeting_Mapping_Template__c.FieldSetApiName__c';
import ID_FIELD from '@salesforce/schema/Meeting_Mapping_Template__c.Id';
import labels from './labels';

export default class MeetingTemplateMappingDisplayComponent extends LightningElement {

    displayFieldSetSelection = false;
    displaySaveButton = false;
    fieldSets;
    errors;
    selectedFieldSetAPI;
    fieldsInFieldSet;
    label = labels;

    @api
    get recordId() {
        return this._recordId;
    }
    set recordId(value) {
        this._recordId = value;
    }

    // wire event to get our meeting template record
    @wire(getRecord, { recordId: '$recordId', fields: ['Meeting_Mapping_Template__c.FieldSetApiName__c'] })
    wiredMeetingTemplate({ error, data }) {
        if (data) {
            let fieldSetAPIName = data.fields.FieldSetApiName__c.value;
            this.selectedFieldSetAPIName = fieldSetAPIName;
            if(fieldSetAPIName != null || fieldSetAPIName != undefined){
                this.handleGetAvailableFieldSets();
                this.handlegetFieldsInFieldSet(fieldSetAPIName);
            } else {
                this.handleGetAvailableFieldSets();
            }
            this.error = undefined;
        } else if (error) {
            this.error = error;
        }
    }

    saveAndEnable(event){
        const fields = {};
        fields[ID_FIELD.fieldApiName] = this._recordId;
        fields[CONFIGURED_FIELD.fieldApiName] = true;
        fields[FIELDSETAPINAME_FIELD.fieldApiName] = this.selectedFieldSetAPI;

        const recordInput = { fields };

        updateRecord(recordInput)
        .then(() => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: labels.configureMeetingSaveToastMessage,
                    variant: 'success'
                })
            );
        })
        .catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: labels.configureMeetingErrorToastMessage,
                    message: error.body.message,
                    variant: 'error'
                })
            );
        });
    }

    handleAPINameChange(event){
        if(event.detail.value != null){
            this.displaySaveButton = true;
            this.selectedFieldSetAPI = event.detail.value;
            this.handlegetFieldsInFieldSet(event.detail.value);
        } else {
            this.displaySaveButton = false;
            this.fieldsInFieldSet = null;
        }
    }

    handleGetAvailableFieldSets(){
        getAvailableFieldSets({})
        .then((results) => {
            this.fieldSets = results;
            if(results.length > 0){
                this.displayFieldSetSelection = true;
            } else {
                this.displayFieldSetSelection = false;
            }
            this.errors = undefined;  
        })
        .catch((error) => {
            this.errors = JSON.stringify(error);
            this.fieldSets = undefined;
            this.displayFieldSetSelection = false;
        });
    }

    handlegetFieldsInFieldSet(fieldSetName) {
        getFieldsInFieldSet({
            fieldSetName: fieldSetName
        })
        .then((results) => {
            this.fieldsInFieldSet = results;
            this.errors = undefined;
        })
        .catch((error) => {
            console.error('error handlegetFieldsInFieldSet > ' + JSON.stringify(error));
            this.errors = JSON.stringify(error);
       });
    }
}