import { WebGLGPUBuffer, WebGLGPUTexture, WebGLGPUInputAssembler, WebGLGPUFramebuffer, WebGLGPUShader, WebGLGPUInput, WebGLAttrib, WebGLGPUPipelineState, WebGLGPUUniformBlock, WebGLGPUBindingSetLayout } from "./webgl-gpu-objects";
import { WebGLGFXDevice } from "./webgl-gfx-device";
import { GFXBufferUsageBit, GFXMemoryUsageBit } from "../gfx-buffer";
import { GFXTextureViewType } from "../gfx-texture-view";
import { GFXFormatInfos, GFXFormat, WebGLEXT, GFXType, GFX_MAX_VERTEX_ATTRIBUTES } from "../gfx-define";
import { GFXShaderType } from "../gfx-shader";
import { GFXLoadOp } from "../gfx-render-pass";
import { GFXColorMask, GFXCullMode } from "../gfx-pipeline-state";
import { WebGLGFXCommandAllocator } from "./webgl-gfx-command-allocator";
import { GFXBindingType } from "../gfx-binding-set-layout";
import { Buffer } from "buffer";

function GFXFormatToWebGLType(format: GFXFormat): GLenum {
    switch (format) {
        case GFXFormat.R8: return WebGLRenderingContext.UNSIGNED_BYTE;
        case GFXFormat.R8SN: return WebGLRenderingContext.BYTE;
        case GFXFormat.R8UI: return WebGLRenderingContext.UNSIGNED_INT;
        case GFXFormat.R8I: return WebGLRenderingContext.INT;
        case GFXFormat.R16F: return WebGLRenderingContext.FLOAT;
        case GFXFormat.R16UI: return WebGLRenderingContext.UNSIGNED_INT;
        case GFXFormat.R16I: return WebGLRenderingContext.INT;
        case GFXFormat.R32F: return WebGLRenderingContext.FLOAT;
        case GFXFormat.R32UI: return WebGLRenderingContext.UNSIGNED_INT;
        case GFXFormat.R32I: return WebGLRenderingContext.INT;

        case GFXFormat.RG8: return WebGLRenderingContext.UNSIGNED_BYTE;
        case GFXFormat.RG8SN: return WebGLRenderingContext.BYTE;
        case GFXFormat.RG8UI: return WebGLRenderingContext.UNSIGNED_INT;
        case GFXFormat.RG8I: return WebGLRenderingContext.INT;
        case GFXFormat.RG16F: return WebGLRenderingContext.FLOAT;
        case GFXFormat.RG16UI: return WebGLRenderingContext.UNSIGNED_INT;
        case GFXFormat.RG16I: return WebGLRenderingContext.INT;
        case GFXFormat.RG32F: return WebGLRenderingContext.FLOAT;
        case GFXFormat.RG32UI: return WebGLRenderingContext.UNSIGNED_INT;
        case GFXFormat.RG32I: return WebGLRenderingContext.INT;

        case GFXFormat.RGB8: return WebGLRenderingContext.UNSIGNED_BYTE;
        case GFXFormat.SRGB8: return WebGLRenderingContext.UNSIGNED_BYTE;
        case GFXFormat.RGB8SN: return WebGLRenderingContext.BYTE;
        case GFXFormat.RGB8UI: return WebGLRenderingContext.UNSIGNED_INT;
        case GFXFormat.RGB8I: return WebGLRenderingContext.INT;
        case GFXFormat.RGB16F: return WebGLRenderingContext.FLOAT;
        case GFXFormat.RGB16UI: return WebGLRenderingContext.UNSIGNED_INT;
        case GFXFormat.RGB16I: return WebGLRenderingContext.INT;
        case GFXFormat.RGB32F: return WebGLRenderingContext.FLOAT;
        case GFXFormat.RGB32UI: return WebGLRenderingContext.UNSIGNED_INT;
        case GFXFormat.RGB32I: return WebGLRenderingContext.INT;

        case GFXFormat.RGBA8: return WebGLRenderingContext.UNSIGNED_BYTE;
        case GFXFormat.SRGB8_A8: return WebGLRenderingContext.UNSIGNED_BYTE;
        case GFXFormat.RGBA8SN: return WebGLRenderingContext.BYTE;
        case GFXFormat.RGBA8UI: return WebGLRenderingContext.UNSIGNED_INT;
        case GFXFormat.RGBA8I: return WebGLRenderingContext.INT;
        case GFXFormat.RGBA16F: return WebGLRenderingContext.FLOAT;
        case GFXFormat.RGBA16UI: return WebGLRenderingContext.UNSIGNED_INT;
        case GFXFormat.RGBA16I: return WebGLRenderingContext.INT;
        case GFXFormat.RGBA32F: return WebGLRenderingContext.FLOAT;
        case GFXFormat.RGBA32UI: return WebGLRenderingContext.UNSIGNED_INT;
        case GFXFormat.RGBA32I: return WebGLRenderingContext.INT;

        case GFXFormat.R5G6B5: return WebGLRenderingContext.UNSIGNED_SHORT_5_6_5;
        case GFXFormat.R11G11B10F: return WebGLRenderingContext.FLOAT;
        case GFXFormat.RGB5A1: return WebGLRenderingContext.UNSIGNED_SHORT_5_5_5_1;
        case GFXFormat.RGBA4: return WebGLRenderingContext.UNSIGNED_SHORT_4_4_4_4;
        case GFXFormat.RGB10A2: return WebGLRenderingContext.UNSIGNED_BYTE;
        case GFXFormat.RGB10A2UI: return WebGLRenderingContext.UNSIGNED_INT;
        case GFXFormat.RGB9E5: return WebGLRenderingContext.UNSIGNED_BYTE;

        case GFXFormat.D16: return WebGLRenderingContext.UNSIGNED_SHORT;
        case GFXFormat.D24: return WebGLRenderingContext.UNSIGNED_INT;
        case GFXFormat.D24S8: return WebGLRenderingContext.UNSIGNED_INT;
        case GFXFormat.D32F: return WebGLRenderingContext.FLOAT;
        case GFXFormat.D32F_S8: return WebGLRenderingContext.FLOAT;

        case GFXFormat.BC1: return WebGLRenderingContext.UNSIGNED_BYTE;
        case GFXFormat.BC1_SRGB: return WebGLRenderingContext.UNSIGNED_BYTE;
        case GFXFormat.BC2: return WebGLRenderingContext.UNSIGNED_BYTE;
        case GFXFormat.BC2_SRGB: return WebGLRenderingContext.UNSIGNED_BYTE;
        case GFXFormat.BC3: return WebGLRenderingContext.UNSIGNED_BYTE;
        case GFXFormat.BC3_SRGB: return WebGLRenderingContext.UNSIGNED_BYTE;
        case GFXFormat.BC4: return WebGLRenderingContext.UNSIGNED_BYTE;
        case GFXFormat.BC4_SNORM: return WebGLRenderingContext.BYTE;
        case GFXFormat.BC5: return WebGLRenderingContext.UNSIGNED_BYTE;
        case GFXFormat.BC5_SNORM: return WebGLRenderingContext.BYTE;
        case GFXFormat.BC6H_SF16: return WebGLRenderingContext.FLOAT;
        case GFXFormat.BC6H_UF16: return WebGLRenderingContext.FLOAT;
        case GFXFormat.BC7: return WebGLRenderingContext.UNSIGNED_BYTE;
        case GFXFormat.BC7_SRGB: return WebGLRenderingContext.UNSIGNED_BYTE;

        case GFXFormat.ETC_RGB8: return WebGLRenderingContext.UNSIGNED_BYTE;
        case GFXFormat.ETC2_RGB8: return WebGLRenderingContext.UNSIGNED_BYTE;
        case GFXFormat.ETC2_SRGB8: return WebGLRenderingContext.UNSIGNED_BYTE;
        case GFXFormat.ETC2_RGB8_A1: return WebGLRenderingContext.UNSIGNED_BYTE;
        case GFXFormat.ETC2_SRGB8_A1: return WebGLRenderingContext.UNSIGNED_BYTE;
        case GFXFormat.ETC2_RGB8: return WebGLRenderingContext.UNSIGNED_BYTE;
        case GFXFormat.ETC2_SRGB8: return WebGLRenderingContext.UNSIGNED_BYTE;
        case GFXFormat.EAC_R11: return WebGLRenderingContext.UNSIGNED_BYTE;
        case GFXFormat.EAC_R11SN: return WebGLRenderingContext.BYTE;
        case GFXFormat.EAC_RG11: return WebGLRenderingContext.UNSIGNED_BYTE;
        case GFXFormat.EAC_RG11SN: return WebGLRenderingContext.BYTE;

        case GFXFormat.PVRTC_RGB2: return WebGLRenderingContext.UNSIGNED_BYTE;
        case GFXFormat.PVRTC_RGBA2: return WebGLRenderingContext.UNSIGNED_BYTE;
        case GFXFormat.PVRTC_RGB4: return WebGLRenderingContext.UNSIGNED_BYTE;
        case GFXFormat.PVRTC_RGBA4: return WebGLRenderingContext.UNSIGNED_BYTE;
        case GFXFormat.PVRTC2_2BPP: return WebGLRenderingContext.UNSIGNED_BYTE;
        case GFXFormat.PVRTC2_4BPP: return WebGLRenderingContext.UNSIGNED_BYTE;

        default: {
            return WebGLRenderingContext.UNSIGNED_BYTE;
        }
    }
}

