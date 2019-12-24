/*
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
 * 材质系统的相关内容
 * @category material
 */

import { ccclass, property } from '../../core/data/class-decorator';
import { murmurhash2_32_gc } from '../../core/utils/murmurhash2_gc';
import { builtinResMgr } from '../3d/builtin/init';
import { RenderableComponent } from '../3d/framework/renderable-component';
import { GFXBindingType } from '../gfx/define';
import { GFXTextureView } from '../gfx/texture-view';
import { IDefineMap } from '../renderer';
import { IPassInfoFull, Pass, PassOverrides } from '../renderer/core/pass';
import { samplerLib } from '../renderer/core/sampler-lib';
import { Asset } from './asset';
import { EffectAsset } from './effect-asset';
import { SpriteFrame } from './sprite-frame';
import { TextureBase } from './texture-base';

/**
 * @zh
 * 用来初始化材质的基本信息结构体。
 */
interface IMaterialInfo {
    /**
     * @zh
     * 这个材质将使用的 EffectAsset，直接提供资源引用，和 effectName 至少要指定一个。
     */
    effectAsset?: EffectAsset | null;
    /**
     * @zh
     * 这个材质将使用的 EffectAsset，通过 effect 名指定，和 effectAsset 至少要指定一个。
     */
    effectName?: string;
    /**
     * @zh
     * 这个材质将使用第几个 technique，默认为 0。
     */
    technique?: number;
    /**
     * @zh
     * 这个材质定义的预处理宏，应与 shader 中的声明对应，默认全为 false。
     */
    defines?: IDefineMap | IDefineMap[];
    /**
     * @zh
     * 这个材质的自定义管线状态，将覆盖 effect 中的属性。<br>
     * 注意在可能的情况下请尽量少的自定义管线状态，以减小对渲染效率的影响。
     */
    states?: PassOverrides | PassOverrides[];
}

/**
 * @zh
 * 材质资源类，负责指定每个模型的材质信息。
 */
@ccclass('cc.Material')
export class Material extends Asset {

    public static getHash (material: Material) {
        let str = '';
        for (const pass of material.passes) {
            str += pass.hash;
        }
        return murmurhash2_32_gc(str, 666);
    }

    @property(EffectAsset)
    protected _effectAsset: EffectAsset | null = null;
    @property
    protected _techIdx = 0;
    @property
    protected _defines: IDefineMap[] = [];
    @property
    protected _states: PassOverrides[] = [];
    @property
    protected _props: Array<Record<string, any>> = [];

    protected _passes: Pass[] = [];
    protected _hash = 0;

    /**
     * @zh
     * 当前使用的 EffectAsset 资源。
     */
    get effectAsset () {
        return this._effectAsset;
    }

    /**
     * @zh
     * 当前使用的 EffectAsset 资源名。
     */
    get effectName () {
        return this._effectAsset ? this._effectAsset.name : '';
    }

    /**
     * @zh
     * 当前的 technique 索引。
     */
    get technique () {
        return this._techIdx;
    }

    /**
     * @zh
     * 当前正在使用的 pass 数组。
     */
    get passes () {
        return this._passes;
    }

    /**
     * @zh
     * 材质的 hash。
     */
    get hash () {
        return this._hash;
    }

    get parent (): Material | null {
        return null;
    }

    get owner (): RenderableComponent | null {
        return null;
    }

    constructor () {
        super();
        this.loaded = false;
    }

    /**
     * @zh
     * 根据所给信息初始化这个材质，初始化正常结束后材质即可立即用于渲染。
     * @param info 初始化材质需要的基本信息。
     */
    public initialize (info: IMaterialInfo) {
        if (!this._defines) { this._defines = []; }
        if (!this._states) { this._states = []; }
        if (!this._props) { this._props = []; }
        if (info.technique !== undefined) { this._techIdx = info.technique; }
        if (info.effectAsset) { this._effectAsset = info.effectAsset; }
        else if (info.effectName) { this._effectAsset = EffectAsset.get(info.effectName); }
        if (info.defines) { this._prepareInfo(info.defines, this._defines); }
        if (info.states) { this._prepareInfo(info.states, this._states); }
        this._update();
    }
    public reset (info: IMaterialInfo) { // consistency with other assets
        this.initialize(info);
    }

