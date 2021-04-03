
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
import { L as writable, M as derived, N as get_store_value, O as create_slot, P as update_slot, w as transition_in, x as transition_out, h as dispatch_dev, a as assign, Q as Form, r as create_component, u as mount_component, e as get_spread_update, G as get_spread_object, y as destroy_component, R as compute_rest_props, v as validate_slots, T as setContext, l as exclude_internal_props, S as SvelteComponentDev, m as init, p as safe_not_equal, j as element, z as text, U as set_attributes, d as add_location, i as insert_dev, V as append_dev, A as set_data_dev, f as detach_dev, W as empty, n as noop, Y as getContext, J as validate_store, K as component_subscribe, E as space, Z as listen_dev, _ as group_outros, $ as check_outros, a0 as run_all, a1 as Input } from './bundle.js';

const key = {};

var has = Object.prototype.hasOwnProperty;

function dequal(foo, bar) {
	var ctor, len;
	if (foo === bar) return true;

	if (foo && bar && (ctor=foo.constructor) === bar.constructor) {
		if (ctor === Date) return foo.getTime() === bar.getTime();
		if (ctor === RegExp) return foo.toString() === bar.toString();

		if (ctor === Array) {
			if ((len=foo.length) === bar.length) {
				while (len-- && dequal(foo[len], bar[len]));
			}
			return len === -1;
		}

		if (!ctor || typeof foo === 'object') {
			len = 0;
			for (ctor in foo) {
				if (has.call(foo, ctor) && ++len && !has.call(bar, ctor)) return false;
				if (!(ctor in bar) || !dequal(foo[ctor], bar[ctor])) return false;
			}
			return Object.keys(bar).length === len;
		}
	}

	return foo !== foo && bar !== bar;
}

function subscribeOnce(observable) {
  return new Promise((resolve) => {
    observable.subscribe(resolve)(); // immediately invoke to unsubscribe
  });
}

function update(object, path, value) {
  object.update((o) => {
    set(o, path, value);
    return o;
  });
}

function cloneDeep(object) {
  return JSON.parse(JSON.stringify(object));
}

function isNullish(value) {
  return value === undefined || value === null;
}

function isEmpty(object) {
  return isNullish(object) || Object.keys(object).length <= 0;
}

function getValues(object) {
  let result = [];
  for (const [, value] of Object.entries(object)) {
    result = [...result, typeof value === 'object' ? getValues(value) : value];
  }
  return result;
}

// TODO: refactor this so as not to rely directly on yup's API
// This should use dependency injection, with a default callback which may assume
// yup as the validation schema
function getErrorsFromSchema(initialValues, schema, errors = {}) {
  for (const key in schema) {
    switch (true) {
      case schema[key].type === 'object' && !isEmpty(schema[key].fields): {
        errors[key] = getErrorsFromSchema(
          initialValues[key],
          schema[key].fields,
          Object.assign({}, errors[key]),
        );
        break;
      }

      case schema[key].type === 'array': {
        const values =
          initialValues && initialValues[key] ? initialValues[key] : [];
        errors[key] = values.map((value) =>
          getErrorsFromSchema(
            value,
            schema[key].innerType.fields,
            Object.assign({}, errors[key]),
          ),
        );
        break;
      }

      default: {
        errors[key] = '';
      }
    }
  }

  return errors;
}

const deepEqual = dequal;

function assignDeep(object, value) {
  if (Array.isArray(object)) {
    return object.map((o) => assignDeep(o, value));
  }
  const copy = {};
  for (const key in object) {
    copy[key] =
      typeof object[key] === 'object' ? assignDeep(object[key], value) : value;
  }
  return copy;
}

function set(object, path, value) {
  if (new Object(object) !== object) return object;

  if (!Array.isArray(path)) {
    path = path.toString().match(/[^.[\]]+/g) || [];
  }

  const result = path
    .slice(0, -1)
    // TODO: replace this reduce with something more readable
    // eslint-disable-next-line unicorn/no-array-reduce
    .reduce(
      (accumulator, key, index) =>
        new Object(accumulator[key]) === accumulator[key]
          ? accumulator[key]
          : (accumulator[key] =
              Math.trunc(Math.abs(path[index + 1])) === +path[index + 1]
                ? []
                : {}),
      object,
    );

  result[path[path.length - 1]] = value;

  return object;
}

const util = {
  assignDeep,
  cloneDeep,
  deepEqual,
  getErrorsFromSchema,
  getValues,
  isEmpty,
  isNullish,
  set,
  subscribeOnce,
  update,
};

const NO_ERROR = '';
const IS_TOUCHED = true;

function isCheckbox(element) {
  return element.getAttribute && element.getAttribute('type') === 'checkbox';
}

