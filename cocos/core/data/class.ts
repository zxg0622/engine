﻿/*
 Copyright (c) 2013-2016 Chukong Technologies Inc.
 Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.

 http://www.cocos.com

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated engine source code (the "Software"), a limited,
  worldwide, royalty-free, non-assignable, revocable and non-exclusive license
 to use Cocos Creator solely to develop games on your target platforms. You shall
  not use Cocos Creator software for developing other software or tools that's
  used for developing games. You are not granted to publish, distribute,
  sublicense, and/or sell copies of Cocos Creator.

 The software or tools in this License Agreement are licensed, not sold.
 Xiamen Yaji Software Co., Ltd. reserves all rights not expressly granted to you.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
*/

/**
 * @category core/data
 */

// tslint:disable:only-arrow-functions
// tslint:disable:prefer-for-of
// tslint:disable:no-shadowed-variable
// tslint:disable:max-line-length
// tslint:disable:jsdoc-format
// tslint:disable:forin

import { errorID, warnID } from '../platform/debug';
import * as js from '../utils/js';
import { getSuper } from '../utils/js';
import { cloneable_DEV, isPlainEmptyObj_DEV } from '../utils/misc';
import { BitMask } from '../value-types';
import { Enum } from '../value-types/enum';
import * as attributeUtils from './utils/attribute';
import { IAcceptableAttributes } from './utils/attribute-defines';
import { preprocessAttrs, validateMethodWithProps } from './utils/preprocess-class';
import * as RF from './utils/requiring-frame';

const DELIMETER = attributeUtils.DELIMETER;

const BUILTIN_ENTRIES = ['name', 'extends', 'mixins', 'ctor', '__ctor__', 'properties', 'statics', 'editor', '__ES6__'];
const INVALID_STATICS_DEV = ['name', '__ctors__', '__props__', 'arguments', 'call', 'apply', 'caller', 'length', 'prototype'];

function pushUnique (array, item) {
    if (array.indexOf(item) < 0) {
        array.push(item);
    }
}

const deferredInitializer: any = {

    // Configs for classes which needs deferred initialization
    datas: null,

    // register new class
    // data - {cls: cls, cb: properties, mixins: options.mixins}
    push (data) {
        if (this.datas) {
            this.datas.push(data);
        }
        else {
            this.datas = [data];
            // start a new timer to initialize
            const self = this;
            setTimeout(function () {
                self.init();
            }, 0);
        }
    },

    init () {
        const datas = this.datas;
        if (datas) {
            for (let i = 0; i < datas.length; ++i) {
                const data = datas[i];
                const cls = data.cls;
                let properties = data.props;
                if (typeof properties === 'function') {
                    properties = properties();
                }
                const name = js.getClassName(cls);
                if (properties) {
                    declareProperties(cls, name, properties, cls.$super, data.mixins);
                }
                else {
                    errorID(3633, name);
                }
            }
            this.datas = null;
        }
    },
};

// both getter and prop must register the name into __props__ array
function appendProp (cls, name) {
    if (CC_DEV) {
        // if (!IDENTIFIER_RE.test(name)) {
        //    cc.error('The property name "' + name + '" is not compliant with JavaScript naming standards');
        //    return;
        // }
        if (name.indexOf('.') !== -1) {
            errorID(3634);
            return;
        }
    }
    pushUnique(cls.__props__, name);
}

const tmpArray = [];
function defineProp (cls, className, propName, val, es6) {
    const defaultValue = val.default;

    if (CC_DEV) {
        if (!es6) {
            // check default object value
            if (typeof defaultValue === 'object' && defaultValue) {
                if (Array.isArray(defaultValue)) {
                    // check array empty
                    if (defaultValue.length > 0) {
                        errorID(3635, className, propName, propName);
                        return;
                    }
                }
                else if (!isPlainEmptyObj_DEV(defaultValue)) {
                    // check cloneable
                    if (!cloneable_DEV(defaultValue)) {
                        errorID(3636, className, propName, propName);
                        return;
                    }
                }
            }
        }

        // check base prototype to avoid name collision
        if (CCClass.getInheritanceChain(cls)
            .some(function (x) { return x.prototype.hasOwnProperty(propName); })) {
            errorID(3637, className, propName, className);
            return;
        }
    }

    // set default value
    attributeUtils.setClassAttr(cls, propName, 'default', defaultValue);

    appendProp(cls, propName);

    // apply attributes
    const attrs = parseAttributes(cls, val, className, propName, false);
    if (attrs) {
        const onAfterProp: any[] = tmpArray;
        for (let i = 0; i < attrs.length; i++) {
            const attr: any = attrs[i];
            attributeUtils.attr(cls, propName, attr);
            if (attr.serializable === false) {
                pushUnique(cls.__values__, propName);
            }
            // register callback
            if (attr._onAfterProp) {
                onAfterProp.push(attr._onAfterProp);
            }
        }
        // call callback
        for (let c = 0; c < onAfterProp.length; c++) {
            onAfterProp[c](cls, propName);
        }
        tmpArray.length = 0;
        attrs.length = 0;
    }
}

