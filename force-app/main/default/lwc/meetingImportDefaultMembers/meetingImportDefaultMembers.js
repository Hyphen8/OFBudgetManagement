/**
 * @description       : 
 * @author            : daniel@hyphen8.com
 * @last modified on  : 05/03/2021
 * @last modified by  : daniel@hyphen8.com
 * Modifications Log 
 * Ver   Date         Author               Modification
 * 1.0   25/02/2021   daniel@hyphen8.com   Initial Version
**/
import { LightningElement, api } from 'lwc';

import availableForMapping from '@salesforce/apex/MeetingMemberMappingHelper.membersAvailableForMapping';
import loadTemplateMembers from '@salesforce/apex/MeetingMemberMappingHelper.loadTemplateMembers';

import labels from './labels';

export default class MeetingImportDefaultMembers extends LightningElement {
    @api recordId;

    isLoaded = true;
    templateMembersFound = true;
    membersLoaded = false;
    importDisabled = false;
    errors;
    label = labels;

    connectedCallback(){
        this.handleavailableForMapping();
    }

    errorCallback(error){
        this.errors = error;
    }

    // confirm if we have existing members and if there are members linked to the template
    handleavailableForMapping() {
        availableForMapping({
           recordId: this.recordId
        })
        .then((results) => {
            this.templateMembersFound = results;
            this.errors = undefined;
        })
        .catch((error) => {
            console.error('error handleavailableForMapping > ' + JSON.stringify(error));
            this.errors = JSON.stringify(error);
       });
    }

    // handle the import of members button
    importMembers(event){
        this.isLoaded = false;
        this.handleloadTemplateMembers();
    }


    // perform import of meeting member template
    handleloadTemplateMembers() {
        loadTemplateMembers({
           recordId: this.recordId
        })
        .then((results) => {
            this.isLoaded = true;
            this.membersLoaded = true;
            this.importDisabled = true;
            this.errors = undefined;
        })
        .catch((error) => {
            console.error('error handleloadTemplateMembers > ' + JSON.stringify(error));
            this.errors = JSON.stringify(error);
       });
    }
    
}