    /**
     * @zh
     * 彻底销毁材质，注意销毁后无法重新初始化。<br>
     * 如需重新初始化材质，不必先调用 destroy。
     */
    public destroy () {
        this._doDestroy();
        return super.destroy();
    }

    /**
     * @zh
     * 使用指定预处理宏重新编译当前 pass（数组）中的 shader。
     * @param overrides 新增的预处理宏列表，会覆盖进当前列表。
     * @param passIdx 要编译的 pass 索引，默认编译所有 pass。
     */
    public recompileShaders (overrides: IDefineMap, passIdx?: number) {
        console.warn('Shaders in material asset \'' + this.name + '\' cannot be modified at runtime, please instantiate the material first.');
    }

    /**
     * @zh
     * 使用指定管线状态重载当前的 pass（数组）。
     * @param overrides 新增的管线状态列表，会覆盖进当前列表。
     * @param passIdx 要重载的 pass 索引，默认重载所有 pass。
     */
    public overridePipelineStates (overrides: PassOverrides, passIdx?: number) {
        console.warn('Pipeline states in material asset \'' + this.name + '\' cannot be modified at runtime, please instantiate the material first.');
    }

    /**
     * @zh
     * 通过 Loader 加载完成时的回调，将自动初始化材质资源。
     */
    public onLoaded () {
        this._update();
        this.loaded = true;
        this.emit('load');
    }

    /**
     * @zh
     * 重置材质的所有 uniform 参数数据为 effect 默认初始值。
     * @param clearPasses 是否同时重置当前正在用于渲染的 pass 数组内的信息
     */
    public resetUniforms (clearPasses = true) {
        this._props.length = this._passes.length;
        for (let i = 0; i < this._props.length; i++) { this._props[i] = {}; }
        if (!clearPasses) { return; }
        for (const pass of this._passes) {
            pass.resetUBOs();
            pass.resetTextures();
        }
    }

    /**
     * @en
     * Convenient property setter provided for quick material setup.<br>
     * [[Pass.setUniform]] should be used instead<br>
     * if you need to do per-frame property update.
     * @zh
     * 设置材质 uniform 参数的统一入口。<br>
     * 注意如果需要每帧更新 uniform，建议使用 [[Pass.setUniform]] 以获得更好的性能。
     * @param name 要设置的 uniform 名字。
     * @param val 要设置的 uniform 值。
     * @param passIdx 要设置的 pass 索引，默认设置所有 pass。
     */
    public setProperty (name: string, val: any, passIdx?: number) {
        let success = false;
        if (passIdx === undefined) { // try set property for all applicable passes
            const passes = this._passes;
            const len = passes.length;
            for (let i = 0; i < len; i++) {
                const pass = passes[i];
                if (this._uploadProperty(pass, name, val)) {
                    this._props[i][name] = val;
                    success = true;
                }
            }
        } else {
            if (passIdx >= this._passes.length) { console.warn(`illegal pass index: ${passIdx}.`); return; }
            const pass = this._passes[passIdx];
            if (this._uploadProperty(pass, name, val)) {
                this._props[passIdx][name] = val;
                success = true;
            }
        }
        if (!success) {
            console.warn(`illegal property name: ${name}.`);
            return;
        }
    }

    /**
     * @zh
     * 获取当前材质的指定 uniform 值。
     * @param name 要获取的 uniform 名字。
     * @param passIdx 要获取的源 pass 索引，默认遍历所有 pass，返回第一个找到指定名字的 uniform。
     */
    public getProperty (name: string, passIdx?: number) {
        if (passIdx === undefined) { // try get property in all possible passes
            const propsArray = this._props;
            const len = propsArray.length;
            for (let i = 0; i < len; i++) {
                const props = propsArray[i];
                for (const p in props) {
                    if (p === name) { return props[p]; }
                }
            }
        } else {
            if (passIdx >= this._props.length) { console.warn(`illegal pass index: ${passIdx}.`); return null; }
            const props = this._props[passIdx];
            for (const p in props) {
                if (p === name) { return props[p]; }
            }
        }
        return null;
    }

