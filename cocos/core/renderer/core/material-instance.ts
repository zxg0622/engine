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
 * @category material
 */

import { RenderableComponent } from '../../3d/framework/renderable-component';
import { Material } from '../../assets/material';
import { PassInstance } from './pass-instance';
import { IDefineMap } from './pass-utils';

export interface IMaterialInstanceInfo {
    parent: Material;
    owner: RenderableComponent;
    subModelIdx: number;
}

/**
 * @zh
 * 材质实例，当有材质修改需求时，根据材质资源创建的，可任意定制的实例。
 */
export class MaterialInstance extends Material {

    get parent (): Material | null {
        return this._parent;
    }

    get owner (): RenderableComponent | null {
        return this._owner;
    }

    protected _passes: PassInstance[] = [];

    private _parent: Material;
    private _owner: RenderableComponent;
    private _subModelIdx = 0;

    constructor (info: IMaterialInstanceInfo) {
        super();
        this._parent = info.parent;
        this._owner = info.owner;
        this._subModelIdx = info.subModelIdx;
        this.copy(this._parent);
    }

    public recompileShaders (overrides: IDefineMap, passIdx?: number): void {
        if (!this._passes || !this.effectAsset) { return; }
        if (passIdx === undefined) {
            for (const pass of this._passes) {
                pass.tryCompile(overrides);
            }
        } else {
            this._passes[passIdx].tryCompile(overrides);
        }
    }

    public overridePipelineStates (overrides: any, passIdx?: number): void {
        if (!this._passes || !this.effectAsset) { return; }
        const passInfos = this.effectAsset.techniques[this.technique].passes;
        if (passIdx === undefined) {
            for (let i = 0; i < this._passes.length; i++) {
                const pass = this._passes[i];
                this._states[i] = overrides;
                pass.overridePipelineStates(passInfos[pass.idxInTech], overrides);
            }
        } else {
            this._states[passIdx] = overrides;
            this._passes[passIdx].overridePipelineStates(passInfos[passIdx], overrides);
        }
    }

    public destroy () {
        this._doDestroy();
        return true;
    }

    public onPassStateChange (dontNotify: boolean) {
        this._hash = Material.getHash(this);
        if (!dontNotify) {
            // @ts-ignore
            this.owner._onRebuildPSO(this._subModelIdx, this);
        }
    }

    protected _createPasses () {
        const passes: PassInstance[] = [];
        const parentPasses = this._parent.passes;
        if (!parentPasses) { return passes; }
        for (let k = 0; k < parentPasses.length; ++k) {
            passes.push(new PassInstance(parentPasses[k], this));
        }
        return passes;
    }
}
