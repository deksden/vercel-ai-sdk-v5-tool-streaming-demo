export const TEST_MESSAGES = {
  // Messages with specific project names that should trigger tool usage
  MEDIUM_DASHBOARD: "Create a medium-complexity dashboard project called 'Analytics Dashboard'",
  SIMPLE_APP: "Build a simple web application project named 'Portfolio Website'", 
  COMPLEX_ECOMMERCE: "Develop a complex e-commerce platform called 'Online Store Pro'",
  // Even more explicit with names
  EXPLICIT_DASHBOARD: "Use the sampleCreateTool to build a dashboard project named 'Sales Dashboard' with medium complexity",
  // Alternative options
  ANALYTICS_DASHBOARD: "Please create an analytics dashboard called 'Analytics Dashboard' with medium complexity",
  INVENTORY_SYSTEM: "Build an inventory management system named 'Inventory Tracker' with complex features"
} as const;

export const EXPECTED_PROGRESS_STEPS = [
  "Project Analysis",
  "Architecture Design", 
  "Component Creation",
  "Integration",
  "Testing",
  "Deployment"
] as const;

export const TEST_TIMEOUTS = {
  PAGE_LOAD: 10000,
  PROGRESS_START: 15000,
  PROGRESS_RUNNING: 10000,
  PROGRESS_COMPLETE: 60000,
  STEP_TRANSITION: 5000
} as const;

export const PROJECT_COMPLEXITIES = {
  SIMPLE: 'simple',
  MEDIUM: 'medium', 
  COMPLEX: 'complex'
} as const;