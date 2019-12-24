import { Asset } from '../../assets/asset';
import { ImageAsset } from '../../assets/image-asset';
import { SpriteFrame } from '../../assets/sprite-frame';
import { Texture2D } from '../../assets/texture-2d';
import { TextureCube } from '../../assets/texture-cube';
import { GFXDevice } from '../../gfx/device';
import { selectJointsMediumType } from '../../renderer/models/skeletal-animation-utils';
import effects from './effects';

class BuiltinResMgr {
    protected _device: GFXDevice | null = null;
    protected _resources: Record<string, Asset> = {};

    // this should be called after renderer initialized
    public initBuiltinRes (device: GFXDevice) {
        this._device = device;
        const resources = this._resources;
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        const imgAsset = new ImageAsset(canvas);
        const l = canvas.width = canvas.height = 2;

        // ============================
        // builtin textures
        // ============================

        // black texture
        context.fillStyle = '#000';
        context.fillRect(0, 0, l, l);
        const blackTexture = new Texture2D();
        blackTexture._uuid = 'black-texture';
        blackTexture.image = imgAsset;
        resources[blackTexture._uuid] = blackTexture;

        // black texture
        const blackCubeTexture = new TextureCube();
        blackCubeTexture._uuid = 'black-cube-texture';
        blackCubeTexture.setMipFilter(TextureCube.Filter.LINEAR);
        blackCubeTexture.image = {
            front: new ImageAsset(canvas),
            back: new ImageAsset(canvas),
            left: new ImageAsset(canvas),
            right: new ImageAsset(canvas),
            top: new ImageAsset(canvas),
            bottom: new ImageAsset(canvas),
        };
        resources[blackCubeTexture._uuid] = blackCubeTexture;

        // grey texture
        context.fillStyle = '#777';
        context.fillRect(0, 0, l, l);
        const greyTexture = new Texture2D();
        greyTexture._uuid = 'grey-texture';
        greyTexture.image = imgAsset;
        resources[greyTexture._uuid] = greyTexture;

        // white texture
        context.fillStyle = '#fff';
        context.fillRect(0, 0, l, l);
        const whiteTexture = new Texture2D();
        whiteTexture._uuid = 'white-texture';
        whiteTexture.image = imgAsset;
        resources[whiteTexture._uuid] = whiteTexture;

        // white cube texture
        const whiteCubeTexture = new TextureCube();
        whiteCubeTexture._uuid = 'white-cube-texture';
        whiteCubeTexture.setMipFilter(TextureCube.Filter.LINEAR);
        whiteCubeTexture.image = {
            front: new ImageAsset(canvas),
            back: new ImageAsset(canvas),
            left: new ImageAsset(canvas),
            right: new ImageAsset(canvas),
            top: new ImageAsset(canvas),
            bottom: new ImageAsset(canvas),
        };
        resources[whiteCubeTexture._uuid] = whiteCubeTexture;

        // normal texture
        context.fillStyle = '#7f7fff';
        context.fillRect(0, 0, l, l);
        const normalTexture = new Texture2D();
        normalTexture._uuid = 'normal-texture';
        normalTexture.image = imgAsset;
        resources[normalTexture._uuid] = normalTexture;

        // default texture
        canvas.width = canvas.height = 16;
        context.fillStyle = '#ddd';
        context.fillRect(0, 0, 16, 16);
        context.fillStyle = '#555';
        context.fillRect(0, 0, 8, 8);
        context.fillStyle = '#555';
        context.fillRect(8, 8, 8, 8);
        const defaultTexture = new Texture2D();
        defaultTexture._uuid = 'default-texture';
        defaultTexture.image = imgAsset;
        resources[defaultTexture._uuid] = defaultTexture;

        // default cube texture
        const defaultCubeTexture = new TextureCube();
        defaultCubeTexture.setMipFilter(TextureCube.Filter.LINEAR);
        defaultCubeTexture._uuid = 'default-cube-texture';
        defaultCubeTexture.image = {
            front: new ImageAsset(canvas),
            back: new ImageAsset(canvas),
            left: new ImageAsset(canvas),
            right: new ImageAsset(canvas),
            top: new ImageAsset(canvas),
            bottom: new ImageAsset(canvas),
        };
        resources[defaultCubeTexture._uuid] = defaultCubeTexture;

        const spriteFrame = new SpriteFrame();
        const texture = imgAsset._texture;
        spriteFrame.texture = texture;
        spriteFrame._uuid = 'default-spriteframe';
        resources[spriteFrame._uuid] = spriteFrame;

        // builtin effects
        effects.forEach((e) => {
            const effect = Object.assign(new cc.EffectAsset(), e);
            effect.onLoaded();
        });

        // standard material
        const standardMtl = new cc.Material();
        standardMtl._uuid = 'standard-material';
        standardMtl.initialize({
            effectName: 'builtin-standard',
        });
        resources[standardMtl._uuid] = standardMtl;

        // material indicating missing material (purple)
        const missingMtl = new cc.Material();
        missingMtl._uuid = 'missing-material';
        missingMtl.initialize({
            effectName: 'builtin-unlit',
            defines: { USE_COLOR: true },
        });
        missingMtl.setProperty('color', cc.color('#ff00ff'));
        resources[missingMtl._uuid] = missingMtl;

        // material indicating missing material on skinning model (purple)
        const missingSkinningMtl = new cc.Material();
        missingSkinningMtl._uuid = 'missing-skinning-material';
        const type = selectJointsMediumType(device);
        missingSkinningMtl.initialize({
            effectName: 'builtin-unlit',
            defines: { USE_COLOR: true, USE_SKINNING: type },
        });
        missingSkinningMtl.setProperty('color', cc.color('#ff00ff'));
        resources[missingSkinningMtl._uuid] = missingSkinningMtl;

        // material indicating missing effect (yellow)
        const missingEfxMtl = new cc.Material();
        missingEfxMtl._uuid = 'missing-effect-material';
        missingEfxMtl.initialize({
            effectName: 'builtin-unlit',
            defines: { USE_COLOR: true },
        });
        missingEfxMtl.setProperty('color', cc.color('#ffff00'));
        resources[missingEfxMtl._uuid] = missingEfxMtl;

        // sprite material
        const spriteMtl = new cc.Material();
        spriteMtl._uuid = 'ui-base-material';
        spriteMtl.initialize({ defines: { USE_TEXTURE: false }, effectName: 'builtin-sprite' });
        resources[spriteMtl._uuid] = spriteMtl;

        // sprite material
        const spriteColorMtl = new cc.Material();
        spriteColorMtl._uuid = 'ui-sprite-material';
        spriteColorMtl.initialize({ defines: { USE_TEXTURE: true, IS_GRAY: false }, effectName: 'builtin-sprite' });
        resources[spriteColorMtl._uuid] = spriteColorMtl;

        // sprite gray material
        const spriteGrayMtl = new cc.Material();
        spriteGrayMtl._uuid = 'ui-sprite-gray-material';
        spriteGrayMtl.initialize({ defines: { USE_TEXTURE: true, IS_GRAY: true }, effectName: 'builtin-sprite' });
        resources[spriteGrayMtl._uuid] = spriteGrayMtl;

        // default particle material
        const defaultParticleMtl = new cc.Material();
        defaultParticleMtl._uuid = 'default-particle-material';
        defaultParticleMtl.initialize({ effectName: 'builtin-particle' });
        resources[defaultParticleMtl._uuid] = defaultParticleMtl;

        // default particle material
        const defaultTrailMtl = new cc.Material();
        defaultTrailMtl._uuid = 'default-trail-material';
        defaultTrailMtl.initialize({ effectName: 'builtin-particle-trail' });
        resources[defaultTrailMtl._uuid] = defaultTrailMtl;

        // default particle material
        const defaultBillboardMtl = new cc.Material();
        defaultBillboardMtl._uuid = 'default-billboard-material';
        defaultBillboardMtl.initialize({ effectName: 'builtin-billboard' });
        resources[defaultBillboardMtl._uuid] = defaultBillboardMtl;
    }

    public get<T extends Asset> (uuid: string) {
        return this._resources[uuid] as T;
    }
}

const builtinResMgr = cc.builtinResMgr = new BuiltinResMgr();
export { builtinResMgr };