function defineGetSet (cls, name, propName, val, es6) {
    const getter = val.get;
    const setter = val.set;
    const proto = cls.prototype;
    const d = Object.getOwnPropertyDescriptor(proto, propName);
    const setterUndefined = !d;

    if (getter) {
        if (CC_DEV && !es6 && d && d.get) {
            errorID(3638, name, propName);
            return;
        }

        const attrs = parseAttributes(cls, val, name, propName, true);
        for (let i = 0; i < attrs.length; i++) {
            attributeUtils.attr(cls, propName, attrs[i]);
        }
        attrs.length = 0;

        attributeUtils.setClassAttr(cls, propName, 'serializable', false);

        if (CC_DEV) {
            // 不论是否 visible 都要添加到 props，否则 asset watcher 不能正常工作
            appendProp(cls, propName);
        }

        if (!es6) {
            js.get(proto, propName, getter, setterUndefined, setterUndefined);
        }

        if (CC_EDITOR || CC_DEV) {
            attributeUtils.setClassAttr(cls, propName, 'hasGetter', true); // 方便 editor 做判断
        }
    }

    if (setter) {
        if (!es6) {
            if (CC_DEV && d && d.set) {
                return errorID(3640, name, propName);
            }
            js.set(proto, propName, setter, setterUndefined, setterUndefined);
        }
        if (CC_EDITOR || CC_DEV) {
            attributeUtils.setClassAttr(cls, propName, 'hasSetter', true); // 方便 editor 做判断
        }
    }
}

function getDefault (defaultVal) {
    if (typeof defaultVal === 'function') {
        if (CC_EDITOR) {
            try {
                return defaultVal();
            }
            catch (e) {
                cc._throw(e);
                return undefined;
            }
        }
        else {
            return defaultVal();
        }
    }
    return defaultVal;
}

function mixinWithInherited (dest, src, filter?) {
    for (const prop in src) {
        if (!dest.hasOwnProperty(prop) && (!filter || filter(prop))) {
            Object.defineProperty(dest, prop, js.getPropertyDescriptor(src, prop)!);
        }
    }
}

function doDefine (className, baseClass, mixins, options) {
    let shouldAddProtoCtor;
    const __ctor__ = options.__ctor__;
    let ctor = options.ctor;
    const __es6__ = options.__ES6__;

    if (CC_DEV) {
        // check ctor
        const ctorToUse = __ctor__ || ctor;
        if (ctorToUse) {
            if (CCClass._isCCClass(ctorToUse)) {
                errorID(3618, className);
            }
            else if (typeof ctorToUse !== 'function') {
                errorID(3619, className);
            }
            else {
                if (baseClass && /\bprototype.ctor\b/.test(ctorToUse)) {
                    if (__es6__) {
                        errorID(3651, className || '');
                    }
                    else {
                        warnID(3600, className || '');
                        shouldAddProtoCtor = true;
                    }
                }
            }
            if (ctor) {
                if (__ctor__) {
                    errorID(3649, className);
                }
                else {
                    ctor = options.ctor = _validateCtor_DEV(ctor, baseClass, className, options);
                }
            }
        }
    }

    let ctors;
    let fireClass;
    if (__es6__) {
        ctors = [ctor];
        fireClass = ctor;
    }
    else {
        ctors = __ctor__ ? [__ctor__] : _getAllCtors(baseClass, mixins, options);
        fireClass = _createCtor(ctors, baseClass, className, options);

        // extend - Create a new Class that inherits from this Class
        js.value(fireClass, 'extend', function (this: any, options) {
            options.extends = this;
            return CCClass(options);
        }, true);
    }

    js.value(fireClass, '__ctors__', ctors.length > 0 ? ctors : null, true);

    let prototype = fireClass.prototype;
    if (baseClass) {
        if (!__es6__) {
            js.extend(fireClass, baseClass);        // 这里会把父类的 __props__ 复制给子类
            prototype = fireClass.prototype;        // get extended prototype
        }
        fireClass.$super = baseClass;
        if (CC_DEV && shouldAddProtoCtor) {
            prototype.ctor = function () { };
        }
    }

    if (mixins) {
        for (let m = mixins.length - 1; m >= 0; m--) {
            const mixin = mixins[m];
            mixinWithInherited(prototype, mixin.prototype);

            // mixin statics (this will also copy editor attributes for component)
            mixinWithInherited(fireClass, mixin, function (prop) {
                return mixin.hasOwnProperty(prop) && (!CC_DEV || INVALID_STATICS_DEV.indexOf(prop) < 0);
            });

            // mixin attributes
            if (CCClass._isCCClass(mixin)) {
                mixinWithInherited(
                    attributeUtils.getClassAttrs(fireClass).constructor.prototype,
                    attributeUtils.getClassAttrs(mixin).constructor.prototype,
                );
            }
        }
        // restore constuctor overridden by mixin
        prototype.constructor = fireClass;
    }

    if (!__es6__) {
        prototype.__initProps__ = compileProps;
    }

    js.setClassName(className, fireClass);
    return fireClass;
}

