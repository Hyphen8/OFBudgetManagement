/**
 * @description       : js file for budget component
 * @author            : daniel@hyphen8.com
 * @group             : 
 * @last modified on  : 18/04/2021
 * @last modified by  : daniel@hyphen8.com
 * Modifications Log 
 * Ver   Date         Author               Modification
 * 1.0   04-16-2021   daniel@hyphen8.com   Initial Version
**/
import { LightningElement, api } from 'lwc';

import getBudgetLines from '@salesforce/apex/BudgetController.getBudgetLines';
import getPayments from '@salesforce/apex/BudgetController.getPayments';
import saveChange from '@salesforce/apex/BudgetController.saveChange';

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
    @api creationMode = false;
    @api recommendationMode = false;
    @api spendMode = false;
    @api changeMode = false;

    totalPlan = 0.00;
    totalRecommended = 0.00;
    totalAwarded = 0.00;
    totalPayment = 0.00;
    totalChange = 0.00;
    totalSpend = 0.00;
    totalVariance = 0.00;

    addPayment = false;
    addBudgetHeading = false;
    editData = false;
    editObject;
    editRecordId;
    isPayment;

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

    handleSaveChange(changeRecordId, changeValue, changeType) {
        saveChange({
           recordId: changeRecordId,
           value: changeValue,
           fieldType: changeType
        })
        .then((results) => {
            this.handleGetBudgetLines();
            this.handleGetPayments();
            this.errors = undefined;
        })
        .catch((error) => {
            console.error('error handleSaveChange > ' + JSON.stringify(error));
            this.errors = JSON.stringify(error);
       });
    }

    // function for manipulating disbursement data and generating grant totals
    handleProcessingGrantTotals(){
        let currentPayments = this.payments;
        let plan = 0.00;
        let recommended = 0.00;
        let awarded = 0.00;
        let change = 0.00;
        let spend = 0.00;
        let variance = 0.00;
        let payment = 0.00;

        currentPayments.forEach(element => {
            plan = plan + element.Plan__c;
            payment = payment + element.Payment_Amount__c;
            change = change + element.Change__c;
            spend = spend + element.Spend__c;
            variance = variance + element.Variance__c;
            awarded = awarded + element.Awarded__c;
            recommended = recommended + element.Recommended__c;
        });


        this.totalPlan = plan;
        this.totalRecommended = recommended;
        this.totalAwarded = awarded;
        this.totalChange = change;
        this.totalPayment = payment;
        this.totalSpend = spend;
        this.totalVariance = variance;
    }

    // function onclick event that opens the add payment modal
    handleAddPayment(){
        this.addPayment = true;
    }

    // function onclick event that open the add budget header modal
    handleAddBudgetHeader(){
        this.addBudgetHeading = true;
    }

    // handle line changes and save them
    handleLineChange(event){
        this.handleSaveChange(event.target.dataset.id, event.target.value, event.target.dataset.targetType);
    }

    handleEditRequest(event){
        console.log('target ID > ' + event.target.dataset.id);
        console.log('target object ID > ' + event.target.dataset.targetId);
        this.editObject = event.target.dataset.targetId;
        if(this.editObject == 'outfunds__Disbursement__c'){
            this.isPayment = true;
        } else {
            this.isPayment = false;
        }
        this.editRecordId = event.target.dataset.id;
        this.editData = true;
    }

    // method to fire when a modal is closed but not updates edits have been made
    handleModalCloseNoSave(){
        this.addPayment = false;
        this.addBudgetHeading = false;
        this.editData = false;
        this.editObject = null;
        this.editRecordId = null;
        this.isPayment = null;
    }

    // method to fire when a modal is closed but not updates edits have been made
    handleModalCloseWithSave(){
        console.log('close with a save sent');
        this.addPayment = false;
        this.addBudgetHeading = false;
        this.editData = false;
        this.editObject = null;
        this.editRecordId = null;
        this.isPayment = null;
        this.handleGetPayments();
        this.handleGetBudgetLines();
    }
}