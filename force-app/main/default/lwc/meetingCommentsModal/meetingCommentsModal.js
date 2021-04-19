/**
 * @description       : 
 * @author            : daniel@hyphen8.com
 * @last modified on  : 25/02/2021
 * @last modified by  : daniel@hyphen8.com
 * Modifications Log 
 * Ver   Date         Author               Modification
 * 1.0   23/02/2021   daniel@hyphen8.com   Initial Version
**/
import { LightningElement, api } from 'lwc';

import labels from './labels';

export default class MeetingCommentsModal extends LightningElement {
    @api meetingRequestId;
    @api openModal = false;
    label = labels;

    closeModal(event){
        this.openModal = false;
        this.dispatchEventFunction('modalclosed', true);
    }

    handleSave() {
        this.template.querySelector('lightning-record-edit-form').submit();
        this.openModal = false;
        this.dispatchEventFunction('modalclosed', true);
    }

    handleSuccess(){
        this.dispatchEventFunction('modalsaved', true);
    }

    // generic dispatch event function
    // eventName should always be in lowercase and you need a oneventName to receive it
    // eventDetail can be anything you want detail: contactID
    dispatchEventFunction(eventName, eventDetail) {
       this.dispatchEvent(new CustomEvent(eventName, { eventDetail })); 
    }
}