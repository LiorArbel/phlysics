import { Mesh, BoxGeometry, MeshStandardMaterial, Scene, Line } from "three";
import { PhlysicsScene } from "./PhlysicsScene";
import { createSpring } from "./Spring";

type Scene1Props = {
    springConstant: number,
    cubeMass: number,
    damping: number,
    cubeRest: number,
    cubeStart: number
}

type Scene1Variables = {
    cubeVelocity: number
}

export class Scene1 extends PhlysicsScene<Scene1Props, Scene1Variables> {
    cube: Mesh;
    spring: Line;

    constructor() {
        const constants = { springConstant: 10, cubeMass: 1, damping: 0, cubeRest: 0, cubeStart: 3 };
        const variables = { cubeVelocity: 0 };

        super(
            constants,
            variables
        );

        const geo = new BoxGeometry(1, 1, 1);
        const material = new MeshStandardMaterial({ color: "rgba(250, 227, 134, 1)" });
        this.cube = new Mesh(geo, material);
        this.cube.castShadow = true;
        this.cube.position.x = constants.cubeStart;
        this.cube.position.y = 0.5;

        this.spring = createSpring(1, 10, 0.5, 10);
        this.spring.position.y = this.cube.position.y;
        // this.spring.scale.z = 5;
        this.spring.rotateZ(-Math.PI / 2);
        this.spring.rotateX(Math.PI / 2);
        this.spring.position.x = this.cube.position.x;


        this.snapshotBodies([this.cube]);
    }

    setup(scene: Scene) {
        scene.add(this.spring);
        scene.add(this.cube);
    }

    update(d: number) {
        const c = this.useStore.getState() as typeof this.constants;
        this.constants = c;

        const displacement = this.cube.position.x - c.cubeRest;
        this.variables.cubeVelocity += d * (-c.springConstant * displacement / c.cubeMass);
        this.variables.cubeVelocity += -this.variables.cubeVelocity * c.damping;
        this.cube.position.x += d * this.variables.cubeVelocity;
        this.spring.scale.z = -this.cube.position.x + this.constants.cubeStart - 0.5;
    }
}