function GFXFormatToWebGLInternalFormat(format: GFXFormat): GLenum {
    switch (format) {
        case GFXFormat.A8: return WebGLRenderingContext.ALPHA;
        case GFXFormat.L8: return WebGLRenderingContext.LUMINANCE;
        case GFXFormat.LA8: return WebGLRenderingContext.LUMINANCE_ALPHA;
        case GFXFormat.RGB8: return WebGLRenderingContext.RGB;
        case GFXFormat.RGBA8: return WebGLRenderingContext.RGBA;
        case GFXFormat.R5G6B5: return WebGLRenderingContext.RGB565;
        case GFXFormat.RGB5A1: return WebGLRenderingContext.RGB5_A1;
        case GFXFormat.RGBA4: return WebGLRenderingContext.RGBA4;
        case GFXFormat.D16: return WebGLRenderingContext.DEPTH_COMPONENT16;
        case GFXFormat.D24: return WebGLRenderingContext.DEPTH_COMPONENT;
        case GFXFormat.D24S8: return WebGLRenderingContext.DEPTH_STENCIL;
        case GFXFormat.D32F: return WebGLRenderingContext.DEPTH_COMPONENT;
        case GFXFormat.D32F_S8: return WebGLRenderingContext.DEPTH_STENCIL;

        case GFXFormat.BC1: return WebGLEXT.COMPRESSED_RGB_S3TC_DXT1_EXT;
        case GFXFormat.BC1_ALPHA: return WebGLEXT.COMPRESSED_RGBA_S3TC_DXT1_EXT;
        case GFXFormat.BC1_SRGB: return WebGLEXT.COMPRESSED_SRGB_S3TC_DXT1_EXT;
        case GFXFormat.BC1_SRGB_ALPHA: return WebGLEXT.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;
        case GFXFormat.BC2: return WebGLEXT.COMPRESSED_RGBA_S3TC_DXT3_EXT;
        case GFXFormat.BC2_SRGB: return WebGLEXT.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;
        case GFXFormat.BC3: return WebGLEXT.COMPRESSED_RGBA_S3TC_DXT5_EXT;
        case GFXFormat.BC3_SRGB: return WebGLEXT.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT;

        case GFXFormat.ETC_RGB8: return WebGLEXT.COMPRESSED_RGB_ETC1_WEBGL;

        case GFXFormat.PVRTC_RGB2: return WebGLEXT.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;
        case GFXFormat.PVRTC_RGBA2: return WebGLEXT.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG;
        case GFXFormat.PVRTC_RGB4: return WebGLEXT.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
        case GFXFormat.PVRTC_RGBA4: return WebGLEXT.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;

        default: {
            console.error("Unsupported GFXFormat, convert to WebGL internal format failed.");
            return WebGLRenderingContext.RGBA;
        }
    }
}

function GFXFormatToWebGLFormat(format: GFXFormat): GLenum {
    switch (format) {
        case GFXFormat.A8: return WebGLRenderingContext.ALPHA;
        case GFXFormat.L8: return WebGLRenderingContext.LUMINANCE;
        case GFXFormat.LA8: return WebGLRenderingContext.LUMINANCE_ALPHA;
        case GFXFormat.RGB8: return WebGLRenderingContext.RGB;
        case GFXFormat.RGBA8: return WebGLRenderingContext.RGBA;
        case GFXFormat.R5G6B5: return WebGLRenderingContext.RGB;
        case GFXFormat.RGB5A1: return WebGLRenderingContext.RGBA;
        case GFXFormat.RGBA4: return WebGLRenderingContext.RGBA;
        case GFXFormat.D16: return WebGLRenderingContext.DEPTH_COMPONENT;
        case GFXFormat.D24: return WebGLRenderingContext.DEPTH_COMPONENT;
        case GFXFormat.D24S8: return WebGLRenderingContext.DEPTH_STENCIL;
        case GFXFormat.D32F: return WebGLRenderingContext.DEPTH_COMPONENT;
        case GFXFormat.D32F_S8: return WebGLRenderingContext.DEPTH_STENCIL;

        case GFXFormat.BC1: return WebGLEXT.COMPRESSED_RGB_S3TC_DXT1_EXT;
        case GFXFormat.BC1_ALPHA: return WebGLEXT.COMPRESSED_RGBA_S3TC_DXT1_EXT;
        case GFXFormat.BC1_SRGB: return WebGLEXT.COMPRESSED_SRGB_S3TC_DXT1_EXT;
        case GFXFormat.BC1_SRGB_ALPHA: return WebGLEXT.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;
        case GFXFormat.BC2: return WebGLEXT.COMPRESSED_RGBA_S3TC_DXT3_EXT;
        case GFXFormat.BC2_SRGB: return WebGLEXT.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;
        case GFXFormat.BC3: return WebGLEXT.COMPRESSED_RGBA_S3TC_DXT5_EXT;
        case GFXFormat.BC3_SRGB: return WebGLEXT.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT;

        case GFXFormat.ETC_RGB8: return WebGLEXT.COMPRESSED_RGB_ETC1_WEBGL;

        case GFXFormat.PVRTC_RGB2: return WebGLEXT.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;
        case GFXFormat.PVRTC_RGBA2: return WebGLEXT.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG;
        case GFXFormat.PVRTC_RGB4: return WebGLEXT.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
        case GFXFormat.PVRTC_RGBA4: return WebGLEXT.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;

        default: {
            console.error("Unsupported GFXFormat, convert to WebGL format failed.");
            return WebGLRenderingContext.RGBA;
        }
    }
}

function WebGLTypeToGFXType(glType: GLenum): GFXType {
    switch (glType) {
        case WebGLRenderingContext.BOOL: return GFXType.BOOL;
        case WebGLRenderingContext.BOOL_VEC2: return GFXType.BOOL2;
        case WebGLRenderingContext.BOOL_VEC3: return GFXType.BOOL3;
        case WebGLRenderingContext.BOOL_VEC4: return GFXType.BOOL4;
        case WebGLRenderingContext.INT: return GFXType.INT;
        case WebGLRenderingContext.INT_VEC2: return GFXType.INT2;
        case WebGLRenderingContext.INT_VEC3: return GFXType.INT3;
        case WebGLRenderingContext.INT_VEC4: return GFXType.INT4;
        case WebGLRenderingContext.UNSIGNED_INT: return GFXType.UINT;
        case WebGLRenderingContext.FLOAT: return GFXType.FLOAT;
        case WebGLRenderingContext.FLOAT_VEC2: return GFXType.FLOAT2;
        case WebGLRenderingContext.FLOAT_VEC3: return GFXType.FLOAT3;
        case WebGLRenderingContext.FLOAT_VEC4: return GFXType.FLOAT4;
        case WebGLRenderingContext.FLOAT_MAT2: return GFXType.MAT2;
        case WebGLRenderingContext.FLOAT_MAT3: return GFXType.MAT3;
        case WebGLRenderingContext.FLOAT_MAT4: return GFXType.MAT4;
        case WebGLRenderingContext.SAMPLER_2D: return GFXType.SAMPLER2D;
        case WebGLRenderingContext.SAMPLER_CUBE: return GFXType.SAMPLER_CUBE;
        default: {
            console.error("Unsupported GLType, convert to GFXType failed.");
            return GFXType.UNKNOWN;
        }
    }
}

function WebGLGetTypeSize(glType: GLenum): GFXType {
    switch (glType) {
        case WebGLRenderingContext.BOOL: return 4;
        case WebGLRenderingContext.BOOL_VEC2: return 8;
        case WebGLRenderingContext.BOOL_VEC3: return 12;
        case WebGLRenderingContext.BOOL_VEC4: return 16;
        case WebGLRenderingContext.INT: return 4;
        case WebGLRenderingContext.INT_VEC2: return 8;
        case WebGLRenderingContext.INT_VEC3: return 12;
        case WebGLRenderingContext.INT_VEC4: return 16;
        case WebGLRenderingContext.UNSIGNED_INT: return 4;
        case WebGLRenderingContext.FLOAT: return 4;
        case WebGLRenderingContext.FLOAT_VEC2: return 8;
        case WebGLRenderingContext.FLOAT_VEC3: return 12;
        case WebGLRenderingContext.FLOAT_VEC4: return 16;
        case WebGLRenderingContext.FLOAT_MAT2: return 16;
        case WebGLRenderingContext.FLOAT_MAT3: return 36;
        case WebGLRenderingContext.FLOAT_MAT4: return 64;
        case WebGLRenderingContext.SAMPLER_2D: return 4;
        case WebGLRenderingContext.SAMPLER_CUBE: return 4;
        default: {
            console.error("Unsupported GLType, get type failed.");
            return 0;
        }
    }
}

function WebGLGetComponentCount(glType: GLenum): GFXType {
    switch (glType) {
        case WebGLRenderingContext.FLOAT_MAT2: return 2;
        case WebGLRenderingContext.FLOAT_MAT3: return 3;
        case WebGLRenderingContext.FLOAT_MAT4: return 4;
        default: {
            console.error("Unsupported GLType, get component count failed.");
            return 0;
        }
    }
}

const WebGLCmpFuncs: GLenum[] = [
    WebGLRenderingContext.NEVER,
    WebGLRenderingContext.LESS,
    WebGLRenderingContext.EQUAL,
    WebGLRenderingContext.LEQUAL,
    WebGLRenderingContext.GREATER,
    WebGLRenderingContext.NOTEQUAL,
    WebGLRenderingContext.GEQUAL,
    WebGLRenderingContext.ALWAYS,
];

