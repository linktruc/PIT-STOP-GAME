import { r as D1, g as L1, a as Zg } from "./vendor-PY5S7aRQ.js";
import { c as Qg } from "./supabase-CB7MGzWB.js";
import { C as Ig, V as tt, M as os, T as ls, Q as e1, S as a1, a as hn, R as Kg, P as Fg, b as Vn, B as U1, c as Jg, d as Wg, e as H1, f as G1, g as B1, W as q1, h as $g, i as Pg, F as tv, j as ev, k as n1, A as av, l as nv, m as lv, I as iv, n as Af, o as wf, H as sv, D as l1, G as wa, p as uv, q as i1, r as ov, s as cv, t as s1, u as qo, v as rv } from "./three-jQ77pLy4.js";
(function () { const u = document.createElement("link").relList; if (u && u.supports && u.supports("modulepreload"))
    return; for (const d of document.querySelectorAll('link[rel="modulepreload"]'))
    o(d); new MutationObserver(d => { for (const m of d)
    if (m.type === "childList")
        for (const y of m.addedNodes)
            y.tagName === "LINK" && y.rel === "modulepreload" && o(y); }).observe(document, { childList: !0, subtree: !0 }); function f(d) { const m = {}; return d.integrity && (m.integrity = d.integrity), d.referrerPolicy && (m.referrerPolicy = d.referrerPolicy), d.crossOrigin === "use-credentials" ? m.credentials = "include" : d.crossOrigin === "anonymous" ? m.credentials = "omit" : m.credentials = "same-origin", m; } function o(d) { if (d.ep)
    return; d.ep = !0; const m = f(d); fetch(d.href, m); } })();
var Of = { exports: {} }, cu = {};
var u1;
function fv() { if (u1)
    return cu; u1 = 1; var s = Symbol.for("react.transitional.element"), u = Symbol.for("react.fragment"); function f(o, d, m) { var y = null; if (m !== void 0 && (y = "" + m), d.key !== void 0 && (y = "" + d.key), "key" in d) {
    m = {};
    for (var g in d)
        g !== "key" && (m[g] = d[g]);
}
else
    m = d; return d = m.ref, { $$typeof: s, type: o, key: y, ref: d !== void 0 ? d : null, props: m }; } return cu.Fragment = u, cu.jsx = f, cu.jsxs = f, cu; }
var o1;
function dv() { return o1 || (o1 = 1, Of.exports = fv()), Of.exports; }
var c = dv(), O = D1();
const hv = L1(O);
var _f = { exports: {} }, ru = {}, Rf = { exports: {} }, jf = {};
var c1;
function mv() { return c1 || (c1 = 1, (function (s) { function u(G, F) { var ft = G.length; G.push(F); t: for (; 0 < ft;) {
    var xt = ft - 1 >>> 1, Rt = G[xt];
    if (0 < d(Rt, F))
        G[xt] = F, G[ft] = Rt, ft = xt;
    else
        break t;
} } function f(G) { return G.length === 0 ? null : G[0]; } function o(G) { if (G.length === 0)
    return null; var F = G[0], ft = G.pop(); if (ft !== F) {
    G[0] = ft;
    t: for (var xt = 0, Rt = G.length, Kt = Rt >>> 1; xt < Kt;) {
        var Dt = 2 * (xt + 1) - 1, de = G[Dt], Lt = Dt + 1, Ue = G[Lt];
        if (0 > d(de, ft))
            Lt < Rt && 0 > d(Ue, de) ? (G[xt] = Ue, G[Lt] = ft, xt = Lt) : (G[xt] = de, G[Dt] = ft, xt = Dt);
        else if (Lt < Rt && 0 > d(Ue, ft))
            G[xt] = Ue, G[Lt] = ft, xt = Lt;
        else
            break t;
    }
} return F; } function d(G, F) { var ft = G.sortIndex - F.sortIndex; return ft !== 0 ? ft : G.id - F.id; } if (s.unstable_now = void 0, typeof performance == "object" && typeof performance.now == "function") {
    var m = performance;
    s.unstable_now = function () { return m.now(); };
}
else {
    var y = Date, g = y.now();
    s.unstable_now = function () { return y.now() - g; };
} var A = [], E = [], R = 1, T = null, x = 3, C = !1, L = !1, I = !1, K = !1, Q = typeof setTimeout == "function" ? setTimeout : null, P = typeof clearTimeout == "function" ? clearTimeout : null, Ct = typeof setImmediate < "u" ? setImmediate : null; function at(G) { for (var F = f(E); F !== null;) {
    if (F.callback === null)
        o(E);
    else if (F.startTime <= G)
        o(E), F.sortIndex = F.expirationTime, u(A, F);
    else
        break;
    F = f(E);
} } function Tt(G) { if (I = !1, at(G), !L)
    if (f(A) !== null)
        L = !0, Nt || (Nt = !0, fe());
    else {
        var F = f(E);
        F !== null && pt(Tt, F.startTime - G);
    } } var Nt = !1, q = -1, $ = 5, rt = -1; function ye() { return K ? !0 : !(s.unstable_now() - rt < $); } function re() { if (K = !1, Nt) {
    var G = s.unstable_now();
    rt = G;
    var F = !0;
    try {
        t: {
            L = !1, I && (I = !1, P(q), q = -1), C = !0;
            var ft = x;
            try {
                e: {
                    for (at(G), T = f(A); T !== null && !(T.expirationTime > G && ye());) {
                        var xt = T.callback;
                        if (typeof xt == "function") {
                            T.callback = null, x = T.priorityLevel;
                            var Rt = xt(T.expirationTime <= G);
                            if (G = s.unstable_now(), typeof Rt == "function") {
                                T.callback = Rt, at(G), F = !0;
                                break e;
                            }
                            T === f(A) && o(A), at(G);
                        }
                        else
                            o(A);
                        T = f(A);
                    }
                    if (T !== null)
                        F = !0;
                    else {
                        var Kt = f(E);
                        Kt !== null && pt(Tt, Kt.startTime - G), F = !1;
                    }
                }
                break t;
            }
            finally {
                T = null, x = ft, C = !1;
            }
            F = void 0;
        }
    }
    finally {
        F ? fe() : Nt = !1;
    }
} } var fe; if (typeof Ct == "function")
    fe = function () { Ct(re); };
else if (typeof MessageChannel < "u") {
    var Ze = new MessageChannel, Z = Ze.port2;
    Ze.port1.onmessage = re, fe = function () { Z.postMessage(null); };
}
else
    fe = function () { Q(re, 0); }; function pt(G, F) { q = Q(function () { G(s.unstable_now()); }, F); } s.unstable_IdlePriority = 5, s.unstable_ImmediatePriority = 1, s.unstable_LowPriority = 4, s.unstable_NormalPriority = 3, s.unstable_Profiling = null, s.unstable_UserBlockingPriority = 2, s.unstable_cancelCallback = function (G) { G.callback = null; }, s.unstable_forceFrameRate = function (G) { 0 > G || 125 < G ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : $ = 0 < G ? Math.floor(1e3 / G) : 5; }, s.unstable_getCurrentPriorityLevel = function () { return x; }, s.unstable_next = function (G) { switch (x) {
    case 1:
    case 2:
    case 3:
        var F = 3;
        break;
    default: F = x;
} var ft = x; x = F; try {
    return G();
}
finally {
    x = ft;
} }, s.unstable_requestPaint = function () { K = !0; }, s.unstable_runWithPriority = function (G, F) { switch (G) {
    case 1:
    case 2:
    case 3:
    case 4:
    case 5: break;
    default: G = 3;
} var ft = x; x = G; try {
    return F();
}
finally {
    x = ft;
} }, s.unstable_scheduleCallback = function (G, F, ft) { var xt = s.unstable_now(); switch (typeof ft == "object" && ft !== null ? (ft = ft.delay, ft = typeof ft == "number" && 0 < ft ? xt + ft : xt) : ft = xt, G) {
    case 1:
        var Rt = -1;
        break;
    case 2:
        Rt = 250;
        break;
    case 5:
        Rt = 1073741823;
        break;
    case 4:
        Rt = 1e4;
        break;
    default: Rt = 5e3;
} return Rt = ft + Rt, G = { id: R++, callback: F, priorityLevel: G, startTime: ft, expirationTime: Rt, sortIndex: -1 }, ft > xt ? (G.sortIndex = ft, u(E, G), f(A) === null && G === f(E) && (I ? (P(q), q = -1) : I = !0, pt(Tt, ft - xt))) : (G.sortIndex = Rt, u(A, G), L || C || (L = !0, Nt || (Nt = !0, fe()))), G; }, s.unstable_shouldYield = ye, s.unstable_wrapCallback = function (G) { var F = x; return function () { var ft = x; x = F; try {
    return G.apply(this, arguments);
}
finally {
    x = ft;
} }; }; })(jf)), jf; }
var r1;
function yv() { return r1 || (r1 = 1, Rf.exports = mv()), Rf.exports; }
var f1;
function pv() {
    if (f1)
        return ru;
    f1 = 1;
    var s = yv(), u = D1(), f = Zg();
    function o(t) { var e = "https://react.dev/errors/" + t; if (1 < arguments.length) {
        e += "?args[]=" + encodeURIComponent(arguments[1]);
        for (var a = 2; a < arguments.length; a++)
            e += "&args[]=" + encodeURIComponent(arguments[a]);
    } return "Minified React error #" + t + "; visit " + e + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings."; }
    function d(t) { return !(!t || t.nodeType !== 1 && t.nodeType !== 9 && t.nodeType !== 11); }
    function m(t) { for (var e = t, a = e; a && !a.alternate;)
        e = a, (e.flags & 4098) !== 0 && (t = e.return), a = e.return; for (; e.return;)
        e = e.return; return e.tag === 3 ? t : null; }
    function y(t) { if (t.tag === 13) {
        var e = t.memoizedState;
        if (e === null && (t = t.alternate, t !== null && (e = t.memoizedState)), e !== null)
            return e.dehydrated;
    } return null; }
    function g(t) { if (t.tag === 31) {
        var e = t.memoizedState;
        if (e === null && (t = t.alternate, t !== null && (e = t.memoizedState)), e !== null)
            return e.dehydrated;
    } return null; }
    function A(t) { if (m(t) !== t)
        throw Error(o(188)); }
    function E(t) { var e = t.alternate; if (!e) {
        if (e = m(t), e === null)
            throw Error(o(188));
        return e !== t ? null : t;
    } for (var a = t, n = e;;) {
        var l = a.return;
        if (l === null)
            break;
        var i = l.alternate;
        if (i === null) {
            if (n = l.return, n !== null) {
                a = n;
                continue;
            }
            break;
        }
        if (l.child === i.child) {
            for (i = l.child; i;) {
                if (i === a)
                    return A(l), t;
                if (i === n)
                    return A(l), e;
                i = i.sibling;
            }
            throw Error(o(188));
        }
        if (a.return !== n.return)
            a = l, n = i;
        else {
            for (var r = !1, h = l.child; h;) {
                if (h === a) {
                    r = !0, a = l, n = i;
                    break;
                }
                if (h === n) {
                    r = !0, n = l, a = i;
                    break;
                }
                h = h.sibling;
            }
            if (!r) {
                for (h = i.child; h;) {
                    if (h === a) {
                        r = !0, a = i, n = l;
                        break;
                    }
                    if (h === n) {
                        r = !0, n = i, a = l;
                        break;
                    }
                    h = h.sibling;
                }
                if (!r)
                    throw Error(o(189));
            }
        }
        if (a.alternate !== n)
            throw Error(o(190));
    } if (a.tag !== 3)
        throw Error(o(188)); return a.stateNode.current === a ? t : e; }
    function R(t) { var e = t.tag; if (e === 5 || e === 26 || e === 27 || e === 6)
        return t; for (t = t.child; t !== null;) {
        if (e = R(t), e !== null)
            return e;
        t = t.sibling;
    } return null; }
    function T(t, e, a, n, l, i) { for (; t !== null;) {
        if ((t.tag === 5 || t.tag === 27 || t.tag === 6) && a(t, n, l, i) || (t.tag !== 22 || t.memoizedState === null) && (e || t.tag !== 5 && t.tag !== 27) && T(t.child, e, a, n, l, i))
            return !0;
        t = t.sibling;
    } return !1; }
    function x(t) { for (t = t.return; t !== null;) {
        if (t.tag === 3 || t.tag === 5 || t.tag === 27)
            return t;
        t = t.return;
    } return null; }
    function C(t) { var e = !1; for (t = t.return; t !== null && (t.tag === 4 && (e = !0), !(t.tag === 3 || t.tag === 5 || t.tag === 27));)
        t = t.return; return e; }
    function L(t) { var e = [null, null], a = x(t); return a === null || I(e, t, a.child, { foundSelf: !1 }), e; }
    function I(t, e, a, n) { for (; a !== null;) {
        if (a === e)
            n.foundSelf = !0;
        else if (a.tag === 5 || a.tag === 27 || a.tag === 6) {
            if (n.foundSelf)
                return t[1] = a, !0;
            t[0] = a;
        }
        else if ((a.tag !== 22 || a.memoizedState === null) && I(t, e, a.child, n))
            return !0;
        a = a.sibling;
    } return !1; }
    function K(t) { switch (t.tag) {
        case 5:
        case 27:
        case 6: return t.stateNode;
        case 3: return t.stateNode.containerInfo;
        default: throw Error(o(559));
    } }
    var Q = null, P = null;
    function Ct(t, e, a) { return t === a ? !0 : t === e ? (Q = t, !0) : !1; }
    function at(t, e, a) { return t === a ? (P = t, !1) : t === e ? (P !== null && (Q = t), !0) : !1; }
    function Tt(t) { if (t === null)
        return null; do
        t = t === null ? null : t.return;
    while (t && t.tag !== 5 && t.tag !== 27 && t.tag !== 3); return t || null; }
    function Nt(t, e, a) { for (var n = 0, l = t; l; l = a(l))
        n++; l = 0; for (var i = e; i; i = a(i))
        l++; for (; 0 < n - l;)
        t = a(t), n--; for (; 0 < l - n;)
        e = a(e), l--; for (; n--;) {
        if (t === e || e !== null && t === e.alternate)
            return t;
        t = a(t), e = a(e);
    } return null; }
    var q = Object.assign, $ = Symbol.for("react.element"), rt = Symbol.for("react.transitional.element"), ye = Symbol.for("react.portal"), re = Symbol.for("react.fragment"), fe = Symbol.for("react.strict_mode"), Ze = Symbol.for("react.profiler"), Z = Symbol.for("react.consumer"), pt = Symbol.for("react.context"), G = Symbol.for("react.forward_ref"), F = Symbol.for("react.suspense"), ft = Symbol.for("react.suspense_list"), xt = Symbol.for("react.memo"), Rt = Symbol.for("react.lazy"), Kt = Symbol.for("react.activity"), Dt = Symbol.for("react.legacy_hidden"), de = Symbol.for("react.memo_cache_sentinel"), Lt = Symbol.for("react.view_transition"), Ue = Symbol.for("react.recoverable"), Ut = Symbol.iterator;
    function He(t) { return t === null || typeof t != "object" ? null : (t = Ut && t[Ut] || t["@@iterator"], typeof t == "function" ? t : null); }
    var Me = Symbol.for("react.client.reference");
    function On(t) { if (t == null)
        return null; if (typeof t == "function")
        return t.$$typeof === Me ? null : t.displayName || t.name || null; if (typeof t == "string")
        return t; switch (t) {
        case re: return "Fragment";
        case Ze: return "Profiler";
        case fe: return "StrictMode";
        case F: return "Suspense";
        case ft: return "SuspenseList";
        case Kt: return "Activity";
        case Lt: return "ViewTransition";
    } if (typeof t == "object")
        switch (t.$$typeof) {
            case ye: return "Portal";
            case pt: return t.displayName || "Context";
            case Z: return (t._context.displayName || "Context") + ".Consumer";
            case G:
                var e = t.render;
                return t = t.displayName, t || (t = e.displayName || e.name || "", t = t !== "" ? "ForwardRef(" + t + ")" : "ForwardRef"), t;
            case xt: return e = t.displayName || null, e !== null ? e : On(t.type) || "Memo";
            case Rt:
                e = t._payload, t = t._init;
                try {
                    return On(t(e));
                }
                catch { }
        } return null; }
    var it = Array.isArray, V = u.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, lt = f.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, Vt = { pending: !1, data: null, method: null, action: null }, Qt = [], Mt = -1;
    function vt(t) { return { current: t }; }
    function J(t) { 0 > Mt || (t.current = Qt[Mt], Qt[Mt] = null, Mt--); }
    function Y(t, e) { Mt++, Qt[Mt] = t.current, t.current = e; }
    var Xt = vt(null), wt = vt(null), Qe = vt(null), Ae = vt(null);
    function Oa(t, e) { switch (Y(Qe, e), Y(wt, t), Y(Xt, null), e.nodeType) {
        case 9:
        case 11:
            t = (t = e.documentElement) && (t = t.namespaceURI) ? rm(t) : 0;
            break;
        default: if (t = e.tagName, e = e.namespaceURI)
            e = rm(e), t = fm(e, t);
        else
            switch (t) {
                case "svg":
                    t = 1;
                    break;
                case "math":
                    t = 2;
                    break;
                default: t = 0;
            }
    } J(Xt), Y(Xt, t); }
    function mn() { J(Xt), J(wt), J(Qe); }
    function ca(t) { var e = t.memoizedState; e !== null && (Pi._currentValue = e.memoizedState, Y(Ae, t)), e = Xt.current; var a = fm(e, t.type); e !== a && (Y(wt, t), Y(Xt, a)); }
    function ve(t) { wt.current === t && (J(Xt), J(wt)), Ae.current === t && (J(Ae), Pi._currentValue = Vt); }
    var gt, yn;
    function ya(t) {
        if (gt === void 0)
            try {
                throw Error();
            }
            catch (a) {
                var e = a.stack.trim().match(/\n( *(at )?)/);
                gt = e && e[1] || "", yn = -1 < a.stack.indexOf(`
    at`) ? " (<anonymous>)" : -1 < a.stack.indexOf("@") ? "@unknown:0:0" : "";
            }
        return `
` + gt + t + yn;
    }
    var Fa = !1;
    function Xn(t, e) {
        if (!t || Fa)
            return "";
        Fa = !0;
        var a = Error.prepareStackTrace;
        Error.prepareStackTrace = void 0;
        try {
            var n = { DetermineComponentFrameRoot: function () { try {
                    if (e) {
                        var H = function () { throw Error(); };
                        if (Object.defineProperty(H.prototype, "props", { set: function () { throw Error(); } }), typeof Reflect == "object" && Reflect.construct) {
                            try {
                                Reflect.construct(H, []);
                            }
                            catch (W) {
                                var b = W;
                            }
                            Reflect.construct(t, [], H);
                        }
                        else {
                            try {
                                H.call();
                            }
                            catch (W) {
                                b = W;
                            }
                            H = !1;
                            try {
                                var _ = Object.getOwnPropertyDescriptor(t.prototype, "props");
                                Object.defineProperty(t.prototype, "props", { configurable: !0, set: function () { throw Error(); } }), H = !0, new t;
                            }
                            finally {
                                H && (_ !== void 0 ? Object.defineProperty(t.prototype, "props", _) : delete t.prototype.props);
                            }
                        }
                    }
                    else {
                        try {
                            throw Error();
                        }
                        catch (W) {
                            b = W;
                        }
                        (H = t()) && typeof H.catch == "function" && H.catch(function () { });
                    }
                }
                catch (W) {
                    if (W && b && typeof W.stack == "string")
                        return [W.stack, b.stack];
                } return [null, null]; } };
            n.DetermineComponentFrameRoot.displayName = "DetermineComponentFrameRoot";
            var l = Object.getOwnPropertyDescriptor(n.DetermineComponentFrameRoot, "name");
            l && l.configurable && Object.defineProperty(n.DetermineComponentFrameRoot, "name", { value: "DetermineComponentFrameRoot" });
            var i = n.DetermineComponentFrameRoot(), r = i[0], h = i[1];
            if (r && h) {
                var p = r.split(`
`), S = h.split(`
`);
                for (l = n = 0; n < p.length && !p[n].includes("DetermineComponentFrameRoot");)
                    n++;
                for (; l < S.length && !S[l].includes("DetermineComponentFrameRoot");)
                    l++;
                if (n === p.length || l === S.length)
                    for (n = p.length - 1, l = S.length - 1; 1 <= n && 0 <= l && p[n] !== S[l];)
                        l--;
                for (; 1 <= n && 0 <= l; n--, l--)
                    if (p[n] !== S[l]) {
                        if (n !== 1 || l !== 1)
                            do
                                if (n--, l--, 0 > l || p[n] !== S[l]) {
                                    var j = `
` + p[n].replace(" at new ", " at ");
                                    return t.displayName && j.includes("<anonymous>") && (j = j.replace("<anonymous>", t.displayName)), j;
                                }
                            while (1 <= n && 0 <= l);
                        break;
                    }
            }
        }
        finally {
            Fa = !1, Error.prepareStackTrace = a;
        }
        return (a = t ? t.displayName || t.name : "") ? ya(a) : "";
    }
    function Ja(t, e) { switch (t.tag) {
        case 26:
        case 27:
        case 5: return ya(t.type);
        case 16: return ya("Lazy");
        case 13: return t.child !== e && e !== null ? ya("Suspense Fallback") : ya("Suspense");
        case 19: return ya("SuspenseList");
        case 0:
        case 15: return Xn(t.type, !1);
        case 11: return Xn(t.type.render, !1);
        case 1: return Xn(t.type, !0);
        case 31: return ya("Activity");
        case 30: return ya("ViewTransition");
        default: return "";
    } }
    function Zl(t) {
        try {
            var e = "", a = null;
            do
                e += Ja(t, a), a = t, t = t.return;
            while (t);
            return e;
        }
        catch (n) {
            return `
Error generating stack: ` + n.message + `
` + n.stack;
        }
    }
    var Zn = Object.prototype.hasOwnProperty, pn = s.unstable_scheduleCallback, _n = s.unstable_cancelCallback, Qn = s.unstable_shouldYield, In = s.unstable_requestPaint, Ie = s.unstable_now, Ql = s.unstable_getCurrentPriorityLevel, pa = s.unstable_ImmediatePriority, Rn = s.unstable_UserBlockingPriority, Wa = s.unstable_NormalPriority, $a = s.unstable_LowPriority, we = s.unstable_IdlePriority, pi = s.log, Il = s.unstable_setDisableYieldValue, Pa = null, ze = null;
    function Ga(t) { if (typeof pi == "function" && Il(t), ze && typeof ze.setStrictMode == "function")
        try {
            ze.setStrictMode(Pa, t);
        }
        catch { } }
    var Ke = Math.clz32 ? Math.clz32 : Ft, M = Math.log, ct = Math.LN2;
    function Ft(t) { return t >>>= 0, t === 0 ? 32 : 31 - (M(t) / ct | 0) | 0; }
    var ga = 256, gn = 262144, Zt = 4194304;
    function tn(t) { var e = t & 42; if (e !== 0)
        return e; switch (t & -t) {
        case 1: return 1;
        case 2: return 2;
        case 4: return 4;
        case 8: return 8;
        case 16: return 16;
        case 32: return 32;
        case 64: return 64;
        case 128: return 128;
        case 256:
        case 512:
        case 1024:
        case 2048:
        case 4096:
        case 8192:
        case 16384:
        case 32768:
        case 65536:
        case 131072: return t & -t;
        case 262144:
        case 524288:
        case 1048576:
        case 2097152: return t & 3932160;
        case 4194304:
        case 8388608:
        case 16777216:
        case 33554432: return t & 62914560;
        case 67108864: return 67108864;
        case 134217728: return 134217728;
        case 268435456: return 268435456;
        case 536870912: return 536870912;
        case 1073741824: return 0;
        default: return t;
    } }
    function jn(t, e, a) { var n = t.pendingLanes; if (n === 0)
        return 0; var l = 0, i = t.suspendedLanes, r = t.pingedLanes; t = t.warmLanes; var h = n & 134217727; return h !== 0 ? (n = h & ~i, n !== 0 ? l = tn(n) : (r &= h, r !== 0 ? l = tn(r) : a || (a = h & ~t, a !== 0 && (l = tn(a))))) : (h = n & ~i, h !== 0 ? l = tn(h) : r !== 0 ? l = tn(r) : a || (a = n & ~t, a !== 0 && (l = tn(a)))), l === 0 ? 0 : e !== 0 && e !== l && (e & i) === 0 && (i = l & -l, a = e & -e, i >= a || i === 32 && (a & 4194048) !== 0) ? e : l; }
    function Kn(t, e) { return (t.pendingLanes & ~(t.suspendedLanes & ~t.pingedLanes) & e) === 0; }
    function vs(t, e) { (e & 8) !== 0 && (e |= e & 32); var a = t.entangledLanes; if (a !== 0)
        for (t = t.entanglements, a &= e; 0 < a;) {
            var n = 31 - Ke(a), l = 1 << n;
            e |= t[n], a &= ~l;
        } return e; }
    function bs(t, e) { switch (t) {
        case 1:
        case 2:
        case 4:
        case 8:
        case 64: return e + 250;
        case 16:
        case 32:
        case 128:
        case 256:
        case 512:
        case 1024:
        case 2048:
        case 4096:
        case 8192:
        case 16384:
        case 32768:
        case 65536:
        case 131072:
        case 262144:
        case 524288:
        case 1048576:
        case 2097152: return e + 5e3;
        case 4194304:
        case 8388608:
        case 16777216:
        case 33554432: return -1;
        case 67108864:
        case 134217728:
        case 268435456:
        case 536870912:
        case 1073741824: return -1;
        default: return -1;
    } }
    function ac() { var t = Zt; return Zt <<= 1, (Zt & 62914560) === 0 && (Zt = 4194304), t; }
    function z(t) { for (var e = [], a = 0; 31 > a; a++)
        e.push(t); return e; }
    function B(t, e) { t.pendingLanes |= e, e !== 268435456 && (t.suspendedLanes = 0, t.pingedLanes = 0, t.warmLanes = 0); }
    function k(t, e, a, n, l, i) { var r = t.pendingLanes; t.pendingLanes = a, t.suspendedLanes = 0, t.pingedLanes = 0, t.warmLanes = 0, t.expiredLanes &= a, t.entangledLanes &= a, t.errorRecoveryDisabledLanes &= a, t.shellSuspendCounter = 0; var h = t.entanglements, p = t.expirationTimes, S = t.hiddenUpdates; for (a = r & ~a; 0 < a;) {
        var j = 31 - Ke(a), H = 1 << j;
        h[j] = 0, p[j] = -1;
        var b = S[j];
        if (b !== null)
            for (S[j] = null, j = 0; j < b.length; j++) {
                var _ = b[j];
                _ !== null && (_.lane &= -536870913);
            }
        a &= ~H;
    } n !== 0 && X(t, n, 0), i !== 0 && l === 0 && t.tag !== 0 && (t.suspendedLanes |= i & ~(r & ~e)); }
    function X(t, e, a) { t.pendingLanes |= e, t.suspendedLanes &= ~e; var n = 31 - Ke(e); t.entangledLanes |= e, t.entanglements[n] = t.entanglements[n] | 1073741824 | a & 261930; }
    function et(t, e) { var a = t.entangledLanes |= e; for (t = t.entanglements; a;) {
        var n = 31 - Ke(a), l = 1 << n;
        l & e | t[n] & e && (t[n] |= e), a &= ~l;
    } }
    function st(t, e) { var a = e & -e; return a = (a & 42) !== 0 ? 1 : mt(a), (a & (t.suspendedLanes | e)) !== 0 ? 0 : a; }
    function mt(t) { switch (t) {
        case 2:
            t = 1;
            break;
        case 8:
            t = 4;
            break;
        case 32:
            t = 16;
            break;
        case 256:
        case 512:
        case 1024:
        case 2048:
        case 4096:
        case 8192:
        case 16384:
        case 32768:
        case 65536:
        case 131072:
        case 262144:
        case 524288:
        case 1048576:
        case 2097152:
        case 4194304:
        case 8388608:
        case 16777216:
        case 33554432:
            t = 128;
            break;
        case 268435456:
            t = 134217728;
            break;
        default: t = 0;
    } return t; }
    function Jt(t) { return t &= -t, 2 < t ? 8 < t ? (t & 134217727) !== 0 ? 32 : 268435456 : 8 : 2; }
    function Ce() { var t = lt.p; return t !== 0 ? t : (t = window.event, t === void 0 ? 32 : Km(t.type)); }
    function Wt(t, e) { var a = lt.p; try {
        return lt.p = t, e();
    }
    finally {
        lt.p = a;
    } }
    var ie = Math.random().toString(36).slice(2), he = "__reactFiber$" + ie, Oe = "__reactProps$" + ie, $e = "__reactContainer$" + ie, va = "__reactEvents$" + ie, en = "__reactListeners$" + ie, _a = "__reactHandles$" + ie, be = "__reactResources$" + ie, ra = "__reactMarker$" + ie, Fe = "__reactLoad$" + ie;
    function Ba(t) { delete t[he], delete t[Oe], delete t[en], delete t[_a]; }
    function fa(t) { var e; if (e = t[he])
        return e; for (var a = t.parentNode; a;) {
        if (e = a[$e] || a[he]) {
            if (a = e.alternate, e.child !== null || a !== null && a.child !== null)
                for (t = _m(t); t !== null;) {
                    if (a = t[he])
                        return a;
                    t = _m(t);
                }
            return e;
        }
        t = a, a = t.parentNode;
    } return null; }
    function ba(t) { if (t = t[he] || t[$e]) {
        var e = t.tag;
        if (e === 5 || e === 6 || e === 13 || e === 31 || e === 26 || e === 27 || e === 3)
            return t;
    } return null; }
    function Mn(t) { var e = t.tag; if (e === 5 || e === 26 || e === 27 || e === 6)
        return t.stateNode; throw Error(o(33)); }
    function Ee(t) { var e = t[be]; return e || (e = t[be] = { hoistableStyles: new Map, hoistableScripts: new Map }), e; }
    function _e(t) { t[ra] = !0; }
    function rl(t) { t[Fe] = void 0; }
    var gi = new Set, vi = {};
    function qa(t, e) { vn(t, e), vn(t + "Capture", e); }
    function vn(t, e) { for (vi[t] = e, t = 0; t < e.length; t++)
        gi.add(e[t]); }
    var D = RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"), dt = {}, ht = {};
    function zt(t) { return Zn.call(ht, t) ? !0 : Zn.call(dt, t) ? !1 : D.test(t) ? ht[t] = !0 : (dt[t] = !0, !1); }
    var ot = !1;
    function Ne() { var t = ot; return ot = !1, t; }
    function Ge(t, e, a) { if (zt(e))
        if (a === null)
            t.removeAttribute(e);
        else {
            switch (typeof a) {
                case "undefined":
                case "function":
                case "symbol":
                    t.removeAttribute(e);
                    return;
                case "boolean":
                    var n = e.toLowerCase().slice(0, 5);
                    if (n !== "data-" && n !== "aria-") {
                        t.removeAttribute(e);
                        return;
                    }
            }
            t.setAttribute(e, a);
        } }
    function Pe(t, e, a) { if (a === null)
        t.removeAttribute(e);
    else {
        switch (typeof a) {
            case "undefined":
            case "function":
            case "symbol":
            case "boolean":
                t.removeAttribute(e);
                return;
        }
        t.setAttribute(e, a);
    } }
    function Be(t, e, a, n) { if (n === null)
        t.removeAttribute(a);
    else {
        switch (typeof n) {
            case "undefined":
            case "function":
            case "symbol":
            case "boolean":
                t.removeAttribute(a);
                return;
        }
        t.setAttributeNS(e, a, n);
    } }
    function $t(t) { switch (typeof t) {
        case "bigint":
        case "boolean":
        case "number":
        case "string":
        case "undefined": return t;
        case "object": return t;
        default: return "";
    } }
    function Ea(t) { var e = t.type; return (t = t.nodeName) && t.toLowerCase() === "input" && (e === "checkbox" || e === "radio"); }
    function zn(t, e, a) { var n = Object.getOwnPropertyDescriptor(t.constructor.prototype, e); if (!t.hasOwnProperty(e) && typeof n < "u" && typeof n.get == "function" && typeof n.set == "function") {
        var l = n.get, i = n.set;
        return Object.defineProperty(t, e, { configurable: !0, get: function () { return l.call(this); }, set: function (r) { a = "" + r, i.call(this, r); } }), Object.defineProperty(t, e, { enumerable: n.enumerable }), { getValue: function () { return a; }, setValue: function (r) { a = "" + r; }, stopTracking: function () { t._valueTracker = null, delete t[e]; } };
    } }
    function da(t) { if (!t._valueTracker) {
        var e = Ea(t) ? "checked" : "value";
        t._valueTracker = zn(t, e, "" + t[e]);
    } }
    function Ra(t) { if (!t)
        return !1; var e = t._valueTracker; if (!e)
        return !0; var a = e.getValue(), n = ""; return t && (n = Ea(t) ? t.checked ? "true" : "false" : t.value), t = n, t !== a ? (e.setValue(t), !0) : !1; }
    var Te = /[\n"\\]/g;
    function Bt(t) { return t.replace(Te, function (e) { return "\\" + e.charCodeAt(0).toString(16) + " "; }); }
    function Ya(t, e, a, n, l, i, r, h) { t.name = "", r != null && typeof r != "function" && typeof r != "symbol" && typeof r != "boolean" ? t.type = r : t.removeAttribute("type"), e != null ? r === "number" ? (e === 0 && t.value === "" || t.value != e) && (t.value = "" + $t(e)) : t.value !== "" + $t(e) && (t.value = "" + $t(e)) : r !== "submit" && r !== "reset" || t.removeAttribute("value"), e != null ? r === "number" && t.value == e ? qe(t, $t(t.value)) : qe(t, $t(e)) : a != null ? qe(t, $t(a)) : n != null && t.removeAttribute("value"), l == null && i != null && (t.defaultChecked = !!i), l != null && (t.checked = l && typeof l != "function" && typeof l != "symbol"), h != null && typeof h != "function" && typeof h != "symbol" && typeof h != "boolean" ? t.name = "" + $t(h) : t.removeAttribute("name"); }
    function Et(t, e, a, n, l, i, r, h) { if (i != null && typeof i != "function" && typeof i != "symbol" && typeof i != "boolean" && (t.type = i), e != null || a != null) {
        if (!(i !== "submit" && i !== "reset" || e != null)) {
            da(t);
            return;
        }
        a = a != null ? "" + $t(a) : "", e = e != null ? "" + $t(e) : a, h || e === t.value || (t.value = e), t.defaultValue = e;
    } n = n ?? l, n = typeof n != "function" && typeof n != "symbol" && !!n, t.checked = h ? t.checked : !!n, t.defaultChecked = !!n, r != null && typeof r != "function" && typeof r != "symbol" && typeof r != "boolean" && (t.name = r), da(t); }
    function qe(t, e) { t.defaultValue !== "" + e && (t.defaultValue = "" + e); }
    function De(t, e, a, n) { if (t = t.options, e) {
        e = {};
        for (var l = 0; l < a.length; l++)
            e["$" + a[l]] = !0;
        for (a = 0; a < t.length; a++)
            l = e.hasOwnProperty("$" + t[a].value), t[a].selected !== l && (t[a].selected = l), l && n && (t[a].defaultSelected = !0);
    }
    else {
        for (a = "" + $t(a), e = null, l = 0; l < t.length; l++) {
            if (t[l].value === a) {
                t[l].selected = !0, n && (t[l].defaultSelected = !0);
                return;
            }
            e !== null || t[l].disabled || (e = t[l]);
        }
        e !== null && (e.selected = !0);
    } }
    function Na(t, e, a) { if (e != null && (e = "" + $t(e), e !== t.value && (t.value = e), a == null)) {
        t.defaultValue !== e && (t.defaultValue = e);
        return;
    } t.defaultValue = a != null ? "" + $t(a) : ""; }
    function an(t, e, a, n) { if (e == null) {
        if (n != null) {
            if (a != null)
                throw Error(o(92));
            if (it(n)) {
                if (1 < n.length)
                    throw Error(o(93));
                n = n[0];
            }
            a = n;
        }
        a == null && (a = ""), e = a;
    } a = $t(e), t.defaultValue = a, n = t.textContent, n === a && n !== "" && n !== null && (t.value = n), da(t); }
    function nn(t, e) { if (e) {
        var a = t.firstChild;
        if (a && a === t.lastChild && a.nodeType === 3) {
            a.nodeValue = e;
            return;
        }
    } t.textContent = e; }
    var fl = new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));
    function Fn(t, e, a) { var n = e.indexOf("--") === 0; a == null || typeof a == "boolean" || a === "" ? n ? t.setProperty(e, "") : e === "float" ? t.cssFloat = "" : t[e] = "" : n ? t.setProperty(e, a) : typeof a != "number" || a === 0 || fl.has(e) ? e === "float" ? t.cssFloat = a : t[e] = ("" + a).trim() : t[e] = a + "px"; }
    function Nu(t, e, a) { if (e != null && typeof e != "object")
        throw Error(o(62)); if (t = t.style, a != null) {
        for (var n in a)
            !a.hasOwnProperty(n) || e != null && e.hasOwnProperty(n) || (n.indexOf("--") === 0 ? t.setProperty(n, "") : n === "float" ? t.cssFloat = "" : t[n] = "", ot = !0);
        for (var l in e)
            n = e[l], e.hasOwnProperty(l) && a[l] !== n && (Fn(t, l, n), ot = !0);
    }
    else
        for (var i in e)
            e.hasOwnProperty(i) && Fn(t, i, e[i]); }
    function Kl(t) { if (t.indexOf("-") === -1)
        return !1; switch (t) {
        case "annotation-xml":
        case "color-profile":
        case "font-face":
        case "font-face-src":
        case "font-face-uri":
        case "font-face-format":
        case "font-face-name":
        case "missing-glyph": return !1;
        default: return !0;
    } }
    var nc = new Map([["acceptCharset", "accept-charset"], ["htmlFor", "for"], ["httpEquiv", "http-equiv"], ["crossOrigin", "crossorigin"], ["accentHeight", "accent-height"], ["alignmentBaseline", "alignment-baseline"], ["arabicForm", "arabic-form"], ["baselineShift", "baseline-shift"], ["capHeight", "cap-height"], ["clipPath", "clip-path"], ["clipRule", "clip-rule"], ["colorInterpolation", "color-interpolation"], ["colorInterpolationFilters", "color-interpolation-filters"], ["colorProfile", "color-profile"], ["colorRendering", "color-rendering"], ["dominantBaseline", "dominant-baseline"], ["enableBackground", "enable-background"], ["fillOpacity", "fill-opacity"], ["fillRule", "fill-rule"], ["floodColor", "flood-color"], ["floodOpacity", "flood-opacity"], ["fontFamily", "font-family"], ["fontSize", "font-size"], ["fontSizeAdjust", "font-size-adjust"], ["fontStretch", "font-stretch"], ["fontStyle", "font-style"], ["fontVariant", "font-variant"], ["fontWeight", "font-weight"], ["glyphName", "glyph-name"], ["glyphOrientationHorizontal", "glyph-orientation-horizontal"], ["glyphOrientationVertical", "glyph-orientation-vertical"], ["horizAdvX", "horiz-adv-x"], ["horizOriginX", "horiz-origin-x"], ["imageRendering", "image-rendering"], ["letterSpacing", "letter-spacing"], ["lightingColor", "lighting-color"], ["markerEnd", "marker-end"], ["markerMid", "marker-mid"], ["markerStart", "marker-start"], ["maskType", "mask-type"], ["overlinePosition", "overline-position"], ["overlineThickness", "overline-thickness"], ["paintOrder", "paint-order"], ["panose-1", "panose-1"], ["pointerEvents", "pointer-events"], ["renderingIntent", "rendering-intent"], ["shapeRendering", "shape-rendering"], ["stopColor", "stop-color"], ["stopOpacity", "stop-opacity"], ["strikethroughPosition", "strikethrough-position"], ["strikethroughThickness", "strikethrough-thickness"], ["strokeDasharray", "stroke-dasharray"], ["strokeDashoffset", "stroke-dashoffset"], ["strokeLinecap", "stroke-linecap"], ["strokeLinejoin", "stroke-linejoin"], ["strokeMiterlimit", "stroke-miterlimit"], ["strokeOpacity", "stroke-opacity"], ["strokeWidth", "stroke-width"], ["textAnchor", "text-anchor"], ["textDecoration", "text-decoration"], ["textRendering", "text-rendering"], ["transformOrigin", "transform-origin"], ["underlinePosition", "underline-position"], ["underlineThickness", "underline-thickness"], ["unicodeBidi", "unicode-bidi"], ["unicodeRange", "unicode-range"], ["unitsPerEm", "units-per-em"], ["vAlphabetic", "v-alphabetic"], ["vHanging", "v-hanging"], ["vIdeographic", "v-ideographic"], ["vMathematical", "v-mathematical"], ["vectorEffect", "vector-effect"], ["vertAdvY", "vert-adv-y"], ["vertOriginX", "vert-origin-x"], ["vertOriginY", "vert-origin-y"], ["wordSpacing", "word-spacing"], ["writingMode", "writing-mode"], ["xmlnsXlink", "xmlns:xlink"], ["xHeight", "x-height"]]), Es = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
    function dl(t) { return Es.test("" + t) ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')" : t; }
    function ja() { }
    var lc = null;
    function ic(t) { return t = t.target || t.srcElement || window, t.correspondingUseElement && (t = t.correspondingUseElement), t.nodeType === 3 ? t.parentNode : t; }
    var bi = null, Ei = null;
    function ld(t) { var e = ba(t); if (e && (t = e.stateNode)) {
        var a = t[Oe] || null;
        t: switch (t = e.stateNode, e.type) {
            case "input":
                if (Ya(t, a.value, a.defaultValue, a.defaultValue, a.checked, a.defaultChecked, a.type, a.name), e = a.name, a.type === "radio" && e != null) {
                    for (a = t; a.parentNode;)
                        a = a.parentNode;
                    for (a = a.querySelectorAll('input[name="' + Bt("" + e) + '"][type="radio"]'), e = 0; e < a.length; e++) {
                        var n = a[e];
                        if (n !== t && n.form === t.form) {
                            var l = n[Oe] || null;
                            if (!l)
                                throw Error(o(90));
                            Ya(n, l.value, l.defaultValue, l.defaultValue, l.checked, l.defaultChecked, l.type, l.name);
                        }
                    }
                    for (e = 0; e < a.length; e++)
                        n = a[e], n.form === t.form && Ra(n);
                }
                break t;
            case "textarea":
                Na(t, a.value, a.defaultValue);
                break t;
            case "select": e = a.value, e != null && De(t, !!a.multiple, e, !1);
        }
    } }
    var sc = !1;
    function id(t, e, a) { if (sc)
        return t(e, a); sc = !0; try {
        var n = t(e);
        return n;
    }
    finally {
        if (sc = !1, (bi !== null || Ei !== null) && (So(), bi && (e = bi, t = Ei, Ei = bi = null, ld(e), t)))
            for (e = 0; e < t.length; e++)
                ld(t[e]);
    } }
    function Ns(t, e) { var a = t.stateNode; if (a === null)
        return null; var n = a[Oe] || null; if (n === null)
        return null; a = n[e]; t: switch (e) {
        case "onClick":
        case "onClickCapture":
        case "onDoubleClick":
        case "onDoubleClickCapture":
        case "onMouseDown":
        case "onMouseDownCapture":
        case "onMouseMove":
        case "onMouseMoveCapture":
        case "onMouseUp":
        case "onMouseUpCapture":
        case "onMouseEnter":
            (n = !n.disabled) || (t = t.type, n = !(t === "button" || t === "input" || t === "select" || t === "textarea")), t = !n;
            break t;
        default: t = !1;
    } if (t)
        return null; if (a && typeof a != "function")
        throw Error(o(231, e, typeof a)); return a; }
    var Jn = !(typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u"), uc = !1;
    if (Jn)
        try {
            var Ss = {};
            Object.defineProperty(Ss, "passive", { get: function () { uc = !0; } }), window.addEventListener("test", Ss, Ss), window.removeEventListener("test", Ss, Ss);
        }
        catch {
            uc = !1;
        }
    var hl = null, oc = null, Su = null;
    function sd() { if (Su)
        return Su; var t, e = oc, a = e.length, n, l = "value" in hl ? hl.value : hl.textContent, i = l.length; for (t = 0; t < a && e[t] === l[t]; t++)
        ; var r = a - t; for (n = 1; n <= r && e[a - n] === l[i - n]; n++)
        ; return Su = l.slice(t, 1 < n ? 1 - n : void 0); }
    function Tu(t) { var e = t.keyCode; return "charCode" in t ? (t = t.charCode, t === 0 && e === 13 && (t = 13)) : t = e, t === 10 && (t = 13), 32 <= t || t === 13 ? t : 0; }
    function xu() { return !0; }
    function ud() { return !1; }
    function Sa(t) { function e(a, n, l, i, r) { this._reactName = a, this._targetInst = l, this.type = n, this.nativeEvent = i, this.target = r, this.currentTarget = null; for (var h in t)
        t.hasOwnProperty(h) && (a = t[h], this[h] = a ? a(i) : i[h]); return this.isDefaultPrevented = (i.defaultPrevented != null ? i.defaultPrevented : i.returnValue === !1) ? xu : ud, this.isPropagationStopped = ud, this; } return q(e.prototype, { preventDefault: function () { this.defaultPrevented = !0; var a = this.nativeEvent; a && (a.preventDefault ? a.preventDefault() : typeof a.returnValue != "unknown" && (a.returnValue = !1), this.isDefaultPrevented = xu); }, stopPropagation: function () { var a = this.nativeEvent; a && (a.stopPropagation ? a.stopPropagation() : typeof a.cancelBubble != "unknown" && (a.cancelBubble = !0), this.isPropagationStopped = xu); }, persist: function () { }, isPersistent: xu }), e; }
    var ml = { eventPhase: 0, bubbles: 0, cancelable: 0, timeStamp: function (t) { return t.timeStamp || Date.now(); }, defaultPrevented: 0, isTrusted: 0 }, Au = Sa(ml), Ts = q({}, ml, { view: 0, detail: 0 }), py = Sa(Ts), cc, rc, xs, wu = q({}, Ts, { screenX: 0, screenY: 0, clientX: 0, clientY: 0, pageX: 0, pageY: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, getModifierState: dc, button: 0, buttons: 0, relatedTarget: function (t) { return t.relatedTarget === void 0 ? t.fromElement === t.srcElement ? t.toElement : t.fromElement : t.relatedTarget; }, movementX: function (t) { return "movementX" in t ? t.movementX : (t !== xs && (xs && t.type === "mousemove" ? (cc = t.screenX - xs.screenX, rc = t.screenY - xs.screenY) : rc = cc = 0, xs = t), cc); }, movementY: function (t) { return "movementY" in t ? t.movementY : rc; } }), od = Sa(wu), gy = q({}, wu, { dataTransfer: 0 }), vy = Sa(gy), by = q({}, Ts, { relatedTarget: 0 }), fc = Sa(by), Ey = q({}, ml, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }), Ny = Sa(Ey), Sy = q({}, ml, { clipboardData: function (t) { return "clipboardData" in t ? t.clipboardData : window.clipboardData; } }), Ty = Sa(Sy), xy = q({}, ml, { data: 0 }), cd = Sa(xy), Ay = { Esc: "Escape", Spacebar: " ", Left: "ArrowLeft", Up: "ArrowUp", Right: "ArrowRight", Down: "ArrowDown", Del: "Delete", Win: "OS", Menu: "ContextMenu", Apps: "ContextMenu", Scroll: "ScrollLock", MozPrintableKey: "Unidentified" }, wy = { 8: "Backspace", 9: "Tab", 12: "Clear", 13: "Enter", 16: "Shift", 17: "Control", 18: "Alt", 19: "Pause", 20: "CapsLock", 27: "Escape", 32: " ", 33: "PageUp", 34: "PageDown", 35: "End", 36: "Home", 37: "ArrowLeft", 38: "ArrowUp", 39: "ArrowRight", 40: "ArrowDown", 45: "Insert", 46: "Delete", 112: "F1", 113: "F2", 114: "F3", 115: "F4", 116: "F5", 117: "F6", 118: "F7", 119: "F8", 120: "F9", 121: "F10", 122: "F11", 123: "F12", 144: "NumLock", 145: "ScrollLock", 224: "Meta" }, Oy = { Alt: "altKey", Control: "ctrlKey", Meta: "metaKey", Shift: "shiftKey" };
    function _y(t) { var e = this.nativeEvent; return e.getModifierState ? e.getModifierState(t) : (t = Oy[t]) ? !!e[t] : !1; }
    function dc() { return _y; }
    var Ry = q({}, Ts, { key: function (t) { if (t.key) {
            var e = Ay[t.key] || t.key;
            if (e !== "Unidentified")
                return e;
        } return t.type === "keypress" ? (t = Tu(t), t === 13 ? "Enter" : String.fromCharCode(t)) : t.type === "keydown" || t.type === "keyup" ? wy[t.keyCode] || "Unidentified" : ""; }, code: 0, location: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, repeat: 0, locale: 0, getModifierState: dc, charCode: function (t) { return t.type === "keypress" ? Tu(t) : 0; }, keyCode: function (t) { return t.type === "keydown" || t.type === "keyup" ? t.keyCode : 0; }, which: function (t) { return t.type === "keypress" ? Tu(t) : t.type === "keydown" || t.type === "keyup" ? t.keyCode : 0; } }), jy = Sa(Ry), My = q({}, wu, { pointerId: 0, width: 0, height: 0, pressure: 0, tangentialPressure: 0, tiltX: 0, tiltY: 0, twist: 0, pointerType: 0, isPrimary: 0 }), rd = Sa(My), zy = q({}, ml, { submitter: 0 }), Cy = Sa(zy), Dy = q({}, Ts, { touches: 0, targetTouches: 0, changedTouches: 0, altKey: 0, metaKey: 0, ctrlKey: 0, shiftKey: 0, getModifierState: dc }), Ly = Sa(Dy), Uy = q({}, ml, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }), Hy = Sa(Uy), Gy = q({}, wu, { deltaX: function (t) { return "deltaX" in t ? t.deltaX : "wheelDeltaX" in t ? -t.wheelDeltaX : 0; }, deltaY: function (t) { return "deltaY" in t ? t.deltaY : "wheelDeltaY" in t ? -t.wheelDeltaY : "wheelDelta" in t ? -t.wheelDelta : 0; }, deltaZ: 0, deltaMode: 0 }), By = Sa(Gy), qy = q({}, ml, { newState: 0, oldState: 0, source: 0 }), Yy = Sa(qy), ky = [9, 13, 27, 32], hc = Jn && "CompositionEvent" in window, As = null;
    Jn && "documentMode" in document && (As = document.documentMode);
    var Vy = Jn && "TextEvent" in window && !As, fd = Jn && (!hc || As && 8 < As && 11 >= As), dd = " ", hd = !1;
    function md(t, e) { switch (t) {
        case "keyup": return ky.indexOf(e.keyCode) !== -1;
        case "keydown": return e.keyCode !== 229;
        case "keypress":
        case "mousedown":
        case "focusout": return !0;
        default: return !1;
    } }
    function yd(t) { return t = t.detail, typeof t == "object" && "data" in t ? t.data : null; }
    var Ni = !1;
    function Xy(t, e) { switch (t) {
        case "compositionend": return yd(e);
        case "keypress": return e.which !== 32 ? null : (hd = !0, dd);
        case "textInput": return t = e.data, t === dd && hd ? null : t;
        default: return null;
    } }
    function Zy(t, e) { if (Ni)
        return t === "compositionend" || !hc && md(t, e) ? (t = sd(), Su = oc = hl = null, Ni = !1, t) : null; switch (t) {
        case "paste": return null;
        case "keypress":
            if (!(e.ctrlKey || e.altKey || e.metaKey) || e.ctrlKey && e.altKey) {
                if (e.char && 1 < e.char.length)
                    return e.char;
                if (e.which)
                    return String.fromCharCode(e.which);
            }
            return null;
        case "compositionend": return fd && e.locale !== "ko" ? null : e.data;
        default: return null;
    } }
    var Qy = { color: !0, date: !0, datetime: !0, "datetime-local": !0, email: !0, month: !0, number: !0, password: !0, range: !0, search: !0, tel: !0, text: !0, time: !0, url: !0, week: !0 };
    function pd(t) { var e = t && t.nodeName && t.nodeName.toLowerCase(); return e === "input" ? !!Qy[t.type] : e === "textarea"; }
    function gd(t, e, a, n) { bi ? Ei ? Ei.push(n) : Ei = [n] : bi = n, e = _o(e, "onChange"), 0 < e.length && (a = new Au("onChange", "change", null, a, n), t.push({ event: a, listeners: e })); }
    var ws = null, Os = null;
    function Iy(t) { lm(t, 0); }
    function Ou(t) { var e = Mn(t); if (Ra(e))
        return t; }
    function vd(t, e) { if (t === "change")
        return e; }
    var bd = !1;
    if (Jn) {
        var mc;
        if (Jn) {
            var yc = "oninput" in document;
            if (!yc) {
                var Ed = document.createElement("div");
                Ed.setAttribute("oninput", "return;"), yc = typeof Ed.oninput == "function";
            }
            mc = yc;
        }
        else
            mc = !1;
        bd = mc && (!document.documentMode || 9 < document.documentMode);
    }
    function Nd() { ws && (ws.detachEvent("onpropertychange", Sd), Os = ws = null); }
    function Sd(t) { if (t.propertyName === "value" && Ou(Os)) {
        var e = [];
        gd(e, Os, t, ic(t)), id(Iy, e);
    } }
    function Ky(t, e, a) { t === "focusin" ? (Nd(), ws = e, Os = a, ws.attachEvent("onpropertychange", Sd)) : t === "focusout" && Nd(); }
    function Fy(t) { if (t === "selectionchange" || t === "keyup" || t === "keydown")
        return Ou(Os); }
    function Jy(t, e) { if (t === "click")
        return Ou(e); }
    function Wy(t, e) { if (t === "input" || t === "change")
        return Ou(e); }
    function $y(t, e) { return t === e && (t !== 0 || 1 / t === 1 / e) || t !== t && e !== e; }
    var ka = typeof Object.is == "function" ? Object.is : $y;
    function _s(t, e) { if (ka(t, e))
        return !0; if (typeof t != "object" || t === null || typeof e != "object" || e === null)
        return !1; var a = Object.keys(t), n = Object.keys(e); if (a.length !== n.length)
        return !1; for (n = 0; n < a.length; n++) {
        var l = a[n];
        if (!Zn.call(e, l) || !ka(t[l], e[l]))
            return !1;
    } return !0; }
    function pc(t) { if (t = t || (typeof document < "u" ? document : void 0), typeof t > "u")
        return null; try {
        return t.activeElement || t.body;
    }
    catch {
        return t.body;
    } }
    function Td(t) { for (; t && t.firstChild;)
        t = t.firstChild; return t; }
    function xd(t, e) { var a = Td(t); t = 0; for (var n; a;) {
        if (a.nodeType === 3) {
            if (n = t + a.textContent.length, t <= e && n >= e)
                return { node: a, offset: e - t };
            t = n;
        }
        t: {
            for (; a;) {
                if (a.nextSibling) {
                    a = a.nextSibling;
                    break t;
                }
                a = a.parentNode;
            }
            a = void 0;
        }
        a = Td(a);
    } }
    function Ad(t, e) { return t && e ? t === e ? !0 : t && t.nodeType === 3 ? !1 : e && e.nodeType === 3 ? Ad(t, e.parentNode) : "contains" in t ? t.contains(e) : t.compareDocumentPosition ? !!(t.compareDocumentPosition(e) & 16) : !1 : !1; }
    function wd(t) { t = t != null && t.ownerDocument != null && t.ownerDocument.defaultView != null ? t.ownerDocument.defaultView : window; for (var e = pc(t.document); e instanceof t.HTMLIFrameElement;) {
        try {
            var a = typeof e.contentWindow.location.href == "string";
        }
        catch {
            a = !1;
        }
        if (a)
            t = e.contentWindow;
        else
            break;
        e = pc(t.document);
    } return e; }
    function gc(t) { var e = t && t.nodeName && t.nodeName.toLowerCase(); return e && (e === "input" && (t.type === "text" || t.type === "search" || t.type === "tel" || t.type === "url" || t.type === "password") || e === "textarea" || t.contentEditable === "true"); }
    var Py = Jn && "documentMode" in document && 11 >= document.documentMode, Si = null, vc = null, Rs = null, bc = !1;
    function Od(t, e, a) { var n = a.window === a ? a.document : a.nodeType === 9 ? a : a.ownerDocument; bc || Si == null || Si !== pc(n) || (n = Si, "selectionStart" in n && gc(n) ? n = { start: n.selectionStart, end: n.selectionEnd } : (n = (n.ownerDocument && n.ownerDocument.defaultView || window).getSelection(), n = { anchorNode: n.anchorNode, anchorOffset: n.anchorOffset, focusNode: n.focusNode, focusOffset: n.focusOffset }), Rs && _s(Rs, n) || (Rs = n, n = _o(vc, "onSelect"), 0 < n.length && (e = new Au("onSelect", "select", null, e, a), t.push({ event: e, listeners: n }), e.target = Si))); }
    function Fl(t, e) { var a = {}; return a[t.toLowerCase()] = e.toLowerCase(), a["Webkit" + t] = "webkit" + e, a["Moz" + t] = "moz" + e, a; }
    var Ti = { animationend: Fl("Animation", "AnimationEnd"), animationiteration: Fl("Animation", "AnimationIteration"), animationstart: Fl("Animation", "AnimationStart"), transitionrun: Fl("Transition", "TransitionRun"), transitionstart: Fl("Transition", "TransitionStart"), transitioncancel: Fl("Transition", "TransitionCancel"), transitionend: Fl("Transition", "TransitionEnd") }, Ec = {}, _d = {};
    Jn && (_d = document.createElement("div").style, "AnimationEvent" in window || (delete Ti.animationend.animation, delete Ti.animationiteration.animation, delete Ti.animationstart.animation), "TransitionEvent" in window || delete Ti.transitionend.transition);
    function Jl(t) { if (Ec[t])
        return Ec[t]; if (!Ti[t])
        return t; var e = Ti[t], a; for (a in e)
        if (e.hasOwnProperty(a) && a in _d)
            return Ec[t] = e[a]; return t; }
    var Rd = Jl("animationend"), jd = Jl("animationiteration"), Md = Jl("animationstart"), tp = Jl("transitionrun"), ep = Jl("transitionstart"), ap = Jl("transitioncancel"), zd = Jl("transitionend"), Cd = new Map, Nc = "abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error fullscreenChange fullscreenError gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
    Nc.push("scrollEnd");
    function bn(t, e) { Cd.set(t, e), qa(e, [t]); }
    var np = 0;
    function Wn(t, e) { if (t.name != null && t.name !== "auto")
        return t.name; if (e.autoName !== null)
        return e.autoName; t = Tn.identifierPrefix; var a = np++; return t = "_" + t + "t_" + a.toString(32) + "_", e.autoName = t; }
    function Dd(t) { if (t == null || typeof t == "string")
        return t; var e = null, a = Vi; if (a !== null)
        for (var n = 0; n < a.length; n++) {
            var l = t[a[n]];
            if (l != null) {
                if (l === "none")
                    return "none";
                e = e == null ? l : e + (" " + l);
            }
        } return e ?? t.default; }
    function $n(t, e) { return t = Dd(t), e = Dd(e), e == null ? t === "auto" ? null : t : e === "auto" ? null : e; }
    var _u = typeof reportError == "function" ? reportError : function (t) { if (typeof window == "object" && typeof window.ErrorEvent == "function") {
        var e = new window.ErrorEvent("error", { bubbles: !0, cancelable: !0, message: typeof t == "object" && t !== null && typeof t.message == "string" ? String(t.message) : String(t), error: t });
        if (!window.dispatchEvent(e))
            return;
    }
    else if (typeof process == "object" && typeof process.emit == "function") {
        process.emit("uncaughtException", t);
        return;
    } console.error(t); }, ln = [], xi = 0, Sc = 0;
    function Ru() { for (var t = xi, e = Sc = xi = 0; e < t;) {
        var a = ln[e];
        ln[e++] = null;
        var n = ln[e];
        ln[e++] = null;
        var l = ln[e];
        ln[e++] = null;
        var i = ln[e];
        if (ln[e++] = null, n !== null && l !== null) {
            var r = n.pending;
            r === null ? l.next = l : (l.next = r.next, r.next = l), n.pending = l;
        }
        i !== 0 && Ld(a, l, i);
    } }
    function ju(t, e, a, n) { ln[xi++] = t, ln[xi++] = e, ln[xi++] = a, ln[xi++] = n, Sc |= n, t.lanes |= n, t = t.alternate, t !== null && (t.lanes |= n); }
    function Tc(t, e, a, n) { return ju(t, e, a, n), Mu(t); }
    function Wl(t, e) { return ju(t, null, null, e), Mu(t); }
    function Ld(t, e, a) { t.lanes |= a; var n = t.alternate; n !== null && (n.lanes |= a); for (var l = !1, i = t.return; i !== null;)
        i.childLanes |= a, n = i.alternate, n !== null && (n.childLanes |= a), i.tag === 22 && (t = i.stateNode, t === null || t._visibility & 1 || (l = !0)), t = i, i = i.return; return t.tag === 3 ? (i = t.stateNode, l && e !== null && (l = 31 - Ke(a), t = i.hiddenUpdates, n = t[l], n === null ? t[l] = [e] : n.push(e), e.lane = a | 536870912), i) : null; }
    function Mu(t) { if (50 < Ws)
        throw Ws = 0, No = null, Error(o(185)); for (var e = t.return; e !== null;)
        t = e, e = t.return; return t.tag === 3 ? t.stateNode : null; }
    var Ai = {};
    function lp(t, e, a, n) { this.tag = t, this.key = a, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.refCleanup = this.ref = null, this.pendingProps = e, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = n, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null; }
    function Ma(t, e, a, n) { return new lp(t, e, a, n); }
    function xc(t) { return t = t.prototype, !(!t || !t.isReactComponent); }
    function Pn(t, e) { var a = t.alternate; return a === null ? (a = Ma(t.tag, e, t.key, t.mode), a.elementType = t.elementType, a.type = t.type, a.stateNode = t.stateNode, a.alternate = t, t.alternate = a) : (a.pendingProps = e, a.type = t.type, a.flags = 0, a.subtreeFlags = 0, a.deletions = null), a.flags = t.flags & 1206910976, a.childLanes = t.childLanes, a.lanes = t.lanes, a.child = t.child, a.memoizedProps = t.memoizedProps, a.memoizedState = t.memoizedState, a.updateQueue = t.updateQueue, e = t.dependencies, a.dependencies = e === null ? null : { lanes: e.lanes, firstContext: e.firstContext }, a.sibling = t.sibling, a.index = t.index, a.ref = t.ref, a.refCleanup = t.refCleanup, a; }
    function Ud(t, e) { t.flags &= 1206910978; var a = t.alternate; return a === null ? (t.childLanes = 0, t.lanes = e, t.child = null, t.subtreeFlags = 0, t.memoizedProps = null, t.memoizedState = null, t.updateQueue = null, t.dependencies = null, t.stateNode = null) : (t.childLanes = a.childLanes, t.lanes = a.lanes, t.child = a.child, t.subtreeFlags = 0, t.deletions = null, t.memoizedProps = a.memoizedProps, t.memoizedState = a.memoizedState, t.updateQueue = a.updateQueue, t.type = a.type, e = a.dependencies, t.dependencies = e === null ? null : { lanes: e.lanes, firstContext: e.firstContext }), t; }
    function zu(t, e, a, n, l, i) { var r = 0; if (n = t, typeof n == "function")
        xc(n) && (r = 1);
    else if (typeof n == "string")
        r = zg(t, a, Xt.current) ? 26 : t === "html" || t === "head" || t === "body" ? 27 : 5;
    else
        t: switch (n) {
            case Kt: return t = Ma(31, a, e, l), t.elementType = Kt, t.lanes = i, t;
            case re: return $l(a.children, l, i, e);
            case fe:
                r = 8, l |= 24;
                break;
            case Ze: return t = Ma(12, a, e, l | 2), t.elementType = Ze, t.lanes = i, t;
            case F: return t = Ma(13, a, e, l), t.elementType = F, t.lanes = i, t;
            case ft: return t = Ma(19, a, e, l), t.elementType = ft, t.lanes = i, t;
            case Dt:
            case Lt: return t = l | 32, t = Ma(30, a, e, t), t.elementType = Lt, t.lanes = i, t.stateNode = { autoName: null, paired: null, clones: null, ref: null }, t;
            default:
                if (typeof n == "object" && n !== null)
                    switch (n.$$typeof) {
                        case pt:
                            r = 10;
                            break t;
                        case Z:
                            r = 9;
                            break t;
                        case G:
                            r = 11;
                            break t;
                        case xt:
                            r = 14;
                            break t;
                        case Rt:
                            r = 16, n = null;
                            break t;
                    }
                r = 29, a = Error(o(130, t === null ? "null" : typeof t, "")), n = null;
        } return e = Ma(r, a, e, l), e.elementType = t, e.type = n, e.lanes = i, e; }
    function $l(t, e, a, n) { return t = Ma(7, t, n, e), t.lanes = a, t; }
    function Ac(t, e, a) { return t = Ma(6, t, null, e), t.lanes = a, t; }
    function Hd(t) { var e = Ma(18, null, null, 0); return e.stateNode = t, e; }
    function wc(t, e, a) { return e = Ma(4, t.children !== null ? t.children : [], t.key, e), e.lanes = a, e.stateNode = { containerInfo: t.containerInfo, pendingChildren: null, implementation: t.implementation }, e; }
    var Gd = new WeakMap;
    function sn(t, e) { if (typeof t == "object" && t !== null) {
        var a = Gd.get(t);
        return a !== void 0 ? a : (e = { value: t, source: e, stack: Zl(e) }, Gd.set(t, e), e);
    } return { value: t, source: e, stack: Zl(e) }; }
    var wi = [], Oi = 0, Cu = null, js = 0, un = [], on = 0, yl = null, Cn = 1, Dn = "";
    function tl(t, e) { wi[Oi++] = js, wi[Oi++] = Cu, Cu = t, js = e; }
    function Bd(t, e, a) { un[on++] = Cn, un[on++] = Dn, un[on++] = yl, yl = t; var n = Cn; t = Dn; var l = 32 - Ke(n) - 1; n &= ~(1 << l), a += 1; var i = 32 - Ke(e) + l; if (30 < i) {
        var r = l - l % 5;
        i = (n & (1 << r) - 1).toString(32), n >>= r, l -= r, Cn = 1 << 32 - Ke(e) + l | a << l | n, Dn = i + t;
    }
    else
        Cn = 1 << i | a << l | n, Dn = t; }
    function Du(t) { t.return !== null && (tl(t, 1), Bd(t, 1, 0)); }
    function Oc(t) { for (; t === Cu;)
        Cu = wi[--Oi], wi[Oi] = null, js = wi[--Oi], wi[Oi] = null; for (; t === yl;)
        yl = un[--on], un[on] = null, Dn = un[--on], un[on] = null, Cn = un[--on], un[on] = null; }
    function qd(t, e) { un[on++] = Cn, un[on++] = Dn, un[on++] = yl, Cn = e.id, Dn = e.overflow, yl = t; }
    var ta = null, pe = null, jt = !1, pl = null, cn = !1, _c = Error(o(519));
    function gl(t) { var e = Error(o(418, 1 < arguments.length && arguments[1] !== void 0 && arguments[1] ? "text" : "HTML", "")); throw Ms(sn(e, t)), _c; }
    function Yd(t) { var e = t.stateNode, a = t.type, n = t.memoizedProps; switch (e[he] = t, e[Oe] = n, a) {
        case "dialog":
            Gt("cancel", e), Gt("close", e);
            break;
        case "iframe":
        case "object":
        case "embed":
            Gt("load", e);
            break;
        case "video":
        case "audio":
            for (a = 0; a < Ps.length; a++)
                Gt(Ps[a], e);
            break;
        case "source":
            Gt("error", e);
            break;
        case "img":
        case "image":
        case "link":
            Gt("error", e), Gt("load", e);
            break;
        case "details":
            Gt("toggle", e);
            break;
        case "input":
            Gt("invalid", e), Et(e, n.value, n.defaultValue, n.checked, n.defaultChecked, n.type, n.name, !0);
            break;
        case "select":
            Gt("invalid", e);
            break;
        case "textarea": Gt("invalid", e), an(e, n.value, n.defaultValue, n.children);
    } a = n.children, typeof a != "string" && typeof a != "number" && typeof a != "bigint" || e.textContent === "" + a || n.suppressHydrationWarning === !0 || om(e.textContent, a) ? (n.popover != null && (Gt("beforetoggle", e), Gt("toggle", e)), n.onScroll != null && Gt("scroll", e), n.onScrollEnd != null && Gt("scrollend", e), n.onClick != null && (e.onclick = ja), e = !0) : e = !1, e || gl(t, !0); }
    function Lu(t) { for (ta = t.return; ta;)
        switch (ta.tag) {
            case 5:
            case 31:
            case 13:
                cn = !1;
                return;
            case 27:
            case 3:
                cn = !0;
                return;
            default: ta = ta.return;
        } }
    function _i(t) { if (t !== ta)
        return !1; if (!jt)
        return Lu(t), jt = !0, !1; var e = t.tag, a; if ((a = e !== 3 && e !== 27) && ((a = e === 5) && (a = t.type, a = !(a !== "form" && a !== "button") || lf(t.type, t.memoizedProps)), a = !a), a && pe && gl(t), Lu(t), e === 13) {
        if (t = t.memoizedState, t = t !== null ? t.dehydrated : null, !t)
            throw Error(o(317));
        pe = Om(t);
    }
    else if (e === 31) {
        if (t = t.memoizedState, t = t !== null ? t.dehydrated : null, !t)
            throw Error(o(317));
        pe = Om(t);
    }
    else
        e === 27 ? (e = pe, Cl(t.type) ? (t = mf, mf = null, pe = t) : pe = e) : pe = ta ? fn(t.stateNode.nextSibling) : null; return !0; }
    function Pl() { pe = ta = null, jt = !1; }
    function Rc() { var t = pl; return t !== null && (Da === null ? Da = t : Da.push.apply(Da, t), pl = null), t; }
    function Ms(t) { pl === null ? pl = [t] : pl.push(t); }
    var jc = vt(null), ti = null, el = null;
    function vl(t, e, a) { Y(jc, e._currentValue), e._currentValue = a; }
    function al(t) { t._currentValue = jc.current, J(jc); }
    function Uu(t, e, a) { for (; t !== null;) {
        var n = t.alternate;
        if ((t.childLanes & e) !== e ? (t.childLanes |= e, n !== null && (n.childLanes |= e)) : n !== null && (n.childLanes & e) !== e && (n.childLanes |= e), t === a)
            break;
        t = t.return;
    } }
    function Mc(t, e, a, n) { var l = t.child; for (l !== null && (l.return = t); l !== null;) {
        var i = l.dependencies;
        if (i !== null) {
            var r = l.child;
            i = i.firstContext;
            t: for (; i !== null;) {
                var h = i;
                i = l;
                for (var p = 0; p < e.length; p++)
                    if (h.context === e[p]) {
                        i.lanes |= a, h = i.alternate, h !== null && (h.lanes |= a), Uu(i.return, a, t), n || (r = null);
                        break t;
                    }
                i = h.next;
            }
        }
        else if (l.tag === 18) {
            if (r = l.return, r === null)
                throw Error(o(341));
            r.lanes |= a, i = r.alternate, i !== null && (i.lanes |= a), Uu(r, a, t), r = null;
        }
        else
            l.tag === 13 && l.memoizedState !== null && l.memoizedState.dehydrated === null ? (l.lanes |= a, r = l.alternate, r !== null && (r.lanes |= a), Uu(l.return, a, t), r = l.child, r = r !== null ? r.sibling : null) : r = l.child;
        if (r !== null)
            r.return = l;
        else
            for (r = l; r !== null;) {
                if (r === t) {
                    r = null;
                    break;
                }
                if (l = r.sibling, l !== null) {
                    l.return = r.return, r = l;
                    break;
                }
                r = r.return;
            }
        l = r;
    } }
    function ei(t, e, a, n) { t = null; for (var l = e, i = !1; l !== null;) {
        if (!i) {
            if ((l.flags & 524288) !== 0)
                i = !0;
            else if ((l.flags & 262144) !== 0)
                break;
        }
        if (l.tag === 10) {
            var r = l.alternate;
            if (r === null)
                throw Error(o(387));
            if (r = r.memoizedProps, r !== null) {
                var h = l.type;
                ka(l.pendingProps.value, r.value) || (t !== null ? t.push(h) : t = [h]);
            }
        }
        else if (l === Ae.current) {
            if (r = l.alternate, r === null)
                throw Error(o(387));
            r.memoizedState.memoizedState !== l.memoizedState.memoizedState && (t !== null ? t.push(Pi) : t = [Pi]);
        }
        l = l.return;
    } return t !== null && Mc(e, t, a, n), e.flags |= 262144, t !== null; }
    function Hu(t) { for (t = t.firstContext; t !== null;) {
        if (!ka(t.context._currentValue, t.memoizedValue))
            return !0;
        t = t.next;
    } return !1; }
    function ai(t) { ti = t, el = null, t = t.dependencies, t !== null && (t.firstContext = null); }
    function la(t) { return kd(ti, t); }
    function Gu(t, e) { return ti === null && ai(t), kd(t, e); }
    function kd(t, e) { var a = e._currentValue; if (e = { context: e, memoizedValue: a, next: null }, el === null) {
        if (t === null)
            throw Error(o(308));
        el = e, t.dependencies = { lanes: 0, firstContext: e }, t.flags |= 524288;
    }
    else
        el = el.next = e; return a; }
    var ip = typeof AbortController < "u" ? AbortController : function () { var t = [], e = this.signal = { aborted: !1, addEventListener: function (a, n) { t.push(n); } }; this.abort = function () { e.aborted = !0, t.forEach(function (a) { return a(); }); }; }, sp = s.unstable_scheduleCallback, up = s.unstable_NormalPriority, Ye = { $$typeof: pt, Consumer: null, Provider: null, _currentValue: null, _currentValue2: null, _threadCount: 0 };
    function zc() { return { controller: new ip, data: new Map, refCount: 0 }; }
    function zs(t) { t.refCount--, t.refCount === 0 && sp(up, function () { t.controller.abort(); }); }
    function Vd(t, e) { if ((t.pendingLanes & 4194048) !== 0) {
        var a = t.transitionTypes;
        for (a === null && (a = t.transitionTypes = []), t = 0; t < e.length; t++) {
            var n = e[t];
            a.indexOf(n) === -1 && a.push(n);
        }
    } }
    var Cs = null;
    function op(t) { var e = t.transitionTypes; return t.transitionTypes = null, e; }
    var Ds = null, Cc = 0, ni = 0, Ri = null;
    function cp(t, e) { if (Ds === null) {
        var a = Ds = [];
        Cc = 0, ni = Fr(), Ri = { status: "pending", value: void 0, then: function (n) { a.push(n); } };
    } return Cc++, e.then(Xd, Xd), e; }
    function Xd() { if (--Cc === 0 && (Cs = null, Ds !== null)) {
        Ri !== null && (Ri.status = "fulfilled");
        var t = Ds;
        Ds = null, ni = 0, Ri = null;
        for (var e = 0; e < t.length; e++)
            (0, t[e])();
    } }
    function rp(t, e) { var a = [], n = { status: "pending", value: null, reason: null, then: function (l) { a.push(l); } }; return t.then(function () { n.status = "fulfilled", n.value = e; for (var l = 0; l < a.length; l++)
        (0, a[l])(e); }, function (l) { for (n.status = "rejected", n.reason = l, l = 0; l < a.length; l++)
        (0, a[l])(void 0); }), n; }
    var Zd = V.S;
    V.S = function (t, e) { if (H0 = Ie(), typeof e == "object" && e !== null && typeof e.then == "function" && cp(t, e), Cs !== null)
        for (var a = Ii; a !== null;)
            Vd(a, Cs), a = a.next; if (a = t.types, a !== null) {
        for (var n = Ii; n !== null;)
            Vd(n, a), n = n.next;
        if (ni !== 0) {
            n = Cs, n === null && (n = Cs = []);
            for (var l = 0; l < a.length; l++) {
                var i = a[l];
                n.indexOf(i) === -1 && n.push(i);
            }
        }
    } Zd !== null && Zd(t, e); };
    var li = vt(null);
    function Dc() { var t = li.current; return t !== null ? t : me.pooledCache; }
    function Bu(t, e) { e === null ? Y(li, li.current) : Y(li, e.pool); }
    function Qd() { var t = Dc(); return t === null ? null : { parent: Ye._currentValue, pool: t }; }
    var ji = Error(o(460)), Lc = Error(o(474)), qu = Error(o(542)), Yu = { then: function () { } };
    function Id(t) { return t = t.status, t === "fulfilled" || t === "rejected"; }
    function Kd(t, e, a) { switch (a = t[a], a === void 0 ? t.push(e) : a !== e && (e.then(ja, ja), e = a), e.status) {
        case "fulfilled": return e.value;
        case "rejected": throw t = e.reason, Jd(t), t === void 0 && !("reason" in e) ? Error(o(600)) : t;
        default:
            if (typeof e.status == "string")
                e.then(ja, ja);
            else {
                if (t = me, t !== null && 100 < t.shellSuspendCounter)
                    throw Error(o(482));
                t = e, t.status = "pending", t.then(function (n) { if (e.status === "pending") {
                    var l = e;
                    l.status = "fulfilled", l.value = n;
                } }, function (n) { if (e.status === "pending") {
                    var l = e;
                    l.status = "rejected", l.reason = n;
                } });
            }
            switch (e.status) {
                case "fulfilled": return e.value;
                case "rejected": throw t = e.reason, Jd(t), t;
            }
            throw si = e, ji;
    } }
    function ii(t) { try {
        var e = t._init;
        return e(t._payload);
    }
    catch (a) {
        throw a !== null && typeof a == "object" && typeof a.then == "function" ? (si = a, ji) : a;
    } }
    var si = null;
    function Fd() { if (si === null)
        throw Error(o(459)); var t = si; return si = null, t; }
    function Jd(t) { if (t === ji || t === qu)
        throw Error(o(483)); }
    var Mi = null, Ls = 0;
    function ku(t) { var e = Ls; return Ls += 1, Mi === null && (Mi = []), Kd(Mi, t, e); }
    function bl(t, e) { e = e.props.ref, t.ref = e !== void 0 ? e : null; }
    function Vu(t, e) { throw e.$$typeof === $ ? Error(o(525)) : (t = Object.prototype.toString.call(e), Error(o(31, t === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : t))); }
    function Wd(t) { function e(N, v) { if (t) {
        var w = N.deletions;
        w === null ? (N.deletions = [v], N.flags |= 16) : w.push(v);
    } } function a(N, v) { if (!t)
        return null; for (; v !== null;)
        e(N, v), v = v.sibling; return null; } function n(N) { for (var v = new Map; N !== null;)
        N.key === null ? v.set(N.index, N) : v.set(N.key, N), N = N.sibling; return v; } function l(N, v) { return N = Pn(N, v), N.index = 0, N.sibling = null, N; } function i(N, v, w) { return N.index = w, t ? (w = N.alternate, w !== null ? (w = w.index, w < v ? (N.flags |= 2, v) : w) : (N.flags |= 134217730, v)) : (N.flags |= 1048576, v); } function r(N) { return t && N.alternate === null && (N.flags |= 134217730), N; } function h(N, v, w, U) { return v === null || v.tag !== 6 ? (v = Ac(w, N.mode, U), v.return = N, v) : (v = l(v, w), v.return = N, v); } function p(N, v, w, U) { var nt = w.type; return nt === re ? (N = j(N, v, w.props.children, U, w.key), bl(N, w), N) : v !== null && (v.elementType === nt || typeof nt == "object" && nt !== null && nt.$$typeof === Rt && ii(nt) === v.type) ? (v = l(v, w.props), bl(v, w), v.return = N, v) : (v = zu(w.type, w.key, w.props, null, N.mode, U), bl(v, w), v.return = N, v); } function S(N, v, w, U) { return v === null || v.tag !== 4 || v.stateNode.containerInfo !== w.containerInfo || v.stateNode.implementation !== w.implementation ? (v = wc(w, N.mode, U), v.return = N, v) : (v = l(v, w.children || []), v.return = N, v); } function j(N, v, w, U, nt) { return v === null || v.tag !== 7 ? (v = $l(w, N.mode, U, nt), v.return = N, v) : (v = l(v, w), v.return = N, v); } function H(N, v, w) { if (typeof v == "string" && v !== "" || typeof v == "number" || typeof v == "bigint")
        return v = Ac("" + v, N.mode, w), v.return = N, v; if (typeof v == "object" && v !== null) {
        switch (v.$$typeof) {
            case rt: return w = zu(v.type, v.key, v.props, null, N.mode, w), bl(w, v), w.return = N, w;
            case ye: return v = wc(v, N.mode, w), v.return = N, v;
            case Rt: return v = ii(v), H(N, v, w);
        }
        if (it(v) || He(v))
            return v = $l(v, N.mode, w, null), v.return = N, v;
        if (typeof v.then == "function")
            return H(N, ku(v), w);
        if (v.$$typeof === pt)
            return H(N, Gu(N, v), w);
        Vu(N, v);
    } return null; } function b(N, v, w, U) { var nt = v !== null ? v.key : null; if (typeof w == "string" && w !== "" || typeof w == "number" || typeof w == "bigint")
        return nt !== null ? null : h(N, v, "" + w, U); if (typeof w == "object" && w !== null) {
        switch (w.$$typeof) {
            case rt: return w.key === nt ? p(N, v, w, U) : null;
            case ye: return w.key === nt ? S(N, v, w, U) : null;
            case Rt: return w = ii(w), b(N, v, w, U);
        }
        if (it(w) || He(w))
            return nt !== null ? null : j(N, v, w, U, null);
        if (typeof w.then == "function")
            return b(N, v, ku(w), U);
        if (w.$$typeof === pt)
            return b(N, v, Gu(N, w), U);
        Vu(N, w);
    } return null; } function _(N, v, w, U, nt) { if (typeof U == "string" && U !== "" || typeof U == "number" || typeof U == "bigint")
        return N = N.get(w) || null, h(v, N, "" + U, nt); if (typeof U == "object" && U !== null) {
        switch (U.$$typeof) {
            case rt: return N = N.get(U.key === null ? w : U.key) || null, p(v, N, U, nt);
            case ye: return N = N.get(U.key === null ? w : U.key) || null, S(v, N, U, nt);
            case Rt: return U = ii(U), _(N, v, w, U, nt);
        }
        if (it(U) || He(U))
            return N = N.get(w) || null, j(v, N, U, nt, null);
        if (typeof U.then == "function")
            return _(N, v, w, ku(U), nt);
        if (U.$$typeof === pt)
            return _(N, v, w, Gu(v, U), nt);
        Vu(v, U);
    } return null; } function W(N, v, w, U) { for (var nt = null, Yt = null, yt = v, bt = v = 0, Xe = null; yt !== null && bt < w.length; bt++) {
        yt.index > bt ? (Xe = yt, yt = null) : Xe = yt.sibling;
        var kt = b(N, yt, w[bt], U);
        if (kt === null) {
            yt === null && (yt = Xe);
            break;
        }
        t && yt && kt.alternate === null && e(N, yt), v = i(kt, v, bt), Yt === null ? nt = kt : Yt.sibling = kt, Yt = kt, yt = Xe;
    } if (bt === w.length)
        return a(N, yt), jt && tl(N, bt), nt; if (yt === null) {
        for (; bt < w.length; bt++)
            yt = H(N, w[bt], U), yt !== null && (v = i(yt, v, bt), Yt === null ? nt = yt : Yt.sibling = yt, Yt = yt);
        return jt && tl(N, bt), nt;
    } for (yt = n(yt); bt < w.length; bt++)
        Xe = _(yt, N, bt, w[bt], U), Xe !== null && (t && (kt = Xe.alternate, kt !== null && yt.delete(kt.key === null ? bt : kt.key)), v = i(Xe, v, bt), Yt === null ? nt = Xe : Yt.sibling = Xe, Yt = Xe); return t && yt.forEach(function (Gl) { return e(N, Gl); }), jt && tl(N, bt), nt; } function ut(N, v, w, U) { if (w == null)
        throw Error(o(151)); for (var nt = null, Yt = null, yt = v, bt = v = 0, Xe = null, kt = w.next(); yt !== null && !kt.done; bt++, kt = w.next()) {
        yt.index > bt ? (Xe = yt, yt = null) : Xe = yt.sibling;
        var Gl = b(N, yt, kt.value, U);
        if (Gl === null) {
            yt === null && (yt = Xe);
            break;
        }
        t && yt && Gl.alternate === null && e(N, yt), v = i(Gl, v, bt), Yt === null ? nt = Gl : Yt.sibling = Gl, Yt = Gl, yt = Xe;
    } if (kt.done)
        return a(N, yt), jt && tl(N, bt), nt; if (yt === null) {
        for (; !kt.done; bt++, kt = w.next())
            kt = H(N, kt.value, U), kt !== null && (v = i(kt, v, bt), Yt === null ? nt = kt : Yt.sibling = kt, Yt = kt);
        return jt && tl(N, bt), nt;
    } for (yt = n(yt); !kt.done; bt++, kt = w.next())
        kt = _(yt, N, bt, kt.value, U), kt !== null && (t && (Xe = kt.alternate, Xe !== null && yt.delete(Xe.key === null ? bt : Xe.key)), v = i(kt, v, bt), Yt === null ? nt = kt : Yt.sibling = kt, Yt = kt); return t && yt.forEach(function (Xg) { return e(N, Xg); }), jt && tl(N, bt), nt; } function _t(N, v, w, U) { if (typeof w == "object" && w !== null && w.type === re && w.key === null && w.props.ref === void 0 && (w = w.props.children), typeof w == "object" && w !== null) {
        switch (w.$$typeof) {
            case rt:
                t: {
                    for (var nt = w.key; v !== null;) {
                        if (v.key === nt) {
                            if (nt = w.type, nt === re) {
                                if (v.tag === 7) {
                                    a(N, v.sibling), U = l(v, w.props.children), bl(U, w), U.return = N, N = U;
                                    break t;
                                }
                            }
                            else if (v.elementType === nt || typeof nt == "object" && nt !== null && nt.$$typeof === Rt && ii(nt) === v.type) {
                                a(N, v.sibling), U = l(v, w.props), bl(U, w), U.return = N, N = U;
                                break t;
                            }
                            a(N, v);
                            break;
                        }
                        else
                            e(N, v);
                        v = v.sibling;
                    }
                    w.type === re ? (U = $l(w.props.children, N.mode, U, w.key), bl(U, w), U.return = N, N = U) : (U = zu(w.type, w.key, w.props, null, N.mode, U), bl(U, w), U.return = N, N = U);
                }
                return r(N);
            case ye:
                t: {
                    for (nt = w.key; v !== null;) {
                        if (v.key === nt)
                            if (v.tag === 4 && v.stateNode.containerInfo === w.containerInfo && v.stateNode.implementation === w.implementation) {
                                a(N, v.sibling), U = l(v, w.children || []), U.return = N, N = U;
                                break t;
                            }
                            else {
                                a(N, v);
                                break;
                            }
                        else
                            e(N, v);
                        v = v.sibling;
                    }
                    U = wc(w, N.mode, U), U.return = N, N = U;
                }
                return r(N);
            case Rt: return w = ii(w), _t(N, v, w, U);
        }
        if (it(w))
            return W(N, v, w, U);
        if (He(w)) {
            if (nt = He(w), typeof nt != "function")
                throw Error(o(150));
            return w = nt.call(w), ut(N, v, w, U);
        }
        if (typeof w.then == "function")
            return _t(N, v, ku(w), U);
        if (w.$$typeof === pt)
            return _t(N, v, Gu(N, w), U);
        Vu(N, w);
    } return typeof w == "string" && w !== "" || typeof w == "number" || typeof w == "bigint" ? (w = "" + w, v !== null && v.tag === 6 ? (a(N, v.sibling), U = l(v, w), U.return = N, N = U) : (a(N, v), U = Ac(w, N.mode, U), U.return = N, N = U), r(N)) : a(N, v); } return function (N, v, w, U) { try {
        Ls = 0;
        var nt = _t(N, v, w, U);
        return Mi = null, nt;
    }
    catch (yt) {
        if (yt === ji || yt === qu)
            throw yt;
        var Yt = Ma(29, yt, null, N.mode);
        return Yt.lanes = U, Yt.return = N, Yt;
    } }; }
    var ui = Wd(!0), $d = Wd(!1), El = !1;
    function Uc(t) { t.updateQueue = { baseState: t.memoizedState, firstBaseUpdate: null, lastBaseUpdate: null, shared: { pending: null, lanes: 0, hiddenCallbacks: null }, callbacks: null }; }
    function Hc(t, e) { t = t.updateQueue, e.updateQueue === t && (e.updateQueue = { baseState: t.baseState, firstBaseUpdate: t.firstBaseUpdate, lastBaseUpdate: t.lastBaseUpdate, shared: t.shared, callbacks: null }); }
    function Nl(t) { return { lane: t, tag: 0, payload: null, callback: null, next: null }; }
    function Sl(t, e, a) { var n = t.updateQueue; if (n === null)
        return null; if (n = n.shared, (It & 2) !== 0) {
        var l = n.pending;
        return l === null ? e.next = e : (e.next = l.next, l.next = e), n.pending = e, e = Mu(t), Ld(t, null, a), e;
    } return ju(t, n, e, a), Mu(t); }
    function Us(t, e, a) { if (e = e.updateQueue, e !== null && (e = e.shared, (a & 4194048) !== 0)) {
        var n = e.lanes;
        n &= t.pendingLanes, a |= n, e.lanes = a, et(t, a);
    } }
    function Gc(t, e) { var a = t.updateQueue, n = t.alternate; if (n !== null && (n = n.updateQueue, a === n)) {
        var l = null, i = null;
        if (a = a.firstBaseUpdate, a !== null) {
            do {
                var r = { lane: a.lane, tag: a.tag, payload: a.payload, callback: null, next: null };
                i === null ? l = i = r : i = i.next = r, a = a.next;
            } while (a !== null);
            i === null ? l = i = e : i = i.next = e;
        }
        else
            l = i = e;
        a = { baseState: n.baseState, firstBaseUpdate: l, lastBaseUpdate: i, shared: n.shared, callbacks: n.callbacks }, t.updateQueue = a;
        return;
    } t = a.lastBaseUpdate, t === null ? a.firstBaseUpdate = e : t.next = e, a.lastBaseUpdate = e; }
    var Bc = !1;
    function Hs() { if (Bc) {
        var t = Ri;
        if (t !== null)
            throw t;
    } }
    function Gs(t, e, a, n) { Bc = !1; var l = t.updateQueue; El = !1; var i = l.firstBaseUpdate, r = l.lastBaseUpdate, h = l.shared.pending; if (h !== null) {
        l.shared.pending = null;
        var p = h, S = p.next;
        p.next = null, r === null ? i = S : r.next = S, r = p;
        var j = t.alternate;
        j !== null && (j = j.updateQueue, h = j.lastBaseUpdate, h !== r && (h === null ? j.firstBaseUpdate = S : h.next = S, j.lastBaseUpdate = p));
    } if (i !== null) {
        var H = l.baseState;
        r = 0, j = S = p = null, h = i;
        do {
            var b = h.lane & -536870913, _ = b !== h.lane;
            if (_ ? (qt & b) === b : (n & b) === b) {
                b !== 0 && b === ni && (Bc = !0), j !== null && (j = j.next = { lane: 0, tag: h.tag, payload: h.payload, callback: null, next: null });
                t: {
                    var W = t, ut = h;
                    b = e;
                    var _t = a;
                    switch (ut.tag) {
                        case 1:
                            if (W = ut.payload, typeof W == "function") {
                                H = W.call(_t, H, b);
                                break t;
                            }
                            H = W;
                            break t;
                        case 3: W.flags = W.flags & -65537 | 128;
                        case 0:
                            if (W = ut.payload, b = typeof W == "function" ? W.call(_t, H, b) : W, b == null)
                                break t;
                            H = q({}, H, b);
                            break t;
                        case 2: El = !0;
                    }
                }
                b = h.callback, b !== null && (t.flags |= 64, _ && (t.flags |= 8192), _ = l.callbacks, _ === null ? l.callbacks = [b] : _.push(b));
            }
            else
                _ = { lane: b, tag: h.tag, payload: h.payload, callback: h.callback, next: null }, j === null ? (S = j = _, p = H) : j = j.next = _, r |= b;
            if (h = h.next, h === null) {
                if (h = l.shared.pending, h === null)
                    break;
                _ = h, h = _.next, _.next = null, l.lastBaseUpdate = _, l.shared.pending = null;
            }
        } while (!0);
        j === null && (p = H), l.baseState = p, l.firstBaseUpdate = S, l.lastBaseUpdate = j, i === null && (l.shared.lanes = 0), Rl |= r, t.lanes = r, t.memoizedState = H;
    } }
    function Pd(t, e) { if (typeof t != "function")
        throw Error(o(191, t)); t.call(e); }
    function th(t, e) { var a = t.callbacks; if (a !== null)
        for (t.callbacks = null, t = 0; t < a.length; t++)
            Pd(a[t], e); }
    var Tl = vt(null), Xu = vt(0);
    function eh(t, e) { t = ul, Y(Xu, t), Y(Tl, e), ul = t | e.baseLanes; }
    function qc() { Y(Xu, ul), Y(Tl, Tl.current); }
    function Yc() { ul = Xu.current, J(Tl), J(Xu); }
    var ia = vt(null), ha = null;
    function xl(t) { var e = t.alternate; Y(sa, sa.current & 1), Y(ia, t), ha === null && (e === null || Tl.current !== null || e.memoizedState !== null) && (ha = t); }
    function kc(t) { Y(sa, sa.current), Y(ia, t), ha === null && (ha = t); }
    function ah(t) { t.tag === 22 ? (Y(sa, sa.current), Y(ia, t), ha === null && (ha = t)) : Al(); }
    function Al() { Y(sa, sa.current), Y(ia, ia.current); }
    function Va(t) { J(ia), ha === t && (ha = null), J(sa); }
    var sa = vt(0);
    function Bs(t, e) { Y(ia, ia.current), Y(sa, e); }
    function Vc(t) { J(sa), J(ia), ha === t && (ha = null); }
    function Zu(t) { for (var e = t; e !== null;) {
        if (e.tag === 13) {
            var a = e.memoizedState;
            if (a !== null && (a = a.dehydrated, a === null || df(a) || hf(a)))
                return e;
        }
        else if (e.tag === 19 && e.memoizedProps.revealOrder !== "independent") {
            if ((e.flags & 128) !== 0)
                return e;
        }
        else if (e.child !== null) {
            e.child.return = e, e = e.child;
            continue;
        }
        if (e === t)
            break;
        for (; e.sibling === null;) {
            if (e.return === null || e.return === t)
                return null;
            e = e.return;
        }
        e.sibling.return = e.return, e = e.sibling;
    } return null; }
    var nl = 0, Ot = null, se = null, ke = null, Qu = !1, zi = !1, oi = !1, Iu = 0, qs = 0, Ci = null, fp = 0;
    function Re() { throw Error(o(321)); }
    function Xc(t, e) { if (e === null)
        return !1; for (var a = 0; a < e.length && a < t.length; a++)
        if (!ka(t[a], e[a]))
            return !1; return !0; }
    function Zc(t, e, a, n, l, i) { return nl = i, Ot = e, e.memoizedState = null, e.updateQueue = null, e.lanes = 0, V.H = t === null || t.memoizedState === null ? Bh : qh, oi = !1, i = a(n, l), oi = !1, zi && (i = lh(e, a, n, l)), nh(t), i; }
    function nh(t) { V.H = to; var e = se !== null && se.next !== null; if (nl = 0, ke = se = Ot = null, Qu = !1, qs = 0, Ci = null, e)
        throw Error(o(300)); t === null || Ve || (t = t.dependencies, t !== null && Hu(t) && (Ve = !0)); }
    function lh(t, e, a, n) { Ot = t; var l = 0; do {
        if (zi && (Ci = null), qs = 0, zi = !1, 25 <= l)
            throw Error(o(301));
        if (l += 1, ke = se = null, t.updateQueue != null) {
            var i = t.updateQueue;
            i.lastEffect = null, i.events = null, i.stores = null, i.memoCache != null && (i.memoCache.index = 0);
        }
        V.H = bp, i = e(a, n);
    } while (zi); return i; }
    function dp() { var t = V.H, e = t.useState()[0]; return e = typeof e.then == "function" ? Ys(e) : e, t = t.useState()[0], (se !== null ? se.memoizedState : null) !== t && (Ot.flags |= 1024), e; }
    function Qc() { var t = Iu !== 0; return Iu = 0, t; }
    function Ic(t, e, a) { e.updateQueue = t.updateQueue, e.flags &= -2053, t.lanes &= ~a; }
    function Kc(t) { if (Qu) {
        for (t = t.memoizedState; t !== null;) {
            var e = t.queue;
            e !== null && (e.pending = null), t = t.next;
        }
        Qu = !1;
    } nl = 0, ke = se = Ot = null, zi = !1, qs = Iu = 0, Ci = null; }
    function Ta() { var t = { memoizedState: null, baseState: null, baseQueue: null, queue: null, next: null }; return ke === null ? Ot.memoizedState = ke = t : ke = ke.next = t, ke; }
    function Le() { if (se === null) {
        var t = Ot.alternate;
        t = t !== null ? t.memoizedState : null;
    }
    else
        t = se.next; var e = ke === null ? Ot.memoizedState : ke.next; if (e !== null)
        ke = e, se = t;
    else {
        if (t === null)
            throw Ot.alternate === null ? Error(o(467)) : Error(o(310));
        se = t, t = { memoizedState: se.memoizedState, baseState: se.baseState, baseQueue: se.baseQueue, queue: se.queue, next: null }, ke === null ? Ot.memoizedState = ke = t : ke = ke.next = t;
    } return ke; }
    function Ku() { return { lastEffect: null, events: null, stores: null, memoCache: null }; }
    function Ys(t) { var e = qs; return qs += 1, Ci === null && (Ci = []), t = Kd(Ci, t, e), e = Ot, (ke === null ? e.memoizedState : ke.next) === null && (e = e.alternate, V.H = e === null || e.memoizedState === null ? Bh : qh), t; }
    function Fu(t) { if (t !== null && typeof t == "object") {
        if (typeof t.then == "function")
            return Ys(t);
        if (t.$$typeof === Ue)
            return;
        if (t.$$typeof === pt)
            return la(t);
    } throw Error(o(438, String(t))); }
    function Fc(t) { var e = null, a = Ot.updateQueue; if (a !== null && (e = a.memoCache), e == null) {
        var n = Ot.alternate;
        n !== null && (n = n.updateQueue, n !== null && (n = n.memoCache, n != null && (e = { data: n.data.map(function (l) { return l.slice(); }), index: 0 })));
    } if (e == null && (e = { data: [], index: 0 }), a === null && (a = Ku(), Ot.updateQueue = a), a.memoCache = e, a = e.data[e.index], a === void 0)
        for (a = e.data[e.index] = Array(t), n = 0; n < t; n++)
            a[n] = de; return e.index++, a; }
    function ll(t, e) { return typeof e == "function" ? e(t) : e; }
    function Ju(t) { var e = Le(); return Jc(e, se, t); }
    function Jc(t, e, a) { var n = t.queue; if (n === null)
        throw Error(o(311)); n.lastRenderedReducer = a; var l = t.baseQueue, i = n.pending; if (i !== null) {
        if (l !== null) {
            var r = l.next;
            l.next = i.next, i.next = r;
        }
        e.baseQueue = l = i, n.pending = null;
    } if (i = t.baseState, l === null)
        t.memoizedState = i;
    else {
        e = l.next;
        var h = r = null, p = null, S = e, j = !1;
        do {
            var H = S.lane & -536870913;
            if (H !== S.lane ? (qt & H) === H : (nl & H) === H) {
                var b = S.revertLane;
                if (b === 0)
                    p !== null && (p = p.next = { lane: 0, revertLane: 0, gesture: null, action: S.action, hasEagerState: S.hasEagerState, eagerState: S.eagerState, next: null }), H === ni && (j = !0);
                else if ((nl & b) === b) {
                    S = S.next, b === ni && (j = !0);
                    continue;
                }
                else
                    H = { lane: 0, revertLane: S.revertLane, gesture: null, action: S.action, hasEagerState: S.hasEagerState, eagerState: S.eagerState, next: null }, p === null ? (h = p = H, r = i) : p = p.next = H, Ot.lanes |= b, Rl |= b;
                H = S.action, oi && a(i, H), i = S.hasEagerState ? S.eagerState : a(i, H);
            }
            else
                b = { lane: H, revertLane: S.revertLane, gesture: S.gesture, action: S.action, hasEagerState: S.hasEagerState, eagerState: S.eagerState, next: null }, p === null ? (h = p = b, r = i) : p = p.next = b, Ot.lanes |= H, Rl |= H;
            S = S.next;
        } while (S !== null && S !== e);
        if (p === null ? r = i : p.next = h, !ka(i, t.memoizedState) && (Ve = !0, j && (a = Ri, a !== null)))
            throw a;
        t.memoizedState = i, t.baseState = r, t.baseQueue = p, n.lastRenderedState = i;
    } return l === null && (n.lanes = 0), [t.memoizedState, n.dispatch]; }
    function Wc(t) { var e = Le(), a = e.queue; if (a === null)
        throw Error(o(311)); a.lastRenderedReducer = t; var n = a.dispatch, l = a.pending, i = e.memoizedState; if (l !== null) {
        a.pending = null;
        var r = l = l.next;
        do
            i = t(i, r.action), r = r.next;
        while (r !== l);
        ka(i, e.memoizedState) || (Ve = !0), e.memoizedState = i, e.baseQueue === null && (e.baseState = i), a.lastRenderedState = i;
    } return [i, n]; }
    function ih(t, e, a) { var n = Ot, l = Le(), i = jt; if (i) {
        if (a === void 0)
            throw Error(o(407));
        a = a();
    }
    else
        a = e(); var r = !ka((se || l).memoizedState, a); if (r && (l.memoizedState = a, Ve = !0), l = l.queue, tr(oh.bind(null, n, l, t), [t]), t = l.getSnapshot !== e || r || ke !== null && (ke.memoizedState.tag & 1) !== 0, Di(t ? 9 : 8, { destroy: void 0 }, uh.bind(null, n, l, a, e), null), t) {
        if (n.flags |= 2048, me === null)
            throw Error(o(349));
        i || (nl & 127) !== 0 || sh(n, e, a);
    } return a; }
    function sh(t, e, a) { t.flags |= 16384, t = { getSnapshot: e, value: a }, e = Ot.updateQueue, e === null ? (e = Ku(), Ot.updateQueue = e, e.stores = [t]) : (a = e.stores, a === null ? e.stores = [t] : a.push(t)); }
    function uh(t, e, a, n) { e.value = a, e.getSnapshot = n, ch(e) && rh(t); }
    function oh(t, e, a) { return a(function () { ch(e) && rh(t); }); }
    function ch(t) { var e = t.getSnapshot; t = t.value; try {
        var a = e();
        return !ka(t, a);
    }
    catch {
        return !0;
    } }
    function rh(t) { var e = Wl(t, 2); e !== null && La(e, t, 2); }
    function $c(t) { var e = Ta(); if (typeof t == "function") {
        var a = t;
        if (t = a(), oi) {
            Ga(!0);
            try {
                a();
            }
            finally {
                Ga(!1);
            }
        }
    } return e.memoizedState = e.baseState = t, e.queue = { pending: null, lanes: 0, dispatch: null, lastRenderedReducer: ll, lastRenderedState: t }, e; }
    function fh(t, e, a, n) { return t.baseState = a, Jc(t, se, typeof n == "function" ? n : ll); }
    function hp(t, e, a, n, l) { if (Pu(t))
        throw Error(o(485)); if (t = e.action, t !== null) {
        var i = { payload: l, action: t, next: null, isTransition: !0, status: "pending", value: null, reason: null, listeners: [], then: function (r) { i.listeners.push(r); } };
        V.T !== null ? a(!0) : i.isTransition = !1, n(i), a = e.pending, a === null ? (i.next = e.pending = i, dh(e, i)) : (i.next = a.next, e.pending = a.next = i);
    } }
    function dh(t, e) { var a = e.action, n = e.payload, l = t.state; if (e.isTransition) {
        var i = V.T, r = {};
        r.types = i !== null ? i.types : null, V.T = r;
        try {
            var h = a(l, n), p = V.S;
            p !== null && p(r, h), hh(t, e, h);
        }
        catch (S) {
            Pc(t, e, S);
        }
        finally {
            i !== null && r.types !== null && (i.types = r.types), V.T = i;
        }
    }
    else
        try {
            i = a(l, n), hh(t, e, i);
        }
        catch (S) {
            Pc(t, e, S);
        } }
    function hh(t, e, a) { a !== null && typeof a == "object" && typeof a.then == "function" ? a.then(function (n) { mh(t, e, n); }, function (n) { return Pc(t, e, n); }) : mh(t, e, a); }
    function mh(t, e, a) { e.status = "fulfilled", e.value = a, yh(e), t.state = a, e = t.pending, e !== null && (a = e.next, a === e ? t.pending = null : (a = a.next, e.next = a, dh(t, a))); }
    function Pc(t, e, a) { var n = t.pending; if (t.pending = null, n !== null) {
        n = n.next;
        do
            e.status = "rejected", e.reason = a, yh(e), e = e.next;
        while (e !== n);
    } t.action = null; }
    function yh(t) { t = t.listeners; for (var e = 0; e < t.length; e++)
        (0, t[e])(); }
    function ph(t, e) { return e; }
    function gh(t, e) { if (jt) {
        var a = me.formState;
        if (a !== null) {
            t: {
                var n = Ot;
                if (jt) {
                    if (pe) {
                        e: {
                            for (var l = pe, i = cn; l.nodeType !== 8;) {
                                if (!i) {
                                    l = null;
                                    break e;
                                }
                                if (l = fn(l.nextSibling), l === null) {
                                    l = null;
                                    break e;
                                }
                            }
                            i = l.data, l = i === "F!" || i === "F" ? l : null;
                        }
                        if (l) {
                            pe = fn(l.nextSibling), n = l.data === "F!";
                            break t;
                        }
                    }
                    gl(n);
                }
                n = !1;
            }
            n && (e = a[0]);
        }
    } return a = Ta(), a.memoizedState = a.baseState = e, n = { pending: null, lanes: 0, dispatch: null, lastRenderedReducer: ph, lastRenderedState: e }, a.queue = n, a = Uh.bind(null, Ot, n), n.dispatch = a, n = $c(!1), i = ir.bind(null, Ot, !1, n.queue), n = Ta(), l = { state: e, dispatch: null, action: t, pending: null }, n.queue = l, a = hp.bind(null, Ot, l, i, a), l.dispatch = a, n.memoizedState = t, [e, a, !1]; }
    function vh(t) { var e = Le(); return bh(e, se, t); }
    function bh(t, e, a) { if (e = Jc(t, e, ph)[0], t = Ju(ll)[0], typeof e == "object" && e !== null && typeof e.then == "function")
        try {
            var n = Ys(e);
        }
        catch (r) {
            throw r === ji ? qu : r;
        }
    else
        n = e; e = Le(); var l = e.queue, i = l.dispatch; return a !== e.memoizedState && (Ot.flags |= 2048, Di(9, { destroy: void 0 }, mp.bind(null, l, a), null)), [n, i, t]; }
    function mp(t, e) { t.action = e; }
    function Eh(t) { var e = Le(), a = se; if (a !== null)
        return bh(e, a, t); Le(), e = e.memoizedState, a = Le(); var n = a.queue.dispatch; return a.memoizedState = t, [e, n, !1]; }
    function Di(t, e, a, n) { return t = { tag: t, create: a, deps: n, inst: e, next: null }, e = Ot.updateQueue, e === null && (e = Ku(), Ot.updateQueue = e), a = e.lastEffect, a === null ? e.lastEffect = t.next = t : (n = a.next, a.next = t, t.next = n, e.lastEffect = t), t; }
    function Nh() { return Le().memoizedState; }
    function Wu(t, e, a, n) { var l = Ta(); Ot.flags |= t, l.memoizedState = Di(1 | e, { destroy: void 0 }, a, n === void 0 ? null : n); }
    function $u(t, e, a, n) { var l = Le(); n = n === void 0 ? null : n; var i = l.memoizedState.inst; se !== null && n !== null && Xc(n, se.memoizedState.deps) ? l.memoizedState = Di(e, i, a, n) : (Ot.flags |= t, l.memoizedState = Di(1 | e, i, a, n)); }
    function Sh(t, e) { Wu(8390656, 8, t, e); }
    function tr(t, e) { $u(2048, 8, t, e); }
    function yp(t) { Ot.flags |= 4; var e = Ot.updateQueue; if (e === null)
        e = Ku(), Ot.updateQueue = e, e.events = [t];
    else {
        var a = e.events;
        a === null ? e.events = [t] : a.push(t);
    } }
    function Th(t) { var e = Le().memoizedState; return yp({ ref: e, nextImpl: t }), function () { if ((It & 2) !== 0)
        throw Error(o(440)); return e.impl.apply(void 0, arguments); }; }
    function xh(t, e) { return $u(4, 2, t, e); }
    function Ah(t, e) { return $u(4, 4, t, e); }
    function wh(t, e) { if (typeof e == "function") {
        t = t();
        var a = e(t);
        return function () { typeof a == "function" ? a() : e(null); };
    } if (e != null)
        return t = t(), e.current = t, function () { e.current = null; }; }
    function Oh(t, e, a) { a = a != null ? a.concat([t]) : null, $u(4, 4, wh.bind(null, e, t), a); }
    function er() { }
    function _h(t, e) { var a = Le(); e = e === void 0 ? null : e; var n = a.memoizedState; return e !== null && Xc(e, n[1]) ? n[0] : (a.memoizedState = [t, e], t); }
    function Rh(t, e) { var a = Le(); e = e === void 0 ? null : e; var n = a.memoizedState; if (e !== null && Xc(e, n[1]))
        return n[0]; if (n = t(), oi) {
        Ga(!0);
        try {
            t();
        }
        finally {
            Ga(!1);
        }
    } return a.memoizedState = [n, e], n; }
    function ar(t, e, a) { return a === void 0 || (nl & 1073741824) !== 0 && (qt & 261930) === 0 ? t.memoizedState = e : (t.memoizedState = a, t = B0(), Ot.lanes |= t, Rl |= t, a); }
    function jh(t, e, a, n) { return ka(a, e) ? a : Tl.current !== null ? (t = ar(t, a, n), ka(t, e) || (Ve = !0), t) : (nl & 106) === 0 || (nl & 1073741824) !== 0 && (qt & 261930) === 0 ? (Ve = !0, t.memoizedState = a) : (t = B0(), Ot.lanes |= t, Rl |= t, e); }
    function Mh(t, e, a, n, l) { var i = lt.p; lt.p = i !== 0 && 8 > i ? i : 8; var r = V.T, h = {}; h.types = r !== null ? r.types : null, V.T = h, ir(t, !1, e, a); try {
        var p = l(), S = V.S;
        if (S !== null && S(h, p), p !== null && typeof p == "object" && typeof p.then == "function") {
            var j = rp(p, n);
            ks(t, e, j, Ia(t));
        }
        else
            ks(t, e, n, Ia(t));
    }
    catch (H) {
        ks(t, e, { then: function () { }, status: "rejected", reason: H }, Ia());
    }
    finally {
        lt.p = i, r !== null && h.types !== null && (r.types = h.types), V.T = r;
    } }
    function pp() { }
    function nr(t, e, a, n) { if (t.tag !== 5)
        throw Error(o(476)); var l = zh(t).queue; Mh(t, l, e, Vt, a === null ? pp : function () { return Ch(t), a(n); }); }
    function zh(t) { var e = t.memoizedState; if (e !== null)
        return e; e = { memoizedState: Vt, baseState: Vt, baseQueue: null, queue: { pending: null, lanes: 0, dispatch: null, lastRenderedReducer: ll, lastRenderedState: Vt }, next: null }; var a = {}; return e.next = { memoizedState: a, baseState: a, baseQueue: null, queue: { pending: null, lanes: 0, dispatch: null, lastRenderedReducer: ll, lastRenderedState: a }, next: null }, t.memoizedState = e, t = t.alternate, t !== null && (t.memoizedState = e), e; }
    function Ch(t) { var e = zh(t); e.next === null && (e = t.alternate.memoizedState), ks(t, e.next.queue, {}, Ia()); }
    function lr() { return la(Pi); }
    function Dh() { return Le().memoizedState; }
    function Lh() { return Le().memoizedState; }
    function gp(t) { for (var e = t.return; e !== null;) {
        switch (e.tag) {
            case 24:
            case 3:
                var a = Ia();
                t = Nl(a);
                var n = Sl(e, t, a);
                n !== null && (La(n, e, a), Us(n, e, a)), e = { cache: zc() }, t.payload = e;
                return;
        }
        e = e.return;
    } }
    function vp(t, e, a) { var n = Ia(); a = { lane: n, revertLane: 0, gesture: null, action: a, hasEagerState: !1, eagerState: null, next: null }, Pu(t) ? Hh(e, a) : (a = Tc(t, e, a, n), a !== null && (La(a, t, n), Gh(a, e, n))); }
    function Uh(t, e, a) { var n = Ia(); ks(t, e, a, n); }
    function ks(t, e, a, n) { var l = { lane: n, revertLane: 0, gesture: null, action: a, hasEagerState: !1, eagerState: null, next: null }; if (Pu(t))
        Hh(e, l);
    else {
        var i = t.alternate;
        if (t.lanes === 0 && (i === null || i.lanes === 0) && (i = e.lastRenderedReducer, i !== null))
            try {
                var r = e.lastRenderedState, h = i(r, a);
                if (l.hasEagerState = !0, l.eagerState = h, ka(h, r))
                    return ju(t, e, l, 0), me === null && Ru(), !1;
            }
            catch { }
        if (a = Tc(t, e, l, n), a !== null)
            return La(a, t, n), Gh(a, e, n), !0;
    } return !1; }
    function ir(t, e, a, n) { if (n = { lane: 2, revertLane: Fr(), gesture: null, action: n, hasEagerState: !1, eagerState: null, next: null }, Pu(t)) {
        if (e)
            throw Error(o(479));
    }
    else
        e = Tc(t, a, n, 2), e !== null && La(e, t, 2); }
    function Pu(t) { var e = t.alternate; return t === Ot || e !== null && e === Ot; }
    function Hh(t, e) { zi = Qu = !0; var a = t.pending; a === null ? e.next = e : (e.next = a.next, a.next = e), t.pending = e; }
    function Gh(t, e, a) { if ((a & 4194048) !== 0) {
        var n = e.lanes;
        n &= t.pendingLanes, a |= n, e.lanes = a, et(t, a);
    } }
    var to = { readContext: la, use: Fu, useCallback: Re, useContext: Re, useEffect: Re, useImperativeHandle: Re, useLayoutEffect: Re, useInsertionEffect: Re, useMemo: Re, useReducer: Re, useRef: Re, useState: Re, useDebugValue: Re, useDeferredValue: Re, useTransition: Re, useSyncExternalStore: Re, useId: Re, useHostTransitionStatus: Re, useFormState: Re, useActionState: Re, useOptimistic: Re, useMemoCache: Re, useCacheRefresh: Re, useEffectEvent: Re }, Bh = { readContext: la, use: Fu, useCallback: function (t, e) { return Ta().memoizedState = [t, e === void 0 ? null : e], t; }, useContext: la, useEffect: Sh, useImperativeHandle: function (t, e, a) { a = a != null ? a.concat([t]) : null, Wu(4194308, 4, wh.bind(null, e, t), a); }, useLayoutEffect: function (t, e) { return Wu(4194308, 4, t, e); }, useInsertionEffect: function (t, e) { Wu(4, 2, t, e); }, useMemo: function (t, e) { var a = Ta(); e = e === void 0 ? null : e; var n = t(); if (oi) {
            Ga(!0);
            try {
                t();
            }
            finally {
                Ga(!1);
            }
        } return a.memoizedState = [n, e], n; }, useReducer: function (t, e, a) { var n = Ta(); if (a !== void 0) {
            var l = a(e);
            if (oi) {
                Ga(!0);
                try {
                    a(e);
                }
                finally {
                    Ga(!1);
                }
            }
        }
        else
            l = e; return n.memoizedState = n.baseState = l, t = { pending: null, lanes: 0, dispatch: null, lastRenderedReducer: t, lastRenderedState: l }, n.queue = t, t = t.dispatch = vp.bind(null, Ot, t), [n.memoizedState, t]; }, useRef: function (t) { var e = Ta(); return t = { current: t }, e.memoizedState = t; }, useState: function (t) { t = $c(t); var e = t.queue, a = Uh.bind(null, Ot, e); return e.dispatch = a, [t.memoizedState, a]; }, useDebugValue: er, useDeferredValue: function (t, e) { var a = Ta(); return ar(a, t, e); }, useTransition: function () { var t = $c(!1); return t = Mh.bind(null, Ot, t.queue, !0, !1), Ta().memoizedState = t, [!1, t]; }, useSyncExternalStore: function (t, e, a) { var n = Ot, l = Ta(); if (jt) {
            if (a === void 0)
                throw Error(o(407));
            a = a();
        }
        else {
            if (a = e(), me === null)
                throw Error(o(349));
            (qt & 127) !== 0 || sh(n, e, a);
        } l.memoizedState = a; var i = { value: a, getSnapshot: e }; return l.queue = i, Sh(oh.bind(null, n, i, t), [t]), n.flags |= 2048, Di(9, { destroy: void 0 }, uh.bind(null, n, i, a, e), null), a; }, useId: function () { var t = Ta(), e = me.identifierPrefix; if (jt) {
            var a = Dn, n = Cn;
            a = (n & ~(1 << 32 - Ke(n) - 1)).toString(32) + a, e = "_" + e + "R_" + a, a = Iu++, 0 < a && (e += "H" + a.toString(32)), e += "_";
        }
        else
            a = fp++, e = "_" + e + "r_" + a.toString(32) + "_"; return t.memoizedState = e; }, useHostTransitionStatus: lr, useFormState: gh, useActionState: gh, useOptimistic: function (t) { var e = Ta(); e.memoizedState = e.baseState = t; var a = { pending: null, lanes: 0, dispatch: null, lastRenderedReducer: null, lastRenderedState: null }; return e.queue = a, e = ir.bind(null, Ot, !0, a), a.dispatch = e, [t, e]; }, useMemoCache: Fc, useCacheRefresh: function () { return Ta().memoizedState = gp.bind(null, Ot); }, useEffectEvent: function (t) { var e = Ta(), a = { impl: t }; return e.memoizedState = a, function () { if ((It & 2) !== 0)
            throw Error(o(440)); return a.impl.apply(void 0, arguments); }; } }, qh = { readContext: la, use: Fu, useCallback: _h, useContext: la, useEffect: tr, useImperativeHandle: Oh, useInsertionEffect: xh, useLayoutEffect: Ah, useMemo: Rh, useReducer: Ju, useRef: Nh, useState: function () { return Ju(ll); }, useDebugValue: er, useDeferredValue: function (t, e) { var a = Le(); return jh(a, se.memoizedState, t, e); }, useTransition: function () { var t = Ju(ll)[0], e = Le().memoizedState; return [typeof t == "boolean" ? t : Ys(t), e]; }, useSyncExternalStore: ih, useId: Dh, useHostTransitionStatus: lr, useFormState: vh, useActionState: vh, useOptimistic: function (t, e) { var a = Le(); return fh(a, se, t, e); }, useMemoCache: Fc, useCacheRefresh: Lh, useEffectEvent: Th }, bp = { readContext: la, use: Fu, useCallback: _h, useContext: la, useEffect: tr, useImperativeHandle: Oh, useInsertionEffect: xh, useLayoutEffect: Ah, useMemo: Rh, useReducer: Wc, useRef: Nh, useState: function () { return Wc(ll); }, useDebugValue: er, useDeferredValue: function (t, e) { var a = Le(); return se === null ? ar(a, t, e) : jh(a, se.memoizedState, t, e); }, useTransition: function () { var t = Wc(ll)[0], e = Le().memoizedState; return [typeof t == "boolean" ? t : Ys(t), e]; }, useSyncExternalStore: ih, useId: Dh, useHostTransitionStatus: lr, useFormState: Eh, useActionState: Eh, useOptimistic: function (t, e) { var a = Le(); return se !== null ? fh(a, se, t, e) : (a.baseState = t, [t, a.queue.dispatch]); }, useMemoCache: Fc, useCacheRefresh: Lh, useEffectEvent: Th };
    function sr(t, e, a, n) { e = t.memoizedState, a = a(n, e), a = a == null ? e : q({}, e, a), t.memoizedState = a, t.lanes === 0 && (t.updateQueue.baseState = a); }
    var ur = { enqueueSetState: function (t, e, a) { t = t._reactInternals; var n = Ia(), l = Nl(n); l.payload = e, a != null && (l.callback = a), e = Sl(t, l, n), e !== null && (La(e, t, n), Us(e, t, n)); }, enqueueReplaceState: function (t, e, a) { t = t._reactInternals; var n = Ia(), l = Nl(n); l.tag = 1, l.payload = e, a != null && (l.callback = a), e = Sl(t, l, n), e !== null && (La(e, t, n), Us(e, t, n)); }, enqueueForceUpdate: function (t, e) { t = t._reactInternals; var a = Ia(), n = Nl(a); n.tag = 2, e != null && (n.callback = e), e = Sl(t, n, a), e !== null && (La(e, t, a), Us(e, t, a)); } };
    function Yh(t, e, a, n, l, i, r) { return t = t.stateNode, typeof t.shouldComponentUpdate == "function" ? t.shouldComponentUpdate(n, i, r) : e.prototype && e.prototype.isPureReactComponent ? !_s(a, n) || !_s(l, i) : !0; }
    function kh(t, e, a, n) { t = e.state, typeof e.componentWillReceiveProps == "function" && e.componentWillReceiveProps(a, n), typeof e.UNSAFE_componentWillReceiveProps == "function" && e.UNSAFE_componentWillReceiveProps(a, n), e.state !== t && ur.enqueueReplaceState(e, e.state, null); }
    function ci(t, e) { var a = e; if ("ref" in e) {
        a = {};
        for (var n in e)
            n !== "ref" && (a[n] = e[n]);
    } if (t = t.defaultProps) {
        a === e && (a = q({}, a));
        for (var l in t)
            a[l] === void 0 && (a[l] = t[l]);
    } return a; }
    function Vh(t) { _u(t); }
    function Xh(t) { console.error(t); }
    function Zh(t) { _u(t); }
    function eo(t, e) { try {
        var a = t.onUncaughtError;
        a(e.value, { componentStack: e.stack });
    }
    catch (n) {
        setTimeout(function () { throw n; });
    } }
    function Qh(t, e, a) { try {
        var n = t.onCaughtError;
        n(a.value, { componentStack: a.stack, errorBoundary: e.tag === 1 ? e.stateNode : null });
    }
    catch (l) {
        setTimeout(function () { throw l; });
    } }
    function or(t, e, a) { return a = Nl(a), a.tag = 3, a.payload = { element: null }, a.callback = function () { eo(t, e); }, a; }
    function Ih(t) { return t = Nl(t), t.tag = 3, t; }
    function Kh(t, e, a, n) { var l = a.type.getDerivedStateFromError; if (typeof l == "function") {
        var i = n.value;
        t.payload = function () { return l(i); }, t.callback = function () { Qh(e, a, n); };
    } var r = a.stateNode; r !== null && typeof r.componentDidCatch == "function" && (t.callback = function () { Qh(e, a, n), typeof l != "function" && (jl === null ? jl = new Set([this]) : jl.add(this)); var h = n.stack; this.componentDidCatch(n.value, { componentStack: h !== null ? h : "" }); }); }
    function Ep(t, e, a, n, l) { if (a.flags |= 32768, n !== null && typeof n == "object" && typeof n.then == "function") {
        if (e = a.alternate, e !== null && ei(e, a, l, !0), a = ia.current, a !== null) {
            switch (a.tag) {
                case 31:
                case 13:
                case 19: return ha === null ? To() : a.alternate === null && je === 0 && (je = 3), a.flags &= -257, a.flags |= 65536, a.lanes = l, n === Yu ? a.flags |= 16384 : (e = a.updateQueue, e === null ? a.updateQueue = new Set([n]) : e.add(n), Qr(t, n, l)), !1;
                case 22: return a.flags |= 65536, n === Yu ? a.flags |= 16384 : (e = a.updateQueue, e === null ? (e = { transitions: null, markerInstances: null, retryQueue: new Set([n]) }, a.updateQueue = e) : (a = e.retryQueue, a === null ? e.retryQueue = new Set([n]) : a.add(n)), Qr(t, n, l)), !1;
            }
            throw Error(o(435, a.tag));
        }
        return Qr(t, n, l), To(), !1;
    } if (jt)
        return e = ia.current, e !== null ? ((e.flags & 65536) === 0 && (e.flags |= 256), e.flags |= 65536, e.lanes = l, n !== _c && (t = Error(o(422), { cause: n }), Ms(sn(t, a)))) : (n !== _c && (e = Error(o(423), { cause: n }), Ms(sn(e, a))), t = t.current.alternate, t.flags |= 65536, l &= -l, t.lanes |= l, n = sn(n, a), l = or(t.stateNode, n, l), Gc(t, l), je !== 4 && (je = 2)), !1; var i = Error(o(520), { cause: n }); if (i = sn(i, a), Js === null ? Js = [i] : Js.push(i), je !== 4 && (je = 2), e === null)
        return !0; n = sn(n, a), a = e; do {
        switch (a.tag) {
            case 3: return a.flags |= 65536, t = l & -l, a.lanes |= t, t = or(a.stateNode, n, t), Gc(a, t), !1;
            case 1:
                if (e = a.type, i = a.stateNode, (a.flags & 128) === 0 && (typeof e.getDerivedStateFromError == "function" || i !== null && typeof i.componentDidCatch == "function" && (jl === null || !jl.has(i))))
                    return a.flags |= 65536, l &= -l, a.lanes |= l, l = Ih(l), Kh(l, t, a, n), Gc(a, l), !1;
                break;
            case 22: if (a.memoizedState !== null)
                return a.flags |= 65536, !1;
        }
        a = a.return;
    } while (a !== null); return !1; }
    var cr = Error(o(461)), Ve = !1;
    function Je(t, e, a, n) { e.child = t === null ? $d(e, null, a, n) : ui(e, t.child, a, n); }
    function Fh(t, e, a, n, l) { a = a.render; var i = e.ref; if ("ref" in n) {
        var r = {};
        for (var h in n)
            h !== "ref" && (r[h] = n[h]);
    }
    else
        r = n; return ai(e), n = Zc(t, e, a, r, i, l), h = Qc(), t !== null && !Ve ? (Ic(t, e, l), il(t, e, l)) : (jt && h && Du(e), e.flags |= 1, Je(t, e, n, l), e.child); }
    function Jh(t, e, a, n, l) { if (t === null) {
        var i = a.type;
        return typeof i == "function" && !xc(i) && i.defaultProps === void 0 && a.compare === null ? (e.tag = 15, e.type = i, Wh(t, e, i, n, l)) : (t = zu(a.type, null, n, e, e.mode, l), t.ref = e.ref, t.return = e, e.child = t);
    } if (i = t.child, !gr(t, l)) {
        var r = i.memoizedProps;
        if (a = a.compare, a = a !== null ? a : _s, a(r, n) && t.ref === e.ref)
            return il(t, e, l);
    } return e.flags |= 1, t = Pn(i, n), t.ref = e.ref, t.return = e, e.child = t; }
    function Wh(t, e, a, n, l) { if (t !== null) {
        var i = t.memoizedProps;
        if (_s(i, n) && t.ref === e.ref)
            if (Ve = !1, e.pendingProps = n = i, gr(t, l))
                (t.flags & 131072) !== 0 && (Ve = !0);
            else
                return e.lanes = t.lanes, il(t, e, l);
    } return rr(t, e, a, n, l); }
    function $h(t, e, a, n) { var l = n.children, i = t !== null ? t.memoizedState : null; if (t === null && e.stateNode === null && (e.stateNode = { _visibility: 1, _pendingMarkers: null, _retryCache: null, _transitions: null }), n.mode === "hidden") {
        if ((e.flags & 128) !== 0) {
            if (i = i !== null ? i.baseLanes | a : a, t !== null) {
                for (n = e.child = t.child, l = 0; n !== null;)
                    l = l | n.lanes | n.childLanes, n = n.sibling;
                n = l & ~i;
            }
            else
                n = 0, e.child = null;
            return Ph(t, e, i, a, n);
        }
        if ((a & 536870912) !== 0)
            e.memoizedState = { baseLanes: 0, cachePool: null }, t !== null && Bu(e, i !== null ? i.cachePool : null), i !== null ? eh(e, i) : qc(), ah(e);
        else
            return n = e.lanes = 536870912, Ph(t, e, i !== null ? i.baseLanes | a : a, a, n);
    }
    else
        i !== null ? (Bu(e, i.cachePool), eh(e, i), Al(), e.memoizedState = null) : (t !== null && Bu(e, null), qc(), Al()); return Je(t, e, l, a), e.child; }
    function Vs(t, e) { return t !== null && t.tag === 22 || e.stateNode !== null || (e.stateNode = { _visibility: 1, _pendingMarkers: null, _retryCache: null, _transitions: null }), e.sibling; }
    function Ph(t, e, a, n, l) { var i = Dc(); return i = i === null ? null : { parent: Ye._currentValue, pool: i }, e.memoizedState = { baseLanes: a, cachePool: i }, t !== null && Bu(e, null), qc(), ah(e), t !== null && ei(t, e, n, !0), e.childLanes = l, null; }
    function ao(t, e) { return e = no({ mode: e.mode, children: e.children }, t.mode), e.ref = t.ref, t.child = e, e.return = t, e; }
    function t0(t, e, a) { return ui(e, t.child, null, a), t = ao(e, e.pendingProps), t.flags |= 2, Va(e), e.memoizedState = null, t; }
    function Np(t, e, a) { var n = e.pendingProps, l = (e.flags & 128) !== 0; if (e.flags &= -129, t === null) {
        if (jt) {
            if (n.mode === "hidden")
                return t = ao(e, n), e.lanes = 536870912, t.memoizedState = { baseLanes: 0, cachePool: null }, Vs(null, t);
            if (kc(e), (t = pe) ? (t = wm(t, cn), t = t !== null && t.data === "&" ? t : null, t !== null && (e.memoizedState = { dehydrated: t, treeContext: yl !== null ? { id: Cn, overflow: Dn } : null, retryLane: 536870912, hydrationErrors: null }, a = Hd(t), a.return = e, e.child = a, ta = e, pe = null)) : t = null, t === null)
                throw gl(e);
            return e.lanes = 536870912, null;
        }
        return ao(e, n);
    } var i = t.memoizedState; if (i !== null) {
        var r = i.dehydrated;
        if (kc(e), l)
            if (e.flags & 256)
                e.flags &= -257, e = t0(t, e, a);
            else if (e.memoizedState !== null)
                e.child = t.child, e.flags |= 128, e = null;
            else
                throw Error(o(558));
        else if (Ve || ei(t, e, a, !1), l = (a & t.childLanes) !== 0, Ve || l) {
            if (Tl.current === null) {
                if (n = me, n !== null && (r = st(n, a), r !== 0 && r !== i.retryLane))
                    throw i.retryLane = r, Wl(t, r), La(n, t, r), cr;
                To();
            }
            e = t0(t, e, a);
        }
        else
            t = i.treeContext, pe = fn(r.nextSibling), ta = e, jt = !0, pl = null, cn = !1, t !== null && qd(e, t), e = ao(e, n), e.flags |= 134221824;
        return e;
    } return t = Pn(t.child, { mode: n.mode, children: n.children }), t.ref = e.ref, e.child = t, t.return = e, t; }
    function Li(t, e) { var a = e.ref; if (a === null)
        t !== null && t.ref !== null && (e.flags |= 4194816);
    else {
        if (typeof a != "function" && typeof a != "object")
            throw Error(o(284));
        (t === null || t.ref !== a) && (e.flags |= 4194816);
    } }
    function rr(t, e, a, n, l) { return ai(e), a = Zc(t, e, a, n, void 0, l), n = Qc(), t !== null && !Ve ? (Ic(t, e, l), il(t, e, l)) : (jt && n && Du(e), e.flags |= 1, Je(t, e, a, l), e.child); }
    function e0(t, e, a, n, l, i) { return ai(e), e.updateQueue = null, a = lh(e, n, a, l), nh(t), n = Qc(), t !== null && !Ve ? (Ic(t, e, i), il(t, e, i)) : (jt && n && Du(e), e.flags |= 1, Je(t, e, a, i), e.child); }
    function a0(t, e, a, n, l) { if (ai(e), e.stateNode === null) {
        var i = Ai, r = a.contextType;
        typeof r == "object" && r !== null && (i = la(r)), i = new a(n, i), e.memoizedState = i.state !== null && i.state !== void 0 ? i.state : null, i.updater = ur, e.stateNode = i, i._reactInternals = e, i = e.stateNode, i.props = n, i.state = e.memoizedState, i.refs = {}, Uc(e), r = a.contextType, i.context = typeof r == "object" && r !== null ? la(r) : Ai, i.state = e.memoizedState, r = a.getDerivedStateFromProps, typeof r == "function" && (sr(e, a, r, n), i.state = e.memoizedState), typeof a.getDerivedStateFromProps == "function" || typeof i.getSnapshotBeforeUpdate == "function" || typeof i.UNSAFE_componentWillMount != "function" && typeof i.componentWillMount != "function" || (r = i.state, typeof i.componentWillMount == "function" && i.componentWillMount(), typeof i.UNSAFE_componentWillMount == "function" && i.UNSAFE_componentWillMount(), r !== i.state && ur.enqueueReplaceState(i, i.state, null), Gs(e, n, i, l), Hs(), i.state = e.memoizedState), typeof i.componentDidMount == "function" && (e.flags |= 4194308), n = !0;
    }
    else if (t === null) {
        i = e.stateNode;
        var h = e.memoizedProps, p = ci(a, h);
        i.props = p;
        var S = i.context, j = a.contextType;
        r = Ai, typeof j == "object" && j !== null && (r = la(j));
        var H = a.getDerivedStateFromProps;
        j = typeof H == "function" || typeof i.getSnapshotBeforeUpdate == "function", h = e.pendingProps !== h, j || typeof i.UNSAFE_componentWillReceiveProps != "function" && typeof i.componentWillReceiveProps != "function" || (h || S !== r) && kh(e, i, n, r), El = !1;
        var b = e.memoizedState;
        i.state = b, Gs(e, n, i, l), Hs(), S = e.memoizedState, h || b !== S || El ? (typeof H == "function" && (sr(e, a, H, n), S = e.memoizedState), (p = El || Yh(e, a, p, n, b, S, r)) ? (j || typeof i.UNSAFE_componentWillMount != "function" && typeof i.componentWillMount != "function" || (typeof i.componentWillMount == "function" && i.componentWillMount(), typeof i.UNSAFE_componentWillMount == "function" && i.UNSAFE_componentWillMount()), typeof i.componentDidMount == "function" && (e.flags |= 4194308)) : (typeof i.componentDidMount == "function" && (e.flags |= 4194308), e.memoizedProps = n, e.memoizedState = S), i.props = n, i.state = S, i.context = r, n = p) : (typeof i.componentDidMount == "function" && (e.flags |= 4194308), n = !1);
    }
    else {
        i = e.stateNode, Hc(t, e), r = e.memoizedProps, j = ci(a, r), i.props = j, H = e.pendingProps, b = i.context, S = a.contextType, p = Ai, typeof S == "object" && S !== null && (p = la(S)), h = a.getDerivedStateFromProps, (S = typeof h == "function" || typeof i.getSnapshotBeforeUpdate == "function") || typeof i.UNSAFE_componentWillReceiveProps != "function" && typeof i.componentWillReceiveProps != "function" || (r !== H || b !== p) && kh(e, i, n, p), El = !1, b = e.memoizedState, i.state = b, Gs(e, n, i, l), Hs();
        var _ = e.memoizedState;
        r !== H || b !== _ || El || t !== null && t.dependencies !== null && Hu(t.dependencies) ? (typeof h == "function" && (sr(e, a, h, n), _ = e.memoizedState), (j = El || Yh(e, a, j, n, b, _, p) || t !== null && t.dependencies !== null && Hu(t.dependencies)) ? (S || typeof i.UNSAFE_componentWillUpdate != "function" && typeof i.componentWillUpdate != "function" || (typeof i.componentWillUpdate == "function" && i.componentWillUpdate(n, _, p), typeof i.UNSAFE_componentWillUpdate == "function" && i.UNSAFE_componentWillUpdate(n, _, p)), typeof i.componentDidUpdate == "function" && (e.flags |= 4), typeof i.getSnapshotBeforeUpdate == "function" && (e.flags |= 1024)) : (typeof i.componentDidUpdate != "function" || r === t.memoizedProps && b === t.memoizedState || (e.flags |= 4), typeof i.getSnapshotBeforeUpdate != "function" || r === t.memoizedProps && b === t.memoizedState || (e.flags |= 1024), e.memoizedProps = n, e.memoizedState = _), i.props = n, i.state = _, i.context = p, n = j) : (typeof i.componentDidUpdate != "function" || r === t.memoizedProps && b === t.memoizedState || (e.flags |= 4), typeof i.getSnapshotBeforeUpdate != "function" || r === t.memoizedProps && b === t.memoizedState || (e.flags |= 1024), n = !1);
    } return i = n, Li(t, e), n = (e.flags & 128) !== 0, i || n ? (i = e.stateNode, a = n && typeof a.getDerivedStateFromError != "function" ? null : i.render(), e.flags |= 1, t !== null && n ? (e.child = ui(e, t.child, null, l), e.child = ui(e, null, a, l)) : Je(t, e, a, l), e.memoizedState = i.state, t = e.child) : t = il(t, e, l), t; }
    function n0(t, e, a, n) { return Pl(), e.flags |= 256, Je(t, e, a, n), e.child; }
    var fr = { dehydrated: null, treeContext: null, retryLane: 0, hydrationErrors: null };
    function dr(t) { return { baseLanes: t, cachePool: Qd() }; }
    function hr(t, e, a) { return t = t !== null ? t.childLanes & ~a : 0, e && (t |= Qa), t; }
    function l0(t, e, a) { var n = e.pendingProps, l = !1, i = (e.flags & 128) !== 0, r; if ((r = i) || (r = t !== null && t.memoizedState === null ? !1 : (sa.current & 2) !== 0), r && (l = !0, e.flags &= -129), r = (e.flags & 32) !== 0, e.flags &= -33, t === null) {
        if (jt) {
            if (l ? xl(e) : Al(), (t = pe) ? (t = wm(t, cn), t = t !== null && t.data !== "&" ? t : null, t !== null && (e.memoizedState = { dehydrated: t, treeContext: yl !== null ? { id: Cn, overflow: Dn } : null, retryLane: 536870912, hydrationErrors: null }, a = Hd(t), a.return = e, e.child = a, ta = e, pe = null)) : t = null, t === null)
                throw gl(e);
            return hf(t) ? e.lanes = 32 : e.lanes = 536870912, null;
        }
        return i = n.children, n = n.fallback, l ? (Al(), l = e.mode, i = no({ mode: "hidden", children: i }, l), n = $l(n, l, a, null), i.return = e, n.return = e, i.sibling = n, e.child = i, n = e.child, n.memoizedState = dr(a), n.childLanes = hr(t, r, a), e.memoizedState = fr, Vs(null, n)) : (xl(e), mr(e, i));
    } var h = t.memoizedState; if (h !== null) {
        var p = h.dehydrated;
        if (p !== null)
            return Sp(t, e, i, r, n, p, h, a);
    } return l ? (Al(), l = n.fallback, i = e.mode, h = t.child, p = h.sibling, n = Pn(h, { mode: "hidden", children: n.children }), n.subtreeFlags = h.subtreeFlags & 1206910976, p !== null ? l = Pn(p, l) : (l = $l(l, i, a, null), l.flags |= 2), l.return = e, n.return = e, n.sibling = l, e.child = n, Vs(null, n), n = e.child, l = t.child.memoizedState, l === null ? l = dr(a) : (i = l.cachePool, i !== null ? (h = Ye._currentValue, i = i.parent !== h ? { parent: h, pool: h } : i) : i = Qd(), l = { baseLanes: l.baseLanes | a, cachePool: i }), n.memoizedState = l, n.childLanes = hr(t, r, a), e.memoizedState = fr, Vs(t.child, n)) : (xl(e), a = t.child, t = a.sibling, a = Pn(a, { mode: "visible", children: n.children }), a.return = e, a.sibling = null, t !== null && (r = e.deletions, r === null ? (e.deletions = [t], e.flags |= 16) : r.push(t)), e.child = a, e.memoizedState = null, a); }
    function mr(t, e) { return e = no({ mode: "visible", children: e }, t.mode), e.return = t, t.child = e; }
    function no(t, e) { return t = Ma(22, t, null, e), t.lanes = 0, t; }
    function lo(t, e, a) { return ui(e, t.child, null, a), t = mr(e, e.pendingProps.children), t.flags |= 2, e.memoizedState = null, t; }
    function Sp(t, e, a, n, l, i, r, h) { if (a)
        return e.flags & 256 ? (xl(e), e.flags &= -257, lo(t, e, h)) : e.memoizedState !== null ? (Al(), e.child = t.child, e.flags |= 128, null) : (Al(), i = l.fallback, r = e.mode, l = no({ mode: "visible", children: l.children }, r), i = $l(i, r, h, null), i.flags |= 2, l.return = e, i.return = e, l.sibling = i, e.child = l, ui(e, t.child, null, h), l = e.child, l.memoizedState = dr(h), l.childLanes = hr(t, n, h), e.memoizedState = fr, Vs(null, l)); if (xl(e), hf(i)) {
        if (n = i.nextSibling && i.nextSibling.dataset, n)
            var p = n.dgst;
        return n = p, n !== "" && (l = Error(o(419)), l.stack = "", l.digest = n, Ms({ value: l, source: null, stack: null })), lo(t, e, h);
    } if (Ve || ei(t, e, h, !1), n = (h & t.childLanes) !== 0, Ve || n) {
        if (Tl.current !== null)
            return lo(t, e, h);
        if (n = me, n !== null && (l = st(n, h), l !== 0 && l !== r.retryLane))
            throw r.retryLane = l, Wl(t, l), La(n, t, l), cr;
        return df(i) || To(), lo(t, e, h);
    } return df(i) ? (e.flags |= 192, e.child = t.child, null) : (t = r.treeContext, pe = fn(i.nextSibling), ta = e, jt = !0, pl = null, cn = !1, t !== null && qd(e, t), e = mr(e, l.children), e.flags |= 134221824, e); }
    function i0(t, e, a) { t.lanes |= e; var n = t.alternate; n !== null && (n.lanes |= e), Uu(t.return, e, a); }
    function s0(t) { for (var e = null; t !== null;) {
        var a = t.alternate;
        a !== null && Zu(a) === null && (e = t), t = t.sibling;
    } return e; }
    function io(t, e, a, n, l, i) { var r = t.memoizedState; r === null ? t.memoizedState = { isBackwards: e, rendering: null, renderingStartTime: 0, last: n, tail: a, tailMode: l, treeForkCount: i } : (r.isBackwards = e, r.rendering = null, r.renderingStartTime = 0, r.last = n, r.tail = a, r.tailMode = l, r.treeForkCount = i); }
    function yr(t) { var e = t.child; for (t.child = null; e !== null;) {
        var a = e.sibling;
        e.sibling = t.child, t.child = e, e = a;
    } }
    function pr(t, e, a) { var n = e.pendingProps, l = n.revealOrder, i = n.tail; n = n.children; var r = sa.current; if (e.flags & 128)
        return Bs(e, r), null; var h = (r & 2) !== 0; if (h ? (r = r & 1 | 2, e.flags |= 128) : r &= 1, Bs(e, r), l === "backwards" && t !== null ? (yr(t), Je(t, e, n, a), yr(t)) : Je(t, e, n, a), n = jt ? js : 0, !h && t !== null && (t.flags & 128) !== 0)
        t: for (t = e.child; t !== null;) {
            if (t.tag === 13)
                t.memoizedState !== null && i0(t, a, e);
            else if (t.tag === 19)
                i0(t, a, e);
            else if (t.child !== null) {
                t.child.return = t, t = t.child;
                continue;
            }
            if (t === e)
                break t;
            for (; t.sibling === null;) {
                if (t.return === null || t.return === e)
                    break t;
                t = t.return;
            }
            t.sibling.return = t.return, t = t.sibling;
        } switch (l) {
        case "backwards":
            a = s0(e.child), a === null ? (l = e.child, e.child = null) : (l = a.sibling, a.sibling = null, yr(e)), io(e, !0, l, null, i, n);
            break;
        case "unstable_legacy-backwards":
            for (a = null, l = e.child, e.child = null; l !== null;) {
                if (t = l.alternate, t !== null && Zu(t) === null) {
                    e.child = l;
                    break;
                }
                t = l.sibling, l.sibling = a, a = l, l = t;
            }
            io(e, !0, a, null, i, n);
            break;
        case "together":
            io(e, !1, null, null, void 0, n);
            break;
        case "independent":
            e.memoizedState = null;
            break;
        default: a = s0(e.child), a === null ? (l = e.child, e.child = null) : (l = a.sibling, a.sibling = null), io(e, !1, l, a, i, n);
    } return e.child; }
    function u0(t, e, a) { var n = e.pendingProps; return vl(e, e.type, n.value), Je(t, e, n.children, a), e.child; }
    function il(t, e, a) { if (t !== null && (e.dependencies = t.dependencies), Rl |= e.lanes, (a & e.childLanes) === 0)
        if (t !== null) {
            if (ei(t, e, a, !1), (a & e.childLanes) === 0)
                return null;
        }
        else
            return null; if (t !== null && e.child !== t.child)
        throw Error(o(153)); if (e.child !== null) {
        for (t = e.child, a = Pn(t, t.pendingProps), e.child = a, a.return = e; t.sibling !== null;)
            t = t.sibling, a = a.sibling = Pn(t, t.pendingProps), a.return = e;
        a.sibling = null;
    } return e.child; }
    function gr(t, e) { return (t.lanes & e) !== 0 ? !0 : (t = t.dependencies, !!(t !== null && Hu(t))); }
    function Tp(t, e, a) { switch (e.tag) {
        case 3:
            Oa(e, e.stateNode.containerInfo), vl(e, Ye, t.memoizedState.cache), Pl();
            break;
        case 27:
        case 5:
            ca(e);
            break;
        case 4:
            Oa(e, e.stateNode.containerInfo);
            break;
        case 10:
            vl(e, e.type, e.memoizedProps.value);
            break;
        case 31:
            if (e.memoizedState !== null)
                return e.flags |= 128, kc(e), null;
            break;
        case 13:
            var n = e.memoizedState;
            if (n !== null) {
                if (n.dehydrated !== null)
                    return xl(e), e.flags |= 128, null;
                n = ei(t, e, a, !1);
                var l = e.child.childLanes;
                return n || (a & l) !== 0 ? l0(t, e, a) : (xl(e), t = il(t, e, a), t !== null ? t.sibling : null);
            }
            xl(e);
            break;
        case 19:
            if (e.flags & 128)
                return pr(t, e, a);
            if (l = (t.flags & 128) !== 0, n = (a & e.childLanes) !== 0, n || (ei(t, e, a, !1), n = (a & e.childLanes) !== 0), l) {
                if (n)
                    return pr(t, e, a);
                e.flags |= 128;
            }
            if (l = e.memoizedState, l !== null && (l.rendering = null, l.tail = null, l.lastEffect = null), Bs(e, sa.current), n)
                break;
            return null;
        case 22: return e.lanes = 0, $h(t, e, a, e.pendingProps);
        case 24: vl(e, Ye, t.memoizedState.cache);
    } return il(t, e, a); }
    function o0(t, e, a) { if (t !== null)
        if (t.memoizedProps !== e.pendingProps)
            Ve = !0;
        else {
            if (!gr(t, a) && (e.flags & 128) === 0)
                return Ve = !1, Tp(t, e, a);
            Ve = (t.flags & 131072) !== 0;
        }
    else
        Ve = !1, jt && (e.flags & 1048576) !== 0 && Bd(e, js, e.index); switch (e.lanes = 0, e.tag) {
        case 16:
            t: {
                var n = e.pendingProps;
                if (t = ii(e.elementType), e.type = t, typeof t == "function")
                    xc(t) ? (n = ci(t, n), e.tag = 1, e = a0(null, e, t, n, a)) : (e.tag = 0, e = rr(null, e, t, n, a));
                else {
                    if (t != null) {
                        var l = t.$$typeof;
                        if (l === G) {
                            e.tag = 11, e = Fh(null, e, t, n, a);
                            break t;
                        }
                        else if (l === xt) {
                            e.tag = 14, e = Jh(null, e, t, n, a);
                            break t;
                        }
                        else if (l === pt) {
                            e.tag = 10, e.type = t, e = u0(null, e, a);
                            break t;
                        }
                    }
                    throw e = On(t) || t, Error(o(306, e, ""));
                }
            }
            return e;
        case 0: return rr(t, e, e.type, e.pendingProps, a);
        case 1: return n = e.type, l = ci(n, e.pendingProps), a0(t, e, n, l, a);
        case 3:
            t: {
                if (Oa(e, e.stateNode.containerInfo), t === null)
                    throw Error(o(387));
                n = e.pendingProps;
                var i = e.memoizedState;
                l = i.element, Hc(t, e), Gs(e, n, null, a);
                var r = e.memoizedState;
                if (n = r.cache, vl(e, Ye, n), n !== i.cache && Mc(e, [Ye], a, !0), Hs(), n = r.element, i.isDehydrated)
                    if (i = { element: n, isDehydrated: !1, cache: r.cache }, e.updateQueue.baseState = i, e.memoizedState = i, e.flags & 256) {
                        e = n0(t, e, n, a);
                        break t;
                    }
                    else if (n !== l) {
                        l = sn(Error(o(424)), e), Ms(l), e = n0(t, e, n, a);
                        break t;
                    }
                    else
                        for (t = e.stateNode.containerInfo, t.nodeType === 9 ? t = t.body : t = t.nodeName === "HTML" ? t.ownerDocument.body : t, pe = fn(t.firstChild), ta = e, jt = !0, pl = null, cn = !0, a = $d(e, null, n, a), e.child = a; a;)
                            a.flags = a.flags & -3 | 134221824, a = a.sibling;
                else {
                    if (Pl(), n === l) {
                        e = il(t, e, a);
                        break t;
                    }
                    Je(t, e, n, a);
                }
                e = e.child;
            }
            return e;
        case 26: return Li(t, e), t === null ? (a = Cm(e.type, null, e.pendingProps, null)) ? e.memoizedState = a : jt || (e.stateNode = dm(e.type, e.pendingProps, Qe.current, e)) : e.memoizedState = Cm(e.type, t.memoizedProps, e.pendingProps, t.memoizedState), null;
        case 27: return ca(e), t === null && jt && (n = e.stateNode = Rm(e.type, e.pendingProps, Qe.current), ta = e, cn = !0, l = pe, Cl(e.type) ? (mf = l, pe = fn(n.firstChild)) : pe = l), Je(t, e, e.pendingProps.children, a), Li(t, e), t === null && (e.flags |= 4194304), e.child;
        case 5: return t === null && jt && ((l = n = pe) && (n = gg(n, e.type, e.pendingProps, cn), n !== null ? (e.stateNode = n, ta = e, pe = fn(n.firstChild), cn = !1, l = !0) : l = !1), l || gl(e)), ca(e), l = e.type, i = e.pendingProps, r = t !== null ? t.memoizedProps : null, n = i.children, lf(l, i) ? n = null : r !== null && lf(l, r) && (e.flags |= 32), e.memoizedState !== null && (l = Zc(t, e, dp, null, null, a), Pi._currentValue = l), Li(t, e), Je(t, e, n, a), e.child;
        case 6: return t === null && jt && ((t = a = pe) && (a = vg(a, e.pendingProps, cn), a !== null ? (e.stateNode = a, ta = e, pe = null, t = !0) : t = !1), t || gl(e)), null;
        case 13: return l0(t, e, a);
        case 4: return Oa(e, e.stateNode.containerInfo), n = e.pendingProps, t === null ? e.child = ui(e, null, n, a) : Je(t, e, n, a), e.child;
        case 11: return Fh(t, e, e.type, e.pendingProps, a);
        case 7: return n = e.pendingProps, Li(t, e), Je(t, e, n, a), e.child;
        case 8: return Je(t, e, e.pendingProps.children, a), e.child;
        case 12: return Je(t, e, e.pendingProps.children, a), e.child;
        case 10: return u0(t, e, a);
        case 9: return l = e.type._context, n = e.pendingProps.children, ai(e), l = la(l), n = n(l), e.flags |= 1, Je(t, e, n, a), e.child;
        case 14: return Jh(t, e, e.type, e.pendingProps, a);
        case 15: return Wh(t, e, e.type, e.pendingProps, a);
        case 19: return pr(t, e, a);
        case 31: return Np(t, e, a);
        case 22: return $h(t, e, a, e.pendingProps);
        case 24: return ai(e), n = la(Ye), t === null ? (l = Dc(), l === null && (l = me, i = zc(), l.pooledCache = i, i.refCount++, i !== null && (l.pooledCacheLanes |= a), l = i), e.memoizedState = { parent: n, cache: l }, Uc(e), vl(e, Ye, l)) : ((t.lanes & a) !== 0 && (Hc(t, e), Gs(e, null, null, a), Hs()), l = t.memoizedState, i = e.memoizedState, l.parent !== n ? (l = { parent: n, cache: n }, e.memoizedState = l, e.lanes === 0 && (e.memoizedState = e.updateQueue.baseState = l), vl(e, Ye, n)) : (n = i.cache, vl(e, Ye, n), n !== l.cache && Mc(e, [Ye], a, !0))), Je(t, e, e.pendingProps.children, a), e.child;
        case 30: return e.stateNode === null && (e.stateNode = { autoName: null, paired: null, clones: null, ref: null }), n = e.pendingProps, n.name != null && n.name !== "auto" ? e.flags |= t === null ? 18882560 : 18874368 : jt && Du(e), t !== null && t.memoizedProps.name !== n.name ? e.flags |= 4194816 : Li(t, e), Je(t, e, n.children, a), e.child;
        case 29: throw e.pendingProps;
    } throw Error(o(156, e.tag)); }
    function sl(t) { t.flags |= 4; }
    function vr(t, e, a, n, l) { var i; if ((i = (t.mode & 32) !== 0) && (i = a === null ? Hm(e, n) : Hm(e, n) && (n.src !== a.src || n.srcSet !== a.srcSet)), i) {
        if (t.flags |= 16777216, (l & 335544128) === l)
            if (t.stateNode.complete)
                t.flags |= 8192;
            else if (V0())
                t.flags |= 8192;
            else
                throw si = Yu, Lc;
    }
    else
        t.flags &= -16777217; }
    function c0(t, e) { if (e.type !== "stylesheet" || (e.state.loading & 4) !== 0)
        t.flags &= -16777217;
    else if (t.flags |= 16777216, !Gm(e))
        if (V0())
            t.flags |= 8192;
        else
            throw si = Yu, Lc; }
    function so(t, e) { e !== null && (t.flags |= 4), t.flags & 16384 && (e = t.tag !== 22 ? ac() : 536870912, t.lanes |= e, qi |= e); }
    function Xs(t, e) { if (!jt)
        switch (t.tailMode) {
            case "visible": break;
            case "collapsed":
                for (var a = t.tail, n = null; a !== null;)
                    a.alternate !== null && (n = a), a = a.sibling;
                n === null ? e || t.tail === null ? t.tail = null : t.tail.sibling = null : n.sibling = null;
                break;
            default:
                for (e = t.tail, a = null; e !== null;)
                    e.alternate !== null && (a = e), e = e.sibling;
                a === null ? t.tail = null : a.sibling = null;
        } }
    function ge(t) { var e = t.alternate !== null && t.alternate.child === t.child, a = 0, n = 0; if (e)
        for (var l = t.child; l !== null;)
            a |= l.lanes | l.childLanes, n |= l.subtreeFlags & 1206910976, n |= l.flags & 1206910976, l.return = t, l = l.sibling;
    else
        for (l = t.child; l !== null;)
            a |= l.lanes | l.childLanes, n |= l.subtreeFlags, n |= l.flags, l.return = t, l = l.sibling; return t.subtreeFlags |= n, t.childLanes = a, e; }
    function xp(t, e, a) { var n = e.pendingProps; switch (Oc(e), e.tag) {
        case 16:
        case 15:
        case 0:
        case 11:
        case 7:
        case 8:
        case 12:
        case 9:
        case 14: return ge(e), null;
        case 1: return ge(e), null;
        case 3: return a = e.stateNode, n = null, t !== null && (n = t.memoizedState.cache), e.memoizedState.cache !== n && (e.flags |= 2048), al(Ye), mn(), a.pendingContext && (a.context = a.pendingContext, a.pendingContext = null), (t === null || t.child === null) && (_i(e) ? sl(e) : t === null || t.memoizedState.isDehydrated && (e.flags & 256) === 0 || (e.flags |= 1024, Rc())), ge(e), null;
        case 26:
            var l = e.type, i = e.memoizedState;
            return t === null ? (sl(e), i !== null ? (ge(e), c0(e, i)) : (ge(e), vr(e, l, null, n, a))) : i ? i !== t.memoizedState ? (sl(e), ge(e), c0(e, i)) : (ge(e), e.flags &= -16777217) : (t = t.memoizedProps, t !== n && sl(e), ge(e), vr(e, l, t, n, a)), null;
        case 27:
            if (ve(e), a = Qe.current, l = e.type, t !== null && e.stateNode != null)
                t.memoizedProps !== n && sl(e);
            else {
                if (!n) {
                    if (e.stateNode === null)
                        throw Error(o(166));
                    return ge(e), e.subtreeFlags &= -33554433, null;
                }
                t = Xt.current, _i(e) ? Yd(e) : (t = Rm(l, n, a), e.stateNode = t, sl(e));
            }
            return ge(e), e.subtreeFlags &= -33554433, null;
        case 5:
            if (ve(e), l = e.type, t !== null && e.stateNode != null)
                t.memoizedProps !== n && sl(e);
            else {
                if (!n) {
                    if (e.stateNode === null)
                        throw Error(o(166));
                    return ge(e), e.subtreeFlags &= -33554433, null;
                }
                if (i = Xt.current, _i(e))
                    Yd(e);
                else {
                    var r = eu(Qe.current);
                    switch (i) {
                        case 1:
                            i = r.createElementNS("http://www.w3.org/2000/svg", l);
                            break;
                        case 2:
                            i = r.createElementNS("http://www.w3.org/1998/Math/MathML", l);
                            break;
                        default: switch (l) {
                            case "svg":
                                i = r.createElementNS("http://www.w3.org/2000/svg", l);
                                break;
                            case "math":
                                i = r.createElementNS("http://www.w3.org/1998/Math/MathML", l);
                                break;
                            case "script":
                                i = r.createElement("div"), i.innerHTML = "<script><\/script>", i = i.removeChild(i.firstChild);
                                break;
                            case "select":
                                i = typeof n.is == "string" ? r.createElement("select", { is: n.is }) : r.createElement("select"), n.multiple ? i.multiple = !0 : n.size && (i.size = n.size);
                                break;
                            default: i = typeof n.is == "string" ? r.createElement(l, { is: n.is }) : r.createElement(l);
                        }
                    }
                    i[he] = e, i[Oe] = n;
                    t: for (r = e.child; r !== null;) {
                        if (r.tag === 5 || r.tag === 6)
                            i.appendChild(r.stateNode);
                        else if (r.tag !== 4 && r.tag !== 27 && r.child !== null) {
                            r.child.return = r, r = r.child;
                            continue;
                        }
                        if (r === e)
                            break t;
                        for (; r.sibling === null;) {
                            if (r.return === null || r.return === e)
                                break t;
                            r = r.return;
                        }
                        r.sibling.return = r.return, r = r.sibling;
                    }
                    e.stateNode = i;
                    t: switch (oa(i, l, n), l) {
                        case "button":
                        case "input":
                        case "select":
                        case "textarea":
                            n = !!n.autoFocus;
                            break t;
                        case "img":
                            n = !0;
                            break t;
                        default: n = !1;
                    }
                    n && sl(e);
                }
            }
            return ge(e), e.subtreeFlags &= -33554433, vr(e, e.type, t === null ? null : t.memoizedProps, e.pendingProps, a), null;
        case 6:
            if (t && e.stateNode != null)
                t.memoizedProps !== n && sl(e);
            else {
                if (typeof n != "string" && e.stateNode === null)
                    throw Error(o(166));
                if (t = Qe.current, _i(e)) {
                    if (t = e.stateNode, a = e.memoizedProps, n = null, l = ta, l !== null)
                        switch (l.tag) {
                            case 27:
                            case 5: n = l.memoizedProps;
                        }
                    t[he] = e, t = !!(t.nodeValue === a || n !== null && n.suppressHydrationWarning === !0 || om(t.nodeValue, a)), t || gl(e, !0);
                }
                else
                    t = eu(t).createTextNode(n), t[he] = e, e.stateNode = t;
            }
            return ge(e), null;
        case 31:
            if (a = e.memoizedState, t === null || t.memoizedState !== null) {
                if (n = _i(e), a !== null) {
                    if (t === null) {
                        if (!n)
                            throw Error(o(318));
                        if (t = e.memoizedState, t = t !== null ? t.dehydrated : null, !t)
                            throw Error(o(557));
                        t[he] = e;
                    }
                    else
                        Pl(), (e.flags & 128) === 0 && (e.memoizedState = null), e.flags |= 4;
                    ge(e), t = !1;
                }
                else
                    a = Rc(), t !== null && t.memoizedState !== null && (t.memoizedState.hydrationErrors = a), t = !0;
                if (!t)
                    return e.flags & 256 ? (Va(e), e) : (Va(e), null);
                if ((e.flags & 128) !== 0)
                    throw Error(o(558));
            }
            return ge(e), null;
        case 13:
            if (n = e.memoizedState, t === null || t.memoizedState !== null && t.memoizedState.dehydrated !== null) {
                if (l = _i(e), n !== null && n.dehydrated !== null) {
                    if (t === null) {
                        if (!l)
                            throw Error(o(318));
                        if (l = e.memoizedState, l = l !== null ? l.dehydrated : null, !l)
                            throw Error(o(317));
                        l[he] = e;
                    }
                    else
                        Pl(), (e.flags & 128) === 0 && (e.memoizedState = null), e.flags |= 4;
                    ge(e), l = !1;
                }
                else
                    l = Rc(), t !== null && t.memoizedState !== null && (t.memoizedState.hydrationErrors = l), l = !0;
                if (!l)
                    return e.flags & 256 ? (Va(e), e) : (Va(e), null);
            }
            return Va(e), (e.flags & 128) !== 0 ? (e.lanes = a, e) : (a = n !== null, t = t !== null && t.memoizedState !== null, a && (n = e.child, l = null, n.alternate !== null && n.alternate.memoizedState !== null && n.alternate.memoizedState.cachePool !== null && (l = n.alternate.memoizedState.cachePool.pool), i = null, n.memoizedState !== null && n.memoizedState.cachePool !== null && (i = n.memoizedState.cachePool.pool), i !== l && (n.flags |= 2048)), a !== t && a && (e.child.flags |= 8192), so(e, e.updateQueue), ge(e), null);
        case 4: return mn(), t === null && Pr(e.stateNode.containerInfo), e.flags |= 67108864, ge(e), null;
        case 10: return al(e.type), ge(e), null;
        case 19:
            if (Vc(e), n = e.memoizedState, n === null)
                return ge(e), null;
            if (l = (e.flags & 128) !== 0, i = n.rendering, i === null)
                if (l)
                    Xs(n, !1);
                else {
                    if (je !== 0 || t !== null && (t.flags & 128) !== 0)
                        for (t = e.child; t !== null;) {
                            if (i = Zu(t), i !== null) {
                                for (e.flags |= 128, Xs(n, !1), t = i.updateQueue, e.updateQueue = t, so(e, t), e.subtreeFlags = 0, t = a, a = e.child; a !== null;)
                                    Ud(a, t), a = a.sibling;
                                return Bs(e, sa.current & 1 | 2), jt && tl(e, n.treeForkCount), e.child;
                            }
                            t = t.sibling;
                        }
                    n.tail !== null && Ie() > bo && (e.flags |= 128, l = !0, Xs(n, !1), e.lanes = 4194304);
                }
            else {
                if (!l)
                    if (t = Zu(i), t !== null) {
                        if (e.flags |= 128, l = !0, t = t.updateQueue, e.updateQueue = t, so(e, t), Xs(n, !0), n.tail === null && n.tailMode !== "collapsed" && n.tailMode !== "visible" && !i.alternate && !jt)
                            return ge(e), null;
                    }
                    else
                        2 * Ie() - n.renderingStartTime > bo && a !== 536870912 && (e.flags |= 128, l = !0, Xs(n, !1), e.lanes = 4194304);
                n.isBackwards ? (i.sibling = e.child, e.child = i) : (t = n.last, t !== null ? t.sibling = i : e.child = i, n.last = i);
            }
            if (n.tail !== null) {
                t = n.tail;
                t: {
                    for (a = t; a !== null;) {
                        if (a.alternate !== null) {
                            a = !1;
                            break t;
                        }
                        a = a.sibling;
                    }
                    a = !0;
                }
                return n.rendering = t, n.tail = t.sibling, n.renderingStartTime = Ie(), t.sibling = null, i = sa.current, i = l ? i & 1 | 2 : i & 1, n.tailMode === "visible" || n.tailMode === "collapsed" || !a || jt ? Bs(e, i) : (a = i, Y(ia, e), Y(sa, a), ha === null && (ha = e)), jt && tl(e, n.treeForkCount), t;
            }
            return ge(e), null;
        case 22:
        case 23: return Va(e), Yc(), n = e.memoizedState !== null, t !== null ? t.memoizedState !== null !== n && (e.flags |= 8192) : n && (e.flags |= 8192), n ? (a & 536870912) !== 0 && (e.flags & 128) === 0 && (ge(e), e.subtreeFlags & 6 && (e.flags |= 8192)) : ge(e), a = e.updateQueue, a !== null && so(e, a.retryQueue), a = null, t !== null && t.memoizedState !== null && t.memoizedState.cachePool !== null && (a = t.memoizedState.cachePool.pool), n = null, e.memoizedState !== null && e.memoizedState.cachePool !== null && (n = e.memoizedState.cachePool.pool), n !== a && (e.flags |= 2048), t !== null && J(li), null;
        case 24: return a = null, t !== null && (a = t.memoizedState.cache), e.memoizedState.cache !== a && (e.flags |= 2048), al(Ye), ge(e), null;
        case 25: return null;
        case 30: return e.flags |= 33554432, ge(e), null;
    } throw Error(o(156, e.tag)); }
    function Ap(t, e) { switch (Oc(e), e.tag) {
        case 1: return t = e.flags, t & 65536 ? (e.flags = t & -65537 | 128, e) : null;
        case 3: return al(Ye), mn(), t = e.flags, (t & 65536) !== 0 && (t & 128) === 0 ? (e.flags = t & -65537 | 128, e) : null;
        case 26:
        case 27:
        case 5: return ve(e), null;
        case 31:
            if (e.memoizedState !== null) {
                if (Va(e), e.alternate === null)
                    throw Error(o(340));
                Pl();
            }
            return t = e.flags, t & 65536 ? (e.flags = t & -65537 | 128, e) : null;
        case 13:
            if (Va(e), t = e.memoizedState, t !== null && t.dehydrated !== null) {
                if (e.alternate === null)
                    throw Error(o(340));
                Pl();
            }
            return t = e.flags, t & 65536 ? (e.flags = t & -65537 | 128, e) : null;
        case 19: return Vc(e), t = e.flags, t & 65536 ? (e.flags = t & -65537 | 128, t = e.memoizedState, t !== null && (t.rendering = null, t.tail = null), e.flags |= 4, e) : null;
        case 4: return mn(), null;
        case 10: return al(e.type), null;
        case 22:
        case 23: return Va(e), Yc(), t !== null && J(li), t = e.flags, t & 65536 ? (e.flags = t & -65537 | 128, e) : null;
        case 24: return al(Ye), null;
        case 25: return null;
        default: return null;
    } }
    function r0(t, e) { switch (Oc(e), e.tag) {
        case 3:
            al(Ye), mn();
            break;
        case 26:
        case 27:
        case 5:
            ve(e);
            break;
        case 4:
            mn();
            break;
        case 31:
            e.memoizedState !== null && Va(e);
            break;
        case 13:
            Va(e);
            break;
        case 19:
            Vc(e);
            break;
        case 10:
            al(e.type);
            break;
        case 22:
        case 23:
            Va(e), Yc(), t !== null && J(li);
            break;
        case 24: al(Ye);
    } }
    function Zs(t, e) { try {
        var a = e.updateQueue, n = a !== null ? a.lastEffect : null;
        if (n !== null) {
            var l = n.next;
            a = l;
            do {
                if ((a.tag & t) === t) {
                    n = void 0;
                    var i = a.create, r = a.inst;
                    n = i(), r.destroy = n;
                }
                a = a.next;
            } while (a !== l);
        }
    }
    catch (h) {
        ne(e, e.return, h);
    } }
    function wl(t, e, a) { try {
        var n = e.updateQueue, l = n !== null ? n.lastEffect : null;
        if (l !== null) {
            var i = l.next;
            n = i;
            do {
                if ((n.tag & t) === t) {
                    var r = n.inst, h = r.destroy;
                    if (h !== void 0) {
                        r.destroy = void 0, l = e;
                        var p = a, S = h;
                        try {
                            S();
                        }
                        catch (j) {
                            ne(l, p, j);
                        }
                    }
                }
                n = n.next;
            } while (n !== i);
        }
    }
    catch (j) {
        ne(e, e.return, j);
    } }
    function f0(t) { var e = t.updateQueue; if (e !== null) {
        var a = t.stateNode;
        try {
            th(e, a);
        }
        catch (n) {
            ne(t, t.return, n);
        }
    } }
    function d0(t, e, a) { a.props = ci(t.type, t.memoizedProps), a.state = t.memoizedState; try {
        a.componentWillUnmount();
    }
    catch (n) {
        ne(t, e, n);
    } }
    function Ln(t, e) { try {
        var a = t.ref;
        if (a !== null) {
            switch (t.tag) {
                case 26:
                case 27:
                case 5:
                    var n = t.stateNode;
                    break;
                case 30:
                    var l = t.stateNode, i = Wn(t.memoizedProps, l);
                    (l.ref === null || l.ref.name !== i) && (l.ref = bm(i)), n = l.ref;
                    break;
                case 7:
                    if (t.stateNode === null) {
                        var r = new Ka(t);
                        T(t.child, !1, yg, r, void 0, void 0), t.stateNode = r;
                    }
                    n = t.stateNode;
                    break;
                default: n = t.stateNode;
            }
            typeof a == "function" ? t.refCleanup = a(n) : a.current = n;
        }
    }
    catch (h) {
        ne(t, e, h);
    } }
    function ua(t, e) { var a = t.ref, n = t.refCleanup; if (a !== null)
        if (typeof n == "function")
            try {
                n();
            }
            catch (l) {
                ne(t, e, l);
            }
            finally {
                t.refCleanup = null, t = t.alternate, t != null && (t.refCleanup = null);
            }
        else if (typeof a == "function")
            try {
                a(null);
            }
            catch (l) {
                ne(t, e, l);
            }
        else
            a.current = null; }
    function uo(t, e) { if ((t.tag === 5 || t.tag === 27 || t.tag === 6) && t.alternate === null && e !== null)
        for (var a = 0; a < e.length; a++)
            Am(t.stateNode, e[a]); }
    function h0(t) { for (var e = t.return; e !== null && (Er(e) && Am(t.stateNode, e.stateNode), !br(e));)
        e = e.return; }
    function Qs(t) { for (var e = t.return; e !== null && (Er(e) && pg(t.stateNode, e.stateNode), !br(e));)
        e = e.return; }
    function br(t) { return t.tag === 5 || t.tag === 3 || t.tag === 27; }
    function Er(t) { return t && t.tag === 7 && t.stateNode !== null; }
    function Nr(t) { var e = t.type, a = t.memoizedProps, n = t.stateNode; try {
        t: switch (e) {
            case "button":
            case "input":
            case "select":
            case "textarea":
                a.autoFocus && n.focus();
                break t;
            case "img": a.src ? n.src = a.src : a.srcSet && (n.srcset = a.srcSet);
        }
    }
    catch (l) {
        ne(t, t.return, l);
    } }
    function Sr(t, e, a) { try {
        var n = t.stateNode;
        Wp(n, t.type, a, e), n[Oe] = e;
    }
    catch (l) {
        ne(t, t.return, l);
    } }
    function m0(t) { return t.tag === 5 || t.tag === 3 || t.tag === 26 || t.tag === 27 && Cl(t.type) || t.tag === 4; }
    function Tr(t) { t: for (;;) {
        for (; t.sibling === null;) {
            if (t.return === null || m0(t.return))
                return null;
            t = t.return;
        }
        for (t.sibling.return = t.return, t = t.sibling; t.tag !== 5 && t.tag !== 6 && t.tag !== 18;) {
            if (t.tag === 27 && Cl(t.type) || t.flags & 2 || t.child === null || t.tag === 4)
                continue t;
            t.child.return = t, t = t.child;
        }
        if (!(t.flags & 2))
            return t.stateNode;
    } }
    function xr(t, e, a, n) { var l = t.tag; if (l === 5 || l === 6)
        l = t.stateNode, e ? (a.nodeType === 9 ? a.body : a.nodeName === "HTML" ? a.ownerDocument.body : a).insertBefore(l, e) : (e = a.nodeType === 9 ? a.body : a.nodeName === "HTML" ? a.ownerDocument.body : a, e.appendChild(l), a = a._reactRootContainer, a != null || e.onclick !== null || (e.onclick = ja)), uo(t, n), ot = !0;
    else if (l !== 4 && (l === 27 && (uo(t, n), n = null, Cl(t.type) && (a = t.stateNode, e = null)), t = t.child, t !== null))
        for (xr(t, e, a, n), t = t.sibling; t !== null;)
            xr(t, e, a, n), t = t.sibling; }
    function oo(t, e, a, n) { var l = t.tag; if (l === 5 || l === 6)
        l = t.stateNode, e ? a.insertBefore(l, e) : a.appendChild(l), uo(t, n), ot = !0;
    else if (l !== 4 && (l === 27 && (uo(t, n), n = null, Cl(t.type) && (a = t.stateNode)), t = t.child, t !== null))
        for (oo(t, e, a, n), t = t.sibling; t !== null;)
            oo(t, e, a, n), t = t.sibling; }
    function y0(t) { var e = t.stateNode, a = t.memoizedProps; try {
        for (var n = t.type, l = e.attributes; l.length;)
            e.removeAttributeNode(l[0]);
        oa(e, n, a), e[he] = t, e[Oe] = a;
    }
    catch (i) {
        ne(t, t.return, i);
    } }
    var co = !1, Xa = null;
    function p0(t) { (t.tag === 30 || (t.subtreeFlags & 33554432) !== 0) && (co = !0); }
    var Un = null;
    function g0() { var t = Un; return Un = null, t; }
    var za = 0;
    function Ui(t, e, a, n, l) { return za = 0, v0(t.child, e, a, n, l); }
    function v0(t, e, a, n, l) { for (var i = !1; t !== null;) {
        if (t.tag === 5) {
            var r = t.stateNode;
            if (n !== null) {
                var h = of(r);
                n.push(h), h.view && (i = !0);
            }
            else
                i || of(r).view && (i = !0);
            co = !0, gm(r, za === 0 ? e : e + "_" + za, a), za++;
        }
        else
            (t.tag !== 22 || t.memoizedState === null) && (t.tag === 30 && l || v0(t.child, e, a, n, l) && (i = !0));
        t = t.sibling;
    } return i; }
    function Hn(t, e) { for (; t !== null;)
        t.tag === 5 ? vm(t.stateNode, t.memoizedProps) : (t.tag !== 22 || t.memoizedState === null) && (t.tag === 30 && e || Hn(t.child, e)), t = t.sibling; }
    function ro(t) { if ((t.subtreeFlags & 18874368) !== 0)
        for (t = t.child; t !== null;) {
            if ((t.tag !== 22 || t.memoizedState === null) && (ro(t), t.tag === 30 && (t.flags & 18874368) !== 0 && t.stateNode.paired)) {
                var e = t.memoizedProps;
                if (e.name == null || e.name === "auto")
                    throw Error(o(544));
                var a = e.name;
                e = $n(e.default, e.share), e !== "none" && (Ui(t, a, e, null, !1) || Hn(t.child, !1));
            }
            t = t.sibling;
        } }
    function Ar(t, e) { if (t.tag === 30) {
        var a = t.stateNode, n = t.memoizedProps, l = Wn(n, a), i = $n(n.default, a.paired ? n.share : n.enter);
        i !== "none" ? Ui(t, l, i, null, !1) ? (ro(t), a.paired || e || Xi(t, n.onEnter)) : Hn(t.child, !1) : ro(t);
    }
    else if ((t.subtreeFlags & 33554432) !== 0)
        for (t = t.child; t !== null;)
            Ar(t, e), t = t.sibling;
    else
        ro(t); }
    function wr(t) { if (Xa !== null && Xa.size !== 0) {
        var e = Xa;
        if ((t.subtreeFlags & 18874368) !== 0)
            for (t = t.child; t !== null;) {
                if (t.tag !== 22 || t.memoizedState === null) {
                    if (t.tag === 30 && (t.flags & 18874368) !== 0) {
                        var a = t.memoizedProps, n = a.name;
                        if (n != null && n !== "auto") {
                            var l = e.get(n);
                            if (l !== void 0) {
                                var i = $n(a.default, a.share);
                                if (i !== "none" && (Ui(t, n, i, null, !1) ? (i = t.stateNode, l.paired = i, i.paired = l, Xi(t, a.onShare)) : Hn(t.child, !1)), e.delete(n), e.size === 0)
                                    break;
                            }
                        }
                    }
                    wr(t);
                }
                t = t.sibling;
            }
    } }
    function Or(t) { if (t.tag === 30) {
        var e = t.memoizedProps, a = Wn(e, t.stateNode), n = Xa !== null ? Xa.get(a) : void 0, l = $n(e.default, n !== void 0 ? e.share : e.exit);
        l !== "none" && (Ui(t, a, l, null, !1) ? n !== void 0 ? (l = t.stateNode, n.paired = l, l.paired = n, Xa.delete(a), Xi(t, e.onShare)) : Xi(t, e.onExit) : Hn(t.child, !1)), Xa !== null && wr(t);
    }
    else if ((t.subtreeFlags & 33554432) !== 0)
        for (t = t.child; t !== null;)
            Or(t), t = t.sibling;
    else
        Xa !== null && wr(t); }
    function b0(t) { for (t = t.child; t !== null;) {
        if (t.tag === 30) {
            var e = t.memoizedProps, a = Wn(e, t.stateNode);
            e = $n(e.default, e.update), t.flags &= -5, e !== "none" && Ui(t, a, e, t.memoizedState = [], !1);
        }
        else
            (t.subtreeFlags & 33554432) !== 0 && b0(t);
        t = t.sibling;
    } }
    function _r(t) { if ((t.subtreeFlags & 18874368) !== 0)
        for (t = t.child; t !== null;) {
            if (t.tag !== 22 || t.memoizedState === null) {
                if (t.tag === 30 && (t.flags & 18874368) !== 0) {
                    var e = t.stateNode;
                    e.paired !== null && (e.paired = null, Hn(t.child, !1));
                }
                _r(t);
            }
            t = t.sibling;
        } }
    function fo(t) { if (t.tag === 30)
        t.stateNode.paired = null, Hn(t.child, !1), _r(t);
    else if ((t.subtreeFlags & 33554432) !== 0)
        for (t = t.child; t !== null;)
            fo(t), t = t.sibling;
    else
        _r(t); }
    function E0(t) { for (t = t.child; t !== null;)
        t.tag === 30 ? Hn(t.child, !1) : (t.subtreeFlags & 33554432) !== 0 && E0(t), t = t.sibling; }
    function Rr(t, e, a, n, l, i, r) { for (var h = !1; e !== null;) {
        if (e.tag === 5) {
            var p = e.stateNode;
            if (i !== null && za < i.length) {
                var S = i[za], j = of(p);
                (S.view || j.view) && (h = !0);
                var H;
                if (H = (t.flags & 4) === 0)
                    if (j.clip)
                        H = !0;
                    else {
                        H = S.rect;
                        var b = j.rect;
                        H = H.y !== b.y || H.x !== b.x || H.height !== b.height || H.width !== b.width;
                    }
                H && (t.flags |= 4), j.abs ? j = !S.abs : (S = S.rect, j = j.rect, j = S.height !== j.height || S.width !== j.width), j && (t.flags |= 32);
            }
            else
                t.flags |= 32;
            (t.flags & 4) !== 0 && gm(p, za === 0 ? a : a + "_" + za, l), h && (t.flags & 4) !== 0 || (Un === null && (Un = []), Un.push(p, za === 0 ? n : n + "_" + za, e.memoizedProps)), za++;
        }
        else
            (e.tag !== 22 || e.memoizedState === null) && (e.tag === 30 && r ? t.flags |= e.flags & 32 : Rr(t, e.child, a, n, l, i, r) && (h = !0));
        e = e.sibling;
    } return h; }
    function N0(t, e) { for (t = t.child; t !== null;) {
        if (t.tag === 30) {
            var a = t.memoizedProps, n = t.stateNode, l = Wn(a, n), i = $n(a.default, a.update), r;
            r = t.memoizedState, t.memoizedState = null, n = t;
            var h = t.child;
            za = 0, l = Rr(n, h, l, l, i, r, !1), (t.flags & 4) !== 0 && l && Xi(t, a.onUpdate);
        }
        else
            (t.subtreeFlags & 33554432) !== 0 && N0(t);
        t = t.sibling;
    } }
    var ea = !1, Pt = !1, Gn = !1, jr = !1, S0 = typeof WeakSet == "function" ? WeakSet : Set, aa = null, Bn = !1, Is = !1, ho = !1, Mr = !1;
    function wp(t, e, a) { if (t = t.containerInfo, af = ts, t = wd(t), gc(t)) {
        if ("selectionStart" in t)
            var n = { start: t.selectionStart, end: t.selectionEnd };
        else
            t: {
                n = (n = t.ownerDocument) && n.defaultView || window;
                var l = n.getSelection && n.getSelection();
                if (l && l.rangeCount !== 0) {
                    n = l.anchorNode;
                    var i = l.anchorOffset, r = l.focusNode;
                    l = l.focusOffset;
                    try {
                        n.nodeType, r.nodeType;
                    }
                    catch {
                        n = null;
                        break t;
                    }
                    var h = 0, p = -1, S = -1, j = 0, H = 0, b = t, _ = null;
                    e: for (;;) {
                        for (var W; b !== n || i !== 0 && b.nodeType !== 3 || (p = h + i), b !== r || l !== 0 && b.nodeType !== 3 || (S = h + l), b.nodeType === 3 && (h += b.nodeValue.length), (W = b.firstChild) !== null;)
                            _ = b, b = W;
                        for (;;) {
                            if (b === t)
                                break e;
                            if (_ === n && ++j === i && (p = h), _ === r && ++H === l && (S = h), (W = b.nextSibling) !== null)
                                break;
                            b = _, _ = b.parentNode;
                        }
                        b = W;
                    }
                    n = p === -1 || S === -1 ? null : { start: p, end: S };
                }
                else
                    n = null;
            }
        n = n || { start: 0, end: 0 };
    }
    else
        n = null; for (nf = { focusedElem: t, selectionRange: n }, ts = !1, a = (a & 335544064) === a, aa = e, e = a ? 9270 : 1024; aa !== null;) {
        if (t = aa, a && (n = t.deletions, n !== null))
            for (i = 0; i < n.length; i++)
                a && Or(n[i]);
        if (t.alternate === null && (t.flags & 2) !== 0)
            a && p0(t), mo(a);
        else {
            if (t.tag === 22) {
                if (n = t.alternate, t.memoizedState !== null) {
                    n !== null && n.memoizedState === null && a && Or(n), mo(a);
                    continue;
                }
                else if (n !== null && n.memoizedState !== null) {
                    a && p0(t), mo(a);
                    continue;
                }
            }
            n = t.child, (t.subtreeFlags & e) !== 0 && n !== null ? (n.return = t, aa = n) : (a && b0(t), mo(a));
        }
    } Xa = null; }
    function mo(t) { for (; aa !== null;) {
        var e = aa, a = t, n = e.alternate, l = e.flags;
        switch (e.tag) {
            case 0:
            case 11:
            case 15: break;
            case 1:
                if ((l & 1024) !== 0 && n !== null) {
                    a = void 0, l = n.memoizedProps, n = n.memoizedState;
                    var i = e.stateNode;
                    try {
                        var r = ci(e.type, l);
                        a = i.getSnapshotBeforeUpdate(r, n), i.__reactInternalSnapshotBeforeUpdate = a;
                    }
                    catch (h) {
                        ne(e, e.return, h);
                    }
                }
                break;
            case 3:
                if ((l & 1024) !== 0) {
                    if (n = e.stateNode.containerInfo, a = n.nodeType, a === 9)
                        ff(n);
                    else if (a === 1)
                        switch (n.nodeName) {
                            case "HEAD":
                            case "HTML":
                            case "BODY":
                                ff(n);
                                break;
                            default: n.textContent = "";
                        }
                }
                break;
            case 5:
            case 26:
            case 27:
            case 6:
            case 4:
            case 17: break;
            case 30:
                a && n !== null && (a = Wn(n.memoizedProps, n.stateNode), l = e.memoizedProps, l = $n(l.default, l.update), l !== "none" && Ui(n, a, l, n.memoizedState = [], !0));
                break;
            default: if ((l & 1024) !== 0)
                throw Error(o(163));
        }
        if (n = e.sibling, n !== null) {
            n.return = e.return, aa = n;
            break;
        }
        aa = e.return;
    } }
    function T0(t, e, a) { var n = a.flags; switch (a.tag) {
        case 0:
        case 11:
        case 15:
            qn(t, a), n & 4 && Zs(5, a);
            break;
        case 1:
            if (qn(t, a), n & 4)
                if (t = a.stateNode, e === null)
                    try {
                        t.componentDidMount();
                    }
                    catch (r) {
                        ne(a, a.return, r);
                    }
                else {
                    var l = ci(a.type, e.memoizedProps);
                    e = e.memoizedState;
                    try {
                        t.componentDidUpdate(l, e, t.__reactInternalSnapshotBeforeUpdate);
                    }
                    catch (r) {
                        ne(a, a.return, r);
                    }
                }
            n & 64 && f0(a), n & 512 && Ln(a, a.return);
            break;
        case 3:
            if (qn(t, a), n & 64 && (t = a.updateQueue, t !== null)) {
                if (e = null, a.child !== null)
                    switch (a.child.tag) {
                        case 27:
                        case 5:
                            e = a.child.stateNode;
                            break;
                        case 1: e = a.child.stateNode;
                    }
                try {
                    th(t, e);
                }
                catch (r) {
                    ne(a, a.return, r);
                }
            }
            break;
        case 27: e === null && n & 4 && y0(a);
        case 26:
        case 5:
            qn(t, a), e === null && n & 4 && Nr(a), n & 512 && Ln(a, a.return);
            break;
        case 12:
            qn(t, a);
            break;
        case 31:
            qn(t, a), n & 4 && O0(t, a);
            break;
        case 13:
            qn(t, a), n & 4 && _0(t, a), n & 64 && (t = a.memoizedState, t !== null && (t = t.dehydrated, t !== null && (a = Gp.bind(null, a), bg(t, a))));
            break;
        case 22:
            if (n = a.memoizedState !== null || ea, !n) {
                var i = e !== null && e.memoizedState !== null || Pt;
                e = ea, l = Pt, ea = n, (Pt = i) && !l ? (n = 2, (a.subtreeFlags & 8772) !== 0 && (n |= 1), Sn(t, a, n)) : qn(t, a), ea = e, Pt = l;
            }
            break;
        case 30:
            qn(t, a), n & 512 && Ln(a, a.return);
            break;
        case 7: n & 512 && Ln(a, a.return);
        default: qn(t, a);
    } }
    function zr(t, e) { for (t = t.child; t !== null;)
        x0(t, e), t = t.sibling; }
    function x0(t, e) { switch (t.tag) {
        case 5:
        case 26:
            try {
                var a = t.stateNode;
                if (e) {
                    var n = a.style;
                    typeof n.setProperty == "function" ? n.setProperty("display", "none", "important") : n.display = "none";
                }
                else {
                    var l = t.stateNode, i = t.memoizedProps.style, r = i != null && i.hasOwnProperty("display") ? i.display : null;
                    l.style.display = r == null || typeof r == "boolean" ? "" : ("" + r).trim();
                }
            }
            catch (p) {
                ne(t, t.return, p);
            }
            Cr(t, e);
            break;
        case 6:
            try {
                t.stateNode.nodeValue = e ? "" : t.memoizedProps, ot = !0;
            }
            catch (p) {
                ne(t, t.return, p);
            }
            break;
        case 18:
            try {
                var h = t.stateNode;
                e ? pm(h, !0) : pm(t.stateNode, !1);
            }
            catch (p) {
                ne(t, t.return, p);
            }
            break;
        case 22:
        case 23:
            t.memoizedState === null && zr(t, e);
            break;
        default: zr(t, e);
    } }
    function Cr(t, e) { if (t.subtreeFlags & 67108864)
        for (t = t.child; t !== null;) {
            t: {
                var a = t, n = e;
                switch (a.tag) {
                    case 4:
                        x0(a, n);
                        break t;
                    case 22:
                        a.memoizedState === null && Cr(a, n);
                        break t;
                    default: Cr(a, n);
                }
            }
            t = t.sibling;
        } }
    function A0(t) { var e = t.alternate; e !== null && (t.alternate = null, A0(e)), t.child = null, t.deletions = null, t.sibling = null, t.tag === 5 && (e = t.stateNode, e !== null && Ba(e)), t.stateNode = null, t.return = null, t.dependencies = null, t.memoizedProps = null, t.memoizedState = null, t.pendingProps = null, t.stateNode = null, t.updateQueue = null; }
    var Se = null, Ca = !1;
    function En(t, e, a) { for (a = a.child; a !== null;)
        w0(t, e, a), a = a.sibling; }
    function w0(t, e, a) { if (ze && typeof ze.onCommitFiberUnmount == "function")
        try {
            ze.onCommitFiberUnmount(Pa, a);
        }
        catch { } switch (a.tag) {
        case 26:
            Pt || ua(a, e), En(t, e, a), a.memoizedState ? a.memoizedState.count-- : a.stateNode && !Pt && (a = a.stateNode, a.parentNode.removeChild(a));
            break;
        case 27:
            Pt || ua(a, e), Qs(a);
            var n = Se, l = Ca;
            Cl(a.type) && (Se = a.stateNode, Ca = !1), En(t, e, a), jm(a.stateNode, a.type, a.memoizedProps), Se = n, Ca = l;
            break;
        case 5: Pt || ua(a, e), Qs(a);
        case 6:
            if (a.tag === 6 && Qs(a), n = Se, l = Ca, Se = null, En(t, e, a), Se = n, Ca = l, Se !== null)
                if (Ca)
                    try {
                        (Se.nodeType === 9 ? Se.body : Se.nodeName === "HTML" ? Se.ownerDocument.body : Se).removeChild(a.stateNode), ot = !0;
                    }
                    catch (i) {
                        ne(a, e, i);
                    }
                else
                    try {
                        Se.removeChild(a.stateNode), ot = !0;
                    }
                    catch (i) {
                        ne(a, e, i);
                    }
            break;
        case 18:
            Se !== null && (Ca ? (t = Se, ym(t.nodeType === 9 ? t.body : t.nodeName === "HTML" ? t.ownerDocument.body : t, a.stateNode), es(t)) : ym(Se, a.stateNode));
            break;
        case 4:
            n = Se, l = Ca, Se = a.stateNode.containerInfo, Ca = !0, En(t, e, a), Se = n, Ca = l;
            break;
        case 0:
        case 11:
        case 14:
        case 15:
            wl(2, a, e), Pt || wl(4, a, e), En(t, e, a);
            break;
        case 1:
            Pt || (ua(a, e), n = a.stateNode, typeof n.componentWillUnmount == "function" && d0(a, e, n)), En(t, e, a);
            break;
        case 21:
            En(t, e, a);
            break;
        case 22:
            Pt = (n = Pt) || a.memoizedState !== null, En(t, e, a), Pt = n;
            break;
        case 30:
            ua(a, e), En(t, e, a);
            break;
        case 7:
            Pt || ua(a, e), En(t, e, a);
            break;
        default: En(t, e, a);
    } }
    function O0(t, e) { if (e.memoizedState === null && (t = e.alternate, t !== null && (t = t.memoizedState, t !== null))) {
        t = t.dehydrated;
        try {
            es(t);
        }
        catch (a) {
            ne(e, e.return, a);
        }
    } }
    function _0(t, e) { if (e.memoizedState === null && (t = e.alternate, t !== null && (t = t.memoizedState, t !== null && (t = t.dehydrated, t !== null))))
        try {
            es(t);
        }
        catch (a) {
            ne(e, e.return, a);
        } }
    function Op(t) { switch (t.tag) {
        case 31:
        case 13:
        case 19:
            var e = t.stateNode;
            return e === null && (e = t.stateNode = new S0), e;
        case 22: return t = t.stateNode, e = t._retryCache, e === null && (e = t._retryCache = new S0), e;
        default: throw Error(o(435, t.tag));
    } }
    function yo(t, e) { var a = Op(t); e.forEach(function (n) { if (!a.has(n)) {
        a.add(n);
        var l = Bp.bind(null, t, n);
        n.then(l, l);
    } }); }
    function xa(t, e, a) { var n = e.deletions; if (n !== null)
        for (var l = 0; l < n.length; l++) {
            var i = n[l], r = t, h = e, p = h;
            t: for (; p !== null;) {
                switch (p.tag) {
                    case 27:
                        if (Cl(p.type)) {
                            Se = p.stateNode, Ca = !1;
                            break t;
                        }
                        break;
                    case 5:
                        Se = p.stateNode, Ca = !1;
                        break t;
                    case 3:
                    case 4:
                        Se = p.stateNode.containerInfo, Ca = !0;
                        break t;
                }
                p = p.return;
            }
            if (Se === null)
                throw Error(o(160));
            w0(r, h, i), Se = null, Ca = !1, r = i.alternate, r !== null && (r.return = null), i.return = null;
        } if (e.subtreeFlags & 13886)
        for (e = e.child; e !== null;)
            R0(e, t, a), e = e.sibling; }
    var Nn = null;
    function R0(t, e, a) { var n = t.alternate, l = t.flags; switch (t.tag) {
        case 0:
        case 11:
        case 14:
        case 15:
            if (l & 4 && (n = t.updateQueue, n = n !== null ? n.events : null, n !== null))
                for (var i = 0; i < n.length; i++) {
                    var r = n[i];
                    r.ref.impl = r.nextImpl;
                }
            xa(e, t, a), Aa(t), l & 4 && (wl(3, t, t.return), Zs(3, t), wl(5, t, t.return));
            break;
        case 1:
            xa(e, t, a), Aa(t), l & 512 && (Pt || n === null || ua(n, n.return)), l & 64 && ea && (t = t.updateQueue, t !== null && (e = t.callbacks, e !== null && (a = t.shared.hiddenCallbacks, t.shared.hiddenCallbacks = a === null ? e : a.concat(e))));
            break;
        case 26:
            if (i = Nn, xa(e, t, a), Aa(t), l & 512 && (Pt || n === null || ua(n, n.return)), l & 4)
                if (l = n !== null ? n.memoizedState : null, a = t.memoizedState, n === null)
                    if (a === null)
                        if (t.stateNode === null)
                            if (ea)
                                t.stateNode = dm(t.type, t.memoizedProps, e.containerInfo, t);
                            else {
                                t: {
                                    e = t.type, a = t.memoizedProps, l = i.ownerDocument || i;
                                    e: switch (e) {
                                        case "title":
                                            n = l.getElementsByTagName("title")[0], (!n || n[ra] || n[he] || n.namespaceURI === "http://www.w3.org/2000/svg" || n.hasAttribute("itemprop")) && (n = l.createElement(e), l.head.insertBefore(n, l.querySelector("head > title"))), oa(n, e, a), n[he] = t, _e(n), e = n;
                                            break t;
                                        case "link":
                                            if (i = Um("link", "href", l).get(e + (a.href || ""))) {
                                                for (r = 0; r < i.length; r++)
                                                    if (n = i[r], n.getAttribute("href") === (a.href == null || a.href === "" ? null : a.href) && n.getAttribute("rel") === (a.rel == null ? null : a.rel) && n.getAttribute("title") === (a.title == null ? null : a.title) && n.getAttribute("crossorigin") === (a.crossOrigin == null ? null : a.crossOrigin)) {
                                                        i.splice(r, 1);
                                                        break e;
                                                    }
                                            }
                                            n = l.createElement(e), oa(n, e, a), l.head.appendChild(n);
                                            break;
                                        case "meta":
                                            if (i = Um("meta", "content", l).get(e + (a.content || ""))) {
                                                for (r = 0; r < i.length; r++)
                                                    if (n = i[r], n.getAttribute("content") === (a.content == null ? null : "" + a.content) && n.getAttribute("name") === (a.name == null ? null : a.name) && n.getAttribute("property") === (a.property == null ? null : a.property) && n.getAttribute("http-equiv") === (a.httpEquiv == null ? null : a.httpEquiv) && n.getAttribute("charset") === (a.charSet == null ? null : a.charSet)) {
                                                        i.splice(r, 1);
                                                        break e;
                                                    }
                                            }
                                            n = l.createElement(e), oa(n, e, a), l.head.appendChild(n);
                                            break;
                                        default: throw Error(o(468, e));
                                    }
                                    n[he] = t, _e(n), e = n;
                                }
                                t.stateNode = e;
                            }
                        else
                            ea || vf(i, t.type, t.stateNode);
                    else
                        t.stateNode = Lm(i, a, t.memoizedProps);
                else
                    l !== a ? (l === null ? (e = n.stateNode, e === null || Pt || e.parentNode.removeChild(e)) : l.count--, a === null ? ea || vf(i, t.type, t.stateNode) : Lm(i, a, t.memoizedProps)) : a === null && t.stateNode !== null && Sr(t, t.memoizedProps, n.memoizedProps);
            break;
        case 27:
            xa(e, t, a), Aa(t), l & 512 && (Pt || n === null || ua(n, n.return)), n !== null && l & 4 && Sr(t, t.memoizedProps, n.memoizedProps);
            break;
        case 5:
            if (i = Gn, Gn = !1, xa(e, t, a), Gn = i, Aa(t), l & 512 && (Pt || n === null || ua(n, n.return)), t.flags & 32) {
                e = t.stateNode;
                try {
                    nn(e, ""), ot = !0;
                }
                catch (j) {
                    ne(t, t.return, j);
                }
            }
            l & 4 && t.stateNode != null && (e = t.memoizedProps, Sr(t, e, n !== null ? n.memoizedProps : e)), l & 1024 && (jr = !0);
            break;
        case 6:
            if (xa(e, t, a), Aa(t), l & 4) {
                if (t.stateNode === null)
                    throw Error(o(162));
                e = t.memoizedProps, a = t.stateNode;
                try {
                    a.nodeValue = e, ot = !0;
                }
                catch (j) {
                    ne(t, t.return, j);
                }
            }
            break;
        case 3:
            if (ot = !1, jo = null, i = Nn, Nn = au(e.containerInfo), xa(e, t, a), Nn = i, Aa(t), l & 4 && n !== null && n.memoizedState.isDehydrated)
                try {
                    es(e.containerInfo);
                }
                catch (j) {
                    ne(t, t.return, j);
                }
            jr && (jr = !1, j0(t)), ot = !1;
            break;
        case 4:
            l = Gn, Gn = ea, n = Ne(), i = Nn, Nn = au(t.stateNode.containerInfo), xa(e, t, a), Aa(t), Nn = i, ot && Is && (ho = !0), ot = n, Gn = l;
            break;
        case 12:
            xa(e, t, a), Aa(t);
            break;
        case 31:
            xa(e, t, a), Aa(t), l & 4 && (e = t.updateQueue, e !== null && (t.updateQueue = null, yo(t, e)));
            break;
        case 13:
            xa(e, t, a), Aa(t), t.child.flags & 8192 && t.memoizedState !== null != (n !== null && n.memoizedState !== null) && (vo = Ie()), l & 4 && (e = t.updateQueue, e !== null && (t.updateQueue = null, yo(t, e)));
            break;
        case 22:
            i = t.memoizedState !== null, r = n !== null && n.memoizedState !== null;
            var h = ea, p = Pt, S = Gn;
            ea = h || i, Gn = S || i, Pt = p || r, xa(e, t, a), Pt = p, Gn = S, ea = h, Aa(t), l & 8192 && (e = t.stateNode, e._visibility = i ? e._visibility & -2 : e._visibility | 1, !i || n === null || r || ea || Pt || (e = r || Pt, a = ea, n = Pt, ea = i || ea, Pt = e, Ol(t, 2), ea = a, Pt = n), !i && Gn || zr(t, i)), l & 4 && (e = t.updateQueue, e !== null && (a = e.retryQueue, a !== null && (e.retryQueue = null, yo(t, a))));
            break;
        case 19:
            xa(e, t, a), Aa(t), l & 4 && (e = t.updateQueue, e !== null && (t.updateQueue = null, yo(t, e)));
            break;
        case 30:
            l & 512 && (Pt || n === null || ua(n, n.return)), l = Ne(), i = Is, r = (a & 335544064) === a, h = t.memoizedProps, Is = r && $n(h.default, h.update) !== "none", xa(e, t, a), Aa(t), r && n !== null && ot && (t.flags |= 4), Is = i, ot = l;
            break;
        case 21: break;
        case 7: l & 512 && (Pt || n === null || ua(n, n.return)), n && n.stateNode !== null && (n.stateNode._fragmentFiber = t);
        default: xa(e, t, a), Aa(t);
    } }
    function Aa(t) { var e = t.flags; if (e & 2) {
        try {
            for (var a, n = t.return; n !== null;) {
                if (m0(n)) {
                    a = n;
                    break;
                }
                n = n.return;
            }
            n = null;
            for (var l = t.return; l !== null;) {
                if (Er(l)) {
                    var i = l.stateNode;
                    n === null ? n = [i] : n.push(i);
                }
                if (br(l))
                    break;
                l = l.return;
            }
            var r = n;
            if (a == null)
                throw Error(o(160));
            switch (a.tag) {
                case 27:
                    var h = a.stateNode, p = Tr(t);
                    oo(t, p, h, r);
                    break;
                case 5:
                    var S = a.stateNode;
                    a.flags & 32 && (nn(S, ""), a.flags &= -33);
                    var j = Tr(t);
                    oo(t, j, S, r);
                    break;
                case 3:
                case 4:
                    var H = a.stateNode.containerInfo, b = Tr(t);
                    xr(t, b, H, r);
                    break;
                default: throw Error(o(161));
            }
        }
        catch (_) {
            ne(t, t.return, _);
        }
        t.flags &= -3;
    } e & 4096 && (t.flags &= -4097); }
    function j0(t) { if (t.subtreeFlags & 1024)
        for (t = t.child; t !== null;) {
            var e = t;
            j0(e), e.tag === 5 && e.flags & 1024 && (e = e.stateNode, ts = !0, e.reset(), ts = !1), t = t.sibling;
        } }
    function Hi(t, e) { if (e.subtreeFlags & 9270)
        for (e = e.child; e !== null;)
            M0(e, t), e = e.sibling;
    else
        N0(e); }
    function M0(t, e) { var a = t.alternate; if (a === null)
        Ar(t, !1);
    else
        switch (t.tag) {
            case 3:
                if (Mr = Bn = !1, g0(), Hi(e, t), !Bn && !ho) {
                    if (t = Un, t !== null)
                        for (var n = 0; n < t.length; n += 3) {
                            a = t[n];
                            var l = t[n + 1];
                            vm(a, t[n + 2]), a = a.ownerDocument.documentElement, a !== null && a.animate({ opacity: [0, 0], pointerEvents: ["none", "none"] }, { duration: 0, fill: "forwards", pseudoElement: "::view-transition-group(" + l + ")" });
                        }
                    t = e.containerInfo, t = t.nodeType === 9 ? t.documentElement : t.ownerDocument.documentElement, t !== null && t.style.viewTransitionName === "" && (t.style.viewTransitionName = "none", t.animate({ opacity: [0, 0], pointerEvents: ["none", "none"] }, { duration: 0, fill: "forwards", pseudoElement: "::view-transition-group(root)" }), t.animate({ width: [0, 0], height: [0, 0] }, { duration: 0, fill: "forwards", pseudoElement: "::view-transition" })), Mr = !0;
                }
                Un = null;
                break;
            case 5:
                Hi(e, t);
                break;
            case 4:
                n = Bn, Bn = !1, Hi(e, t), Bn && (ho = !0), Bn = n;
                break;
            case 22:
                t.memoizedState === null && (a.memoizedState !== null ? Ar(t, !1) : Hi(e, t));
                break;
            case 30:
                n = Bn, l = g0(), Bn = !1, Hi(e, t), Bn && (t.flags |= 4);
                var i = t.memoizedProps, r = t.stateNode;
                e = Wn(i, r), r = Wn(a.memoizedProps, r);
                var h = $n(i.default, i.update);
                h === "none" ? e = !1 : (i = a.memoizedState, a.memoizedState = null, a = t.child, za = 0, e = Rr(t, a, e, r, h, i, !0), za !== (i === null ? 0 : i.length) && (t.flags |= 32)), (t.flags & 4) !== 0 && e ? (Xi(t, t.memoizedProps.onUpdate), Un = l) : l !== null && (l.push.apply(l, Un), Un = l), Bn = (t.flags & 32) !== 0 ? !0 : n;
                break;
            default: Hi(e, t);
        } }
    function qn(t, e) { if (e.subtreeFlags & 8772)
        for (e = e.child; e !== null;)
            T0(t, e.alternate, e), e = e.sibling; }
    function Ol(t, e) { for (t = t.child; t !== null;) {
        var a = t, n = e;
        switch (a.tag) {
            case 0:
            case 11:
            case 14:
            case 15:
                wl(4, a, a.return), Ol(a, n);
                break;
            case 1:
                ua(a, a.return);
                var l = a.stateNode;
                typeof l.componentWillUnmount == "function" && d0(a, a.return, l), Ol(a, n);
                break;
            case 27: (n & 2) !== 0 && jm(a.stateNode, a.type, a.memoizedProps);
            case 5:
                ua(a, a.return), a.tag !== 5 && a.tag !== 27 || Qs(a), Ol(a, n);
                break;
            case 6:
                Qs(a);
                break;
            case 26:
                ua(a, a.return), l = a.stateNode, a.memoizedState !== null || l === null || Pt || l.parentNode.removeChild(l), Ol(a, n);
                break;
            case 22:
                a.memoizedState === null && Ol(a, n);
                break;
            case 30:
                ua(a, a.return), Ol(a, n);
                break;
            case 7: ua(a, a.return);
            default: Ol(a, n);
        }
        t = t.sibling;
    } }
    function Sn(t, e, a) { for (a = (e.subtreeFlags & 8772) !== 0 ? a : a & -2, e = e.child; e !== null;) {
        var n = e.alternate, l = t, i = e, r = i.flags, h = (a & 1) !== 0;
        switch (i.tag) {
            case 0:
            case 11:
            case 15:
                Sn(l, i, a), Zs(4, i);
                break;
            case 1:
                if (Sn(l, i, a), n = i, l = n.stateNode, typeof l.componentDidMount == "function")
                    try {
                        l.componentDidMount();
                    }
                    catch (j) {
                        ne(n, n.return, j);
                    }
                if (n = i, l = n.updateQueue, l !== null) {
                    var p = n.stateNode;
                    try {
                        var S = l.shared.hiddenCallbacks;
                        if (S !== null)
                            for (l.shared.hiddenCallbacks = null, l = 0; l < S.length; l++)
                                Pd(S[l], p);
                    }
                    catch (j) {
                        ne(n, n.return, j);
                    }
                }
                h && r & 64 && f0(i), Ln(i, i.return);
                break;
            case 27: (a & 2) !== 0 && y0(i);
            case 5:
                i.tag !== 5 && i.tag !== 27 || h0(i), Sn(l, i, a), h && n === null && r & 4 && Nr(i), Ln(i, i.return);
                break;
            case 6:
                h0(i);
                break;
            case 26:
                p = i.stateNode, i.memoizedState !== null || p === null || ea || vf(au(p.ownerDocument), i.type, p), Sn(l, i, a), h && n === null && r & 4 && Nr(i), Ln(i, i.return);
                break;
            case 12:
                Sn(l, i, a);
                break;
            case 31:
                Sn(l, i, a), h && r & 4 && O0(l, i);
                break;
            case 13:
                Sn(l, i, a), h && r & 4 && _0(l, i);
                break;
            case 22:
                i.memoizedState === null && Sn(l, i, a), Ln(i, i.return);
                break;
            case 30:
                Sn(l, i, a), Ln(i, i.return);
                break;
            case 7: Ln(i, i.return);
            default: Sn(l, i, a);
        }
        e = e.sibling;
    } }
    function Dr(t, e) { var a = null; t !== null && t.memoizedState !== null && t.memoizedState.cachePool !== null && (a = t.memoizedState.cachePool.pool), t = null, e.memoizedState !== null && e.memoizedState.cachePool !== null && (t = e.memoizedState.cachePool.pool), t !== a && (t != null && t.refCount++, a != null && zs(a)); }
    function Lr(t, e) { t = null, e.alternate !== null && (t = e.alternate.memoizedState.cache), e = e.memoizedState.cache, e !== t && (e.refCount++, t != null && zs(t)); }
    function rn(t, e, a, n) { var l = (a & 335544064) === a; if (e.subtreeFlags & (l ? 10262 : 10256))
        for (e = e.child; e !== null;)
            z0(t, e, a, n), e = e.sibling;
    else
        l && E0(e); }
    function z0(t, e, a, n) { var l = (a & 335544064) === a; l && e.alternate === null && e.return !== null && e.return.alternate !== null && fo(e); var i = e.flags; switch (e.tag) {
        case 0:
        case 11:
        case 15:
            rn(t, e, a, n), i & 2048 && Zs(9, e);
            break;
        case 1:
            rn(t, e, a, n);
            break;
        case 3:
            rn(t, e, a, n), l && Mr && (t = t.containerInfo, t = t.nodeType === 9 ? t.body : t.nodeName === "HTML" ? t.ownerDocument.body : t, t.style.viewTransitionName === "root" && (t.style.viewTransitionName = ""), t = t.ownerDocument.documentElement, t !== null && t.style.viewTransitionName === "none" && (t.style.viewTransitionName = "")), i & 2048 && (i = null, e.alternate !== null && (i = e.alternate.memoizedState.cache), e = e.memoizedState.cache, e !== i && (e.refCount++, i != null && zs(i)));
            break;
        case 12:
            if (i & 2048) {
                rn(t, e, a, n), i = e.stateNode;
                try {
                    var r = e.memoizedProps, h = r.id, p = r.onPostCommit;
                    typeof p == "function" && p(h, e.alternate === null ? "mount" : "update", i.passiveEffectDuration, -0);
                }
                catch (S) {
                    ne(e, e.return, S);
                }
            }
            else
                rn(t, e, a, n);
            break;
        case 31:
            rn(t, e, a, n);
            break;
        case 13:
            rn(t, e, a, n);
            break;
        case 23: break;
        case 22:
            r = e.stateNode, h = e.alternate, e.memoizedState !== null ? (l && h !== null && h.memoizedState === null && fo(h), r._visibility & 2 ? rn(t, e, a, n) : Ks(t, e)) : (l && h !== null && h.memoizedState !== null && fo(e), r._visibility & 2 ? rn(t, e, a, n) : (r._visibility |= 2, Gi(t, e, a, n, (e.subtreeFlags & 10256) !== 0 || !1))), i & 2048 && Dr(h, e);
            break;
        case 24:
            rn(t, e, a, n), i & 2048 && Lr(e.alternate, e);
            break;
        case 30:
            l && (i = e.alternate, i !== null && (Hn(i.child, !0), Hn(e.child, !0))), rn(t, e, a, n);
            break;
        default: rn(t, e, a, n);
    } }
    function Gi(t, e, a, n, l) { for (l = l && ((e.subtreeFlags & 10256) !== 0 || !1), e = e.child; e !== null;) {
        var i = t, r = e, h = a, p = n, S = r.flags;
        switch (r.tag) {
            case 0:
            case 11:
            case 15:
                Gi(i, r, h, p, l), Zs(8, r);
                break;
            case 23: break;
            case 22:
                var j = r.stateNode;
                r.memoizedState !== null ? j._visibility & 2 ? Gi(i, r, h, p, l) : Ks(i, r) : (j._visibility |= 2, Gi(i, r, h, p, l)), l && S & 2048 && Dr(r.alternate, r);
                break;
            case 24:
                Gi(i, r, h, p, l), l && S & 2048 && Lr(r.alternate, r);
                break;
            default: Gi(i, r, h, p, l);
        }
        e = e.sibling;
    } }
    function Ks(t, e) { if (e.subtreeFlags & 10256)
        for (e = e.child; e !== null;) {
            var a = t, n = e, l = n.flags;
            switch (n.tag) {
                case 22:
                    Ks(a, n), l & 2048 && Dr(n.alternate, n);
                    break;
                case 24:
                    Ks(a, n), l & 2048 && Lr(n.alternate, n);
                    break;
                default: Ks(a, n);
            }
            e = e.sibling;
        } }
    var ri = 8192;
    function fi(t, e, a) { if (t.subtreeFlags & ri)
        for (t = t.child; t !== null;)
            C0(t, e, a), t = t.sibling; }
    function C0(t, e, a) { switch (t.tag) {
        case 26:
            fi(t, e, a), t.flags & ri && (t.memoizedState !== null ? Cg(a, Nn, t.memoizedState, t.memoizedProps) : (t = t.stateNode, (e & 335544128) === e && qm(a, t)));
            break;
        case 5:
            fi(t, e, a), t.flags & ri && (t = t.stateNode, (e & 335544128) === e && qm(a, t));
            break;
        case 3:
        case 4:
            var n = Nn;
            Nn = au(t.stateNode.containerInfo), fi(t, e, a), Nn = n;
            break;
        case 22:
            t.memoizedState === null && (n = t.alternate, n !== null && n.memoizedState !== null ? (n = ri, ri = 16777216, fi(t, e, a), ri = n) : fi(t, e, a));
            break;
        case 30:
            if ((t.flags & ri) !== 0 && (n = t.memoizedProps.name, n != null && n !== "auto")) {
                var l = t.stateNode;
                l.paired = null, Xa === null && (Xa = new Map), Xa.set(n, l);
            }
            fi(t, e, a);
            break;
        default: fi(t, e, a);
    } }
    function D0(t) { var e = t.alternate; if (e !== null && (t = e.child, t !== null)) {
        e.child = null;
        do
            e = t.sibling, t.sibling = null, t = e;
        while (t !== null);
    } }
    function Fs(t) { var e = t.deletions; if ((t.flags & 16) !== 0) {
        if (e !== null)
            for (var a = 0; a < e.length; a++) {
                var n = e[a];
                aa = n, U0(n, t);
            }
        D0(t);
    } if (t.subtreeFlags & 10256)
        for (t = t.child; t !== null;)
            L0(t), t = t.sibling; }
    function L0(t) { switch (t.tag) {
        case 0:
        case 11:
        case 15:
            Fs(t), t.flags & 2048 && wl(9, t, t.return);
            break;
        case 3:
            Fs(t);
            break;
        case 12:
            Fs(t);
            break;
        case 22:
            var e = t.stateNode;
            t.memoizedState !== null && e._visibility & 2 && (t.return === null || t.return.tag !== 13) ? (e._visibility &= -3, po(t)) : Fs(t);
            break;
        default: Fs(t);
    } }
    function po(t) { var e = t.deletions; if ((t.flags & 16) !== 0) {
        if (e !== null)
            for (var a = 0; a < e.length; a++) {
                var n = e[a];
                aa = n, U0(n, t);
            }
        D0(t);
    } for (t = t.child; t !== null;) {
        switch (e = t, e.tag) {
            case 0:
            case 11:
            case 15:
                wl(8, e, e.return), po(e);
                break;
            case 22:
                a = e.stateNode, a._visibility & 2 && (a._visibility &= -3, po(e));
                break;
            default: po(e);
        }
        t = t.sibling;
    } }
    function U0(t, e) { for (; aa !== null;) {
        var a = aa;
        switch (a.tag) {
            case 0:
            case 11:
            case 15:
                wl(8, a, e);
                break;
            case 23:
            case 22:
                if (a.memoizedState !== null && a.memoizedState.cachePool !== null) {
                    var n = a.memoizedState.cachePool.pool;
                    n != null && n.refCount++;
                }
                break;
            case 24: zs(a.memoizedState.cache);
        }
        if (n = a.child, n !== null)
            n.return = a, aa = n;
        else
            t: for (a = t; aa !== null;) {
                n = aa;
                var l = n.sibling, i = n.return;
                if (A0(n), n === a) {
                    aa = null;
                    break t;
                }
                if (l !== null) {
                    l.return = i, aa = l;
                    break t;
                }
                aa = i;
            }
    } }
    var _p = { getCacheForType: function (t) { var e = la(Ye), a = e.data.get(t); return a === void 0 && (a = t(), e.data.set(t, a)), a; }, cacheSignal: function () { return la(Ye).controller.signal; } }, Rp = typeof WeakMap == "function" ? WeakMap : Map, It = 0, me = null, Ht = null, qt = 0, ae = 0, Za = null, _l = !1, Bi = !1, Ur = !1, ul = 0, je = 0, Rl = 0, di = 0, go = 0, Qa = 0, qi = 0, Js = null, Da = null, Hr = !1, vo = 0, H0 = 0, bo = 1 / 0, Eo = null, jl = null, xe = 0, Tn = null, hi = null, Yn = 0, Gr = 0, Br = null, G0 = null, Yi = null, ki = null, Vi = null, Ws = 0, No = null;
    function Ia() { return (It & 2) !== 0 && qt !== 0 ? qt & -qt : V.T !== null ? Fr() : Ce(); }
    function B0() { if (Qa === 0)
        if ((qt & 536870912) === 0 || jt) {
            var t = gn;
            gn <<= 1, (gn & 3932160) === 0 && (gn = 262144), Qa = t;
        }
        else
            Qa = 536870912; return t = ia.current, t !== null && (t.flags |= 32), Qa; }
    function Xi(t, e) { if (e != null) {
        var a = t.stateNode, n = a.ref;
        n === null && (n = a.ref = bm(Wn(t.memoizedProps, a))), ki === null && (ki = []), ki.push(e.bind(null, n));
    } }
    function La(t, e, a) { (t === me && (ae === 2 || ae === 9) || t.cancelPendingCommit !== null) && (Zi(t, 0), Ml(t, qt, Qa, !1)), B(t, a), ((It & 2) === 0 || t !== me) && (t === me && ((It & 2) === 0 && (di |= a), je === 4 && Ml(t, qt, Qa, !1)), kn(t)); }
    function q0(t, e, a) { if ((It & 6) !== 0)
        throw Error(o(327)); var n = !a && (e & 127) === 0 && (e & t.expiredLanes) === 0 || Kn(t, e), l = n ? zp(t, e) : Yr(t, e, !0), i = n; do {
        if (l === 0) {
            Bi && !n && Ml(t, e, 0, !1);
            break;
        }
        else {
            if (a = t.current.alternate, i && !jp(a)) {
                l = Yr(t, e, !1), i = !1;
                continue;
            }
            if (l === 2) {
                if (i = e, t.errorRecoveryDisabledLanes & i)
                    var r = 0;
                else
                    r = t.pendingLanes & -536870913, r = r !== 0 ? r : r & 536870912 ? 536870912 : 0;
                if (r !== 0) {
                    e = r;
                    t: {
                        var h = t;
                        l = Js;
                        var p = h.current.memoizedState.isDehydrated;
                        if (p && (Zi(h, r).flags |= 256), r = Yr(h, r, !1), r !== 2 && r !== 6) {
                            if (Ur && !p) {
                                h.errorRecoveryDisabledLanes |= i, di |= i, l = 4;
                                break t;
                            }
                            i = Da, Da = l, i !== null && (Da === null ? Da = i : Da.push.apply(Da, i));
                        }
                        l = r;
                    }
                    if (i = !1, l !== 2)
                        continue;
                }
            }
            if (l === 1) {
                Zi(t, 0), Ml(t, e, 0, !0);
                break;
            }
            t: {
                switch (n = t, i = l, i) {
                    case 0:
                    case 1: throw Error(o(345));
                    case 4: if ((e & 4194048) !== e && (e & 62914560) !== e)
                        break;
                    case 6:
                        Ml(n, e, Qa, !_l);
                        break t;
                    case 2:
                        Da = null;
                        break;
                    case 3:
                    case 5: break;
                    default: throw Error(o(329));
                }
                if ((e & 62914560) === e && (l = vo + 300 - Ie(), 10 < l)) {
                    if (Ml(n, e, Qa, !_l), jn(n, 0, !0) !== 0)
                        break t;
                    Yn = e, n.timeoutHandle = uf(Y0.bind(null, n, a, Da, Eo, Hr, e, Qa, di, qi, _l, i, "Throttled", -0, 0), l);
                    break t;
                }
                Y0(n, a, Da, Eo, Hr, e, Qa, di, qi, _l, i, null, -0, 0);
            }
        }
        break;
    } while (!0); kn(t); }
    function Y0(t, e, a, n, l, i, r, h, p, S, j, H, b, _) { t.timeoutHandle = -1; var W = e.subtreeFlags, ut = (i & 335544064) === i; if (H = null, (ut || W & 8192 || (W & 16785408) === 16785408) && (H = { stylesheets: null, count: 0, imgCount: 0, imgBytes: 0, suspenseyImages: [], waitingForImages: !0, waitingForViewTransition: !1, unsuspend: ja }, Xa = null, C0(e, i, H), ut && (W = H, ut = t.containerInfo, ut = (ut.nodeType === 9 ? ut : ut.ownerDocument).__reactViewTransition, ut != null && (W.count++, W.waitingForViewTransition = !0, W = iu.bind(W), ut.finished.then(W, W))), W = (i & 62914560) === i ? vo - Ie() : (i & 4194048) === i ? H0 - Ie() : 0, W = Dg(H, W), W !== null)) {
        Yn = i, t.cancelPendingCommit = W(F0.bind(null, t, e, i, a, n, l, r, h, p, S, j, H, null, b, _)), Ml(t, i, r, !S);
        return;
    } F0(t, e, i, a, n, l, r, h, p, S, j, H); }
    function jp(t) { for (var e = t;;) {
        var a = e.tag;
        if ((a === 0 || a === 11 || a === 15) && e.flags & 16384 && (a = e.updateQueue, a !== null && (a = a.stores, a !== null)))
            for (var n = 0; n < a.length; n++) {
                var l = a[n], i = l.getSnapshot;
                l = l.value;
                try {
                    if (!ka(i(), l))
                        return !1;
                }
                catch {
                    return !1;
                }
            }
        if (a = e.child, e.subtreeFlags & 16384 && a !== null)
            a.return = e, e = a;
        else {
            if (e === t)
                break;
            for (; e.sibling === null;) {
                if (e.return === null || e.return === t)
                    return !0;
                e = e.return;
            }
            e.sibling.return = e.return, e = e.sibling;
        }
    } return !0; }
    function Ml(t, e, a, n) { e = vs(t, e), e &= ~go, e &= ~di, t.suspendedLanes |= e, t.pingedLanes &= ~e, n && (t.warmLanes |= e), n = t.expirationTimes; for (var l = e; 0 < l;) {
        var i = 31 - Ke(l), r = 1 << i;
        n[i] = -1, l &= ~r;
    } a !== 0 && X(t, a, e); }
    function So() { return (It & 6) === 0 ? ($s(0), !1) : !0; }
    function qr() { if (Ht !== null) {
        if (ae === 0)
            var t = Ht.return;
        else
            t = Ht, el = ti = null, Kc(t), Mi = null, Ls = 0, t = Ht;
        for (; t !== null;)
            r0(t.alternate, t), t = t.return;
        Ht = null;
    } }
    function Zi(t, e) { var a = t.timeoutHandle; return a !== -1 && (t.timeoutHandle = -1, tg(a)), a = t.cancelPendingCommit, a !== null && (t.cancelPendingCommit = null, a()), Yn = 0, qr(), me = t, Ht = a = Pn(t.current, null), qt = e, ae = 0, Za = null, _l = !1, Bi = Kn(t, e), Ur = !1, qi = Qa = go = di = Rl = je = 0, Da = Js = null, Hr = !1, ul = vs(t, e), Ru(), a; }
    function k0(t, e) { Ot = null, V.H = to, e === ji || e === qu ? (e = Fd(), ae = 3) : e === Lc ? (e = Fd(), ae = 4) : ae = e === cr ? 8 : e !== null && typeof e == "object" && typeof e.then == "function" ? 6 : 1, Za = e, Ht === null && (je = 1, eo(t, sn(e, t.current))); }
    function V0() { var t = ia.current; return t === null ? !0 : (qt & 4194048) === qt ? ha === null : (qt & 62914560) === qt || (qt & 536870912) !== 0 ? t === ha : !1; }
    function X0() { var t = V.H; return V.H = to, t === null ? to : t; }
    function Z0() { var t = V.A; return V.A = _p, t; }
    function To() { je = 4, _l || (qt & 4194048) !== qt && ia.current !== null || (Bi = !0), (Rl & 134217727) === 0 && (di & 134217727) === 0 || me === null || Ml(me, qt, Qa, !1); }
    function Yr(t, e, a) { var n = It; It |= 2; var l = X0(), i = Z0(); (me !== t || qt !== e) && (Eo = null, Zi(t, e)), e = !1; var r = je; t: do
        try {
            if (ae !== 0 && Ht !== null) {
                var h = Ht, p = Za;
                switch (ae) {
                    case 8:
                        qr(), r = 6;
                        break t;
                    case 3:
                    case 2:
                    case 9:
                    case 6:
                        ia.current === null && (e = !0);
                        var S = ae;
                        if (ae = 0, Za = null, Qi(t, h, p, S), a && Bi) {
                            r = 0;
                            break t;
                        }
                        break;
                    default: S = ae, ae = 0, Za = null, Qi(t, h, p, S);
                }
            }
            Mp(), r = je;
            break;
        }
        catch (j) {
            k0(t, j);
        }
    while (!0); return e && t.shellSuspendCounter++, el = ti = null, It = n, V.H = l, V.A = i, Ht === null && (me = null, qt = 0, Ru()), r; }
    function Mp() { for (; Ht !== null;)
        Q0(Ht); }
    function zp(t, e) { var a = It; It |= 2; var n = X0(), l = Z0(); me !== t || qt !== e ? (Eo = null, bo = Ie() + 500, Zi(t, e)) : Bi = Kn(t, e); t: do
        try {
            if (ae !== 0 && Ht !== null) {
                e = Ht;
                var i = Za;
                e: switch (ae) {
                    case 1:
                        ae = 0, Za = null, Qi(t, e, i, 1);
                        break;
                    case 2:
                    case 9:
                        if (Id(i)) {
                            ae = 0, Za = null, I0(e);
                            break;
                        }
                        e = function () { ae !== 2 && ae !== 9 || me !== t || (ae = 7), kn(t); }, i.then(e, e);
                        break t;
                    case 3:
                        ae = 7;
                        break t;
                    case 4:
                        ae = 5;
                        break t;
                    case 7:
                        Id(i) ? (ae = 0, Za = null, I0(e)) : (ae = 0, Za = null, Qi(t, e, i, 7));
                        break;
                    case 5:
                        var r = null;
                        switch (Ht.tag) {
                            case 26: r = Ht.memoizedState;
                            case 5:
                            case 27:
                                var h = Ht;
                                if (r ? Gm(r) : h.stateNode.complete) {
                                    ae = 0, Za = null;
                                    var p = h.sibling;
                                    if (p !== null)
                                        Ht = p;
                                    else {
                                        var S = h.return;
                                        S !== null ? (Ht = S, xo(S)) : Ht = null;
                                    }
                                    break e;
                                }
                        }
                        ae = 0, Za = null, Qi(t, e, i, 5);
                        break;
                    case 6:
                        ae = 0, Za = null, Qi(t, e, i, 6);
                        break;
                    case 8:
                        qr(), je = 6;
                        break t;
                    default: throw Error(o(462));
                }
            }
            Cp();
            break;
        }
        catch (j) {
            k0(t, j);
        }
    while (!0); return el = ti = null, V.H = n, V.A = l, It = a, Ht !== null ? 0 : (me = null, qt = 0, Ru(), je); }
    function Cp() { for (; Ht !== null && !Qn();)
        Q0(Ht); }
    function Q0(t) { var e = o0(t.alternate, t, ul); t.memoizedProps = t.pendingProps, e === null ? xo(t) : Ht = e; }
    function I0(t) { var e = t, a = e.alternate; switch (e.tag) {
        case 15:
        case 0:
            e = e0(a, e, e.pendingProps, e.type, void 0, qt);
            break;
        case 11:
            e = e0(a, e, e.pendingProps, e.type.render, e.ref, qt);
            break;
        case 5:
            Kc(e);
            var n = e;
            n === ta && (jt ? (Lu(n), n.tag === 5 && n.stateNode != null && (pe = n.stateNode)) : (Lu(n), jt = !0));
        default: r0(a, e), e = Ht = Ud(e, ul), e = o0(a, e, ul);
    } t.memoizedProps = t.pendingProps, e === null ? xo(t) : Ht = e; }
    function Qi(t, e, a, n) { el = ti = null, Kc(e), Mi = null, Ls = 0; var l = e.return; try {
        if (Ep(t, l, e, a, qt)) {
            je = 1, eo(t, sn(a, t.current)), Ht = null;
            return;
        }
    }
    catch (i) {
        if (l !== null)
            throw Ht = l, i;
        je = 1, eo(t, sn(a, t.current)), Ht = null;
        return;
    } e.flags & 32768 ? (jt || n === 1 ? t = !0 : Bi || (qt & 536870912) !== 0 ? t = !1 : (_l = t = !0, (n === 2 || n === 9 || n === 3 || n === 6) && (n = ia.current, n !== null && n.tag === 13 && (n.flags |= 16384))), K0(e, t)) : xo(e); }
    function xo(t) { var e = t; do {
        if ((e.flags & 32768) !== 0) {
            K0(e, _l);
            return;
        }
        t = e.return;
        var a = xp(e.alternate, e, ul);
        if (a !== null) {
            Ht = a;
            return;
        }
        if (e = e.sibling, e !== null) {
            Ht = e;
            return;
        }
        Ht = e = t;
    } while (e !== null); je === 0 && (je = 5); }
    function K0(t, e) { do {
        var a = Ap(t.alternate, t);
        if (a !== null) {
            a.flags &= 32767, Ht = a;
            return;
        }
        if (a = t.return, a !== null && (a.flags |= 32768, a.subtreeFlags = 0, a.deletions = null), !e && (t = t.sibling, t !== null)) {
            Ht = t;
            return;
        }
        Ht = t = a;
    } while (t !== null); je = 6, Ht = null; }
    function F0(t, e, a, n, l, i, r, h, p, S, j, H) { t.cancelPendingCommit = null; do
        Ao();
    while (xe !== 0); if ((It & 6) !== 0)
        throw Error(o(327)); if (e !== null) {
        if (e === t.current)
            throw Error(o(177));
        t === me && (Ht = me = null, qt = 0), hi = e, Tn = t, Yn = a, Br = l, G0 = n, Dp(t, e, a, r, h, p, H);
    } }
    function Dp(t, e, a, n, l, i, r) { var h = e.lanes | e.childLanes; if (Gr = h, h |= Sc, k(t, a, h, n, l, i), ki = null, (a & 335544064) === a ? (Vi = op(t), n = 10262) : (Vi = null, n = 10256), (e.subtreeFlags & n) !== 0 || (e.flags & n) !== 0 ? (t.callbackNode = null, t.callbackPriority = 0, qp(Wa, function () { return Zr(), null; })) : (t.callbackNode = null, t.callbackPriority = 0), co = !1, n = (e.flags & 13878) !== 0, (e.subtreeFlags & 13878) !== 0 || n) {
        n = V.T, V.T = null, l = lt.p, lt.p = 2, i = It, It |= 4;
        try {
            wp(t, e, a);
        }
        finally {
            It = i, lt.p = l, V.T = n;
        }
    } xe = 1, co ? Yi = sg(r, t.containerInfo, Vi, kr, Vr, Up, Xr, Zr, Lp) : (kr(), Vr(), Xr()); }
    function Lp(t) { if (xe !== 0) {
        var e = Tn.onRecoverableError;
        e(t, { componentStack: null });
    } }
    function Up() { xe === 3 && (xe = 0, M0(hi, Tn), xe = 4); }
    function kr() { if (xe === 1) {
        xe = 0;
        var t = Tn, e = hi, a = Yn, n = (e.flags & 13878) !== 0;
        if ((e.subtreeFlags & 13878) !== 0 || n) {
            n = V.T, V.T = null;
            var l = lt.p;
            lt.p = 2;
            var i = It;
            It |= 4;
            try {
                Is = ho = !1, R0(e, t, a), a = nf;
                var r = wd(t.containerInfo), h = a.focusedElem, p = a.selectionRange;
                if (r !== h && h && h.ownerDocument && Ad(h.ownerDocument.documentElement, h)) {
                    if (p !== null && gc(h)) {
                        var S = p.start, j = p.end;
                        if (j === void 0 && (j = S), "selectionStart" in h)
                            h.selectionStart = S, h.selectionEnd = Math.min(j, h.value.length);
                        else {
                            var H = h.ownerDocument || document, b = H && H.defaultView || window;
                            if (b.getSelection) {
                                var _ = b.getSelection(), W = h.textContent.length, ut = Math.min(p.start, W), _t = p.end === void 0 ? ut : Math.min(p.end, W);
                                !_.extend && ut > _t && (r = _t, _t = ut, ut = r);
                                var N = xd(h, ut), v = xd(h, _t);
                                if (N && v && (_.rangeCount !== 1 || _.anchorNode !== N.node || _.anchorOffset !== N.offset || _.focusNode !== v.node || _.focusOffset !== v.offset)) {
                                    var w = H.createRange();
                                    w.setStart(N.node, N.offset), _.removeAllRanges(), ut > _t ? (_.addRange(w), _.extend(v.node, v.offset)) : (w.setEnd(v.node, v.offset), _.addRange(w));
                                }
                            }
                        }
                    }
                    for (H = [], _ = h; _ = _.parentNode;)
                        _.nodeType === 1 && H.push({ element: _, left: _.scrollLeft, top: _.scrollTop });
                    for (typeof h.focus == "function" && h.focus(), h = 0; h < H.length; h++) {
                        var U = H[h];
                        U.element.scrollLeft = U.left, U.element.scrollTop = U.top;
                    }
                }
                ts = !!af, nf = af = null;
            }
            finally {
                It = i, lt.p = l, V.T = n;
            }
        }
        t.current = e, xe = 2;
    } }
    function Vr() { if (xe === 2) {
        xe = 0;
        var t = Tn, e = hi, a = (e.flags & 8772) !== 0;
        if ((e.subtreeFlags & 8772) !== 0 || a) {
            a = V.T, V.T = null;
            var n = lt.p;
            lt.p = 2;
            var l = It;
            It |= 4;
            try {
                T0(t, e.alternate, e);
            }
            finally {
                It = l, lt.p = n, V.T = a;
            }
        }
        xe = 3;
    } }
    function Xr() { if (xe === 4 || xe === 3) {
        xe = 0;
        var t = Yi;
        Yi = null, In();
        var e = Tn, a = hi, n = Yn, l = G0, i = (n & 335544064) === n ? 10262 : 10256;
        if ((a.subtreeFlags & i) !== 0 || (a.flags & i) !== 0 ? xe = 5 : (xe = 0, hi = Tn = null, J0(e, e.pendingLanes)), i = e.pendingLanes, i === 0 && (jl = null), Jt(n), a = a.stateNode, ze && typeof ze.onCommitFiberRoot == "function")
            try {
                ze.onCommitFiberRoot(Pa, a, void 0, (a.current.flags & 128) === 128);
            }
            catch { }
        if (l !== null) {
            a = V.T, i = lt.p, lt.p = 2, V.T = null;
            try {
                for (var r = e.onRecoverableError, h = 0; h < l.length; h++) {
                    var p = l[h];
                    r(p.value, { componentStack: p.stack });
                }
            }
            finally {
                V.T = a, lt.p = i;
            }
        }
        if (l = ki, r = Vi, Vi = null, l !== null && (ki = null, r === null && (r = []), t !== null))
            for (p = 0; p < l.length; p++)
                a = (0, l[p])(r), a !== void 0 && t.finished.finally(a);
        (Yn & 3) !== 0 && Ao(), kn(e), i = e.pendingLanes, (n & 261930) !== 0 && (i & 42) !== 0 ? e === No ? Ws++ : (Ws = 0, No = e) : (Ws = 0, No = null), $s(0);
    } }
    function J0(t, e) { (t.pooledCacheLanes &= e) === 0 && (e = t.pooledCache, e != null && (t.pooledCache = null, zs(e))); }
    function Ao() { return Yi !== null && (Yi.skipTransition(), Yi = null), kr(), Vr(), Xr(), Zr(); }
    function Zr() { if (xe !== 5)
        return !1; var t = Tn, e = Gr; Gr = 0; var a = Jt(Yn), n = V.T, l = lt.p; try {
        lt.p = 32 > a ? 32 : a, V.T = null, a = Br, Br = null;
        var i = Tn, r = Yn;
        if (xe = 0, hi = Tn = null, Yn = 0, (It & 6) !== 0)
            throw Error(o(331));
        var h = It;
        if (It |= 4, L0(i.current), z0(i, i.current, r, a), It = h, $s(0, !1), ze && typeof ze.onPostCommitFiberRoot == "function")
            try {
                ze.onPostCommitFiberRoot(Pa, i);
            }
            catch { }
        return !0;
    }
    finally {
        lt.p = l, V.T = n, J0(t, e);
    } }
    function W0(t, e, a) { e = sn(a, e), e = or(t.stateNode, e, 2), t = Sl(t, e, 2), t !== null && (B(t, 2), kn(t)); }
    function ne(t, e, a) { if (t.tag === 3)
        W0(t, t, a);
    else
        for (; e !== null;) {
            if (e.tag === 3) {
                W0(e, t, a);
                break;
            }
            else if (e.tag === 1) {
                var n = e.stateNode;
                if (typeof e.type.getDerivedStateFromError == "function" || typeof n.componentDidCatch == "function" && (jl === null || !jl.has(n))) {
                    t = sn(a, t), a = Ih(2), n = Sl(e, a, 2), n !== null && (Kh(a, n, e, t), B(n, 2), kn(n));
                    break;
                }
            }
            e = e.return;
        } }
    function Qr(t, e, a) { var n = t.pingCache; if (n === null) {
        n = t.pingCache = new Rp;
        var l = new Set;
        n.set(e, l);
    }
    else
        l = n.get(e), l === void 0 && (l = new Set, n.set(e, l)); l.has(a) || (Ur = !0, l.add(a), t = Hp.bind(null, t, e, a), e.then(t, t)); }
    function Hp(t, e, a) { var n = t.pingCache; n !== null && n.delete(e), t.pingedLanes |= t.suspendedLanes & a, t.warmLanes &= ~a, me === t && (qt & a) === a && ((je === 4 || je === 3 && (qt & 62914560) === qt && 300 > Ie() - vo) && (It & 2) === 0 ? Zi(t, 0) : go |= a, qi === qt && (qi = 0)), kn(t); }
    function $0(t, e) { e === 0 && (e = ac()), t = Wl(t, e), t !== null && (B(t, e), kn(t)); }
    function Gp(t) { var e = t.memoizedState, a = 0; e !== null && (a = e.retryLane), $0(t, a); }
    function Bp(t, e) { var a = 0; switch (t.tag) {
        case 31:
        case 13:
            var n = t.stateNode, l = t.memoizedState;
            l !== null && (a = l.retryLane);
            break;
        case 19:
            n = t.stateNode;
            break;
        case 22:
            n = t.stateNode._retryCache;
            break;
        default: throw Error(o(314));
    } n !== null && n.delete(e), $0(t, a); }
    function qp(t, e) { return pn(t, e); }
    var Ii = null, Ki = null, Ir = !1, wo = !1, Kr = !1, zl = 0;
    function kn(t) { t !== Ki && t.next === null && (Ki === null ? Ii = Ki = t : Ki = Ki.next = t), wo = !0, Ir || (Ir = !0, kp()); }
    function $s(t, e) { if (!Kr && wo) {
        Kr = !0;
        do
            for (var a = !1, n = Ii; n !== null;) {
                if (t !== 0) {
                    var l = n.pendingLanes;
                    if (l === 0)
                        var i = 0;
                    else {
                        var r = n.suspendedLanes, h = n.pingedLanes;
                        i = (1 << 31 - Ke(42 | t) + 1) - 1, i &= l & ~(r & ~h), i = i & 201326741 ? i & 201326741 | 1 : i ? i | 2 : 0;
                    }
                    i !== 0 && (a = !0, am(n, i));
                }
                else
                    i = qt, i = jn(n, n === me ? i : 0, n.cancelPendingCommit !== null || n.timeoutHandle !== -1), (i & 3) === 0 || Kn(n, i) || (a = !0, am(n, i));
                n = n.next;
            }
        while (a);
        Kr = !1;
    } }
    function Yp() { P0(); }
    function P0() { wo = Ir = !1; var t = 0; zl !== 0 && Pp() && (t = zl); for (var e = Ie(), a = null, n = Ii; n !== null;) {
        var l = n.next, i = tm(n, e);
        i === 0 ? (n.next = null, a === null ? Ii = l : a.next = l, l === null && (Ki = a)) : (a = n, (t !== 0 || (i & 3) !== 0) && (wo = !0)), n = l;
    } xe !== 0 && xe !== 5 || $s(t), zl !== 0 && (zl = 0); }
    function tm(t, e) { for (var a = t.suspendedLanes, n = t.pingedLanes, l = t.expirationTimes, i = t.pendingLanes & -62914561; 0 < i;) {
        var r = 31 - Ke(i), h = 1 << r, p = l[r];
        p === -1 ? ((h & a) === 0 || (h & n) !== 0) && (l[r] = bs(h, e)) : p <= e && (t.expiredLanes |= h), i &= ~h;
    } if (e = me, a = qt, a = jn(t, t === e ? a : 0, t.cancelPendingCommit !== null || t.timeoutHandle !== -1), n = t.callbackNode, a === 0 || t === e && (ae === 2 || ae === 9) || t.cancelPendingCommit !== null)
        return n !== null && n !== null && _n(n), t.callbackNode = null, t.callbackPriority = 0; if ((a & 3) === 0 || Kn(t, a)) {
        if (e = a & -a, e === t.callbackPriority)
            return e;
        switch (n !== null && _n(n), Jt(a)) {
            case 2:
            case 8:
                a = Rn;
                break;
            case 32:
                a = Wa;
                break;
            case 268435456:
                a = we;
                break;
            default: a = Wa;
        }
        return n = em.bind(null, t), a = pn(a, n), t.callbackPriority = e, t.callbackNode = a, e;
    } return n !== null && n !== null && _n(n), t.callbackPriority = 2, t.callbackNode = null, 2; }
    function em(t, e) { if (xe !== 0 && xe !== 5)
        return t.callbackNode = null, t.callbackPriority = 0, null; var a = t.callbackNode; if (Ao() && t.callbackNode !== a)
        return null; var n = qt; return n = jn(t, t === me ? n : 0, t.cancelPendingCommit !== null || t.timeoutHandle !== -1), n === 0 ? null : (q0(t, n, e), tm(t, Ie()), t.callbackNode != null && t.callbackNode === a ? em.bind(null, t) : null); }
    function am(t, e) { if (Ao())
        return null; q0(t, e, !0); }
    function kp() { eg(function () { (It & 6) !== 0 ? pn(pa, Yp) : P0(); }); }
    function Fr() { if (zl === 0) {
        var t = ni;
        t === 0 && (t = ga, ga <<= 1, (ga & 261888) === 0 && (ga = 256)), zl = t;
    } return zl; }
    function nm(t) { return t == null || typeof t == "symbol" || typeof t == "boolean" ? null : typeof t == "function" ? t : dl(t); }
    function Vp(t, e, a, n, l) { if (e === "submit" && a && a.stateNode === l) {
        var i = nm((l[Oe] || null).action), r = n.submitter;
        r && (e = (e = r[Oe] || null) ? nm(e.formAction) : r.getAttribute("formAction"), e !== null && (i = e, r = null));
        var h = new Au("action", "action", null, n, l);
        t.push({ event: h, listeners: [{ instance: null, listener: function () { if (n.defaultPrevented) {
                        if (zl !== 0) {
                            var p = new FormData(l, r);
                            nr(a, { pending: !0, data: p, method: l.method, action: i }, null, p);
                        }
                    }
                    else
                        typeof i == "function" && (h.preventDefault(), p = new FormData(l, r), nr(a, { pending: !0, data: p, method: l.method, action: i }, i, p)); }, currentTarget: l }] });
    } }
    for (var Jr = 0; Jr < Nc.length; Jr++) {
        var Wr = Nc[Jr], Xp = Wr.toLowerCase(), Zp = Wr[0].toUpperCase() + Wr.slice(1);
        bn(Xp, "on" + Zp);
    }
    bn(Rd, "onAnimationEnd"), bn(jd, "onAnimationIteration"), bn(Md, "onAnimationStart"), bn("dblclick", "onDoubleClick"), bn("focusin", "onFocus"), bn("focusout", "onBlur"), bn(tp, "onTransitionRun"), bn(ep, "onTransitionStart"), bn(ap, "onTransitionCancel"), bn(zd, "onTransitionEnd"), vn("onMouseEnter", ["mouseout", "mouseover"]), vn("onMouseLeave", ["mouseout", "mouseover"]), vn("onPointerEnter", ["pointerout", "pointerover"]), vn("onPointerLeave", ["pointerout", "pointerover"]), qa("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" ")), qa("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")), qa("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]), qa("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" ")), qa("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" ")), qa("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
    var Ps = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "), Qp = new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(Ps));
    function lm(t, e) { e = (e & 4) !== 0; for (var a = 0; a < t.length; a++) {
        var n = t[a], l = n.event;
        n = n.listeners;
        t: {
            var i = void 0;
            if (e)
                for (var r = n.length - 1; 0 <= r; r--) {
                    var h = n[r], p = h.instance, S = h.currentTarget;
                    if (h = h.listener, p !== i && l.isPropagationStopped())
                        break t;
                    i = h, l.currentTarget = S;
                    try {
                        i(l);
                    }
                    catch (j) {
                        _u(j);
                    }
                    l.currentTarget = null, i = p;
                }
            else
                for (r = 0; r < n.length; r++) {
                    if (h = n[r], p = h.instance, S = h.currentTarget, h = h.listener, p !== i && l.isPropagationStopped())
                        break t;
                    i = h, l.currentTarget = S;
                    try {
                        i(l);
                    }
                    catch (j) {
                        _u(j);
                    }
                    l.currentTarget = null, i = p;
                }
        }
    } }
    function Gt(t, e) { var a = e[va]; a === void 0 && (a = e[va] = new Set); var n = t + "__bubble"; a.has(n) || (im(e, t, 2, !1), a.add(n)); }
    function $r(t, e, a) { var n = 0; e && (n |= 4), im(a, t, n, e); }
    var Oo = "_reactListening" + Math.random().toString(36).slice(2);
    function Pr(t) { if (!t[Oo]) {
        t[Oo] = !0, gi.forEach(function (a) { a !== "selectionchange" && (Qp.has(a) || $r(a, !1, t), $r(a, !0, t)); });
        var e = t.nodeType === 9 ? t : t.ownerDocument;
        e === null || e[Oo] || (e[Oo] = !0, $r("selectionchange", !1, e));
    } }
    function im(t, e, a, n) { switch (Km(e)) {
        case 2:
            var l = Gg;
            break;
        case 8:
            l = Bg;
            break;
        default: l = Ef;
    } a = l.bind(null, e, a, t), l = void 0, !uc || e !== "touchstart" && e !== "touchmove" && e !== "wheel" || (l = !0), n ? l !== void 0 ? t.addEventListener(e, a, { capture: !0, passive: l }) : t.addEventListener(e, a, !0) : l !== void 0 ? t.addEventListener(e, a, { passive: l }) : t.addEventListener(e, a, !1); }
    function tf(t, e, a, n, l) { var i = n; if ((e & 1) === 0 && (e & 2) === 0 && n !== null)
        t: for (;;) {
            if (n === null)
                return;
            var r = n.tag;
            if (r === 3 || r === 4) {
                var h = n.stateNode.containerInfo;
                if (h === l)
                    break;
                if (r === 4)
                    for (r = n.return; r !== null;) {
                        var p = r.tag;
                        if ((p === 3 || p === 4) && r.stateNode.containerInfo === l)
                            return;
                        r = r.return;
                    }
                for (; h !== null;) {
                    if (r = fa(h), r === null)
                        return;
                    if (p = r.tag, p === 5 || p === 6 || p === 26 || p === 27) {
                        n = i = r;
                        continue t;
                    }
                    h = h.parentNode;
                }
            }
            n = n.return;
        } id(function () { var S = i, j = ic(a), H = []; t: {
        var b = Cd.get(t);
        if (b !== void 0) {
            var _ = Au, W = t;
            switch (t) {
                case "keypress": if (Tu(a) === 0)
                    break t;
                case "keydown":
                case "keyup":
                    _ = jy;
                    break;
                case "focusin":
                    W = "focus", _ = fc;
                    break;
                case "focusout":
                    W = "blur", _ = fc;
                    break;
                case "beforeblur":
                case "afterblur":
                    _ = fc;
                    break;
                case "click": if (a.button === 2)
                    break t;
                case "auxclick":
                case "dblclick":
                case "mousedown":
                case "mousemove":
                case "mouseup":
                case "mouseout":
                case "mouseover":
                case "contextmenu":
                    _ = od;
                    break;
                case "drag":
                case "dragend":
                case "dragenter":
                case "dragexit":
                case "dragleave":
                case "dragover":
                case "dragstart":
                case "drop":
                    _ = vy;
                    break;
                case "touchcancel":
                case "touchend":
                case "touchmove":
                case "touchstart":
                    _ = Ly;
                    break;
                case Rd:
                case jd:
                case Md:
                    _ = Ny;
                    break;
                case zd:
                    _ = Hy;
                    break;
                case "scroll":
                case "scrollend":
                    _ = py;
                    break;
                case "wheel":
                    _ = By;
                    break;
                case "copy":
                case "cut":
                case "paste":
                    _ = Ty;
                    break;
                case "gotpointercapture":
                case "lostpointercapture":
                case "pointercancel":
                case "pointerdown":
                case "pointermove":
                case "pointerout":
                case "pointerover":
                case "pointerup":
                    _ = rd;
                    break;
                case "submit":
                    _ = Cy;
                    break;
                case "toggle":
                case "beforetoggle": _ = Yy;
            }
            var ut = (e & 4) !== 0, _t = !ut && (t === "scroll" || t === "scrollend"), N = ut ? b !== null ? b + "Capture" : null : b;
            ut = [];
            for (var v = S, w; v !== null;) {
                var U = v;
                if (w = U.stateNode, U = U.tag, U !== 5 && U !== 26 && U !== 27 || w === null || N === null || (U = Ns(v, N), U != null && ut.push(tu(v, U, w))), _t)
                    break;
                v = v.return;
            }
            0 < ut.length && (b = new _(b, W, null, a, j), H.push({ event: b, listeners: ut }));
        }
    } if ((e & 7) === 0) {
        t: {
            if (_ = t === "mouseover" || t === "pointerover", b = t === "mouseout" || t === "pointerout", _ && a !== lc && (W = a.relatedTarget || a.fromElement) && (fa(W) || W[$e]))
                break t;
            (b || _) && (W = j.window === j ? j : (_ = j.ownerDocument) ? _.defaultView || _.parentWindow : window, b ? (_ = a.relatedTarget || a.toElement, b = S, _ = _ ? fa(_) : null, _ !== null && (_t = m(_), ut = _.tag, _ !== _t || ut !== 5 && ut !== 27 && ut !== 6) && (_ = null)) : (b = null, _ = S), b !== _ && (ut = od, U = "onMouseLeave", N = "onMouseEnter", v = "mouse", (t === "pointerout" || t === "pointerover") && (ut = rd, U = "onPointerLeave", N = "onPointerEnter", v = "pointer"), _t = b == null ? W : Mn(b), w = _ == null ? W : Mn(_), W = new ut(U, v + "leave", b, a, j), W.target = _t, W.relatedTarget = w, U = null, fa(j) === S && (ut = new ut(N, v + "enter", _, a, j), ut.target = w, ut.relatedTarget = _t, U = ut), _t = U, ut = b && _ ? Nt(b, _, Ip) : null, b !== null && sm(H, W, b, ut, !1), _ !== null && _t !== null && sm(H, _t, _, ut, !0)));
        }
        t: {
            if (b = S ? Mn(S) : window, _ = b.nodeName && b.nodeName.toLowerCase(), _ === "select" || _ === "input" && b.type === "file")
                var nt = vd;
            else if (pd(b))
                if (bd)
                    nt = Wy;
                else {
                    nt = Fy;
                    var Yt = Ky;
                }
            else
                _ = b.nodeName, !_ || _.toLowerCase() !== "input" || b.type !== "checkbox" && b.type !== "radio" ? S && Kl(S.elementType) && (nt = vd) : nt = Jy;
            if (nt && (nt = nt(t, S))) {
                gd(H, nt, a, j);
                break t;
            }
            Yt && Yt(t, b, S);
        }
        switch (Yt = S ? Mn(S) : window, t) {
            case "focusin":
                (pd(Yt) || Yt.contentEditable === "true") && (Si = Yt, vc = S, Rs = null);
                break;
            case "focusout":
                Rs = vc = Si = null;
                break;
            case "mousedown":
                bc = !0;
                break;
            case "contextmenu":
            case "mouseup":
            case "dragend":
                bc = !1, Od(H, a, j);
                break;
            case "selectionchange": if (Py)
                break;
            case "keydown":
            case "keyup": Od(H, a, j);
        }
        var yt;
        if (hc)
            t: {
                switch (t) {
                    case "compositionstart":
                        var bt = "onCompositionStart";
                        break t;
                    case "compositionend":
                        bt = "onCompositionEnd";
                        break t;
                    case "compositionupdate":
                        bt = "onCompositionUpdate";
                        break t;
                }
                bt = void 0;
            }
        else
            Ni ? md(t, a) && (bt = "onCompositionEnd") : t === "keydown" && a.keyCode === 229 && (bt = "onCompositionStart");
        bt && (fd && a.locale !== "ko" && (Ni || bt !== "onCompositionStart" ? bt === "onCompositionEnd" && Ni && (yt = sd()) : (hl = j, oc = "value" in hl ? hl.value : hl.textContent, Ni = !0)), Yt = _o(S, bt), 0 < Yt.length && (bt = new cd(bt, t, null, a, j), H.push({ event: bt, listeners: Yt }), yt ? bt.data = yt : (yt = yd(a), yt !== null && (bt.data = yt)))), (yt = Vy ? Xy(t, a) : Zy(t, a)) && (bt = _o(S, "onBeforeInput"), 0 < bt.length && (Yt = new cd("onBeforeInput", "beforeinput", null, a, j), H.push({ event: Yt, listeners: bt }), Yt.data = yt)), Vp(H, t, S, a, j);
    } lm(H, e); }); }
    function tu(t, e, a) { return { instance: t, listener: e, currentTarget: a }; }
    function _o(t, e) { for (var a = e + "Capture", n = []; t !== null;) {
        var l = t, i = l.stateNode;
        if (l = l.tag, l !== 5 && l !== 26 && l !== 27 || i === null || (l = Ns(t, a), l != null && n.unshift(tu(t, l, i)), l = Ns(t, e), l != null && n.push(tu(t, l, i))), t.tag === 3)
            return n;
        t = t.return;
    } return []; }
    function Ip(t) { if (t === null)
        return null; do
        t = t.return;
    while (t && t.tag !== 5 && t.tag !== 27); return t || null; }
    function sm(t, e, a, n, l) { for (var i = e._reactName, r = []; a !== null && a !== n;) {
        var h = a, p = h.alternate, S = h.stateNode;
        if (h = h.tag, p !== null && p === n)
            break;
        h !== 5 && h !== 26 && h !== 27 || S === null || (p = S, l ? (S = Ns(a, i), S != null && r.unshift(tu(a, S, p))) : l || (S = Ns(a, i), S != null && r.push(tu(a, S, p)))), a = a.return;
    } r.length !== 0 && t.push({ event: e, listeners: r }); }
    var Kp = /\r\n?/g, Fp = /\u0000|\uFFFD/g;
    function um(t) {
        return (typeof t == "string" ? t : "" + t).replace(Kp, `
`).replace(Fp, "");
    }
    function om(t, e) { return e = um(e), um(t) === e; }
    function le(t, e, a, n, l, i) { switch (a) {
        case "children":
            if (typeof n == "string")
                e === "body" || e === "textarea" && n === "" || nn(t, n);
            else if (typeof n == "number" || typeof n == "bigint")
                e !== "body" && nn(t, "" + n);
            else
                return;
            break;
        case "className":
            Pe(t, "class", n);
            break;
        case "tabIndex":
            Pe(t, "tabindex", n);
            break;
        case "dir":
        case "role":
        case "viewBox":
        case "width":
        case "height":
            Pe(t, a, n);
            break;
        case "style":
            Nu(t, n, i);
            return;
        case "data": if (e !== "object") {
            Pe(t, "data", n);
            break;
        }
        case "src":
        case "href":
            if (n === "" && (e !== "a" || a !== "href")) {
                t.removeAttribute(a);
                break;
            }
            if (n == null || typeof n == "function" || typeof n == "symbol" || typeof n == "boolean") {
                t.removeAttribute(a);
                break;
            }
            n = dl(n), t.setAttribute(a, n);
            break;
        case "action":
        case "formAction":
            if (typeof n == "function") {
                t.setAttribute(a, "javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");
                break;
            }
            else
                typeof i == "function" && (a === "formAction" ? (e !== "input" && le(t, e, "name", l.name, l, null), le(t, e, "formEncType", l.formEncType, l, null), le(t, e, "formMethod", l.formMethod, l, null), le(t, e, "formTarget", l.formTarget, l, null)) : (le(t, e, "encType", l.encType, l, null), le(t, e, "method", l.method, l, null), le(t, e, "target", l.target, l, null)));
            if (n == null || typeof n == "symbol" || typeof n == "boolean") {
                t.removeAttribute(a);
                break;
            }
            n = dl(n), t.setAttribute(a, n);
            break;
        case "onClick":
            n != null && (t.onclick = ja);
            return;
        case "onScroll":
            n != null && Gt("scroll", t);
            return;
        case "onScrollEnd":
            n != null && Gt("scrollend", t);
            return;
        case "dangerouslySetInnerHTML":
            if (n != null) {
                if (typeof n != "object" || !("__html" in n))
                    throw Error(o(61));
                if (a = n.__html, a != null) {
                    if (l.children != null)
                        throw Error(o(60));
                    i?.__html !== a && (t.innerHTML = a);
                }
            }
            break;
        case "multiple":
            t.multiple = n && typeof n != "function" && typeof n != "symbol";
            break;
        case "muted":
            t.muted = n && typeof n != "function" && typeof n != "symbol";
            break;
        case "suppressContentEditableWarning":
        case "suppressHydrationWarning":
        case "defaultValue":
        case "defaultChecked":
        case "innerHTML":
        case "ref": break;
        case "autoFocus": break;
        case "xlinkHref":
            if (n == null || typeof n == "function" || typeof n == "boolean" || typeof n == "symbol") {
                t.removeAttribute("xlink:href");
                break;
            }
            a = dl(n), t.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", a);
            break;
        case "contentEditable":
        case "spellCheck":
        case "draggable":
        case "value":
        case "autoReverse":
        case "externalResourcesRequired":
        case "focusable":
        case "preserveAlpha":
            n != null && typeof n != "function" && typeof n != "symbol" ? t.setAttribute(a, n) : t.removeAttribute(a);
            break;
        case "inert":
        case "allowFullScreen":
        case "async":
        case "autoPlay":
        case "controls":
        case "credentialless":
        case "default":
        case "defer":
        case "disabled":
        case "disablePictureInPicture":
        case "disableRemotePlayback":
        case "formNoValidate":
        case "hidden":
        case "loop":
        case "noModule":
        case "noValidate":
        case "open":
        case "playsInline":
        case "readOnly":
        case "required":
        case "reversed":
        case "scoped":
        case "seamless":
        case "itemScope":
            n && typeof n != "function" && typeof n != "symbol" ? t.setAttribute(a, "") : t.removeAttribute(a);
            break;
        case "capture":
        case "download":
            n === !0 ? t.setAttribute(a, "") : n !== !1 && n != null && typeof n != "function" && typeof n != "symbol" ? t.setAttribute(a, n) : t.removeAttribute(a);
            break;
        case "cols":
        case "rows":
        case "size":
        case "span":
            n != null && typeof n != "function" && typeof n != "symbol" && !isNaN(n) && 1 <= n ? t.setAttribute(a, n) : t.removeAttribute(a);
            break;
        case "rowSpan":
        case "start":
            n == null || typeof n == "function" || typeof n == "symbol" || isNaN(n) ? t.removeAttribute(a) : t.setAttribute(a, n);
            break;
        case "popover":
            Gt("beforetoggle", t), Gt("toggle", t), Ge(t, "popover", n);
            break;
        case "xlinkActuate":
            Be(t, "http://www.w3.org/1999/xlink", "xlink:actuate", n);
            break;
        case "xlinkArcrole":
            Be(t, "http://www.w3.org/1999/xlink", "xlink:arcrole", n);
            break;
        case "xlinkRole":
            Be(t, "http://www.w3.org/1999/xlink", "xlink:role", n);
            break;
        case "xlinkShow":
            Be(t, "http://www.w3.org/1999/xlink", "xlink:show", n);
            break;
        case "xlinkTitle":
            Be(t, "http://www.w3.org/1999/xlink", "xlink:title", n);
            break;
        case "xlinkType":
            Be(t, "http://www.w3.org/1999/xlink", "xlink:type", n);
            break;
        case "xmlBase":
            Be(t, "http://www.w3.org/XML/1998/namespace", "xml:base", n);
            break;
        case "xmlLang":
            Be(t, "http://www.w3.org/XML/1998/namespace", "xml:lang", n);
            break;
        case "xmlSpace":
            Be(t, "http://www.w3.org/XML/1998/namespace", "xml:space", n);
            break;
        case "is":
            Ge(t, "is", n);
            break;
        case "innerText":
        case "textContent": return;
        default: if (!(2 < a.length) || a[0] !== "o" && a[0] !== "O" || a[1] !== "n" && a[1] !== "N")
            a = nc.get(a) || a, Ge(t, a, n);
        else
            return;
    } ot = !0; }
    function ef(t, e, a, n, l, i) { switch (a) {
        case "style":
            Nu(t, n, i);
            return;
        case "dangerouslySetInnerHTML":
            if (n != null) {
                if (typeof n != "object" || !("__html" in n))
                    throw Error(o(61));
                if (a = n.__html, a != null) {
                    if (l.children != null)
                        throw Error(o(60));
                    i?.__html !== a && (t.innerHTML = a);
                }
            }
            break;
        case "children":
            if (typeof n == "string")
                nn(t, n);
            else if (typeof n == "number" || typeof n == "bigint")
                nn(t, "" + n);
            else
                return;
            break;
        case "onScroll":
            n != null && Gt("scroll", t);
            return;
        case "onScrollEnd":
            n != null && Gt("scrollend", t);
            return;
        case "onClick":
            n != null && (t.onclick = ja);
            return;
        case "suppressContentEditableWarning":
        case "suppressHydrationWarning":
        case "innerHTML":
        case "ref": return;
        case "innerText":
        case "textContent": return;
        default:
            if (!vi.hasOwnProperty(a))
                t: {
                    if (a[0] === "o" && a[1] === "n" && (l = a.endsWith("Capture"), i = a.slice(2, l ? a.length - 7 : void 0), e = t[Oe] || null, e = e != null ? e[a] : null, typeof e == "function" && t.removeEventListener(i, e, l), typeof n == "function")) {
                        typeof e != "function" && e !== null && (a in t ? t[a] = null : t.hasAttribute(a) && t.removeAttribute(a)), t.addEventListener(i, n, l);
                        break t;
                    }
                    ot = !0, a in t ? t[a] = n : n === !0 ? t.setAttribute(a, "") : Ge(t, a, n);
                }
            return;
    } ot = !0; }
    function oa(t, e, a) { switch (e) {
        case "div":
        case "span":
        case "svg":
        case "path":
        case "a":
        case "g":
        case "p":
        case "li": break;
        case "img":
            Gt("error", t), Gt("load", t);
            var n = !1, l = !1, i;
            for (i in a)
                if (a.hasOwnProperty(i)) {
                    var r = a[i];
                    if (r != null)
                        switch (i) {
                            case "src":
                                n = !0;
                                break;
                            case "srcSet":
                                l = !0;
                                break;
                            case "children":
                            case "dangerouslySetInnerHTML": throw Error(o(137, e));
                            default: le(t, e, i, r, a, null);
                        }
                }
            l && le(t, e, "srcSet", a.srcSet, a, null), n && le(t, e, "src", a.src, a, null);
            return;
        case "input":
            Gt("invalid", t);
            var h = i = r = l = null, p = null, S = null;
            for (n in a)
                if (a.hasOwnProperty(n)) {
                    var j = a[n];
                    if (j != null)
                        switch (n) {
                            case "name":
                                l = j;
                                break;
                            case "type":
                                r = j;
                                break;
                            case "checked":
                                p = j;
                                break;
                            case "defaultChecked":
                                S = j;
                                break;
                            case "value":
                                i = j;
                                break;
                            case "defaultValue":
                                h = j;
                                break;
                            case "children":
                            case "dangerouslySetInnerHTML":
                                if (j != null)
                                    throw Error(o(137, e));
                                break;
                            default: le(t, e, n, j, a, null);
                        }
                }
            Et(t, i, h, p, S, r, l, !1);
            return;
        case "select":
            Gt("invalid", t), n = r = i = null;
            for (l in a)
                if (a.hasOwnProperty(l) && (h = a[l], h != null))
                    switch (l) {
                        case "value":
                            i = h;
                            break;
                        case "defaultValue":
                            r = h;
                            break;
                        case "multiple": n = h;
                        default: le(t, e, l, h, a, null);
                    }
            e = i, a = r, t.multiple = !!n, e != null ? De(t, !!n, e, !1) : a != null && De(t, !!n, a, !0);
            return;
        case "textarea":
            Gt("invalid", t), i = l = n = null;
            for (r in a)
                if (a.hasOwnProperty(r) && (h = a[r], h != null))
                    switch (r) {
                        case "value":
                            n = h;
                            break;
                        case "defaultValue":
                            l = h;
                            break;
                        case "children":
                            i = h;
                            break;
                        case "dangerouslySetInnerHTML":
                            if (h != null)
                                throw Error(o(91));
                            break;
                        default: le(t, e, r, h, a, null);
                    }
            an(t, n, l, i);
            return;
        case "option":
            for (p in a)
                a.hasOwnProperty(p) && (n = a[p], n != null) && (p === "selected" ? t.selected = n && typeof n != "function" && typeof n != "symbol" : le(t, e, p, n, a, null));
            return;
        case "dialog":
            Gt("beforetoggle", t), Gt("toggle", t), Gt("cancel", t), Gt("close", t);
            break;
        case "iframe":
        case "object":
            Gt("load", t);
            break;
        case "video":
        case "audio":
            for (n = 0; n < Ps.length; n++)
                Gt(Ps[n], t);
            break;
        case "image":
            Gt("error", t), Gt("load", t);
            break;
        case "details":
            Gt("toggle", t);
            break;
        case "embed":
        case "source":
        case "link": Gt("error", t), Gt("load", t);
        case "area":
        case "base":
        case "br":
        case "col":
        case "hr":
        case "keygen":
        case "meta":
        case "param":
        case "track":
        case "wbr":
        case "menuitem":
            for (S in a)
                if (a.hasOwnProperty(S) && (n = a[S], n != null))
                    switch (S) {
                        case "children":
                        case "dangerouslySetInnerHTML": throw Error(o(137, e));
                        default: le(t, e, S, n, a, null);
                    }
            return;
        default: if (Kl(e)) {
            for (j in a)
                a.hasOwnProperty(j) && (n = a[j], n !== void 0 && ef(t, e, j, n, a, void 0));
            return;
        }
    } for (h in a)
        a.hasOwnProperty(h) && (n = a[h], n != null && le(t, e, h, n, a, null)); }
    var Jp = {};
    function Wp(t, e, a, n) { switch (e) {
        case "div":
        case "span":
        case "svg":
        case "path":
        case "a":
        case "g":
        case "p":
        case "li": break;
        case "input":
            var l = null, i = null, r = null, h = null, p = null, S = null, j = null;
            for (_ in a) {
                var H = a[_];
                if (a.hasOwnProperty(_) && H != null)
                    switch (_) {
                        case "checked": break;
                        case "value": break;
                        case "defaultValue": p = H;
                        default: n.hasOwnProperty(_) || le(t, e, _, null, n, H);
                    }
            }
            for (var b in n) {
                var _ = n[b];
                if (H = a[b], n.hasOwnProperty(b) && (_ != null || H != null))
                    switch (b) {
                        case "type":
                            _ !== H && (ot = !0), i = _;
                            break;
                        case "name":
                            _ !== H && (ot = !0), l = _;
                            break;
                        case "checked":
                            _ !== H && (ot = !0), S = _;
                            break;
                        case "defaultChecked":
                            _ !== H && (ot = !0), j = _;
                            break;
                        case "value":
                            _ !== H && (ot = !0), r = _;
                            break;
                        case "defaultValue":
                            _ !== H && (ot = !0), h = _;
                            break;
                        case "children":
                        case "dangerouslySetInnerHTML":
                            if (_ != null)
                                throw Error(o(137, e));
                            break;
                        default: _ !== H && le(t, e, b, _, n, H);
                    }
            }
            Ya(t, r, h, p, S, j, i, l);
            return;
        case "select":
            _ = r = h = b = null;
            for (i in a)
                if (p = a[i], a.hasOwnProperty(i) && p != null)
                    switch (i) {
                        case "value": break;
                        case "multiple": _ = p;
                        default: n.hasOwnProperty(i) || le(t, e, i, null, n, p);
                    }
            for (l in n)
                if (i = n[l], p = a[l], n.hasOwnProperty(l) && (i != null || p != null))
                    switch (l) {
                        case "value":
                            i !== p && (ot = !0), b = i;
                            break;
                        case "defaultValue":
                            i !== p && (ot = !0), h = i;
                            break;
                        case "multiple": i !== p && (ot = !0), r = i;
                        default: i !== p && le(t, e, l, i, n, p);
                    }
            e = h, a = r, n = _, b != null ? De(t, !!a, b, !1) : !!n != !!a && (e != null ? De(t, !!a, e, !0) : De(t, !!a, a ? [] : "", !1));
            return;
        case "textarea":
            _ = b = null;
            for (h in a)
                if (l = a[h], a.hasOwnProperty(h) && l != null && !n.hasOwnProperty(h))
                    switch (h) {
                        case "value": break;
                        case "children": break;
                        default: le(t, e, h, null, n, l);
                    }
            for (r in n)
                if (l = n[r], i = a[r], n.hasOwnProperty(r) && (l != null || i != null))
                    switch (r) {
                        case "value":
                            l !== i && (ot = !0), b = l;
                            break;
                        case "defaultValue":
                            l !== i && (ot = !0), _ = l;
                            break;
                        case "children": break;
                        case "dangerouslySetInnerHTML":
                            if (l != null)
                                throw Error(o(91));
                            break;
                        default: l !== i && le(t, e, r, l, n, i);
                    }
            Na(t, b, _);
            return;
        case "option":
            for (var W in a)
                b = a[W], a.hasOwnProperty(W) && b != null && !n.hasOwnProperty(W) && (W === "selected" ? t.selected = !1 : le(t, e, W, null, n, b));
            for (p in n)
                b = n[p], _ = a[p], n.hasOwnProperty(p) && b !== _ && (b != null || _ != null) && (p === "selected" ? (b !== _ && (ot = !0), t.selected = b && typeof b != "function" && typeof b != "symbol") : le(t, e, p, b, n, _));
            return;
        case "img":
        case "link":
        case "area":
        case "base":
        case "br":
        case "col":
        case "embed":
        case "hr":
        case "keygen":
        case "meta":
        case "param":
        case "source":
        case "track":
        case "wbr":
        case "menuitem":
            for (var ut in a)
                b = a[ut], a.hasOwnProperty(ut) && b != null && !n.hasOwnProperty(ut) && le(t, e, ut, null, n, b);
            for (S in n)
                if (b = n[S], _ = a[S], n.hasOwnProperty(S) && b !== _ && (b != null || _ != null))
                    switch (S) {
                        case "children":
                        case "dangerouslySetInnerHTML":
                            if (b != null)
                                throw Error(o(137, e));
                            break;
                        default: le(t, e, S, b, n, _);
                    }
            return;
        default: if (Kl(e)) {
            for (var _t in a)
                b = a[_t], a.hasOwnProperty(_t) && b !== void 0 && !n.hasOwnProperty(_t) && ef(t, e, _t, void 0, n, b);
            for (j in n)
                b = n[j], _ = a[j], !n.hasOwnProperty(j) || b === _ || b === void 0 && _ === void 0 || ef(t, e, j, b, n, _);
            return;
        }
    } for (var N in a)
        b = a[N], a.hasOwnProperty(N) && b != null && !n.hasOwnProperty(N) && le(t, e, N, null, n, b); for (H in n)
        b = n[H], _ = a[H], !n.hasOwnProperty(H) || b === _ || b == null && _ == null || le(t, e, H, b, n, _); }
    function cm(t) { switch (t) {
        case "css":
        case "script":
        case "font":
        case "img":
        case "image":
        case "input":
        case "link": return !0;
        default: return !1;
    } }
    function $p() { if (typeof performance.getEntriesByType == "function") {
        for (var t = 0, e = 0, a = performance.getEntriesByType("resource"), n = 0; n < a.length; n++) {
            var l = a[n], i = l.transferSize, r = l.initiatorType, h = l.duration;
            if (i && h && cm(r)) {
                for (r = 0, h = l.responseEnd, n += 1; n < a.length; n++) {
                    var p = a[n], S = p.startTime;
                    if (S > h)
                        break;
                    var j = p.transferSize, H = p.initiatorType;
                    j && cm(H) && (p = p.responseEnd, r += j * (p < h ? 1 : (h - S) / (p - S)));
                }
                if (--n, e += 8 * (i + r) / (l.duration / 1e3), t++, 10 < t)
                    break;
            }
        }
        if (0 < t)
            return e / t / 1e6;
    } return navigator.connection && (t = navigator.connection.downlink, typeof t == "number") ? t : 5; }
    var af = null, nf = null;
    function eu(t) { return t.nodeType === 9 ? t : t.ownerDocument; }
    function rm(t) { switch (t) {
        case "http://www.w3.org/2000/svg": return 1;
        case "http://www.w3.org/1998/Math/MathML": return 2;
        default: return 0;
    } }
    function fm(t, e) { if (t === 0)
        switch (e) {
            case "svg": return 1;
            case "math": return 2;
            default: return 0;
        } return t === 1 && e === "foreignObject" ? 0 : t; }
    function dm(t, e, a, n) { return a = eu(a).createElement(t), a[he] = n, a[Oe] = e, oa(a, t, e), _e(a), a; }
    function lf(t, e) { return t === "textarea" || t === "noscript" || typeof e.children == "string" || typeof e.children == "number" || typeof e.children == "bigint" || typeof e.dangerouslySetInnerHTML == "object" && e.dangerouslySetInnerHTML !== null && e.dangerouslySetInnerHTML.__html != null; }
    var sf = null;
    function Pp() { var t = window.event; return t && t.type === "popstate" ? t === sf ? !1 : (sf = t, !0) : (sf = null, !1); }
    var uf = typeof setTimeout == "function" ? setTimeout : void 0, tg = typeof clearTimeout == "function" ? clearTimeout : void 0, hm = typeof Promise == "function" ? Promise : void 0, mm = typeof requestAnimationFrame == "function" ? requestAnimationFrame : uf, eg = typeof queueMicrotask == "function" ? queueMicrotask : typeof hm < "u" ? function (t) { return hm.resolve(null).then(t).catch(ag); } : uf;
    function ag(t) { setTimeout(function () { throw t; }); }
    function Cl(t) { return t === "head"; }
    function ym(t, e) { var a = e, n = 0; do {
        var l = a.nextSibling;
        if (t.removeChild(a), l && l.nodeType === 8)
            if (a = l.data, a === "/$" || a === "/&") {
                if (n === 0) {
                    t.removeChild(l), es(e);
                    return;
                }
                n--;
            }
            else if (a === "$" || a === "$?" || a === "$~" || a === "$!" || a === "&")
                n++;
            else if (a === "html")
                yf(t.ownerDocument.documentElement);
            else if (a === "head") {
                a = t.ownerDocument.head, yf(a);
                for (var i = a.firstChild; i;) {
                    var r = i.nextSibling, h = i.nodeName;
                    i[ra] || h === "SCRIPT" || h === "STYLE" || h === "LINK" && i.rel.toLowerCase() === "stylesheet" || a.removeChild(i), i = r;
                }
            }
            else
                a === "body" && yf(t.ownerDocument.body);
        a = l;
    } while (a); es(e); }
    function pm(t, e) { var a = t; t = 0; do {
        var n = a.nextSibling;
        if (a.nodeType === 1 ? e ? (a._stashedDisplay = a.style.display, a.style.display = "none") : (a.style.display = a._stashedDisplay || "", a.getAttribute("style") === "" && a.removeAttribute("style")) : a.nodeType === 3 && (e ? (a._stashedText = a.nodeValue, a.nodeValue = "") : a.nodeValue = a._stashedText || ""), n && n.nodeType === 8)
            if (a = n.data, a === "/$") {
                if (t === 0)
                    break;
                t--;
            }
            else
                a !== "$" && a !== "$?" && a !== "$~" && a !== "$!" || t++;
        a = n;
    } while (a); }
    function gm(t, e, a) { if (e = CSS.escape(e) !== e ? "r-" + btoa(e).replace(/=/g, "") : e, t.style.viewTransitionName = e, a != null && (t.style.viewTransitionClass = a), a = getComputedStyle(t), a.display === "inline") {
        if (e = t.getClientRects(), e.length === 1)
            var n = 1;
        else
            for (var l = n = 0; l < e.length; l++) {
                var i = e[l];
                0 < i.width && 0 < i.height && n++;
            }
        n === 1 && (t = t.style, t.display = e.length === 1 ? "inline-block" : "block", t.marginTop = "-" + a.paddingTop, t.marginBottom = "-" + a.paddingBottom);
    } }
    function vm(t, e) { t = t.style, e = e.style; var a = e != null ? e.hasOwnProperty("viewTransitionName") ? e.viewTransitionName : e.hasOwnProperty("view-transition-name") ? e["view-transition-name"] : null : null; t.viewTransitionName = a == null || typeof a == "boolean" ? "" : ("" + a).trim(), a = e != null ? e.hasOwnProperty("viewTransitionClass") ? e.viewTransitionClass : e.hasOwnProperty("view-transition-class") ? e["view-transition-class"] : null : null, t.viewTransitionClass = a == null || typeof a == "boolean" ? "" : ("" + a).trim(), t.display === "inline-block" && (e == null ? t.display = t.margin = "" : (a = e.display, t.display = a == null || typeof a == "boolean" ? "" : a, a = e.margin, a != null ? t.margin = a : (a = e.hasOwnProperty("marginTop") ? e.marginTop : e["margin-top"], t.marginTop = a == null || typeof a == "boolean" ? "" : a, e = e.hasOwnProperty("marginBottom") ? e.marginBottom : e["margin-bottom"], t.marginBottom = e == null || typeof e == "boolean" ? "" : e))); }
    function ng(t, e, a) { return a = a.ownerDocument.defaultView, { rect: t, abs: e.position === "absolute" || e.position === "fixed", clip: e.clipPath !== "none" || e.overflow !== "visible" || e.filter !== "none" || e.mask !== "none" || e.mask !== "none" || e.borderRadius !== "0px", view: 0 <= t.bottom && 0 <= t.right && t.top <= a.innerHeight && t.left <= a.innerWidth }; }
    function of(t) { var e = t.getBoundingClientRect(), a = getComputedStyle(t); return ng(e, a, t); }
    function lg(t) { return t.documentElement.clientHeight; }
    function ig(t) { this.addEventListener("load", t), this.addEventListener("error", t); }
    function sg(t, e, a, n, l, i, r, h, p) { var S = e.nodeType === 9 ? e : e.ownerDocument; try {
        var j = S.startViewTransition({ update: function () { var b = S.defaultView, _ = b.navigation && b.navigation.transition, W = S.fonts.status; n(); var ut = []; if (W === "loaded" && (lg(S), S.fonts.status === "loading" && ut.push(S.fonts.ready)), W = ut.length, t !== null)
                for (var _t = t.suspenseyImages, N = 0, v = 0; v < _t.length; v++) {
                    var w = _t[v];
                    if (!w.complete) {
                        var U = w.getBoundingClientRect();
                        if (0 < U.bottom && 0 < U.right && U.top < b.innerHeight && U.left < b.innerWidth) {
                            if (N += Bm(w), N > Mo) {
                                ut.length = W;
                                break;
                            }
                            w = new Promise(ig.bind(w)), ut.push(w);
                        }
                    }
                } if (0 < ut.length)
                return b = Promise.race([Promise.all(ut), new Promise(function (nt) { return setTimeout(nt, 500); })]).then(l, l), (_ ? Promise.allSettled([_.finished, b]) : b).then(i, i); if (l(), _)
                return _.finished.then(i, i); i(); }, types: a });
        S.__reactViewTransition = j;
        var H = [];
        return j.ready.then(function () { for (var b = S.documentElement.getAnimations({ subtree: !0 }), _ = 0; _ < b.length; _++) {
            var W = b[_], ut = W.effect, _t = ut.pseudoElement;
            if (_t != null && _t.startsWith("::view-transition")) {
                H.push(W), W = ut.getKeyframes();
                for (var N = _t = void 0, v = !0, w = 0; w < W.length; w++) {
                    var U = W[w], nt = U.width;
                    if (_t === void 0)
                        _t = nt;
                    else if (_t !== nt) {
                        v = !1;
                        break;
                    }
                    if (nt = U.height, N === void 0)
                        N = nt;
                    else if (N !== nt) {
                        v = !1;
                        break;
                    }
                    delete U.width, delete U.height, U.transform === "none" && delete U.transform;
                }
                v && _t !== void 0 && N !== void 0 && (ut.setKeyframes(W), v = getComputedStyle(ut.target, ut.pseudoElement), v.width !== _t || v.height !== N) && (v = W[0], v.width = _t, v.height = N, v = W[W.length - 1], v.width = _t, v.height = N, ut.setKeyframes(W));
            }
        } r(); }, function (b) { S.__reactViewTransition === j && (S.__reactViewTransition = null); try {
            typeof b == "object" && b !== null && b.name === "InvalidStateError" && (b.message === "View transition was skipped because document visibility state is hidden." || b.message === "Skipping view transition because document visibility state has become hidden." || b.message === "Skipping view transition because viewport size changed." || b.message === "Transition was aborted because of invalid state") && (b = null), b !== null && p(b);
        }
        finally {
            n(), l(), r();
        } }), j.finished.finally(function () { for (var b = 0; b < H.length; b++)
            H[b].cancel(); S.__reactViewTransition === j && (S.__reactViewTransition = null), h(); }), j;
    }
    catch {
        return n(), l(), r(), null;
    } }
    function mi(t, e) { this._scope = document.documentElement, this._selector = "::view-transition-" + t + "(" + e + ")"; }
    mi.prototype.animate = function (t, e) { return e = typeof e == "number" ? { duration: e } : q({}, e), e.pseudoElement = this._selector, this._scope.animate(t, e); }, mi.prototype.getAnimations = function () { for (var t = this._scope, e = this._selector, a = t.getAnimations({ subtree: !0 }), n = [], l = 0; l < a.length; l++) {
        var i = a[l].effect;
        i !== null && i.target === t && i.pseudoElement === e && n.push(a[l]);
    } return n; }, mi.prototype.getComputedStyle = function () { return getComputedStyle(this._scope, this._selector); };
    function bm(t) { return { name: t, group: new mi("group", t), imagePair: new mi("image-pair", t), old: new mi("old", t), new: new mi("new", t) }; }
    function Ka(t) { this._fragmentFiber = t, this._observers = this._eventListeners = null; }
    Ka.prototype.addEventListener = function (t, e, a) { var n = null, l = null; if (!(a != null && typeof a != "boolean" && (n = a.signal || null, n !== null && n.aborted))) {
        this._eventListeners === null && (this._eventListeners = []);
        var i = this._eventListeners;
        if (Nm(i, t, e, a) === -1) {
            var r = this, h = e;
            a != null && typeof a != "boolean" && a.once === !0 && (h = function (p) { r.removeEventListener(t, e, a), typeof e == "function" ? e.call(this, p) : e.handleEvent(p); }), n !== null && (l = r.removeEventListener.bind(r, t, e, a), n.addEventListener("abort", l, { once: !0 }), l = n.removeEventListener.bind(n, "abort", l)), n = Fi(a), i.push({ type: t, listener: e, optionsOrUseCapture: a, attachedListener: h, cleanup: l }), T(this._fragmentFiber.child, !1, ug, t, h, n);
        }
        this._eventListeners = i;
    } };
    function ug(t, e, a, n) { return K(t).addEventListener(e, a, n), !1; }
    Ka.prototype.removeEventListener = function (t, e, a) { var n = this._eventListeners; if (n !== null && (e = Nm(n, t, e, a), e !== -1)) {
        var l = n[e];
        a = l.attachedListener;
        var i = l.cleanup;
        l = Fi(l.optionsOrUseCapture), T(this._fragmentFiber.child, !1, og, t, a, l), n.splice(e, 1), i !== null && i();
    } };
    function og(t, e, a, n) { return K(t).removeEventListener(e, a, n), !1; }
    function Fi(t) { return t != null && typeof t != "boolean" && (t.once === !0 || t.signal instanceof AbortSignal) ? { capture: t.capture, passive: t.passive } : t; }
    function Em(t) { return t == null ? "c=0" : typeof t == "boolean" ? "c=" + (t ? "1" : "0") : "c=" + (t.capture ? "1" : "0"); }
    function Nm(t, e, a, n) { if (t.length === 0)
        return -1; n = Em(n); for (var l = 0; l < t.length; l++) {
        var i = t[l];
        if (i.type === e && i.listener === a && Em(i.optionsOrUseCapture) === n)
            return l;
    } return -1; }
    Ka.prototype.dispatchEvent = function (t) { var e = x(this._fragmentFiber); if (e === null)
        return !0; e = K(e); var a = this._eventListeners; if (a !== null && 0 < a.length || !t.bubbles) {
        var n = e.nodeType === 9 ? e.createComment("") : document.createTextNode("");
        if (a)
            for (var l = 0; l < a.length; l++) {
                var i = a[l];
                n.addEventListener(i.type, i.attachedListener, Fi(i.optionsOrUseCapture));
            }
        if (e.appendChild(n), t = n.dispatchEvent(t), a)
            for (l = 0; l < a.length; l++)
                i = a[l], n.removeEventListener(i.type, i.attachedListener, Fi(i.optionsOrUseCapture));
        return e.removeChild(n), t;
    } return e.dispatchEvent(t); }, Ka.prototype.focus = function (t) { T(this._fragmentFiber.child, !0, Sm, t, void 0, void 0); };
    function Sm(t, e) { return t.tag === 6 ? !1 : (t = K(t), Eg(t, e)); }
    Ka.prototype.focusLast = function (t) { var e = []; T(this._fragmentFiber.child, !0, cf, e, void 0, void 0); for (var a = e.length - 1; 0 <= a && !Sm(e[a], t); a--)
        ; };
    function cf(t, e) { return e.push(t), !1; }
    Ka.prototype.blur = function () { var t = x(this._fragmentFiber); t !== null && (t = K(t), t = eu(t).activeElement, t !== null && T(this._fragmentFiber.child, !1, cg, t, void 0, void 0)); };
    function cg(t, e) { return t.tag === 6 ? !1 : (t = K(t), t === e || t.contains(e) ? (e.blur(), !0) : !1); }
    Ka.prototype.observeUsing = function (t) { this._observers === null && (this._observers = new Set), this._observers.add(t), T(this._fragmentFiber.child, !1, rg, t, void 0, void 0); };
    function rg(t, e) { return t.tag === 6 || (t = K(t), e.observe(t)), !1; }
    Ka.prototype.unobserveUsing = function (t) { var e = this._observers; if (e !== null && e.has(t)) {
        e.delete(t), T(this._fragmentFiber.child, !1, fg, t, void 0, void 0);
        for (var a = e = 0; a < xn.length; a++) {
            var n = xn[a];
            n.fragmentInstance === this && n.observer === t ? t.unobserve(n.instance) : xn[e++] = n;
        }
        xn.length = e;
    } };
    function fg(t, e) { return t.tag === 6 || (t = K(t), e.unobserve(t)), !1; }
    var xn = [], rf = !1;
    function dg(t, e, a) { xn.push({ fragmentInstance: t, observer: e, instance: a }), rf || (rf = !0, Ng(function () { rf = !1; var n = xn; xn = []; for (var l = 0; l < n.length; l++) {
        var i = n[l];
        i.observer.unobserve(i.instance);
    } })); }
    Ka.prototype.getClientRects = function () { var t = []; return T(this._fragmentFiber.child, !1, hg, t, void 0, void 0), t; };
    function hg(t, e) { if (t.tag === 6) {
        t = t.stateNode;
        var a = t.ownerDocument.createRange();
        a.selectNodeContents(t), e.push.apply(e, a.getClientRects());
    }
    else
        t = K(t), e.push.apply(e, t.getClientRects()); return !1; }
    Ka.prototype.getRootNode = function (t) { var e = x(this._fragmentFiber); return e === null ? this : K(e).getRootNode(t); }, Ka.prototype.compareDocumentPosition = function (t) { var e = x(this._fragmentFiber); if (e === null)
        return Node.DOCUMENT_POSITION_DISCONNECTED; var a = []; T(this._fragmentFiber.child, !1, cf, a, void 0, void 0); var n = K(e); if (a.length === 0) {
        if (a = n, C(this._fragmentFiber)) {
            t: {
                for (e = this._fragmentFiber.return; e !== null;) {
                    if (e.tag === 4) {
                        e = e.stateNode.containerInfo;
                        break t;
                    }
                    if (e.tag === 3 || e.tag === 5 || e.tag === 27)
                        break;
                    e = e.return;
                }
                e = null;
            }
            e != null && (a = e);
        }
        e = this._fragmentFiber;
        var l = n = a.compareDocumentPosition(t);
        return a === t ? l = Node.DOCUMENT_POSITION_CONTAINS : n & Node.DOCUMENT_POSITION_CONTAINED_BY && (a = L(e)[1], a === null ? l = Node.DOCUMENT_POSITION_PRECEDING : (t = K(a).compareDocumentPosition(t), l = t === 0 || t & Node.DOCUMENT_POSITION_FOLLOWING ? Node.DOCUMENT_POSITION_FOLLOWING : Node.DOCUMENT_POSITION_PRECEDING)), l |= Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC;
    } e = K(a[0]), l = K(a[a.length - 1]); var i = C(this._fragmentFiber) ? e.parentElement : n; if (i == null)
        return Node.DOCUMENT_POSITION_DISCONNECTED; n = i.compareDocumentPosition(e) & Node.DOCUMENT_POSITION_CONTAINED_BY, i = i.compareDocumentPosition(l) & Node.DOCUMENT_POSITION_CONTAINED_BY; var r = e.compareDocumentPosition(t), h = l.compareDocumentPosition(t), p = r & Node.DOCUMENT_POSITION_CONTAINED_BY || h & Node.DOCUMENT_POSITION_CONTAINED_BY; return h = n && i && r & Node.DOCUMENT_POSITION_FOLLOWING && h & Node.DOCUMENT_POSITION_PRECEDING, e = n && e === t || i && l === t || p || h ? Node.DOCUMENT_POSITION_CONTAINED_BY : !n && e === t || !i && l === t ? Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC : r, e & Node.DOCUMENT_POSITION_DISCONNECTED || e & Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC || mg(e, this._fragmentFiber, a[0], a[a.length - 1], t) ? e : Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC; };
    function mg(t, e, a, n, l) { var i = fa(l); if (t & Node.DOCUMENT_POSITION_CONTAINED_BY) {
        if (a = !!i)
            t: {
                for (; i !== null;) {
                    if (i.tag === 7 && (i === e || i.alternate === e)) {
                        a = !0;
                        break t;
                    }
                    i = i.return;
                }
                a = !1;
            }
        return a;
    } if (t & Node.DOCUMENT_POSITION_CONTAINS) {
        if (i === null)
            return i = l.ownerDocument, l === i || l === i.documentElement || l === i.body;
        t: {
            for (i = e, e = x(e); i !== null;) {
                if (!(i.tag !== 5 && i.tag !== 3 && i.tag !== 27 || i !== e && i.alternate !== e)) {
                    i = !0;
                    break t;
                }
                i = i.return;
            }
            i = !1;
        }
        return i;
    } return t & Node.DOCUMENT_POSITION_PRECEDING ? ((e = !!i) && !(e = i === a) && (e = Nt(a, i, Tt), e === null ? e = !1 : (T(e, !0, Ct, i, a), i = Q, Q = null, e = i !== null)), e) : t & Node.DOCUMENT_POSITION_FOLLOWING ? ((e = !!i) && !(e = i === n) && (e = Nt(n, i, Tt), e === null ? e = !1 : (T(e, !0, at, i, n), i = Q, P = Q = null, e = i !== null)), e) : !1; }
    function Tm(t, e) { var a = t.ownerDocument.createRange(); a.selectNodeContents(t), t = a.getBoundingClientRect(), window.scrollTo(window.scrollX + t.left, e ? window.scrollY + t.top : window.scrollY + t.bottom - window.innerHeight); }
    Ka.prototype.scrollIntoView = function (t) { if (typeof t == "object")
        throw Error(o(566)); var e = []; T(this._fragmentFiber.child, !1, cf, e, void 0, void 0); var a = t !== !1; if (e.length === 0) {
        var n = L(this._fragmentFiber);
        if (n = a ? n[1] || n[0] || x(this._fragmentFiber) : n[0] || n[1], n === null)
            return;
        if (n.tag === 6) {
            t = K(n), Tm(t, a);
            return;
        }
        if (n = K(n), n.nodeType !== 9) {
            if (n.nodeType === 11) {
                a = "host" in n ? n.host : null, a !== null && a.scrollIntoView(t);
                return;
            }
            n.scrollIntoView(t);
        }
    } for (n = a ? e.length - 1 : 0; n !== (a ? -1 : e.length);) {
        var l = e[n];
        l.tag === 6 ? (l = K(l), Tm(l, a)) : K(l).scrollIntoView(t), n += a ? -1 : 1;
    } };
    function yg(t, e) { return t = K(t), xm(t, e), !1; }
    function xm(t, e) { t.reactFragments == null && (t.reactFragments = new Set), t.reactFragments.add(e); }
    function Am(t, e) { var a = e._eventListeners; if (a !== null)
        for (var n = 0; n < a.length; n++) {
            var l = a[n];
            t.addEventListener(l.type, l.attachedListener, Fi(l.optionsOrUseCapture));
        } t.nodeType !== 3 && (a = e._observers, a !== null && a.forEach(function (i) { for (var r = 0, h = 0; h < xn.length; h++) {
        var p = xn[h];
        (p.fragmentInstance !== e || p.observer !== i || p.instance !== t) && (xn[r++] = p);
    } xn.length = r, i.observe(t); }), xm(t, e)); }
    function pg(t, e) { var a = e._eventListeners; if (a !== null)
        for (var n = 0; n < a.length; n++) {
            var l = a[n];
            t.removeEventListener(l.type, l.attachedListener, Fi(l.optionsOrUseCapture));
        } t.nodeType !== 3 && (a = e._observers, a !== null && a.forEach(function (i) { typeof i.rootMargin == "string" ? dg(e, i, t) : i.unobserve(t); }), t.reactFragments != null && t.reactFragments.delete(e)); }
    function ff(t) { var e = t.firstChild; for (e && e.nodeType === 10 && (e = e.nextSibling); e;) {
        var a = e;
        switch (e = e.nextSibling, a.nodeName) {
            case "HTML":
            case "HEAD":
            case "BODY":
                ff(a), Ba(a);
                continue;
            case "SCRIPT":
            case "STYLE": continue;
            case "LINK": if (a.rel.toLowerCase() === "stylesheet")
                continue;
        }
        t.removeChild(a);
    } }
    function gg(t, e, a, n) { for (; t.nodeType === 1;) {
        var l = a;
        if (t.nodeName.toLowerCase() !== e.toLowerCase()) {
            if (!n && (t.nodeName !== "INPUT" || t.type !== "hidden"))
                break;
        }
        else if (n) {
            if (!t[ra])
                switch (e) {
                    case "meta":
                        if (!t.hasAttribute("itemprop"))
                            break;
                        return t;
                    case "link":
                        if (i = t.getAttribute("rel"), i === "stylesheet" && t.hasAttribute("data-precedence"))
                            break;
                        if (i !== l.rel || t.getAttribute("href") !== (l.href == null || l.href === "" ? null : l.href) || t.getAttribute("crossorigin") !== (l.crossOrigin == null ? null : l.crossOrigin) || t.getAttribute("title") !== (l.title == null ? null : l.title))
                            break;
                        return t;
                    case "style":
                        if (t.hasAttribute("data-precedence"))
                            break;
                        return t;
                    case "script":
                        if (i = t.getAttribute("src"), (i !== (l.src == null ? null : l.src) || t.getAttribute("type") !== (l.type == null ? null : l.type) || t.getAttribute("crossorigin") !== (l.crossOrigin == null ? null : l.crossOrigin)) && i && t.hasAttribute("async") && !t.hasAttribute("itemprop"))
                            break;
                        return t;
                    default: return t;
                }
        }
        else if (e === "input" && t.type === "hidden") {
            var i = l.name == null ? null : "" + l.name;
            if (l.type === "hidden" && t.getAttribute("name") === i)
                return t;
        }
        else
            return t;
        if (t = fn(t.nextSibling), t === null)
            break;
    } return null; }
    function vg(t, e, a) { if (e === "")
        return null; for (; t.nodeType !== 3;)
        if ((t.nodeType !== 1 || t.nodeName !== "INPUT" || t.type !== "hidden") && !a || (t = fn(t.nextSibling), t === null))
            return null; return t; }
    function wm(t, e) { for (; t.nodeType !== 8;)
        if ((t.nodeType !== 1 || t.nodeName !== "INPUT" || t.type !== "hidden") && !e || (t = fn(t.nextSibling), t === null))
            return null; return t; }
    function df(t) { return t.data === "$?" || t.data === "$~"; }
    function hf(t) { return t.data === "$!" || t.data === "$?" && t.ownerDocument.readyState !== "loading"; }
    function bg(t, e) { var a = t.ownerDocument; if (t.data === "$~")
        t._reactRetry = e;
    else if (t.data !== "$?" || a.readyState !== "loading")
        e();
    else {
        var n = function () { e(), a.removeEventListener("DOMContentLoaded", n); };
        a.addEventListener("DOMContentLoaded", n), t._reactRetry = n;
    } }
    function fn(t) { for (; t != null; t = t.nextSibling) {
        var e = t.nodeType;
        if (e === 1 || e === 3)
            break;
        if (e === 8) {
            if (e = t.data, e === "$" || e === "$!" || e === "$?" || e === "$~" || e === "&" || e === "F!" || e === "F")
                break;
            if (e === "/$" || e === "/&")
                return null;
        }
    } return t; }
    var mf = null;
    function Om(t) { t = t.nextSibling; for (var e = 0; t;) {
        if (t.nodeType === 8) {
            var a = t.data;
            if (a === "/$" || a === "/&") {
                if (e === 0)
                    return fn(t.nextSibling);
                e--;
            }
            else
                a !== "$" && a !== "$!" && a !== "$?" && a !== "$~" && a !== "&" || e++;
        }
        t = t.nextSibling;
    } return null; }
    function _m(t) { t = t.previousSibling; for (var e = 0; t;) {
        if (t.nodeType === 8) {
            var a = t.data;
            if (a === "$" || a === "$!" || a === "$?" || a === "$~" || a === "&") {
                if (e === 0)
                    return t;
                e--;
            }
            else
                a !== "/$" && a !== "/&" || e++;
        }
        t = t.previousSibling;
    } return null; }
    function Eg(t, e) { function a() { n = !0; } if (t.ownerDocument.activeElement === t)
        return !0; var n = !1; try {
        t.ownerDocument.addEventListener("focus", a, !0), (t.focus || HTMLElement.prototype.focus).call(t, e);
    }
    finally {
        t.ownerDocument.removeEventListener("focus", a, !0);
    } return n; }
    function Ng(t) { mm(function () { mm(function (e) { return t(e); }); }); }
    function Rm(t, e, a) { switch (e = eu(a), t) {
        case "html":
            if (t = e.documentElement, !t)
                throw Error(o(452));
            return t;
        case "head":
            if (t = e.head, !t)
                throw Error(o(453));
            return t;
        case "body":
            if (t = e.body, !t)
                throw Error(o(454));
            return t;
        default: throw Error(o(451));
    } }
    function jm(t, e, a) { for (var n in a) {
        var l = a[n];
        a.hasOwnProperty(n) && l != null && le(t, e, n, null, Jp, l);
    } a.dangerouslySetInnerHTML != null && (t.textContent = ""), t.onclick === ja && (t.onclick = null), Ba(t); }
    function yf(t) { for (var e = t.attributes; e.length;)
        t.removeAttributeNode(e[0]); Ba(t); }
    var dn = new Map, Mm = new Set;
    function au(t) { if (typeof t.getRootNode == "function") {
        var e = t.getRootNode();
        if (e.nodeType === 9 || e.nodeType === 11)
            return e;
    } return t.nodeType === 9 ? t : t.ownerDocument; }
    var ol = lt.d;
    lt.d = { f: Sg, r: Tg, D: xg, C: Ag, L: wg, m: Og, X: Rg, S: _g, M: jg };
    function Sg() { var t = ol.f(), e = So(); return t || e; }
    function Tg(t) { var e = ba(t); e !== null && e.tag === 5 && e.type === "form" ? Ch(e) : ol.r(t); }
    var Ji = typeof document > "u" ? null : document;
    function zm(t, e, a) { var n = Ji; if (n && typeof e == "string" && e) {
        var l = Bt(e);
        l = 'link[rel="' + t + '"][href="' + l + '"]', typeof a == "string" && (l += '[crossorigin="' + a + '"]'), Mm.has(l) || (Mm.add(l), t = { rel: t, crossOrigin: a, href: e }, n.querySelector(l) === null && (e = n.createElement("link"), oa(e, "link", t), _e(e), n.head.appendChild(e)));
    } }
    function xg(t) { ol.D(t), zm("dns-prefetch", t, null); }
    function Ag(t, e) { ol.C(t, e), zm("preconnect", t, e); }
    function wg(t, e, a) { ol.L(t, e, a); var n = Ji; if (n && t && e) {
        var l = 'link[rel="preload"][as="' + Bt(e) + '"]';
        e === "image" && a && a.imageSrcSet ? (l += '[imagesrcset="' + Bt(a.imageSrcSet) + '"]', typeof a.imageSizes == "string" && (l += '[imagesizes="' + Bt(a.imageSizes) + '"]')) : l += '[href="' + Bt(t) + '"]';
        var i = l;
        switch (e) {
            case "style":
                i = Wi(t);
                break;
            case "script": i = $i(t);
        }
        if (!(dn.has(i) || (t = q({ rel: "preload", href: e === "image" && a && a.imageSrcSet ? void 0 : t, as: e }, a), dn.set(i, t), n.querySelector(l) !== null || e === "style" && n.querySelector(nu(i)) || e === "script" && n.querySelector(lu(i))))) {
            var r = n.createElement("link");
            oa(r, "link", t), e === "style" && (r[Fe] = !0, r.onload = r.onerror = function () { rl(r); }), _e(r), n.head.appendChild(r);
        }
    } }
    function Og(t, e) { ol.m(t, e); var a = Ji; if (a && t) {
        var n = e && typeof e.as == "string" ? e.as : "script", l = 'link[rel="modulepreload"][as="' + Bt(n) + '"][href="' + Bt(t) + '"]', i = l;
        switch (n) {
            case "audioworklet":
            case "paintworklet":
            case "serviceworker":
            case "sharedworker":
            case "worker":
            case "script": i = $i(t);
        }
        if (!dn.has(i) && (t = q({ rel: "modulepreload", href: t }, e), dn.set(i, t), a.querySelector(l) === null)) {
            switch (n) {
                case "audioworklet":
                case "paintworklet":
                case "serviceworker":
                case "sharedworker":
                case "worker":
                case "script": if (a.querySelector(lu(i)))
                    return;
            }
            n = a.createElement("link"), oa(n, "link", t), _e(n), a.head.appendChild(n);
        }
    } }
    function _g(t, e, a) { ol.S(t, e, a); var n = Ji; if (n && t) {
        var l = Ee(n).hoistableStyles, i = Wi(t);
        e = e || "default";
        var r = l.get(i);
        if (!r) {
            var h = { loading: 0, preload: null };
            if (r = n.querySelector(nu(i)))
                h.loading = 5;
            else {
                t = q({ rel: "stylesheet", href: t, "data-precedence": e }, a), (a = dn.get(i)) && pf(t, a);
                var p = r = n.createElement("link");
                _e(p), oa(p, "link", t), p._p = new Promise(function (S, j) { p.onload = S, p.onerror = j; }), p.addEventListener("load", function () { h.loading |= 1; }), p.addEventListener("error", function () { h.loading |= 2; }), h.loading |= 4, Ro(r, e, n);
            }
            r = { type: "stylesheet", instance: r, count: 1, state: h }, l.set(i, r);
        }
    } }
    function Rg(t, e) { ol.X(t, e); var a = Ji; if (a && t) {
        var n = Ee(a).hoistableScripts, l = $i(t), i = n.get(l);
        i || (i = a.querySelector(lu(l)), i || (t = q({ src: t, async: !0 }, e), (e = dn.get(l)) && gf(t, e), i = a.createElement("script"), _e(i), oa(i, "link", t), a.head.appendChild(i)), i = { type: "script", instance: i, count: 1, state: null }, n.set(l, i));
    } }
    function jg(t, e) { ol.M(t, e); var a = Ji; if (a && t) {
        var n = Ee(a).hoistableScripts, l = $i(t), i = n.get(l);
        i || (i = a.querySelector(lu(l)), i || (t = q({ src: t, async: !0, type: "module" }, e), (e = dn.get(l)) && gf(t, e), i = a.createElement("script"), _e(i), oa(i, "link", t), a.head.appendChild(i)), i = { type: "script", instance: i, count: 1, state: null }, n.set(l, i));
    } }
    function Cm(t, e, a, n) { var l = (l = Qe.current) ? au(l) : null; if (!l)
        throw Error(o(446)); switch (t) {
        case "meta":
        case "title": return null;
        case "style": return typeof a.precedence == "string" && typeof a.href == "string" ? (a = Wi(a.href), e = Ee(l).hoistableStyles, n = e.get(a), n || (n = { type: "style", instance: null, count: 0, state: null }, e.set(a, n)), n) : { type: "void", instance: null, count: 0, state: null };
        case "link":
            if (a.rel === "stylesheet" && typeof a.href == "string" && typeof a.precedence == "string") {
                t = Wi(a.href);
                var i = Ee(l).hoistableStyles, r = i.get(t);
                if (r || (l = l.ownerDocument || l, r = { type: "stylesheet", instance: null, count: 0, state: { loading: 0, preload: null } }, i.set(t, r), (i = l.querySelector(nu(t))) ? i._p || (r.instance = i, r.state.loading = 5) : (i = dn.get(t), i || (i = { rel: "preload", as: "style", href: a.href, crossOrigin: a.crossOrigin, integrity: a.integrity, media: a.media, hrefLang: a.hrefLang, referrerPolicy: a.referrerPolicy }, dn.set(t, i)), Mg(l, t, i, r.state))), e && n === null)
                    throw Error(o(528, ""));
                return r;
            }
            if (e && n !== null)
                throw Error(o(529, ""));
            return null;
        case "script": return e = a.async, a = a.src, typeof a == "string" && e && typeof e != "function" && typeof e != "symbol" ? (a = $i(a), e = Ee(l).hoistableScripts, n = e.get(a), n || (n = { type: "script", instance: null, count: 0, state: null }, e.set(a, n)), n) : { type: "void", instance: null, count: 0, state: null };
        default: throw Error(o(444, t));
    } }
    function Wi(t) { return 'href="' + Bt(t) + '"'; }
    function nu(t) { return 'link[rel="stylesheet"][' + t + "]"; }
    function Dm(t) { return q({}, t, { "data-precedence": t.precedence, precedence: null }); }
    function Mg(t, e, a, n) { if (e = t.querySelector('link[rel="preload"][as="style"][' + e + "]")) {
        if (e[Fe] !== !0) {
            n.loading = 1;
            return;
        }
    }
    else
        e = t.createElement("link"), e[Fe] = !0, e.onload = e.onerror = rl.bind(null, e), oa(e, "link", a), _e(e), t.head.appendChild(e); n.preload = e, e.addEventListener("load", function () { return n.loading |= 1; }), e.addEventListener("error", function () { return n.loading |= 2; }); }
    function $i(t) { return '[src="' + Bt(t) + '"]'; }
    function lu(t) { return "script[async]" + t; }
    function Lm(t, e, a) { if (e.count++, e.instance === null)
        switch (e.type) {
            case "style":
                var n = t.querySelector('style[data-href~="' + Bt(a.href) + '"]');
                if (n)
                    return e.instance = n, _e(n), n;
                var l = q({}, a, { "data-href": a.href, "data-precedence": a.precedence, href: null, precedence: null });
                return n = (t.ownerDocument || t).createElement("style"), _e(n), oa(n, "style", l), Ro(n, a.precedence, t), e.instance = n;
            case "stylesheet":
                l = Wi(a.href);
                var i = t.querySelector(nu(l));
                if (i)
                    return e.state.loading |= 4, e.instance = i, _e(i), i;
                n = Dm(a), (l = dn.get(l)) && pf(n, l), i = (t.ownerDocument || t).createElement("link"), _e(i);
                var r = i;
                return r._p = new Promise(function (h, p) { r.onload = h, r.onerror = p; }), oa(i, "link", n), e.state.loading |= 4, Ro(i, a.precedence, t), e.instance = i;
            case "script": return i = $i(a.src), (l = t.querySelector(lu(i))) ? (e.instance = l, _e(l), l) : (n = a, (l = dn.get(i)) && (n = q({}, a), gf(n, l)), t = t.ownerDocument || t, l = t.createElement("script"), _e(l), oa(l, "link", n), t.head.appendChild(l), e.instance = l);
            case "void": return null;
            default: throw Error(o(443, e.type));
        }
    else
        e.type === "stylesheet" && (e.state.loading & 4) === 0 && (n = e.instance, e.state.loading |= 4, Ro(n, a.precedence, t)); return e.instance; }
    function Ro(t, e, a) { for (var n = a.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'), l = n.length ? n[n.length - 1] : null, i = l, r = 0; r < n.length; r++) {
        var h = n[r];
        if (h.dataset.precedence === e)
            i = h;
        else if (i !== l)
            break;
    } i ? i.parentNode.insertBefore(t, i.nextSibling) : (e = a.nodeType === 9 ? a.head : a, e.insertBefore(t, e.firstChild)); }
    function pf(t, e) { t.crossOrigin == null && (t.crossOrigin = e.crossOrigin), t.referrerPolicy == null && (t.referrerPolicy = e.referrerPolicy), t.title == null && (t.title = e.title); }
    function gf(t, e) { t.crossOrigin == null && (t.crossOrigin = e.crossOrigin), t.referrerPolicy == null && (t.referrerPolicy = e.referrerPolicy), t.integrity == null && (t.integrity = e.integrity); }
    var jo = null;
    function Um(t, e, a) { if (jo === null) {
        var n = new Map, l = jo = new Map;
        l.set(a, n);
    }
    else
        l = jo, n = l.get(a), n || (n = new Map, l.set(a, n)); if (n.has(t))
        return n; for (n.set(t, null), a = a.getElementsByTagName(t), l = 0; l < a.length; l++) {
        var i = a[l];
        if (!(i[ra] || i[he] || t === "link" && i.getAttribute("rel") === "stylesheet") && i.namespaceURI !== "http://www.w3.org/2000/svg") {
            var r = i.getAttribute(e) || "";
            r = t + r;
            var h = n.get(r);
            h ? h.push(i) : n.set(r, [i]);
        }
    } return n; }
    function vf(t, e, a) { t = t.ownerDocument || t, t.head.insertBefore(a, e === "title" ? t.querySelector("head > title") : null); }
    function zg(t, e, a) { if (a === 1 || e.itemProp != null)
        return !1; switch (t) {
        case "meta":
        case "title": return !0;
        case "style":
            if (typeof e.precedence != "string" || typeof e.href != "string" || e.href === "")
                break;
            return !0;
        case "link":
            if (typeof e.rel != "string" || typeof e.href != "string" || e.href === "" || e.onLoad || e.onError)
                break;
            return e.rel === "stylesheet" ? (t = e.disabled, typeof e.precedence == "string" && t == null) : !0;
        case "script": if (e.async && typeof e.async != "function" && typeof e.async != "symbol" && !e.onLoad && !e.onError && e.src && typeof e.src == "string")
            return !0;
    } return !1; }
    function Hm(t, e) { return t === "img" && e.src != null && e.src !== "" && e.onLoad == null && e.loading !== "lazy"; }
    function Gm(t) { return !(t.type === "stylesheet" && (t.state.loading & 3) === 0); }
    function Bm(t) { return (t.width || 100) * (t.height || 100) * (typeof devicePixelRatio == "number" ? devicePixelRatio : 1) * .25; }
    function qm(t, e) { typeof e.decode == "function" && (t.imgCount++, e.complete || (t.imgBytes += Bm(e), t.suspenseyImages.push(e)), t = Lg.bind(t), e.decode().then(t, t)); }
    function Cg(t, e, a, n) { if (a.type === "stylesheet" && (typeof n.media != "string" || matchMedia(n.media).matches !== !1) && (a.state.loading & 4) === 0) {
        if (a.instance === null) {
            var l = Wi(n.href), i = e.querySelector(nu(l));
            if (i) {
                e = i._p, e !== null && typeof e == "object" && typeof e.then == "function" && (t.count++, t = iu.bind(t), e.then(t, t)), a.state.loading |= 4, a.instance = i, _e(i);
                return;
            }
            i = e.ownerDocument || e, n = Dm(n), (l = dn.get(l)) && pf(n, l), i = i.createElement("link"), _e(i);
            var r = i;
            r._p = new Promise(function (h, p) { r.onload = h, r.onerror = p; }), oa(i, "link", n), a.instance = i;
        }
        t.stylesheets === null && (t.stylesheets = new Map), t.stylesheets.set(a, e), (e = a.state.preload) && (a.state.loading & 3) === 0 && (t.count++, a = iu.bind(t), e.addEventListener("load", a), e.addEventListener("error", a));
    } }
    var Mo = 0;
    function Dg(t, e) { return t.stylesheets && t.count === 0 && Co(t, t.stylesheets), 0 < t.count || 0 < t.imgCount ? function (a) { var n = setTimeout(function () { if (t.stylesheets && Co(t, t.stylesheets), t.unsuspend) {
        var i = t.unsuspend;
        t.unsuspend = null, i();
    } }, 6e4 + e); 0 < t.imgBytes && Mo === 0 && (Mo = 62500 * $p()); var l = setTimeout(function () { if (t.waitingForImages = !1, t.count === 0 && (t.stylesheets && Co(t, t.stylesheets), t.unsuspend)) {
        var i = t.unsuspend;
        t.unsuspend = null, i();
    } }, (t.imgBytes > Mo ? 50 : 800) + e); return t.unsuspend = a, function () { t.unsuspend = null, clearTimeout(n), clearTimeout(l); }; } : null; }
    function Ym(t) { if (t.count === 0 && (t.imgCount === 0 || !t.waitingForImages)) {
        if (t.stylesheets)
            Co(t, t.stylesheets);
        else if (t.unsuspend) {
            var e = t.unsuspend;
            t.unsuspend = null, e();
        }
    } }
    function iu() { this.count--, Ym(this); }
    function Lg() { this.imgCount--, Ym(this); }
    var zo = null;
    function Co(t, e) { t.stylesheets = null, t.unsuspend !== null && (t.count++, zo = new Map, e.forEach(Ug, t), zo = null, iu.call(t)); }
    function Ug(t, e) { if (!(e.state.loading & 4)) {
        var a = zo.get(t);
        if (a)
            var n = a.get(null);
        else {
            a = new Map, zo.set(t, a);
            for (var l = t.querySelectorAll("link[data-precedence],style[data-precedence]"), i = 0; i < l.length; i++) {
                var r = l[i];
                (r.nodeName === "LINK" || r.getAttribute("media") !== "not all") && (a.set(r.dataset.precedence, r), n = r);
            }
            n && a.set(null, n);
        }
        l = e.instance, r = l.getAttribute("data-precedence"), i = a.get(r) || n, i === n && a.set(null, l), a.set(r, l), this.count++, n = iu.bind(this), l.addEventListener("load", n), l.addEventListener("error", n), i ? i.parentNode.insertBefore(l, i.nextSibling) : (t = t.nodeType === 9 ? t.head : t, t.insertBefore(l, t.firstChild)), e.state.loading |= 4;
    } }
    var Pi = { $$typeof: pt, Provider: null, Consumer: null, _currentValue: Vt, _currentValue2: Vt, _threadCount: 0 };
    function Hg(t, e, a, n, l, i, r, h, p) { this.tag = 1, this.containerInfo = t, this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.next = this.pendingContext = this.context = this.cancelPendingCommit = null, this.callbackPriority = 0, this.expirationTimes = z(-1), this.entangledLanes = this.shellSuspendCounter = this.errorRecoveryDisabledLanes = this.expiredLanes = this.warmLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = z(0), this.hiddenUpdates = z(null), this.identifierPrefix = n, this.onUncaughtError = l, this.onCaughtError = i, this.onRecoverableError = r, this.pooledCache = null, this.pooledCacheLanes = 0, this.formState = p, this.transitionTypes = null, this.incompleteTransitions = new Map; }
    function km(t, e, a, n, l, i, r, h, p, S, j, H) { return t = new Hg(t, e, a, r, p, S, j, H, h), e = 1, i === !0 && (e |= 24), i = Ma(3, null, null, e), t.current = i, i.stateNode = t, e = zc(), e.refCount++, t.pooledCache = e, e.refCount++, i.memoizedState = { element: n, isDehydrated: a, cache: e }, Uc(i), t; }
    function Vm(t) { return t ? (t = Ai, t) : Ai; }
    function Xm(t, e, a, n, l, i) { l = Vm(l), n.context === null ? n.context = l : n.pendingContext = l, n = Nl(e), n.payload = { element: a }, i = i === void 0 ? null : i, i !== null && (n.callback = i), a = Sl(t, n, e), a !== null && (La(a, t, e), Us(a, t, e)); }
    function Zm(t, e) { if (t = t.memoizedState, t !== null && t.dehydrated !== null) {
        var a = t.retryLane;
        t.retryLane = a !== 0 && a < e ? a : e;
    } }
    function bf(t, e) { Zm(t, e), (t = t.alternate) && Zm(t, e); }
    function Qm(t) { if (t.tag === 13 || t.tag === 31) {
        var e = Wl(t, 67108864);
        e !== null && La(e, t, 67108864), bf(t, 67108864);
    } }
    function Im(t) { if (t.tag === 13 || t.tag === 31) {
        var e = Ia();
        e = mt(e);
        var a = Wl(t, e);
        a !== null && La(a, t, e), bf(t, e);
    } }
    var ts = !0;
    function Gg(t, e, a, n) { var l = V.T; V.T = null; var i = lt.p; try {
        lt.p = 2, Ef(t, e, a, n);
    }
    finally {
        lt.p = i, V.T = l;
    } }
    function Bg(t, e, a, n) { var l = V.T; V.T = null; var i = lt.p; try {
        lt.p = 8, Ef(t, e, a, n);
    }
    finally {
        lt.p = i, V.T = l;
    } }
    function Ef(t, e, a, n) { if (ts) {
        var l = Nf(n);
        if (l === null)
            tf(t, e, n, Do, a), Fm(t, n);
        else if (Yg(l, t, e, a, n))
            n.stopPropagation();
        else if (Fm(t, n), e & 4 && -1 < qg.indexOf(t)) {
            for (; l !== null;) {
                var i = ba(l);
                if (i !== null)
                    switch (i.tag) {
                        case 3:
                            if (i = i.stateNode, i.current.memoizedState.isDehydrated) {
                                var r = tn(i.pendingLanes);
                                if (r !== 0) {
                                    var h = i;
                                    for (h.pendingLanes |= 2, h.entangledLanes |= 2; r;) {
                                        var p = 1 << 31 - Ke(r);
                                        h.entanglements[1] |= p, r &= ~p;
                                    }
                                    kn(i), (It & 6) === 0 && (bo = Ie() + 500, $s(0));
                                }
                            }
                            break;
                        case 31:
                        case 13: h = Wl(i, 2), h !== null && La(h, i, 2), So(), bf(i, 2);
                    }
                if (i = Nf(n), i === null && tf(t, e, n, Do, a), i === l)
                    break;
                l = i;
            }
            l !== null && n.stopPropagation();
        }
        else
            tf(t, e, n, null, a);
    } }
    function Nf(t) { return t = ic(t), Sf(t); }
    var Do = null;
    function Sf(t) { if (Do = null, t = fa(t), t !== null) {
        var e = m(t);
        if (e === null)
            t = null;
        else {
            var a = e.tag;
            if (a === 13) {
                if (t = y(e), t !== null)
                    return t;
                t = null;
            }
            else if (a === 31) {
                if (t = g(e), t !== null)
                    return t;
                t = null;
            }
            else if (a === 3) {
                if (e.stateNode.current.memoizedState.isDehydrated)
                    return e.tag === 3 ? e.stateNode.containerInfo : null;
                t = null;
            }
            else
                e !== t && (t = null);
        }
    } return Do = t, null; }
    function Km(t) { switch (t) {
        case "beforetoggle":
        case "cancel":
        case "click":
        case "close":
        case "contextmenu":
        case "copy":
        case "cut":
        case "auxclick":
        case "dblclick":
        case "dragend":
        case "dragstart":
        case "drop":
        case "focusin":
        case "focusout":
        case "input":
        case "invalid":
        case "keydown":
        case "keypress":
        case "keyup":
        case "mousedown":
        case "mouseup":
        case "paste":
        case "pause":
        case "play":
        case "pointercancel":
        case "pointerdown":
        case "pointerup":
        case "ratechange":
        case "reset":
        case "seeked":
        case "submit":
        case "toggle":
        case "touchcancel":
        case "touchend":
        case "touchstart":
        case "volumechange":
        case "change":
        case "selectionchange":
        case "textInput":
        case "compositionstart":
        case "compositionend":
        case "compositionupdate":
        case "beforeblur":
        case "afterblur":
        case "beforeinput":
        case "blur":
        case "fullscreenchange":
        case "fullscreenerror":
        case "focus":
        case "hashchange":
        case "popstate":
        case "select":
        case "selectstart": return 2;
        case "drag":
        case "dragenter":
        case "dragexit":
        case "dragleave":
        case "dragover":
        case "mousemove":
        case "mouseout":
        case "mouseover":
        case "pointermove":
        case "pointerout":
        case "pointerover":
        case "resize":
        case "scroll":
        case "touchmove":
        case "wheel":
        case "mouseenter":
        case "mouseleave":
        case "pointerenter":
        case "pointerleave": return 8;
        case "message": switch (Ql()) {
            case pa: return 2;
            case Rn: return 8;
            case Wa:
            case $a: return 32;
            case we: return 268435456;
            default: return 32;
        }
        default: return 32;
    } }
    var Tf = !1, Dl = null, Ll = null, Ul = null, su = new Map, uu = new Map, Hl = [], qg = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");
    function Fm(t, e) { switch (t) {
        case "focusin":
        case "focusout":
            Dl = null;
            break;
        case "dragenter":
        case "dragleave":
            Ll = null;
            break;
        case "mouseover":
        case "mouseout":
            Ul = null;
            break;
        case "pointerover":
        case "pointerout":
            su.delete(e.pointerId);
            break;
        case "gotpointercapture":
        case "lostpointercapture": uu.delete(e.pointerId);
    } }
    function ou(t, e, a, n, l, i) { return t === null || t.nativeEvent !== i ? (t = { blockedOn: e, domEventName: a, eventSystemFlags: n, nativeEvent: i, targetContainers: [l] }, e !== null && (e = ba(e), e !== null && Qm(e)), t) : (t.eventSystemFlags |= n, e = t.targetContainers, l !== null && e.indexOf(l) === -1 && e.push(l), t); }
    function Yg(t, e, a, n, l) { switch (e) {
        case "focusin": return Dl = ou(Dl, t, e, a, n, l), !0;
        case "dragenter": return Ll = ou(Ll, t, e, a, n, l), !0;
        case "mouseover": return Ul = ou(Ul, t, e, a, n, l), !0;
        case "pointerover":
            var i = l.pointerId;
            return su.set(i, ou(su.get(i) || null, t, e, a, n, l)), !0;
        case "gotpointercapture": return i = l.pointerId, uu.set(i, ou(uu.get(i) || null, t, e, a, n, l)), !0;
    } return !1; }
    function Jm(t) { var e = fa(t.target); if (e !== null) {
        var a = m(e);
        if (a !== null) {
            if (e = a.tag, e === 13) {
                if (e = y(a), e !== null) {
                    t.blockedOn = e, Wt(t.priority, function () { Im(a); });
                    return;
                }
            }
            else if (e === 31) {
                if (e = g(a), e !== null) {
                    t.blockedOn = e, Wt(t.priority, function () { Im(a); });
                    return;
                }
            }
            else if (e === 3 && a.stateNode.current.memoizedState.isDehydrated) {
                t.blockedOn = a.tag === 3 ? a.stateNode.containerInfo : null;
                return;
            }
        }
    } t.blockedOn = null; }
    function Lo(t) { if (t.blockedOn !== null)
        return !1; for (var e = t.targetContainers; 0 < e.length;) {
        var a = Nf(t.nativeEvent);
        if (a === null) {
            a = t.nativeEvent;
            var n = new a.constructor(a.type, a);
            lc = n, a.target.dispatchEvent(n), lc = null;
        }
        else
            return e = ba(a), e !== null && Qm(e), t.blockedOn = a, !1;
        e.shift();
    } return !0; }
    function Wm(t, e, a) { Lo(t) && a.delete(e); }
    function kg() { Tf = !1, Dl !== null && Lo(Dl) && (Dl = null), Ll !== null && Lo(Ll) && (Ll = null), Ul !== null && Lo(Ul) && (Ul = null), su.forEach(Wm), uu.forEach(Wm); }
    function Uo(t, e) { t.blockedOn === e && (t.blockedOn = null, Tf || (Tf = !0, s.unstable_scheduleCallback(s.unstable_NormalPriority, kg))); }
    var Ho = null;
    function $m(t) { Ho !== t && (Ho = t, s.unstable_scheduleCallback(s.unstable_NormalPriority, function () { Ho === t && (Ho = null); for (var e = 0; e < t.length; e += 3) {
        var a = t[e], n = t[e + 1], l = t[e + 2];
        if (typeof n != "function") {
            if (Sf(n || a) === null)
                continue;
            break;
        }
        var i = ba(a);
        i !== null && (t.splice(e, 3), e -= 3, nr(i, { pending: !0, data: l, method: a.method, action: n }, n, l));
    } })); }
    function es(t) { function e(p) { return Uo(p, t); } Dl !== null && Uo(Dl, t), Ll !== null && Uo(Ll, t), Ul !== null && Uo(Ul, t), su.forEach(e), uu.forEach(e); for (var a = 0; a < Hl.length; a++) {
        var n = Hl[a];
        n.blockedOn === t && (n.blockedOn = null);
    } for (; 0 < Hl.length && (a = Hl[0], a.blockedOn === null);)
        Jm(a), a.blockedOn === null && Hl.shift(); if (a = (t.ownerDocument || t).$$reactFormReplay, a != null)
        for (n = 0; n < a.length; n += 3) {
            var l = a[n], i = a[n + 1], r = l[Oe] || null;
            if (typeof i == "function")
                r || $m(a);
            else if (r) {
                var h = null;
                if (i && i.hasAttribute("formAction")) {
                    if (l = i, r = i[Oe] || null)
                        h = r.formAction;
                    else if (Sf(l) !== null)
                        continue;
                }
                else
                    h = r.action;
                typeof h == "function" ? a[n + 1] = h : (a.splice(n, 3), n -= 3), $m(a);
            }
        } }
    function Pm() { function t(i) { i.canIntercept && i.info === "react-transition" && i.intercept({ handler: function () { return new Promise(function (r) { return l = r; }); }, focusReset: "manual", scroll: "manual" }); } function e() { l !== null && (l(), l = null), n || setTimeout(a, 20); } function a() { if (!n && !navigation.transition) {
        var i = navigation.currentEntry;
        i && i.url != null && navigation.navigate(i.url, { state: i.getState(), info: "react-transition", history: "replace" });
    } } if (typeof navigation == "object") {
        var n = !1, l = null;
        return navigation.addEventListener("navigate", t), navigation.addEventListener("navigatesuccess", e), navigation.addEventListener("navigateerror", e), setTimeout(a, 100), function () { n = !0, navigation.removeEventListener("navigate", t), navigation.removeEventListener("navigatesuccess", e), navigation.removeEventListener("navigateerror", e), l !== null && (l(), l = null); };
    } }
    function xf(t) { this._internalRoot = t; }
    Go.prototype.render = xf.prototype.render = function (t) { var e = this._internalRoot; if (e === null)
        throw Error(o(409)); var a = e.current, n = Ia(); Xm(a, n, t, e, null, null); }, Go.prototype.unmount = xf.prototype.unmount = function () { var t = this._internalRoot; if (t !== null) {
        this._internalRoot = null;
        var e = t.containerInfo;
        Xm(t.current, 2, null, t, null, null), So(), e[$e] = null;
    } };
    function Go(t) { this._internalRoot = t; }
    Go.prototype.unstable_scheduleHydration = function (t) { if (t) {
        var e = Ce();
        t = { blockedOn: null, target: t, priority: e };
        for (var a = 0; a < Hl.length && e !== 0 && e < Hl[a].priority; a++)
            ;
        Hl.splice(a, 0, t), a === 0 && Jm(t);
    } };
    var t1 = u.version;
    if (t1 !== "19.3.1")
        throw Error(o(527, t1, "19.3.1"));
    lt.findDOMNode = function (t) { var e = t._reactInternals; if (e === void 0)
        throw typeof t.render == "function" ? Error(o(188)) : (t = Object.keys(t).join(","), Error(o(268, t))); return t = E(e), t = t !== null ? R(t) : null, t = t === null ? null : t.stateNode, t; };
    var Vg = { bundleType: 0, version: "19.3.1", rendererPackageName: "react-dom", currentDispatcherRef: V, reconcilerVersion: "19.3.1" };
    if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
        var Bo = __REACT_DEVTOOLS_GLOBAL_HOOK__;
        if (!Bo.isDisabled && Bo.supportsFiber)
            try {
                Pa = Bo.inject(Vg), ze = Bo;
            }
            catch { }
    }
    return ru.createRoot = function (t, e) { if (!d(t))
        throw Error(o(299)); var a = !1, n = "", l = Vh, i = Xh, r = Zh; return e != null && (e.unstable_strictMode === !0 && (a = !0), e.identifierPrefix !== void 0 && (n = e.identifierPrefix), e.onUncaughtError !== void 0 && (l = e.onUncaughtError), e.onCaughtError !== void 0 && (i = e.onCaughtError), e.onRecoverableError !== void 0 && (r = e.onRecoverableError)), e = km(t, 1, !1, null, null, a, n, null, l, i, r, Pm), t[$e] = e.current, Pr(t), new xf(e); }, ru.hydrateRoot = function (t, e, a) { if (!d(t))
        throw Error(o(299)); var n = !1, l = "", i = Vh, r = Xh, h = Zh, p = null; return a != null && (a.unstable_strictMode === !0 && (n = !0), a.identifierPrefix !== void 0 && (l = a.identifierPrefix), a.onUncaughtError !== void 0 && (i = a.onUncaughtError), a.onCaughtError !== void 0 && (r = a.onCaughtError), a.onRecoverableError !== void 0 && (h = a.onRecoverableError), a.formState !== void 0 && (p = a.formState)), e = km(t, 1, !0, e, a ?? null, n, l, p, i, r, h, Pm), e.context = Vm(null), a = e.current, n = Ia(), n = mt(n), l = Nl(n), l.callback = null, Sl(a, l, n), a = n, e.current.lanes = a, B(e, a), kn(e), t[$e] = e.current, Pr(t), new Go(e); }, ru.version = "19.3.1", ru;
}
var d1;
function gv() { if (d1)
    return _f.exports; d1 = 1; function s() { if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"))
    try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(s);
    }
    catch (u) {
        console.error(u);
    } } return s(), _f.exports = pv(), _f.exports; }
var vv = gv();
const bv = L1(vv);
const Ev = s => s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), Y1 = (...s) => s.filter((u, f, o) => !!u && u.trim() !== "" && o.indexOf(u) === f).join(" ").trim();
var Nv = { xmlns: "http://www.w3.org/2000/svg", width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };
const Sv = O.forwardRef(({ color: s = "currentColor", size: u = 24, strokeWidth: f = 2, absoluteStrokeWidth: o, className: d = "", children: m, iconNode: y, ...g }, A) => O.createElement("svg", { ref: A, ...Nv, width: u, height: u, stroke: s, strokeWidth: o ? Number(f) * 24 / Number(u) : f, className: Y1("lucide", d), ...g }, [...y.map(([E, R]) => O.createElement(E, R)), ...Array.isArray(m) ? m : [m]]));
const ee = (s, u) => { const f = O.forwardRef(({ className: o, ...d }, m) => O.createElement(Sv, { ref: m, iconNode: u, className: Y1(`lucide-${Ev(s)}`, o), ...d })); return f.displayName = `${s}`, f; };
const h1 = ee("ArrowLeft", [["path", { d: "m12 19-7-7 7-7", key: "1l729n" }], ["path", { d: "M19 12H5", key: "x3x0zl" }]]);
const ds = ee("ArrowRight", [["path", { d: "M5 12h14", key: "1ays0h" }], ["path", { d: "m12 5 7 7-7 7", key: "xquz4c" }]]);
const Tv = ee("BookOpen", [["path", { d: "M12 7v14", key: "1akyts" }], ["path", { d: "M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z", key: "ruj8y" }]]);
const vu = ee("Check", [["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }]]);
const xv = ee("ChevronDown", [["path", { d: "m6 9 6 6 6-6", key: "qrunsl" }]]);
const $f = ee("ChevronRight", [["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }]]);
const k1 = ee("Crown", [["path", { d: "M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z", key: "1vdc57" }], ["path", { d: "M5 21h14", key: "11awu3" }]]);
const hu = ee("Flag", [["path", { d: "M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z", key: "i9b6wo" }], ["line", { x1: "4", x2: "4", y1: "22", y2: "15", key: "1cm3nv" }]]);
const Av = ee("Gauge", [["path", { d: "m12 14 4-4", key: "9kzdfg" }], ["path", { d: "M3.34 19a10 10 0 1 1 17.32 0", key: "19p75a" }]]);
const wv = ee("House", [["path", { d: "M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8", key: "5wwlr5" }], ["path", { d: "M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", key: "1d0kgt" }]]);
const Zo = ee("Info", [["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }], ["path", { d: "M12 16v-4", key: "1dtifu" }], ["path", { d: "M12 8h.01", key: "e9boi3" }]]);
const V1 = ee("Layers", [["path", { d: "M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z", key: "zw3jo" }], ["path", { d: "M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12", key: "1wduqc" }], ["path", { d: "M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17", key: "kqbvx6" }]]);
const Ov = ee("Link", [["path", { d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71", key: "1cjeqo" }], ["path", { d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71", key: "19qd67" }]]);
const X1 = ee("LoaderCircle", [["path", { d: "M21 12a9 9 0 1 1-6.219-8.56", key: "13zald" }]]);
const qf = ee("LockKeyhole", [["circle", { cx: "12", cy: "16", r: "1", key: "1au0dj" }], ["rect", { x: "3", y: "10", width: "18", height: "12", rx: "2", key: "6s8ecr" }], ["path", { d: "M7 10V7a5 5 0 0 1 10 0v3", key: "1pqi11" }]]);
const m1 = ee("LogOut", [["path", { d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", key: "1uf3rs" }], ["polyline", { points: "16 17 21 12 16 7", key: "1gabdz" }], ["line", { x1: "21", x2: "9", y1: "12", y2: "12", key: "1uyos4" }]]);
const y1 = ee("Maximize2", [["polyline", { points: "15 3 21 3 21 9", key: "mznyad" }], ["polyline", { points: "9 21 3 21 3 15", key: "1avn1i" }], ["line", { x1: "21", x2: "14", y1: "3", y2: "10", key: "ota7mn" }], ["line", { x1: "3", x2: "10", y1: "21", y2: "14", key: "1atl0r" }]]);
const cs = ee("Radio", [["path", { d: "M4.9 19.1C1 15.2 1 8.8 4.9 4.9", key: "1vaf9d" }], ["path", { d: "M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5", key: "u1ii0m" }], ["circle", { cx: "12", cy: "12", r: "2", key: "1c9p78" }], ["path", { d: "M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5", key: "1j5fej" }], ["path", { d: "M19.1 4.9C23 8.8 23 15.1 19.1 19", key: "10b0cb" }]]);
const p1 = ee("RotateCcw", [["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", key: "1357e3" }], ["path", { d: "M3 3v5h5", key: "1xhq8a" }]]);
const Z1 = ee("Settings2", [["path", { d: "M20 7h-9", key: "3s1dr2" }], ["path", { d: "M14 17H5", key: "gfn3mx" }], ["circle", { cx: "17", cy: "17", r: "3", key: "18b49y" }], ["circle", { cx: "7", cy: "7", r: "3", key: "dfmy0x" }]]);
const Mf = ee("ShieldCheck", [["path", { d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z", key: "oel41y" }], ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }]]);
const _v = ee("Signal", [["path", { d: "M2 20h.01", key: "4haj6o" }], ["path", { d: "M7 20v-4", key: "j294jx" }], ["path", { d: "M12 20v-8", key: "i3yub9" }], ["path", { d: "M17 20V8", key: "1tkaf5" }], ["path", { d: "M22 4v16", key: "sih9yq" }]]);
const Yf = ee("Trash2", [["path", { d: "M3 6h18", key: "d0wm0j" }], ["path", { d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6", key: "4alrt4" }], ["path", { d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2", key: "v07s0e" }], ["line", { x1: "10", x2: "10", y1: "11", y2: "17", key: "1uufr5" }], ["line", { x1: "14", x2: "14", y1: "11", y2: "17", key: "xtxkd" }]]);
const Qo = ee("Trophy", [["path", { d: "M6 9H4.5a2.5 2.5 0 0 1 0-5H6", key: "17hqa7" }], ["path", { d: "M18 9h1.5a2.5 2.5 0 0 0 0-5H18", key: "lmptdp" }], ["path", { d: "M4 22h16", key: "57wxv0" }], ["path", { d: "M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22", key: "1nw9bq" }], ["path", { d: "M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22", key: "1np0yb" }], ["path", { d: "M18 2H6v7a6 6 0 0 0 12 0V2Z", key: "u46fv3" }]]);
const pu = ee("Users", [["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }], ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }], ["path", { d: "M22 21v-2a4 4 0 0 0-3-3.87", key: "kshegd" }], ["path", { d: "M16 3.13a4 4 0 0 1 0 7.75", key: "1da9ce" }]]);
const Rv = ee("Volume2", [["path", { d: "M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z", key: "uqj9uw" }], ["path", { d: "M16 9a5 5 0 0 1 0 6", key: "1q6k2b" }], ["path", { d: "M19.364 18.364a9 9 0 0 0 0-12.728", key: "ijwkga" }]]);
const jv = ee("VolumeX", [["path", { d: "M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z", key: "uqj9uw" }], ["line", { x1: "22", x2: "16", y1: "9", y2: "15", key: "1ewh16" }], ["line", { x1: "16", x2: "22", y1: "9", y2: "15", key: "5ykzw1" }]]);
const Mv = ee("WifiOff", [["path", { d: "M12 20h.01", key: "zekei9" }], ["path", { d: "M8.5 16.429a5 5 0 0 1 7 0", key: "1bycff" }], ["path", { d: "M5 12.859a10 10 0 0 1 5.17-2.69", key: "1dl1wf" }], ["path", { d: "M19 12.859a10 10 0 0 0-2.007-1.523", key: "4k23kn" }], ["path", { d: "M2 8.82a15 15 0 0 1 4.177-2.643", key: "1grhjp" }], ["path", { d: "M22 8.82a15 15 0 0 0-11.288-3.764", key: "z3jwby" }], ["path", { d: "m2 2 20 20", key: "1ooewy" }]]);
const Pf = ee("X", [["path", { d: "M18 6 6 18", key: "1bl5f8" }], ["path", { d: "m6 6 12 12", key: "d8bk6v" }]]);
const Q1 = ee("Zap", [["path", { d: "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z", key: "1xq2db" }]]), gu = ["FL", "FR", "RL", "RR"], Io = ["FRONT_JACK", "REAR_JACK", "RELEASE_CONTROLLER", ...gu.flatMap(s => [`${s}_GUNNER`, `${s}_WHEEL_OFF`, `${s}_WHEEL_ON`])], I1 = { FL: "Front left", FR: "Front right", RL: "Rear left", RR: "Rear right" };
function hs(s) { if (s === "FRONT_JACK")
    return "Front jack operator"; if (s === "REAR_JACK")
    return "Rear jack operator"; if (s === "RELEASE_CONTROLLER")
    return "Release controller"; const u = s.slice(0, 2), f = s.endsWith("GUNNER") ? "wheel gunner" : s.endsWith("WHEEL_OFF") ? "old-wheel remover" : "new-wheel fitter"; return `${I1[u]} ${f}`; }
function is(s) { const u = typeof s == "string" ? s : s.id, f = { FRONT_LIFT: "Lift front of car", REAR_LIFT: "Lift rear of car", FRONT_LOWER: "Lower front of car", REAR_LOWER: "Lower rear of car", GREEN_RELEASE: "Release car" }; if (f[u])
    return f[u]; const o = u.slice(0, 2), d = I1[o]?.toLowerCase().replace(" ", "-"); return d ? u.endsWith("GUN_LOOSEN") ? `Loosen ${d} wheel nut` : u.endsWith("WHEEL_OFF") ? `Remove old ${d} wheel` : u.endsWith("WHEEL_ON") ? `Fit new ${d} wheel` : u.endsWith("GUN_TIGHTEN") ? `Tighten ${d} wheel nut` : u.replaceAll("_", " ").toLowerCase() : u.replaceAll("_", " ").toLowerCase(); }
const K1 = 12e4;
function bu(s) { if (!Number.isFinite(s) || s < 0)
    throw new Error("A finite nonnegative authoritative timestamp is required."); }
function Po(s) { const u = new Map, f = new Set; for (const m of s) {
    if (!Io.includes(m.role))
        throw new Error("Unknown playable role.");
    if (u.has(m.role) || f.has(m.id))
        throw new Error("Each player and role must be unique.");
    u.set(m.role, m.id), f.add(m.id);
} const o = []; function d(m, y, g, A) { o.push({ id: m, role: y, cohort: g, dependencies: A, ownerId: u.get(y) ?? null, status: "LOCKED", enabledAt: null, completedAt: null, baselineMeanMs: null, dueAt: null, reason: null }); } d("FRONT_LIFT", "FRONT_JACK", "LIFT", []), d("REAR_LIFT", "REAR_JACK", "LIFT", []); for (const m of gu) {
    const y = m.startsWith("F") ? "FRONT_LIFT" : "REAR_LIFT";
    d(`${m}_GUN_LOOSEN`, `${m}_GUNNER`, "GUN_LOOSEN", [y]), d(`${m}_WHEEL_OFF`, `${m}_WHEEL_OFF`, "WHEEL_OFF", [`${m}_GUN_LOOSEN`]), d(`${m}_WHEEL_ON`, `${m}_WHEEL_ON`, "WHEEL_ON", [`${m}_WHEEL_OFF`]), d(`${m}_GUN_TIGHTEN`, `${m}_GUNNER`, "GUN_TIGHTEN", [`${m}_WHEEL_ON`]);
} return d("FRONT_LOWER", "FRONT_JACK", "LOWER", ["FL_GUN_TIGHTEN", "FR_GUN_TIGHTEN"]), d("REAR_LOWER", "REAR_JACK", "LOWER", ["RL_GUN_TIGHTEN", "RR_GUN_TIGHTEN"]), d("GREEN_RELEASE", "RELEASE_CONTROLLER", "GREEN_RELEASE", ["FRONT_LOWER", "REAR_LOWER", ...gu.map(m => `${m}_GUN_TIGHTEN`)]), o; }
let zv = 0;
function F1(s, u, f = `round-${++zv}`) { if (bu(u), !s.some(o => o.role === "FRONT_JACK" || o.role === "REAR_JACK"))
    throw new Error("At least one human jack operator is required."); return { id: f, players: structuredClone(s), status: "COUNTDOWN", goAt: u, finishedAt: null, elapsedMs: null, tasks: Po(s), samples: [], events: [], requests: {} }; }
function Cv(s, u, f) { return s.some(o => o.role.endsWith("_JACK")) ? F1(s, u, f) : (bu(u), { id: f, players: structuredClone(s), status: "COUNTDOWN", goAt: u, finishedAt: null, elapsedMs: null, tasks: Po(s), samples: [], events: [], requests: {}, soloTiming: { seedMs: 400 } }); }
const Dv = 2e3;
function J1(s, u, f, o, d) { if (bu(o), !d || d.length > 128)
    throw new Error("A valid request ID is required."); const m = Object.hasOwn(s.earlyRequests ?? {}, d) ? s.earlyRequests[d] : void 0; if (m) {
    if (m.playerId !== u || m.taskId !== f)
        throw new Error("Request ID belongs to another early action.");
    return s;
} const y = s.tasks.find(g => g.id === f); if (!y || y.ownerId !== u)
    throw new Error("This task belongs to another crew member."); if (ms(s, o), s.earlyRequests ??= {}, Object.defineProperty(s.earlyRequests, d, { value: { playerId: u, taskId: f }, enumerable: !0 }), y.status === "DONE" || !["COUNTDOWN", "RUNNING"].includes(s.status) || (s.penalties?.[u]?.until ?? 0) > o)
    return s; if (s.status === "COUNTDOWN" || y.status === "LOCKED")
    s.penalties ??= {}, Object.defineProperty(s.penalties, u, { value: { until: Math.max(s.goAt, o) + Dv, at: o }, enumerable: !0, writable: !0, configurable: !0 });
else if (y.status === "AVAILABLE")
    return tc(s, u, f, o, d); return s; }
function Lv(s, u) { const f = s.samples.filter(o => Number.isFinite(o.at) && o.at >= s.goAt && o.at <= u && Number.isFinite(o.ms) && o.ms >= 0 && o.ms <= K1); return f.length ? f.reduce((o, d) => o + d.ms, 0) / f.length : null; }
function Uv(s, u) { const f = new Map(s.tasks.map(o => [o.id, o])); for (const o of s.tasks) {
    if (o.status !== "LOCKED")
        continue;
    const d = o.dependencies.map(y => f.get(y));
    if (d.some(y => !y || y.status !== "DONE" || y.completedAt === null))
        continue;
    const m = Math.max(s.goAt, ...d.map(y => y.completedAt));
    if (!(m > u) && (o.status = "AVAILABLE", o.enabledAt = m, o.ownerId === null && (o.cohort !== "LIFT" || s.soloTiming))) {
        const y = Lv(s, m) ?? s.soloTiming?.seedMs ?? null;
        if (y === null)
            throw new Error("A bot cannot be scheduled before the first real human reaction.");
        o.baselineMeanMs = y, o.dueAt = m + y;
    }
} }
function Hv(s, u) { if (u.ownerId !== null || u.status !== "AVAILABLE" || u.enabledAt === null)
    return null; let f = u.dueAt === null ? null : { task: u, at: u.dueAt, reason: "BASELINE_DUE" }; const o = s.tasks.filter(d => d.cohort === u.cohort && d.ownerId !== null); if (o.length > 0 && o.every(d => d.status === "DONE" && d.completedAt !== null)) {
    const d = Math.max(...o.map(y => y.completedAt)), m = Math.max(u.enabledAt, d);
    (f === null || m <= f.at) && (f = { task: u, at: m, reason: u.cohort === "LIFT" ? "OPENING_JACK_SYNC" : u.enabledAt >= d ? "COHORT_ALREADY_FINISHED" : "PARALLEL_HUMAN_CAP" });
} return f; }
function W1(s, u, f, o) { if (u.status !== "AVAILABLE" || u.enabledAt === null || f < u.enabledAt)
    throw new Error("Invalid causal task completion."); u.status = "DONE", u.completedAt = f, u.reason = o, s.events.push({ taskId: u.id, at: f, reason: o, enabledAt: u.enabledAt, ownerId: u.ownerId, nickname: s.players?.find(d => d.id === u.ownerId)?.nickname ?? null, role: u.role }), u.id === "GREEN_RELEASE" && (s.status = "COMPLETED", s.finishedAt = f, s.elapsedMs = f - s.goAt); }
function ms(s, u) { if (bu(u), s.status === "COMPLETED" || s.status === "ABANDONED" || u < s.goAt)
    return s; s.status = "RUNNING"; for (let f = 0; f <= s.tasks.length; f++) {
    Uv(s, u);
    const o = s.tasks.map(d => Hv(s, d)).filter(d => d !== null && d.at <= u).sort((d, m) => d.at - m.at || d.task.id.localeCompare(m.task.id))[0];
    if (!o || (W1(s, o.task, o.at, o.reason), s.finishedAt !== null))
        return s;
} throw new Error("The task graph could not reach a stable state."); }
function tc(s, u, f, o, d) { bu(o); const m = d && s.requests && Object.hasOwn(s.requests, d) ? s.requests[d] : void 0; if (m) {
    if (m.playerId !== u || m.taskId !== f)
        throw new Error("An action request ID cannot be reused for another action.");
    return s;
} if (ms(s, o), s.status !== "RUNNING")
    throw new Error(s.status === "COUNTDOWN" ? "Wait for GO signal." : "This round is no longer running."); const y = s.tasks.find(A => A.id === f); if (!y || y.ownerId !== u)
    throw new Error("This task belongs to another crew member."); if ((s.penalties?.[u]?.until ?? 0) > o)
    throw new Error("Personal lockout is still active."); if (y.status !== "AVAILABLE" || y.enabledAt === null || o < y.enabledAt)
    throw new Error(y.status === "DONE" ? "This action has already been completed." : "This action is locked by its prerequisites."); const g = Math.max(s.goAt, ...s.events.map(A => A.at)); if (o < g)
    throw new Error("An action cannot precede an already accepted event."); if (o - y.enabledAt > K1)
    throw new Error("The 120-second action window has expired. Return to the lobby and start a new round."); return W1(s, y, o, "HUMAN_ACTION"), s.samples.push({ taskId: f, ms: o - y.enabledAt, at: o }), d && (s.requests ??= {}, Object.defineProperty(s.requests, d, { value: { playerId: u, taskId: f }, enumerable: !0, writable: !0, configurable: !0 })), ms(s, o); }
const $1 = "pit-crew-local-practice-v1", Ha = "practice-you";
let Vl = [], rs = [], ys = [];
try {
    const s = JSON.parse(localStorage.getItem($1) ?? "null");
    s && Array.isArray(s.rooms) && Array.isArray(s.leaderboard) && (Vl = s.rooms, rs = s.leaderboard, ys = Array.isArray(s.replays) ? s.replays : []);
}
catch { }
function Gv() { try {
    localStorage.setItem($1, JSON.stringify({ rooms: Vl, leaderboard: rs, replays: ys }));
}
catch { } }
function td(s) { const u = s.round; if (!u || u.elapsedMs === null || u.finishedAt === null)
    return; ys.some(o => o.roundId === u.id) || ys.push(structuredClone({ roundId: u.id, teamId: s.teamId, teamName: s.name, color: s.color, players: u.players ?? s.players, round: u })); let f = rs.find(o => o.teamId === s.teamId); f || (f = { teamId: s.teamId, name: s.name, color: s.color, rounds: [], averageMs: 0, bestMs: 0 }, rs.push(f)), f.rounds.some(o => o.roundId === u.id) || (f.rounds.push({ id: crypto.randomUUID(), roundId: u.id, teamId: s.teamId, elapsedMs: u.elapsedMs, finishedAt: u.finishedAt }), f.averageMs = f.rounds.reduce((o, d) => o + d.elapsedMs, 0) / f.rounds.length, f.bestMs = Math.min(...f.rounds.map(o => o.elapsedMs)), rs.sort((o, d) => o.averageMs - d.averageMs || o.bestMs - d.bestMs || o.rounds[0].finishedAt - d.rounds[0].finishedAt)); }
function P1(s) { for (const u of Vl) {
    const f = u.round;
    if (!(!f || u.status !== "COUNTDOWN" && u.status !== "RUNNING")) {
        for (let o = 0; o < 100; o++) {
            const d = f.tasks.filter(g => g.status === "AVAILABLE").map(g => { if (g.ownerId && g.ownerId !== Ha && g.enabledAt !== null) {
                const A = u.players.findIndex(E => E.id === g.ownerId);
                return g.enabledAt + 330 + A * 65;
            } return g.dueAt ?? 1 / 0; });
            f.status === "COUNTDOWN" && d.push(f.goAt);
            const m = Math.min(...d);
            if (m > s || !Number.isFinite(m)) {
                ms(f, s);
                break;
            }
            ms(f, m);
            const y = f.tasks.filter(g => g.status === "AVAILABLE" && g.ownerId && g.ownerId !== Ha && g.enabledAt !== null);
            for (const g of y) {
                const A = u.players.findIndex(R => R.id === g.ownerId);
                g.enabledAt + 330 + A * 65 <= m && tc(f, g.ownerId, g.id, m, `simulation-${g.id}`);
            }
            if (f.status === "COMPLETED" || f.status === "ABANDONED")
                break;
        }
        f.status !== "ABANDONED" && (u.status = f.status), f.status === "COMPLETED" && td(u), u.updatedAt = s;
    }
} }
function zf() { const s = Date.now(); P1(s); for (const u of Vl)
    u.round?.status === "COMPLETED" && td(u); return Gv(), structuredClone({ local: !0, rooms: Vl.filter(u => u.status !== "CLOSED"), leaderboard: rs, replays: ys.map(u => ({ roundId: u.roundId, teamId: u.teamId, teamName: u.teamName, color: u.color, elapsedMs: u.round.elapsedMs, finishedAt: u.round.finishedAt })), serverNow: s, identity: { playerId: Ha, isAdmin: !1 } }); }
function g1(s, u, f) { return typeof s == "string" && s.trim() ? s.trim().slice(0, f) : u; }
const Cf = { getState: async () => zf(), getReplay: async (s) => { zf(); const u = ys.find(f => f.roundId === s); if (!u)
        throw new Error("This practice replay is no longer available."); return structuredClone(u); }, call: async (s, u, f = {}) => { P1(Date.now()); const o = Vl.find(d => d.id === u && d.status !== "CLOSED"); if (s === "create" || s === "practice_create") {
        if (Vl.some(g => g.status !== "CLOSED" && g.players.some(A => A.id === Ha)))
            throw new Error("Leave your current practice room before creating another.");
        const d = Date.now(), m = [{ id: Ha, nickname: g1(f.nickname, "You", 24), role: "FRONT_JACK", ready: !1, joinedAt: d, connected: !0 }, { id: "practice-crew-a", nickname: "Avery · simulated", role: "FL_WHEEL_ON", ready: !0, joinedAt: d + 1, connected: !0 }, { id: "practice-crew-b", nickname: "Jordan · simulated", role: "FR_GUNNER", ready: !0, joinedAt: d + 2, connected: !0 }, { id: "practice-crew-c", nickname: "Casey · simulated", role: "RL_WHEEL_OFF", ready: !0, joinedAt: d + 3, connected: !0 }], y = crypto.randomUUID();
        Vl.push({ id: y, teamId: y, name: g1(f.name, "Practice crew", 40), color: /^#[0-9a-f]{6}$/i.test(String(f.color)) ? String(f.color) : "#ff4b31", code: y.slice(0, 6).toUpperCase(), hostId: Ha, status: "WAITING", players: m, round: null, updatedAt: d });
    }
    else if (s !== "heartbeat") {
        if (s === "admin_delete")
            throw new Error("Global administration requires a connection to Supabase and an authorized admin account.");
        {
            if (!o)
                throw new Error("This room is no longer available.");
            const d = o.players.find(m => m.id === Ha);
            if (!d)
                throw new Error("You were removed from this room.");
            if (s === "ready") {
                if (o.status !== "WAITING")
                    throw new Error("Readiness is locked during a round.");
                d.ready = f.ready === !0;
            }
            else if (s === "start") {
                if (o.hostId !== Ha)
                    throw new Error("Only the host can start this room.");
                if (o.status !== "WAITING" || o.players.length < 4 || o.players.length > 15 || o.players.some(m => !m.ready))
                    throw new Error("A round needs 4–15 players, all Ready, including the host.");
                o.round = F1(o.players, Date.now() + 3e3, crypto.randomUUID()), o.status = "COUNTDOWN";
            }
            else if (s === "early_action") {
                if (!o.round)
                    throw new Error("Start first.");
                J1(o.round, Ha, String(f.taskId), Date.now(), String(f.requestId ?? ""));
            }
            else if (s === "action") {
                if (!o.round)
                    throw new Error("Start the round first.");
                tc(o.round, Ha, String(f.taskId), Date.now(), String(f.requestId ?? crypto.randomUUID())), o.status = o.round.status === "ABANDONED" ? "WAITING" : o.round.status, o.round.status === "COMPLETED" && td(o);
            }
            else if (s === "replay") {
                if (o.hostId !== Ha || o.status !== "COMPLETED")
                    throw new Error("The host can return the team to the lobby after a completed round.");
                o.status = "WAITING", o.round = null, o.players.forEach(m => { m.ready = m.id !== Ha; });
            }
            else {
                if (s === "kick")
                    throw o.status !== "WAITING" || o.hostId !== Ha || f.playerId === Ha ? new Error("Only the host can remove another waiting player.") : new Error("The three simulated teammates are required for local practice. Configure Supabase to manage a real player roster.");
                if (s === "leave")
                    o.status = "CLOSED", o.players = [];
                else
                    throw s === "join" ? new Error("Local practice runs in this browser only. Configure Supabase to join from another device.") : new Error("Unknown room action.");
            }
            o.updatedAt = Date.now();
        }
    } return zf(); } }, ty = window.PIT_CONFIG?.enableSoloTest !== !1;
let At = null;
const Ko = new Map;
function v1() { !At?.round || At.round.status !== "COMPLETED" || Ko.has(At.round.id) || Ko.set(At.round.id, structuredClone({ roundId: At.round.id, teamId: At.teamId, teamName: At.name, color: At.color, players: At.round.players ?? At.players, round: At.round, solo: !0 })); }
const yi = { active: !1, enter() { if (!ty)
        throw new Error("Solo Test is disabled."); const s = Date.now(), u = `solo-${crypto.randomUUID()}`; return At = { id: u, teamId: u, solo: !0, name: "SOLO TEST — NOT RANKED", color: "#ffd16a", code: "SOLO", hostId: "solo-you", status: "WAITING", players: [{ id: "solo-you", nickname: "You", role: "FRONT_JACK", ready: !1, joinedAt: s, connected: !0 }], round: null, updatedAt: s }, this.active = !0, this.getState(); }, async getState() { return At?.round && (ms(At.round, Date.now()), At.round.status !== "ABANDONED" && (At.status = At.round.status)), v1(), structuredClone({ local: !0, rooms: At ? [At] : [], leaderboard: [], replays: [...Ko.values()].map(s => ({ roundId: s.roundId, teamId: s.teamId, teamName: s.teamName, color: s.color, elapsedMs: s.round.elapsedMs, finishedAt: s.round.finishedAt })), serverNow: Date.now(), identity: { playerId: this.active ? "solo-you" : null, isAdmin: !1 } }); }, getReplay(s) { const u = Ko.get(s); return u ? structuredClone(u) : null; }, async call(s, u, f = {}) { if (!At)
        throw new Error("Open Solo Test first."); if (s === "choose_role") {
        if (At.status !== "WAITING" || !Io.includes(f.role))
            throw new Error("Choose a valid role before starting.");
        At.players[0].role = f.role, At.players[0].ready = !1, At.round = null;
    }
    else if (s === "ready") {
        if (At.status !== "WAITING")
            throw new Error("Ready can only change before starting.");
        At.players[0].ready = f.ready === !0;
    }
    else if (s === "start") {
        if (At.status !== "WAITING")
            throw new Error("Finish this attempt before starting another.");
        if (At.status !== "WAITING" || !At.players[0].ready)
            throw new Error("Mark Ready first.");
        At.round = Cv(At.players, Date.now() + 3e3, crypto.randomUUID()), At.status = "COUNTDOWN";
    }
    else if (s === "early_action") {
        if (!At.round)
            throw new Error("Start first.");
        J1(At.round, "solo-you", String(f.taskId), Date.now(), String(f.requestId ?? ""));
    }
    else if (s === "action") {
        if (!At.round)
            throw new Error("Start first.");
        tc(At.round, "solo-you", String(f.taskId), Date.now(), String(f.requestId));
    }
    else if (s === "replay") {
        if (At.status !== "COMPLETED")
            throw new Error("Finish this attempt first.");
        v1(), At.round = null, At.status = "WAITING", At.players[0].ready = !1;
    }
    else if (s === "leave")
        At = null, this.active = !1;
    else if (s !== "heartbeat")
        throw new Error("Solo Test cannot modify online rooms or ranked results."); return At && s !== "heartbeat" && (At.updatedAt = Date.now()), this.getState(); } }, ey = window.PIT_CONFIG ?? {}, kf = ey.supabaseUrl?.trim() ?? "", ns = ey.supabaseAnonKey?.trim() ?? "", Vf = !!(kf && ns);
let ue = null, Fo = null;
if (Vf)
    try {
        if (ns.startsWith("sb_secret_"))
            throw new Error("config.js must contain a publishable public key, never a secret key.");
        if (ns.split(".").length === 3 && JSON.parse(atob(ns.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))).role === "service_role")
            throw new Error("Remove the service_role key from config.js and use the public anon key.");
        ue = Qg(kf, ns, { auth: { persistSession: !0, autoRefreshToken: !0, detectSessionInUrl: !0 } });
    }
    catch (s) {
        Fo = s instanceof Error ? s.message : "Invalid Supabase configuration.";
    }
else
    (kf || ns) && (Fo = "Complete both public values in config.js: supabaseUrl and supabaseAnonKey.");
const as = new Set;
let Bl = 0, fu = null;
async function Bv() { if (ue) {
    if (fu)
        return fu;
    fu = (async () => { const { data: s, error: u } = await ue.auth.getSession(); if (u)
        throw u; if (!s.session) {
        const { error: f } = await ue.auth.signInAnonymously();
        if (f)
            throw new Error(`Player sign-in failed. Enable Anonymous Sign-Ins in Supabase Authentication. ${f.message}`);
    } })();
    try {
        await fu;
    }
    finally {
        fu = null;
    }
} }
function ss() { if (Fo)
    throw new Error(Fo); }
async function Xf(s, u) { if (ss(), !ue)
    throw new Error("The online backend is not configured."); const f = new AbortController, o = setTimeout(() => f.abort(), 1e4); try {
    const { data: d, error: m } = await ue.rpc(s, u).abortSignal(f.signal);
    if (m)
        throw new Error(f.signal.aborted ? "Connection timed out. Reconnecting to the pit lane." : m.message);
    if (!d || !Array.isArray(d.rooms) || !d.identity)
        throw new Error("The backend returned an invalid snapshot. Apply SUPABASE_SETUP.sql to this project.");
    return d;
}
finally {
    clearTimeout(o);
} }
function Zf(s) { return new Error(/fetch|network|timed out|timeout|connection|abort/i.test(s) ? `Global administration requires a connection to Supabase. ${s}` : s); }
async function Yo() { if (ss(), !ue)
    throw new Error("Global administration requires a connection to Supabase."); try {
    return await Xf("pit_state");
}
catch (s) {
    throw Zf(s instanceof Error ? s.message : "Connection interrupted.");
} }
const oe = { isConfigured: Vf, hasBackend: !!ue, get globalRevision() { return Bl; }, getGlobalState: Yo, mode: "supabase", getState: async () => yi.active ? yi.getState() : (ss(), ue ? Xf("pit_state") : Promise.resolve({ rooms: [], leaderboard: [], serverNow: Date.now(), identity: { playerId: null, isAdmin: false } })), getReplay: async (s) => { const u = yi.getReplay(s); if (u)
        return u; if (ss(), !ue) throw new Error("Online replays require Supabase configuration."); const f = new AbortController, o = setTimeout(() => f.abort(), 1e4); try {
        const { data: d, error: m } = await ue.rpc("pit_replay", { p_round: s }).abortSignal(f.signal);
        if (m)
            throw new Error(f.signal.aborted ? "Replay request timed out. Please try again." : m.message);
        if (!d?.round || d.roundId !== s || !Array.isArray(d.players))
            throw new Error("Replay is no longer available.");
        return d;
    }
    finally {
        clearTimeout(o);
    } }, call: async (s, u, f = {}) => { if (s === "solo_enter")
        return yi.enter(); if (yi.active && s !== "admin_delete")
        return yi.call(s, u, f); if (s === "admin_delete" && !ue)
        throw new Error("Global administration requires a connection to Supabase and an authorized admin account."); if (ss(), !ue) {
        if (s === "heartbeat") return { rooms: [], leaderboard: [], serverNow: Date.now(), identity: { playerId: null, isAdmin: false } };
        throw new Error("Online multiplayer requires Supabase. Configure its public URL and key in config.js. Solo Test still works offline.");
    } s === "admin_delete" && Bl++, ["heartbeat"].includes(s) || await Bv(); const o = await Xf("pit_call", { p_op: s, p_room: u ?? null, p_payload: f }); return s === "admin_delete" && Bl++, o; }, recoverSession: async () => { if (!ue)
        return; ue.auth.startAutoRefresh?.(); const { data: s } = await ue.auth.getSession(); s.session?.expires_at && s.session.expires_at * 1e3 < Date.now() + 6e4 && await ue.auth.refreshSession(); }, subscribe: s => { if (as.add(s), !ue)
        return () => { as.delete(s); }; const u = ue.channel(`pit-global-${crypto.randomUUID()}`).on("postgres_changes", { event: "*", schema: "public", table: "pit_public_state" }, s).subscribe(o => { (o === "SUBSCRIBED" || o === "CHANNEL_ERROR" || o === "TIMED_OUT") && s(); }), f = ue.auth.onAuthStateChange(() => s()); return () => { as.delete(s), ue.removeChannel(u), f.data.subscription.unsubscribe(); }; }, signInAdmin: async (s, u) => { if (ss(), !ue)
        throw new Error("Global administration requires a connection to Supabase."); const f = await Yo(); if (f.rooms.some(A => A.players.some(E => E.id === f.identity.playerId)))
        throw new Error("Leave your current room before signing in as a global admin. This keeps your player seat connected to its original identity."); Bl++; const o = new AbortController, d = setTimeout(() => o.abort(), 1e4); let m; try {
        const { data: A, error: E } = await ue.rpc("pit_admin_login_identity", { p_username: s.trim().toLowerCase() }).abortSignal(o.signal);
        if (E || !A?.email)
            throw Zf(E?.message ?? "Admin username is not configured. Check pit_private.admin_aliases in V11_ADMIN_SETUP.md.");
        m = A.email;
    }
    finally {
        clearTimeout(d);
    } const { error: y } = await ue.auth.signInWithPassword({ email: m, password: u }); if (y)
        throw Zf(y.message.toLowerCase().includes("email not confirmed") ? "Admin email is not confirmed. Ask the project owner to confirm this Auth user in Supabase." : y.message); if (Bl++, !(await Yo()).identity.isAdmin)
        throw await ue.auth.signOut(), Bl++, new Error("This Auth account is not in the global admin allowlist. Check pit_private.admins and admin_aliases in V11_ADMIN_SETUP.md."); queueMicrotask(() => as.forEach(A => A())); }, signOutAdmin: async () => { if (!ue)
        throw new Error("Global administration requires a connection to Supabase."); if (ue) {
        const s = await Yo();
        if (s.rooms.some(f => f.players.some(o => o.id === s.identity.playerId)))
            throw new Error("Leave your current room before signing out, so your active player seat stays connected.");
        Bl++;
        const { error: u } = await ue.auth.signOut();
        if (u)
            throw new Error(u.message);
        Bl++, queueMicrotask(() => as.forEach(f => f()));
    } } }, b1 = { type: "change" }, ed = { type: "start" }, ay = { type: "end" }, ko = new Kg, E1 = new Fg, qv = Math.cos(70 * Vn.DEG2RAD), We = new tt, Ua = 2 * Math.PI, ce = { NONE: -1, ROTATE: 0, DOLLY: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_PAN: 4, TOUCH_DOLLY_PAN: 5, TOUCH_DOLLY_ROTATE: 6 }, Df = 1e-6;
class Yv extends Ig {
    constructor(u, f = null) { super(u, f), this.state = ce.NONE, this.target = new tt, this.cursor = new tt, this.minDistance = 0, this.maxDistance = 1 / 0, this.minZoom = 0, this.maxZoom = 1 / 0, this.minTargetRadius = 0, this.maxTargetRadius = 1 / 0, this.minPolarAngle = 0, this.maxPolarAngle = Math.PI, this.minAzimuthAngle = -1 / 0, this.maxAzimuthAngle = 1 / 0, this.enableDamping = !1, this.dampingFactor = .05, this.enableZoom = !0, this.zoomSpeed = 1, this.enableRotate = !0, this.rotateSpeed = 1, this.keyRotateSpeed = 1, this.enablePan = !0, this.panSpeed = 1, this.screenSpacePanning = !0, this.keyPanSpeed = 7, this.zoomToCursor = !1, this.autoRotate = !1, this.autoRotateSpeed = 2, this.keys = { LEFT: "ArrowLeft", UP: "ArrowUp", RIGHT: "ArrowRight", BOTTOM: "ArrowDown" }, this.mouseButtons = { LEFT: os.ROTATE, MIDDLE: os.DOLLY, RIGHT: os.PAN }, this.touches = { ONE: ls.ROTATE, TWO: ls.DOLLY_PAN }, this.target0 = this.target.clone(), this.position0 = this.object.position.clone(), this.zoom0 = this.object.zoom, this._domElementKeyEvents = null, this._lastPosition = new tt, this._lastQuaternion = new e1, this._lastTargetPosition = new tt, this._quat = new e1().setFromUnitVectors(u.up, new tt(0, 1, 0)), this._quatInverse = this._quat.clone().invert(), this._spherical = new a1, this._sphericalDelta = new a1, this._scale = 1, this._panOffset = new tt, this._rotateStart = new hn, this._rotateEnd = new hn, this._rotateDelta = new hn, this._panStart = new hn, this._panEnd = new hn, this._panDelta = new hn, this._dollyStart = new hn, this._dollyEnd = new hn, this._dollyDelta = new hn, this._dollyDirection = new tt, this._mouse = new hn, this._performCursorZoom = !1, this._pointers = [], this._pointerPositions = {}, this._controlActive = !1, this._onPointerMove = Vv.bind(this), this._onPointerDown = kv.bind(this), this._onPointerUp = Xv.bind(this), this._onContextMenu = Wv.bind(this), this._onMouseWheel = Iv.bind(this), this._onKeyDown = Kv.bind(this), this._onTouchStart = Fv.bind(this), this._onTouchMove = Jv.bind(this), this._onMouseDown = Zv.bind(this), this._onMouseMove = Qv.bind(this), this._interceptControlDown = $v.bind(this), this._interceptControlUp = Pv.bind(this), this.domElement !== null && this.connect(this.domElement), this.update(); }
    connect(u) { super.connect(u), this.domElement.addEventListener("pointerdown", this._onPointerDown), this.domElement.addEventListener("pointercancel", this._onPointerUp), this.domElement.addEventListener("contextmenu", this._onContextMenu), this.domElement.addEventListener("wheel", this._onMouseWheel, { passive: !1 }), this.domElement.getRootNode().addEventListener("keydown", this._interceptControlDown, { passive: !0, capture: !0 }), this.domElement.style.touchAction = "none"; }
    disconnect() { this.domElement.removeEventListener("pointerdown", this._onPointerDown), this.domElement.removeEventListener("pointermove", this._onPointerMove), this.domElement.removeEventListener("pointerup", this._onPointerUp), this.domElement.removeEventListener("pointercancel", this._onPointerUp), this.domElement.removeEventListener("wheel", this._onMouseWheel), this.domElement.removeEventListener("contextmenu", this._onContextMenu), this.stopListenToKeyEvents(), this.domElement.getRootNode().removeEventListener("keydown", this._interceptControlDown, { capture: !0 }), this.domElement.style.touchAction = "auto"; }
    dispose() { this.disconnect(); }
    getPolarAngle() { return this._spherical.phi; }
    getAzimuthalAngle() { return this._spherical.theta; }
    getDistance() { return this.object.position.distanceTo(this.target); }
    listenToKeyEvents(u) { u.addEventListener("keydown", this._onKeyDown), this._domElementKeyEvents = u; }
    stopListenToKeyEvents() { this._domElementKeyEvents !== null && (this._domElementKeyEvents.removeEventListener("keydown", this._onKeyDown), this._domElementKeyEvents = null); }
    saveState() { this.target0.copy(this.target), this.position0.copy(this.object.position), this.zoom0 = this.object.zoom; }
    reset() { this.target.copy(this.target0), this.object.position.copy(this.position0), this.object.zoom = this.zoom0, this.object.updateProjectionMatrix(), this.dispatchEvent(b1), this.update(), this.state = ce.NONE; }
    update(u = null) { const f = this.object.position; We.copy(f).sub(this.target), We.applyQuaternion(this._quat), this._spherical.setFromVector3(We), this.autoRotate && this.state === ce.NONE && this._rotateLeft(this._getAutoRotationAngle(u)), this.enableDamping ? (this._spherical.theta += this._sphericalDelta.theta * this.dampingFactor, this._spherical.phi += this._sphericalDelta.phi * this.dampingFactor) : (this._spherical.theta += this._sphericalDelta.theta, this._spherical.phi += this._sphericalDelta.phi); let o = this.minAzimuthAngle, d = this.maxAzimuthAngle; isFinite(o) && isFinite(d) && (o < -Math.PI ? o += Ua : o > Math.PI && (o -= Ua), d < -Math.PI ? d += Ua : d > Math.PI && (d -= Ua), o <= d ? this._spherical.theta = Math.max(o, Math.min(d, this._spherical.theta)) : this._spherical.theta = this._spherical.theta > (o + d) / 2 ? Math.max(o, this._spherical.theta) : Math.min(d, this._spherical.theta)), this._spherical.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this._spherical.phi)), this._spherical.makeSafe(), this.enableDamping === !0 ? this.target.addScaledVector(this._panOffset, this.dampingFactor) : this.target.add(this._panOffset), this.target.sub(this.cursor), this.target.clampLength(this.minTargetRadius, this.maxTargetRadius), this.target.add(this.cursor); let m = !1; if (this.zoomToCursor && this._performCursorZoom || this.object.isOrthographicCamera)
        this._spherical.radius = this._clampDistance(this._spherical.radius);
    else {
        const y = this._spherical.radius;
        this._spherical.radius = this._clampDistance(this._spherical.radius * this._scale), m = y != this._spherical.radius;
    } if (We.setFromSpherical(this._spherical), We.applyQuaternion(this._quatInverse), f.copy(this.target).add(We), this.object.lookAt(this.target), this.enableDamping === !0 ? (this._sphericalDelta.theta *= 1 - this.dampingFactor, this._sphericalDelta.phi *= 1 - this.dampingFactor, this._panOffset.multiplyScalar(1 - this.dampingFactor)) : (this._sphericalDelta.set(0, 0, 0), this._panOffset.set(0, 0, 0)), this.zoomToCursor && this._performCursorZoom) {
        let y = null;
        if (this.object.isPerspectiveCamera) {
            const g = We.length();
            y = this._clampDistance(g * this._scale);
            const A = g - y;
            this.object.position.addScaledVector(this._dollyDirection, A), this.object.updateMatrixWorld(), m = !!A;
        }
        else if (this.object.isOrthographicCamera) {
            const g = new tt(this._mouse.x, this._mouse.y, 0);
            g.unproject(this.object);
            const A = this.object.zoom;
            this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / this._scale)), this.object.updateProjectionMatrix(), m = A !== this.object.zoom;
            const E = new tt(this._mouse.x, this._mouse.y, 0);
            E.unproject(this.object), this.object.position.sub(E).add(g), this.object.updateMatrixWorld(), y = We.length();
        }
        else
            console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."), this.zoomToCursor = !1;
        y !== null && (this.screenSpacePanning ? this.target.set(0, 0, -1).transformDirection(this.object.matrix).multiplyScalar(y).add(this.object.position) : (ko.origin.copy(this.object.position), ko.direction.set(0, 0, -1).transformDirection(this.object.matrix), Math.abs(this.object.up.dot(ko.direction)) < qv ? this.object.lookAt(this.target) : (E1.setFromNormalAndCoplanarPoint(this.object.up, this.target), ko.intersectPlane(E1, this.target))));
    }
    else if (this.object.isOrthographicCamera) {
        const y = this.object.zoom;
        this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / this._scale)), y !== this.object.zoom && (this.object.updateProjectionMatrix(), m = !0);
    } return this._scale = 1, this._performCursorZoom = !1, m || this._lastPosition.distanceToSquared(this.object.position) > Df || 8 * (1 - this._lastQuaternion.dot(this.object.quaternion)) > Df || this._lastTargetPosition.distanceToSquared(this.target) > Df ? (this.dispatchEvent(b1), this._lastPosition.copy(this.object.position), this._lastQuaternion.copy(this.object.quaternion), this._lastTargetPosition.copy(this.target), !0) : !1; }
    _getAutoRotationAngle(u) { return u !== null ? Ua / 60 * this.autoRotateSpeed * u : Ua / 60 / 60 * this.autoRotateSpeed; }
    _getZoomScale(u) { const f = Math.abs(u * .01); return Math.pow(.95, this.zoomSpeed * f); }
    _rotateLeft(u) { this._sphericalDelta.theta -= u; }
    _rotateUp(u) { this._sphericalDelta.phi -= u; }
    _panLeft(u, f) { We.setFromMatrixColumn(f, 0), We.multiplyScalar(-u), this._panOffset.add(We); }
    _panUp(u, f) { this.screenSpacePanning === !0 ? We.setFromMatrixColumn(f, 1) : (We.setFromMatrixColumn(f, 0), We.crossVectors(this.object.up, We)), We.multiplyScalar(u), this._panOffset.add(We); }
    _pan(u, f) { const o = this.domElement; if (this.object.isPerspectiveCamera) {
        const d = this.object.position;
        We.copy(d).sub(this.target);
        let m = We.length();
        m *= Math.tan(this.object.fov / 2 * Math.PI / 180), this._panLeft(2 * u * m / o.clientHeight, this.object.matrix), this._panUp(2 * f * m / o.clientHeight, this.object.matrix);
    }
    else
        this.object.isOrthographicCamera ? (this._panLeft(u * (this.object.right - this.object.left) / this.object.zoom / o.clientWidth, this.object.matrix), this._panUp(f * (this.object.top - this.object.bottom) / this.object.zoom / o.clientHeight, this.object.matrix)) : (console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."), this.enablePan = !1); }
    _dollyOut(u) { this.object.isPerspectiveCamera || this.object.isOrthographicCamera ? this._scale /= u : (console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."), this.enableZoom = !1); }
    _dollyIn(u) { this.object.isPerspectiveCamera || this.object.isOrthographicCamera ? this._scale *= u : (console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."), this.enableZoom = !1); }
    _updateZoomParameters(u, f) { if (!this.zoomToCursor)
        return; this._performCursorZoom = !0; const o = this.domElement.getBoundingClientRect(), d = u - o.left, m = f - o.top, y = o.width, g = o.height; this._mouse.x = d / y * 2 - 1, this._mouse.y = -(m / g) * 2 + 1, this._dollyDirection.set(this._mouse.x, this._mouse.y, 1).unproject(this.object).sub(this.object.position).normalize(); }
    _clampDistance(u) { return Math.max(this.minDistance, Math.min(this.maxDistance, u)); }
    _handleMouseDownRotate(u) { this._rotateStart.set(u.clientX, u.clientY); }
    _handleMouseDownDolly(u) { this._updateZoomParameters(u.clientX, u.clientX), this._dollyStart.set(u.clientX, u.clientY); }
    _handleMouseDownPan(u) { this._panStart.set(u.clientX, u.clientY); }
    _handleMouseMoveRotate(u) { this._rotateEnd.set(u.clientX, u.clientY), this._rotateDelta.subVectors(this._rotateEnd, this._rotateStart).multiplyScalar(this.rotateSpeed); const f = this.domElement; this._rotateLeft(Ua * this._rotateDelta.x / f.clientHeight), this._rotateUp(Ua * this._rotateDelta.y / f.clientHeight), this._rotateStart.copy(this._rotateEnd), this.update(); }
    _handleMouseMoveDolly(u) { this._dollyEnd.set(u.clientX, u.clientY), this._dollyDelta.subVectors(this._dollyEnd, this._dollyStart), this._dollyDelta.y > 0 ? this._dollyOut(this._getZoomScale(this._dollyDelta.y)) : this._dollyDelta.y < 0 && this._dollyIn(this._getZoomScale(this._dollyDelta.y)), this._dollyStart.copy(this._dollyEnd), this.update(); }
    _handleMouseMovePan(u) { this._panEnd.set(u.clientX, u.clientY), this._panDelta.subVectors(this._panEnd, this._panStart).multiplyScalar(this.panSpeed), this._pan(this._panDelta.x, this._panDelta.y), this._panStart.copy(this._panEnd), this.update(); }
    _handleMouseWheel(u) { this._updateZoomParameters(u.clientX, u.clientY), u.deltaY < 0 ? this._dollyIn(this._getZoomScale(u.deltaY)) : u.deltaY > 0 && this._dollyOut(this._getZoomScale(u.deltaY)), this.update(); }
    _handleKeyDown(u) { let f = !1; switch (u.code) {
        case this.keys.UP:
            u.ctrlKey || u.metaKey || u.shiftKey ? this.enableRotate && this._rotateUp(Ua * this.keyRotateSpeed / this.domElement.clientHeight) : this.enablePan && this._pan(0, this.keyPanSpeed), f = !0;
            break;
        case this.keys.BOTTOM:
            u.ctrlKey || u.metaKey || u.shiftKey ? this.enableRotate && this._rotateUp(-Ua * this.keyRotateSpeed / this.domElement.clientHeight) : this.enablePan && this._pan(0, -this.keyPanSpeed), f = !0;
            break;
        case this.keys.LEFT:
            u.ctrlKey || u.metaKey || u.shiftKey ? this.enableRotate && this._rotateLeft(Ua * this.keyRotateSpeed / this.domElement.clientHeight) : this.enablePan && this._pan(this.keyPanSpeed, 0), f = !0;
            break;
        case this.keys.RIGHT:
            u.ctrlKey || u.metaKey || u.shiftKey ? this.enableRotate && this._rotateLeft(-Ua * this.keyRotateSpeed / this.domElement.clientHeight) : this.enablePan && this._pan(-this.keyPanSpeed, 0), f = !0;
            break;
    } f && (u.preventDefault(), this.update()); }
    _handleTouchStartRotate(u) { if (this._pointers.length === 1)
        this._rotateStart.set(u.pageX, u.pageY);
    else {
        const f = this._getSecondPointerPosition(u), o = .5 * (u.pageX + f.x), d = .5 * (u.pageY + f.y);
        this._rotateStart.set(o, d);
    } }
    _handleTouchStartPan(u) { if (this._pointers.length === 1)
        this._panStart.set(u.pageX, u.pageY);
    else {
        const f = this._getSecondPointerPosition(u), o = .5 * (u.pageX + f.x), d = .5 * (u.pageY + f.y);
        this._panStart.set(o, d);
    } }
    _handleTouchStartDolly(u) { const f = this._getSecondPointerPosition(u), o = u.pageX - f.x, d = u.pageY - f.y, m = Math.sqrt(o * o + d * d); this._dollyStart.set(0, m); }
    _handleTouchStartDollyPan(u) { this.enableZoom && this._handleTouchStartDolly(u), this.enablePan && this._handleTouchStartPan(u); }
    _handleTouchStartDollyRotate(u) { this.enableZoom && this._handleTouchStartDolly(u), this.enableRotate && this._handleTouchStartRotate(u); }
    _handleTouchMoveRotate(u) { if (this._pointers.length == 1)
        this._rotateEnd.set(u.pageX, u.pageY);
    else {
        const o = this._getSecondPointerPosition(u), d = .5 * (u.pageX + o.x), m = .5 * (u.pageY + o.y);
        this._rotateEnd.set(d, m);
    } this._rotateDelta.subVectors(this._rotateEnd, this._rotateStart).multiplyScalar(this.rotateSpeed); const f = this.domElement; this._rotateLeft(Ua * this._rotateDelta.x / f.clientHeight), this._rotateUp(Ua * this._rotateDelta.y / f.clientHeight), this._rotateStart.copy(this._rotateEnd); }
    _handleTouchMovePan(u) { if (this._pointers.length === 1)
        this._panEnd.set(u.pageX, u.pageY);
    else {
        const f = this._getSecondPointerPosition(u), o = .5 * (u.pageX + f.x), d = .5 * (u.pageY + f.y);
        this._panEnd.set(o, d);
    } this._panDelta.subVectors(this._panEnd, this._panStart).multiplyScalar(this.panSpeed), this._pan(this._panDelta.x, this._panDelta.y), this._panStart.copy(this._panEnd); }
    _handleTouchMoveDolly(u) { const f = this._getSecondPointerPosition(u), o = u.pageX - f.x, d = u.pageY - f.y, m = Math.sqrt(o * o + d * d); this._dollyEnd.set(0, m), this._dollyDelta.set(0, Math.pow(this._dollyEnd.y / this._dollyStart.y, this.zoomSpeed)), this._dollyOut(this._dollyDelta.y), this._dollyStart.copy(this._dollyEnd); const y = (u.pageX + f.x) * .5, g = (u.pageY + f.y) * .5; this._updateZoomParameters(y, g); }
    _handleTouchMoveDollyPan(u) { this.enableZoom && this._handleTouchMoveDolly(u), this.enablePan && this._handleTouchMovePan(u); }
    _handleTouchMoveDollyRotate(u) { this.enableZoom && this._handleTouchMoveDolly(u), this.enableRotate && this._handleTouchMoveRotate(u); }
    _addPointer(u) { this._pointers.push(u.pointerId); }
    _removePointer(u) { delete this._pointerPositions[u.pointerId]; for (let f = 0; f < this._pointers.length; f++)
        if (this._pointers[f] == u.pointerId) {
            this._pointers.splice(f, 1);
            return;
        } }
    _isTrackingPointer(u) { for (let f = 0; f < this._pointers.length; f++)
        if (this._pointers[f] == u.pointerId)
            return !0; return !1; }
    _trackPointer(u) { let f = this._pointerPositions[u.pointerId]; f === void 0 && (f = new hn, this._pointerPositions[u.pointerId] = f), f.set(u.pageX, u.pageY); }
    _getSecondPointerPosition(u) { const f = u.pointerId === this._pointers[0] ? this._pointers[1] : this._pointers[0]; return this._pointerPositions[f]; }
    _customWheelEvent(u) { const f = u.deltaMode, o = { clientX: u.clientX, clientY: u.clientY, deltaY: u.deltaY }; switch (f) {
        case 1:
            o.deltaY *= 16;
            break;
        case 2:
            o.deltaY *= 100;
            break;
    } return u.ctrlKey && !this._controlActive && (o.deltaY *= 10), o; }
}
function kv(s) { this.enabled !== !1 && (this._pointers.length === 0 && (this.domElement.setPointerCapture(s.pointerId), this.domElement.addEventListener("pointermove", this._onPointerMove), this.domElement.addEventListener("pointerup", this._onPointerUp)), !this._isTrackingPointer(s) && (this._addPointer(s), s.pointerType === "touch" ? this._onTouchStart(s) : this._onMouseDown(s))); }
function Vv(s) { this.enabled !== !1 && (s.pointerType === "touch" ? this._onTouchMove(s) : this._onMouseMove(s)); }
function Xv(s) { switch (this._removePointer(s), this._pointers.length) {
    case 0:
        this.domElement.releasePointerCapture(s.pointerId), this.domElement.removeEventListener("pointermove", this._onPointerMove), this.domElement.removeEventListener("pointerup", this._onPointerUp), this.dispatchEvent(ay), this.state = ce.NONE;
        break;
    case 1:
        const u = this._pointers[0], f = this._pointerPositions[u];
        this._onTouchStart({ pointerId: u, pageX: f.x, pageY: f.y });
        break;
} }
function Zv(s) { let u; switch (s.button) {
    case 0:
        u = this.mouseButtons.LEFT;
        break;
    case 1:
        u = this.mouseButtons.MIDDLE;
        break;
    case 2:
        u = this.mouseButtons.RIGHT;
        break;
    default: u = -1;
} switch (u) {
    case os.DOLLY:
        if (this.enableZoom === !1)
            return;
        this._handleMouseDownDolly(s), this.state = ce.DOLLY;
        break;
    case os.ROTATE:
        if (s.ctrlKey || s.metaKey || s.shiftKey) {
            if (this.enablePan === !1)
                return;
            this._handleMouseDownPan(s), this.state = ce.PAN;
        }
        else {
            if (this.enableRotate === !1)
                return;
            this._handleMouseDownRotate(s), this.state = ce.ROTATE;
        }
        break;
    case os.PAN:
        if (s.ctrlKey || s.metaKey || s.shiftKey) {
            if (this.enableRotate === !1)
                return;
            this._handleMouseDownRotate(s), this.state = ce.ROTATE;
        }
        else {
            if (this.enablePan === !1)
                return;
            this._handleMouseDownPan(s), this.state = ce.PAN;
        }
        break;
    default: this.state = ce.NONE;
} this.state !== ce.NONE && this.dispatchEvent(ed); }
function Qv(s) { switch (this.state) {
    case ce.ROTATE:
        if (this.enableRotate === !1)
            return;
        this._handleMouseMoveRotate(s);
        break;
    case ce.DOLLY:
        if (this.enableZoom === !1)
            return;
        this._handleMouseMoveDolly(s);
        break;
    case ce.PAN:
        if (this.enablePan === !1)
            return;
        this._handleMouseMovePan(s);
        break;
} }
function Iv(s) { this.enabled === !1 || this.enableZoom === !1 || this.state !== ce.NONE || (s.preventDefault(), this.dispatchEvent(ed), this._handleMouseWheel(this._customWheelEvent(s)), this.dispatchEvent(ay)); }
function Kv(s) { this.enabled !== !1 && this._handleKeyDown(s); }
function Fv(s) { switch (this._trackPointer(s), this._pointers.length) {
    case 1:
        switch (this.touches.ONE) {
            case ls.ROTATE:
                if (this.enableRotate === !1)
                    return;
                this._handleTouchStartRotate(s), this.state = ce.TOUCH_ROTATE;
                break;
            case ls.PAN:
                if (this.enablePan === !1)
                    return;
                this._handleTouchStartPan(s), this.state = ce.TOUCH_PAN;
                break;
            default: this.state = ce.NONE;
        }
        break;
    case 2:
        switch (this.touches.TWO) {
            case ls.DOLLY_PAN:
                if (this.enableZoom === !1 && this.enablePan === !1)
                    return;
                this._handleTouchStartDollyPan(s), this.state = ce.TOUCH_DOLLY_PAN;
                break;
            case ls.DOLLY_ROTATE:
                if (this.enableZoom === !1 && this.enableRotate === !1)
                    return;
                this._handleTouchStartDollyRotate(s), this.state = ce.TOUCH_DOLLY_ROTATE;
                break;
            default: this.state = ce.NONE;
        }
        break;
    default: this.state = ce.NONE;
} this.state !== ce.NONE && this.dispatchEvent(ed); }
function Jv(s) { switch (this._trackPointer(s), this.state) {
    case ce.TOUCH_ROTATE:
        if (this.enableRotate === !1)
            return;
        this._handleTouchMoveRotate(s), this.update();
        break;
    case ce.TOUCH_PAN:
        if (this.enablePan === !1)
            return;
        this._handleTouchMovePan(s), this.update();
        break;
    case ce.TOUCH_DOLLY_PAN:
        if (this.enableZoom === !1 && this.enablePan === !1)
            return;
        this._handleTouchMoveDollyPan(s), this.update();
        break;
    case ce.TOUCH_DOLLY_ROTATE:
        if (this.enableZoom === !1 && this.enableRotate === !1)
            return;
        this._handleTouchMoveDollyRotate(s), this.update();
        break;
    default: this.state = ce.NONE;
} }
function Wv(s) { this.enabled !== !1 && s.preventDefault(); }
function $v(s) { s.key === "Control" && (this._controlActive = !0, this.domElement.getRootNode().addEventListener("keyup", this._interceptControlUp, { passive: !0, capture: !0 })); }
function Pv(s) { s.key === "Control" && (this._controlActive = !1, this.domElement.getRootNode().removeEventListener("keyup", this._interceptControlUp, { passive: !0, capture: !0 })); }
function tb(s, u = !1) { const f = s[0].index !== null, o = new Set(Object.keys(s[0].attributes)), d = new Set(Object.keys(s[0].morphAttributes)), m = {}, y = {}, g = s[0].morphTargetsRelative, A = new U1; let E = 0; for (let R = 0; R < s.length; ++R) {
    const T = s[R];
    let x = 0;
    if (f !== (T.index !== null))
        return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + R + ". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."), null;
    for (const C in T.attributes) {
        if (!o.has(C))
            return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + R + '. All geometries must have compatible attributes; make sure "' + C + '" attribute exists among all geometries, or in none of them.'), null;
        m[C] === void 0 && (m[C] = []), m[C].push(T.attributes[C]), x++;
    }
    if (x !== o.size)
        return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + R + ". Make sure all geometries have the same number of attributes."), null;
    if (g !== T.morphTargetsRelative)
        return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + R + ". .morphTargetsRelative must be consistent throughout all geometries."), null;
    for (const C in T.morphAttributes) {
        if (!d.has(C))
            return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + R + ".  .morphAttributes must be consistent throughout all geometries."), null;
        y[C] === void 0 && (y[C] = []), y[C].push(T.morphAttributes[C]);
    }
    if (u) {
        let C;
        if (f)
            C = T.index.count;
        else if (T.attributes.position !== void 0)
            C = T.attributes.position.count;
        else
            return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + R + ". The geometry must have either an index or a position attribute"), null;
        A.addGroup(E, C, R), E += C;
    }
} if (f) {
    let R = 0;
    const T = [];
    for (let x = 0; x < s.length; ++x) {
        const C = s[x].index;
        for (let L = 0; L < C.count; ++L)
            T.push(C.getX(L) + R);
        R += s[x].attributes.position.count;
    }
    A.setIndex(T);
} for (const R in m) {
    const T = N1(m[R]);
    if (!T)
        return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the " + R + " attribute."), null;
    A.setAttribute(R, T);
} for (const R in y) {
    const T = y[R][0].length;
    if (T === 0)
        break;
    A.morphAttributes = A.morphAttributes || {}, A.morphAttributes[R] = [];
    for (let x = 0; x < T; ++x) {
        const C = [];
        for (let I = 0; I < y[R].length; ++I)
            C.push(y[R][I][x]);
        const L = N1(C);
        if (!L)
            return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the " + R + " morphAttribute."), null;
        A.morphAttributes[R].push(L);
    }
} return A; }
function N1(s) { let u, f, o, d = -1, m = 0; for (let E = 0; E < s.length; ++E) {
    const R = s[E];
    if (u === void 0 && (u = R.array.constructor), u !== R.array.constructor)
        return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."), null;
    if (f === void 0 && (f = R.itemSize), f !== R.itemSize)
        return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."), null;
    if (o === void 0 && (o = R.normalized), o !== R.normalized)
        return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."), null;
    if (d === -1 && (d = R.gpuType), d !== R.gpuType)
        return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."), null;
    m += R.count * f;
} const y = new u(m), g = new Jg(y, f, o); let A = 0; for (let E = 0; E < s.length; ++E) {
    const R = s[E];
    if (R.isInterleavedBufferAttribute) {
        const T = A / f;
        for (let x = 0, C = R.count; x < C; x++)
            for (let L = 0; L < f; L++) {
                const I = R.getComponent(x, L);
                g.setComponent(x + T, L, I);
            }
    }
    else
        y.set(R.array, A);
    A += R.count * f;
} return d !== void 0 && (g.gpuType = d), g; }
function du(s) { return s === "GREEN_RELEASE" ? 1e3 : s.endsWith("_LIFT") || s.endsWith("_LOWER") ? 650 : s.endsWith("_WHEEL_OFF") || s.endsWith("_WHEEL_ON") ? 850 : 750; }
class ny {
    roundId = null;
    receipts = new Map;
    doneIds = new Set;
    recordedSignature = "";
    liveRoundId = null;
    ingestLive(round, nowMs) {
      if (!round) { this.liveRoundId = null; this.roundId = null; this.receipts.clear(); this.doneIds.clear(); return; }
      if (this.liveRoundId !== round.id) {
        this.liveRoundId = round.id; this.roundId = round.id; this.receipts.clear(); this.doneIds.clear();
        for (const task of round.tasks) if (task.status === "DONE") {
          this.doneIds.add(task.id);
          this.receipts.set(this.key(task.id), Object.freeze({ roundId: round.id, taskId: task.id, startsAt: nowMs, endsAt: nowMs }));
        }
      }
      for (const task of round.tasks) {
        if (task.status !== "AVAILABLE" || task.ownerId !== null || task.dueAt === null || task.enabledAt === null) continue;
        const duration = Math.max(120, Math.min(du(task.id), task.dueAt - task.enabledAt));
        const current = this.receipt(task.id);
        if (!current || (current.startsAt > nowMs && current.endsAt !== task.dueAt)) {
          this.receipts.set(this.key(task.id), Object.freeze({roundId:round.id,taskId:task.id,startsAt:task.dueAt-duration,endsAt:task.dueAt}));
        }
      }
      const incoming = round.tasks.filter(task=>task.status==="DONE"&&!this.doneIds.has(task.id)&&task.completedAt!==null)
        .sort((a,b)=>a.completedAt-b.completedAt||a.id.localeCompare(b.id));
      for(const task of incoming){
        this.doneIds.add(task.id);
        const prior=this.receipt(task.id),completed=task.completedAt;
        const duration=Math.max(120,Math.min(du(task.id),completed-(task.enabledAt??completed)||120));
        if(prior&&Math.abs(prior.endsAt-completed)<=90&&prior.startsAt<=nowMs&&nowMs<prior.endsAt)continue;
        const recent=completed>=nowMs-1500&&incoming.length<6;
        const parentEnd=recent?Math.max(nowMs,...task.dependencies.map(id=>this.receipt(id)?.endsAt??nowMs)):nowMs;
        const startsAt=recent?parentEnd:nowMs;
        this.receipts.set(this.key(task.id),Object.freeze({roundId:round.id,taskId:task.id,startsAt,endsAt:recent?startsAt+duration:nowMs}));
      }
    }
    ingestRecorded(u) { const f = JSON.stringify([u?.id, ...(u?.tasks ?? []).map(y => [y.id, y.completedAt, y.enabledAt, y.status])]); if (f === this.recordedSignature || (this.recordedSignature = f, this.roundId = u?.id ?? null, this.receipts.clear(), this.doneIds.clear(), !u))
        return; const o = new Map(u.tasks.map(y => [y.id, y])), d = new Set, m = y => { const g = this.receipt(y.id); if (g)
        return g; if (y.completedAt === null || y.status !== "DONE" || !Number.isFinite(y.completedAt) || d.has(y.id))
        return; d.add(y.id); const E = y.dependencies.map(L => o.get(L)).filter(Boolean).map(m).filter(Boolean), R = Math.max(u.goAt, y.completedAt, ...E.map(L => L.endsAt)), T = y.enabledAt === null ? du(y.id) : Math.max(0, y.completedAt - y.enabledAt), x = Math.max(120, Math.min(du(y.id), T || 120)), botTask = y.ownerId === null && y.enabledAt !== null, finish = botTask ? y.completedAt : R + x, start = botTask ? Math.max(y.enabledAt, finish - x) : R, C = Object.freeze({ roundId: u.id, taskId: y.id, startsAt: start, endsAt: finish }); return this.receipts.set(this.key(y.id), C), this.doneIds.add(y.id), d.delete(y.id), C; }; u.tasks.forEach(m); for (const task of u.tasks) { if (task.ownerId === null && task.status === "AVAILABLE" && task.enabledAt !== null && Number.isFinite(task.dueAt) && task.dueAt >= task.enabledAt && !this.receipt(task.id)) { const animationMs = Math.max(120, Math.min(du(task.id), task.dueAt - task.enabledAt || 120)); this.receipts.set(this.key(task.id), Object.freeze({ roundId: u.id, taskId: task.id, startsAt: task.dueAt - animationMs, endsAt: task.dueAt })); } } }
    key(u) { return `${this.roundId}:${u}`; }
    ingest(u, f, o = !1) { if (u?.id !== this.roundId || o) {
        this.roundId = u?.id ?? null, this.receipts.clear(), this.doneIds.clear();
        for (const g of u?.tasks ?? [])
            g.status === "DONE" && (this.doneIds.add(g.id), this.receipts.set(this.key(g.id), Object.freeze({ roundId: u.id, taskId: g.id, startsAt: f, endsAt: f })));
        return;
    } if (!u)
        return; const d = new Map(u.tasks.map(g => [g.id, g])); this.doneIds = new Set(u.tasks.filter(g => g.status === "DONE").map(g => g.id)); const m = new Set, y = g => { const A = this.receipt(g.id); if (A)
        return A; if (m.has(g.id))
        return; m.add(g.id); let E = f; for (const T of g.dependencies) {
        const x = d.get(T), C = x?.status === "DONE" ? y(x) : this.receipt(T);
        C && (E = Math.max(E, C.endsAt));
    } m.delete(g.id); const R = Object.freeze({ roundId: u.id, taskId: g.id, startsAt: E, endsAt: E + du(g.id) }); return this.receipts.set(this.key(g.id), R), R; }; for (const g of u.tasks)
        g.status === "DONE" && y(g); }
    acknowledge(u, f, o) { const d = new Map(f.map(T => [T.id, T])), m = new Set, y = T => { if (m.has(T))
        return; m.add(T); const x = d.get(T); if (!x || x.status !== "DONE")
        return; x.dependencies.forEach(y); const C = this.receipt(T); C && C.endsAt > o && this.receipts.set(this.key(T), Object.freeze({ ...C, startsAt: o, endsAt: o })); }, g = d.get(u); if (!g)
        return; g.dependencies.forEach(y); const A = this.receipt(u); A && A.endsAt > o && this.receipts.set(this.key(u), Object.freeze({ ...A, startsAt: o, endsAt: o + du(u) })); const E = new Set, R = T => { const x = this.receipt(T); if (!x || E.has(T) || (E.add(T), T === u || m.has(T) || x.endsAt <= o))
        return x; const C = d.get(T); if (!C)
        return x; const L = C.dependencies.map(R).filter(Boolean); if (x.startsAt < o)
        return x; const I = Math.max(o, ...L.map(Q => Q.endsAt)), K = Object.freeze({ ...x, startsAt: I, endsAt: I + du(T) }); return this.receipts.set(this.key(T), K), K; }; f.forEach(T => R(T.id)); }
    receipt(u) { return this.receipts.get(this.key(u)); }
    phase(u, f) { const o = this.receipt(u); return !o || o.endsAt <= f ? null : Math.max(0, (f - o.startsAt) / (o.endsAt - o.startsAt)); }
    isDone(u, f) { const o = this.receipt(u); return this.doneIds.has(u) && o !== void 0 && o.endsAt <= f; }
    activeTaskIds(u) { return [...this.receipts.values()].filter(f => f.startsAt <= u && u < f.endsAt).map(f => f.taskId); }
}
function eb(s, u, f) { const o = u.receipt(s.id), m = !!o && o.startsAt <= f && f < o.endsAt ? "WORK" : u.isDone(s.id, f) ? "DONE" : s.enabledAt === null || f < s.enabledAt ? "LOCKED" : "WAIT"; return { taskId: s.id, state: m, enabledAt: s.enabledAt, baselineMeanMs: s.baselineMeanMs, dueAt: s.dueAt, eventAt: s.completedAt, visualStartsAt: o?.startsAt ?? null, visualEndsAt: o?.endsAt ?? null, reason: s.reason ?? null }; }
const ad = Object.freeze({ stop: { x: 0, z: 0 }, laneLength: 152, apron: { left: -8.8, right: 6.4 }, fastLane: { left: 6.4, right: 12.6 }, garagesX: -10.8, pitWallX: 13.1, approachX: 8.6, approachZ: 26, turnStartZ: 22, mergeZ: 7.6, exitZ: -28 });
function ab(s) { const { scene: u, material: f, basic: o, box: d, mesh: m, rod: y, graphic: g, decal: A, textTexture: E, geometries: R } = s, T = f("#edc24b", .89), x = f("#e1e6d9", .88), C = f("#263640", .76, .28), L = f("#596c73", .54, .4), I = f("#d53539", .62, .15), K = f("#142630", .85), Q = f("#8c9690", .98), P = f("#39474a", .99), Ct = f("#496c5d", 1); d(u, Ct, 0, -.19, 0, 110, .3, 176), d(u, P, 6.7, -.045, 0, 12.2, .08, 158), d(u, Q, -1.2, -.037, 0, 15.2, .09, 158), d(u, f("#56636a", 1), 23, -.025, 0, 15, .1, 164); const at = g(Z => { Z.fillStyle = "#ffffff", Z.fillRect(0, 0, 512, 512); let pt = 9427; for (let G = 0; G < 15e3; G++) {
    pt = pt * 16807 % 2147483647;
    const F = pt % 512;
    pt = pt * 16807 % 2147483647;
    const ft = pt % 512, xt = pt % 18 / 100;
    Z.fillStyle = `rgba(25,37,36,${xt})`, Z.fillRect(F, ft, 1 + G % 3, 1);
} Z.strokeStyle = "#56615e30", Z.lineWidth = 1; for (let G = 0; G < 512; G += 128)
    Z.beginPath(), Z.moveTo(0, G), Z.lineTo(512, G), Z.stroke(); }); at.wrapS = at.wrapT = Wg, at.repeat.set(9, 68), Q.map = at, P.map = at; const Tt = f("#687875", .98); for (let Z = -76; Z < 77; Z += 4)
    d(u, Tt, -1.2, .012, Z, 15.1, .008, .025); d(u, x, 6.4, .018, 0, .13, .012, 154), d(u, T, -7.5, .019, 0, .12, .012, 154); for (let Z = -74; Z < 75; Z += 4.6)
    d(u, x, 9.8, .018, Z, .095, .012, 2.1); for (const Z of [-4.96, 4.96])
    d(u, T, Z, .026, -.4, .12, .018, 9.2); for (const Z of [-4.65, 3.83])
    d(u, T, 0, .026, Z, 9.9, .018, .105); for (const Z of [-1.57, 1.57])
    d(u, x, Z, .03, -.3, .045, .016, 5.7), d(u, T, Z + Math.sign(Z) * .3, .032, -3.35, .65, .018, .12); function Nt(Z, pt, G = 1) { d(u, T, Z, .028, pt, .16 * G, .015, 1.6 * G); for (const F of [-1, 1]) {
    const ft = d(u, T, Z + F * .26 * G, .029, pt - .61 * G, .15 * G, .016, .79 * G);
    ft.rotation.y = F * -.76;
} } for (const Z of [-11, -21, 12, 24, 42])
    Nt(0, Z, 1.25), Nt(8.1, Z + 1, .8); A(u, E("APEX / 07", "#e5dfbf", 74), -3.3, .034, -.1, 2.8, 1.05, !0), A(u, E("PIT LANE", "#e5dfbf", 70), 8.1, .033, -6.8, 2.4, .7, !0); const q = o("#162324", .19), $ = new H1(1, 1); R.add($); for (const Z of [-1.12, 1.12])
    for (let pt = 0; pt < 3; pt++) {
        const G = m($, q, u, Z + pt * .065, .034, 4, .033, 19, 1);
        G.rotation.x = -Math.PI / 2;
    } const rt = f("#bcc5bb", .87), ye = f("#374a52", .8, .25), re = f("#638c98", .4, .28); for (let Z = -6; Z <= 6; Z++) {
    const pt = Z * 10.8;
    d(u, rt, -13.7, 2.1, pt, 5.6, 4.2, 10.45), d(u, K, -10.84, 1.68, pt, .1, 3.2, 8.7), d(u, ye, -11.1, 4.04, pt, 7.2, .27, 10.8);
    for (const F of [-1, 1])
        d(u, rt, -10.6, 1.95, pt + F * 4.9, .55, 3.9, .42), d(u, I, -10.29, 1.82, pt + F * 4.9, .055, 3.55, .23);
    d(u, C, -10.47, 3.43, pt, .4, .42, 9.5);
    for (let F = -2; F <= 2; F++)
        d(u, re, -10.34, 3.71, pt + F * 1.6, .035, .19, 1.48);
    const G = A(u, E(Z === 0 ? "APEX // PIT 07" : `PADDOCK // ${String(Z + 8).padStart(2, "0")}`, "#f2ede0", 46), -10.24, 3.38, pt, 4.2, .47);
    G.rotation.y = Math.PI / 2, d(u, L, -11.9, .5, pt - 2.8, 1.15, .95, 1.9), d(u, I, -11.25, .51, pt - 2.8, .08, .82, 1.6);
} d(u, Q, 13.1, .37, 0, .65, .75, 154), d(u, I, 12.76, .47, 0, .055, .24, 154); const fe = o("#a9bbb8", .27); for (let Z = -76; Z <= 76; Z += 5.4) {
    d(u, L, 13.16, 1.35, Z, .055, 1.95, .055);
    for (const pt of [1, 1.5, 2.1])
        d(u, fe, 13.16, pt, Z + 2.6, .025, .018, 5.4);
} for (const Z of [15.3, 30.3])
    d(u, x, Z, .035, 0, .16, .014, 160); for (let Z = -78; Z < 78; Z += 2.1)
    d(u, Math.round(Z / 2.1) % 2 ? x : I, 30.7, .048, Z, .65, .025, 2.08); const Ze = f("#637d7e", .95); for (let Z = 0; Z < 4; Z++)
    d(u, Ze, 37 + Z * 1.4, .5 + Z * .55, 5, 1.6, .6 + Z * 1.05, 108); for (const Z of [-42, -12, 23, 54])
    d(u, L, 15.1, 4.5, Z, .12, 9, .12), d(u, C, 14.65, 8.95, Z, 1.25, .2, .53), d(u, x, 14.65, 8.83, Z, 1.05, .035, .36); for (const Z of [-2.75, 2.65]) {
    d(u, C, -6.45, 1.95, Z, .18, 3.9, .18), d(u, C, -2.05, 3.88, Z, 8.95, .19, .21), d(u, I, -4.9, 3.89, Z - .13, 2.75, .15, .035), y(u, L, new tt(-6.45, 2.6, Z), new tt(-3.8, 3.88, Z), .035);
    for (const pt of [-2.15, 2.1]) {
        const G = new G1([new tt(pt, 3.83, Z), new tt(pt + .25, 3.1, Z + .14), new tt(pt + .21, 2.35, Z + .22), new tt(pt + .2, 1.85, Z + .3)]), F = new B1(G, 12, .021, 4, !1);
        R.add(F), m(F, K, u);
    }
} }
const Qf = s => { const u = Vn.clamp(s, 0, 1); return u * u * (3 - 2 * u); };
function nb(s, u, f, o = !1) { if (!s.every(Boolean))
    return { retreat: 0, drive: 0 }; const d = s.every(E => E.startsAt === E.endsAt), m = Math.max(...s.map(E => E.endsAt)), y = o || d ? +(f >= m) : Qf((f - m) / 750), g = Math.max(u?.startsAt ?? 1 / 0, m + (d || o ? 0 : 750)), A = u ? u.startsAt === u.endsAt && d ? 1 : Qf((f - g) / (o ? 1 : 1e3)) : 0; return { retreat: y, drive: A }; }
function lb(s, u) { return Math.hypot(u.x - s.x, u.y - s.y) <= 11 && u.time - s.time <= 750; }
const Lf = 3e3, ib = .43, sb = 3;
function ly(s) { const { approachX: u, turnStartZ: f, mergeZ: o } = ad, d = f - o, m = Vn.clamp((s - o) / d, 0, 1), y = m * m * m * (10 - 15 * m + 6 * m * m), g = u * 30 * m * m * (1 - m) * (1 - m) / d, E = -(u * 60 * m * (1 - m) * (1 - 2 * m) / (d * d)) / Math.pow(1 + g * g, 1.5); return { carX: u * y, carZ: s, yaw: Math.atan(g), steering: E === 0 ? 0 : Math.atan(sb * E) }; }
const ql = Array.from({ length: 513 }, (s, u) => ({ ...ly(ad.approachZ * (1 - u / 512)), distance: 0 }));
for (let s = 1; s < ql.length; s++) {
    const u = ql[s - 1], f = ql[s];
    f.distance = u.distance + Math.hypot(f.carX - u.carX, f.carZ - u.carZ);
}
const S1 = ql.at(-1).distance;
function ub(s) { let u = 0, f = ql.length - 1; for (; f - u > 1;) {
    const m = u + f >>> 1;
    ql[m].distance < s ? u = m : f = m;
} const o = ql[u], d = ql[f]; return ly(Vn.lerp(o.carZ, d.carZ, (s - o.distance) / (d.distance - o.distance))); }
function ob(s, u) { const f = s != null && Number.isFinite(s), o = f ? Vn.clamp((u - s + Lf) / Lf, 0, 1) : 0, d = o + o * o - o * o * o, m = S1 * d; return { ...ub(m), progress: d, wheelRoll: -m / ib, speed: f && u >= s - Lf && u < s ? S1 / 3 * (1 + 2 * o - 3 * o * o) : 0, entry: f ? Qf((u - s) / 250) : 0, arrived: f && u >= s }; }
const ec = [["FL", -1.12, -1.58], ["FR", 1.12, -1.58], ["RL", -1.12, 1.42], ["RR", 1.12, 1.42]], fs = ec.flatMap(([s, u, f]) => { const o = Math.sign(u); return [{ role: `${s}_GUNNER`, x: u + o * .83, z: f, angle: o * Math.PI / 2, kind: "gun" }, { role: `${s}_WHEEL_OFF`, x: u + o * 1.57, z: f + .52, angle: o * Math.PI / 2, kind: "off" }, { role: `${s}_WHEEL_ON`, x: u + o * 1.72, z: f - .84, angle: o * Math.PI / 2, kind: "on" }]; });
fs.push({ role: "FRONT_JACK", x: 0, z: -4.78, angle: Math.PI, kind: "jack" }, { role: "REAR_JACK", x: 0, z: 4.03, kind: "jack" }, { role: "RELEASE_CONTROLLER", x: 3.61, z: -3.11, angle: Math.PI / 2, kind: "release" }, { x: -1.37, z: .19, angle: -Math.PI / 2, kind: "ambient", support: "sidepod" }, { x: 1.37, z: .19, angle: Math.PI / 2, kind: "ambient", support: "sidepod" }, { x: -1.62, z: -3.2, angle: -Math.PI / 3, kind: "ambient", support: "nose" }, { x: 1.62, z: -3.2, angle: Math.PI / 3, kind: "ambient", support: "nose" }, { x: -4.65, z: 3.45, angle: -Math.PI / 2, kind: "ambient" }, { x: 4.65, z: -2.4, angle: Math.PI / 2, kind: "ambient" }, { x: -4.8, z: -.1, angle: Math.PI / 3, kind: "ambient" });
const cb = [{ halfX: .96, minZ: -.74, maxZ: 1.62 }, { halfX: .4, minZ: -2.83, maxZ: -.74 }, { halfX: 1.5, minZ: -3.35, maxZ: -2.7 }, { halfX: 1.12, minZ: 1.78, maxZ: 2.4 }, ...ec.map(([, s, u]) => ({ halfX: Math.abs(s) + .215, minZ: u - .44, maxZ: u + .44, outerWheel: !0 }))];
function rb(s, u, f = 0, o = .22) { return cb.every(d => "outerWheel" in d && d.outerWheel && Math.abs(s) < .88 - o ? !0 : Math.abs(s) - o > d.halfX || u + o < d.minZ + f || u - o > d.maxZ + f); }
function fb(s = 0, u = 0) { return fs.filter(f => f.kind === "ambient").every(f => { const d = (Math.abs(f.x) < 2.4 ? f.x + (Math.sign(f.x) * 2.7 - f.x) * u : f.x) + (f.support === "nose" ? Math.sin(f.angle ?? 0) * .13 : 0), m = f.z + (f.support === "nose" ? Math.cos(f.angle ?? 0) * .13 : 0); return rb(d, m, s, f.support === "sidepod" ? .2 : .22); }); }
function db(s, u = 0) { const f = Math.sign(s.x); return s.support === "sidepod" ? [-.21, .21].map(o => { const d = s.z - f * o, m = .61 + .285 / Math.cos(.08) - Math.tan(.08) * (d - .52); return [f * (m + .09), .71 + u, d]; }) : s.support === "nose" ? [-.16, .16].map(o => [f * 1.43, .71 + u, -3.08 + o]) : []; }
function hb(s = 0) { const u = Math.sin(Math.max(0, Math.min(1, s)) * Math.PI); return { hipY: .46, torsoY: -.1 - u * .025, torsoZ: .075 - u * .025, lean: .1 + u * .045, legs: [{ hip: [-.115, .46, .075], knee: [-.19, .34, -.265], ankle: [-.19, .1, -.39], foot: [-.19, .075, -.43] }, { hip: [.115, .46, .075], knee: [.19, .095, .19], ankle: [.19, .1, .53], foot: [.19, .075, .49] }] }; }
const us = s => { const u = Math.max(0, Math.min(1, s)); return u * u * (3 - 2 * u); };
function T1(s, u, f, o) { return o ? 0 : f !== null ? 1 - us(f / .22) : u ? 1 : s === null ? 0 : us((s - .65) / .35); }
function mb(s, u, f, o) { const d = Math.sign(u.x), m = Math.max(0, Math.min(1, o)); if (s === "off") {
    const A = us(m / .22), E = us((m - .25) / .75);
    return { x: u.x + (f.x + d * .64 - u.x) * A + d * E * 1.55, z: u.z + (f.z - u.z) * A + E * .83 };
} const y = us(m / .78), g = us((m - .86) / .14); return { x: u.x + (f.x + d * .66 - u.x) * y + d * g * 1.02, z: u.z + (f.z - u.z) * y - g * .55 }; }
function iy(s, u = {}) { const f = u.quality ?? "high", o = u.manual ?? !1, d = u.marker ?? { current: null }, m = u.tooltip ?? { current: null }, y = { current: null }, g = u.setSelected ?? (() => { }), A = u.setFallback ?? (() => { }), E = { current: { room: null, playerId: null, sceneActive: !0, presentationTime: void 0, clockOffset: 0 } }, R = { current: new ny }; let T = !0; const x = () => { y.current = null, g(null), T = !0; }, C = (z, B, k = !0, X, et) => { const st = E.current; T = !0, (st.room?.id !== z?.id || st.room?.players.find(mt => mt.id === st.playerId)?.role !== z?.players.find(mt => mt.id === B)?.role) && x(), E.current = { room: z, playerId: B, sceneActive: k, presentationTime: X, clockOffset: et === void 0 ? st.clockOffset : et - Date.now() }, X === void 0 ? R.current.ingestLive(z?.round ?? null, et ?? Date.now()) : R.current.ingestRecorded(z?.round ?? null); }; let L; try {
    L = u.renderer ?? new q1({ antialias: f === "high", alpha: !1, powerPreference: "high-performance" }), A(!1);
}
catch {
    return A(!0), null;
} let I = !1, K = 0, Q = !0, P = 0, Ct; const at = window.matchMedia("(prefers-reduced-motion: reduce)"), Tt = new $g; Tt.background = new Pg("#9ebbc5"), Tt.fog = new tv("#9ebbc5", 35, 105); const Nt = new ev(39, 1, .1, 165); o || L.setPixelRatio(Math.min(window.devicePixelRatio || 1, f === "high" ? 1.55 : 1)), L.outputColorSpace = n1, L.toneMapping = av, L.toneMappingExposure = 1.05, L.shadowMap.enabled = f === "high", L.shadowMap.type = nv, L.domElement.style.cssText = "display:block;width:100%;height:100%;position:absolute;inset:0;touch-action:none;outline:none;cursor:grab", L.domElement.setAttribute("aria-label", "Pit lane camera. Drag or swipe to rotate; scroll or pinch to zoom."), o || (L.domElement.setAttribute("tabindex", "0"), s.prepend(L.domElement)); const q = new Yv(Nt, L.domElement); let $ = !1, rt = !1; q.enabled = !o, q.enableDamping = !at.matches, q.dampingFactor = .075, q.enablePan = !1, q.minDistance = 10, q.maxDistance = 24, q.minPolarAngle = .04, q.maxPolarAngle = 1.35, q.rotateSpeed = .65, q.zoomSpeed = .5; const ye = () => { $ = !1, q.minDistance = 10, q.maxDistance = 24; const z = !o && s.clientWidth / s.clientHeight < .95; q.target.set(z ? 0 : .6, .38, z ? -1.8 : .4), Nt.position.set(z ? 11.2 : o ? 11.5 : 8.6, z ? 12 : o ? 10.5 : 8.3, z ? -14 : o ? -14.5 : -11.6), q.update(); }; ye(); const re = () => { T = !0, s.dataset.cameraYaw = q.getAzimuthalAngle().toFixed(3); }; q.addEventListener("change", re), q.addEventListener("start", () => { $ = !0, rt = !1, L.domElement.style.cursor = "grabbing"; }), q.addEventListener("end", () => { L.domElement.style.cursor = "grab"; }), o || window.addEventListener("pit-camera-reset", ye); const fe = z => { $ = !0, rt = !1, q.target.set(0, .35, 0); const B = { top: [0, 19, -.02], diagonal: [11, 12, -15], front: [.7, 5.2, -18] }, [k, X, et] = B[z]; Nt.position.set(k, X, et), q.update(), s.dataset.cameraView = z; }, Ze = z => { const B = z.detail; (B === "top" || B === "diagonal" || B === "front") && fe(B); }, Z = (z, B) => { const k = fs.find(mt => mt.role === z) ?? fs.find(mt => mt.support === (z.startsWith("NOSE") ? "nose" : "sidepod") && Math.sign(mt.x) === (z.endsWith("LEFT") ? -1 : 1)); if (!k)
    return; $ = !0, rt = !1, q.minDistance = 2; const X = k.support === "nose" || k.support === "sidepod" ? k.x : k.x * .82, et = k.z; q.target.set(X, .64, et); const st = B === "top" ? new tt(0, 5.5, -.01) : B === "front" ? new tt(Math.sign(X) * .4, 1.1, -4.4) : new tt(Math.sign(X) * 3.4, 2.5, -3); Nt.position.copy(q.target).add(st), q.update(), T = !0; }; o || window.addEventListener("pit-camera-view", Ze); const pt = z => { if ((z.key === "Home" || z.key.toLowerCase() === "r") && (ye(), z.preventDefault()), z.key === "ArrowLeft" || z.key === "ArrowRight") {
    $ = !0, rt = !1;
    const B = Nt.position.clone().sub(q.target);
    B.applyAxisAngle(new tt(0, 1, 0), z.key === "ArrowLeft" ? -.12 : .12), Nt.position.copy(q.target).add(B), q.update(), z.preventDefault();
} }; o || L.domElement.addEventListener("keydown", pt); const G = new Set, F = new Set, ft = new Set; function xt(z, B = .65, k = .08) { const X = new cv({ color: z, roughness: B, metalness: k, flatShading: !0 }); return G.add(X), X; } function Rt(z, B = 1) { const k = new s1({ color: z, transparent: B < 1, opacity: B, depthWrite: B === 1 }); return G.add(k), k; } const Kt = xt("#ed242f", .38, .2), Dt = xt("#a70f25", .5, .15), de = xt("#f3eee4", .4, .1), Lt = xt("#202a36", .56, .3), Ue = xt("#11171e", .96, .03), Ut = xt("#9cabb4", .3, .72), He = xt("#3f505f", .5, .5), Me = xt("#080e17", .22, .4), On = Rt("#ffcf47"), it = Rt("#6ce8d9"), V = Rt("#56ded3", .18), lt = new lv(1, 1, 1); F.add(lt); const Vt = new iv(1, 1); F.add(Vt); const Qt = new Af(1, 1, 1, 12); F.add(Qt); const Mt = new H1(1, 1); F.add(Mt); const vt = new wf(1, .025, 4, 40); F.add(vt); function J(z, B, k, X = 0, et = 0, st = 0, mt = 1, Jt = 1, Ce = 1) { const Wt = new qo(z, B); return Wt.position.set(X, et, st), Wt.scale.set(mt, Jt, Ce), Wt.castShadow = !0, Wt.receiveShadow = !0, k.add(Wt), Wt; } function Y(z, B, k, X, et, st, mt, Jt) { return J(lt, B, z, k, X, et, st, mt, Jt); } function Xt(z, B, k, X, et) { const st = J(Qt, B, z, 0, 0, 0, et, k.distanceTo(X), et); return st.position.copy(k).add(X).multiplyScalar(.5), st.quaternion.setFromUnitVectors(new tt(0, 1, 0), X.clone().sub(k).normalize()), st; } function wt(z, B = 512, k = 256) { const X = document.createElement("canvas"); X.width = B, X.height = k; const et = X.getContext("2d"); et && z(et); const st = new rv(X); return st.colorSpace = n1, ft.add(st), st; } function Qe(z, B, k, X, et, st, mt, Jt = !1) { const Ce = new s1({ map: B, transparent: !0, depthWrite: !1 }); G.add(Ce); const Wt = J(Mt, Ce, z, k, X, et, st, mt, 1); return Wt.castShadow = !1, Jt && (Wt.rotation.x = -Math.PI / 2), Wt; } function Ae(z, B = "#f6eee3", k = 90) { return wt(X => { X.font = `900 ${k}px Arial`, X.textAlign = "center", X.textBaseline = "middle", X.fillStyle = B, X.fillText(z, 256, 128); }); } Tt.add(new sv("#c5e5ee", "#414d42", 2)); const Oa = new l1("#ffe4ba", 3.7); Oa.position.set(-8, 14, -10), Oa.castShadow = f === "high", Oa.shadow.mapSize.set(2048, 2048), Object.assign(Oa.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10, near: .5, far: 44 }), Oa.shadow.normalBias = .025, Oa.shadow.bias = -15e-5, Tt.add(Oa); const mn = new l1("#9bcbd9", 1.2); mn.position.set(8, 6, 7), Tt.add(mn), ab({ scene: Tt, material: xt, basic: Rt, box: Y, mesh: J, rod: Xt, graphic: wt, decal: Qe, textTexture: Ae, geometries: F }); function ca(z, B, k) { const X = new wa; X.position.set(z, 0, B), X.rotation.y = k, Tt.add(X), Y(X, Kt, 0, .47, 0, .86, .71, .58), Y(X, Lt, 0, .87, 0, .94, .09, .64); for (let et = .25; et < .8; et += .17)
    Y(X, Dt, 0, et, -.296, .75, .13, .02), Y(X, Ut, 0, et + .025, -.315, .46, .02, .02); for (const et of [-.33, .33])
    for (const st of [-.22, .22]) {
        const mt = J(Qt, Ue, X, et, .1, st, .09, .06, .09);
        mt.rotation.z = Math.PI / 2;
    } for (let et = 0; et < 3; et++) {
    const st = Y(X, Ut, -.22 + et * .17, .94, 0, .04, .04, .3);
    st.rotation.y = -.3;
} Xt(X, Ut, new tt(.48, .6, -.2), new tt(.48, 1, -.2), .025); } ca(-6.2, 3.9, -.25), ca(5.8, 4.45, .5); const ve = new wa; Tt.add(ve); const gt = new wa; ve.add(gt), Y(gt, Me, 0, .26, .15, 1.52, .12, 3.8), Y(gt, Kt, 0, .48, .45, .84, .43, 3.2); const yn = new U1; yn.setAttribute("position", new uv([-.36, .72, -.72, .36, .72, -.72, -.12, .43, -3.02, .36, .72, -.72, .12, .43, -3.02, -.12, .43, -3.02, -.36, .72, -.72, -.12, .43, -3.02, -.14, .26, -3.02, -.36, .72, -.72, -.14, .26, -3.02, -.38, .3, -.72, .36, .72, -.72, .38, .3, -.72, .14, .26, -3.02, .36, .72, -.72, .14, .26, -3.02, .12, .43, -3.02, -.12, .43, -3.02, .12, .43, -3.02, .14, .26, -3.02, -.12, .43, -3.02, .14, .26, -3.02, -.14, .26, -3.02], 3)), yn.computeVertexNormals(), F.add(yn), J(yn, Kt, gt); for (const z of [-.085, .085]) {
    const B = Y(gt, de, z, .578, -1.89, .052, .015, 2.22);
    B.rotation.x = -.129;
} for (const z of [-1, 1]) {
    const B = Y(gt, Kt, z * .61, .47, .52, .57, .41, 2.06);
    B.rotation.y = z * -.08, Y(gt, Dt, z * .8, .38, .82, .12, .24, 1.1), Y(gt, Me, z * .61, .6, -.51, .39, .2, .19), Y(gt, de, z * .77, .697, .46, .055, .015, 1.35);
    const k = Qe(gt, Ae("APEX", "#ffffff", 110), z * .91, .49, .62, .8, .23);
    k.rotation.y = z * Math.PI / 2, Xt(gt, Ut, new tt(z * .27, .39, -1.4), new tt(z * 1.1, .42, -1.58), .025), Xt(gt, Lt, new tt(z * .28, .56, -1.1), new tt(z * 1.1, .42, -1.58), .03), Xt(gt, Lt, new tt(z * .3, .5, 1.03), new tt(z * 1.1, .42, 1.42), .035), Xt(gt, Lt, new tt(z * .28, .32, 1.9), new tt(z * 1.1, .42, 1.42), .027), Xt(gt, Lt, new tt(z * .3, .78, -.48), new tt(z * .65, .77, -.6), .025), Y(gt, Kt, z * .68, .8, -.59, .19, .08, .12);
} J(Vt, Me, gt, 0, .77, -.01, .31, .13, .53); const ya = new wf(.31, .033, 5, 20, Math.PI * 1.8); F.add(ya); const Fa = J(ya, Lt, gt, 0, .96, -.02); Fa.rotation.x = Math.PI / 2, Fa.scale.y = 1.5, Xt(gt, Lt, new tt(0, .73, -.48), new tt(0, .99, -.36), .028), J(Vt, de, gt, 0, .84, .1, .16, .15, .19), J(Vt, Me, gt, 0, .84, -.04, .14, .065, .09); const Xn = new i1(.34, 1.75, 4); F.add(Xn); const Ja = J(Xn, Kt, gt, 0, .86, 1.04, 1, 1, .85); Ja.rotation.x = -Math.PI / 2; const Zl = Y(gt, Dt, 0, .91, 1.12, .07, .57, .95); Zl.rotation.x = -.16, Y(gt, Me, 0, .27, -3.03, 2.95, .1, .5), Y(gt, de, 0, .37, -3.04, 2.82, .065, .39), Y(gt, Kt, 0, .43, -2.97, 2.7, .045, .23); for (const z of [-1, 1]) {
    Y(gt, de, z * 1.43, .43, -3.01, .07, .37, .58);
    const B = Qe(gt, Ae("APEX", "#18232e", 110), z * .9, .412, -3.07, .59, .23, !0);
    B.rotation.z = Math.PI;
} for (const z of [-.49, .49])
    Y(gt, Lt, z, .78, 2.06, .055, .84, .13); Y(gt, Kt, 0, 1.17, 2.07, 2.07, .12, .48), Y(gt, de, 0, 1.27, 2.1, 2.02, .045, .35); for (const z of [-1, 1])
    Y(gt, Dt, z * 1.04, 1.19, 2.08, .065, .42, .54); const Zn = Qe(gt, Ae("07", "#fdf7ec", 150), 0, .71, -1.17, .31, .38, !0); Zn.rotation.z = Math.PI; const pn = new Af(.43, .43, .39, 16); pn.rotateZ(Math.PI / 2), F.add(pn); const _n = new Af(.27, .27, .405, 12); _n.rotateZ(Math.PI / 2), F.add(_n); const Qn = new wf(.35, .013, 4, 24); Qn.rotateY(Math.PI / 2), F.add(Qn); function In() { const z = new wa; J(pn, Ue, z), J(_n, Lt, z); for (const B of [-1, 1]) {
    J(Qn, Kt, z, B * .205, 0, 0);
    const k = J(Qt, Ut, z, B * .219, 0, 0, .073, .04, .073);
    k.rotation.z = Math.PI / 2;
    for (let X = 0; X < 6; X++) {
        const et = Y(z, He, B * .211, 0, 0, .018, .47, .036);
        et.rotation.x = X * Math.PI / 3;
    }
} return z; } const Ie = ec.map(([z, B, k]) => { const X = In(); X.position.set(B, .44, k), ve.add(X); const et = In(); et.visible = !1, Tt.add(et); const st = In(); return st.position.set(B + Math.sign(B) * 1.72, .44, k - .84), Tt.add(st), { key: z, x: B, z: k, wheel: X, old: et, fresh: st }; }); for (const [z, B] of [[-5.45, 4.3], [5.5, 4.1], [-5.8, .3], [5.7, 1.9]])
    for (let k = 0; k < 3; k++) {
        const X = In();
        X.rotation.z = Math.PI / 2, X.position.set(z, .23 + k * .41, B), Tt.add(X);
    } const Ql = new i1(.19, .6, 6); F.add(Ql); for (const z of [-5.6, 5.6])
    J(Ql, Kt, Tt, z, .3, -3.6), Y(Tt, Me, z, .035, -3.6, .43, .07, .43), J(Qt, de, Tt, z, .27, -3.6, .115, .1, .115); const pa = [!0, !1].map(z => { const B = new wa; B.position.set(0, 0, z ? -3.12 : 2.35), z || (B.rotation.y = Math.PI), Tt.add(B), Y(B, Kt, 0, .13, -.21, .45, .17, .73); const k = Y(B, Ut, 0, .23, .08, .37, .08, .29), X = J(Qt, Ut, B, 0, .2, 0, .055, .2, .055); k.userData.animated = !0, X.userData.animated = !0; for (const mt of [-.24, .24]) {
    const Jt = J(Qt, Ue, B, mt, .1, -.3, .09, .07, .09);
    Jt.rotation.z = Math.PI / 2;
} const et = new wa; et.position.set(0, .16, -.42), B.add(et), Xt(et, Ut, new tt(0, 0, 0), new tt(0, .83, -.65), .035), Y(et, Me, 0, .83, -.65, .44, .065, .08); const st = new wa; return st.position.set(0, .83, -.65), et.add(st), { group: B, handle: et, grip: st, plate: k, piston: X, front: z }; }), Rn = xt("#ff362e"); Rn.emissive.set("#dd1e15"), Rn.emissiveIntensity = 2; const Wa = xt("#263d31"), $a = new wa; $a.position.set(3.8, 0, -4.08), Tt.add($a), Y($a, Lt, 0, .07, 0, .56, .14, .54), J(Qt, Ut, $a, 0, .94, 0, .035, 1.8, .035), Y($a, Me, 0, 1.86, 0, .38, .76, .25), J(Vt, Rn, $a, 0, 2.05, -.15, .12, .12, .045), J(Vt, Wa, $a, 0, 1.68, -.15, .12, .12, .045); for (const z of Ie) {
    const B = Math.sign(z.x), k = [];
    for (let et = 0; et <= 32; et++)
        k.push(new tt(z.x + B * (.7 + et / 32 * 2.6), .04, z.z + Math.sin(et / 32 * Math.PI * 8) * .11));
    const X = new B1(new G1(k), f === "high" ? 40 : 20, .018, 4, !1);
    F.add(X), J(X, Dt, Tt);
} const we = fs.map((z, B) => { const k = new wa; k.position.set(z.x, 0, z.z), k.rotation.y = z.angle ?? 0, Tt.add(k); const X = new wa; k.add(X); const et = xt(z.role ? "#ef3039" : B % 2 ? "#577380" : "#2e4659", .81, .03), st = [], mt = z.kind === "gun" ? [] : void 0; for (const _a of [-1, 1]) {
    const be = new wa;
    if (be.position.set(_a * .115, .56, 0), k.add(be), st.push(be), mt) {
        be.position.set(0, 0, 0);
        const Fe = Y(be, et, 0, 0, 0, .17, 1, .19), Ba = Y(be, et, 0, 0, 0, .145, 1, .16), fa = Y(be, Me, 0, .075, 0, .19, .14, .31), ba = Y(be, Lt, 0, 0, 0, .185, .14, .17);
        [Fe, Ba, fa, ba].forEach(Mn => { Mn.userData.animated = !0; }), mt.push({ thigh: Fe, shin: Ba, foot: fa, knee: ba });
        continue;
    }
    const ra = Y(be, et, 0, -.15, .005, .17, .31, .2);
    ra.rotation.x = -.08, Y(be, Lt, 0, -.28, -.105, .18, .15, .08), Y(be, et, 0, -.4, .025, .14, .25, .16), Y(be, de, 0, -.47, -.07, .145, .055, .022), Y(be, Me, 0, -.53, -.065, .19, .14, .31);
} Y(X, et, 0, .84, 0, .43, .53, .29), Y(X, Lt, 0, .61, 0, .43, .09, .3), Y(X, de, 0, .87, -.153, .41, .1, .025); for (const _a of [-1, 1])
    Y(X, Lt, _a * .19, .78, -.02, .065, .29, .29); Y(X, Dt, 0, .96, -.17, .19, .07, .02); const Jt = [], Ce = [], Wt = []; for (const _a of [-1, 1]) {
    const be = new wa;
    be.position.set(_a * .26, 1.03, 0), X.add(be), Jt.push(be), Y(be, et, 0, -.195, 0, .17, .39, .2);
    const ra = new wa;
    ra.position.y = -.39, be.add(ra), Ce.push(ra), Y(ra, et, 0, -.17, 0, .14, .34, .16), Y(ra, de, 0, -.31, 0, .145, .065, .17);
    const Fe = J(Vt, Me, ra, 0, -.39, 0, .09, .095, .09);
    Wt.push(Fe);
} J(Vt, et, X, 0, 1.29, -.008, .235, .253, .23), J(Vt, Me, X, 0, 1.31, -.196, .198, .1, .065), Y(X, de, 0, 1.44, -.02, .075, .035, .31), Y(X, Lt, 0, 1.13, -.12, .25, .06, .15); let ie; if (z.kind === "gun") {
    ie = new wa, ie.position.set(0, .6, -.6), X.add(ie), Y(ie, Ut, 0, 0, -.1, .15, .14, .34), Y(ie, Me, 0, -.11, 0, .085, .21, .1);
    const _a = J(Qt, He, ie, 0, 0, -.32, .055, .18, .055);
    _a.rotation.x = Math.PI / 2, Y(ie, Kt, 0, .08, -.1, .13, .045, .17);
} z.kind === "release" && Y(Jt[1], Me, 0, -.48, -.09, .26, .035, .31), z.kind === "ambient" && B > 18 && Y(Jt[0], Lt, 0, -.45, -.09, .23, .045, .3); const he = J(vt, On, k, 0, .035, 0, .48, .48, .48); he.rotation.x = -Math.PI / 2, he.castShadow = !1, he.visible = !1; const Oe = J(Qt, Rt("#ffd354", .12), k, 0, .035, 0, .47, .025, .47); Oe.castShadow = !1, Oe.visible = !1, he.userData.animated = !0, Oe.userData.animated = !0; const $e = new wa; $e.position.set(0, .72, -.66), X.add($e); const va = J(vt, it, k, 0, .045, 0, .55, .55, .55); va.rotation.x = -Math.PI / 2, va.castShadow = !1, va.visible = !1, va.userData.animated = !0, va.material = va.material.clone(); const en = J(Qt, V, k, 0, .04, 0, .54, .025, .54); return en.castShadow = !1, en.visible = !1, en.userData.animated = !0, en.material = en.material.clone(), { spec: z, group: k, body: X, arms: Jt, forearms: Ce, hands: Wt, carry: $e, legs: st, kneelingLegs: mt, tool: ie, ring: he, glow: Oe, selectionRing: va, selectionGlow: en, suit: et }; }); function pi(z) { for (const k of [...z.children])
    k instanceof qo || pi(k); const B = new Map; for (const k of z.children) {
    if (!(k instanceof qo) || k.userData.animated || Array.isArray(k.material))
        continue;
    const X = `${k.material.uuid}/${k.castShadow}/${k.receiveShadow}/${!!k.geometry.index}/${Object.keys(k.geometry.attributes).sort().join(",")}`;
    B.set(X, [...B.get(X) ?? [], k]);
} for (const k of B.values()) {
    if (k.length < 2)
        continue;
    const X = k.map(mt => (mt.updateMatrix(), mt.geometry.clone().applyMatrix4(mt.matrix))), et = tb(X);
    if (X.forEach(mt => mt.dispose()), !et)
        continue;
    F.add(et);
    const st = new qo(et, k[0].material);
    st.castShadow = k[0].castShadow, st.receiveShadow = k[0].receiveShadow, k.forEach(mt => mt.removeFromParent()), z.add(st);
} } const Il = we.map((z, B) => { const k = J(lt, Rt("#ffffff", 0), z.group, 0, .83, 0, .79, 1.75, .79); return k.userData.animated = !0, k.userData.actorIndex = B, k.castShadow = !1, k; }); const lockoutBadges = o ? [] : we.map(() => { const node = document.createElement("div"); node.className = "crew-lockout-tag"; node.setAttribute("aria-hidden", "true"); node.style.cssText = "display:none;position:absolute;z-index:8;pointer-events:none;color:#fff;background:#ad141f;border:1px solid #ff7070;box-shadow:0 2px 12px #000b,0 0 12px #ed273e6a;padding:3px 7px;border-radius:5px;font:800 11px Arial,sans-serif;white-space:nowrap;transform:translate(-50%,-100%)"; s.appendChild(node); return node; }); let Pa = { x: 0, y: 0, time: 0 }; const ze = new ov, Ga = z => { Pa = { x: z.clientX, y: z.clientY, time: performance.now() }; }, Ke = z => { if (!lb(Pa, { x: z.clientX, y: z.clientY, time: performance.now() }))
    return; const B = L.domElement.getBoundingClientRect(); ze.setFromCamera(new hn((z.clientX - B.left) / B.width * 2 - 1, -(z.clientY - B.top) / B.height * 2 + 1), Nt); const k = ze.intersectObjects(Il, !1)[0], et = k ? we[k.object.userData.actorIndex] : void 0, st = E.current.room?.players.find(mt => mt.role === et?.spec.role); y.current = et && (!st || st.id !== E.current.playerId) ? we.indexOf(et) : null, T = !0, g(et && (!st || st.id !== E.current.playerId) ? { name: st?.nickname ?? "Bot", role: et.spec.support === "sidepod" ? "Stabilizer" : et.spec.support === "nose" ? "Front Wing Adjuster" : et.spec.role ? hs(et.spec.role) : "Pit Crew" } : null); }; o || (L.domElement.addEventListener("pointerdown", Ga), L.domElement.addEventListener("pointerup", Ke)), pi(Tt); let M = s.clientWidth / s.clientHeight < .95; const ct = () => { T = !0; const z = s.clientWidth, B = s.clientHeight; if (!z || !B)
    return; const k = !o && z / B < .95; k !== M && (M = k, ye()), o || L.setSize(z, B, !1), Nt.aspect = z / B, Nt.fov = z / B < .85 ? 54 : z / B > 2.25 ? 34 : 39, Nt.updateProjectionMatrix(); }, Ft = new ResizeObserver(ct); Ft.observe(s), ct(); const ga = new IntersectionObserver(z => { Q = z[0]?.isIntersecting ?? !0; }); ga.observe(s); const gn = z => { z.preventDefault(), I = !0, cancelAnimationFrame(K), A(!0); }; L.domElement.addEventListener("webglcontextlost", gn); const Zt = z => { const B = Vn.clamp(z, 0, 1); return B * B * (3 - 2 * B); }, tn = Vn.lerp, jn = new tt; let Kn = new Map, vs; function bs(z) { if (I || (o || (K = requestAnimationFrame(bs)), !E.current.sceneActive || document.hidden || !o && (!Q || z - P < 1e3 / (f === "low" || at.matches ? 30 : 50))))
    return; q.update(); const { room: B, playerId: k, presentationTime: X, clockOffset: et } = E.current; if (X !== void 0 && X === Ct && !T)
    return; P = z, Ct = X, T = !1; const st = X ?? Date.now() + et, mt = ob(B?.round?.goAt, st); if (!o && !$ && B?.round && st >= B.round.goAt - 3e3 && st < B.round.goAt) {
    const D = s.clientWidth / s.clientHeight < .95, dt = new tt(D ? 0 : .6, .38, D ? -1.8 : .4), zt = new tt(D ? 11.2 : 8.6, D ? 12 : 8.3, D ? -14 : -11.6).sub(dt).multiplyScalar(1 + .8 * (1 - mt.progress));
    dt.add(new tt(mt.carX * .9, 0, mt.carZ * .9)), q.maxDistance = 60, q.target.copy(dt), Nt.position.copy(dt).add(zt), q.update(), rt = !0;
}
else
    rt && !$ && (ye(), rt = !1); B !== vs && (vs = B, Kn = new Map((B?.round?.tasks ?? []).map(D => [D.id, D]))); const Jt = R.current, Ce = D => Jt.isDone(D, st), Wt = D => Jt.phase(D, st), ie = D => { const dt = Jt.receipt(D); return !!dt && st >= dt.startsAt && st < dt.endsAt; }, he = D => Wt(D), Oe = D => { const dt = Wt(`${D}_LIFT`), ht = Wt(`${D}_LOWER`); return Ce(`${D}_LOWER`) ? 0 : ht !== null && ie(`${D}_LOWER`) ? .27 * (1 - Zt(ht)) : Ce(`${D}_LIFT`) ? .27 : dt === null ? 0 : .27 * Zt(dt); }, $e = Oe("FRONT"), va = Oe("REAR"); gt.position.y = ($e + va) / 2, gt.rotation.x = ($e - va) / 4.2; const en = Jt.activeTaskIds(st); s.dataset.botCues = JSON.stringify([...Kn.values()].filter(D => D.ownerId === null).map(D => eb(D, Jt, st))), s.dataset.frontLift = $e.toFixed(3), s.dataset.rearLift = va.toFixed(3), s.dataset.animationTasks = at.matches ? "" : [...new Set([...Jt.activeTaskIds(st), ...en])].join(","); const _a = Ce("GREEN_RELEASE"), be = he("GREEN_RELEASE") ?? Wt("GREEN_RELEASE"), ra = ["FRONT_LOWER", "REAR_LOWER"].map(D => Jt.receipt(D)), { retreat: Fe, drive: Ba } = nb(ra, Jt.receipt("GREEN_RELEASE"), st, !1); ve.position.z = mt.carZ + Ba * ad.exitZ, ve.position.x = mt.carX, ve.rotation.y = mt.yaw; const fa = 1 - mt.entry; s.dataset.carArrival = mt.progress.toFixed(3), s.dataset.sceneClock = String(st), s.dataset.carZ = ve.position.z.toFixed(3), s.dataset.carX = ve.position.x.toFixed(3), s.dataset.carYaw = mt.yaw.toFixed(3), s.dataset.wheelRoll = mt.wheelRoll.toFixed(3), s.dataset.workPhase = String(mt.arrived), s.dataset.carDeparture = Ba.toFixed(3), s.dataset.laneClear = String(Fe >= .999); for (const D of pa) {
    D.group.position.x = (D.front ? 2.8 : -2.8) * Math.max(Fe, fa);
    const dt = D.front ? $e : va, ht = D.front ? "FRONT" : "REAR", zt = en.includes(`${ht}_LOWER`) || ie(`${ht}_LOWER`) ? `${ht}_LOWER` : `${ht}_LIFT`, ot = en.includes(zt) || ie(zt), Ne = en.includes(zt) ? he(zt) ?? 0 : Wt(zt) ?? 0;
    D.plate.position.y = .23 + dt, D.piston.scale.y = .2 + dt, D.handle.rotation.x = ot ? Math.sin(Ne * Math.PI * 3) * .23 - .12 : -dt * .7;
} const ba = !!B?.round?.tasks?.some(q => q.id === "GREEN_RELEASE" && q.completedAt !== null && st >= q.completedAt) || _a || (be ?? 0) > .42; Rn.color.set(ba ? "#261013" : "#ff362e"), Rn.emissive.set(ba ? "#000000" : "#dd1e15"), Rn.emissiveIntensity = ba ? 0 : 1.7, Wa.color.set(ba ? "#35ff84" : "#16231b"), Wa.emissive.set(ba ? "#36f287" : "#000000"), Wa.emissiveIntensity = ba ? 2.6 : 0; const Mn = B?.players.find(D => D.id === k); d.current && (d.current.style.display = Mn ? "block" : "none"); for (let D = 0; D < we.length; D++) {
    const dt = we[D], { spec: ht, group: zt, body: ot, arms: Ne, legs: Ge } = dt, Pe = ht.role ? [...Kn.values()].filter(Et => Et.role === ht.role) : [], Be = Pe.find(Et => en.includes(Et.id)), $t = Be ?? Pe.find(Et => ie(Et.id)), Ea = mt.arrived && Pe.some(Et => Et.enabledAt !== null && st >= Et.enabledAt && (Et.completedAt === null || st < Et.completedAt)), zn = Pe.length > 0 && Pe.every(Et => Ce(Et.id)), da = $t ? Be ? he($t.id) ?? 0 : Wt($t.id) ?? 0 : 0, Ra = $t ? Math.sin(da * Math.PI) : 0, Te = st * .001 + D * .83, Bt = !!ht.role && Mn?.role === ht.role, Ya = y.current === D && !Bt, human = B?.players.find(q => q.role === ht.role), remain = Math.max(0, (human && B?.round?.penalties?.[human.id]?.until || 0) - st), locked = remain > 0;
    if (dt.selectionRing.material.color.set(locked ? "#ff2d40" : "#6ce8d9"), dt.selectionGlow.material.color.set(locked ? "#ed273e" : "#6ce8d9"), dt.selectionRing.visible = Ya || locked, dt.selectionGlow.visible = Ya || locked, dt.ring.visible = Bt, dt.glow.visible = Bt, dt.ring.scale.setScalar(.48 + (Ea && !at.matches ? Math.sin(st * .005) * .025 : 0)), dt.glow.material.opacity = Ea ? .24 : zn ? .08 : .13, dt.suit.emissive.set(Bt ? "#a76a03" : Ya ? "#12655f" : "#000000"), dt.suit.emissiveIntensity = Bt && Ea ? .24 : Bt ? .1 : Ya ? .32 : 0, zt.position.set(ht.x, 0, ht.z), zt.rotation.y = ht.angle ?? 0, ot.position.y = at.matches ? 0 : Math.sin(Te * 1.4) * .012, ot.rotation.set(0, 0, 0), Ge.forEach(Et => { Et.rotation.set(0, 0, 0); }), dt.forearms.forEach(Et => Et.rotation.set(0, 0, 0)), Ne.forEach((Et, qe) => { Et.rotation.x = .15 + (at.matches ? 0 : Math.sin(Te * 1.6 + qe) * .025), Et.rotation.z = qe === 0 ? -.09 : .09; }), ht.kind === "gun") {
        const Et = ht.role.slice(0, 2), qe = T1(ie(`${Et}_GUN_LOOSEN`) ? Wt(`${Et}_GUN_LOOSEN`) : null, Ce(`${Et}_GUN_LOOSEN`), ie(`${Et}_GUN_TIGHTEN`) ? Wt(`${Et}_GUN_TIGHTEN`) : null, Ce(`${Et}_GUN_TIGHTEN`)), De = hb($t ? da : 0), Na = Math.max(Fe, fa, qe);
        zt.position.x += Math.sign(ht.x) * 1.25 * qe, ot.position.set(0, tn(De.torsoY, 0, Na), tn(De.torsoZ, 0, Na)), ot.rotation.x = tn(De.lean, -.03, Na), dt.kneelingLegs?.forEach((an, nn) => { const fl = De.legs[nn], Fn = nn === 0 ? -1 : 1, Nu = new tt(...fl.hip).lerp(new tt(Fn * .115, .56, 0), Na), Kl = new tt(...fl.knee).lerp(new tt(Fn * .115, .31, -.025), Na), nc = new tt(...fl.ankle).lerp(new tt(Fn * .115, .1, 0), Na); for (const [Es, dl, ja] of [[an.thigh, Nu, Kl], [an.shin, Kl, nc]])
            Es.position.copy(dl).add(ja).multiplyScalar(.5), Es.scale.y = dl.distanceTo(ja), Es.quaternion.setFromUnitVectors(new tt(0, -1, 0), ja.clone().sub(dl).normalize()); an.knee.position.copy(Kl), an.foot.position.set(...fl.foot).lerp(new tt(Fn * .115, .075, -.065), Na); }), Ne.forEach(an => { an.rotation.x = .85; }), zn && (zt.position.x += Math.sign(ht.x) * .23);
    }
    else if (ht.kind === "off" || ht.kind === "on") {
        const Et = Ie.find(qe => ht.role?.startsWith(qe.key));
        if (Et && $t) {
            const qe = mb(ht.kind, ht, Et, da);
            zt.position.x = qe.x, zt.position.z = qe.z, ht.kind === "off" ? (ot.position.y -= .2 * Math.sin(da * Math.PI), ot.rotation.x = -.33 * Math.sin(da * Math.PI)) : (ot.position.y -= .2 * Ra, ot.rotation.x = -.28 * Ra), Ne.forEach(De => { De.rotation.x = .95 + Ra * .3; }), Ge.forEach((De, Na) => { De.rotation.x = Math.sin(da * 17 + Na * Math.PI) * .25 * Ra; });
        }
        else
            zn && Et ? (zt.position.x = Et.x + Math.sign(ht.x) * (ht.kind === "off" ? 2.19 : 1.68), zt.position.z = Et.z + (ht.kind === "off" ? .83 : -.55)) : Ne.forEach(qe => { qe.rotation.x = ht.kind === "on" ? .7 : .3; });
    }
    else
        ht.kind === "jack" ? (ot.rotation.x = -.16 - Ra * .23, ot.position.y -= Ra * .1, Ne.forEach(Et => { Et.rotation.x = .9 + ($t ? Math.sin(da * Math.PI * 3) * .28 : 0); }), zt.position.x = (ht.z < 0 ? 2.8 : -2.8) * Math.max(Fe, fa)) : ht.kind === "release" ? (Ne[1].rotation.x = $t ? 1.1 + Zt(da / .4) * 1.65 : _a ? 2.75 : .6, Ne[1].rotation.z = $t || _a ? -.5 : .15, ba && (zt.rotation.y += .3)) : (ot.rotation.x = ht.support === "sidepod" ? -.11 : ht.support === "nose" ? -.055 : D < 19 ? -.18 : -.025, ht.support === "nose" && (ot.position.z = .13, Ge.forEach(Et => { Et.position.z = .07; })), D < 19 && Ne.forEach(Et => { Et.rotation.x = .75; }), _a && (Ne[0].rotation.x = 1.8, zt.position.x += Math.sign(ht.x) * .3));
    if (ht.kind !== "jack" && Math.abs(zt.position.x) < 2.4 && (zt.position.x = tn(zt.position.x, Math.sign(ht.x || 1) * 2.7, Math.max(Fe, fa))), Bt && d.current) {
        jn.set(zt.position.x, 1.77 + (Ea && !at.matches ? Math.sin(st * .004) * .035 : 0), zt.position.z).project(Nt);
        const Et = (jn.x * .5 + .5) * s.clientWidth, qe = (-jn.y * .5 + .5) * s.clientHeight, De = Vn.clamp(Et, d.current.offsetWidth / 2 + 8, s.clientWidth - d.current.offsetWidth / 2 - 8);
        d.current.style.setProperty("--you-pointer-offset", `${Et - De}px`), d.current.style.transform = `translate(${De}px, ${qe}px) translate(-50%, -100%)`, d.current.style.visibility = jn.z > 1 || jn.z < -1 ? "hidden" : "visible", d.current.dataset.state = Be ? "accepted" : Ea ? "ready" : zn ? "done" : "waiting", d.current.style.boxShadow = Be ? "0 0 0 5px #ffd45733, 0 0 28px #ffd457aa" : Ea ? "0 0 20px #ffd45777" : "0 3px 15px #0008, 0 0 16px #ffd45745";
    }
} Tt.updateMatrixWorld(!0); const Ee = (D, dt = new tt) => D.localToWorld(dt.clone()); if (!o) we.forEach((member, idx) => { const label = lockoutBadges[idx], human = B?.players.find(q => q.role === member.spec.role), remaining = Math.max(0, (human && B?.round?.penalties?.[human.id]?.until || 0) - st); if (!label) return; if (!remaining) { label.style.display = "none"; return; } const pt = Ee(member.group, new tt(0, 1.83, 0)).project(Nt), x = (pt.x * .5 + .5) * s.clientWidth, y = (-pt.y * .5 + .5) * s.clientHeight; label.style.display = pt.z > -1 && pt.z < 1 && x >= 0 && y >= 0 && x <= s.clientWidth && y <= s.clientHeight ? "block" : "none"; label.style.left = x + "px"; label.style.top = (y - 9) + "px"; label.textContent = "LOCKOUT " + (remaining / 1000).toFixed(1) + "s"; }); let _e = 0; const rl = (D, dt) => { dt.forEach((ht, zt) => { const ot = D.arms[zt], Ne = D.forearms[zt]; ot.rotation.set(0, 0, 0), ot.updateWorldMatrix(!0, !0); const Ge = Ee(ot), Pe = ht.clone().sub(Ge), Be = Pe.length(), $t = Math.min(.778, Math.max(.02, Be)), Ea = Pe.normalize(), zn = new tt(0, -1, 0).addScaledVector(Ea, Ea.y).normalize(), da = Ge.clone().addScaledVector(Ea, $t / 2).addScaledVector(zn, Math.sqrt(.39 ** 2 - ($t / 2) ** 2)), Ra = D.body.worldToLocal(da.clone()).sub(ot.position); ot.quaternion.setFromUnitVectors(new tt(0, -1, 0), Ra.normalize()), ot.updateWorldMatrix(!0, !0); const Te = ot.worldToLocal(ht.clone()).sub(Ne.position); Ne.quaternion.setFromUnitVectors(new tt(0, -1, 0), Te.normalize()), Ne.updateWorldMatrix(!0, !0), _e = Math.max(_e, Ee(D.hands[zt]).distanceTo(ht)); }); }; for (const D of Ie) {
    const dt = Math.sign(D.x), ht = D.key.startsWith("F") ? $e : va, zt = Ee(ve, new tt(D.x, .44 + ht, D.z)), ot = `${D.key}_WHEEL_OFF`, Ne = `${D.key}_WHEEL_ON`, Ge = Ce(ot) ? 1 : Wt(ot) ?? 0, Pe = Ce(Ne) ? 1 : Wt(Ne) ?? 0, Be = we.find(Bt => Bt.spec.role === ot), $t = we.find(Bt => Bt.spec.role === Ne), Ea = Ee(Be.carry), zn = Ee($t.carry);
    D.wheel.position.set(D.x, .44 + ht, D.z), D.wheel.rotation.x = mt.wheelRoll - Ba * 62, D.wheel.rotation.y = D.key.startsWith("F") ? mt.steering : 0, D.wheel.visible = Ge <= .22 || Pe >= .86, D.old.visible = Ge > .22;
    const da = new tt(D.x + dt * 2.8, .44, D.z + 1.1);
    D.old.position.copy(zt).lerp(Ea, Zt((Ge - .22) / .23)), Ge > .82 && D.old.position.lerp(da, Zt((Ge - .82) / .18)), D.old.quaternion.copy(ve.quaternion).slerp(Be.group.quaternion, Zt((Ge - .22) / .23));
    const Ra = Zt((Pe - .45) / .41);
    D.fresh.visible = Pe < .86, D.fresh.position.copy(zn).lerp(zt, Ra), D.fresh.quaternion.copy($t.group.quaternion).slerp(ve.quaternion, Ra), Ge > .22 && Ge < .9 && rl(Be, [-1, 1].map(Bt => Ee(D.old, new tt(Bt * .22, .12, 0)))), Pe < .86 && rl($t, [-1, 1].map(Bt => Ee(D.fresh, new tt(Bt * .22, .12, 0))));
    const Te = we.find(Bt => Bt.spec.role === `${D.key}_GUNNER`);
    if (Te.tool && mt.entry > .999) {
        const Bt = [`${D.key}_GUN_LOOSEN`, `${D.key}_GUN_TIGHTEN`].find(ie), Ya = Bt ? Wt(Bt) ?? 0 : 0, Et = T1(ie(`${D.key}_GUN_LOOSEN`) ? Wt(`${D.key}_GUN_LOOSEN`) : null, Ce(`${D.key}_GUN_LOOSEN`), ie(`${D.key}_GUN_TIGHTEN`) ? Wt(`${D.key}_GUN_TIGHTEN`) : null, Ce(`${D.key}_GUN_TIGHTEN`)), qe = Bt?.endsWith("TIGHTEN") ? (Ya - .22) / .78 : Ya, De = Bt ? Zt(qe / .2) * (1 - Zt((Ya - .65) / .35)) : 0, Na = zt.clone().add(new tt(dt * .22, 0, 0)), an = Na.clone().add(new tt(dt * (.41 + .18 * (1 - De)), .1 * (1 - De) + (Bt ? Math.sin(Ya * 95) * .006 : 0), 0)), nn = new tt(Te.group.position.x - dt * .18, .59, D.z - .04);
        an.lerp(nn, Et), Te.tool.position.copy(Te.body.worldToLocal(an));
        const fl = Na.clone().lerp(nn.clone().add(new tt(-dt * .1, -.4, 0)), Et), Fn = Te.body.worldToLocal(fl).sub(Te.tool.position).normalize();
        Te.tool.quaternion.setFromUnitVectors(new tt(0, 0, -1), Fn), Te.tool.updateWorldMatrix(!0, !0), Fe < .05 && rl(Te, [Ee(Te.tool, new tt(0, -.16, 0)), Ee(Te.tool, new tt(0, 0, -.22))]), Te.tool.visible = Fe < .05;
    }
    else
        Te.tool && (Te.tool.position.set(0, .6, -.6), Te.tool.quaternion.identity(), Te.tool.visible = !0);
} let gi = 0; for (const D of we) {
    if (!D.spec.support || mt.entry < .999 || Fe > .001)
        continue;
    const dt = D.spec.support === "nose" ? $e : ($e + va) / 2, ht = db(D.spec, dt).map(([zt, ot, Ne]) => new tt(zt, ot, Ne));
    rl(D, ht), gi = Math.max(gi, ...ht.map((zt, ot) => Ee(D.hands[ot]).distanceTo(zt)));
} for (const D of pa) {
    const dt = we.find(ht => ht.spec.role === (D.front ? "FRONT_JACK" : "REAR_JACK"));
    rl(dt, [-1, 1].map(ht => Ee(D.grip, new tt(ht * .18, 0, 0))));
} const vi = we.every(D => Math.abs(D.group.position.x) >= 2.2) && pa.every(D => Math.abs(D.group.position.x) >= 2.1); if (!vi && Ba > 0 && (ve.position.z = 0), s.dataset.sceneModel = "full-pit-lane-v11", s.dataset.crewCount = String(we.length), s.dataset.supportClear = String(fb(ve.position.z, Math.max(Fe, fa))), s.dataset.selectedRole = y.current === null ? "" : we[y.current].spec.role ?? "SUPPORT", s.dataset.selectedColor = y.current === null ? "" : "#6ce8d9", s.dataset.laneClear = String(vi), s.dataset.carDeparture = (vi ? Ba : 0).toFixed(3), s.dataset.maxGripError = _e.toFixed(3), s.dataset.supportContactError = gi.toFixed(3), s.dataset.supportBodyClear = s.dataset.supportClear, s.dataset.carZ = ve.position.z.toFixed(3), m.current && y.current !== null) {
    const D = we[y.current], dt = new tt(D.group.position.x, 1.65, D.group.position.z).project(Nt);
    m.current.style.left = `${Vn.clamp((dt.x * .5 + .5) * s.clientWidth, 85, s.clientWidth - 85)}px`, m.current.style.top = `${Vn.clamp((-dt.y * .5 + .5) * s.clientHeight, 135, s.clientHeight - 240)}px`;
} s.dataset.crewTargets = JSON.stringify(we.map(D => { const dt = new tt(D.group.position.x, 1.35, D.group.position.z).project(Nt); return { role: D.spec.role ?? "SUPPORT", x: (dt.x * .5 + .5) * s.clientWidth, y: (-dt.y * .5 + .5) * s.clientHeight }; })), s.dataset.gunnerPoses = JSON.stringify(we.filter(D => D.spec.kind === "gun").map(D => ({ role: D.spec.role, position: D.group.position.toArray(), torso: [D.body.position.y, D.body.position.z, D.body.rotation.x], head: Ee(D.body, new tt(0, 1.29, -.008)).toArray(), feet: D.kneelingLegs?.map(dt => Ee(dt.foot).toArray()), knees: D.kneelingLegs?.map(dt => Ee(dt.knee).toArray()) }))), s.dataset.crewBodyPositions = JSON.stringify(we.map(D => ({ role: D.spec.role ?? (D.spec.support === "sidepod" ? "Stabilizer" : D.spec.support === "nose" ? "Front Wing Adjuster" : "Pit Crew"), x: D.group.position.x, z: D.group.position.z, centres: [.61, .84, 1.03, 1.29].map(dt => Ee(D.body, new tt(0, dt, 0)).toArray()) }))); const qa = Ee(ve, new tt(0, .5, 0)).project(Nt); s.dataset.carViewport = JSON.stringify({ x: (qa.x * .5 + .5) * s.clientWidth, y: (-qa.y * .5 + .5) * s.clientHeight, visible: Math.abs(qa.x) < 1 && Math.abs(qa.y) < 1 && Math.abs(qa.z) < 1 }); const vn = [-1.5, 1.5].flatMap(D => [-3.35, 2.4].flatMap(dt => [.1, 1.45].map(ht => Ee(ve, new tt(D, ht, dt)).project(Nt)))); s.dataset.carBounds = JSON.stringify({ left: Math.min(...vn.map(D => (D.x * .5 + .5) * s.clientWidth)), right: Math.max(...vn.map(D => (D.x * .5 + .5) * s.clientWidth)), top: Math.min(...vn.map(D => (-D.y * .5 + .5) * s.clientHeight)), bottom: Math.max(...vn.map(D => (-D.y * .5 + .5) * s.clientHeight)) }); try {
    L.render(Tt, Nt);
}
catch {
    A(!0), I = !0;
} } return re(), o || (K = requestAnimationFrame(bs)), { update: C, render: bs, deselect: x, setCameraView: fe, setCrewCloseup: Z, dispose: () => { I = !0, cancelAnimationFrame(K), Ft.disconnect(), ga.disconnect(), window.removeEventListener("pit-camera-reset", ye), window.removeEventListener("pit-camera-view", Ze), q.removeEventListener("change", re), q.dispose(), L.domElement.removeEventListener("pointerdown", Ga), L.domElement.removeEventListener("pointerup", Ke), L.domElement.removeEventListener("keydown", pt), L.domElement.removeEventListener("webglcontextlost", gn), lockoutBadges.forEach(z => z.remove()), we.forEach(z => { z.selectionRing.material.dispose(); z.selectionGlow.material.dispose(); }), F.forEach(z => z.dispose()), G.forEach(z => z.dispose()), ft.forEach(z => z.dispose()), u.renderer || (L.dispose(), L.domElement.remove()); } }; }
function yb(s) { return s.filter(u => u.status === "COUNTDOWN" || u.status === "RUNNING"); }
class pb {
    entries = new Map;
    renderer = null;
    observer;
    timer;
    cursor = 0;
    renderCost = 0;
    unavailable = !1;
    constructor() { try {
        this.renderer = new q1({ antialias: !1, alpha: !1, powerPreference: "low-power" }), this.renderer.setPixelRatio(1), this.renderer.setSize(320, 180, !1);
    }
    catch {
        this.unavailable = !0;
    } this.observer = new IntersectionObserver(u => { for (const f of u) {
        const o = this.entries.get(f.target);
        o && (o.visible = f.isIntersecting);
    } }), this.timer = setInterval(() => this.draw(), 250); }
    add(u, f, o = 0) { this.entries.set(u, { room: f, visible: !1, view: null, touched: 0, clockOffset: o }), this.observer.observe(u); }
    update(u, f, o = 0) { const d = this.entries.get(u); d && (d.room = f, d.clockOffset = o, d.view?.update(f, null, !0, void 0, Date.now() + o)); }
    remove(u) { this.entries.get(u)?.view?.dispose(), this.entries.delete(u), this.observer.unobserve(u); }
    draw() { if (document.hidden)
        return; const u = [...this.entries].filter(([, o]) => o.visible); if (!u.length)
        return; const f = Math.min(u.length, this.renderCost > 45 ? 1 : 2); for (let o = 0; o < f; o++) {
        const [d, m] = u[(this.cursor + o) % u.length], y = u.length <= 2 ? Math.min(512, Math.max(320, Math.ceil(d.clientWidth / 16) * 16)) : 320;
        d.width !== y && (d.width = y, d.height = y * 9 / 16), this.renderer && this.renderer.domElement.width !== y && this.renderer.setSize(y, y * 9 / 16, !1);
        const g = d.getContext("2d");
        if (!g)
            continue;
        const A = performance.now();
        if (m.touched = A, this.renderer && !this.unavailable) {
            if (!m.view) {
                const E = [...this.entries].filter(([, R]) => R.view).sort((R, T) => R[1].touched - T[1].touched);
                E.length >= 8 && (E[0][1].view?.dispose(), E[0][1].view = null), m.view = iy(d, { quality: "low", renderer: this.renderer, manual: !0, setFallback: R => { R && (this.unavailable = !0); } }), m.view?.update(m.room, null, !0, void 0, Date.now() + m.clockOffset);
            }
            m.view?.render(performance.now()), this.unavailable || (g.drawImage(this.renderer.domElement, 0, 0, d.width, d.height), d.dataset.previewMode = "3d", d.dataset.previewFrames = String(Number(d.dataset.previewFrames ?? 0) + 1));
        }
        if (this.unavailable || !this.renderer) {
            g.fillStyle = "#132532", g.fillRect(0, 0, d.width, d.height), g.fillStyle = "#96c7c8", g.font = "bold 12px monospace", g.fillText("3D UNAVAILABLE · LIVE 2D", 16, 40);
            const E = m.room.round?.tasks.filter(R => R.status === "DONE").length ?? 0;
            g.fillStyle = "#ef493a", g.fillRect(145, 65, 30, 65), g.fillRect(117, 68, 86, 8), g.fillStyle = "#75cdb5", g.fillRect(16, 154, 288 * E / 21, 3), g.fillText(`${E}/21 actions complete`, 16, 175), d.dataset.previewMode = "2d";
        }
        d.dataset.progress = String(m.room.round?.tasks.filter(E => E.status === "DONE").length ?? 0), d.dataset.roomId = m.room.id, d.dataset.previewContexts = "1", this.renderCost = performance.now() - A, d.dataset.previewRenderMs = this.renderCost.toFixed(2);
    } this.cursor = (this.cursor + f) % u.length; }
    dispose() { clearInterval(this.timer), this.observer.disconnect(); for (const [, u] of this.entries)
        u.view?.dispose(); this.entries.clear(), this.renderer?.dispose(), this.renderer?.forceContextLoss(); }
}
const sy = O.createContext(null);
function gb({ children: s }) { const [u, f] = O.useState(null), [o, d] = O.useState(() => window.matchMedia("(min-width: 768px)").matches); return O.useEffect(() => { const m = window.matchMedia("(min-width: 768px)"), y = () => d(m.matches); return m.addEventListener("change", y), () => m.removeEventListener("change", y); }, []), O.useEffect(() => { if (!o) {
    f(null);
    return;
} const m = new pb; return f(m), () => { m.dispose(); }; }, [o]), c.jsx(sy.Provider, { value: u, children: s }); }
const vb = O.memo(function ({ room: u, clockOffset: f = 0 }) { const o = O.useContext(sy), d = O.useRef(null), m = yb([u]).length > 0; return O.useEffect(() => { if (!o || !d.current || !m)
    return; const y = d.current; return o.add(y, u, f), () => o.remove(y); }, [o, m]), O.useEffect(() => { d.current && o?.update(d.current, u, f); }, [o, u, f]), !o || !m ? null : c.jsx("canvas", { className: "live-card-preview", ref: d, width: "320", height: "180", "aria-label": `${u.name} full pit lane live preview` }); });
function bb(s, u, f) { const o = s?.players.find(d => d.id === u); return `Interactive 3D pit lane. Drag to rotate. 22 crew members, 15 core roles. ${o ? `You are ${o.role.replaceAll("_", " ").toLowerCase()}. Gold YOU marker shows your crew member. ` : ""}${s ? `${s.name}. ${s.round?.tasks.filter(d => d.status === "DONE" && (f === void 0 || d.completedAt !== null && d.completedAt <= f)).length ?? 0} of 21 actions complete.` : "Pit crew ready."}`; }
function Eb({ room: s, playerId: u, presentationTime: f }) { const o = s?.players.find(m => m.id === u)?.role, d = (s?.round?.tasks ?? []).map(m => f === void 0 ? m : { ...m, status: m.completedAt !== null && m.completedAt <= f ? "DONE" : m.enabledAt !== null && m.enabledAt <= f ? "AVAILABLE" : "LOCKED" }); return c.jsx("div", { className: "pit-scene-fallback", style: { position: "absolute", inset: 0, background: "radial-gradient(ellipse at 55% 50%, #283b3d, #10171e 75%)", display: "grid", placeItems: "center" }, children: c.jsxs("svg", { viewBox: "-6 -5.6 12 11.6", style: { height: "100%", width: "100%", maxHeight: 900 }, "aria-label": "Live 2D pit lane with your gold YOU marker", children: [c.jsx("defs", { children: c.jsx("pattern", { id: "pit-tiles", width: "1", height: "1", patternUnits: "userSpaceOnUse", children: c.jsx("path", { d: "M1 0H0V1", fill: "none", stroke: "#a5d4dc", strokeOpacity: ".08", strokeWidth: ".015" }) }) }), c.jsx("rect", { x: "-6", y: "-5.6", width: "12", height: "11.6", fill: "url(#pit-tiles)" }), c.jsx("path", { d: "M-4.5 -5V4.3H4.5V-5", fill: "none", stroke: "#e8b835", strokeWidth: ".075" }), c.jsx("path", { d: "M-1.5 -3.15H1.5V-2.7H-1.5zM-.95 1.95H.95V2.4H-.95z", fill: "#eb292f" }), c.jsx("path", { d: "M-.14 -3.1L-.45 -1.7 -.78 -.8 -.72 1.5 -.32 2.2H.32L.72 1.5 .78 -.8 .45 -1.7 .14 -3.1Z", fill: "#f03238" }), c.jsx("path", { d: "M-.1 -2.95H.1L.17 -.5H-.17Z", fill: "#fff8eb" }), c.jsx("ellipse", { cx: "0", cy: ".03", rx: ".29", ry: ".52", fill: "#0a131c" }), ec.map(([m, y, g]) => { const A = d.find(R => R.id === `${m}_WHEEL_OFF`)?.status === "DONE", E = d.find(R => R.id === `${m}_WHEEL_ON`)?.status === "DONE"; return c.jsx("rect", { x: y - .22, y: g - .39, width: ".44", height: ".78", rx: ".1", opacity: A && !E ? .14 : 1, fill: "#0b1017", stroke: E ? "#70e5b7" : "#596775", strokeWidth: ".06" }, m); }), fs.map((m, y) => { const g = !!m.role && m.role === o, A = d.some(R => R.role === m.role && R.status === "AVAILABLE"), E = d.some(R => R.role === m.role) && d.filter(R => R.role === m.role).every(R => R.status === "DONE"); return c.jsxs("g", { transform: `translate(${m.x} ${m.z})`, children: [g && c.jsxs(c.Fragment, { children: [c.jsx("circle", { r: ".38", fill: "#efc74d22", stroke: "#ffda57", strokeWidth: ".05" }), c.jsxs("text", { className: "you-marker", y: "-.51", textAnchor: "middle", fill: "#ffda57", fontSize: ".22", fontWeight: "bold", children: ["YOU", A ? " • READY" : E ? " ✓" : ""] })] }), c.jsx("rect", { x: "-.18", y: "-.08", width: ".36", height: ".37", rx: ".07", fill: m.role ? "#e9343b" : "#5e6d79" }), c.jsx("circle", { cy: "-.13", r: ".16", fill: "#fa453c" }), c.jsx("path", { d: "M-.11 -.12H.11", stroke: "#111e2b", strokeWidth: ".1" })] }, y); }), c.jsx("text", { x: "0", y: "5.1", textAnchor: "middle", fill: "#c3d7db", fontSize: ".18", fontFamily: "monospace", children: "LIVE PIT MAP · 22 CREW · 3D UNAVAILABLE" })] }) }); }
function uy({ room: s, playerId: u, quality: f = "high", className: o = "", active: d = !0, presentationTime: m, serverNow: y }) { const g = O.useRef(null), A = O.useRef(null), E = O.useRef(null), R = O.useRef(null), T = O.useRef({ room: s, playerId: u, active: d, presentationTime: m, serverNow: y }); T.current = { room: s, playerId: u, active: d, presentationTime: m, serverNow: y }; const [x, C] = O.useState(null), [L, I] = O.useState(!1); O.useEffect(() => { if (!g.current)
    return; const Q = iy(g.current, { quality: f, marker: A, tooltip: E, setSelected: C, setFallback: I }); return R.current = Q, Q && Q.update(T.current.room, T.current.playerId, T.current.active, T.current.presentationTime, T.current.serverNow), () => { Q?.dispose(), R.current = null; }; }, [f]), O.useEffect(() => { R.current?.update(s, u, d, m, y); }, [s, u, d, m, y]); const K = s?.players.find(Q => Q.id === u)?.role ?? ""; return c.jsxs("div", { ref: g, className: `pit-scene ${o}`, role: "region", "aria-label": bb(s, u, m), "data-player-role": K, "data-crew-count": "22", "data-core-crew": "15", "data-support-crew": "7", style: { position: "relative", width: "100%", height: "100%", overflow: "hidden", isolation: "isolate" }, children: [x && c.jsxs("button", { ref: E, className: "crew-tooltip", onClick: () => R.current?.deselect(), children: [c.jsx("strong", { children: x.name }), c.jsx("span", { children: x.role })] }), L ? c.jsx(Eb, { room: s, playerId: u, presentationTime: m }) : c.jsxs("div", { ref: A, className: "you-marker", "aria-label": `YOU: ${K.replaceAll("_", " ").toLowerCase()}`, style: { position: "absolute", top: 0, left: 0, pointerEvents: "none", display: K ? "block" : "none", zIndex: 5, background: "#ffd457", color: "#1d2630", font: "900 12px Arial,sans-serif", letterSpacing: 1, padding: "6px 12px", borderRadius: 5 }, children: ["YOU", c.jsx("span", { "aria-hidden": "true", style: { position: "absolute", left: "calc(50% - 5px + var(--you-pointer-offset, 0px))", bottom: -5, width: 10, height: 10, background: "#ffd457", transform: "rotate(45deg)" } })] })] }); }
const If = 76, Nb = 16, Jo = ["FRONT_LIFT", "REAR_LIFT", ...["GUN_LOOSEN", "WHEEL_OFF", "WHEEL_ON", "GUN_TIGHTEN"].flatMap(s => gu.map(u => `${u}_${s}`)), "FRONT_LOWER", "REAR_LOWER", "GREEN_RELEASE"], Sb = [0, 2, 6, 10, 14, 18, 20], x1 = new Map(Jo.map((s, u) => [s, u])), Tb = (s, u) => (x1.get(s.id) ?? 99) - (x1.get(u.id) ?? 99) || s.id.localeCompare(u.id), xb = { FL: "Front-left wheel", FR: "Front-right wheel", RL: "Rear-left wheel", RR: "Rear-right wheel" };
function Ab(s) { return is(s); }
function oy(s) { return s === "GREEN_RELEASE" ? { context: "All crew clear", action: "Release car" } : s.startsWith("FRONT_") || s.startsWith("REAR_") ? { context: s.startsWith("FRONT_") ? "Front of car" : "Rear of car", action: s.endsWith("LIFT") ? "Lift car" : "Lower car" } : { context: xb[s.slice(0, 2)] ?? "Wheel crew", action: s.endsWith("GUN_LOOSEN") ? "Loosen nut" : s.endsWith("WHEEL_OFF") ? "Remove wheel" : s.endsWith("WHEEL_ON") ? "Fit new wheel" : "Tighten nut" }; }
function wb(s, u = If) { const f = Math.max(0, (Number.isFinite(s) ? s : 390) - Nb); return Math.max(1, Math.min(21, Math.floor(f / Math.max(If, u)))); }
function Ob(s, u = 43) { const f = Math.max(0, (Number.isFinite(s) ? s : 320) - 54); return Math.max(1, Math.min(21, Math.floor(f / Math.max(38, u)))); }
const Yl = s => `${s.id}:${s.round?.id ?? "waiting"}`, Kf = s => s.round?.tasks.filter(u => u.status === "DONE").length ?? 0;
function A1(s, u) { return Yl(s) === Yl(u) && Kf(u) < Kf(s) ? s : u; }
function _b(s, u = 390, f = If, o) { const d = s.round?.tasks ?? Po(s.players), m = [...d].sort(Tb), y = m.filter(P => P.status === "DONE"), g = m.filter(P => P.status === "AVAILABLE"), A = m.findIndex(P => P.status !== "DONE"), E = A < 0 ? 20 : [...Sb].reverse().find(P => P <= A) ?? 0, R = m.map(P => ({ key: P.id, label: Ab(P.id), ...oy(P.id), state: P.status === "DONE" ? "done" : P.status === "AVAILABLE" ? "available" : "locked", taskIds: [P.id] })), T = Math.min(R.length, o === void 0 ? wb(u, f) : Math.max(1, Math.floor(o))), x = Math.min(Math.max(0, E - 1), Math.max(0, R.length - T)), C = new Set(g.filter(P => /^(FL|FR|RL|RR)_/.test(P.id)).map(P => P.id.slice(0, 2))).size, L = g.filter(P => /^(FRONT|REAR)_(LIFT|LOWER)$/.test(P.id)).length, I = `${C} wheel crew${C === 1 ? "" : "s"}`, K = `${L} jack${L === 1 ? "" : "s"} ready`, Q = C && L ? `${I} · ${K}` : C ? `${I} active` : L ? K : g.some(P => P.id === "GREEN_RELEASE") ? "Release ready" : "Waiting on crew"; return { tasks: d, count: y.length, active: g.length, capacity: T, offset: x, stream: R, slots: R.slice(x, x + T), phase: s.status === "WAITING" || !s.round || s.status === "COUNTDOWN" ? "Wait for GO" : y.length === 21 ? "Car released" : Q }; }
const Vo = { FL: "Front-left", FR: "Front-right", RL: "Rear-left", RR: "Rear-right" };
function Rb(s, u) { const o = u.filter(g => g.role === s).sort((g, A) => Jo.indexOf(g.id) - Jo.indexOf(A.id)).map(g => is(g)); if (s === "FRONT_JACK" || s === "REAR_JACK") {
    const g = s === "FRONT_JACK" ? "front" : "rear";
    return { position: `${g === "front" ? "Front" : "Rear"} of the car`, summary: `You use the main button twice: lift the ${g} of the car at the GO signal, then lower it once both ${g} wheels are secured.`, stages: o, requires: `First press: wait for GO signal. Second press: wait for the crew to tighten both ${g} wheel nuts.`, unlocks: `The ${g} wheel crews can work after your lift.` };
} if (s === "RELEASE_CONTROLLER")
    return { position: "Pit exit / whole crew", summary: "Watch all four wheel crews and both jack operators. Press once to release the car when the entire stop is safe.", stages: o, requires: "Wait for all four wheel nuts to be tightened and both jack operators to lower the car.", unlocks: "The car leaves the pit box and the official timer stops." }; const d = s.slice(0, 2), m = Vo[d].toLowerCase(), y = d.startsWith("F") ? "front" : "rear"; return s.endsWith("GUNNER") ? { position: `${Vo[d]} wheel`, summary: `Use your wheel gun twice at the ${m} wheel: loosen the old wheel nut, then tighten the nut after the new wheel is fitted.`, stages: o, requires: `First press: wait for the ${y} jack to lift the car. Second press: wait for the crew to fit the new ${m} wheel.`, unlocks: "Your first action lets the old-wheel remover work; your second secures this wheel." } : s.endsWith("WHEEL_OFF") ? { position: `${Vo[d]} wheel`, summary: `Press once to pull the old ${m} wheel off the hub and move it clear.`, stages: o, requires: `Wait for the ${m} wheel gunner to loosen the wheel nut.`, unlocks: "The new-wheel fitter can fit the fresh wheel." } : { position: `${Vo[d]} wheel`, summary: `Press once to bring in the fresh ${m} wheel and fit it on the hub.`, stages: o, requires: `Wait for the crew to remove the old ${m} wheel.`, unlocks: "Your wheel gunner can tighten the nut after the new wheel is fitted." }; }
function cy(s) { return s.round?.tasks ?? Po(s.players); }
function jb(s) { const [u, f] = O.useState(s), o = O.useRef(s); return O.useEffect(() => { if (o.current = A1(o.current, s), Yl(u) !== Yl(s)) {
    f(s);
    return;
} const d = window.setTimeout(() => f(m => A1(m, o.current)), 160); return () => window.clearTimeout(d); }, [s, u]), Yl(u) === Yl(s) ? u : s; }
function Mb(s, u) { const [f, o] = O.useState({ key: u, value: s }), d = O.useRef(f); return O.useEffect(() => { const m = d.current, y = m.key === u ? m.value : s; if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || y === s) {
    d.current = { key: u, value: s }, o(d.current);
    return;
} const g = performance.now(); let A = 0; const E = R => { const T = Math.min(1, (R - g) / 360), x = Math.max(y, y + (s - y) * (1 - Math.pow(1 - T, 3))); d.current = { key: u, value: x }, o(d.current), T < 1 && (A = requestAnimationFrame(E)); }; return A = requestAnimationFrame(E), () => cancelAnimationFrame(A); }, [u, s]), f.key === u ? f.value : s; }
const zb = O.memo(function ({ room: u, playerId: f, onOpen: o }) { const d = O.useRef(null), [m, y] = O.useState({ width: 390, label: 76, height: 62, vertical: !1 }); O.useEffect(() => { const T = d.current; if (!T)
    return; const x = () => { const L = T.getBoundingClientRect(), I = Math.round(L.width), K = Math.round(L.height), Q = getComputedStyle(T).getPropertyValue("--workflow-direction").trim() === "vertical", P = document.createElement("canvas").getContext("2d"); let Ct = 76; if (P) {
    const at = Jo.map(oy);
    P.font = "500 11px 'Barlow Condensed', sans-serif", Ct = Math.max(Ct, ...at.map(Tt => Math.ceil(P.measureText(Tt.context).width + 6))), P.font = "600 11px Barlow, sans-serif", Ct = Math.max(Ct, ...at.map(Tt => Math.ceil(P.measureText(Tt.action).width + 6)));
} I > 0 && y(at => at.width === I && at.label === Ct && at.height === K && at.vertical === Q ? at : { width: I, label: Ct, height: K, vertical: Q }); }; if (x(), document.fonts?.ready.then(x), typeof ResizeObserver > "u")
    return; const C = new ResizeObserver(x); return C.observe(T), () => C.disconnect(); }, []); const g = jb(u), A = O.useMemo(() => _b(g, m.width, m.label, m.vertical ? Ob(m.height) : void 0), [g, m]), E = Mb(A.count, Yl(g)), R = new Map(A.tasks.map(T => [T.id, T])); return c.jsxs("button", { ref: d, type: "button", className: "mini-chain rolling-chain live-workflow milestone-workflow", onClick: o, "aria-label": `Open full workflow. ${A.count} of 21 complete. ${A.phase}. Parallel tasks are a progress summary. ${A.slots.map(T => `${T.label}: ${T.state}`).join(". ")}`, "data-progress": A.count, "data-visual-progress": E.toFixed(3), "data-visible-count": A.slots.length, "data-measured-width": m.width, "data-label-width": m.label, "data-window-start": A.offset, "data-ready-count": A.active, "data-orientation": m.vertical ? "vertical" : "horizontal", children: [c.jsxs("span", { className: "rail-meta", children: [c.jsx("span", { children: A.phase }), c.jsxs("b", { children: [c.jsx("span", { className: "rail-count", children: Math.floor(E + .001).toString().padStart(2, "0") }), c.jsx("span", { children: "/21" }), c.jsx("span", { className: "rail-open", children: "WORKFLOW ↗" })] })] }), c.jsx("span", { className: "rail-summary", children: "Parallel jobs · progress summary" }), c.jsx("span", { className: "milestone-rail", "aria-hidden": "true", style: m.vertical ? { gridTemplateRows: `repeat(${A.capacity}, minmax(0, 1fr))` } : { gridTemplateColumns: `repeat(${A.capacity}, minmax(0, 1fr))` }, children: A.slots.map((T, x) => { const C = !!f && T.taskIds.some(L => R.get(L)?.ownerId === f); return c.jsxs("span", { className: `rail-milestone ${T.state}${C ? " owned" : ""}`, "data-slot": x, "data-task-ids": T.taskIds.join(","), "data-visible": "true", "data-owned": C, "data-status": T.state, title: `${T.label}${C ? " · YOU" : ""}`, children: [c.jsx("span", { className: "rail-tick", children: T.state === "done" ? c.jsx(vu, { size: 7, strokeWidth: 3 }) : null }), c.jsx("span", { className: "rail-context", children: T.context }), c.jsx("span", { className: "rail-action", children: T.action })] }, `${Yl(g)}:${T.key}`); }) }), c.jsx("span", { className: "rail-total", role: "progressbar", "aria-label": "Total completed tasks; parallel jobs are not serial dependencies", "aria-valuenow": A.count, "aria-valuemin": 0, "aria-valuemax": 21, children: c.jsx("span", { className: "rail-total-fill", style: { transform: `scaleX(${E / 21})` } }) })] }); }), Cb = ["GUN_LOOSEN", "WHEEL_OFF", "WHEEL_ON", "GUN_TIGHTEN"], Db = ["Loosen wheel nut", "Remove old wheel", "Fit new wheel", "Tighten wheel nut"], Lb = O.memo(function ({ room: u, playerId: f }) { const o = O.useMemo(() => cy(u), [u]), [d, m] = O.useState(null), y = O.useRef(null), [g, A] = O.useState({ width: 320, height: 500, points: {} }), E = o.find(C => C.id === d), R = u.round?.players ?? u.players, T = C => C.ownerId === null ? "Bot" : R.find(L => L.id === C.ownerId)?.nickname ?? "Crew member"; O.useLayoutEffect(() => { const C = y.current; if (!C)
    return; const L = () => { const K = C.getBoundingClientRect(); if (!K.width || !K.height)
    return; const Q = {}; C.querySelectorAll("[data-task-id]").forEach(P => { const Ct = P.getBoundingClientRect(); Q[P.dataset.taskId] = { x: Ct.x + Ct.width / 2 - K.x, top: Ct.top - K.top, bottom: Ct.bottom - K.top }; }), A({ width: K.width, height: K.height, points: Q }); }; if (L(), typeof ResizeObserver > "u")
    return; const I = new ResizeObserver(L); return I.observe(C), () => I.disconnect(); }, []); const x = (C, L) => { const I = o.find(P => P.id === C), K = !!f && I.ownerId === f, Q = T(I); return c.jsxs("button", { type: "button", className: `chain-node ${I.status.toLowerCase()}${K ? " yours" : ""}${d === C ? " selected" : ""}`, "data-task-id": C, "data-status": I.status, "data-owned": K, "data-owner": Q, "data-dependencies": I.dependencies.join(","), title: `${is(I)} · ${Q} · ${I.status.toLowerCase()}`, "aria-label": `${is(I)}. ${Q}. ${I.status === "AVAILABLE" ? "Ready" : I.status === "DONE" ? "Done" : "Blocked"}${K ? ". Your task" : ""}`, "aria-pressed": d === C, onClick: () => m(P => P === C ? null : C), children: [c.jsx("span", { className: "chain-node-title", children: L ?? is(I) }), c.jsxs("span", { className: "chain-node-owner", children: [I.status === "DONE" ? c.jsx(vu, { size: 9 }) : I.status === "LOCKED" ? c.jsx(qf, { size: 8 }) : c.jsx("i", { className: "chain-ready-dot" }), c.jsx("span", { children: Q }), K && c.jsx("b", { className: "board-you", children: "YOU" })] })] }, C); }; return c.jsxs("section", { className: "chain-hud connected-workflow v11-board", "aria-label": "Full 21-step workflow", children: [c.jsxs("div", { className: "graph-summary", children: [c.jsxs("strong", { children: [Kf(u), "/21 complete"] }), c.jsx("span", { children: "Two axles · four parallel wheel crews" })] }), c.jsxs("div", { ref: y, className: "connected-graph", "aria-label": "All 21 tasks, their assignees and exact dependencies", children: [c.jsx("svg", { className: "graph-edges", viewBox: `0 0 ${g.width} ${g.height}`, preserveAspectRatio: "none", "aria-hidden": "true", children: o.flatMap(C => C.dependencies.map(L => { const I = o.find(at => at.id === L), K = g.points[L], Q = g.points[C.id], P = C.id === "GREEN_RELEASE" && !L.endsWith("LOWER"); let Ct = ""; if (K && Q) {
                        const at = Q.top - K.bottom > 75, Tt = K.x < g.width / 2 ? 3 : g.width - 3;
                        Ct = P || at ? `M ${K.x} ${K.bottom} V ${K.bottom + 3} H ${Tt} V ${Q.top - 3} H ${Q.x} V ${Q.top}` : `M ${K.x} ${K.bottom} C ${K.x} ${(K.bottom + Q.top) / 2}, ${Q.x} ${(K.bottom + Q.top) / 2}, ${Q.x} ${Q.top}`;
                    } return c.jsx("path", { d: Ct, className: `graph-edge ${C.status === "DONE" ? "done" : I.status === "DONE" && C.status === "AVAILABLE" ? "live" : ""}${P ? " redundant" : ""}`, "data-from": L, "data-to": C.id }, `${L}-${C.id}`); })) }), c.jsx("div", { className: "axle-columns", children: ["FRONT", "REAR"].map((C, L) => c.jsxs("section", { className: "axle-board", "aria-label": `${C === "FRONT" ? "Front" : "Rear"} axle`, children: [c.jsx("div", { className: "axle-jack", children: x(`${C}_LIFT`) }), c.jsx("div", { className: "wheel-lane-name", children: C === "FRONT" ? "Front left" : "Rear left" }), c.jsx("div", { className: "wheel-lane-name", children: C === "FRONT" ? "Front right" : "Rear right" }), Cb.flatMap((I, K) => gu.slice(L * 2, L * 2 + 2).map(Q => x(`${Q}_${I}`, Db[K]))), c.jsx("div", { className: "axle-jack", children: x(`${C}_LOWER`) })] }, C)) }), c.jsx("div", { className: "release-join", children: x("GREEN_RELEASE") })] }), c.jsxs("div", { className: "graph-legend", "aria-label": "Task state legend", children: [c.jsxs("span", { children: [c.jsx("i", { className: "blocked" }), "Blocked"] }), c.jsxs("span", { children: [c.jsx("i", { className: "available" }), "Ready"] }), c.jsxs("span", { children: [c.jsx("i", { className: "done" }), "Done"] }), c.jsxs("span", { children: [c.jsx("i", { className: "owned" }), "YOU"] })] }), c.jsx("p", { className: `chain-inspect${E ? " inspecting" : ""}`, role: "status", children: E ? `${is(E)} · ${T(E)} · ${E.status === "AVAILABLE" ? "Ready" : E.status === "DONE" ? "Completed" : "Blocked"}` : "Tap a task for its full name and crew member." })] }); });
function Ub({ room: s, playerId: u }) { const f = s.players.find(m => m.id === u); if (!f)
    return null; const o = cy(s), d = Rb(f.role, o); return c.jsxs("div", { className: "role-briefing v10-role-briefing", children: [c.jsx("span", { children: "YOUR JOB" }), c.jsx("p", { children: d.summary }), c.jsx("ol", { children: d.stages.map(m => c.jsx("li", { children: m }, m)) }), c.jsx("span", { children: "WHEN TO PRESS" }), c.jsx("p", { children: d.requires }), c.jsx("p", { className: "role-briefing-tip", children: "Watch the crew and workflow, then use the main action button. An early press locks your button for 2 seconds; the team timer keeps running." }), c.jsxs("small", { children: [c.jsx(Zo, { size: 13 }), d.position] })] }); }
const Hb = [["Wheel Gun Operator", "Loosen your wheel nut after the jack lifts, then tighten it after the new wheel is fitted."], ["Old Wheel Remover", "Remove the old wheel after your wheel gunner loosens its nut."], ["New Wheel Fitter", "Fit the fresh wheel after the old wheel has been removed."], ["Front Jack Operator", "Lift the front at the GO signal, then lower it after both front wheel nuts are tightened."], ["Rear Jack Operator", "Lift the rear at the GO signal, then lower it after both rear wheel nuts are tightened."], ["Release Controller", "Release the car after all four wheels are secured and both jacks are down."]];
function Gb() { return c.jsxs("div", { className: "all-roles role-families", children: [Hb.map(([s, u]) => c.jsxs("section", { children: [c.jsx("h3", { children: s }), c.jsx("p", { children: u })] }, s)), c.jsx("p", { className: "panel-note", children: "Four wheel corners share these professions. Seven extra support crew are visual bots." })] }); }
function Bb(s, u = !1) { const f = setTimeout(s, u ? 15e3 : 12e3); return () => clearTimeout(f); }
function w1(s, u, f = !1) { O.useEffect(() => { if (s)
    return Bb(u, f); }, [s, u, f]); }
function qb(s, u) { const f = u.top ?? 0, o = u.left ?? 0, d = f + u.height, m = o + u.width; return s.width <= 0 || s.height <= 0 || s.right <= o || s.left >= m || s.bottom <= f || s.top >= d ? 0 : s.top >= f + u.height * .65 ? Math.ceil(d - Math.max(f, s.top)) : 0; }
function O1({ viewport: s, layoutBottom: u, measured: f = 0, mobile: o = !1, netlify: d = !0, safeArea: m = 0 }) { const y = o && d ? 48 + Math.max(28, m) : 0, g = f > 0 ? f : y; return Math.ceil(Math.max(0, u - ((s.top ?? 0) + s.height) + g)); }
function Uf() { return window.PIT_CONFIG ?? {}; }
function _1() { const s = window.visualViewport; return { width: s?.width ?? window.innerWidth, height: s?.height ?? window.innerHeight, top: s?.offsetTop ?? 0, left: s?.offsetLeft ?? 0 }; }
function R1() { return window.matchMedia("(max-width: 600px), (pointer: coarse) and (max-height: 600px)").matches; }
function Yb() { const [s, u] = O.useState(() => typeof window > "u" ? 0 : O1({ viewport: _1(), layoutBottom: window.innerHeight, mobile: R1(), netlify: Uf().hudHostingBadge !== "none" })); return O.useEffect(() => { const f = ["[data-pit-overlay-reservation]", "#netlify-badge", "netlify-badge", "[data-netlify-badge]", "[data-netlify-site-badge]", '[class*="netlify-badge" i]', '[aria-label*="Powered by Netlify" i]', 'iframe[title*="Netlify" i]', 'iframe[src*="netlify" i]'], o = Uf().hudOverlaySelector; o && f.push(o); let d = 0; const m = document.createElement("span"); m.setAttribute("aria-hidden", "true"), m.style.cssText = "position:fixed;visibility:hidden;pointer-events:none;bottom:0;right:0;width:0;height:var(--pit-safe-area-bottom,env(safe-area-inset-bottom,0px));", document.body.append(m); const y = new ResizeObserver(() => E()); y.observe(m); const g = new Set, A = () => { d = 0; const x = []; for (const Q of f)
    try {
        for (const P of document.querySelectorAll(Q))
            x.includes(P) || x.push(P);
    }
    catch { } for (const Q of g)
    x.includes(Q) || (y.unobserve(Q), g.delete(Q)); let C = 0; const L = _1(); for (const Q of x) {
    g.has(Q) || (g.add(Q), y.observe(Q));
    const P = getComputedStyle(Q);
    P.display === "none" || P.visibility === "hidden" || Number(P.opacity) === 0 || Q.checkVisibility && !Q.checkVisibility({ checkOpacity: !0, checkVisibilityCSS: !0 }) || (C = Math.max(C, qb(Q.getBoundingClientRect(), L)));
} const I = document.querySelector(".game-shell")?.getBoundingClientRect().bottom ?? document.documentElement.clientHeight, K = O1({ viewport: L, layoutBottom: I, measured: C, mobile: R1(), netlify: Uf().hudHostingBadge !== "none", safeArea: m.getBoundingClientRect().height }); u(Q => Q === K ? Q : K); }, E = () => { d || (d = requestAnimationFrame(A)); }, R = x => [...g].some(C => x === C || x.contains(C)) ? !0 : f.some(C => { try {
    return x.matches(C) || !!x.querySelector(C);
}
catch {
    return !1;
} }), T = new MutationObserver(x => { x.some(L => L.type === "attributes" ? L.target instanceof Element && R(L.target) : [...L.addedNodes, ...L.removedNodes].some(I => I instanceof Element && R(I))) && E(); }); return T.observe(document.body, { childList: !0, subtree: !0, attributes: !0, attributeFilter: ["class", "style", "hidden", "id", "data-netlify-badge", "data-pit-overlay-reservation"] }), window.addEventListener("resize", E), window.addEventListener("orientationchange", E), window.visualViewport?.addEventListener("resize", E), window.visualViewport?.addEventListener("scroll", E), E(), () => { d && cancelAnimationFrame(d), T.disconnect(), y.disconnect(), m.remove(), window.removeEventListener("resize", E), window.removeEventListener("orientationchange", E), window.visualViewport?.removeEventListener("resize", E), window.visualViewport?.removeEventListener("scroll", E); }; }, []), s; }
const kb = O.memo(function ({ room: u, playerId: f, onExpand: o }) { const d = u.players.find(m => m.id === f); return c.jsxs("aside", { className: "role-card role-strip", children: [c.jsxs("div", { className: "role-identity", children: [c.jsx("span", { children: "YOUR ROLE:" }), c.jsx("h2", { children: hs(d.role) })] }), c.jsxs("button", { className: "role-details-toggle", onClick: o, "aria-label": `Role details: ${hs(d.role)}`, children: ["Tap for more details ", c.jsx(Zo, { size: 13 })] })] }); });
let St = null, ma = null, mu = null, cl = null, ps = null, wn = !1, gs = .7, yu;
const Wo = new Set;
function $o(s, u) { Wo.add(s), s.onended = () => { Wo.delete(s), s.disconnect(), u.forEach(f => f.disconnect()); }; }
function te(s, u, f, o, d = "sine", m, y = mu) { if (!St || !y)
    return; const g = St.createOscillator(), A = St.createGain(); g.type = d, g.frequency.setValueAtTime(s, u), m && g.frequency.exponentialRampToValueAtTime(m, u + f), A.gain.setValueAtTime(1e-4, u), A.gain.exponentialRampToValueAtTime(Math.max(2e-4, o), u + Math.min(.008, f / 3)), A.gain.exponentialRampToValueAtTime(1e-4, u + f), g.connect(A), A.connect(y), $o(g, [A]), g.start(u), g.stop(u + f + .015); }
function An(s, u, f, o, d = mu) { if (!St || !d || !ps)
    return; const m = St.createBufferSource(), y = St.createBiquadFilter(), g = St.createGain(); m.buffer = ps, y.type = "bandpass", y.frequency.value = o, y.Q.value = .75, g.gain.setValueAtTime(1e-4, s), g.gain.exponentialRampToValueAtTime(f, s + Math.min(.012, u / 3)), g.gain.exponentialRampToValueAtTime(1e-4, s + u), m.connect(y), y.connect(g), g.connect(d), $o(m, [y, g]), m.start(s), m.stop(s + u + .015); }
function j1() { yu !== void 0 && clearInterval(yu), yu = void 0; for (const s of Wo) {
    try {
        s.stop();
    }
    catch { }
    s.disconnect();
} Wo.clear(); }
function M1() { if (!St || !cl || yu !== void 0 || !wn)
    return; const s = St.currentTime, u = St.createOscillator(), f = St.createGain(), o = St.createBiquadFilter(); if (u.type = "sawtooth", u.frequency.value = 48, f.gain.value = .22, o.type = "lowpass", o.frequency.value = 150, o.Q.value = .4, u.connect(o), o.connect(f), f.connect(cl), $o(u, [o, f]), u.start(s), ps) {
    const d = St.createBufferSource(), m = St.createBiquadFilter(), y = St.createGain();
    d.buffer = ps, d.loop = !0, m.type = "bandpass", m.frequency.value = 620, m.Q.value = .45, y.gain.value = .12, d.connect(m), m.connect(y), y.connect(cl), $o(d, [m, y]), d.start(s);
} yu = setInterval(() => { if (!wn || !St || St.state !== "running")
    return; const d = St.currentTime + .015; An(d, .12, .2, 2100, cl), te(1020, d + .02, .055, .2, "sine", void 0, cl), te(880, d + .09, .07, .16, "sine", void 0, cl); }, 11e3); }
function Vb() { if (St)
    return !0; if (typeof window > "u")
    return !1; const s = window.AudioContext || window.webkitAudioContext; if (!s)
    return !1; St = new s, ma = St.createGain(), mu = St.createGain(), cl = St.createGain(), ma.gain.value = 0, mu.gain.value = 1, cl.gain.value = .12; const u = St.createDynamicsCompressor(); u.threshold.value = -15, u.knee.value = 18, u.ratio.value = 5, u.attack.value = .003, u.release.value = .18, mu.connect(ma), cl.connect(ma), ma.connect(u); const f = St.createGain(); f.gain.value = .8, u.connect(f), f.connect(St.destination), ps = St.createBuffer(1, St.sampleRate * 2, St.sampleRate); const o = ps.getChannelData(0); for (let d = 0; d < o.length; d++)
    o[d] = Math.random() * 2 - 1; return !0; }
function Xo(s) { if (wn = s, !s) {
    St && ma && (ma.gain.cancelScheduledValues(St.currentTime), ma.gain.setValueAtTime(0, St.currentTime)), j1();
    return;
} try {
    if (!Vb() || !St || !ma) {
        wn = !1;
        return;
    }
    const u = St, f = u.resume();
    ma.gain.cancelScheduledValues(u.currentTime), ma.gain.setTargetAtTime(gs, u.currentTime, .025), u.state === "running" && M1(), f.then(() => { wn && St === u && u.state === "running" && M1(); }).catch(() => { St === u && Xo(!1); });
}
catch {
    wn = !1, j1(), ma && (ma.gain.value = 0);
} }
function Xb(s) { Number.isFinite(s) && (gs = Math.min(1, Math.max(0, s)), ma && St && (ma.gain.cancelScheduledValues(St.currentTime), ma.gain.setTargetAtTime(wn ? gs : 0, St.currentTime, .025))); }
function Hf() { return { enabled: wn, volume: gs, running: wn && St?.state === "running" }; }
function Ff(s, u = !1) { An(s, .28, .8, 2700); for (let f = 0; f < 7; f++) {
    const o = f * .032;
    te((u ? 168 : 134) + f * 7, s + o, .035, .26, "square"), An(s + o, .026, .36, 3900);
} te(102, s + .22, .15, .55, "triangle", 48); }
function Jf(s, u = !1) { te(u ? 135 : 66, s, .46, .2, "sawtooth", u ? 58 : 128), te(u ? 190 : 100, s + .02, .35, .14, "triangle", u ? 83 : 165), An(s + .04, .46, .45, u ? 1600 : 2100), te(u ? 78 : 110, s + .43, .12, .45, "sine", 42); }
function na(s) { if (!wn || !St || St.state !== "running" || gs === 0)
    return; const u = St.currentTime + .005; switch (s) {
    case "error":
        te(240, u, .13, .35, "triangle", 135), te(150, u + .08, .11, .2, "sine");
        break;
    case "hover":
        te(720, u, .03, .065, "sine");
        break;
    case "click":
        te(580, u, .045, .19, "triangle", 360), An(u, .025, .09, 3400);
        break;
    case "action":
        te(620, u, .075, .25, "triangle", 950), te(1240, u + .025, .07, .11, "sine");
        break;
    case "ready":
        te(659.25, u, .12, .34, "triangle"), te(987.77, u + .07, .2, .3, "sine");
        break;
    case "available":
        te(739.99, u, .1, .31, "sine"), te(1108.73, u + .07, .18, .32, "sine");
        break;
    case "complete":
        te(1396.91, u, .065, .2, "triangle"), te(2093, u + .01, .04, .065, "sine");
        break;
    case "countdown":
        te(440, u, .17, .52, "sine"), te(880, u, .075, .12, "triangle");
        break;
    case "go":
        te(880, u, .38, .5, "sine"), te(1320, u + .045, .3, .28, "triangle"), An(u + .02, .14, .15, 3300);
        break;
    case "gun":
        Ff(u);
        break;
    case "jack":
        Jf(u);
        break;
    case "wheelOff":
        An(u, .32, .7, 680), te(112, u, .16, .4, "triangle", 60), te(53, u + .14, .3, .35, "sine", 38), An(u + .13, .2, .3, 1450);
        break;
    case "wheelOn":
        An(u, .11, .45, 500), te(82, u, .24, .75, "sine", 38), te(174, u + .045, .15, .23, "triangle", 90), An(u + .075, .065, .2, 2600);
        break;
    case "release":
        te(68, u, .95, .24, "sawtooth", 235), te(96, u, 1.12, .35, "triangle", 440), An(u + .1, .95, .3, 1250), [392, 493.88, 587.33, 783.99].forEach((f, o) => te(f, u + .1 + o * .085, .45, .22, "triangle"));
        break;
} }
function ry(s) { if (!wn || !St || St.state !== "running" || gs === 0)
    return; const u = St.currentTime + .005; s.endsWith("_GUN_TIGHTEN") ? Ff(u, !0) : s.endsWith("_GUN_LOOSEN") ? Ff(u) : s.endsWith("_LIFT") ? Jf(u) : s.endsWith("_LOWER") ? Jf(u, !0) : s.endsWith("_WHEEL_OFF") ? na("wheelOff") : s.endsWith("_WHEEL_ON") ? na("wheelOn") : na(s === "GREEN_RELEASE" ? "release" : "complete"); }
function Xl(s) { return (Math.max(0, s) / 1e3).toFixed(3); }
function fy(s, u) { return s ? s.elapsedMs ?? Math.max(0, (s.finishedAt ?? u) - s.goAt) : 0; }
function Zb(s) { const u = { FRONT_LIFT: "LIFT FRONT", REAR_LIFT: "LIFT REAR", FRONT_LOWER: "LOWER FRONT", REAR_LOWER: "LOWER REAR", GREEN_RELEASE: "RELEASE CAR" }; return u[s.id] ? u[s.id] : s.id.endsWith("GUN_LOOSEN") ? "LOOSEN NUT" : s.id.endsWith("GUN_TIGHTEN") ? "TIGHTEN NUT" : s.id.endsWith("WHEEL_OFF") ? "REMOVE OLD WHEEL" : "FIT NEW WHEEL"; }
const Qb = { FL: "front-left", FR: "front-right", RL: "rear-left", RR: "rear-right" };
function Ib(s, u, f) { if (f)
    return "Wait for GO signal"; if (!u)
    return "Your part is complete. The team clock runs until release."; if (u.status === "AVAILABLE")
    return "Watch the crew. Tap or press Space when it is time."; const o = u.dependencies.filter(m => s.round?.tasks.find(y => y.id === m)?.status !== "DONE"); if (!o.length)
    return "Wait for the next server update"; if (u.id.endsWith("_LOWER"))
    return `Wait for both ${u.id.startsWith("FRONT") ? "front" : "rear"} wheels to be secured`; if (u.id === "GREEN_RELEASE")
    return "Wait for both jacks to lower and all wheels to be secured"; const d = Qb[u.id.slice(0, 2)] ?? "correct"; return o.some(m => m.endsWith("_LIFT")) ? `Wait for the ${u.id.startsWith("F") ? "front" : "rear"} jack to lift the car` : o.some(m => m.endsWith("GUN_LOOSEN")) ? `Wait for crew to loosen the ${d} wheel nut` : o.some(m => m.endsWith("WHEEL_OFF")) ? `Wait for crew to remove the ${d} wheel` : o.some(m => m.endsWith("WHEEL_ON")) ? `Wait for crew to fit the new ${d} wheel` : "Wait for crew to secure the wheels"; }
function Kb({ room: s, playerId: u, now: f, busy: o, onAction: d }) { const m = s.round, y = m.tasks.filter(P => P.ownerId === u), g = y.find(P => P.status === "AVAILABLE") ?? y.find(P => P.status !== "DONE"), A = f < m.goAt, E = !g, R = m.penalties?.[u], T = (R?.until ?? 0) > f, x = Math.max(0, (R?.until ?? 0) - Math.max(f, m.goAt)), C = (Math.ceil(x / 100) / 10).toFixed(1), L = !!g && g.status === "AVAILABLE" && !A && s.status === "RUNNING" && !T, I = O.useRef(null), [K, Q] = O.useState(!1); return O.useEffect(() => { if (R && R.at !== I.current && (I.current = R.at, R.until > f)) {
    na("error"), Q(!0);
    const P = setTimeout(() => Q(!1), 500);
    return () => clearTimeout(P);
} }, [R?.at]), c.jsxs(c.Fragment, { children: [c.jsxs("div", { className: "action-hint", children: [c.jsx("span", { children: T ? "Too early — 2.0s lockout" : Ib(s, g, A) }), T && c.jsx("small", { children: A ? "Lockout starts at GO." : "The team clock keeps running." })] }), c.jsxs("button", { className: `game-button action-button ${E ? "secondary complete" : "gold"} ${T ? "penalized" : ""} ${K ? "penalty-flash" : ""}`, disabled: !!o || E || T, "aria-disabled": !L, "data-ready": L, "data-penalty-until": R?.until ?? 0, onClick: () => g && void d(g), children: [o ? c.jsx(X1, { className: "spin", size: 25 }) : E ? c.jsx(vu, { size: 25 }) : c.jsx(Q1, { size: 25 }), c.jsxs("span", { children: [T ? `Too early — ${C}s lockout` : E ? "ACTION COMPLETE" : g ? Zb(g) : "ACTION COMPLETE", c.jsx("small", { children: T ? "PERSONAL LOCKOUT" : E ? "THANK YOU, CREW" : "TAP OR PRESS SPACE" })] }), !E && !T && c.jsx($f, { size: 22 })] }), c.jsx("span", { className: "early-press-notice", children: "Early press = 2s lockout." })] }); }
function Fb({ role: s, busy: u, onChange: f }) { const o = [["Jacks", Io.filter(d => d.endsWith("_JACK"))], ...["FL", "FR", "RL", "RR"].map((d, m) => [["Front-left wheel", "Front-right wheel", "Rear-left wheel", "Rear-right wheel"][m], Io.filter(y => y.startsWith(d + "_"))]), ["Release signal", ["RELEASE_CONTROLLER"]]]; return c.jsxs("label", { className: "solo-role-picker", children: [c.jsx("span", { children: "Choose role" }), c.jsx("select", { "aria-label": "Choose role", title: hs(s), value: s, disabled: u, onChange: d => f(d.target.value), children: o.map(([d, m]) => c.jsx("optgroup", { label: d, children: m.map(y => c.jsx("option", { value: y, children: hs(y) }, y)) }, d)) })] }); }
function Jb({ view: s, hasTeam: u, hasDisplayedRoom: f, focused: o, solo: d, onSelect: m }) { const y = []; s !== "menu" && y.push({ destination: "menu", label: "Main Menu", detail: u ? "Your place on the team is saved." : "Return to the pit lane menu.", icon: wv }), u && s !== "crew" && y.push({ destination: "crew", label: s === "menu" ? "Resume Team" : "My Team", detail: "Return to your pit box.", icon: hu }), f && y.push({ destination: "chain", label: "Full Workflow", detail: "All 21 connected actions.", icon: V1 }, { destination: "roster", label: "Team Members", detail: "Roles and readiness.", icon: pu }); const g = [{ destination: "roles", label: "All Roles", detail: "The 15 playable positions.", icon: Tv }, { destination: "leaderboard", label: "Leaderboard", detail: "Global team times.", icon: Qo }]; (s !== "watch" || o) && g.push({ destination: "watch", label: "Watch Live", detail: "Public team overview.", icon: cs }), u && !d && g.push({ destination: "invite", label: "Invite Link", detail: "Copy the room directory link.", icon: Ov }), g.push({ destination: "settings", label: "Settings", detail: "Audio and scene controls.", icon: Z1 }); const A = (E, R) => R.length > 0 && c.jsxs("section", { className: "navigation-group", "aria-label": E, children: [c.jsx("h3", { children: E }), c.jsx("div", { className: "navigation-grid", children: R.map(({ destination: T, label: x, detail: C, icon: L }) => c.jsxs("button", { type: "button", onClick: () => m(T), children: [c.jsx(L, { className: "navigation-icon", size: 20, "aria-hidden": "true" }), c.jsxs("span", { children: [c.jsx("strong", { children: x }), c.jsx("small", { children: C })] }), c.jsx($f, { className: "navigation-arrow", size: 14, "aria-hidden": "true" })] }, T)) })] }); return c.jsxs("nav", { className: "controls-menu", "aria-label": "Quick controls", children: [A("Your session", y), A("Pit lane", g)] }); }
function Wb(s, u, f, o = 0, d = Math.random) { if (o)
    return Math.min(6e4, 1500 * 2 ** Math.min(o - 1, 6)) * (.85 + d() * .3); const m = s.rooms.find(g => g.players.some(A => A.id === s.identity.playerId)); if (m && (m.status === "COUNTDOWN" || m.status === "RUNNING") && m.round) {
    if (m.players.filter(A => A.connected !== !1).sort((A, E) => A.joinedAt - E.joinedAt || A.id.localeCompare(E.id))[0]?.id === s.identity.playerId) {
        const A = m.status === "COUNTDOWN" ? m.round.goAt : Math.min(...m.round.tasks.filter(E => E.status === "AVAILABLE" && E.ownerId === null && E.dueAt !== null).map(E => E.dueAt));
        if (Number.isFinite(A))
            return Math.max(100, Math.min(2500, A - f + 35));
    }
    return 2500 + d() * 400;
} return !m && u && s.rooms.some(g => g.status === "RUNNING" || g.status === "COUNTDOWN") ? 1800 + d() * 300 : 12e3 + d() * 2e3; }
class z1 {
    constructor(u, f = 180) { this.callback = u, this.delay = f; }
    callback;
    delay;
    timer = null;
    request() { this.timer === null && (this.timer = setTimeout(() => { this.timer = null, this.callback(); }, this.delay)); }
    dispose() { this.timer !== null && clearTimeout(this.timer), this.timer = null; }
}
const $b = { rooms: [], leaderboard: [], serverNow: Date.now(), identity: { playerId: null, isAdmin: !1 } };
function Pb(s = !1) { const [u, f] = O.useState($b), [o, d] = O.useState(null), [m, y] = O.useState(""), [g, A] = O.useState(""), [E, R] = O.useState(""), [T, x] = O.useState(!1), [C, L] = O.useState(0), [I, K] = O.useState(Date.now()), Q = O.useRef(u); Q.current = u; const P = O.useRef(s); P.current = s; const Ct = O.useRef(0), at = O.useRef(0), Tt = O.useRef(Promise.resolve()), Nt = O.useRef(!1), q = O.useRef(!1), $ = O.useRef(!1), rt = O.useRef(0), ye = O.useRef(0), re = O.useRef(!0), fe = O.useRef(null), Ze = O.useRef(async () => { }), Z = O.useRef(new Map), pt = O.useRef(new Map), G = O.useRef(null), F = O.useRef(null), ft = O.useRef(null), xt = O.useRef(0), Rt = O.useRef({ revision: -1, now: -1 / 0 }), Kt = O.useRef(null); F.current || (F.current = new z1(() => { Ze.current(); })); const Dt = O.useCallback((it, V = oe.globalRevision) => { it.local || V !== oe.globalRevision || Rt.current.revision === V && it.serverNow < Rt.current.now || (Rt.current = { revision: V, now: it.serverNow }, d(it)); }, []), de = O.useCallback(async function it() { if (!oe.hasBackend) {
    d(null);
    return;
} if (ft.current) {
    const lt = xt.current;
    try {
        await ft.current;
    }
    catch (Vt) {
        if (lt === oe.globalRevision)
            throw Vt;
    }
    return lt !== oe.globalRevision ? it() : void 0;
} const V = oe.globalRevision; xt.current = V, ft.current = (async () => { try {
    const lt = await oe.getGlobalState();
    re.current && Dt(lt, V);
}
finally {
    ft.current = null;
} })(); try {
    await ft.current;
}
catch (lt) {
    if (V === oe.globalRevision)
        throw lt;
} if (V !== oe.globalRevision)
    return it(); }, [Dt]); Kt.current || (Kt.current = new z1(() => { de().catch(() => { }); }, 1e3)); const Lt = O.useCallback(it => { const V = Tt.current.then(it, it); return Tt.current = V.then(() => { }, () => { }), V; }, []), Ue = O.useCallback((it, V, lt = oe.globalRevision) => { const Vt = Q.current; if (!re.current || !Number.isFinite(it.serverNow) || !!it.local == !!Vt.local && it.serverNow < at.current)
    return; const Qt = Vt.rooms.find(J => J.players.some(Y => Y.id === Vt.identity.playerId)), Mt = it.rooms.find(J => J.players.some(Y => Y.id === it.identity.playerId)); if (Qt && !Mt && !$.current && ++ye.current < 2) {
    F.current?.request();
    return;
} if (ye.current = 0, Qt && !Mt && !$.current && R("Your crew membership ended. You may have been removed or exceeded the 15-minute lobby grace period."), Qt && Mt?.id === Qt.id) {
    const J = Qt.players.find(Xt => Xt.id === Vt.identity.playerId), Y = Mt.players.find(Xt => Xt.id === it.identity.playerId);
    Y?.role !== J?.role && !Mt.solo ? R(Y?.roleNotice ?? "Your role changed to keep a human jack in the crew. Check your role and mark Ready again.") : Y?.roleNotice && Y.roleNotice !== J?.roleNotice && R(Y.roleNotice), Qt.hostId !== Mt.hostId && R(`Host transferred to ${Mt.players.find(Xt => Xt.id === Mt.hostId)?.nickname ?? "another crew member"}.`);
} const vt = G.current; vt && (it.rooms.find(J => J.id === vt.room)?.round?.tasks.find(J => J.id === vt.task) || !it.rooms.some(J => J.id === vt.room)) && (G.current = null, y("")), at.current = it.serverNow, Ct.current = it.local ? 0 : it.serverNow - (V + Date.now()) / 2, Q.current = it, $.current = !1, f(it), x(!0), L(Date.now()), rt.current = 0, oe.hasBackend && !it.local && Dt(it, lt); }, [Dt]), Ut = O.useCallback(() => { if (fe.current && clearTimeout(fe.current), !re.current)
    return; const it = document.hidden ? 6e4 : Wb(Q.current, P.current, Date.now() + Ct.current, rt.current); fe.current = setTimeout(() => { Ze.current(!0); }, it); }, []), He = O.useCallback(async (it = !1) => { if (Nt.current || q.current || !re.current) {
    F.current?.request();
    return;
} Nt.current = !0; try {
    await Lt(async () => { const V = Q.current, lt = V.rooms.find(Mt => Mt.players.some(vt => vt.id === V.identity.playerId)), Vt = Date.now(), Qt = oe.globalRevision; Ue(it ? await oe.call("heartbeat", lt?.id ?? null) : await oe.getState(), Vt, Qt); });
}
catch (V) {
    rt.current++, L(0), A(V instanceof Error ? V.message : "Connection interrupted. Reconnecting…"), x(!0);
}
finally {
    Nt.current = !1, Ut();
} }, [Lt, Ue, Ut]); Ze.current = He, O.useEffect(() => { re.current = !0, He(!0); const it = oe.subscribe(() => { F.current?.request(), Q.current.rooms.some(lt => lt.solo) && Kt.current?.request(); }), V = () => { document.hidden || (rt.current = 0, oe.recoverSession().then(() => Ze.current(!0)).catch(() => Ze.current(!0))); }; return document.addEventListener("visibilitychange", V), window.addEventListener("online", V), () => { re.current = !1, it(), F.current?.dispose(), Kt.current?.dispose(), fe.current && clearTimeout(fe.current), document.removeEventListener("visibilitychange", V), window.removeEventListener("online", V); }; }, [He, de]), O.useEffect(() => { Ut(); }, [u, s, Ut]), O.useEffect(() => { if (!oe.hasBackend || !u.local)
    return; let it = !1, V = null; const lt = async () => { if (!document.hidden)
    try {
        await de();
    }
    catch { } it || (V = setTimeout(() => { lt(); }, document.hidden ? 6e4 : s ? 2500 : 15e3)); }; return lt(), () => { it = !0, V && clearTimeout(V); }; }, [u.local, s, de]), O.useEffect(() => { const it = setInterval(() => K(Date.now()), 50); return () => clearInterval(it); }, []); const Me = u.rooms.find(it => it.players.some(V => V.id === u.identity.playerId)) ?? null, On = O.useCallback(async (it, V, lt = {}) => { if (q.current || G.current)
    return !1; q.current = !0, y(it), A(""), it === "leave" && ($.current = !0); let Vt = !1; const Qt = `${Q.current.rooms.find(Mt => Mt.id === V)?.round?.id}/${lt.taskId}`; if (it === "early_action" && (Z.current.has(Qt) || Z.current.set(Qt, crypto.randomUUID()), lt = { ...lt, requestId: Z.current.get(Qt) }), it === "action" && V) {
    const Mt = `${Q.current.rooms.find(vt => vt.id === V)?.round?.id}/${lt.taskId}`;
    pt.current.has(Mt) || pt.current.set(Mt, String(lt.requestId ?? crypto.randomUUID())), lt = { ...lt, requestId: pt.current.get(Mt) };
} try {
    return await Lt(async () => { const Mt = Date.now(), vt = await oe.call(it, V, lt); it === "admin_delete" ? (Dt(vt), Ue(Q.current.rooms.some(J => J.solo) ? await oe.getState() : vt, Mt)) : Ue(vt, Mt); }), Vt = !0, it === "early_action" && Z.current.delete(Qt), !0;
}
catch (Mt) {
    $.current = !1;
    const vt = Mt instanceof Error ? Mt.message : "Request failed. Please try again.";
    if ((it === "action" || it === "early_action") && V && /timeout|timed out|network|fetch|connection/i.test(vt)) {
        G.current = { room: V, task: String(lt.taskId) }, A("Connection interrupted. Checking whether your action was accepted.");
        try {
            const J = Date.now(), Y = await oe.getState();
            return Vt = Y.rooms.find(Xt => Xt.id === V)?.round?.tasks.some(Xt => Xt.id === lt.taskId && Xt.status === "DONE") ?? !1, Ue(Y, J), Vt;
        }
        catch {
            rt.current++, L(0);
        }
    }
    else
        A(vt);
    return !1;
}
finally {
    q.current = !1, G.current || y(""), Ut();
} }, [Dt, Lt, Ue, Ut]); return { state: u, globalState: o, refreshGlobalState: de, myRoom: Me, now: I + Ct.current, clockOffset: Ct.current, busy: m, error: g, notice: E, loaded: T, stale: C === 0 || I - C > (Me?.status === "RUNNING" || s ? 1e4 : 3e4), refresh: He, run: On, setError: A, setNotice: R }; }
function t2({ title: s, eyebrow: u, children: f, onClose: o, wide: d = !1, className: m = "", busy: y = !1 }) { const g = O.useRef(null), A = O.useRef(o); A.current = o; const E = O.useRef(y); return E.current = y, O.useEffect(() => { const R = document.activeElement; g.current?.querySelector("input,button")?.focus(); const x = C => { if (C.key === "Escape" && !E.current && (C.stopPropagation(), A.current()), C.key !== "Tab" || !g.current)
    return; const L = Array.from(g.current.querySelectorAll('button:not([disabled]),input:not([disabled]),a[href],[tabindex="0"]')); C.shiftKey && document.activeElement === L[0] ? (C.preventDefault(), L.at(-1)?.focus()) : !C.shiftKey && document.activeElement === L.at(-1) && (C.preventDefault(), L[0]?.focus()); }; return document.addEventListener("keydown", x), () => { document.removeEventListener("keydown", x), R?.focus(); }; }, []), c.jsx("div", { className: "overlay-backdrop", onPointerDown: R => { R.target === R.currentTarget && !y && o(); }, children: c.jsxs("section", { className: `game-overlay ${d ? "wide" : ""} ${m}`, ref: g, role: "dialog", "aria-modal": "true", "aria-label": s, children: [c.jsxs("header", { className: "overlay-heading", children: [c.jsxs("div", { children: [c.jsx("span", { className: "eyebrow", children: u }), c.jsx("h2", { children: s })] }), c.jsx("button", { className: "icon-control", onClick: o, disabled: y, "aria-label": "Close panel", children: c.jsx(Pf, { size: 20 }) })] }), c.jsx("div", { className: "overlay-content", children: f })] }) }); }
function e2({ rooms: s, loaded: u, myRoom: f, onJoin: o, onCreate: d }) { const m = s.filter(y => y.status === "WAITING" && y.players.length < 15); return c.jsxs("div", { className: "room-browser", children: [c.jsxs("div", { className: "panel-intro", children: [c.jsx("p", { children: "Find your crew. Claim your position." }), c.jsxs("button", { className: "game-button small primary", onClick: d, children: ["Create Team ", c.jsx(ds, { size: 15 })] })] }), u ? m.length ? c.jsx("div", { className: "room-grid", children: m.map(y => c.jsxs("article", { className: "lobby-card", style: { borderTopColor: y.color }, children: [c.jsxs("div", { className: "row between", children: [c.jsxs("span", { className: "status-tag", children: [c.jsx("i", {}), "WAITING"] }), c.jsxs("span", { className: "mono", children: [c.jsx(pu, { size: 13 }), " ", y.players.length, "/15"] })] }), c.jsx("h3", { children: y.name }), c.jsxs("p", { children: [c.jsx(k1, { size: 13 }), " Host: ", y.players.find(g => g.id === y.hostId)?.nickname ?? "Transferring…"] }), c.jsx("div", { className: "lobby-ready", children: Array.from({ length: 15 }, (g, A) => c.jsx("i", { className: A < y.players.filter(E => E.ready).length ? "ready" : A < y.players.length ? "occupied" : "" }, A)) }), c.jsxs("div", { className: "row between", children: [c.jsxs("span", { className: "muted", children: [y.players.filter(g => g.ready).length, " ready"] }), c.jsxs("button", { className: "game-button small secondary", onClick: () => o(y), disabled: !!f, children: ["Join Team ", c.jsx(ds, { size: 14 })] })] })] }, y.id)) }) : c.jsx(Wf, { text: "No open teams yet. Create one to get started." }) : c.jsx(Wf, { text: "Connecting to the pit lane…" }), f && c.jsx("p", { className: "panel-note", children: "You already have a player seat. Leave your current team before joining another." })] }); }
function a2({ room: s, busy: u, practice: f, blocked: o, onSubmit: d }) { const [m, y] = O.useState(""), [g, A] = O.useState(""), [E, R] = O.useState("#f4493b"), T = ["#f4493b", "#f7bd50", "#48c9bc", "#5a94f5", "#b87cf1"]; return c.jsxs("form", { className: "create-form", onSubmit: x => { x.preventDefault(), d(m.trim(), g.trim(), E); }, children: [c.jsx("p", { className: "panel-description", children: s ? `Take a place with ${s.name}.` : "One room. One team. You host and play." }), o && c.jsx("p", { className: "inline-warning", children: "Leave your current team before creating or joining another." }), !s && c.jsxs("label", { children: ["TEAM NAME", c.jsx("input", { required: !0, minLength: 2, maxLength: 40, placeholder: "e.g. Apex Collective", value: m, onChange: x => y(x.target.value), autoComplete: "off" })] }), c.jsxs("label", { children: ["YOUR NICKNAME", c.jsx("input", { required: !0, minLength: 2, maxLength: 24, placeholder: "Your crew calls you…", value: g, onChange: x => A(x.target.value), autoComplete: "nickname" })] }), !s && c.jsxs("fieldset", { className: "accent-picker", children: [c.jsx("legend", { children: "CREW COLOR" }), c.jsx("div", { children: T.map(x => c.jsx("button", { type: "button", style: { background: x }, className: E === x ? "selected" : "", onClick: () => R(x), "aria-label": `Choose ${x} color`, "aria-pressed": E === x, children: E === x && c.jsx(vu, { size: 17 }) }, x)) })] }), c.jsxs("p", { className: "panel-note", children: ["Nicknames, roles and results are public. ", f ? "Online teams unavailable. Configure Supabase in config.js. Solo Test still works offline." : "Each real teammate joins on their own device."] }), c.jsxs("button", { className: "game-button primary full", disabled: !oe.hasBackend || u || o || g.trim().length < 2 || !s && m.trim().length < 2, children: [u ? c.jsx(X1, { className: "spin", size: 18 }) : c.jsx(hu, { size: 18 }), s ? "Join Team" : "Create Team", c.jsx(ds, { size: 18 })] })] }); }
function n2({ room: s, myId: u, busy: f, onKick: o }) { return c.jsxs("div", { className: "crew-drawer", children: [c.jsxs("div", { className: "roster-caption", children: [c.jsxs("span", { children: [s.players.length, " HUMAN"] }), c.jsxs("span", { children: [15 - s.players.length, " CORE BOTS"] }), c.jsx("span", { children: "7 SUPPORT" })] }), c.jsx("div", { className: "roster-list", children: s.players.map((d, m) => c.jsxs("div", { className: `roster-person ${d.id === u ? "is-you" : ""}`, children: [c.jsx("span", { className: "seat-number", children: String(m + 1).padStart(2, "0") }), c.jsxs("div", { children: [c.jsxs("strong", { children: [d.nickname, d.id === s.hostId && c.jsxs("span", { className: "host-badge", children: [c.jsx(k1, { size: 10 }), "HOST"] }), d.id === u && c.jsx("span", { className: "you-tag", children: "YOU" })] }), c.jsx("small", { children: hs(d.role) })] }), c.jsx("span", { className: `readiness ${d.ready ? "ready" : ""}`, children: d.connected === !1 ? "Offline" : s.status === "WAITING" ? d.ready ? "Ready" : "Not ready" : "In position" }), u === s.hostId && d.id !== u && s.status === "WAITING" && c.jsx("button", { className: "icon-control danger", disabled: f, "aria-label": `Remove ${d.nickname}`, onClick: () => o(d.id), children: c.jsx(Pf, { size: 15 }) })] }, d.id)) }), c.jsx("p", { className: "panel-note", children: "Roles are assigned by the server. Roles and Ready stay unchanged when other players join or leave. All fifteen core roles stay in the graph; unfilled roles are adaptive bots." })] }); }
function l2({ state: s, onDelete: u }) { const [f, o] = O.useState(null); return c.jsxs("div", { className: "standings", children: [c.jsxs("div", { className: "standings-caption", children: [c.jsx(Qo, { size: 16 }), c.jsx("span", { children: "ALL TEAMS · EVERY ROUND · LOWEST AVERAGE WINS" })] }), s.leaderboard.length ? s.leaderboard.map((d, m) => c.jsxs("div", { className: "standings-team", children: [c.jsxs("div", { className: "standings-row", children: [c.jsx("span", { className: "rank", children: String(m + 1).padStart(2, "0") }), c.jsxs("button", { className: "standing-name", onClick: () => o(f === d.teamId ? null : d.teamId), children: [c.jsx("i", { style: { background: d.color } }), c.jsxs("span", { children: [d.name, c.jsxs("small", { children: [d.rounds.length, " rounds · Best ", Xl(d.bestMs), "s"] })] }), c.jsx(xv, { size: 15 })] }), c.jsxs("strong", { children: [Xl(d.averageMs), c.jsx("small", { children: "s" })] }), s.identity.isAdmin && c.jsx("button", { className: "icon-control danger", "aria-label": `Delete ${d.name} results`, onClick: () => u(d.teamId, void 0, `all results for ${d.name}`), children: c.jsx(Yf, { size: 15 }) })] }), f === d.teamId && c.jsx("div", { className: "round-history", children: d.rounds.map((y, g) => c.jsxs("div", { children: [c.jsxs("span", { children: ["ROUND ", String(g + 1).padStart(2, "0")] }), c.jsxs("strong", { children: [Xl(y.elapsedMs), "s"] }), s.identity.isAdmin && c.jsx("button", { className: "icon-control danger", "aria-label": `Delete round ${g + 1}`, onClick: () => u(void 0, y.id, `round ${g + 1} for ${d.name}`), children: c.jsx(Yf, { size: 13 }) })] }, y.id)) })] }, d.teamId)) : c.jsx(Wf, { text: "No times on the board. Your crew could be first." }), c.jsx("p", { className: "panel-note", children: "Teams are ranked by their average pit stop time across completed rounds." })] }); }
function i2({ busy: s, onSubmit: u, configured: f, onlineSeat: o = !1 }) { const [d, m] = O.useState("admin"), [y, g] = O.useState(""), [A, E] = O.useState(!1); return f ? c.jsxs("form", { className: "create-form", onSubmit: R => { R.preventDefault(), (!o || A) && u(d, y); }, children: [c.jsx("p", { className: "panel-description", children: "Use your configured Supabase admin username and its current password. Leaderboard viewing is public." }), c.jsxs("label", { children: ["ADMIN USERNAME", c.jsx("input", { type: "text", required: !0, value: d, onChange: R => m(R.target.value), autoComplete: "username" })] }), c.jsxs("label", { children: ["PASSWORD", c.jsx("input", { type: "password", required: !0, value: y, onChange: R => g(R.target.value), autoComplete: "current-password" })] }), o && c.jsxs("label", { className: "admin-seat-confirm", children: [c.jsx("input", { type: "checkbox", checked: A, onChange: R => E(R.target.checked) }), c.jsx("span", { children: "Leave my online team before signing in. An active attempt will end; completed results stay saved." })] }), c.jsxs("button", { className: "game-button primary full", disabled: s || o && !A, children: [c.jsx(qf, { size: 17 }), s ? "Signing in…" : o ? "Leave Team & sign in" : "Sign in"] }), c.jsxs("details", { className: "admin-setup-help", children: [c.jsx("summary", { children: "Account setup checks" }), c.jsxs("ol", { children: [c.jsx("li", { children: "In Supabase Authentication → Users, confirm the admin email." }), c.jsx("li", { children: "Check that this user UUID is listed in pit_private.admins." }), c.jsx("li", { children: "Map your username to that same UUID in pit_private.admin_aliases." }), c.jsx("li", { children: "Use that Auth account’s existing password. The app never resets it." })] })] })] }) : c.jsxs("div", { className: "admin-backend-needed", children: [c.jsx(qf, { size: 26 }), c.jsx("p", { children: "Global administration requires a connection to Supabase." }), c.jsx("p", { className: "panel-note", children: "Configure your Supabase project URL and public key in config.js, then reload. Solo Test remains available." })] }); }
function s2({ label: s, busy: u, onSubmit: f }) { const [o, d] = O.useState(""); return c.jsxs("form", { className: "create-form", onSubmit: m => { m.preventDefault(), o === "DELETE" && f(); }, children: [c.jsxs("p", { className: "panel-description", children: ["Permanently delete ", s, ". This cannot be undone."] }), c.jsxs("label", { children: ["TYPE DELETE TO CONFIRM", c.jsx("input", { required: !0, pattern: "DELETE", value: o, onChange: m => d(m.target.value), autoComplete: "off", placeholder: "DELETE" })] }), c.jsxs("button", { className: "game-button primary full", disabled: u || o !== "DELETE", children: [c.jsx(Yf, { size: 17 }), "Delete results"] })] }); }
function u2() { const s = ["Create or join a team of 4–15 players.", "Find your gold YOU marker and read your assigned role.", "Everyone marks Ready; the host starts the round.", "Watch 3… 2… 1… GO! The car stops and the team clock starts.", "Watch the crew and workflow, then tap your action button or press Space at the right time.", "An early press causes a 2s personal lockout while the team clock keeps running.", "Teams rank by their average pit stop time across completed rounds."]; return c.jsx("ol", { className: "quick-playbook", children: s.map(u => c.jsx("li", { children: u }, u)) }); }
function Wf({ text: s }) { return c.jsxs("div", { className: "empty-panel", children: [c.jsx(pu, { size: 26 }), c.jsx("p", { children: s })] }); }
const o2 = 6500, dy = { FL: "front-left", FR: "front-right", RL: "rear-left", RR: "rear-right" };
function c2(s) { const u = { FRONT_LIFT: "Lift front of car", REAR_LIFT: "Lift rear of car", FRONT_LOWER: "Lower front of car", REAR_LOWER: "Lower rear of car", GREEN_RELEASE: "Release car" }; if (u[s])
    return u[s]; const f = dy[s.slice(0, 2)]; return f ? s.endsWith("GUN_LOOSEN") ? `Loosen ${f} wheel nut` : s.endsWith("GUN_TIGHTEN") ? `Tighten ${f} wheel nut` : s.endsWith("WHEEL_OFF") ? `Remove old ${f} wheel` : `Fit new ${f} wheel` : s.replaceAll("_", " ").toLowerCase(); }
function r2(s) { if (s === "FRONT_JACK")
    return "Front jack"; if (s === "REAR_JACK")
    return "Rear jack"; if (s === "RELEASE_CONTROLLER")
    return "Release controller"; const u = dy[s.slice(0, 2)], f = s.endsWith("GUNNER") ? "gunner" : s.endsWith("WHEEL_OFF") ? "wheel remover" : "wheel fitter"; return `${u[0].toUpperCase()}${u.slice(1)} ${f}`; }
function C1(s, u) { return typeof s == "number" && Number.isFinite(s) && u >= s ? u - s : null; }
function Eu(s, u = []) { const f = s.players ?? u, o = new Map, d = new Map(s.tasks.map(y => [y.id, y])), m = (y, g, A) => { if (!Number.isFinite(g))
    return; const E = A && A.ownerId !== void 0 ? A.ownerId : y.ownerId, R = f.find(L => L.id === E), T = A?.role ?? y.role, x = A?.enabledAt ?? y.enabledAt, C = E != null; o.set(y.id, { taskId: y.id, task: c2(y.id), by: C ? A?.nickname ?? R?.nickname ?? "Crew member" : "Bot", role: r2(T), human: C, at: g, enabledAt: typeof x == "number" ? x : null, stepMs: C1(x, g), teamMs: C1(s.goAt, g) }); }; for (const y of s.tasks)
    y.completedAt !== null && m(y, y.completedAt); for (const y of s.events) {
    const g = d.get(y.taskId);
    g && m(g, y.at, y);
} return [...o.values()].sort((y, g) => y.at - g.at || y.taskId.localeCompare(g.taskId)); }
function hy(s) { return { start: -3e3, end: Math.max(s.goAt, s.finishedAt ?? s.goAt, ...Eu(s).map(f => f.at)) - s.goAt + o2 }; }
function f2(s, u) { const { start: f, end: o } = hy(s); return Math.max(f, Math.min(o, Number.isFinite(u) ? u : f)); }
function my(s, u) { for (let f = s.length - 1; f >= 0; f--)
    if (s[f].at <= u)
        return s[f]; return null; }
function d2(s) { return { id: `replay:${s.roundId}`, teamId: s.teamId, name: s.teamName, color: s.color, code: "", hostId: "", status: "COMPLETED", players: s.round.players ?? s.players, round: s.round, updatedAt: s.round.finishedAt ?? s.round.goAt, solo: s.solo }; }
function kl(s) { return s === null ? "Not recorded" : `${(s / 1e3).toFixed(3)}s`; }
function yy({ event: s, waiting: u = "Waiting for the first task" }) { return c.jsx("div", { className: "replay-event-chip", "data-task-id": s?.taskId ?? "", children: s ? c.jsxs(c.Fragment, { children: [c.jsx("strong", { title: s.task, children: s.task }), c.jsxs("span", { title: `${s.by} · ${s.role}`, children: [s.by, " ", c.jsxs("small", { children: ["· ", s.role] })] }), c.jsxs("span", { className: "event-chip-times", children: [c.jsx("b", { children: kl(s.stepMs) }), " step ", c.jsx("i", { children: "·" }), " ", c.jsx("b", { children: kl(s.teamMs) }), " team"] })] }) : c.jsx("span", { children: u }) }); }
function h2({ round: s, players: u, cursor: f }) { const o = O.useMemo(() => Eu(s, u), [s, u]); return c.jsxs("div", { className: "replay-event-table-wrap", children: [c.jsx("p", { className: "event-log-help", children: "Step Time: unlock to completion, including any lockout delay. Bot times reflect actual synchronized completion. Team Time: elapsed since GO. Missing historical timings are marked “Not recorded”." }), c.jsxs("table", { className: "replay-event-table", children: [c.jsx("thead", { children: c.jsxs("tr", { children: [c.jsx("th", { scope: "col", children: "Task" }), c.jsx("th", { scope: "col", children: "By" }), c.jsx("th", { scope: "col", children: "Step Time" }), c.jsx("th", { scope: "col", children: "Team Time" })] }) }), c.jsx("tbody", { children: o.map(d => c.jsxs("tr", { "data-task-id": d.taskId, className: f !== void 0 && d.at > f ? "event-future" : "", children: [c.jsx("td", { children: d.task }), c.jsxs("td", { children: [c.jsx("strong", { children: d.by }), c.jsx("small", { children: d.role })] }), c.jsx("td", { children: kl(d.stepMs) }), c.jsx("td", { children: kl(d.teamMs) })] }, d.taskId)) })] }), !o.length && c.jsx("p", { className: "event-log-empty", children: "No completed tasks yet." })] }); }
function nd({ round: s, players: u, cursor: f, onClose: o, teamName: d, live: m = !1 }) { const y = O.useRef(null), g = O.useRef(o); return g.current = o, O.useEffect(() => { const A = document.activeElement; y.current?.querySelector("button")?.focus(); const E = R => { R.key === "Escape" && (R.preventDefault(), R.stopImmediatePropagation(), g.current()); }; return window.addEventListener("keydown", E, !0), () => { window.removeEventListener("keydown", E, !0), A?.focus(); }; }, []), c.jsx("div", { className: "replay-log-backdrop", children: c.jsxs("section", { ref: y, className: "replay-log-drawer", role: "dialog", "aria-modal": "false", "aria-label": `Event Log${d ? ` — ${d}` : ""}`, "data-live": m, children: [c.jsxs("header", { children: [c.jsxs("div", { children: [c.jsx("strong", { children: "Event Log" }), d && c.jsxs("small", { children: [d, m ? " · LIVE" : ""] })] }), c.jsx("button", { type: "button", onClick: o, "aria-label": "Close Event Log", children: "Close" })] }), c.jsx(h2, { round: s, players: u, cursor: f })] }) }); }
function m2({ room: s, now: u }) { const [f, o] = O.useState(!1), d = O.useMemo(() => s.round ? Eu(s.round, s.players) : [], [s.round, s.players]), m = my(d, u ?? Number.POSITIVE_INFINITY); return c.jsxs(c.Fragment, { children: [c.jsxs("div", { className: "live-event-strip", children: [c.jsx(yy, { event: m, waiting: s.status === "COUNTDOWN" ? "Wait for GO signal" : "Waiting for the first task" }), c.jsx("button", { type: "button", onClick: () => o(!0), "aria-expanded": f, children: "Event Log" })] }), f && s.round && c.jsx(nd, { round: s.round, players: s.players, teamName: s.name, live: s.status === "RUNNING" || s.status === "COUNTDOWN", onClose: () => o(!1) })] }); }
function y2({ record: s, onClose: u, quality: f = "high", onToggleAudio: o, soundEnabled: d }) { const m = O.useMemo(() => d2(s), [s]), y = O.useMemo(() => hy(s.round), [s.round]), g = O.useMemo(() => Eu(s.round, s.players), [s.round, s.players]), A = O.useMemo(() => { const q = new ny; return q.ingestRecorded(s.round), g.map($ => ({ taskId: $.taskId, at: q.receipt($.taskId)?.startsAt ?? $.at })); }, [s.round, g]), [E, R] = O.useState(y.start), [T, x] = O.useState(!0), [C, L] = O.useState(1), [I, K] = O.useState(!1), Q = O.useRef(null); O.useEffect(() => { R(y.start), x(!0), K(!1); }, [s.roundId, y.start]), O.useEffect(() => { if (!T)
    return; let q = 0, $ = performance.now(); const rt = ye => { const re = (ye - $) * C; $ = ye, R(fe => Math.min(y.end, fe + re)), q = requestAnimationFrame(rt); }; return q = requestAnimationFrame(rt), () => cancelAnimationFrame(q); }, [T, C, y.end]), O.useEffect(() => { E >= y.end && x(!1); }, [E, y.end]), O.useEffect(() => { const q = Q.current?.roundId === s.roundId ? Q.current.cursor : null; if (Q.current = { roundId: s.roundId, cursor: E }, !!T) {
    if (q === null) {
        E < 0 && na("countdown");
        return;
    }
    if (!(E <= q)) {
        for (const $ of [-2e3, -1e3])
            q < $ && E >= $ && na("countdown");
        q < 0 && E >= 0 && na("go");
        for (const $ of A) {
            const rt = $.at - s.round.goAt;
            rt > q && rt <= E && ry($.taskId);
        }
    }
} }, [E, T, A, s.roundId, s.round.goAt]), O.useEffect(() => { const q = $ => { $.key === "Escape" && ($.stopPropagation(), I ? K(!1) : u()), $.code === "Space" && !$.repeat && !$.defaultPrevented && !I && !($.target instanceof HTMLElement && $.target.closest('input,button,textarea,select,[contenteditable],[role="button"]')) && ($.preventDefault(), x(rt => !rt)); }; return window.addEventListener("keydown", q), () => window.removeEventListener("keydown", q); }, [I, u]); const P = s.round.goAt + E, Ct = my(g, P), at = E < 0 ? String(Math.max(1, Math.ceil(-E / 1e3))) : E < 800 ? "GO!" : "", Tt = () => { Q.current = null, R(y.start), x(!0); }, Nt = q => { const $ = f2(s.round, q); Q.current = { roundId: s.roundId, cursor: $ }, R($); }; return c.jsxs("section", { className: "replay-view", role: "dialog", "aria-modal": "true", "aria-label": `${s.teamName} round replay`, "data-round-id": s.roundId, "data-replay-cursor": E.toFixed(0), "data-replay-time": E.toFixed(0), "data-replay-playing": String(T), children: [c.jsx(uy, { room: m, presentationTime: P, quality: f }), c.jsxs("header", { className: "replay-heading", children: [c.jsxs("div", { children: [c.jsx("small", { children: s.solo ? "LOCAL · UNRANKED REPLAY" : "ROUND REPLAY" }), c.jsx("strong", { children: s.teamName })] }), c.jsxs("nav", { children: [o && c.jsx("button", { type: "button", onClick: o, "data-audio-control": !0, "aria-label": d ? "Mute sound" : "Enable sound", children: d ? "Sound on" : "Sound off" }), c.jsx("button", { type: "button", onClick: u, "aria-label": "Close replay", children: "Close replay" })] })] }), at && c.jsx("div", { className: `replay-countdown ${E >= 0 ? "go" : ""}`, "aria-live": "off", children: at }), c.jsxs("div", { className: "replay-controls", children: [c.jsx(yy, { event: Ct, waiting: E < 0 ? "Car approaching · wait for GO signal" : "GO! · waiting for the first task" }), c.jsx("input", { className: "replay-scrubber", type: "range", min: y.start, max: y.end, step: "10", value: E, onChange: q => Nt(Number(q.target.value)), "aria-label": "Replay timeline", "aria-valuetext": E < 0 ? `${(-E / 1e3).toFixed(1)} seconds until GO` : `${(E / 1e3).toFixed(1)} seconds since GO` }), c.jsxs("div", { className: "replay-buttons", children: [c.jsx("button", { type: "button", onClick: () => E >= y.end ? Tt() : x(q => !q), "aria-label": T ? "Pause replay" : "Play replay", children: T ? "Pause" : "Play" }), c.jsx("button", { type: "button", onClick: Tt, children: "Restart" }), c.jsxs("button", { type: "button", onClick: () => L(q => q === 1 ? 2 : 1), "aria-label": `Playback speed ${C} times`, children: ["×", C] }), c.jsxs("time", { "aria-label": "Replay elapsed time", children: [E < 0 ? `−${(-E / 1e3).toFixed(1)}` : (E / 1e3).toFixed(1), "s"] }), c.jsx("button", { type: "button", onClick: () => K(!0), "aria-expanded": I, children: "Event Log" })] })] }), I && c.jsx(nd, { round: s.round, players: s.players, cursor: P, onClose: () => K(!1) })] }); }
const p2 = O.memo(function ({ room: u }) { const f = O.useMemo(() => u.round ? Eu(u.round, u.players).reverse() : [], [u.round, u.players]); return c.jsxs("section", { className: "desktop-live-log", "aria-label": "Live Event Log", "data-round-id": u.round?.id ?? "", "data-event-count": f.length, children: [c.jsxs("header", { children: [c.jsx("strong", { children: "EVENT LOG" }), c.jsx("span", { children: u.status === "RUNNING" ? "LIVE" : u.status === "COMPLETED" ? "FINAL" : "AWAITING GO" })] }), c.jsx("div", { className: "desktop-event-scroll", role: "log", "aria-live": "off", "aria-label": "Latest completed tasks first", children: f.length ? c.jsx("ol", { children: f.map(o => c.jsxs("li", { "data-task-id": o.taskId, "data-event-at": o.at, title: `${o.task} · ${o.by} · Step Time ${kl(o.stepMs)} · Team Time ${kl(o.teamMs)}`, children: [c.jsx("strong", { className: "desktop-event-task", children: o.task }), c.jsxs("div", { className: "desktop-event-details", children: [c.jsxs("span", { className: "desktop-event-owner", children: [c.jsx("small", { children: "BY" }), c.jsx("b", { title: `${o.by} · ${o.role}`, children: o.by })] }), c.jsxs("span", { children: [c.jsx("small", { children: "STEP" }), c.jsx("time", { children: kl(o.stepMs) })] }), c.jsxs("span", { children: [c.jsx("small", { children: "TEAM" }), c.jsx("time", { children: kl(o.teamMs) })] })] })] }, `${u.round.id}:${o.taskId}`)) }) : c.jsx("p", { className: "desktop-event-empty", children: u.status === "WAITING" || u.status === "COUNTDOWN" ? "Completed tasks appear after GO." : "Waiting for the first task." }) })] }); }), g2 = { WAITING: "IN POSITION", COUNTDOWN: "LIGHTS OUT IN", RUNNING: "STOP IN PROGRESS", COMPLETED: "GREEN RELEASE", CLOSED: "TEAM CLOSED" };
function Gf(s, u) { try {
    return localStorage.getItem(s) ?? u;
}
catch {
    return u;
} }
function Bf(s, u) { try {
    localStorage.setItem(s, u);
}
catch { } }
function v2() { const s = Pb(window.location.hash.startsWith("#watch")), { state: u, globalState: f, myRoom: o, now: d, clockOffset: m, busy: y, error: g, notice: A, loaded: E, stale: R, run: T, refresh: x, refreshGlobalState: C, setError: L, setNotice: I } = s, K = Yb(), Q = oe.hasBackend ? f ?? u : u, P = !!f?.identity.isAdmin, Ct = O.useRef(window.location.hash.slice(1)), [at, Tt] = O.useState(Ct.current.startsWith("watch") ? "watch" : Ct.current === "crew" ? "crew" : "menu"), [Nt, q] = O.useState(Ct.current.startsWith("watch/") ? Ct.current.split("/")[1] : null), [$, rt] = O.useState(Ct.current === "rooms" ? "rooms" : null), [ye, re] = O.useState(), [fe, Ze] = O.useState(Gf("pit-v7-quality", "high") === "low" ? "low" : "high"), [Z, pt] = O.useState(() => { const M = Number(Gf("pit-v7-volume", ".7")); return Number.isFinite(M) ? Math.min(1, Math.max(0, M)) : .7; }), [G, F] = O.useState(!1), [ft, xt] = O.useState({ label: "all completed results" }), [Rt, Kt] = O.useState(0), [Dt, de] = O.useState(null), [Lt, Ue] = O.useState(null), [Ut, He] = O.useState(null), [Me, On] = O.useState(null), it = O.useRef(0), V = O.useRef(0), lt = O.useRef(!1), Vt = O.useRef(Gf("pit-v7-muted", "false") === "true"), Qt = O.useRef(0), Mt = u.identity.playerId, vt = o?.players.find(M => M.id === Mt), J = oe.hasBackend ? f ?? u : u, Y = J.rooms.filter(M => M.status === "COUNTDOWN" || M.status === "RUNNING"), Xt = J.rooms.find(M => M.id === Nt), wt = at === "watch" ? Xt ?? Y[0] ?? J.rooms.find(M => M.status === "WAITING") ?? null : o, Qe = !oe.hasBackend, Ae = !!o?.solo; O.useEffect(() => { rt(M => M === "briefing" ? null : M); }, [vt?.role, o?.id]), O.useEffect(() => { ($ === "admin" || $ === "leaderboard") && C().catch(() => L("Global administration requires a connection to Supabase. Check your connection and project configuration.")); }, [$, C, L]); const Oa = O.useCallback(() => I(""), [I]), mn = O.useCallback(() => L(""), [L]); w1(A, Oa), w1(g, mn, !0); const ca = Hf(), ve = O.useCallback(() => rt("chain"), []), gt = O.useCallback((M, ct) => { Tt(M), q(ct ?? null), rt(null), ++it.current, He(null), window.location.hash = M === "menu" ? "" : M === "watch" && ct ? `watch/${ct}` : M; }, []); O.useEffect(() => { const M = () => { const [ct, Ft] = window.location.hash.slice(1).split("/"); Tt(ct === "watch" ? "watch" : ct === "crew" ? "crew" : "menu"), q(ct === "watch" ? Ft ?? null : null), rt(ct === "rooms" ? "rooms" : null); }; return window.addEventListener("hashchange", M), () => window.removeEventListener("hashchange", M); }, []), O.useEffect(() => { E && at === "crew" && !o && gt("menu"); }, [E, at, o, gt]), O.useEffect(() => { const M = ct => { ct.key === "Escape" && !$ && !Dt && !Ut && (at === "watch" && Nt ? gt("watch") : at !== "menu" && gt("menu")); }; return window.addEventListener("keydown", M), () => window.removeEventListener("keydown", M); }, [$, at, Nt, gt, Dt, Ut]), O.useEffect(() => { Xb(Z); }, [Z]), O.useEffect(() => { const M = setInterval(() => Kt(ct => ct + 1), 300); return () => clearInterval(M); }, []), O.useEffect(() => () => Xo(!1), []); const yn = M => { lt.current && Hf().running || Vt.current || M instanceof Element && M.closest("[data-audio-control]") || (lt.current = !0, Xo(!0), Kt(ct => ct + 1)); }, ya = () => { lt.current = !0; const M = !Hf().running; Vt.current = !M, Bf("pit-v7-muted", String(!M)), Xo(M), Kt(ct => ct + 1), M && setTimeout(() => na("ready"), 60); }, Fa = O.useRef({ round: null, ids: new Set }), Xn = O.useRef(""); O.useEffect(() => { if (Dt)
    return; const M = wt?.round; if (!M) {
    Fa.current = { round: null, ids: new Set };
    return;
} if (Fa.current.round !== M.id) {
    Fa.current = { round: M.id, ids: new Set(M.tasks.filter(Zt => Zt.status === "DONE").map(Zt => Zt.id)) };
    return;
} const ct = M.tasks.filter(Zt => Zt.status === "DONE" && !Fa.current.ids.has(Zt.id)), Ft = ct.filter(Zt => Zt.completedAt !== null && d - Zt.completedAt < 1200 && !R); for (const Zt of ct)
    Fa.current.ids.add(Zt.id); for (const Zt of Ft)
    ry(Zt.id); Ft.some(Zt => Zt.id !== "GREEN_RELEASE") && na("complete"); const ga = M.tasks.find(Zt => Zt.ownerId === Mt && Zt.status === "AVAILABLE"), gn = ga ? `${M.id}/${ga.id}` : ""; gn && gn !== Xn.current && at === "crew" && na("available"), Xn.current = gn; }, [wt, Mt, at, Dt]); const Ja = O.useRef({ round: null, number: null, go: !1 }); O.useEffect(() => { if (Dt)
    return; const M = wt?.round; if (!M) {
    Ja.current = { round: null, number: null, go: !1 };
    return;
} Ja.current.round !== M.id && (Ja.current = { round: M.id, number: null, go: !1 }); const ct = Math.ceil((M.goAt - d) / 1e3); M.status === "COUNTDOWN" && ct >= 1 && ct <= 3 && Ja.current.number !== ct ? (Ja.current.number = ct, na("countdown")) : d >= M.goAt && ["COUNTDOWN", "RUNNING"].includes(M.status) && !Ja.current.go && ((Ja.current.number !== null || d - M.goAt < 1e3) && na("go"), Ja.current.go = !0); }, [wt, d, Dt]); const Zl = o?.round?.tasks.filter(M => M.ownerId === vt?.id) ?? [], Zn = Zl.find(M => M.status === "AVAILABLE") ?? Zl.find(M => M.status !== "DONE"), pn = O.useCallback(async (M) => { if (!o || y || (o.round?.penalties?.[vt?.id ?? ""]?.until ?? 0) > d)
    return; const ct = d < (o.round?.goAt ?? 1 / 0) || M.status === "LOCKED"; await T(ct ? "early_action" : "action", o.id, { taskId: M.id, requestId: crypto.randomUUID() }) && (ct || na("action")); }, [o, y, T, vt?.id, d]); O.useEffect(() => { const M = ct => { ct.code !== "Space" || at !== "crew" || $ || Dt || !Zn || y || !["COUNTDOWN", "RUNNING"].includes(o?.status ?? "") || ct.repeat || ct.target instanceof HTMLElement && ct.target.closest("input,button,textarea,select,[contenteditable]") || (ct.preventDefault(), yn(ct.target), pn(Zn)); }; return window.addEventListener("keydown", M), () => window.removeEventListener("keydown", M); }, [at, $, Dt, Zn, y, o, pn]); const _n = async () => { try {
    document.fullscreenElement ? await document.exitFullscreen() : await document.documentElement.requestFullscreen();
}
catch {
    I("Use your browser’s fullscreen command for projector mode.");
} }, Qn = async () => { await T("leave", o?.id) && (gt("menu"), I("You left the team. Completed team results are preserved.")); }, In = async (M) => { const ct = ++V.current; Ue(M), L(""); try {
    const Ft = await oe.getReplay(M);
    ct === V.current && (rt(null), ++it.current, He(null), de(Ft));
}
catch (Ft) {
    ct === V.current && L(Ft instanceof Error ? Ft.message : "Replay is unavailable.");
}
finally {
    ct === V.current && Ue(null);
} }; O.useEffect(() => { Dt && !Dt.solo && J.replays && !J.replays.some(M => M.roundId === Dt.roundId) && (de(null), I("This replay is no longer available.")); }, [J.replays, Dt, I]); const Ie = async () => { const M = `${window.location.origin}${window.location.pathname}#rooms`; try {
    await navigator.clipboard.writeText(M), I("Room directory link copied. Ask teammates to join your crew.");
}
catch {
    I(M);
} }, Ql = async (M, ct) => { const Ft = ++it.current; if (ct) {
    He({ roomId: ct, roundId: M });
    return;
} On(M), L(""); try {
    const ga = await oe.getReplay(M);
    Ft === it.current && He({ roundId: M, record: ga });
}
catch (ga) {
    Ft === it.current && L(ga instanceof Error ? ga.message : "Event Log is unavailable.");
}
finally {
    Ft === it.current && On(null);
} }, pa = Ut?.roomId ? J.rooms.find(M => M.id === Ut.roomId && M.round?.id === Ut.roundId) : void 0, Rn = pa?.round ?? Ut?.record?.round, Wa = pa?.players ?? Ut?.record?.players; O.useEffect(() => { if (!Ut)
    return; const M = J.rooms.some(Ft => Ft.round?.id === Ut.roundId && Ft.status !== "COMPLETED"), ct = J.replays?.some(Ft => Ft.roundId === Ut.roundId); !M && J.replays && !ct && !Ut.record?.solo ? (He(null), I("This Event Log is no longer available.")) : Ut.roomId && !pa && ct && Ql(Ut.roundId); }, [J.rooms, J.replays, Ut, pa]); const $a = (M, ct, Ft = "all completed results") => { xt({ teamId: M, resultId: ct, label: Ft }), rt("delete"); }, we = async (M, ct) => { F(!0), L(""); try {
    if (o && !Ae && !await T("leave", o.id))
        return;
    await oe.signInAdmin(M, ct), await x(), await C(), rt("leaderboard");
}
catch (Ft) {
    L(Ft instanceof Error ? Ft.message : "Unable to sign in.");
}
finally {
    F(!1);
} }, pi = async () => { try {
    await oe.signOutAdmin(), await x(), await C();
}
catch (M) {
    L(M instanceof Error ? M.message : "Unable to sign out.");
} }, Il = at === "crew" && o?.id === wt?.id ? Mt : null, Pa = !!wt && (at === "crew" || at === "watch" && !!Nt), ze = wt?.round?.status === "COUNTDOWN" && d < wt.round.goAt, Ga = !!wt?.round && ["COUNTDOWN", "RUNNING"].includes(wt.round.status) && d >= wt.round.goAt && d - wt.round.goAt < 950, Ke = { briefing: ["YOUR ROLE", vt ? hs(vt.role) : "Role details"], roles: ["REFERENCE", "All Roles"], controls: ["NAVIGATION", "Quick controls"], leave: ["LEAVE TEAM", "Abandon this round?"], rooms: ["OPEN TEAMS", "Find your crew"], create: ["TEAM ENTRY", "Create your team"], join: ["CREW ENTRY", "Take your position"], leaderboard: ["GLOBAL STANDINGS", "The benchmark"], how: ["THE PLAYBOOK", "How to play"], roster: ["ROSTER", "Team Members"], chain: ["LIVE WORKFLOW", "The connected stop"], settings: ["PIT LANE SETTINGS", "Make it yours"], admin: ["PROTECTED ACCESS", "Global administrator"], delete: ["PERMANENT ACTION", "Delete results?"] }; return c.jsxs("div", { style: { "--pit-overlay-bottom": `${K}px` }, className: `game-shell view-${at} ${at === "watch" && Nt ? "focused-room" : ""} ${Dt ? "replay-open" : ""}`, onPointerDownCapture: M => yn(M.target), onKeyDownCapture: M => { (M.code === "Enter" || M.code === "Space") && yn(M.target); }, onClickCapture: M => { M.target instanceof Element && M.target.closest("button") && !M.target.closest("[data-audio-control]") && na("click"); }, onPointerOver: M => { M.target instanceof Element && M.target.closest("button") && performance.now() - Qt.current > 160 && (Qt.current = performance.now(), na("hover")); }, children: [c.jsx("div", { className: "scene-stage", children: c.jsx(uy, { room: wt, playerId: Il, quality: fe, serverNow: d, active: (at !== "watch" || !!Nt) && !Dt }) }), c.jsx("div", { className: "cinematic-shade", "aria-hidden": "true" }), c.jsxs("header", { className: "top-hud", children: [at !== "menu" && c.jsxs("button", { className: "game-button small back-menu", onClick: () => gt("menu"), "aria-label": "Main Menu", title: o ? "Return to menu — your place on the team is saved." : "Main Menu", children: [c.jsx(h1, { size: 17 }), "Main Menu"] }), c.jsx("div", { className: "session-chip", children: at === "watch" ? c.jsxs(c.Fragment, { children: [c.jsx(cs, { size: 15 }), c.jsxs("span", { children: ["PUBLIC OBSERVER", c.jsx("small", { children: "No player seat used" })] })] }) : o ? c.jsxs(c.Fragment, { children: [c.jsx("span", { className: "crew-color", style: { background: o.color } }), c.jsxs("span", { children: [o.name, c.jsxs("small", { children: [vt?.id === o.hostId ? "HOST / PLAYER" : "CREW MEMBER", " · ", o.players.length, "/15"] })] })] }) : c.jsxs(c.Fragment, { children: [c.jsx("span", { className: "signal-dot" }), c.jsxs("span", { children: ["PIT LANE 07", c.jsx("small", { children: Qe ? "OFFLINE" : "ONLINE" })] })] }) }), Pa && c.jsxs("div", { className: `race-timer ${wt.status === "COMPLETED" ? "finished" : ""}`, children: [c.jsx("span", { children: wt.status === "WAITING" ? "AWAITING CREW" : "PIT STOP TIME" }), c.jsxs("strong", { children: [Xl(fy(wt.round, d)), c.jsx("small", { children: "s" })] }), c.jsx("em", { children: R ? "RECONNECTING · ESTIMATE" : wt.status === "COMPLETED" ? "OFFICIAL RESULT" : g2[wt.status] })] }), c.jsxs("div", { className: "top-controls", children: [at === "crew" && o && c.jsxs("button", { className: "leave-crew-control", disabled: !!y, onClick: () => o.status === "COUNTDOWN" || o.status === "RUNNING" ? rt("leave") : void Qn(), children: [c.jsx(m1, { size: 16 }), c.jsx("span", { children: "Leave Team" })] }), c.jsx("button", { className: "icon-control more-control", onClick: () => rt("controls"), "aria-label": "Open menu", children: c.jsx(V1, { size: 20 }) }), c.jsx("button", { className: "icon-control sound-control", onClick: ya, "data-audio-control": !0, "data-audio-state": ca.running ? "running" : ca.enabled ? "suspended" : "muted", "data-audio-volume": ca.volume, "aria-label": ca.enabled ? "Mute sound" : "Enable sound", title: ca.enabled ? `Sound ${Math.round(Z * 100)}%` : "Enable sound", children: ca.enabled ? c.jsx(Rv, { size: 20 }) : c.jsx(jv, { size: 20 }) }), c.jsx("button", { className: "icon-control", onClick: () => rt("settings"), "aria-label": "Settings", children: c.jsx(Z1, { size: 20 }) }), c.jsx("button", { className: "icon-control fullscreen-button", onClick: () => { _n(); }, "aria-label": "Fullscreen projector", children: c.jsx(y1, { size: 19 }) })] })] }), at === "menu" && c.jsxs("section", { className: "main-menu", children: [c.jsxs("h1", { children: ["PIT STOP.", c.jsx("br", {}), c.jsx("span", { children: "SIMULATOR." })] }), c.jsxs("div", { className: "menu-actions", children: [o && c.jsxs("div", { className: "menu-seat", children: [c.jsxs("div", { className: "team-seat-actions", children: [c.jsxs("button", { className: "game-button resume", onClick: () => gt("crew"), children: [c.jsx(hu, { size: 17 }), "Resume Team"] }), c.jsxs("button", { className: "game-button secondary", disabled: !!y, onClick: () => o.status === "COUNTDOWN" || o.status === "RUNNING" ? rt("leave") : void Qn(), children: [c.jsx(m1, { size: 16 }), "Leave Team"] })] }), c.jsx("p", { className: "saved-seat-note", children: "Your place on the team is saved." })] }), c.jsxs("button", { className: "game-button primary", onClick: () => rt("create"), children: [c.jsx(hu, { size: 19 }), "Create Team", c.jsx(ds, { size: 21 })] }), c.jsxs("button", { className: "game-button secondary", onClick: () => rt("rooms"), children: [c.jsx(pu, { size: 19 }), "Browse Teams", c.jsxs("span", { className: "button-meta", children: [u.rooms.filter(M => M.status === "WAITING" && M.players.length < 15).length, " OPEN"] })] }), c.jsxs("button", { className: "game-button secondary", onClick: () => gt("watch"), children: [c.jsx(cs, { size: 19 }), "Watch Live", c.jsxs("span", { className: "button-meta", children: [Y.length, " ACTIVE"] })] }), c.jsxs("div", { className: "menu-secondary", children: [c.jsxs("button", { onClick: () => rt("leaderboard"), children: [c.jsx(Qo, { size: 16 }), "Leaderboard"] }), c.jsxs("button", { onClick: () => rt("how"), children: [c.jsx(Zo, { size: 16 }), "How to play"] }), c.jsx("button", { onClick: () => rt("roles"), children: "All Roles" }), c.jsxs("button", { onClick: () => rt("admin"), children: [c.jsx(Mf, { size: 14 }), "Admin access"] })] }), ty && c.jsxs("button", { className: "solo-test-button", disabled: !!o, onClick: async () => { await T("solo_enter") && gt("crew"); }, children: ["Solo Test ", c.jsx("span", { children: "LOCAL · NOT RANKED" })] })] })] }), Pa && c.jsxs(c.Fragment, { children: [c.jsxs("div", { className: "room-heading", children: [c.jsxs("div", { className: "phase-badge", children: [c.jsx("i", {}), at === "watch" ? "OBSERVER FOCUS" : Ae ? "SOLO · UNRANKED" : "YOUR TEAM"] }), c.jsx("h2", { title: wt.name, children: wt.name }), c.jsxs("span", { children: [wt.players.length, " human operators · ", 15 - wt.players.length, " adaptive core bots"] }), at === "watch" && c.jsxs("button", { className: "text-button", onClick: () => gt("watch"), children: [c.jsx(h1, { size: 14 }), "All teams"] })] }), c.jsxs("aside", { className: "scene-instruments", "aria-label": "Team progress", children: [c.jsx(zb, { room: wt, playerId: Il, onOpen: ve }), c.jsx(p2, { room: wt })] }), at === "watch" && c.jsx(m2, { room: wt, now: d })] }), at === "crew" && o && vt && o.status !== "COMPLETED" && c.jsxs("div", { className: "hud-dock", children: [c.jsx(kb, { room: o, playerId: vt.id, onExpand: () => rt("briefing") }), c.jsx("div", { className: "action-console", children: o.status === "WAITING" ? c.jsxs(c.Fragment, { children: [Ae && c.jsx(Fb, { role: vt.role, busy: !!y, onChange: M => { T("choose_role", o.id, { role: M }); } }), c.jsxs("div", { className: "ready-status", children: [c.jsx(pu, { size: 16 }), c.jsxs("span", { children: [o.players.filter(M => M.ready).length, "/", o.players.length, " READY"] }), c.jsx("small", { children: Ae ? "One human · 14 bots" : Qe ? "Local simulated crew" : "Everyone must be Ready" })] }), c.jsxs("button", { className: `game-button ready-button ${vt.ready ? "locked" : "gold"}`, disabled: !!y, onClick: async () => { await T("ready", o.id, { ready: !vt.ready }) && na("ready"); }, children: [vt.ready ? c.jsx(vu, { size: 22 }) : c.jsx(hu, { size: 22 }), vt.ready ? "Ready" : "Mark ready"] }), vt.id === o.hostId && c.jsxs("button", { className: "game-button primary start-button", disabled: !!y || !Ae && (o.players.length < 4 || o.players.length > 15) || !o.players.every(M => M.ready && M.connected !== !1), onClick: () => { T("start", o.id); }, children: [c.jsx(Q1, { size: 20 }), "Start round", c.jsx(ds, { size: 19 })] }), c.jsx("span", { className: "start-explanation", children: Ae ? "Choose your role. Ready, then start." : o.players.length < 4 ? `${4 - o.players.length} more players needed` : o.players.every(M => M.ready) ? vt.id === o.hostId ? "Crew locked. Send it." : "Waiting for your host to start" : "Waiting for every teammate to be Ready" })] }) : c.jsx(Kb, { room: o, playerId: vt.id, now: d, busy: y, onAction: pn }) })] }), at === "watch" && !Nt && c.jsx(b2, { rooms: J.rooms, clockOffset: m, replays: J.replays ?? [], replayLoading: Lt, eventLogLoading: Me, onEventLog: (M, ct) => { Ql(M, ct); }, now: d, stale: R, onFocus: M => gt("watch", M), onReplay: M => { In(M); } }), (ze || Ga) && Pa && c.jsxs("div", { className: "countdown-display", "aria-live": "assertive", children: [c.jsx("span", { children: ze ? "WAIT FOR GO SIGNAL" : "PIT STOP TIME STARTS NOW" }), c.jsx("strong", { children: ze ? Math.max(1, Math.ceil((wt.round.goAt - d) / 1e3)) : "GO!" }), c.jsx("div", { children: [3, 2, 1].map(M => c.jsx("i", { className: Math.ceil((wt.round.goAt - d) / 1e3) <= M ? "on" : "" }, M)) })] }), at === "crew" && o?.status === "COMPLETED" && c.jsxs("section", { className: "result-overlay", children: [c.jsxs("span", { className: "eyebrow", children: ["STOP COMPLETE", !Ae && " · OFFICIAL RESULT"] }), c.jsx("div", { className: "result-time", children: c.jsxs("strong", { children: [Xl(o.round.elapsedMs), c.jsx("small", { children: "s" })] }) }), !Ae && c.jsxs("div", { className: "result-average", children: [c.jsx("span", { children: "TEAM AVERAGE" }), c.jsxs("b", { children: [Xl(u.leaderboard.find(M => M.teamId === o.teamId)?.averageMs ?? o.round.elapsedMs), "s"] })] }), c.jsxs("div", { className: "result-buttons", children: [c.jsxs("button", { className: "game-button gold", disabled: Lt === o.round.id, onClick: () => { In(o.round.id); }, children: [c.jsx(cs, { size: 16 }), Lt === o.round.id ? "Loading…" : "Watch replay"] }), vt?.id === o.hostId && c.jsxs("button", { className: "game-button secondary", disabled: !!y, onClick: () => { T("replay", o.id); }, children: [c.jsx(p1, { size: 16 }), "Play again"] }), c.jsx("button", { className: "game-button secondary result-leaderboard", onClick: () => rt("leaderboard"), "aria-label": "Leaderboard", children: c.jsx(Qo, { size: 16 }) })] }), vt?.id !== o.hostId && c.jsx("p", { className: "result-host-note", children: "Your host can start another round." })] }), at !== "menu" && c.jsxs("div", { className: "view-tools", "aria-hidden": "true", children: [c.jsxs("span", { children: [c.jsx(p1, { size: 13 }), "DRAG TO ROTATE"] }), c.jsx("span", { children: "SCROLL TO ZOOM" })] }), !(Ae || Qe) && c.jsx("div", { className: `connection-pill ${R ? "stale" : ""}`, role: "status", "aria-label": R ? "Reconnecting…" : "Connected", children: R ? c.jsxs(c.Fragment, { children: [c.jsx(Mv, { size: 12 }), c.jsx("span", { children: "Reconnecting…" })] }) : c.jsx(_v, { size: 12 }) }), (g || A) && c.jsxs("div", { className: `game-toast ${g ? "error" : ""}`, role: g ? "alert" : "status", children: [c.jsx(Zo, { size: 17 }), c.jsx("span", { children: g || A }), c.jsx("button", { "aria-label": "Dismiss message", onClick: () => { L(""), I(""); }, children: c.jsx(Pf, { size: 16 }) })] }), $ && c.jsxs(t2, { title: Ke[$][1], eyebrow: Ke[$][0], onClose: () => rt(null), wide: ["rooms", "leaderboard", "roster", "chain", "roles"].includes($), className: `${$ === "leaderboard" ? "leaderboard-overlay" : $ === "chain" ? "chain-overlay" : $ === "controls" ? "navigation-overlay" : ""}`, busy: !!y || G, children: [$ === "rooms" && c.jsx(e2, { rooms: u.rooms, loaded: E, myRoom: o, onJoin: M => { re(M), rt("join"); }, onCreate: () => rt("create") }), ($ === "create" || $ === "join") && c.jsx(a2, { room: $ === "join" ? ye : void 0, busy: !!y, blocked: !!o, practice: Qe, onSubmit: async (M, ct, Ft) => { await T($ === "join" ? "join" : "create", $ === "join" ? ye?.id : null, { name: M, nickname: ct, color: Ft }) && gt("crew"); } }), $ === "leaderboard" && c.jsxs(c.Fragment, { children: [c.jsx(l2, { state: Q, onDelete: $a }), c.jsx("div", { className: "admin-strip", children: P ? c.jsxs(c.Fragment, { children: [c.jsx(Mf, { size: 14 }), c.jsx("span", { children: "Global admin" }), c.jsx("button", { onClick: () => $a(), children: "Clear all results" }), c.jsx("button", { onClick: () => { pi(); }, children: "Sign out" })] }) : c.jsxs("button", { onClick: () => rt("admin"), children: [c.jsx(Mf, { size: 13 }), "Admin access"] }) })] }), $ === "roster" && wt && c.jsx(n2, { room: wt, myId: at === "crew" ? Mt : null, busy: !!y, onKick: M => { T("kick", wt.id, { playerId: M }); } }), $ === "chain" && wt && c.jsx(Lb, { room: wt, playerId: Il, expanded: !0 }), $ === "briefing" && o && vt && c.jsx(Ub, { room: o, playerId: vt.id }), $ === "how" && c.jsx(u2, {}), $ === "roles" && c.jsx(Gb, {}), $ === "leave" && c.jsxs("div", { className: "leave-confirm", children: [c.jsx("p", { children: "This attempt will end without a ranked result. Completed results are preserved." }), c.jsx("button", { className: "game-button secondary", onClick: () => rt(null), children: "Stay in Team" }), c.jsx("button", { className: "game-button primary", onClick: () => { Qn(); }, children: "Leave Team" })] }), $ === "controls" && c.jsx(Jb, { view: at, hasTeam: !!o, hasDisplayedRoom: !!wt, focused: !!Nt, solo: Ae, onSelect: M => { M === "menu" || M === "crew" || M === "watch" ? gt(M) : M === "invite" ? Ie() : rt(M); } }), $ === "admin" && c.jsx(i2, { busy: G, onSubmit: we, configured: oe.hasBackend, onlineSeat: !!o && !Ae }), $ === "delete" && c.jsx(s2, { label: ft.label, busy: !!y, onSubmit: async () => { await T("admin_delete", null, { teamId: ft.teamId, resultId: ft.resultId, confirm: "DELETE" }) && (rt("leaderboard"), I("Selected results deleted. Team averages updated.")); } }), $ === "settings" && c.jsxs("div", { className: "settings-panel", children: [c.jsxs("div", { className: "setting-row", children: [c.jsxs("div", { children: [c.jsx("strong", { children: "Pit lane audio" }), c.jsx("p", { children: "Mechanical SFX + quiet pit ambience" })] }), c.jsx("button", { className: `game-button small ${ca.enabled ? "gold" : "secondary"}`, onClick: ya, "data-audio-control": !0, children: ca.enabled ? "Sound on" : "Enable sound" })] }), c.jsxs("label", { className: "volume-control", "data-audio-control": !0, children: [c.jsxs("span", { children: ["MASTER VOLUME ", c.jsxs("b", { children: [Math.round(Z * 100), "%"] })] }), c.jsx("input", { "aria-label": "Master volume", type: "range", min: "0", max: "1", step: ".01", value: Z, onPointerUp: () => na("ready"), onChange: M => { const ct = Number(M.target.value); pt(ct), Bf("pit-v7-volume", String(ct)); } })] }), c.jsx("p", { className: "panel-note", children: "Sound activates after your first interaction. If your browser suspends audio, tap Enable sound." }), c.jsxs("div", { className: "setting-row", children: [c.jsxs("div", { children: [c.jsx("strong", { children: "Scene quality" }), c.jsx("p", { children: "Eco mode uses fewer pixels and shadows." })] }), c.jsxs("button", { className: "game-button small secondary", onClick: () => { const M = fe === "high" ? "low" : "high"; Ze(M), Bf("pit-v7-quality", M); }, children: [fe === "high" ? "HIGH" : "ECO", c.jsx(Av, { size: 15 })] })] }), c.jsxs("div", { className: "setting-row", children: [c.jsxs("div", { children: [c.jsx("strong", { children: "Camera" }), c.jsx("p", { children: "Return to the starting angle." })] }), c.jsx("button", { className: "game-button small secondary", onClick: () => window.dispatchEvent(new Event("pit-camera-reset")), children: "Re-center" })] }), c.jsxs("div", { className: "setting-row", children: [c.jsxs("div", { children: [c.jsx("strong", { children: "Projector mode" }), c.jsx("p", { children: "Immersive fullscreen. Escape to exit." })] }), c.jsxs("button", { className: "game-button small secondary", onClick: () => { _n(); }, children: [c.jsx(y1, { size: 15 }), "Fullscreen"] })] }), c.jsx("p", { className: "panel-note", children: Ae ? "One human and fourteen bots. Results stay in this local test only." : Qe ? "Online teams need a connected Supabase project; use Solo Test for offline testing." : "Public rooms, host controls and scoring use the existing Supabase backend. Your device never sets the official time." })] })] }), Ut && Rn && Wa && c.jsx(nd, { round: Rn, players: Wa, teamName: pa?.name ?? Ut.record?.teamName, live: !!pa && ["COUNTDOWN", "RUNNING"].includes(pa.status), onClose: () => { ++it.current, He(null); } }), Dt && c.jsx(y2, { record: Dt, onClose: () => de(null), onToggleAudio: ya, soundEnabled: ca.enabled, quality: fe })] }); }
function b2({ rooms: s, clockOffset: u, replays: f, replayLoading: o, eventLogLoading: d, now: m, stale: y, onFocus: g, onReplay: A, onEventLog: E }) { const R = s.filter(x => x.status === "COUNTDOWN" || x.status === "RUNNING"), T = s.filter(x => x.status === "WAITING"); return c.jsx(gb, { children: c.jsxs("section", { className: "observer-overview", children: [c.jsx("header", { children: c.jsxs("div", { children: [c.jsxs("span", { className: "eyebrow", children: [c.jsx(cs, { size: 13 }), "PUBLIC OBSERVER / NO PLAYER SEAT"] }), c.jsx("h1", { children: "Watch Live" }), c.jsx("p", { children: y ? "Reconnecting. Showing last-known state." : "Select a team to watch." })] }) }), c.jsxs("div", { className: "observer-scroll", children: [c.jsxs("div", { className: "observer-section-title", children: [c.jsx("span", { className: "signal-dot" }), c.jsx("h2", { children: "ON THE CLOCK" }), c.jsx("b", { children: R.length })] }), !R.length && c.jsx("div", { className: "observer-empty", children: "The pit lane is quiet. Starting teams appear here automatically." }), c.jsx("div", { className: "observer-grid active-teams-grid", children: R.map(x => c.jsx(E2, { room: x, clockOffset: u, now: m, onFocus: () => g(x.id), onEventLog: () => E(x.round.id, x.id) }, x.id)) }), c.jsxs("div", { className: "observer-section-title", children: [c.jsx("h2", { children: "WAITING TO START" }), c.jsx("b", { children: T.length })] }), c.jsxs("div", { className: "observer-waiting", children: [T.map(x => c.jsxs("button", { className: "waiting-crew", onClick: () => g(x.id), children: [c.jsx("i", { style: { background: x.color } }), c.jsxs("strong", { children: [x.name, c.jsxs("small", { children: ["HOST ", x.players.find(C => C.id === x.hostId)?.nickname ?? "—"] })] }), c.jsxs("span", { children: [x.players.length, "/15"] }), c.jsxs("b", { children: [x.players.filter(C => C.ready).length, " READY"] }), c.jsx($f, { size: 16 })] }, x.id)), !T.length && c.jsx("p", { className: "muted", children: "No teams are waiting in the pit lane." })] }), f.length > 0 && c.jsxs(c.Fragment, { children: [c.jsxs("div", { className: "observer-section-title", children: [c.jsx("h2", { children: "JUST FINISHED" }), c.jsx("b", { children: f.length })] }), c.jsx("div", { className: "finished-teams", children: [...f].sort((x, C) => C.finishedAt - x.finishedAt || x.roundId.localeCompare(C.roundId)).map(x => c.jsxs("article", { className: "finished-team", "data-round-id": x.roundId, children: [c.jsx("i", { style: { background: x.color } }), c.jsxs("strong", { children: [x.teamName, c.jsx("small", { children: "FINISHED" })] }), c.jsxs("span", { children: [Xl(x.elapsedMs), "s"] }), c.jsxs("div", { className: "card-action-row", children: [c.jsx("button", { className: "game-button small secondary", disabled: d === x.roundId, onClick: () => E(x.roundId), children: d === x.roundId ? "Loading…" : "Event Log" }), c.jsxs("button", { className: "game-button small secondary", disabled: o === x.roundId, onClick: () => A(x.roundId), children: [c.jsx(cs, { size: 14 }), o === x.roundId ? "Loading…" : "Replay"] })] })] }, x.roundId)) })] })] })] }) }); }
function E2({ room: s, clockOffset: u, now: f, onFocus: o, onEventLog: d }) { const m = s.round?.tasks.filter(y => y.status === "DONE").length ?? 0; return c.jsxs("article", { className: "live-card", style: { borderTopColor: s.color }, "data-room-id": s.id, children: [c.jsxs("div", { className: "row between", children: [c.jsxs("span", { className: "status-tag", children: [c.jsx("i", {}), s.status === "COUNTDOWN" ? "COUNTDOWN" : "LIVE"] }), c.jsxs("span", { className: "muted", children: [s.players.length, "H / ", 15 - s.players.length, "B"] })] }), c.jsx(vb, { room: s, clockOffset: u }), c.jsx("h3", { children: s.name }), c.jsxs("strong", { className: "observer-time", children: [s.status === "COUNTDOWN" ? f < s.round.goAt ? `GO IN ${Math.ceil((s.round.goAt - f) / 1e3)}` : "GO!" : Xl(fy(s.round, f)), c.jsx("small", { children: s.status !== "COUNTDOWN" && "s" })] }), c.jsx("div", { className: "observer-progress", children: c.jsx("span", { style: { width: `${m / 21 * 100}%` } }) }), c.jsxs("div", { className: "row between live-card-actions", children: [c.jsxs("span", { children: [m, "/21 COMPLETE"] }), c.jsxs("div", { className: "card-action-row", children: [c.jsx("button", { className: "game-button small secondary", onClick: d, children: "Event Log" }), c.jsxs("button", { className: "game-button small secondary", onClick: o, children: ["Watch ", c.jsx(ds, { size: 13 })] })] })] })] }); }
bv.createRoot(document.getElementById("root")).render(c.jsx(hv.StrictMode, { children: c.jsx(v2, {}) }));
