import { isFailure, isSuccess } from '@outfitter/contracts';
import { describe, expect, it, mock } from 'bun:test';
import { generateBiomeConfig, installBiomeConfig } from '../biome.js';
import type { BaselayerConfig } from '../../schemas/baselayer-config.js';
describe('generateBiomeConfig', () => {
  it('should generate minimal Biome configuration with Ultracite', () => {
    const config = generateBiomeConfig();
    const parsed = JSON.parse(config);
    
    expect(parsed).toMatchObject({
      $schema: 'https://biomejs.dev/schemas/2.2.0/schema.json',
      extends: ['ultracite'],
      json: {
        parser: {
          allowComments: true,
          allowTrailingCommas: true,
        },
      },
      vcs: {
        useIgnoreFile: true,
      },
    });
    // Files should only have ignoreUnknown when no custom patterns
    expect(parsed.files).toEqual({ ignoreUnknown: true });
  });

  it('should add monorepo exclusions only when needed', () => {
    const baselayerConfig: BaselayerConfig = {
      project: { type: 'monorepo' }
    };
    
    const config = generateBiomeConfig(baselayerConfig);
    const parsed = JSON.parse(config);
    
    expect(parsed.files.ignore).toContain('packages/**/node_modules/**');
  });

  it('should add Bun globals when using Bun', () => {
    const baselayerConfig: BaselayerConfig = {
      project: { packageManager: 'bun' }
    };
    
    const config = generateBiomeConfig(baselayerConfig);
    const parsed = JSON.parse(config);
    
    expect(parsed.javascript).toMatchObject({
      globals: ['Bun'],
    });
  });

  it('should add custom ignores only when provided', () => {
    const baselayerConfig: BaselayerConfig = {
      ignore: ['custom-build/', '*.generated.*']
    };
    
    const config = generateBiomeConfig(baselayerConfig);
    const parsed = JSON.parse(config);
    
    expect(parsed.files.ignore).toContain('custom-build/');
    expect(parsed.files.ignore).toContain('*.generated.*');
  });

  it('should not add ignore array when no custom ignores', () => {
    const baselayerConfig: BaselayerConfig = {};
    
    const config = generateBiomeConfig(baselayerConfig);
    const parsed = JSON.parse(config);
    
    // Files should only have ignoreUnknown, no ignore array
    expect(parsed.files).toEqual({ ignoreUnknown: true });
    expect(parsed.files.ignore).toBeUndefined();
  });

  it('should apply user overrides', () => {
    const baselayerConfig: BaselayerConfig = {
      overrides: {
        biome: {
          formatter: {
            indentStyle: 'tab'
          }
        }
      }
    };
    
    const config = generateBiomeConfig(baselayerConfig);
    const parsed = JSON.parse(config);
    
    expect(parsed.formatter).toMatchObject({
      indentStyle: 'tab'
    });
  });
          }),
          stdio: ['inherit', 'inherit', 'inherit'],
        });
        return Promise.resolve();
      }),
    }));

    const result = await installBiomeConfig();
    expect(isSuccess(result)).toBe(true);
  });
  });

  it('should handle errors from ultracite init', async () => {
    const error = new Error('Command failed');
    
    // Mock Bun.$ to throw an error
    mock.module('bun', () => ({
      $: mock(() => {
        throw error;
      }),
    }));

    const result = await installBiomeConfig();

    expect(isFailure(result)).toBe(true);
    if (isFailure(result)) {
      expect(result.error).toBeInstanceOf(Error);
      expect((result.error as Error).message).toContain('Command failed');
    }
  });
});
