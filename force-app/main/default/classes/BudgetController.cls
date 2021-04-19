/**
 * @description       : controller class with methods used during the budget management process
 * @author            : daniel@hyphen8.com
 * @group             : 
 * @last modified on  : 17/04/2021
 * @last modified by  : daniel@hyphen8.com
 * Modifications Log 
 * Ver   Date         Author               Modification
 * 1.0   04-16-2021   daniel@hyphen8.com   Initial Version
**/
public with sharing class BudgetController {
    
    /**
    * @description      method to return budget headings with budget lines
    * @param            string recordId 
    * @return           List<Budget__c> 
    **/
    @AuraEnabled
    public static List<Budget__c> getBudgetLines(string recordId) {
        try {
            return [SELECT Id, Heading__c, Recommended__c, Plan__c, Awarded__c, Spend__c, Variance__c, Change__c, Payment_Amount__c, (SELECT Id, Recommended__c, Plan__c, Awarded__c, Payment_Amount__c, Change__c, Spend__c, Variance__c, Date__c FROM Budget_Lines__r ORDER BY Date__c ASC) FROM Budget__c WHERE Funding_Request__c=:recordId];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    /**
    * @description      method to return disbursements/payments for use within the budget table including aggregated values
    * @param            string recordId 
    * @return           List<outfunds__Disbursement__c> 
    **/
    @AuraEnabled
    public static List<outfunds__Disbursement__c> getPayments(string recordId) {
        try {
            return [SELECT Id, outfunds__Scheduled_Date__c, Recommended__c, Plan__c, Awarded__c, Spend__c, Variance__c, Change__c, Payment_Amount__c FROM outfunds__Disbursement__c WHERE outfunds__Funding_Request__c=:recordId ORDER BY outfunds__Scheduled_Date__c ASC];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }


    /**
    * @description      method used for generating a new payment record and all associated budget lines
    * @param            string recordId 
    * @param            date paymentDate 
    * @return           string 
    **/
    @AuraEnabled
    public static string generatePayment(string recordId, date paymentDate) {
        try {
            
            outfunds__Disbursement__c payment = new outfunds__Disbursement__c(outfunds__Scheduled_Date__c = paymentDate,outfunds__Funding_Request__c = recordId);
            insert payment;

            List<Budget__c> budgets = [SELECT ID FROM Budget__c WHERE Funding_Request__c=:recordId];

            List<Budget_Line__c> insertBudgetLines = new List<Budget_Line__c>();

            for(Budget__c budget:budgets){
                Budget_Line__c budgetLine = new Budget_Line__c(Budget__c = budget.Id,Payment__c = payment.Id);
                insertBudgetLines.add(budgetLine);
            }

            database.insert(insertBudgetLines);
            return 'Success';
        
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    /**
    * @description      method that will generate a new budget heading along with any associated budget lines should payments/disbursement existing in the system
    * @param            string recordId 
    * @param            string heading 
    * @return           string 
    **/
    @AuraEnabled
    public static string generateBudgetLine(string recordId, string heading){
        try {
            Budget__c budget = new Budget__c(Funding_Request__c = recordId, Heading__c = heading);
            insert budget;

            List<outfunds__Disbursement__c> disbursments = [SELECT Id FROM outfunds__Disbursement__c WHERE outfunds__Funding_Request__c=:recordId];

            List<Budget_Line__c> insertBudgetLines = new List<Budget_Line__c>();

            for(outfunds__Disbursement__c disbursment:disbursments){
                Budget_Line__c budgetLine = new Budget_Line__c(Payment__c = disbursment.Id, Budget__c = budget.Id);
                insertBudgetLines.add(budgetLine);
            }

            database.insert(insertBudgetLines);

            return 'Success';
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static string saveChange(string recordId, string value, string fieldType){
        try {
            Budget_Line__c budgetLineUpdate = new Budget_Line__c(ID=recordId);
            switch on fieldType {
                when 'Plan'{
                    budgetLineUpdate.Plan__c = Decimal.valueOf(value);
                }
                when 'Recommended'{
                    budgetLineUpdate.Recommended__c = Decimal.valueOf(value);
                }
                when 'Spend'{
                    budgetLineUpdate.put('Spend__c', decimal.valueof(value));
                }
                when 'Change'{
                    budgetLineUpdate.put('Change__c', decimal.valueof(value));
                }
            }

            update budgetLineUpdate;

            return 'Success';
            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

}