    /**
     * @zh
     * 复制目标材质到当前实例。
     * @param mat 要负责的目标材质。
     */
    public copy (mat: Material) {
        this._techIdx = mat._techIdx;
        this._props.length = mat._props.length;
        for (let i = 0; i < mat._props.length; i++) {
            this._props[i] = Object.assign({}, mat._props[i]);
        }
        this._defines.length = mat._defines.length;
        for (let i = 0; i < mat._defines.length; i++) {
            this._defines[i] = Object.assign({}, mat._defines[i]);
        }
        this._states.length = mat._states.length;
        for (let i = 0; i < mat._states.length; i++) {
            this._states[i] = Object.assign({}, mat._states[i]);
        }
        this._effectAsset = mat._effectAsset;
        this._update();
    }

    protected _prepareInfo (patch: object | object[], cur: object[]) {
        if (!Array.isArray(patch)) { // fill all the passes if not specified
            const len = this._effectAsset ? this._effectAsset.techniques[this._techIdx].passes.length : 1;
            patch = Array(len).fill(patch);
        }
        for (let i = 0; i < (patch as object[]).length; ++i) {
            Object.assign(cur[i] || (cur[i] = {}), patch[i]);
        }
    }

    protected _createPasses () {
        const tech = this._effectAsset!.techniques[this._techIdx || 0];
        if (!tech) { return []; }
        const passNum = tech.passes.length;
        const passes: Pass[] = [];
        for (let k = 0; k < passNum; ++k) {
            const passInfo = tech.passes[k] as IPassInfoFull;
            const defs = passInfo.defines = this._defines.length > k ? this._defines[k] : {};
            if (passInfo.switch && !defs[passInfo.switch]) { continue; }
            passInfo.stateOverrides = this._states.length > k ? this._states[k] : {};
            passInfo.idxInTech = k;
            const pass = new Pass(cc.director.root.device);
            pass.initialize(passInfo);
            passes.push(pass);
        }
        return passes;
    }

    protected _update (keepProps: boolean = true) {
        if (this._effectAsset) {
            if (this._passes && this._passes.length) {
                for (const pass of this._passes) {
                    pass.destroy();
                }
            }
            this._passes = this._createPasses();
            // handle property values
            const totalPasses = this._effectAsset.techniques[this._techIdx].passes.length;
            this._props.length = totalPasses;
            if (keepProps) {
                this._passes.forEach((pass, i) => {
                    let props = this._props[pass.idxInTech];
                    if (!props) { props = this._props[i] = {}; }
                    for (const p in props) {
                        this._uploadProperty(pass, p, props[p]);
                    }
                });
            } else {
                for (let i = 0; i < this._props.length; i++) { this._props[i] = {}; }
            }
        } else { // ugly yellow indicating missing effect
            const missing = builtinResMgr.get<Material>('missing-effect-material');
            if (missing) { this._passes = missing._passes.slice(); }
        }
        this._hash = Material.getHash(this);
    }

    protected _uploadProperty (pass: Pass, name: string, val: any) {
        const handle = pass.getHandle(name);
        if (handle === undefined) { return false; }
        const bindingType = Pass.getBindingTypeFromHandle(handle);
        if (bindingType === GFXBindingType.UNIFORM_BUFFER) {
            if (Array.isArray(val)) {
                pass.setUniformArray(handle, val);
            } else {
                pass.setUniform(handle, val);
            }
        } else if (bindingType === GFXBindingType.SAMPLER) {
            const binding = Pass.getBindingFromHandle(handle);
            if (val instanceof GFXTextureView) {
                pass.bindTextureView(binding, val);
            } else if (val instanceof TextureBase || val instanceof SpriteFrame) {
                const textureView: GFXTextureView | null = val.getGFXTextureView();
                if (!textureView || !textureView.texture.width || !textureView.texture.height) {
                    // console.warn(`material '${this._uuid}' received incomplete texture asset '${val._uuid}'`);
                    return false;
                }
                pass.bindTextureView(binding, textureView);
                if (val instanceof TextureBase) {
                    pass.bindSampler(binding, samplerLib.getSampler(cc.director.root.device, val.getSamplerHash()));
                }
            }
        }
        return true;
    }

    protected _doDestroy () {
        if (this._passes && this._passes.length) {
            for (const pass of this._passes) {
                pass.destroy();
            }
        }
        this._effectAsset = null;
        this._passes.length = 0;
        this._props.length = 0;
        this._defines.length = 0;
        this._states.length = 0;
    }
}

cc.Material = Material;
