import { Mesh, Line, BoxGeometry, MeshStandardMaterial, Scene, Vector3 } from "three";
import { PhlysicsScene } from "../PhlysicsScene";
import { RKSolver } from "../solvers/RKSolver";
import { createSpring } from "../Spring";

type SceneSpringConsts = {
    springConstant: number,
    springLength: number,
    cubeMass: number,
    friction: number,
}

type SceneSpringVars = {};

export class SceneGravitySpring extends PhlysicsScene<SceneSpringConsts, SceneSpringVars> {
    cube: Mesh;
    spring: Line;
    springAnchor: Vector3;
    v = new Vector3();
    springFromTo: ReturnType<typeof createSpring>['fromTo']
    equiLen = 0;

    constructor() {
        const constants = { springConstant: 1000, springLength: 3, friction: 1, cubeMass: 1 };
        const variables = {};

        super(
            constants,
            variables
        );

        const geo = new BoxGeometry(1, 1, 1);
        const material = new MeshStandardMaterial({ color: "rgba(234, 149, 255, 1)" });
        const cube = new Mesh(geo, material);
        cube.castShadow = true;
        cube.position.set(0, 5, 0);
        this.cube = cube;

        const { obj: spring, fromTo } = createSpring(1, 10, 0.5, 10);
        this.springFromTo = fromTo;
        spring.position.copy(cube.position)
        // spring.rotateZ(-Math.PI / 2);
        spring.rotateX(Math.PI / 2);
        // spring.rotateY(-Math.PI / 2);
        this.springAnchor = spring.position;
        this.spring = spring;

        cube.position.set(2, 0, 3);

        this.snapshotBodies([this.cube]);
    }

    setup(scene: Scene) {
        scene.add(this.spring, this.cube);
        this.v = new Vector3();
    }

    derivative = (p: number[]) => {
        const c = this.useStore.getState() as typeof this.constants;

        const [x, y, z, vx, vy, vz] = p;
        const pos = new Vector3(x, y, z);
        const v = new Vector3(vx, vy, vz);
        const relPos = new Vector3().subVectors(pos, this.springAnchor);
        const dis = relPos.length() - this.equiLen;
        const acceleration = new Vector3()
            //spring force
            .add(relPos.normalize().multiplyScalar(-c.springConstant * dis))
            //friction
            .sub(v.clone().multiplyScalar(c.friction))
            //gravity
            .sub(new Vector3(0, 9.8, 0))
            //mass
            .multiplyScalar(1 / c.cubeMass);
        return [vx, vy, vz, ...acceleration.toArray()];
    }

    update(d: number) {
        this.equiLen = this.constants.springLength + 9.8 * this.constants.cubeMass / this.constants.springConstant
        const c = this.useStore.getState() as typeof this.constants;
        this.constants = c;

        const solver = new RKSolver([...this.cube.position.toArray(), ...this.v.toArray()], this.derivative, "RK4");
        // solver.solve(d, 0);
        solver.solveMultistep(d, 0, 10);
        this.cube.position.fromArray(solver.state);
        this.v.fromArray(solver.state, 3)
        this.springFromTo(this.springAnchor, this.cube.position);
    }
}