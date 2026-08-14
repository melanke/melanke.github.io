export interface Tech {
  name: string;
  since: string;
  /**
   * Year the technology was last used, derived from the timeline: the latest
   * end year across every `content/timeline-items.ts` entry listing it (an
   * entry still marked "current" counts as the present year).
   *
   * `simpli` is excluded as a source. It is a software house, so its
   * `technologies` is the union of 31 client projects, and counting it would
   * date every one of them to its own 2025 end — jQuery and Backbone included.
   * The work itself lives in the children. `33labs` is a parent too but stays:
   * it is a hands-on role whose list describes its own work, and Docker,
   * Microservices and REST appear nowhere else at that date.
   *
   * Not every value is derived, though. Many technologies are never listed in
   * any item's `technologies` — they live only in the skill blocks in
   * `components/ResumePage.tsx` — because those arrays name the handful of
   * technologies that defined each project, not everything it touched. Those
   * carry a year set by hand from the project that backs them (the AI group
   * and most of the blockchain group are like this). **Re-deriving from the
   * timeline alone would wipe them**, so a regeneration has to keep whatever
   * it cannot re-establish.
   *
   * Still optional: what has neither a timeline reference nor a project to
   * point at stays empty rather than getting an invented year.
   */
  lastUsed?: string;
}

function tech(name: string, since: string, lastUsed?: string): Tech {
  return { name, since, lastUsed };
}

export const backend = {
  nodejs: tech("Node.js", "2012", "2025"),
  java: tech("Java", "2008", "2024"),
  kotlin: tech("Kotlin", "2016", "2024"),
  csharp: tech("C#", "2018", "2024"),
  python: tech("Python", "2018", "2024"),
  r: tech("R", "2018", "2019"),
  mysql: tech("MySQL", "2013", "2024"),
  postgresql: tech("PostgreSQL", "2013", "2025"),
  nosql: tech("NoSQL", "2018", "2026"),
  prisma: tech("Prisma", "2021", "2025"),
  redis: tech("Redis", "2015", "2022"),
  graphql: tech("GraphQL", "2021", "2024"),
  rest: tech("REST", "2012", "2026"),
  websockets: tech("WebSockets", "2016", "2025"),
  express: tech("Express", "2012", "2026"),
  typegraphql: tech("TypeGraphQL", "2021", "2024"),
  apollo: tech("Apollo", "2021", "2024"),
  jersey: tech("Jersey", "2020", "2023"),
  paypal: tech("PayPal", "2016", "2020"),
  elasticsearch: tech("ElasticSearch", "2019", "2025"),
  docker: tech("Docker", "2016", "2026"),
  aws: tech("AWS", "2013", "2025"),
  ecs: tech("ECS", "2016", "2025"),
  s3: tech("S3", "2015", "2025"),
  sns: tech("SNS", "2015", "2025"),
  sqs: tech("SQS", "2015", "2025"),
  terraform: tech("Terraform", "2019", "2025"),
  cicd: tech("CI/CD", "2018", "2026"),
  githubActions: tech("GitHub Actions", "2020", "2026"),
  microservices: tech("Microservices", "2019", "2026"),
  distributedSystems: tech("Distributed Systems", "2019", "2026"),
  solutionArchitecture: tech("Solution Architecture", "2016", "2025"),
} as const;

export const frontend = {
  javascript: tech("JavaScript", "2008", "2026"),
  typescript: tech("TypeScript", "2016", "2026"),
  reactjs: tech("React.js", "2016", "2026"),
  nextjs: tech("Next.js", "2021", "2026"),
  tailwind: tech("Tailwind", "2020", "2025"),
  sveltekit: tech("SvelteKit", "2023", "2024"),
  angular: tech("Angular", "2021", "2024"),
  jquery: tech("JQuery", "2010", "2018"),
  backbone: tech("Backbone", "2011", "2013"),
  electronjs: tech("Electron.js", "2021", "2024"),
  chakraUi: tech("Chakra UI", "2020", "2023"),
  reactQuery: tech("React Query", "2021", "2025"),
  reduxToolkit: tech("Redux Toolkit", "2021", "2024"),
  echarts: tech("ECharts", "2019", "2025"),
  valtio: tech("Valtio", "2023", "2025"),
  vite: tech("Vite", "2022", "2025"),
  jest: tech("Jest", "2018", "2025"),
  playwright: tech("Playwright", "2023", "2024"),
  storybook: tech("Storybook", "2020", "2024"),
  reactHookForm: tech("React Hook Form", "2020", "2023"),
} as const;

export const other = {
  android: tech("Android", "2010", "2019"),
  ios: tech("iOS", "2014", "2015"),
  xamarin: tech("Xamarin", "2014", "2015"),
  reactNative: tech("React Native", "2021", "2024"),
  unity: tech("Unity", "2017", "2023"),
  figma: tech("Figma", "2021", "now"),
  sketch: tech("Sketch", "2016", "2019"),
  xd: tech("XD", "2019", "2021"),
  illustrator: tech("Illustrator", "2008", "2021"),
  photoshop: tech("Photoshop", "2007", "now"),
  blender: tech("Blender", "2021", "2023"),
  procreate: tech("Procreate", "2023", "now"),
} as const;

