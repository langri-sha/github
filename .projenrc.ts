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
    devDeps: [
      '@langri-sha/lint-staged@*',
      '@langri-sha/prettier@*',
      '@langri-sha/projen-project@*',
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
  pnpmWorkspace: {
    minimumReleaseAgeExclude: ['@langri-sha/*'],
    allowBuilds: {
      '@swc/core': true,
      esbuild: true,
    },
  },
  prettier: {},
  renovate: {
    packageRules: [
      {
        description: 'Packages published from the langri-sha/projen monorepo',
        groupName: 'langri-sha projen toolchain',
        groupSlug: 'langri-sha-projen',
        matchSourceUrls: ['https://github.com/langri-sha/projen'],
      },
      {
        description: 'Install our own packages without waiting them out',
        matchPackageNames: ['@langri-sha/**'],
        minimumReleaseAge: null,
      },
      {
        description:
          'Install our own GitHub Actions and Terraform modules without waiting them out',
        matchPackageNames: ['langri-sha/**'],
        minimumReleaseAge: null,
      },
    ],
  },
  typeScriptConfig: {
    config: {
      extends: ['@langri-sha/tsconfig', '@langri-sha/tsconfig/react.json'],
    },
  },
})

project.package?.addEngine('pnpm', '>= 11.0.0')
project.package?.addField('main', 'src/index.tsx')
project.package?.addField('packageManager', 'pnpm@11.17.0')
project.package?.addField('private', true)

project.tryFindObjectFile('tsconfig.json')?.addDeletionOverride('files')

project.synth()
