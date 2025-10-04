import { AmbientLight, CameraHelper, Curve, DirectionalLight, DoubleSide, Mesh, MeshStandardMaterial, OrthographicCamera, PerspectiveCamera, PlaneGeometry, Scene, TubeGeometry, Vector3, WebGLRenderer } from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import type { PhlysicsScene } from "./PhlysicsScene";
import { createSpring } from "./Spring";

const width = 800;
const height = 600;

export function runScene(el: HTMLElement, s: PhlysicsScene<{}, {}>) {
    const scene = new Scene();
    const renderer = new WebGLRenderer({ alpha: true, antialias: true });
    renderer.shadowMap.enabled = true;

    renderer.setSize(width, height);
    el.appendChild(renderer.domElement);

    const ground = addGround(scene);

    const camera = new PerspectiveCamera(45, width / height, 0.1, 1000);
    // const camera = new OrthographicCamera(-width / height, width / height, 1);
    camera.zoom = 0.2;
    camera.position.z = 2;
    camera.position.y = 10;
    const controls = new OrbitControls(camera, el);
    controls.enableDamping = true;
    controls.target.set(0, 0, 0);
    controls.update();

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

    s.setup(scene);

    let lastTime = 0;
    renderer.setAnimationLoop((currentTime) => {
        let d = (currentTime - lastTime) / 1000;
        // spring.material.uniforms.uStretch.value = 3.0 + Math.sin(currentTime) * 2.0; // oscillates between 1 and 5
        lastTime = currentTime;
        controls.update();
        renderer.render(scene, camera);
        s.update(d);
    });

    return () => {
        renderer.setAnimationLoop(null);
        el.removeChild(renderer.domElement)
        renderer.dispose();
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