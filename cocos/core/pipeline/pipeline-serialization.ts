
import { ccclass, property } from '../data/class-decorator';
import { ccenum } from '../value-types/enum';
import { GFXFormat, GFXLoadOp, GFXStoreOp, GFXTextureLayout, GFXTextureType, GFXTextureUsageBit, GFXTextureViewType} from '../gfx/define';

ccenum(GFXTextureType);
ccenum(GFXTextureViewType);
ccenum(GFXTextureUsageBit);
ccenum(GFXStoreOp);
ccenum(GFXLoadOp);
ccenum(GFXTextureLayout);

@ccclass('RenderTextureDesc')
export class RenderTextureDesc {
    @property
    public name: string = '';
    @property({
        type: GFXTextureType,
    })
    public type: GFXTextureType = GFXTextureType.TEX2D;
    @property({
        type: GFXTextureViewType,
    })
    public viewType: GFXTextureViewType = GFXTextureViewType.TV2D;
    @property({
        type: GFXTextureUsageBit,
    })
    public usage: GFXTextureUsageBit = GFXTextureUsageBit.COLOR_ATTACHMENT;
    @property({
        type: GFXFormat,
    })
    public format: GFXFormat = GFXFormat.UNKNOWN;
    @property
    public width: number = -1;
    @property
    public height: number = -1;
}

@ccclass('FrameBufferDesc')
export class FrameBufferDesc {
    @property
    public name: string = '';
    @property
    public renderPass: number = 0;
    @property({
        type: [String],
    })
    public colorViews = [];
    @property
    public depthStencilView: string = '';
}

@ccclass('ColorDesc')
export class ColorDesc {
    @property({
        type: GFXFormat,
    })
    public format: GFXFormat = GFXFormat.UNKNOWN;
    @property({
        type: GFXLoadOp,
    })
    public loadOp: GFXLoadOp = GFXLoadOp.CLEAR;
    @property({
        type: GFXStoreOp,
    })
    public storeOp: GFXStoreOp = GFXStoreOp.STORE;
    @property
    public sampleCount: number = 1;
    @property({
        type: GFXTextureLayout,
    })
    public beginLayout: GFXTextureLayout = GFXTextureLayout.COLOR_ATTACHMENT_OPTIMAL;
    @property({
        type: GFXTextureLayout,
    })
    public endLayout: GFXTextureLayout = GFXTextureLayout.COLOR_ATTACHMENT_OPTIMAL;
}

@ccclass('DepthStencilDesc')
export class DepthStencilDesc {
    @property({
        type: GFXFormat,
    })
    public format: GFXFormat = GFXFormat.UNKNOWN;
    @property({
        type: GFXLoadOp,
    })
    public depthLoadOp: GFXLoadOp = GFXLoadOp.CLEAR;
    @property({
        type: GFXStoreOp,
    })
    public depthStoreOp: GFXStoreOp = GFXStoreOp.STORE;
    @property({
        type: GFXLoadOp,
    })
    public stencilLoadOp: GFXLoadOp = GFXLoadOp.CLEAR;
    @property({
        type: GFXStoreOp,
    })
    public stencilStoreOp: GFXStoreOp = GFXStoreOp.STORE;
    @property
    public sampleCount: number = 1;
    @property({
        type: GFXTextureLayout,
    })
    public beginLayout: GFXTextureLayout = GFXTextureLayout.COLOR_ATTACHMENT_OPTIMAL;
    @property({
        type: GFXTextureLayout,
    })
    public endLayout: GFXTextureLayout = GFXTextureLayout.COLOR_ATTACHMENT_OPTIMAL;
}

@ccclass('RenderPassDesc')
export class RenderPassDesc {
    @property
    public index: number = -1;
    @property({
        type: [ColorDesc],
    })
    public colorAttachments = [];
    @property({
        type: DepthStencilDesc,
    })
    public depthStencilAttachment: DepthStencilDesc = new DepthStencilDesc();
}
