/**
 * @description       : parent component for support with the configuration of filter records
 * @author            : daniel@hyphen8.com
 * @group             : 
 * @last modified on  : 25/02/2021
 * @last modified by  : daniel@hyphen8.com
 * Modifications Log 
 * Ver      Date            Author               Modification
 * 1.0      01-09-2021      daniel@hyphen8.com   Initial Version
**/
import { LightningElement, api, track } from 'lwc';

import getMeetingFilters from '@salesforce/apex/MeetingTemplateMappingMethods.getMeetingFilters';

import labels from './labels';

export default class MeetingTemplateMappingComponent extends LightningElement {
    
    @api recordId
    filterType = 'New';
    openModal = false;
    noOfFilters = 0;
    currentOrder = 1;
    mappingFilters;
    errors;
    editRecord;
    displayFilterLogic = false;

    section1Closed = true;
    section1Class = 'slds-summary-detail';
    section2Closed = true;
    section2Class = 'slds-summary-detail';
    section3Closed = true;
    section3Class = 'slds-summary-detail';
    section4Closed = true;
    section4Class = 'slds-summary-detail';
    section5Closed = true;
    section5Class = 'slds-summary-detail';

    closedSetupClass = 'slds-summary-detail';
    openSetUpClass = 'slds-summary-detail slds-is-open';

    

    label = labels;

    connectedCallback() {
        this.handleGetMeetingFilters();
    }

    errorCallback(error) {
        this.errors = error;
    }

    // handle section open and closing
    handleChevronClick(event){
        let sectionSelected = event.target.dataset.targetId;
        switch (sectionSelected) {
            case 'section1closed':
                this.section1Closed = false;
                this.section1Class = this.openSetUpClass;
                break;
            case 'section1open':
                this.section1Closed = true;
                this.section1Class = this.closedSetupClass;
                break;
            case 'section2closed':
                this.section2Closed = false;
                this.section2Class = this.openSetUpClass;
                break;
            case 'section2open':
                this.section2Closed = true;
                this.section2Class = this.closedSetupClass;
                break;
            case 'section3closed':
                this.section3Closed = false;
                this.section3Class = this.openSetUpClass;
                break;
            case 'section3open':
                this.section3Closed = true;
                this.section3Class = this.closedSetupClass;
                break;
            case 'section4closed':
                this.section4Closed = false;
                this.section4Class = this.openSetUpClass;
                break;
            case 'section4open':
                this.section4Closed = true;
                this.section4Class = this.closedSetupClass;
                break;
            case 'section5closed':
                this.section5Closed = false;
                this.section5Class = this.openSetUpClass;
                break;
            case 'section5open':
                this.section5Closed = true;
                this.section5Class = this.closedSetupClass;
                break;
        }


    }

    // handle get list of existing filters
    handleGetMeetingFilters(){
        getMeetingFilters({
            recordId: this.recordId
        })
        .then((results) => {
            this.mappingFilters = results;
            if(results.length > 0){
                this.noOfFilters = results.length;
                this.currentOrder = results.length + 1;
                this.displayFilterLogic = true;
            } else {
                this.noOfFilters = 0;
                this.currentOrder = 1;
                this.displayFilterLogic = false;
            }
            this.errors = undefined;  
        })
        .catch((error) => {
            this.errors = JSON.stringify(error);
            this.mappingFilters = undefined;
            this.noOfFilters = 0;
        });
    }

    // action to show the modal
    showModal() {
        this.openModal = true;
    }

    // handles the event firing from the child components
    handleModalClose(event) {
        this.openModal = event.detail;
        this.filterType = 'New';
    }

    // handles the save of a modal
    handleModalSaved(event){
        this.openModal = event.detail;
        this.filterType = 'New';
        this.handleGetMeetingFilters();
    }

    // handle when a record edit is requested from the data table
    handleDataTableEditRequest(event){
        this.editRecord = event.detail;
        this.filterType = 'Edit';
        this.openModal = true;
    }

    // handles the removal of a filter
    handleFilterDeleted(event){
        let filterDelete = event.detail;
        this.handleGetMeetingFilters();
    }
}