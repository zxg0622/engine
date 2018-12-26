import { GFXDevice } from './gfx-device';
import { GFXBuffer } from './gfx-buffer';
import { GFXTextureView } from './gfx-texture-view';
import { GFXSampler } from './gfx-sampler';

export const enum GFXBindingType {
    UNKNOWN,
    UNIFORM_BUFFER,
    SAMPLER,
    STORAGE_BUFFER,
};

export class GFXBinding {
    binding : number = 0;
    type : GFXBindingType = GFXBindingType.UNKNOWN;
    name : string = "";
};

export class GFXBindingSetLayoutInfo {
    bindings : GFXBinding[] = [];
};

export class GFXBindingUnit {
    binding : number = 0;
    type : GFXBindingType = GFXBindingType.UNKNOWN;
    name : string = "";
    buffer : GFXBuffer | null = null;
    texView : GFXTextureView | null = null;
    sampler : GFXSampler | null = null;
};

export abstract class GFXBindingSetLayout {

    constructor(device : GFXDevice) {
        this._device = device;
    }

    public abstract initialize(info : GFXBindingSetLayoutInfo) : boolean;
    public abstract destroy() : void;

    public bindBuffer(binding: number, buffer: GFXBuffer) {
        for (let i = 0; i < this._bindingUnits.length; ++i) {
            let bindingUnit = this._bindingUnits[i];
            if (bindingUnit.type === GFXBindingType.UNIFORM_BUFFER) {
                bindingUnit.buffer = buffer;
                return;
            } else {
                console.error("Setting binding is not GFXBindingType.UNIFORM_BUFFER.");
            }
        }
    }

    public bindSampler(binding: number, sampler: GFXSampler) {
        for (let i = 0; i < this._bindingUnits.length; ++i) {
            let bindingUnit = this._bindingUnits[i];
            if (bindingUnit.type === GFXBindingType.SAMPLER) {
                bindingUnit.sampler = sampler;
                return;
            } else {
                console.error("Setting binding is not GFXBindingType.SAMPLER.");
            }
        }
    }

    public bindTextureView(binding: number, texView: GFXTextureView) {
        for (let i = 0; i < this._bindingUnits.length; ++i) {
            let bindingUnit = this._bindingUnits[i];
            if (bindingUnit.type === GFXBindingType.SAMPLER) {
                bindingUnit.texView = texView;
                return;
            } else {
                console.error("Setting binding is not GFXBindingType.SAMPLER.");
            }
        }
    }

    protected _device : GFXDevice;
    protected _bindingUnits : GFXBindingUnit[] = [];
};