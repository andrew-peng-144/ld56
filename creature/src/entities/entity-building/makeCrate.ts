import { Ticker } from "pixi.js"
import { Critter } from "../CritterFactory"
import { Settings } from "../../Settings"
import { Projectile, ProjectileFactory } from "../ProjectileFactory"
import { EntityStore } from "../EntityStore"

 function makeCrate(centerX, centerY, projectiles: EntityStore<Projectile>, projectileFactory: ProjectileFactory) {
    let body = 
    let newCrate = projectileFactory.create({
        x: centerX, //not used if custom body?
        y: centerY,
        body:

        startingDirection: critter.graphics.angle * Math.PI / 180,
        critterOwner: critter,
        lifetime: critter.projectileLifetime,
        speed: critter.projectileSpeed,
        team: critter.team
    })
    newCrate.body.collisionFilter.category = Settings.collisionCategories.PROJECTILE
    newCrate.body.collisionFilter.mask = Settings.collisionCategories.CRITTER
    let entityID = projectiles.add(newCrate)
    newCrate.entityID = entityID
    newCrate.body.label = entityID
}