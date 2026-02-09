export interface Block {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export interface StackEngineState {
  blocks: Block[];
  currentBlock: Block | null;
  direction: 1 | -1;
  speed: number;
  gameOver: boolean;
  score: number;
}

const BLOCK_HEIGHT = 25;
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
const INITIAL_WIDTH = 200;
const BASE_SPEED = 2;

const COLORS = [
  "#00fff5", "#ff2d95", "#39ff14", "#b026ff", "#ffe600",
  "#06b6d4", "#f97316", "#ec4899", "#a855f7", "#22c55e",
];

export function createInitialState(): StackEngineState {
  const baseBlock: Block = {
    x: (CANVAS_WIDTH - INITIAL_WIDTH) / 2,
    y: CANVAS_HEIGHT - BLOCK_HEIGHT,
    width: INITIAL_WIDTH,
    height: BLOCK_HEIGHT,
    color: COLORS[0],
  };

  const movingBlock: Block = {
    x: 0,
    y: CANVAS_HEIGHT - BLOCK_HEIGHT * 2,
    width: INITIAL_WIDTH,
    height: BLOCK_HEIGHT,
    color: COLORS[1],
  };

  return {
    blocks: [baseBlock],
    currentBlock: movingBlock,
    direction: 1,
    speed: BASE_SPEED,
    gameOver: false,
    score: 0,
  };
}

export function updateMovingBlock(state: StackEngineState): StackEngineState {
  if (!state.currentBlock || state.gameOver) return state;

  const block = { ...state.currentBlock };
  block.x += state.speed * state.direction;

  // Bounce off walls
  let dir = state.direction;
  if (block.x + block.width > CANVAS_WIDTH) {
    block.x = CANVAS_WIDTH - block.width;
    dir = -1 as const;
  } else if (block.x < 0) {
    block.x = 0;
    dir = 1 as const;
  }

  return { ...state, currentBlock: block, direction: dir };
}

export function dropBlock(state: StackEngineState): StackEngineState {
  if (!state.currentBlock || state.gameOver) return state;

  const current = state.currentBlock;
  const topBlock = state.blocks[state.blocks.length - 1];

  // Calculate overlap
  const overlapStart = Math.max(current.x, topBlock.x);
  const overlapEnd = Math.min(
    current.x + current.width,
    topBlock.x + topBlock.width
  );
  const overlapWidth = overlapEnd - overlapStart;

  if (overlapWidth <= 0) {
    // Missed completely
    return { ...state, gameOver: true };
  }

  const newScore = state.score + 1;

  // Place the overlapping portion
  const placedBlock: Block = {
    x: overlapStart,
    y: current.y,
    width: overlapWidth,
    height: BLOCK_HEIGHT,
    color: current.color,
  };

  const blocks = [...state.blocks, placedBlock];

  // New moving block
  const nextY = current.y - BLOCK_HEIGHT;
  const nextBlock: Block = {
    x: 0,
    y: nextY,
    width: overlapWidth,
    height: BLOCK_HEIGHT,
    color: COLORS[(newScore + 1) % COLORS.length],
  };

  // Speed increases
  const speed = BASE_SPEED + newScore * 0.15;

  return {
    blocks,
    currentBlock: nextBlock,
    direction: 1,
    speed,
    gameOver: false,
    score: newScore,
  };
}

export function renderState(
  ctx: CanvasRenderingContext2D,
  state: StackEngineState
) {
  // Clear
  ctx.fillStyle = "#0a0a0f";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Calculate camera offset to follow the stack
  const topY = state.currentBlock
    ? state.currentBlock.y
    : state.blocks[state.blocks.length - 1].y;
  const cameraOffset = Math.max(0, CANVAS_HEIGHT / 2 - topY);

  ctx.save();
  ctx.translate(0, cameraOffset);

  // Draw placed blocks
  for (const block of state.blocks) {
    ctx.fillStyle = block.color;
    ctx.fillRect(block.x, block.y, block.width, block.height);
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 1;
    ctx.strokeRect(block.x, block.y, block.width, block.height);
  }

  // Draw current moving block
  if (state.currentBlock && !state.gameOver) {
    ctx.fillStyle = state.currentBlock.color;
    ctx.fillRect(
      state.currentBlock.x,
      state.currentBlock.y,
      state.currentBlock.width,
      state.currentBlock.height
    );
    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.lineWidth = 1;
    ctx.strokeRect(
      state.currentBlock.x,
      state.currentBlock.y,
      state.currentBlock.width,
      state.currentBlock.height
    );
  }

  ctx.restore();
}

export { CANVAS_WIDTH, CANVAS_HEIGHT };
