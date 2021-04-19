/**
 * @description       : 
 * @author            : daniel@hyphen8.com
 * @last modified on  : 18/04/2021
 * @last modified by  : daniel@hyphen8.com
 * Modifications Log 
 * Ver   Date         Author               Modification
 * 1.0   17/04/2021   daniel@hyphen8.com   Initial Version
**/
import { LightningElement, api } from 'lwc';

export default class BudgetEditRecordModal extends LightningElement {

    @api recordId;
    @api showModal;
    @api editObject;
    @api editRecordId;
    @api isPayment;

    closeModal(event){
        this.dispatchEventFunction('closemodalnosave', true);
    }

    handleSave(event){
        this.template.querySelector('lightning-record-edit-form').submit();
    }

    saveModal(event){
        this.dispatchEventFunction('closemodalwithsave', true);
    }

    // generic dispatch event function
    // eventName should always be in lowercase and you need a oneventName to receive it
    // eventDetail can be anything you want detail: contactID
    dispatchEventFunction(eventName, eventDetail) {
       this.dispatchEvent(new CustomEvent(eventName, { eventDetail }));
    }
}