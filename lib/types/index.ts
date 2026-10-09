// ============================================================
// XIVIZLEY — Shared TypeScript Types
// lib/types/index.ts
// ============================================================

import type { Node, Edge } from 'reactflow';

// ─── Custom Container Definitions ───────────────────────────

export interface CustomPortDef {
  host: number;
  container: number;
  protocol?: 'tcp' | 'udp';
  label?: string;
}

export interface CustomVolumeDef {
  hostPath: string;
  containerPath: string;
  readOnly?: boolean;
}

// ─── Module Instance (Canvas Node Data) ─────────────────────

/**
 * The data payload attached to each ReactFlow node.
 * This is stored in node.data and represents one deployed
 * service instance on the canvas.
 */
export interface ModuleNodeData {
  /** Reference to MODULE_CATALOG entry id */
  moduleId: string;
  /** User-customised display name (defaults to module name) */
  label: string;
  /** Port overrides: key = internal port number, value = actual host port */
  portOverrides: Record<number, number>;
  /** Environment variable overrides */
  envOverrides: Record<string, string>;
  /** Whether this node has any active port conflicts */
  hasConflict: boolean;
  /** Conflict details for this node */
  conflicts: PortConflict[];
  /** Selected Minecraft plugin IDs (only used for minecraft-paperm modules) */
  selectedPlugins: string[];
  /** Dynamic advanced settings chosen by user */
  advancedSettings: Record<string, unknown>;

  // ── Custom Container Attributes (Exact preservation for custom / imported images) ──
  isCustom?: boolean | undefined;
  customImage?: string | undefined;
  customContainerName?: string | undefined;
  customPorts?: CustomPortDef[] | undefined;
  customVolumes?: CustomVolumeDef[] | undefined;
  customEnv?: Record<string, string> | undefined;
  customRestart?: string | undefined;
  customNetworks?: string[] | undefined;
}

// ─── Dynamic Settings Types ───────────────────────────────────

export type SettingType = 'boolean' | 'string' | 'select';

export interface SettingOption {
  label: string;
  value: string;
}

export interface AdvancedSettingDef {
  /** Unique key for the setting (stored in advancedSettings record) */
  id: string;
  type: SettingType;
  label: string;
  description?: string;
  /** Default value for the setting when module is added */
  defaultValue: unknown;
  /** Only applies to 'select' type */
  options?: SettingOption[];
  /** Optional placeholder for string inputs */
  placeholder?: string;
}

// ─── Port Conflict Types ─────────────────────────────────────

export interface PortConflict {
  /** The host port that is contested */
  hostPort: number;
  /** IDs of nodes sharing this port */
  conflictingNodeIds: string[];
  /** Suggested alternative ports */
  suggestions: number[];
}

/** Map of host port → conflict details */
export type ConflictMap = Map<number, PortConflict>;

// ─── Typed ReactFlow Nodes ───────────────────────────────────

export type ArchitectNode = Node<ModuleNodeData>;
export type ArchitectEdge = Edge;

// ─── Canvas State Snapshot (for persistence) ─────────────────

export interface CanvasSnapshot {
  nodes: ArchitectNode[];
  edges: ArchitectEdge[];
  /** ISO timestamp */
  savedAt: string;
}

// ─── Architecture DTO (from API / DB) ────────────────────────

export interface ArchitectureDTO {
  id: string;
  title: string;
  description: string | null;
  canvasJson: string;
  thumbnail: string | null;
  isPublic: boolean;
  viewCount: number;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  _count: {
    likes: number;
    comments: number;
  };
}

// ─── API Response Shapes ─────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  error?: never;
}

export interface ApiError {
  data?: never;
  error: string;
  code?: string;
}

export type ApiResult<T> = ApiResponse<T> | ApiError;

// ─── Code Generation ─────────────────────────────────────────

export interface GeneratedCode {
  dockerCompose: string;
  bashInstall: string;
}

export interface DeploymentPackage {
  dockerCompose: string;
  deployScript: string;
  readme: string;
}
