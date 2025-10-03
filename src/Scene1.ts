import { Scene, BoxGeometry, MeshStandardMaterial, Mesh, Object3D, type Object3DEventMap } from "three";
import { createSceneStore, type PhlysicsScene } from "./sceneRunner";

export class Scene1 implements PhlysicsScene {
    bodies: Object3D<Object3DEventMap>[] = [];
    variables = { cubeVelocity: 0 };
    constants = { springConstant: 10, cubeMass: 1, damping: 0, cubeRest: 0, cubeStart: 3 };

    cube: Mesh;
    useStore;

    constructor() {
        this.useStore = createSceneStore(this.constants);
        const geo = new BoxGeometry(1, 1, 1);
        const material = new MeshStandardMaterial({ color: "rgba(250, 227, 134, 1)" });
        this.cube = new Mesh(geo, material);
        this.cube.castShadow = true;
        this.cube.position.x = this.constants.cubeStart;
        this.cube.position.y = 0.5;

        this.bodies = [this.cube];
    }

    setup(scene: Scene) {
        scene.add(this.cube);
    }

    update(d: number) {
        const c = this.useStore.getState();
        this.constants = c;

        const displacement = this.cube.position.x - this.constants.cubeRest;
        this.variables.cubeVelocity += d * (-this.constants.springConstant * displacement / this.constants.cubeMass);
        this.variables.cubeVelocity += -this.variables.cubeVelocity * this.constants.damping;
        this.cube.position.x += d * this.variables.cubeVelocity;
    }
}