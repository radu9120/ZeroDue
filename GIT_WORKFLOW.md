# Git Repository Management Guide

## Repository Information
- **URL**: https://github.com/radu9120/ZeroDue
- **Project**: InvoiceFlow - Invoice Management System

## Setting Up Issues, Labels, and Milestones

### Step 1: Create Labels
Navigate to: `https://github.com/radu9120/ZeroDue/labels`

#### Recommended Labels:
1. **bug** (Red #d73a4a) - Something isn't working
2. **enhancement** (Blue #a2eeef) - New feature or request
3. **documentation** (Blue #0075ca) - Documentation improvements
4. **testing** (Green #0e8a16) - Related to automated testing
5. **performance** (Yellow #fbca04) - Performance optimization
6. **security** (Purple #7057ff) - Security improvements
7. **ui/ux** (Pink #d876e3) - User interface and experience
8. **api** (Orange #f9d0c4) - API endpoints
9. **good first issue** (Green #7057ff) - Good for newcomers
10. **high priority** (Red #b60205) - Urgent fixes

### Step 2: Create Milestones
Navigate to: `https://github.com/radu9120/ZeroDue/milestones`

#### Suggested Milestones:

1. **Assessment Preparation** (Due: January 15, 2026)
   - Complete automated testing suite
   - Performance optimization
   - Documentation updates

2. **Testing & Quality Assurance** (Due: January 8, 2026)
   - Achieve 70%+ test coverage
   - Integration tests
   - API endpoint testing

3. **Performance Optimization** (Due: January 10, 2026)
   - Lighthouse score improvements
   - Image optimization
   - Code splitting

4. **Future Enhancements** (No due date)
   - Post-assessment features
   - Additional functionality

### Step 3: Create Issues

#### Issue Templates:

**Issue #1: Expand Automated Testing Coverage**
```
Title: Expand automated testing to achieve 70%+ coverage
Labels: testing, enhancement, high priority
Milestone: Testing & Quality Assurance

Description:
Currently have 158 tests passing but overall coverage is low (0.57% statements).

Tasks:
- [x] Create component tests (23 tests)
- [x] Add API route tests (33 tests)  
- [x] Implement action tests (30 tests)
- [x] Add calculation tests (20 tests)
- [x] Create schema validation tests (11 tests)
- [x] Add email utility tests (14 tests)
- [ ] Add integration tests for complete user flows
- [ ] Test authentication flows end-to-end

Expected outcome: Comprehensive test suite with good coverage
```

**Issue #2: Implement Performance Optimizations**
```
Title: Optimize application performance based on Lighthouse audit
Labels: performance, enhancement
Milestone: Performance Optimization

Description:
Need to run Lighthouse audit and implement recommended optimizations.

Tasks:
- [ ] Run initial Lighthouse audit
- [ ] Document baseline metrics
- [ ] Implement image optimization (WebP, lazy loading)
- [ ] Add code splitting for heavy components
- [ ] Optimize bundle size
- [ ] Implement caching strategies
- [ ] Run post-optimization audit
- [ ] Document improvements

Metrics to improve:
- Performance Score
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)
```

**Issue #3: Set Up CI/CD Pipeline**
```
Title: Configure automated testing in CI/CD
Labels: testing, enhancement
Milestone: Testing & Quality Assurance

Description:
Set up GitHub Actions to run tests automatically on push/PR.

Tasks:
- [ ] Create .github/workflows/test.yml
- [ ] Configure Vitest to run on push
- [ ] Add coverage reporting
- [ ] Set up test status badges
- [ ] Configure deployment preview testing
```

**Issue #4: Improve API Documentation**
```
Title: Document all API endpoints with examples
Labels: documentation, api
Milestone: Assessment Preparation

Description:
Create comprehensive documentation for all API routes.

Endpoints to document:
- /api/invoices/list
- /api/invoices/[id]
- /api/estimates/[id]
- /api/whoami
- /api/stripe/*
- Authentication flows

Include:
- Request/response examples
- Error codes
- Authentication requirements
```

**Issue #5: Accessibility Improvements**
```
Title: Improve accessibility based on Lighthouse audit
Labels: ui/ux, enhancement
Milestone: Performance Optimization

Tasks:
- [ ] Add ARIA labels to interactive elements
- [ ] Ensure keyboard navigation works
- [ ] Check color contrast ratios
- [ ] Add alt text to all images
- [ ] Test with screen readers
- [ ] Add focus indicators
```

**Issue #6: Security Audit**
```
Title: Security review and hardening
Labels: security, high priority
Milestone: Assessment Preparation

Tasks:
- [ ] Review authentication implementation
- [ ] Check authorization on all API routes
- [ ] Implement rate limiting
- [ ] Add input sanitization
- [ ] Review environment variable usage
- [ ] Check for exposed secrets
- [ ] Implement CSRF protection
```

**Issue #7: Mobile Responsiveness Testing**
```
Title: Test and improve mobile experience
Labels: ui/ux, testing
Milestone: Performance Optimization

Tasks:
- [ ] Test on various device sizes
- [ ] Check touch target sizes
- [ ] Optimize mobile navigation
- [ ] Test invoice generation on mobile
- [ ] Ensure forms work on mobile
- [ ] Test PDF viewing on mobile devices
```

**Issue #8: Database Query Optimization**
```
Title: Optimize database queries for performance
Labels: performance, enhancement
Milestone: Performance Optimization

Tasks:
- [ ] Analyze slow queries
- [ ] Add appropriate indexes
- [ ] Implement query result caching
- [ ] Optimize invoice list pagination
- [ ] Add database connection pooling
- [ ] Review N+1 query issues
```

## Creating Issues via GitHub CLI

If you have GitHub CLI installed:

```bash
# Install GitHub CLI (if not installed)
# macOS: brew install gh

# Authenticate
gh auth login

# Create an issue
gh issue create --title "Issue title" --body "Issue description" --label "bug,high priority" --milestone "Assessment Preparation"
```

## Creating Issues via Web Interface

1. Go to https://github.com/radu9120/ZeroDue/issues
2. Click "New Issue"
3. Fill in title and description
4. Add labels on the right sidebar
5. Assign milestone
6. Optionally assign to yourself
7. Click "Submit new issue"

## Best Practices

1. **Regular Commits**: Commit frequently with meaningful messages
   ```bash
   git commit -m "test: add invoice API endpoint tests"
   git commit -m "perf: optimize image loading with lazy loading"
   git commit -m "docs: update API documentation"
   ```

2. **Link Commits to Issues**: Reference issues in commit messages
   ```bash
   git commit -m "fix: resolve authentication bug (#1)"
   git commit -m "feat: add performance monitoring (closes #2)"
   ```

3. **Update Issues**: Comment on progress and close when done

4. **Use Branches**: Create feature branches
   ```bash
   git checkout -b feature/performance-optimization
   git checkout -b test/api-endpoints
   git checkout -b docs/api-documentation
   ```

## Commit Message Conventions

Follow conventional commits format:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `test:` Adding or updating tests
- `perf:` Performance improvements
- `refactor:` Code refactoring
- `style:` Code style changes
- `chore:` Maintenance tasks

Example:
```bash
git commit -m "test: add comprehensive invoice API tests

- Add tests for GET /api/invoices/list endpoint
- Test error scenarios (400, 401, 404, 500)
- Add authentication and authorization tests
- Achieve 100% coverage for invoice routes

Closes #1"
```
