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

        // f = ma f=-kx => x = -f/k = -ma/k
        function derivative(x: number, v: number) {
            const displacement = x - c.cubeRest;
            const acceleration = -c.springConstant * displacement / c.cubeMass - c.damping * v;
            return [v, acceleration];
        }

        const x = this.cube.position.x, v = this.variables.cubeVelocity;

        const method: string = "RK4";

        if (method === 'RK1') {
            const [dx1, dv1] = derivative(x, v);

            this.cube.position.x += dx1 * d;
            this.variables.cubeVelocity += dv1 * d;
        }
        if (method === 'RK2') {
            const [dx1, dv1] = derivative(x, v);
            const [dx2, dv2] = derivative(x + d * dx1, v + d * dv1);

            this.cube.position.x += (dx1 + dx2) * d / 2;
            this.variables.cubeVelocity += (dv1 + dv2) * d / 2;
        }
        if (method === 'RK4') {
            const [dx1, dv1] = derivative(x, v);
            const [dx2, dv2] = derivative(x + 0.5 * d * dx1, v + 0.5 * d * dv1);
            const [dx3, dv3] = derivative(x + 0.5 * d * dx2, v + 0.5 * d * dv2);
            const [dx4, dv4] = derivative(x + d * dx3, v + d * dv3);

            this.cube.position.x += (d / 6) * (dx1 + 2 * dx2 + 2 * dx3 + dx4);
            this.variables.cubeVelocity += (d / 6) * (dv1 + 2 * dv2 + 2 * dv3 + dv4);
        }

        this.spring.scale.z = -this.cube.position.x + this.constants.cubeStart - 0.5;
    }
}

function eulerSolver(initial0: number, initial1: number, update: (d: number, f: number, ft: number) => void) {

}
