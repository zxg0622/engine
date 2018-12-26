// Extensions
export const enum WebGLEXT {
    COMPRESSED_RGB_S3TC_DXT1_EXT = 0x83F0,
    COMPRESSED_RGBA_S3TC_DXT1_EXT = 0x83F1,
    COMPRESSED_RGBA_S3TC_DXT3_EXT = 0x83F2,
    COMPRESSED_RGBA_S3TC_DXT5_EXT = 0x83F3,

    COMPRESSED_SRGB_S3TC_DXT1_EXT = 0x8C4C,
    COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT = 0x8C4D,
    COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT = 0x8C4E,
    COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT = 0x8C4F,

    COMPRESSED_RGB_PVRTC_4BPPV1_IMG = 0x8C00,
    COMPRESSED_RGB_PVRTC_2BPPV1_IMG = 0x8C01,
    COMPRESSED_RGBA_PVRTC_4BPPV1_IMG = 0x8C02,
    COMPRESSED_RGBA_PVRTC_2BPPV1_IMG = 0x8C03,
    
    COMPRESSED_RGB_ETC1_WEBGL = 0x8D64,
};

export const GFX_MAX_VERTEX_ATTRIBUTES : number = 8;
export const GFX_MAX_TEXTURE_UNITS : number = 16;
export const GFX_MAX_ATTACHMENTS : number = 4;

export enum GFXType {
    UNKNOWN,
    BOOL,
    BOOL2,
    BOOL3,
    BOOL4,
    INT,
    INT2,
    INT3,
    INT4,
    UINT,
    UINT2,
    UINT3,
    UINT4,
    FLOAT,
    FLOAT2,
    FLOAT3,
    FLOAT4,
    MAT2,
    MAT2X3,
    MAT2X4,
    MAT3X2,
    MAT3,
    MAT3X4,
    MAT4X2,
    MAT4X3,
    MAT4,
    SAMPLER1D,
    SAMPLER1D_ARRAY,
    SAMPLER2D,
    SAMPLER2D_ARRAY,
    SAMPLER3D,
    SAMPLER_CUBE,
    COUNT,
};

export const enum GFXFormat {
   
    UNKNOWN,

    A8,
    L8,
    LA8,

    R8,
    R8SN,
    R8UI,
    R8I,
    R16F,
    R16UI,
    R16I,
    R32F,
    R32UI,
    R32I,

    RG8,
    RG8SN,
    RG8UI,
    RG8I,
    RG16F,
    RG16UI,
    RG16I,
    RG32F,
    RG32UI,
    RG32I,

    RGB8,
    SRGB8,
    RGB8SN,
    RGB8UI,
    RGB8I,
    RGB16F,
    RGB16UI,
    RGB16I,
    RGB32F,
    RGB32UI,
    RGB32I,

    RGBA8,
    SRGB8_A8,
    RGBA8SN,
    RGBA8UI,
    RGBA8I,
    RGBA16F,
    RGBA16UI,
    RGBA16I,
    RGBA32F,
    RGBA32UI,
    RGBA32I,

    // Special Format
    R5G6B5,
    R11G11B10F,
    RGB5A1,
    RGBA4,
    RGB10A2,
    RGB10A2UI,
    RGB9E5,

    // Depth-Stencil Format
    D16,
    D24,
    D24S8,
    D32F,
    D32F_S8,

    // Compressed Format

    // Block Compression Format, DDS (DirectDraw Surface)
    // DXT1: 3 channels (5:6:5), 1/8 origianl size, with 0 or 1 bit of alpha
    BC1,
    BC1_ALPHA,
    BC1_SRGB,
    BC1_SRGB_ALPHA,
    // DXT3: 4 channels (5:6:5), 1/4 origianl size, with 4 bits of alpha
    BC2,
    BC2_SRGB,
    // DXT5: 4 channels (5:6:5), 1/4 origianl size, with 8 bits of alpha
    BC3,
    BC3_SRGB,
    // 1 channel (8), 1/4 origianl size
    BC4,
    BC4_SNORM,
    // 2 channels (8:8), 1/2 origianl size
    BC5,
    BC5_SNORM,
    // 3 channels (16:16:16), half-floating point, 1/6 origianl size
    // UF16: unsigned float, 5 exponent bits + 11 mantissa bits
    // SF16: signed float, 1 signed bit + 5 exponent bits + 10 mantissa bits
    BC6H_UF16,
    BC6H_SF16,
    // 4 channels (4~7 bits per channel) with 0 to 8 bits of alpha, 1/3 original size
    BC7,
    BC7_SRGB,

    // Ericsson Texture Compression Format
    ETC_RGB8,
    ETC2_RGB8,
    ETC2_SRGB8,
    ETC2_RGB8_A1,
    ETC2_SRGB8_A1,
    ETC2_RGBA8,
    ETC2_SRGB8_A8,
    EAC_R11,
    EAC_R11SN,
    EAC_RG11,
    EAC_RG11SN,

    // PVRTC (PowerVR)
    PVRTC_RGB2,
    PVRTC_RGBA2,
    PVRTC_RGB4,
    PVRTC_RGBA4,
    PVRTC2_2BPP,
    PVRTC2_4BPP,
};

