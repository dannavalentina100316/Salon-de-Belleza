import jwt from 'jsonwebtoken';

export const validarJWT = (req, res, next) => {
  const authorization = req.headers.authorization || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : null;

  if (!token) {
    return res.status(401).json({ ok: false, msg: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretKey');
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ ok: false, msg: 'Token inválido o expirado' });
  }
};
