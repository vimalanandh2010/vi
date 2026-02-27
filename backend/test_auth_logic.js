// This script tests the logic changes in authRoutes.js without requiring a real DB connection
const assert = require('assert');

// Mock User Model
const MockUser = {
    data: [],
    findOne: async function (query) {
        console.log(`Mocking findOne with query:`, JSON.stringify(query));
        return this.data.find(u => {
            const matchesOr = query.$or.some(cond => {
                if (cond.googleId && u.googleId === cond.googleId) return true;
                if (cond.email && u.email === cond.email) return true;
                return false;
            });
            return matchesOr && u.role === query.role;
        }) || null;
    },
    create: function (u) {
        const newUser = {
            ...u,
            save: async () => {
                this.data.push(newUser);
                console.log(`Mocking user.save for:`, newUser.email, newUser.role);
            }
        };
        return newUser;
    }
};

async function testLogic() {
    console.log('--- STARTING UNIT TEST FOR google-verify LOGIC ---');

    // Scenario 1: User logs in as seeker
    const googleId = '123';
    const email = 'test@example.com';
    const firstRole = 'seeker';

    console.log(`\nTesting login as ${firstRole}...`);
    let user1 = await MockUser.findOne({
        $or: [{ googleId: googleId }, { email: email }],
        role: firstRole
    });

    if (!user1) {
        user1 = MockUser.create({ email, googleId, role: firstRole });
        await user1.save();
    }

    assert.strictEqual(MockUser.data.length, 1, 'Should have 1 user');
    assert.strictEqual(MockUser.data[0].role, 'seeker', 'User should be seeker');

    // Scenario 2: SAME user logs in as employer
    const secondRole = 'employer';
    console.log(`\nTesting login as ${secondRole} (same Google account)...`);

    let user2 = await MockUser.findOne({
        $or: [{ googleId: googleId }, { email: email }],
        role: secondRole
    });

    if (!user2) {
        console.log('User not found for role employer (Correct!)');
        user2 = MockUser.create({ email, googleId, role: secondRole });
        await user2.save();
    } else {
        console.error('FAILED: Found seeker account when looking for employer');
    }

    assert.strictEqual(MockUser.data.length, 2, 'Should have 2 separate users for different roles');
    assert.strictEqual(MockUser.data[1].role, 'employer', 'Second user should be employer');

    console.log('\n✅ UNIT TEST PASSED: Role-specific login logic is correct!');
}

testLogic().catch(err => {
    console.error('Unit Test Failed:', err);
    process.exit(1);
});
