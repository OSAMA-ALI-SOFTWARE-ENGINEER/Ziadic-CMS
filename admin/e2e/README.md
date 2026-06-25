# E2E Tests for Kukaqka CMS Admin Panel

Comprehensive end-to-end tests using Playwright for testing complete user workflows in the admin panel.

## Quick Start

### Run All Tests

```bash
npm run e2e
```

### Run Tests Interactively

```bash
npm run e2e:ui
```

### Run Tests in Browser

```bash
npm run e2e:headed
```

### Debug Tests

```bash
npm run e2e:debug
```

## Test Suites

### Authentication Tests (`auth.e2e.ts`)

Tests for login, logout, and access control:
- Valid credential login (all roles)
- Invalid credential handling
- Form validation
- Session persistence
- Protected route access
- Auto-redirect for authenticated users
- Demo credentials functionality

**Tests: 14**

### Listing Management (`listings.e2e.ts`)

CRUD and workflow tests for property listings:
- Create listings with validation
- Edit and update listings
- Delete with confirmation
- Publish/unpublish status changes
- Approve/reject workflows
- Search and filtering
- Pagination
- Bulk operations
- Duplicate listing

**Tests: 18**

### Article Management (`articles.e2e.ts`)

Blog article workflow tests:
- Create articles with rich text editor
- Auto-save functionality
- Edit and update articles
- Submit for review workflow
- Approve/reject by admin
- Publish articles
- Delete with confirmation
- Search and filtering
- Image upload
- Preview functionality

**Tests: 17**

### Media Management (`media.e2e.ts`)

File upload and media library tests:
- Upload files with progress
- Edit metadata (title, alt text, caption)
- Link media to listings
- Delete files with confirmation
- Search and filtering
- Sort by date/name/size
- Bulk operations
- Drag and drop upload
- View media details
- Copy URL functionality

**Tests: 20**

### User Management (`users.e2e.ts`)

User administration workflow tests:
- Create users with role assignment
- Edit user details
- Change user roles
- Toggle active/inactive status
- Delete users with confirmation
- Search users
- Filter by role/status
- Bulk operations
- Self-deletion prevention
- Password management

**Tests: 22**

## Test Structure

### Fixtures (`fixtures/`)

**test-data.ts** - Centralized test data:
- Pre-defined test objects for each entity
- Unique data generators using timestamps
- Invalid data for error testing
- Reusable fixtures across tests

### Utils (`utils/`)

**auth-helpers.ts** - Authentication utilities:
- `login()` - Generic login function
- `loginAsAdmin()` - Login as admin user
- `loginAsSuperAdmin()` - Login as super admin
- `loginAsStaff()` - Login as staff user
- `loginAsClient()` - Login as client user
- `logout()` - Logout function
- `isAuthenticated()` - Check auth status
- Test user credentials

**common-helpers.ts** - UI interaction utilities:
- `fillFormField()` - Fill form inputs
- `selectDropdownOption()` - Select from dropdowns
- `clickButton()` - Click buttons by text
- `clickLink()` - Click links by text
- `isElementVisible()` - Check element visibility
- `waitForLoadingComplete()` - Wait for spinners
- `waitForToastMessage()` - Wait for notifications
- `getTableRowCount()` - Get table data
- And more...

## Configuration

**playwright.config.ts** - Playwright configuration:
- Base URL: `http://localhost:5173`
- Browsers: Chromium, Firefox, WebKit
- Mobile: Pixel 5 (Android), iPhone 12 (iOS)
- Screenshots on failure
- Videos on failure
- HTML report generation
- Auto-retry failed tests
- Dev server auto-start

## Requirements

- Node.js 16+
- Admin panel running on `http://localhost:5173`
- Mock API or backend server
- Test user accounts (configured in auth-helpers)

## Running Tests

### All Tests

```bash
npm run e2e
```

### Specific Suite

```bash
npx playwright test e2e/tests/listings.e2e.ts
```

### Specific Test

```bash
npx playwright test -g "Create new listing"
```

### Single Browser

```bash
npx playwright test --project=chromium
```

### With Retries

```bash
npx playwright test --retries=3
```

## Test Results

After running tests, view the report:

```bash
npx playwright show-report
```

Reports include:
- Test status (passed/failed/skipped)
- Execution time
- Screenshots of failures
- Video recordings of failures
- Detailed error messages

## Key Features

### Dynamic Test Data

- Uses timestamps for unique identifiers
- Prevents data conflicts between test runs
- Reusable test data generators
- Support for both valid and invalid data

### Error Handling

- Graceful failure when elements don't exist
- Flexible toast message detection
- Fallback selectors for UI elements
- Proper timeout management

### Cross-Browser Testing

- Tests run on Chromium, Firefox, and Safari
- Mobile responsiveness tests
- Platform-specific handling
- Comprehensive coverage

### Detailed Reporting

- HTML report with screenshots
- Video recordings of failed tests
- Trace files for debugging
- Execution time tracking

## Test Data

### Test Users

Available credentials for login:
- **Super Admin**: `superadmin@kukaqka.com` / `password`
- **Admin**: `admin@kukaqka.com` / `password`
- **Staff**: `staff@kukaqka.com` / `password`
- **Client**: `client@kukaqka.com` / `password`

### Generate Unique Data

```typescript
import { generateUniqueListing, generateUniqueUser } from './fixtures/test-data'

const listing = generateUniqueListing()
const user = generateUniqueUser()
```

## Debugging

### Interactive UI

```bash
npm run e2e:ui
```

### Debug Mode

```bash
npm run e2e:debug
```

### Headed Mode (See Browser)

```bash
npm run e2e:headed
```

### Check Reports

```bash
npx playwright show-report
```

## Best Practices

1. **Keep tests independent** - No dependencies between tests
2. **Use meaningful names** - Describe what is being tested
3. **Avoid hard-coded waits** - Use explicit waits instead
4. **Test happy path and errors** - Cover success and failure cases
5. **Use helpers** - Reuse common functions
6. **Isolate test data** - Generate unique data per test
7. **Handle flakiness** - Use proper timeouts and waits

## Common Issues

| Issue | Solution |
|-------|----------|
| Port 5173 in use | Kill process on port 5173 or change port in config |
| Element not found | Use Playwright Inspector to find correct selector |
| Timeout waiting for element | Increase timeout or check if element exists |
| Tests fail locally but pass in CI | Check environment variables and test data |

## Integration

### GitHub Actions

Add to `.github/workflows/e2e.yml`:

```yaml
- run: npm run e2e
```

### Pre-commit Hook

Add to `.husky/pre-commit`:

```bash
npm run e2e
```

## Performance

- **Typical runtime**: 30-45 minutes (all tests)
- **Parallel execution**: 4 workers default
- **Per test average**: 20-30 seconds
- **Browser startup**: ~5 seconds

## Maintenance

- Update selectors when UI changes
- Add tests for new features
- Keep test data synchronized with API
- Review and update failing tests
- Remove tests for deprecated features

## Further Reading

- [Playwright Documentation](https://playwright.dev)
- [E2E Testing Guide](../E2E_TEST_GUIDE.md)
- [Best Practices](https://playwright.dev/docs/best-practices)

## Support

For issues:
1. Check the [E2E_TEST_GUIDE.md](../E2E_TEST_GUIDE.md)
2. Run `npm run e2e:debug` for interactive debugging
3. Check `playwright-report/` directory for detailed reports
4. Review Playwright documentation
