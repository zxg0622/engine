import { RenderPipeline, RenderPassStage } from "../render-pipeline";
import { Root } from "../../core/root";
import { ForwardFlow } from "./forward-flow";
import { GFXRenderPass } from "../../gfx/render-pass";

export enum ForwardFlowPriority {
    FORWARD = 0,
};

export class ForwardPipeline extends RenderPipeline {

    constructor(root: Root) {
        super(root);
    }

    public initialize(): boolean {
        
        if(!this.createQuadInputAssembler()) {
            return false;
        }

        let mainWindow = this._root.mainWindow;
        let windowPass: GFXRenderPass | null = null;

        if(mainWindow) {
            windowPass = mainWindow.renderPass;
        }

        if(!windowPass) {
            console.error("RenderPass of main window is null.");
            return false;
        }

        this.addRenderPass(RenderPassStage.FORWARD, windowPass);

        // create flows

        this.createFlow<ForwardFlow>(ForwardFlow, {
            name: "ForwardFlow",
            priority: ForwardFlowPriority.FORWARD,
        });

        return true;
    }

    public destroy(): void {
        this.destroyFlows();
        this.clearRenderPasses();
        this.destroyQuadInputAssembler();
    }
};