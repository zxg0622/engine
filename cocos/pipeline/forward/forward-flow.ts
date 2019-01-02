import { RenderFlow, RenderFlowInfo } from "../render-flow";
import { RenderPipeline } from "../render-pipeline";
import { TestStage } from "./test-stage";

export enum ForwardStagePriority {
    FORWARD = 0,
};

export class ForwardFlow extends RenderFlow {

    constructor(pipeline: RenderPipeline) {
        super(pipeline);
    }

    public initialize(info: RenderFlowInfo): boolean {

        if (info.name) {
            this._name = info.name;
        }

        this._priority = info.priority;

        let mainWindow = this._pipeline.root.mainWindow;
        if(!mainWindow || !mainWindow.framebuffer) {
            return false;
        }

        /*
        this.createStage<ForwardStage>(ForwardStage, {
            name: "ForwardStage",
            priority: ForwardStagePriority.FORWARD,
            framebuffer:  mainWindow.framebuffer,
        });
        */

        this.createStage<TestStage>(TestStage, {
            name: "TestStage",
            priority: ForwardStagePriority.FORWARD,
            framebuffer:  mainWindow.framebuffer,
        });

        return true;
    }

    public destroy(): void {
        this.destroyStages();
    }
};