export class GFXFormatInfo {
    readonly name : string = "UNKNOWN";
    readonly size : number = 0;
    readonly count : number = 0;
    readonly isFloating : boolean = false;
    readonly hasAlpha : boolean = false;
    readonly hasDepth : boolean = false;
    readonly hasStencil : boolean = false;
    readonly isCompressed : boolean = false;
};

export const GFXFormatInfos : GFXFormatInfo[] = [
    
    { name : "UNKNOWN", size : 0, count : 0, isFloating : false, hasAlpha : false, hasDepth : false, hasStencil : false, isCompressed : false },

    { name : "A8", size : 1, count : 1, isFloating : false, hasAlpha : true, hasDepth : false, hasStencil : false, isCompressed : false },
    { name : "L8", size : 1, count : 1, isFloating : false, hasAlpha : false, hasDepth : false, hasStencil : false, isCompressed : false },
    { name : "LA8", size : 1, count : 2, isFloating : false, hasAlpha : true, hasDepth : false, hasStencil : false, isCompressed : false },

    { name : "R8", size : 1, count : 1, isFloating : false, hasAlpha : false, hasDepth : false, hasStencil : false, isCompressed : false },
    { name : "R8SN", size : 1, count : 1, isFloating : false, hasAlpha : false, hasDepth : false, hasStencil : false, isCompressed : false },
    { name : "R8UI", size : 1, count : 1, isFloating : false, hasAlpha : false, hasDepth : false, hasStencil : false, isCompressed : false },
    { name : "R8I", size : 1, count : 1, isFloating : false, hasAlpha : false, hasDepth : false, hasStencil : false, isCompressed : false },
    { name : "R16F", size : 2, count : 1, isFloating : true, hasAlpha : false, hasDepth : false, hasStencil : false, isCompressed : false },
    { name : "R16UI", size : 2, count : 1, isFloating : false, hasAlpha : false, hasDepth : false, hasStencil : false, isCompressed : false },
    { name : "R16I", size : 2, count : 1, isFloating : false, hasAlpha : false, hasDepth : false, hasStencil : false, isCompressed : false },
    { name : "R32F", size : 4, count : 1, isFloating : true, hasAlpha : false, hasDepth : false, hasStencil : false, isCompressed : false },
    { name : "R32UI", size : 4, count : 1, isFloating : false, hasAlpha : false, hasDepth : false, hasStencil : false, isCompressed : false },
    { name : "R32I", size : 4, count : 1, isFloating : false, hasAlpha : false, hasDepth : false, hasStencil : false, isCompressed : false },

    { name : "RG8", size : 2, count : 2, isFloating : false, hasAlpha : false, hasDepth : false, hasStencil : false, isCompressed : false },
    { name : "RG8SN", size : 2, count : 2, isFloating : false, hasAlpha : false, hasDepth : false, hasStencil : false, isCompressed : false },
    { name : "RG8UI", size : 2, count : 2, isFloating : false, hasAlpha : false, hasDepth : false, hasStencil : false, isCompressed : false },
    { name : "RG8I", size : 2, count : 2, isFloating : false, hasAlpha : false, hasDepth : false, hasStencil : false, isCompressed : false },
    { name : "RG16F", size : 4, count : 2, isFloating : true, hasAlpha : false, hasDepth : false, hasStencil : false, isCompressed : false },
    { name : "RG16UI", size : 4, count : 2, isFloating : false, hasAlpha : false, hasDepth : false, hasStencil : false, isCompressed : false },
    { name : "RG16I", size : 4, count : 2, isFloating : false, hasAlpha : false, hasDepth : false, hasStencil : false, isCompressed : false },
    { name : "RG32F", size : 8, count : 2, isFloating : true, hasAlpha : false, hasDepth : false, hasStencil : false, isCompressed : false },
    { name : "RG32UI", size : 8, count : 2, isFloating : false, hasAlpha : false, hasDepth : false, hasStencil : false, isCompressed : false },
    { name : "RG32I", size : 8, count : 2, isFloating : false, hasAlpha : false, hasDepth : false, hasStencil : false, isCompressed : false },

    { name : "RGB8", size : 3, count : 3, isFloating : false, hasAlpha : false, hasDepth : false, hasStencil : false, isCompressed : false },
    { name : "SRGB8", size : 3, count : 3, isFloating : false, hasAlpha : false, hasDepth : false, hasStencil : false, isCompressed : false },
    { name : "RGB8SN", size : 3, count : 3, isFloating : false, hasAlpha : false, hasDepth : false, hasStencil : false, isCompressed : false },
    { name : "RGB8UI", size : 3, count : 3, isFloating : false, hasAlpha : false, hasDepth : false, hasStencil : false, isCompressed : false },
    { name : "RGB8I", size : 3, count : 3, isFloating : false, hasAlpha : false, hasDepth : false, hasStencil : false, isCompressed : false },
    { name : "RGB16F", size : 6, count : 3, isFloating : true, hasAlpha : false, hasDepth : false, hasStencil : false, isCompressed : false },
    { name : "RGB16UI", size : 6, count : 3, isFloating : false, hasAlpha : false, hasDepth : false, hasStencil : false, isCompressed : false },
    { name : "RGB16I", size : 6, count : 3, isFloating : false, hasAlpha : false, hasDepth : false, hasStencil : false, isCompressed : false },
    { name : "RGB32F", size : 12, count : 3, isFloating : true, hasAlpha : false, hasDepth : false, hasStencil : false, isCompressed : false },
    { name : "RGB32UI", size : 12, count : 3, isFloating : false, hasAlpha : false, hasDepth : false, hasStencil : false, isCompressed : false },
    { name : "RGB32I", size : 12, count : 3, isFloating : false, hasAlpha : false, hasDepth : false, hasStencil : false, isCompressed : false },

    { name : "RGBA8", size : 4, count : 4, isFloating : false, hasAlpha : true, hasDepth : false, hasStencil : false, isCompressed : false },
    { name : "SRGB8_A8", size : 4, count : 4, isFloating : false, hasAlpha : true, hasDepth : false, hasStencil : false, isCompressed : false },
    { name : "RGBA8SN", size : 4, count : 4, isFloating : false, hasAlpha : true, hasDepth : false, hasStencil : false, isCompressed : false },
    { name : "RGBA8UI", size : 4, count : 4, isFloating : false, hasAlpha : true, hasDepth : false, hasStencil : false, isCompressed : false },
    { name : "RGBA8I", size : 4, count : 4, isFloating : false, hasAlpha : true, hasDepth : false, hasStencil : false, isCompressed : false },
    { name : "RGBA16F", size : 8, count : 4, isFloating : true, hasAlpha : true, hasDepth : false, hasStencil : false, isCompressed : false },
    { name : "RGBA16UI", size : 8, count : 4, isFloating : false, hasAlpha : true, hasDepth : false, hasStencil : false, isCompressed : false },
    { name : "RGBA16I", size : 8, count : 4, isFloating : false, hasAlpha : true, hasDepth : false, hasStencil : false, isCompressed : false },
    { name : "RGBA32F", size : 16, count : 4, isFloating : true, hasAlpha : true, hasDepth : false, hasStencil : false, isCompressed : false },
    { name : "RGBA32UI", size : 16, count : 4, isFloating : false, hasAlpha : true, hasDepth : false, hasStencil : false, isCompressed : false },
    { name : "RGBA32I", size : 16, count : 4, isFloating : false, hasAlpha : true, hasDepth : false, hasStencil : false, isCompressed : false },

    { name : "R5G6B5", size : 2, count : 3, isFloating : false, hasAlpha : false, hasDepth : false, hasStencil : false, isCompressed : false },
    { name : "R11G11B10F", size : 4, count : 3, isFloating : true, hasAlpha : false, hasDepth : false, hasStencil : false, isCompressed : false },
    { name : "RGB5A1", size : 2, count : 4, isFloating : false, hasAlpha : true, hasDepth : false, hasStencil : false, isCompressed : false },
    { name : "RGBA4", size : 2, count : 4, isFloating : false, hasAlpha : true, hasDepth : false, hasStencil : false, isCompressed : false },
    { name : "RGB10A2", size : 2, count : 4, isFloating : false, hasAlpha : true, hasDepth : false, hasStencil : false, isCompressed : false },
    { name : "RGB10A2UI", size : 2, count : 4, isFloating : false, hasAlpha : true, hasDepth : false, hasStencil : false, isCompressed : false },
    { name : "RGB9E5", size : 2, count : 4, isFloating : false, hasAlpha : true, hasDepth : false, hasStencil : false, isCompressed : false },

    { name : "D16", size : 2, count : 1, isFloating : false, hasAlpha : false, hasDepth : true, hasStencil : false, isCompressed : false },
    { name : "D24", size : 3, count : 1, isFloating : false, hasAlpha : false, hasDepth : true, hasStencil : false, isCompressed : false },
    { name : "D24S8", size : 4, count : 2, isFloating : false, hasAlpha : false, hasDepth : true, hasStencil : true, isCompressed : false },
    { name : "D32F", size : 4, count : 1, isFloating : true, hasAlpha : false, hasDepth : true, hasStencil : false, isCompressed : false },
    { name : "D32FS8", size : 5, count : 2, isFloating : true, hasAlpha : false, hasDepth : true, hasStencil : true, isCompressed : false },

    { name : "BC1", size : 1, count : 3, isFloating : false, hasAlpha : false, hasDepth : false, hasStencil : false, isCompressed : true },
    { name : "BC1_ALPHA", size : 1, count : 4, isFloating : false, hasAlpha : true, hasDepth : false, hasStencil : false, isCompressed : true },
    { name : "BC1_SRGB", size : 1, count : 3, isFloating : false, hasAlpha : false, hasDepth : false, hasStencil : false, isCompressed : true },
    { name : "BC1_SRGB_ALPHA", size : 1, count : 4, isFloating : false, hasAlpha : true, hasDepth : false, hasStencil : false, isCompressed : true },
    { name : "BC2", size : 1, count : 4, isFloating : false, hasAlpha : true, hasDepth : false, hasStencil : false, isCompressed : true },
    { name : "BC2_SRGB", size : 1, count : 4, isFloating : false, hasAlpha : true, hasDepth : false, hasStencil : false, isCompressed : true },
    { name : "BC3", size : 1, count : 4, isFloating : false, hasAlpha : true, hasDepth : false, hasStencil : false, isCompressed : true },
    { name : "BC3_SRGB", size : 1, count : 4, isFloating : false, hasAlpha : true, hasDepth : false, hasStencil : false, isCompressed : true },
    { name : "BC4", size : 1, count : 1, isFloating : false, hasAlpha : false, hasDepth : false, hasStencil : false, isCompressed : true },
    { name : "BC4_SNORM", size : 1, count : 1, isFloating : false, hasAlpha : false, hasDepth : false, hasStencil : false, isCompressed : true },
    { name : "BC5", size : 1, count : 2, isFloating : false, hasAlpha : false, hasDepth : false, hasStencil : false, isCompressed : true },
    { name : "BC5_SNORM", size : 1, count : 2, isFloating : false, hasAlpha : false, hasDepth : false, hasStencil : false, isCompressed : true },
    { name : "BC6H_UF16", size : 1, count : 3, isFloating : false, hasAlpha : false, hasDepth : false, hasStencil : false, isCompressed : true },
    { name : "BC6H_SF16", size : 1, count : 3, isFloating : false, hasAlpha : false, hasDepth : false, hasStencil : false, isCompressed : true },
    { name : "BC7", size : 1, count : 4, isFloating : false, hasAlpha : true, hasDepth : false, hasStencil : false, isCompressed : true },
    { name : "BC7_SRGB", size : 1, count : 4, isFloating : false, hasAlpha : true, hasDepth : false, hasStencil : false, isCompressed : true },

    { name : "ETC_RGB8", size : 1, count : 3, isFloating : false, hasAlpha : false, hasDepth : false, hasStencil : false, isCompressed : true },
    { name : "ETC2_RGB8", size : 1, count : 3, isFloating : false, hasAlpha : false, hasDepth : false, hasStencil : false, isCompressed : true },
    { name : "ETC2_SRGB8", size : 1, count : 3, isFloating : false, hasAlpha : false, hasDepth : false, hasStencil : false, isCompressed : true },
    { name : "ETC2_RGB8_A1", size : 1, count : 4, isFloating : false, hasAlpha : true, hasDepth : false, hasStencil : false, isCompressed : true },
    { name : "ETC2_SRGB8_A1", size : 1, count : 4, isFloating : false, hasAlpha : true, hasDepth : false, hasStencil : false, isCompressed : true },
    { name : "ETC2_RGBA8", size : 2, count : 4, isFloating : false, hasAlpha : true, hasDepth : false, hasStencil : false, isCompressed : true },
    { name : "ETC2_SRGB8_A8", size : 2, count : 4, isFloating : false, hasAlpha : true, hasDepth : false, hasStencil : false, isCompressed : true },
    { name : "EAC_R11", size : 1, count : 1, isFloating : false, hasAlpha : false, hasDepth : false, hasStencil : false, isCompressed : true },
    { name : "EAC_R11SN", size : 1, count : 1, isFloating : false, hasAlpha : false, hasDepth : false, hasStencil : false, isCompressed : true },
    { name : "EAC_RG11", size : 2, count : 2, isFloating : false, hasAlpha : false, hasDepth : false, hasStencil : false, isCompressed : true },
    { name : "EAC_RG11SN", size : 2, count : 2, isFloating : false, hasAlpha : false, hasDepth : false, hasStencil : false, isCompressed : true },

    { name : "PVRTC_RGB2", size : 2, count : 3, isFloating : false, hasAlpha : false, hasDepth : false, hasStencil : false, isCompressed : true },
    { name : "PVRTC_RGBA2", size : 2, count : 4, isFloating : false, hasAlpha : true, hasDepth : false, hasStencil : false, isCompressed : true },
    { name : "PVRTC_RGB4", size : 2, count : 3, isFloating : false, hasAlpha : false, hasDepth : false, hasStencil : false, isCompressed : true },
    { name : "PVRTC_RGBA4", size : 2, count : 4, isFloating : false, hasAlpha : true, hasDepth : false, hasStencil : false, isCompressed : true },
    { name : "PVRTC2_2BPP", size : 2, count : 4, isFloating : false, hasAlpha : true, hasDepth : false, hasStencil : false, isCompressed : true },
    { name : "PVRTC2_4BPP", size : 2, count : 4, isFloating : false, hasAlpha : true, hasDepth : false, hasStencil : false, isCompressed : true },
];