const createForm = (config) => {
  let initialValues = config.initialValues || {};

  const validationSchema = config.validationSchema;
  const validateFunction = config.validate;
  const onSubmit = config.onSubmit;

  const getInitial = {
    values: () => util.cloneDeep(initialValues),
    errors: () =>
      validationSchema
        ? util.getErrorsFromSchema(initialValues, validationSchema.fields)
        : util.assignDeep(initialValues, NO_ERROR),
    touched: () => util.assignDeep(initialValues, !IS_TOUCHED),
  };

  const form = writable(getInitial.values());
  const errors = writable(getInitial.errors());
  const touched = writable(getInitial.touched());

  const isSubmitting = writable(false);
  const isValidating = writable(false);

  const isValid = derived(errors, ($errors) => {
    const noErrors = util
      .getValues($errors)
      .every((field) => field === NO_ERROR);
    return noErrors;
  });

  const modified = derived(form, ($form) => {
    const object = util.assignDeep($form, false);

    for (let key in $form) {
      object[key] = !util.deepEqual($form[key], initialValues[key]);
    }

    return object;
  });

  const isModified = derived(modified, ($modified) => {
    return util.getValues($modified).some((field) => field === true);
  });

  function validateField(field) {
    return util
      .subscribeOnce(form)
      .then((values) => validateFieldValue(field, values[field]));
  }

  function validateFieldValue(field, value) {
    updateTouched(field, true);

    if (validationSchema) {
      isValidating.set(true);

      return validationSchema
        .validateAt(field, get_store_value(form))
        .then(() => util.update(errors, field, ''))
        .catch((error) => util.update(errors, field, error.message))
        .finally(() => {
          isValidating.set(false);
        });
    }

    if (validateFunction) {
      isValidating.set(true);
      return Promise.resolve()
        .then(() => validateFunction({[field]: value}))
        .then((errs) =>
          util.update(errors, field, !util.isNullish(errs) ? errs[field] : ''),
        )
        .finally(() => {
          isValidating.set(false);
        });
    }

    return Promise.resolve();
  }

  function updateValidateField(field, value) {
    updateField(field, value);
    return validateFieldValue(field, value);
  }

  function handleChange(event) {
    const element = event.target;
    const field = element.name || element.id;
    const value = isCheckbox(element) ? element.checked : element.value;

    return updateValidateField(field, value);
  }

  function handleSubmit(event) {
    if (event && event.preventDefault) {
      event.preventDefault();
    }

    isSubmitting.set(true);

    return util.subscribeOnce(form).then((values) => {
      if (typeof validateFunction === 'function') {
        isValidating.set(true);

        return Promise.resolve()
          .then(() => validateFunction(values))
          .then((error) => {
            if (util.isEmpty(error)) {
              clearErrorsAndSubmit(values);
            } else {
              errors.set(error);
              isSubmitting.set(false);
            }
          })
          .finally(() => isValidating.set(false));
      }

      if (validationSchema) {
        isValidating.set(true);

        return (
          validationSchema
            .validate(values, {abortEarly: false})
            .then(() => clearErrorsAndSubmit(values))
            // eslint-disable-next-line unicorn/catch-error-name
            .catch((yupErrors) => {
              if (yupErrors && yupErrors.inner) {
                const updatedErrors = getInitial.errors();

                yupErrors.inner.map((error) =>
                  util.set(updatedErrors, error.path, error.message),
                );

                errors.set(updatedErrors);
              }
              isSubmitting.set(false);
            })
            .finally(() => isValidating.set(false))
        );
      }

      clearErrorsAndSubmit(values);
    });
  }

  function handleReset() {
    form.set(getInitial.values());
    errors.set(getInitial.errors());
    touched.set(getInitial.touched());
  }

  function clearErrorsAndSubmit(values) {
    return Promise.resolve()
      .then(() => errors.set(getInitial.errors()))
      .then(() => onSubmit(values, form, errors))
      .finally(() => isSubmitting.set(false));
  }

  /**
   * Handler to imperatively update the value of a form field
   */
  function updateField(field, value) {
    util.update(form, field, value);
  }

  /**
   * Handler to imperatively update the touched value of a form field
   */
  function updateTouched(field, value) {
    util.update(touched, field, value);
  }

  /**
   * Update the initial values and reset form. Used to dynamically display new form values
   */
  function updateInitialValues(newValues) {
    initialValues = newValues;

    handleReset();
  }

  return {
    form,
    errors,
    touched,
    modified,
    isValid,
    isSubmitting,
    isValidating,
    isModified,
    handleChange,
    handleSubmit,
    handleReset,
    updateField,
    updateValidateField,
    updateTouched,
    validateField,
    updateInitialValues,
    state: derived(
      [
        form,
        errors,
        touched,
        modified,
        isValid,
        isValidating,
        isSubmitting,
        isModified,
      ],
      ([
        $form,
        $errors,
        $touched,
        $modified,
        $isValid,
        $isValidating,
        $isSubmitting,
        $isModified,
      ]) => ({
        form: $form,
        errors: $errors,
        touched: $touched,
        modified: $modified,
        isValid: $isValid,
        isSubmitting: $isSubmitting,
        isValidating: $isValidating,
        isModified: $isModified,
      }),
    ),
  };
};

