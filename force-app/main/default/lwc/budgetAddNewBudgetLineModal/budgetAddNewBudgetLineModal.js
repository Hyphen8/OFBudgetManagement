/**
 * @description       : 
 * @author            : daniel@hyphen8.com
 * @group             : 
 * @last modified on  : 04-17-2021
 * @last modified by  : daniel@hyphen8.com
 * Modifications Log 
 * Ver   Date         Author               Modification
 * 1.0   04-16-2021   daniel@hyphen8.com   Initial Version
**/
import { LightningElement, api } from 'lwc';

import generateBudgetHeader from '@salesforce/apex/BudgetController.generateBudgetLine';

import labels from './labels';

export default class BudgetAddNewBudgetLineModal extends LightningElement {
    @api recordId;
    @api showModal;

    label = labels;

    budgetHeader;
    allowSave = true;

    handleGenerateBudgetHeader() {
        generateBudgetHeader({
           recordId: this.recordId,
           heading: this.budgetHeader
        })
        .then((results) => {
            this.saveModal();
            this.errors = undefined;
        })
        .catch((error) => {
            console.error('error handleGenerateBudgetHeader > ' + JSON.stringify(error));
            this.errors = JSON.stringify(error);
       });
    }

    closeModal(event){
        this.dispatchEventFunction('closemodalnosave', true);
    }

    saveModal(event){
        this.dispatchEventFunction('closemodalwithsave', true);
    }

    handleBudgetHeaderChange(event){
        this.budgetHeader = event.detail.value;
        console.log('event details > ' + event.detail.value);
        if(this.budgetHeader != null && this.budgetHeader != undefined && this.budgetHeader.length > 5){
            this.allowSave = false;
        } else {
            this.allowSave = true;
        }
    }

    // generic dispatch event function
    // eventName should always be in lowercase and you need a oneventName to receive it
    // eventDetail can be anything you want detail: contactID
    dispatchEventFunction(eventName, eventDetail) {
       this.dispatchEvent(new CustomEvent(eventName, { eventDetail }));
    }
}