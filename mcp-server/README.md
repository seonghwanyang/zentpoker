# ZentPoker MCP Server

ZentPoker 프로젝트를 위한 MCP(Model Context Protocol) 서버입니다. 이 서버를 통해 Claude Desktop에서 프로젝트의 파일을 읽고, 쓰고, 검색할 수 있습니다.

## 설치 방법

1. MCP 서버 디렉토리로 이동:
```bash
cd C:\Users\msd12\OneDrive\Desktop\zentpoker\mcp-server
```

2. 의존성 설치:
```bash
npm install
```

3. TypeScript 컴파일:
```bash
npm run build
```

## Claude Desktop 설정

1. Claude Desktop 설정 파일 위치 찾기:
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`

2. 설정 파일에 다음 내용 추가:
```json
{
  "mcpServers": {
    "zentpoker": {
      "command": "node",
      "args": ["C:\\Users\\msd12\\OneDrive\\Desktop\\zentpoker\\mcp-server\\dist\\index.js"],
      "env": {}
    }
  }
}
```

3. Claude Desktop을 재시작합니다.

## 사용 가능한 도구

### 1. read_file
파일 내용을 읽습니다.
```
도구: read_file
인자: { "path": "src/app/page.tsx" }
```

### 2. write_file
파일에 내용을 씁니다.
```
도구: write_file
인자: { 
  "path": "src/components/NewComponent.tsx",
  "content": "파일 내용..."
}
```

### 3. list_files
디렉토리의 파일 목록을 조회하거나 glob 패턴으로 검색합니다.
```
도구: list_files
인자: { "path": "src/**/*.tsx" }
```

### 4. create_directory
새 디렉토리를 생성합니다.
```
도구: create_directory
인자: { "path": "src/new-feature" }
```

### 5. delete_file
파일을 삭제합니다.
```
도구: delete_file
인자: { "path": "src/old-file.ts" }
```

### 6. search_code
코드에서 특정 패턴을 검색합니다.
```
도구: search_code
인자: { 
  "pattern": "useState",
  "filePattern": "**/*.tsx"
}
```

## 개발 모드

개발 중에는 다음 명령어로 실행할 수 있습니다:
```bash
npm run dev
```

## 문제 해결

1. **서버가 시작되지 않는 경우**:
   - Node.js가 설치되어 있는지 확인하세요.
   - 프로젝트 경로가 정확한지 확인하세요.

2. **파일을 찾을 수 없는 경우**:
   - 상대 경로를 사용하고 있는지 확인하세요.
   - 프로젝트 루트 디렉토리가 올바른지 확인하세요.

3. **Claude Desktop에서 인식하지 못하는 경우**:
   - 설정 파일의 JSON 문법이 올바른지 확인하세요.
   - Claude Desktop을 완전히 종료했다가 다시 시작하세요.

## 보안 주의사항

- 이 서버는 지정된 프로젝트 디렉토리 내의 파일만 접근할 수 있습니다.
- 민감한 정보가 포함된 파일(`.env` 등)에 대한 접근 제한을 고려하세요.