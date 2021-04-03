
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
import { c as createCommonjsModule, g as getDefaultExportFromCjs, a as assign, s as svg_element, b as set_svg_attributes, t as toggle_class, d as add_location, i as insert_dev, e as get_spread_update, f as detach_dev, h as dispatch_dev, j as element, k as attr_dev, n as noop, v as validate_slots, o as onMount, l as exclude_internal_props, S as SvelteComponentDev, m as init, p as safe_not_equal, q as globals, r as create_component, u as mount_component, w as transition_in, x as transition_out, y as destroy_component, z as text, A as set_data_dev, B as binding_callbacks, C as bind, D as Button, E as space, F as add_flush_callback, I as InputGroup, G as get_spread_object, H as Card, J as validate_store, X, K as component_subscribe } from './bundle.js';
import { F as Field, a as Form_1, c as createForm } from './index-78544a14.js';

class NopeReference {
    constructor(key) {
        this.key = key;
    }
}

function resolveNopeRefsFromKeys(options, context) {
    const resolvedOptions = options.map((option) => {
        if (context && option !== undefined && option !== null) {
            return context[option];
        }
        return option;
    });
    return resolvedOptions;
}
function every(arr, predicate) {
    return arr.filter((value) => !predicate(value)).length === 0;
}
function resolveNopeRef(option, context) {
    if (option instanceof NopeReference && context) {
        return context[option.key];
    }
    return option;
}
function deepEquals(a, b) {
    if (typeof a == 'object' && a != null && typeof b == 'object' && b != null) {
        if (a === b) {
            return true;
        }
        let aCount = 0;
        let bCount = 0;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (const _ in a) {
            aCount++;
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (const _ in b) {
            bCount++;
        }
        if (aCount - bCount !== 0) {
            return false;
        }
        for (const key in a) {
            if (!(key in b) || !deepEquals(a[key], b[key])) {
                return false;
            }
        }
        for (const key in b) {
            if (!(key in a) || !deepEquals(b[key], a[key])) {
                return false;
            }
        }
        return true;
    }
    return a === b;
}
function pathToArray(path) {
    return path.split(/[,[\].]/g).filter(Boolean);
}
function getFromPath(path, entry, dropLast = false) {
    if (!path) {
        return undefined;
    }
    let pathArray = pathToArray(path);
    pathArray = dropLast ? pathArray.slice(0, -1) : pathArray;
    let value = entry;
    for (const key of pathArray) {
        value = value[key];
    }
    return value;
}

class NopeObject {
    constructor(objectShape) {
        this.validationRules = [];
        this._type = 'object';
        this.objectShape = objectShape || {};
    }
    getType() {
        return this._type;
    }
    shape(shape) {
        this.objectShape = Object.assign(Object.assign({}, this.objectShape), shape);
        return this;
    }
    extend(Base) {
        this.objectShape = Object.assign(Object.assign({}, this.objectShape), Base.objectShape);
        return this;
    }
    noUnknown(message = 'Input contains invalid keys') {
        const rule = (entry) => {
            let objectIsDefined = false;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            for (const _ in this.objectShape) {
                objectIsDefined = true;
                break;
            }
            if (!objectIsDefined) {
                throw Error('noUnknown must be used with a schema');
            }
            let unknownKeys = false;
            for (const key in entry) {
                unknownKeys = unknownKeys || !(key in this.objectShape);
            }
            if (unknownKeys) {
                return message;
            }
        };
        this.validationRules.push(rule);
        return this;
    }
    validate(entry, context, options) {
        for (const rule of this.validationRules) {
            const localErrors = rule(entry);
            if (localErrors) {
                return localErrors;
            }
        }
        const errors = {};
        let areErrors = false;
        for (const key in this.objectShape) {
            const rule = this.objectShape[key];
            const error = rule.validate(entry[key], entry, options);
            if (error && typeof error === 'string') {
                areErrors = true;
                errors[key] = error;
                if (options === null || options === void 0 ? void 0 : options.abortEarly) {
                    return errors;
                }
            }
        }
        if (areErrors) {
            return errors;
        }
        return undefined;
    }
    validateAt(path, entry) {
        var _a, _b;
        const arrayPath = pathToArray(path);
        let validator = this.objectShape;
        for (const p of arrayPath) {
            if (!isNaN(parseInt(p, 10))) {
                continue;
            }
            if ((_a = validator[p]) === null || _a === void 0 ? void 0 : _a.objectShape) {
                validator = validator[p].objectShape;
            }
            else if ((_b = validator[p]) === null || _b === void 0 ? void 0 : _b.ofShape) {
                validator = validator[p].ofShape.objectShape || validator[p].ofShape;
            }
            else {
                validator = validator[p];
            }
        }
        const parentValue = getFromPath(path, entry, true);
        const value = getFromPath(path, entry);
        return validator.validate(value, parentValue);
    }
}

class NopePrimitive {
    constructor() {
        this.validationRules = [];
        this._type = 'undefined';
    }
    getType() {
        return this._type;
    }
    isEmpty(entry) {
        return entry === undefined || entry === null;
    }
    required(message = 'This field is required') {
        const rule = (entry) => {
            if (this.isEmpty(entry)) {
                return message;
            }
        };
        return this.test(rule);
    }
    when(keys, conditionObject) {
        const ctxKeys = Array.isArray(keys) ? keys : [keys];
        const rule = (_, context) => {
            const resolvedConditionValues = resolveNopeRefsFromKeys(ctxKeys, context);
            const values = [...resolvedConditionValues];
            const condIs = conditionObject.is;
            const result = typeof condIs === 'function'
                ? condIs(...values)
                : every(resolvedConditionValues, (val) => val === condIs);
            return result ? conditionObject.then : conditionObject.otherwise;
        };
        return this.test(rule);
    }
    oneOf(options, message = 'Invalid option') {
        const rule = (entry, context) => {
            if (entry === undefined) {
                return;
            }
            const resolvedOptions = options.map((option) => resolveNopeRef(option, context));
            if (resolvedOptions.indexOf(entry) === -1) {
                return message;
            }
        };
        return this.test(rule);
    }
    notOneOf(options, message = 'Invalid Option') {
        const rule = (entry, context) => {
            const resolvedOptions = options.map((option) => resolveNopeRef(option, context));
            if (resolvedOptions.indexOf(entry) !== -1) {
                return message;
            }
        };
        return this.test(rule);
    }
    test(rule) {
        this.validationRules.push(rule);
        return this;
    }
    /**
     * @param entry - The value to be validated
     * @param context - Used for internal reference resolving. Do not pass this.
     */
    validate(entry, context) {
        for (const rule of this.validationRules) {
            const error = rule(entry, context);
            if (error instanceof NopePrimitive) {
                return error.validate(entry, context);
            }
            else if (error) {
                return error;
            }
        }
    }
}

const emailRegex = /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/i;
const urlRegex = /^((https?|ftp):)?\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i;

class NopeString extends NopePrimitive {
    constructor() {
        super(...arguments);
        this._type = 'string';
    }
    validate(entry, context) {
        const value = !!entry ? String(entry) : entry;
        return super.validate(value, context);
    }
    isEmpty(value) {
        return value === undefined || value === null || `${value}`.trim().length === 0;
    }
    regex(regex, message = "Doesn't satisfy the rule") {
        const rule = (entry) => {
            if (this.isEmpty(entry)) {
                return;
            }
            if (!regex.test(entry)) {
                return message;
            }
        };
        return this.test(rule);
    }
    url(message = 'Input is not a valid url') {
        return this.regex(urlRegex, message);
    }
    email(message = 'Input is not a valid email') {
        return this.regex(emailRegex, message);
    }
    /**
     * @deprecated alias for greaterThan()
     */
    min(length, message) {
        return this.greaterThan(length, message);
    }
    /**
     * @deprecated alias for lessThan()
     */
    max(length, message) {
        return this.lessThan(length, message);
    }
    greaterThan(length, message = 'Input is too short') {
        const rule = (entry) => {
            if (this.isEmpty(entry)) {
                return;
            }
            const value = entry;
            if (value.length <= length) {
                return message;
            }
        };
        return this.test(rule);
    }
    lessThan(length, message = 'Input is too long') {
        const rule = (entry) => {
            if (this.isEmpty(entry)) {
                return;
            }
            const value = entry;
            if (value.length >= length) {
                return message;
            }
        };
        return this.test(rule);
    }
    atLeast(length, message = 'Input is too short') {
        const rule = (entry) => {
            if (this.isEmpty(entry)) {
                return;
            }
            const value = entry;
            if (value.length < length) {
                return message;
            }
        };
        return this.test(rule);
    }
    atMost(length, message = 'Input is too long') {
        const rule = (entry) => {
            if (this.isEmpty(entry)) {
                return;
            }
            const value = entry;
            if (value.length > length) {
                return message;
            }
        };
        return this.test(rule);
    }
    exactLength(length, message = `Must be at exactly of length ${length}`) {
        const rule = (entry) => {
            if (this.isEmpty(entry)) {
                return;
            }
            const value = entry;
            if (value.length !== length) {
                return message;
            }
        };
        return this.test(rule);
    }
}

class NopeNumber extends NopePrimitive {
    constructor(message = 'The field is not a valid number') {
        super();
        this.message = 'The field is not a number';
        this._type = 'number';
        this.message = message;
    }
    integer(message = 'Input must be an integer') {
        const rule = (entry) => {
            if (this.isEmpty(entry)) {
                return;
            }
            if (entry !== Math.floor(entry)) {
                return message;
            }
        };
        return this.test(rule);
    }
    /**
     * @deprecated alias for greaterThan()
     */
    min(size, message) {
        return this.greaterThan(size, message);
    }
    /**
     * @deprecated alias for lessThan()
     */
    max(size, message) {
        return this.lessThan(size, message);
    }
    greaterThan(size, message = 'Input is too small') {
        const rule = (entry) => {
            if (this.isEmpty(entry)) {
                return;
            }
            if (entry <= size) {
                return message;
            }
        };
        return this.test(rule);
    }
    lessThan(size, message = 'Input is too large') {
        const rule = (entry) => {
            if (this.isEmpty(entry)) {
                return;
            }
            if (entry >= size) {
                return message;
            }
        };
        return this.test(rule);
    }
    atLeast(size, message = 'Input is too small') {
        const rule = (entry) => {
            if (this.isEmpty(entry)) {
                return;
            }
            if (entry < size) {
                return message;
            }
        };
        return this.test(rule);
    }
    atMost(size, message = 'Input is too large') {
        const rule = (entry) => {
            if (this.isEmpty(entry)) {
                return;
            }
            if (entry > size) {
                return message;
            }
        };
        return this.test(rule);
    }
    positive(message = 'Input must be positive') {
        return this.greaterThan(0, message);
    }
    negative(message = 'Input must be negative') {
        return this.lessThan(0, message);
    }
    validate(entry, context) {
        const value = !!entry ? Number(entry) : entry;
        if (!this.isEmpty(value) && Number.isNaN(value))
            return this.message;
        return super.validate(value, context);
    }
}

class NopeBoolean extends NopePrimitive {
    constructor() {
        super(...arguments);
        this._type = 'boolean';
    }
    true(message = 'Input must be true') {
        const rule = (entry) => {
            if (this.isEmpty(entry)) {
                return;
            }
            if (entry !== true) {
                return message;
            }
        };
        return this.test(rule);
    }
    false(message = 'Input must be false') {
        const rule = (entry) => {
            if (this.isEmpty(entry)) {
                return;
            }
            if (entry !== false) {
                return message;
            }
        };
        return this.test(rule);
    }
    validate(entry, context) {
        const value = entry === undefined || entry === null ? entry : !!entry;
        return super.validate(value, context);
    }
}

class NopeArray {
    constructor() {
        this._type = 'object';
        this.validationRules = [];
        this.ofShape = null;
    }
    getType() {
        return this._type;
    }
    required(message = 'This field is required') {
        const rule = (entry) => {
            if (entry === undefined || entry === null) {
                return message;
            }
        };
        return this.test(rule);
    }
    of(primitive, message = 'One or more elements are of invalid type') {
        this.ofShape = primitive;
        const rule = (entry) => {
            if (entry === undefined || entry === null) {
                return;
            }
            if (entry.some((value) => primitive.getType() !== typeof value)) {
                return message;
            }
            const error = entry.find((value) => primitive.validate(value));
            if (error) {
                return message;
            }
        };
        return this.test(rule);
    }
    minLength(length, message = 'Input is too short') {
        const rule = (entry) => {
            if (entry === undefined || entry === null) {
                return;
            }
            if (entry.length <= length) {
                return message;
            }
        };
        return this.test(rule);
    }
    maxLength(length, message = 'Input is too long') {
        const rule = (entry) => {
            if (entry === undefined || entry === null) {
                return;
            }
            if (entry.length >= length) {
                return message;
            }
        };
        return this.test(rule);
    }
    mustContain(value, message = 'Input does not contain required value') {
        const rule = (entry) => {
            if (entry === undefined || entry === null) {
                return;
            }
            if (entry.indexOf(value) === -1) {
                return message;
            }
        };
        return this.test(rule);
    }
    hasOnly(values, message = 'Input elements must correspond to value values') {
        const rule = (entry) => {
            if (entry === undefined || entry === null) {
                return;
            }
            if (entry.some((value) => {
                if (typeof value === 'object') {
                    return !values.find((v) => deepEquals(value, v));
                }
                return values.indexOf(value) === -1;
            })) {
                return message;
            }
        };
        return this.test(rule);
    }
    every(callback, message = 'Input does not satisfy condition') {
        const rule = (entry) => {
            if (entry === undefined || entry === null) {
                return;
            }
            if (entry.some((value) => !callback(value))) {
                return message;
            }
        };
        return this.test(rule);
    }
    some(callback, message = 'Input does not satisfy condition') {
        const rule = (entry) => {
            if (entry === undefined || entry === null || entry.length === 0) {
                return;
            }
            if (!entry.some((value) => callback(value))) {
                return message;
            }
        };
        return this.test(rule);
    }
    test(rule) {
        this.validationRules.push(rule);
        return this;
    }
    validate(entry, context) {
        for (const rule of this.validationRules) {
            const error = rule(entry, context);
            if (error instanceof NopePrimitive) {
                return error.validate(entry, context);
            }
            else if (error) {
                return `${error}`;
            }
        }
    }
}

class NopeDate extends NopePrimitive {
    constructor(message = 'The field is not a valid date') {
        super();
        this._type = 'object';
        this.message = message;
    }
    before(beforeDate, message = `Date must be before ${beforeDate.toString()}`) {
        const rule = (entry, context) => {
            if (this.isEmpty(entry)) {
                return;
            }
            const resolvedBeforeDate = beforeDate instanceof NopeReference && context ? context[beforeDate.key] : beforeDate;
            if (entry >= new Date(resolvedBeforeDate)) {
                return message;
            }
        };
        return this.test(rule);
    }
    after(afterDate, message = `Date must be after ${afterDate}`) {
        const rule = (entry, context) => {
            if (this.isEmpty(entry)) {
                return;
            }
            const resolvedAfterDate = afterDate instanceof NopeReference && context ? context[afterDate.key] : afterDate;
            if (entry <= new Date(resolvedAfterDate)) {
                return message;
            }
        };
        return this.test(rule);
    }
    validate(entry, context) {
        let value = entry;
        if (this.isEmpty(entry) || entry instanceof Date) {
            value = entry;
        }
        else if (!isNaN(entry)) {
            value = new Date(entry);
        }
        else {
            const ms = Date.parse(entry);
            if (isNaN(ms))
                return this.message;
            value = new Date(ms);
        }
        return super.validate(value, context);
    }
}

const NopeObjectConstructor = () => new NopeObject();
const NopeStringConstructor = () => new NopeString();
const NopeNumberConstructor = (message) => new NopeNumber(message);
const NopeBooleanConstructor = () => new NopeBoolean();
const NopeDateConstructor = (message) => new NopeDate(message);
const NopeArrayConstructor = () => new NopeArray();
const NopeReferenceConstructor = (key) => new NopeReference(key);
const Nope = {
    object: NopeObjectConstructor,
    string: NopeStringConstructor,
    number: NopeNumberConstructor,
    boolean: NopeBooleanConstructor,
    array: NopeArrayConstructor,
    date: NopeDateConstructor,
    ref: NopeReferenceConstructor,
};

/**
 * (c) Vjacheslav Trushkin <cyberalien@gmail.com>
 *
 * For the full copyright and license information, please view the license.txt or license.gpl.txt
 * files at https://github.com/iconify/iconify
 *
 * Licensed under Apache 2.0 or GPL 2.0 at your option.
 * If derivative product is not compatible with one of licenses, you can pick one of licenses.
 *
 * @license Apache 2.0
 * @license GPL 2.0
 */

var iconify_min = createCommonjsModule(function (module, exports) {
"use strict";if(void 0===self.Iconify&&(self.Iconify={isReady:!1},self.SimpleSVG=self.Iconify,function(e,t){var i,n,o,r,s,a,c,l,u,d,f,h,p,v,g,b,m,y,w,_,x,O,A,j,I,E,k,C,M,L,S,N,P,T,F,R,D,H,V,G,Q,z,B,q,Y,J,U,W,$,K,X,Z,ee,te,ie,ne,oe,re={config:{},version:"1.0.7"};function se(e,t){var i;return t=t||{bubbles:!1,cancelable:!1,detail:void 0},(i=document.createEvent("CustomEvent")).initCustomEvent(e,t.bubbles,t.cancelable,t.detail),i}function ae(){document.removeEventListener("DOMContentLoaded",ae),window.removeEventListener("load",ae),o.DOMReadyCallback();}function ce(t,i,e){var n=t;if("_"!==t.slice(0,1)){if(void 0===u[t]){if(!e||void 0===u["_"+t])return;n="_"+t;}switch(n){case"API":case"SVGAttributes":Object.keys(i).forEach(function(e){null===i[t]?delete u[n][e]:u[n][e]=i[e];});break;default:u[n]=i;}}}function le(e,t){return function(e,t){switch(e){case"rotate":return t=parseInt(t),isNaN(t)?null:t;case"width":case"height":case"inlineHeight":case"inlineTop":case"verticalAlign":return t=parseFloat(t),isNaN(t)?null:t;case"vFlip":case"hFlip":return !!t;case"body":case"parent":return "string"==typeof t?t:null}return t}("rotate",e+t)}function ue(e,t){return !!e!=!!t}function de(e){var i=Object.create(null);return (void 0===e._defaults?[e,v]:[e,e._defaults,v]).forEach(function(t){Object.keys(t).forEach(function(e){"object"!=typeof t[e]&&void 0===i[e]&&(i[e]=t[e]);});}),void 0===i.inlineTop&&(i.inlineTop=i.top),void 0===i.inlineHeight&&(i.inlineHeight=i.height),void 0===i.verticalAlign&&(i.height%7==0&&i.height%8!=0?i.verticalAlign=-.143:i.verticalAlign=-.125),i}function fe(){return this._icons=Object.create(null),this._aliases=Object.create(null),this._resolved=Object.create(null),this._add=function(e,t,i){var n=e?"_aliases":"_icons";void 0===this._resolved[t.prefix]?(this._resolved[t.prefix]=Object.create(null),this._icons[t.prefix]=Object.create(null),this._aliases[t.prefix]=Object.create(null)):(delete this._icons[t.prefix][t.icon],delete this._aliases[t.prefix][t.icon]),this._resolved[t.prefix][t.icon]=!1,this[n][t.prefix][t.icon]=i;},this._resolveIcon=function(e){var t,i,n,o,r,s;if(void 0===this._resolved[e.prefix]||void 0===this._resolved[e.prefix][e.icon])return null;if(!1!==this._resolved[e.prefix][e.icon])return this._resolved[e.prefix][e.icon];if(void 0!==this._icons[e.prefix][e.icon])return this._resolved[e.prefix][e.icon]=de(this._icons[e.prefix][e.icon]);for(i=0,t=this._aliases[e.prefix][e.icon],n=Object.create(null),Object.keys(t).forEach(function(e){"parent"!==e&&(n[e]=t[e]);}),o=t.parent;;){if(5<++i||void 0===this._resolved[e.prefix][o])return this._resolved[e.prefix][e.icon]=null;if(r=void 0===this._icons[e.prefix][o],s=this[r?"_aliases":"_icons"][e.prefix][o],Object.keys(s).forEach(function(e){if(void 0!==n[e])switch(e){case"rotate":n[e]=le(n[e],s[e]);break;case"hFlip":case"vFlip":n[e]=ue(n[e],s[e]);}else "parent"!==e&&(n[e]=s[e]);}),!r)break;o=s.parent;}return this._resolved[e.prefix][e.icon]=de(n)},this.addCollection=function(n){var o=this,r=Object.create(null);g.forEach(function(e){void 0!==n[e]?r[e]=n[e]:void 0!==v[e]&&(r[e]=v[e]);}),void 0!==n.icons&&Object.keys(n.icons).forEach(function(e){var t=p(e,n.prefix),i=n.icons[e];void 0!==i.body&&(i._defaults=r,o._add(!1,t,i));}),void 0!==n.aliases&&Object.keys(n.aliases).forEach(function(e){var t=p(e,n.prefix),i=n.aliases[e];if(void 0!==i.parent){if(void 0===n.prefix){if(i.parent.slice(0,t.prefix.length)!==t.prefix)return;i.parent=i.parent.slice(t.prefix.length+1);}o._add(!0,t,i);}});},this.addIcon=function(e,t,i){var n=void 0!==t.parent,o=p(e,i);if(n&&void 0===i){if(t.parent.slice(0,o.prefix.length)!==o.prefix)return;t.parent=t.parent.slice(o.prefix.length+1);}this._add(n,o,t);},this.exists=function(e,t){var i=p(e,t);return void 0!==this._resolved[i.prefix]&&void 0!==this._resolved[i.prefix][i.icon]},this.getIcon=function(e,t){var i=p(e,t);return this._resolveIcon(i)},this.copyIcon=function(e,t){var i,n=this.getIcon(e,t);return null===n?null:(i=Object.create(null),Object.keys(n).forEach(function(e){i[e]=n[e];}),i)},this.list=function(e){var i,n;return void 0!==e?void 0===this._resolved[e]?[]:Object.keys(this._resolved[e]):(i=[],n=this._resolved,Object.keys(n).forEach(function(t){i=i.concat(Object.keys(n[t]).map(function(e){return ""===t&&-1===e.indexOf("-")?e:t+":"+e}));}),i)},this}function he(){w&&(w=!1,m.scanDOM());}function pe(e,t,i){var n,o,r,s,a;if(1===t)return e;if(i=void 0===i?100:i,"number"==typeof e)return Math.ceil(e*t*i)/i;if("string"!=typeof e)return e;if(null===(n=e.split(A))||!n.length)return e;for(o=[],r=n.shift(),s=j.test(r);;){if(s?(a=parseFloat(r),isNaN(a)?o.push(r):o.push(Math.ceil(a*t*i)/i)):o.push(r),void 0===(r=n.shift()))return o.join("");s=!s;}}function ve(e,t,i){var n,o,r;for(n=0;n<t.length;n++)if(void 0!==e[o=t[n]])switch(typeof(r=e[o])){case"boolean":return r;case"number":return !!r;case"string":switch(r.toLowerCase()){case"1":case"true":case o:return !0;case"0":case"false":case"":return !1}}return i}function ge(e,t,i){var n,o;for(n=0;n<t.length;n++)if(void 0!==e[o=t[n]])return e[o];return i}function be(){var s=N.loaderMaxURLSize,o=Object.create(null);function a(e,t){var i,n=o[e];"function"!=typeof n?(n=n.replace("{icons}",t.join(",")),(i=document.createElement("script")).setAttribute("type","text/javascript"),i.setAttribute("src",n),i.setAttribute("async",!0),document.head.appendChild(i)):n.call(L,e,t);}function c(e){var t=void 0===N.API[e]?N.defaultAPI:N.API[e];return "function"==typeof t?(o[e]=t,!1):-1===t.indexOf("{icons}")?(o[e]=t,null):(t=t.replace("{prefix}",e).replace("{callback}","Iconify._loaderCallback"),(o[e]=t).replace("{icons}","").length)}Object.keys(T).forEach(function(i){var n=c(i),o=!1===n,r=[];if(null===n)return a(i,[]),void(F[i]=!0);T[i].forEach(function(e,t){o||(n+=e.length+1,s<=n&&(a(i,r),r=[],n=c(i)+e.length+1)),r.push(e);}),r.length&&a(i,r),F[i]=void 0===F[i]?T[i]:F[i].concat(T[i]),delete T[i];}),D=!1;}function me(e,t,i){return i||S.domready||N.loadBeforeDOMReady?(void 0===T[e]||-1===T[e].indexOf(t))&&(void 0===F[e]||!0!==F[e]&&-1===F[e].indexOf(t))&&(void 0===T[e]&&(T[e]=[]),T[e].push(t),D||(D=!0,window.setTimeout(be,0)),1):(o=t,void 0===R[n=e]&&(R[n]=Object.create(null)),R[n][o]=!0,void 0===S._loaderDOMReady&&(S._loaderDOMReady=S.DOMReadyCallback,S.DOMReadyCallback=function(){S._loaderDOMReady(),Object.keys(R).forEach(function(t){Object.keys(R[t]).forEach(function(e){L.iconExists(e,t)||me(t,e,!0);});});}),1);var n,o;}function ye(){var e;!1!==U&&U.length?(e=U,U=!1,Q.scanDOM(e)):U=!1;}function we(e){e.forEach(function(e){var t;if(!1===U&&(U=[],window.setTimeout(ye,0)),e.addedNodes)for(t=0;t<e.addedNodes.length;t++)U.push(e.addedNodes[t]);});}function _e(){q.observe(void 0===z._root?document.querySelector("body"):z._root,W);}function xe(e,t){var i;return "<?"===e.slice(0,2)&&(i=e.indexOf(">"),e=e.slice(i+1)),e=-1!==(i=(e=e.replace("viewbox=","viewBox=").replace("preserveaspectratio=","preserveAspectRatio=")).indexOf("</"))?e.replace("</",t+"</"):e.replace("/>",">"+t+"</svg>")}i=re,"function"!=typeof window.CustomEvent&&(se.prototype=window.Event.prototype,window.CustomEvent=se),i.event=function(e,t){document.dispatchEvent(new CustomEvent(e,t));},n=e,r=(o=re).config,s=null,o.DOMReadyCallback=function(){o.domready=!0,o.nextInitItem();},o.initTimeout=function(e){function t(){if(null!==s){if(!1!==s.callback())return s.stop(),void o.nextInitItem();s.counter++,10!==s.counter&&25!==s.counter||(window.clearInterval(s.id),s.id=window.setInterval(t,10===s.counter?250:1e3));}}null!==s&&s.stop(),s={id:window.setInterval(t,100),counter:0,callback:e,stop:function(){window.clearInterval(s.id),s=null;},nextTick:t};},o.domready=!1,o.ready=!1,o.initQueue=[],o.readyQueue=[],o.nextInitItem=function(){var e;if(!o.ready){if(o.initQueue.length)e=o.initQueue.shift();else {if(!o.domready)return void o.initTimeout(function(){return !o.domready&&document.body&&o.scanDOM(),o.domready});if(!o.readyQueue.length)return o.ready=n.isReady=!0,o.event(r._readyEvent),void o.scanDOM();e=o.readyQueue.shift();}!1!==e()&&o.nextInitItem();}},o.addStylesheet=function(e){var t;if(!document.head||!document.body)return !!o.domready||(e||o.initTimeout(o.addStylesheet.bind(null,!0)),!1);try{(t=document.createElement("style")).type="text/css",t.innerHTML="span.iconify, i.iconify, iconify-icon { display: inline-block; width: 1em; }",null!==document.head.firstChild?document.head.insertBefore(t,document.head.firstChild):document.head.appendChild(t);}catch(e){}return !0},o.initQueue.push(o.addStylesheet.bind(null,!1)),n.ready=function(e){n.isReady?window.setTimeout(e):document.addEventListener(r._readyEvent,e);},window.setTimeout(function(){"complete"===document.readyState||"loading"!==document.readyState&&!document.documentElement.doScroll?o.domready=!0:(document.addEventListener("DOMContentLoaded",ae),window.addEventListener("load",ae)),o.nextInitItem();}),(a=re.config).SVGAttributes=Object.create(null),a._imageClass="iconify",a._loadingClass="svg-loading",a._iconAttribute="data-icon",a._rotateAttribute="data-rotate",a._flipAttribute="data-flip",a._inlineModeAttribute="data-inline",a._alignAttribute="data-align",a._appendAttribute="data-icon-append",a._appendedClass="svg-appended",a._readyEvent="IconifyReady",a._webComponentsPolyfill="https://cdnjs.cloudflare.com/ajax/libs/webcomponentsjs/0.7.24/webcomponents-lite.min.js",a._classListPolyfill="https://cdnjs.cloudflare.com/ajax/libs/classlist/1.1.20150312/classList.min.js",function(t){t.defaultAPI="https://api.iconify.design/{prefix}.js?icons={icons}",t.API=Object.create(null),t.loaderMaxURLSize=500,t.loadBeforeDOMReady=!(document&&document.body),t._loaderEvent="IconifyAddedIcons",t.sessionStorage=!0;try{t.localStorage=!!(window&&window.localStorage&&window.localStorage.length);}catch(e){t.localStorage=!1;}}(re.config),c=e,l=t,u=re.config,c.setConfig=function(e,t){ce(e,t,!1);},c.setCustomAPI=function(e,t){switch(typeof e){case"string":0;break;case"object":if(e instanceof Array){0;break}default:return}e.forEach(function(e){null===t?delete u.API[e]:u.API[e]=t;});},c.getConfig=function(e){return void 0===u[e]?void 0===u["_"+e]?null:u["_"+e]:u[e]},["SimpleSVG","Iconify"].forEach(function(e){var t;void 0!==l[e+"Config"]&&"object"==typeof l[e+"Config"]&&(t=l[e+"Config"],Object.keys(t).forEach(function(e){ce(e,t[e],!0);}));}),f=(d=re).config,h=t,d.initQueue.push(function(){var e={observer:!1,classList:!1},t={observer:!1,classList:!1};function i(e){var t;return !e.length||(document.head?((t=document.createElement("script")).setAttribute("src",e),t.setAttribute("type","text/javascript"),document.head.appendChild(t),!0):d.domready)}function n(){if("classList"in document.createElement("div"))return 1;t.classList||(t.classList=i(f._classListPolyfill));}function o(){return h.MutationObserver&&h.WeakMap||t.observer||(t.observer=i(f._webComponentsPolyfill)),1}return e.classList=!n(),e.observer=!o(),!e.classList&&!e.observer||(d.initTimeout(function(){return !(e.observer&&!o()||e.classList&&!n())}),!1)}),re.getPrefix=function(e,t){var i;return "string"==typeof t&&""!==t?{prefix:t,icon:e}:2===(i=e.split(":")).length?{prefix:i[0],icon:i[1]}:1<(i=e.split("-")).length?{prefix:t=i.shift(),icon:i.join("-")}:{prefix:"",icon:e}},p=re.getPrefix,v={left:0,top:0,width:16,height:16,rotate:0,vFlip:!1,hFlip:!1},g=["left","top","width","height","body","rotate","vFlip","hFlip","inlineTop","inlineHeight","verticalAlign"],fe.mergeFlip=ue,fe.mergeRotation=le,fe.blankIcon=function(){return de({body:"",width:16,height:16})},re.Storage=fe,b=e,y=t,w=!1,_=new(m=re).Storage,b.addCollection=function(e,t){_.addCollection(e),w||!0===t||(w=!0,window.setTimeout(he,0));},b.addIcon=function(e,t,i){_.addIcon(e,t),w||!0===i||(w=!0,window.setTimeout(he,0));},b.iconExists=_.exists.bind(_),b.getIcon=_.copyIcon.bind(_),b.listIcons=_.list.bind(_),["SimpleSVG","Iconify"].forEach(function(e){void 0!==y[e+"Preload"]&&y[e+"Preload"]instanceof Array&&y[e+"Preload"].forEach(function(e){"object"==typeof e&&void 0!==e.icons&&b.addCollection(e);});}),x=re.Storage,O=re.config,A=/(-?[0-9.]*[0-9]+[0-9.]*)/g,j=/^-?[0-9.]*[0-9]+[0-9.]*$/g,I=["width","height","inline"],E=["title"],k=0,re.SVG=function(_){return _=_||x.blankIcon(),this.item=_,this.height=function(e,t,i){return void 0===e?t?this.item.inlineHeight:this.item.height:pe(e,(t?this.item.inlineHeight:this.item.height)/this.item.width,i)},this.width=function(e,t,i){return void 0===e?this.item.width:pe(e,this.item.width/(t?this.item.inlineHeight:this.item.height),i)},this.defaultAttributes=function(){return {xmlns:"http://www.w3.org/2000/svg","xmlns:xlink":"http://www.w3.org/1999/xlink","aria-hidden":"true",focusable:"false"}},this.preserveAspectRatio=function(e,t,i){var n="";switch(e){case"left":n+="xMin";break;case"right":n+="xMax";break;default:n+="xMid";}switch(t){case"top":n+="YMin";break;case"bottom":n+="YMax";break;default:n+="YMid";}return n+=!0===i?" slice":" meet"},this.htmlspecialchars=function(e){switch(typeof e){case"boolean":case"number":return e+"";case"string":return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}return ""},this.attributes=function(t){var e,i,n,o,r,s,a,c,l,u,d,f,h,p,v=this,g={horizontal:"center",vertical:"middle",crop:!1},b={rotate:_.rotate,hFlip:_.hFlip,vFlip:_.vFlip},m="",y=this.defaultAttributes(),w=[];if(s=ve(t="object"==typeof t?t:Object.create(null),[O._inlineModeAttribute,"inline"],!0),u=ve(t,[O._appendAttribute],!1),e={left:_.left,top:s?_.inlineTop:_.top,width:_.width,height:s?_.inlineHeight:_.height},"string"==typeof t[O._flipAttribute]&&t[O._flipAttribute].split(/[\s,]+/).forEach(function(e){switch(e=e.toLowerCase()){case"horizontal":b.hFlip=!b.hFlip;break;case"vertical":b.vFlip=!b.vFlip;}}),void 0!==t[O._rotateAttribute])if("number"==typeof(c=t[O._rotateAttribute]))b.rotate+=c;else if("string"==typeof c)if(""===(d=c.replace(/^-?[0-9.]*/,"")))c=parseInt(c),isNaN(c)||(b.rotate+=c);else if(d!==c){switch(l=!1,d){case"%":l=25;break;case"deg":l=90;}l&&(c=parseInt(c.slice(0,c.length-d.length)),isNaN(c)||(b.rotate+=Math.round(c/l)));}switch(b.hFlip?b.vFlip?b.rotate+=2:(w.push("translate("+(e.width+e.left)+" "+(0-e.top)+")"),w.push("scale(-1 1)"),e.top=e.left=0):b.vFlip&&(w.push("translate("+(0-e.left)+" "+(e.height+e.top)+")"),w.push("scale(1 -1)"),e.top=e.left=0),b.rotate%4){case 1:p=e.height/2+e.top,w.unshift("rotate(90 "+p+" "+p+")"),0===e.left&&0===e.top||(p=e.left,e.left=e.top,e.top=p),e.width!==e.height&&(p=e.width,e.width=e.height,e.height=p);break;case 2:w.unshift("rotate(180 "+(e.width/2+e.left)+" "+(e.height/2+e.top)+")");break;case 3:p=e.width/2+e.left,w.unshift("rotate(-90 "+p+" "+p+")"),0===e.left&&0===e.top||(p=e.left,e.left=e.top,e.top=p),e.width!==e.height&&(p=e.width,e.width=e.height,e.height=p);}return i=ge(t,["data-width","width"],null),n=ge(t,["data-height","height"],null),null===i&&null===n&&(n="1em"),null!==i&&null!==n?(o=i,r=n):null!==i?r=pe(o=i,e.height/e.width):o=pe(r=n,e.width/e.height),!1!==o&&(y.width="auto"===o?e.width:o),!1!==r&&(y.height="auto"===r?e.height:r),s&&0!==_.verticalAlign?m+="vertical-align: "+(h=_.verticalAlign+"em")+";":h="","string"==typeof t[O._alignAttribute]&&t[O._alignAttribute].toLowerCase().split(/[\s,]+/).forEach(function(e){switch(e){case"left":case"right":case"center":g.horizontal=e;break;case"top":case"bottom":case"middle":g.vertical=e;break;case"crop":g.crop=!0;break;case"meet":g.crop=!1;}}),m+="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg); transform: rotate(360deg);",y.style=m+(void 0===t.style?"":t.style),y.preserveAspectRatio=this.preserveAspectRatio(g.horizontal,g.vertical,g.crop),y.viewBox=e.left+" "+e.top+" "+e.width+" "+e.height,a=function(i){var e,n,t=/\sid="(\S+)"/g,o=[];function r(e,t,i){for(var n=0;-1!==(n=i.indexOf(e,n));)i=i.slice(0,n)+t+i.slice(n+e.length),n+=t.length;return i}for(;e=t.exec(i);)o.push(e[1]);return o.length&&(n="IconifyId-"+Date.now().toString(16)+"-"+(16777216*Math.random()|0).toString(16)+"-",o.forEach(function(e){var t=n+k;k++,i=r('="'+e+'"','="'+t+'"',i),i=r('="#'+e+'"','="#'+t+'"',i),i=r("(#"+e+")","(#"+t+")",i);})),i}(this.item.body),w.length&&(a='<g transform="'+w.join(" ")+'">'+a+"</g>"),f=Object.create(null),Object.keys(t).forEach(function(e){void 0===y[e]&&(-1!==E.indexOf(e)?a="<"+e+">"+v.htmlspecialchars(t[e])+"</"+e+">"+a:-1===I.indexOf(e)&&(f[e]=t[e]));}),{attributes:y,elementAttributes:f,body:a,append:u,verticalAlign:h}},this},M=(C=re).config._loadingClass,C.newImage=function(e,t,i){return {element:e,icon:t,parser:i,loading:e.classList.contains(M)}},C.parsedImage=function(e,t){return {element:e,icon:t}},C.getImageAttributes=function(t){var e,i,n=Object.create(null);if(!t.element.hasAttributes())return n;for(e=0;e<t.element.attributes.length;e++)i=t.element.attributes[e],n[i.name]=i.value;return t.parser&&void 0!==t.parser.filterAttributes&&(n=t.parser.filterAttributes(t,n)),void 0!==n.class&&(n.class=n.class.split(" ").filter(function(e){return e!==M}),t.parser&&void 0!==t.parser.filterClasses&&(n.class=t.parser.filterClasses(t,n.class)),n.class=n.class.join(" ")),void 0!==t.attributes&&Object.keys(t.attributes).forEach(function(e){n[e]=t.attributes[e];}),n},function(n,f,e){var s=e._imageClass,t=e._loadingClass,i=e._appendedClass,a=e._iconAttribute,o=e._inlineModeAttribute,r=":not(svg):not(."+i+")",c=":not(."+t+")",l="."+t,h={iconify:{selector:"."+s,selectorAll:"."+s+r,selectorNew:"."+s+r+c,selectorLoading:"."+s+r+l,icon:function(e){var t,i=e.getAttribute(a);if("string"==typeof i)return i;for(var n=0;n<e.classList.length;n++)if(5<(t=e.classList[n]).length&&"icon:"===t.slice(0,5))return t.slice(5);return ""},filterClasses:function(e,t){var i,n,o;for(n=0;n<t.length;n++)"icon-"===(i=t[n]).slice(0,5)&&2===(i=i.slice(5).split(":")).length&&(o="data-"+i[0],void 0===e.attributes&&(e.attributes=Object.create(null)),e.attributes[o]=i[1]);return t}}},p=Object.keys(h);n.addFinder=function(e,t){void 0===t.selectorAll&&(t.selectorAll=t.selector+r),void 0===t.selectorNew&&(t.selectorNew=t.selector+r+c),void 0===t.selectorLoading&&(t.selectorLoading=t.selector+r+l),h[e]=t,p=Object.keys(h),n.isReady&&n.scanDOM();},n.addTag=function(e,i,t){n.addFinder("tag-"+e,{selector:e,icon:null==t?h.iconify.icon:t,filterAttributes:function(e,t){return void 0===t[o]&&(t[o]=i),t},filterClasses:h.iconify.filterClasses});};try{"object"==typeof Reflect&&"object"==typeof customElements&&Object.setPrototypeOf&&(Object.setPrototypeOf(u.prototype,HTMLElement.prototype),Object.setPrototypeOf(u,HTMLElement),customElements.define("iconify-icon",u));}catch(e){}function u(){return Reflect.construct(HTMLElement,[],u)}n.addTag("iconify-icon",!1),f.findNewImages=function(c,l){var u=[],d=[];return (c=void 0===c?void 0===e._root?document.body:e._root:c)&&p.forEach(function(e){var t,i,n,o,r=h[e],s=!0===l?r.selectorLoading:!1===l?r.selectorNew:r.selectorAll,a=c.querySelectorAll(s);for(t=0;t<a.length;t++)i=a[t],(n=r.icon(i))&&-1===d.indexOf(i)&&(d.push(i),o=f.newImage(i,n,r),u.push(o));}),u},f.findParsedImages=function(e){var t,i,n,o=[],r=e.querySelectorAll("svg."+s);for(t=0;t<r.length;t++)(n=(i=r[t]).getAttribute(a))&&o.push(f.parsedImage(i,n));return o};}(e,re,re.config),L=e,N=(S=re).config,P=t,T=Object.create(null),F=Object.create(null),R=Object.create(null),H={session:!(D=!1),local:!0},V={session:0,local:0},L._loaderCallback=function(i){var n=!1;"object"==typeof i&&(["local","session"].forEach(function(t){var e;if(!n&&H[t]&&N[t+"Storage"]){e=P[t+"Storage"];try{V[t]||e.setItem("iconify-version",S.version),e.setItem("iconify"+V[t],JSON.stringify(i)),n=!0,V[t]++,e.setItem("iconify-count",V[t]);}catch(e){H[t]=!1;}}}),L.addCollection(i),S.event(N._loaderEvent));},S.loadImage=function(e,t){var i=S.getPrefix(e.icon);return !!L.iconExists(i.icon,i.prefix)||(!1!==t&&me(i.prefix,i.icon,!1)&&e.element.classList.add(N._loadingClass),!1)},L.preloadImages=function(e){var t,i=!1;return e.forEach(function(e){t=S.getPrefix(e),L.iconExists(t.icon,t.prefix)||(me(t.prefix,t.icon,!0),i=!0);}),i},["local","session"].forEach(function(t){var e,i,n;try{if("object"!=typeof(e=P[t+"Storage"]))return void(H[t]=!1);if(e.getItem("iconify-version")!==S.version)return;if("number"!=typeof(n=parseInt(e.getItem("iconify-count")))||isNaN(n))return;for(;;){if(V[t]>=n)return;if("string"!=typeof(i=e.getItem("iconify"+V[t])))return;"object"==typeof(i=JSON.parse(i))&&L.addCollection(i),V[t]++;}}catch(e){H[t]=!1;}}),G=e,z=(Q=re).config,B=t,Y=0,W={childList:!(U=!1),subtree:!(J=q=null)},G.pauseObserving=function(){null!==q&&(Y||(J=q.takeRecords(),q.disconnect())),Y++;},G.resumeObserving=function(){null!==q?Y&&(--Y||(_e(),null!==J&&J.length&&we(J))):Y--;},G.isObserverPaused=function(){return null===q||!!Y},Q.readyQueue.push(function(){return q=new B.MutationObserver(we),Y||_e(),!0}),$=e,X=(K=re).config,Z=X._iconAttribute,ee=X._loadingClass,te=X._imageClass,ie=X._appendedClass,K.renderSVG=function(t){var e,i,n,o,r,s,a,c,l,u,d,f=K.getImageAttributes(t),h=$.getIcon(t.icon);for(f[Z]=t.icon,e=new K.SVG(h),n=document.createElement("svg"),r=e.attributes(f),Object.keys(r.attributes).forEach(function(e){if(d=r.attributes[e],"style"!==e||"string"==typeof(d=t.element.getAttribute("style"))&&d.length)try{n.setAttribute(e,d);}catch(e){}}),Object.keys(r.elementAttributes).forEach(function(e){try{(r.append?t.element:n).setAttribute(e,r.elementAttributes[e]);}catch(e){}}),t.loading&&(n.classList.remove(ee),r.append&&t.element.classList.remove(ee)),n.classList.add(te),s=xe(n.outerHTML,r.body),(o=document.createElement("span")).innerHTML=s,i=o.childNodes[0],r.append?(t.element.classList.add(ie),t.element.appendChild(i)):(t.element.parentNode.replaceChild(i,t.element),t.element=i),a=i.style,c=t.element.style,r.verticalAlign&&(a.verticalAlign=r.verticalAlign),a.transform="rotate(360deg)",l=0;l<c.length;l++)a[u=c[l]]=c[u];delete t.parser,delete t.loading;},$.getSVGObject=function(e,t){return !!$.iconExists(e)&&new K.SVG($.getIcon(e)).attributes(t,!1)},$.getSVG=function(e,t){var i,n;return !1!==(n=$.getSVGObject(e,t))&&(i=document.createElement("svg"),Object.keys(n.attributes).forEach(function(e){try{i.setAttribute(e,n.attributes[e]);}catch(e){}}),xe(i.outerHTML,n.body))},ne=e,(oe=re).scanDOM=function(){var t=!1;function e(){oe.findNewImages().forEach(function(e){oe.loadImage(e)&&(t||(t=!0,ne.pauseObserving()),oe.renderSVG(e));});}if(oe.ready)e();else try{e();}catch(e){}t&&ne.resumeObserving();},ne.scanDOM=oe.scanDOM,ne.getVersion=function(){return oe.version};}(self.Iconify,self)),"object"=='object')try{exports.__esModule=!0,exports.default=self.Iconify;}catch(e){}
});

var Iconify = /*@__PURE__*/getDefaultExportFromCjs(iconify_min);

/* node_modules/svelte-dynamic-iconify/src/icon.svelte generated by Svelte v3.37.0 */
const file = "node_modules/svelte-dynamic-iconify/src/icon.svelte";

// (22:0) {#if iconExists}
function create_if_block(ctx) {
	let svg;
	let raw_value = /*iconData*/ ctx[0].body + "";
	let svg_levels = [Object.assign({}, /*iconData*/ ctx[0].attributes, /*$$props*/ ctx[2])];
	let svg_data = {};

	for (let i = 0; i < svg_levels.length; i += 1) {
		svg_data = assign(svg_data, svg_levels[i]);
	}

	const block = {
		c: function create() {
			svg = svg_element("svg");
			set_svg_attributes(svg, svg_data);
			toggle_class(svg, "svelte-y6w72t", true);
			add_location(svg, file, 22, 2, 515);
		},
		m: function mount(target, anchor) {
			insert_dev(target, svg, anchor);
			svg.innerHTML = raw_value;
		},
		p: function update(ctx, dirty) {
			if (dirty & /*iconData*/ 1 && raw_value !== (raw_value = /*iconData*/ ctx[0].body + "")) svg.innerHTML = raw_value;;

			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
				dirty & /*iconData, $$props*/ 5 && Object.assign({}, /*iconData*/ ctx[0].attributes, /*$$props*/ ctx[2])
			]));

			toggle_class(svg, "svelte-y6w72t", true);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(svg);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block.name,
		type: "if",
		source: "(22:0) {#if iconExists}",
		ctx
	});

	return block;
}

