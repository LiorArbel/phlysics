import { AmbientLight, DirectionalLight, DoubleSide, Mesh, MeshStandardMaterial, PerspectiveCamera, PlaneGeometry, Scene, WebGLRenderer } from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import type { PhlysicsScene } from "./PhlysicsScene";

const width = 800;
const height = 600;

export class PhlysicsRenderer {
    renderer;
    camera;
    time = 0;
    threeScene;
    controls?: OrbitControls;
    phlysicsScene?: PhlysicsScene<{}, {}>


    constructor() {
        const scene = new Scene();
        this.renderer = new WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.shadowMap.enabled = true;

        this.renderer.setSize(width, height);

        const ground = addGround(scene);

        this.camera = new PerspectiveCamera(45, width / height, 0.1, 1000);
        // const camera = new OrthographicCamera(-width / height, width / height, 1);
        this.camera.zoom = 0.2;
        this.camera.position.z = 2;
        this.camera.position.y = 10;


        {
            const color = "rgba(255, 244, 179, 1)";
            const intensity = 5;
            const light = new DirectionalLight(color, intensity);
            light.position.set(0, 10, 0);
            light.target.position.set(-5, -5, -2);
            light.castShadow = true;
            scene.add(light);
            scene.add(light.target);
            // const helper = new DirectionalLightHelper(light);
            // scene.add(helper);
            // const cameraHelper = new CameraHelper(light.shadow.camera);
            // scene.add(cameraHelper);
            {
                const size = 10;
                light.shadow.camera.left = -size;
                light.shadow.camera.right = size;
                light.shadow.camera.top = size;
                light.shadow.camera.bottom = -size;
            }

            scene.add(new AmbientLight(color, 0.2));
        }

        this.threeScene = scene;

        this.renderer.setAnimationLoop((currentTime) => {
            let d = (currentTime - this.time) / 1000;
            // spring.material.uniforms.uStretch.value = 3.0 + Math.sin(currentTime) * 2.0; // oscillates between 1 and 5
            this.time = currentTime;
            this.controls?.update();
            this.renderer.render(this.threeScene, this.camera);
            this.phlysicsScene?.update(d);
        });
    }

    loadPhlysics(s: PhlysicsScene<{}, {}>) {
        if (this.phlysicsScene) {
            this.threeScene.remove(...this.phlysicsScene.bodies);
        }
        this.phlysicsScene = s;
        s.setup(this.threeScene);
    }

    attach(el: HTMLElement) {
        el.appendChild(this.renderer.domElement);
        const controls = new OrbitControls(this.camera, el);
        controls.enableDamping = true;
        controls.target.set(0, 0, 0);
        controls.update();
        this.controls = controls;
    }

    detach(el: HTMLElement) {
        el.removeChild(this.renderer.domElement);
    }
}

function addGround(scene: Scene) {
    const material = new MeshStandardMaterial({ color: "rgba(123, 159, 163, 1)", side: DoubleSide });
    const geo = new PlaneGeometry(100, 100);
    const mesh = new Mesh(geo, material);
    mesh.receiveShadow = true;
    mesh.rotation.x = Math.PI * -.5;

    scene.add(mesh);
    return { mesh, geo, material };
}