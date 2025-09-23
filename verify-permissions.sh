#!/bin/bash

# Quick verification script for GitHub Actions permissions
# Run this locally or check these settings in your repository

echo "🔍 GitHub Actions Permissions Verification Checklist"
echo "=================================================="
echo ""

echo "✅ Repository Settings to Check:"
echo ""
echo "1. Actions Permissions (Settings → Actions → General):"
echo "   □ 'Allow all actions and reusable workflows' is selected"
echo "   □ OR specific actions are allowlisted"
echo ""

echo "2. Workflow Permissions (Settings → Actions → General):"
echo "   □ 'Read and write permissions' is selected"  
echo "   □ 'Allow GitHub Actions to create and approve pull requests' is checked"
echo ""

echo "3. Branch Protection (Settings → Branches):"
echo "   □ Check if 'main' branch has protection rules"
echo "   □ If yes, ensure GitHub Actions can bypass or"
echo "   □ Exclude 'data/' directory from protection"
echo ""

echo "4. Required Secrets (Settings → Secrets and Variables → Actions):"
echo "   □ NPM_CI_TOKEN is set (for NPM publishing)"
echo "   □ Token has 'automation' or 'publish' permissions"
echo ""

echo "🧪 Test the Fix:"
echo ""
echo "1. Go to Actions tab in your repository"
echo "2. Find 'Daily Data Scrape' workflow"
echo "3. Click 'Run workflow' button (workflow_dispatch trigger)"
echo "4. Monitor the workflow execution"
echo "5. Check if commits appear in repository after completion"
echo ""

echo "🚨 If Still Failing:"
echo ""
echo "Consider using a Personal Access Token instead:"
echo "1. Generate PAT with 'repo' scope at: https://github.com/settings/tokens"
echo "2. Add as repository secret named 'PAT_TOKEN'"  
echo "3. Update workflow checkout to use PAT_TOKEN instead of GITHUB_TOKEN"
echo ""

echo "📋 Current Workflow Configuration:"
echo "- Permissions: contents: write, packages: write"
echo "- Bot identity: github-actions[bot]"
echo "- Push method: git push origin main"
echo "- Triggers: schedule (daily 2AM UTC), workflow_dispatch, push to main"