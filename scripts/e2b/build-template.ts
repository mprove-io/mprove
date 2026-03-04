import { defaultBuildLogger, Template } from 'e2b';

let version = process.argv[2];
let variant = process.argv[3];
if (!version || !variant) {
  console.error(
    'Usage: pnpm e2b:build <opencode-version> <variant>\nExample: pnpm e2b:build 1.2.10 11.0.102-dev_v1'
  );
  process.exit(1);
}

let templateName = `opencode_${version.split('.').join('-')}_${variant}`;

console.log(`Building e2b template: ${templateName}`);
console.log();

let template = Template()
  .fromBaseImage()
  .aptInstall(['curl', 'git', 'ripgrep', 'openssh-client', 'ca-certificates'])
  .runCmd(
    `curl -fsSL https://opencode.ai/install | bash -s -- --version ${version}`
  )
  .runCmd(
    'sudo ln -s /home/user/.opencode/bin/opencode /usr/local/bin/opencode'
  )
  .runCmd(
    '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"'
  )
  // .runCmd(
  //   '/home/linuxbrew/.linuxbrew/bin/brew install mprove-io/mprove/mprove-cli'
  // )
  // .runCmd(
  //   'sudo ln -s /home/linuxbrew/.linuxbrew/bin/mprove /usr/local/bin/mprove'
  // )
  .runCmd(
    'curl -fsSL -o /tmp/mprove-cli.tar.gz https://github.com/mprove-io/mprove-cli/releases/download/11.0.102-dev/mprove-cli-11.0.102-dev-linux-amd64.tar.gz'
  )
  .runCmd(
    'sudo tar -xzf /tmp/mprove-cli.tar.gz -C /usr/local/bin && rm /tmp/mprove-cli.tar.gz'
  );

let result = await Template.build(template, templateName, {
  cpuCount: 2,
  memoryMB: 4096,
  skipCache: true,
  onBuildLogs: defaultBuildLogger()
});

console.log();
console.log(`Template built: ${templateName}`);
console.log(`Template ID: ${result.templateId}`);
