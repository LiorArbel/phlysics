import { useEffect, useRef, useState } from 'react'
import './App.css'
import { runScene } from './sceneRunner'
import { Scene1 } from './Scene1';
import { PhlysicsScene } from './PhlysicsScene';
import { SceneGravitySpring } from './scenes/SceneGravitySpring';

function App() {
  const rendererRef = useRef<HTMLDivElement>(null);
  // const scene: PhlysicsScene<{}, {}> = new Scene1();
  const [scene, setScene] = useState<PhlysicsScene<{}, {}>>(new SceneGravitySpring());

  useEffect(() => {
    let destroyer;
    if (rendererRef.current) {
      destroyer = runScene(rendererRef.current, scene);
    }
    return destroyer
  }, [runScene, scene]);

  return (
    <div>
      <div>
        {Object.keys(scene.constants).map(k => (
          <SceneControl
            key={k}
            name={k}
            useStore={scene.useStore}
          />
        ))}
        <div><button onClick={() => scene.reset()}>reset</button></div>
        <div>
          <button onClick={() => setScene(new Scene1())}>Spring with different solvers</button>
          <button onClick={() => setScene(new SceneGravitySpring())}>spring with gravity</button>
        </div>
      </div>
      <div ref={rendererRef}></div>
    </div >
  )
}

function SceneControl({ name, useStore }: { name: string, useStore: any }) {
  const value = useStore((s: any) => s[name]);
  const setConstant = useStore((s: any) => s.setConstant);

  return <div>
    <span>{name}</span>
    <input
      type='number'
      value={value}
      onChange={(e) => setConstant(name, Number(e.target.value))}
    />
  </div>
}

export default App
