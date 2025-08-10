import fs from 'fs';
import path from 'path';
import { verifyNoServerEnvInClient } from './validateEnv';

/**
 * Validates that client components are not using server-side environment variable functions
 * This script should be run as part of the build process
 */
export const validateClientImports = (
  baseDir: string = path.resolve(__dirname, '../components')
): void => {
  // Get all component files
  const errors: string[] = [];
  
  const checkDirectory = (dirPath: string) => {
    // Skip non-existent directories
    if (!fs.existsSync(dirPath)) {
      console.warn(`Directory does not exist: ${dirPath}`);
      return;
    }
    
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        // Recursively check subdirectories
        checkDirectory(filePath);
      } else if (
        stats.isFile() && 
        (file.endsWith('.tsx') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.js'))
      ) {
        // Check component files
        const contents = fs.readFileSync(filePath, 'utf8');
        const error = verifyNoServerEnvInClient(filePath, contents);
        if (error) {
          errors.push(error);
        }
      }
    }
  };
  
  // Start the check from the base directory
  checkDirectory(baseDir);
  
  // Report results
  if (errors.length > 0) {
    console.error('Client component validation errors:');
    errors.forEach(error => console.error(error));
    process.exit(1); // Exit with error code
  } else {
    console.log('All client components validated successfully.');
  }
};

// If this script is run directly, execute the validation
if (require.main === module) {
  validateClientImports();
}
