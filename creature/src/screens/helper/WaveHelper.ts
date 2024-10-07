import { Ticker } from "pixi.js"
import { Projectile, ProjectileFactory } from "../../entities/ProjectileFactory"
import { EntityStore } from "../../entities/EntityStore"
import { Settings } from "../../Settings"
import { makeVirus1 } from "../../entities/entity-building/makeVirus"
import { Critter } from "../../entities/CritterFactory"
import { Random } from "random-js"


export class WaveHelper {
    readonly maxWave: number = 20
    private waveNumber: number = 0
    currentWave: Wave


    projectiles: EntityStore<Projectile>
    projectileFactory: ProjectileFactory
    engine: any
    critters: EntityStore<Critter>
    rng: Random

    // DI
    constructor(projectiles: EntityStore<Projectile>, projectileFactory: ProjectileFactory,
        engine: Matter.Engine, critters: EntityStore<Critter>, rng: Random) {
        this.currentWave = Settings.waves[0]
        this.projectiles = projectiles
        this.projectileFactory = projectileFactory
        this.engine = engine;
        this.critters = critters
        this.rng = rng


        window.setTimeout(()=>{this.nextWave()}, 1000)

    }

    getWaveNumber() {
        return this.waveNumber
    }

    private calledNext: boolean = false
    nextWave() {
        //this.calledNext = true


        this.endWave(this.waveNumber)

        if (this.waveNumber < this.maxWave) {

            window.setTimeout(() => {
                this.waveNumber++
                this.currentWave = Settings.waves[this.waveNumber]
                this.startWave(this.waveNumber)
            }, 1000)

        }

    }


    private aupdate(time: Ticker) {
        // if (this.calledNext) {
        //     this.calledNext = false
        // }

        // if no enemies, goto next wave
        // let found = false
        // this.projectiles.forEach( proj => {
        //     if (proj.isVirus) {
        //         found = true;
        //     }
        // })
        // if (!found) {
        //     this.nextWave()
        // }

    }

    private startWave(num: number) {

        // spawn everything
        let newVirus = this.projectileFactory.create(
            makeVirus1(120,150,
                this.engine,
                this.critters,
                this.projectiles,
                this.projectileFactory,
                this.rng,
                this
            )
        )

        let entityID = this.projectiles.add(newVirus)
        newVirus.entityID = entityID
        newVirus.body.label = entityID
    }
    private endWave(num: number) {

        //destroy remaining stuff from waves (all viruses should already be gone)

    }
}


export interface Wave {
    num: number
    viruses: {
        type: number,
        count: number,
        predelay?: number
    }[]
}