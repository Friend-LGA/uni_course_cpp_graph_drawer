import { ipcRenderer } from 'electron';
import { Drawer } from './drawer';
import { Graph, Vertex, Edge } from './graph';

document.addEventListener('mouseout', (event) => {
  const target = event.target as HTMLTextAreaElement;
  if (target.matches('button')) {
    target.blur();
  }
});

window.onload = () => {
  const openFileButton = document.getElementById('open-file');
  openFileButton.addEventListener('click', (event) => {
    ipcRenderer.send('open-file');
    openFileButton.blur();
  });
}

ipcRenderer.on('create-or-replace-canvas', (event, graph) => {
  const openFileButton = document.getElementById('open-file');
  if (openFileButton) {
    openFileButton.remove();
  }

  const canvas = ((): HTMLCanvasElement => {
    let element = document.getElementById('graph-canvas');
    if (!element) {
      element = document.createElement('canvas')
      element.id = 'graph-canvas';
      document.body.appendChild(element);
    }
    return element as HTMLCanvasElement;
  })();

  const drawer = new Drawer(canvas, graph.vertices, graph.edges);
  drawer.draw();
});
