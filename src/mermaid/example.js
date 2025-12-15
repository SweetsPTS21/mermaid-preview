export const exampleDiagram = `graph TD
  A[Start] --> B{Decision}
  B -->|Yes| C[Action 1]
  B -->|No| D[Action 2]
  C --> E[End]
  D --> E`

export const initMermaid = `graph TD
  A[Start] --> B[Process]
  B --> C[End]`
