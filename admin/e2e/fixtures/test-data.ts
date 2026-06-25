/**
 * Test data fixtures for E2E tests
 */

export const listingTestData = {
  new: {
    title: 'Modern Apartment in Downtown',
    description: 'Beautiful spacious apartment with great views',
    price: '50000',
    category: 'Apartment',
    city: 'New York',
    bedrooms: '2',
    bathrooms: '1',
    squareFeet: '1200',
    address: '123 Main Street',
    zipCode: '10001',
  },
  updated: {
    title: 'Modern Apartment in Downtown - Updated',
    description: 'Beautiful spacious apartment with great views and renovated kitchen',
    price: '55000',
    bedrooms: '3',
  },
  invalid: {
    title: '', // Empty title
    price: 'invalid-price',
  },
}

export const articleTestData = {
  new: {
    title: 'Understanding E2E Testing',
    excerpt: 'A comprehensive guide to end-to-end testing',
    content: 'E2E testing is crucial for ensuring complete user workflows work as expected...',
    seoTitle: 'E2E Testing Guide',
    seoDescription: 'Learn about end-to-end testing best practices',
    categoryId: '1',
    authorId: '1',
  },
  updated: {
    title: 'Understanding E2E Testing - Updated',
    excerpt: 'A comprehensive guide to end-to-end testing with best practices',
    content: 'E2E testing is crucial for ensuring complete user workflows work as expected. This article covers...',
  },
}

export const mediaTestData = {
  testImage: {
    filename: 'test-image.jpg',
    title: 'Test Image',
    altText: 'A test image for media library',
    caption: 'Test caption',
  },
  updated: {
    title: 'Test Image - Updated',
    altText: 'Updated test image',
    caption: 'Updated caption',
  },
}

export const userTestData = {
  new: {
    name: 'John Developer',
    email: 'john.dev@example.com',
    role: 'staff',
    status: 'active',
  },
  updated: {
    name: 'John Developer Senior',
    role: 'admin',
    status: 'active',
  },
  newWithInvalidEmail: {
    name: 'Invalid User',
    email: 'invalid-email',
    role: 'staff',
  },
}

export const categoryTestData = {
  new: {
    name: 'Real Estate',
    slug: 'real-estate',
    description: 'Real estate listings and properties',
  },
  updated: {
    name: 'Premium Real Estate',
    description: 'Premium real estate listings',
  },
}

/**
 * Generate unique test data to avoid conflicts
 */
export function generateUniqueListing() {
  const timestamp = Date.now()
  return {
    ...listingTestData.new,
    title: `${listingTestData.new.title} - ${timestamp}`,
  }
}

export function generateUniqueArticle() {
  const timestamp = Date.now()
  return {
    ...articleTestData.new,
    title: `${articleTestData.new.title} - ${timestamp}`,
  }
}

export function generateUniqueUser() {
  const timestamp = Date.now()
  return {
    ...userTestData.new,
    email: `test-${timestamp}@example.com`,
  }
}

export function generateUniqueCategory() {
  const timestamp = Date.now()
  return {
    ...categoryTestData.new,
    name: `${categoryTestData.new.name} - ${timestamp}`,
  }
}
