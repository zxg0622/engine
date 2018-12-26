import { GFXDevice } from './gfx-device';

export const enum GFXQueueType {
    GRAPHICS,
    COMPUTE,
    TRANSFER,
};

export class GFXQueueInfo {
    type : GFXQueueType = GFXQueueType.GRAPHICS;
};

export abstract class GFXQueue {

    constructor(device : GFXDevice) {
        this._device = device;
    }

    public abstract initialize(info : GFXQueueInfo) : boolean;
    public abstract destroy();

    public get type(): number {
        return this._type;
    }

    protected _device : GFXDevice;
    protected _type : GFXQueueType = GFXQueueType.GRAPHICS;
};