// Initialize mock users from localStorage or use default data
const getStoredUsers = () => {
    try {
        const storedUsers = localStorage.getItem('mockUsers');
        if (storedUsers) {
            const parsedUsers = JSON.parse(storedUsers);
            // Ensure the data structure is correct
            if (!parsedUsers.patients) parsedUsers.patients = [];
            if (!parsedUsers.doctors) parsedUsers.doctors = [];
            return parsedUsers;
        }
    } catch (error) {
        console.error('Error parsing stored users:', error);
    }
    
    // Return default data structure
    return {
        patients: [
            { email: 'patient@example.com', password: 'patient123' },
            { email: 'patient2@example.com', password: 'patient456' }
        ],
        doctors: [
            { email: 'doctor@example.com', password: 'doctor123' },
            { email: 'doctor2@example.com', password: 'doctor456' }
        ]
    };
};

let mockUsers = getStoredUsers();

// Save users to localStorage
const saveUsers = () => {
    try {
        localStorage.setItem('mockUsers', JSON.stringify(mockUsers));
    } catch (error) {
        console.error('Error saving users to localStorage:', error);
    }
};

export const addUser = (email, password, userType) => {
    console.log('Adding user:', { email, userType });
    
    // Ensure the userType array exists
    if (!mockUsers[userType]) {
        mockUsers[userType] = [];
    }
    
    // Check if user already exists
    const userExists = mockUsers[userType].some(user => user.email === email);
    if (userExists) {
        console.log('User already exists');
        return {
            success: false,
            message: 'User with this email already exists'
        };
    }

    // Add new user
    mockUsers[userType].push({ email, password });
    // Save to localStorage
    saveUsers();
    console.log('User added successfully. Current users:', mockUsers[userType]);
    return {
        success: true,
        message: 'User registered successfully'
    };
};

export const validateLogin = (email, password, userType) => {
    // Refresh mockUsers from localStorage
    mockUsers = getStoredUsers();
    
    console.log('Validating login for:', { email, userType });
    console.log('Available users:', mockUsers[userType]);
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return {
            isValid: false,
            message: 'Please enter a valid email address'
        };
    }

    // Password validation (minimum 8 characters)
    if (password.length < 8) {
        return {
            isValid: false,
            message: 'Password must be at least 8 characters long'
        };
    }

    // Ensure the userType array exists
    if (!mockUsers[userType]) {
        mockUsers[userType] = [];
        saveUsers();
    }

    // Check user type and credentials
    const users = mockUsers[userType];
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        console.log('No matching user found');
        return {
            isValid: false,
            message: `Invalid credentials for ${userType}`
        };
    }

    return {
        isValid: true,
        message: 'Login successful',
        userType: userType
    };
}; 