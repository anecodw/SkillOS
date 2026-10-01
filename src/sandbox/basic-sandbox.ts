import { Sandbox, SandboxConfig, EvalScenario, EvalResult } from './types';
import { Skill } from '../formats';
import { PermissionDeniedError, ExecutionTimeoutError } from '../core/errors';
import vm from 'vm';

/**
 * Basic Sandbox with Node.js vm isolation
 * 
 * ⚠️ WARNING: This sandbox provides basic isolation using Node.js vm module,
 * but is NOT production-ready. It does not provide complete security isolation.
 * For production use, consider Docker containers, vm2, or other proper isolation solutions.
 * 
 * Current limitations:
 * - Does not isolate the process itself
 * - Does not limit CPU or memory usage effectively
 * - Node.js vm can still access some global objects
 * - Not suitable for untrusted code execution
 * 
 * This is intended for development and testing purposes only.
 */
export class BasicSandbox implements Sandbox {
  private config: SandboxConfig;
  private defaultTimeout: number = 5000; // 5 seconds default timeout

  constructor() {
    this.config = {
      allowShell: false,
      allowNetwork: false,
      allowFileWrite: true
    };
  }

  configure(config: Partial<SandboxConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Execute a skill with basic vm isolation
   */
  async execute(skill: Skill, input: string): Promise<string> {
    // Check security permissions
    this.checkPermissions(skill);

    // Create isolated context
    const context = this.createIsolatedContext(skill, input);

    try {
      // Execute in vm with timeout
      const script = new vm.Script(`
        // Simulated skill execution
        const result = {
          skill: '${skill.name}',
          version: '${skill.version}',
          input: input,
          instructions: instructions.substring(0, 200) + '...',
          timestamp: new Date().toISOString()
        };
        JSON.stringify(result, null, 2);
      `);

      const startTime = Date.now();
      const result = script.runInNewContext(context, {
        timeout: this.defaultTimeout
      });
      const elapsed = Date.now() - startTime;

      if (elapsed >= this.defaultTimeout) {
        throw new ExecutionTimeoutError(this.defaultTimeout);
      }

      return result;
    } catch (error) {
      if (error instanceof Error && error.message.includes('Script execution timed out')) {
        throw new ExecutionTimeoutError(this.defaultTimeout);
      }
      throw error;
    }
  }

  /**
   * Run eval scenarios for a skill
   */
  async eval(skill: Skill, scenarios: EvalScenario[]): Promise<EvalResult[]> {
    const results: EvalResult[] = [];

    for (const scenario of scenarios) {
      try {
        const output = await this.execute(skill, scenario.input);
        
        // Simple check if expected output is contained in actual output
        const passed = output.toLowerCase().includes(scenario.expected.toLowerCase());
        
        results.push({
          scenario: scenario.name,
          passed,
          output,
          error: undefined
        });
      } catch (error) {
        results.push({
          scenario: scenario.name,
          passed: false,
          output: '',
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    return results;
  }

  /**
   * Check if skill's security requirements are met by sandbox config
   */
  private checkPermissions(skill: Skill): void {
    if (skill.security?.allowShell && !this.config.allowShell) {
      throw new PermissionDeniedError('shell execution');
    }

    if (skill.security?.allowNetwork && !this.config.allowNetwork) {
      throw new PermissionDeniedError('network access');
    }

    if (skill.security?.allowFileWrite === false && this.config.allowFileWrite) {
      // Skill explicitly forbids file write, but sandbox allows it
      // This is a warning, not an error
      console.warn(`Warning: Skill '${skill.name}' forbids file write, but sandbox allows it`);
    }
  }

  /**
   * Create an isolated vm context
   */
  private createIsolatedContext(skill: Skill, input: string): Record<string, any> {
    // Create a minimal, isolated context
    const context: Record<string, any> = {
      // Basic utilities
      console: {
        log: (...args: any[]) => console.log('[Sandbox]', ...args),
        warn: (...args: any[]) => console.warn('[Sandbox]', ...args),
        error: (...args: any[]) => console.error('[Sandbox]', ...args)
      },
      
      // Input data
      input: input,
      instructions: skill.instructions,
      
      // Skill metadata
      skill: {
        name: skill.name,
        version: skill.version,
        author: skill.author,
        description: skill.description
      },
      
      // Date object (safe)
      Date: Date,
      
      // JSON (safe)
      JSON: JSON,
      
      // Math (safe)
      Math: Math,
      
      // Safe string manipulation
      String: String,
      Number: Number,
      Boolean: Boolean,
      Array: Array,
      Object: Object
    };

    // Conditionally add unsafe capabilities based on config
    if (this.config.allowShell) {
      console.warn('⚠️ WARNING: Shell execution is enabled in sandbox. This is not secure.');
      // In a real implementation, you would add a safe shell wrapper here
    }

    if (this.config.allowNetwork) {
      console.warn('⚠️ WARNING: Network access is enabled in sandbox. This is not secure.');
      // In a real implementation, you would add a safe HTTP client here
    }

    if (this.config.allowFileWrite) {
      console.warn('⚠️ WARNING: File write is enabled in sandbox. This is not secure.');
      // In a real implementation, you would add a safe file system wrapper here
    }

    return context;
  }

  /**
   * Set execution timeout
   */
  setTimeout(timeout: number): void {
    this.defaultTimeout = timeout;
  }

  /**
   * Get current sandbox configuration
   */
  getConfig(): SandboxConfig {
    return { ...this.config };
  }
}
