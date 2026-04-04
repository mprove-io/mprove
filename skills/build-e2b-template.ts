import { createRequire } from 'node:module';
import { defaultBuildLogger, Template } from 'e2b';

let require = createRequire(import.meta.url);
let config = require('./e2b-template-config.json');

let cpuCount = config.cpuCount;
let memoryMB = config.memoryMB;
let skipCache = config.skipCache;
let opencodeVersion = config.opencode;
let mproveCliVersion = config.mprove;
// let malloyCliVersion = config.malloyCli;
let templateVersion = config.template;
let mproveDocsFm = config.repos.mproveDocsFm;
let malloyDocs = config.repos.malloyDocs;

// let templateName = `${templateVersion}_opencode_${opencodeVersion.split('.').join('-')}_mprove_${mproveCliVersion.split('.').join('-')}_malloy-cli_${malloyCliVersion.split('.').join('-')}`;
let templateName = `${templateVersion}_opencode_${opencodeVersion.split('.').join('-')}_mprove_${mproveCliVersion.split('.').join('-')}`;

console.log(`Building e2b template: ${templateName}`);

let template = Template()
  .fromImage('node:24.14.0-bookworm')
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
  // .runCmd(`sudo npm install -g @malloydata/cli@${malloyCliVersion}`)
  .runCmd(
    `git clone ${mproveDocsFm.url} ${mproveDocsFm.path} && cd ${mproveDocsFm.path} && git checkout ${mproveDocsFm.commit}`
  )
  .runCmd(
    `git clone ${malloyDocs.url} ${malloyDocs.path} && cd ${malloyDocs.path} && git checkout ${malloyDocs.commit}`
  )
  .makeDir('/home/user/.config/opencode')
  .copy(
    'opencode-global-config.json',
    '/home/user/.config/opencode/opencode.json'
  )
  .copy(
    'mprove-instructions.md',
    '/home/user/.config/opencode/mprove-instructions.md'
  )
  .copy(
    'mprove-basic/SKILL.md',
    '/home/user/.config/opencode/skills/mprove-basic/SKILL.md'
  )
  .copy(
    'mprove-build-malloy-model/SKILL.md',
    '/home/user/.config/opencode/skills/mprove-build-malloy-model/SKILL.md'
  )
  .copy(
    'mprove-build-store-model/SKILL.md',
    '/home/user/.config/opencode/skills/mprove-build-store-model/SKILL.md'
  )
  .copy(
    'mprove-connection-schemas/SKILL.md',
    '/home/user/.config/opencode/skills/mprove-connection-schemas/SKILL.md'
  )
  .copy(
    'mprove-query-data/SKILL.md',
    '/home/user/.config/opencode/skills/mprove-query-data/SKILL.md'
  )
  .copy(
    'mprove-project-structure/SKILL.md',
    '/home/user/.config/opencode/skills/mprove-project-structure/SKILL.md'
  );

let result = await Template.build(template, templateName, {
  cpuCount: cpuCount,
  memoryMB: memoryMB,
  skipCache: skipCache,
  onBuildLogs: defaultBuildLogger()
});

console.log();
console.log(`templateName: ${templateName}`);
console.log(`templateId: ${result.templateId}`);
