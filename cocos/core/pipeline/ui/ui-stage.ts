/**
 * @category pipeline.ui
 */

import { GFXCommandBuffer } from '../../gfx/command-buffer';
import { GFXClearFlag, GFXCommandBufferType } from '../../gfx/define';
import { getPhaseID } from '../pass-phase';
import { RenderQueue, transparentCompareFn } from '../render-queue';
import { IRenderStageInfo, RenderStage } from '../render-stage';
import { RenderView } from '../render-view';

const bufs: GFXCommandBuffer[] = [];

/**
 * @zh
 * UI渲阶段。
 */
export class UIStage extends RenderStage {

    private _uiQueue: RenderQueue;

    constructor () {
        super();
    }

    public initialize (info: IRenderStageInfo): boolean {

        super.initialize(info);

        if (info.framebuffer !== undefined) {
            this._framebuffer = info.framebuffer;
        }

        this._uiQueue = new RenderQueue({
            isTransparent: true,
            phases: getPhaseID('default'),
            sortFunc: transparentCompareFn,
        });

        this._cmdBuff = this._device.createCommandBuffer({
            allocator: this._device.commandAllocator,
            type: GFXCommandBufferType.PRIMARY,
        });

        return true;
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
    }

    public render (view: RenderView) {

        this._uiQueue.clear();

        for (const ro of this._pipeline.renderObjects) {
            for (let i = 0; i < ro.model.subModelNum; i++) {
                for (let j = 0; j < ro.model.getSubModel(i).passes.length; j++) {
                    this._uiQueue.insertRenderPass(ro, i, j);
                }
            }
        }
        this._uiQueue.sort();

        const framebuffer = view.window!.framebuffer;

        const cmdBuff = this._cmdBuff!;

        const camera = view.camera!;

        const vp = camera.viewport;
        this._renderArea.x = vp.x * camera.width;
        this._renderArea.y = vp.y * camera.height;
        this._renderArea.width = vp.width * camera.width;
        this._renderArea.height = vp.height * camera.height;

        cmdBuff.begin();
        cmdBuff.beginRenderPass(framebuffer, this._renderArea,
            camera.clearFlag, [camera.clearColor], camera.clearDepth, camera.clearStencil);

        cmdBuff.execute(this._uiQueue.cmdBuffs.array, this._uiQueue.cmdBuffCount);

        cmdBuff.endRenderPass();
        cmdBuff.end();

        bufs[0] = cmdBuff;
        this._device.queue.submit(bufs);
    }
}
