/**
 * @description       : js file for budget component
 * @author            : daniel@hyphen8.com
 * @group             : 
 * @last modified on  : 04-17-2021
 * @last modified by  : daniel@hyphen8.com
 * Modifications Log 
 * Ver   Date         Author               Modification
 * 1.0   04-16-2021   daniel@hyphen8.com   Initial Version
**/
import { LightningElement, api } from 'lwc';

import getBudgetLines from '@salesforce/apex/BudgetController.getBudgetLines';
import getPayments from '@salesforce/apex/BudgetController.getPayments';

import labels from './labels';

export default class BudgetComponent extends LightningElement {
    
    @api recordId;

    label = labels;
    
    errors;

    budgets;
    payments;

    @api showPlan = false;
    @api showRecommended = false;
    @api showAwarded = false;
    @api showPayment = false;
    @api showChange = false;
    @api showSpend = false;
    @api showVariance = false;

    totalPlan = 0.00;
    totalRecommended = 0.00;
    totalAwarded = 0.00;
    totalPayment = 0.00;
    totalChange = 0.00;
    totalSpend = 0.00;
    totalVariance = 0.00;

    addPayment = false;
    addBudgetHeading = false;
    hasBudgetLines;

    // on connection get data
    connectedCallback(){
        this.handleGetPayments();
        this.handleGetBudgetLines();
    }

    // error call back function to detect errors loading
    errorCallback(error){
        this.errors = error;
    }

    // function to import the budget lines
    handleGetBudgetLines() {
        getBudgetLines({
           recordId: this.recordId
        })
        .then((results) => {
            this.budgets = results;
            if(results.length > 0){
                this.hasBudgetLines = true;
            } else {
                this.hasBudgetLines = false;
            }
            this.errors = undefined;
        })
        .catch((error) => {
            console.error('error handleGetBudgetLines > ' + JSON.stringify(error));
            this.errors = JSON.stringify(error);
       });
    }

    // function to import the associated payments
    handleGetPayments() {
        getPayments({
           recordId: this.recordId
        })
        .then((results) => {
            this.payments = results;
            this.handleProcessingGrantTotals();
            this.errors = undefined;
        })
        .catch((error) => {
            console.error('error handleGetPayments > ' + JSON.stringify(error));
            this.errors = JSON.stringify(error);
       });
    }

    // function for manipulating disbursement data and generating grant totals
    handleProcessingGrantTotals(){
        let currentPayments = this.payments;
    }

    // function onclick event that opens the add payment modal
    handleAddPayment(){
        this.addPayment = true;
    }

    // function onclick event that open the add budget header modal
    handleAddBudgetHeader(){
        this.addBudgetHeading = true;
    }

    // method to fire when a modal is closed but not updates edits have been made
    handleModalCloseNoSave(){
        this.addPayment = false;
        this.addBudgetHeading = false;
    }

    // method to fire when a modal is closed but not updates edits have been made
    handleModalCloseWithSave(){
        this.addPayment = false;
        this.addBudgetHeading = false;
        this.handleGetPayments();
        this.handleGetBudgetLines();
    }
}