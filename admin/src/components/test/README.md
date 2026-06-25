# Test Components for Composables

This directory contains test components that demonstrate and verify the new Vue 3 composables: `useFetch`, `usePaginatedFetch`, and `useForm`.

## Components Overview

### 1. TestListingsWithFetch.vue

**Purpose**: Tests the `usePaginatedFetch` composable for managing paginated data lists.

**Features**:
- Paginated data fetching with mock API
- Loading states and error handling
- Pagination controls (Previous, Next, Go to Page)
- Displays pagination metadata (current page, total items, total pages)
- Graceful error recovery with retry functionality
- Full TypeScript typing

**Usage**:
```vue
<template>
  <TestListingsWithFetch />
</template>

<script setup>
import { TestListingsWithFetch } from '@/components/test'
</script>
```

**Key Composable Methods Tested**:
- `fetchPage(page)` - Fetch a specific page
- `nextPage()` - Navigate to next page
- `previousPage()` - Navigate to previous page
- `goToPage(page)` - Jump to specific page
- State: `items`, `currentPage`, `total`, `lastPage`, `loading`, `error`, `canNextPage`, `canPreviousPage`

---

### 2. TestFormComponent.vue

**Purpose**: Tests the `useForm` composable for form validation, field management, and auto-save functionality.

**Features**:
- Form field management (name, email, phone)
- Real-time field validation with multiple rules
- Field-level error display and validation state
- Form dirty state tracking
- Auto-save functionality with configurable delay
- Submit button loading state
- Form reset functionality
- Mock API form submission with error handling
- Comprehensive form state indicators

**Usage**:
```vue
<template>
  <TestFormComponent />
</template>

<script setup>
import { TestFormComponent } from '@/components/test'
</script>
```

**Key Composable Methods Tested**:
- `setField(field, value)` - Update single field
- `setFields(fields)` - Update multiple fields
- `validateField(field, rules)` - Validate single field
- `validate(rules)` - Validate entire form
- `submit(rules?)` - Submit form with optional validation
- `reset()` - Reset form to initial state
- `hasError(field)` - Check if field has error
- `getFieldError(field)` - Get field error message
- `isTouched(field)` - Check if field was touched
- State: `form`, `errors`, `touched`, `loading`, `isDirty`, `hasChanges`

**Validation Rules Used**:
- `FormValidations.required()` - Required field validation
- `FormValidations.minLength()` - Minimum length validation
- `FormValidations.email()` - Email format validation

---

### 3. TestUploadComponent.vue

**Purpose**: Tests the `useFetch` composable for file upload with progress tracking and error handling.

**Features**:
- Drag-and-drop file upload zone
- File preview for images
- Upload progress bar with percentage display
- File size validation
- File type validation (images only)
- Upload progress tracking
- Mock API upload with progress simulation
- Uploaded file information display
- Error handling for various scenarios
- File size formatting utility

**Usage**:
```vue
<template>
  <TestUploadComponent />
</template>

<script setup>
import { TestUploadComponent } from '@/components/test'
</script>
```

**Key Composable Methods Tested**:
- `execute()` - Trigger the fetch/upload operation
- `reset()` - Reset the fetch state
- State: `loading`, `error`, `data`, `success`, `hasData`, `isError`

**Features Demonstrated**:
- File selection via click or drag-and-drop
- Progress callback during upload
- Error states for invalid files
- Mock success responses with file metadata

---

## Integration Example

Here's how to integrate these test components into your application:

```vue
<template>
  <div class="test-page">
    <TestListingsWithFetch />
    <hr class="my-8" />
    <TestFormComponent />
    <hr class="my-8" />
    <TestUploadComponent />
  </div>
</template>

<script setup lang="ts">
import {
  TestListingsWithFetch,
  TestFormComponent,
  TestUploadComponent,
} from '@/components/test'
</script>
```

## Testing the Composables

### Running the Tests

1. **Start the dev server**:
   ```bash
   npm run dev
   ```

2. **Navigate to the test page** containing these components

