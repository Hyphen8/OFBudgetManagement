/**
 * @description       : js for add new payment modal
 * @author            : daniel@hyphen8.com
 * @group             : 
 * @last modified on  : 04-16-2021
 * @last modified by  : daniel@hyphen8.com
 * Modifications Log 
 * Ver   Date         Author               Modification
 * 1.0   04-16-2021   daniel@hyphen8.com   Initial Version
**/
import { LightningElement, api } from 'lwc';

import generatePayment from '@salesforce/apex/BudgetController.generatePayment';

import labels from './labels';

export default class BudgetAddNewPaymentModal extends LightningElement {
    @api recordId;
    @api showModal;

    label = labels;

    paymentDate;
    allowSave = true;

    handleGeneratePayment() {
        generatePayment({
           recordId: this.recordId,
           paymentDate: this.paymentDate
        })
        .then((results) => {
            this.saveModal();
            this.errors = undefined;
        })
        .catch((error) => {
            console.error('error handleGeneratePayment > ' + JSON.stringify(error));
            this.errors = JSON.stringify(error);
       });
    }

    handlePaymentDateSet(event){
        this.paymentDate = event.detail.value;
        if(this.paymentDate != null && this.paymentDate != undefined){
            this.allowSave = false;
        } else {
            this.allowSave = true;
        }
    }

    closeModal(event){
        this.dispatchEventFunction('closemodalnosave', true);
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