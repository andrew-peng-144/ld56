import { Ticker } from "pixi.js"
import { Projectile, ProjectileFactory } from "../../entities/ProjectileFactory"
import { EntityStore } from "../../entities/EntityStore"
import { Settings } from "../../Settings"
import { makeVirus1 } from "../../entities/entity-building/makeVirus"
import { Critter } from "../../entities/CritterFactory"
import { Random } from "random-js"


class WaveHelpera {
    readonly maxWave: number = 20

    readonly default_wave_interval = 2500
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


        window.setTimeout(() => { this.nextWave() }, this.default_wave_interval)

    }

    getWaveNumber() {
        return this.waveNumber
    }

    private calledNext: boolean = false
    nextWave() {
        this.calledNext = true
    }


    update(time: Ticker) {
        if (this.calledNext) {
            this.calledNext = false
            this.endWave(this.waveNumber)

            if (this.waveNumber < this.maxWave) {

                this.waveNumber++
                this.currentWave = Settings.waves[this.waveNumber]
                this.startWave(this.waveNumber)

            } else {
                console.log('gg');
            }
        }

    }

    private startWave(num: number) {
        console.log("STARTING WAVE " + num);

        for (let i = 0; i < this.currentWave.viruses.length; i++) {
            let virusGroup = this.currentWave.viruses[i]
            window.setTimeout(() => {
                for (let j = 0; j < virusGroup.count; j++) {
                    switch (virusGroup.type) {
                        case Settings.viruses.easy:
                            this.spawnEasy()
                            break
                        case Settings.viruses.blue:
                            this.spawnBlue()
                            break
                    }
                }
            }, (virusGroup.predelayMs || 1000) * i)
        }

    }
    private spawnEasy() {
        // spawn everything
        let r = this.rng.real(100, 400)
        let t = this.rng.real(0, Math.PI * 2)
        let newVirus = this.projectileFactory.create(
            makeVirus1(
                {
                    centerX: r * Math.cos(t),
                    centerY: r * Math.sin(t),
                    color: 0x9999ff,
                    intervalMs: 6000,
                    projectileSpeed: 3.3,
                    hp: 2
                },
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
    private spawnBlue() {
        let r = this.rng.real(300, 700)
        let t = this.rng.real(0, Math.PI * 2)
        let newVirus = this.projectileFactory.create(
            makeVirus1(
                {
                    centerX: r * Math.cos(t),
                    centerY: r * Math.sin(t),
                    color: 0x22ff,
                    intervalMs: 4000,
                    projectileSpeed: 4.4,
                    hp: 5,
                    scale: 1.5
                },
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
        predelayMs?: number
    }[]
}