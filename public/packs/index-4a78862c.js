
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
import { g as globals, c as create_component, m as mount_component, t as transition_in, a as transition_out, d as destroy_component, b as dispatch_dev, e as text, i as insert_dev, s as set_data_dev, f as detach_dev, F as FormGroup, B as Button, h as space, j as assign, k as get_spread_update, l as get_spread_object, C as Card, v as validate_store, X, n as component_subscribe, o as validate_slots, S as SvelteComponentDev, p as init, q as safe_not_equal } from './bundle.js';
import { F as Field, a as Form_1, c as createForm } from './index-d390b550.js';

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

/* app/javascript/pages/index.svelte generated by Svelte v3.37.0 */

const { console: console_1 } = globals;
const file = "app/javascript/pages/index.svelte";

// (28:4) <FormGroup label={$_('link')} class="form-group-fixed-height">
function create_default_slot_3(ctx) {
	let field;
	let current;

	field = new Field({
			props: {
				placeholder: /*$_*/ ctx[0]("what are we hiding?"),
				name: "url"
			},
			$$inline: true
		});

	const block = {
		c: function create() {
			create_component(field.$$.fragment);
		},
		m: function mount(target, anchor) {
			mount_component(field, target, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			const field_changes = {};
			if (dirty & /*$_*/ 1) field_changes.placeholder = /*$_*/ ctx[0]("what are we hiding?");
			field.$set(field_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(field.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(field.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(field, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_3.name,
		type: "slot",
		source: "(28:4) <FormGroup label={$_('link')} class=\\\"form-group-fixed-height\\\">",
		ctx
	});

	return block;
}

// (31:4) <Button type="submit">
function create_default_slot_2(ctx) {
	let t_value = /*$_*/ ctx[0]("short") + "";
	let t;

	const block = {
		c: function create() {
			t = text(t_value);
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		p: function update(ctx, dirty) {
			if (dirty & /*$_*/ 1 && t_value !== (t_value = /*$_*/ ctx[0]("short") + "")) set_data_dev(t, t_value);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_2.name,
		type: "slot",
		source: "(31:4) <Button type=\\\"submit\\\">",
		ctx
	});

	return block;
}

// (27:2) <Form {...formProps}>
function create_default_slot_1(ctx) {
	let formgroup;
	let t;
	let button;
	let current;

	formgroup = new FormGroup({
			props: {
				label: /*$_*/ ctx[0]("link"),
				class: "form-group-fixed-height",
				$$slots: { default: [create_default_slot_3] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	button = new Button({
			props: {
				type: "submit",
				$$slots: { default: [create_default_slot_2] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	const block = {
		c: function create() {
			create_component(formgroup.$$.fragment);
			t = space();
			create_component(button.$$.fragment);
		},
		m: function mount(target, anchor) {
			mount_component(formgroup, target, anchor);
			insert_dev(target, t, anchor);
			mount_component(button, target, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			const formgroup_changes = {};
			if (dirty & /*$_*/ 1) formgroup_changes.label = /*$_*/ ctx[0]("link");

			if (dirty & /*$$scope, $_*/ 9) {
				formgroup_changes.$$scope = { dirty, ctx };
			}

			formgroup.$set(formgroup_changes);
			const button_changes = {};

			if (dirty & /*$$scope, $_*/ 9) {
				button_changes.$$scope = { dirty, ctx };
			}

			button.$set(button_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(formgroup.$$.fragment, local);
			transition_in(button.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(formgroup.$$.fragment, local);
			transition_out(button.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(formgroup, detaching);
			if (detaching) detach_dev(t);
			destroy_component(button, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_1.name,
		type: "slot",
		source: "(27:2) <Form {...formProps}>",
		ctx
	});

	return block;
}

// (26:0) <Card>
function create_default_slot(ctx) {
	let form;
	let current;
	const form_spread_levels = [/*formProps*/ ctx[1]];

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
			const form_changes = (dirty & /*formProps*/ 2)
			? get_spread_update(form_spread_levels, [get_spread_object(/*formProps*/ ctx[1])])
			: {};

			if (dirty & /*$$scope, $_*/ 9) {
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
		source: "(26:0) <Card>",
		ctx
	});

	return block;
}

function create_fragment(ctx) {
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

			if (dirty & /*$$scope, $_*/ 9) {
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
		id: create_fragment.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance($$self, $$props, $$invalidate) {
	let $_;
	validate_store(X, "_");
	component_subscribe($$self, X, $$value => $$invalidate(0, $_ = $$value));
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("Pages", slots, []);
	let url = "";

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

	$$self.$capture_state = () => ({
		Button,
		Card,
		FormGroup,
		Form: Form_1,
		Field,
		createForm,
		nope: Nope,
		_: X,
		url,
		formProps,
		$_
	});

	$$self.$inject_state = $$props => {
		if ("url" in $$props) url = $$props.url;
		if ("formProps" in $$props) $$invalidate(1, formProps = $$props.formProps);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [$_, formProps];
}

class Pages extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance, create_fragment, safe_not_equal, {});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Pages",
			options,
			id: create_fragment.name
		});
	}
}

export default Pages;
//# sourceMappingURL=index-4a78862c.js.map
