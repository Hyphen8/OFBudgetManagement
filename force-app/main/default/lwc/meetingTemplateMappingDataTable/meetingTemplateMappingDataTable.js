/**
 * @description       : meeting mapping template datatable
 * @author            : daniel@hyphen8.com
 * @group             : 
 * @last modified on  : 25/02/2021
 * @last modified by  : daniel@hyphen8.com
 * Modifications Log 
 * Ver   Date         Author               Modification
 * 1.0   01-10-2021   daniel@hyphen8.com   Initial Version
**/
import { deleteRecord } from 'lightning/uiRecordApi';
import { LightningElement, api } from 'lwc';

const actions = [
    { label: 'Edit', name: 'edit' },
    { label: 'Delete', name: 'delete' }
];

const columns = [
    { label: 'Order', fieldName: 'Order__c', type: 'text' },
    { label: 'FieldAPIName', fieldName: 'FieldAPIName__c', type: 'text' },
    { label: 'FieldType', fieldName: 'FieldType__c', type: 'text' },
    { label: 'Operator', fieldName: 'Operator__c', type: 'text' },
    { label: 'Value', fieldName: 'Value__c', type: 'text' },
    { type: 'action', typeAttributes: { rowActions: actions, menuAlignment: 'auto' } }
];

export default class MeetingTemplateMappingDataTable extends LightningElement {

    @api mappingFilters;
    columns = columns;
    selectedRecord;
    eventType;
    errors;

    
    
    // handle row actions
    handleRowAction(event) {
        const action = event.detail.action;
        switch (action.name) {
            case 'edit':
                this.selectedRecord = event.detail.row;
                this.eventType = 'Edit';
                this.parentComponentNotification('processeditrecord');
                break;
            case 'delete':
                this.handleDelete(event.detail.row.Id);
                this.eventType = 'Delete';
                break;
        }
    }

    
    // handle the delection of a record
    handleDelete(deleteRecordId){
        deleteRecord(deleteRecordId)
            .then(() => {
                window
                const selectedEvent = new CustomEvent('filterdeleted', { detail: true});
                this.dispatchEvent(selectedEvent);
            })
            .catch(error => {
                this.errors = JSON.stringify(error);
            });
    }

    // shared event dispatch function just pass in the event name
    parentComponentNotification(eventName) {
        const selectedEvent = new CustomEvent(eventName, { detail: this.selectedRecord });
        this.dispatchEvent(selectedEvent);
    }
}