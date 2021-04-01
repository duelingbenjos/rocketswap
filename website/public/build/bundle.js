
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35730/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.32.3' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/lighting-bolt.svelte generated by Svelte v3.32.3 */

    const file = "src/lighting-bolt.svelte";

    function create_fragment(ctx) {
    	let svg;
    	let g;
    	let polygon;
    	let svg_style_value;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			g = svg_element("g");
    			polygon = svg_element("polygon");
    			attr_dev(polygon, "fill", /*color*/ ctx[2]);
    			attr_dev(polygon, "points", "190,0 10,142 81,186 0,317 182,167 113,126 ");
    			attr_dev(polygon, "stroke-linejoin", "round");
    			attr_dev(polygon, "stroke-linecap", "round");
    			attr_dev(polygon, "stroke-miterlimit", "10");
    			attr_dev(polygon, "stroke-width", "10");
    			attr_dev(polygon, "stroke", /*strokeColor*/ ctx[3]);
    			add_location(polygon, file, 10, 8, 542);
    			add_location(g, file, 9, 4, 530);
    			attr_dev(svg, "width", /*width*/ ctx[0]);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "xml:space", "preserve");
    			attr_dev(svg, "version", "1.1");
    			attr_dev(svg, "viewBox", "0 0 190 317");
    			attr_dev(svg, "x", "0px");
    			attr_dev(svg, "y", "0px");
    			attr_dev(svg, "fill-rule", "evenodd");
    			attr_dev(svg, "clip-rule", "evenodd");
    			attr_dev(svg, "style", svg_style_value = `margin: ${/*margin*/ ctx[1]}; shape-rendering:geometricPrecision;text-rendering:geometricPrecision;image-rendering:optimizeQuality;`);
    			add_location(svg, file, 7, 0, 184);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, g);
    			append_dev(g, polygon);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*color*/ 4) {
    				attr_dev(polygon, "fill", /*color*/ ctx[2]);
    			}

    			if (dirty & /*strokeColor*/ 8) {
    				attr_dev(polygon, "stroke", /*strokeColor*/ ctx[3]);
    			}

    			if (dirty & /*width*/ 1) {
    				attr_dev(svg, "width", /*width*/ ctx[0]);
    			}

    			if (dirty & /*margin*/ 2 && svg_style_value !== (svg_style_value = `margin: ${/*margin*/ ctx[1]}; shape-rendering:geometricPrecision;text-rendering:geometricPrecision;image-rendering:optimizeQuality;`)) {
    				attr_dev(svg, "style", svg_style_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Lighting_bolt", slots, []);
    	let { width = "24px" } = $$props;
    	let { margin = "0" } = $$props;
    	let { color = "var(--color-secondary)" } = $$props;
    	let { strokeColor = "var(--lamden-logo-color)" } = $$props;
    	const writable_props = ["width", "margin", "color", "strokeColor"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Lighting_bolt> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("width" in $$props) $$invalidate(0, width = $$props.width);
    		if ("margin" in $$props) $$invalidate(1, margin = $$props.margin);
    		if ("color" in $$props) $$invalidate(2, color = $$props.color);
    		if ("strokeColor" in $$props) $$invalidate(3, strokeColor = $$props.strokeColor);
    	};

    	$$self.$capture_state = () => ({ width, margin, color, strokeColor });

    	$$self.$inject_state = $$props => {
    		if ("width" in $$props) $$invalidate(0, width = $$props.width);
    		if ("margin" in $$props) $$invalidate(1, margin = $$props.margin);
    		if ("color" in $$props) $$invalidate(2, color = $$props.color);
    		if ("strokeColor" in $$props) $$invalidate(3, strokeColor = $$props.strokeColor);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [width, margin, color, strokeColor];
    }

    class Lighting_bolt extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance, create_fragment, safe_not_equal, {
    			width: 0,
    			margin: 1,
    			color: 2,
    			strokeColor: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Lighting_bolt",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get width() {
    		throw new Error("<Lighting_bolt>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<Lighting_bolt>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get margin() {
    		throw new Error("<Lighting_bolt>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set margin(value) {
    		throw new Error("<Lighting_bolt>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Lighting_bolt>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Lighting_bolt>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get strokeColor() {
    		throw new Error("<Lighting_bolt>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set strokeColor(value) {
    		throw new Error("<Lighting_bolt>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/lamden-logo.svelte generated by Svelte v3.32.3 */

    const file$1 = "src/lamden-logo.svelte";

    function create_fragment$1(ctx) {
    	let svg;
    	let path0;
    	let path0_fill_value;
    	let path1;
    	let path1_fill_value;
    	let path2;
    	let path2_fill_value;
    	let svg_style_value;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");

    			attr_dev(path0, "fill", path0_fill_value = /*reverseColors*/ ctx[2]
    			? "var(--lamden-logo-color)"
    			: "white");

    			attr_dev(path0, "d", "M965 2607l-720 -720 -101 -101 101 -102 720 -719 719 -720 102 -101 101 101 720 720 719 719 102 102 -102 101 -719 720 -720 719 -101 102 -102 -102 -719 -719zm821 964c36,0 69,-13 93,-36l15 -13 814 -814 813 -814 15 -14c22,-26 35,-58 35,-94 0,-36 -13,-69 -35,-94l-15 -14 -813 -814 -814 -814 -15 -14c-24,-22 -57,-36 -93,-36 -37,0 -70,14 -94,36l-15 14 -814 814 -813 814 -14 14c-23,25 -36,58 -36,94 0,36 13,68 36,94l14 14 813 814 814 814 15 13c24,23 57,36 94,36z");
    			add_location(path0, file$1, 17, 4, 459);

    			attr_dev(path1, "fill", path1_fill_value = /*reverseColors*/ ctx[2]
    			? "var(--lamden-logo-border-color)"
    			: "var(--lamden-logo-color)");

    			attr_dev(path1, "d", "M1786 144l821 822 822 822 -822 822 -821 822 -822 -822 -822 -822 822 -822 822 -822zm0 823l410 410 411 411 -411 410 -410 411 -411 -411 -410 -410 410 -411 411 -410z");
    			add_location(path1, file$1, 18, 4, 989);

    			attr_dev(path2, "fill", path2_fill_value = /*reverseColors*/ ctx[2]
    			? "var(--lamden-logo-color)"
    			: "var(--lamden-logo-border-color)");

    			attr_dev(path2, "d", "M1375 2198l411 411 410 -411 411 -410 -411 -411 -410 -410 -411 410 -410 411 410 410zm100 -100l311 311 310 -311 311 -310 -311 -311 -310 -310 -311 310 -311 311 311 310z");
    			add_location(path2, file$1, 19, 4, 1253);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "xml:space", "preserve");
    			attr_dev(svg, "width", /*width*/ ctx[0]);
    			attr_dev(svg, "viewBox", "0 0 3571 3571");
    			attr_dev(svg, "version", "1.1");

    			attr_dev(svg, "style", svg_style_value = `margin: ${/*margin*/ ctx[1]}; 
    shape-rendering:geometricPrecision; 
    text-rendering:geometricPrecision; 
    fill-rule:evenodd; 
    clip-rule:evenodd`);

    			add_location(svg, file$1, 6, 0, 122);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    			append_dev(svg, path2);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*reverseColors*/ 4 && path0_fill_value !== (path0_fill_value = /*reverseColors*/ ctx[2]
    			? "var(--lamden-logo-color)"
    			: "white")) {
    				attr_dev(path0, "fill", path0_fill_value);
    			}

    			if (dirty & /*reverseColors*/ 4 && path1_fill_value !== (path1_fill_value = /*reverseColors*/ ctx[2]
    			? "var(--lamden-logo-border-color)"
    			: "var(--lamden-logo-color)")) {
    				attr_dev(path1, "fill", path1_fill_value);
    			}

    			if (dirty & /*reverseColors*/ 4 && path2_fill_value !== (path2_fill_value = /*reverseColors*/ ctx[2]
    			? "var(--lamden-logo-color)"
    			: "var(--lamden-logo-border-color)")) {
    				attr_dev(path2, "fill", path2_fill_value);
    			}

    			if (dirty & /*width*/ 1) {
    				attr_dev(svg, "width", /*width*/ ctx[0]);
    			}

    			if (dirty & /*margin*/ 2 && svg_style_value !== (svg_style_value = `margin: ${/*margin*/ ctx[1]}; 
    shape-rendering:geometricPrecision; 
    text-rendering:geometricPrecision; 
    fill-rule:evenodd; 
    clip-rule:evenodd`)) {
    				attr_dev(svg, "style", svg_style_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Lamden_logo", slots, []);
    	let { width = "24px" } = $$props;
    	let { margin = "0 5px" } = $$props;
    	let { reverseColors = false } = $$props;
    	const writable_props = ["width", "margin", "reverseColors"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Lamden_logo> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("width" in $$props) $$invalidate(0, width = $$props.width);
    		if ("margin" in $$props) $$invalidate(1, margin = $$props.margin);
    		if ("reverseColors" in $$props) $$invalidate(2, reverseColors = $$props.reverseColors);
    	};

    	$$self.$capture_state = () => ({ width, margin, reverseColors });

    	$$self.$inject_state = $$props => {
    		if ("width" in $$props) $$invalidate(0, width = $$props.width);
    		if ("margin" in $$props) $$invalidate(1, margin = $$props.margin);
    		if ("reverseColors" in $$props) $$invalidate(2, reverseColors = $$props.reverseColors);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [width, margin, reverseColors];
    }

    class Lamden_logo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { width: 0, margin: 1, reverseColors: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Lamden_logo",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get width() {
    		throw new Error("<Lamden_logo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<Lamden_logo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get margin() {
    		throw new Error("<Lamden_logo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set margin(value) {
    		throw new Error("<Lamden_logo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get reverseColors() {
    		throw new Error("<Lamden_logo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set reverseColors(value) {
    		throw new Error("<Lamden_logo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const openNewTab = (url) => window.open(url);

    /* src/powered-by-lamden.svelte generated by Svelte v3.32.3 */

    const file$2 = "src/powered-by-lamden.svelte";

    function create_fragment$2(ctx) {
    	let div3;
    	let span;
    	let t1;
    	let div2;
    	let div0;
    	let lamdenlogoicon;
    	let t2;
    	let div1;
    	let lightingbolticon;
    	let div3_style_value;
    	let current;
    	let mounted;
    	let dispose;

    	lamdenlogoicon = new Lamden_logo({
    			props: {
    				width: "20px",
    				margin: "0 0 0 -5px;",
    				reverseColors: false
    			},
    			$$inline: true
    		});

    	lightingbolticon = new Lighting_bolt({
    			props: {
    				width: "10px",
    				margin: "2px 0 0 0 ",
    				color: "white"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			span = element("span");
    			span.textContent = "Powered by Lamden";
    			t1 = space();
    			div2 = element("div");
    			div0 = element("div");
    			create_component(lamdenlogoicon.$$.fragment);
    			t2 = space();
    			div1 = element("div");
    			create_component(lightingbolticon.$$.fragment);
    			attr_dev(span, "class", "text-primary text-xsmall weight-400");
    			add_location(span, file$2, 29, 4, 694);
    			attr_dev(div0, "class", "background-icon svelte-1lv08zw");
    			add_location(div0, file$2, 31, 8, 818);
    			attr_dev(div1, "class", "background-icon svelte-1lv08zw");
    			add_location(div1, file$2, 34, 8, 957);
    			attr_dev(div2, "class", "powered-by-lamden-logo svelte-1lv08zw");
    			add_location(div2, file$2, 30, 4, 773);
    			attr_dev(div3, "style", div3_style_value = `margin: ${/*margin*/ ctx[0]}; display: flex; justify-items: center; align-content:center; cursor: pointer`);
    			add_location(div3, file$2, 28, 0, 525);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, span);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			mount_component(lamdenlogoicon, div0, null);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			mount_component(lightingbolticon, div1, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div3, "click", /*click_handler*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*margin*/ 1 && div3_style_value !== (div3_style_value = `margin: ${/*margin*/ ctx[0]}; display: flex; justify-items: center; align-content:center; cursor: pointer`)) {
    				attr_dev(div3, "style", div3_style_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(lamdenlogoicon.$$.fragment, local);
    			transition_in(lightingbolticon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(lamdenlogoicon.$$.fragment, local);
    			transition_out(lightingbolticon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_component(lamdenlogoicon);
    			destroy_component(lightingbolticon);
    			mounted = false;
    			dispose();
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Powered_by_lamden", slots, []);
    	let { margin = 0 } = $$props;
    	const writable_props = ["margin"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Powered_by_lamden> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => openNewTab("https://www.lamden.io");

    	$$self.$$set = $$props => {
    		if ("margin" in $$props) $$invalidate(0, margin = $$props.margin);
    	};

    	$$self.$capture_state = () => ({
    		margin,
    		LightingBoltIcon: Lighting_bolt,
    		LamdenLogoIcon: Lamden_logo,
    		openNewTab
    	});

    	$$self.$inject_state = $$props => {
    		if ("margin" in $$props) $$invalidate(0, margin = $$props.margin);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [margin, click_handler];
    }

    class Powered_by_lamden extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { margin: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Powered_by_lamden",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get margin() {
    		throw new Error("<Powered_by_lamden>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set margin(value) {
    		throw new Error("<Powered_by_lamden>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.32.3 */
    const file$3 = "src/App.svelte";

    function create_fragment$3(ctx) {
    	let main;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let svg;
    	let path;
    	let t1;
    	let br;
    	let t2;
    	let b;
    	let t4;
    	let canvas;
    	let t5;
    	let div1;
    	let poweredbylamden;
    	let current;
    	poweredbylamden = new Powered_by_lamden({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			svg = svg_element("svg");
    			path = svg_element("path");
    			t1 = space();
    			br = element("br");
    			t2 = space();
    			b = element("b");
    			b.textContent = "... BRB ...";
    			t4 = space();
    			canvas = element("canvas");
    			t5 = space();
    			div1 = element("div");
    			create_component(poweredbylamden.$$.fragment);
    			if (img.src !== (img_src_value = "RS_Logo.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "height", "100");
    			attr_dev(img, "width", "100");
    			set_style(img, "margin-bottom", "20px");
    			attr_dev(img, "alt", "");
    			add_location(img, file$3, 85, 2, 2563);
    			attr_dev(path, "d", "M1.86,0V-13.888H4.4l1.178.62a7.988,7.988,0,0,1,1.736-.682A9.345,9.345,0,0,1,9.672-14.2a11.3,11.3,0,0,1,3.674.5,16.253,16.253,0,0,1,1.875.744l-1.085,2.7a11.222,11.222,0,0,0-1.224-.481,17.532,17.532,0,0,0-2-.542A11.889,11.889,0,0,0,8.4-11.532H8.06a2.388,2.388,0,0,0-1.937.589A3.407,3.407,0,0,0,5.642-8.99V0ZM21.173,0a4.759,4.759,0,0,1-3.084-.837,3.356,3.356,0,0,1-1.008-2.728V-9.92a10.044,10.044,0,0,1,.078-1.132,3.6,3.6,0,0,1,.434-1.317A2.727,2.727,0,0,1,18.8-13.454a5.308,5.308,0,0,1,2.372-.434h8.556a5.291,5.291,0,0,1,2.387.434,2.738,2.738,0,0,1,1.194,1.085,3.6,3.6,0,0,1,.434,1.317,10.045,10.045,0,0,1,.077,1.132v5.952a11.066,11.066,0,0,1-.077,1.24,3.214,3.214,0,0,1-.45,1.3A2.738,2.738,0,0,1,32.085-.4a5.554,5.554,0,0,1-2.356.4Zm1.178-2.666h6.2q1.519,0,1.519-1.24V-9.982q0-1.24-1.519-1.24h-6.2q-1.488,0-1.488,1.24v6.076Q20.863-2.666,22.351-2.666ZM41.013,0a5.646,5.646,0,0,1-2.387-.4,2.635,2.635,0,0,1-1.194-1.023A3.348,3.348,0,0,1,37-2.728a11.066,11.066,0,0,1-.077-1.24V-9.92A10.045,10.045,0,0,1,37-11.052a3.6,3.6,0,0,1,.434-1.317,2.727,2.727,0,0,1,1.209-1.085,5.308,5.308,0,0,1,2.371-.434h4.309a51.28,51.28,0,0,1,5.5.2q1.627.2,1.627.419l-.62,2.356q-.868-.062-2.2-.14t-2.868-.124q-1.534-.047-2.991-.047H42.191q-1.488,0-1.488,1.24v6.076q-.031,1.24,1.488,1.24h1.581q1.674,0,3.271-.046t2.93-.124q1.333-.077,2.139-.14l1.24,2.015q0,.961-6.107.961ZM70.37.31A6.949,6.949,0,0,1,68.154,0a5.268,5.268,0,0,1-1.937-1.333l-.5-.5q-.4-.4-.883-.9t-.884-.9l-.527-.527a8.449,8.449,0,0,0-1.472-1.209A3.2,3.2,0,0,0,60.233-5.8a1.464,1.464,0,0,0-.806.124,1.555,1.555,0,0,0-.124.837V0H55.521V-19.623H59.3v11.16h.992a1.365,1.365,0,0,0,.992-.434q.279-.279,1.054-1.116L64.092-11.9q.977-1.054,1.783-1.953h4.557l-.5.961q-.713.744-1.55,1.566T66.758-9.75q-.791.76-1.441,1.333a6.319,6.319,0,0,1-.992.76A9.314,9.314,0,0,1,66-6.526q.744.636,1.612,1.426t2.077,1.782A4.386,4.386,0,0,0,71.7-2.309q.93.139,1.116.139L72.261,0q-.31.093-.837.2A5.214,5.214,0,0,1,70.37.31ZM78.461,0a5.646,5.646,0,0,1-2.387-.4,2.635,2.635,0,0,1-1.193-1.023,3.348,3.348,0,0,1-.434-1.3,11.066,11.066,0,0,1-.077-1.24V-9.92a10.045,10.045,0,0,1,.077-1.132,3.6,3.6,0,0,1,.434-1.317,2.727,2.727,0,0,1,1.209-1.085,5.308,5.308,0,0,1,2.371-.434h6.665a10.532,10.532,0,0,1,3.209.388,2.777,2.777,0,0,1,1.643,1.255,4.805,4.805,0,0,1,.48,2.325v4.588H85.033q-2.79,0-4.541-.124t-2.34-.155v1.7q-.031,1.24,1.488,1.24H81.22q1.674,0,3.271-.046t2.929-.124q1.333-.077,2.139-.14L90.8-.961Q90.8,0,84.692,0Zm-.31-8h8.525V-9.982a1.915,1.915,0,0,0-.14-.868q-.139-.248-.822-.31t-2.325-.062H79.639q-1.488,0-1.488,1.24ZM99.293,0a4.173,4.173,0,0,1-3.224-.992A4.411,4.411,0,0,1,95.2-3.968v-7.254H92.659v-2.666h1.3a1.51,1.51,0,0,0,.853-.186,1.2,1.2,0,0,0,.388-.744l.62-3.317h3.162v4.247h6.448v2.666H98.983v7.285a1.156,1.156,0,0,0,.372,1.023,2.029,2.029,0,0,0,1.116.248h4.371l.31,2.356q-.651.093-1.984.2T100.254,0Zm12.121,0a13.745,13.745,0,0,1-2.945-.217q-.868-.217-.868-.434l.93-2.325q.9.093,3.3.2t5.937.109h1.55q.775,0,.977-.418a2.641,2.641,0,0,0,.2-1.132,2.431,2.431,0,0,0-.232-1.147.972.972,0,0,0-.946-.434h-7.626a4.8,4.8,0,0,1-3.131-.821,3.064,3.064,0,0,1-.961-2.465v-1.24a6.682,6.682,0,0,1,.093-1.023,3.118,3.118,0,0,1,.465-1.178,2.731,2.731,0,0,1,1.209-.976,5.655,5.655,0,0,1,2.325-.388h8.556a11.026,11.026,0,0,1,2.635.217q.775.217.775.434l-.31,2.325q-.9-.093-3.317-.2t-5.921-.108h-1.55q-.775,0-.977.418a2.227,2.227,0,0,0-.2.977,2.105,2.105,0,0,0,.2.976q.2.387.977.387h7.626a4.627,4.627,0,0,1,3.1.868,2.8,2.8,0,0,1,.992,2.2v1.829a9.512,9.512,0,0,1-.078,1.178,2.6,2.6,0,0,1-.45,1.163,2.6,2.6,0,0,1-1.209.884A6.455,6.455,0,0,1,120.187,0ZM131.13,0l-4.991-13.888h4.34l2.511,7.874.806,2.759h.31l.465-2.449,2.139-8.184h4.96L143.933-5.7l.434,2.449h.31l.837-2.821,2.356-7.812h4.34l-.5,1.891L147.25,0h-4.96l-2.573-8.525-.31-1.457h-.31l-.372,1.457L136.09,0Zm26.629,0a4.552,4.552,0,0,1-3.41-1.1,4.189,4.189,0,0,1-1.054-3.023,4.16,4.16,0,0,1,1.1-3.1,4.618,4.618,0,0,1,3.363-1.085h1.581q2.325,0,4.185.124t3.069.248V-9.982a2.78,2.78,0,0,0-.062-.573.734.734,0,0,0-.372-.481,2.174,2.174,0,0,0-1.054-.186h-1.55q-3.379,0-5.642.108t-3.069.2l-.341-2.356q0-.434,2.356-.527t7.874-.093h1.55a5.291,5.291,0,0,1,2.387.434,2.739,2.739,0,0,1,1.194,1.085,3.6,3.6,0,0,1,.434,1.317,10.045,10.045,0,0,1,.077,1.132V0h-2.542l-1.209-.62q-1.3.217-3.131.419a38.615,38.615,0,0,1-4.185.2Zm.806-2.666h7.1a1.464,1.464,0,0,0,.806-.124,1.376,1.376,0,0,0,.124-.775V-5.952h-8.029a1.424,1.424,0,0,0-1.162.4,2.015,2.015,0,0,0-.326,1.271,1.711,1.711,0,0,0,.372,1.24A1.516,1.516,0,0,0,158.565-2.666Zm15.376,8.432V-13.888h2.542l.775.4q1.4-.155,3.333-.279t4.417-.124h1.581a5.646,5.646,0,0,1,2.387.4,2.635,2.635,0,0,1,1.193,1.023,3.348,3.348,0,0,1,.434,1.3,11.066,11.066,0,0,1,.077,1.24v5.952a10.045,10.045,0,0,1-.077,1.132,3.6,3.6,0,0,1-.434,1.317,2.739,2.739,0,0,1-1.193,1.085A5.291,5.291,0,0,1,186.589,0h-1.581q-2.356,0-4.185-.124t-3.1-.248V5.766Zm4.743-8.432h6.727a1.784,1.784,0,0,0,1.038-.31,1.055,1.055,0,0,0,.449-.93V-9.982a1.084,1.084,0,0,0-.326-.961,1.9,1.9,0,0,0-1.162-.279h-1.55q-1.984,0-3.518.078t-2.62.17v7.347a1.411,1.411,0,0,0,.139.821A1.411,1.411,0,0,0,178.684-2.666Z");
    			attr_dev(path, "transform", "translate(-1.86 19.623)");
    			attr_dev(path, "fill", "#fff");
    			add_location(path, file$3, 97, 3, 2762);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", /*width*/ ctx[0]);
    			attr_dev(svg, "viewBox", "0 0 188.821 25.389");
    			add_location(svg, file$3, 92, 2, 2669);
    			add_location(br, file$3, 103, 2, 7897);
    			add_location(b, file$3, 104, 2, 7904);
    			set_style(div0, "position", "absolute");
    			set_style(div0, "top", "0%");
    			set_style(div0, "left", "0%");
    			set_style(div0, "text-align", "center");
    			set_style(div0, "height", "100%");
    			set_style(div0, "width", "100%");
    			set_style(div0, "display", "flex");
    			set_style(div0, "justify-content", "center");
    			set_style(div0, "align-items", "center");
    			set_style(div0, "flex-direction", "column");
    			add_location(div0, file$3, 82, 1, 2374);
    			attr_dev(canvas, "id", "canvas");
    			set_style(canvas, "width", "100%");
    			set_style(canvas, "height", "100%");
    			set_style(canvas, "padding", "0");
    			set_style(canvas, "margin", "0");
    			set_style(canvas, "z-index", "99");
    			add_location(canvas, file$3, 111, 1, 8047);
    			attr_dev(div1, "id", "powered");
    			attr_dev(div1, "class", "svelte-1lvnwt7");
    			add_location(div1, file$3, 115, 1, 8146);
    			attr_dev(main, "class", "svelte-1lvnwt7");
    			add_location(main, file$3, 81, 0, 2366);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div0);
    			append_dev(div0, img);
    			append_dev(div0, t0);
    			append_dev(div0, svg);
    			append_dev(svg, path);
    			append_dev(div0, t1);
    			append_dev(div0, br);
    			append_dev(div0, t2);
    			append_dev(div0, b);
    			append_dev(main, t4);
    			append_dev(main, canvas);
    			append_dev(main, t5);
    			append_dev(main, div1);
    			mount_component(poweredbylamden, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*width*/ 1) {
    				attr_dev(svg, "width", /*width*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(poweredbylamden.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(poweredbylamden.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(poweredbylamden);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let { width = "190px" } = $$props;

    	onMount(() => {
    		const canvas = window.document.getElementById("canvas");
    		const c = canvas.getContext("2d");
    		let w;
    		let h;

    		const setCanvasExtents = () => {
    			w = document.body.clientWidth;
    			h = document.body.clientHeight;
    			canvas.width = w;
    			canvas.height = h;
    		};

    		setCanvasExtents();

    		window.onresize = () => {
    			setCanvasExtents();
    		};

    		const makeStars = count => {
    			const out = [];

    			for (let i = 0; i < count; i++) {
    				const s = {
    					x: Math.random() * 1600 - 800,
    					y: Math.random() * 900 - 450,
    					z: Math.random() * 1000
    				};

    				out.push(s);
    			}

    			return out;
    		};

    		let stars = makeStars(10000);

    		const clear = () => {
    			c.fillStyle = "black";
    			c.fillRect(0, 0, canvas.width, canvas.height);
    		};

    		const putPixel = (x, y, brightness) => {
    			const intensity = brightness * 255;
    			const rgb = "rgb(" + intensity + "," + intensity + "," + intensity + ")";
    			c.fillStyle = rgb;
    			c.fillRect(x, y, 1, 1);
    		};

    		const moveStars = distance => {
    			const count = stars.length;

    			for (var i = 0; i < count; i++) {
    				const s = stars[i];
    				s.z -= distance;

    				while (s.z <= 1) {
    					s.z += 1000;
    				}
    			}
    		};

    		let prevTime;

    		const init = time => {
    			prevTime = time;
    			requestAnimationFrame(tick);
    		};

    		const tick = time => {
    			let elapsed = time - prevTime;
    			prevTime = time;
    			moveStars(elapsed * 0.1);
    			clear();
    			const cx = w / 2;
    			const cy = h / 2;
    			const count = stars.length;

    			for (var i = 0; i < count; i++) {
    				const star = stars[i];
    				const x = cx + star.x / (star.z * 0.001);
    				const y = cy + star.y / (star.z * 0.001);

    				if (x < 0 || x >= w || y < 0 || y >= h) {
    					continue;
    				}

    				const d = star.z / 1000;
    				const b = 1 - d * d;
    				putPixel(x, y, b);
    			}

    			requestAnimationFrame(tick);
    		};

    		requestAnimationFrame(init);
    	});

    	const writable_props = ["width"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("width" in $$props) $$invalidate(0, width = $$props.width);
    	};

    	$$self.$capture_state = () => ({ onMount, PoweredByLamden: Powered_by_lamden, width });

    	$$self.$inject_state = $$props => {
    		if ("width" in $$props) $$invalidate(0, width = $$props.width);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [width];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { width: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get width() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
        target: document.body,
        props: {
            name: 'world'
        }
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
