const git = require('isomorphic-git');
const http = require('isomorphic-git/http/node');
const fs = require('fs');
const path = require('path');

const dir = path.resolve(__dirname, '..');
const token = process.env.GITHUB_TOKEN || process.argv[2];

async function main() {
  if (!token) {
    console.error('Error: GITHUB_TOKEN is required as argument or env var.');
    process.exit(1);
  }

  console.log('📦 Initializing git repository at:', dir);
  await git.init({ fs, dir });

  console.log('📁 Staging files...');
  // Read gitignore
  const gitignoreContent = fs.readFileSync(path.join(dir, '.gitignore'), 'utf8');
  const ignorePatterns = gitignoreContent
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'));

  function shouldIgnore(relPath) {
    for (const pat of ignorePatterns) {
      if (relPath === pat || relPath.startsWith(pat + '/') || relPath.startsWith(pat + '\\') || relPath.includes('/node_modules') || relPath.includes('\\node_modules') || relPath.includes('.git')) {
        return true;
      }
    }
    return false;
  }

  function getAllFiles(currentDir, baseDir) {
    let files = [];
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      const relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
      if (shouldIgnore(relPath)) continue;
      if (entry.isDirectory()) {
        files = files.concat(getAllFiles(fullPath, baseDir));
      } else {
        files.push(relPath);
      }
    }
    return files;
  }

  const filesToAdd = getAllFiles(dir, dir);
  console.log(`Found ${filesToAdd.length} project files to commit.`);

  for (const file of filesToAdd) {
    await git.add({ fs, dir, filepath: file });
  }

  console.log('💾 Creating commit...');
  const sha = await git.commit({
    fs,
    dir,
    author: {
      name: 'alex-0091',
      email: 'alex@plot-twist.pk',
    },
    message: 'Initial commit: PLOT TWIST 🇵🇰 Pakistan\'s Property Game with Pakistani theme, cards, bots & multiplayer',
  });
  console.log('Commit SHA:', sha);

  try {
    await git.branch({ fs, dir, ref: 'main', checkout: true });
  } catch (e) {
    // branch already exists
  }

  console.log('🚀 Pushing to GitHub (main branch)...');
  await git.push({
    fs,
    http,
    dir,
    url: 'https://github.com/alex-0091/plot-twist.git',
    ref: 'main',
    remoteRef: 'main',
    force: true,
    onAuth: () => ({ username: token }),
  });

  console.log('✅ Successfully pushed to https://github.com/alex-0091/plot-twist.git !');
}

main().catch((err) => {
  console.error('Push failed:', err);
  process.exit(1);
});
