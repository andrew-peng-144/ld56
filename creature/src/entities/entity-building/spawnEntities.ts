import { Viewport } from "pixi-viewport";
import { Random } from "random-js";
import { Critter, CritterFactory } from "../CritterFactory";
import { EntityStore } from "../EntityStore";
import { Projectile, ProjectileFactory } from "../ProjectileFactory";
import { makeVirus1 } from "./makeVirus";
import { Settings } from "../../Settings";


const virus_spawn_count = 3
export function spawnCritters(count: number, spawnRadiusMultMin: number, spawnRadiusMultMax: number, name: string, engine: Matter.Engine, viewport: Viewport, critters: EntityStore<Critter>, critterFactory: CritterFactory, projectiles: EntityStore<Projectile>, projectileFactory: ProjectileFactory, rng: Random) {
    let scaleToBorder = 0.8
    let spawnRadius = Settings.WORLD_RADIUS * scaleToBorder

    let intervalMs = 0,
        projectileSpeed = 0,
        projectileLifetime = 4,
        movementSpeed = 4,
        hp = 1,
        scale = 1,
        color = 0,
        fireDelay = 1.0

    switch (name) {
        case Settings.CritterNames.GREEN:
            color = 0x59b300
            scale = 1.3
            movementSpeed = 4.4
            projectileSpeed = 8.8
            projectileLifetime = 0.5
            fireDelay = 2.2
            break
        default:
            projectileLifetime = 1.9
            projectileSpeed = 14
            fireDelay = 0.9
            break
    }
    for (let i = 0; i < count; i++) {
        let r = rng.real(spawnRadius * spawnRadiusMultMin, spawnRadius * spawnRadiusMultMax)
        let angle = rng.real(0, Math.PI * 2)

        let newCritter = critterFactory.create({
            x: r * Math.cos(angle),
            y: r * Math.sin(angle),
            team: Settings.teams.PLAYER,
            projectileLifetime: projectileLifetime,
            projectileSpeed: projectileSpeed,
            fireDelay: fireDelay,
            movementSpeed: movementSpeed,
            scale: scale,
            name: name
        })

        let entityID = critters.add(newCritter)
        newCritter.entityID = entityID
        newCritter.body.label = entityID
    }


}

export function spawnViruses(strength: number,  spawnRadiusMultMin: number, spawnRadiusMultMax: number, engine: Matter.Engine, viewport: Viewport, critters: EntityStore<Critter>, projectiles: EntityStore<Projectile>, projectileFactory: ProjectileFactory, rng: Random) {
    // TODO have them spawn only near existing virus
    let scaleToBorder = 0.8
    let spawnRadius = Settings.WORLD_RADIUS * scaleToBorder

    let intervalMs = 0,
        projectileSpeed = 0,
        projectileLifetime = 4,
        hp = 1,
        scale = 1,
        color = 0

    switch (strength) {
        case 1:
            intervalMs = 10000
            projectileSpeed = 15.1
            hp = rng.integer(20, 60)
            scale = 2
            color = 0x9999ff
            break;
        default:
            intervalMs = 15000
            projectileSpeed = 8.1
            hp = 11
            scale = 3.3
            color = 0xff6666
            break;
    }

    for (let i = 0; i < virus_spawn_count; i++) {
        let r = rng.real(spawnRadius * spawnRadiusMultMin, spawnRadius * spawnRadiusMultMax)
        let angle = rng.real(0, Math.PI * 2)

        let newVirus = projectileFactory.create(
            makeVirus1(
                {
                    centerX: r * Math.cos(angle),
                    centerY: r * Math.sin(angle),
                    color: color,
                    intervalMs: intervalMs,
                    projectileSpeed: projectileSpeed,
                    projectileLifetime: projectileLifetime,
                    hp: hp,
                    scale: scale
                },
                engine,
                viewport,
                critters,
                projectiles,
                projectileFactory,
                rng
            )
        )

        let entityID = projectiles.add(newVirus)
        newVirus.entityID = entityID
        newVirus.body.label = entityID
    }
}