function create_fragment(ctx) {
	let span;
	let if_block = /*iconExists*/ ctx[1] && create_if_block(ctx);

	const block = {
		c: function create() {
			span = element("span");
			if (if_block) if_block.c();
			attr_dev(span, "class", "iconify svelte-y6w72t");
			add_location(span, file, 20, 0, 473);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, span, anchor);
			if (if_block) if_block.m(span, null);
		},
		p: function update(ctx, [dirty]) {
			if (/*iconExists*/ ctx[1]) {
				if (if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block = create_if_block(ctx);
					if_block.c();
					if_block.m(span, null);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(span);
			if (if_block) if_block.d();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance($$self, $$props, $$invalidate) {
	let iconData;
	let iconExists;
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("Icon", slots, []);

	onMount(async () => {
		if (!name) return;
		Iconify.preloadImages([name]);

		document.addEventListener("IconifyAddedIcons", function () {
			$$invalidate(0, iconData = Iconify.getSVGObject(name));
			$$invalidate(1, iconExists = Iconify.iconExists(name));
		});
	});

	let { name } = $$props;

	$$self.$$set = $$new_props => {
		$$invalidate(2, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
		if ("name" in $$new_props) $$invalidate(3, name = $$new_props.name);
	};

	$$self.$capture_state = () => ({
		Iconify,
		onMount,
		name,
		iconData,
		iconExists
	});

	$$self.$inject_state = $$new_props => {
		$$invalidate(2, $$props = assign(assign({}, $$props), $$new_props));
		if ("name" in $$props) $$invalidate(3, name = $$new_props.name);
		if ("iconData" in $$props) $$invalidate(0, iconData = $$new_props.iconData);
		if ("iconExists" in $$props) $$invalidate(1, iconExists = $$new_props.iconExists);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*name*/ 8) {
			$: $$invalidate(0, iconData = name ? Iconify.getSVGObject(name) : false);
		}

		if ($$self.$$.dirty & /*name*/ 8) {
			$: $$invalidate(1, iconExists = name ? Iconify.iconExists(name) : false);
		}
	};

	$$props = exclude_internal_props($$props);
	return [iconData, iconExists, $$props, name];
}

class Icon extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance, create_fragment, safe_not_equal, { name: 3 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Icon",
			options,
			id: create_fragment.name
		});

		const { ctx } = this.$$;
		const props = options.props || {};

		if (/*name*/ ctx[3] === undefined && !("name" in props)) {
			console.warn("<Icon> was created without expected prop 'name'");
		}
	}

	get name() {
		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set name(value) {
		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* app/javascript/pages/index.svelte generated by Svelte v3.37.0 */

const { console: console_1 } = globals;
const file$1 = "app/javascript/pages/index.svelte";

// (46:6) <Button on:click={paste}>
function create_default_slot_4(ctx) {
	let icon;
	let current;

	icon = new Icon({
			props: { name: "fa-solid:paste" },
			$$inline: true
		});

	const block = {
		c: function create() {
			create_component(icon.$$.fragment);
		},
		m: function mount(target, anchor) {
			mount_component(icon, target, anchor);
			current = true;
		},
		p: noop,
		i: function intro(local) {
			if (current) return;
			transition_in(icon.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(icon.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(icon, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_4.name,
		type: "slot",
		source: "(46:6) <Button on:click={paste}>",
		ctx
	});

	return block;
}

// (47:6) <Button id="submit-button" type="submit">
function create_default_slot_3(ctx) {
	let t_value = /*$_*/ ctx[1]("short") + "";
	let t;

	const block = {
		c: function create() {
			t = text(t_value);
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		p: function update(ctx, dirty) {
			if (dirty & /*$_*/ 2 && t_value !== (t_value = /*$_*/ ctx[1]("short") + "")) set_data_dev(t, t_value);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_3.name,
		type: "slot",
		source: "(47:6) <Button id=\\\"submit-button\\\" type=\\\"submit\\\">",
		ctx
	});

	return block;
}

// (44:4) <InputGroup label={$_('link')} class="form-group-fixed-height">
function create_default_slot_2(ctx) {
	let field;
	let updating_value;
	let t0;
	let button0;
	let t1;
	let button1;
	let current;

	function field_value_binding(value) {
		/*field_value_binding*/ ctx[3](value);
	}

	let field_props = {
		id: "url-input",
		placeholder: /*$_*/ ctx[1]("what are we hiding?"),
		name: "url"
	};

	if (/*url*/ ctx[0] !== void 0) {
		field_props.value = /*url*/ ctx[0];
	}

	field = new Field({ props: field_props, $$inline: true });
	binding_callbacks.push(() => bind(field, "value", field_value_binding));
	field.$on("change", onChange);

	button0 = new Button({
			props: {
				$$slots: { default: [create_default_slot_4] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	button0.$on("click", paste);

	button1 = new Button({
			props: {
				id: "submit-button",
				type: "submit",
				$$slots: { default: [create_default_slot_3] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	const block = {
		c: function create() {
			create_component(field.$$.fragment);
			t0 = space();
			create_component(button0.$$.fragment);
			t1 = space();
			create_component(button1.$$.fragment);
		},
		m: function mount(target, anchor) {
			mount_component(field, target, anchor);
			insert_dev(target, t0, anchor);
			mount_component(button0, target, anchor);
			insert_dev(target, t1, anchor);
			mount_component(button1, target, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			const field_changes = {};
			if (dirty & /*$_*/ 2) field_changes.placeholder = /*$_*/ ctx[1]("what are we hiding?");

			if (!updating_value && dirty & /*url*/ 1) {
				updating_value = true;
				field_changes.value = /*url*/ ctx[0];
				add_flush_callback(() => updating_value = false);
			}

			field.$set(field_changes);
			const button0_changes = {};

			if (dirty & /*$$scope*/ 64) {
				button0_changes.$$scope = { dirty, ctx };
			}

			button0.$set(button0_changes);
			const button1_changes = {};

			if (dirty & /*$$scope, $_*/ 66) {
				button1_changes.$$scope = { dirty, ctx };
			}

			button1.$set(button1_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(field.$$.fragment, local);
			transition_in(button0.$$.fragment, local);
			transition_in(button1.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(field.$$.fragment, local);
			transition_out(button0.$$.fragment, local);
			transition_out(button1.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(field, detaching);
			if (detaching) detach_dev(t0);
			destroy_component(button0, detaching);
			if (detaching) detach_dev(t1);
			destroy_component(button1, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_2.name,
		type: "slot",
		source: "(44:4) <InputGroup label={$_('link')} class=\\\"form-group-fixed-height\\\">",
		ctx
	});

	return block;
}

// (43:2) <Form class="shortener-form" {...formProps}>
function create_default_slot_1(ctx) {
	let inputgroup;
	let current;

	inputgroup = new InputGroup({
			props: {
				label: /*$_*/ ctx[1]("link"),
				class: "form-group-fixed-height",
				$$slots: { default: [create_default_slot_2] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	const block = {
		c: function create() {
			create_component(inputgroup.$$.fragment);
		},
		m: function mount(target, anchor) {
			mount_component(inputgroup, target, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			const inputgroup_changes = {};
			if (dirty & /*$_*/ 2) inputgroup_changes.label = /*$_*/ ctx[1]("link");

			if (dirty & /*$$scope, $_, url*/ 67) {
				inputgroup_changes.$$scope = { dirty, ctx };
			}

			inputgroup.$set(inputgroup_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(inputgroup.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(inputgroup.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(inputgroup, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_1.name,
		type: "slot",
		source: "(43:2) <Form class=\\\"shortener-form\\\" {...formProps}>",
		ctx
	});

	return block;
}

// (42:0) <Card>
function create_default_slot(ctx) {
	let form;
	let current;
	const form_spread_levels = [{ class: "shortener-form" }, /*formProps*/ ctx[2]];

	let form_props = {
		$$slots: { default: [create_default_slot_1] },
		$$scope: { ctx }
	};

	for (let i = 0; i < form_spread_levels.length; i += 1) {
		form_props = assign(form_props, form_spread_levels[i]);
	}

	form = new Form_1({ props: form_props, $$inline: true });

	const block = {
		c: function create() {
			create_component(form.$$.fragment);
		},
		m: function mount(target, anchor) {
			mount_component(form, target, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			const form_changes = (dirty & /*formProps*/ 4)
			? get_spread_update(form_spread_levels, [form_spread_levels[0], get_spread_object(/*formProps*/ ctx[2])])
			: {};

			if (dirty & /*$$scope, $_, url*/ 67) {
				form_changes.$$scope = { dirty, ctx };
			}

			form.$set(form_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(form.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(form.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(form, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot.name,
		type: "slot",
		source: "(42:0) <Card>",
		ctx
	});

	return block;
}

function create_fragment$1(ctx) {
	let card;
	let current;

	card = new Card({
			props: {
				$$slots: { default: [create_default_slot] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	const block = {
		c: function create() {
			create_component(card.$$.fragment);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			mount_component(card, target, anchor);
			current = true;
		},
		p: function update(ctx, [dirty]) {
			const card_changes = {};

			if (dirty & /*$$scope, $_, url*/ 67) {
				card_changes.$$scope = { dirty, ctx };
			}

			card.$set(card_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(card.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(card.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(card, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$1.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function paste() {
	navigator.clipboard.readText().then(text => {
		let el = document.getElementById("url-input");
		el.value = text;
		el.select();

		// formProps.validate({url:text})
		document.getElementById("submit-button").focus();
	});
}

function onChange(el) {
	console.log(el);
}

function instance$1($$self, $$props, $$invalidate) {
	let $_;
	validate_store(X, "_");
	component_subscribe($$self, X, $$value => $$invalidate(1, $_ = $$value));
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("Pages", slots, []);
	let url = "", input, inputEl;

	// const { form, handleChange, handleSubmit } = createForm({
	let formProps = {
		initialValues: { url },
		validate: values => Nope.object().shape({
			url: Nope.string().url($_("should be an address")).required($_("where is the link?"))
		}).validate(values),
		onSubmit: values => {
			api.post("links", values);
			console.log(values);
		}
	};

	const writable_props = [];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Pages> was created with unknown prop '${key}'`);
	});

	function field_value_binding(value) {
		url = value;
		$$invalidate(0, url);
	}

	$$self.$capture_state = () => ({
		Button,
		Card,
		InputGroup,
		Form: Form_1,
		Field,
		createForm,
		nope: Nope,
		_: X,
		Icon,
		url,
		input,
		inputEl,
		formProps,
		paste,
		onChange,
		$_
	});

	$$self.$inject_state = $$props => {
		if ("url" in $$props) $$invalidate(0, url = $$props.url);
		if ("input" in $$props) input = $$props.input;
		if ("inputEl" in $$props) inputEl = $$props.inputEl;
		if ("formProps" in $$props) $$invalidate(2, formProps = $$props.formProps);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [url, $_, formProps, field_value_binding];
}

class Pages extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Pages",
			options,
			id: create_fragment$1.name
		});
	}
}

export default Pages;
//# sourceMappingURL=index-4613246d.js.map
