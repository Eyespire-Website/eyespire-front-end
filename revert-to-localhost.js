const fs = require('fs');
const path = require('path');

console.log('🔄 Reverting frontend URLs to localhost for local testing...\n');

const LOCALHOST_BACKEND = 'http://localhost:8080';
const PRODUCTION_BACKEND = 'https://eyespire-back-end.onrender.com';

// Service files to update
const serviceFiles = [
    'src/services/authService.js',
    'src/services/staffService.js',
    'src/services/appointmentService.js',
    'src/services/userService.js',
    'src/services/specialtyService.js',
    'src/services/refundsService.js',
    'src/services/paymentHistoryService.js',
    'src/services/orderService.js',
    'src/services/chatService.js',
    'src/services/dashboardService.js',
    'src/services/appointmentsService.js',
    'src/services/adminService.js',
    'src/services/glassesService.js',
    'src/services/webSocketService.js',
    'src/services/medicalRecordService.js',
    'src/services/serviceFeedbackService.js',
    'src/services/productService.js',
    'src/services/paymentService.js'
];

function updateServiceFile(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            console.log(`⚠️  File not found: ${filePath}`);
            return;
        }

        let content = fs.readFileSync(filePath, 'utf8');
        let updated = false;

        // Replace production backend URL with localhost
        if (content.includes(PRODUCTION_BACKEND)) {
            content = content.replace(new RegExp(PRODUCTION_BACKEND.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), LOCALHOST_BACKEND);
            updated = true;
        }

        // Also handle API_URL definitions
        const productionApiPattern = /const API_URL = ['"`]https:\/\/eyespire-back-end\.onrender\.com[\/api]*['"`]/g;
        if (productionApiPattern.test(content)) {
            content = content.replace(productionApiPattern, `const API_URL = '${LOCALHOST_BACKEND}'`);
            updated = true;
        }

        // Handle API_URL with /api suffix
        const productionApiWithSuffixPattern = /const API_URL = ['"`]https:\/\/eyespire-back-end\.onrender\.com\/api['"`]/g;
        if (productionApiWithSuffixPattern.test(content)) {
            content = content.replace(productionApiWithSuffixPattern, `const API_URL = '${LOCALHOST_BACKEND}/api'`);
            updated = true;
        }

        if (updated) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Reverted: ${filePath}`);
        }
    } catch (error) {
        console.error(`❌ Error updating ${filePath}:`, error.message);
    }
}

// Update all service files
serviceFiles.forEach(updateServiceFile);

console.log('\n✅ Frontend URLs reverted to localhost!');
console.log('\n📝 Local testing URLs:');
console.log(`Frontend: http://localhost:3000`);
console.log(`Backend: ${LOCALHOST_BACKEND}`);
console.log('\n🚀 Now you can test locally before production deployment!');
