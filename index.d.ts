declare module 'logicguru-engine' {
  export interface Rule {
    useFiles?: {
      [key: string]: {
        path: string;
      };
    };
    [key: string]: any;
  }

  export interface RuleEngineOptions {
    basePath?: string;
    defaultContext?: Record<string, any>;
  }

  export interface RuntimeData {
    [key: string]: any;
  }

  export interface RuleEngine {
    (runtimeData?: RuntimeData): Promise<any>;
  }

  export function configureRuleEngine(
    rules: Rule[],
    options?: RuleEngineOptions
  ): RuleEngine;
} 