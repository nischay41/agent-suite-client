import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility function to combine class names
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Get API base URL with fallback
export function getApiUrl(): string {
  // Use default localhost for development
  return 'http://localhost:8000';
}

// Demo data for showcase
export const SAMPLE_SOPS = [
  {
    id: 1,
    title: 'Customer Service - Refund Process',
    description: 'Handle customer refund requests professionally',
    content: `Customer Service Refund Process SOP

1. INITIAL CUSTOMER CONTACT
   - Greet customer professionally
   - Listen to refund request completely
   - Obtain order number and customer information
   - Verify customer identity

2. REFUND ELIGIBILITY ASSESSMENT
   - Check refund policy guidelines
   - Review order details and purchase date
   - Verify product condition if applicable
   - Document reason for refund request

3. PROCESSING REFUND
   - If eligible: Process refund within 24 hours
   - If not eligible: Explain policy and offer alternatives
   - Send confirmation email to customer
   - Update customer record with refund details

4. FOLLOW-UP
   - Confirm refund completion with customer
   - Document interaction in CRM system
   - Report any recurring issues to management`
  },
  {
    id: 2,
    title: 'IT Helpdesk - Password Reset',
    description: 'Secure password reset procedure for employees',
    content: `IT Helpdesk Password Reset SOP

1. IDENTITY VERIFICATION
   - Verify employee ID and department
   - Confirm personal details (manager name, start date)
   - Check for security flags or account locks
   - Document verification method used

2. PASSWORD RESET PROCESS
   - Access Active Directory management console
   - Navigate to user account
   - Generate temporary password following complexity rules
   - Set 'must change password at next login' flag
   - Test password in test environment

3. SECURE COMMUNICATION
   - Communicate password via secure channel only
   - Use encrypted email or secure messaging
   - Never share password over phone or unsecured channels
   - Confirm receipt with employee

4. DOCUMENTATION & MONITORING
   - Log password reset in IT ticketing system
   - Monitor for successful login within 24 hours
   - Follow up if no login detected
   - Update security incident log if applicable`
  },
  {
    id: 3,
    title: 'Sales - Lead Qualification',
    description: 'Qualify and prioritize sales leads effectively',
    content: `Sales Lead Qualification SOP

1. LEAD INTAKE
   - Receive lead from marketing or referral
   - Verify contact information completeness
   - Assess lead source and quality score
   - Assign to appropriate sales representative

2. INITIAL QUALIFICATION (BANT)
   - Budget: Determine budget range and authority
   - Authority: Identify decision makers
   - Need: Understand business requirements
   - Timeline: Establish purchase timeline

3. LEAD SCORING
   - Score based on company size and industry
   - Evaluate engagement level and interest
   - Consider geographic and market factors
   - Assign priority level (Hot/Warm/Cold)

4. NEXT STEPS
   - Hot leads: Schedule demo within 48 hours
   - Warm leads: Send information and follow up
   - Cold leads: Add to nurture campaign
   - Document all interactions in CRM`
  },
  {
    id: 4,
    title: 'Healthcare - Patient Intake',
    description: 'Comprehensive patient registration and intake process',
    content: `Healthcare Patient Intake SOP

1. PATIENT REGISTRATION
   - Verify patient identity with photo ID
   - Collect insurance cards and verify coverage
   - Update demographic and contact information
   - Obtain emergency contact details

2. MEDICAL HISTORY REVIEW
   - Review current medications and allergies
   - Document chief complaint and symptoms
   - Record vital signs (blood pressure, temperature, weight)
   - Complete medical history questionnaire

3. INSURANCE VERIFICATION
   - Verify insurance eligibility and benefits
   - Determine co-pay and deductible amounts
   - Obtain pre-authorization if required
   - Explain patient financial responsibility

4. DOCUMENTATION
   - Create or update electronic health record
   - Scan insurance cards and ID into system
   - Schedule follow-up appointments if needed
   - Provide patient with visit summary`
  },
  {
    id: 5,
    title: 'Restaurant - Food Safety Protocol',
    description: 'Critical food safety and hygiene procedures',
    content: `Restaurant Food Safety Protocol SOP

1. HAND HYGIENE
   - Wash hands for minimum 20 seconds
   - Use soap and warm water
   - Dry with clean paper towels
   - Sanitize with alcohol-based sanitizer

2. FOOD TEMPERATURE CONTROL
   - Keep cold foods below 41°F (5°C)
   - Keep hot foods above 135°F (57°C)
   - Check temperatures every 2 hours
   - Document temperature logs

3. CROSS-CONTAMINATION PREVENTION
   - Use separate cutting boards for raw and cooked foods
   - Clean and sanitize surfaces between tasks
   - Store raw meats separately from other foods
   - Use color-coded utensils and equipment

4. CLEANING AND SANITIZATION
   - Clean surfaces with detergent first
   - Rinse with clean water
   - Apply sanitizing solution
   - Allow to air dry completely
   - Document cleaning schedules`
  }
];

// Mock API responses for demo mode
export const MOCK_RESULTS = {
  scenarios: [
    {
      objective: "Test standard refund process with valid order",
      profile: "Regular customer with 30-day-old purchase",
      exit_condition: "Refund processed successfully within 24 hours"
    },
    {
      objective: "Handle refund request outside policy window",
      profile: "Customer requesting refund after 60 days",
      exit_condition: "Policy explained and alternative offered"
    },
    {
      objective: "Process refund with missing receipt",
      profile: "Customer without order number or receipt",
      exit_condition: "Alternative verification method used"
    }
  ],
  simulations: [
    {
      objective: "Test standard refund process",
      profile: "Regular customer",
      exit_condition: "Refund processed successfully"
    }
  ],
  audit: {
    total_simulations: 3,
    average_score: 85.5,
    successes: 2,
    failures: 1,
    overall_status: "PASS"
  }
};

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Format duration
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Generate random ID
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

// Delay function for demo purposes
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Validate file type
export function validateFileType(file: File): boolean {
  const allowedTypes = ['text/plain', 'text/markdown', 'application/pdf'];
  return allowedTypes.includes(file.type);
}

// Validate file size (max 10MB)
export function validateFileSize(file: File): boolean {
  const maxSize = 10 * 1024 * 1024; // 10MB
  return file.size <= maxSize;
} 