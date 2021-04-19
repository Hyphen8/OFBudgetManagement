/**
 * @description       : 
 * @author            : daniel@hyphen8.com
 * @last modified on  : 01/03/2021
 * @last modified by  : daniel@hyphen8.com
 * Modifications Log 
 * Ver   Date         Author               Modification
 * 1.0   21/02/2021   daniel@hyphen8.com   Initial Version
**/
import { LightningElement, api, wire } from 'lwc';

import getStatusFieldValues from '@salesforce/apex/MeetingTemplateMappingMethods.getStatusPickListValues';
import saveSelectedStatus from '@salesforce/apex/MeetingTemplateMappingMethods.saveSelectedStatus';
import getActionConfiguration from '@salesforce/apex/MeetingTemplateMappingMethods.getActionConfiguration';
import { getRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import labels from './labels';

export default class MeetingTemplateActionComponent extends LightningElement {

    @api
    get recordId(){
        return this._recordId;
    }
    set recordId(value){
        this._recordId = value;
    }

    options;
    selected;
    defaultSelectedOptions;
    errors;
    allowSaveSelected = false;
    defaultStatus;
    awardedStatus;
    label = labels;

    configurationOptions;
    configurationValue;    

    connectedCallback(){
        this.handlegetStatusFieldValues();
        this.handlegetActionConfiguration();
    }

    @wire(getRecord, { recordId: '$recordId', fields: ['Meeting_Mapping_Template__c.Default_Status__c','Meeting_Mapping_Template__c.Awarded_Status__c'] })
    wiredMeetingTemplate({ error, data }) {
        if (data) {
            this.defaultStatus = data.fields.Default_Status__c.value;
            this.awardedStatus = data.fields.Awarded_Status__c.value;
            this.error = undefined;
        } else if (error) {
            this.error = error;
        }
    }

    

    // pull in a list of status values
    handlegetStatusFieldValues() {
        getStatusFieldValues({
            recordId: this.recordId
        })
        .then((results) => {
            var arrayLength = results.length;
            const items = results;
            const selectedItems = [];
            const availableItems = [];
            const statusDefaultOptions = [];
            for (var i = 0; i < arrayLength; i++) {
                const status = items[i];
                availableItems.push(status);
                if(status.selected){
                    selectedItems.push(status.value);
                    statusDefaultOptions.push(status);
                }
            }

            this.options = availableItems;
            this.selected = selectedItems;
            this.defaultSelectedOptions = statusDefaultOptions;
            this.errors = undefined;

        })
        .catch((error) => {
            console.error('error handlegetStatusFieldValues > ' + JSON.stringify(error));
            this.errors = JSON.stringify(error);
        });
    }

    // handle when a selected item from the combo-list is changed
    handleChange(event){
        console.log(JSON.stringify(event.detail));
        this.selected = event.detail.value;
        
        let detailItems = event.detail.value;
        const defaultOptions = [];
        console.log('detailItems > ' + detailItems);
        for( var i = 0; i < detailItems.length; i++){
            const currentValue = detailItems[i];
            console.log('value > ' + currentValue);
            defaultOptions.push({label: currentValue, value: currentValue});
        }
        
        this.defaultSelectedOptions = defaultOptions;

    }

    // handle status selected change
    handleSaveOptions() {
        saveSelectedStatus({
           recordId: this.recordId,
           statuses: this.selected,
           configurationOptions: this.configurationValue,
           defaultStatus: this.defaultStatus,
           awardedStatus: this.awardedStatus
        })
        .then((results) => {
            this.showToast('Actions saved','Actions saved successfully', 'success');
            this.handlegetStatusFieldValues();
            this.handlegetActionConfiguration();
            this.errors = undefined;
        })
        .catch((error) => {
            console.error('error handleSaveOptions > ' + JSON.stringify(error));
            this.errors = JSON.stringify(error);
            this.showToast('Error encountered',JSON.stringify(error), 'error');
       });
    }

    handleConfigurationChange(event){
        this.configurationValue = event.detail.value;
    }

    handleDefaultStatusChange(event){
        this.defaultStatus = event.detail.value;
    }

    handleAwardedStatusChange(event){
        this.awardedStatus = event.detail.value;
    }

    handlegetActionConfiguration() {
        getActionConfiguration({
           recordId: this.recordId
        })
        .then((results) => {
            var arrayLength = results.length;
            const items = results;
            const selectedConfigurationOptions = [];
            const availableOptions = [];
            for (var i = 0; i < arrayLength; i++) {
                const configurationItems = items[i];
                availableOptions.push(configurationItems);
                if(configurationItems.selected){
                    selectedConfigurationOptions.push(configurationItems.value);
                }
            }

            this.configurationOptions = availableOptions;
            this.configurationValue = selectedConfigurationOptions;
            this.errors = undefined;
        })
        .catch((error) => {
            console.error('error handlegetActionConfiguration > ' + JSON.stringify(error));
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