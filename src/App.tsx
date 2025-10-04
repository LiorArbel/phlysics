import { useEffect, useRef, useState } from 'react'
import './App.css'
import { PhlysicsRenderer } from './PhlysicsRenderer'
import { Scene1 } from './Scene1';
import { PhlysicsScene } from './PhlysicsScene';
import { SceneGravitySpring } from './scenes/SceneGravitySpring';

const r = new PhlysicsRenderer();

function App() {
  const rendererRef = useRef<HTMLDivElement>(null);
  // const scene: PhlysicsScene<{}, {}> = new Scene1();
  const [scene, setScene] = useState<PhlysicsScene<{}, {}>>(new Scene1());

  useEffect(() => {
    if (rendererRef.current) {
      console.log("attaching");
      r.attach(rendererRef.current);
    }
    return () => {
      if (rendererRef.current) {
        r.detach(rendererRef.current)
      }
    }
  }, [PhlysicsRenderer, rendererRef]);

  useEffect(() => {
    r.loadPhlysics(scene);
  }, [scene]);

  return (
    <div>
      <div>
        <button onClick={() => setScene(new Scene1())}>Spring with different solvers</button>
        <button onClick={() => setScene(new SceneGravitySpring())}>spring with gravity</button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center' }} ref={rendererRef}></div>
      <div><button onClick={() => scene.reset()}>reset</button></div>
      <div style={{ display: 'flex', flexDirection: 'row', gap: '2em' }}>
        {Object.keys(scene.constants).map(k => (
          <SceneControl
            key={k}
            name={k}
            useStore={scene.useStore}
          />
        ))}
      </div>
    </div >
  )
}

function SceneControl({ name, useStore }: { name: string, useStore: any }) {
  const value = useStore((s: any) => s[name]);
  const setConstant = useStore((s: any) => s.setConstant);

  return <div style={{ display: 'flex', flexDirection: 'row', gap: '1em' }}>
    <span>{name}</span>
    <input
      type='number'
      value={Number.isFinite(value) ? value : 0}
      onChange={(e) => setConstant(name, Number(e.target.value))}
      style={{ width: '6em' }}
    />
  </div>
}

export default App
