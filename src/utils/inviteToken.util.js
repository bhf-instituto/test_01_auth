import jwt from 'jsonwebtoken';

export const generateInviteToken = (data) => {
    return jwt.sign(
        {
            type: 'invite',
            ...data
        },
        process.env.JWT_INVITE_SECRET,
         { expiresIn: '24h' }
    )
}