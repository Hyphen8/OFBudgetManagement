/**
 * @description       : simple progress component
 * @author            : daniel@hyphen8.com
 * @last modified on  : 25/02/2021
 * @last modified by  : daniel@hyphen8.com
 * Modifications Log 
 * Ver   Date         Author               Modification
 * 1.0   21/02/2021   daniel@hyphen8.com   Initial Version
**/
import { api, LightningElement } from 'lwc';

import labels from './labels';

export default class MeetingBatchProgressComponent extends LightningElement {

    progressvalue = 0;
    label = labels;

    @api
    get progressPercentValue(){
        return this._progressPercentValue;
    }
    set progressPercentValue(value){
        this.progressvalue = value;
        console.log('number received > ' + value);
        this._progressPercentValue = value;
    }

    @api
    get numberOfItems(){
        return this._numberOfItems;
    }
    set numberOfItems(value){
        this._numberOfItems = value;
    }

    @api
    get numberProcessed(){
        return this._numberProcessed;
    }
    set numberProcessed(value){
        this._numberProcessed = value;
    }

}