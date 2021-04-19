/**
 * @description       : 
 * @author            : daniel@hyphen8.com
 * @last modified on  : 01/03/2021
 * @last modified by  : daniel@hyphen8.com
 * Modifications Log 
 * Ver   Date         Author               Modification
 * 1.0   23/02/2021   daniel@hyphen8.com   Initial Version
**/
import { LightningElement, api } from 'lwc';

export default class MeetingFieldOutputComponent extends LightningElement {

    displayText = false;
    displayBoolean = false;
    displayDate = false;
    displayDateTime = false;
    displayCurrency = false;
    displayNumber = false;

    @api
    get field(){
        return this._field;
    }
    set field(value){
        this._field = value;
        let dateType = value.dataType;
        console.log('dateType > ' + dateType);
        switch(dateType) {
            case 'DATE':
                this.displayDate = true;
                break;
            case 'DATETIME':
                this.displayDateTime = true;
                break;
            case 'CURRENCY':
                this.displayCurrency = true;
                break;
            case 'BOOLEAN':
                this.displayBoolean = true;
                break;
            case 'DOUBLE':
                this.displayNumber = true;
                break;
            case 'STRING':
                this.displayText = true;
                break;
            case 'TEXTAREA':
                this.displayText = true;
                break;
            case 'REFERENCE':
                this.displayText = true;
                break;
        }
    }
}