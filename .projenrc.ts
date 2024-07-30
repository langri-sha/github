import { Project } from '@langri-sha/projen-project'

const project = new Project({
  name: '@langri-sha/github',
  package: {
    authorEmail: 'filip.dupanovic@gmail.com',
    authorName: 'Filip Dupanović',
    authorOrganization: false,
    bugsUrl: 'https://github.com/langri-sha/biro/issues',
    homepage: 'https://github.com/langri-sha/biro/#readme',
    license: 'MIT',
    licensed: true,
    minNodeVersion: '20.0.0',
    repository: 'langri-sha/biro',

    type: 'module',
    devDeps: [
      '@langri-sha/lint-staged@*',
      '@langri-sha/prettier@*',
      '@langri-sha/projen-project@*',
      '@types/lint-staged@*',
      'lint-staged@*',
      'prettier@*',
      'projen@0.84.8',
      'ts-node@*',
      'typescript@*',
    ],
    peerDependencyOptions: {
      pinnedDevDependency: false,
    },
  },
  codeowners: {
    '*': '@langri-sha',
  },
  editorConfig: {},
  husky: {
    'pre-commit': 'pnpm -q lint-staged',
  },
  lintStaged: {},
  lintSynthesized: {},
  prettier: {},
  renovate: {},
  typeScriptConfig: {
    config: {
      extends: '@langri-sha/tsconfig/react.json',
    },
  },
})

project.package?.addEngine('pnpm', '>= 9.0.0')
project.package?.addField('main', 'src/index.tsx')
project.package?.addField('packageManager', 'pnpm@9.5.0')
project.package?.addField('private', true)

project.tryFindObjectFile('tsconfig.json')?.addDeletionOverride('files')

project.synth()