/* node_modules/sveltestrap-forms-lib/lib/components/Form.svelte generated by Svelte v3.37.0 */
const file = "node_modules/sveltestrap-forms-lib/lib/components/Form.svelte";
const get_default_slot_changes = dirty => ({});

const get_default_slot_context = ctx => ({
	form: /*form*/ ctx[0],
	errors: /*errors*/ ctx[1],
	touched: /*touched*/ ctx[2],
	state: /*state*/ ctx[3],
	handleChange: /*handleChange*/ ctx[4],
	handleSubmit: /*handleSubmit*/ ctx[5],
	updateField: /*updateField*/ ctx[6],
	updateTouched: /*updateTouched*/ ctx[7]
});

// (42:0) <Form on:submit={handleSubmit} {...$$restProps}>
function create_default_slot(ctx) {
	let current;
	const default_slot_template = /*#slots*/ ctx[13].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[14], get_default_slot_context);

	const block = {
		c: function create() {
			if (default_slot) default_slot.c();
		},
		m: function mount(target, anchor) {
			if (default_slot) {
				default_slot.m(target, anchor);
			}

			current = true;
		},
		p: function update(ctx, dirty) {
			if (default_slot) {
				if (default_slot.p && dirty & /*$$scope*/ 16384) {
					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[14], dirty, get_default_slot_changes, get_default_slot_context);
				}
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (default_slot) default_slot.d(detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot.name,
		type: "slot",
		source: "(42:0) <Form on:submit={handleSubmit} {...$$restProps}>",
		ctx
	});

	return block;
}

