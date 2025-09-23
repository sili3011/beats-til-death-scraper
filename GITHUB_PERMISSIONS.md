# GitHub Actions Permissions Setup

This document explains how to resolve the "Write access to repository not granted" error in GitHub Actions.

## The Problem

GitHub Actions workflows triggered by `schedule` or `workflow_dispatch` have restricted permissions by default and may not be able to push changes back to the repository.

## Solutions Applied

### 1. Added Explicit Permissions

The workflow now includes explicit permissions:

```yaml
permissions:
  contents: write    # Required to push commits
  packages: write    # Required for NPM publishing  
  actions: read      # Required for workflow access
  id-token: write    # Required for secure publishing
```

### 2. Updated Bot Identity

Changed from generic action identity to official GitHub Actions bot:

```yaml
git config --local user.email "41898282+github-actions[bot]@users.noreply.github.com"
git config --local user.name "github-actions[bot]"
```

### 3. Explicit Branch Push

Changed from generic `git push` to explicit branch push:

```yaml
git push origin main
```

## Alternative Solutions

If the above doesn't work, consider these alternatives:

### Option A: Use Personal Access Token

1. Create a Personal Access Token (PAT) with `repo` permissions
2. Add it as a repository secret named `PAT_TOKEN`
3. Update the checkout step:

```yaml
- name: Checkout repository
  uses: actions/checkout@v4
  with:
    token: ${{ secrets.PAT_TOKEN }}
```

### Option B: Use Deploy Key

1. Generate SSH key pair
2. Add public key as Deploy Key in repository settings
3. Add private key as repository secret
4. Configure SSH authentication in workflow

### Option C: Disable Branch Protection

If you have branch protection rules:

1. Go to repository Settings → Branches
2. Edit protection rules for `main` branch  
3. Allow GitHub Actions to bypass restrictions
4. Or exclude data file paths from protection

## Repository Settings to Check

1. **Actions Permissions**: Settings → Actions → General
   - Ensure "Allow all actions and reusable workflows" is selected
   - Or allowlist specific actions

2. **Workflow Permissions**: Settings → Actions → General → Workflow permissions
   - Select "Read and write permissions"
   - Check "Allow GitHub Actions to create and approve pull requests"

3. **Branch Protection**: Settings → Branches
   - Review protection rules on `main` branch
   - Consider allowing force pushes from GitHub Actions
   - Or exclude `data/` directory from protection

## Testing the Fix

1. Trigger the workflow manually using "workflow_dispatch"
2. Check the Actions tab for any permission errors
3. Verify that commits appear in the repository
4. Monitor for successful NPM publishing

## Security Considerations

- The workflow only writes to `data/` directory
- NPM publishing requires separate `NPM_CI_TOKEN` secret
- Bot commits are clearly identified
- Permissions are minimal required for functionality