export function GFXFormatSize(format : GFXFormat, width : number, height : number, depth : number) : number {
    
    if(!GFXFormatInfos[format].isCompressed) {
        return (width * height * depth * GFXFormatInfos[format].size);
    } else {
        switch(format) {
            case GFXFormat.BC1:
            case GFXFormat.BC1_ALPHA:
            case GFXFormat.BC1_SRGB:
            case GFXFormat.BC1_SRGB_ALPHA:
                return Math.ceil(width / 4) * Math.ceil(height / 4) * 8 * depth;
            case GFXFormat.BC2:
            case GFXFormat.BC2_SRGB:
            case GFXFormat.BC3:
            case GFXFormat.BC3_SRGB:
            case GFXFormat.BC4:
            case GFXFormat.BC4_SNORM:
            case GFXFormat.BC6H_SF16:
            case GFXFormat.BC6H_UF16:
            case GFXFormat.BC7:
            case GFXFormat.BC7_SRGB:
                return Math.ceil(width / 4) * Math.ceil(height / 4) * 16 * depth;
            case GFXFormat.BC5:
            case GFXFormat.BC5_SNORM:
                return Math.ceil(width / 4) * Math.ceil(height / 4) * 32 * depth;

            case GFXFormat.ETC_RGB8:
            case GFXFormat.ETC2_RGB8:
            case GFXFormat.ETC2_SRGB8:
            case GFXFormat.ETC2_RGB8_A1:
            case GFXFormat.ETC2_SRGB8_A1:
            case GFXFormat.EAC_R11:
            case GFXFormat.EAC_R11SN:
                return Math.ceil(width / 4) * Math.ceil(height / 4) * 8 * depth;
            case GFXFormat.EAC_RG11:
            case GFXFormat.EAC_RG11SN:
                return Math.ceil(width / 4) * Math.ceil(height / 4) * 16 * depth;

            case GFXFormat.PVRTC_RGB2:
            case GFXFormat.PVRTC_RGBA2:
            case GFXFormat.PVRTC2_2BPP:
                return Math.ceil(Math.max(width, 16) * Math.max(height, 8) / 4) * depth;
            case GFXFormat.PVRTC_RGB4:
            case GFXFormat.PVRTC_RGBA4:
            case GFXFormat.PVRTC2_4BPP:
                return Math.ceil(Math.max(width, 16) * Math.max(height, 8) / 2) * depth;

            default: {
                return 0;
            }
        }
    }
}