function create_fragment(ctx) {
	let form_1;
	let current;
	const form_1_spread_levels = [/*$$restProps*/ ctx[8]];

	let form_1_props = {
		$$slots: { default: [create_default_slot] },
		$$scope: { ctx }
	};

	for (let i = 0; i < form_1_spread_levels.length; i += 1) {
		form_1_props = assign(form_1_props, form_1_spread_levels[i]);
	}

	form_1 = new Form({ props: form_1_props, $$inline: true });
	form_1.$on("submit", /*handleSubmit*/ ctx[5]);

	const block = {
		c: function create() {
			create_component(form_1.$$.fragment);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			mount_component(form_1, target, anchor);
			current = true;
		},
		p: function update(ctx, [dirty]) {
			const form_1_changes = (dirty & /*$$restProps*/ 256)
			? get_spread_update(form_1_spread_levels, [get_spread_object(/*$$restProps*/ ctx[8])])
			: {};

			if (dirty & /*$$scope*/ 16384) {
				form_1_changes.$$scope = { dirty, ctx };
			}

			form_1.$set(form_1_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(form_1.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(form_1.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(form_1, detaching);
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
	const omit_props_names = ["initialValues","validate","validationSchema","onSubmit"];
	let $$restProps = compute_rest_props($$props, omit_props_names);
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("Form", slots, ['default']);
	let { initialValues = {} } = $$props;
	let { validate = null } = $$props;
	let { validationSchema = null } = $$props;
	let { onSubmit } = $$props;

	// export let showErrors = true
	const { form, errors, touched, state, handleChange, handleSubmit, updateField, updateTouched } = createForm({
		initialValues,
		validationSchema,
		validate,
		onSubmit
	});

	setContext(key, {
		form,
		errors,
		touched,
		state,
		handleChange,
		handleSubmit,
		updateField,
		updateTouched
	});

	$$self.$$set = $$new_props => {
		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
		$$invalidate(8, $$restProps = compute_rest_props($$props, omit_props_names));
		if ("initialValues" in $$new_props) $$invalidate(9, initialValues = $$new_props.initialValues);
		if ("validate" in $$new_props) $$invalidate(10, validate = $$new_props.validate);
		if ("validationSchema" in $$new_props) $$invalidate(11, validationSchema = $$new_props.validationSchema);
		if ("onSubmit" in $$new_props) $$invalidate(12, onSubmit = $$new_props.onSubmit);
		if ("$$scope" in $$new_props) $$invalidate(14, $$scope = $$new_props.$$scope);
	};

	$$self.$capture_state = () => ({
		Form,
		setContext,
		createForm,
		key,
		initialValues,
		validate,
		validationSchema,
		onSubmit,
		form,
		errors,
		touched,
		state,
		handleChange,
		handleSubmit,
		updateField,
		updateTouched
	});

	$$self.$inject_state = $$new_props => {
		if ("initialValues" in $$props) $$invalidate(9, initialValues = $$new_props.initialValues);
		if ("validate" in $$props) $$invalidate(10, validate = $$new_props.validate);
		if ("validationSchema" in $$props) $$invalidate(11, validationSchema = $$new_props.validationSchema);
		if ("onSubmit" in $$props) $$invalidate(12, onSubmit = $$new_props.onSubmit);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [
		form,
		errors,
		touched,
		state,
		handleChange,
		handleSubmit,
		updateField,
		updateTouched,
		$$restProps,
		initialValues,
		validate,
		validationSchema,
		onSubmit,
		slots,
		$$scope
	];
}

class Form_1 extends SvelteComponentDev {
	constructor(options) {
		super(options);

		init(this, options, instance, create_fragment, safe_not_equal, {
			initialValues: 9,
			validate: 10,
			validationSchema: 11,
			onSubmit: 12
		});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Form_1",
			options,
			id: create_fragment.name
		});

		const { ctx } = this.$$;
		const props = options.props || {};

		if (/*onSubmit*/ ctx[12] === undefined && !("onSubmit" in props)) {
			console.warn("<Form> was created without expected prop 'onSubmit'");
		}
	}

	get initialValues() {
		throw new Error("<Form>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set initialValues(value) {
		throw new Error("<Form>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get validate() {
		throw new Error("<Form>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set validate(value) {
		throw new Error("<Form>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get validationSchema() {
		throw new Error("<Form>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set validationSchema(value) {
		throw new Error("<Form>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get onSubmit() {
		throw new Error("<Form>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set onSubmit(value) {
		throw new Error("<Form>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* node_modules/sveltestrap-forms-lib/lib/components/ErrorMessage.svelte generated by Svelte v3.37.0 */
const file$1 = "node_modules/sveltestrap-forms-lib/lib/components/ErrorMessage.svelte";

// (10:0) {#if $errors[name]}
function create_if_block(ctx) {
	let small;
	let t_value = /*$errors*/ ctx[1][/*name*/ ctx[0]] + "";
	let t;
	let small_levels = [{ class: "text-danger" }, /*$$props*/ ctx[3]];
	let small_data = {};

	for (let i = 0; i < small_levels.length; i += 1) {
		small_data = assign(small_data, small_levels[i]);
	}

	const block = {
		c: function create() {
			small = element("small");
			t = text(t_value);
			set_attributes(small, small_data);
			add_location(small, file$1, 10, 2, 165);
		},
		m: function mount(target, anchor) {
			insert_dev(target, small, anchor);
			append_dev(small, t);
		},
		p: function update(ctx, dirty) {
			if (dirty & /*$errors, name*/ 3 && t_value !== (t_value = /*$errors*/ ctx[1][/*name*/ ctx[0]] + "")) set_data_dev(t, t_value);
			set_attributes(small, small_data = get_spread_update(small_levels, [{ class: "text-danger" }, dirty & /*$$props*/ 8 && /*$$props*/ ctx[3]]));
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(small);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block.name,
		type: "if",
		source: "(10:0) {#if $errors[name]}",
		ctx
	});

	return block;
}

function create_fragment$1(ctx) {
	let if_block_anchor;
	let if_block = /*$errors*/ ctx[1][/*name*/ ctx[0]] && create_if_block(ctx);

	const block = {
		c: function create() {
			if (if_block) if_block.c();
			if_block_anchor = empty();
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			insert_dev(target, if_block_anchor, anchor);
		},
		p: function update(ctx, [dirty]) {
			if (/*$errors*/ ctx[1][/*name*/ ctx[0]]) {
				if (if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block = create_if_block(ctx);
					if_block.c();
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (if_block) if_block.d(detaching);
			if (detaching) detach_dev(if_block_anchor);
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

function instance$1($$self, $$props, $$invalidate) {
	let $errors;
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("ErrorMessage", slots, []);
	let { name } = $$props;
	const { errors } = getContext(key);
	validate_store(errors, "errors");
	component_subscribe($$self, errors, value => $$invalidate(1, $errors = value));

	$$self.$$set = $$new_props => {
		$$invalidate(3, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
		if ("name" in $$new_props) $$invalidate(0, name = $$new_props.name);
	};

	$$self.$capture_state = () => ({ getContext, key, name, errors, $errors });

	$$self.$inject_state = $$new_props => {
		$$invalidate(3, $$props = assign(assign({}, $$props), $$new_props));
		if ("name" in $$props) $$invalidate(0, name = $$new_props.name);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	$$props = exclude_internal_props($$props);
	return [name, $errors, errors, $$props];
}

class ErrorMessage extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$1, create_fragment$1, safe_not_equal, { name: 0 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "ErrorMessage",
			options,
			id: create_fragment$1.name
		});

		const { ctx } = this.$$;
		const props = options.props || {};

		if (/*name*/ ctx[0] === undefined && !("name" in props)) {
			console.warn("<ErrorMessage> was created without expected prop 'name'");
		}
	}

	get name() {
		throw new Error("<ErrorMessage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set name(value) {
		throw new Error("<ErrorMessage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* node_modules/sveltestrap-forms-lib/lib/components/Textarea.svelte generated by Svelte v3.37.0 */
const file$2 = "node_modules/sveltestrap-forms-lib/lib/components/Textarea.svelte";

// (23:0) {#if showErrors}
function create_if_block$1(ctx) {
	let errormessage;
	let current;

	errormessage = new ErrorMessage({
			props: { name: /*name*/ ctx[0] },
			$$inline: true
		});

	const block = {
		c: function create() {
			create_component(errormessage.$$.fragment);
		},
		m: function mount(target, anchor) {
			mount_component(errormessage, target, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			const errormessage_changes = {};
			if (dirty & /*name*/ 1) errormessage_changes.name = /*name*/ ctx[0];
			errormessage.$set(errormessage_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(errormessage.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(errormessage.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(errormessage, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block$1.name,
		type: "if",
		source: "(23:0) {#if showErrors}",
		ctx
	});

	return block;
}

function create_fragment$2(ctx) {
	let textarea;
	let textarea_class_value;
	let textarea_value_value;
	let t;
	let if_block_anchor;
	let current;
	let mounted;
	let dispose;

	let textarea_levels = [
		{ name: /*name*/ ctx[0] },
		/*$$props*/ ctx[7],
		{
			class: textarea_class_value = /*$errors*/ ctx[2][/*name*/ ctx[0]]
			? "form-control is-invalid"
			: "form-control"
		},
		{
			value: textarea_value_value = "\n  " + /*$form*/ ctx[3][/*name*/ ctx[0]] + "\n"
		}
	];

	let textarea_data = {};

	for (let i = 0; i < textarea_levels.length; i += 1) {
		textarea_data = assign(textarea_data, textarea_levels[i]);
	}

	let if_block = /*showErrors*/ ctx[1] && create_if_block$1(ctx);

	const block = {
		c: function create() {
			textarea = element("textarea");
			t = space();
			if (if_block) if_block.c();
			if_block_anchor = empty();
			set_attributes(textarea, textarea_data);
			add_location(textarea, file$2, 12, 0, 272);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, textarea, anchor);
			insert_dev(target, t, anchor);
			if (if_block) if_block.m(target, anchor);
			insert_dev(target, if_block_anchor, anchor);
			current = true;

			if (!mounted) {
				dispose = [
					listen_dev(textarea, "change", /*handleChange*/ ctx[6], false, false, false),
					listen_dev(textarea, "blur", /*handleChange*/ ctx[6], false, false, false)
				];

				mounted = true;
			}
		},
		p: function update(ctx, [dirty]) {
			set_attributes(textarea, textarea_data = get_spread_update(textarea_levels, [
				(!current || dirty & /*name*/ 1) && { name: /*name*/ ctx[0] },
				dirty & /*$$props*/ 128 && /*$$props*/ ctx[7],
				(!current || dirty & /*$errors, name*/ 5 && textarea_class_value !== (textarea_class_value = /*$errors*/ ctx[2][/*name*/ ctx[0]]
				? "form-control is-invalid"
				: "form-control")) && { class: textarea_class_value },
				(!current || dirty & /*$form, name*/ 9 && textarea_value_value !== (textarea_value_value = "\n  " + /*$form*/ ctx[3][/*name*/ ctx[0]] + "\n")) && { value: textarea_value_value }
			]));

			if (/*showErrors*/ ctx[1]) {
				if (if_block) {
					if_block.p(ctx, dirty);

					if (dirty & /*showErrors*/ 2) {
						transition_in(if_block, 1);
					}
				} else {
					if_block = create_if_block$1(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				group_outros();

				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});

				check_outros();
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o: function outro(local) {
			transition_out(if_block);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(textarea);
			if (detaching) detach_dev(t);
			if (if_block) if_block.d(detaching);
			if (detaching) detach_dev(if_block_anchor);
			mounted = false;
			run_all(dispose);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$2.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$2($$self, $$props, $$invalidate) {
	let $errors;
	let $form;
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("Textarea", slots, []);
	let { name } = $$props;
	let { showErrors = true } = $$props;
	const { errors, form, handleChange } = getContext(key);
	validate_store(errors, "errors");
	component_subscribe($$self, errors, value => $$invalidate(2, $errors = value));
	validate_store(form, "form");
	component_subscribe($$self, form, value => $$invalidate(3, $form = value));

	$$self.$$set = $$new_props => {
		$$invalidate(7, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
		if ("name" in $$new_props) $$invalidate(0, name = $$new_props.name);
		if ("showErrors" in $$new_props) $$invalidate(1, showErrors = $$new_props.showErrors);
	};

	$$self.$capture_state = () => ({
		ErrorMessage,
		getContext,
		key,
		name,
		showErrors,
		errors,
		form,
		handleChange,
		$errors,
		$form
	});

	$$self.$inject_state = $$new_props => {
		$$invalidate(7, $$props = assign(assign({}, $$props), $$new_props));
		if ("name" in $$props) $$invalidate(0, name = $$new_props.name);
		if ("showErrors" in $$props) $$invalidate(1, showErrors = $$new_props.showErrors);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	$$props = exclude_internal_props($$props);
	return [name, showErrors, $errors, $form, errors, form, handleChange, $$props];
}

class Textarea extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$2, create_fragment$2, safe_not_equal, { name: 0, showErrors: 1 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Textarea",
			options,
			id: create_fragment$2.name
		});

		const { ctx } = this.$$;
		const props = options.props || {};

		if (/*name*/ ctx[0] === undefined && !("name" in props)) {
			console.warn("<Textarea> was created without expected prop 'name'");
		}
	}

	get name() {
		throw new Error("<Textarea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set name(value) {
		throw new Error("<Textarea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get showErrors() {
		throw new Error("<Textarea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set showErrors(value) {
		throw new Error("<Textarea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* node_modules/sveltestrap-forms-lib/lib/components/Field.svelte generated by Svelte v3.37.0 */
const file$3 = "node_modules/sveltestrap-forms-lib/lib/components/Field.svelte";

// (23:0) {#if showErrors}
function create_if_block$2(ctx) {
	let errormessage;
	let current;

	errormessage = new ErrorMessage({
			props: { name: /*name*/ ctx[0] },
			$$inline: true
		});

	const block = {
		c: function create() {
			create_component(errormessage.$$.fragment);
		},
		m: function mount(target, anchor) {
			mount_component(errormessage, target, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			const errormessage_changes = {};
			if (dirty & /*name*/ 1) errormessage_changes.name = /*name*/ ctx[0];
			errormessage.$set(errormessage_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(errormessage.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(errormessage.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(errormessage, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block$2.name,
		type: "if",
		source: "(23:0) {#if showErrors}",
		ctx
	});

	return block;
}

function create_fragment$3(ctx) {
	let input;
	let t;
	let if_block_anchor;
	let current;

	const input_spread_levels = [
		{ name: /*name*/ ctx[0] },
		{ type: /*type*/ ctx[2] },
		{ value: /*$form*/ ctx[3][/*name*/ ctx[0]] },
		{
			class: /*$errors*/ ctx[4][/*name*/ ctx[0]]
			? "form-control is-invalid"
			: "form-control"
		},
		/*$$props*/ ctx[8]
	];

	let input_props = {};

	for (let i = 0; i < input_spread_levels.length; i += 1) {
		input_props = assign(input_props, input_spread_levels[i]);
	}

	input = new Input({ props: input_props, $$inline: true });
	input.$on("change", /*handleChange*/ ctx[7]);
	input.$on("blur", /*handleChange*/ ctx[7]);
	let if_block = /*showErrors*/ ctx[1] && create_if_block$2(ctx);

	const block = {
		c: function create() {
			create_component(input.$$.fragment);
			t = space();
			if (if_block) if_block.c();
			if_block_anchor = empty();
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			mount_component(input, target, anchor);
			insert_dev(target, t, anchor);
			if (if_block) if_block.m(target, anchor);
			insert_dev(target, if_block_anchor, anchor);
			current = true;
		},
		p: function update(ctx, [dirty]) {
			const input_changes = (dirty & /*name, type, $form, $errors, $$props*/ 285)
			? get_spread_update(input_spread_levels, [
					dirty & /*name*/ 1 && { name: /*name*/ ctx[0] },
					dirty & /*type*/ 4 && { type: /*type*/ ctx[2] },
					dirty & /*$form, name*/ 9 && { value: /*$form*/ ctx[3][/*name*/ ctx[0]] },
					dirty & /*$errors, name*/ 17 && {
						class: /*$errors*/ ctx[4][/*name*/ ctx[0]]
						? "form-control is-invalid"
						: "form-control"
					},
					dirty & /*$$props*/ 256 && get_spread_object(/*$$props*/ ctx[8])
				])
			: {};

			input.$set(input_changes);

			if (/*showErrors*/ ctx[1]) {
				if (if_block) {
					if_block.p(ctx, dirty);

					if (dirty & /*showErrors*/ 2) {
						transition_in(if_block, 1);
					}
				} else {
					if_block = create_if_block$2(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				group_outros();

				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});

				check_outros();
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(input.$$.fragment, local);
			transition_in(if_block);
			current = true;
		},
		o: function outro(local) {
			transition_out(input.$$.fragment, local);
			transition_out(if_block);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(input, detaching);
			if (detaching) detach_dev(t);
			if (if_block) if_block.d(detaching);
			if (detaching) detach_dev(if_block_anchor);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$3.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$3($$self, $$props, $$invalidate) {
	let $form;
	let $errors;
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("Field", slots, []);
	let { name } = $$props;
	let { showErrors = true } = $$props;
	let { type = "text" } = $$props;
	const { errors, form, handleChange } = getContext(key);
	validate_store(errors, "errors");
	component_subscribe($$self, errors, value => $$invalidate(4, $errors = value));
	validate_store(form, "form");
	component_subscribe($$self, form, value => $$invalidate(3, $form = value));

	$$self.$$set = $$new_props => {
		$$invalidate(8, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
		if ("name" in $$new_props) $$invalidate(0, name = $$new_props.name);
		if ("showErrors" in $$new_props) $$invalidate(1, showErrors = $$new_props.showErrors);
		if ("type" in $$new_props) $$invalidate(2, type = $$new_props.type);
	};

	$$self.$capture_state = () => ({
		Input,
		ErrorMessage,
		getContext,
		key,
		name,
		showErrors,
		type,
		errors,
		form,
		handleChange,
		$form,
		$errors
	});

	$$self.$inject_state = $$new_props => {
		$$invalidate(8, $$props = assign(assign({}, $$props), $$new_props));
		if ("name" in $$props) $$invalidate(0, name = $$new_props.name);
		if ("showErrors" in $$props) $$invalidate(1, showErrors = $$new_props.showErrors);
		if ("type" in $$props) $$invalidate(2, type = $$new_props.type);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	$$props = exclude_internal_props($$props);
	return [name, showErrors, type, $form, $errors, errors, form, handleChange, $$props];
}

class Field extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$3, create_fragment$3, safe_not_equal, { name: 0, showErrors: 1, type: 2 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Field",
			options,
			id: create_fragment$3.name
		});

		const { ctx } = this.$$;
		const props = options.props || {};

		if (/*name*/ ctx[0] === undefined && !("name" in props)) {
			console.warn("<Field> was created without expected prop 'name'");
		}
	}

	get name() {
		throw new Error("<Field>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set name(value) {
		throw new Error("<Field>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get showErrors() {
		throw new Error("<Field>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set showErrors(value) {
		throw new Error("<Field>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get type() {
		throw new Error("<Field>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set type(value) {
		throw new Error("<Field>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* node_modules/sveltestrap-forms-lib/lib/components/Select.svelte generated by Svelte v3.37.0 */
const file$4 = "node_modules/sveltestrap-forms-lib/lib/components/Select.svelte";

// (13:0) <Input   type="select"   {name}   value={$form[name]}   on:change={handleChange}   on:blur={handleChange}   class={$errors[name] ? 'form-control is-invalid' : 'form-control'}   {...$$props} >
function create_default_slot$1(ctx) {
	let current;
	const default_slot_template = /*#slots*/ ctx[8].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[9], null);

	const block = {
		c: function create() {
			if (default_slot) default_slot.c();
		},
		m: function mount(target, anchor) {
			if (default_slot) {
				default_slot.m(target, anchor);
			}

			current = true;
		},
		p: function update(ctx, dirty) {
			if (default_slot) {
				if (default_slot.p && dirty & /*$$scope*/ 512) {
					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[9], dirty, null, null);
				}
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (default_slot) default_slot.d(detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot$1.name,
		type: "slot",
		source: "(13:0) <Input   type=\\\"select\\\"   {name}   value={$form[name]}   on:change={handleChange}   on:blur={handleChange}   class={$errors[name] ? 'form-control is-invalid' : 'form-control'}   {...$$props} >",
		ctx
	});

	return block;
}

// (24:0) {#if showErrors}
function create_if_block$3(ctx) {
	let errormessage;
	let current;

	errormessage = new ErrorMessage({
			props: { name: /*name*/ ctx[0] },
			$$inline: true
		});

	const block = {
		c: function create() {
			create_component(errormessage.$$.fragment);
		},
		m: function mount(target, anchor) {
			mount_component(errormessage, target, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			const errormessage_changes = {};
			if (dirty & /*name*/ 1) errormessage_changes.name = /*name*/ ctx[0];
			errormessage.$set(errormessage_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(errormessage.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(errormessage.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(errormessage, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block$3.name,
		type: "if",
		source: "(24:0) {#if showErrors}",
		ctx
	});

	return block;
}

function create_fragment$4(ctx) {
	let input;
	let t;
	let if_block_anchor;
	let current;

	const input_spread_levels = [
		{ type: "select" },
		{ name: /*name*/ ctx[0] },
		{ value: /*$form*/ ctx[2][/*name*/ ctx[0]] },
		{
			class: /*$errors*/ ctx[3][/*name*/ ctx[0]]
			? "form-control is-invalid"
			: "form-control"
		},
		/*$$props*/ ctx[7]
	];

	let input_props = {
		$$slots: { default: [create_default_slot$1] },
		$$scope: { ctx }
	};

	for (let i = 0; i < input_spread_levels.length; i += 1) {
		input_props = assign(input_props, input_spread_levels[i]);
	}

	input = new Input({ props: input_props, $$inline: true });
	input.$on("change", /*handleChange*/ ctx[6]);
	input.$on("blur", /*handleChange*/ ctx[6]);
	let if_block = /*showErrors*/ ctx[1] && create_if_block$3(ctx);

	const block = {
		c: function create() {
			create_component(input.$$.fragment);
			t = space();
			if (if_block) if_block.c();
			if_block_anchor = empty();
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			mount_component(input, target, anchor);
			insert_dev(target, t, anchor);
			if (if_block) if_block.m(target, anchor);
			insert_dev(target, if_block_anchor, anchor);
			current = true;
		},
		p: function update(ctx, [dirty]) {
			const input_changes = (dirty & /*name, $form, $errors, $$props*/ 141)
			? get_spread_update(input_spread_levels, [
					input_spread_levels[0],
					dirty & /*name*/ 1 && { name: /*name*/ ctx[0] },
					dirty & /*$form, name*/ 5 && { value: /*$form*/ ctx[2][/*name*/ ctx[0]] },
					dirty & /*$errors, name*/ 9 && {
						class: /*$errors*/ ctx[3][/*name*/ ctx[0]]
						? "form-control is-invalid"
						: "form-control"
					},
					dirty & /*$$props*/ 128 && get_spread_object(/*$$props*/ ctx[7])
				])
			: {};

			if (dirty & /*$$scope*/ 512) {
				input_changes.$$scope = { dirty, ctx };
			}

			input.$set(input_changes);

			if (/*showErrors*/ ctx[1]) {
				if (if_block) {
					if_block.p(ctx, dirty);

					if (dirty & /*showErrors*/ 2) {
						transition_in(if_block, 1);
					}
				} else {
					if_block = create_if_block$3(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				group_outros();

				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});

				check_outros();
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(input.$$.fragment, local);
			transition_in(if_block);
			current = true;
		},
		o: function outro(local) {
			transition_out(input.$$.fragment, local);
			transition_out(if_block);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(input, detaching);
			if (detaching) detach_dev(t);
			if (if_block) if_block.d(detaching);
			if (detaching) detach_dev(if_block_anchor);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$4.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$4($$self, $$props, $$invalidate) {
	let $form;
	let $errors;
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("Select", slots, ['default']);
	let { name } = $$props;
	let { showErrors = true } = $$props;
	const { errors, form, handleChange } = getContext(key);
	validate_store(errors, "errors");
	component_subscribe($$self, errors, value => $$invalidate(3, $errors = value));
	validate_store(form, "form");
	component_subscribe($$self, form, value => $$invalidate(2, $form = value));

	$$self.$$set = $$new_props => {
		$$invalidate(7, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
		if ("name" in $$new_props) $$invalidate(0, name = $$new_props.name);
		if ("showErrors" in $$new_props) $$invalidate(1, showErrors = $$new_props.showErrors);
		if ("$$scope" in $$new_props) $$invalidate(9, $$scope = $$new_props.$$scope);
	};

	$$self.$capture_state = () => ({
		Input,
		ErrorMessage,
		getContext,
		key,
		name,
		showErrors,
		errors,
		form,
		handleChange,
		$form,
		$errors
	});

	$$self.$inject_state = $$new_props => {
		$$invalidate(7, $$props = assign(assign({}, $$props), $$new_props));
		if ("name" in $$props) $$invalidate(0, name = $$new_props.name);
		if ("showErrors" in $$props) $$invalidate(1, showErrors = $$new_props.showErrors);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	$$props = exclude_internal_props($$props);

	return [
		name,
		showErrors,
		$form,
		$errors,
		errors,
		form,
		handleChange,
		$$props,
		slots,
		$$scope
	];
}

class Select extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$4, create_fragment$4, safe_not_equal, { name: 0, showErrors: 1 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Select",
			options,
			id: create_fragment$4.name
		});

		const { ctx } = this.$$;
		const props = options.props || {};

		if (/*name*/ ctx[0] === undefined && !("name" in props)) {
			console.warn("<Select> was created without expected prop 'name'");
		}
	}

	get name() {
		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set name(value) {
		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get showErrors() {
		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set showErrors(value) {
		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

export { Field as F, Select as S, Form_1 as a, createForm as c };
//# sourceMappingURL=index-78544a14.js.map
