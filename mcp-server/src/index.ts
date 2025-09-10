#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { promises as fs } from 'fs';
import path from 'path';
import { glob } from 'glob';

// 프로젝트 루트 디렉토리 설정
const PROJECT_ROOT = 'C:\\Users\\msd12\\OneDrive\\Desktop\\zentpoker';

class ZentPokerMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'zentpoker-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    
    // 에러 핸들러
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers() {
    // 도구 목록 핸들러
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'read_file',
          description: 'Read content from a file in the ZentPoker project',
          inputSchema: {
            type: 'object',
            properties: {
              path: {
                type: 'string',
                description: 'Relative path from project root',
              },
            },
            required: ['path'],
          },
        },
        {
          name: 'write_file',
          description: 'Write content to a file in the ZentPoker project',
          inputSchema: {
            type: 'object',
            properties: {
              path: {
                type: 'string',
                description: 'Relative path from project root',
              },
              content: {
                type: 'string',
                description: 'Content to write to the file',
              },
            },
            required: ['path', 'content'],
          },
        },
        {
          name: 'list_files',
          description: 'List files in a directory or matching a pattern',
          inputSchema: {
            type: 'object',
            properties: {
              path: {
                type: 'string',
                description: 'Directory path or glob pattern (e.g., "src/**/*.ts")',
                default: '.',
              },
            },
          },
        },
        {
          name: 'create_directory',
          description: 'Create a new directory',
          inputSchema: {
            type: 'object',
            properties: {
              path: {
                type: 'string',
                description: 'Directory path to create',
              },
            },
            required: ['path'],
          },
        },
        {
          name: 'delete_file',
          description: 'Delete a file',
          inputSchema: {
            type: 'object',
            properties: {
              path: {
                type: 'string',
                description: 'File path to delete',
              },
            },
            required: ['path'],
          },
        },
        {
          name: 'search_code',
          description: 'Search for code patterns in the project',
          inputSchema: {
            type: 'object',
            properties: {
              pattern: {
                type: 'string',
                description: 'Search pattern (regex or string)',
              },
              filePattern: {
                type: 'string',
                description: 'File pattern to search in (e.g., "**/*.ts")',
                default: '**/*',
              },
            },
            required: ['pattern'],
          },
        },
      ],
    }));

    // 도구 실행 핸들러
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'read_file':
            return await this.readFile(args.path);
          
          case 'write_file':
            return await this.writeFile(args.path, args.content);
          
          case 'list_files':
            return await this.listFiles(args.path || '.');
          
          case 'create_directory':
            return await this.createDirectory(args.path);
          
          case 'delete_file':
            return await this.deleteFile(args.path);
          
          case 'search_code':
            return await this.searchCode(args.pattern, args.filePattern || '**/*');
          
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        if (error instanceof McpError) throw error;
        
        throw new McpError(
          ErrorCode.InternalError,
          `Error executing tool ${name}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    });
  }

  private async readFile(filePath: string) {
    const fullPath = path.join(PROJECT_ROOT, filePath);
    
    try {
      const content = await fs.readFile(fullPath, 'utf-8');
      return {
        content: [
          {
            type: 'text',
            text: content,
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to read file ${filePath}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private async writeFile(filePath: string, content: string) {
    const fullPath = path.join(PROJECT_ROOT, filePath);
    
    try {
      // 디렉토리가 없으면 생성
      const dir = path.dirname(fullPath);
      await fs.mkdir(dir, { recursive: true });
      
      await fs.writeFile(fullPath, content, 'utf-8');
      return {
        content: [
          {
            type: 'text',
            text: `Successfully wrote to ${filePath}`,
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to write file ${filePath}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private async listFiles(pattern: string) {
    try {
      const fullPattern = path.join(PROJECT_ROOT, pattern);
      
      // 디렉토리인지 확인
      try {
        const stat = await fs.stat(fullPattern);
        if (stat.isDirectory()) {
          const files = await fs.readdir(fullPattern);
          return {
            content: [
              {
                type: 'text',
                text: files.join('\n'),
              },
            ],
          };
        }
      } catch {
        // 디렉토리가 아니면 glob 패턴으로 처리
      }

      // glob 패턴 검색
      const files = await glob(pattern, {
        cwd: PROJECT_ROOT,
        ignore: ['node_modules/**', '.git/**', 'dist/**', '.next/**'],
      });

      return {
        content: [
          {
            type: 'text',
            text: files.length > 0 ? files.join('\n') : 'No files found',
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to list files: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private async createDirectory(dirPath: string) {
    const fullPath = path.join(PROJECT_ROOT, dirPath);
    
    try {
      await fs.mkdir(fullPath, { recursive: true });
      return {
        content: [
          {
            type: 'text',
            text: `Successfully created directory ${dirPath}`,
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to create directory ${dirPath}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private async deleteFile(filePath: string) {
    const fullPath = path.join(PROJECT_ROOT, filePath);
    
    try {
      await fs.unlink(fullPath);
      return {
        content: [
          {
            type: 'text',
            text: `Successfully deleted ${filePath}`,
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to delete file ${filePath}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private async searchCode(searchPattern: string, filePattern: string) {
    try {
      const files = await glob(filePattern, {
        cwd: PROJECT_ROOT,
        ignore: ['node_modules/**', '.git/**', 'dist/**', '.next/**'],
      });

      const results: Array<{ file: string; line: number; content: string }> = [];
      const regex = new RegExp(searchPattern, 'gi');

      for (const file of files) {
        const fullPath = path.join(PROJECT_ROOT, file);
        try {
          const content = await fs.readFile(fullPath, 'utf-8');
          const lines = content.split('\n');
          
          lines.forEach((line, index) => {
            if (regex.test(line)) {
              results.push({
                file,
                line: index + 1,
                content: line.trim(),
              });
            }
          });
        } catch {
          // 읽을 수 없는 파일은 무시
        }
      }

      const resultText = results.length > 0
        ? results.map(r => `${r.file}:${r.line}: ${r.content}`).join('\n')
        : 'No matches found';

      return {
        content: [
          {
            type: 'text',
            text: resultText,
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to search code: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('ZentPoker MCP server running...');
  }
}

// 서버 시작
const server = new ZentPokerMCPServer();
server.run().catch(console.error);