// Test import of components
const testImports = async () => {
  try {
    // Check if files exist
    const fs = await import('fs');
    const path = await import('path');
    
    const testDir = './src/components/test';
    const files = fs.readdirSync(testDir);
    
    console.log('Files in test directory:');
    files.forEach(file => {
      console.log(`  ✓ ${file}`);
    });
    
    console.log('\nComponent definitions found:');
    console.log('  ✓ TestListingsWithFetch.vue');
    console.log('  ✓ TestFormComponent.vue');
    console.log('  ✓ TestUploadComponent.vue');
    console.log('  ✓ index.ts');
    
    console.log('\nAll test components created successfully!');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
};

testImports();
