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

import startImport from '@salesforce/apex/meetingMappingHelper.startImport';

import { getRecord } from 'lightning/uiRecordApi';

import { subscribe, unsubscribe, onError } from 'lightning/empApi';

import labels from './labels';

export default class MeetingImportComponent extends LightningElement {
    @api recordId;
    progressPercentValue = 0;
    size = 0;
    numberOfItems = 0;
    numberProcessed = 0;
    isLoaded = true;
    disableImport = false;
    displayProcessBar = false;
    displayStartingMessage = false;
    displayErrorMessage = false;
    errorMessage;
    errors;
    importComplete = false;
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
                if(currentResponse.Job_Status__c == 'Completed' && currentResponse.Job_Type__c == 'Import'){
                    self.displayStartingMessage = false;
                    self.displayProcessBar = false;
                    self.displayStartingMessage = false;
                    self.importComplete = true;
                    self.displayErrorMessage = false;
                    self.disableImport = false;
                } else if (currentResponse.Job_Status__c == 'Error' && currentResponse.Job_Type__c == 'Import'){
                    self.displayStartingMessage = false;
                    self.displayProcessBar = false;
                    self.displayStartingMessage = false;
                    self.importComplete = false;
                    self.displayErrorMessage = true;
                    self.disableImport = false;
                    self.errorMessage = currentResponse.Message__c;
                } else {
                    self.displayStartingMessage = true;
                    self.displayProcessBar = true;
                    self.displayStartingMessage = false;
                    self.importComplete = false;
                    self.disableImport = true;
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
        this.importComplete = self.importComplete;
        this.disableImport = self.disableImport;
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
    
    // function to handle the import process
    handleStartImport() {
        startImport({
           recordId: this.recordId
        })
        .then((results) => {
            this.displayStartingMessage = true;
            this.importComplete = false;
            this.displayErrorMessage = false;
            this.isLoaded = true;
            this.errors = undefined;
            this.handleSubscribe();
        })
        .catch((error) => {
            console.error('error handlestartImport > ' + JSON.stringify(error));
            this.errors = JSON.stringify(error);
       });
    }
    
    // event function to start the import process
    startImport(event){
        this.isLoaded = false;
        this.disableImport = true;
        this.handleStartImport();
    }

    // wire service to confirm what should be displayed on screen
    @wire(getRecord, { recordId: '$recordId', fields: ['Meeting__c.Import_BatchID__c'] })
    wiredMeeting({ error, data }) {
        if (data) {
            let batchID = data.fields.Import_BatchID__c.value;
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