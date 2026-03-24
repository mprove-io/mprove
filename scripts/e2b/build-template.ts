import { parseArgs } from 'node:util';
import { defaultBuildLogger, Template } from 'e2b';

let { values } = parseArgs({
  options: {
    opencode: { type: 'string' },
    mprove: { type: 'string' },
    'malloy-cli': { type: 'string' },
    template: { type: 'string' }
  },
  strict: true
});

let opencodeVersion = values.opencode;
let mproveCliVersion = values.mprove;
let malloyCliVersion = values['malloy-cli'];
let templateVersion = values.template;

if (
  !opencodeVersion ||
  !mproveCliVersion ||
  !malloyCliVersion ||
  !templateVersion
) {
  console.error(
    `Usage: pnpm e2b:build --opencode <version> --mprove <version> --malloy-cli <version> --template <version>
Example: pnpm e2b:build --opencode 1.2.27 --mprove 11.0.102-dev --malloy-cli 0.0.52 --template v9`
  );

  process.exit(1);
}

let templateName = `opencode_${opencodeVersion.split('.').join('-')}_mprove_${mproveCliVersion.split('.').join('-')}_malloy-cli_${malloyCliVersion.split('.').join('-')}_${templateVersion}`;

console.log(`Building e2b template: ${templateName}`);

let template = Template()
  .fromImage('node:24.10.0-bookworm')
  .aptInstall(['curl', 'git', 'ripgrep', 'openssh-client', 'ca-certificates'])
  .runCmd(
    `curl -fsSL https://opencode.ai/install | bash -s -- --version ${opencodeVersion}`
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
    `curl -fsSL -o /tmp/mprove-cli.tar.gz https://github.com/mprove-io/mprove-cli/releases/download/${mproveCliVersion}/mprove-cli-${mproveCliVersion}-linux-amd64.tar.gz`
  )
  .runCmd(
    'sudo tar -xzf /tmp/mprove-cli.tar.gz -C /usr/local/bin && rm /tmp/mprove-cli.tar.gz'
  )
  .runCmd(`sudo npm install -g @malloydata/cli@${malloyCliVersion}`);

let result = await Template.build(template, templateName, {
  cpuCount: 2,
  memoryMB: 4096,
  skipCache: true,
  onBuildLogs: defaultBuildLogger()
});

console.log();
console.log(`templateName: ${templateName}`);
console.log(`templateId: ${result.templateId}`);
