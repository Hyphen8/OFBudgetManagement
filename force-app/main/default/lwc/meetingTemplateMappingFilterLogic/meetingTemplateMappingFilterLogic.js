/**
 * @description       : 
 * @author            : daniel@hyphen8.com
 * @group             : 
 * @last modified on  : 16/03/2021
 * @last modified by  : daniel@hyphen8.com
 * Modifications Log 
 * Ver   Date         Author               Modification
 * 1.0   01-11-2021   daniel@hyphen8.com   Initial Version
**/
import { LightningElement, api, wire } from 'lwc';

import validateFilters from '@salesforce/apex/MeetingTemplateMappingMethods.validateFilters';
import cleanCustomLogic from '@salesforce/apex/MeetingTemplateMappingMethods.cleanCustomLogic';

import { getRecord, updateRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import FILTERTYPE_FIELD from '@salesforce/schema/Meeting_Mapping_Template__c.Filter_Logic__c';
import FILTERLOGIC_FIELD from '@salesforce/schema/Meeting_Mapping_Template__c.Custom_Filter_Logic__c';
import VALID_FIELD from '@salesforce/schema/Meeting_Mapping_Template__c.IsValid__c';
import ID_FIELD from '@salesforce/schema/Meeting_Mapping_Template__c.Id';

import labels from './labels';

export default class MeetingTemplateMappingFilterLogic extends LightningElement {

    displayCustomField = false;
    displayValidateButton = false;
    filterType;
    customFilterLogic;
    displaySaveButton = false;
    displayError = false;
    validationError;
    label = labels;
    customLogicValue;

    @api
    get recordId(){
        return this._recordId;
    }
    set recordId(value){
        this._recordId = value;
    }

    // wire event to get our meeting template
    @wire(getRecord, { recordId: '$recordId', fields: ['Meeting_Mapping_Template__c.Filter_Logic__c', 'Meeting_Mapping_Template__c.Custom_Filter_Logic__c'] })
    wiredMeetingTemplate({ error, data }) {
        if (data) {
            let filterLogic = data.fields.Filter_Logic__c.value;
            this.customLogicValue = data.fields.Custom_Filter_Logic__c.value;

            if(filterLogic == 'CUSTOM'){
                this.displayCustomField = true;
            } else {
                this.displayCustomField = false;
            }
            this.error = undefined;
        } else if (error) {
            this.error = error;
        }
    }

    // perform a validation on the logic
    validateLogic(){
        console.log('check values');
        let filterLogic;
        let customFilterLogic;
        try {
            filterLogic = this.template.querySelector("[data-field='Filter_Logic__c']").value;
        } catch(err) {
            console.error('filter logic error message > ' + JSON.stringify(err));
        }

        try {
            customFilterLogic = this.template.querySelector("[data-field='Custom_Filter_Logic__c']").value;
        } catch(err) {
            console.error('custom filter logic error message > ' + JSON.stringify(err));
        }
        
        validateFilters({
            recordId: this._recordId,
            filterType: filterLogic,
            customLogic: customFilterLogic
        })
        .then((results) => {
            if(results == 'Success'){
                this.displaySaveButton = true;
                this.displayError = false;
                this.validationError = null;
                this.displayValidateButton = false;
                this.showToast('Success', 'Filter logic is valid', 'success');
            } else {
                this.displaySaveButton = false;
                this.validationError = JSON.stringify(results);
                this.displayError = true;
                this.showToast('Error', this.validationError, 'error');
            }
            this.errors = undefined;  
        })
        .catch((error) => {
            console.error('Error validating > ' + JSON.stringify(error));
            this.errors = JSON.stringify(error);
            this.validationError = JSON.stringify(error);
            this.displayError = true;
            this.showToast('Error validating record',error.body.message, 'error');
        });
    }

    // handle when the filter logic is changed
    handleLogicChange(event){
        let logicType = event.detail.value;
        this.filterType = logicType;
        if(logicType == 'CUSTOM'){
            this.displayCustomField = true;
            this.displayValidateButton = true;
        } else {
            this.displayCustomField = false;
            this.displayValidateButton = true;
        }
    }

    // handle when the custom logic is changes
    handleCustomLogicChange(event){
        let customLogic = event.detail.value;
        this.customFilterLogic = customLogic;
        this.displayValidateButton = true;
    }

    // handle the save process
    saveAndEnable(event){
        
        const fields = {};
        
        try {
            fields[FILTERTYPE_FIELD.fieldApiName] = this.template.querySelector("[data-field='Filter_Logic__c']").value;
        } catch(err) {
            console.error('error message > ' + JSON.stringify(err));
        }

        try {
            this.handleCleanCustomLogic();
            fields[FILTERLOGIC_FIELD.fieldApiName] = this.customLogicValue;
        } catch(err) {
            console.error('error message > ' + JSON.stringify(err));
        }

        
        fields[ID_FIELD.fieldApiName] = this.recordId;
        fields[VALID_FIELD.fieldApiName] = true;

        const recordInput = { fields };

        updateRecord(recordInput)
        .then(() => {
            this.showToast('Success', 'Filter logic saved', 'success');
            return refreshApex(this.wiredMeetingTemplate);
        })
        .catch(error => {
            this.showToast('Error creating record',error.body.message, 'error');
        });
    }

    // method to clean up our custom logic
    handleCleanCustomLogic() {
        cleanCustomLogic({
            customLogic: this.template.querySelector("[data-field='Custom_Filter_Logic__c']").value
        })
        .then((results) => {
            this.customLogicValue = results;
            this.errors = undefined;
        })
        .catch((error) => {
            console.error('error handleCleanCustomLogic > ' + JSON.stringify(error));
            this.errors = JSON.stringify(error);
       });
    }

    // generic dispatch toast event
    // requires "import { ShowToastEvent } from 'lightning/platformShowToastEvent';" above your export in the JS File
    // toastTitle is the title of your toast
    // toastMessage is the message you want to output
    // toastVariant can be error, warning, success, info which controls the colour of the toast
    showToast(toastTitle, toastMessage, toastVariant){
       this.dispatchEvent(new ShowToastEvent({title: toastTitle, message: toastMessage, variant: toastVariant}));
    }
}