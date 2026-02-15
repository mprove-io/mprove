import { defaultBuildLogger, Template } from 'e2b';

let version = process.argv[2];
let variant = process.argv[3];
if (!version || !variant) {
  console.error(
    'Usage: pnpm e2b:build <sandbox-agent-version> <variant>\nExample: pnpm e2b:build 0.2.0 v4_11-0-99-dev'
  );
  process.exit(1);
}

let templateName = `sandboxagent_${version.split('.').join('-')}_${variant}`;

console.log(`Building e2b template: ${templateName}`);
console.log(`  sandbox-agent version: ${version}`);
console.log();

let template = Template()
  .fromBaseImage()
  .aptInstall(['git', 'openssh-client', 'curl', 'ca-certificates'])
  .runCmd(
    `curl -fsSL https://releases.rivet.dev/sandbox-agent/${version}/install.sh | SANDBOX_AGENT_VERSION=${version} sh`
  )
  // .runCmd('sandbox-agent install-agent claude')
  .runCmd('sandbox-agent install-agent codex')
  .runCmd('sandbox-agent install-agent opencode')
  .runCmd(
    '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"'
  )
  .runCmd(
    '/home/linuxbrew/.linuxbrew/bin/brew install mprove-io/mprove/mprove-cli'
  )
  .runCmd(
    'sudo ln -s /home/linuxbrew/.linuxbrew/bin/mprove /usr/local/bin/mprove'
  );

let result = await Template.build(template, templateName, {
  cpuCount: 2,
  memoryMB: 2048,
  // skipCache: true,
  onBuildLogs: defaultBuildLogger()
});

console.log();
console.log(`Template built: ${templateName}`);
console.log(`Template ID: ${result.templateId}`);