function define (className, baseClass, mixins, options) {
    const Component = cc.Component;
    const frame = RF.peek();

    // @ts-ignore
    if (CC_EDITOR && frame) {
        // @ts-ignore
        EditorExtends.Script.add(frame.uuid, options.ctor);
    }

    if (frame && js.isChildClassOf(baseClass, Component)) {
        // project component
        if (js.isChildClassOf(frame.cls, Component)) {
            errorID(3615);
            return null;
        }
        if (CC_DEV && frame.uuid && className) {
            // warnID(3616, className);
        }
        className = className || frame.script;
    }

    const cls = doDefine(className, baseClass, mixins, options);

    // for RenderPipeline, RenderFlow, RenderStage
    const isRenderPipeline = js.isChildClassOf(baseClass, cc.RenderPipeline);
    const isRenderFlow = js.isChildClassOf(baseClass, cc.RenderFlow);
    const isRenderStage = js.isChildClassOf(baseClass, cc.RenderStage);

    const isRender = isRenderPipeline || isRenderFlow || isRenderStage || false;

    if (isRender) {
        let renderName = '';
        if (isRenderPipeline) {
            renderName = 'render_pipeline';
        } else if (isRenderFlow) {
            renderName = 'render_flow';
        } else if (isRenderStage) {
            renderName = 'render_stage';
        }

        if (renderName) {
            js._setClassId(className, cls);
            if (CC_EDITOR) {
                // 增加了 hidden: 开头标识，使它最终不会显示在 Editor inspector 的添加组件列表里
                // @ts-ignore
                // tslint:disable-next-line:no-unused-expression
                window.EditorExtends && window.EditorExtends.Component.addMenu(cls, `hidden:${renderName}/${className}`, -1);
            }
        }
    }

    if (frame) {
        // 基础的 ts, js 脚本组件
        if (js.isChildClassOf(baseClass, Component)) {
            const uuid = frame.uuid;
            if (uuid) {
                js._setClassId(uuid, cls);
                if (CC_EDITOR) {
                    // @ts-ignore
                    // tslint:disable-next-line:no-unused-expression
                    EditorExtends.Component.addMenu(cls, 'i18n:menu.custom_script/' + className, -1);
                    cls.prototype.__scriptUuid = Editor.Utils.UuidUtils.decompressUuid(uuid);
                }
            }
            frame.cls = cls;
        }
        else if (!js.isChildClassOf(frame.cls, Component)) {
            frame.cls = cls;
        }
    }
    return cls;
}

function normalizeClassName_DEV (className) {
    const DefaultName = 'CCClass';
    if (className) {
        className = className.replace(/^[^$A-Za-z_]/, '_').replace(/[^0-9A-Za-z_$]/g, '_');
        try {
            // validate name
            Function('function ' + className + '(){}')();
            return className;
        }
        catch (e) {

        }
    }
    return DefaultName;
}

function getNewValueTypeCodeJit (value) {
    const clsName = js.getClassName(value);
    const type = value.constructor;
    let res = 'new ' + clsName + '(';
    for (let i = 0; i < type.__props__.length; i++) {
        const prop = type.__props__[i];
        const propVal = value[prop];
        if (CC_DEV && typeof propVal === 'object') {
            errorID(3641, clsName);
            return 'new ' + clsName + '()';
        }
        res += propVal;
        if (i < type.__props__.length - 1) {
            res += ',';
        }
    }
    return res + ')';
}

// TODO - move escapeForJS, IDENTIFIER_RE, getNewValueTypeCodeJit to misc.js or a new source file

// convert a normal string including newlines, quotes and unicode characters into a string literal
// ready to use in JavaScript source
function escapeForJS (s) {
    return JSON.stringify(s).
        // see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
        replace(/\u2028/g, '\\u2028').
        replace(/\u2029/g, '\\u2029');
}

function getInitPropsJit (attrs, propList) {
    // functions for generated code
    const F: any[] = [];
    let func = '';

    for (let i = 0; i < propList.length; i++) {
        const prop = propList[i];
        const attrKey = prop + DELIMETER + 'default';
        if (attrKey in attrs) {  // getter does not have default
            let statement;
            if (IDENTIFIER_RE.test(prop)) {
                statement = 'this.' + prop + '=';
            }
            else {
                statement = 'this[' + escapeForJS(prop) + ']=';
            }
            let expression;
            const def = attrs[attrKey];
            if (typeof def === 'object' && def) {
                if (def instanceof cc.ValueType) {
                    expression = getNewValueTypeCodeJit(def);
                }
                else if (Array.isArray(def)) {
                    expression = '[]';
                }
                else {
                    expression = '{}';
                }
            }
            else if (typeof def === 'function') {
                const index = F.length;
                F.push(def);
                expression = 'F[' + index + ']()';
                if (CC_EDITOR) {
                    func += 'try {\n' + statement + expression + ';\n}\ncatch(e) {\ncc._throw(e);\n' + statement + 'undefined;\n}\n';
                    continue;
                }
            }
            else if (typeof def === 'string') {
                expression = escapeForJS(def);
            }
            else {
                // number, boolean, null, undefined
                expression = def;
            }
            statement = statement + expression + ';\n';
            func += statement;
        }
    }

    // if (CC_TEST && !isPhantomJS) {
    //     console.log(func);
    // }

    let initProps;
    if (F.length === 0) {
        initProps = Function(func);
    }
    else {
        initProps = Function('F', 'return (function(){\n' + func + '})')(F);
    }

    return initProps;
}