const WebGLStencilOps: GLenum[] = [
    WebGLRenderingContext.KEEP,
    WebGLRenderingContext.ZERO,
    WebGLRenderingContext.REPLACE,
    WebGLRenderingContext.INCR,
    WebGLRenderingContext.DECR,
    WebGLRenderingContext.INVERT,
    WebGLRenderingContext.INCR_WRAP,
    WebGLRenderingContext.DECR_WRAP,
];

const WebGLBlendOps: GLenum[] = [
    WebGLRenderingContext.FUNC_ADD,
    WebGLRenderingContext.FUNC_SUBTRACT,
    WebGLRenderingContext.FUNC_REVERSE_SUBTRACT,
    WebGLRenderingContext.FUNC_ADD,
    WebGLRenderingContext.FUNC_ADD,
];

const WebGLBlendFactors: GLenum[] = [
    WebGLRenderingContext.ZERO,
    WebGLRenderingContext.ONE,
    WebGLRenderingContext.SRC_ALPHA,
    WebGLRenderingContext.DST_ALPHA,
    WebGLRenderingContext.ONE_MINUS_SRC_ALPHA,
    WebGLRenderingContext.ONE_MINUS_DST_ALPHA,
    WebGLRenderingContext.SRC_COLOR,
    WebGLRenderingContext.DST_COLOR,
    WebGLRenderingContext.SRC_ALPHA_SATURATE,
    WebGLRenderingContext.CONSTANT_COLOR,
    WebGLRenderingContext.ONE_MINUS_CONSTANT_COLOR,
    WebGLRenderingContext.CONSTANT_ALPHA,
    WebGLRenderingContext.ONE_MINUS_CONSTANT_ALPHA,
];

export const enum WebGLCmd {
    BEGIN_RENDER_PASS,
    END_RENDER_PASS,
    BIND_PIPELINE_STATE,
    BIND_INPUT_ASSEMBLER,
    BIND_BINDING_SET_LAYOUT,
    DRAW,
    UPDATE_BUFFER,
    COUNT,
};

export class WebGLCmdObject {
    cmdType: WebGLCmd;

    constructor(type: WebGLCmd) {
        this.cmdType = type;
    }
};

export class WebGLCmdBeginRenderPass extends WebGLCmdObject {

    gpuFramebuffer: WebGLGPUFramebuffer | null = null;
    viewport: number[] = [];
    numClearColors: number = 0;
    clearColors: number[] = [];
    clearDepth: number = 1.0;
    clearStencil: number = 0;

    constructor() {
        super(WebGLCmd.BEGIN_RENDER_PASS);
    }
}

export class WebGLCmdBindPipelineState extends WebGLCmdObject {

    gpuPipelineState: WebGLGPUPipelineState | null = null;

    constructor() {
        super(WebGLCmd.BIND_PIPELINE_STATE);
    }
};

export class WebGLCmdBindInputAssembler extends WebGLCmdObject {

    gpuInputAssembler: WebGLGPUInputAssembler | null = null;

    constructor() {
        super(WebGLCmd.BIND_INPUT_ASSEMBLER);
    }
};

export class WebGLCmdBindBindingSetLayout extends WebGLCmdObject {

    gpuBindingSetLayout: WebGLGPUBindingSetLayout | null = null;

    constructor() {
        super(WebGLCmd.BIND_BINDING_SET_LAYOUT);
    }
};

export class WebGLCmdDraw extends WebGLCmdObject {

    vertexCount: number = 0;
    firstVertex: number = 0;

    indexCount: number = 0;
    firstIndex: number = 0;
    vertexOffset: number = 0;

    instanceCount: number = 0;
    firstInstance: number = 0;

    constructor() {
        super(WebGLCmd.DRAW);
    }
};

export class WebGLCmdUpdateBuffer extends WebGLCmdObject {

    gpuBuffer: WebGLGPUBuffer | null = null;
    data: ArrayBuffer | null = null;
    offset: number = 0;

    constructor() {
        super(WebGLCmd.UPDATE_BUFFER);
    }
};

export class WebGLCmdPackage {
    cmds: WebGLCmd[] = [];
    beginRenderPassCmds: WebGLCmdBeginRenderPass[] = [];
    bindPipelineStateCmds: WebGLCmdBindPipelineState[] = [];
    bindBindingSetLayoutCmds: WebGLCmdBindBindingSetLayout[] = [];
    bindInputAssemblerCmds: WebGLCmdBindInputAssembler[] = [];
    drawCmds: WebGLCmdDraw[] = [];
    updateBufferCmds: WebGLCmdUpdateBuffer[] = [];

    clearCmds(allocator: WebGLGFXCommandAllocator) {

        if (this.beginRenderPassCmds.length) {
            for (let i = 0; i < this.beginRenderPassCmds.length; ++i) {
                allocator.beginRenderPassCmdPool.free(this.beginRenderPassCmds[i]);
            }
            this.beginRenderPassCmds = [];
        }

        if (this.bindPipelineStateCmds.length) {
            for (let i = 0; i < this.bindPipelineStateCmds.length; ++i) {
                allocator.bindPipelineStateCmdPool.free(this.bindPipelineStateCmds[i]);
            }
            this.bindPipelineStateCmds = [];
        }

        if (this.bindBindingSetLayoutCmds.length) {
            for (let i = 0; i < this.bindBindingSetLayoutCmds.length; ++i) {
                allocator.bindBindingSetLayoutCmdPool.free(this.bindBindingSetLayoutCmds[i]);
            }
            this.bindBindingSetLayoutCmds = [];
        }

        if (this.bindInputAssemblerCmds.length) {
            for (let i = 0; i < this.bindInputAssemblerCmds.length; ++i) {
                allocator.bindInputAssemblerCmdPool.free(this.bindInputAssemblerCmds[i]);
            }
            this.bindInputAssemblerCmds = [];
        }

        if (this.drawCmds.length) {
            for (let i = 0; i < this.drawCmds.length; ++i) {
                allocator.drawCmdPool.free(this.drawCmds[i]);
            }
            this.drawCmds = [];
        }

        if (this.updateBufferCmds.length) {
            for (let i = 0; i < this.updateBufferCmds.length; ++i) {
                allocator.updateBufferCmdPool.free(this.updateBufferCmds[i]);
            }
            this.updateBufferCmds = [];
        }

        this.cmds = [];
    }
}

export function WebGLCmdFuncCreateBuffer(device: WebGLGFXDevice, gpuBuffer: WebGLGPUBuffer) {

    let gl: WebGLRenderingContext = <WebGLRenderingContext>device.gl;

    if (gpuBuffer.usage & GFXBufferUsageBit.VERTEX) {

        gpuBuffer.glTarget = WebGLRenderingContext.ARRAY_BUFFER;
        let glBuffer = gl.createBuffer();
        if (glBuffer) {
            gpuBuffer.glBuffer = glBuffer;

            if (device.stateCache.glArrayBuffer !== gpuBuffer.glBuffer) {
                gl.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, gpuBuffer.glBuffer);
                device.stateCache.glArrayBuffer = gpuBuffer.glBuffer;
            }

            let glUsage: GLenum = gpuBuffer.usage & GFXMemoryUsageBit.DEVICE ? WebGLRenderingContext.STATIC_DRAW : WebGLRenderingContext.DYNAMIC_DRAW;
            gl.bufferData(WebGLRenderingContext.ARRAY_BUFFER, gpuBuffer.size, glUsage);

            gl.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, null);
            device.stateCache.glArrayBuffer = null;
        }
    } else if (gpuBuffer.usage & GFXBufferUsageBit.INDEX) {

        gpuBuffer.glTarget = WebGLRenderingContext.ELEMENT_ARRAY_BUFFER;
        let glBuffer = gl.createBuffer();
        if (glBuffer) {
            gpuBuffer.glBuffer = glBuffer;

            if (device.stateCache.glElementArrayBuffer !== gpuBuffer.glBuffer) {
                gl.bindBuffer(WebGLRenderingContext.ELEMENT_ARRAY_BUFFER, gpuBuffer.glBuffer);
                device.stateCache.glElementArrayBuffer = gpuBuffer.glBuffer;
            }

            let glUsage: GLenum = gpuBuffer.usage & GFXMemoryUsageBit.DEVICE ? WebGLRenderingContext.STATIC_DRAW : WebGLRenderingContext.DYNAMIC_DRAW;
            gl.bufferData(WebGLRenderingContext.ELEMENT_ARRAY_BUFFER, gpuBuffer.size, glUsage);

            gl.bindBuffer(WebGLRenderingContext.ELEMENT_ARRAY_BUFFER, null);
            device.stateCache.glElementArrayBuffer = null;
        }
    } else if (gpuBuffer.usage & GFXBufferUsageBit.UNIFORM) {
        console.error("WebGL 1.0 doesn't support uniform buffer.");
        gpuBuffer.glTarget = WebGLRenderingContext.NONE;
    } else if (gpuBuffer.usage === GFXBufferUsageBit.TRANSFER_DST) {
        gpuBuffer.glTarget = WebGLRenderingContext.NONE;
    } else if (gpuBuffer.usage === GFXBufferUsageBit.TRANSFER_SRC) {
        gpuBuffer.glTarget = WebGLRenderingContext.NONE;
    } else {
        console.error("Unsupported GFXBufferType, create buffer failed.");
        gpuBuffer.glTarget = WebGLRenderingContext.NONE;
    }
}

