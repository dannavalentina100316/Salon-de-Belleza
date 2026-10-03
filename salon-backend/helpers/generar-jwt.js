import jwt from 'jsonwebtoken';

export const generarJWT = (uid) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET no configurado');
  }

  return jwt.sign({ uid }, secret, {
    expiresIn: '8h',
  });
};