function getInitProps (attrs, propList) {
    const advancedProps: any[] = [];
    const advancedValues: any[] = [];
    const simpleProps: any[] = [];
    const simpleValues: any[] = [];

    for (let i = 0; i < propList.length; ++i) {
        const prop = propList[i];
        const attrKey = prop + DELIMETER + 'default';
        if (attrKey in attrs) { // getter does not have default
            const def = attrs[attrKey];
            if ((typeof def === 'object' && def) || typeof def === 'function') {
                advancedProps.push(prop);
                advancedValues.push(def);
            }
            else {
                // number, boolean, null, undefined, string
                simpleProps.push(prop);
                simpleValues.push(def);
            }
        }
    }

    return function (this: any) {
        for (let i = 0; i < simpleProps.length; ++i) {
            this[simpleProps[i]] = simpleValues[i];
        }
        for (let i = 0; i < advancedProps.length; i++) {
            const prop = advancedProps[i];
            let expression;
            const def = advancedValues[i];
            if (typeof def === 'object') {
                if (def instanceof cc.ValueType) {
                    expression = def.clone();
                }
                else if (Array.isArray(def)) {
                    expression = [];
                }
                else {
                    expression = {};
                }
            }
            else {
                // def is function
                if (CC_EDITOR) {
                    try {
                        expression = def();
                    }
                    catch (err) {
                        cc._throw(err);
                        continue;
                    }
                }
                else {
                    expression = def();
                }
            }
            this[prop] = expression;
        }
    };
}

// simple test variable name
const IDENTIFIER_RE = /^[A-Za-z_$][0-9A-Za-z_$]*$/;

function compileProps (this: any, actualClass) {
    // init deferred properties
    const attrs = attributeUtils.getClassAttrs(actualClass);
    let propList = actualClass.__props__;
    if (propList === null) {
        deferredInitializer.init();
        propList = actualClass.__props__;
    }

    // Overwite __initProps__ to avoid compile again.
    const initProps = CC_SUPPORT_JIT ? getInitPropsJit(attrs, propList) : getInitProps(attrs, propList);
    actualClass.prototype.__initProps__ = initProps;

    // call instantiateProps immediately, no need to pass actualClass into it anymore
    // (use call to manually bind `this` because `this` may not instanceof actualClass)
    initProps.call(this);
}

const _createCtor = CC_SUPPORT_JIT ? function (ctors, baseClass, className, options) {
    const superCallBounded = baseClass && boundSuperCalls(baseClass, options, className);

    const ctorName = CC_DEV ? normalizeClassName_DEV(className) : 'CCClass';
    let body = 'return function ' + ctorName + '(){\n';

    if (superCallBounded) {
        body += 'this._super=null;\n';
    }

    // instantiate props
    body += 'this.__initProps__(' + ctorName + ');\n';

    // call user constructors
    const ctorLen = ctors.length;
    if (ctorLen > 0) {
        const useTryCatch = CC_DEV && !(className && className.startsWith('cc.'));
        if (useTryCatch) {
            body += 'try{\n';
        }
        const SNIPPET = '].apply(this,arguments);\n';
        if (ctorLen === 1) {
            body += ctorName + '.__ctors__[0' + SNIPPET;
        }
        else {
            body += 'var cs=' + ctorName + '.__ctors__;\n';
            for (let i = 0; i < ctorLen; i++) {
                body += 'cs[' + i + SNIPPET;
            }
        }
        if (useTryCatch) {
            body += '}catch(e){\n' +
                'cc._throw(e);\n' +
                '}\n';
        }
    }
    body += '}';

    return Function(body)();
} : function (ctors, baseClass, className, options) {
    const superCallBounded = baseClass && boundSuperCalls(baseClass, options, className);
    const ctorLen = ctors.length;

    let Class;

    if (ctorLen > 0) {
        if (superCallBounded) {
            if (ctorLen === 2) {
                // User Component
                Class = function (this: any) {
                    this._super = null;
                    this.__initProps__(Class);
                    ctors[0].apply(this, arguments);
                    ctors[1].apply(this, arguments);
                };
            }
            else {
                Class = function (this: any) {
                    this._super = null;
                    this.__initProps__(Class);
                    for (let i = 0; i < ctors.length; ++i) {
                        ctors[i].apply(this, arguments);
                    }
                };
            }
        }
        else {
            if (ctorLen === 3) {
                // Node
                Class = function (this: any) {
                    this.__initProps__(Class);
                    ctors[0].apply(this, arguments);
                    ctors[1].apply(this, arguments);
                    ctors[2].apply(this, arguments);
                };
            }
            else {
                Class = function (this: any) {
                    this.__initProps__(Class);
                    const ctors = Class.__ctors__;
                    for (let i = 0; i < ctors.length; ++i) {
                        ctors[i].apply(this, arguments);
                    }
                };
            }
        }
    }
    else {
        Class = function (this: any) {
            if (superCallBounded) {
                this._super = null;
            }
            this.__initProps__(Class);
        };
    }
    return Class;
};