3. **Run through each test scenario**:

#### For TestListingsWithFetch:
- Click "Load Listings" button
- Verify pagination controls work
- Test "Previous" and "Next" buttons
- Enter a page number and click "Go"
- Click "Trigger Error" to test error handling
- Click "Retry" to test error recovery

#### For TestFormComponent:
- Fill in the form fields
- Watch validation happen in real-time
- Try submitting with empty fields
- Enable auto-save and modify fields (should auto-save after 3 seconds)
- Click "Validate All" to validate all fields
- Click "Fill Sample Data" to populate test data
- Test the Reset button

#### For TestUploadComponent:
- Select an image file by clicking or drag-and-drop
- Watch the upload progress bar
- Test canceling the upload
- Upload another file to test multiple uploads
- Test the "Trigger Size Error" to test validation
- Test "Trigger API Error" for error handling

## What Gets Tested

### useFetch Composable
✓ Basic data fetching  
✓ Loading state management  
✓ Error handling and toast notifications  
✓ Success state tracking  
✓ Data persistence  
✓ Reset functionality  

### usePaginatedFetch Composable
✓ Paginated data fetching  
✓ Current page tracking  
✓ Total items and pages tracking  
✓ Navigation (next, previous, go to page)  
✓ Navigation boundary checking  
✓ Error handling with retry  
✓ Loading states during pagination  

### useForm Composable
✓ Form field management  
✓ Field value updates  
✓ Real-time validation  
✓ Field error tracking  
✓ Touched state management  
✓ Form dirty state  
✓ Auto-save functionality  
✓ Form submission  
✓ Form reset  
✓ Error display and recovery  
✓ Multiple validation rules per field  

## Mock Data

All test components use mock data to simulate API responses. This allows testing without a backend:

- **TestListingsWithFetch**: Generates 127 mock listings across 13 pages
- **TestFormComponent**: Simulates form submission with 10% error rate
- **TestUploadComponent**: Simulates file upload with progress tracking

## Error Scenarios Tested

Each component includes test actions to trigger various error scenarios:

| Component | Error Scenarios |
|-----------|-----------------|
| TestListingsWithFetch | API fetch failures, pagination errors, no results |
| TestFormComponent | Validation errors, API errors, field-specific errors |
| TestUploadComponent | File size exceeds limit, invalid file type, API errors |

## TypeScript Typing

All test components are fully typed with TypeScript:
- Composable return types are properly inferred
- Form data interfaces are defined
- API response types match actual API contracts
- Event handlers are properly typed

## Debugging

Each component includes a "Debug Info" section at the bottom showing:
- Current state values
- Loading/error states
- Form dirty status
- Field validation status
- Upload progress

This helps verify that the composables are working correctly internally.

## Integration with UI Toast Notifications

All components integrate with the `useUiStore` for toast notifications:
- Success messages (green)
- Error messages (red)
- Warning messages (yellow)
- Info messages (blue)

Toast notifications are automatically shown by the composables when appropriate.

## Performance Considerations

- Mock API calls have simulated network delays (600-2000ms)
- Auto-save has configurable delays (default 3 seconds)
- Upload progress updates at regular intervals
- Large file simulation can be tested

## Extending the Tests

To add more test scenarios:

1. Extend the mock API functions
2. Add new test action buttons
3. Simulate different error conditions
4. Add more validation rules to the form
5. Test with different file types and sizes

## Clean Up After Testing

These components are for development and testing only. To remove:

```bash
rm -rf src/components/test/
```

Or remove individual files:
```bash
rm src/components/test/TestListingsWithFetch.vue
rm src/components/test/TestFormComponent.vue
rm src/components/test/TestUploadComponent.vue
rm src/components/test/index.ts
rm src/components/test/README.md
```

## References

- [useFetch Composable](../../composables/useFetch.ts)
- [useForm Composable](../../composables/useForm.ts)
- [usePaginatedFetch Composable](../../composables/useFetch.ts)
- [UI Store](../../stores/ui.ts)
