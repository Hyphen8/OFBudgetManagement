/**
 * @description       : 
 * @author            : daniel@hyphen8.com
 * @group             : 
 * @last modified on  : 01-09-2021
 * @last modified by  : daniel@hyphen8.com
 * Modifications Log 
 * Ver   Date         Author               Modification
 * 1.0   01-09-2021   daniel@hyphen8.com   Initial Version
**/
import { LightningElement, api, track} from 'lwc';

export default class ErrorPanel extends LightningElement {
    
    @api friendlyMessage = 'Error retrieving data';

    viewDetails = false;

    _errors;

    @api
    get errors() {
        return this._errors;
    }
    /** Single error object or array of error objects */
    set errors(value) {
        if (!Array.isArray(value)) {
            value = [value];
        }
        this._errors = value
            .filter(
                error =>
                    error &&
                    error.details &&
                    error.details.body &&
                    error.details.body.message,
            )
            .map(error => ({ message: error.details.body.message }));
    }

    handleCheckboxChange(event) {
        this.viewDetails = event.target.checked;
    }
}