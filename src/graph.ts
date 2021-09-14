export class Graph {
  readonly vertices: Array<Vertex>;
  readonly edges: Array<Edge>;

  constructor(vertices: Array<Vertex>, edges: Array<Edge>) {
    this.vertices = vertices;
    this.edges = edges;
  }

  getEdges(vertex: Vertex): Array<Edge> {
    let result: Array<Edge> = [];
    vertex.edge_ids.forEach((id) => {
      result.push(this.edges.find((edge) => {
        return edge.id == id;
      }));
    });
    return result;
  }

  getVertices(edge: Edge): Array<Vertex> {
    let result: Array<Vertex> = [];
    edge.vertex_ids.forEach((id) => {
      result.push(this.vertices.find((vertex) => {
        return vertex.id == id;
      }));
    });
    return result;
  }

  getNeighbours(vertex: Vertex): Array<Vertex> {
    let result: Array<Vertex> = [];
    const edges = this.getEdges(vertex);
    edges.forEach((edge) => {
      const vertices = this.getVertices(edge);
      const filtered = vertices.filter((element) => {
        return element.id != vertex.id;
      });
      result.push(...filtered);
    });
    return result;
  }
};

export class Vertex {
  readonly id: number;
  readonly edge_ids: Array<number>;
};

export class Edge {
  readonly id: number;
  readonly vertex_ids: Array<number>;
};