export function GFXFormatSurfaceSize(format : GFXFormat, width : number, height : number, depth : number, mips : number) : number {

    let size = 0;

    for(let i = 0; i < mips; ++i) {
        size += GFXFormatSize(format, width, height, depth);
        width = Math.max(width >> 1, 1);
        height = Math.max(height >> 1, 1);
        depth = Math.max(depth >> 1, 1);
    }

    return size;
}

export function GFXGetTypeSize(type : GFXType) : number {
    switch(type) {
        case GFXType.BOOL:
        case GFXType.INT:
        case GFXType.UINT:
        case GFXType.FLOAT: return 4;
        case GFXType.BOOL2:
        case GFXType.INT2:
        case GFXType.UINT2:
        case GFXType.FLOAT2: return 8;
        case GFXType.BOOL3:
        case GFXType.INT3:
        case GFXType.UINT3:
        case GFXType.FLOAT3: return 12;
        case GFXType.BOOL4:
        case GFXType.INT4:
        case GFXType.UINT4:
        case GFXType.FLOAT4:
        case GFXType.MAT2: return 16;
        case GFXType.MAT2X3: return 24;
        case GFXType.MAT2X4: return 32;
        case GFXType.MAT3X2: return 24;
        case GFXType.MAT3: return 36;
        case GFXType.MAT3X4: return 48;
        case GFXType.MAT4X2: return 32;
        case GFXType.MAT4X2: return 32;
        case GFXType.MAT4: return 64;
        case GFXType.SAMPLER1D:
        case GFXType.SAMPLER1D_ARRAY:
        case GFXType.SAMPLER2D:
        case GFXType.SAMPLER2D_ARRAY:
        case GFXType.SAMPLER3D:
        case GFXType.SAMPLER_CUBE: return 4;
        default: {
            return 0;
        }
    }
}