export function WebGLCmdFuncDestroyBuffer(device: WebGLGFXDevice, gpuBuffer: WebGLGPUBuffer) {
    if (gpuBuffer.glBuffer > 0) {
        device.gl.deleteBuffer(gpuBuffer.glBuffer);
        gpuBuffer.glBuffer = 0;
    }
}

export function WebGLCmdFuncUpdateBuffer(device: WebGLGFXDevice, gpuBuffer: WebGLGPUBuffer, offset: number, buffer: Buffer) {

    let gl: WebGLRenderingContext = <WebGLRenderingContext>device.gl;

    switch (gpuBuffer.glTarget) {
        case WebGLRenderingContext.ARRAY_BUFFER: {
            if (device.stateCache.glArrayBuffer !== gpuBuffer.glBuffer) {
                gl.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, gpuBuffer.glBuffer);
                device.stateCache.glArrayBuffer = gpuBuffer.glBuffer;
            }
            break;
        }
        case WebGLRenderingContext.ELEMENT_ARRAY_BUFFER: {
            if (device.stateCache.glElementArrayBuffer !== gpuBuffer.glBuffer) {
                gl.bindBuffer(WebGLRenderingContext.ELEMENT_ARRAY_BUFFER, gpuBuffer.glBuffer);
                device.stateCache.glElementArrayBuffer = gpuBuffer.glBuffer;
            }
            break;
        }
        default: {
            console.error("Unsupported GFXBufferType, update buffer failed.");
            return;
        }
    }

    gl.bufferSubData(gpuBuffer.glTarget, offset, buffer.buffer);
}

export function WebGLCmdFuncCreateInputState(device: WebGLGFXDevice, gpuInputState: WebGLGPUInputAssembler) {
}

export function WebGLCmdFuncDestroyInputState(device: WebGLGFXDevice, gpuInputState: WebGLGPUInputAssembler) {
    /*if(gpuInputState.glVAO > 0) {
        gpuInputState.glVAO = 0;
    }*/
}

export function WebGLCmdFuncCreateTexture(device: WebGLGFXDevice, gpuTexture: WebGLGPUTexture) {

    let gl: WebGLRenderingContext = <WebGLRenderingContext>device.gl;

    gpuTexture.glInternelFmt = GFXFormatToWebGLInternalFormat(gpuTexture.format);
    gpuTexture.glFormat = GFXFormatToWebGLFormat(gpuTexture.format);
    gpuTexture.glType = GFXFormatToWebGLType(gpuTexture.format);

    switch (gpuTexture.viewType) {
        case GFXTextureViewType.TV2D: {

            gpuTexture.viewType = GFXTextureViewType.TV2D;
            gpuTexture.glTarget = WebGLRenderingContext.TEXTURE_2D;

            let glTexture = gl.createTexture();
            if (glTexture) {
                gpuTexture.glTexture = glTexture;

                if (device.stateCache.glTex2DUnits[device.stateCache.texUnit] !== gpuTexture.glTexture) {
                    gl.bindTexture(WebGLRenderingContext.TEXTURE_2D, gpuTexture.glTexture);
                    device.stateCache.glTex2DUnits[device.stateCache.texUnit] = gpuTexture.glTexture;
                }

                let w = gpuTexture.width;
                let h = gpuTexture.height;

                if (!GFXFormatInfos[gpuTexture.format].isCompressed) {
                    for (let i = 0; i < gpuTexture.mipLevel; ++i) {
                        gl.texImage2D(WebGLRenderingContext.TEXTURE_2D, i, gpuTexture.glInternelFmt, w, h, 0, gpuTexture.glFormat, gpuTexture.glType, null);
                        w = Math.max(1, w >> 1);
                        h = Math.max(1, h >> 1);
                    }
                } else {
                    let view: ArrayBufferView = { buffer: new ArrayBuffer(0), byteLength: 0, byteOffset: 0 };
                    for (let i = 0; i < gpuTexture.mipLevel; ++i) {
                        gl.compressedTexImage2D(WebGLRenderingContext.TEXTURE_2D, i, gpuTexture.glInternelFmt, w, h, 0, view);
                        w = Math.max(1, w >> 1);
                        h = Math.max(1, h >> 1);
                    }
                }
            }

            break;
        }
        case GFXTextureViewType.CUBE: {

            gpuTexture.viewType = GFXTextureViewType.CUBE;
            gpuTexture.glTarget = WebGLRenderingContext.TEXTURE_CUBE_MAP;

            let glTexture = gl.createTexture();
            if (glTexture) {
                gpuTexture.glTexture = glTexture;

                if (device.stateCache.glTexCubeUnits[device.stateCache.texUnit] !== gpuTexture.glTexture) {
                    gl.bindTexture(WebGLRenderingContext.TEXTURE_CUBE_MAP, gpuTexture.glTexture);
                    device.stateCache.glTexCubeUnits[device.stateCache.texUnit] = gpuTexture.glTexture;
                }

                if (!GFXFormatInfos[gpuTexture.format].isCompressed) {
                    for (let f = 0; f < 6; ++f) {
                        let w = gpuTexture.width;
                        let h = gpuTexture.height;
                        for (let i = 0; i < gpuTexture.mipLevel; ++i) {
                            gl.texImage2D(WebGLRenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_X + f, i, gpuTexture.glInternelFmt, w, h, 0, gpuTexture.glFormat, gpuTexture.glType, null);
                            w = Math.max(1, w >> 1);
                            h = Math.max(1, h >> 1);
                        }
                    }
                } else {
                    let view: ArrayBufferView = { buffer: new ArrayBuffer(0), byteLength: 0, byteOffset: 0 };

                    for (let f = 0; f < 6; ++f) {
                        let w = gpuTexture.width;
                        let h = gpuTexture.height;
                        for (let i = 0; i < gpuTexture.mipLevel; ++i) {
                            gl.compressedTexImage2D(WebGLRenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_X + f, i, gpuTexture.glInternelFmt, w, h, 0, view);
                            w = Math.max(1, w >> 1);
                            h = Math.max(1, h >> 1);
                        }
                    }
                }
            }

            break;
        }
        default: {
            console.error("Unsupported GFXTextureType, create texture failed.");
            gpuTexture.viewType = GFXTextureViewType.TV2D;
            gpuTexture.glTarget = WebGLRenderingContext.TEXTURE_2D;
        }
    }
}

export function WebGLCmdFuncDestroyTexture(device: WebGLGFXDevice, gpuTexture: WebGLGPUTexture) {
    if (gpuTexture.glTexture > 0) {
        device.gl.deleteTexture(gpuTexture.glTexture);
        gpuTexture.glTexture = 0;
    }
}

export function WebGLCmdFuncCreateFramebuffer(device: WebGLGFXDevice, gpuFramebuffer: WebGLGPUFramebuffer) {

    if (!gpuFramebuffer.isOffscreen) {

        let gl: WebGLRenderingContext = <WebGLRenderingContext>device.gl;

        let glFramebuffer = gl.createFramebuffer();
        if (glFramebuffer) {
            gpuFramebuffer.glFramebuffer = glFramebuffer;

            if (device.stateCache.glFramebuffer !== gpuFramebuffer.glFramebuffer) {
                gl.bindFramebuffer(WebGLRenderingContext.FRAMEBUFFER, gpuFramebuffer.glFramebuffer);
                device.stateCache.glFramebuffer = gpuFramebuffer.glFramebuffer;
            }

            for (let i = 0; i < gpuFramebuffer.gpuColorViews.length; ++i) {

                let gpuColorView = gpuFramebuffer.gpuColorViews[i];
                if (gpuColorView) {
                    gl.framebufferTexture2D(
                        WebGLRenderingContext.FRAMEBUFFER,
                        WebGLRenderingContext.COLOR_ATTACHMENT0 + i,
                        gpuColorView.gpuTexture.glTarget,
                        gpuColorView.gpuTexture.glTexture,
                        gpuColorView.baseLevel);
                }
            }

            if (gpuFramebuffer.gpuDepthStencilView) {

                let glAttachment = GFXFormatInfos[gpuFramebuffer.gpuDepthStencilView.format].hasStencil ?
                    WebGLRenderingContext.DEPTH_STENCIL_ATTACHMENT : WebGLRenderingContext.DEPTH_ATTACHMENT;

                gl.framebufferTexture2D(
                    WebGLRenderingContext.FRAMEBUFFER,
                    glAttachment,
                    gpuFramebuffer.gpuDepthStencilView.gpuTexture.glTarget,
                    gpuFramebuffer.gpuDepthStencilView.gpuTexture.glTexture,
                    gpuFramebuffer.gpuDepthStencilView.baseLevel);
            }
        }
    }
}

export function WebGLCmdFuncDestroyFramebuffer(device: WebGLGFXDevice, gpuFramebuffer: WebGLGPUFramebuffer) {
    if (gpuFramebuffer.glFramebuffer > 0) {
        device.gl.deleteFramebuffer(gpuFramebuffer.glFramebuffer);
        gpuFramebuffer.glFramebuffer = 0;
    }
}

