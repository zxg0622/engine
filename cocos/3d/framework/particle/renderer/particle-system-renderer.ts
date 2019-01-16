import * as renderer from '../../../../renderer';
import { vec3, vec4, vec2, mat4 } from '../../../../core/vmath';
import gfx from '../../../../renderer/gfx';
import { Material } from '../../../assets/material';
import { RecyclePool } from '../../../memop';
import Particle from '../particle';
import RenderableComponent from '../../renderable-component';
import { Enum, Vec2 } from '../../../../core/value-types';
import { property, ccclass, executeInEditMode } from '../../../../core/data/class-decorator';
import { Space } from '../particle-general-function';
import { GFXAttributeName, GFXFormat } from '../../../../gfx/define';
import ParticleBatchModel from '../../../../renderer/models/particle-batch-model';
import { IGFXInputAttribute } from '../../../../gfx/input-assembler';
// import ParticleSystemComponent from '../particle-system-component';

let _tempAttribUV: vec3 = vec3.create();
let _tempAttribUV0: vec2 = vec2.create();
let _tempAttribColor: vec4 = vec4.create();
let _tempWorldTrans: mat4 = mat4.create();

let _uvs = [
    0, 0, // bottom-left
    1, 0, // bottom-right
    0, 1, // top-left
    1, 1  // top-right
];

const RenderMode = Enum({
    Billboard: 0,
    StrecthedBillboard: 1,
    HorizontalBillboard: 2,
    VerticalBillboard: 3,
    Mesh: 4
});

let USE_WORLD_SPACE = 'USE_WORLD_SPACE';
let USE_BILLBOARD = 'USE_BILLBOARD';
let USE_STRETCHED_BILLBOARD = 'USE_STRETCHED_BILLBOARD';
let USE_HORIZONTAL_BILLBOARD = 'USE_HORIZONTAL_BILLBOARD';
let USE_VERTICAL_BILLBOARD = 'USE_VERTICAL_BILLBOARD';

@ccclass('cc.ParticleSystemRenderer')
@executeInEditMode
export default class ParticleSystemRenderer extends RenderableComponent {

    @property({
        type: RenderMode
    })
    private _renderMode = RenderMode.Billboard;

    @property({
        type: RenderMode
    })
    public get renderMode() {
        return this._renderMode;
    }

    public set renderMode(val) {
        if (this._renderMode === val) {
            return;
        }
        this._renderMode = val;
        this._updateMaterialParams();
        this._updateModel();
    }

    @property
    private _velocityScale = 1;

    @property
    public get velocityScale() {
        return this._velocityScale;
    }

    public set velocityScale(val) {
        this._velocityScale = val;
        this._updateMaterialParams();
        this._updateModel();
    }

    @property
    private _lengthScale = 1;

    @property
    public get lengthScale() {
        return this._lengthScale;
    }

    public set lengthScale(val) {
        this._lengthScale = val;
        this._updateMaterialParams();
        this._updateModel();
    }

    private _defines: { [index: string]: boolean };
    private _model: ParticleBatchModel | null;
    private frameTile: Vec2;
    private attrs: [any];
    private _vertAttrs: IGFXInputAttribute[];
    private particleSystem: any;
    private _particles: RecyclePool;


    constructor() {
        super();
        this._model = null;

        this.frameTile = cc.v2(1, 1);
        this.attrs = new Array(5);
        this._vertAttrs = [
            { name: GFXAttributeName.ATTR_POSITION, format: GFXFormat.RGB32F },
            { name: GFXAttributeName.ATTR_TEX_COORD, format: GFXFormat.RGB32F },
            { name: GFXAttributeName.ATTR_TEX_COORD1, format: GFXFormat.RG32F },
            { name: GFXAttributeName.ATTR_COLOR, format: GFXFormat.RGBA8,  isNormalized: true }
        ];
        this._defines = {
            USE_WORLD_SPACE: true,
            USE_BILLBOARD: true,
            USE_STRETCHED_BILLBOARD: false,
            USE_HORIZONTAL_BILLBOARD: false,
            USE_VERTICAL_BILLBOARD: false
        }
    }

