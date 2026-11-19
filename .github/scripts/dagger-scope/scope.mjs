import { readFileSync, appendFileSync } from 'node:fs'
import picomatch from 'picomatch'

const moduleName = /^[a-z][a-z0-9-]*$/
const statuses = /^[ADMTUXB]$/

function changedPaths(changes) {
  const records = changes.split('\0')
  if (records.pop() !== '' || records.length % 2 !== 0) {
    throw new Error('Incomplete changed path list')
  }

  const paths = new Set()
  for (let i = 0; i < records.length; i += 2) {
    const [status, path] = [records[i], records[i + 1]]
    if (!statuses.test(status) || !path) {
      throw new Error('Invalid changed path record')
    }
    paths.add(path)
  }
  return [...paths]
}

function checkModules(list) {
  const modules = new Set()
  for (const link of list.trim().split('\n').filter(Boolean)) {
    const check = new URL(link).searchParams.get('check')
    if (!check?.includes('/')) {
      throw new Error('The Dagger check list includes a check without a module')
    }
    modules.add(check.split('/')[0])
  }
  return modules
}

function select(rules, paths, modules) {
  if (!Array.isArray(rules) || rules.at(-1)?.glob !== '**') {
    throw new Error('Expected a rule list ending in a ** catch-all')
  }
  const matchers = rules.map((rule) => {
    const { glob, affects: { checks } = {} } = rule
    if (typeof glob !== 'string' || !glob || !Array.isArray(checks)) {
      throw new Error('Invalid scope rule')
    }
    if (
      checks.some(
        (id) =>
          id !== '*' &&
          (typeof id !== 'string' || !moduleName.test(id) || !modules.has(id)),
      )
    ) {
      throw new Error('Scope rule names a module without a Dagger check')
    }
    return { glob, matches: picomatch(glob, { dot: true }), checks }
  })
  if (!matchers.at(-1).checks.includes('*')) {
    throw new Error('The catch-all must select every check')
  }

  const selected = new Set()
  const matched = new Set()
  for (const path of paths) {
    if (path === 'ci/scope.json') {
      return { reason: 'The scope manifest changed' }
    }
    const rule = matchers.find(({ matches }) => matches(path))
    if (!rule || rule.checks.includes('*')) {
      return { reason: 'A changed path requires the full check suite' }
    }
    rule.checks.forEach((id) => selected.add(id))
    matched.add(rule.glob)
  }

  return selected.size
    ? { selected: [...selected].sort(), matched: [...matched] }
    : { reason: 'The changed paths selected no check modules' }
}

const [rulesFile, changesFile, checksFile] = process.argv.slice(2)
let result
try {
  result = select(
    JSON.parse(readFileSync(rulesFile, 'utf8')),
    changedPaths(readFileSync(changesFile, 'utf8')),
    checkModules(readFileSync(checksFile, 'utf8')),
  )
} catch (error) {
  result = {
    reason:
      'The scope rules, changed paths, or Dagger check list could not be validated',
  }
  console.error(error.message)
}

const output = result.selected?.map((id) => `--module ${id}`).join(' ') ?? ''
console.log(output)

if (process.env.GITHUB_STEP_SUMMARY) {
  const label = (value) => '`' + value.replace(/[`<>\x00-\x1f\x7f]/g, '?') + '`'
  const summary = result.reason
    ? `All Dagger checks run. ${result.reason}.\n`
    : [
        `Check modules: ${result.selected.map(label).join(', ')}`,
        `Matched rules: ${result.matched.map(label).join(', ')}`,
      ].join('\n\n') + '\n'
  appendFileSync(
    process.env.GITHUB_STEP_SUMMARY,
    `### Dagger check scope\n\n${summary}\n`,
  )
}
