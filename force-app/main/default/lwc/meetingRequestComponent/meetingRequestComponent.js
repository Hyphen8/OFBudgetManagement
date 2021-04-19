/**
 * @description       : 
 * @author            : daniel@hyphen8.com
 * @last modified on  : 01/03/2021
 * @last modified by  : daniel@hyphen8.com
 * Modifications Log 
 * Ver   Date         Author               Modification
 * 1.0   23/02/2021   daniel@hyphen8.com   Initial Version
**/
import { LightningElement, api } from 'lwc';

import getMeetingButtons from '@salesforce/apex/meetingRequestManagement.getMeetingButtons';
import getRequests from '@salesforce/apex/meetingRequestManagement.getRequests';
import getColumnHeader from '@salesforce/apex/meetingRequestManagement.getColumnHeader';
import getTemplate from '@salesforce/apex/meetingRequestManagement.getTemplate';
import bulkAction from '@salesforce/apex/meetingRequestManagement.handleBulkStatusChange';
import labels from './labels';

export default class MeetingRequestComponent extends LightningElement {
    @api recordId;
    errors;

    buttons;
    requests;
    template;
    statusPickListOptions = [];
    columnHeaders;
    statusOptions;
    isLoaded = false;
    openComments = false;
    meetingRequestRecordID;
    selectedRows = [];
    requestCount = 0;
    label = labels;
    rowsChecks = false;

    connectedCallback(){
        this.handlegetTemplate();
        this.handlegetMeetingButtons();
        this.handlegetColumnHeader();
        this.handlegetRequests();
    }

    errorCallback(error){
        this.errors = error;
    }

    // get template to support configuration of page
    handlegetTemplate() {
        getTemplate({
           recordId: this.recordId
        })
        .then((results) => {
            this.template = results;
            this.errors = undefined;
        })
        .catch((error) => {
            console.error('error handlegetTemplate > ' + JSON.stringify(error));
            this.errors = JSON.stringify(error);
       });
    }

    // get table column headers
    handlegetColumnHeader() {
        getColumnHeader({
           recordId: this.recordId
        })
        .then((results) => {
            this.columnHeaders = results;
            this.errors = undefined;
        })
        .catch((error) => {
            console.error('error handlegetColumnHeader > ' + JSON.stringify(error));
            this.errors = JSON.stringify(error);
       });
    }


    // handle pulling in the meeting buttons and picklist value options
    handlegetMeetingButtons() {
        getMeetingButtons({
            recordId: this.recordId
        })
        .then((results) => {
            this.buttons = results;
            this.statusOptions = results;
            this.errors = undefined;
        })
        .catch((error) => {
            console.error('error handlegetMeetingButtons > ' + JSON.stringify(error));
            this.errors = JSON.stringify(error);
        });
    }

    // get requests for display
    handlegetRequests() {
        getRequests({
           recordId: this.recordId
        })
        .then((results) => {
            this.requests = results;
            this.requestCount = results.length;
            this.isLoaded = true;
            this.rowsChecks = false;
            this.errors = undefined;
        })
        .catch((error) => {
            console.error('error handlegetRequests > ' + JSON.stringify(error));
            this.errors = JSON.stringify(error);
       });
    }

    // handle bulk action press
    handleButtonPress(event){
        let selectedStatus = event.target.dataset.targetId;
        this.isLoaded = false;
        this.handlebulkAction(selectedStatus);
    }

    // if comments are closed by with no save processed then we just clear values
    handleCommentsClose(event){
        this.openComments = false;
        this.meetingRequestRecordID = null;
    }

    // in the event comments are committed successfully refresh our data
    handleSaveAction(){
        this.handlegetRequests();
    }

    // child bubble row selected event
    handleRowSelected(event){
        let rowID = event.detail;
        this.selectedRows.push(rowID);
    }

    // child bubble row deselected event
    handleRowDeSelected(event){
        let rowID = event.detail;
        this.selectedRows = this.selectedRows.filter(item => item !== rowID);
    }

    // child bubble row comments opening
    handleOpenComments(event){
        let meetingRequestID = event.detail;
        this.openComments = true;
        this.meetingRequestRecordID = meetingRequestID;
    }

    // child bubble delete row
    handleDeleteRow(event){
        this.handlegetRequests();
    }

    // event to handle selection and deselection of all rows
    checkAllBoxes(event){
        let rowCheckedStatus = event.target.checked;
        if(rowCheckedStatus){
            this.rowsChecks = true;
            for(let key in this.requests){
                let meetingID = this.requests[key].meetingRequestID;
                this.selectedRows.push(meetingID);
            }
        } else {
            this.rowsChecks = false;
            this.selectedRows = [];
        }
    }

    // method to handle bulk data updates
    handlebulkAction(selectedStatus) {
        bulkAction({
           recordId: this.recordId,
           selectedRowIDs: this.selectedRows,
           statusValue: selectedStatus
        })
        .then((results) => {
            this.handlegetRequests();
            this.errors = undefined;
        })
        .catch((error) => {
            console.error('error handlebulkAction > ' + JSON.stringify(error));
            this.errors = JSON.stringify(error);
       });
    }


}