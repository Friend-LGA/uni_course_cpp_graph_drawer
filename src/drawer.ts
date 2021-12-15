import { Graph, Vertex, Edge, EdgeColor } from "./graph";

const kColorBg = '#1E1E1E';
const kColorGrey = '#CDCDCD';
const kColorGreen = '#00FF00';
const kColorBlue = '#6666FF';
const kColorYellow = '#FFFF33';
const kColorRed = '#FF3333';

const kCanvasPadding = 48; // needs to be bigger than green edge
const kVertexDiameter = 32;
const kGreenEdgeDiameter = kVertexDiameter * 1.5;
const kDistanceBetweenVerticesH = kVertexDiameter * 4;
const kDistanceBetweenVerticesV = kVertexDiameter * 2;
const kVertexStrokeWidth = 2;
const kEdgeStrokeWidth = 2;
const kEdgeTextBorder = 2;
const kFontSize = 16;
const kFont = `bold ${kFontSize}px Helvetica`;
const kTextAlign = 'center';
const kTextBaseline = 'middle';

function getColorString(color: EdgeColor): string {
  switch (color) {
    case EdgeColor.Grey:
      return kColorGrey;
    case EdgeColor.Green:
      return kColorGreen;
    case EdgeColor.Blue:
      return kColorBlue;
    case EdgeColor.Yellow:
      return kColorYellow;
    case EdgeColor.Red:
      return kColorRed;
  }
}

class Position {
  readonly x: number;
  readonly y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
};

class Size {
  readonly width: number;
  readonly height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }
};

class VertexShape {
  readonly vertex: Vertex;
  readonly position: Position;

  constructor(vertex: Vertex, position: Position) {
    this.vertex = vertex;
    this.position = position;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();

    ctx.arc(
      this.position.x,
      this.position.y,
      kVertexDiameter / 2,
      0,
      2 * Math.PI
    );

    ctx.lineWidth = kVertexStrokeWidth;
    ctx.strokeStyle = kColorBg;
    ctx.fillStyle = kColorGrey;
    ctx.fill();
    ctx.stroke();

    ctx.closePath();

    ctx.font = kFont;
    ctx.textAlign = kTextAlign;
    ctx.textBaseline = kTextBaseline;
    ctx.fillStyle = kColorBg;
    ctx.fillText(this.vertex.id.toString(), this.position.x, this.position.y);
  }
};

class EdgeShape {
  readonly edge: Edge;
  readonly startPosition: Position;
  readonly endPosition: Position;
  readonly color: string;

  constructor(edge: Edge, startPosition: Position, endPosition: Position) {
    this.edge = edge;
    this.startPosition = startPosition;
    this.endPosition = endPosition;
    this.color = getColorString(edge.color);
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();

    if (this.edge.color == EdgeColor.Green) {
      ctx.arc(
        this.startPosition.x, // center x
        this.startPosition.y - kGreenEdgeDiameter / 2, // center y
        kGreenEdgeDiameter / 2, // radius
        0, // start angle
        (Math.PI / 180) * 360 // end angle
      );
    }
    else {
      ctx.moveTo(this.startPosition.x, this.startPosition.y);
      ctx.lineTo(this.endPosition.x, this.endPosition.y);
    }

    ctx.lineWidth = kEdgeStrokeWidth;
    ctx.strokeStyle = this.color;
    ctx.stroke();

    ctx.closePath();

    ctx.font = kFont;
    ctx.textAlign = kTextAlign;
    ctx.textBaseline = kTextBaseline;

    const text = ctx.measureText(this.edge.id.toString());
    const textSize = new Size(text.width + kEdgeTextBorder * 2, kFontSize + kEdgeTextBorder * 2);

    const textMiddlePosition = this.getTextMiddlePosition();
    const textPosition = new Position(
      textMiddlePosition.x - textSize.width / 2,
      textMiddlePosition.y - textSize.height / 2
    );

    ctx.fillStyle = kColorBg;
    ctx.fillRect(
      textPosition.x,
      textPosition.y,
      textSize.width,
      textSize.height
    );

    ctx.fillStyle = this.color;
    ctx.fillText(this.edge.id.toString(), textMiddlePosition.x, textMiddlePosition.y);
  }

  private getTextMiddlePosition(): Position {
    if (this.edge.color == EdgeColor.Green) {
      return new Position(
        this.startPosition.x,
        this.startPosition.y - kGreenEdgeDiameter
      );
    }
    else {
      return new Position(
        (this.startPosition.x + this.endPosition.x) / 2,
        (this.startPosition.y + this.endPosition.y) / 2
      );
    }
  }
}

export class Drawer {
  readonly canvasesContainer: HTMLDivElement;
  readonly verticesCanvas: HTMLCanvasElement;
  readonly edgesCanvases: Map<EdgeColor, HTMLCanvasElement>;
  readonly graph: Graph;

  private canvasSize: Size;
  private vertexShapes: Array<VertexShape>;
  private edgeShapes: Map<EdgeColor, Array<EdgeShape>>;

  private distanceBetweenVerticesH: number;
  private distanceBetweenVerticesV: number;

