import * as fs from 'fs';
import { Graph, Vertex, Edge } from './graph';

export function parseJSON(filePath: string): Graph {
  let rawData = fs.readFileSync(filePath);
  let jsonData = JSON.parse(rawData.toString());
  let vertices: Array<Vertex> = jsonData.vertices || [];
  let edges: Array<Edge> = jsonData.edges || [];
  vertices.sort((lhs: Vertex, rhs: Vertex) => { return lhs.id - rhs.id });
  edges.sort((lhs: Edge, rhs: Edge) => { return lhs.id - rhs.id });
  return new Graph(vertices, edges);
}
