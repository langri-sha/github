import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

const rule = (glob, checks) => ({ glob, affects: { checks } })
const rules = [
  rule('ci/**', ['*']),
  rule('terraform/web/**', ['prettier', 'terraform-web']),
  rule('terraform/**', ['terraform-placement']),
  rule('**', ['*']),
]
const links = [
  'dag+check://?check=prettier/check',
  'dag+check://?check=terraform-web/test',
  'dag+check://?check=terraform-placement/test',
].join('\n')
const changes = (...paths) => paths.join('\0') + '\0'

function resolve(scopeRules, scopeChanges, scopeLinks = links) {
  const directory = mkdtempSync(join(tmpdir(), 'dagger-scope-'))
  try {
    const files = [JSON.stringify(scopeRules), scopeChanges, scopeLinks].map(
      (value, index) => {
        const path = join(directory, String(index))
        writeFileSync(path, value)
        return path
      },
    )
    return execFileSync(
      process.execPath,
      [fileURLToPath(new URL('./scope.mjs', import.meta.url)), ...files],
      { encoding: 'utf8', env: { ...process.env, GITHUB_STEP_SUMMARY: '' } },
    ).trim()
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
}

test('unions first matches across deletions and additions, including dotfiles', () => {
  assert.equal(
    resolve(
      rules,
      changes(
        'D',
        'terraform/web/.terraform.lock.hcl',
        'A',
        'terraform/new.tf',
      ),
    ),
    '--module prettier --module terraform-placement --module terraform-web',
  )
  assert.equal(
    resolve(rules, changes('M', 'terraform/web/a file with spaces.tf')),
    '--module prettier --module terraform-web',
  )
})

test('selects the whole suite when any path reaches the catch-all', () => {
  assert.equal(
    resolve(rules, changes('M', 'terraform/web/main.tf', 'A', 'new/file')),
    '',
  )
})

test('selects the whole suite when the scope manifest changes', () => {
  assert.equal(resolve(rules, changes('M', 'ci/scope.json')), '')
})

test('selects the whole suite when a named module has no checks', () => {
  assert.equal(
    resolve(
      [rule('**/main.tf', ['prettier', 'missing']), rule('**', ['*'])],
      changes('M', 'main.tf'),
    ),
    '',
  )
})

test('selects the whole suite when a module name is invalid', () => {
  assert.equal(
    resolve(
      [rule('**/main.tf', ['prettier', 'in.valid']), rule('**', ['*'])],
      changes('M', 'main.tf'),
    ),
    '',
  )
})

test('selects the whole suite when path or rule data is incomplete', () => {
  assert.equal(resolve(rules, 'M\0terraform/web/main.tf'), '')
  assert.equal(
    resolve(rules.slice(0, -1), changes('M', 'terraform/web/main.tf')),
    '',
  )
})

test('selects the whole suite when a check cannot be selected by module', () => {
  assert.equal(
    resolve(
      rules,
      changes('M', 'terraform/web/main.tf'),
      links + '\ndag+check://?check=workspace-check',
    ),
    '',
  )
})

test('selects the whole suite when no module is selected', () => {
  assert.equal(
    resolve(
      [rule('docs/**', []), rule('**', ['*'])],
      changes('M', 'docs/readme.md'),
    ),
    '',
  )
})
