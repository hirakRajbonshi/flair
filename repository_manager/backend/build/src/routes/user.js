// the user data manager for Flair managing RUD operations
// Debashish Buragohain
import { Router } from 'express';
import { prisma } from '../lib/prisma/index.js';
import { authorizedPk } from '../middleware/auth/authHandler.js';
const userRouter = Router();
userRouter.get('/username/:username', async (req, res) => {
    try {
        const { username } = req.params;
        // include the repositories and commits for the user
        const user = await prisma.user.findUnique({
            where: { username },
            include: {
                repositories: true,
                commits: true,
            },
        });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.status(200).json({ data: user });
    }
    catch (err) {
        console.error(`Error getting profile: ${err}`);
        res.status(500).send({ error: { message: 'Error in getting profile' } });
        return;
    }
});
userRouter.get('/user/:wallet', async (req, res) => {
    try {
        const { wallet } = req.params;
        // include the repositories and commits for the user
        const user = await prisma.user.findUnique({
            where: { wallet },
            include: {
                repositories: true,
                commits: true,
            },
        });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.status(200).json({ data: user });
    }
    catch (err) {
        console.error(`Error getting profile: ${err}`);
        res.status(500).send({ error: { message: 'Could not update profile.' } });
        return;
    }
});
userRouter.get('/profile', async (req, res) => {
    try {
        const wallet = authorizedPk(res);
        // include the repositories and commits for the user
        const user = await prisma.user.findUnique({
            where: { wallet },
            include: {
                repositories: true,
                commits: true,
            },
        });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.status(200).json({ data: user });
    }
    catch (err) {
        console.error(`Error getting profile: ${err}`);
        res.status(500).send({ error: { message: 'Could not update profile.' } });
        return;
    }
});
userRouter.put('/update', async (req, res) => {
    try {
        const wallet = authorizedPk(res);
        const { metadata, username, } = req.body;
        // Fetch existing user
        const existingUser = await prisma.user.findUnique({
            where: { wallet },
            select: { metadata: true, username: true },
        });
        if (!existingUser) {
            res.status(404).send({ error: { message: 'User not found.' } });
            return;
        }
        // Merge old and new metadata
        const mergedMetadata = {
            ...existingUser.metadata,
            ...(metadata || {}),
        };
        // Build the update payload
        const updateData = {
            metadata: { set: mergedMetadata }, // JSON field must use `set`
            updatedAt: new Date(), // use JS Date object
        };
        if (username) {
            updateData.username = username;
        }
        // Perform the update
        const updatedUser = await prisma.user.update({
            where: { wallet },
            data: updateData,
            include: {
                // optionally return related data
                repositories: true,
                commits: true,
            },
        });
        // Send back the updated record
        res.status(200).json({ data: updatedUser });
        return;
    }
    catch (err) {
        console.error(`Error updating user profile:`, err);
        res.status(500).send({ error: { message: 'Could not update profile.' } });
        return;
    }
});
// deleting the user also deletes all his repositories
userRouter.delete('/delete', async (req, res) => {
    try {
        const wallet = authorizedPk(res);
        const deletedUser = await prisma.user.delete({
            where: { wallet },
        });
        if (!deletedUser) {
            res
                .status(404)
                .send({ error: { message: 'User does not exist to delete!' } });
            return;
        }
        // successfully deleted the user here
        res.status(200).json({ data: deletedUser });
    }
    catch (err) {
        console.error(`Error deleting user: ${err}`);
        res.status(500);
    }
});
export { userRouter };
