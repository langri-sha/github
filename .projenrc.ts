import { Project } from '@langri-sha/projen-project'

const project = new Project({
  name: '@langri-sha/github',
  package: {
    authorEmail: 'filip.dupanovic@gmail.com',
    authorName: 'Filip Dupanović',
    authorOrganization: false,
    bugsUrl: 'https://github.com/langri-sha/github/issues',
    homepage: 'https://github.com/langri-sha/github/#readme',
    license: 'MIT',
    licensed: true,
    minNodeVersion: '20.0.0',
    repository: 'langri-sha/github',

    type: 'module',
    devDeps: ['@langri-sha/lint-staged@0.9.11', '@langri-sha/prettier@0.4.11'],
    peerDependencyOptions: {
      pinnedDevDependency: false,
    },
  },
  codeowners: {
    '*': '@langri-sha',
  },
  dagger: {},
  editorConfig: {},
  husky: {
    'pre-commit': 'pnpm --silent lint-staged',
  },
  lintStaged: {},
  lintSynthesized: {},
  pnpmWorkspace: {
    minimumReleaseAgeExclude: ['@langri-sha/*', ...Project.presetPackages],
  },
  prettier: {},
  renovate: {
    extends: ['github>langri-sha/renovate-config'],
  },
  typeScriptConfig: {
    config: {
      extends: ['@langri-sha/tsconfig', '@langri-sha/tsconfig/react.json'],
    },
  },
  worktrunk: {},
})

project.package?.addEngine('pnpm', '>= 11.0.0')
project.package?.addField('main', 'src/index.tsx')
project.package?.addField('packageManager', 'pnpm@12.11.2')
project.package?.addField('private', true)

project.tryFindObjectFile('tsconfig.json')?.addDeletionOverride('files')

project.synth()
