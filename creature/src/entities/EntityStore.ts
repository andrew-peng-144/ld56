


import { nanoid } from "nanoid";

/**
 * Map of maps to data
 */
export class EntityStore<T> {
    private map: Map<string, T>
    private name: string


    constructor(name: string) {
        this.map = new Map()
        this.name = name

    }

    get(id: string): T {
        if (this.map.has(id) && this.map.get(id)) {
            return this.map.get(id)!
        } else {
            throw `id "${id}" does not exist in ${this.name} game-data`
        }
    }

    has(id: string): boolean {
        return this.map.has(id)
    }

    add(data: T): string {
        let newId = nanoid()
        if (this.map.has(newId)) {
            throw 'this shouldnt ever happen...'
        } else {
            this.map.set(newId, data)
            return newId
        }
    }

    remove(id: string): boolean {
        if (this.map.has(id)) {
            return this.map.delete(id)
        } else {
            throw `id "${id}" does not exist in ${this.name} game-data`
        }
    }

    modify(id: string, newData: T) {
        if (this.map.has(id)) {
            this.map.set(id, newData)
        } else {
            throw `id "${id}" does not exist in ${this.name} game-data`
        }
    }

    size() {
        return this.map.size
    }

    /**
     * same as Map.forEach()
     * 
     * Executes a provided function once per each key/value pair in the Map, in insertion order.
     */
    forEach(callbackfn: (value: T, key: string, map: Map<string, T>) => void, _thisArg?: any): void {
        this.map.forEach(callbackfn)
    }

    /**
     * Returns an array of IDs of the data that satisfy the search predicate.
     * @param predicate 
     */
    search(predicate: (value: T) => boolean): string[] {

        var indexes: string[] = []
        this.map.forEach((val, key) => {
            if (predicate(val)) {
                indexes.push(key)
            }
        })
        return indexes;
    }
}
