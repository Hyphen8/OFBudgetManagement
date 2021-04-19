/**
 * @description       : 
 * @author            : daniel@hyphen8.com
 * @last modified on  : 17/03/2021
 * @last modified by  : daniel@hyphen8.com
 * Modifications Log 
 * Ver   Date         Author               Modification
 * 1.0   21/02/2021   daniel@hyphen8.com   Initial Version
**/
import { LightningElement, api, wire } from 'lwc';

import { getRecord, updateRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import ID_FIELD from '@salesforce/schema/Meeting_Mapping_Template__c.Id';
import COMPLETE_FIELD from '@salesforce/schema/Meeting_Mapping_Template__c.Use_Default_Completion_Process__c';

import labels from './labels';

export default class MeetingTemplateCompletionComponent extends LightningElement {

    @api
    get recordId(){
        return this._recordId;
    }
    set recordId(value){
        this._recordId = value;
    }

    useDefaultCompleteProcess;
    errors;
    label = labels;

    @wire(getRecord, { recordId: '$recordId', fields: ['Meeting_Mapping_Template__c.Use_Default_Completion_Process__c'] })
    wiredMeetingTemplate({ error, data }) {
        if (data) {
            this.useDefaultCompleteProcess = data.fields.Use_Default_Completion_Process__c.value;
            this.error = undefined;
        } else if (error) {
            this.error = error;
        }
    }

    handleToggleChange(event){
        const fields = {};
        fields[ID_FIELD.fieldApiName] = this.recordId;
        fields[COMPLETE_FIELD.fieldApiName] = event.detail.checked;
        const recordInput = { fields };
        updateRecord(recordInput)
            .then(() => {
                return refreshApex(this.wiredMeetingTemplate);
            })
            .catch(error => {
                this.errors = error.body.message;
            });
        }
}