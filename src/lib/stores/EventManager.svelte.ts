// // src/lib/stores/GameStateManager.ts
// type Listener<T> = (payload: T) => void;

// export enum EventType {
// }

// export class EventManager {
//   private listeners = new Map<EventType, Set<Listener>>();

//   /** Register a callback for a named event. */
//   on<T>(event: EventType, cb: Listener<T>): () => void {
//     if (!this.listeners.has(event)) {
//       this.listeners.set(event, new Set());
//     }
//     this.listeners.get(event)!.add(cb);
//     // Return unsubscribe
//     return () => this.listeners.get(event)!.delete(cb);
//   }

//   /** Emit an event, calling all registered listeners. */
//   emit<T>(event: EventType, payload?: T) {
//     const set = this.listeners.get(event);
//     if (!set) return;
//     for (const cb of set) cb(payload!);
//   }
// }

// export const eventManager = new EventManager();
