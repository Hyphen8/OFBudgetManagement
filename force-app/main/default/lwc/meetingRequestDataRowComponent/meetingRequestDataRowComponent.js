/**
 * @description       : 
 * @author            : daniel@hyphen8.com
 * @last modified on  : 15/03/2021
 * @last modified by  : daniel@hyphen8.com
 * Modifications Log 
 * Ver   Date         Author               Modification
 * 1.0   26/02/2021   daniel@hyphen8.com   Initial Version
**/
import { LightningElement, api } from 'lwc';

import { deleteRecord, updateRecord } from 'lightning/uiRecordApi';
import { NavigationMixin } from 'lightning/navigation';
import STATUS_FIELD from '@salesforce/schema/Meeting_Request__c.Status__c';
import AWARDED_FIELD from '@salesforce/schema/Meeting_Request__c.Awarded_Amount__c';
import ID_FIELD from '@salesforce/schema/Meeting_Request__c.Id';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import labels from './labels';

export default class MeetingRequestDataRowComponent extends NavigationMixin(LightningElement) {

    @api request;
    @api template;
    @api statusOptions;
    checkStatus = false;
    @api 
    get checked(){
        return this._checked;
    };
    set checked(value){
        this._checked = value;
        if(value){
            this.checkStatus = true;
        } else {
            this.checkStatus = false;
        }
    }

    label = labels;

    // delete record from meeting
    deleteMeetingRequest(event){
        let deleteRecordId = event.target.dataset.targetId;
        deleteRecord(deleteRecordId)
        .then(() => {
            this.dispatchEventFunction('deleterow', true);
        })
        .catch(error => {
            console.error(error);
        });
    }

    // view funding request actions
    viewFundingRequest(event){
        let frID = event.target.dataset.targetId;
        this[NavigationMixin.GenerateUrl]({
            type: 'standard__recordPage',
            attributes: {
                recordId: frID,
                objectApiName: 'outFunds__Funding_Request__c',
                actionName: 'view',
            },
        }).then(url => {
            window.open(url, "_blank");
        });
    }

    // view and add comments modal
    viewAddComments(event){
        let meetingRequestID = event.target.dataset.targetId;
        this.dispatchEventFunction('opencomments', meetingRequestID);
    }

    // each time a row is selected we want to store it for processing
    rowSelection(event){
        let rowID = event.target.dataset.targetId;
        let rowCheckedStatus = event.target.checked;
        if(rowCheckedStatus){
            this.checked = true;
            this.dispatchEventFunction('rowselected', rowID); 
            
        } else {
            this.checked = false;
            this.dispatchEventFunction('rowdeselected', rowID); 
        }
    }

    // handle individual status changes
    handleStatusChange(event){
        let setStatus = event.detail.value;
        let meetingRecordID = event.target.dataset.targetId;
        let meetingRecordRecommendAmount = event.target.dataset.recommended;
        const fields = {};
        fields[ID_FIELD.fieldApiName] = meetingRecordID;
        fields[STATUS_FIELD.fieldApiName] = setStatus;
        if(this.template.Awarded_Status__c != setStatus){
            fields[AWARDED_FIELD.fieldApiName] = 0.00;
        } else if (this.template.Awarded_Status__c == setStatus && this.template.Awarded_Amount_default_Recommended__c) {
            fields[AWARDED_FIELD.fieldApiName] = meetingRecordRecommendAmount;
        }
        const recordInput = { fields };
        this.handleIndividualRecordUpdate(recordInput, 'Status updated');
    }

    // on commit function for the awarded amount changes
    handleAwardedCommit(event){
        let meetingRecordID = event.target.dataset.targetId;
        let currentStatus = event.target.dataset.currentstatus;
        let enteredAmount = event.target.value;
        const fields = {};
        fields[ID_FIELD.fieldApiName] = meetingRecordID;
        fields[AWARDED_FIELD.fieldApiName] = enteredAmount;
        const recordInput = { fields };
        this.handleIndividualRecordUpdate(recordInput, 'Amount value set');
    }

    // shared update process
    handleIndividualRecordUpdate(recordInput, updateMessage){
        updateRecord(recordInput)
        .then(() => {
            this.showToast('Success',updateMessage, 'success');
        })
        .catch(error => {
            console.error(JSON.stringify(error));
            let errorMessage = JSON.stringify(error);
            this.showToast('Error setting status', errorMessage, 'error');
        });
    }


    // generic dispatch event function
    // eventName should always be in lowercase and you need a oneventName to receive it
    // eventDetail can be anything you want detail: contactID
    dispatchEventFunction(eventName, eventDetail) {
        this.dispatchEvent(new CustomEvent(eventName, { detail: eventDetail })); 
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