  constructor(canvasesContainer: HTMLDivElement, verticesCanvas: HTMLCanvasElement, edgesCanvases: Map<EdgeColor, HTMLCanvasElement>, vertices: Array<Vertex>, edges: Array<Edge>) {
    this.canvasesContainer = canvasesContainer;
    this.verticesCanvas = verticesCanvas;
    this.edgesCanvases = edgesCanvases;
    this.graph = new Graph(vertices, edges);

    const verticesDepths = this.getVerticesDepths(this.graph.vertices.length > 0 ? [this.graph.vertices[0]] : []);
    const longestDepthLength = this.findLongestDepthLength(verticesDepths);

    this.distanceBetweenVerticesH = kDistanceBetweenVerticesH; // * Math.max(1, verticesDepths.length / 2);
    this.distanceBetweenVerticesV = kDistanceBetweenVerticesV; // * Math.max(1, verticesDepths.length / 4);

    this.canvasSize = this.calculateCanvasSize(verticesDepths, longestDepthLength);
    this.vertexShapes = this.generateVertexShapes(verticesDepths);
    this.edgeShapes = this.generateEdgeShapes();
  }

  private getEdgeCanvas(color: EdgeColor) {
    return this.edgesCanvases.get(color);
  }

  private setCanvasSize(canvas: HTMLCanvasElement) {
    canvas.width = this.canvasSize.width;
    canvas.height = this.canvasSize.height;
  }

  private setElementSize(element: HTMLElement) {
    element.style.width = `${this.canvasSize.width}px`;
    element.style.height = `${this.canvasSize.height}px`;
  }

  draw() {
    this.setSizes();

    this.drawVertices();
    this.drawEdges(EdgeColor.Grey);
    this.drawEdges(EdgeColor.Green);
    this.drawEdges(EdgeColor.Blue);
    this.drawEdges(EdgeColor.Yellow);
    this.drawEdges(EdgeColor.Red);
  }

  private setSizes() {
    this.setElementSize(this.canvasesContainer);
    this.setCanvasSize(this.verticesCanvas);
    this.edgesCanvases.forEach((value) => {
      this.setCanvasSize(value);
    });
  }

  private drawVertices() {
    const ctx = this.verticesCanvas.getContext('2d');
    ctx.clearRect(0, 0, this.canvasSize.width, this.canvasSize.height);

    this.vertexShapes.forEach((vertexShape) => {
      vertexShape.draw(ctx);
    });
  }

  private drawEdges(color: EdgeColor) {
    const ctx = this.getEdgeCanvas(color).getContext('2d');
    ctx.clearRect(0, 0, this.canvasSize.width, this.canvasSize.height);

    this.edgeShapes.get(color).forEach((edgeShape) => {
      edgeShape.draw(ctx);
    });
  }

  private getVerticesDepths(currentDepth: Array<Vertex>, visitedVertices: Array<Vertex> = []): Array<Array<Vertex>> {
    if (currentDepth.length == 0) {
      return [];
    }

    const nextDepth: Array<Vertex> = [];

    currentDepth.forEach((vertex) => {
      visitedVertices.push(vertex);
      const neighbours = this.graph.getNeighbours(vertex, EdgeColor.Grey);
      const nextDepthNeightbours = neighbours.filter((neighbour) => {
        return !visitedVertices.includes(neighbour) && !nextDepth.includes(neighbour);
      });
      nextDepth.push(...nextDepthNeightbours);
    });

    const result = [currentDepth];
    const nextDepths = this.getVerticesDepths(nextDepth, visitedVertices);
    result.push(...nextDepths);
    return result;
  }

  private findLongestDepthLength(verticesDepths: Array<Array<Vertex>>): number {
    let result = 0;
    verticesDepths.forEach((depth) => {
      if (depth.length > result) {
        result = depth.length;
      }
    });
    return result;
  }

  private calculateCanvasSize(verticesDepths: Array<Array<Vertex>>, longestDepthLength: number) {
    const depthsLength = verticesDepths.length;
    return new Size(
      (kVertexDiameter * depthsLength) + (this.distanceBetweenVerticesH * (depthsLength - 1)) + kCanvasPadding * 2,
      this.calculateDepthHeight(longestDepthLength) + kCanvasPadding * 2,
    );
  }

  private calculateDepthHeight(depthLength: number): number {
    return (kVertexDiameter * depthLength) + (this.distanceBetweenVerticesV * (depthLength - 1))
  }

  private generateVertexShapes(verticesDepths: Array<Array<Vertex>>): Array<VertexShape> {
    const result: Array<VertexShape> = []
    verticesDepths.forEach((depth, depthIndex) => {
      const offset = (this.distanceBetweenVerticesV + (kVertexDiameter / 2)); // needs to fill full height, try to change to 0 to see difference
      const shiftY = (this.canvasSize.height + (offset * 2) - (kCanvasPadding * 2)) / (depth.length + 1);
      depth.forEach((vertex, vertexIndex) => {
        result.push(
          new VertexShape(
            vertex,
            new Position(
              kVertexDiameter / 2 + depthIndex * (kVertexDiameter + this.distanceBetweenVerticesH) + kCanvasPadding,
              shiftY * (vertexIndex + 1) - offset + kCanvasPadding
            )
          )
        )
      });
    });
    return result;
  }

  private generateEdgeShapes(): Map<EdgeColor, Array<EdgeShape>> {
    let result = new Map<EdgeColor, Array<EdgeShape>>();

    Object.values(EdgeColor).forEach((color) => {
      result.set(color, []);
    });

    this.graph.edges.forEach((edge) => {
      let array = result.get(edge.color);
      array.push(new EdgeShape(
        edge,
        this.getVertexShapePosition(edge.vertex_ids[0]),
        this.getVertexShapePosition(edge.vertex_ids[1])
      ))
    });

    return result;
  }

  private getVertexShapePosition(vertexId: number): Position {
    const vertexShape = this.vertexShapes.find((vertexShape) => {
      return vertexShape.vertex.id == vertexId;
    });
    return vertexShape.position;
  }
};