function _validateCtor_DEV (ctor, baseClass, className, options) {
    if (CC_EDITOR && baseClass) {
        // check super call in constructor
        const originCtor = ctor;
        if (SuperCallReg.test(ctor)) {
            if (options.__ES6__) {
                errorID(3651, className);
            }
            else {
                warnID(3600, className);
                // suppresss super call
                ctor = function (this: any) {
                    this._super = function () { };
                    const ret = originCtor.apply(this, arguments);
                    this._super = null;
                    return ret;
                };
            }
        }
    }

    // check ctor
    if (ctor.length > 0 && (!className || !className.startsWith('cc.'))) {
        // To make a unified CCClass serialization process,
        // we don't allow parameters for constructor when creating instances of CCClass.
        // For advanced user, construct arguments can still get from 'arguments'.
        warnID(3617, className);
    }

    return ctor;
}

function _getAllCtors (baseClass, mixins, options) {
    // get base user constructors
    function getCtors (cls) {
        if (CCClass._isCCClass(cls)) {
            return cls.__ctors__ || [];
        }
        else {
            return [cls];
        }
    }

    const ctors: any[] = [];
    // if (options.__ES6__) {
    //     if (mixins) {
    //         let baseOrMixins = getCtors(baseClass);
    //         for (let b = 0; b < mixins.length; b++) {
    //             let mixin = mixins[b];
    //             if (mixin) {
    //                 let baseCtors = getCtors(mixin);
    //                 for (let c = 0; c < baseCtors.length; c++) {
    //                     if (baseOrMixins.indexOf(baseCtors[c]) < 0) {
    //                         pushUnique(ctors, baseCtors[c]);
    //                     }
    //                 }
    //             }
    //         }
    //     }
    // }
    // else {
    const baseOrMixins = [baseClass].concat(mixins);
    for (let b = 0; b < baseOrMixins.length; b++) {
        const baseOrMixin = baseOrMixins[b];
        if (baseOrMixin) {
            const baseCtors = getCtors(baseOrMixin);
            for (let c = 0; c < baseCtors.length; c++) {
                pushUnique(ctors, baseCtors[c]);
            }
        }
    }
    // }

    // append subclass user constructors
    const ctor = options.ctor;
    if (ctor) {
        ctors.push(ctor);
    }

    return ctors;
}