export const blockchain = {
  ethereum: tech("Ethereum", "2020", "2026"),
  evm: tech("EVM", "2020", "2026"),
  web3: tech("Web3", "2018", "2024"),
  blockchain: tech("Blockchain", "2020", "2024"),
  smartContracts: tech("Smart Contracts", "2018", "2025"),
  solidity: tech("Solidity", "2020", "2026"),
  foundry: tech("Foundry", "2025", "2026"),
  hardhat: tech("Hardhat", "2020", "2026"),
  protocolArchitecture: tech("Protocol Architecture", "2023", "2026"),
  fuzzing: tech("Fuzzing", "2023", "2026"),
  gasOptimization: tech("Gas Optimization", "2023", "2026"),
  wagmi: tech("Wagmi", "2023", "2026"),
  viem: tech("Viem", "2024", "2026"),
  theGraph: tech("The Graph", "2023", "2025"),
  ethers: tech("Ethers", "2021", "2025"),
  solana: tech("Solana", "2021", "2025"),
  flow: tech("Flow", "2022", "2023"),
  cadence: tech("Cadence", "2022", "2023"),
  neoN3: tech("Neo N3", "2021", "2024"),
  vmCompilerDevelopment: tech("VM Compiler Development", "2018", "2024"),
  walletDevelopment: tech("Wallet Development", "2021", "2025"),
  walletInfrastructure: tech("Wallet Infrastructure", "2021", "2025"),
  walletConnect: tech("WalletConnect", "2021", "2024"),
  multiChainIntegration: tech("Multi-chain Integration", "2018", "2024"),
  sdkDevelopment: tech("SDK Development", "2022", "2024"),
  cryptography: tech("Cryptography", "2023", "2025"),
  accountAbstraction: tech("Account Abstraction", "2024", "2025"),
  nft: tech("NFT", "2018", "2023"),
  cryptoCurrency: tech("Crypto Currency", "2018", "2024"),
  dex: tech("DEX", "2021", "2026"),
  amm: tech("AMM", "2023", "2026"),
  auditPrep: tech("Audit Prep", "2023", "2026"),
  slither: tech("Slither", "2023", "2026"),
  automatedTesting: tech("Automated Testing", "2020", "2026"),
  systemArchitecture: tech("System Architecture", "2025", "2026"),
  uniswapV3: tech("Uniswap V3", "2025", "2026"),
  uniswapV4: tech("Uniswap V4", "2025", "2026"),
  predictionMarket: tech("Prediction Market", "2026", "2026"),
  vault: tech("Vault", "2026", "2026"),
  clob: tech("CLOB", "2026", "2026"),
  optimism: tech("Optimism", "2025", "2025"),
} as const;

/**
 * Competencies that ran across the work instead of distinguishing one project
 * from another. They stay in each timeline item's `technologies` so `lastUsed`
 * still sees them, but the timeline leaves them out of the per-project tech
 * list: repeating "CI/CD" on half the entries reads as filler, costs the page
 * budget, and the skills block already states each one once.
 */
export const crossCutting: readonly Tech[] = [
  backend.docker,
  backend.terraform,
  backend.cicd,
  backend.githubActions,
  backend.microservices,
  backend.distributedSystems,
  backend.solutionArchitecture,
  // Tooling rather than product decisions: a build tool, a test runner or a
  // component workshop says nothing about what a given project was.
  backend.typegraphql,
  backend.apollo,
  frontend.vite,
  frontend.jest,
  frontend.playwright,
  frontend.storybook,
  frontend.reactHookForm,
  // Practices and domain concepts behind the chain work. They belong on the
  // items so `lastUsed` can be derived from a real project, but naming them
  // per project restates what the description already tells. The concrete
  // libraries — wagmi, viem, ethers — stay visible: those do say what a
  // project was built with.
  blockchain.protocolArchitecture,
  blockchain.fuzzing,
  blockchain.gasOptimization,
  blockchain.auditPrep,
  blockchain.slither,
  blockchain.automatedTesting,
  blockchain.amm,
  blockchain.dex,
  blockchain.accountAbstraction,
  blockchain.walletDevelopment,
  blockchain.walletInfrastructure,
  blockchain.walletConnect,
  blockchain.cryptoCurrency,
  blockchain.multiChainIntegration,
  blockchain.sdkDevelopment,
  blockchain.neoN3,
  blockchain.vmCompilerDevelopment,
  blockchain.nft,
];

export const ai = {
  aiProcessAutomation: tech("AI Process Automation", "2025", "2026"),
  agentDevelopment: tech("Agent Development", "2025", "2026"),
  mcp: tech("MCP", "2025", "2026"),
  claudeSkills: tech("Claude Skills", "2025", "2026"),
  harnessEngineering: tech("Harness Engineering", "2026", "2026"),
  specDrivenDevelopment: tech("Spec-Driven Development", "2025", "2026"),
  claude: tech("Claude", "2025", "2026"),
  anthropicApi: tech("Anthropic API", "2025", "2026"),
  openaiApi: tech("OpenAI API", "2023", "2026"),
  claudeCode: tech("Claude Code", "2025", "2026"),
  cursor: tech("Cursor", "2024", "2026"),
  contextEngineering: tech("Context Engineering", "2025", "2026"),
  agenticWorkflows: tech("Agentic Workflows", "2025", "2026"),
  evals: tech("Evals", "2025", "2026"),
  rag: tech("RAG", "2024", "2026"),
  aiTooling: tech("AI Tooling", "2025", "2026"),
} as const;
