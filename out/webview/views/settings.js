"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __decorateClass = (decorators, target, key, kind) => {
    var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
    for (var i7 = decorators.length - 1, decorator; i7 >= 0; i7--)
      if (decorator = decorators[i7])
        result = (kind ? decorator(target, key, result) : decorator(result)) || result;
    if (kind && result) __defProp(target, key, result);
    return result;
  };

  // src/webview/core/bridge.ts
  var vscode = acquireVsCodeApi();
  var pendingRequests = /* @__PURE__ */ new Map();
  var DEFAULT_TIMEOUT = 15e3;
  function generateId() {
    return `req_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }
  function post(type, payload) {
    const message = {
      type,
      id: generateId(),
      timestamp: Date.now(),
      payload
    };
    vscode.postMessage(message);
  }
  function request(type, payload, timeoutMs = DEFAULT_TIMEOUT) {
    const id = generateId();
    const message = {
      type,
      id,
      timestamp: Date.now(),
      payload
    };
    return new Promise((resolve, reject) => {
      const timeout = window.setTimeout(() => {
        pendingRequests.delete(id);
        reject(new Error(`Request timeout: ${type}`));
      }, timeoutMs);
      pendingRequests.set(id, { resolve, reject, timeout });
      vscode.postMessage(message);
    });
  }
  function handleResponse(message) {
    if (!message.id || !Object.prototype.hasOwnProperty.call(message, "response")) {
      return;
    }
    const pending = pendingRequests.get(message.id);
    if (!pending) return;
    window.clearTimeout(pending.timeout);
    pendingRequests.delete(message.id);
    const response = message.response;
    if (response && typeof response === "object" && "error" in response) {
      pending.reject(new Error(String(response.error)));
    } else {
      pending.resolve(response);
    }
  }
  window.addEventListener("message", (event) => {
    const message = event.data;
    if (!message) return;
    handleResponse(message);
  });
  var state = {
    get: vscode.getState.bind(vscode),
    set: vscode.setState.bind(vscode)
  };

  // node_modules/@lit/reactive-element/css-tag.js
  var t = globalThis;
  var e = t.ShadowRoot && (void 0 === t.ShadyCSS || t.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype;
  var s = /* @__PURE__ */ Symbol();
  var o = /* @__PURE__ */ new WeakMap();
  var n = class {
    constructor(t6, e8, o8) {
      if (this._$cssResult$ = true, o8 !== s) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
      this.cssText = t6, this.t = e8;
    }
    get styleSheet() {
      let t6 = this.o;
      const s5 = this.t;
      if (e && void 0 === t6) {
        const e8 = void 0 !== s5 && 1 === s5.length;
        e8 && (t6 = o.get(s5)), void 0 === t6 && ((this.o = t6 = new CSSStyleSheet()).replaceSync(this.cssText), e8 && o.set(s5, t6));
      }
      return t6;
    }
    toString() {
      return this.cssText;
    }
  };
  var r = (t6) => new n("string" == typeof t6 ? t6 : t6 + "", void 0, s);
  var i = (t6, ...e8) => {
    const o8 = 1 === t6.length ? t6[0] : e8.reduce((e9, s5, o9) => e9 + ((t7) => {
      if (true === t7._$cssResult$) return t7.cssText;
      if ("number" == typeof t7) return t7;
      throw Error("Value passed to 'css' function must be a 'css' function result: " + t7 + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
    })(s5) + t6[o9 + 1], t6[0]);
    return new n(o8, t6, s);
  };
  var S = (s5, o8) => {
    if (e) s5.adoptedStyleSheets = o8.map((t6) => t6 instanceof CSSStyleSheet ? t6 : t6.styleSheet);
    else for (const e8 of o8) {
      const o9 = document.createElement("style"), n6 = t.litNonce;
      void 0 !== n6 && o9.setAttribute("nonce", n6), o9.textContent = e8.cssText, s5.appendChild(o9);
    }
  };
  var c = e ? (t6) => t6 : (t6) => t6 instanceof CSSStyleSheet ? ((t7) => {
    let e8 = "";
    for (const s5 of t7.cssRules) e8 += s5.cssText;
    return r(e8);
  })(t6) : t6;

  // node_modules/@lit/reactive-element/reactive-element.js
  var { is: i2, defineProperty: e2, getOwnPropertyDescriptor: h, getOwnPropertyNames: r2, getOwnPropertySymbols: o2, getPrototypeOf: n2 } = Object;
  var a = globalThis;
  var c2 = a.trustedTypes;
  var l = c2 ? c2.emptyScript : "";
  var p = a.reactiveElementPolyfillSupport;
  var d = (t6, s5) => t6;
  var u = { toAttribute(t6, s5) {
    switch (s5) {
      case Boolean:
        t6 = t6 ? l : null;
        break;
      case Object:
      case Array:
        t6 = null == t6 ? t6 : JSON.stringify(t6);
    }
    return t6;
  }, fromAttribute(t6, s5) {
    let i7 = t6;
    switch (s5) {
      case Boolean:
        i7 = null !== t6;
        break;
      case Number:
        i7 = null === t6 ? null : Number(t6);
        break;
      case Object:
      case Array:
        try {
          i7 = JSON.parse(t6);
        } catch (t7) {
          i7 = null;
        }
    }
    return i7;
  } };
  var f = (t6, s5) => !i2(t6, s5);
  var b = { attribute: true, type: String, converter: u, reflect: false, useDefault: false, hasChanged: f };
  Symbol.metadata ?? (Symbol.metadata = /* @__PURE__ */ Symbol("metadata")), a.litPropertyMetadata ?? (a.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
  var y = class extends HTMLElement {
    static addInitializer(t6) {
      this._$Ei(), (this.l ?? (this.l = [])).push(t6);
    }
    static get observedAttributes() {
      return this.finalize(), this._$Eh && [...this._$Eh.keys()];
    }
    static createProperty(t6, s5 = b) {
      if (s5.state && (s5.attribute = false), this._$Ei(), this.prototype.hasOwnProperty(t6) && ((s5 = Object.create(s5)).wrapped = true), this.elementProperties.set(t6, s5), !s5.noAccessor) {
        const i7 = /* @__PURE__ */ Symbol(), h4 = this.getPropertyDescriptor(t6, i7, s5);
        void 0 !== h4 && e2(this.prototype, t6, h4);
      }
    }
    static getPropertyDescriptor(t6, s5, i7) {
      const { get: e8, set: r6 } = h(this.prototype, t6) ?? { get() {
        return this[s5];
      }, set(t7) {
        this[s5] = t7;
      } };
      return { get: e8, set(s6) {
        const h4 = e8?.call(this);
        r6?.call(this, s6), this.requestUpdate(t6, h4, i7);
      }, configurable: true, enumerable: true };
    }
    static getPropertyOptions(t6) {
      return this.elementProperties.get(t6) ?? b;
    }
    static _$Ei() {
      if (this.hasOwnProperty(d("elementProperties"))) return;
      const t6 = n2(this);
      t6.finalize(), void 0 !== t6.l && (this.l = [...t6.l]), this.elementProperties = new Map(t6.elementProperties);
    }
    static finalize() {
      if (this.hasOwnProperty(d("finalized"))) return;
      if (this.finalized = true, this._$Ei(), this.hasOwnProperty(d("properties"))) {
        const t7 = this.properties, s5 = [...r2(t7), ...o2(t7)];
        for (const i7 of s5) this.createProperty(i7, t7[i7]);
      }
      const t6 = this[Symbol.metadata];
      if (null !== t6) {
        const s5 = litPropertyMetadata.get(t6);
        if (void 0 !== s5) for (const [t7, i7] of s5) this.elementProperties.set(t7, i7);
      }
      this._$Eh = /* @__PURE__ */ new Map();
      for (const [t7, s5] of this.elementProperties) {
        const i7 = this._$Eu(t7, s5);
        void 0 !== i7 && this._$Eh.set(i7, t7);
      }
      this.elementStyles = this.finalizeStyles(this.styles);
    }
    static finalizeStyles(s5) {
      const i7 = [];
      if (Array.isArray(s5)) {
        const e8 = new Set(s5.flat(1 / 0).reverse());
        for (const s6 of e8) i7.unshift(c(s6));
      } else void 0 !== s5 && i7.push(c(s5));
      return i7;
    }
    static _$Eu(t6, s5) {
      const i7 = s5.attribute;
      return false === i7 ? void 0 : "string" == typeof i7 ? i7 : "string" == typeof t6 ? t6.toLowerCase() : void 0;
    }
    constructor() {
      super(), this._$Ep = void 0, this.isUpdatePending = false, this.hasUpdated = false, this._$Em = null, this._$Ev();
    }
    _$Ev() {
      this._$ES = new Promise((t6) => this.enableUpdating = t6), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t6) => t6(this));
    }
    addController(t6) {
      (this._$EO ?? (this._$EO = /* @__PURE__ */ new Set())).add(t6), void 0 !== this.renderRoot && this.isConnected && t6.hostConnected?.();
    }
    removeController(t6) {
      this._$EO?.delete(t6);
    }
    _$E_() {
      const t6 = /* @__PURE__ */ new Map(), s5 = this.constructor.elementProperties;
      for (const i7 of s5.keys()) this.hasOwnProperty(i7) && (t6.set(i7, this[i7]), delete this[i7]);
      t6.size > 0 && (this._$Ep = t6);
    }
    createRenderRoot() {
      const t6 = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
      return S(t6, this.constructor.elementStyles), t6;
    }
    connectedCallback() {
      this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(true), this._$EO?.forEach((t6) => t6.hostConnected?.());
    }
    enableUpdating(t6) {
    }
    disconnectedCallback() {
      this._$EO?.forEach((t6) => t6.hostDisconnected?.());
    }
    attributeChangedCallback(t6, s5, i7) {
      this._$AK(t6, i7);
    }
    _$ET(t6, s5) {
      const i7 = this.constructor.elementProperties.get(t6), e8 = this.constructor._$Eu(t6, i7);
      if (void 0 !== e8 && true === i7.reflect) {
        const h4 = (void 0 !== i7.converter?.toAttribute ? i7.converter : u).toAttribute(s5, i7.type);
        this._$Em = t6, null == h4 ? this.removeAttribute(e8) : this.setAttribute(e8, h4), this._$Em = null;
      }
    }
    _$AK(t6, s5) {
      const i7 = this.constructor, e8 = i7._$Eh.get(t6);
      if (void 0 !== e8 && this._$Em !== e8) {
        const t7 = i7.getPropertyOptions(e8), h4 = "function" == typeof t7.converter ? { fromAttribute: t7.converter } : void 0 !== t7.converter?.fromAttribute ? t7.converter : u;
        this._$Em = e8;
        const r6 = h4.fromAttribute(s5, t7.type);
        this[e8] = r6 ?? this._$Ej?.get(e8) ?? r6, this._$Em = null;
      }
    }
    requestUpdate(t6, s5, i7, e8 = false, h4) {
      if (void 0 !== t6) {
        const r6 = this.constructor;
        if (false === e8 && (h4 = this[t6]), i7 ?? (i7 = r6.getPropertyOptions(t6)), !((i7.hasChanged ?? f)(h4, s5) || i7.useDefault && i7.reflect && h4 === this._$Ej?.get(t6) && !this.hasAttribute(r6._$Eu(t6, i7)))) return;
        this.C(t6, s5, i7);
      }
      false === this.isUpdatePending && (this._$ES = this._$EP());
    }
    C(t6, s5, { useDefault: i7, reflect: e8, wrapped: h4 }, r6) {
      i7 && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(t6) && (this._$Ej.set(t6, r6 ?? s5 ?? this[t6]), true !== h4 || void 0 !== r6) || (this._$AL.has(t6) || (this.hasUpdated || i7 || (s5 = void 0), this._$AL.set(t6, s5)), true === e8 && this._$Em !== t6 && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(t6));
    }
    async _$EP() {
      this.isUpdatePending = true;
      try {
        await this._$ES;
      } catch (t7) {
        Promise.reject(t7);
      }
      const t6 = this.scheduleUpdate();
      return null != t6 && await t6, !this.isUpdatePending;
    }
    scheduleUpdate() {
      return this.performUpdate();
    }
    performUpdate() {
      if (!this.isUpdatePending) return;
      if (!this.hasUpdated) {
        if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
          for (const [t8, s6] of this._$Ep) this[t8] = s6;
          this._$Ep = void 0;
        }
        const t7 = this.constructor.elementProperties;
        if (t7.size > 0) for (const [s6, i7] of t7) {
          const { wrapped: t8 } = i7, e8 = this[s6];
          true !== t8 || this._$AL.has(s6) || void 0 === e8 || this.C(s6, void 0, i7, e8);
        }
      }
      let t6 = false;
      const s5 = this._$AL;
      try {
        t6 = this.shouldUpdate(s5), t6 ? (this.willUpdate(s5), this._$EO?.forEach((t7) => t7.hostUpdate?.()), this.update(s5)) : this._$EM();
      } catch (s6) {
        throw t6 = false, this._$EM(), s6;
      }
      t6 && this._$AE(s5);
    }
    willUpdate(t6) {
    }
    _$AE(t6) {
      this._$EO?.forEach((t7) => t7.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = true, this.firstUpdated(t6)), this.updated(t6);
    }
    _$EM() {
      this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = false;
    }
    get updateComplete() {
      return this.getUpdateComplete();
    }
    getUpdateComplete() {
      return this._$ES;
    }
    shouldUpdate(t6) {
      return true;
    }
    update(t6) {
      this._$Eq && (this._$Eq = this._$Eq.forEach((t7) => this._$ET(t7, this[t7]))), this._$EM();
    }
    updated(t6) {
    }
    firstUpdated(t6) {
    }
  };
  y.elementStyles = [], y.shadowRootOptions = { mode: "open" }, y[d("elementProperties")] = /* @__PURE__ */ new Map(), y[d("finalized")] = /* @__PURE__ */ new Map(), p?.({ ReactiveElement: y }), (a.reactiveElementVersions ?? (a.reactiveElementVersions = [])).push("2.1.2");

  // node_modules/lit-html/lit-html.js
  var t2 = globalThis;
  var i3 = (t6) => t6;
  var s2 = t2.trustedTypes;
  var e3 = s2 ? s2.createPolicy("lit-html", { createHTML: (t6) => t6 }) : void 0;
  var h2 = "$lit$";
  var o3 = `lit$${Math.random().toFixed(9).slice(2)}$`;
  var n3 = "?" + o3;
  var r3 = `<${n3}>`;
  var l2 = document;
  var c3 = () => l2.createComment("");
  var a2 = (t6) => null === t6 || "object" != typeof t6 && "function" != typeof t6;
  var u2 = Array.isArray;
  var d2 = (t6) => u2(t6) || "function" == typeof t6?.[Symbol.iterator];
  var f2 = "[ 	\n\f\r]";
  var v = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g;
  var _ = /-->/g;
  var m = />/g;
  var p2 = RegExp(`>|${f2}(?:([^\\s"'>=/]+)(${f2}*=${f2}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g");
  var g = /'/g;
  var $ = /"/g;
  var y2 = /^(?:script|style|textarea|title)$/i;
  var x = (t6) => (i7, ...s5) => ({ _$litType$: t6, strings: i7, values: s5 });
  var b2 = x(1);
  var w = x(2);
  var T = x(3);
  var E = /* @__PURE__ */ Symbol.for("lit-noChange");
  var A = /* @__PURE__ */ Symbol.for("lit-nothing");
  var C = /* @__PURE__ */ new WeakMap();
  var P = l2.createTreeWalker(l2, 129);
  function V(t6, i7) {
    if (!u2(t6) || !t6.hasOwnProperty("raw")) throw Error("invalid template strings array");
    return void 0 !== e3 ? e3.createHTML(i7) : i7;
  }
  var N = (t6, i7) => {
    const s5 = t6.length - 1, e8 = [];
    let n6, l3 = 2 === i7 ? "<svg>" : 3 === i7 ? "<math>" : "", c5 = v;
    for (let i8 = 0; i8 < s5; i8++) {
      const s6 = t6[i8];
      let a3, u5, d3 = -1, f3 = 0;
      for (; f3 < s6.length && (c5.lastIndex = f3, u5 = c5.exec(s6), null !== u5); ) f3 = c5.lastIndex, c5 === v ? "!--" === u5[1] ? c5 = _ : void 0 !== u5[1] ? c5 = m : void 0 !== u5[2] ? (y2.test(u5[2]) && (n6 = RegExp("</" + u5[2], "g")), c5 = p2) : void 0 !== u5[3] && (c5 = p2) : c5 === p2 ? ">" === u5[0] ? (c5 = n6 ?? v, d3 = -1) : void 0 === u5[1] ? d3 = -2 : (d3 = c5.lastIndex - u5[2].length, a3 = u5[1], c5 = void 0 === u5[3] ? p2 : '"' === u5[3] ? $ : g) : c5 === $ || c5 === g ? c5 = p2 : c5 === _ || c5 === m ? c5 = v : (c5 = p2, n6 = void 0);
      const x2 = c5 === p2 && t6[i8 + 1].startsWith("/>") ? " " : "";
      l3 += c5 === v ? s6 + r3 : d3 >= 0 ? (e8.push(a3), s6.slice(0, d3) + h2 + s6.slice(d3) + o3 + x2) : s6 + o3 + (-2 === d3 ? i8 : x2);
    }
    return [V(t6, l3 + (t6[s5] || "<?>") + (2 === i7 ? "</svg>" : 3 === i7 ? "</math>" : "")), e8];
  };
  var S2 = class _S {
    constructor({ strings: t6, _$litType$: i7 }, e8) {
      let r6;
      this.parts = [];
      let l3 = 0, a3 = 0;
      const u5 = t6.length - 1, d3 = this.parts, [f3, v3] = N(t6, i7);
      if (this.el = _S.createElement(f3, e8), P.currentNode = this.el.content, 2 === i7 || 3 === i7) {
        const t7 = this.el.content.firstChild;
        t7.replaceWith(...t7.childNodes);
      }
      for (; null !== (r6 = P.nextNode()) && d3.length < u5; ) {
        if (1 === r6.nodeType) {
          if (r6.hasAttributes()) for (const t7 of r6.getAttributeNames()) if (t7.endsWith(h2)) {
            const i8 = v3[a3++], s5 = r6.getAttribute(t7).split(o3), e9 = /([.?@])?(.*)/.exec(i8);
            d3.push({ type: 1, index: l3, name: e9[2], strings: s5, ctor: "." === e9[1] ? I : "?" === e9[1] ? L : "@" === e9[1] ? z : H }), r6.removeAttribute(t7);
          } else t7.startsWith(o3) && (d3.push({ type: 6, index: l3 }), r6.removeAttribute(t7));
          if (y2.test(r6.tagName)) {
            const t7 = r6.textContent.split(o3), i8 = t7.length - 1;
            if (i8 > 0) {
              r6.textContent = s2 ? s2.emptyScript : "";
              for (let s5 = 0; s5 < i8; s5++) r6.append(t7[s5], c3()), P.nextNode(), d3.push({ type: 2, index: ++l3 });
              r6.append(t7[i8], c3());
            }
          }
        } else if (8 === r6.nodeType) if (r6.data === n3) d3.push({ type: 2, index: l3 });
        else {
          let t7 = -1;
          for (; -1 !== (t7 = r6.data.indexOf(o3, t7 + 1)); ) d3.push({ type: 7, index: l3 }), t7 += o3.length - 1;
        }
        l3++;
      }
    }
    static createElement(t6, i7) {
      const s5 = l2.createElement("template");
      return s5.innerHTML = t6, s5;
    }
  };
  function M(t6, i7, s5 = t6, e8) {
    if (i7 === E) return i7;
    let h4 = void 0 !== e8 ? s5._$Co?.[e8] : s5._$Cl;
    const o8 = a2(i7) ? void 0 : i7._$litDirective$;
    return h4?.constructor !== o8 && (h4?._$AO?.(false), void 0 === o8 ? h4 = void 0 : (h4 = new o8(t6), h4._$AT(t6, s5, e8)), void 0 !== e8 ? (s5._$Co ?? (s5._$Co = []))[e8] = h4 : s5._$Cl = h4), void 0 !== h4 && (i7 = M(t6, h4._$AS(t6, i7.values), h4, e8)), i7;
  }
  var R = class {
    constructor(t6, i7) {
      this._$AV = [], this._$AN = void 0, this._$AD = t6, this._$AM = i7;
    }
    get parentNode() {
      return this._$AM.parentNode;
    }
    get _$AU() {
      return this._$AM._$AU;
    }
    u(t6) {
      const { el: { content: i7 }, parts: s5 } = this._$AD, e8 = (t6?.creationScope ?? l2).importNode(i7, true);
      P.currentNode = e8;
      let h4 = P.nextNode(), o8 = 0, n6 = 0, r6 = s5[0];
      for (; void 0 !== r6; ) {
        if (o8 === r6.index) {
          let i8;
          2 === r6.type ? i8 = new k(h4, h4.nextSibling, this, t6) : 1 === r6.type ? i8 = new r6.ctor(h4, r6.name, r6.strings, this, t6) : 6 === r6.type && (i8 = new Z(h4, this, t6)), this._$AV.push(i8), r6 = s5[++n6];
        }
        o8 !== r6?.index && (h4 = P.nextNode(), o8++);
      }
      return P.currentNode = l2, e8;
    }
    p(t6) {
      let i7 = 0;
      for (const s5 of this._$AV) void 0 !== s5 && (void 0 !== s5.strings ? (s5._$AI(t6, s5, i7), i7 += s5.strings.length - 2) : s5._$AI(t6[i7])), i7++;
    }
  };
  var k = class _k {
    get _$AU() {
      return this._$AM?._$AU ?? this._$Cv;
    }
    constructor(t6, i7, s5, e8) {
      this.type = 2, this._$AH = A, this._$AN = void 0, this._$AA = t6, this._$AB = i7, this._$AM = s5, this.options = e8, this._$Cv = e8?.isConnected ?? true;
    }
    get parentNode() {
      let t6 = this._$AA.parentNode;
      const i7 = this._$AM;
      return void 0 !== i7 && 11 === t6?.nodeType && (t6 = i7.parentNode), t6;
    }
    get startNode() {
      return this._$AA;
    }
    get endNode() {
      return this._$AB;
    }
    _$AI(t6, i7 = this) {
      t6 = M(this, t6, i7), a2(t6) ? t6 === A || null == t6 || "" === t6 ? (this._$AH !== A && this._$AR(), this._$AH = A) : t6 !== this._$AH && t6 !== E && this._(t6) : void 0 !== t6._$litType$ ? this.$(t6) : void 0 !== t6.nodeType ? this.T(t6) : d2(t6) ? this.k(t6) : this._(t6);
    }
    O(t6) {
      return this._$AA.parentNode.insertBefore(t6, this._$AB);
    }
    T(t6) {
      this._$AH !== t6 && (this._$AR(), this._$AH = this.O(t6));
    }
    _(t6) {
      this._$AH !== A && a2(this._$AH) ? this._$AA.nextSibling.data = t6 : this.T(l2.createTextNode(t6)), this._$AH = t6;
    }
    $(t6) {
      const { values: i7, _$litType$: s5 } = t6, e8 = "number" == typeof s5 ? this._$AC(t6) : (void 0 === s5.el && (s5.el = S2.createElement(V(s5.h, s5.h[0]), this.options)), s5);
      if (this._$AH?._$AD === e8) this._$AH.p(i7);
      else {
        const t7 = new R(e8, this), s6 = t7.u(this.options);
        t7.p(i7), this.T(s6), this._$AH = t7;
      }
    }
    _$AC(t6) {
      let i7 = C.get(t6.strings);
      return void 0 === i7 && C.set(t6.strings, i7 = new S2(t6)), i7;
    }
    k(t6) {
      u2(this._$AH) || (this._$AH = [], this._$AR());
      const i7 = this._$AH;
      let s5, e8 = 0;
      for (const h4 of t6) e8 === i7.length ? i7.push(s5 = new _k(this.O(c3()), this.O(c3()), this, this.options)) : s5 = i7[e8], s5._$AI(h4), e8++;
      e8 < i7.length && (this._$AR(s5 && s5._$AB.nextSibling, e8), i7.length = e8);
    }
    _$AR(t6 = this._$AA.nextSibling, s5) {
      for (this._$AP?.(false, true, s5); t6 !== this._$AB; ) {
        const s6 = i3(t6).nextSibling;
        i3(t6).remove(), t6 = s6;
      }
    }
    setConnected(t6) {
      void 0 === this._$AM && (this._$Cv = t6, this._$AP?.(t6));
    }
  };
  var H = class {
    get tagName() {
      return this.element.tagName;
    }
    get _$AU() {
      return this._$AM._$AU;
    }
    constructor(t6, i7, s5, e8, h4) {
      this.type = 1, this._$AH = A, this._$AN = void 0, this.element = t6, this.name = i7, this._$AM = e8, this.options = h4, s5.length > 2 || "" !== s5[0] || "" !== s5[1] ? (this._$AH = Array(s5.length - 1).fill(new String()), this.strings = s5) : this._$AH = A;
    }
    _$AI(t6, i7 = this, s5, e8) {
      const h4 = this.strings;
      let o8 = false;
      if (void 0 === h4) t6 = M(this, t6, i7, 0), o8 = !a2(t6) || t6 !== this._$AH && t6 !== E, o8 && (this._$AH = t6);
      else {
        const e9 = t6;
        let n6, r6;
        for (t6 = h4[0], n6 = 0; n6 < h4.length - 1; n6++) r6 = M(this, e9[s5 + n6], i7, n6), r6 === E && (r6 = this._$AH[n6]), o8 || (o8 = !a2(r6) || r6 !== this._$AH[n6]), r6 === A ? t6 = A : t6 !== A && (t6 += (r6 ?? "") + h4[n6 + 1]), this._$AH[n6] = r6;
      }
      o8 && !e8 && this.j(t6);
    }
    j(t6) {
      t6 === A ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t6 ?? "");
    }
  };
  var I = class extends H {
    constructor() {
      super(...arguments), this.type = 3;
    }
    j(t6) {
      this.element[this.name] = t6 === A ? void 0 : t6;
    }
  };
  var L = class extends H {
    constructor() {
      super(...arguments), this.type = 4;
    }
    j(t6) {
      this.element.toggleAttribute(this.name, !!t6 && t6 !== A);
    }
  };
  var z = class extends H {
    constructor(t6, i7, s5, e8, h4) {
      super(t6, i7, s5, e8, h4), this.type = 5;
    }
    _$AI(t6, i7 = this) {
      if ((t6 = M(this, t6, i7, 0) ?? A) === E) return;
      const s5 = this._$AH, e8 = t6 === A && s5 !== A || t6.capture !== s5.capture || t6.once !== s5.once || t6.passive !== s5.passive, h4 = t6 !== A && (s5 === A || e8);
      e8 && this.element.removeEventListener(this.name, this, s5), h4 && this.element.addEventListener(this.name, this, t6), this._$AH = t6;
    }
    handleEvent(t6) {
      "function" == typeof this._$AH ? this._$AH.call(this.options?.host ?? this.element, t6) : this._$AH.handleEvent(t6);
    }
  };
  var Z = class {
    constructor(t6, i7, s5) {
      this.element = t6, this.type = 6, this._$AN = void 0, this._$AM = i7, this.options = s5;
    }
    get _$AU() {
      return this._$AM._$AU;
    }
    _$AI(t6) {
      M(this, t6);
    }
  };
  var j = { M: h2, P: o3, A: n3, C: 1, L: N, R, D: d2, V: M, I: k, H, N: L, U: z, B: I, F: Z };
  var B = t2.litHtmlPolyfillSupport;
  B?.(S2, k), (t2.litHtmlVersions ?? (t2.litHtmlVersions = [])).push("3.3.2");
  var D = (t6, i7, s5) => {
    const e8 = s5?.renderBefore ?? i7;
    let h4 = e8._$litPart$;
    if (void 0 === h4) {
      const t7 = s5?.renderBefore ?? null;
      e8._$litPart$ = h4 = new k(i7.insertBefore(c3(), t7), t7, void 0, s5 ?? {});
    }
    return h4._$AI(t6), h4;
  };

  // node_modules/lit-element/lit-element.js
  var s3 = globalThis;
  var i4 = class extends y {
    constructor() {
      super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
    }
    createRenderRoot() {
      var _a;
      const t6 = super.createRenderRoot();
      return (_a = this.renderOptions).renderBefore ?? (_a.renderBefore = t6.firstChild), t6;
    }
    update(t6) {
      const r6 = this.render();
      this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t6), this._$Do = D(r6, this.renderRoot, this.renderOptions);
    }
    connectedCallback() {
      super.connectedCallback(), this._$Do?.setConnected(true);
    }
    disconnectedCallback() {
      super.disconnectedCallback(), this._$Do?.setConnected(false);
    }
    render() {
      return E;
    }
  };
  i4._$litElement$ = true, i4["finalized"] = true, s3.litElementHydrateSupport?.({ LitElement: i4 });
  var o4 = s3.litElementPolyfillSupport;
  o4?.({ LitElement: i4 });
  (s3.litElementVersions ?? (s3.litElementVersions = [])).push("4.2.2");

  // node_modules/@lit/reactive-element/decorators/custom-element.js
  var t3 = (t6) => (e8, o8) => {
    void 0 !== o8 ? o8.addInitializer(() => {
      customElements.define(t6, e8);
    }) : customElements.define(t6, e8);
  };

  // node_modules/@lit/reactive-element/decorators/property.js
  var o5 = { attribute: true, type: String, converter: u, reflect: false, hasChanged: f };
  var r4 = (t6 = o5, e8, r6) => {
    const { kind: n6, metadata: i7 } = r6;
    let s5 = globalThis.litPropertyMetadata.get(i7);
    if (void 0 === s5 && globalThis.litPropertyMetadata.set(i7, s5 = /* @__PURE__ */ new Map()), "setter" === n6 && ((t6 = Object.create(t6)).wrapped = true), s5.set(r6.name, t6), "accessor" === n6) {
      const { name: o8 } = r6;
      return { set(r7) {
        const n7 = e8.get.call(this);
        e8.set.call(this, r7), this.requestUpdate(o8, n7, t6, true, r7);
      }, init(e9) {
        return void 0 !== e9 && this.C(o8, void 0, t6, e9), e9;
      } };
    }
    if ("setter" === n6) {
      const { name: o8 } = r6;
      return function(r7) {
        const n7 = this[o8];
        e8.call(this, r7), this.requestUpdate(o8, n7, t6, true, r7);
      };
    }
    throw Error("Unsupported decorator location: " + n6);
  };
  function n4(t6) {
    return (e8, o8) => "object" == typeof o8 ? r4(t6, e8, o8) : ((t7, e9, o9) => {
      const r6 = e9.hasOwnProperty(o9);
      return e9.constructor.createProperty(o9, t7), r6 ? Object.getOwnPropertyDescriptor(e9, o9) : void 0;
    })(t6, e8, o8);
  }

  // node_modules/@lit/reactive-element/decorators/state.js
  function r5(r6) {
    return n4({ ...r6, state: true, attribute: false });
  }

  // node_modules/@lit/reactive-element/decorators/base.js
  var e4 = (e8, t6, c5) => (c5.configurable = true, c5.enumerable = true, Reflect.decorate && "object" != typeof t6 && Object.defineProperty(e8, t6, c5), c5);

  // node_modules/@lit/reactive-element/decorators/query.js
  function e5(e8, r6) {
    return (n6, s5, i7) => {
      const o8 = (t6) => t6.renderRoot?.querySelector(e8) ?? null;
      if (r6) {
        const { get: e9, set: r7 } = "object" == typeof s5 ? n6 : i7 ?? /* @__PURE__ */ (() => {
          const t6 = /* @__PURE__ */ Symbol();
          return { get() {
            return this[t6];
          }, set(e10) {
            this[t6] = e10;
          } };
        })();
        return e4(n6, s5, { get() {
          let t6 = e9.call(this);
          return void 0 === t6 && (t6 = o8(this), (null !== t6 || this.hasUpdated) && r7.call(this, t6)), t6;
        } });
      }
      return e4(n6, s5, { get() {
        return o8(this);
      } });
    };
  }

  // node_modules/@lit/reactive-element/decorators/query-assigned-elements.js
  function o6(o8) {
    return (e8, n6) => {
      const { slot: r6, selector: s5 } = o8 ?? {}, c5 = "slot" + (r6 ? `[name=${r6}]` : ":not([name])");
      return e4(e8, n6, { get() {
        const t6 = this.renderRoot?.querySelector(c5), e9 = t6?.assignedElements(o8) ?? [];
        return void 0 === s5 ? e9 : e9.filter((t7) => t7.matches(s5));
      } });
    };
  }

  // node_modules/lit-html/directive.js
  var t4 = { ATTRIBUTE: 1, CHILD: 2, PROPERTY: 3, BOOLEAN_ATTRIBUTE: 4, EVENT: 5, ELEMENT: 6 };
  var e6 = (t6) => (...e8) => ({ _$litDirective$: t6, values: e8 });
  var i5 = class {
    constructor(t6) {
    }
    get _$AU() {
      return this._$AM._$AU;
    }
    _$AT(t6, e8, i7) {
      this._$Ct = t6, this._$AM = e8, this._$Ci = i7;
    }
    _$AS(t6, e8) {
      return this.update(t6, e8);
    }
    update(t6, e8) {
      return this.render(...e8);
    }
  };

  // node_modules/lit-html/directives/class-map.js
  var e7 = e6(class extends i5 {
    constructor(t6) {
      if (super(t6), t6.type !== t4.ATTRIBUTE || "class" !== t6.name || t6.strings?.length > 2) throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.");
    }
    render(t6) {
      return " " + Object.keys(t6).filter((s5) => t6[s5]).join(" ") + " ";
    }
    update(s5, [i7]) {
      if (void 0 === this.st) {
        this.st = /* @__PURE__ */ new Set(), void 0 !== s5.strings && (this.nt = new Set(s5.strings.join(" ").split(/\s/).filter((t6) => "" !== t6)));
        for (const t6 in i7) i7[t6] && !this.nt?.has(t6) && this.st.add(t6);
        return this.render(i7);
      }
      const r6 = s5.element.classList;
      for (const t6 of this.st) t6 in i7 || (r6.remove(t6), this.st.delete(t6));
      for (const t6 in i7) {
        const s6 = !!i7[t6];
        s6 === this.st.has(t6) || this.nt?.has(t6) || (s6 ? (r6.add(t6), this.st.add(t6)) : (r6.remove(t6), this.st.delete(t6)));
      }
      return E;
    }
  });

  // node_modules/@vscode-elements/elements/dist/includes/uniqueId.js
  var counter = 0;
  var uniqueId = (prefix = "") => {
    counter++;
    return `${prefix}${counter}`;
  };
  var uniqueId_default = uniqueId;

  // node_modules/@vscode-elements/elements/dist/includes/VscElement.js
  var VERSION = "2.4.0";
  var CONFIG_KEY = "__vscodeElements_disableRegistryWarning__";
  var VscElement = class extends i4 {
    /** VSCode Elements version */
    get version() {
      return VERSION;
    }
  };
  var customElement = (tagName) => {
    return (classOrTarget) => {
      const customElementClass = customElements.get(tagName);
      if (!customElementClass) {
        customElements.define(tagName, classOrTarget);
        return;
      }
      if (CONFIG_KEY in window) {
        return;
      }
      const el = document.createElement(tagName);
      const anotherVersion = el?.version;
      let message = "";
      if (!anotherVersion) {
        message += "is already registered by an unknown custom element handler class.";
      } else if (anotherVersion !== VERSION) {
        message += "is already registered by a different version of VSCode Elements. ";
        message += `This version is "${VERSION}", while the other one is "${anotherVersion}".`;
      } else {
        message += `is already registered by the same version of VSCode Elements (${VERSION}).`;
      }
      console.warn(`[VSCode Elements] ${tagName} ${message}
To suppress this warning, set window.${CONFIG_KEY} to true`);
    };
  };

  // node_modules/@vscode-elements/elements/dist/includes/default.styles.js
  var default_styles_default = i`
  :host([hidden]) {
    display: none;
  }

  :host([disabled]),
  :host(:disabled) {
    cursor: not-allowed;
    opacity: 0.4;
    pointer-events: none;
  }
`;

  // node_modules/@vscode-elements/elements/dist/vscode-tab-header/vscode-tab-header.styles.js
  var styles = [
    default_styles_default,
    i`
    :host {
      cursor: pointer;
      display: block;
      user-select: none;
    }

    .wrapper {
      align-items: center;
      border-bottom: 1px solid transparent;
      color: var(--vscode-foreground, #cccccc);
      display: flex;
      min-height: 20px;
      overflow: hidden;
      padding: 7px 8px;
      position: relative;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    :host([active]) .wrapper {
      border-bottom-color: var(--vscode-panelTitle-activeForeground, #cccccc);
      color: var(--vscode-panelTitle-activeForeground, #cccccc);
    }

    :host([panel]) .wrapper {
      border-bottom: 0;
      margin-bottom: 0;
      padding: 0;
    }

    :host(:focus-visible) {
      outline: none;
    }

    .wrapper {
      align-items: center;
      color: var(--vscode-foreground, #cccccc);
      display: flex;
      min-height: 20px;
      overflow: inherit;
      text-overflow: inherit;
      position: relative;
    }

    .wrapper.panel {
      color: var(--vscode-panelTitle-inactiveForeground, #9d9d9d);
    }

    .wrapper.panel.active,
    .wrapper.panel:hover {
      color: var(--vscode-panelTitle-activeForeground, #cccccc);
    }

    :host([panel]) .wrapper {
      display: flex;
      font-size: 11px;
      height: 31px;
      padding: 2px 10px;
      text-transform: uppercase;
    }

    .main {
      overflow: inherit;
      text-overflow: inherit;
    }

    .active-indicator {
      display: none;
    }

    .active-indicator.panel.active {
      border-top: 1px solid var(--vscode-panelTitle-activeBorder, #0078d4);
      bottom: 4px;
      display: block;
      left: 8px;
      pointer-events: none;
      position: absolute;
      right: 8px;
    }

    :host(:focus-visible) .wrapper {
      outline-color: var(--vscode-focusBorder, #0078d4);
      outline-offset: 3px;
      outline-style: solid;
      outline-width: 1px;
    }

    :host(:focus-visible) .wrapper.panel {
      outline-offset: -2px;
    }

    slot[name='content-before']::slotted(vscode-badge) {
      margin-right: 8px;
    }

    slot[name='content-after']::slotted(vscode-badge) {
      margin-left: 8px;
    }
  `
  ];
  var vscode_tab_header_styles_default = styles;

  // node_modules/@vscode-elements/elements/dist/vscode-tab-header/vscode-tab-header.js
  var __decorate = function(decorators, target, key, desc) {
    var c5 = arguments.length, r6 = c5 < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d3;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r6 = Reflect.decorate(decorators, target, key, desc);
    else for (var i7 = decorators.length - 1; i7 >= 0; i7--) if (d3 = decorators[i7]) r6 = (c5 < 3 ? d3(r6) : c5 > 3 ? d3(target, key, r6) : d3(target, key)) || r6;
    return c5 > 3 && r6 && Object.defineProperty(target, key, r6), r6;
  };
  var VscodeTabHeader = class VscodeTabHeader2 extends VscElement {
    constructor() {
      super(...arguments);
      this.active = false;
      this.ariaControls = "";
      this.panel = false;
      this.role = "tab";
      this.tabId = -1;
    }
    attributeChangedCallback(name, old, value) {
      super.attributeChangedCallback(name, old, value);
      if (name === "active") {
        const active = value !== null;
        this.ariaSelected = active ? "true" : "false";
        this.tabIndex = active ? 0 : -1;
      }
    }
    render() {
      return b2`
      <div
        class=${e7({
        wrapper: true,
        active: this.active,
        panel: this.panel
      })}
      >
        <div class="before"><slot name="content-before"></slot></div>
        <div class="main"><slot></slot></div>
        <div class="after"><slot name="content-after"></slot></div>
        <span
          class=${e7({
        "active-indicator": true,
        active: this.active,
        panel: this.panel
      })}
        ></span>
      </div>
    `;
    }
  };
  VscodeTabHeader.styles = vscode_tab_header_styles_default;
  __decorate([
    n4({ type: Boolean, reflect: true })
  ], VscodeTabHeader.prototype, "active", void 0);
  __decorate([
    n4({ reflect: true, attribute: "aria-controls" })
  ], VscodeTabHeader.prototype, "ariaControls", void 0);
  __decorate([
    n4({ type: Boolean, reflect: true })
  ], VscodeTabHeader.prototype, "panel", void 0);
  __decorate([
    n4({ reflect: true })
  ], VscodeTabHeader.prototype, "role", void 0);
  __decorate([
    n4({ type: Number, reflect: true, attribute: "tab-id" })
  ], VscodeTabHeader.prototype, "tabId", void 0);
  VscodeTabHeader = __decorate([
    customElement("vscode-tab-header")
  ], VscodeTabHeader);

  // node_modules/@vscode-elements/elements/dist/vscode-tab-panel/vscode-tab-panel.styles.js
  var styles2 = [
    default_styles_default,
    i`
    :host {
      display: block;
      overflow: hidden;
    }

    :host(:focus-visible) {
      outline-color: var(--vscode-focusBorder, #0078d4);
      outline-offset: 3px;
      outline-style: solid;
      outline-width: 1px;
    }

    :host([panel]) {
      background-color: var(--vscode-panel-background, #181818);
    }
  `
  ];
  var vscode_tab_panel_styles_default = styles2;

  // node_modules/@vscode-elements/elements/dist/vscode-tab-panel/vscode-tab-panel.js
  var __decorate2 = function(decorators, target, key, desc) {
    var c5 = arguments.length, r6 = c5 < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d3;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r6 = Reflect.decorate(decorators, target, key, desc);
    else for (var i7 = decorators.length - 1; i7 >= 0; i7--) if (d3 = decorators[i7]) r6 = (c5 < 3 ? d3(r6) : c5 > 3 ? d3(target, key, r6) : d3(target, key)) || r6;
    return c5 > 3 && r6 && Object.defineProperty(target, key, r6), r6;
  };
  var VscodeTabPanel = class VscodeTabPanel2 extends VscElement {
    constructor() {
      super(...arguments);
      this.hidden = false;
      this.ariaLabelledby = "";
      this.panel = false;
      this.role = "tabpanel";
      this.tabIndex = 0;
    }
    render() {
      return b2` <slot></slot> `;
    }
  };
  VscodeTabPanel.styles = vscode_tab_panel_styles_default;
  __decorate2([
    n4({ type: Boolean, reflect: true })
  ], VscodeTabPanel.prototype, "hidden", void 0);
  __decorate2([
    n4({ reflect: true, attribute: "aria-labelledby" })
  ], VscodeTabPanel.prototype, "ariaLabelledby", void 0);
  __decorate2([
    n4({ type: Boolean, reflect: true })
  ], VscodeTabPanel.prototype, "panel", void 0);
  __decorate2([
    n4({ reflect: true })
  ], VscodeTabPanel.prototype, "role", void 0);
  __decorate2([
    n4({ type: Number, reflect: true })
  ], VscodeTabPanel.prototype, "tabIndex", void 0);
  VscodeTabPanel = __decorate2([
    customElement("vscode-tab-panel")
  ], VscodeTabPanel);

  // node_modules/@vscode-elements/elements/dist/vscode-tabs/vscode-tabs.styles.js
  var styles3 = [
    default_styles_default,
    i`
    :host {
      display: block;
    }

    .header {
      align-items: center;
      display: flex;
      font-family: var(--vscode-font-family, sans-serif);
      font-size: var(--vscode-font-size, 13px);
      font-weight: var(--vscode-font-weight, normal);
      width: 100%;
    }

    .header {
      border-bottom-color: var(--vscode-settings-headerBorder, #2b2b2b);
      border-bottom-style: solid;
      border-bottom-width: 1px;
    }

    .header.panel {
      background-color: var(--vscode-panel-background, #181818);
      border-bottom-width: 0;
      box-sizing: border-box;
      padding-left: 8px;
      padding-right: 8px;
    }

    .tablist {
      display: flex;
      margin-bottom: -1px;
    }

    slot[name='addons'] {
      display: block;
      margin-left: auto;
    }
  `
  ];
  var vscode_tabs_styles_default = styles3;

  // node_modules/@vscode-elements/elements/dist/vscode-tabs/vscode-tabs.js
  var __decorate3 = function(decorators, target, key, desc) {
    var c5 = arguments.length, r6 = c5 < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d3;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r6 = Reflect.decorate(decorators, target, key, desc);
    else for (var i7 = decorators.length - 1; i7 >= 0; i7--) if (d3 = decorators[i7]) r6 = (c5 < 3 ? d3(r6) : c5 > 3 ? d3(target, key, r6) : d3(target, key)) || r6;
    return c5 > 3 && r6 && Object.defineProperty(target, key, r6), r6;
  };
  var VscodeTabs = class VscodeTabs2 extends VscElement {
    constructor() {
      super();
      this.panel = false;
      this.selectedIndex = 0;
      this._tabHeaders = [];
      this._tabPanels = [];
      this._componentId = "";
      this._tabFocus = 0;
      this._componentId = uniqueId_default();
    }
    attributeChangedCallback(name, old, value) {
      super.attributeChangedCallback(name, old, value);
      if (name === "selected-index") {
        this._setActiveTab();
      }
      if (name === "panel") {
        this._tabHeaders.forEach((h4) => h4.panel = value !== null);
        this._tabPanels.forEach((p4) => p4.panel = value !== null);
      }
    }
    _dispatchSelectEvent() {
      this.dispatchEvent(new CustomEvent("vsc-tabs-select", {
        detail: {
          selectedIndex: this.selectedIndex
        },
        composed: true
      }));
    }
    _setActiveTab() {
      this._tabFocus = this.selectedIndex;
      this._tabPanels.forEach((el, i7) => {
        el.hidden = i7 !== this.selectedIndex;
      });
      this._tabHeaders.forEach((el, i7) => {
        el.active = i7 === this.selectedIndex;
      });
    }
    _focusPrevTab() {
      if (this._tabFocus === 0) {
        this._tabFocus = this._tabHeaders.length - 1;
      } else {
        this._tabFocus -= 1;
      }
    }
    _focusNextTab() {
      if (this._tabFocus === this._tabHeaders.length - 1) {
        this._tabFocus = 0;
      } else {
        this._tabFocus += 1;
      }
    }
    _onHeaderKeyDown(ev) {
      if (ev.key === "ArrowLeft" || ev.key === "ArrowRight") {
        ev.preventDefault();
        this._tabHeaders[this._tabFocus].setAttribute("tabindex", "-1");
        if (ev.key === "ArrowLeft") {
          this._focusPrevTab();
        } else if (ev.key === "ArrowRight") {
          this._focusNextTab();
        }
        this._tabHeaders[this._tabFocus].setAttribute("tabindex", "0");
        this._tabHeaders[this._tabFocus].focus();
      }
      if (ev.key === "Enter") {
        ev.preventDefault();
        this.selectedIndex = this._tabFocus;
        this._dispatchSelectEvent();
      }
    }
    _moveHeadersToHeaderSlot() {
      const headers = this._mainSlotElements.filter((el) => el instanceof VscodeTabHeader);
      if (headers.length > 0) {
        headers.forEach((h4) => h4.setAttribute("slot", "header"));
      }
    }
    _onMainSlotChange() {
      this._moveHeadersToHeaderSlot();
      this._tabPanels = this._mainSlotElements.filter((el) => el instanceof VscodeTabPanel);
      this._tabPanels.forEach((el, i7) => {
        el.ariaLabelledby = `t${this._componentId}-h${i7}`;
        el.id = `t${this._componentId}-p${i7}`;
        el.panel = this.panel;
      });
      this._setActiveTab();
    }
    _onHeaderSlotChange() {
      this._tabHeaders = this._headerSlotElements.filter((el) => el instanceof VscodeTabHeader);
      this._tabHeaders.forEach((el, i7) => {
        el.tabId = i7;
        el.id = `t${this._componentId}-h${i7}`;
        el.ariaControls = `t${this._componentId}-p${i7}`;
        el.panel = this.panel;
        el.active = i7 === this.selectedIndex;
      });
    }
    _onHeaderClick(event) {
      const path = event.composedPath();
      const headerEl = path.find((et) => et instanceof VscodeTabHeader);
      if (headerEl) {
        this.selectedIndex = headerEl.tabId;
        this._setActiveTab();
        this._dispatchSelectEvent();
      }
    }
    render() {
      return b2`
      <div
        class=${e7({ header: true, panel: this.panel })}
        @click=${this._onHeaderClick}
        @keydown=${this._onHeaderKeyDown}
      >
        <div role="tablist" class="tablist">
          <slot
            name="header"
            @slotchange=${this._onHeaderSlotChange}
            role="tablist"
          ></slot>
        </div>
        <slot name="addons"></slot>
      </div>
      <slot @slotchange=${this._onMainSlotChange}></slot>
    `;
    }
  };
  VscodeTabs.styles = vscode_tabs_styles_default;
  __decorate3([
    n4({ type: Boolean, reflect: true })
  ], VscodeTabs.prototype, "panel", void 0);
  __decorate3([
    n4({ type: Number, reflect: true, attribute: "selected-index" })
  ], VscodeTabs.prototype, "selectedIndex", void 0);
  __decorate3([
    o6({ slot: "header" })
  ], VscodeTabs.prototype, "_headerSlotElements", void 0);
  __decorate3([
    o6()
  ], VscodeTabs.prototype, "_mainSlotElements", void 0);
  VscodeTabs = __decorate3([
    customElement("vscode-tabs")
  ], VscodeTabs);

  // src/webview/components/common/base-element.ts
  var BaseElement = class extends i4 {
  };
  BaseElement.styles = i`
    :host {
      --background: var(--vscode-editor-background);
      --foreground: var(--vscode-editor-foreground);
      --primary: var(--vscode-button-primaryBackground);
      --primary-foreground: var(--vscode-button-primaryForeground);
      --border: var(--vscode-panel-border);
      --input-background: var(--vscode-input-background);
      --input-foreground: var(--vscode-input-foreground);
      --input-border: var(--vscode-input-border);
      --error: var(--vscode-errorForeground);
      --success: var(--vscode-testing-iconPassed);
      --warning: var(--vscode-editorWarning-foreground);
      --description: var(--vscode-descriptionForeground);
      
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      color: var(--foreground);
    }

    * {
      box-sizing: border-box;
    }
  `;

  // node_modules/lit-html/directives/if-defined.js
  var o7 = (o8) => o8 ?? A;

  // node_modules/@vscode-elements/elements/dist/includes/vscode-select/template-elements.js
  var chevronDownIcon = b2`
  <span class="icon">
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M7.976 10.072l4.357-4.357.62.618L8.284 11h-.618L3 6.333l.619-.618 4.357 4.357z"
      />
    </svg>
  </span>
`;
  var checkIcon = w`<svg
  width="16"
  height="16"
  viewBox="0 0 16 16"
  xmlns="http://www.w3.org/2000/svg"
  fill="currentColor"
>
  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M14.431 3.323l-8.47 10-.79-.036-3.35-4.77.818-.574 2.978 4.24 8.051-9.506.764.646z"
  />
</svg>`;

  // node_modules/lit-html/directive-helpers.js
  var { I: t5 } = j;
  var i6 = (o8) => o8;
  var s4 = () => document.createComment("");
  var v2 = (o8, n6, e8) => {
    const l3 = o8._$AA.parentNode, d3 = void 0 === n6 ? o8._$AB : n6._$AA;
    if (void 0 === e8) {
      const i7 = l3.insertBefore(s4(), d3), n7 = l3.insertBefore(s4(), d3);
      e8 = new t5(i7, n7, o8, o8.options);
    } else {
      const t6 = e8._$AB.nextSibling, n7 = e8._$AM, c5 = n7 !== o8;
      if (c5) {
        let t7;
        e8._$AQ?.(o8), e8._$AM = o8, void 0 !== e8._$AP && (t7 = o8._$AU) !== n7._$AU && e8._$AP(t7);
      }
      if (t6 !== d3 || c5) {
        let o9 = e8._$AA;
        for (; o9 !== t6; ) {
          const t7 = i6(o9).nextSibling;
          i6(l3).insertBefore(o9, d3), o9 = t7;
        }
      }
    }
    return e8;
  };
  var u3 = (o8, t6, i7 = o8) => (o8._$AI(t6, i7), o8);
  var m2 = {};
  var p3 = (o8, t6 = m2) => o8._$AH = t6;
  var M2 = (o8) => o8._$AH;
  var h3 = (o8) => {
    o8._$AR(), o8._$AA.remove();
  };

  // node_modules/lit-html/directives/repeat.js
  var u4 = (e8, s5, t6) => {
    const r6 = /* @__PURE__ */ new Map();
    for (let l3 = s5; l3 <= t6; l3++) r6.set(e8[l3], l3);
    return r6;
  };
  var c4 = e6(class extends i5 {
    constructor(e8) {
      if (super(e8), e8.type !== t4.CHILD) throw Error("repeat() can only be used in text expressions");
    }
    dt(e8, s5, t6) {
      let r6;
      void 0 === t6 ? t6 = s5 : void 0 !== s5 && (r6 = s5);
      const l3 = [], o8 = [];
      let i7 = 0;
      for (const s6 of e8) l3[i7] = r6 ? r6(s6, i7) : i7, o8[i7] = t6(s6, i7), i7++;
      return { values: o8, keys: l3 };
    }
    render(e8, s5, t6) {
      return this.dt(e8, s5, t6).values;
    }
    update(s5, [t6, r6, c5]) {
      const d3 = M2(s5), { values: p4, keys: a3 } = this.dt(t6, r6, c5);
      if (!Array.isArray(d3)) return this.ut = a3, p4;
      const h4 = this.ut ?? (this.ut = []), v3 = [];
      let m3, y3, x2 = 0, j2 = d3.length - 1, k2 = 0, w2 = p4.length - 1;
      for (; x2 <= j2 && k2 <= w2; ) if (null === d3[x2]) x2++;
      else if (null === d3[j2]) j2--;
      else if (h4[x2] === a3[k2]) v3[k2] = u3(d3[x2], p4[k2]), x2++, k2++;
      else if (h4[j2] === a3[w2]) v3[w2] = u3(d3[j2], p4[w2]), j2--, w2--;
      else if (h4[x2] === a3[w2]) v3[w2] = u3(d3[x2], p4[w2]), v2(s5, v3[w2 + 1], d3[x2]), x2++, w2--;
      else if (h4[j2] === a3[k2]) v3[k2] = u3(d3[j2], p4[k2]), v2(s5, d3[x2], d3[j2]), j2--, k2++;
      else if (void 0 === m3 && (m3 = u4(a3, k2, w2), y3 = u4(h4, x2, j2)), m3.has(h4[x2])) if (m3.has(h4[j2])) {
        const e8 = y3.get(a3[k2]), t7 = void 0 !== e8 ? d3[e8] : null;
        if (null === t7) {
          const e9 = v2(s5, d3[x2]);
          u3(e9, p4[k2]), v3[k2] = e9;
        } else v3[k2] = u3(t7, p4[k2]), v2(s5, d3[x2], t7), d3[e8] = null;
        k2++;
      } else h3(d3[j2]), j2--;
      else h3(d3[x2]), x2++;
      for (; k2 <= w2; ) {
        const e8 = v2(s5, v3[w2 + 1]);
        u3(e8, p4[k2]), v3[k2++] = e8;
      }
      for (; x2 <= j2; ) {
        const e8 = d3[x2++];
        null !== e8 && h3(e8);
      }
      return this.ut = a3, p3(s5, v3), E;
    }
  });

  // node_modules/lit-html/directives/when.js
  function n5(n6, r6, t6) {
    return n6 ? r6(n6) : t6?.(n6);
  }

  // node_modules/@vscode-elements/elements/dist/includes/style-property-map.js
  var StylePropertyMap = class extends i5 {
    constructor(partInfo) {
      super(partInfo);
      this._prevProperties = {};
      if (partInfo.type !== t4.PROPERTY || partInfo.name !== "style") {
        throw new Error("The `stylePropertyMap` directive must be used in the `style` property");
      }
    }
    update(part, [styleProps]) {
      Object.entries(styleProps).forEach(([key, val]) => {
        if (this._prevProperties[key] !== val) {
          if (key.startsWith("--")) {
            part.element.style.setProperty(key, val);
          } else {
            part.element.style[key] = val;
          }
          this._prevProperties[key] = val;
        }
      });
      return E;
    }
    render(_styleProps) {
      return E;
    }
  };
  var stylePropertyMap = e6(StylePropertyMap);

  // node_modules/@vscode-elements/elements/dist/vscode-icon/vscode-icon.styles.js
  var styles4 = [
    default_styles_default,
    i`
    :host {
      color: var(--vscode-icon-foreground, #cccccc);
      display: inline-block;
    }

    .codicon[class*='codicon-'] {
      display: block;
    }

    .icon,
    .button {
      background-color: transparent;
      display: block;
      padding: 0;
    }

    .button {
      border-color: transparent;
      border-style: solid;
      border-width: 1px;
      border-radius: 5px;
      color: currentColor;
      cursor: pointer;
      padding: 2px;
    }

    .button:hover {
      background-color: var(
        --vscode-toolbar-hoverBackground,
        rgba(90, 93, 94, 0.31)
      );
    }

    .button:active {
      background-color: var(
        --vscode-toolbar-activeBackground,
        rgba(99, 102, 103, 0.31)
      );
    }

    .button:focus {
      outline: none;
    }

    .button:focus-visible {
      border-color: var(--vscode-focusBorder, #0078d4);
    }

    @keyframes icon-spin {
      100% {
        transform: rotate(360deg);
      }
    }

    .spin {
      animation-name: icon-spin;
      animation-timing-function: linear;
      animation-iteration-count: infinite;
    }
  `
  ];
  var vscode_icon_styles_default = styles4;

  // node_modules/@vscode-elements/elements/dist/vscode-icon/vscode-icon.js
  var __decorate4 = function(decorators, target, key, desc) {
    var c5 = arguments.length, r6 = c5 < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d3;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r6 = Reflect.decorate(decorators, target, key, desc);
    else for (var i7 = decorators.length - 1; i7 >= 0; i7--) if (d3 = decorators[i7]) r6 = (c5 < 3 ? d3(r6) : c5 > 3 ? d3(target, key, r6) : d3(target, key)) || r6;
    return c5 > 3 && r6 && Object.defineProperty(target, key, r6), r6;
  };
  var VscodeIcon_1;
  var VscodeIcon = VscodeIcon_1 = class VscodeIcon2 extends VscElement {
    constructor() {
      super(...arguments);
      this.label = "";
      this.name = "";
      this.size = 16;
      this.spin = false;
      this.spinDuration = 1.5;
      this.actionIcon = false;
      this._onButtonClick = (ev) => {
        this.dispatchEvent(new CustomEvent("vsc-click", { detail: { originalEvent: ev } }));
      };
    }
    connectedCallback() {
      super.connectedCallback();
      const { href, nonce } = this._getStylesheetConfig();
      VscodeIcon_1.stylesheetHref = href;
      VscodeIcon_1.nonce = nonce;
    }
    /**
     * For using web fonts in web components, the font stylesheet must be included
     * twice: on the page and in the web component. This function looks for the
     * font stylesheet on the page and returns the stylesheet URL and the nonce
     * id.
     */
    _getStylesheetConfig() {
      const linkElement = document.getElementById("vscode-codicon-stylesheet");
      const href = linkElement?.getAttribute("href") || void 0;
      const nonce = linkElement?.nonce || void 0;
      if (!linkElement) {
        let msg = "[VSCode Elements] To use the Icon component, the codicons.css file must be included in the page with the id `vscode-codicon-stylesheet`! ";
        msg += "See https://vscode-elements.github.io/components/icon/ for more details.";
        console.warn(msg);
      }
      return { nonce, href };
    }
    render() {
      const { stylesheetHref, nonce } = VscodeIcon_1;
      const content = b2`<span
      class=${e7({
        codicon: true,
        ["codicon-" + this.name]: true,
        spin: this.spin
      })}
      .style=${stylePropertyMap({
        animationDuration: String(this.spinDuration) + "s",
        fontSize: this.size + "px",
        height: this.size + "px",
        width: this.size + "px"
      })}
    ></span>`;
      const wrapped = this.actionIcon ? b2` <button
          class="button"
          @click=${this._onButtonClick}
          aria-label=${this.label}
        >
          ${content}
        </button>` : b2` <span class="icon" aria-hidden="true" role="presentation"
          >${content}</span
        >`;
      return b2`
      <link
        rel="stylesheet"
        href=${o7(stylesheetHref)}
        nonce=${o7(nonce)}
      >
      ${wrapped}
    `;
    }
  };
  VscodeIcon.styles = vscode_icon_styles_default;
  VscodeIcon.stylesheetHref = "";
  VscodeIcon.nonce = "";
  __decorate4([
    n4()
  ], VscodeIcon.prototype, "label", void 0);
  __decorate4([
    n4({ type: String })
  ], VscodeIcon.prototype, "name", void 0);
  __decorate4([
    n4({ type: Number })
  ], VscodeIcon.prototype, "size", void 0);
  __decorate4([
    n4({ type: Boolean, reflect: true })
  ], VscodeIcon.prototype, "spin", void 0);
  __decorate4([
    n4({ type: Number, attribute: "spin-duration" })
  ], VscodeIcon.prototype, "spinDuration", void 0);
  __decorate4([
    n4({ type: Boolean, reflect: true, attribute: "action-icon" })
  ], VscodeIcon.prototype, "actionIcon", void 0);
  VscodeIcon = VscodeIcon_1 = __decorate4([
    customElement("vscode-icon")
  ], VscodeIcon);

  // node_modules/@vscode-elements/elements/dist/includes/helpers.js
  var DEFAULT_LINE_HEIGHT = 16;
  var DEFAULT_FONT_SIZE = 13;
  var INPUT_LINE_HEIGHT_RATIO = DEFAULT_LINE_HEIGHT / DEFAULT_FONT_SIZE;
  function getDefaultFontStack() {
    if (navigator.userAgent.indexOf("Linux") > -1) {
      return 'system-ui, "Ubuntu", "Droid Sans", sans-serif';
    } else if (navigator.userAgent.indexOf("Mac") > -1) {
      return "-apple-system, BlinkMacSystemFont, sans-serif";
    } else if (navigator.userAgent.indexOf("Windows") > -1) {
      return '"Segoe WPC", "Segoe UI", sans-serif';
    } else {
      return "sans-serif";
    }
  }

  // node_modules/@vscode-elements/elements/dist/vscode-button/vscode-button.styles.js
  var defaultFontStack = r(getDefaultFontStack());
  var styles5 = [
    default_styles_default,
    i`
    :host {
      cursor: pointer;
      display: inline-block;
      width: auto;
    }

    :host([block]) {
      display: block;
      width: 100%;
    }

    .base {
      align-items: center;
      background-color: var(--vscode-button-background, #0078d4);
      border-bottom-left-radius: var(--vsc-border-left-radius, 2px);
      border-bottom-right-radius: var(--vsc-border-right-radius, 2px);
      border-bottom-width: 1px;
      border-color: var(--vscode-button-border, transparent);
      border-left-width: var(--vsc-border-left-width, 1px);
      border-right-width: var(--vsc-border-right-width, 1px);
      border-style: solid;
      border-top-left-radius: var(--vsc-border-left-radius, 2px);
      border-top-right-radius: var(--vsc-border-right-radius, 2px);
      border-top-width: 1px;
      box-sizing: border-box;
      color: var(--vscode-button-foreground, #ffffff);
      display: flex;
      font-family: var(--vscode-font-family, ${defaultFontStack});
      font-size: var(--vscode-font-size, 13px);
      font-weight: var(--vscode-font-weight, normal);
      height: 100%;
      justify-content: center;
      line-height: 22px;
      overflow: hidden;
      padding: 1px calc(13px + var(--vsc-base-additional-right-padding, 0px))
        1px 13px;
      position: relative;
      user-select: none;
      white-space: nowrap;
      width: 100%;
    }

    :host([block]) .base {
      min-height: 28px;
      text-align: center;
      width: 100%;
    }

    .base:after {
      background-color: var(
        --vscode-button-separator,
        rgba(255, 255, 255, 0.4)
      );
      content: var(--vsc-base-after-content);
      display: var(--vsc-divider-display, none);
      position: absolute;
      right: 0;
      top: 4px;
      bottom: 4px;
      width: 1px;
    }

    :host([secondary]) .base:after {
      background-color: var(--vscode-button-secondaryForeground, #cccccc);
      opacity: 0.4;
    }

    :host([secondary]) .base {
      color: var(--vscode-button-secondaryForeground, #cccccc);
      background-color: var(--vscode-button-secondaryBackground, #313131);
      border-color: var(
        --vscode-button-border,
        var(--vscode-button-secondaryBackground, rgba(255, 255, 255, 0.07))
      );
    }

    :host([disabled]) {
      cursor: default;
      opacity: 0.4;
      pointer-events: none;
    }

    :host(:hover) .base {
      background-color: var(--vscode-button-hoverBackground, #026ec1);
    }

    :host([disabled]:hover) .base {
      background-color: var(--vscode-button-background, #0078d4);
    }

    :host([secondary]:hover) .base {
      background-color: var(--vscode-button-secondaryHoverBackground, #3c3c3c);
    }

    :host([secondary][disabled]:hover) .base {
      background-color: var(--vscode-button-secondaryBackground, #313131);
    }

    :host(:focus),
    :host(:active) {
      outline: none;
    }

    :host(:focus) .base {
      background-color: var(--vscode-button-hoverBackground, #026ec1);
      outline: 1px solid var(--vscode-focusBorder, #0078d4);
      outline-offset: 2px;
    }

    :host([disabled]:focus) .base {
      background-color: var(--vscode-button-background, #0078d4);
      outline: 0;
    }

    :host([secondary]:focus) .base {
      background-color: var(--vscode-button-secondaryHoverBackground, #3c3c3c);
    }

    :host([secondary][disabled]:focus) .base {
      background-color: var(--vscode-button-secondaryBackground, #313131);
    }

    ::slotted(*) {
      display: inline-block;
      margin-left: 4px;
      margin-right: 4px;
    }

    ::slotted(*:first-child) {
      margin-left: 0;
    }

    ::slotted(*:last-child) {
      margin-right: 0;
    }

    ::slotted(vscode-icon) {
      color: inherit;
    }

    .content {
      display: flex;
      position: relative;
      width: 100%;
      height: 100%;
      padding: 1px 13px;
    }

    :host(:empty) .base,
    .base.icon-only {
      min-height: 24px;
      min-width: 26px;
      padding: 1px 4px;
    }

    slot {
      align-items: center;
      display: flex;
      height: 100%;
    }

    .has-content-before slot[name='content-before'] {
      margin-right: 4px;
    }

    .has-content-after slot[name='content-after'] {
      margin-left: 4px;
    }

    .icon,
    .icon-after {
      color: inherit;
      display: block;
    }

    :host(:not(:empty)) .icon {
      margin-right: 3px;
    }

    :host(:not(:empty)) .icon-after,
    :host([icon]) .icon-after {
      margin-left: 3px;
    }
  `
  ];
  var vscode_button_styles_default = styles5;

  // node_modules/@vscode-elements/elements/dist/vscode-button/vscode-button.js
  var __decorate5 = function(decorators, target, key, desc) {
    var c5 = arguments.length, r6 = c5 < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d3;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r6 = Reflect.decorate(decorators, target, key, desc);
    else for (var i7 = decorators.length - 1; i7 >= 0; i7--) if (d3 = decorators[i7]) r6 = (c5 < 3 ? d3(r6) : c5 > 3 ? d3(target, key, r6) : d3(target, key)) || r6;
    return c5 > 3 && r6 && Object.defineProperty(target, key, r6), r6;
  };
  var VscodeButton = class VscodeButton2 extends VscElement {
    get form() {
      return this._internals.form;
    }
    constructor() {
      super();
      this.autofocus = false;
      this.tabIndex = 0;
      this.secondary = false;
      this.block = false;
      this.role = "button";
      this.disabled = false;
      this.icon = "";
      this.iconSpin = false;
      this.iconAfter = "";
      this.iconAfterSpin = false;
      this.focused = false;
      this.name = void 0;
      this.iconOnly = false;
      this.type = "button";
      this.value = "";
      this._prevTabindex = 0;
      this._hasContentBefore = false;
      this._hasContentAfter = false;
      this._handleFocus = () => {
        this.focused = true;
      };
      this._handleBlur = () => {
        this.focused = false;
      };
      this.addEventListener("keydown", this._handleKeyDown.bind(this));
      this.addEventListener("click", this._handleClick.bind(this));
      this._internals = this.attachInternals();
    }
    connectedCallback() {
      super.connectedCallback();
      if (this.autofocus) {
        if (this.tabIndex < 0) {
          this.tabIndex = 0;
        }
        this.updateComplete.then(() => {
          this.focus();
          this.requestUpdate();
        });
      }
      this.addEventListener("focus", this._handleFocus);
      this.addEventListener("blur", this._handleBlur);
    }
    disconnectedCallback() {
      super.disconnectedCallback();
      this.removeEventListener("focus", this._handleFocus);
      this.removeEventListener("blur", this._handleBlur);
    }
    update(changedProperties) {
      super.update(changedProperties);
      if (changedProperties.has("value")) {
        this._internals.setFormValue(this.value);
      }
      if (changedProperties.has("disabled")) {
        if (this.disabled) {
          this._prevTabindex = this.tabIndex;
          this.tabIndex = -1;
        } else {
          this.tabIndex = this._prevTabindex;
        }
      }
    }
    _executeAction() {
      if (this.type === "submit" && this._internals.form) {
        this._internals.form.requestSubmit();
      }
      if (this.type === "reset" && this._internals.form) {
        this._internals.form.reset();
      }
    }
    _handleKeyDown(event) {
      if ((event.key === "Enter" || event.key === " ") && !this.hasAttribute("disabled")) {
        const syntheticClick = new MouseEvent("click", {
          bubbles: true,
          cancelable: true
        });
        syntheticClick.synthetic = true;
        this.dispatchEvent(syntheticClick);
        this._executeAction();
      }
    }
    _handleClick(event) {
      if (event.synthetic) {
        return;
      }
      if (!this.hasAttribute("disabled")) {
        this._executeAction();
      }
    }
    _handleSlotChange(ev) {
      const slot = ev.target;
      if (slot.name === "content-before") {
        this._hasContentBefore = slot.assignedElements().length > 0;
      }
      if (slot.name === "content-after") {
        this._hasContentAfter = slot.assignedElements().length > 0;
      }
    }
    render() {
      const hasIcon = this.icon !== "";
      const hasIconAfter = this.iconAfter !== "";
      const baseClasses = {
        base: true,
        "icon-only": this.iconOnly,
        "has-content-before": this._hasContentBefore,
        "has-content-after": this._hasContentAfter
      };
      const iconElem = hasIcon ? b2`<vscode-icon
          name=${this.icon}
          ?spin=${this.iconSpin}
          spin-duration=${o7(this.iconSpinDuration)}
          class="icon"
        ></vscode-icon>` : A;
      const iconAfterElem = hasIconAfter ? b2`<vscode-icon
          name=${this.iconAfter}
          ?spin=${this.iconAfterSpin}
          spin-duration=${o7(this.iconAfterSpinDuration)}
          class="icon-after"
        ></vscode-icon>` : A;
      return b2`
      <div
        class=${e7(baseClasses)}
        part="base"
        @slotchange=${this._handleSlotChange}
      >
        <slot name="content-before"></slot>
        ${iconElem}
        <slot></slot>
        ${iconAfterElem}
        <slot name="content-after"></slot>
      </div>
    `;
    }
  };
  VscodeButton.styles = vscode_button_styles_default;
  VscodeButton.formAssociated = true;
  __decorate5([
    n4({ type: Boolean, reflect: true })
  ], VscodeButton.prototype, "autofocus", void 0);
  __decorate5([
    n4({ type: Number, reflect: true })
  ], VscodeButton.prototype, "tabIndex", void 0);
  __decorate5([
    n4({ type: Boolean, reflect: true })
  ], VscodeButton.prototype, "secondary", void 0);
  __decorate5([
    n4({ type: Boolean, reflect: true })
  ], VscodeButton.prototype, "block", void 0);
  __decorate5([
    n4({ reflect: true })
  ], VscodeButton.prototype, "role", void 0);
  __decorate5([
    n4({ type: Boolean, reflect: true })
  ], VscodeButton.prototype, "disabled", void 0);
  __decorate5([
    n4()
  ], VscodeButton.prototype, "icon", void 0);
  __decorate5([
    n4({ type: Boolean, reflect: true, attribute: "icon-spin" })
  ], VscodeButton.prototype, "iconSpin", void 0);
  __decorate5([
    n4({ type: Number, reflect: true, attribute: "icon-spin-duration" })
  ], VscodeButton.prototype, "iconSpinDuration", void 0);
  __decorate5([
    n4({ attribute: "icon-after" })
  ], VscodeButton.prototype, "iconAfter", void 0);
  __decorate5([
    n4({ type: Boolean, reflect: true, attribute: "icon-after-spin" })
  ], VscodeButton.prototype, "iconAfterSpin", void 0);
  __decorate5([
    n4({
      type: Number,
      reflect: true,
      attribute: "icon-after-spin-duration"
    })
  ], VscodeButton.prototype, "iconAfterSpinDuration", void 0);
  __decorate5([
    n4({ type: Boolean, reflect: true })
  ], VscodeButton.prototype, "focused", void 0);
  __decorate5([
    n4({ type: String, reflect: true })
  ], VscodeButton.prototype, "name", void 0);
  __decorate5([
    n4({ type: Boolean, reflect: true, attribute: "icon-only" })
  ], VscodeButton.prototype, "iconOnly", void 0);
  __decorate5([
    n4({ reflect: true })
  ], VscodeButton.prototype, "type", void 0);
  __decorate5([
    n4()
  ], VscodeButton.prototype, "value", void 0);
  __decorate5([
    r5()
  ], VscodeButton.prototype, "_hasContentBefore", void 0);
  __decorate5([
    r5()
  ], VscodeButton.prototype, "_hasContentAfter", void 0);
  VscodeButton = __decorate5([
    customElement("vscode-button")
  ], VscodeButton);

  // node_modules/@vscode-elements/elements/dist/vscode-option/vscode-option.styles.js
  var vscode_option_styles_default = default_styles_default;

  // node_modules/@vscode-elements/elements/dist/vscode-option/vscode-option.js
  var __decorate6 = function(decorators, target, key, desc) {
    var c5 = arguments.length, r6 = c5 < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d3;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r6 = Reflect.decorate(decorators, target, key, desc);
    else for (var i7 = decorators.length - 1; i7 >= 0; i7--) if (d3 = decorators[i7]) r6 = (c5 < 3 ? d3(r6) : c5 > 3 ? d3(target, key, r6) : d3(target, key)) || r6;
    return c5 > 3 && r6 && Object.defineProperty(target, key, r6), r6;
  };
  var VscodeOption = class VscodeOption2 extends VscElement {
    constructor() {
      super(...arguments);
      this.description = "";
      this.selected = false;
      this.disabled = false;
      this._initialized = false;
      this._handleSlotChange = () => {
        if (this._initialized) {
          this.dispatchEvent(new Event("vsc-option-state-change", { bubbles: true }));
        }
      };
    }
    connectedCallback() {
      super.connectedCallback();
      this.updateComplete.then(() => {
        this._initialized = true;
      });
    }
    willUpdate(changedProperties) {
      if (this._initialized && (changedProperties.has("description") || changedProperties.has("value") || changedProperties.has("selected") || changedProperties.has("disabled"))) {
        this.dispatchEvent(new Event("vsc-option-state-change", { bubbles: true }));
      }
    }
    render() {
      return b2`<slot @slotchange=${this._handleSlotChange}></slot>`;
    }
  };
  VscodeOption.styles = vscode_option_styles_default;
  __decorate6([
    n4({ type: String })
  ], VscodeOption.prototype, "value", void 0);
  __decorate6([
    n4({ type: String })
  ], VscodeOption.prototype, "description", void 0);
  __decorate6([
    n4({ type: Boolean, reflect: true })
  ], VscodeOption.prototype, "selected", void 0);
  __decorate6([
    n4({ type: Boolean, reflect: true })
  ], VscodeOption.prototype, "disabled", void 0);
  VscodeOption = __decorate6([
    customElement("vscode-option")
  ], VscodeOption);

  // node_modules/@vscode-elements/elements/dist/includes/vscode-select/helpers.js
  var startsWithPerTermSearch = (subject, pattern) => {
    const result = {
      match: false,
      ranges: []
    };
    const lcSubject = subject.toLowerCase();
    const lcPattern = pattern.toLowerCase();
    const terms = lcSubject.split(" ");
    let offset = 0;
    terms.forEach((t6, i7) => {
      if (i7 > 0) {
        offset += terms[i7 - 1].length + 1;
      }
      if (result.match) {
        return;
      }
      const foundIndex = t6.indexOf(lcPattern);
      const patternLength = lcPattern.length;
      if (foundIndex === 0) {
        result.match = true;
        result.ranges.push([
          offset + foundIndex,
          Math.min(offset + foundIndex + patternLength, subject.length)
        ]);
      }
    });
    return result;
  };
  var startsWithSearch = (subject, pattern) => {
    const result = {
      match: false,
      ranges: []
    };
    const foundIndex = subject.toLowerCase().indexOf(pattern.toLowerCase());
    if (foundIndex === 0) {
      result.match = true;
      result.ranges = [[0, pattern.length]];
    }
    return result;
  };
  var containsSearch = (subject, pattern) => {
    const result = {
      match: false,
      ranges: []
    };
    const foundIndex = subject.toLowerCase().indexOf(pattern.toLowerCase());
    if (foundIndex > -1) {
      result.match = true;
      result.ranges = [[foundIndex, foundIndex + pattern.length]];
    }
    return result;
  };
  var fuzzySearch = (subject, pattern) => {
    const result = {
      match: false,
      ranges: []
    };
    let fromIndex = 0;
    let foundIndex = 0;
    const iMax = pattern.length - 1;
    const lcSubject = subject.toLowerCase();
    const lcPattern = pattern.toLowerCase();
    for (let i7 = 0; i7 <= iMax; i7++) {
      foundIndex = lcSubject.indexOf(lcPattern[i7], fromIndex);
      if (foundIndex === -1) {
        return {
          match: false,
          ranges: []
        };
      }
      result.match = true;
      result.ranges.push([foundIndex, foundIndex + 1]);
      fromIndex = foundIndex + 1;
    }
    return result;
  };
  var filterOptionsByPattern = (list, pattern, method) => {
    const filtered = [];
    list.forEach((op) => {
      let result;
      switch (method) {
        case "startsWithPerTerm":
          result = startsWithPerTermSearch(op.label, pattern);
          break;
        case "startsWith":
          result = startsWithSearch(op.label, pattern);
          break;
        case "contains":
          result = containsSearch(op.label, pattern);
          break;
        default:
          result = fuzzySearch(op.label, pattern);
      }
      if (result.match) {
        filtered.push({ ...op, ranges: result.ranges });
      }
    });
    return filtered;
  };
  var preventSpaces = (text) => {
    const res = [];
    if (text === " ") {
      res.push(b2`&nbsp;`);
      return res;
    }
    if (text.indexOf(" ") === 0) {
      res.push(b2`&nbsp;`);
    }
    res.push(b2`${text.trimStart().trimEnd()}`);
    if (text.lastIndexOf(" ") === text.length - 1) {
      res.push(b2`&nbsp;`);
    }
    return res;
  };
  var highlightRanges = (text, ranges) => {
    const res = [];
    const rl = ranges.length;
    if (rl < 1) {
      return b2`${text}`;
    }
    ranges.forEach((r6, i7) => {
      const match = text.substring(r6[0], r6[1]);
      if (i7 === 0 && r6[0] !== 0) {
        res.push(...preventSpaces(text.substring(0, ranges[0][0])));
      }
      if (i7 > 0 && i7 < rl && r6[0] - ranges[i7 - 1][1] !== 0) {
        res.push(...preventSpaces(text.substring(ranges[i7 - 1][1], r6[0])));
      }
      res.push(b2`<b>${preventSpaces(match)}</b>`);
      if (i7 === rl - 1 && r6[1] < text.length) {
        res.push(...preventSpaces(text.substring(r6[1], text.length)));
      }
    });
    return res;
  };

  // node_modules/@vscode-elements/elements/dist/includes/vscode-select/OptionListController.js
  var OptionListController = class {
    constructor(host) {
      this._activeIndex = -1;
      this._options = [];
      this._filterPattern = "";
      this._filterMethod = "fuzzy";
      this._combobox = false;
      this._indexByValue = /* @__PURE__ */ new Map();
      this._indexByLabel = /* @__PURE__ */ new Map();
      this._selectedIndex = -1;
      this._selectedIndexes = /* @__PURE__ */ new Set();
      this._multiSelect = false;
      this._numOfVisibleOptions = 0;
      (this._host = host).addController(this);
    }
    hostConnected() {
    }
    //#region getters/setters
    get activeIndex() {
      return this._activeIndex;
    }
    set activeIndex(index) {
      this._activeIndex = index;
      this._host.requestUpdate();
    }
    get relativeActiveIndex() {
      return this._options[this._activeIndex]?.filteredIndex ?? -1;
    }
    set comboboxMode(enabled) {
      this._combobox = enabled;
      this._host.requestUpdate();
    }
    get comboboxMode() {
      return this._combobox;
    }
    get multiSelect() {
      return this._multiSelect;
    }
    set multiSelect(multiSelect) {
      this._selectedIndex = -1;
      this._selectedIndexes.clear();
      this._multiSelect = multiSelect;
      this._host.requestUpdate();
    }
    get selectedIndex() {
      return this._selectedIndex;
    }
    set selectedIndex(index) {
      var _a;
      if (this._selectedIndex !== -1 && this._options[this._selectedIndex]) {
        (_a = this._options[this._selectedIndex]).selected ?? (_a.selected = false);
      }
      const op = this.getOptionByIndex(index);
      this._selectedIndex = op ? index : -1;
      this._host.requestUpdate();
    }
    get selectedIndexes() {
      return Array.from(this._selectedIndexes);
    }
    set selectedIndexes(value) {
      this._selectedIndexes.forEach((v3) => {
        this._options[v3].selected = false;
      });
      this._selectedIndexes = new Set(value);
      value.forEach((v3) => {
        if (this._options[v3] !== void 0) {
          this._options[v3].selected = true;
        }
      });
      this._host.requestUpdate();
    }
    set value(newValue) {
      if (this._multiSelect) {
        const valueList = newValue.map((v3) => this._indexByValue.get(v3)).filter((v3) => v3 !== void 0);
        this._selectedIndexes = new Set(valueList);
      } else {
        this._selectedIndex = this._indexByValue.get(newValue) ?? -1;
      }
      this._host.requestUpdate();
    }
    get value() {
      if (this._multiSelect) {
        return this._selectedIndexes.size > 0 ? Array.from(this._selectedIndexes).filter((i7) => i7 >= 0 && i7 < this._options.length).map((v3) => this._options[v3].value) : [];
      } else {
        return this._selectedIndex > -1 && this._selectedIndex < this._options.length ? this._options[this._selectedIndex].value : "";
      }
    }
    set multiSelectValue(newValue) {
      const valueList = newValue.map((v3) => this._indexByValue.get(v3)).filter((v3) => v3 !== void 0);
      this._selectedIndexes = new Set(valueList);
    }
    get multiSelectValue() {
      return this._selectedIndexes.size > 0 ? Array.from(this._selectedIndexes).map((v3) => this._options[v3].value) : [];
    }
    get filterPattern() {
      return this._filterPattern;
    }
    set filterPattern(pattern) {
      if (pattern !== this._filterPattern) {
        this._filterPattern = pattern;
        this._updateState();
      }
    }
    get filterMethod() {
      return this._filterMethod;
    }
    set filterMethod(method) {
      if (method !== this._filterMethod) {
        this._filterMethod = method;
        this._updateState();
      }
    }
    get options() {
      return this._options;
    }
    get numOfVisibleOptions() {
      return this._numOfVisibleOptions;
    }
    get numOptions() {
      return this._options.length;
    }
    //#endregion
    //#region public functions
    populate(options) {
      this._indexByValue.clear();
      this._indexByLabel.clear();
      this._options = options.map((op, index) => {
        this._indexByValue.set(op.value ?? "", index);
        this._indexByLabel.set(op.label ?? "", index);
        return {
          description: op.description ?? "",
          disabled: op.disabled ?? false,
          label: op.label ?? "",
          selected: op.selected ?? false,
          value: op.value ?? "",
          index,
          filteredIndex: index,
          ranges: [],
          visible: true
        };
      });
      this._numOfVisibleOptions = this._options.length;
    }
    add(option) {
      const nextIndex = this._options.length;
      const { description, disabled, label, selected, value } = option;
      let visible = true;
      let ranges = [];
      if (this._combobox && this._filterPattern !== "") {
        const res = this._searchByPattern(label ?? "");
        visible = res.match;
        ranges = res.ranges;
      }
      this._indexByValue.set(value ?? "", nextIndex);
      this._indexByLabel.set(label ?? "", nextIndex);
      if (selected) {
        this._selectedIndex = nextIndex;
        this._selectedIndexes.add(nextIndex);
        this._activeIndex = nextIndex;
      }
      this._options.push({
        index: nextIndex,
        filteredIndex: nextIndex,
        description: description ?? "",
        disabled: disabled ?? false,
        label: label ?? "",
        selected: selected ?? false,
        value: value ?? "",
        visible,
        ranges
      });
      if (visible) {
        this._numOfVisibleOptions += 1;
      }
    }
    clear() {
      this._options = [];
      this._indexByValue.clear();
      this._indexByLabel.clear();
      this._numOfVisibleOptions = 0;
      this._selectedIndex = -1;
      this._selectedIndexes.clear();
      this._activeIndex = -1;
    }
    getIsIndexSelected(index) {
      if (this._multiSelect) {
        return this._selectedIndexes.has(index);
      } else {
        return this._selectedIndex === index;
      }
    }
    expandMultiSelection(values) {
      values.forEach((v3) => {
        const foundIndex = this._indexByValue.get(v3) ?? -1;
        if (foundIndex !== -1) {
          this._selectedIndexes.add(foundIndex);
        }
      });
      this._host.requestUpdate();
    }
    toggleActiveMultiselectOption() {
      const activeOption = this._options[this._activeIndex] ?? null;
      if (!activeOption) {
        return;
      }
      const checked = this._selectedIndexes.has(activeOption.index);
      if (checked) {
        this._selectedIndexes.delete(activeOption.index);
      } else {
        this._selectedIndexes.add(activeOption.index);
      }
      this._host.requestUpdate();
    }
    toggleOptionSelected(optIndex) {
      const checked = this._selectedIndexes.has(optIndex);
      this._options[optIndex].selected = !this._options[optIndex].selected;
      if (checked) {
        this._selectedIndexes.delete(optIndex);
      } else {
        this._selectedIndexes.add(optIndex);
      }
      this._host.requestUpdate();
    }
    getActiveOption() {
      return this._options[this._activeIndex] ?? null;
    }
    getSelectedOption() {
      return this._options[this._selectedIndex] ?? null;
    }
    getOptionByIndex(index) {
      return this._options[index] ?? null;
    }
    findOptionIndex(value) {
      return this._indexByValue.get(value) ?? -1;
    }
    getOptionByValue(value, includeHiddenOptions = false) {
      const index = this._indexByValue.get(value) ?? -1;
      if (index === -1) {
        return null;
      }
      if (!includeHiddenOptions) {
        return this._options[index].visible ? this._options[index] : null;
      }
      return this._options[index];
    }
    getOptionByLabel(label) {
      const index = this._indexByLabel.get(label) ?? -1;
      if (index === -1) {
        return null;
      }
      return this._options[index];
    }
    next(fromIndex) {
      const from = fromIndex ?? this._activeIndex;
      let nextIndex = -1;
      for (let i7 = from + 1; i7 < this._options.length; i7++) {
        if (this._options[i7] && !this._options[i7].disabled && this._options[i7].visible) {
          nextIndex = i7;
          break;
        }
      }
      return nextIndex > -1 ? this._options[nextIndex] : null;
    }
    prev(fromIndex) {
      const from = fromIndex ?? this._activeIndex;
      let prevIndex = -1;
      for (let i7 = from - 1; i7 >= 0; i7--) {
        if (this._options[i7] && !this._options[i7].disabled && this._options[i7].visible) {
          prevIndex = i7;
          break;
        }
      }
      return prevIndex > -1 ? this._options[prevIndex] : null;
    }
    activateDefault() {
      if (this._multiSelect) {
        if (this._selectedIndexes.size > 0) {
          const indexes = this._selectedIndexes.values();
          const first = indexes.next();
          this._activeIndex = first.value ? first.value : 0;
        }
      } else {
        if (this._selectedIndex > -1) {
          this._activeIndex = this._selectedIndex;
        } else {
          this._activeIndex = 0;
        }
      }
      this._host.requestUpdate();
    }
    selectAll() {
      if (!this._multiSelect) {
        return;
      }
      this._options.forEach((_2, i7) => {
        this._options[i7].selected = true;
        this._selectedIndexes.add(i7);
      });
      this._host.requestUpdate();
    }
    selectNone() {
      if (!this._multiSelect) {
        return;
      }
      this._options.forEach((_2, i7) => {
        this._options[i7].selected = false;
      });
      this._selectedIndexes.clear();
      this._host.requestUpdate();
    }
    //#endregion
    //#region private functions
    _searchByPattern(text) {
      let result;
      switch (this._filterMethod) {
        case "startsWithPerTerm":
          result = startsWithPerTermSearch(text, this._filterPattern);
          break;
        case "startsWith":
          result = startsWithSearch(text, this._filterPattern);
          break;
        case "contains":
          result = containsSearch(text, this._filterPattern);
          break;
        default:
          result = fuzzySearch(text, this._filterPattern);
      }
      return result;
    }
    _updateState() {
      if (!this._combobox || this._filterPattern === "") {
        this._options.forEach((_2, i7) => {
          this._options[i7].visible = true;
          this._options[i7].ranges = [];
        });
        this._numOfVisibleOptions = this._options.length;
      } else {
        let filteredListNextIndex = -1;
        this._numOfVisibleOptions = 0;
        this._options.forEach(({ label }, i7) => {
          const result = this._searchByPattern(label);
          this._options[i7].visible = result.match;
          this._options[i7].ranges = result.ranges;
          this._options[i7].filteredIndex = result.match ? ++filteredListNextIndex : -1;
          if (result.match) {
            this._numOfVisibleOptions += 1;
          }
        });
      }
      this._host.requestUpdate();
    }
  };

  // node_modules/@vscode-elements/elements/dist/vscode-scrollable/vscode-scrollable.styles.js
  var styles6 = [
    default_styles_default,
    i`
    :host {
      display: block;
      position: relative;
    }

    .scrollable-container {
      height: 100%;
      overflow: auto;
    }

    .scrollable-container::-webkit-scrollbar {
      cursor: default;
      width: 0;
    }

    .scrollable-container {
      scrollbar-width: none;
    }

    .shadow {
      box-shadow: var(--vscode-scrollbar-shadow, #000000) 0 6px 6px -6px inset;
      display: none;
      height: 3px;
      left: 0;
      pointer-events: none;
      position: absolute;
      top: 0;
      z-index: 1;
      width: 100%;
    }

    .shadow.visible {
      display: block;
    }

    .scrollbar-track {
      height: 100%;
      position: absolute;
      right: 0;
      top: 0;
      width: 10px;
      z-index: 100;
    }

    .scrollbar-track.hidden {
      display: none;
    }

    .scrollbar-thumb {
      background-color: transparent;
      min-height: var(--min-thumb-height, 20px);
      opacity: 0;
      position: absolute;
      right: 0;
      width: 10px;
    }

    .scrollbar-thumb.visible {
      background-color: var(
        --vscode-scrollbarSlider-background,
        rgba(121, 121, 121, 0.4)
      );
      opacity: 1;
      transition: opacity 100ms;
    }

    .scrollbar-thumb.fade {
      background-color: var(
        --vscode-scrollbarSlider-background,
        rgba(121, 121, 121, 0.4)
      );
      opacity: 0;
      transition: opacity 800ms;
    }

    .scrollbar-thumb.visible:hover {
      background-color: var(
        --vscode-scrollbarSlider-hoverBackground,
        rgba(100, 100, 100, 0.7)
      );
    }

    .scrollbar-thumb.visible.active,
    .scrollbar-thumb.visible.active:hover {
      background-color: var(
        --vscode-scrollbarSlider-activeBackground,
        rgba(191, 191, 191, 0.4)
      );
    }

    .prevent-interaction {
      bottom: 0;
      left: 0;
      right: 0;
      top: 0;
      position: absolute;
      z-index: 99;
    }

    .content {
      overflow: hidden;
    }
  `
  ];
  var vscode_scrollable_styles_default = styles6;

  // node_modules/@vscode-elements/elements/dist/vscode-scrollable/vscode-scrollable.js
  var __decorate7 = function(decorators, target, key, desc) {
    var c5 = arguments.length, r6 = c5 < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d3;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r6 = Reflect.decorate(decorators, target, key, desc);
    else for (var i7 = decorators.length - 1; i7 >= 0; i7--) if (d3 = decorators[i7]) r6 = (c5 < 3 ? d3(r6) : c5 > 3 ? d3(target, key, r6) : d3(target, key)) || r6;
    return c5 > 3 && r6 && Object.defineProperty(target, key, r6), r6;
  };
  var VscodeScrollable = class VscodeScrollable2 extends VscElement {
    /**
     * Scroll position.
     */
    set scrollPos(val) {
      this._scrollPos = this._limitScrollPos(val);
      this._updateScrollbar();
      this._updateThumbPosition();
      this.requestUpdate();
    }
    get scrollPos() {
      return this._scrollPos;
    }
    /**
     * The maximum amount of the `scrollPos`.
     */
    get scrollMax() {
      if (!this._scrollableContainer) {
        return 0;
      }
      return this._scrollableContainer.scrollHeight - this._scrollableContainer.clientHeight;
    }
    //#region lifecycle methods
    constructor() {
      super();
      this.alwaysVisible = false;
      this.fastScrollSensitivity = 5;
      this.minThumbSize = 20;
      this.mouseWheelScrollSensitivity = 1;
      this.shadow = true;
      this.scrolled = false;
      this._scrollPos = 0;
      this._isDragging = false;
      this._thumbHeight = 0;
      this._thumbY = 0;
      this._thumbVisible = false;
      this._thumbFade = false;
      this._thumbActive = false;
      this._componentHeight = 0;
      this._contentHeight = 0;
      this._scrollThumbStartY = 0;
      this._mouseStartY = 0;
      this._scrollbarVisible = true;
      this._scrollbarTrackZ = 0;
      this._resizeObserverCallback = () => {
        this._componentHeight = this.offsetHeight;
        this._contentHeight = this._contentElement.offsetHeight;
        this._updateScrollbar();
        this._updateThumbPosition();
      };
      this._handleSlotChange = () => {
        this._updateScrollbar();
        this._updateThumbPosition();
        this._zIndexFix();
      };
      this._handleScrollThumbMouseMove = (event) => {
        const rawThumbPos = this._scrollThumbStartY + (event.screenY - this._mouseStartY);
        this._thumbY = this._limitThumbPos(rawThumbPos);
        this.scrollPos = this._calculateScrollPosFromThumbPos(this._thumbY);
        this.dispatchEvent(new CustomEvent("vsc-scrollable-scroll", {
          detail: this.scrollPos
        }));
      };
      this._handleScrollThumbMouseUp = (event) => {
        this._isDragging = false;
        this._thumbActive = false;
        const cr = this.getBoundingClientRect();
        const { x: x2, y: y3, width, height } = cr;
        const { pageX, pageY } = event;
        if (pageX > x2 + width || pageX < x2 || pageY > y3 + height || pageY < y3) {
          this._thumbFade = true;
          this._thumbVisible = false;
        }
        document.removeEventListener("mousemove", this._handleScrollThumbMouseMove);
        document.removeEventListener("mouseup", this._handleScrollThumbMouseUp);
      };
      this._handleComponentMouseOver = () => {
        this._thumbVisible = true;
        this._thumbFade = false;
      };
      this._handleComponentMouseOut = () => {
        if (!this._thumbActive) {
          this._thumbVisible = false;
          this._thumbFade = true;
        }
      };
      this._handleComponentWheel = (ev) => {
        if (this._contentHeight <= this._componentHeight) {
          return;
        }
        ev.preventDefault();
        const multiplier = ev.altKey ? this.mouseWheelScrollSensitivity * this.fastScrollSensitivity : this.mouseWheelScrollSensitivity;
        this.scrollPos = this._limitScrollPos(this.scrollPos + ev.deltaY * multiplier);
        this.dispatchEvent(new CustomEvent("vsc-scrollable-scroll", {
          detail: this.scrollPos
        }));
      };
      this._handleScrollableContainerScroll = (ev) => {
        if (ev.currentTarget) {
          this.scrollPos = ev.currentTarget.scrollTop;
        }
      };
      this.addEventListener("mouseover", this._handleComponentMouseOver);
      this.addEventListener("mouseout", this._handleComponentMouseOut);
      this.addEventListener("wheel", this._handleComponentWheel);
    }
    connectedCallback() {
      super.connectedCallback();
      this._hostResizeObserver = new ResizeObserver(this._resizeObserverCallback);
      this._contentResizeObserver = new ResizeObserver(this._resizeObserverCallback);
      this.requestUpdate();
      this.updateComplete.then(() => {
        this._hostResizeObserver.observe(this);
        this._contentResizeObserver.observe(this._contentElement);
        this._updateThumbPosition();
      });
    }
    disconnectedCallback() {
      super.disconnectedCallback();
      this._hostResizeObserver.unobserve(this);
      this._hostResizeObserver.disconnect();
      this._contentResizeObserver.unobserve(this._contentElement);
      this._contentResizeObserver.disconnect();
    }
    firstUpdated(_changedProperties) {
      this._updateThumbPosition();
    }
    _calcThumbHeight() {
      const componentHeight = this.offsetHeight;
      const contentHeight = this._contentElement?.offsetHeight ?? 0;
      const proposedSize = componentHeight * (componentHeight / contentHeight);
      return Math.max(this.minThumbSize, proposedSize);
    }
    _updateScrollbar() {
      const contentHeight = this._contentElement?.offsetHeight ?? 0;
      const componentHeight = this.offsetHeight;
      if (componentHeight >= contentHeight) {
        this._scrollbarVisible = false;
      } else {
        this._scrollbarVisible = true;
        this._thumbHeight = this._calcThumbHeight();
      }
      this.requestUpdate();
    }
    _zIndexFix() {
      let highestZ = 0;
      this._assignedElements.forEach((n6) => {
        if ("style" in n6) {
          const computedZIndex = window.getComputedStyle(n6).zIndex;
          const isNumber = /([0-9-])+/g.test(computedZIndex);
          if (isNumber) {
            highestZ = Number(computedZIndex) > highestZ ? Number(computedZIndex) : highestZ;
          }
        }
      });
      this._scrollbarTrackZ = highestZ + 1;
      this.requestUpdate();
    }
    _updateThumbPosition() {
      if (!this._scrollableContainer) {
        return;
      }
      this.scrolled = this.scrollPos > 0;
      const componentH = this.offsetHeight;
      const thumbH = this._thumbHeight;
      const contentH = this._contentElement.offsetHeight;
      const overflown = contentH - componentH;
      const ratio = this.scrollPos / overflown;
      const thumbYMax = componentH - thumbH;
      this._thumbY = Math.min(ratio * (componentH - thumbH), thumbYMax);
    }
    _calculateScrollPosFromThumbPos(scrollPos) {
      const cmpH = this.getBoundingClientRect().height;
      const thumbH = this._scrollThumbElement.getBoundingClientRect().height;
      const contentH = this._contentElement.getBoundingClientRect().height;
      const rawScrollPos = scrollPos / (cmpH - thumbH) * (contentH - cmpH);
      return this._limitScrollPos(rawScrollPos);
    }
    _limitScrollPos(newPos) {
      if (newPos < 0) {
        return 0;
      } else if (newPos > this.scrollMax) {
        return this.scrollMax;
      } else {
        return newPos;
      }
    }
    _limitThumbPos(newPos) {
      const cmpH = this.getBoundingClientRect().height;
      const thumbH = this._scrollThumbElement.getBoundingClientRect().height;
      if (newPos < 0) {
        return 0;
      } else if (newPos > cmpH - thumbH) {
        return cmpH - thumbH;
      } else {
        return newPos;
      }
    }
    _handleScrollThumbMouseDown(event) {
      const cmpCr = this.getBoundingClientRect();
      const thCr = this._scrollThumbElement.getBoundingClientRect();
      this._mouseStartY = event.screenY;
      this._scrollThumbStartY = thCr.top - cmpCr.top;
      this._isDragging = true;
      this._thumbActive = true;
      document.addEventListener("mousemove", this._handleScrollThumbMouseMove);
      document.addEventListener("mouseup", this._handleScrollThumbMouseUp);
    }
    _handleScrollbarTrackPress(ev) {
      if (ev.target !== ev.currentTarget) {
        return;
      }
      this._thumbY = ev.offsetY - this._thumbHeight / 2;
      this.scrollPos = this._calculateScrollPosFromThumbPos(this._thumbY);
    }
    //#endregion
    render() {
      return b2`
      <div
        class="scrollable-container"
        .style=${stylePropertyMap({
        userSelect: this._isDragging ? "none" : "auto"
      })}
        .scrollTop=${this.scrollPos}
        @scroll=${this._handleScrollableContainerScroll}
      >
        <div
          class=${e7({ shadow: true, visible: this.scrolled })}
          .style=${stylePropertyMap({
        zIndex: String(this._scrollbarTrackZ)
      })}
        ></div>
        ${this._isDragging ? b2`<div class="prevent-interaction"></div>` : A}
        <div
          class=${e7({
        "scrollbar-track": true,
        hidden: !this._scrollbarVisible
      })}
          @mousedown=${this._handleScrollbarTrackPress}
        >
          <div
            class=${e7({
        "scrollbar-thumb": true,
        visible: this.alwaysVisible ? true : this._thumbVisible,
        fade: this.alwaysVisible ? false : this._thumbFade,
        active: this._thumbActive
      })}
            .style=${stylePropertyMap({
        height: `${this._thumbHeight}px`,
        top: `${this._thumbY}px`
      })}
            @mousedown=${this._handleScrollThumbMouseDown}
          ></div>
        </div>
        <div class="content">
          <slot @slotchange=${this._handleSlotChange}></slot>
        </div>
      </div>
    `;
    }
  };
  VscodeScrollable.styles = vscode_scrollable_styles_default;
  __decorate7([
    n4({ type: Boolean, reflect: true, attribute: "always-visible" })
  ], VscodeScrollable.prototype, "alwaysVisible", void 0);
  __decorate7([
    n4({ type: Number, attribute: "fast-scroll-sensitivity" })
  ], VscodeScrollable.prototype, "fastScrollSensitivity", void 0);
  __decorate7([
    n4({ type: Number, attribute: "min-thumb-size" })
  ], VscodeScrollable.prototype, "minThumbSize", void 0);
  __decorate7([
    n4({ type: Number, attribute: "mouse-wheel-scroll-sensitivity" })
  ], VscodeScrollable.prototype, "mouseWheelScrollSensitivity", void 0);
  __decorate7([
    n4({ type: Boolean, reflect: true })
  ], VscodeScrollable.prototype, "shadow", void 0);
  __decorate7([
    n4({ type: Boolean, reflect: true })
  ], VscodeScrollable.prototype, "scrolled", void 0);
  __decorate7([
    n4({ type: Number, attribute: "scroll-pos" })
  ], VscodeScrollable.prototype, "scrollPos", null);
  __decorate7([
    r5()
  ], VscodeScrollable.prototype, "_isDragging", void 0);
  __decorate7([
    r5()
  ], VscodeScrollable.prototype, "_thumbHeight", void 0);
  __decorate7([
    r5()
  ], VscodeScrollable.prototype, "_thumbY", void 0);
  __decorate7([
    r5()
  ], VscodeScrollable.prototype, "_thumbVisible", void 0);
  __decorate7([
    r5()
  ], VscodeScrollable.prototype, "_thumbFade", void 0);
  __decorate7([
    r5()
  ], VscodeScrollable.prototype, "_thumbActive", void 0);
  __decorate7([
    e5(".content")
  ], VscodeScrollable.prototype, "_contentElement", void 0);
  __decorate7([
    e5(".scrollbar-thumb", true)
  ], VscodeScrollable.prototype, "_scrollThumbElement", void 0);
  __decorate7([
    e5(".scrollable-container")
  ], VscodeScrollable.prototype, "_scrollableContainer", void 0);
  __decorate7([
    o6()
  ], VscodeScrollable.prototype, "_assignedElements", void 0);
  VscodeScrollable = __decorate7([
    customElement("vscode-scrollable")
  ], VscodeScrollable);

  // node_modules/@vscode-elements/elements/dist/includes/vscode-select/vscode-select-base.js
  var __decorate8 = function(decorators, target, key, desc) {
    var c5 = arguments.length, r6 = c5 < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d3;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r6 = Reflect.decorate(decorators, target, key, desc);
    else for (var i7 = decorators.length - 1; i7 >= 0; i7--) if (d3 = decorators[i7]) r6 = (c5 < 3 ? d3(r6) : c5 > 3 ? d3(target, key, r6) : d3(target, key)) || r6;
    return c5 > 3 && r6 && Object.defineProperty(target, key, r6), r6;
  };
  var VISIBLE_OPTS = 10;
  var OPT_HEIGHT = 22;
  var VscodeSelectBase = class extends VscElement {
    /**
     * Options can be filtered by typing into a text input field.
     */
    set combobox(enabled) {
      this._opts.comboboxMode = enabled;
    }
    get combobox() {
      return this._opts.comboboxMode;
    }
    /**
     * The element cannot be used and is not focusable.
     */
    set disabled(newState) {
      this._disabled = newState;
      this.ariaDisabled = newState ? "true" : "false";
      if (newState === true) {
        this._originalTabIndex = this.tabIndex;
        this.tabIndex = -1;
      } else {
        this.tabIndex = this._originalTabIndex ?? 0;
        this._originalTabIndex = void 0;
      }
      this.requestUpdate();
    }
    get disabled() {
      return this._disabled;
    }
    /**
     * Search method in the filtered list within the combobox mode.
     *
     * - contains - The list item includes the searched pattern at any position.
     * - fuzzy - The list item contains the letters of the search pattern in the same order, but at any position.
     * - startsWith - The search pattern matches the beginning of the searched text.
     * - startsWithPerTerm - The search pattern matches the beginning of any word in the searched text.
     *
     * @default 'fuzzy'
     */
    set filter(val) {
      const validValues = [
        "contains",
        "fuzzy",
        "startsWith",
        "startsWithPerTerm"
      ];
      let fm;
      if (validValues.includes(val)) {
        fm = val;
      } else {
        console.warn(`[VSCode Webview Elements] Invalid filter: "${val}", fallback to default. Valid values are: "contains", "fuzzy", "startsWith", "startsWithPerm".`, this);
        fm = "fuzzy";
      }
      this._opts.filterMethod = fm;
    }
    get filter() {
      return this._opts.filterMethod;
    }
    /**
     * @attr [options=[]]
     * @type {Option[]}
     */
    set options(opts) {
      this._opts.populate(opts);
    }
    get options() {
      return this._opts.options.map(({ label, value, description, selected, disabled }) => ({
        label,
        value,
        description,
        selected,
        disabled
      }));
    }
    //#region lifecycle callbacks
    constructor() {
      super();
      this.creatable = false;
      this.label = "";
      this.invalid = false;
      this.focused = false;
      this.open = false;
      this.position = "below";
      this._prevXPos = 0;
      this._prevYPos = 0;
      this._opts = new OptionListController(this);
      this._firstUpdateCompleted = false;
      this._currentDescription = "";
      this._filter = "fuzzy";
      this._selectedIndexes = [];
      this._options = [];
      this._value = "";
      this._values = [];
      this._isPlaceholderOptionActive = false;
      this._isBeingFiltered = false;
      this._optionListScrollPos = 0;
      this._isHoverForbidden = false;
      this._disabled = false;
      this._originalTabIndex = void 0;
      this._onMouseMove = () => {
        this._isHoverForbidden = false;
        window.removeEventListener("mousemove", this._onMouseMove);
      };
      this._onOptionListScroll = (ev) => {
        this._optionListScrollPos = ev.detail;
      };
      this._onComponentKeyDown = (event) => {
        if ([" ", "ArrowUp", "ArrowDown", "Escape"].includes(event.key)) {
          event.stopPropagation();
          event.preventDefault();
        }
        if (event.key === "Enter") {
          this._onEnterKeyDown(event);
        }
        if (event.key === " ") {
          this._onSpaceKeyDown();
        }
        if (event.key === "Escape") {
          this._onEscapeKeyDown();
        }
        if (event.key === "ArrowUp") {
          this._onArrowUpKeyDown();
        }
        if (event.key === "ArrowDown") {
          this._onArrowDownKeyDown();
        }
      };
      this._onComponentFocus = () => {
        this.focused = true;
      };
      this._onComponentBlur = () => {
        this.focused = false;
      };
      this._handleWindowScroll = () => {
        const { x: x2, y: y3 } = this.getBoundingClientRect();
        if (x2 !== this._prevXPos || y3 !== this._prevYPos) {
          this.open = false;
        }
      };
      this.addEventListener("vsc-option-state-change", (ev) => {
        ev.stopPropagation();
        this._setStateFromSlottedElements();
        this.requestUpdate();
      });
    }
    connectedCallback() {
      super.connectedCallback();
      this.addEventListener("keydown", this._onComponentKeyDown);
      this.addEventListener("focus", this._onComponentFocus);
      this.addEventListener("blur", this._onComponentBlur);
      this._setAutoFocus();
    }
    disconnectedCallback() {
      super.disconnectedCallback();
      this.removeEventListener("keydown", this._onComponentKeyDown);
      this.removeEventListener("focus", this._onComponentFocus);
      this.removeEventListener("blur", this._onComponentBlur);
    }
    firstUpdated(_changedProperties) {
      this._firstUpdateCompleted = true;
    }
    willUpdate(changedProperties) {
      if (changedProperties.has("required") && this._firstUpdateCompleted) {
        this._manageRequired();
      }
      if (changedProperties.has("open") && this._firstUpdateCompleted) {
        if (this.open) {
          this._dropdownEl.showPopover();
          const { x: x2, y: y3 } = this.getBoundingClientRect();
          this._prevXPos = x2;
          this._prevYPos = y3;
          window.addEventListener("scroll", this._handleWindowScroll, {
            capture: true
          });
          this._opts.activateDefault();
          this._scrollActiveElementToTop();
        } else {
          this._dropdownEl.hidePopover();
          window.removeEventListener("scroll", this._handleWindowScroll);
        }
      }
    }
    get _filteredOptions() {
      if (!this.combobox || this._opts.filterPattern === "") {
        return this._options;
      }
      return filterOptionsByPattern(this._options, this._opts.filterPattern, this._filter);
    }
    _setAutoFocus() {
      if (this.hasAttribute("autofocus")) {
        if (this.tabIndex < 0) {
          this.tabIndex = 0;
        }
        if (this.combobox) {
          this.updateComplete.then(() => {
            this.shadowRoot?.querySelector(".combobox-input").focus();
          });
        } else {
          this.updateComplete.then(() => {
            this.shadowRoot?.querySelector(".select-face").focus();
          });
        }
      }
    }
    get _isSuggestedOptionVisible() {
      if (!(this.combobox && this.creatable)) {
        return false;
      }
      const filterPatternExistsAsOption = this._opts.getOptionByValue(this._opts.filterPattern) !== null;
      const filtered = this._opts.filterPattern.length > 0;
      return !filterPatternExistsAsOption && filtered;
    }
    _manageRequired() {
    }
    _setStateFromSlottedElements() {
      const optionElements = this._assignedOptions ?? [];
      this._opts.clear();
      optionElements.forEach((el) => {
        const { innerText, description, disabled } = el;
        const value = typeof el.value === "string" ? el.value : innerText.trim();
        const selected = el.selected ?? false;
        const op = {
          label: innerText.trim(),
          value,
          description,
          selected,
          disabled
        };
        this._opts.add(op);
      });
    }
    _createSuggestedOption() {
      const nextSelectedIndex = this._opts.numOptions;
      const op = document.createElement("vscode-option");
      op.value = this._opts.filterPattern;
      D(this._opts.filterPattern, op);
      this.appendChild(op);
      return nextSelectedIndex;
    }
    _dispatchChangeEvent() {
      this.dispatchEvent(new Event("change"));
      this.dispatchEvent(new Event("input"));
    }
    async _createAndSelectSuggestedOption() {
    }
    _toggleComboboxDropdown() {
      this._opts.filterPattern = "";
      this.open = !this.open;
    }
    _scrollActiveElementToTop() {
      this._optionListScrollPos = Math.floor(this._opts.relativeActiveIndex * OPT_HEIGHT);
    }
    async _adjustOptionListScrollPos(direction, optionIndex) {
      let numOpts = this._opts.numOfVisibleOptions;
      const suggestedOptionVisible = this._isSuggestedOptionVisible;
      if (suggestedOptionVisible) {
        numOpts += 1;
      }
      if (numOpts <= VISIBLE_OPTS) {
        return;
      }
      this._isHoverForbidden = true;
      window.addEventListener("mousemove", this._onMouseMove);
      const ulScrollTop = this._optionListScrollPos;
      const liPosY = optionIndex * OPT_HEIGHT;
      const fullyVisible = liPosY >= ulScrollTop && liPosY <= ulScrollTop + VISIBLE_OPTS * OPT_HEIGHT - OPT_HEIGHT;
      if (direction === "down") {
        if (!fullyVisible) {
          this._optionListScrollPos = optionIndex * OPT_HEIGHT - (VISIBLE_OPTS - 1) * OPT_HEIGHT;
        }
      }
      if (direction === "up") {
        if (!fullyVisible) {
          this._optionListScrollPos = Math.floor(this._opts.relativeActiveIndex * OPT_HEIGHT);
        }
      }
    }
    //#region event handlers
    _onFaceClick() {
      this.open = !this.open;
    }
    _handleDropdownToggle(event) {
      this.open = event.newState === "open";
    }
    _onComboboxButtonClick() {
      this._toggleComboboxDropdown();
    }
    _onComboboxButtonKeyDown(ev) {
      if (ev.key === "Enter") {
        this._toggleComboboxDropdown();
      }
    }
    _onOptionMouseOver(ev) {
      if (this._isHoverForbidden) {
        return;
      }
      const el = ev.target;
      if (!el.matches(".option")) {
        return;
      }
      if (el.matches(".placeholder")) {
        this._isPlaceholderOptionActive = true;
        this._opts.activeIndex = -1;
      } else {
        this._isPlaceholderOptionActive = false;
        this._opts.activeIndex = +el.dataset.index;
      }
    }
    _onPlaceholderOptionMouseOut() {
      this._isPlaceholderOptionActive = false;
    }
    _onNoOptionsClick(ev) {
      ev.stopPropagation();
    }
    _onEnterKeyDown(ev) {
      this._isBeingFiltered = false;
      const clickedOnAcceptButton = ev?.composedPath ? ev.composedPath().find((el) => el.matches ? el.matches("vscode-button.button-accept") : false) : false;
      if (clickedOnAcceptButton) {
        return;
      }
    }
    _onSpaceKeyDown() {
      if (!this.open) {
        this.open = true;
        return;
      }
    }
    _onArrowUpKeyDown() {
      if (this.open) {
        if (this._opts.activeIndex <= 0 && !(this.combobox && this.creatable)) {
          return;
        }
        if (this._isPlaceholderOptionActive) {
          const optionIndex = this._opts.numOfVisibleOptions - 1;
          this._opts.activeIndex = optionIndex;
          this._isPlaceholderOptionActive = false;
        } else {
          const prevOp = this._opts.prev();
          if (prevOp !== null) {
            this._opts.activeIndex = prevOp?.index ?? -1;
            const prevSelectableIndex = prevOp?.filteredIndex ?? -1;
            if (prevSelectableIndex > -1) {
              this._adjustOptionListScrollPos("up", prevSelectableIndex);
            }
          }
        }
      } else {
        this.open = true;
        this._opts.activateDefault();
      }
    }
    _onArrowDownKeyDown() {
      let numOpts = this._opts.numOfVisibleOptions;
      const suggestedOptionVisible = this._isSuggestedOptionVisible;
      if (suggestedOptionVisible) {
        numOpts += 1;
      }
      if (this.open) {
        if (this._isPlaceholderOptionActive && this._opts.activeIndex === -1) {
          return;
        }
        const nextOp = this._opts.next();
        if (suggestedOptionVisible && nextOp === null) {
          this._isPlaceholderOptionActive = true;
          this._adjustOptionListScrollPos("down", numOpts - 1);
          this._opts.activeIndex = -1;
        } else if (nextOp !== null) {
          const nextSelectableIndex = nextOp?.filteredIndex ?? -1;
          this._opts.activeIndex = nextOp?.index ?? -1;
          if (nextSelectableIndex > -1) {
            this._adjustOptionListScrollPos("down", nextSelectableIndex);
          }
        }
      } else {
        this.open = true;
        this._opts.activateDefault();
      }
    }
    _onEscapeKeyDown() {
      this.open = false;
    }
    _onSlotChange() {
      this._setStateFromSlottedElements();
      this.requestUpdate();
    }
    _onComboboxInputFocus(ev) {
      ev.target.select();
      this._isBeingFiltered = false;
      this._opts.filterPattern = "";
    }
    _onComboboxInputBlur() {
      this._isBeingFiltered = false;
    }
    _onComboboxInputInput(ev) {
      this._isBeingFiltered = true;
      this._opts.filterPattern = ev.target.value;
      this._opts.activeIndex = -1;
      this.open = true;
    }
    _onComboboxInputClick() {
      this._isBeingFiltered = this._opts.filterPattern !== "";
      this.open = true;
    }
    _onComboboxInputSpaceKeyDown(ev) {
      if (ev.key === " ") {
        ev.stopPropagation();
      }
    }
    _onOptionClick(_ev) {
      this._isBeingFiltered = false;
      return;
    }
    //#endregion
    //#region render functions
    _renderCheckbox(checked, label) {
      const checkboxClasses = {
        "checkbox-icon": true,
        checked
      };
      return b2`<span class=${e7(checkboxClasses)}>${checkIcon}</span
      ><span class="option-label">${label}</span>`;
    }
    _renderOptions() {
      const list = this._opts.options;
      return b2`
      <ul
        aria-label=${o7(this.label ?? void 0)}
        aria-multiselectable=${o7(this._opts.multiSelect ? "true" : void 0)}
        class="options"
        id="select-listbox"
        role="listbox"
        tabindex="-1"
        @click=${this._onOptionClick}
        @mouseover=${this._onOptionMouseOver}
      >
        ${c4(list, (op) => op.index, (op, index) => {
        if (!op.visible) {
          return A;
        }
        const active = op.index === this._opts.activeIndex && !op.disabled;
        const selected = this._opts.getIsIndexSelected(op.index);
        const optionClasses = {
          active,
          disabled: op.disabled,
          option: true,
          "single-select": !this._opts.multiSelect,
          "multi-select": this._opts.multiSelect,
          selected
        };
        const labelText = op.ranges?.length ?? 0 > 0 ? highlightRanges(op.label, op.ranges ?? []) : op.label;
        return b2`
              <li
                aria-selected=${selected ? "true" : "false"}
                class=${e7(optionClasses)}
                data-index=${op.index}
                data-filtered-index=${index}
                id=${`op-${op.index}`}
                role="option"
                tabindex="-1"
              >
                ${n5(this._opts.multiSelect, () => this._renderCheckbox(selected, labelText), () => labelText)}
              </li>
            `;
      })}
        ${this._renderPlaceholderOption(this._opts.numOfVisibleOptions < 1)}
      </ul>
    `;
    }
    _renderPlaceholderOption(isListEmpty) {
      if (!this.combobox) {
        return A;
      }
      const foundOption = this._opts.getOptionByLabel(this._opts.filterPattern);
      if (foundOption) {
        return A;
      }
      if (this.creatable && this._opts.filterPattern.length > 0) {
        return b2`<li
        class=${e7({
          option: true,
          placeholder: true,
          active: this._isPlaceholderOptionActive
        })}
        @mouseout=${this._onPlaceholderOptionMouseOut}
      >
        Add "${this._opts.filterPattern}"
      </li>`;
      } else {
        return isListEmpty ? b2`<li class="no-options" @click=${this._onNoOptionsClick}>
            No options
          </li>` : A;
      }
    }
    _renderDescription() {
      const op = this._opts.getActiveOption();
      if (!op) {
        return A;
      }
      const { description } = op;
      return description ? b2`<div class="description">${description}</div>` : A;
    }
    _renderSelectFace() {
      return b2`${A}`;
    }
    _renderComboboxFace() {
      return b2`${A}`;
    }
    _renderDropdownControls() {
      return b2`${A}`;
    }
    _renderDropdown() {
      const classes = {
        dropdown: true,
        multiple: this._opts.multiSelect,
        open: this.open
      };
      const visibleOptions = this._isSuggestedOptionVisible || this._opts.numOfVisibleOptions === 0 ? this._opts.numOfVisibleOptions + 1 : this._opts.numOfVisibleOptions;
      const scrollPaneHeight = Math.min(visibleOptions * OPT_HEIGHT, VISIBLE_OPTS * OPT_HEIGHT);
      const cr = this.getBoundingClientRect();
      const dropdownStyles = {
        width: `${cr.width}px`,
        left: `${cr.left}px`,
        top: this.position === "below" ? `${cr.top + cr.height}px` : "unset",
        bottom: this.position === "below" ? "unset" : `${document.documentElement.clientHeight - cr.top}px`
      };
      return b2`
      <div
        class=${e7(classes)}
        popover="auto"
        @toggle=${this._handleDropdownToggle}
        .style=${stylePropertyMap(dropdownStyles)}
      >
        ${this.position === "above" ? this._renderDescription() : A}
        <vscode-scrollable
          always-visible
          class="scrollable"
          min-thumb-size="40"
          tabindex="-1"
          @vsc-scrollable-scroll=${this._onOptionListScroll}
          .scrollPos=${this._optionListScrollPos}
          .style=${stylePropertyMap({
        height: `${scrollPaneHeight}px`
      })}
        >
          ${this._renderOptions()} ${this._renderDropdownControls()}
        </vscode-scrollable>
        ${this.position === "below" ? this._renderDescription() : A}
      </div>
    `;
    }
  };
  __decorate8([
    n4({ type: Boolean, reflect: true })
  ], VscodeSelectBase.prototype, "creatable", void 0);
  __decorate8([
    n4({ type: Boolean, reflect: true })
  ], VscodeSelectBase.prototype, "combobox", null);
  __decorate8([
    n4({ reflect: true })
  ], VscodeSelectBase.prototype, "label", void 0);
  __decorate8([
    n4({ type: Boolean, reflect: true })
  ], VscodeSelectBase.prototype, "disabled", null);
  __decorate8([
    n4({ type: Boolean, reflect: true })
  ], VscodeSelectBase.prototype, "invalid", void 0);
  __decorate8([
    n4()
  ], VscodeSelectBase.prototype, "filter", null);
  __decorate8([
    n4({ type: Boolean, reflect: true })
  ], VscodeSelectBase.prototype, "focused", void 0);
  __decorate8([
    n4({ type: Boolean, reflect: true })
  ], VscodeSelectBase.prototype, "open", void 0);
  __decorate8([
    n4({ type: Array })
  ], VscodeSelectBase.prototype, "options", null);
  __decorate8([
    n4({ reflect: true })
  ], VscodeSelectBase.prototype, "position", void 0);
  __decorate8([
    o6({
      flatten: true,
      selector: "vscode-option"
    })
  ], VscodeSelectBase.prototype, "_assignedOptions", void 0);
  __decorate8([
    e5(".dropdown", true)
  ], VscodeSelectBase.prototype, "_dropdownEl", void 0);
  __decorate8([
    r5()
  ], VscodeSelectBase.prototype, "_currentDescription", void 0);
  __decorate8([
    r5()
  ], VscodeSelectBase.prototype, "_filter", void 0);
  __decorate8([
    r5()
  ], VscodeSelectBase.prototype, "_filteredOptions", null);
  __decorate8([
    r5()
  ], VscodeSelectBase.prototype, "_selectedIndexes", void 0);
  __decorate8([
    r5()
  ], VscodeSelectBase.prototype, "_options", void 0);
  __decorate8([
    r5()
  ], VscodeSelectBase.prototype, "_value", void 0);
  __decorate8([
    r5()
  ], VscodeSelectBase.prototype, "_values", void 0);
  __decorate8([
    r5()
  ], VscodeSelectBase.prototype, "_isPlaceholderOptionActive", void 0);
  __decorate8([
    r5()
  ], VscodeSelectBase.prototype, "_isBeingFiltered", void 0);
  __decorate8([
    r5()
  ], VscodeSelectBase.prototype, "_optionListScrollPos", void 0);

  // node_modules/@vscode-elements/elements/dist/includes/vscode-select/styles.js
  var styles_default = [
    default_styles_default,
    i`
    :host {
      display: inline-block;
      max-width: 100%;
      outline: none;
      position: relative;
      width: 320px;
    }

    .main-slot {
      display: none;
    }

    .select-face,
    .combobox-face {
      background-color: var(--vscode-settings-dropdownBackground, #313131);
      border-color: var(--vscode-settings-dropdownBorder, #3c3c3c);
      border-radius: 2px;
      border-style: solid;
      border-width: 1px;
      box-sizing: border-box;
      color: var(--vscode-settings-dropdownForeground, #cccccc);
      font-family: var(--vscode-font-family, sans-serif);
      font-size: var(--vscode-font-size, 13px);
      font-weight: var(--vscode-font-weight, normal);
      line-height: 18px;
      position: relative;
      user-select: none;
      width: 100%;
    }

    :host([invalid]) .select-face,
    :host(:invalid) .select-face,
    :host([invalid]) .combobox-face,
    :host(:invalid) .combobox-face {
      background-color: var(--vscode-inputValidation-errorBackground, #5a1d1d);
      border-color: var(--vscode-inputValidation-errorBorder, #be1100);
    }

    .select-face {
      cursor: pointer;
      display: block;
      padding: 3px 4px;
    }

    .select-face .text {
      display: block;
      height: 18px;
      overflow: hidden;
      padding-right: 20px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .select-face.multiselect {
      padding: 0;
    }

    .select-face-badge {
      background-color: var(--vscode-badge-background, #616161);
      border-radius: 2px;
      color: var(--vscode-badge-foreground, #f8f8f8);
      display: inline-block;
      flex-shrink: 0;
      font-size: 11px;
      line-height: 16px;
      margin: 2px;
      padding: 2px 3px;
      white-space: nowrap;
    }

    .select-face-badge.no-item {
      background-color: transparent;
      color: inherit;
    }

    .combobox-face {
      display: flex;
    }

    :host(:focus) .select-face,
    :host(:focus) .combobox-face,
    :host([focused]) .select-face,
    :host([focused]) .combobox-face {
      border-color: var(--vscode-focusBorder, #0078d4);
      outline: none;
    }

    .combobox-input {
      background-color: transparent;
      box-sizing: border-box;
      border: 0;
      color: var(--vscode-foreground, #cccccc);
      display: block;
      font-family: var(--vscode-font-family, sans-serif);
      font-size: var(--vscode-font-size, 13px);
      line-height: 16px;
      padding: 4px;
      width: 100%;
    }

    .combobox-input:focus {
      outline: none;
    }

    .combobox-button {
      align-items: center;
      background-color: transparent;
      border: 0;
      border-radius: 2px;
      box-sizing: content-box;
      color: var(--vscode-foreground, #cccccc);
      cursor: pointer;
      display: flex;
      flex-shrink: 0;
      height: 16px;
      justify-content: center;
      margin: 1px 1px 0 0;
      padding: 3px;
      width: 22px;
    }

    .combobox-button:hover,
    .combobox-button:focus-visible {
      background-color: var(
        --vscode-toolbar-hoverBackground,
        rgba(90, 93, 94, 0.31)
      );
      outline-style: dashed;
      outline-color: var(--vscode-toolbar-hoverOutline, transparent);
    }

    .combobox-button:focus-visible {
      outline: none;
    }

    .icon {
      color: var(--vscode-foreground, #cccccc);
      display: block;
      height: 14px;
      pointer-events: none;
      width: 14px;
    }

    .select-face .icon {
      position: absolute;
      right: 6px;
      top: 5px;
    }

    .icon svg {
      color: var(--vscode-foreground, #cccccc);
      height: 100%;
      width: 100%;
    }

    .dropdown {
      background-color: var(--vscode-settings-dropdownBackground, #313131);
      border-color: var(--vscode-settings-dropdownListBorder, #454545);
      border-radius: 0 0 3px 3px;
      border-style: solid;
      border-width: 1px;
      bottom: unset;
      box-sizing: border-box;
      display: none;
      padding-bottom: 2px;
      padding-left: 0;
      padding-right: 0;
      padding-top: 0;
      right: unset;
    }

    .dropdown.open {
      display: block;
    }

    :host([position='above']) .dropdown {
      border-radius: 3px 3px 0 0;
      bottom: 26px;
      padding-bottom: 0;
      padding-top: 2px;
      top: unset;
    }

    :host(:focus) .dropdown,
    :host([focused]) .dropdown {
      border-color: var(--vscode-focusBorder, #0078d4);
    }

    .scrollable {
      display: block;
      max-height: 222px;
      margin: 1px;
      outline: none;
      overflow: hidden;
    }

    .options {
      box-sizing: border-box;
      cursor: pointer;
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .option {
      box-sizing: border-box;
      color: var(--vscode-foreground, #cccccc);
      cursor: pointer;
      font-family: var(--vscode-font-family, sans-serif);
      font-size: var(--vscode-font-size, 13px);
      font-weight: var(--vscode-font-weight, normal);
      height: 22px;
      line-height: 20px;
      min-height: calc(var(--vscode-font-size) * 1.3);
      padding: 1px 3px;
      user-select: none;
      outline-color: transparent;
      outline-offset: -1px;
      outline-style: solid;
      outline-width: 1px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    .option.single-select {
      display: block;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    .option.multi-select {
      align-items: center;
      display: flex;
    }

    .option b {
      color: var(--vscode-list-highlightForeground, #2aaaff);
    }

    .option.active b {
      color: var(--vscode-list-focusHighlightForeground, #2aaaff);
    }

    .option:not(.disabled):hover {
      background-color: var(--vscode-list-hoverBackground, #2a2d2e);
      color: var(--vscode-list-hoverForeground, #ffffff);
    }

    :host-context(body[data-vscode-theme-kind='vscode-high-contrast'])
      .option:hover,
    :host-context(body[data-vscode-theme-kind='vscode-high-contrast-light'])
      .option:hover {
      outline-style: dotted;
      outline-color: var(--vscode-list-focusOutline, #0078d4);
      outline-width: 1px;
    }

    .option.disabled {
      cursor: not-allowed;
      opacity: 0.4;
    }

    .option.active,
    .option.active:hover {
      background-color: var(--vscode-list-activeSelectionBackground, #04395e);
      color: var(--vscode-list-activeSelectionForeground, #ffffff);
      outline-color: var(--vscode-list-activeSelectionBackground, #04395e);
      outline-style: solid;
      outline-width: 1px;
    }

    .no-options {
      align-items: center;
      border-color: transparent;
      border-style: solid;
      border-width: 1px;
      color: var(--vscode-foreground, #cccccc);
      cursor: default;
      display: flex;
      font-family: var(--vscode-font-family, sans-serif);
      font-size: var(--vscode-font-size, 13px);
      font-weight: var(--vscode-font-weight, normal);
      line-height: 18px;
      min-height: calc(var(--vscode-font-size) * 1.3);
      opacity: 0.85;
      padding: 1px 3px;
      user-select: none;
    }

    .placeholder {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .placeholder span {
      font-weight: bold;
    }

    .placeholder:not(.disabled):hover {
      color: var(--vscode-list-activeSelectionForeground, #ffffff);
    }

    :host-context(body[data-vscode-theme-kind='vscode-high-contrast'])
      .option.active,
    :host-context(body[data-vscode-theme-kind='vscode-high-contrast-light'])
      .option.active:hover {
      outline-color: var(--vscode-list-focusOutline, #0078d4);
      outline-style: dashed;
    }

    .option-label {
      display: block;
      overflow: hidden;
      pointer-events: none;
      text-overflow: ellipsis;
      white-space: nowrap;
      width: 100%;
    }

    .dropdown.multiple .option.selected {
      background-color: var(--vscode-list-hoverBackground, #2a2d2e);
      outline-color: var(--vscode-list-hoverBackground, #2a2d2e);
    }

    .dropdown.multiple .option.selected.active {
      background-color: var(--vscode-list-activeSelectionBackground, #04395e);
      color: var(--vscode-list-activeSelectionForeground, #ffffff);
      outline-color: var(--vscode-list-activeSelectionBackground, #04395e);
    }

    .checkbox-icon {
      align-items: center;
      background-color: var(--vscode-checkbox-background, #313131);
      border-radius: 2px;
      border: 1px solid var(--vscode-checkbox-border);
      box-sizing: border-box;
      color: var(--vscode-checkbox-foreground);
      display: flex;
      flex-basis: 15px;
      flex-shrink: 0;
      height: 15px;
      justify-content: center;
      margin-right: 5px;
      overflow: hidden;
      position: relative;
      width: 15px;
    }

    .checkbox-icon svg {
      display: none;
      height: 13px;
      width: 13px;
    }

    .checkbox-icon.checked svg {
      display: block;
    }

    .dropdown-controls {
      display: flex;
      justify-content: flex-end;
      padding: 4px;
    }

    .dropdown-controls :not(:last-child) {
      margin-right: 4px;
    }

    .action-icon {
      align-items: center;
      background-color: transparent;
      border: 0;
      color: var(--vscode-foreground, #cccccc);
      cursor: pointer;
      display: flex;
      height: 24px;
      justify-content: center;
      padding: 0;
      width: 24px;
    }

    .action-icon:focus {
      outline: none;
    }

    .action-icon:focus-visible {
      outline: 1px solid var(--vscode-focusBorder, #0078d4);
      outline-offset: -1px;
    }

    .description {
      border-color: var(--vscode-settings-dropdownBorder, #3c3c3c);
      border-style: solid;
      border-width: 1px 0 0;
      color: var(--vscode-foreground, #cccccc);
      font-family: var(--vscode-font-family, sans-serif);
      font-size: var(--vscode-font-size, 13px);
      font-weight: var(--vscode-font-weight, normal);
      line-height: 1.3;
      padding: 6px 4px;
      word-wrap: break-word;
    }

    :host([position='above']) .description {
      border-width: 0 0 1px;
    }
  `
  ];

  // node_modules/@vscode-elements/elements/dist/vscode-single-select/vscode-single-select.styles.js
  var vscode_single_select_styles_default = styles_default;

  // node_modules/@vscode-elements/elements/dist/vscode-single-select/vscode-single-select.js
  var __decorate9 = function(decorators, target, key, desc) {
    var c5 = arguments.length, r6 = c5 < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d3;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r6 = Reflect.decorate(decorators, target, key, desc);
    else for (var i7 = decorators.length - 1; i7 >= 0; i7--) if (d3 = decorators[i7]) r6 = (c5 < 3 ? d3(r6) : c5 > 3 ? d3(target, key, r6) : d3(target, key)) || r6;
    return c5 > 3 && r6 && Object.defineProperty(target, key, r6), r6;
  };
  var VscodeSingleSelect = class VscodeSingleSelect2 extends VscodeSelectBase {
    set selectedIndex(val) {
      this._opts.selectedIndex = val;
      const op = this._opts.getOptionByIndex(val);
      if (op) {
        this._opts.activeIndex = val;
        this._value = op.value;
        this._internals.setFormValue(this._value);
        this._manageRequired();
      } else {
        this._value = "";
        this._internals.setFormValue("");
        this._manageRequired();
      }
    }
    get selectedIndex() {
      return this._opts.selectedIndex;
    }
    set value(val) {
      this._opts.value = val;
      if (this._opts.selectedIndex > -1) {
        this._requestedValueToSetLater = "";
      } else {
        this._requestedValueToSetLater = val;
      }
      this._internals.setFormValue(this._value);
      this._manageRequired();
    }
    get value() {
      return this._opts.value;
    }
    get validity() {
      return this._internals.validity;
    }
    get validationMessage() {
      return this._internals.validationMessage;
    }
    get willValidate() {
      return this._internals.willValidate;
    }
    checkValidity() {
      return this._internals.checkValidity();
    }
    reportValidity() {
      return this._internals.reportValidity();
    }
    updateInputValue() {
      if (!this.combobox) {
        return;
      }
      const input = this.renderRoot.querySelector(".combobox-input");
      if (input) {
        const selectedOption = this._opts.getSelectedOption();
        input.value = selectedOption?.label ?? "";
      }
    }
    constructor() {
      super();
      this.defaultValue = "";
      this.name = void 0;
      this.required = false;
      this._requestedValueToSetLater = "";
      this._opts.multiSelect = false;
      this._internals = this.attachInternals();
    }
    connectedCallback() {
      super.connectedCallback();
      this.updateComplete.then(() => {
        this._manageRequired();
      });
    }
    /** @internal */
    formResetCallback() {
      this.value = this.defaultValue;
    }
    /** @internal */
    formStateRestoreCallback(state2, _mode) {
      this.updateComplete.then(() => {
        this.value = state2;
      });
    }
    /** @internal */
    get type() {
      return "select-one";
    }
    get form() {
      return this._internals.form;
    }
    async _createAndSelectSuggestedOption() {
      const nextIndex = this._createSuggestedOption();
      await this.updateComplete;
      this._opts.selectedIndex = nextIndex;
      this._dispatchChangeEvent();
      const opCreateEvent = new CustomEvent("vsc-single-select-create-option", { detail: { value: this._opts.getOptionByIndex(nextIndex)?.value ?? "" } });
      this.dispatchEvent(opCreateEvent);
      this.open = false;
      this._isPlaceholderOptionActive = false;
    }
    _setStateFromSlottedElements() {
      super._setStateFromSlottedElements();
      if (!this.combobox && this._opts.selectedIndexes.length === 0) {
        this._opts.selectedIndex = this._opts.options.length > 0 ? 0 : -1;
      }
    }
    //#region event handlers
    _onSlotChange() {
      super._onSlotChange();
      if (this._requestedValueToSetLater) {
        const foundOption = this._opts.getOptionByValue(this._requestedValueToSetLater);
        if (foundOption) {
          this._opts.selectedIndex = foundOption.index;
          this._requestedValueToSetLater = "";
        }
      }
      if (this._opts.selectedIndex > -1 && this._opts.numOptions > 0) {
        this._internals.setFormValue(this._opts.value);
        this._manageRequired();
      } else {
        this._internals.setFormValue(null);
        this._manageRequired();
      }
    }
    _onEnterKeyDown(ev) {
      super._onEnterKeyDown(ev);
      let valueChanged = false;
      if (this.combobox) {
        if (this.open) {
          if (this._isPlaceholderOptionActive) {
            this._createAndSelectSuggestedOption();
          } else {
            valueChanged = this._opts.activeIndex !== this._opts.selectedIndex;
            this._opts.selectedIndex = this._opts.activeIndex;
            this.open = false;
          }
        } else {
          this.open = true;
          this._scrollActiveElementToTop();
        }
      } else {
        if (this.open) {
          valueChanged = this._opts.activeIndex !== this._opts.selectedIndex;
          this._opts.selectedIndex = this._opts.activeIndex;
          this.open = false;
        } else {
          this.open = true;
          this._scrollActiveElementToTop();
        }
      }
      if (valueChanged) {
        this._dispatchChangeEvent();
        this.updateInputValue();
        this._internals.setFormValue(this._opts.value);
        this._manageRequired();
      }
    }
    _onOptionClick(ev) {
      super._onOptionClick(ev);
      const composedPath = ev.composedPath();
      const optEl = composedPath.find((et) => {
        const el = et;
        if ("matches" in el) {
          return el.matches("li.option");
        }
        return;
      });
      if (!optEl || optEl.matches(".disabled")) {
        return;
      }
      const isPlaceholderOption = optEl.classList.contains("placeholder");
      if (isPlaceholderOption) {
        if (this.creatable) {
          this._createAndSelectSuggestedOption();
        }
      } else {
        this._opts.selectedIndex = Number(optEl.dataset.index);
        this.open = false;
        this._internals.setFormValue(this._value);
        this._manageRequired();
        this._dispatchChangeEvent();
      }
    }
    //#endregion
    _manageRequired() {
      const { value } = this;
      if (value === "" && this.required) {
        this._internals.setValidity({ valueMissing: true }, "Please select an item in the list.", this._face);
      } else {
        this._internals.setValidity({});
      }
    }
    //#region render functions
    _renderSelectFace() {
      const selectedOption = this._opts.getSelectedOption();
      const label = selectedOption?.label ?? "";
      const activeDescendant = this._opts.activeIndex > -1 ? `op-${this._opts.activeIndex}` : "";
      return b2`
      <div
        aria-activedescendant=${activeDescendant}
        aria-controls="select-listbox"
        aria-expanded=${this.open ? "true" : "false"}
        aria-haspopup="listbox"
        aria-label=${o7(this.label)}
        class="select-face face"
        @click=${this._onFaceClick}
        role="combobox"
        tabindex="0"
      >
        <span class="text">${label}</span> ${chevronDownIcon}
      </div>
    `;
    }
    _renderComboboxFace() {
      let inputVal = "";
      if (this._isBeingFiltered) {
        inputVal = this._opts.filterPattern;
      } else {
        const op = this._opts.getSelectedOption();
        inputVal = op?.label ?? "";
      }
      const activeDescendant = this._opts.activeIndex > -1 ? `op-${this._opts.activeIndex}` : "";
      const expanded = this.open ? "true" : "false";
      return b2`
      <div class="combobox-face face">
        <input
          aria-activedescendant=${activeDescendant}
          aria-autocomplete="list"
          aria-controls="select-listbox"
          aria-expanded=${expanded}
          aria-haspopup="listbox"
          aria-label=${o7(this.label)}
          class="combobox-input"
          role="combobox"
          spellcheck="false"
          type="text"
          autocomplete="off"
          .value=${inputVal}
          @focus=${this._onComboboxInputFocus}
          @blur=${this._onComboboxInputBlur}
          @input=${this._onComboboxInputInput}
          @click=${this._onComboboxInputClick}
          @keydown=${this._onComboboxInputSpaceKeyDown}
        >
        <button
          aria-label="Open the list of options"
          class="combobox-button"
          type="button"
          @click=${this._onComboboxButtonClick}
          @keydown=${this._onComboboxButtonKeyDown}
          tabindex="-1"
        >
          ${chevronDownIcon}
        </button>
      </div>
    `;
    }
    render() {
      return b2`
      <div class="single-select">
        <slot class="main-slot" @slotchange=${this._onSlotChange}></slot>
        ${this.combobox ? this._renderComboboxFace() : this._renderSelectFace()}
        ${this._renderDropdown()}
      </div>
    `;
    }
  };
  VscodeSingleSelect.styles = vscode_single_select_styles_default;
  VscodeSingleSelect.shadowRootOptions = {
    ...i4.shadowRootOptions,
    delegatesFocus: true
  };
  VscodeSingleSelect.formAssociated = true;
  __decorate9([
    n4({ attribute: "default-value" })
  ], VscodeSingleSelect.prototype, "defaultValue", void 0);
  __decorate9([
    n4({ reflect: true })
  ], VscodeSingleSelect.prototype, "name", void 0);
  __decorate9([
    n4({ type: Number, attribute: "selected-index" })
  ], VscodeSingleSelect.prototype, "selectedIndex", null);
  __decorate9([
    n4({ type: String })
  ], VscodeSingleSelect.prototype, "value", null);
  __decorate9([
    n4({ type: Boolean, reflect: true })
  ], VscodeSingleSelect.prototype, "required", void 0);
  __decorate9([
    e5(".face")
  ], VscodeSingleSelect.prototype, "_face", void 0);
  VscodeSingleSelect = __decorate9([
    customElement("vscode-single-select")
  ], VscodeSingleSelect);

  // src/webview/components/settings/settings-form.ts
  var SettingsForm = class extends BaseElement {
    constructor() {
      super(...arguments);
      this.isSaving = false;
      this.editedConfig = null;
    }
    willUpdate(changedProps) {
      if ((changedProps.has("config") || !this.editedConfig) && this.config) {
        this.editedConfig = { ...this.config };
      }
    }
    render() {
      if (!this.editedConfig) return b2``;
      return b2`
      <div class="card">
        <div class="card-header">常规设置</div>

        <div class="field">
          <label>默认服务商</label>
          <vscode-single-select
            .value="${this.editedConfig.defaultProvider}"
            @change="${this._handleProviderChange}"
          >
            <vscode-option value="deepseek">DeepSeek</vscode-option>
            <vscode-option value="qwen">千问</vscode-option>
            <vscode-option value="kimi">Kimi</vscode-option>
            <vscode-option value="glm">智谱</vscode-option>
          </vscode-single-select>
        </div>

        <div class="field">
          <label>显示模式</label>
          <vscode-single-select
            .value="${this.editedConfig.displayMode}"
            @change="${this._handleDisplayModeChange}"
          >
            <vscode-option value="simple">简单</vscode-option>
            <vscode-option value="normal">完整</vscode-option>
          </vscode-single-select>
        </div>

        <div class="field">
          <label>目标语言</label>
          <vscode-single-select
            .value="${this.editedConfig.defaultTargetLang}"
            @change="${this._handleTargetLangChange}"
          >
            <vscode-option value="zh">中文</vscode-option>
            <vscode-option value="en">English</vscode-option>
            <vscode-option value="ja">日本語</vscode-option>
            <vscode-option value="ko">한국어</vscode-option>
            <vscode-option value="de">Deutsch</vscode-option>
            <vscode-option value="fr">Français</vscode-option>
            <vscode-option value="es">Español</vscode-option>
          </vscode-single-select>
        </div>

        <div class="actions">
          <vscode-button
            .disabled="${this.isSaving}"
            @click="${this._handleSave}"
          >
            保存
          </vscode-button>
        </div>
      </div>
    `;
    }
    _handleProviderChange(e8) {
      const target = e8.target;
      if (this.editedConfig) {
        this.editedConfig = { ...this.editedConfig, defaultProvider: target.value };
      }
    }
    _handleDisplayModeChange(e8) {
      const target = e8.target;
      if (this.editedConfig) {
        this.editedConfig = { ...this.editedConfig, displayMode: target.value };
      }
    }
    _handleTargetLangChange(e8) {
      const target = e8.target;
      if (this.editedConfig) {
        this.editedConfig = { ...this.editedConfig, defaultTargetLang: target.value };
      }
    }
    async _handleSave() {
      if (!this.editedConfig) return;
      this.isSaving = true;
      this.dispatchEvent(new CustomEvent("save", {
        detail: this.editedConfig,
        bubbles: true,
        composed: true
      }));
      this.isSaving = false;
    }
  };
  SettingsForm.styles = [
    BaseElement.styles,
    i`
      :host {
        display: block;
      }

      .card {
        border: 1px solid var(--vscode-panel-border);
        border-radius: 3px;
        padding: 12px;
      }

      .card-header {
        font-size: 13px;
        font-weight: 600;
        color: var(--vscode-foreground);
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid var(--vscode-panel-border);
      }

      .field {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
        gap: 8px;
      }

      .field:last-of-type {
        margin-bottom: 0;
      }

      .field label {
        font-size: 12px;
        color: var(--vscode-descriptionForeground);
        min-width: 90px;
      }

      vscode-single-select {
        flex: 1;
      }

      .actions {
        margin-top: 12px;
        padding-top: 8px;
        border-top: 1px solid var(--vscode-panel-border);
        display: flex;
        justify-content: flex-end;
      }
    `
  ];
  __decorateClass([
    n4({ type: Object })
  ], SettingsForm.prototype, "config", 2);
  __decorateClass([
    r5()
  ], SettingsForm.prototype, "isSaving", 2);
  __decorateClass([
    r5()
  ], SettingsForm.prototype, "editedConfig", 2);
  SettingsForm = __decorateClass([
    t3("settings-form")
  ], SettingsForm);

  // node_modules/@vscode-elements/elements/dist/vscode-textfield/vscode-textfield.styles.js
  var defaultFontStack2 = r(getDefaultFontStack());
  var styles7 = [
    default_styles_default,
    i`
    :host {
      display: inline-block;
      width: 320px;
    }

    .root {
      align-items: center;
      background-color: var(--vscode-settings-textInputBackground, #313131);
      border-color: var(
        --vscode-settings-textInputBorder,
        var(--vscode-settings-textInputBackground, #3c3c3c)
      );
      border-radius: 2px;
      border-style: solid;
      border-width: 1px;
      box-sizing: border-box;
      color: var(--vscode-settings-textInputForeground, #cccccc);
      display: flex;
      max-width: 100%;
      position: relative;
      width: 100%;
    }

    :host([focused]) .root {
      border-color: var(--vscode-focusBorder, #0078d4);
    }

    :host([invalid]),
    :host(:invalid) {
      border-color: var(--vscode-inputValidation-errorBorder, #be1100);
    }

    :host([invalid]) input,
    :host(:invalid) input {
      background-color: var(--vscode-inputValidation-errorBackground, #5a1d1d);
    }

    ::slotted([slot='content-before']) {
      display: block;
      margin-left: 2px;
    }

    ::slotted([slot='content-after']) {
      display: block;
      margin-right: 2px;
    }

    slot[name='content-before'],
    slot[name='content-after'] {
      align-items: center;
      display: flex;
    }

    input {
      background-color: var(--vscode-settings-textInputBackground, #313131);
      border: 0;
      box-sizing: border-box;
      color: var(--vscode-settings-textInputForeground, #cccccc);
      display: block;
      font-family: var(--vscode-font-family, ${defaultFontStack2});
      font-size: var(--vscode-font-size, 13px);
      font-weight: var(--vscode-font-weight, 'normal');
      line-height: 18px;
      outline: none;
      padding-bottom: 3px;
      padding-left: 4px;
      padding-right: 4px;
      padding-top: 3px;
      width: 100%;
    }

    input:read-only:not([type='file']) {
      cursor: not-allowed;
    }

    input::placeholder {
      color: var(--vscode-input-placeholderForeground, #989898);
      opacity: 1;
    }

    input[type='file'] {
      line-height: 24px;
      padding-bottom: 0;
      padding-left: 2px;
      padding-top: 0;
    }

    input[type='file']::file-selector-button {
      background-color: var(--vscode-button-background, #0078d4);
      border: 0;
      border-radius: 2px;
      color: var(--vscode-button-foreground, #ffffff);
      cursor: pointer;
      font-family: var(--vscode-font-family, ${defaultFontStack2});
      font-size: var(--vscode-font-size, 13px);
      font-weight: var(--vscode-font-weight, 'normal');
      line-height: 20px;
      padding: 0 14px;
    }

    input[type='file']::file-selector-button:hover {
      background-color: var(--vscode-button-hoverBackground, #026ec1);
    }
  `
  ];
  var vscode_textfield_styles_default = styles7;

  // node_modules/@vscode-elements/elements/dist/vscode-textfield/vscode-textfield.js
  var __decorate10 = function(decorators, target, key, desc) {
    var c5 = arguments.length, r6 = c5 < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d3;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r6 = Reflect.decorate(decorators, target, key, desc);
    else for (var i7 = decorators.length - 1; i7 >= 0; i7--) if (d3 = decorators[i7]) r6 = (c5 < 3 ? d3(r6) : c5 > 3 ? d3(target, key, r6) : d3(target, key)) || r6;
    return c5 > 3 && r6 && Object.defineProperty(target, key, r6), r6;
  };
  var VscodeTextfield = class VscodeTextfield2 extends VscElement {
    /**
     * Same as the `type` of the native `<input>` element but only a subset of types are supported.
     * The supported ones are: `color`,`date`,`datetime-local`,`email`,`file`,`month`,`number`,`password`,`search`,`tel`,`text`,`time`,`url`,`week`
     */
    set type(val) {
      const validTypes = [
        "color",
        "date",
        "datetime-local",
        "email",
        "file",
        "month",
        "number",
        "password",
        "search",
        "tel",
        "text",
        "time",
        "url",
        "week"
      ];
      this._type = validTypes.includes(val) ? val : "text";
    }
    get type() {
      return this._type;
    }
    set value(val) {
      if (this.type !== "file") {
        this._value = val;
        this._internals.setFormValue(val);
      }
      this.updateComplete.then(() => {
        this._setValidityFromInput();
      });
    }
    get value() {
      return this._value;
    }
    /**
     * Lowercase alias to minLength
     */
    set minlength(val) {
      this.minLength = val;
    }
    get minlength() {
      return this.minLength;
    }
    /**
     * Lowercase alias to maxLength
     */
    set maxlength(val) {
      this.maxLength = val;
    }
    get maxlength() {
      return this.maxLength;
    }
    get form() {
      return this._internals.form;
    }
    get validity() {
      return this._internals.validity;
    }
    get validationMessage() {
      return this._internals.validationMessage;
    }
    get willValidate() {
      return this._internals.willValidate;
    }
    /**
     * Check the component's validity state when built-in validation is used.
     * Built-in validation is triggered when any validation-related attribute is set. Validation-related
     * attributes are: `max, maxlength, min, minlength, pattern, required, step`.
     * See this [the MDN reference](https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/checkValidity) for more details.
     * @returns {boolean}
     */
    checkValidity() {
      this._setValidityFromInput();
      return this._internals.checkValidity();
    }
    reportValidity() {
      this._setValidityFromInput();
      return this._internals.reportValidity();
    }
    get wrappedElement() {
      return this._inputEl;
    }
    constructor() {
      super();
      this.autocomplete = void 0;
      this.autofocus = false;
      this.defaultValue = "";
      this.disabled = false;
      this.focused = false;
      this.invalid = false;
      this.label = "";
      this.max = void 0;
      this.maxLength = void 0;
      this.min = void 0;
      this.minLength = void 0;
      this.multiple = false;
      this.name = void 0;
      this.pattern = void 0;
      this.placeholder = void 0;
      this.readonly = false;
      this.required = false;
      this.step = void 0;
      this._value = "";
      this._type = "text";
      this._internals = this.attachInternals();
    }
    connectedCallback() {
      super.connectedCallback();
      this.updateComplete.then(() => {
        this._inputEl.checkValidity();
        this._setValidityFromInput();
        this._internals.setFormValue(this._inputEl.value);
      });
    }
    attributeChangedCallback(name, old, value) {
      super.attributeChangedCallback(name, old, value);
      const validationRelatedAttributes = [
        "max",
        "maxlength",
        "min",
        "minlength",
        "pattern",
        "required",
        "step"
      ];
      if (validationRelatedAttributes.includes(name)) {
        this.updateComplete.then(() => {
          this._setValidityFromInput();
        });
      }
    }
    /** @internal */
    formResetCallback() {
      this.value = this.defaultValue;
      this.requestUpdate();
    }
    /** @internal */
    formStateRestoreCallback(state2, _mode) {
      this.value = state2;
    }
    _dataChanged() {
      this._value = this._inputEl.value;
      if (this.type === "file" && this._inputEl.files) {
        for (const f3 of this._inputEl.files) {
          this._internals.setFormValue(f3);
        }
      } else {
        this._internals.setFormValue(this._inputEl.value);
      }
    }
    _setValidityFromInput() {
      if (this._inputEl) {
        this._internals.setValidity(this._inputEl.validity, this._inputEl.validationMessage, this._inputEl);
      }
    }
    _onInput() {
      this._dataChanged();
      this._setValidityFromInput();
    }
    _onChange() {
      this._dataChanged();
      this._setValidityFromInput();
      this.dispatchEvent(new Event("change"));
    }
    _onFocus() {
      this.focused = true;
    }
    _onBlur() {
      this.focused = false;
    }
    _onKeyDown(ev) {
      if (ev.key === "Enter" && this._internals.form) {
        this._internals.form?.requestSubmit();
      }
    }
    render() {
      return b2`
      <div class="root">
        <slot name="content-before"></slot>
        <input
          id="input"
          type=${this.type}
          ?autofocus=${this.autofocus}
          autocomplete=${o7(this.autocomplete)}
          aria-label=${this.label}
          ?disabled=${this.disabled}
          max=${o7(this.max)}
          maxlength=${o7(this.maxLength)}
          min=${o7(this.min)}
          minlength=${o7(this.minLength)}
          ?multiple=${this.multiple}
          name=${o7(this.name)}
          pattern=${o7(this.pattern)}
          placeholder=${o7(this.placeholder)}
          ?readonly=${this.readonly}
          ?required=${this.required}
          step=${o7(this.step)}
          .value=${this._value}
          @blur=${this._onBlur}
          @change=${this._onChange}
          @focus=${this._onFocus}
          @input=${this._onInput}
          @keydown=${this._onKeyDown}
        >
        <slot name="content-after"></slot>
      </div>
    `;
    }
  };
  VscodeTextfield.styles = vscode_textfield_styles_default;
  VscodeTextfield.formAssociated = true;
  VscodeTextfield.shadowRootOptions = {
    ...i4.shadowRootOptions,
    delegatesFocus: true
  };
  __decorate10([
    n4()
  ], VscodeTextfield.prototype, "autocomplete", void 0);
  __decorate10([
    n4({ type: Boolean, reflect: true })
  ], VscodeTextfield.prototype, "autofocus", void 0);
  __decorate10([
    n4({ attribute: "default-value" })
  ], VscodeTextfield.prototype, "defaultValue", void 0);
  __decorate10([
    n4({ type: Boolean, reflect: true })
  ], VscodeTextfield.prototype, "disabled", void 0);
  __decorate10([
    n4({ type: Boolean, reflect: true })
  ], VscodeTextfield.prototype, "focused", void 0);
  __decorate10([
    n4({ type: Boolean, reflect: true })
  ], VscodeTextfield.prototype, "invalid", void 0);
  __decorate10([
    n4({ attribute: false })
  ], VscodeTextfield.prototype, "label", void 0);
  __decorate10([
    n4({ type: Number })
  ], VscodeTextfield.prototype, "max", void 0);
  __decorate10([
    n4({ type: Number })
  ], VscodeTextfield.prototype, "maxLength", void 0);
  __decorate10([
    n4({ type: Number })
  ], VscodeTextfield.prototype, "min", void 0);
  __decorate10([
    n4({ type: Number })
  ], VscodeTextfield.prototype, "minLength", void 0);
  __decorate10([
    n4({ type: Boolean, reflect: true })
  ], VscodeTextfield.prototype, "multiple", void 0);
  __decorate10([
    n4({ reflect: true })
  ], VscodeTextfield.prototype, "name", void 0);
  __decorate10([
    n4()
  ], VscodeTextfield.prototype, "pattern", void 0);
  __decorate10([
    n4()
  ], VscodeTextfield.prototype, "placeholder", void 0);
  __decorate10([
    n4({ type: Boolean, reflect: true })
  ], VscodeTextfield.prototype, "readonly", void 0);
  __decorate10([
    n4({ type: Boolean, reflect: true })
  ], VscodeTextfield.prototype, "required", void 0);
  __decorate10([
    n4({ type: Number })
  ], VscodeTextfield.prototype, "step", void 0);
  __decorate10([
    n4({ reflect: true })
  ], VscodeTextfield.prototype, "type", null);
  __decorate10([
    n4()
  ], VscodeTextfield.prototype, "value", null);
  __decorate10([
    e5("#input")
  ], VscodeTextfield.prototype, "_inputEl", void 0);
  __decorate10([
    r5()
  ], VscodeTextfield.prototype, "_value", void 0);
  __decorate10([
    r5()
  ], VscodeTextfield.prototype, "_type", void 0);
  VscodeTextfield = __decorate10([
    customElement("vscode-textfield")
  ], VscodeTextfield);

  // src/webview/components/settings/provider-card.ts
  var ProviderCard = class extends BaseElement {
    constructor() {
      super(...arguments);
      this.isSaving = false;
      this.editedProvider = null;
    }
    willUpdate(changedProps) {
      if ((changedProps.has("provider") || !this.editedProvider) && this.provider) {
        this.editedProvider = { ...this.provider };
      }
    }
    render() {
      if (!this.editedProvider) return b2``;
      return b2`
      <div class="card">
        <div class="card-header">
          <span class="card-title">${this.editedProvider.name}</span>
          <span class="status ${this.editedProvider.configured ? "configured" : "unconfigured"}">
            ${this.editedProvider.configured ? "\u5DF2\u914D\u7F6E" : "\u672A\u914D\u7F6E"}
          </span>
        </div>

        <div class="field">
          <label>API Key</label>
          <vscode-textfield
            type="password"
            .value="${this.editedProvider.apiKey}"
            placeholder="sk-..."
            @input="${this._handleApiKeyChange}"
          ></vscode-textfield>
        </div>

        <div class="field">
          <label>Base URL</label>
          <vscode-textfield
            .value="${this.editedProvider.baseUrl}"
            placeholder="https://..."
            @input="${this._handleBaseUrlChange}"
          ></vscode-textfield>
        </div>

        <div class="field">
          <label>模型</label>
          <vscode-textfield
            .value="${this.editedProvider.model}"
            placeholder="gpt-3.5-turbo"
            @input="${this._handleModelChange}"
          ></vscode-textfield>
        </div>

        <div class="actions">
          <vscode-button
            .disabled="${this.isSaving}"
            @click="${this._handleSave}"
          >
            保存
          </vscode-button>
        </div>
      </div>
    `;
    }
    _handleApiKeyChange(e8) {
      const target = e8.target;
      if (this.editedProvider) {
        this.editedProvider = { ...this.editedProvider, apiKey: target.value };
      }
    }
    _handleBaseUrlChange(e8) {
      const target = e8.target;
      if (this.editedProvider) {
        this.editedProvider = { ...this.editedProvider, baseUrl: target.value };
      }
    }
    _handleModelChange(e8) {
      const target = e8.target;
      if (this.editedProvider) {
        this.editedProvider = { ...this.editedProvider, model: target.value };
      }
    }
    async _handleSave() {
      if (!this.editedProvider) return;
      this.isSaving = true;
      this.dispatchEvent(new CustomEvent("save", {
        detail: this.editedProvider,
        bubbles: true,
        composed: true
      }));
      this.isSaving = false;
    }
  };
  ProviderCard.styles = [
    BaseElement.styles,
    i`
      :host {
        display: block;
      }

      .card {
        border: 1px solid var(--vscode-panel-border);
        border-radius: 3px;
        padding: 12px;
      }

      .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid var(--vscode-panel-border);
      }

      .card-title {
        font-size: 13px;
        font-weight: 600;
        color: var(--vscode-foreground);
      }

      .status {
        font-size: 11px;
        padding: 2px 6px;
        border-radius: 2px;
      }

      .status.configured {
        color: var(--vscode-testing-iconPassed);
        background: var(--vscode-testing-iconPassed);
        opacity: 0.15;
      }

      .status.unconfigured {
        color: var(--vscode-descriptionForeground);
        background: var(--vscode-descriptionForeground);
        opacity: 0.15;
      }

      .field {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
        gap: 8px;
      }

      .field:last-of-type {
        margin-bottom: 0;
      }

      .field label {
        font-size: 12px;
        color: var(--vscode-descriptionForeground);
        min-width: 70px;
      }

      vscode-textfield {
        flex: 1;
      }

      .actions {
        margin-top: 12px;
        padding-top: 8px;
        border-top: 1px solid var(--vscode-panel-border);
        display: flex;
        justify-content: flex-end;
      }
    `
  ];
  __decorateClass([
    n4({ type: Object })
  ], ProviderCard.prototype, "provider", 2);
  __decorateClass([
    r5()
  ], ProviderCard.prototype, "isSaving", 2);
  __decorateClass([
    r5()
  ], ProviderCard.prototype, "editedProvider", 2);
  ProviderCard = __decorateClass([
    t3("provider-card")
  ], ProviderCard);

  // node_modules/@vscode-elements/elements/dist/vscode-textarea/vscode-textarea.styles.js
  var styles8 = [
    default_styles_default,
    i`
    :host {
      display: inline-block;
      height: auto;
      position: relative;
      width: 320px;
    }

    :host([cols]) {
      width: auto;
    }

    :host([rows]) {
      height: auto;
    }

    .shadow {
      box-shadow: var(--vscode-scrollbar-shadow, #000000) 0 6px 6px -6px inset;
      display: none;
      inset: 0 0 auto 0;
      height: 6px;
      pointer-events: none;
      position: absolute;
      width: 100%;
    }

    .shadow.visible {
      display: block;
    }

    textarea {
      background-color: var(--vscode-settings-textInputBackground, #313131);
      border-color: var(--vscode-settings-textInputBorder, transparent);
      border-radius: 2px;
      border-style: solid;
      border-width: 1px;
      box-sizing: border-box;
      color: var(--vscode-settings-textInputForeground, #cccccc);
      display: block;
      font-family: var(--vscode-font-family, sans-serif);
      font-size: var(--vscode-font-size, 13px);
      font-weight: var(--vscode-font-weight, normal);
      height: 100%;
      width: 100%;
    }

    :host([cols]) textarea {
      width: auto;
    }

    :host([rows]) textarea {
      height: auto;
    }

    :host([invalid]) textarea,
    :host(:invalid) textarea {
      background-color: var(--vscode-inputValidation-errorBackground, #5a1d1d);
      border-color: var(--vscode-inputValidation-errorBorder, #be1100);
    }

    textarea.monospace {
      background-color: var(--vscode-editor-background, #1f1f1f);
      color: var(--vscode-editor-foreground, #cccccc);
      font-family: var(--vscode-editor-font-family, monospace);
      font-size: var(--vscode-editor-font-size, 14px);
      font-weight: var(--vscode-editor-font-weight, normal);
    }

    .textarea.monospace::placeholder {
      color: var(
        --vscode-editor-inlineValuesForeground,
        rgba(255, 255, 255, 0.5)
      );
    }

    textarea.cursor-pointer {
      cursor: pointer;
    }

    textarea:focus {
      border-color: var(--vscode-focusBorder, #0078d4);
      outline: none;
    }

    textarea::placeholder {
      color: var(--vscode-input-placeholderForeground, #989898);
      opacity: 1;
    }

    textarea::-webkit-scrollbar-track {
      background-color: transparent;
    }

    textarea::-webkit-scrollbar {
      width: 14px;
    }

    textarea::-webkit-scrollbar-thumb {
      background-color: transparent;
    }

    textarea:hover::-webkit-scrollbar-thumb {
      background-color: var(
        --vscode-scrollbarSlider-background,
        rgba(121, 121, 121, 0.4)
      );
    }

    textarea::-webkit-scrollbar-thumb:hover {
      background-color: var(
        --vscode-scrollbarSlider-hoverBackground,
        rgba(100, 100, 100, 0.7)
      );
    }

    textarea::-webkit-scrollbar-thumb:active {
      background-color: var(
        --vscode-scrollbarSlider-activeBackground,
        rgba(191, 191, 191, 0.4)
      );
    }

    textarea::-webkit-scrollbar-corner {
      background-color: transparent;
    }

    textarea::-webkit-resizer {
      background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAAHCAYAAADEUlfTAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAACJJREFUeJxjYMAOZuIQZ5j5//9/rJJESczEKYGsG6cEXgAAsEEefMxkua4AAAAASUVORK5CYII=');
      background-repeat: no-repeat;
      background-position: right bottom;
    }
  `
  ];
  var vscode_textarea_styles_default = styles8;

  // node_modules/@vscode-elements/elements/dist/vscode-textarea/vscode-textarea.js
  var __decorate11 = function(decorators, target, key, desc) {
    var c5 = arguments.length, r6 = c5 < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d3;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r6 = Reflect.decorate(decorators, target, key, desc);
    else for (var i7 = decorators.length - 1; i7 >= 0; i7--) if (d3 = decorators[i7]) r6 = (c5 < 3 ? d3(r6) : c5 > 3 ? d3(target, key, r6) : d3(target, key)) || r6;
    return c5 > 3 && r6 && Object.defineProperty(target, key, r6), r6;
  };
  var VscodeTextarea = class VscodeTextarea2 extends VscElement {
    set value(val) {
      this._value = val;
      this._internals.setFormValue(val);
    }
    get value() {
      return this._value;
    }
    /**
     * Getter for the inner textarea element if it needs to be accessed for some reason.
     */
    get wrappedElement() {
      return this._textareaEl;
    }
    get form() {
      return this._internals.form;
    }
    /** @internal */
    get type() {
      return "textarea";
    }
    get validity() {
      return this._internals.validity;
    }
    get validationMessage() {
      return this._internals.validationMessage;
    }
    get willValidate() {
      return this._internals.willValidate;
    }
    /**
     * Lowercase alias to minLength
     */
    set minlength(val) {
      this.minLength = val;
    }
    get minlength() {
      return this.minLength;
    }
    /**
     * Lowercase alias to maxLength
     */
    set maxlength(val) {
      this.maxLength = val;
    }
    get maxlength() {
      return this.maxLength;
    }
    // #endregion
    constructor() {
      super();
      this.autocomplete = void 0;
      this.autofocus = false;
      this.defaultValue = "";
      this.disabled = false;
      this.invalid = false;
      this.label = "";
      this.maxLength = void 0;
      this.minLength = void 0;
      this.rows = void 0;
      this.cols = void 0;
      this.name = void 0;
      this.placeholder = void 0;
      this.readonly = false;
      this.resize = "none";
      this.required = false;
      this.spellcheck = false;
      this.monospace = false;
      this._value = "";
      this._textareaPointerCursor = false;
      this._shadow = false;
      this._internals = this.attachInternals();
    }
    connectedCallback() {
      super.connectedCallback();
      this.updateComplete.then(() => {
        this._textareaEl.checkValidity();
        this._setValidityFromInput();
        this._internals.setFormValue(this._textareaEl.value);
      });
    }
    updated(changedProperties) {
      const validationRelatedProps = ["maxLength", "minLength", "required"];
      for (const key of changedProperties.keys()) {
        if (validationRelatedProps.includes(String(key))) {
          this.updateComplete.then(() => {
            this._setValidityFromInput();
          });
          break;
        }
      }
    }
    /** @internal */
    formResetCallback() {
      this.value = this.defaultValue;
    }
    /** @internal */
    formStateRestoreCallback(state2, _mode) {
      this.updateComplete.then(() => {
        this._value = state2;
      });
    }
    checkValidity() {
      return this._internals.checkValidity();
    }
    reportValidity() {
      return this._internals.reportValidity();
    }
    _setValidityFromInput() {
      this._internals.setValidity(this._textareaEl.validity, this._textareaEl.validationMessage, this._textareaEl);
    }
    _dataChanged() {
      this._value = this._textareaEl.value;
      this._internals.setFormValue(this._textareaEl.value);
    }
    _handleChange() {
      this._dataChanged();
      this._setValidityFromInput();
      this.dispatchEvent(new Event("change"));
    }
    _handleInput() {
      this._dataChanged();
      this._setValidityFromInput();
    }
    _handleMouseMove(ev) {
      if (this._textareaEl.clientHeight >= this._textareaEl.scrollHeight) {
        this._textareaPointerCursor = false;
        return;
      }
      const SCROLLBAR_WIDTH = 14;
      const BORDER_WIDTH = 1;
      const br = this._textareaEl.getBoundingClientRect();
      const x2 = ev.clientX;
      this._textareaPointerCursor = x2 >= br.left + br.width - SCROLLBAR_WIDTH - BORDER_WIDTH * 2;
    }
    _handleScroll() {
      this._shadow = this._textareaEl.scrollTop > 0;
    }
    render() {
      return b2`
      <div
        class=${e7({
        shadow: true,
        visible: this._shadow
      })}
      ></div>
      <textarea
        autocomplete=${o7(this.autocomplete)}
        ?autofocus=${this.autofocus}
        ?disabled=${this.disabled}
        aria-label=${this.label}
        id="textarea"
        class=${e7({
        monospace: this.monospace,
        "cursor-pointer": this._textareaPointerCursor
      })}
        maxlength=${o7(this.maxLength)}
        minlength=${o7(this.minLength)}
        rows=${o7(this.rows)}
        cols=${o7(this.cols)}
        name=${o7(this.name)}
        placeholder=${o7(this.placeholder)}
        ?readonly=${this.readonly}
        .style=${stylePropertyMap({
        resize: this.resize
      })}
        ?required=${this.required}
        spellcheck=${this.spellcheck}
        @change=${this._handleChange}
        @input=${this._handleInput}
        @mousemove=${this._handleMouseMove}
        @scroll=${this._handleScroll}
        .value=${this._value}
      ></textarea>
    `;
    }
  };
  VscodeTextarea.styles = vscode_textarea_styles_default;
  VscodeTextarea.formAssociated = true;
  VscodeTextarea.shadowRootOptions = {
    ...i4.shadowRootOptions,
    delegatesFocus: true
  };
  __decorate11([
    n4()
  ], VscodeTextarea.prototype, "autocomplete", void 0);
  __decorate11([
    n4({ type: Boolean, reflect: true })
  ], VscodeTextarea.prototype, "autofocus", void 0);
  __decorate11([
    n4({ attribute: "default-value" })
  ], VscodeTextarea.prototype, "defaultValue", void 0);
  __decorate11([
    n4({ type: Boolean, reflect: true })
  ], VscodeTextarea.prototype, "disabled", void 0);
  __decorate11([
    n4({ type: Boolean, reflect: true })
  ], VscodeTextarea.prototype, "invalid", void 0);
  __decorate11([
    n4({ attribute: false })
  ], VscodeTextarea.prototype, "label", void 0);
  __decorate11([
    n4({ type: Number })
  ], VscodeTextarea.prototype, "maxLength", void 0);
  __decorate11([
    n4({ type: Number })
  ], VscodeTextarea.prototype, "minLength", void 0);
  __decorate11([
    n4({ type: Number })
  ], VscodeTextarea.prototype, "rows", void 0);
  __decorate11([
    n4({ type: Number })
  ], VscodeTextarea.prototype, "cols", void 0);
  __decorate11([
    n4()
  ], VscodeTextarea.prototype, "name", void 0);
  __decorate11([
    n4()
  ], VscodeTextarea.prototype, "placeholder", void 0);
  __decorate11([
    n4({ type: Boolean, reflect: true })
  ], VscodeTextarea.prototype, "readonly", void 0);
  __decorate11([
    n4()
  ], VscodeTextarea.prototype, "resize", void 0);
  __decorate11([
    n4({ type: Boolean, reflect: true })
  ], VscodeTextarea.prototype, "required", void 0);
  __decorate11([
    n4({ type: Boolean })
  ], VscodeTextarea.prototype, "spellcheck", void 0);
  __decorate11([
    n4({ type: Boolean, reflect: true })
  ], VscodeTextarea.prototype, "monospace", void 0);
  __decorate11([
    n4()
  ], VscodeTextarea.prototype, "value", null);
  __decorate11([
    e5("#textarea")
  ], VscodeTextarea.prototype, "_textareaEl", void 0);
  __decorate11([
    r5()
  ], VscodeTextarea.prototype, "_value", void 0);
  __decorate11([
    r5()
  ], VscodeTextarea.prototype, "_textareaPointerCursor", void 0);
  __decorate11([
    r5()
  ], VscodeTextarea.prototype, "_shadow", void 0);
  VscodeTextarea = __decorate11([
    customElement("vscode-textarea")
  ], VscodeTextarea);

  // src/webview/components/settings/template-list.ts
  var TemplateList = class extends BaseElement {
    constructor() {
      super(...arguments);
      this.templates = [];
      this.defaultTemplateId = "";
      this.editingTemplate = null;
      this.showNewForm = false;
    }
    render() {
      return b2`
      <div class="toolbar">
        <span class="toolbar-title">提示词模板</span>
        <div class="toolbar-actions">
          <vscode-button @click="${this._handleImport}" appearance="secondary">导入</vscode-button>
          <vscode-button @click="${this._handleExport}" appearance="secondary">导出</vscode-button>
          <vscode-button @click="${this._handleNew}">+ 新建</vscode-button>
        </div>
      </div>

      ${this.showNewForm || this.editingTemplate ? this._renderEditForm() : ""}

      <div class="template-list">
        ${this.templates.length === 0 ? b2`<div class="empty">暂无模板</div>` : this.templates.map((template) => this._renderTemplateItem(template))}
      </div>

      <div class="variables-hint">
        可用变量: <code>{text}</code> <code>{sourceLang}</code> <code>{targetLang}</code>
      </div>
    `;
    }
    _renderTemplateItem(template) {
      const isDefault = template.id === this.defaultTemplateId;
      const isBuiltin = template.isBuiltin !== false;
      return b2`
      <div class="template-item ${isDefault ? "is-default" : ""}" @click="${() => this._handleSelect(template)}">
        <div class="template-header">
          <span class="template-name">${template.name}</span>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="template-badge">${isDefault ? "\u9ED8\u8BA4" : isBuiltin ? "\u5185\u7F6E" : "\u81EA\u5B9A\u4E49"}</span>
            ${isBuiltin ? b2`
              <span class="template-badge-copy" @click="${(e8) => {
        e8.stopPropagation();
        this._handleCopy(template);
      }}">复制</span>
            ` : ""}
          </div>
        </div>
        <div class="template-description">${template.description}</div>
        ${!isBuiltin ? b2`
          <div class="template-actions" @click="${(e8) => e8.stopPropagation()}">
            <vscode-button @click="${() => this._handleEdit(template)}" appearance="secondary" style="padding: 2px 8px; font-size: 11px;">编辑</vscode-button>
            <vscode-button @click="${() => this._handleDelete(template)}" appearance="secondary" style="padding: 2px 8px; font-size: 11px;">删除</vscode-button>
          </div>
        ` : ""}
      </div>
    `;
    }
    _renderEditForm() {
      const isEditing = this.editingTemplate !== null;
      const template = isEditing ? this.editingTemplate : { id: "", name: "", description: "", template: "" };
      return b2`
      <div class="card" style="border: 1px solid var(--vscode-panel-border); border-radius: 3px; padding: 12px; margin-bottom: 12px;">
        <div style="font-size: 13px; font-weight: 600; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid var(--vscode-panel-border);">
          ${isEditing ? "\u7F16\u8F91\u6A21\u677F" : "\u65B0\u5EFA\u6A21\u677F"}
        </div>

        <div class="field" style="display: flex; align-items: center; margin-bottom: 8px; gap: 8px;">
          <label style="font-size: 12px; color: var(--vscode-descriptionForeground); min-width: 70px;">名称</label>
          <vscode-textfield
            id="template-name"
            .value="${template.name}"
            placeholder="模板名称"
            style="flex: 1;"
          ></vscode-textfield>
        </div>

        <div class="field" style="display: flex; align-items: center; margin-bottom: 8px; gap: 8px;">
          <label style="font-size: 12px; color: var(--vscode-descriptionForeground); min-width: 70px;">描述</label>
          <vscode-textfield
            id="template-desc"
            .value="${template.description}"
            placeholder="简短描述"
            style="flex: 1;"
          ></vscode-textfield>
        </div>

        <div style="margin-bottom: 8px;">
          <label style="display: block; font-size: 12px; color: var(--vscode-descriptionForeground); margin-bottom: 4px;">模板内容</label>
          <vscode-textarea
            id="template-content"
            rows="8"
            .value="${template.template}"
            placeholder="使用 {text} {sourceLang} {targetLang} 作为变量"
            style="width: 100%;"
          ></vscode-textarea>
        </div>

        <div style="display: flex; gap: 8px; justify-content: flex-end;">
          <vscode-button @click="${this._handleCancelEdit}" appearance="secondary">取消</vscode-button>
          <vscode-button @click="${this._handleSaveTemplate}">保存</vscode-button>
        </div>
      </div>
    `;
    }
    _handleSelect(template) {
      if (template.id !== this.defaultTemplateId) {
        this.dispatchEvent(new CustomEvent("set-default", {
          detail: template.id,
          bubbles: true,
          composed: true
        }));
      }
    }
    _handleNew() {
      this.editingTemplate = null;
      this.showNewForm = true;
    }
    _handleEdit(template) {
      this.editingTemplate = { ...template };
      this.showNewForm = false;
    }
    _handleCancelEdit() {
      this.editingTemplate = null;
      this.showNewForm = false;
    }
    _handleSaveTemplate() {
      const nameInput = document.getElementById("template-name");
      const descInput = document.getElementById("template-desc");
      const contentInput = document.getElementById("template-content");
      const template = {
        id: this.editingTemplate?.id || `custom-${Date.now()}`,
        name: nameInput?.value || "",
        description: descInput?.value || "",
        template: contentInput?.value || "",
        isBuiltin: false
      };
      if (!template.name || !template.template) {
        this.dispatchEvent(new CustomEvent("error", {
          detail: "\u8BF7\u586B\u5199\u6A21\u677F\u540D\u79F0\u548C\u5185\u5BB9",
          bubbles: true
        }));
        return;
      }
      this.dispatchEvent(new CustomEvent("save", {
        detail: template,
        bubbles: true,
        composed: true
      }));
      this.editingTemplate = null;
      this.showNewForm = false;
    }
    _handleDelete(template) {
      this.dispatchEvent(new CustomEvent("delete", {
        detail: template,
        bubbles: true,
        composed: true
      }));
    }
    _handleSetDefault(template) {
      this.dispatchEvent(new CustomEvent("set-default", {
        detail: template.id,
        bubbles: true,
        composed: true
      }));
    }
    _handleCopy(template) {
      this.dispatchEvent(new CustomEvent("copy", {
        detail: template,
        bubbles: true,
        composed: true
      }));
    }
    _handleImport() {
      this.dispatchEvent(new CustomEvent("import", {
        bubbles: true,
        composed: true
      }));
    }
    _handleExport() {
      this.dispatchEvent(new CustomEvent("export", {
        bubbles: true,
        composed: true
      }));
    }
  };
  TemplateList.styles = [
    BaseElement.styles,
    i`
      :host {
        display: block;
      }

      .toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid var(--vscode-panel-border);
      }

      .toolbar-title {
        font-size: 13px;
        font-weight: 600;
        color: var(--vscode-foreground);
      }

      .toolbar-actions {
        display: flex;
        gap: 8px;
      }

      .template-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .template-item {
        border: 1px solid var(--vscode-panel-border);
        border-radius: 3px;
        padding: 10px 12px;
        cursor: pointer;
        transition: border-color 0.15s;
      }

      .template-item:hover {
        border-color: var(--vscode-button-primaryBackground);
      }

      .template-item.is-default {
        border-color: var(--vscode-button-primaryBackground);
        background: var(--vscode-editor-inactiveSelectionBackground);
      }

      .template-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 4px;
      }

      .template-name {
        font-size: 13px;
        font-weight: 500;
        color: var(--vscode-foreground);
      }

      .template-badge {
        font-size: 10px;
        padding: 2px 4px;
        border-radius: 2px;
        background: var(--vscode-button-secondaryBackground);
        color: var(--vscode-button-secondaryForeground);
      }

      .template-item.is-default .template-badge {
        background: var(--vscode-button-primaryBackground);
        color: var(--vscode-button-primaryForeground);
      }

      .template-badge-copy {
        font-size: 10px;
        padding: 2px 4px;
        border-radius: 2px;
        background: var(--vscode-button-primaryBackground);
        color: var(--vscode-button-primaryForeground);
        cursor: pointer;
        transition: opacity 0.15s;
      }

      .template-badge-copy:hover {
        opacity: 0.8;
      }

      .template-description {
        font-size: 11px;
        color: var(--vscode-descriptionForeground);
        line-height: 1.4;
      }

      .template-actions {
        display: flex;
        gap: 6px;
        margin-top: 8px;
      }

      .empty {
        padding: 40px 16px;
        text-align: center;
        color: var(--vscode-descriptionForeground);
        font-size: 12px;
      }

      .variables-hint {
        margin-top: 12px;
        padding: 8px;
        background: var(--vscode-textBlockQuote-background);
        border-left: 3px solid var(--vscode-button-primaryBackground);
        font-size: 11px;
        color: var(--vscode-descriptionForeground);
      }

      .variables-hint code {
        font-family: var(--vscode-editor-font-family);
        background: var(--vscode-editor-selectionBackground);
        padding: 2px 4px;
        border-radius: 2px;
      }
    `
  ];
  __decorateClass([
    n4({ type: Array })
  ], TemplateList.prototype, "templates", 2);
  __decorateClass([
    n4({ type: String })
  ], TemplateList.prototype, "defaultTemplateId", 2);
  __decorateClass([
    r5()
  ], TemplateList.prototype, "editingTemplate", 2);
  __decorateClass([
    r5()
  ], TemplateList.prototype, "showNewForm", 2);
  TemplateList = __decorateClass([
    t3("template-list")
  ], TemplateList);

  // src/webview/components/settings/settings-page.ts
  var SettingsPage = class extends BaseElement {
    constructor() {
      super(...arguments);
      this.config = null;
      this.isLoading = true;
      this.error = null;
      this.templates = [];
      this.defaultTemplateId = "default";
    }
    connectedCallback() {
      super.connectedCallback();
      this._loadConfig();
    }
    async _loadConfig() {
      try {
        this.dispatchEvent(new CustomEvent("load-config", {
          bubbles: true,
          composed: true
        }));
      } catch (err) {
        this.error = "\u52A0\u8F7D\u914D\u7F6E\u5931\u8D25";
        this.isLoading = false;
      }
    }
    setConfig(config) {
      this.config = config;
      this.isLoading = false;
    }
    setTemplates(templates, defaultId) {
      this.templates = templates;
      this.defaultTemplateId = defaultId;
    }
    render() {
      if (this.isLoading) {
        return b2`<div class="loading">加载中...</div>`;
      }
      if (this.error) {
        return b2`<div class="error">${this.error}</div>`;
      }
      if (!this.config) {
        return b2`<div class="empty">暂无配置</div>`;
      }
      const providers = Object.values(this.config.providers);
      return b2`
      <div class="header">
        <h1>设置</h1>
        <p>配置翻译插件的首选项和服务商</p>
      </div>

      <vscode-tabs>
        <vscode-tab-header slot="header">常规</vscode-tab-header>
        <vscode-tab-panel>
          <div class="tab-content">
            <settings-form
              .config="${this.config.general}"
              @save="${this._handleGeneralSave}"
            ></settings-form>
          </div>
        </vscode-tab-panel>

        <vscode-tab-header slot="header">服务商</vscode-tab-header>
        <vscode-tab-panel>
          <div class="tab-content">
            <div class="provider-list">
              ${providers.length === 0 ? b2`<div class="empty">暂无配置的服务商</div>` : providers.map((provider) => b2`
                    <provider-card
                      .provider="${provider}"
                      @save="${this._handleProviderSave}"
                    ></provider-card>
                  `)}
            </div>
          </div>
        </vscode-tab-panel>

        <vscode-tab-header slot="header">模板</vscode-tab-header>
        <vscode-tab-panel>
          <div class="tab-content">
            <template-list
              .templates="${this.templates}"
              .defaultTemplateId="${this.defaultTemplateId}"
              @save="${this._handleTemplateSave}"
              @delete="${this._handleTemplateDelete}"
              @set-default="${this._handleTemplateSetDefault}"
              @import="${this._handleTemplateImport}"
              @export="${this._handleTemplateExport}"
              @copy="${this._handleTemplateCopy}"
            ></template-list>
          </div>
        </vscode-tab-panel>
      </vscode-tabs>
    `;
    }
    _handleGeneralSave(e8) {
      this.dispatchEvent(new CustomEvent("save-general", {
        detail: e8.detail,
        bubbles: true,
        composed: true
      }));
    }
    _handleProviderSave(e8) {
      this.dispatchEvent(new CustomEvent("save-provider", {
        detail: e8.detail,
        bubbles: true,
        composed: true
      }));
    }
    _handleTemplateSave(e8) {
      this.dispatchEvent(new CustomEvent("template-save", {
        detail: e8.detail,
        bubbles: true,
        composed: true
      }));
    }
    _handleTemplateDelete(e8) {
      this.dispatchEvent(new CustomEvent("template-delete", {
        detail: e8.detail,
        bubbles: true,
        composed: true
      }));
    }
    _handleTemplateSetDefault(e8) {
      this.dispatchEvent(new CustomEvent("template-set-default", {
        detail: e8.detail,
        bubbles: true,
        composed: true
      }));
    }
    _handleTemplateImport() {
      this.dispatchEvent(new CustomEvent("template-import", {
        bubbles: true,
        composed: true
      }));
    }
    _handleTemplateExport() {
      this.dispatchEvent(new CustomEvent("template-export", {
        bubbles: true,
        composed: true
      }));
    }
    _handleTemplateCopy(e8) {
      this.dispatchEvent(new CustomEvent("template-copy", {
        detail: e8.detail,
        bubbles: true,
        composed: true
      }));
    }
  };
  SettingsPage.styles = [
    BaseElement.styles,
    i`
      :host {
        display: block;
        max-width: 640px;
        margin: 0 auto;
        padding: 16px;
      }

      .header {
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--vscode-panel-border);
      }

      .header h1 {
        font-size: 18px;
        font-weight: 600;
        margin: 0 0 4px 0;
        color: var(--vscode-foreground);
      }

      .header p {
        font-size: 12px;
        margin: 0;
        color: var(--vscode-descriptionForeground);
      }

      vscode-tabs {
        margin-top: 12px;
      }

      .tab-content {
        padding: 12px 0;
      }

      .provider-list {
        display: flex;
        flex-direction: column;
      }

      .provider-list > * {
        margin-bottom: 12px;
      }

      .provider-list > *:last-child {
        margin-bottom: 0;
      }

      .loading, .error, .empty {
        padding: 40px 16px;
        text-align: center;
        color: var(--vscode-descriptionForeground);
        font-size: 13px;
      }

      .error {
        color: var(--vscode-errorForeground);
      }
    `
  ];
  __decorateClass([
    r5()
  ], SettingsPage.prototype, "config", 2);
  __decorateClass([
    r5()
  ], SettingsPage.prototype, "isLoading", 2);
  __decorateClass([
    r5()
  ], SettingsPage.prototype, "error", 2);
  __decorateClass([
    r5()
  ], SettingsPage.prototype, "templates", 2);
  __decorateClass([
    r5()
  ], SettingsPage.prototype, "defaultTemplateId", 2);
  SettingsPage = __decorateClass([
    t3("settings-page")
  ], SettingsPage);

  // src/webview/views/settings.ts
  async function init() {
    const app = document.getElementById("app");
    if (!app) {
      console.error("App element not found");
      return;
    }
    try {
      const [generalConfig, providersData, templatesData] = await Promise.all([
        request("config.get"),
        request("config.providers.get"),
        request("config.templates.get")
      ]);
      const config = {
        general: {
          defaultProvider: generalConfig?.defaultProvider || "deepseek",
          displayMode: generalConfig?.displayMode || "simple",
          defaultTargetLang: generalConfig?.defaultTargetLang || "zh"
        },
        providers: providersData?.providers || {}
      };
      app.setConfig(config);
      app.setTemplates(
        templatesData?.templates || [],
        templatesData?.defaultId || "default"
      );
    } catch (error) {
      console.error("Failed to load config:", error);
      post("notification.show", {
        message: "\u52A0\u8F7D\u914D\u7F6E\u5931\u8D25",
        type: "error"
      });
    }
    app.addEventListener("save-general", async (e8) => {
      const detail = e8.detail;
      try {
        await Promise.all([
          request("config.update", { key: "defaultProvider", value: detail.defaultProvider }),
          request("config.update", { key: "displayMode", value: detail.displayMode }),
          request("config.update", { key: "defaultTargetLang", value: detail.defaultTargetLang })
        ]);
        post("notification.show", { message: "\u8BBE\u7F6E\u5DF2\u4FDD\u5B58", type: "info" });
      } catch (error) {
        const message = error instanceof Error ? error.message : "\u4FDD\u5B58\u5931\u8D25";
        post("notification.show", { message, type: "error" });
      }
    });
    app.addEventListener("save-provider", async (e8) => {
      const detail = e8.detail;
      try {
        await request("config.providers.update", {
          providerId: detail.id,
          config: {
            apiKey: detail.apiKey,
            apiEndpoint: detail.baseUrl,
            model: detail.model
          }
        });
        post("notification.show", { message: "\u670D\u52A1\u5546\u914D\u7F6E\u5DF2\u4FDD\u5B58", type: "info" });
      } catch (error) {
        const message = error instanceof Error ? error.message : "\u4FDD\u5B58\u5931\u8D25";
        post("notification.show", { message, type: "error" });
      }
    });
    app.addEventListener("template-save", async (e8) => {
      const detail = e8.detail;
      try {
        await request("config.templates.save", { template: detail });
        post("notification.show", { message: "\u6A21\u677F\u5DF2\u4FDD\u5B58", type: "info" });
        refreshTemplates();
      } catch (error) {
        const message = error instanceof Error ? error.message : "\u4FDD\u5B58\u5931\u8D25";
        post("notification.show", { message, type: "error" });
      }
    });
    app.addEventListener("template-delete", async (e8) => {
      const detail = e8.detail;
      try {
        await request("config.templates.delete", { id: detail.id });
        post("notification.show", { message: "\u6A21\u677F\u5DF2\u5220\u9664", type: "info" });
        refreshTemplates();
      } catch (error) {
        const message = error instanceof Error ? error.message : "\u5220\u9664\u5931\u8D25";
        post("notification.show", { message, type: "error" });
      }
    });
    app.addEventListener("template-set-default", async (e8) => {
      const templateId = e8.detail;
      try {
        await request("config.templates.setDefault", { id: templateId });
        post("notification.show", { message: "\u9ED8\u8BA4\u6A21\u677F\u5DF2\u8BBE\u7F6E", type: "info" });
        refreshTemplates();
      } catch (error) {
        const message = error instanceof Error ? error.message : "\u8BBE\u7F6E\u5931\u8D25";
        post("notification.show", { message, type: "error" });
      }
    });
    app.addEventListener("template-import", async () => {
      try {
        const importJson = prompt("\u8BF7\u7C98\u8D34\u6A21\u677F JSON\uFF1A");
        if (importJson) {
          await request("config.templates.import", { json: importJson });
          post("notification.show", { message: "\u6A21\u677F\u5DF2\u5BFC\u5165", type: "info" });
          refreshTemplates();
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "\u5BFC\u5165\u5931\u8D25";
        post("notification.show", { message, type: "error" });
      }
    });
    app.addEventListener("template-export", async () => {
      try {
        const result = await request("config.templates.export");
        const json = result?.templates || "[]";
        await navigator.clipboard.writeText(json);
        post("notification.show", { message: "\u6A21\u677F JSON \u5DF2\u590D\u5236\u5230\u526A\u8D34\u677F", type: "info" });
      } catch (error) {
        const message = error instanceof Error ? error.message : "\u5BFC\u51FA\u5931\u8D25";
        post("notification.show", { message, type: "error" });
      }
    });
    app.addEventListener("template-copy", async (e8) => {
      const detail = e8.detail;
      try {
        const newTemplate = {
          ...detail,
          id: `custom-${Date.now()}`,
          name: `${detail.name} (\u590D\u5236)`,
          isBuiltin: false
        };
        await request("config.templates.save", { template: newTemplate });
        post("notification.show", { message: "\u6A21\u677F\u5DF2\u590D\u5236", type: "info" });
        refreshTemplates();
      } catch (error) {
        const message = error instanceof Error ? error.message : "\u590D\u5236\u5931\u8D25";
        post("notification.show", { message, type: "error" });
      }
    });
    async function refreshTemplates() {
      const templatesData = await request("config.templates.get");
      const currentApp = document.getElementById("app");
      if (currentApp) {
        currentApp.setTemplates(
          templatesData?.templates || [],
          templatesData?.defaultId || "default"
        );
      }
    }
    post("panel.focus");
  }
  document.addEventListener("DOMContentLoaded", init);
})();
/*! Bundled license information:

@lit/reactive-element/css-tag.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/reactive-element.js:
lit-html/lit-html.js:
lit-element/lit-element.js:
@lit/reactive-element/decorators/custom-element.js:
@lit/reactive-element/decorators/property.js:
@lit/reactive-element/decorators/state.js:
@lit/reactive-element/decorators/event-options.js:
@lit/reactive-element/decorators/base.js:
@lit/reactive-element/decorators/query.js:
@lit/reactive-element/decorators/query-all.js:
@lit/reactive-element/decorators/query-async.js:
@lit/reactive-element/decorators/query-assigned-nodes.js:
lit-html/directive.js:
lit-html/directives/repeat.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/is-server.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/query-assigned-elements.js:
lit-html/directives/when.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/directives/class-map.js:
lit-html/directives/if-defined.js:
  (**
   * @license
   * Copyright 2018 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/directive-helpers.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
//# sourceMappingURL=settings.js.map