export function WebGLCmdFuncCreateShader(device: WebGLGFXDevice, gpuShader: WebGLGPUShader) {
    let gl: WebGLRenderingContext = <WebGLRenderingContext>device.gl;

    for (let i = 0; i < gpuShader.gpuStages.length; ++i) {
        let gpuStage = gpuShader.gpuStages[i];

        let glShaderType: GLenum = 0;
        let shaderTypeStr = "";

        switch (gpuStage.type) {
            case GFXShaderType.VERTEX: {
                shaderTypeStr = "VertexShader";
                glShaderType = WebGLRenderingContext.VERTEX_SHADER;
                break;
            }
            case GFXShaderType.FRAGMENT: {
                shaderTypeStr = "FragmentShader";
                glShaderType = WebGLRenderingContext.FRAGMENT_SHADER;
                break;
            }
            default: {
                console.error("Unsupported GFXShaderType.");
                return;
            }
        }

        let glShader = gl.createShader(glShaderType);
        if (glShader) {
            gpuStage.glShader = glShader;
            gl.shaderSource(gpuStage.glShader, gpuStage.source);
            gl.compileShader(gpuStage.glShader);

            var isSuccess = gl.getShaderParameter(gpuStage.glShader, gl.COMPILE_STATUS);
            if (!isSuccess) {
                console.error(shaderTypeStr + " in '" + gpuShader.name + "' compilation failed.");
                console.error(gl.getShaderInfoLog(gpuStage.glShader));
            } else {
                gl.deleteShader(gpuStage.glShader);
                gpuStage.glShader = 0;
            }
        }
    }

    let glProgram = gl.createProgram();
    if (glProgram) {
        gpuShader.glProgram = glProgram;

        // link program
        for (let i = 0; i < gpuShader.gpuStages.length; ++i) {
            let gpuStage = gpuShader.gpuStages[i];

            gl.attachShader(gpuShader.glProgram, gpuStage.glShader);
        }
    }

    gl.linkProgram(gpuShader.glProgram);
    var isSuccess = gl.getProgramParameter(gpuShader.glProgram, gl.LINK_STATUS);
    if (!isSuccess) {
        console.error("Failed to link shader '" + gpuShader.name + "'.");
        console.error(gl.getProgramInfoLog(gpuShader.glProgram));

        for (let i = 0; i < gpuShader.gpuStages.length; ++i) {
            let gpuStage = gpuShader.gpuStages[i];
            if (gpuStage.glShader > 0) {
                gl.deleteShader(gpuStage.glShader);
                gpuStage.glShader = 0;
            }
        }
    }

    // parse inputs
    let activeAttribCount = gl.getProgramParameter(gpuShader.glProgram, gl.ACTIVE_ATTRIBUTES);
    gpuShader.glInputs = new Array<WebGLGPUInput>(activeAttribCount);

    for (let i = 0; i < activeAttribCount; ++i) {
        let info = gl.getActiveAttrib(gpuShader.glProgram, i);
        if (info) {
            let glLoc = gl.getAttribLocation(gpuShader.glProgram, info.name);

            let varName: string;
            let nameOffset = info.name.search('[');
            if (nameOffset !== -1) {
                varName = info.name.substr(0, nameOffset);
            } else {
                varName = info.name;
            }

            let type = WebGLTypeToGFXType(info.type);
            let stride = WebGLGetTypeSize(info.type);

            gpuShader.glInputs[i] = {
                binding: -1,
                name: varName,
                type: type,
                stride: stride,
                count: info.size,
                size: stride * info.size,

                glType: info.type,
                glLoc: glLoc,
            };
        }
    }

    // create uniform blocks
    if (gpuShader.blocks.length > 0) {
        gpuShader.glBlocks = new Array<WebGLGPUUniformBlock>(gpuShader.blocks.length);
        for (let i = 0; i < gpuShader.blocks.length; ++i) {
            let block = gpuShader.blocks[i];
            let glBlock = gpuShader.glBlocks[i];
            glBlock.isUniformPackage = true;
            glBlock.binding = block.binding;
            glBlock.name = block.name;
        }
    }

    // parse uniforms
    let activeUniformCount = gl.getProgramParameter(gpuShader.glProgram, gl.ACTIVE_UNIFORMS);
    let unitIdx = 0;

    for (let i = 0; i < activeUniformCount; ++i) {
        let info = gl.getActiveUniform(gpuShader.glProgram, i);
        if (info) {
            let glLoc = gl.getUniformLocation(gpuShader.glProgram, info.name);
            if (glLoc) {
                let varName: string;
                let nameOffset = info.name.search('[');
                if (nameOffset !== -1) {
                    varName = info.name.substr(0, nameOffset);
                } else {
                    varName = info.name;
                }

                let type = WebGLTypeToGFXType(info.type);

                let isSampler = (type === WebGLRenderingContext.SAMPLER_2D) ||
                    (type === WebGLRenderingContext.SAMPLER_CUBE);

                if (!isSampler) {
                    let stride = WebGLGetTypeSize(info.type);

                    // build uniform block mapping
                    for (let b = 0; b < gpuShader.blocks.length; ++b) {

                        let block = gpuShader.blocks[b];
                        let glBlock = gpuShader.glBlocks[b];

                        for (let u = 0; u < block.uniforms.length; ++u) {
                            let uniform = block.uniforms[u];
                            if (uniform.name === varName) {
                                let varSize = stride * info.size;

                                glBlock.glUniforms.push({
                                    binding: -1,
                                    name: varName,
                                    type: type,
                                    stride: stride,
                                    count: info.size,
                                    size: varSize,
                                    offset: glBlock.size,

                                    glType: info.type,
                                    glLoc: glLoc,
                                    bufferView: null,
                                });

                                glBlock.size += varSize;

                                break;
                            }
                        }
                    } // for
                } else {

                    let units = new Array<number>(info.size);
                    for (let u = 0; u < info.size; ++u) {
                        units[u] = unitIdx + u;
                    }

                    gpuShader.glSamplers.push({
                        binding: -1,
                        name: varName,
                        type: type,
                        units: units,

                        glType: info.type,
                        glLoc: glLoc,
                    });

                    unitIdx += info.size;
                }
            }
        }
    } // for

    for (let b = 0; b < gpuShader.glBlocks.length; ++b) {

        let glBlock = gpuShader.glBlocks[b];
        glBlock.buffer = new ArrayBuffer(glBlock.size);
        glBlock.bufferView = new Buffer(glBlock.buffer);

        for (let u = 0; u < glBlock.glUniforms.length; ++u) {
            let glUniform = glBlock.glUniforms[u];
            if(glUniform.glLoc >= 0) {
                switch (glUniform.glType) {
                    case WebGLRenderingContext.BOOL:
                    case WebGLRenderingContext.BOOL_VEC2:
                    case WebGLRenderingContext.BOOL_VEC3:
                    case WebGLRenderingContext.BOOL_VEC4:
                    case WebGLRenderingContext.INT:
                    case WebGLRenderingContext.INT_VEC3:
                    case WebGLRenderingContext.INT_VEC2:
                    case WebGLRenderingContext.INT_VEC4: {
                        glUniform.bufferView = new Int32Array(glBlock.buffer, glUniform.offset, glUniform.count);
                        break;
                    }
                    default: {
                        glUniform.bufferView = new Float32Array(glBlock.buffer, glUniform.offset, glUniform.count);
                    }
                }
            }
        }
    }
}

export function WebGLCmdFuncDestroyShader(device: WebGLGFXDevice, gpuShader: WebGLGPUShader) {

    for (let i = 0; i < gpuShader.gpuStages.length; ++i) {
        let gpuStage = gpuShader.gpuStages[i];

        if (gpuStage.glShader > 0) {
            device.gl.deleteShader(gpuStage.glShader);
            gpuStage.glShader = 0;
        }
    }

    if (gpuShader.glProgram > 0) {
        device.gl.deleteProgram(gpuShader.glProgram);
        gpuShader.glProgram = 0;
    }
}

export function WebGLCmdFuncCreateInputAssember(device: WebGLGFXDevice, gpuInputAssembler: WebGLGPUInputAssembler) {

    if (gpuInputAssembler.gpuShader) {
        let attribCount = gpuInputAssembler.gpuShader.glInputs.length;
        gpuInputAssembler.glAttribs = new Array<WebGLAttrib>(attribCount);

        let offsets = [0, 0, 0, 0, 0, 0, 0, 0];

        for (let i = 0; i < attribCount; ++i) {
            let glInput = gpuInputAssembler.gpuShader.glInputs[i];
            let glAttrib = gpuInputAssembler.glAttribs[i];
            glAttrib.glLoc = glInput.glLoc;
            glAttrib.glType = glInput.glType;
            glAttrib.size = glInput.size;
            glAttrib.componentCount = WebGLGetComponentCount(glAttrib.glType);

            for (let j = 0; j < gpuInputAssembler.attributes.length; ++j) {
                let attrib = gpuInputAssembler.attributes[j];
                if (glInput.name === attrib.name && attrib.stream < gpuInputAssembler.gpuVertexBuffers.length) {

                    let gpuBuffer = gpuInputAssembler.gpuVertexBuffers[attrib.stream];
                    glAttrib.count = GFXFormatInfos[attrib.format].count;
                    glAttrib.stride = gpuBuffer.stride;
                    glAttrib.glBuffer = gpuBuffer.glBuffer;
                    glAttrib.isInstanced = attrib.isInstanced;

                    glAttrib.offset = offsets[attrib.stream];
                    offsets[attrib.stream] += glInput.size;
                    break;
                }
            }
        }
    }
}

export function WebGLCmdFuncDestroyInputAssembler(device: WebGLGFXDevice, gpuInputAssembler: WebGLGPUInputAssembler) {
}

