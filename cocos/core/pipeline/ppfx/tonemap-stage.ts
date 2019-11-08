/**
 * @category pipeline.ppfx
 */

import { ccclass } from '../../data/class-decorator';
import { GFXBindingLayout } from '../../gfx/binding-layout';
import { GFXClearFlag, GFXCommandBufferType } from '../../gfx/define';
import { UBOGlobal } from '../define';
import { IRenderStageInfo, RenderStage, IRenderStageDesc } from '../render-stage';
import { RenderView } from '../render-view';

/**
 * @zh
 * 色调映射渲染阶段。
 *
 */
@ccclass('ToneMapStage')
export class ToneMapStage extends RenderStage {

    private _hTexSampler: number = 0;
    private _hBlendTexSampler: number = 0;
    private _bindingLayout: GFXBindingLayout | null = null;

    constructor () {
        super();
    }

    public initialize (info: IRenderStageInfo): boolean {

        super.initialize(info);

        if (info.framebuffer !== undefined) {
            this._framebuffer = info.framebuffer ;
        }

        this._createCmdBuffer();

        this.rebuild();
        return true;
    }

    public onAssetLoaded (desc: IRenderStageDesc) {

        super.onAssetLoaded(desc);

        this._createCmdBuffer();

        this.rebuild();
    }

    private _createCmdBuffer () {
        this._cmdBuff = this._device.createCommandBuffer({
            allocator: this._device.commandAllocator,
            type: GFXCommandBufferType.PRIMARY,
        });
    }

    public destroy () {
        if (this._cmdBuff) {
            this._cmdBuff.destroy();
            this._cmdBuff = null;
        }
    }

    public resize (width: number, height: number) {
    }

    public rebuild () {
        this._pass = this._flow.material.passes[0];
        this._hTexSampler = this._pass.getBinding('u_texSampler')!;

        const globalUBO = this._pipeline.globalBindings.get(UBOGlobal.BLOCK.name);

        this._pso = this._pass.createPipelineState();
        this._bindingLayout =  this._pso!.pipelineLayout.layouts[0];

        this._pass.bindBuffer(UBOGlobal.BLOCK.binding, globalUBO!.buffer!);
        this._pass.bindTextureView(this._hTexSampler, this._pipeline.getTextureView(this._pipeline.currShading)!);

        if (this._pipeline.useSMAA) {
            this._hBlendTexSampler = this._pass.getBinding('u_blendTexSampler')!;
            this._pass.bindTextureView(this._hBlendTexSampler, this._pipeline.getTextureView('smaaBlend')!);
        }

        this._pass.update();
        this._bindingLayout.update();
    }

    public render (view: RenderView) {

        const camera = view.camera!;

        if (this._cmdBuff) {

            this._renderArea.width = camera.width;
            this._renderArea.height = camera.height;
            const framebuffer = view.window!.framebuffer;

            this._cmdBuff.begin();
            this._cmdBuff.beginRenderPass(framebuffer, this._renderArea,
                GFXClearFlag.ALL, [{ r: 0.0, g: 0.0, b: 0.0, a: 1.0 }], 1.0, 0);
            this._cmdBuff.bindPipelineState(this._pso!);
            this._cmdBuff.bindBindingLayout(this._pso!.pipelineLayout.layouts[0]);
            this._cmdBuff.bindInputAssembler(this._pipeline.quadIA);
            this._cmdBuff.draw(this._pipeline.quadIA);
            this._cmdBuff.endRenderPass();
            this._cmdBuff.end();
        }

        this._device.queue.submit([this._cmdBuff!]);

        // this._pipeline.swapFBOs();
    }
}
