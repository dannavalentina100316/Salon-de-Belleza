import jwt from 'jsonwebtoken';

export const generarJWT = (uid) => {
  return jwt.sign({ uid }, process.env.JWT_SECRET || 'secretKey', {
    expiresIn: '8h',
  });
};
