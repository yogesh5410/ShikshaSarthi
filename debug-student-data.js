// Quick Debug Script for Browser Console
// Copy and paste this into your browser console to check student data

console.log('=== STUDENT DATA DEBUG ===');

// Check if student data exists
const studentData = localStorage.getItem('student');
console.log('1. Raw localStorage data:', studentData);

if (!studentData) {
  console.error('❌ No student data in localStorage!');
  console.log('Solution: Please log in as a student first.');
} else {
  try {
    // Parse the data
    const parsed = JSON.parse(studentData);
    console.log('2. Parsed data:', parsed);
    
    // Check structure
    if (parsed.student) {
      console.log('3. Student object found:', parsed.student);
      
      // Check for studentId
      if (parsed.student.studentId) {
        console.log('✅ studentId found:', parsed.student.studentId);
        console.log('   Type:', typeof parsed.student.studentId);
        console.log('   Length:', parsed.student.studentId.length);
        console.log('   Value:', `"${parsed.student.studentId}"`);
      } else {
        console.error('❌ studentId NOT found in student object!');
        console.log('   Available fields:', Object.keys(parsed.student));
        
        // Check for alternative ID fields
        if (parsed.student._id) {
          console.log('   Found _id instead:', parsed.student._id);
        }
      }
    } else {
      console.error('❌ No student object in parsed data!');
      console.log('   Data structure:', parsed);
    }
  } catch (e) {
    console.error('❌ Error parsing student data:', e);
    console.log('   Raw data:', studentData);
  }
}

console.log('=========================');

// Provide fix suggestions
console.log('\nSuggested Actions:');
if (!studentData) {
  console.log('1. Go to login page');
  console.log('2. Login as a student');
  console.log('3. Run this script again');
} else {
  const parsed = JSON.parse(studentData);
  if (!parsed.student || !parsed.student.studentId) {
    console.log('1. Clear localStorage: localStorage.clear()');
    console.log('2. Re-login as student');
    console.log('3. Run this script again');
  } else {
    console.log('✅ Everything looks good! Student ID is present.');
  }
}