    onInit() {
        this.particleSystem = this.node.getComponent('cc.ParticleSystemComponent');
        this._particles = new RecyclePool(() => {
            return new Particle(this);
        }, this.particleSystem.capacity);
        if (this.sharedMaterial == null) {
            this._materials[0] = new Material();
            this.sharedMaterial!.effectName = 'builtin-effect-particle-add';
        }
        this.onEnable();
        this._updateMaterialParams();
        this._updateModel();
    }

    onEnable() {
        if (!this.particleSystem) {
            return;
        }
        if (this._model == null) {
            this._model = <ParticleBatchModel>this._getRenderScene().createModel(ParticleBatchModel);
            this._model.setCapacity(this.particleSystem.capacity);
            this._model.setVertexAttributes(this._vertAttrs);
            this._model.node = this.node;
        }
    }

    onDisable() {
        this._getRenderScene().destroyModel(this._model!);
    }

    onDestroy() {
        this._model!.destroy();
    }

    _updateMaterialParams() {
        if (!this.particleSystem) {
            return;
        }
        if (this.particleSystem._simulationSpace === Space.World) {
            this._defines[USE_WORLD_SPACE] = true;
        } else {
            this._defines[USE_WORLD_SPACE] = true;
        }

        if (this._renderMode === RenderMode.Billboard) {
            this._defines[USE_BILLBOARD] = true;
            this._defines[USE_STRETCHED_BILLBOARD] = false;
            this._defines[USE_HORIZONTAL_BILLBOARD] = false;
            this._defines[USE_VERTICAL_BILLBOARD] = false;
        } else if (this._renderMode === RenderMode.StrecthedBillboard) {
            this._defines[USE_BILLBOARD] = false;
            this._defines[USE_STRETCHED_BILLBOARD] = true;
            this._defines[USE_HORIZONTAL_BILLBOARD] = false;
            this._defines[USE_VERTICAL_BILLBOARD] = false;
            this.sharedMaterial!.setProperty('velocityScale', this._velocityScale);
            this.sharedMaterial!.setProperty('lengthScale', this._lengthScale);
        } else if (this._renderMode === RenderMode.HorizontalBillboard) {
            this._defines[USE_BILLBOARD] = false;
            this._defines[USE_STRETCHED_BILLBOARD] = false;
            this._defines[USE_HORIZONTAL_BILLBOARD] = true;
            this._defines[USE_VERTICAL_BILLBOARD] = false;
        } else if (this._renderMode === RenderMode.VerticalBillboard) {
            this._defines[USE_BILLBOARD] = false;
            this._defines[USE_STRETCHED_BILLBOARD] = false;
            this._defines[USE_HORIZONTAL_BILLBOARD] = false;
            this._defines[USE_VERTICAL_BILLBOARD] = true;
        } else {
            console.warn(`particle system renderMode ${this._renderMode} not support.`);
        }
        this.sharedMaterial!.setDefines(this._defines);

        if (this.particleSystem.textureAnimationModule.enable) {
            this.sharedMaterial!.setProperty('frameTile', vec2.set(this.frameTile, this.particleSystem.textureAnimationModule.numTilesX, this.particleSystem.textureAnimationModule.numTilesY));
        }
        else {
            this.sharedMaterial!.setProperty('frameTile', this.frameTile);
        }
    }

    _updateModel() {
        if (!this.particleSystem) {
            return;
        }
        this._model!.material = this.sharedMaterial ? this.sharedMaterial : null;
        if (Object.getPrototypeOf(this).constructor.name === 'ParticleSystemGpuRenderer')
            return;
        if (this._renderMode === RenderMode.StrecthedBillboard) {
            this._model!.enableStretchedBillboard();
        } else {
            this._model!.disableStretchedBillboard();
        }
    }

