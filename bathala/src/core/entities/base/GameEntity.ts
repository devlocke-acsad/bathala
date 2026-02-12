/**
 * GameEntity — Root abstract class for all game entities.
 * Every in-game object (NPC, Item, Scene helper) derives from this.
 *
 * @abstract
 */
export abstract class GameEntity {
  /** Unique identifier — immutable after construction. */
  public readonly id: string;

  /** Human-readable display name. */
  public readonly name: string;

  protected constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }

  /** Serialise the entity to a plain JSON-safe object. */
  abstract toJSON(): Record<string, unknown>;

  /** String tag for debugging. */
  toString(): string {
    return `${this.constructor.name}(${this.id})`;
  }
}