const superCllRegCondition = /xyz/.test(function () { const xyz = 0; }.toString());
const SuperCallReg = superCllRegCondition ? /\b\._super\b/ : /.*/;
const SuperCallRegStrict = superCllRegCondition ? /this\._super\s*\(/ : /(NONE){99}/;
function boundSuperCalls (baseClass, options, className) {
    let hasSuperCall = false;
    for (const funcName in options) {
        if (BUILTIN_ENTRIES.indexOf(funcName) >= 0) {
            continue;
        }
        const func = options[funcName];
        if (typeof func !== 'function') {
            continue;
        }
        const pd = js.getPropertyDescriptor(baseClass.prototype, funcName);
        if (pd) {
            const superFunc = pd.value;
            // ignore pd.get, assume that function defined by getter is just for warnings
            if (typeof superFunc === 'function') {
                if (SuperCallReg.test(func)) {
                    hasSuperCall = true;
                    // boundSuperCall
                    options[funcName] = (function (superFunc, func) {
                        return function (this: any) {
                            const tmp = this._super;

                            // Add a new ._super() method that is the same method but on the super-Class
                            this._super = superFunc;

                            const ret = func.apply(this, arguments);

                            // The method only need to be bound temporarily, so we remove it when we're done executing
                            this._super = tmp;

                            return ret;
                        };
                    })(superFunc, func);
                }
                continue;
            }
        }
        if (CC_DEV && SuperCallRegStrict.test(func)) {
            warnID(3620, className, funcName);
        }
    }
    return hasSuperCall;
}

function declareProperties (cls, className, properties, baseClass, mixins, es6?: boolean) {
    cls.__props__ = [];

    if (baseClass && baseClass.__props__) {
        cls.__props__ = baseClass.__props__.slice();
    }

    if (mixins) {
        for (let m = 0; m < mixins.length; ++m) {
            const mixin = mixins[m];
            if (mixin.__props__) {
                cls.__props__ = cls.__props__.concat(mixin.__props__.filter(function (x) {
                    return cls.__props__.indexOf(x) < 0;
                }));
            }
        }
    }

    if (properties) {
        // 预处理属性
        preprocessAttrs(properties, className, cls, es6);

        for (const propName in properties) {
            const val = properties[propName];
            if ('default' in val) {
                defineProp(cls, className, propName, val, es6);
            }
            else {
                defineGetSet(cls, className, propName, val, es6);
            }
        }
    }

    const attrs = attributeUtils.getClassAttrs(cls);
    cls.__values__ = cls.__props__.filter(function (prop) {
        return attrs[prop + DELIMETER + 'serializable'] !== false;
    });
}

/**
 * @en Defines a CCClass using the given specification
 * @zh 定义一个 CCClass，传入参数必须是一个包含类型参数的字面量对象
 *
 * @method Class
 *
 * @param {Object} [options]
 * @param {String} [options.name] - The class name used for serialization.
 * @param {Function} [options.extends] - The base class.
 * @param {Function} [options.ctor] - The constructor.
 * @param {Function} [options.__ctor__] - The same as ctor, but less encapsulated.
 * @param {Object} [options.properties] - The property definitions.
 * @param {Object} [options.statics] - The static members.
 * @param {Function[]} [options.mixins]
 *
 * @param {Object} [options.editor] - attributes for Component listed below.
 * @param {Boolean} [options.editor.executeInEditMode=false] - Allows the current component to run in edit mode. By default, all components are executed only at runtime, meaning that they will not have their callback functions executed while the Editor is in edit mode.
 * @param {Function} [options.editor.requireComponent] - Automatically add required component as a dependency.
 * @param {String} [options.editor.menu] - The menu path to register a component to the editors "Component" menu. Eg. "Rendering/Camera".
 * @param {Number} [options.editor.executionOrder=0] - The execution order of lifecycle methods for Component. Those less than 0 will execute before while those greater than 0 will execute after. The order will only affect onLoad, onEnable, start, update and lateUpdate while onDisable and onDestroy will not be affected.
 * @param {Boolean} [options.editor.disallowMultiple] - If specified to a type, prevents Component of the same type (or subtype) to be added more than once to a Node.
 * @param {Boolean} [options.editor.playOnFocus=false] - This property is only available when executeInEditMode is set. If specified, the editor's scene view will keep updating this node in 60 fps when it is selected, otherwise, it will update only if necessary.
 * @param {String} [options.editor.inspector] - Customize the page url used by the current component to render in the Properties.
 * @param {String} [options.editor.icon] - Customize the icon that the current component displays in the editor.
 * @param {String} [options.editor.help] - The custom documentation URL
 *
 * @param {Function} [options.update] - lifecycle method for Component, see {{#crossLink "Component/update:method"}}{{/crossLink}}
 * @param {Function} [options.lateUpdate] - lifecycle method for Component, see {{#crossLink "Component/lateUpdate:method"}}{{/crossLink}}
 * @param {Function} [options.onLoad] - lifecycle method for Component, see {{#crossLink "Component/onLoad:method"}}{{/crossLink}}
 * @param {Function} [options.start] - lifecycle method for Component, see {{#crossLink "Component/start:method"}}{{/crossLink}}
 * @param {Function} [options.onEnable] - lifecycle method for Component, see {{#crossLink "Component/onEnable:method"}}{{/crossLink}}
 * @param {Function} [options.onDisable] - lifecycle method for Component, see {{#crossLink "Component/onDisable:method"}}{{/crossLink}}
 * @param {Function} [options.onDestroy] - lifecycle method for Component, see {{#crossLink "Component/onDestroy:method"}}{{/crossLink}}
 * @param {Function} [options.onFocusInEditor] - lifecycle method for Component, see {{#crossLink "Component/onFocusInEditor:method"}}{{/crossLink}}
 * @param {Function} [options.onLostFocusInEditor] - lifecycle method for Component, see {{#crossLink "Component/onLostFocusInEditor:method"}}{{/crossLink}}
 * @param {Function} [options.resetInEditor] - lifecycle method for Component, see {{#crossLink "Component/resetInEditor:method"}}{{/crossLink}}
 * @param {Function} [options.onRestore] - for Component only, see {{#crossLink "Component/onRestore:method"}}{{/crossLink}}
 * @param {Function} [options._getLocalBounds] - for Component only, see {{#crossLink "Component/_getLocalBounds:method"}}{{/crossLink}}
 *
 * @return {Function} - the created class
 *
 * @example
 * ```typescript
 * // define base class
 * var Node = cc.Class();
 * // define sub class
 * var Sprite = cc.Class({
 *     name: 'Sprite',
 *     extends: Node,
 *
 *     ctor: function () {
 *         this.url = "";
 *         this.id = 0;
 *     },
 *
 *     statics: {
 *         // define static members
 *         count: 0,
 *         getBounds: function (spriteList) {
 *             // compute bounds...
 *         }
 *     },
 *
 *     properties {
 *         width: {
 *             default: 128,
 *             type: 'Integer',
 *             tooltip: 'The width of sprite'
 *         },
 *         height: 128,
 *         size: {
 *             get: function () {
 *                 return cc.v2(this.width, this.height);
 *             }
 *         }
 *     },
 *
 *     load: function () {
 *         // load this.url...
 *     };
 * });
 *
 * // instantiate
 *
 * var obj = new Sprite();
 * obj.url = 'sprite.png';
 * obj.load();
 * ```
 */
function CCClass (options) {
    options = options || {};

    let name = options.name;
    const base = options.extends/* || CCObject*/;
    const mixins = options.mixins;

    // create constructor
    const cls = define(name, base, mixins, options);
    if (!name) {
        name = cc.js.getClassName(cls);
    }

    cls._sealed = true;
    if (base) {
        base._sealed = false;
    }

    // define Properties
    const properties = options.properties;
    if (typeof properties === 'function' ||
        (base && base.__props__ === null) ||
        (mixins && mixins.some(function (x) {
            return x.__props__ === null;
        }))
    ) {
        if (CC_DEV && options.__ES6__) {
            cc.error('not yet implement deferred properties for ES6 Classes');
        }
        else {
            deferredInitializer.push({ cls, props: properties, mixins });
            cls.__props__ = cls.__values__ = null;
        }
    }
    else {
        declareProperties(cls, name, properties, base, options.mixins, options.__ES6__);
    }

    // define statics
    const statics = options.statics;
    if (statics) {
        let staticPropName;
        if (CC_DEV) {
            for (staticPropName in statics) {
                if (INVALID_STATICS_DEV.indexOf(staticPropName) !== -1) {
                    errorID(3642, name, staticPropName,
                        staticPropName);
                }
            }
        }
        for (staticPropName in statics) {
            cls[staticPropName] = statics[staticPropName];
        }
    }

    // define functions
    for (const funcName in options) {
        if (BUILTIN_ENTRIES.indexOf(funcName) >= 0) {
            continue;
        }
        const func = options[funcName];
        if (!validateMethodWithProps(func, funcName, name, cls, base)) {
            continue;
        }
        // use value to redefine some super method defined as getter
        js.value(cls.prototype, funcName, func, true, true);
    }

    const editor = options.editor;
    if (editor) {
        if (js.isChildClassOf(base, cc.Component)) {
            cc.Component._registerEditorProps(cls, editor);
        }
        else if (CC_DEV) {
            warnID(3623, name);
        }
    }

    return cls;
}

/**
 * @en
 * Checks whether the constructor is created by cc.Class
 * @zh
 * 检查构造函数是否由 cc.Class 创建。
 * @method _isCCClass
 * @param {Function} constructor
 * @return {Boolean}
 * @private
 */
CCClass._isCCClass = function (constructor) {
    return constructor && constructor.hasOwnProperty &&
        constructor.hasOwnProperty('__ctors__');     // is not inherited __ctors__
};

//
// Optimized define function only for internal classes
//
// @method fastDefine
// @param {String} className
// @param {Function} constructor
// @param {Object} serializableFields
// @private
//
CCClass.fastDefine = function (className, constructor, serializableFields) {
    js.setClassName(className, constructor);
    // constructor.__ctors__ = constructor.__ctors__ || null;
    const props = constructor.__props__ = constructor.__values__ = Object.keys(serializableFields);
    const attrProtos = attributeUtils.getClassAttrsProto(constructor);
    for (let i = 0; i < props.length; i++) {
        const key = props[i];
        attrProtos[key + DELIMETER + 'visible'] = false;
        attrProtos[key + DELIMETER + 'default'] = serializableFields[key];
    }
};
CCClass.Attr = attributeUtils;
CCClass.attr = attributeUtils.attr;

/**
 * Return all super classes.
 * @param constructor The Constructor.
 */
function getInheritanceChain (constructor) {
    const chain: any[] = [];
    for (; ;) {
        constructor = getSuper(constructor);
        if (!constructor) {
            break;
        }
        if (constructor !== Object) {
            chain.push(constructor);
        }
    }
    return chain;
}

CCClass.getInheritanceChain = getInheritanceChain;

const PrimitiveTypes = {
    // Specify that the input value must be integer in Properties.
    // Also used to indicates that the type of elements in array or the type of value in dictionary is integer.
    Integer: 'Number',
    // Indicates that the type of elements in array or the type of value in dictionary is double.
    Float: 'Number',
    Boolean: 'Boolean',
    String: 'String',
};

type OnAfterProp = (constructor: Function, mainPropertyName: string) => void;

interface IParsedAttribute {
    type: string;
    _onAfterProp?: OnAfterProp;
    ctor?: Function;
    enumList?: any[];
    bitmaskList?: any[];
}
const tmpAttrs = [];

function parseAttributes (constructor: Function, attributes: IAcceptableAttributes, className: string, propertyName: string, usedInGetter) {
    const ERR_Type = CC_DEV ? 'The %s of %s must be type %s' : '';

    let attrsProto = null;
    let attrsProtoKey = '';
    function getAttrsProto () {
        attrsProtoKey = propertyName + DELIMETER;
        return attrsProto = attributeUtils.getClassAttrsProto(constructor);
    }

    tmpAttrs.length = 0;
    const result: IParsedAttribute[] = tmpAttrs;

    const type = attributes.type;
    if (type) {
        const primitiveType = PrimitiveTypes[type];
        if (primitiveType) {
            result.push({
                type,
                _onAfterProp: (CC_EDITOR || CC_TEST) && !attributes._short ?
                    attributeUtils.getTypeChecker(primitiveType, 'cc.' + type) :
                    undefined,
            });
        } else if (type === 'Object') {
            if (CC_DEV) {
                errorID(3644, className, propertyName);
            }
        }
        // else if (type === Attr.ScriptUuid) {
        //     result.push({
        //         type: 'Script',
        //         ctor: cc.ScriptAsset,
        //     });
        // }
        else if (typeof type === 'object') {
            if (Enum.isEnum(type)) {
                result.push({
                    type: 'Enum',
                    enumList: Enum.getList(type),
                });
            }
            else if (BitMask.isBitMask(type)) {
                result.push({
                    type: 'BitMask',
                    bitmaskList: BitMask.getList(type),
                });
            }
            else if (CC_DEV) {
                errorID(3645, className, propertyName, type);
            }
        } else if (typeof type === 'function') {
            let typeChecker: OnAfterProp | undefined;
            if ((CC_EDITOR || CC_TEST) && !attributes._short) {
                typeChecker = attributes.url ?
                    attributeUtils.getTypeChecker('String', 'cc.String') :
                    attributeUtils.getObjTypeChecker(type);
            }
            result.push({
                type: 'Object',
                ctor: type,
                _onAfterProp: typeChecker,
            });
        } else if (CC_DEV) {
            errorID(3646, className, propertyName, type);
        }
    }

    const parseSimpleAttribute = (attributeName: keyof IAcceptableAttributes, expectType: string) => {
        if (attributeName in attributes) {
            const val = attributes[attributeName];
            if (typeof val === expectType) {
                (attrsProto || getAttrsProto())[attrsProtoKey + attributeName] = val;
            } else if (CC_DEV) {
                cc.error(ERR_Type, attributeName, className, propertyName, expectType);
            }
        }
    };

    if (attributes.editorOnly) {
        if (CC_DEV && usedInGetter) {
            errorID(3613, 'editorOnly', name, propertyName);
        }
        else {
            (attrsProto || getAttrsProto())[attrsProtoKey + 'editorOnly'] = true;
        }
    }
    // parseSimpleAttr('preventDeferredLoad', 'boolean');
    if (CC_DEV) {
        parseSimpleAttribute('displayName', 'string');
        parseSimpleAttribute('displayOrder', 'number');
        parseSimpleAttribute('multiline', 'boolean');
        parseSimpleAttribute('radian', 'boolean');
        if (attributes.readonly) {
            (attrsProto || getAttrsProto())[attrsProtoKey + 'readonly'] = true;
        }
        parseSimpleAttribute('tooltip', 'string');
        parseSimpleAttribute('slide', 'boolean');
        parseSimpleAttribute('unit', 'string');
    }

    if (attributes.url) {
        (attrsProto || getAttrsProto())[attrsProtoKey + 'saveUrlAsAsset'] = true;
    }
    if (attributes.serializable === false) {
        if (CC_DEV && usedInGetter) {
            errorID(3613, 'serializable', name, propertyName);
        }
        else {
            (attrsProto || getAttrsProto())[attrsProtoKey + 'serializable'] = false;
        }
    }
    parseSimpleAttribute('formerlySerializedAs', 'string');

    if (CC_EDITOR) {
        if ('animatable' in attributes && !attributes.animatable) {
            (attrsProto || getAttrsProto())[attrsProtoKey + 'animatable'] = false;
        }
    }

    if (CC_DEV) {
        const visible = attributes.visible;
        if (typeof visible !== 'undefined') {
            if (!visible) {
                (attrsProto || getAttrsProto())[attrsProtoKey + 'visible'] = false;
            }
            else if (typeof visible === 'function') {
                (attrsProto || getAttrsProto())[attrsProtoKey + 'visible'] = visible;
            }
        }
        else {
            const startsWithUS = (propertyName.charCodeAt(0) === 95);
            if (startsWithUS) {
                (attrsProto || getAttrsProto())[attrsProtoKey + 'visible'] = false;
            }
        }
    }

    const range = attributes.range;
    if (range) {
        if (Array.isArray(range)) {
            if (range.length >= 2) {
                (attrsProto || getAttrsProto())[attrsProtoKey + 'min'] = range[0];
                (attrsProto || getAttrsProto())[attrsProtoKey + 'max'] = range[1];
                if (range.length > 2) {
                    (attrsProto || getAttrsProto())[attrsProtoKey + 'step'] = range[2];
                }
            }
            else if (CC_DEV) {
                errorID(3647);
            }
        }
        else if (CC_DEV) {
            cc.error(ERR_Type, 'range', className, propertyName, 'array');
        }
    }
    parseSimpleAttribute('min', 'number');
    parseSimpleAttribute('max', 'number');
    parseSimpleAttribute('step', 'number');

    return result;
}

CCClass.isArray = function (defaultVal) {
    defaultVal = getDefault(defaultVal);
    return Array.isArray(defaultVal);
};

CCClass.getDefault = getDefault;
CCClass.escapeForJS = escapeForJS;
CCClass.IDENTIFIER_RE = IDENTIFIER_RE;
CCClass.getNewValueTypeCode = (CC_SUPPORT_JIT && getNewValueTypeCodeJit) as ((value: any) => string);

export default CCClass;

cc.Class = CCClass;
