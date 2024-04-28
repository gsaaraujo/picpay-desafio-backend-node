export interface SystemMetrics {
  init(): Promise<void>;
  getMetrics(): Promise<any>;
}