export function WebGLCmdFuncExecuteCmds(device: WebGLGFXDevice, cmdPackage: WebGLCmdPackage) {

    let gl: WebGLRenderingContext = <WebGLRenderingContext>device.gl;

    let beginRenderPassCmdIdx = 0;
    let bindPipelineStateCmdIdx = 0;
    let bindBindingSetLayoutCmdIdx = 0;
    let bindInputAssemblerCmdIdx = 0;
    let drawCmdIdx = 0;
    let updateBufferCmdIdx = 0;

    let gpuShader: WebGLGPUShader | null = null;
    let gpuInputAssembler: WebGLGPUInputAssembler | null = null;
    let glPrimitive = WebGLRenderingContext.TRIANGLES;

    for (let i = 0; i < cmdPackage.cmds.length; ++i) {
        switch (cmdPackage.cmds[i]) {
            case WebGLCmd.BEGIN_RENDER_PASS: {
                let cmd = cmdPackage.beginRenderPassCmds[beginRenderPassCmdIdx++];
                //curGPUFramebuffer = cmd.gpuFramebuffer;

                let clears: GLbitfield = 0;

                if (cmd.gpuFramebuffer) {
                    if (device.stateCache.glFramebuffer !== cmd.gpuFramebuffer.glFramebuffer) {
                        gl.bindFramebuffer(WebGLRenderingContext.FRAMEBUFFER, cmd.gpuFramebuffer.glFramebuffer);
                        device.stateCache.glFramebuffer = cmd.gpuFramebuffer.glFramebuffer;
                    }

                    if (device.stateCache.viewport[0] !== cmd.viewport[0] ||
                        device.stateCache.viewport[1] !== cmd.viewport[1] ||
                        device.stateCache.viewport[2] !== cmd.viewport[2] ||
                        device.stateCache.viewport[3] !== cmd.viewport[3]) {

                        gl.viewport(cmd.viewport[0], cmd.viewport[1], cmd.viewport[2], cmd.viewport[3]);

                        device.stateCache.viewport[0] = cmd.viewport[0];
                        device.stateCache.viewport[1] = cmd.viewport[1];
                        device.stateCache.viewport[2] = cmd.viewport[2];
                        device.stateCache.viewport[3] = cmd.viewport[3];
                    }

                    if (device.stateCache.scissorRect[0] !== cmd.viewport[0] ||
                        device.stateCache.scissorRect[1] !== cmd.viewport[1] ||
                        device.stateCache.scissorRect[2] !== cmd.viewport[2] ||
                        device.stateCache.scissorRect[3] !== cmd.viewport[3]) {

                        gl.scissor(cmd.viewport[0], cmd.viewport[1], cmd.viewport[2], cmd.viewport[3]);

                        device.stateCache.scissorRect[0] = cmd.viewport[0];
                        device.stateCache.scissorRect[1] = cmd.viewport[1];
                        device.stateCache.scissorRect[2] = cmd.viewport[2];
                        device.stateCache.scissorRect[3] = cmd.viewport[3];
                    }

                    let curGPURenderPass = cmd.gpuFramebuffer.gpuRenderPass;

                    let invalidateAttachments: GLenum[] = [0, 0, 0, 0];
                    let numInvalidAttach = 0;

                    if (curGPURenderPass.colorAttachments.length > 0) {
                        let colorAttachment = curGPURenderPass.colorAttachments[0];

                        if (colorAttachment.format !== GFXFormat.UNKNOWN) {
                            switch (colorAttachment.loadOp) {
                                case GFXLoadOp.LOAD: break; // GL default behaviour
                                case GFXLoadOp.CLEAR: {

                                    if (device.stateCache.bs.targets[0].colorWriteMask !== GFXColorMask.ALL) {
                                        gl.colorMask(true, true, true, true);
                                    }

                                    gl.clearColor(cmd.clearColors[0], cmd.clearColors[1], cmd.clearColors[2], cmd.clearColors[3]);
                                    clears |= WebGLRenderingContext.COLOR_BUFFER_BIT;

                                    break;
                                }
                                case GFXLoadOp.DISCARD: {
                                    // invalidate the framebuffer
                                    invalidateAttachments[numInvalidAttach++] = WebGLRenderingContext.COLOR_ATTACHMENT0;
                                    break;
                                }
                                default: ;
                            }
                        }
                    } // if (curGPURenderPass)

                    if (curGPURenderPass.depthStencilAttachment) {

                        if (curGPURenderPass.depthStencilAttachment.format !== GFXFormat.UNKNOWN) {
                            switch (curGPURenderPass.depthStencilAttachment.depthLoadOp) {
                                case GFXLoadOp.LOAD: break; // GL default behaviour
                                case GFXLoadOp.CLEAR: {

                                    if (!device.stateCache.dss.isWriteDepth) {
                                        gl.depthMask(true);
                                    }

                                    gl.clearDepth(cmd.clearDepth);

                                    clears |= WebGLRenderingContext.DEPTH_BUFFER_BIT;

                                    break;
                                }
                                case GFXLoadOp.DISCARD: {
                                    // invalidate the framebuffer
                                    invalidateAttachments[numInvalidAttach++] = WebGLRenderingContext.DEPTH_ATTACHMENT;
                                    break;
                                }
                                default: ;
                            }

                            if (GFXFormatInfos[curGPURenderPass.depthStencilAttachment.format].hasStencil) {
                                switch (curGPURenderPass.depthStencilAttachment.stencilLoadOp) {
                                    case GFXLoadOp.LOAD: break; // GL default behaviour
                                    case GFXLoadOp.CLEAR: {

                                        if (!device.stateCache.dss.frontStencilWriteMask) {
                                            gl.stencilMaskSeparate(WebGLRenderingContext.FRONT, 0xFFFFFFFF);
                                        }

                                        if (!device.stateCache.dss.backStencilWriteMask) {
                                            gl.stencilMaskSeparate(WebGLRenderingContext.BACK, 0xFFFFFFFF);
                                        }

                                        gl.clearStencil(cmd.clearStencil);
                                        clears |= WebGLRenderingContext.STENCIL_BUFFER_BIT;

                                        break;
                                    }
                                    case GFXLoadOp.DISCARD: {
                                        // invalidate the framebuffer
                                        invalidateAttachments[numInvalidAttach++] = WebGLRenderingContext.STENCIL_ATTACHMENT;
                                        break;
                                    }
                                    default: ;
                                }
                            }
                        }
                    } // if (curGPURenderPass.depthStencilAttachment)

                    /*
                    if (numInvalidAttach) {
                        gl.invalidateFramebuffer(WebGLRenderingContext.FRAMEBUFFER, numInvalidAttach, invalidateAttachments);
                    }
                    */

                    if (clears) {
                        gl.clear(clears);
                    }

                    // restore states
                    if (clears & WebGLRenderingContext.COLOR_BUFFER_BIT) {

                        let colorMask = device.stateCache.bs.targets[0].colorWriteMask;
                        if (colorMask !== GFXColorMask.ALL) {
                            let r = (colorMask & GFXColorMask.R) != GFXColorMask.NONE;
                            let g = (colorMask & GFXColorMask.G) != GFXColorMask.NONE;
                            let b = (colorMask & GFXColorMask.B) != GFXColorMask.NONE;
                            let a = (colorMask & GFXColorMask.A) != GFXColorMask.NONE;
                            gl.colorMask(r, g, b, a);
                        }
                    }

                    if ((clears & WebGLRenderingContext.DEPTH_BUFFER_BIT) &&
                        !device.stateCache.dss.isWriteDepth) {
                        gl.depthMask(false);
                    }

                    if (clears & WebGLRenderingContext.STENCIL_BUFFER_BIT) {
                        if (!device.stateCache.dss.frontStencilWriteMask) {
                            gl.stencilMaskSeparate(WebGLRenderingContext.FRONT, 0);
                        }

                        if (!device.stateCache.dss.backStencilWriteMask) {
                            gl.stencilMaskSeparate(WebGLRenderingContext.BACK, 0);
                        }
                    }
                } // if (curGPURenderPass)

                break;
            }
            case WebGLCmd.END_RENDER_PASS: {
                // WebGL 1.0 doesn't support store operation of attachments.
                // GFXStoreOp.Store is the default GL behaviour.
                break;
            }
            case WebGLCmd.BIND_PIPELINE_STATE: {

                let cmd = cmdPackage.bindPipelineStateCmds[bindPipelineStateCmdIdx++];
                if (cmd.gpuPipelineState) {

                    glPrimitive = cmd.gpuPipelineState.glPrimitive;

                    if (cmd.gpuPipelineState.gpuShader) {

                        let glProgram = cmd.gpuPipelineState.gpuShader.glProgram;
                        if (device.stateCache.glProgram !== glProgram) {
                            gl.useProgram(glProgram);
                            device.stateCache.glProgram = glProgram;
                        }

                        gpuShader = cmd.gpuPipelineState.gpuShader;
                    }

                    // rasterizater state
                    let rs = cmd.gpuPipelineState.rs;
                    if (rs) {

                        if (device.stateCache.rs.cullMode !== rs.cullMode) {
                            switch (rs.cullMode) {
                                case GFXCullMode.NONE: {
                                    gl.disable(WebGLRenderingContext.CULL_FACE);
                                    break;
                                }
                                case GFXCullMode.FRONT: {
                                    gl.enable(WebGLRenderingContext.CULL_FACE);
                                    gl.cullFace(WebGLRenderingContext.FRONT);
                                    break;
                                }
                                case GFXCullMode.BACK: {
                                    gl.enable(WebGLRenderingContext.CULL_FACE);
                                    gl.cullFace(WebGLRenderingContext.BACK);
                                    break;
                                }
                                default: ;
                            }

                            device.stateCache.rs.cullMode = rs.cullMode;
                        }

                        if (device.stateCache.rs.isFrontFaceCCW !== rs.isFrontFaceCCW) {
                            gl.frontFace(rs.isFrontFaceCCW ? WebGLRenderingContext.CCW : WebGLRenderingContext.CW);
                            device.stateCache.rs.isFrontFaceCCW = rs.isFrontFaceCCW;
                        }

                        if ((device.stateCache.rs.depthBias !== rs.depthBias) ||
                            (device.stateCache.rs.depthBiasFactor !== rs.depthBiasFactor)) {
                            gl.polygonOffset(rs.depthBiasFactor, rs.depthBias);
                            device.stateCache.rs.depthBias = rs.depthBias;
                            device.stateCache.rs.depthBiasFactor = rs.depthBiasFactor;
                        }

                        if (device.stateCache.rs.lineWidth !== rs.lineWidth) {
                            gl.lineWidth(rs.lineWidth);
                            device.stateCache.rs.lineWidth = rs.lineWidth;
                        }
                    } // rasterizater state

                    // depth-stencil state
                    let dss = cmd.gpuPipelineState.dss;
                    if (dss) {

                        if (device.stateCache.dss.isDepthTest !== dss.isDepthTest) {
                            if (dss.isDepthTest) {
                                gl.enable(WebGLRenderingContext.DEPTH_TEST);
                            } else {
                                gl.disable(WebGLRenderingContext.DEPTH_TEST);
                            }
                            device.stateCache.dss.isDepthTest = dss.isDepthTest;
                        }

                        if (device.stateCache.dss.isWriteDepth !== dss.isWriteDepth) {
                            gl.depthMask(dss.isWriteDepth);
                            device.stateCache.dss.isWriteDepth = dss.isWriteDepth;
                        }

                        if (device.stateCache.dss.depthFunc !== dss.depthFunc) {
                            gl.depthFunc(WebGLCmpFuncs[dss.depthFunc]);
                            device.stateCache.dss.depthFunc = dss.depthFunc;
                        }

                        // front
                        if ((device.stateCache.dss.isFrontStencilTest !== dss.isFrontStencilTest) ||
                            (device.stateCache.dss.isBackStencilTest !== dss.isBackStencilTest)) {
                            if (dss.isFrontStencilTest || dss.isBackStencilTest) {
                                gl.enable(WebGLRenderingContext.STENCIL_TEST);
                            } else {
                                gl.disable(WebGLRenderingContext.STENCIL_TEST);
                            }
                            device.stateCache.dss.isFrontStencilTest = dss.isFrontStencilTest;
                            device.stateCache.dss.isBackStencilTest = dss.isBackStencilTest;
                        }

                        if ((device.stateCache.dss.frontStencilFunc !== dss.frontStencilFunc) ||
                            (device.stateCache.dss.frontStencilRef !== dss.frontStencilRef) ||
                            (device.stateCache.dss.frontStencilReadMask !== dss.frontStencilReadMask)) {

                            gl.stencilFuncSeparate(
                                WebGLRenderingContext.FRONT,
                                WebGLCmpFuncs[dss.frontStencilFunc],
                                dss.frontStencilRef,
                                dss.frontStencilReadMask);

                            device.stateCache.dss.frontStencilFunc = dss.frontStencilFunc;
                            device.stateCache.dss.frontStencilRef = dss.frontStencilRef;
                            device.stateCache.dss.frontStencilReadMask = dss.frontStencilReadMask;
                        }

                        if ((device.stateCache.dss.frontStencilFailOp !== dss.frontStencilFailOp) ||
                            (device.stateCache.dss.frontStencilDepthFailOp !== dss.frontStencilDepthFailOp) ||
                            (device.stateCache.dss.frontStencilPassOp !== dss.frontStencilPassOp)) {

                            gl.stencilOpSeparate(
                                WebGLRenderingContext.FRONT,
                                WebGLStencilOps[dss.frontStencilFailOp],
                                WebGLStencilOps[dss.frontStencilDepthFailOp],
                                WebGLStencilOps[dss.frontStencilPassOp]);

                            device.stateCache.dss.frontStencilFailOp = dss.frontStencilFailOp;
                            device.stateCache.dss.frontStencilDepthFailOp = dss.frontStencilDepthFailOp;
                            device.stateCache.dss.frontStencilPassOp = dss.frontStencilPassOp;
                        }

                        if (device.stateCache.dss.frontStencilWriteMask !== dss.frontStencilWriteMask) {
                            gl.stencilMaskSeparate(WebGLRenderingContext.FRONT, dss.frontStencilWriteMask);
                            device.stateCache.dss.frontStencilWriteMask = dss.frontStencilWriteMask;
                        }

                        // back
                        if ((device.stateCache.dss.backStencilFunc !== dss.backStencilFunc) ||
                            (device.stateCache.dss.backStencilRef !== dss.backStencilRef) ||
                            (device.stateCache.dss.backStencilReadMask !== dss.backStencilReadMask)) {

                            gl.stencilFuncSeparate(
                                WebGLRenderingContext.BACK,
                                WebGLCmpFuncs[dss.backStencilFunc],
                                dss.backStencilRef,
                                dss.backStencilReadMask);

                            device.stateCache.dss.backStencilFunc = dss.backStencilFunc;
                            device.stateCache.dss.backStencilRef = dss.backStencilRef;
                            device.stateCache.dss.backStencilReadMask = dss.backStencilReadMask;
                        }

                        if ((device.stateCache.dss.backStencilFailOp !== dss.backStencilFailOp) ||
                            (device.stateCache.dss.backStencilDepthFailOp !== dss.backStencilDepthFailOp) ||
                            (device.stateCache.dss.backStencilPassOp !== dss.backStencilPassOp)) {

                            gl.stencilOpSeparate(
                                WebGLRenderingContext.BACK,
                                WebGLStencilOps[dss.backStencilFailOp],
                                WebGLStencilOps[dss.backStencilDepthFailOp],
                                WebGLStencilOps[dss.backStencilPassOp]);

                            device.stateCache.dss.backStencilFailOp = dss.backStencilFailOp;
                            device.stateCache.dss.backStencilDepthFailOp = dss.backStencilDepthFailOp;
                            device.stateCache.dss.backStencilPassOp = dss.backStencilPassOp;
                        }

                        if (device.stateCache.dss.backStencilWriteMask !== dss.backStencilWriteMask) {
                            gl.stencilMaskSeparate(WebGLRenderingContext.BACK, dss.backStencilWriteMask);
                            device.stateCache.dss.backStencilWriteMask = dss.backStencilWriteMask;
                        }
                    } // depth-stencil state

                    // blend state
                    let bs = cmd.gpuPipelineState.bs;
                    if (bs) {

                        if (device.stateCache.bs.isA2C !== bs.isA2C) {
                            if (bs.isA2C) {
                                gl.enable(WebGLRenderingContext.SAMPLE_ALPHA_TO_COVERAGE);
                            } else {
                                gl.disable(WebGLRenderingContext.SAMPLE_ALPHA_TO_COVERAGE);
                            }
                            device.stateCache.bs.isA2C = bs.isA2C;
                        }

                        if ((device.stateCache.bs.factor[0] !== bs.factor[0]) ||
                            (device.stateCache.bs.factor[1] !== bs.factor[1]) ||
                            (device.stateCache.bs.factor[2] !== bs.factor[2]) ||
                            (device.stateCache.bs.factor[3] !== bs.factor[3])) {

                            gl.blendColor(bs.factor[0], bs.factor[1], bs.factor[2], bs.factor[3]);

                            device.stateCache.bs.factor[0] = bs.factor[0];
                            device.stateCache.bs.factor[1] = bs.factor[1];
                            device.stateCache.bs.factor[2] = bs.factor[2];
                            device.stateCache.bs.factor[3] = bs.factor[3];
                        }

                        let target0 = bs.targets[0];
                        let catchTarget0 = device.stateCache.bs.targets[0];

                        if (catchTarget0.isBlend !== target0.isBlend) {
                            if (target0.isBlend) {
                                gl.enable(WebGLRenderingContext.BLEND);
                            } else {
                                gl.disable(WebGLRenderingContext.BLEND);
                            }
                            catchTarget0.isBlend = target0.isBlend;
                        }

                        if ((catchTarget0.blendOp !== target0.blendOp) ||
                            (catchTarget0.alphBlendOp !== target0.alphBlendOp)) {

                            gl.blendEquationSeparate(WebGLBlendOps[target0.blendOp], WebGLBlendOps[target0.alphBlendOp]);

                            catchTarget0.blendOp = target0.blendOp;
                            catchTarget0.alphBlendOp = target0.alphBlendOp;
                        }

                        if ((catchTarget0.srcBlend !== target0.srcBlend) ||
                            (catchTarget0.dstBlend !== target0.dstBlend) ||
                            (catchTarget0.srcAlphaBlend !== target0.srcAlphaBlend) ||
                            (catchTarget0.dstAlphaBlend !== target0.dstAlphaBlend)) {

                            gl.blendFuncSeparate(
                                WebGLBlendFactors[target0.srcBlend],
                                WebGLBlendFactors[target0.dstBlend],
                                WebGLBlendFactors[target0.srcAlphaBlend],
                                WebGLBlendFactors[target0.dstAlphaBlend]);

                            catchTarget0.srcBlend = target0.srcBlend;
                            catchTarget0.dstBlend = target0.dstBlend;
                            catchTarget0.srcAlphaBlend = target0.srcAlphaBlend;
                            catchTarget0.dstAlphaBlend = target0.dstAlphaBlend;
                        }

                        if (catchTarget0.colorWriteMask !== target0.colorWriteMask) {

                            gl.colorMask(
                                (target0.colorWriteMask & GFXColorMask.R) !== GFXColorMask.NONE,
                                (target0.colorWriteMask & GFXColorMask.G) !== GFXColorMask.NONE,
                                (target0.colorWriteMask & GFXColorMask.B) !== GFXColorMask.NONE,
                                (target0.colorWriteMask & GFXColorMask.A) !== GFXColorMask.NONE);

                            catchTarget0.colorWriteMask = target0.colorWriteMask;
                        }
                    } // blend state
                }

                break;
            }
            case WebGLCmd.BIND_BINDING_SET_LAYOUT: {

                let cmd = cmdPackage.bindBindingSetLayoutCmds[bindBindingSetLayoutCmdIdx++];
                if (cmd.gpuBindingSetLayout && gpuShader) {
                    for (let n = 0; n < cmd.gpuBindingSetLayout.gpuBinding.length; ++n) {
                        let gpuBinding = cmd.gpuBindingSetLayout.gpuBinding[n];

                        switch (gpuBinding.type) {
                            case GFXBindingType.UNIFORM_BUFFER: {

                                if (gpuBinding.gpuBuffer && gpuBinding.gpuBuffer.buffer) {

                                    let glBlock: WebGLGPUUniformBlock | null = null;

                                    for (let b = 0; b < gpuShader.glBlocks.length; ++b) {
                                        if (gpuShader.glBlocks[b].binding === gpuBinding.binding) {
                                            glBlock = gpuShader.glBlocks[b];
                                            break;
                                        }
                                    }

                                    if (glBlock && glBlock.bufferView) {
                                        for (let u = 0; u < glBlock.glUniforms.length; ++u) {
                                            let glUniform = glBlock.glUniforms[u];
                                            if (glUniform.glLoc >= 0 && 
                                                glBlock.bufferView.compare(gpuBinding.gpuBuffer.buffer, glUniform.offset, glUniform.size, glUniform.offset, glUniform.size) != 0) {

                                                switch (glUniform.glType) {
                                                    case WebGLRenderingContext.BOOL:
                                                    case WebGLRenderingContext.INT: {
                                                        gl.uniform1iv(glUniform.glLoc, <Int32Array>glUniform.bufferView);
                                                        break;
                                                    }
                                                    case WebGLRenderingContext.BOOL_VEC2:
                                                    case WebGLRenderingContext.INT_VEC2: {
                                                        gl.uniform2iv(glUniform.glLoc, <Int32Array>glUniform.bufferView);
                                                        break;
                                                    }
                                                    case WebGLRenderingContext.BOOL_VEC3:
                                                    case WebGLRenderingContext.INT_VEC3: {
                                                        gl.uniform3iv(glUniform.glLoc, <Int32Array>glUniform.bufferView);
                                                        break;
                                                    }
                                                    case WebGLRenderingContext.BOOL_VEC4:
                                                    case WebGLRenderingContext.INT_VEC4: {
                                                        gl.uniform4iv(glUniform.glLoc, <Int32Array>glUniform.bufferView);
                                                        break;
                                                    }
                                                    case WebGLRenderingContext.FLOAT: {
                                                        gl.uniform1fv(glUniform.glLoc, <Float32Array>glUniform.bufferView);
                                                        break;
                                                    }
                                                    case WebGLRenderingContext.FLOAT_VEC2: {
                                                        gl.uniform2fv(glUniform.glLoc, <Float32Array>glUniform.bufferView);
                                                        break;
                                                    }
                                                    case WebGLRenderingContext.FLOAT_VEC3: {
                                                        gl.uniform3fv(glUniform.glLoc, <Float32Array>glUniform.bufferView);
                                                        break;
                                                    }
                                                    case WebGLRenderingContext.FLOAT_VEC4: {
                                                        gl.uniform4fv(glUniform.glLoc, <Float32Array>glUniform.bufferView);
                                                        break;
                                                    }
                                                    case WebGLRenderingContext.FLOAT_MAT2: {
                                                        gl.uniformMatrix2fv(glUniform.glLoc, false, <Float32Array>glUniform.bufferView);
                                                        break;
                                                    }
                                                    case WebGLRenderingContext.FLOAT_MAT3: {
                                                        gl.uniformMatrix2fv(glUniform.glLoc, false, <Float32Array>glUniform.bufferView);
                                                        break;
                                                    }
                                                    case WebGLRenderingContext.FLOAT_MAT4: {
                                                        gl.uniformMatrix2fv(glUniform.glLoc, false, <Float32Array>glUniform.bufferView);
                                                        break;
                                                    }
                                                    default: ;
                                                }
                                            } // if
                                        }
                                    }
                                } // if
                                break;
                            }
                        }
                    }
                }

                break;
            }
            case WebGLCmd.BIND_INPUT_ASSEMBLER: {
                let cmd = cmdPackage.bindInputAssemblerCmds[bindInputAssemblerCmdIdx++];
                gpuInputAssembler = cmd.gpuInputAssembler;
                break;
            }
            case WebGLCmd.DRAW: {
                if (gpuInputAssembler) {
                    let cmd = cmdPackage.drawCmds[drawCmdIdx++];

                    for (let a = 0; a < GFX_MAX_VERTEX_ATTRIBUTES; ++a) {
                        device.stateCache.glCurrentAttribLocs[a] = false;
                    }

                    for (let a = 0; a < gpuInputAssembler.glAttribs.length; ++a) {
                        let glAttrib = gpuInputAssembler.glAttribs[a];

                        if (device.stateCache.glArrayBuffer !== glAttrib.glBuffer) {
                            gl.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, glAttrib.glBuffer);
                            device.stateCache.glArrayBuffer = glAttrib.glBuffer;
                        }

                        for (let c = 0; c < glAttrib.componentCount; ++c) {
                            let glLoc = glAttrib.glLoc + c;
                            let offset = glAttrib.offset + glAttrib.size * c;

                            if (!device.stateCache.glEnabledAttribLocs[a]) {
                                gl.enableVertexAttribArray(glLoc);
                                device.stateCache.glEnabledAttribLocs[a] = true;
                            }
                            device.stateCache.glCurrentAttribLocs[a] = true;

                            gl.vertexAttribPointer(glLoc, glAttrib.count, glAttrib.glType, false, glAttrib.stride, offset);
                        }
                    }

                    for (let a = 0; a < GFX_MAX_VERTEX_ATTRIBUTES; ++a) {
                        if (device.stateCache.glEnabledAttribLocs[a] != device.stateCache.glCurrentAttribLocs[a]) {
                            gl.disableVertexAttribArray(a);
                            device.stateCache.glEnabledAttribLocs[a] = false;
                        }
                    }

                    if (gpuInputAssembler.gpuIndexBuffer && cmd.indexCount > 0) {
                        let gpuBuffer = gpuInputAssembler.gpuIndexBuffer;

                        if (device.stateCache.glElementArrayBuffer !== gpuBuffer.glBuffer) {
                            gl.bindBuffer(WebGLRenderingContext.ELEMENT_ARRAY_BUFFER, gpuBuffer.glBuffer);
                            device.stateCache.glElementArrayBuffer = gpuBuffer.glBuffer;
                        }

                        let offset = cmd.firstIndex * gpuBuffer.stride;
                        gl.drawElements(glPrimitive, cmd.indexCount, gpuInputAssembler.glIndexType, offset);
                    } else {
                        gl.drawArrays(glPrimitive, cmd.firstVertex, cmd.vertexCount);
                    }
                }
                break;
            }
            case WebGLCmd.UPDATE_BUFFER: {

                let cmd = cmdPackage.updateBufferCmds[updateBufferCmdIdx++];
                if (cmd.gpuBuffer) {
                    switch (cmd.gpuBuffer.glTarget) {
                        case WebGLRenderingContext.ARRAY_BUFFER: {
                            if (device.stateCache.glArrayBuffer !== cmd.gpuBuffer.glBuffer) {
                                gl.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, cmd.gpuBuffer.glBuffer);
                                device.stateCache.glArrayBuffer = cmd.gpuBuffer.glBuffer;
                            }
                            break;
                        }
                        case WebGLRenderingContext.ELEMENT_ARRAY_BUFFER: {
                            if (device.stateCache.glElementArrayBuffer !== cmd.gpuBuffer.glBuffer) {
                                gl.bindBuffer(WebGLRenderingContext.ELEMENT_ARRAY_BUFFER, cmd.gpuBuffer.glBuffer);
                                device.stateCache.glElementArrayBuffer = cmd.gpuBuffer.glBuffer;
                            }
                            break;
                        }
                        default: {
                            console.error("Unsupported GFXBufferType, update buffer failed.");
                            continue;
                        }
                    }

                    if (cmd.data) {
                        gl.bufferSubData(cmd.gpuBuffer.glTarget, cmd.offset, cmd.data);
                    }
                }

                break;
            }
        }
    }
}