import { Object3D, Scene } from "three";
import { create } from "zustand";

export abstract class PhlysicsScene<C extends {}, V> {
    variables: V;
    constants: C;
    bodies: Object3D[] = [];
    useStore;
    private initialVariables: V;
    private initialTransforms: Map<Object3D, { position: [number, number, number]; rotation: [number, number, number]; scale: [number, number, number] }>;

    constructor(constants: C, variables: V) {
        this.constants = constants;
        this.variables = variables;
        this.initialVariables = structuredClone(variables);
        this.useStore = createSceneStore(constants);
        this.initialTransforms = new Map();
    }

    protected snapshotBodies(bodies: Object3D[]) {
        this.bodies = bodies;
        for (const body of bodies) {
            this.initialTransforms.set(body, {
                position: [body.position.x, body.position.y, body.position.z],
                rotation: [body.rotation.x, body.rotation.y, body.rotation.z],
                scale: [body.scale.x, body.scale.y, body.scale.z],
            });
        }
    }

    reset() {
        // reset variables
        this.variables = structuredClone(this.initialVariables);

        // reset bodies
        for (const body of this.bodies) {
            const t = this.initialTransforms.get(body);
            if (!t) continue;
            body.position.set(...t.position);
            body.rotation.set(...t.rotation);
            body.scale.set(...t.scale);
        }
    }

    abstract setup(scene: Scene): void;
    abstract update(d: number): void;
}

export function createSceneStore<T>(initial: T) {
    const useStore = create<
        T & { setConstant: <K extends keyof T>(key: K, value: T[K]) => void }
    >((set) => ({
        ...initial,
        setConstant: <K extends keyof T>(key: K, value: T[K]) =>
            set((state) => ({
                ...state,
                [key]: value,
            })),
    }));

    return useStore;
}
