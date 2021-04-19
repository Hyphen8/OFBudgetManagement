/**
 * @description       : 
 * @author            : daniel@hyphen8.com
 * @last modified on  : 01/03/2021
 * @last modified by  : daniel@hyphen8.com
 * Modifications Log 
 * Ver   Date         Author               Modification
 * 1.0   22/02/2021   daniel@hyphen8.com   Initial Version
**/
import { LightningElement, api, wire } from 'lwc';

import { getRecord } from 'lightning/uiRecordApi';

import { subscribe, unsubscribe, onError } from 'lightning/empApi';

import startComplete from '@salesforce/apex/meetingMappingHelper.startComplete';

import labels from './labels';

export default class MeetingCompleteComponent extends LightningElement {
    @api recordId;
    errors;
    displayErrorMessage = false;
    completionProcessComplete = false;
    displayProcessBar = false;
    displayStartingMessage = false;
    isLoaded = true;
    progressPercentValue = 0;
    numberOfItems = 0;
    numberProcessed = 0;
    disableComplete = false;
    label = labels;

    channelName = '/event/Meeting_Event__e';

    subscription = {};

    // Initializes the component
    connectedCallback() {       
        // Register error listener       
        this.registerErrorListener();      
    }

    // Handles subscribe button click
    handleSubscribe() {

        let self = this;
        // Callback invoked whenever a new event message is received
        const messageCallback = function(response) {
            
            let currentResponse = response.data.payload;
            console.log(JSON.stringify(currentResponse));
            if(currentResponse.MeetingID__c == self.recordId){
                if(currentResponse.Job_Status__c == 'Completed' && currentResponse.Job_Type__c == 'Complete'){
                    self.displayStartingMessage = false;
                    self.displayProcessBar = false;
                    self.displayStartingMessage = false;
                    self.completionProcessComplete = true;
                    self.displayErrorMessage = false;
                    self.disableComplete = false;
                } else if (currentResponse.Job_Status__c == 'Error' && currentResponse.Job_Type__c == 'Complete'){
                    self.displayStartingMessage = false;
                    self.displayProcessBar = false;
                    self.displayStartingMessage = false;
                    self.completionProcessComplete = false;
                    self.displayErrorMessage = true;
                    self.disableComplete = false;
                    self.errorMessage = currentResponse.Message__c;
                } else {
                    self.displayStartingMessage = true;
                    self.displayProcessBar = true;
                    self.displayStartingMessage = false;
                    self.completionProcessComplete = false;
                    self.disableComplete = true;
                    self.displayErrorMessage = false;
                }
                self.numberProcessed = currentResponse.Items_Processed__c;
                self.numberOfItems = currentResponse.Items_To_Process__c;
                let progressPecentCalc = (currentResponse.Items_Processed__c / currentResponse.Items_To_Process__c) * 100;    
                self.progressPercentValue = Math.round(Number(progressPecentCalc));
            }

        };

        this.displayStartingMessage = self.displayStartingMessage;
        this.displayProcessBar = self.displayProcessBar;
        this.progressPercentValue = self.progressPercentValue;
        this.numberProcessed = self.numberProcessed;
        this.numberOfItems = self.numberOfItems;
        this.displayStartingMessage = self.displayStartingMessage;
        this.completionProcessComplete = self.completionProcessComplete;
        this.disableComplete = self.disableComplete;
        this.errorMessage = self.errorMessage;

        // Invoke subscribe method of empApi. Pass reference to messageCallback
        subscribe(this.channelName, -1, messageCallback).then(response => {
            // Response contains the subscription information on subscribe call
            console.log('Subscription request sent to: ', JSON.stringify(response.channel));
            this.subscription = response;
        });
    }

    registerErrorListener() {
        // Invoke onError empApi method
        onError(error => {
            console.log('Received error from server: ', JSON.stringify(error));
            // Error contains the server-side error
        });
    }

    // Handles unsubscribe button click
    handleUnsubscribe() {

        // Invoke unsubscribe method of empApi
        unsubscribe(this.subscription, response => {
            console.log('unsubscribe() response: ', JSON.stringify(response));
            // Response is true for successful unsubscribe
        });
    }

    // function to start the completion process
    handleStartComplete() {
        startComplete({
           recordId: this.recordId
        })
        .then((results) => {
            this.displayStartingMessage = true;
            this.completionProcessComplete = false;
            this.displayErrorMessage = false;
            this.isLoaded = true;
            this.errors = undefined;
            this.handleSubscribe();
        })
        .catch((error) => {
            console.error('error functionName > ' + JSON.stringify(error));
            this.errors = JSON.stringify(error);
       });
    }

    // event to start the completion process
    startComplete(event){
        this.isLoaded = false;
        this.disableComplete = true;
        this.handleStartComplete();
    }

    // wire service to check the field values and determine what to display on screen
    @wire(getRecord, { recordId: '$recordId', fields: ['Meeting__c.Complete_BatchID__c'] })
    wiredMeeting({ error, data }) {
        if (data) {
            let batchID = data.fields.Complete_BatchID__c.value;
            if(batchID != null && batchID != undefined){
                this.displayProcessBar = true;
                this.handleSubscribe();
            } else {
                this.displayProcessBar = false;
            }
            this.error = undefined;
        } else if (error) {
            this.errors = error;
        }
    }
}