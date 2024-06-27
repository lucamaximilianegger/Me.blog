const cron = require('node-cron');
const User = require('../models/user.model'); // Import the User model

const scheduleAccountDeletion = () => {
    // Schedule a task to run every day at midnight
    cron.schedule('0 0 * * *', async () => {
        console.log('Running account deletion task...');
        const usersToDelete = await User.find({
            deletionRequested: true,
            deletionDate: { $lte: new Date() },
        });

        for (const user of usersToDelete) {
            await User.deleteOne({ _id: user._id });
            console.log(`Deleted user with id ${user._id}`);
        }
    });
};

module.exports = scheduleAccountDeletion;