    _getFreeParticle() {
        if (this._particles.length >= this.particleSystem._capacity)
            return null;
        return this._particles.add();
    }

    _setNewParticle(p) {

    }

    _updateParticles(dt) {
        this.node.getWorldMatrix(_tempWorldTrans);
        if (this.particleSystem.velocityOvertimeModule.enable) {
            this.particleSystem.velocityOvertimeModule.update(this.particleSystem._simulationSpace, _tempWorldTrans);
        }
        if (this.particleSystem.forceOvertimeModule.enable) {
            this.particleSystem.forceOvertimeModule.update(this.particleSystem._simulationSpace, _tempWorldTrans);
        }
        for (let i = 0; i < this._particles.length; ++i) {
            let p = this._particles.data[i];
            p.remainingLifetime -= dt;
            vec3.set(p.animatedVelocity, 0, 0, 0);

            if (p.remainingLifetime < 0.0) {
                this._particles.remove(i);
                --i;
                continue;
            }

            p.velocity.y -= this.particleSystem.gravityModifier.evaluate(1 - p.remainingLifetime / p.startLifetime, p.randomSeed) * 9.8 * dt; // apply gravity.
            if (this.particleSystem.sizeOvertimeModule.enable) {
                this.particleSystem.sizeOvertimeModule.animate(p);
            }
            if (this.particleSystem.colorOverLifetimeModule.enable) {
                this.particleSystem.colorOverLifetimeModule.animate(p);
            }
            if (this.particleSystem.forceOvertimeModule.enable) {
                this.particleSystem.forceOvertimeModule.animate(p, dt);
            }
            if (this.particleSystem.velocityOvertimeModule.enable) {
                this.particleSystem.velocityOvertimeModule.animate(p);
            }
            else {
                vec3.copy(p.ultimateVelocity, p.velocity);
            }
            if (this.particleSystem.limitVelocityOvertimeModule.enable) {
                this.particleSystem.limitVelocityOvertimeModule.animate(p);
            }
            if (this.particleSystem.rotationOvertimeModule.enable) {
                this.particleSystem.rotationOvertimeModule.animate(p, dt);
            }
            if (this.particleSystem.textureAnimationModule.enable) {
                this.particleSystem.textureAnimationModule.animate(p);
            }
            vec3.scaleAndAdd(p.position, p.position, p.ultimateVelocity, dt); // apply velocity.
        }
    }

    // internal function
    _updateRenderData() {
        // update vertex buffer
        let idx = 0;
        let uploadVel = this._renderMode == RenderMode.StrecthedBillboard;
        for (let i = 0; i < this._particles.length; ++i) {
            let p = this._particles.data[i];
            let fi = 0;
            if (this.particleSystem.textureAnimationModule.enable) {
                fi = p.frameIndex;
            }
            idx = i * 4;
            let attrNum = 0;
            for (let j = 0; j < 4; ++j) { // four verts per particle.
                attrNum = 0;
                this.attrs[attrNum++] = p.position;
                _tempAttribUV.x = _uvs[2 * j];
                _tempAttribUV.y = _uvs[2 * j + 1];
                _tempAttribUV.z = fi;
                this.attrs[attrNum++] = _tempAttribUV;
                _tempAttribUV0.x = p.size.x;
                _tempAttribUV0.y = p.rotation.x;
                this.attrs[attrNum++] = _tempAttribUV0;
                this.attrs[attrNum++] = p.color._val;

                if (uploadVel) {
                    this.attrs[attrNum++] = p.ultimateVelocity;
                }

                this._model!.addParticleVertexData(idx++, this.attrs);
            }
        }

        // because we use index buffer, per particle index count = 6.
        this._model!.updateIA(this._particles.length * 6);
    }

    updateShaderUniform() {

    }

    _onMaterialModified(index, material) {
        this._updateMaterialParams();
        this._updateModel();
    }
}

Object.assign(ParticleSystemRenderer, { uv: _uvs });